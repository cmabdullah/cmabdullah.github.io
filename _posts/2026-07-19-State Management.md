---
title: State Management in LangGraph4j Channels Reducers and a Human in the Loop Example
header:
  overlay_image: /assets/images/blog_writing_creative_2047x774.jpg
  overlay_filter: 0.6
  show_overlay_excerpt: false
  teaser: /assets/images/blog_writing_creative_2047x774.jpg
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

If you've built anything with LangGraph4j beyond a hello-world chain, you've hit the real question behind every graph:  
**how does data move between nodes?** The answer isn't method parameters or return values wired node-to-node. It's a single 
shared state object that every node reads from and writes to, and a small piece of machinery called a *channel* that decides how those writes merge.

This post walks through state management in LangGraph4j using a deliberately small example: a console app that translates text,   
and **asks the user a follow-up question when the request is ambiguous**. There are no LLM calls, the nodes are plain deterministic Java,  
so nothing distracts from the state mechanics. By the end, the same mechanics that power the toy example will explain   
how production graphs pause for human input, survive process restarts, and resume mid-conversation.

## The example: a translator that asks back

The app accepts requests like:

```  
translate this to french: Hello  
```  

But if the user types `translate this: Hello` no target language, the graph doesn't guess and it doesn't fail. It stops,   
asks *"Which language do you want: english or french?"*, and resumes once the user answers. That pause-and-resume is entirely a state management story.

The graph has just two nodes:

```  
START ──▶ intentClarifier ──▶ (RESOLVED?) ──▶ responder ──▶ END  
                                   │  
                                   └── (needs input / error) ──▶ END  
```  

- **`intentClarifierNode`** parses the request and decides: is this resolvable, does it need clarification, or is it malformed?
- **`responderNode`** produces the translation.

Everything they share travels through the state.

## Defining state: keys and channels

In LangGraph4j, state is a `Map<String, Object>` wrapped in an `AgentState` subclass.   
You declare which keys exist and, crucially *how each key merges updates* via a schema of channels:

```java  
public class SimpleState extends AgentState {  
  
    public static final String USER_QUERY = "userQuery";  
    public static final String CLARIFICATION_ANSWER = "clarificationAnswer";  
    public static final String CLARIFICATION_PROMPT = "clarificationPrompt";  
    public static final String CLARIFICATION_STATUS = "clarificationStatus";  
    public static final String TARGET_LANGUAGE = "targetLanguage";  
    public static final String SOURCE_TEXT = "sourceText";  
    public static final String FINAL_RESPONSE = "finalResponse";  
  
    public static final Map<String, Channel<?>> SCHEMA = Map.ofEntries(  
            entry(USER_QUERY, Channels.base((current, update) -> update)),  
            entry(CLARIFICATION_ANSWER, Channels.base((current, update) -> update)),  
            entry(CLARIFICATION_PROMPT, Channels.base((current, update) -> update)),  
            entry(CLARIFICATION_STATUS, Channels.base((current, update) -> update)),  
            entry(TARGET_LANGUAGE, Channels.base((current, update) -> update)),  
            entry(SOURCE_TEXT, Channels.base((current, update) -> update)),  
            entry(FINAL_RESPONSE, Channels.base((current, update) -> update))  
    );  
  
    public SimpleState(Map<String, Object> initData) {  
        super(initData);  
    }  
  
    public String clarificationStatus() {  
        return this.<String>value(CLARIFICATION_STATUS).orElse(null);  
    }  
  
    // ... one accessor per key, all following the same pattern  
}  
```  

Two things deserve attention here.

### What a channel actually is

A channel is a **reducer**: a function `(currentValue, update) -> newValue` that runs every time a node writes to that key.   
The channel, not the node owns the merge policy.

`Channels.base((current, update) -> update)` is the simplest possible reducer: *last write wins*. The new value replaces the old one.
That's the right policy for scalar facts like `targetLanguage` or `finalResponse`, and it's also LangGraph4j's default behavior for keys that aren't in the schema at all.   
So why declare them? Because the schema is documentation you can execute: it's the one place a reader (or a teammate)   
can see every key your graph uses and exactly how each one behaves.

The reducer becomes genuinely interesting when replacement is the *wrong* policy. Suppose you wanted an audit trail of every node that ran:

```java  
entry("nodeTrace", Channels.appender(ArrayList::new))  
```  

`Channels.appender` accumulates instead of replacing: each write is appended to a list, and the factory (`ArrayList::new`)   
can write to an appender channel without clobbering each other, because the merge policy is "add", not "replace". This is 
exactly how message histories work in chat-style LangGraph4j agents: every node appends its message; nobody overwrites the conversation.

That's the core insight of channel-based state: **concurrent or sequential writes to the same key are safe because the merge is defined once, declaratively, per key** not scattered as defensive logic across every node.

### One key per piece of information

