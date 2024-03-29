---

image: 'https://dreamix.eu/blog/wp-content/uploads/2017/09/reactive-benchmark-1508x706_c.jpg'

---

## প্রজেক্ট রিয়েক্টর প্রথম পর্ব। Reactive Systems এর মূল লক্ষ্য কী?

স্বল্প রিসোর্স নিয়ে বেশি পরিমাণ কাজ করা, রিএক্টিভ প্রসেসিং এর মাধ্যমে অধিক পরিমাণে কনকারেন্ট রিকোয়েস্ট স্বল্প রিসোর্স (মাইক্রসার্ভিস/অ্যাপ্লিকেশন) ইন্সটান্স দিয়ে সার্ভ করা।

### রিএক্টিভ প্রোগ্রামিং এর প্রধান বৈশিষ্ট্য সমূহ নিম্নে দেওয়া হল।

1. এসিনক্রোনাস এবং নন ব্লকিং।
2. ডেটাগুলো ইভেন্ট অথবা মেসেজ ড্রিভেন স্ট্রিম আকারে ট্রান্সফার করা হয়।
3. সম্পূর্ণ ফাংশনাল স্টাইলে কোড লিখতে হয়। আমরা জাভা ফাংশনাল প্রোগ্রামিং এর চেইন তৈরি করতে পারি।
4. ডেটা সোর্স থেকে এসিনক্রোনাসলি  ডেটা সার্ভ করা হয়।
5. ডেটা সোর্স থেকে ডেটা ব্যাক প্রেসার এর মাধ্যমে রিটার্ন করা হয়।

**নন ব্লকিং অ্যাসিনক্রোনাস কমিউনিকেশন এর একটা উদাহরণ**

ধরুন আপনি হাসপাতালে গেলেন কভিড -১৯ এর ভ্যাক্সিন নিতে সেখানে গিয়ে ভ্যাক্সিন নেয়ার জন্য আপনাকে সিরিয়াল দিতে হবে, যে ভদ্রলোক সিরিয়াল নিচ্ছে সে সিরিয়াল নিয়েই যাচ্ছে একজন একজন করে, এই সিরিয়াল নাম্বার গুলি ২/৩ টি জোনে ভাগ করে পাঠানো হচ্ছে এবং সবাইকে জোন থেকে ভ্যাক্সিন দেওয়া হচ্ছে । ব্যাপারটা এরকম না যে "সিরিয়াল নেয়ার পরে ওই ভদ্রলোক ভ্যাক্সিন পেল তারপরে দ্বিতীয়জনের সিরিয়াল নেয়া হলো যদি এরকম হত তাহলে সেটা হতো সিনক্রোনাস প্রসেসিং” বরং সিরিয়াল দেয়ার সাথে ভ্যাক্সিন প্রদান ব্লকিং অবস্থায় নেই সিরিয়াল ম্যান স্বাধীনভাবে সিরিয়াল নিচ্ছে ভ্যাক্সিন প্রদান টিমে যারা আছেন তারা একজন একজন করে ভ্যাক্সিন দিয়ে যাচ্ছেন এই কাজটাই হচ্ছে এসিনক্রোনাস প্রসেসিং।

এধরনের নন ব্লকিং এবং এসিনক্রোনাস কমিউনিকেশন কে বলা হয় ইভেন্ট-ড্রিভেন স্ট্রিমিং কমিউনিকেশন।

এখন আমরা দেখব ইমপারেটিভ পদ্ধতিতে কিভাবে ডেটাবেজ থেকে একটা  ব্লকিং কল এর মাধ্যমে ডেটা পেতে পারি।

![Data types](/assets/img/reactive-imperative.svg)

ছবিতে দেখতে পাচ্ছি আমাদের অ্যাপ্লিকেশন একটি রিলেশনাল ডেটাবেজ থেকে ডেটা নিয়ে আসছে কিছু কুয়েরির মাধ্যমে যখন অ্যাপ্লিকেশন সার্ভার থেকে ডেটাবেজ সার্ভার কল হচ্ছে এবং কল করার পরে ডেটাবেজ সার্ভার থেকে ডেটা রিটার্ন পাওয়ার মধ্যবর্তী সময় এই থ্রেডটিকে ওয়েট করতে হচ্ছে। এই প্রোগ্রামিং মডেলকে বলা হয় সিনক্রোনাস এবং ব্লকিং কমিউনিকেশন মডেল।

