---
title: Node Hooks in LangGraph4j, applyBefore, applyWrap, and applyAfter Explained
header:
  overlay_image: /assets/images/blog_business_workflow_2047x774.jpg
  overlay_filter: 0.5
  show_overlay_excerpt: false
  teaser: /assets/images/blog_business_workflow_2047x774.jpg
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

[Last time]({% post_url 2026-07-19-State Management %}) we built a two-node LangGraph4j graph, a translator that pauses to
ask a clarifying question, and used it to explain the real engine behind every LangGraph4j app: state, channels, and
checkpoints. The nodes themselves, `intentClarifier` and `responder`, stayed deliberately dumb: read some keys, return a
map, done.

This post answers the question that comes right after you've written a couple of nodes: **how do you add logging, timing,
or auditing to every node, without editing every node?** LangGraph4j's answer is `NodeHook`, a small interface with three
callbacks that let you observe or wrap a node call from the outside. We'll build one, `NodeTraceHook`, wire it into the same
translator graph from part one, and go callback by callback through `applyBefore`, `applyWrap`, and `applyAfter`.

## The problem hooks solve

Suppose you want to know, for every node in your graph: when did it start, how long did it take, and did it succeed? The
naive approach is to add that code to `IntentClarifierNode` and `ResponderNode` directly, a timestamp at the top, a
duration calculation at the bottom, a try/catch around the body. That works, but it doesn't scale: every new node needs the
same boilerplate copied in, and the node's actual job (clarify intent, produce a response) gets buried under logging code
that has nothing to do with translation.

`NodeHook` moves that concern out of the node and onto the graph. You write it once, register it on the `StateGraph`, and
it applies to every node `IntentClarifierNode` and `ResponderNode` never know it exists.

## Three callbacks, three moments

`NodeHook` is really three independent, optional interfaces. A single class can implement one, two, or all three:

```java
public interface NodeHook {

    interface BeforeCall<State extends AgentState> {
        CompletableFuture<Map<String, Object>> applyBefore(String nodeId, State state, RunnableConfig config);
    }

    interface AfterCall<State extends AgentState> {
        CompletableFuture<Map<String, Object>> applyAfter(String nodeId, State state, RunnableConfig config, Map<String, Object> lastResult);
    }

    interface WrapCall<State extends AgentState> {
        CompletableFuture<Map<String, Object>> applyWrap(String nodeId, State state, RunnableConfig config, AsyncNodeActionWithConfig<State> action);
    }
}
```

They fire in this order around a single node call:

```
applyBefore  ──▶  applyWrap( … node runs here … )  ──▶  applyAfter  ──▶  merged into state
```

That order matters, and it's the key to understanding what each callback is *for*:

- **`applyBefore`** runs first, before the node has been called at all.
- **`applyWrap`** runs next, and it's the only callback that actually holds the node's `AsyncNodeActionWithConfig` the
  function that calls the node. It decides *if and how* the node runs.
- **`applyAfter`** runs last, once the node (and `applyWrap`) has already produced a successful result.

Whatever any of the three returns is a **partial state update**, exactly like a node's own return value from part one, it
gets merged into the graph's state through the same channels. A hook is not a side-channel; it speaks the same language as
every node.

## `applyBefore`: a checkpoint before the node runs

```java
@Override
public CompletableFuture<Map<String, Object>> applyBefore(
        String nodeName,
        SimpleState state,
        RunnableConfig runnableConfig
) {
    System.out.println("[" + nodeName + "] starting");
    return CompletableFuture.completedFuture(Map.of());
}
```

`applyBefore` receives the state *as it is right before the node sees it* and the `nodeId` about to run. Here we only log a
line, so we return `Map.of()` an empty update, meaning "nothing to add." But that return value isn't decorative: whatever
map you return here is merged into state, through the schema's channels, **before the node executes**. A before-hook could,
for example, stamp a `nodeStartedAt` timestamp into state, and the node itself would see it. `applyBefore` can shape the
input a node receives; it just doesn't have to.

What it cannot do is see the node's output or catch its failure, by the time it runs, the node hasn't been called yet. For
those, you need the next two callbacks.

## `applyWrap`: the only callback that owns the call

