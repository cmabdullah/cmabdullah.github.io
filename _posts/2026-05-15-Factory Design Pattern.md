---
title: Factory Design Pattern
header:
  image: /assets/images/blog_abstract_technology_2047x774.jpg
  teaser: /assets/images/blog_abstract_technology_2047x774.jpg
  caption: "Photo credit: [Unsplash](https://unsplash.com/)"
categories:
  - Design Pattern
tags:
  - design pattern
---
> Factory Method is a creational pattern for classes that need to create objects but should not decide *which* concrete class to instantiate.
> Instead of an if-else ladder picking the class, the superclass declares an abstract creation method and each subclass answers with exactly one product.

**The Factory Method pattern defines an interface for creating an object, but lets subclasses decide which class to instantiate.
The creation logic moves out of the class that *uses* the object and into a parallel hierarchy of creators — each one responsible for exactly one product.**

If Builder is about *how* a complicated object gets created, Factory Method is about *who decides which* object gets created.
It attacks a very specific smell: a class that both uses an object and contains a conditional (`if`/`else` or `switch`) choosing its concrete type.

You have met it in the JDK without noticing: `Collection.iterator()` is the textbook example — `ArrayList` answers with its iterator, 
`HashSet` with a completely different one, and the code calling `iterator()` never knows or cares which.

## The starting point: one class does everything

Say we are starting a logistics business. We plan two services — road and sea — so we need transport, and the naive first cut stuffs everything into two classes:

```java
class Transport {
    private String name;

    public Transport(String name) {
        this.name = name;
    }

    public void delivery() {
        String message = "Delivery not available!";
        if (name.equals("Truck"))
            message = "On road delivery by " + name;
        else if (name.equals("Ship"))
            message = "On sea delivery by " + name;

        System.out.println(message);
    }
}

class Logistic {
    private Transport transport;

    public void planDelivery(String type) {
        String name = "NA";
        if (type.equals("ROAD")) name = "Truck";
        else if (type.equals("SEA")) name = "Ship";

        transport = new Transport(name);
        transport.delivery();
    }
}

class FactoryMethodDemo {
    public static void main(String[] args) {
        Logistic logistic = new Logistic();
        logistic.planDelivery("ROAD");
        logistic.planDelivery("SEA");
    }
}
```

It works, but look at where the if-else ladders live: one inside `Transport.delivery()` deciding *behavior* by string comparison, 
and one inside `Logistic.planDelivery()` deciding *identity* by string comparison.

Now the business grows and we add air freight. To ship one `Plane`, we must reopen and edit **both** classes, add a branch to `delivery()`,
add a branch to `planDelivery()`, and hope every string matches. Every new transport type means modifying working, tested code. In SOLID terms:

- **Open/Closed Principle is violated** — the classes are not closed for modification; extension *requires* modification.
- **Single Responsibility Principle is violated** — `Logistic` plans deliveries *and* knows how to construct every transport ever invented; 
 `Transport` carries the behavior of every vehicle in one method.

A string-keyed if-else ladder is also a bug factory in its own right: pass `"Road"` instead of `"ROAD"` and you silently 
get a transport named `"NA"` — the compiler cannot help you.

## Step 1: polymorphism fixes the behavior

The branch inside `delivery()` is the easier one, and plain old inheritance dissolves it. Give each vehicle its own class 
and let dynamic dispatch do what the if-else was doing by hand:

```java
interface Transport {
    void delivery();
}

class Truck implements Transport {
    private String name = "Truck";

    @Override
    public void delivery() {
        System.out.println("On road delivery by " + name);
    }
}

class Ship implements Transport {
    private String name = "Ship";

    @Override
    public void delivery() {
        System.out.println("On sea delivery by " + name);
    }
}

class Logistic {
    private Transport transport;

    public void planDelivery(String type) {
        if (type.equals("ROAD"))
            transport = new Truck();
        else transport = new Ship();

        transport.delivery();
    }
}
```

Better. `Truck` knows road delivery, `Ship` knows sea delivery, and adding a `Plane` means adding a class not editing one. The *behavior* branch is gone.

But we only moved the problem, we didn't solve it. `Logistic.planDelivery()` still contains a conditional choosing which class to `new` up. 
Add `Plane` and you are back inside `Logistic` adding another `else if`. The **creation** branch survived and creation branches are the stubborn ones, 
because polymorphism dispatches on an object that already exists; it cannot dispatch on an object you are still deciding whether to create.

## Step 2: the Factory Method

The insight of the pattern is to apply the *same* inheritance trick to creation. If subclassing `Transport` removed the behavior branch, 
subclassing `Logistic` can remove the creation branch:

```java
interface Transport {
    void delivery();
}

class Truck implements Transport {
    private String name = "Truck";

    @Override
    public void delivery() {
        System.out.println("On road delivery by " + name);
    }
}

class Ship implements Transport {
    private String name = "Ship";

    @Override
    public void delivery() {
        System.out.println("On sea delivery by " + name);
    }
}

abstract class Logistic {
    private Transport transport;

    // the factory method — creation is declared here, decided in subclasses
    public abstract Transport createTransport();

    public void planDelivery() {
        transport = createTransport();
        transport.delivery();
    }
}

class RoadLogistic extends Logistic {
    @Override
    public Transport createTransport() {
        return new Truck();
    }
}

class SeaLogistic extends Logistic {
    @Override
    public Transport createTransport() {
        return new Ship();
    }
}

class FactoryMethodDemo {
    public static void main(String[] args) {
        Logistic roadLogistic = new RoadLogistic();
        roadLogistic.planDelivery();

        Logistic seaLogistic = new SeaLogistic();
        seaLogistic.planDelivery();
    }
}
```