রিএক্টিভ প্রোগ্রামিং ওয়ার্ল্ডে ডেটাগুলো ইভেন্ট-ড্রিভেন স্ট্রিমিং এর মাধ্যমে আসে। এখানে ডেটা সোর্স থেকে ডেটাগুলো ইভেন্ট আকারে আসে ডেটা সোর্স যেকোনো কিছু হতে পারে যেমন এক্সটার্নাল ডেটাবেজ, কোন নেটওয়ার্ক অথবা কোন ফাইল থেকে ডেটা আসতে পারে।

ডেটা সোর্স থেকে যখন একটা রিকোয়েস্ট এর বিপরীতে সব ডেটা আসা কমপ্লিট হয়ে যায় তখন onComplete() এর মাধ্যমে জানিয়ে দেয়া হয় অথবা যদি কোন এরর পায় সেটা হচ্ছে onError() ইভেন্ট এর মাধ্যমে জানিয়ে দেয়।

**এখন আমরা দেখব ইভেন্ট-ড্রিভেন স্ট্রিমিং পদ্ধতিতে কিভাবে ডেটাবেজ থেকে একটা  নন ব্লকিং কল এর মাধ্যমে ডেটা পেতে পারি**

![Data types](/assets/img/reactive-event-driven.svg)

উপরের ছবিতে আমরা দেখতে পাচ্ছি ডেটাবেজ সার্ভার থেকে n সংখ্যক ডেটা নিয়ে আসার জন্য আমাদের অ্যাপ্লিকেশন সার্ভার থেকে একটা রিকোয়েস্ট ইভেন্ট ডেটাবেজ সার্ভারে পাবলিশ করে বের হয়ে চলে এসেছে। যখন ডেটাবেজ সার্ভারের ডেটা রেডি করা কমপ্লিট হবে তখন একটা একটা করে ডেটা রিটার্ন করা শুরু করবে তখন  n সংখ্যক ডাটা  onNext() মেথডের মাধ্যমে স্ট্রিমিং করে একটি একটি করে ডেটা রিটার্ন করবে যখন ডেটা রিটার্ন করা শেষ হয়ে যাবে তখন onComplete() মেথড এর মাধ্যমে জানিয়ে দিবে যেই পরিমাণে ডেটা নেয়ার জন্য রিকোয়েস্ট করেছিলে সবগুলো ডেটা পাঠানো শেষ।

**এখন আমরা একটি এরর সিনারিও দেখব**

![Data types](/assets/img/reactive-vent-driven-error.svg)


উপরের ছবিতে আমরা দেখতে পাচ্ছি ডেটাবেজ থেকে n সংখ্যক ডেটা নিয়ে আসার জন্য আমাদের অ্যাপ্লিকেশন সার্ভার থেকে একটা রিকোয়েস্ট ইভেন্ট ডেটাবেজ সার্ভারে পাবলিশ করে বের হয়ে এসেছে। যখন ডেটাবেজ সার্ভারের ডেটা তৈরি করা কমপ্লিট হবে তখন একটি একটি করে ডেটা রিটার্ন করা শুরু করবে, n সংখ্যক ডেটা  onNext() মেথডের মাধ্যমে স্ট্রিমিং করে রিটার্ন করবে যখন ডেটা রিটার্ন করা শেষ হয়ে যাবে তখন onComplete() মেথড এর মাধ্যমে জানিয়ে দিবে যেই পরিমাণে ডেটা নেয়ার জন্য রিকোয়েস্ট করেছিলে সবগুলো ডেটা পাঠানো শেষ।

