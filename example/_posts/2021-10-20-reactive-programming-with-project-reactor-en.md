---
title: Reactive programming with project reactor (রিএকটিভ প্রোগ্রামিং উইথ প্রজেক্ট রিয়েক্টর)
author: C M Abdullah Khan
date: 2021-10-20 04:55:00 +0000
categories:
- java
- reactive programming
- Articles
comments: true
tags:
- Java
- JUGBD
- JUG
- Reactive Spring
- Reactive Programming
- Project Reactor
- Bangladesh

image: 'https://dreamix.eu/blog/wp-content/uploads/2017/09/reactive-benchmark-1508x706_c.jpg'

---

## What is the main goal of Reactive Systems?

Working more with fewer resources, serving more concurrent requests through reactive processing with short resource (microservice/application) instances.

### The main features of reactive programming are given below.

1. Asynchronous and non-blocking.
2. Data is transferred in the form of an event or message-driven stream.
3. Write the code in a fully functional style. We can create a chain of Java functional programming.
4. Data is served asynchronously from the data source.
5. Data is returned from the data source via backpressure.

**An example of non-blocking asynchronous communication**

Suppose you went to the hospital to get the vaccine for Covid-19. You have to go there and get the serial. The gentleman is taking the serial one by one. These serial numbers are being sent in 2/3 zones and everyone is being vaccinated from the zone. It's not like that "The person who came first got the vaccine first after that second person's serial was given. If this were the case, it would be synchronous processing." On the contrary, vaccination is not in a state of blocking with the giving of serial. The serial man is taking the serial independently. This work is going through asynchronous processing.

This type of non-blocking and asynchronous communication is called event-driven streaming communication.

Now we will see how we can get data from the database through the imperial method through a blocking call.

![Data types](/assets/media/reactive-imperative.svg)

As you can see in the picture, our application is fetching data from a relational database through some queries when the database server is calling from the application server and this thread has to wait for the time between receiving the data return from the database server after the call. This programming model is called the synchronous and blocking communication model.

In the reactive programming world, data comes through event-driven streaming. Here the data from the data source comes in the form of an event. The data source can be anything such as an external database, a network, or a file.

When all the data coming from the data source against a request is completed, it is notified through onComplete() or if any error is found, it is notified through onError() event.

**Now we will see how to get data from the database via event-driven streaming method via a non-blocking call**

![Data types](/assets/media/reactive-event-driven.svg)

In the image above, we can see that a request event has been published on the database server from our application server to fetch n data from the database server. When the data preparation of the database server is complete, it will start returning the data one by one. It will stream the n data through the onNext () method and return the data one by one. The amount of data you requested was taken and all data was sent.

**Now we will also see an error scenario**

![Data types](/assets/media/reactive-vent-driven-error.svg)


In the picture above we can see that a request event has been published from our application server to fetch n number of data from the database to the database server. The database server will start returning data one by one when the data creation is complete, will return n data by streaming through onNext () method. Requested for all data sent.

Suppose the database server went to generate data, could not generate the data but returned the error, when we go to receive the data by streaming through onNext () method, we get an exception, in this case since the error was found inside the steam will not process subsequent requests but onError () Will let you know through the method that brother got the error I threw the exception.

A case has been created where the data from the application server will only be saved in the database but will not return anything from the database. In that case, the application server will take the request to save the data. And will slowly start reading and saving the data through the event. When the data is finished saving, the onComplete () event will let the application know that the data saving is over, now I have no rest.

One of the features of Reactive Stream is backpressure, it is seen that a lot of data is coming from the database but it is becoming challenging for the application server to process such a huge amount of data in a short time. I have no problem processing my data.

![Data types](/assets/media/reactive-pub-sub.svg)

I can see a publisher/subscriber model in the picture above. Here the publisher is the data source and the subscriber is receiving data from the data source, i.e. the consumer. First, the subscriber executes the publisher's subscribe method and sends it to the publisher as an instant input of the subscriber, the publisher sends a subscription object to the subscriber and declares that the subscription is successful.