You might expect the schema to also have a boolean like `awaitingHumanInput`. It doesn't need one: `clarificationStatus` already tells
you whether the graph is waiting, the status is `"NEEDS_CLARIFICATION"` exactly then, so the app just checks the status directly.

Storing the answer again as a boolean would put the same information in two places. Sooner or later a node updates the status and
forgets the boolean, the two keys disagree, and that broken state gets saved to the checkpoint. Keep each piece of information in
exactly one key, and this bug cannot happen.

Give a value its own key only when no other key can tell you its value.

## Nodes write deltas, not the whole state

Here's the part of LangGraph4j's design that surprises newcomers: a node never returns "the new state." It returns a **partial update**  
a map containing only the keys it wants to change. The framework runs each entry through its channel and merges the result into the current state.

The clarifier node shows the pattern with its three outcomes:

```java  
public class IntentClarifierNode implements NodeAction<SimpleState> {  
  
    @Override  
    public Map<String, Object> apply(SimpleState state) {  
        String query = state.userQuery() == null ? "" : state.userQuery().trim();  
        String clarificationAnswer = state.clarificationAnswer() == null  
                ? "" : state.clarificationAnswer().trim().toLowerCase();  
        String lowerQuery = query.toLowerCase();  
        int separatorIndex = query.indexOf(':');  
        String sourceText = separatorIndex >= 0 && separatorIndex < query.length() - 1  
                ? query.substring(separatorIndex + 1).trim() : "";  
  
        if (!lowerQuery.startsWith("translate this") || sourceText.isBlank()) {  
            return Map.of(  
                    SimpleState.CLARIFICATION_STATUS, "ERROR",  
                    SimpleState.FINAL_RESPONSE,  
                    "Supported format: translate this to english|french: <text>"  
            );  
        }  
  
        String language = null;  
        if (lowerQuery.contains("to french") || clarificationAnswer.contains("french")) {  
            language = "FRENCH";  
        } else if (lowerQuery.contains("to english") || clarificationAnswer.contains("english")) {  
            language = "ENGLISH";  
        }  
  
        if (language == null) {  
            return Map.of(  
                    SimpleState.SOURCE_TEXT, sourceText,  
                    SimpleState.CLARIFICATION_STATUS, "NEEDS_CLARIFICATION",  
                    SimpleState.CLARIFICATION_PROMPT,  
                    "Which language do you want: english or french?"  
            );  
        }  
  
        return Map.of(  
                SimpleState.SOURCE_TEXT, sourceText,  
                SimpleState.TARGET_LANGUAGE, language,  
                SimpleState.CLARIFICATION_STATUS, "RESOLVED"  
        );  
    }  
}  
```  

Each branch writes only what it learned. The error branch doesn't touch `sourceText`. The needs-clarification branch doesn't invent a `targetLanguage`.   
Whatever the node doesn't mention is left exactly as the channels last merged it.

The responder is even smaller, it reads two keys and writes one:

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

Note what's *not* here: the responder takes no constructor arguments from the clarifier, holds no reference to it, and doesn't know it exists.   
**State is the entire contract between nodes.** That's what makes graph nodes independently testable, construct a `SimpleState` from a plain map,   
call `apply`, assert on the returned delta, and independently replaceable. Swapping this rule-based responder for an LLM-backed one changes zero lines outside the node.

## Routing is just reading state

Edges make decisions the same way nodes do, by reading state:

```java  
public StateGraph<SimpleState> build() throws GraphStateException {  
    return new StateGraph<>(SimpleState.SCHEMA, SimpleState::new)  
            .addNode("intentClarifier", node_async(new IntentClarifierNode()))  
            .addNode("responder", node_async(new ResponderNode()))  
            .addEdge(START, "intentClarifier")  
            .addConditionalEdges("intentClarifier",  
                    edge_async(state ->  
                            "RESOLVED".equals(state.clarificationStatus()) ? "responder" : END),  
                    Map.of("responder", "responder", END, END))  
            .addEdge("responder", END);  
}  
```  

The clarifier doesn't call the responder or tell the framework where to go next, it records a *fact* (`clarificationStatus`),   
and the edge turns that fact into a route. Node logic and control flow stay decoupled: you can rewire the graph without touching the nodes,   
and you can read the graph's entire topology in one method.

## Checkpointing: state that outlives the process

So far the state lives in memory for the duration of one `invoke()`. The clarification loop needs more than that:   
when the graph stops to ask its question, the answer arrives in a *separate* invocation. Something has to remember `sourceText` and `clarificationStatus` in between.

That something is a **checkpoint saver**. After every node executes, the merged state is persisted, keyed by a *thread id*.   
This example uses the Postgres saver, so checkpoints survive not just between invocations but across JVM restarts:

```java  
public CompiledGraph<SimpleState> compile() throws GraphStateException {  
    return build().compile(CompileConfig.builder()  
            .checkpointSaver(checkpointSaver())  
            .build());  
}  
  
private PostgresSaver checkpointSaver() {  
    try {  
        return PostgresSaver.builder()  
                .host("localhost")  
                .port(5432)  
                .database("photon_ai")  
                .user("photon")  
                .password("photon")  
                .stateSerializer(new ObjectStreamStateSerializer<>(SimpleState::new))  
                .createTables(true)  
                .dropTablesFirst(false)  
                .build();  
    } catch (SQLException e) {  
        throw new RuntimeException(e);  
    }  
}  
```  

The `stateSerializer` tells the saver how to round-trip your state class; `ObjectStreamStateSerializer` uses standard Java serialization,   
which is fine when your state holds strings and simple values like this one. The thread id is supplied per run through `RunnableConfig`:

```java  
public SimpleState run(String threadId, Map<String, Object> input) {  
    RunnableConfig runnableConfig = RunnableConfig.builder()  
            .threadId(threadId)  
            .build();  
    try {  
        return graph.invoke(input, runnableConfig).orElseThrow();  
    } catch (Exception ex) {  
        throw new IllegalStateException(  
                "Graph execution failed for threadId=%s".formatted(threadId), ex);  
    }  
}  
```  

One thread id = one conversation's worth of state. Different users, different threads, zero shared mutable anything.

## The human-in-the-loop pattern, end to end

Now the payoff. Here's the console loop:

```java  
var threadId = UUID.randomUUID().toString();  
Map<String, Object> input = Map.of(SimpleState.USER_QUERY, originalQuery);  
  
while (true) {  
    SimpleState state = runner.run(threadId, input);  
    if ("NEEDS_CLARIFICATION".equals(state.clarificationStatus())) {  
        System.out.println(state.clarificationPrompt());  
        String answer = scanner.nextLine();  
        input = Map.of(  
                SimpleState.USER_QUERY, originalQuery,  
                SimpleState.CLARIFICATION_ANSWER, answer  
        );  
        continue;  
    }  
    System.out.println(state.finalResponse());  
    break;  
}  
```  

Trace `translate this: Hello` through the machinery:

1. **First invocation.** The clarifier finds no target language. It writes `sourceText = "Hello"`, `clarificationStatus = "NEEDS_CLARIFICATION"`,   
   and the prompt. The conditional edge sees the status isn't `RESOLVED` and routes to `END`. Before returning, the checkpointer persists this state under the thread id.
2. **The app asks the human.** The loop sees the `NEEDS_CLARIFICATION` status, so the console prints the question and blocks on `scanner.nextLine()`.   
   The graph isn't running; its state is sitting in Postgres.
3. **Second invocation, same thread id.** The input map carries `clarificationAnswer = "french"`. The checkpointer loads the saved state,   
   and the channels merge the new input into it: `clarificationAnswer` is set, and `sourceText` untouched by this input *survives from the first run*.   
   The clarifier runs again, finds "french" in the answer, and resolves. The edge routes to the responder, which prints **Bonjour**.

The state carried the conversation across two separate graph executions. Because the checkpoint lives in Postgres,   
this works even if the process had died between step 1 and step 3 restart the app, reuse the thread id, and the graph picks up where it left off.

One honest caveat: this is the **run-to-END-and-re-invoke** pattern, where the application loop owns the pause.
LangGraph4j also has a native interrupt mechanism (`interruptBefore` / `interruptAfter` in the compile config)
that suspends the graph *mid-flight* at a named node. Both are legitimate; the re-invoke pattern shown here is simpler to
reason about and demonstrates the state machinery more transparently, which is why this post uses it. Reach for native interrupts
when you need to pause at an arbitrary node without modeling the pause as a graph outcome.

## Why this design earns its keep

Stepping back, channel-based state buys you four things:

**One merge policy per key, defined once.** Nodes never think about "what if someone already wrote this?" the reducer answers 
that question declaratively. Last-write-wins for facts, append for logs and message histories, or any custom `(current, update) -> merged` function you need.

**Nodes stay pure and testable.** A node is a function from state to a delta map. No hidden wiring between nodes, no shared 
mutable objects, you can unit test the clarifier's three branches with three plain maps.

**Partial updates compose.** Because nodes write only what they learned, adding a node to a graph can't accidentally erase 
state it doesn't know about. The error branch not touching `sourceText` isn't discipline; it's the natural shape of the API.

**Persistence and resumption come for free.** Since all inter-node communication flows through one serializable map, checkpointing 
that map after each node gives you durable, resumable, per-thread conversations the foundation of human-in-the-loop without any node knowing checkpoints exist.

The whole example is around 250 lines of Java, most of it shown above. Swap the rule-based nodes for LLM calls and the state 
machinery doesn't change — which is rather the point: in LangGraph4j, state management isn't the plumbing around your agent.
It *is* the agent's architecture.

- Reference code: [Langgraph4jConsol](https://github.com/cmabdullah/Langgraph4jConsol)