ধরুন ডেটাবেজ সার্ভার ডেটা তৈরী করতে গেল, ডেটা তৈরি করতে পারল না বরং এরর রিটার্ন করল, যখন onNext() মেথডের মাধ্যমে স্ট্রিমিং করে ডেটা রিসিভ করতে যাব তখন এক্সেপশন পাবো, এই ক্ষেত্রে স্টিমের ভিতরে যেহেতু এরর পাওয়া গেছে তাই পরবর্তী রিকোয়েস্টগুলো প্রসেস করবে না বরং onError() মেথড এর মাধ্যমে জানিয়ে দিবে যে ভাই এরর পেয়েছি আমি এক্সেপশন থ্র করে দিলাম।

এমন একটা কেস তৈরি হইল যেখানে অ্যাপ্লিকেশন সার্ভার থেকে ডেটা শুধু ডেটাবেজে সেইভ হবে কিন্তু ডেটাবেজ থেকে কিছু রিটার্ন করবে না সে ক্ষেত্রে অ্যাপ্লিকেশন সার্ভার ডেটা সেইভ করার জন্য রিকোয়েস্ট নিয়ে গেল ডেটাবেজ সার্ভার ইমিডিয়েটলি রিকোয়েস্ট টা রিসিভ করে রিপ্লাইয়ে অ্যাপ্লিকেশন সার্ভার কে বলে দিবে ডকুমেন্টস প্রসেস শেষে আমি জানাব এবং আস্তে আস্তে ডেটাগুলোকে ইভেন্টের মাধ্যমে রিড করে সেইভ করতে শুরু করবে যখন ডাটা গুলো সেইভ করা শেষ হয়ে যাবে তখন onComplete() ইভেন্টের মাধ্যমে অ্যাপ্লিকেশনকে জানিয়ে দিবে যে ডেটা সেইভ করা শেষ এখন আমি একটু রেস্ট নেই।

রিএক্টিভ স্ট্রিমের একটা ফিচার হচ্ছে ব্যাক প্রেসার, দেখা গেল যে ডেটাবেজ থেকে প্রচুর পরিমানে  ডেটা আসতেছে কিন্তু অ্যাপ্লিকেশন সার্ভারের এত হিউজ পরিমান   ডেটা স্বল্প সময়ে প্রসেস করার চ্যালেঞ্জিং হয়ে যাচ্ছে এই ক্ষেত্রে অ্যাপ্লিকেশন সার্ভার ব্যাক প্রেসার  এর মাধ্যমে তাকে জানিয়ে দিতে পারে যে আস্তে আস্তে ডাটাগুলো স্ট্রিমে পাঠাও যাতে আমার ডেটা প্রসেস করতে সমস্যা না হয়।

![Data types](/assets/img/reactive-pub-sub.svg)

উপরের ছবিতে দেখতে পাচ্ছি একটি পাবলিশার/সাবস্ক্রাইবার মডেল। এখানে পাবলিশার হচ্ছে ডেটা সোর্স এবং সাবস্ক্রাইবার হচ্ছে ডেটা সোর্স থেকে ডেটা গ্রহণ করে, অর্থাৎ কনজিউমার। প্রথমে সাবস্ক্রাইবার পাবলিশারের সাবস্ক্রাইব মেথড এক্সিকিউট করে এবং সাবস্ক্রাইবারের একটি ইন্সটান্স ইনপুট হিসেবে পাবলিশারের কাছে পাঠিয়ে দেয়, পাবলিশার সাবস্ক্রাইবারের কাছে একটি সাবস্ক্রিপশন অবজেক্ট পাঠিয়ে দেয় এবং বলে দেয় যে সাবস্ক্রিপশন সাকসেসফুল।

সাবস্ক্রিপশন ইন্টারফেসের ভেতরে দুটি মেথড রয়েছে request(long n),  cancel()। এখন সাবস্ক্রাইবার সাবস্ক্রিপশন অবজেক্টের রিকোয়েস্ট মেথড এক্সিকিউট করে বলে দেয় যে কতগুলো ডেটা পাবলিশার থেকে রিড করতে চাচ্ছে, বাই ডিফল্ট রিকোয়েস্ট লিমিট Long.MAX_VALUE সেট করা থাকে, অর্থাৎ যতগুলো ডেটা আছে সবগুলো ডেটা পাঠিয়ে দেয়া সাবস্ক্রাইবার এর কাছে।