Inside the subscription interface, there are two methods request (long n), cancel (). Now the subscriber executes the request method of the subscription object and tells how much data the publisher wants to read, the default request limit is set to Long.MAX_VALUE, that is, all the data is sent to the subscriber.

Suppose the data source has n the number of data against a request, now the next method will return the data of the stream size one by one by making n number of calls and by the last on complete method call the data transfer will be successful.

There is a case where the publisher has 20 data against a request but no more data needs to be processed after receiving the 15th data. Do not send to subscribers.

### Project Reactor has four main interfaces

1. Publisher 
2. Subscriber 
3. Subscription 
4. Processor 

These four interfaces communicate with each other to control the flow of the stream.

#### Publisher  

Publisher is a data source such as a database, network, or any other file. The subscriber reads the data from the data source.

```java
package org.reactivestreams;
 
public interface Publisher<T> {
    public void subscribe(Subscriber<? super T> s);
}
```

There is a method inside the publisher interface, the name is subscribe (Subscriber <? Super T> s). The Subscribe Method registers this request with the publisher by calling the subscriber instance and the publisher sends a subscription instance to the subscriber.

#### Subscriber

There are four methods of subscriber interface

```java
package org.reactivestreams;
 
public interface Subscriber<T> {
    public void onSubscribe(Subscription s);
    public void onNext(T t);
    public void onError(Throwable t);
    public void onComplete();
}
```

i. onSubscribe () - This method calls before sending data from the data source. The publisher sends a subscription instance to the subscriber via the onSubscribe (Subscription s) method call and says that the subscription is successful. Now tell me how much data will I give? Sets the default Request Limit Long.MAX_VALUE when sending subscription instances. That means give all the data from the data source as opposed to the request. If the subscriber wants, he overrides the default request limit and sets a value at will and sends the subscription request to the event publisher.

ii. onNext () - This method is used to stream data from the data source and return it. When the publisher's data is ready, it starts returning data one by one through the onNext (n) method. The onNext () method continues to be called until the n th data is found.

iii. onComplete () - If the publisher is able to return all the values ​​through onNext () then the onComplete () method is notified by call.

iv. onError () - When receiving data by streaming, if any error is found, it is notified via onError ().

#### Subscription

```java
package org.reactivestreams;
 
public interface Subscription {
    public void request(long n);
    public void cancel();
}
```

There are two methods in the subscription interface: a request and a cancel.

i. request (long n) - The request can tell you how much value I want from the publisher.

ii. cancel () - Cancel method After receiving a certain amount of data by calling, the subscription cancel request is sent to the publisher.

#### Processor

The processor interface extends publisher and subscriber interfaces. The processor does not have its own method. We will discuss the processor in detail in another episode. Let's look at an example.

```java
package com.abdullah.reactive;

import org.junit.jupiter.api.Test;
import org.reactivestreams.Subscriber;
import org.reactivestreams.Subscription;
import reactor.core.publisher.Flux;

public class FluxTest {
	@Test
	public void pubSub() {

		Flux<String> flux = Flux.just("red", "white", "blue");
		flux
//				.log()
//				.map(String::toUpperCase)
				.subscribe(new Subscriber<String>() {

					@Override
					public void onSubscribe(Subscription s) {
						s.request(Long.MAX_VALUE);
					}

					@Override
					public void onNext(String t) {
						System.out.println(t);
					}

					@Override
					public void onError(Throwable t) {
					}

					@Override
					public void onComplete() {
						System.out.println("completed");
					}

				});
	}
}
```

Here Flux is Reactive Streams Publisher, where data comes from the data source until the subscribe method is called "Flux <String> flux = Flux.just (" red "," white "," blue ");" This line will not run. Here the data can come from any source. The subscriber is subscribing to flux, reading a single value from the source via the onNext (String t) method call, and triggering the onComplete () event when all the values ​​have been read.

Let's go ...

### Ref

1. [Notes on Reactive Programming Part I](https://spring.io/blog/2016/06/07/notes-on-reactive-programming-part-i-the-reactive-landscape)
2. [Notes on Reactive Programming Part II](https://spring.io/blog/2016/06/13/notes-on-reactive-programming-part-ii-writing-some-code)

**Allah Hafez**