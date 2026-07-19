---
title: Framework-Agnostic Nodes in LangGraph4j — The Adapter Pattern, Explained
header:
  overlay_image: /assets/images/blog_botanical_sky_2047x774.jpg
  overlay_filter: 0.5
  show_overlay_excerpt: false
  teaser: /assets/images/blog_botanical_sky_2047x774.jpg
  caption: "Photo credit: [Unsplash](https://unsplash.com/)"
toc: true
toc_sticky: true
sidebar:
  nav: "langgraph4j-series"
categories:
  - AI
tags:
  - AI
---

[Part one]({% post_url 2026-07-19-State Management %}) built a two-node LangGraph4j graph and used it to explain state,
channels, and checkpoints. [Part two]({% post_url 2026-07-20-Node Hooks in LangGraph4j %}) added cross-cutting tracing
without touching either node. Both posts left one thing untouched on purpose: `IntentClarifierNode` and `ResponderNode`
both `implement NodeAction<SimpleState>` directly, the textbook way to write a LangGraph4j node.

This post asks whether that textbook way is actually the way you want to write it, once the graph is more than a toy.

> For a production-grade app, in one line: the typed domain object (`IntentTranslationState execute(...)`) beats
> `Map<String, Object> apply(...)` — a compiler-checked, serializable contract beats a stringly-typed bag every time,
> regardless of framework.

## The same node, two ways

Here's `ResponderNode` exactly as it appeared in part one:

```java
public class ResponderNode implements NodeAction<SimpleState> {
    @Override
    public Map<String, Object> apply(SimpleState state) {
        String sourceText = state.sourceText();
        String targetLanguage = state.targetLanguage();
        String response = "I could not prepare a response.";

        if ("FRENCH".equals(targetLanguage) && "Hello".equalsIgnoreCase(sourceText)) {
            response = "Bonjour";
        } else if ("ENGLISH".equals(targetLanguage) && "Bonjour".equalsIgnoreCase(sourceText)) {
            response = "Hello";
        } else if (sourceText != null && targetLanguage != null) {
            response = "Translated to " + targetLanguage.toLowerCase() + ": " + sourceText;
        }

        return Map.of(SimpleState.FINAL_RESPONSE, response);
    }
}
```

And here's the same logic, rewritten so the node no longer knows LangGraph4j exists:

```java
public class ResponderNode {

    public IntentTranslationState execute(IntentTranslationState state) {
        String sourceText = state.sourceText();
        String targetLanguage = state.targetLanguage();
        String response = "I could not prepare a response.";

        if ("FRENCH".equals(targetLanguage) && "Hello".equalsIgnoreCase(sourceText)) {
            response = "Bonjour";
        } else if ("ENGLISH".equals(targetLanguage) && "Bonjour".equalsIgnoreCase(sourceText)) {
            response = "Hello";
        } else if (sourceText != null && targetLanguage != null) {
            response = "Translated to " + targetLanguage.toLowerCase() + ": " + sourceText;
        }

        return state.withFinalResponse(response);
    }
}
```

Line by line, almost nothing changed. Same three branches, same conditions, same string concatenation. Two things did
change, and they're the whole point of this post: the class no longer says `implements NodeAction<SimpleState>`, and it
returns a whole `IntentTranslationState` instead of a `Map<String, Object>` fragment.

That looks like a cosmetic swap. It isn't.

## Pitfall vs. gain, at a glance

|                    | `Map<String, Object>` (implements `NodeAction`)                                | `IntentTranslationState` (domain object)                  |
|--------------------|--------------------------------------------------------------------------------|-----------------------------------------------------------|
| Type safety        | None — a typo'd key compiles fine and fails at runtime, inside the merge step. | Full — the compiler enforces every field's name and type. |
| Framework coupling | Baked into the class declaration; the node can't exist without it.             | Zero LangGraph4j imports.                                 |
| Testing            | Build a `SimpleState` map, assert on a returned `Map`.                         | Build the record, call `execute`, assert on the record.   |
| Domain concept     | Implicit — scattered across accessors and string keys.                         | Explicit — one type answers the question.                 |
| Reuse elsewhere    | Tied to this graph's `AgentState`.                                             | Graph-agnostic; reusable as-is.                           |
| Upfront cost       | None — the idiomatic default.                                                  | Two extra files, real duplication for a small graph.      |

The rest of this post is really just unpacking that table.

## What `NodeAction<SimpleState>` actually costs the node

Look at what the first version is coupled to, just from its signature:

- **SimpleState:** a LangGraph4j `AgentState` subclass. To unit test this node, you don't construct a `SimpleState`
  with two fields; you construct one with a `Map<String, Object>` and populate every key the accessor methods expect,
  because that's the only constructor `AgentState` offers.
- **`NodeAction<S>:`** a framework interface. The node's return type isn't "whatever this operation naturally produces,"
  it's "whatever the graph's merge machinery expects to receive."
- **Map<String, Object>:** an untyped bag. The compiler cannot tell you that `SimpleState.FINAL_RESPONSE` expects a
  `String`, or that you forgot to set it. `Map.of(...)` typos are a runtime surprise, not a compile error.

None of that is a knock on LangGraph4j `NodeAction` is doing exactly what it's designed to do: hand the graph a
generic, mergeable delta. But "generic and mergeable" is a graph-execution concern, not a translation concern. The actual
job of `ResponderNode` — deciding what to say back to the user has nothing to do with any of it.

The second version separates those two jobs. `IntentTranslationState` is a plain record with no LangGraph4j import in
sight:

```java
public record IntentTranslationState(
        String userQuery,
        String clarificationAnswer,
        String clarificationPrompt,
        String clarificationStatus,
        String targetLanguage,
        String sourceText,
        String finalResponse
) implements Serializable {

    public IntentTranslationState withFinalResponse(String finalResponse) {
        return new IntentTranslationState(userQuery, clarificationAnswer, clarificationPrompt,
                clarificationStatus, targetLanguage, sourceText, finalResponse);
    }
    // ... one withX() per field the nodes actually need to change
}
```

`ResponderNode.execute(IntentTranslationState): IntentTranslationState` is now a pure function in the ordinary sense: a
typed input, a typed output, no framework in between. Testing it is `responder.execute(new IntentTranslationState(...))`
and an assertion on the result no `Map`, no `AgentState`, no graph.

## Where the coupling actually goes

Deleting a dependency doesn't delete the need for it. Somewhere, `SimpleState`'s seven channel keys still have to become
an `IntentTranslationState`, and the node's answer still has to become a `Map<String, Object>` the graph can merge. That
translation now lives in exactly one place, a small adapter that sits in the graph-building code, not in the node:

```java
final class SimpleStateAdapter {

    static IntentTranslationState toDomain(SimpleState state) {
        return new IntentTranslationState(
                state.userQuery(), state.clarificationAnswer(), state.clarificationPrompt(),
                state.clarificationStatus(), state.targetLanguage(), state.sourceText(), state.finalResponse()
        );
    }

    static Map<String, Object> diff(IntentTranslationState before, IntentTranslationState after) {
        Map<String, Object> updates = new LinkedHashMap<>();
        putIfChanged(updates, SimpleState.FINAL_RESPONSE, before.finalResponse(), after.finalResponse());
        // ... one putIfChanged per field, only emitting what actually changed
        return updates;
    }
}
```

And the graph wiring calls it around the node, instead of the node calling it on itself:

```java
private NodeAction<SimpleState> responderAction() {
    return state -> {
        IntentTranslationState before = SimpleStateAdapter.toDomain(state);
        IntentTranslationState after = responderNode.execute(before);
        return SimpleStateAdapter.diff(before, after);
    };
}
```

`WorkflowGraph` registers `responderAction()` instead of `new ResponderNode()` directly. Everything downstream —
`addNode`, the conditional edges, the checkpoint saver, `NodeTraceHook` from part two — is unchanged, because all of it
already operated on `SimpleState`/`Map<String, Object>`, one level away from the node itself.

This has a name, and it's older than LangGraph: it's an **adapter** in the classic Gang-of-Four sense, playing the role
of what Domain-Driven Design calls an **anti-corruption layer** a seam that keeps an external system's shape from
leaking into your domain logic. Alistair Cockburn's [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
calls the same idea "ports and adapters": keep the core logic *"developed and tested in isolation from its eventual
run-time devices."* Martin Fowler's [Data Mapper](https://martinfowler.com/eaaCatalog/dataMapper.html) is the same
pattern one layer down, applied to persistence instead of a graph engine. None of these were invented for LangGraph4j
they're general answers to a general problem: *the shape your framework wants and the shape your logic wants are
allowed to be different types.*

> **This is a ports-and-adapters mechanism, plainly.** `execute(IntentTranslationState): IntentTranslationState` is the
> **port** the domain defines for itself, with zero opinion about what's on the other side. `SimpleStateAdapter` plus the
> `responderAction()` wiring lambda is the **adapter**, plugging LangGraph4j into that port. The core never imports
> `org.bsc.langgraph4j.*`; only the adapter does. Swap the graph engine, or call `ResponderNode` from a CLI or a test
> with no graph at all, and the core doesn't change — only a new adapter gets written.