ধরুন ডেটা সোর্স এর কাছে একটি রিকোয়েস্টের এগেইনষ্টে n সংখ্যক ডেটা আছে, এখন অন নেক্সট মেথড n সংখ্যক বার কল করার মাধ্যমে স্ট্রিম আকারের একটি একটি করে ডেটা রিটার্ন করবে এবং সর্বশেষ অন কমপ্লিট মেথড কল করে ডাটা ট্রান্সফার সাকসেসফুল জানিয়ে দেয়।

এমন একটা ক্ষেত্র তৈরি হলো যে পাবলিশারের কাছে একটি রিকোয়েস্টের এগেইনষ্টে ২০ টি ডেটা আছে কিন্তু ১৫ তম ডেটা পাওয়ার পরে আর কোন ডেটা প্রসেস করার দরকার নেই সেক্ষেত্রে সাবস্ক্রিপশন ইন্টারফেসের cancel() মেথড কল করার মাধ্যমে আমরা সাবস্ক্রিপশন ক্যন্সেল করে দিতে পারি, তাহলে পাবলিশার নতুন কোন ইভেন্টে সাবস্ক্রাইবারের কাছে পাঠাবে না।

### প্রজেক্ট রিয়েক্টরের চারটি প্রধান ইন্টারফেস হচ্ছে 

1. Publisher 
2. Subscriber 
3. Subscription 
4. Processor 

এই চারটি ইন্টারফেসই স্ট্রিম এর ফ্লো কন্ট্রোল করার জন্য নিজেদের মধ্যে নিজেরা যোগাযোগ রক্ষা করে।

#### Publisher  

পাবলিশার হচ্ছে ডেটা সোর্স যেমন ডেটাবেজ, নেটওয়ার্ক অথবা অন্য কোন ফাইল। সাবস্ক্রাইবার ডেটা সোর্স থেকে ডেটা রিড করে।

```java
package org.reactivestreams;
 
public interface Publisher<T> {
    public void subscribe(Subscriber<? super T> s);
}
```

পাবলিশার ইন্টারফেসের ভিতরে একটি মেথড আছে, নাম হচ্ছে subscribe(Subscriber<? Super T> s)। সাবস্ক্রাইব মেথড সাবসক্রাইবার ইন্সটান্স কল করার মাধ্যমে পাবলিশারের কাছে এই রিকোয়েস্টই রেজিস্ট্রেশন করে এবং পাবলিশার একটি সাবস্ক্রিপশন  ইন্সটান্স সাবসক্রাইবারের কাছে পাঠিয়ে দেয়।

#### Subscriber

সাবস্ক্রাইবার  ইন্টারফেসের চারটি মেথড হচ্ছে 

```java
package org.reactivestreams;
 
public interface Subscriber<T> {
    public void onSubscribe(Subscription s);
    public void onNext(T t);
    public void onError(Throwable t);
    public void onComplete();
}
```

i. onSubscribe() - এই মেথড ডেটা সোর্স থেকে ডেটা পাঠানোর আগে কল হয়। পাবলিশার একটি সাবস্ক্রিপশন  ইন্সটান্স সাবসক্রাইবারের কাছে পাঠিয়ে দেয় onSubscribe(Subscription s) মেথড কল এর মাধ্যমে এবং বলে দেয় যে সাবস্ক্রিপশন সাকসেসফুল এখন বল আমি কত গুলি ডেটা দিব? সাবস্ক্রিপশন  ইন্সটান্স পাঠানোর সময় ডিফল্ট রিকুয়েস্ট লিমিট Long.MAX_VALUE সেট করে দেয়। তার মানে ডেটা সোর্স থেকে রিকুয়েস্ট এর বিপরীতে সব ডেটা দিবে। সাবসক্রাইবার চাইলে ডিফল্ট রিকুয়েস্ট লিমিট ওভাররাইড করে ইচ্ছামত একটা ভ্যালু সেট করে দিয়ে সাবস্ক্রিপশন রিকোয়েস্ট ইভেন্ট পাবলিশারের কাছে পাঠিয়ে দেয়।

