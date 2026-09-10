---
title: "Framework-Agnostic Nodes in LangGraph4j: The Adapter Pattern, Explained"
header:
  overlay_image: /assets/images/unsplash-gallery-image-4.jpg
  overlay_filter: 0.5
  show_overlay_excerpt: false
  teaser: /assets/images/unsplash-gallery-image-4.jpg
  caption: "Photo credit: [Unsplash](https://unsplash.com/)"
toc: true
toc_sticky: true
sidebar:
  nav: "langgraph4j-series"
categories:
  - AI
  - Java
tags:
  - LangGraph4j
---

[Part one]({% post_url 2026-07-19-State Management %}) built a two-node LangGraph4j graph and used it to explain state,
channels, and checkpoints. [Part two]({% post_url 2026-07-20-Node Hooks in LangGraph4j %}) added cross-cutting tracing
without touching either node. Both posts left one thing untouched on purpose: `IntentClarifierNode` and `ResponderNode`
both `implement NodeAction<SimpleState>` directly, the textbook way to write a LangGraph4j node.

This post asks when that textbook way is the right choice, and when a different seam is worth the extra files.

> **Verdict up front:** use `NodeAction` directly by default. Add a domain object and an adapter the moment any of these are true you need to unit-test nodes in isolation, persist state to a database, or protect node logic from framework churn.

---

## The Two Approaches

### Approach A Direct NodeAction (standard)

The node owns the framework interface. It takes the graph state, computes a result, and returns a map delta:

```java
public class ResponderNode implements NodeAction<SimpleState> {
    @Override
    public Map<String, Object> apply(SimpleState state) {
        String response = translate(state.sourceText(), state.targetLanguage());
        return Map.of(SimpleState.FINAL_RESPONSE, response);
    }
}
```

Wired into the graph with no intermediary:

```java
graph.addNode("responder", new ResponderNode());
```

### Approach B (Domain Object + Adapter)

The node knows nothing about the graph. It takes and returns a plain typed record:

```java
public class ResponderNode {
    public IntentTranslationState execute(IntentTranslationState state) {
        String response = translate(state.sourceText(), state.targetLanguage());
        return state.withFinalResponse(response);
    }
}
```

A thin adapter in the graph-wiring code bridges the two worlds:

```java
private NodeAction<SimpleState> responderAction() {
    return state -> {
        IntentTranslationState before = SimpleStateAdapter.toDomain(state);
        IntentTranslationState after  = responderNode.execute(before);
        return SimpleStateAdapter.diff(before, after);
    };
}

graph.addNode("responder", responderAction());
```

---

## Side-by-Side

|                    | Approach A (Direct NodeAction)            | Approach B (Domain + Adapter)           |
|--------------------|-------------------------------------------|-----------------------------------------|
| Type safety        | typo'd key compiles, fails at runtime     | compiler enforces every field and type  |
| Framework coupling | node imports `org.bsc.langgraph4j`        | zero langgraph4j imports in nodes       |
| Unit testing       | must construct `AgentState` map wrapper   | `execute(record)`, no framework object |
| Boilerplate        | none, idiomatic, fewer files              | adapter + domain record files           |
| Ecosystem fit      | matches all official langgraph4j examples | custom pattern, not conventional        |

---

## The Domain Type

`IntentTranslationState` is a plain Java record, no LangGraph4j import, no `AgentState` ancestry:

```java
public record IntentTranslationState(
        String userQuery,
        String clarificationAnswer,
        String targetLanguage,
        String sourceText,
        String finalResponse
) implements Serializable {

    public IntentTranslationState withFinalResponse(String value) {
        return new IntentTranslationState(
                userQuery, clarificationAnswer, targetLanguage, sourceText, value);
    }
    // one withX() per field nodes need to change
}
```

`execute(IntentTranslationState): IntentTranslationState` is now a pure function typed input, typed output, no graph in between. 
Testing it is `responder.execute(new IntentTranslationState(...))` and an assertion on the result; no `AgentState`, no map, no graph.

---

## Where the Coupling Goes

Removing a dependency doesn't remove the need for it, it moves it. `SimpleStateAdapter` is that one place:

```java
final class SimpleStateAdapter {

    static IntentTranslationState toDomain(SimpleState state) {
        return new IntentTranslationState(
                state.userQuery(), state.clarificationAnswer(),
                state.targetLanguage(), state.sourceText(), state.finalResponse());
    }

    static Map<String, Object> diff(IntentTranslationState before, IntentTranslationState after) {
        Map<String, Object> delta = new LinkedHashMap<>();
        putIfChanged(delta, SimpleState.FINAL_RESPONSE, before.finalResponse(), after.finalResponse());
        // one putIfChanged per field — only emits keys that actually changed
        return delta;
    }
}
```