### Doesn't this contradict "nodes write deltas" from Part One?

Part One's whole point was that a node should return a *partial update*, not the whole state that's the reason
`IntentClarifierNode`'s error branch could leave `sourceText` untouched without erasing anything. `ResponderNode.execute()`
now returns a full `IntentTranslationState`. That looks like a step backward.

It isn't, because that full object never reaches the graph directly. `SimpleStateAdapter.diff()` compares the before and
after snapshots and emits only the keys that actually changed the same partial-update contract `SimpleState`'s channels
already expect. What changed is the node's *own* contract: full object in, full object out, because that's the shape a
domain operation naturally has. The graph, one layer away, still only ever sees a delta. Partial-update composition isn't
lost — it moved to the boundary, where `diff()` computes it once instead of every node computing it by hand.

## Why this is worth the extra file

Three concrete payoffs, not just architectural taste:

**A typo can't reach production.** `Map.of(SimpleState.FINAL_RESPONSE, response)` compiles even if the key is wrong or
the value is the wrong type — the mismatch surfaces at runtime, inside the graph's merge step, far from the line that
caused it. `state.withFinalResponse(response)` doesn't compile if the method doesn't exist or the type is wrong. The
compiler is the test, and it runs before anyone does.

**The node is trivially testable.** `new IntentTranslationState("translate this to french: Hello", null, null, null,
null, null, null)` and a direct call to `execute(...)` is the entire test — no graph, no map, no framework object to
construct first.

**The domain type can outlive the graph.** `IntentTranslationState implements Serializable` on its own terms. If this
state ever needs to be written somewhere and read back later — a database row, a queue message, a different process
entirely that's a property of the record, not something bolted onto `SimpleState`. That translation is already
written: the same `toDomain`/`diff` pair the graph uses, not new code inside every node.

## The honest tradeoff

This isn't free, and pretending otherwise would undersell the point. For a two-node graph like this one, the adapter and
the domain record are two new files that mirror `SimpleState`'s fields almost exactly real duplication, for a payoff
that a two-node graph barely needs. The textbook version (`implements NodeAction<SimpleState>` directly) is fewer files,
fewer indirections, and completely adequate for a graph this size that never needs to test a node in isolation from the
graph, never persists its state outside LangGraph4j's own checkpointing, and never needs to swap the graph engine.

The calculus changes as the graph grows: more nodes sharing the same state shape, node logic worth unit testing on its
own, or a state object with a life outside the graph, and the one-time cost of the adapter starts paying for itself
across every node that follows, instead of being paid once for a node that didn't need it. Reach for `NodeAction`
directly by default; reach for the adapter seam the moment any of those three things becomes true.

## Why this design earns its keep

**The node's signature tells the truth about its job.** `execute(IntentTranslationState): IntentTranslationState` says
"transforms this domain state" nothing about graphs, channels, or maps. `apply(SimpleState): Map<String, Object>` says
"participates in a LangGraph4j merge step," which is accurate but is a fact about the *graph*, not about translation.

**Coupling to the framework becomes a decision, not a default.** Every node written against `NodeAction` directly pays
the graph's shape whether it needs to or not. Behind an adapter, that cost is opted into exactly where it earns its
keep, and the rest of the domain stays plain Java.

**The graph doesn't care either way.** `NodeTraceHook`, the conditional edges, and the checkpoint saver from the last
two posts all operate on `SimpleState` and `Map<String, Object>` one level away from the node. None of them changed
because `ResponderNode` did.

- Reference code: [Langgraph4jConsol](https://github.com/cmabdullah/Langgraph4jConsol)
- Part one: [State Management in LangGraph4j — Channels, Reducers, and a Human-in-the-Loop Example]({% post_url 2026-07-19-State Management %})
- Part two: [Node Hooks in LangGraph4j — applyBefore, applyWrap, applyAfter Explained]({% post_url 2026-07-20-Node Hooks in LangGraph4j %})
- Further reading: [Hexagonal Architecture — Alistair Cockburn](https://alistair.cockburn.us/hexagonal-architecture/), [Anti-Corruption Layer — Azure Architecture Center](https://learn.microsoft.com/en-us/azure/architecture/patterns/anti-corruption-layer), [Data Mapper — Martin Fowler](https://martinfowler.com/eaaCatalog/dataMapper.html)
