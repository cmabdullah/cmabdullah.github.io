---
title: Builder Design Pattern
header:
  image: /assets/images/blog_misty_nature_2047x774.jpg
  teaser: /assets/images/blog_misty_nature_2047x774.jpg
  caption: "Photo credit: [Unsplash](https://unsplash.com/)"
categories:
  - Design Pattern
tags:
  - design pattern
---
> Builder is a creational pattern for constructing objects with many optional parameters. Instead of one huge constructor, 
> you set each parameter through a named method on a builder object, then call `build()` — which validates the combination and returns an immutable result.

**The Builder pattern separates the construction of a complex object from the object itself: a dedicated Builder collects the parameters step by step through named, chainable methods, and a final `build()` call validates everything and returns the complete, immutable object.**

If Singleton is about *how many* objects get created, Builder is about *how* a single complicated object gets created. 
It is a **creational** pattern for classes whose construction involves many parameters some required, some optional 

You have almost certainly used it already without writing one: `StringBuilder`, `Stream.builder()`, `HttpRequest.newBuilder()` in the JDK, 
and virtually every request object in the AWS SDK are all builders.

## Attempt 1: the telescoping constructor

Say we are writing the configuration object for a database connection pool. Three things are genuinely mandatory — host, port, and database name. 
Everything else has a reasonable default that callers *might* want to override:

```java
public class DatabaseConfig {
    private final String host;          // required
    private final int port;             // required
    private final String database;      // required
    private final String username;      // optional
    private final String password;      // optional
    private final int maxPoolSize;      // optional
    private final int connectTimeoutSeconds; // optional
    private final boolean useSsl;       // optional
    private final boolean readOnly;     // optional
    private final boolean cacheStatements; // optional
}
```

The naive approach is one giant constructor:

```java
DatabaseConfig config = new DatabaseConfig(
        "db.internal.acme.com", 5432, "orders",
        "app_user", "s3cr3t", 20, 5, true, false, true);
```

Quick — is `20` the pool size or the timeout? Is the first `true` SSL or read-only? Neither can the person reviewing your pull request. 
Long runs of same-typed parameters are a bug factory: **swap the two ints or two of the booleans and the compiler will not save you** 
you will find out in production, when the pool opens 5 connections with a 20-second timeout instead of the other way around.

The classic "fix" is a ladder of overloaded constructors, each adding one more optional parameter. 
This is known as the **telescoping constructor anti-pattern**, and it scales terribly: with `n` optional properties 
you would need constructors for every useful combination, and callers still end up passing values they do not care about just to reach the parameter they do.

## Attempt 2: JavaBeans setters

The next instinct is a small constructor for the required fields plus setters for everything else:

```java
DatabaseConfig config = new DatabaseConfig("db.internal.acme.com", 5432, "orders");
config.setUsername("app_user");
config.setPassword("s3cr3t");
config.setMaxPoolSize(20);
config.setUseSsl(true);
```

More readable — but we traded one problem for two worse ones:

- **The object is mutable forever.** Anyone holding a reference can call `setMaxPoolSize(500)` at runtime, long after the pool was sized. 
  All fields must drop `final`, and immutability one of the cheapest correctness guarantees in Java — is gone. 
  For an object like this, which typically outlives the whole application and is read from many threads, that is a real liability, not a style complaint.
- **The object goes through inconsistent states.** Between the constructor and the last setter, the config is half-built. 
  If it escapes to another thread (or even just to another method) mid-assembly say, the pool starts initializing after `setUsername` but before `setPassword`
  that code sees a partially initialized object. There is also no single point where you can validate that the combination of values makes sense.

Joshua Bloch summarizes this in *Effective Java*: the JavaBeans pattern "precludes the possibility of making a class immutable 
and requires added effort on the part of the programmer to ensure thread safety."

## The fix: Builder

Builder keeps the readability of setters but moves them onto a *separate, throwaway object* whose whole job is accumulating parameters. 
The real object is created in one shot, fully formed and immutable:

```java
public class DatabaseConfig {
    private final String host;
    private final int port;
    private final String database;
    private final String username;
    private final String password;
    private final int maxPoolSize;
    private final int connectTimeoutSeconds;
    private final boolean useSsl;
    private final boolean readOnly;
    private final boolean cacheStatements;

    private DatabaseConfig(Builder builder) {
        this.host = builder.host;
        this.port = builder.port;
        this.database = builder.database;
        this.username = builder.username;
        this.password = builder.password;
        this.maxPoolSize = builder.maxPoolSize;
        this.connectTimeoutSeconds = builder.connectTimeoutSeconds;
        this.useSsl = builder.useSsl;
        this.readOnly = builder.readOnly;
        this.cacheStatements = builder.cacheStatements;
    }

    public static class Builder {
        // required — set once, in the Builder's constructor
        private final String host;
        private final int port;
        private final String database;

        // optional — initialized to sensible defaults
        private String username = "";
        private String password = "";
        private int maxPoolSize = 10;
        private int connectTimeoutSeconds = 30;
        private boolean useSsl = true;
        private boolean readOnly;
        private boolean cacheStatements = true;

        public Builder(String host, int port, String database) {
            this.host = host;
            this.port = port;
            this.database = database;
        }

        public Builder credentials(String username, String password) {
            this.username = username;
            this.password = password;
            return this;
        }

        public Builder maxPoolSize(int maxPoolSize) {
            if (maxPoolSize < 1) {
                throw new IllegalArgumentException("Pool needs at least one connection");
            }
            this.maxPoolSize = maxPoolSize;
            return this;
        }

        public Builder connectTimeoutSeconds(int connectTimeoutSeconds) {
            this.connectTimeoutSeconds = connectTimeoutSeconds;
            return this;
        }

        public Builder useSsl(boolean useSsl) {
            this.useSsl = useSsl;
            return this;
        }

        public Builder readOnly(boolean readOnly) {
            this.readOnly = readOnly;
            return this;
        }

        public Builder cacheStatements(boolean cacheStatements) {
            this.cacheStatements = cacheStatements;
            return this;
        }

        public DatabaseConfig build() {
            if (!useSsl && !password.isEmpty()) {
                throw new IllegalStateException(
                        "Refusing to send credentials over a non-SSL connection");
            }
            return new DatabaseConfig(this);
        }
    }
}
```