```java
@Override
public CompletableFuture<Map<String, Object>> applyWrap(
        String nodeName,
        SimpleState state,
        RunnableConfig runnableConfig,
        AsyncNodeActionWithConfig<SimpleState> nodeAction
) {
    Instant startedAt = Instant.now();

    return nodeAction.apply(state, runnableConfig)
            .thenApply(result -> {
                long durationMs = Duration.between(startedAt, Instant.now()).toMillis();
                System.out.println("[" + nodeName + "] completed in " + durationMs + " ms");

                // Merge the node's own result with our trace entry so the graph
                // sees them as one state update for this step.
                Map<String, Object> updates = new LinkedHashMap<>(result);
                updates.put(SimpleState.NODE_TRACE, Map.of(
                        "nodeName", nodeName,
                        "durationMs", durationMs
                ));
                return updates;
            })
            .whenComplete((ignored, throwable) -> {
                if (throwable != null) {
                    System.out.println("[" + nodeName + "] failed: " + throwable);
                }
            });
}
```

`applyBefore` and `applyAfter` receive *information about* the call. `applyWrap` receives the call itself, as a
`nodeAction` you have to invoke yourself. Nothing runs the actual node `IntentClarifierNode.apply()` or
`ResponderNode.apply()` until this method calls `nodeAction.apply(state, runnableConfig)`. That single fact is what makes
`applyWrap` different from the other two, and it buys you two things they can't do:

**Timing that includes the real work.** `startedAt` is captured immediately before `nodeAction.apply(...)`, and the
duration is computed in `.thenApply(...)`, right after the returned `CompletableFuture` completes. That interval is the
node's actual execution time not an approximation stitched together from a separate before-hook and after-hook.

**Visibility into failure.** `.whenComplete(...)` runs whether the future completes normally *or* exceptionally. If the
node throws, `throwable` is non-null and we log it. This is the one place in the hook lifecycle that can observe a failing
node at all: `applyAfter` only receives a `lastResult` on success, because a thrown exception never reaches it.

If you skip `applyWrap` entirely, the node still runs normally — `nodeAction.apply(...)` is exactly what LangGraph4j would
have called anyway. Implementing `WrapCall` means you're choosing to stand between the graph and the node, not that the
node needs you to.