The graph wiring, conditional edges, `NodeTraceHook` from Part Two, and the checkpoint saver are all unchanged they already 
operated on `SimpleState` and `Map<String, Object>` one level away from the node. This is the **Anti-Corruption Layer** pattern 
from Domain-Driven Design and **Ports and Adapters** from Hexagonal Architecture: `execute(IntentTranslationState): IntentTranslationState` 
is the port the domain defines for itself; `SimpleStateAdapter` plus the wiring lambda is the adapter that plugs LangGraph4j into it. 
Swap the graph engine, and the core never changes.

---

## Doesn't This Break Part One's "Nodes Return Deltas" Rule?

Part One showed that a node should return a *partial update* so untouched fields aren't erased. `ResponderNode.execute()` 
now returns a full `IntentTranslationState`. That looks like a regression.

It isn't because that full object never reaches the graph directly. `SimpleStateAdapter.diff()` compares before and after 
snapshots and emits only the keys that changed. The partial-update contract is intact; it moved from inside each node to the adapter boundary, 
where `diff()` computes it once.

---

## When Approach A Is Right

Use `implements NodeAction` directly when:

- **The graph is stateless:** no HITL pause-and-resume, no DB serialization, no checkpoints you manage yourself.
- **State is message-centric:** a conversation history list fits naturally into `MessagesState<T>`; a separate domain record adds nothing.
- **The graph is small and stable:** two to four nodes, unlikely to grow; testing nodes through the graph is acceptable.
- **Ecosystem alignment matters:** working alongside teams using langgraph4j conventions, or following the official examples closely.

Every official langgraph4j project, [`AgentExecutor`](https://github.com/langgraph4j/langgraph4j/blob/main/langchain4j/langchain4j-agent/src/main/java/org/bsc/langgraph4j/agentexecutor/AgentExecutor.java), [`CallModel`](https://github.com/langgraph4j/langgraph4j/blob/main/langchain4j/langchain4j-agent/src/main/java/org/bsc/langgraph4j/agentexecutor/CallModel.java), [`langgraph4j-deepagents`](https://github.com/langgraph4j/langgraph4j-deepagents/blob/main/src/main/java/org/bsc/langgraph4j/deepagents/GraphBuilder.java)
falls into this category. None of them persist state outside LangGraph4j's own checkpointing or need isolated node-level tests.

---

## When Approach B Is Right

Reach for the adapter seam when **any one** of these is true:

- **HITL or cross-request persistence** you serialize and restore state across separate HTTP requests. A `Serializable` record 
  with named fields is safe to version and migrate; a raw `Map<String, Object>` is not.
- **Per-request infrastructure that can't live in the map** event emitters, streaming channels, coroutine jobs. These belong in a 
  per-request runtime object; nodes take them as parameters rather than reading them from graph state.
- **Node-level unit tests** `node.execute(state)` is one line. `node.apply(new AgentState(Map.of(...)))` plus unwrapping 
  the returned map is framework noise that multiplies across every test file.
- **Package layering** if your `node/` package must not import from your `graph/` package (domain must not depend on wiring), 
  `NodeAction<YourGraphState>` creates a cycle; the adapter removes it.

---

## The Honest Tradeoff

For a two-node graph, `IntentTranslationState` and `SimpleStateAdapter` are two files that duplicate `SimpleState`'s fields 
for a payoff the graph barely needs yet. The textbook approach is fewer files, zero indirection, and completely adequate when none of the Approach B triggers apply.

The one-time cost of the adapter pays for itself once the graph grows: more nodes sharing the same state shape, logic worth testing in isolation, 
or a state object that lives outside the graph. The decision rule is simple: **default to Approach A, switch to Approach B the moment any trigger fires.**

---

- Reference code: [Langgraph4jConsol](https://github.com/cmabdullah/Langgraph4jConsol)
- Part one: [State Management in LangGraph4j]({% post_url 2026-07-19-State Management %})
- Part two: [Node Hooks in LangGraph4j]({% post_url 2026-07-20-Node Hooks in LangGraph4j %})
- [Hexagonal Architecture, Alistair Cockburn](https://alistair.cockburn.us/hexagonal-architecture/)
- [Anti-Corruption Layer, Azure Architecture Center](https://learn.microsoft.com/en-us/azure/architecture/patterns/anti-corruption-layer)
- [Data Mapper, Martin Fowler](https://martinfowler.com/eaaCatalog/dataMapper.html)
