---
title: Singleton Design Pattern
header:
  image: /assets/images/unsplash-image-11.jpg
  teaser: /assets/images/unsplash-image-11.jpg
  caption: "Photo credit: [Unsplash](https://unsplash.com/)"
categories:
  - Design Pattern
tags:
  - design pattern
---
# The Singleton Design Pattern ensures that a class has only one instance and provides a global access point to it.

It belongs to the **creational** family of patterns because it is really about controlling *how* objects get created in this case, by not letting anyone create a second one.

## The core recipe

Every Singleton implementation, no matter how fancy, boils down to three moves:

1. **Make the constructor private** so nobody outside the class can call `new`.
2. **Hold the single instance in a static field** inside the class itself.
3. **Expose a public static method** (conventionally `getInstance()`) that hands out that one instance.

Everything after that is a conversation about *when* the instance is created and *what happens when multiple threads show up at the same time*.

## Eager initialization

The simplest version: create the instance at class-loading time and never think about it again.

```java
public class AppConfig {
    private static final AppConfig INSTANCE = new AppConfig();

    private AppConfig() {
    }

    public static AppConfig getInstance() {
        return INSTANCE;
    }
}
```

This is thread-safe for free. The JVM guarantees that class initialization happens exactly once, so `INSTANCE` is created exactly once
no locks, no volatile, no cleverness.

The trade-off is that the instance is built whether or not anyone ever asks for it. For a lightweight config object that is fine. 
For something heavy say, an object that opens sockets or loads a large file in its constructor, you are paying the cost at startup even if that code path never runs.

## Lazy initialization

If construction is expensive, defer it until the first caller actually needs it:

```java
public class AppConfig {
    private static AppConfig instance;

    private AppConfig() {
    }

    public static AppConfig getInstance() {
        if (instance == null) {
            instance = new AppConfig();
        }
        return instance;
    }
}
```

This works perfectly — in a single-threaded world. The moment two threads call `getInstance()` at the same time, 
both can see `instance == null`, both create an object, and now you have two "singletons." 
One of them wins the field assignment; the other lives on wherever the losing thread stashed its reference. 
These bugs are nasty precisely because they only show up under concurrent load, usually in production.

## The synchronized fix (and its cost)

The obvious repair is to serialize access:

```java
public static synchronized AppConfig getInstance() {
    if (instance == null) {
        instance = new AppConfig();
    }
    return instance;
}
```

Correct, but blunt. The race only exists during the *first* call — yet every call for the lifetime of the application now pays for lock acquisition. 
On a hot path called millions of times, you are locking to protect an initialization that finished ages ago.

## Double-checked locking

The classic optimization is to only take the lock when the instance might not exist yet:

```java
public class AppConfig {
    private static volatile AppConfig instance;

    private AppConfig() {
    }

    public static AppConfig getInstance() {
        if (instance == null) {                     // check 1: no lock
            synchronized (AppConfig.class) {
                if (instance == null) {             // check 2: under lock
                    instance = new AppConfig();
                }
            }
        }
        return instance;
    }
}
```

Two details here matter more than the pattern itself:

- **The second check is not redundant.** Two threads can both pass the first check; the lock ensures only one of them constructs the object, 
 and the second check makes the loser reuse it instead of building another one.
- **`volatile` is not optional.** Without it, the JVM is allowed to reorder the steps of `instance = new AppConfig()` allocate memory, 
 publish the reference, *then* run the constructor. Another thread could observe a non-null but half-constructed object and happily start using it. 
 `volatile` forbids that reordering and guarantees visibility across threads. Pre-Java-5 memory model, double-checked locking was famously broken for exactly this reason.

Once initialized, all subsequent calls skip the lock entirely — you get lazy initialization at essentially eager-initialization speed.

## The initialization-on-demand holder (my default)

There is a way to get lazy initialization *and* thread safety *and* zero synchronization code, by letting the JVM's class loader do the work:

```java
public class AppConfig {
    private AppConfig() {
    }

    private static class Holder {
        private static final AppConfig INSTANCE = new AppConfig();
    }

    public static AppConfig getInstance() {
        return Holder.INSTANCE;
    }
}
```

This is often called the **Bill Pugh singleton**, after the researcher who popularized it, or the *initialization-on-demand holder idiom*. 
The trick: the nested `Holder` class is not loaded when `AppConfig` is loaded, it is loaded on the first call to `getInstance()`. 
The JVM guarantees class initialization is thread-safe, so `INSTANCE` is created lazily, exactly once, with no locks and no `volatile`.

If someone asks me for "the" way to write a Singleton in Java, this is my answer. It reads almost as simply as the naive lazy version, but it is actually correct.

## The enum singleton

Joshua Bloch's *Effective Java* argues for an even shorter form:

```java
public enum AppConfig {
    INSTANCE;

    public void load() {
        // ...
    }
}
```

An enum with one constant gives you singleton semantics enforced by the language itself. Beyond brevity, 
it closes two loopholes every class-based implementation leaves open:

- **Reflection.** With a normal class, `constructor.setAccessible(true)` lets determined code call the private constructor and mint a second instance. Enums throw if you try.
- **Serialization.** Deserializing a serializable singleton normally produces a *new* object unless you remember to implement `readResolve()`. Enum serialization preserves the single instance automatically.

The downside is flexibility: enums cannot extend another class, and lazy initialization is not really in your control. 
For most application code the holder idiom feels more natural; the enum form shines when you genuinely worry about reflection or serialization attacks.

## A word of caution

Singleton has a reputation problem, and it is partly deserved. A few things to keep in mind before reaching for it:

- **It is global state in disguise.** Every `getInstance()` call is a hidden dependency that does not appear in any constructor or method signature, 
 which makes code harder to reason about and to test. If your class needs an `AppConfig`, it is usually better to *inject* 
 it and let a DI container (Spring, Guice) manage the "only one exists" part — Spring beans are singletons by default, scoped to the container rather than the class loader.
- **Testing pain is real.** You cannot easily swap a hard-coded singleton for a mock. If you must use one, at least have it implement an interface.
- **"Only one" is a scope, not an absolute.** One per JVM? Per class loader? Per container? In application servers and OSGi environments, "the" singleton can quietly become several.

Used deliberately — for stateless or effectively-immutable services that truly must be unique — Singleton is a clean, honest pattern. Used as a convenient global variable, it becomes the thing your future self grumbles about while writing test doubles.

## Summary

| Implementation           | Lazy   | Thread-safe | Notes                                         |
|--------------------------|--------|-------------|-----------------------------------------------|
| Eager static field       | No     | Yes         | Simplest; fine for cheap objects              |
| Naive lazy               | Yes    | **No**      | Single-threaded only                          |
| Synchronized method      | Yes    | Yes         | Locks on every call                           |
| Double-checked locking   | Yes    | Yes         | Needs `volatile`; easy to get wrong           |
| Holder idiom (Bill Pugh) | Yes    | Yes         | Best general-purpose choice                   |
| Enum                     | Mostly | Yes         | Immune to reflection and serialization tricks |

Start with the holder idiom, reach for the enum when serialization or reflection matters, and before writing any of them, ask whether a DI-managed bean would serve you better.

---

**References**

- [Singleton — Refactoring Guru](https://refactoring.guru/design-patterns/singleton)
- [Singletons in Java — Baeldung](https://www.baeldung.com/java-singleton)
- [The "Double-Checked Locking is Broken" Declaration — Bill Pugh et al.](https://www.cs.umd.edu/~pugh/java/memoryModel/DoubleCheckedLocking.html)
- [Initialization-on-demand holder idiom — Wikipedia](https://en.wikipedia.org/wiki/Initialization-on-demand_holder_idiom)
- *Effective Java* (3rd Edition), Item 3 — Joshua Bloch