Notice what the `.thenApply` block actually returns: not the node's raw `result`, but a **copy of it** (`new
LinkedHashMap<>(result)`) with one extra key added — `SimpleState.NODE_TRACE`. This is the same "return a partial update"
contract every node already follows. The hook is, from the channel's point of view, indistinguishable from the node itself.

## `applyAfter`: the last word on a successful result

```java
@Override
public CompletableFuture<Map<String, Object>> applyAfter(
        String nodeName,
        SimpleState state,
        RunnableConfig runnableConfig,
        Map<String, Object> result
) {
    System.out.println("[" + nodeName + "] produced keys=" + result.keySet());
    return CompletableFuture.completedFuture(result);
}
```

By the time `applyAfter` runs, the node has already succeeded `applyWrap` (if present) has already run and possibly
transformed the result. The `result` parameter here is whatever `applyWrap` returned, which for us already includes
`NODE_TRACE`. `applyAfter` gets a chance to inspect or further transform that map before it's merged into state; we just
log the key names and pass it through unchanged.

Because `applyAfter` only fires on success, it's the right place for concerns that *require* a result to exist recording
metrics per outcome, redacting a field before it's persisted, appending an audit entry that should only happen when the
node actually produced something. It is the wrong place for anything that needs to run even when the node fails; that's
`applyWrap`'s job.

## Wiring the hook into the graph

Registration happens once, on the `StateGraph`, and covers every node — no changes inside `IntentClarifierNode` or
`ResponderNode`:

```java
public StateGraph<SimpleState> build() throws GraphStateException {
    NodeTraceHook nodeTraceHook = new NodeTraceHook();

    return new StateGraph<>(SimpleState.SCHEMA, SimpleState::new)
            .addBeforeCallNodeHook(nodeTraceHook)
            .addAfterCallNodeHook(nodeTraceHook)
            .addWrapCallNodeHook(nodeTraceHook)
            .addNode("intentClarifier", node_async(new IntentClarifierNode()))
            .addNode("responder", node_async(new ResponderNode()))
            .addEdge(START, "intentClarifier")
            .addConditionalEdges("intentClarifier",
                    edge_async(state -> "RESOLVED".equals(state.clarificationStatus()) ? "responder" : END),
                    Map.of("responder", "responder", END, END))
            .addEdge("responder", END);
}
```

One instance, three registrations `NodeTraceHook` implements all three interfaces, so the same object is passed to
`addBeforeCallNodeHook`, `addAfterCallNodeHook`, and `addWrapCallNodeHook`. Each `add...NodeHook` overload also has a
`(String nodeId, ...)` variant, so a hook can be scoped to a single node instead of the whole graph — useful once you have
more than one hook and don't want all of them running everywhere.

## Closing the loop with a channel

A hook that only prints to `System.out` is a logger. To make its findings part of the graph's actual state inspectable,
checkpointed, testable it has to write through a channel, exactly as described in part one. That's what
`SimpleState.NODE_TRACE` is for:

```java
entry(NODE_TRACE, Channels.appender(ArrayList::new))
```

`Channels.appender` accumulates rather than replaces: every node's `applyWrap` call adds one entry, and none of them
overwrite each other. This is the same reducer concept from part one, applied to hook output instead of node output proof
that hooks aren't a separate system bolted onto state management, they're another producer feeding the same mechanism.

`SimpleGraphApp` reads that accumulated list once the conversation ends:

```java
private static void printNodeTrace(SimpleState state) {
    System.out.println("--- node trace ---");
    for (Map<String, Object> visit : state.nodeTrace()) {
        System.out.println(visit.get("nodeName") + " -> " + visit.get("durationMs") + " ms");
    }
}
```

## Watching it run

Feeding the ambiguous request from part one, `translate this: Hello`, followed by the clarifying answer `french`, produces
this console output:

```
Enter request: translate this: Hello
[intentClarifier] starting
[intentClarifier] completed in 0 ms
[intentClarifier] produced keys=[clarificationPrompt, sourceText, clarificationStatus, nodeTrace]
Which language do you want: english or french?
french
[intentClarifier] starting
[intentClarifier] completed in 0 ms
[intentClarifier] produced keys=[targetLanguage, sourceText, clarificationStatus, nodeTrace]
[responder] starting
[responder] completed in 0 ms
[responder] produced keys=[finalResponse, nodeTrace]
Bonjour
--- node trace ---
intentClarifier -> 0 ms
responder -> 0 ms
```

Read it against the two-invocation trace from part one and every line has an explanation: `intentClarifier` runs twice
because the graph is re-invoked after the human answers, and each of those two runs prints its own `starting` /
`completed` / `produced keys` triplet — `applyBefore`, then `applyWrap`, then `applyAfter`. The `nodeTrace` key shows up in
`produced keys` for every node, because `applyWrap` adds it to every result on the way out. And the final `--- node trace
---` block is nothing but `SimpleState.NODE_TRACE`, accumulated by the appender channel across both graph invocations and
both nodes, then printed once the conversation is over.

## Why this design earns its keep

The same four properties that made channel-based state worth using in part one show up again here, from a different angle:

**One cross-cutting concern, one place to change it.** Add timing to every future node in this graph by writing zero new
lines inside those nodes — the hook already covers them.

**Nodes stay pure and untouched.** `IntentClarifierNode` and `ResponderNode` are identical to part one, byte for byte. A
hook is opt-in instrumentation, not a change to the contract nodes have to satisfy.

**Hooks speak the same language as nodes.** Every callback returns a partial state update merged through the schema's
channels — the same rule from part one, applied to code that isn't a node at all.

**The three callbacks map cleanly to three real needs.** Want to touch state before a node runs `applyBefore`. Want to
measure or react to failure — `applyWrap`, the only one holding the actual call. Want to act only after a result exists
`applyAfter`. You don't need all three for every hook; `NodeTraceHook` uses all three here mainly to show the difference
side by side.

Swap `System.out.println` for a real logger, or `NODE_TRACE` for a metrics call, and nothing about this pattern changes
which is the point: in LangGraph4j, cross-cutting concerns are just another producer of state updates, using the exact
mechanism the graph already runs on.

- Reference code: [Langgraph4jConsol](https://github.com/cmabdullah/Langgraph4jConsol)
- Part one: [State Management in LangGraph4j — Channels, Reducers, and a Human-in-the-Loop Example]({% post_url 2026-07-19-State Management %})
- Production reference: [`OTELWrapCallTraceHook.java`](https://github.com/langgraph4j/langgraph4j/blob/main/langgraph4j-opentelemetry/src/main/java/org/bsc/langgraph4j/otel/OTELWrapCallTraceHook.java) — langgraph4j's own `WrapCall` hook, using OpenTelemetry spans instead of `println`