ii. onNext() - এই মেথড এর মাধ্যমে ডেটা সোর্স থেকে ডেটাগুলো স্ট্রিমিং করে রিটার্ন করা হয়। যখন পাবলিশারের ডেটা রেডি হয়ে যায় তখন onNext(n) মেথড এর মাধ্যমে একটি একটি করে ডেটা স্ট্রিম আকারে রিটার্ন করা শুরু করে। যতক্ষণ পর্যন্ত n তম ডেটা না পাওয়া যায় onNext() মেথড কল হতে থাকে।

iii. onComplete() - যদি পাবলিশার onNext() এর মাধ্যমে সবগুলো ভ্যালু রিটার্ন করতে সক্ষম হয় সে ক্ষেত্রে তখন onComplete() মেথড কলের মাধ্যমে জানিয়ে দেয় হয়।

iv. onError() - যখন স্ট্রিমিং করে ডেটা পাচ্ছি তখন যদি কোন এরর পাওয়া যায় তখন onError() মাধ্যমে জানিয়ে দেয়া হয়।

#### Subscription

```java
package org.reactivestreams;
 
public interface Subscription {
    public void request(long n);
    public void cancel();
}
```

সাবস্ক্রিপশন ইন্টারফেসের মধ্যে দুটি মেথড আছে একটি রিকোয়েস্ট এবং ক্যান্সেল।

i. request(long n) - রিকোয়েস্ট মাধ্যমে বলে দেয়া যায় যে পাবলিশারের কাছ থেকে আমি কতগুলো ভ্যালু চাচ্ছি.

ii. cancel() - ক্যানসেল মেথড কল করার মাধ্যমে একটা নির্দিষ্ট পরিমাণে ডেটা পাওয়ার পরে সাবস্ক্রিপশন ক্যানসেল রিকোয়েস্ট পাবলিশারের কাছে পাঠানো হয়।

#### Processor

প্রসেসর ইন্টারফেস পাবলিশার এবং সাবস্ক্রাইবার দুইটি ইন্টারফেসকে এক্সটেন্ড করে। প্রসেসরের নিজস্ব মেথড নেই। প্রসেসর নিয়ে অন্য পর্বে বিস্তারিত আলোচনা করব। চলুন একটা উদাহরণ দেখে আসি।

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

এখানে flux হচ্ছে রিএক্টিভ স্ট্রিমস পাবলিশার, যেখানে ডেটা সোর্স থেকে ডেটা আসে যতক্ষণ পর্যন্ত সাবস্ক্রাইব মেথড কল না হচ্ছে ততক্ষণ পর্যন্ত "Flux<String> flux = Flux.just("red", "white", "blue");" এই লাইন রান করবে না। এখানে ডেটা যেকোনো সোর্স থেকে আসতে পারে। flux কে সাবস্ক্রাইবার সাবস্ক্রাইব করতেছে, onNext(String t) মেথড কলের মাধ্যমে সোর্স থেকে একটি একটি ভ্যালু রিড করতেছে এবং যখন সবগুলি ভ্যালু রিড করা শেষ তখন onComplete() ইভেন্ট ট্রিগার হচ্ছে।

চলবে...

### Ref

1. [Notes on Reactive Programming Part I](https://spring.io/blog/2016/06/07/notes-on-reactive-programming-part-i-the-reactive-landscape)
2. [Notes on Reactive Programming Part II](https://spring.io/blog/2016/06/13/notes-on-reactive-programming-part-ii-writing-some-code)

[পুর্বে প্রকাশিত](https://jugbd.org/reactive-programming-with-project-reactor-%e0%a6%b0%e0%a6%bf%e0%a6%8f%e0%a6%95%e0%a6%9f%e0%a6%bf%e0%a6%ad-%e0%a6%aa%e0%a7%8d%e0%a6%b0%e0%a7%8b%e0%a6%97%e0%a7%8d%e0%a6%b0%e0%a6%be%e0%a6%ae%e0%a6%bf-2/)

**আল্লাহ হাফেজ**




