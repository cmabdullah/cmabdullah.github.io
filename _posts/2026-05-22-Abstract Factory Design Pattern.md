---
title: Abstract Factory Design Pattern
header:
  image: /assets/images/blog_article_27_lake_minnewanka_2047x774.jpg
  teaser: /assets/images/blog_article_27_lake_minnewanka_2047x774.jpg
  caption: "Photo credit: [Unsplash](https://unsplash.com/)"
categories:
  - Design Pattern
tags:
  - design pattern
---
> Abstract Factory is a creational pattern for creating *families* of related objects together, without naming their concrete classes
> and guaranteeing the pieces match.

**Where Factory Method creates one product, Abstract Factory creates a whole family of related products through a single object, ensuring they belong together.**

If you've read the [Factory Method post](/design%20pattern/Factory-Design-Pattern/), this is the natural next step: one factory that makes *several* matching things instead of just one.

## The problem: pieces that must match

Say your service is cloud-agnostic and runs on both **AWS** and **GCP**. On each cloud it needs three things: a blob store 
for file uploads, a message queue, and a secret manager. The catch is that these must all come from the *same* provider. 
An AWS S3 client paired with a GCP Pub/Sub client will not authenticate against the same account, use the same region, or share the same SDK.

The naive version scatters the provider decision everywhere:

```java
BlobStore store = cloud.equals("AWS") ? new S3Store() : new GcsStore();
MessageQueue queue = cloud.equals("AWS") ? new SqsQueue() : new PubSubQueue();
SecretManager secrets = cloud.equals("AWS") ? new AwsSecrets() : new GcpSecrets();
```

Every new dependency copies this branch, and nothing stops a half-AWS, half-GCP mix. Add Azure and you are editing 
every one of these conditionals. That's the same Open/Closed violation Factory Method fixed, just multiplied across a family.

## The fix: one factory per family

Define an interface that creates the *whole set*, then one concrete factory per cloud. Each factory only ever produces matching parts:

```java
interface BlobStore     { void upload(String key); }
interface MessageQueue  { void publish(String msg); }
interface SecretManager { String get(String name); }

// AWS family
class S3Store     implements BlobStore     { public void upload(String key) { System.out.println("Upload to S3: " + key); } }
class SqsQueue    implements MessageQueue  { public void publish(String m)  { System.out.println("Publish to SQS: " + m); } }
class AwsSecrets  implements SecretManager { public String get(String n)    { return "aws-secret:" + n; } }

// GCP family
class GcsStore    implements BlobStore     { public void upload(String key) { System.out.println("Upload to GCS: " + key); } }
class PubSubQueue implements MessageQueue  { public void publish(String m)  { System.out.println("Publish to Pub/Sub: " + m); } }
class GcpSecrets  implements SecretManager { public String get(String n)    { return "gcp-secret:" + n; } }

// The abstract factory — declares the whole family
interface CloudFactory {
    BlobStore createBlobStore();
    MessageQueue createQueue();
    SecretManager createSecretManager();
}

class AwsFactory implements CloudFactory {
    public BlobStore createBlobStore()         { return new S3Store(); }
    public MessageQueue createQueue()          { return new SqsQueue(); }
    public SecretManager createSecretManager() { return new AwsSecrets(); }
}

class GcpFactory implements CloudFactory {
    public BlobStore createBlobStore()         { return new GcsStore(); }
    public MessageQueue createQueue()          { return new PubSubQueue(); }
    public SecretManager createSecretManager() { return new GcpSecrets(); }
}
```

The application picks a factory *once*, then never mentions a concrete class again:

```java
class UploadService {
    private final BlobStore store;
    private final MessageQueue queue;

    UploadService(CloudFactory factory) {   // hand it any cloud family
        this.store = factory.createBlobStore();
        this.queue = factory.createQueue();
    }

    void handle(String file) {
        store.upload(file);
        queue.publish("uploaded: " + file);
    }
}

public class AbstractFactoryDemo {
    public static void main(String[] args) {
        CloudFactory factory = new AwsFactory(); // choose once, e.g. from config
        new UploadService(factory).handle("report.pdf");
    }
}
```

Switch `AwsFactory` for `GcpFactory` on one line, usually driven by a config value, and the entire infrastructure layer 
moves to another cloud consistently, because a single factory can never hand you a mismatched client.

## Why it works

- **A family is created together.** `CloudFactory` bundles store, queue, and secret creation, so related clients always come from the same provider.
- **Mismatches are impossible by construction.** There's no code path that produces an S3 store with a Pub/Sub queue the type system enforces it.
- **New family = new class, not new edits.** Add `AzureFactory` and existing code is untouched. That's the Open/Closed Principle.

## Factory Method vs. Abstract Factory

The two are close cousins, and the difference is just *how many* products:

|           | Factory Method         | Abstract Factory                       |
|-----------|------------------------|----------------------------------------|
| Creates   | **One** product        | A **family** of related products       |
| Mechanism | One overridable method | An object with several factory methods |
| Answers   | "*Which* subclass?"    | "*Which set* of matching subclasses?"  |

In fact, an Abstract Factory is usually *implemented with* several factory methods which is why the names blur together.

## When to use it

Reach for Abstract Factory when your objects come in **matched sets** that must stay consistent cloud provider clients, 
database drivers producing matching `Connection`/`Statement`/`ResultSet` objects, or a data layer whose SQL dialect, pagination, 
and query builder must all agree. `javax.xml.parsers.DocumentBuilderFactory` in the JDK is a familiar real-world instance.

Skip it if you only ever create one kind of object (Factory Method is enough) or if the family never varies a fixed set of parts doesn't need a swappable factory. 
The pattern earns its extra classes only when whole families genuinely change together.

---

**References**

- [Abstract Factory — Refactoring Guru](https://refactoring.guru/design-patterns/abstract-factory)
- *Design Patterns: Elements of Reusable Object-Oriented Software* — Gamma, Helm, Johnson, Vlissides (the original GoF Abstract Factory, pp. 87–95)
- *Head First Design Patterns* (2nd Edition), Chapter 4: "The Factory Pattern" — Eric Freeman, Elisabeth Robson