The moving parts, and why each one is there:

- **`createTransport()` is the factory method.** The abstract `Logistic` *declares* that a transport will be created but refuses to say which one
 that decision belongs to subclasses. This is exactly the GoF definition: *"Define an interface for creating an object, but let subclasses decide which class to instantiate."*
- **`planDelivery()` is written once, against the interface.** It calls `createTransport()` and then `delivery()` without ever naming 
 `Truck` or `Ship`. The GoF call this shape a *template method* whose interesting step happens to be object creation
 the superclass owns the workflow, the subclass fills in the product.
- **The `type` string parameter is gone entirely.** The choice of transport is no longer data flowing through a conditional; 
 it is *which class you instantiated* at the call site. The decision moved from runtime string comparison to the type system.
- **Each creator has exactly one reason to change.** `RoadLogistic` changes only if road logistics changes. That is the Single Responsibility Principle, restored.
- **Adding air freight is now pure addition.** Write `Plane implements Transport` and `AirLogistic extends Logistic` 
 two new files, zero edited lines in existing code. That is the Open/Closed Principle: open for extension, closed for modification.

## The general shape: parallel hierarchies

Strip away trucks and ships and the pattern has a shape worth memorizing, because you will recognize it in the wild more often than you will build it from scratch:

1. `ClassA` HAS-A `ClassB`, and `ClassB` has multiple subclasses (`ClassB1`, `ClassB2`, … `ClassBn`).
2. If `ClassA` picks which `ClassB` subclass to instantiate, it is forced into a conditional — one that grows with every new subclass.
3. Instead, give `ClassA` its own subclasses, **parallel** to the `ClassB` hierarchy: `ClassA1` creates `ClassB1`, `ClassA2` creates `ClassB2`.
4. The abstract `ClassA` declares the factory method; each `ClassAi` overrides it with a single `new`.

Creator hierarchy and product hierarchy grow in lockstep, one pair of classes per variant, and no conditional anywhere. That parallel structure *is* the Factory Method pattern — everything else is naming.

## Sorting out the "factory" family

"Factory" is the most overloaded word in design-pattern vocabulary, and three different things routinely get conflated:

- **Static factory method** — `LocalDate.of(2026, 5, 5)`, `List.of(...)`, `Optional.empty()`. Just a static method that returns an instance.
 Joshua Bloch's *Effective Java* Item 1 champions these over constructors, but they are an API idiom, **not** 
 the GoF pattern — there is no subclassing, no deferred decision.
- **Simple factory** — a single class with one method full of `switch`/`if` returning different products. Widely used, 
 perfectly reasonable for small cases, but note that it *centralizes* the conditional rather than eliminating it. It is not in the GoF catalog at all.
- **Factory Method (this post)** — the conditional is *dissolved* into a class hierarchy; subclasses decide via overriding.

One step further sits **Abstract Factory**, the GoF pattern for creating whole *families* of related products (a `UiFactory` 
producing matching buttons, checkboxes, and scrollbars per platform). It is typically implemented *using* factory methods
one per product — which is another reason the names blur together. That one deserves its own post.

## When to reach for it — and when not to

Reach for Factory Method when a class cannot anticipate the concrete type it must create, when you expect the set of 
product variants to grow, or when you are writing a framework and want users to plug in their own products
frameworks are the pattern's natural habitat, because the framework author genuinely *cannot* know what the application will instantiate.

Skip it when the branch is trivial and stable:

```java
if (user.isLoggedIn()) {
    showDashboard();
} else {
    showLogin();
}
```

Two outcomes, no reason to expect a third, no object creation involved — a conditional is the honest tool here, and 
replacing it with four classes would be ceremony. If-else is not the enemy; **an if-else that selects concrete types and grows with every business change** is. 
The pattern's cost is real: every new variant costs a new creator class, and the class count doubles relative to the simple-factory approach. 
That cost buys you closed-for-modification code, and the trade is only worth it when modification pressure actually exists.

## Summary

| Approach                                   | New variant requires                 | OCP | SRP     | Class count |
|--------------------------------------------|--------------------------------------|-----|---------|-------------|
| If-else in one class                       | Editing existing, tested code        | ✗   | ✗       | Minimal     |
| Polymorphic products, conditional creation | Editing the creating class           | ✗   | Partial | Moderate    |
| Factory Method                             | **Adding** two classes, editing none | ✓   | ✓       | Highest     |

Factory Method is the pattern you converge on naturally the second time an if-else ladder makes you reopen a class you thought was finished. 
The first time, add the branch. The second time, notice the pattern — the third variant is already on its way.

---

**References**

- [Factory Method — Refactoring Guru](https://refactoring.guru/design-patterns/factory-method)
- *Design Patterns: Elements of Reusable Object-Oriented Software* — Gamma, Helm, Johnson, Vlissides (the original GoF Factory Method, pp. 107–116)
- *Effective Java* (3rd Edition), Item 1: "Consider static factory methods instead of constructors" — Joshua Bloch
- *Head First Design Patterns* (2nd Edition), Chapter 4: "The Factory Pattern" — Eric Freeman, Elisabeth Robson
- [The Open-Closed Principle — Robert C. Martin (Uncle Bob)](https://blog.cleancoder.com/uncle-bob/2014/05/12/TheOpenClosedPrinciple.html)