And the call site reads like a sentence:

```java
DatabaseConfig config = new DatabaseConfig.Builder("db.internal.acme.com", 5432, "orders")
        .credentials("app_user", "s3cr3t")
        .maxPoolSize(20)
        .connectTimeoutSeconds(5)
        .readOnly(true)
        .build();
```

The moving parts, and why each one is there:

- **`DatabaseConfig`'s constructor is private** and takes the builder itself — the only way to make a config is through `build()`.
- **Required parameters go in the Builder's constructor**, so you cannot even start building without them; optional ones are named, chainable methods with sensible defaults.
- **Each setter returns `this`**, which is what enables the fluent chain (a *fluent interface*, in Martin Fowler's term).
- **Setters can group related values.** `credentials(username, password)` takes both together — something a bag of independent setters can't express.
- **`build()` is the single choke point.** Cross-field rules — like refusing to pair a password with a plaintext connection — live in one place, and no config object exists until they pass.
- **Every field stays `final`.** The object is born complete, can never be seen half-initialized, and is safely shareable across threads without synchronization.

## "Can't the class just build itself?"

A tempting shortcut: skip the nested class and put the chainable methods directly on `DatabaseConfig`:

```java
DatabaseConfig config = new DatabaseConfig("db.internal.acme.com", 5432, "orders")
        .maxPoolSize(20)
        .useSsl(true);
```

It compiles, it chains, it even reads the same. But it is not the Builder pattern it is the JavaBeans problem wearing a fluent costume. 
Those chainable methods are mutators living on the real object, so:

- `config.maxPoolSize(500)` still works *after* the pool has been created from it immutability is lost, and the fields can't be `final`.
- There is no `build()` gate, so there is no moment where the object is declared complete and validated. 
 A config with only the constructor called is just as "valid" to the type system as a fully specified one the SSL-plus-password check has nowhere to live.

The separation into a distinct builder object is not ceremony; it is exactly what lets the product be immutable while the construction process is incremental. 
The builder is mutable *so the product doesn't have to be*.

## The GoF's original Builder

Worth knowing: what Bloch popularized (and what most Java developers mean by "builder") is a simplification. 
The original *Design Patterns* book by Gamma, Helm, Johnson, and Vlissides describes something broader
a `Director` that drives an abstract `Builder` interface, with concrete builders producing different representations 
from the same construction steps. The canonical example is a document converter: one director walks the document, 
and an `HtmlBuilder`, `PdfBuilder`, or `TextBuilder` each assemble a different output.

That form still appears in parsers and document generators, but in day-to-day Java the Bloch-style static nested builder is what you will write and encounter — the GoF's "separate the construction of a complex object from its representation" collapsed into "make big constructors readable and keep the result immutable."

## Less boilerplate: Lombok and records

The honest downside of Builder is the typing: the builder duplicates every field, and adding a property means touching three or four places. Two modern outs:

- **Lombok's `@Builder`** generates the entire nested builder at compile time. One annotation on the class and you get 
 `DatabaseConfig.builder().maxPoolSize(20)....build()` for free. Most large Java codebases I have worked in use this rather than hand-rolling.
- **Java records** (Java 16+) eliminate the boilerplate of the *product* class and give you immutability by default. 
 For small records, named construction is arguably unnecessary; for big ones, a record plus a Lombok `@Builder` or a hand-written compact builder combine nicely.

## When to reach for it — and when not to

Use Builder when a class has **four or more constructor parameters**, especially when several are optional or share a 
type (adjacent ints and booleans are where call-site bugs breed). It is also the natural fit when you want an immutable object 
with validation of *combinations* of fields, or when construction genuinely happens step-by-step (assembling a query, a request, a configuration).

Skip it when the class is small and every field is mandatory. A `Point(x, y)` with a builder is pure ceremony the constructor already says everything. 
The pattern's value scales with the number of parameters; below the threshold, it is just indirection.

## Summary

| Approach                 | Readable call site | Immutable result | Consistent during construction | Boilerplate                |
|--------------------------|--------------------|------------------|--------------------------------|----------------------------|
| Telescoping constructors | No                 | Yes              | Yes                            | High                       |
| JavaBeans setters        | Somewhat           | **No**           | **No**                         | Low                        |
| Builder                  | Yes                | Yes              | Yes                            | High (or zero with Lombok) |

Builder is the rare pattern that improves the *reader's* life more than the writer's: the writer types more once, and every call site forever after is self-documenting. 
When a constructor starts telescoping, that trade is worth taking.

---

**References**

- [Builder — Refactoring Guru](https://refactoring.guru/design-patterns/builder)
- *Effective Java* (3rd Edition), Item 2: "Consider a builder when faced with many constructor parameters" — Joshua Bloch
- *Design Patterns: Elements of Reusable Object-Oriented Software* — Gamma, Helm, Johnson, Vlissides (the original GoF Builder)
- [Fluent Interface — Martin Fowler](https://martinfowler.com/bliki/FluentInterface.html)
- [Using Lombok's @Builder Annotation — Baeldung](https://www.baeldung.com/lombok-builder)
