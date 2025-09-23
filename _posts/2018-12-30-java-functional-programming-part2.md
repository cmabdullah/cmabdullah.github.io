---
title: জাভা ফাংশনাল প্রোগ্রামিং পর্ব ২ (কালেকশন এ পি আই)
header:
  image: /assets/img/function-2.jpeg
  teaser: /assets/img/function-2.jpeg
categories:
  - Machine Learning
  - Data Science
tags:
  - linear regression
  - machine learning
  - mathematics
  - statistics
---
আমরা বিভিন্ন ধরনের নাম্বার, স্ট্রিং অথবা অবজেক্টের কালেকশন ব্যবহার করি। সাধারনত আমরা ইম্পারেটিভ পদ্ধতিতে প্রোগ্রাম লিখে থাকি যেখানে অনেক বেশি কোড লিখতে হয় কালেকশনের নাম্বার গুলো ব্যবহার করার জন্য এবং এ পদ্ধতিতে ভুল হওয়ার প্রবণতা বেশি থাকে। আমরা দেখব ফাংশনাল প্রোগ্রামিং এর মাধ্যমে কিভাবে সংক্ষিপ্ত, স্পষ্ট ও সুন্দর প্রোগ্রাম লিখতে পারি।

আমরা খুব সহজে ইমিউটেবল কালেকশন অবজেক্ট তৈরি করতে পারি।

উদাহরনঃ

```java
import java.util.*;
public class Collection {
    public static void main(String[] args) {
        final List<String> friends = Arrays.asList("Munib", "Evan", "Rafi", "Imtiaz", "Maliha", "Abida");
        for(int i = 0; i < friends.size(); i++) {
            System.out.println(friends.get(i));
        }
    }
}
```

আমরা সাধারণত এভাবে প্রোগ্রাম লিখে থাকি, এবং লিস্ট থেকে ভ্যালু গুলো ইটারেশনের মাধ্যমে প্রিন্ট করি। এই পদ্ধতি অনেক বেশি শব্দবহুল এবং ভুল হওয়ার প্রবণতা অনেক বেশি থাকে। এই পদ্ধতিতে প্রোগ্রাম লিখা তখনই দরকার যদি আমাদের একটা নির্দিষ্ট ইনডেক্স এর ডাটা নিয়ে কাজ করার প্রয়োজন হয়। উপরের প্রোগ্রামকে আরও সংক্ষিপ্ত করে লিখতে পারি 
এভাবেঃ

```java
import java.util.*;
public class Collection2 {
    public static void main(String[] args) {
        final List<String> friends = Arrays.asList("Munib", "Evan", "Rafi", "Imtiaz", "Maliha", "Abida");
        for(String name : friends) {
            System.out.println(name);
        }
    }
}
```
আমরা দুই ভাবে এক্সটারনাল ইটারেশন দেখলাম, প্রথম প্রোগ্রামে আমাদের ধরে ধরে ধরে বলে দিতে হচ্ছে কোথা থেকে প্রোগ্রাম শুরু হবে এবং কোথায় শেষ হবে দ্বিতীয় প্রোগ্রামে break এবং continue কী ওয়ার্ড এর মাধ্যমে ইটারেশনের ফ্ল নিয়ন্ত্রণ করতে হচ্ছে। দ্বিতীয় পদ্ধতিতে একটু কম লাইন লিখতে হচ্ছে, কিন্তু দুই পদ্ধতিই ইম্পারেটিভ।

ইম্পারেটিভ পদ্ধতিতে প্রোগ্রাম লিখতে কিছু সমস্যা হওয়া ও কিছু সীমাবদ্ধতা থাকার কারণে ফাংশনাল পদ্ধতিতে প্রোগ্রাম লিখা হয়। সীমাবদ্ধতা সমূহ নিচেঃ

১। লুপকে প্যারালালাইজ করা অনেক কঠিন।

২। এ ধরনের লুপ নন-পলিমরফিকঃ লুপের ভেতর থেকে আমরা যেটা চাই সেটাই পাই, আমরা লুপের ভেতর একটা কালেকশন অবজেক্ট পাঠাই কোন একটা মেথডকে রান করার পরিবর্তে।

৩। “Tell, don’t ask” প্রিন্সিপাল অনুসরণ করে, আমাদেরকে ইটারেশনের মধ্যে শর্ত গুলো ধরে ধরে বলে দিতে হয়।

আমরা চাইলে পুরাতন ইম্পারেটিভ পদ্ধতি তে প্রোগ্রাম লিখার পরিবর্তে ফাংশনাল পদ্ধতিতে প্রোগ্রাম লিখতে পারি, উদাহরণঃ আমরা একটা কালেকশন থেকে কিছু ডাটা প্রসেস করতে চাচ্ছি, ডাটা ফাংশন কিভাবে প্রসেস করবে সেটা জানার বিষয় না কি রেজাল্ট দিচ্ছে সেটাই প্রধান লক্ষ।

জাভা ৮ এ ইটারেবল ইন্টারফেসে নতুন একটা মেথড যুক্ত করে forEach(). যেটি Consumer টাইপের একটা ইন্সটান্স নেয় যেটি accept() মেথডের মাধ্যমে ডাটা রিড করে।

উদাহরণঃ

```java
import java.util.*;
import java.util.function.Consumer;
public class Collection3 {
    public static void main(String[] args) {
        final List<String> friends = Arrays.asList("Munib", "Evan", "Rafi", "Imtiaz", "Maliha", "Abida");
        friends.forEach(new Consumer<String>() {
            public void accept(final String name) {
                System.out.println(name);
            }
        });
    }
}
```

যখন friend কালেকশনের forEach() রান করবে তখন একটা ইন্সটান্স Consumer ক্লাসে প্রবেশ করে accept() মেথড রান করে এবং কালেকশনের ভ্যালু প্রিন্ট করে।

আমরা কি পরিবর্তন করলাম? পুরাতন for() লুপ থেকে বের হয়ে forEach() লুপে এলাম, ফলাফল কিভাবে ইটারেট করছে সেটার পরিবর্তে কি ইটারেট করতেছে সেইদিকে মনোযোগ দিতে পারতেছি। কিন্তু এই পদ্ধতি ও অনেক বেশি ভার্বোস(শব্দবহুল)। সমস্যা নেই আমরা ল্যামডা এক্সপ্রেশন ব্যবহার করতে পারি, প্রোগ্রামে একটু পরিবর্তন আনি, ইনার ক্লাসের পরিবর্তে ল্যামডা এক্সপ্রেশন ব্যবহার করতে পারি।

```java
import java.util.*;
public class Collection4 {
    public static void main(String[] args) {
        final List<String> friends = Arrays.asList("Munib", "Evan", "Rafi", "Imtiaz", "Maliha", "Abida");
        friends.forEach((final String name) -> System.out.println(name));
    }
}
```
এই প্রোগ্রামটা আরও অনেক বেশি সুন্দর ও সহজ। অনেক সহজ তাই না? একটু গভীর ভাবে লক্ষ করি দেখতে পাবো forEach() higher-order function হিসেবে কাজ করতেছে এবং ল্যামডা এক্সপ্রেশনকে ভ্যালু হিসেবে নিচ্ছে এবং লিস্ট থেকে উপাদান গুলো প্রিন্ট করতেছে। এই প্রোগ্রামটি আগের প্রোগ্রাম গুলোর অউটপুট দিবে। আমরা চাইলে প্রোগ্রামটি আরেকটু ছোট করতে পারি। ল্যামডা এক্সপ্রেশনে প্যারামিটারটি ব্রাকেটের ভিতরে থাকে যেখানে ডাটা টাইপ বলেদিতে হয়,যেহেতু ডাটা টাইপ এক ধরনের সেহেতু ডাটা টাইপ ও মুছে দিতে পারি।

```java
import java.util.*;
public class Collection6 {
    public static void main(String[] args) {
        final List<String> friends = Arrays.asList("Munib", "Evan", "Rafi", "Imtiaz", "Maliha", "Abida");
        friends.forEach(name -> System.out.println(name));
    }
}
```
আমরা চাইলে ব্রাকেট ও মুছে দিতে পারি।
Main.java

```java
import java.util.*;
public class Collection6 {
    public static void main(String[] args) {
        final List<String> friends = Arrays.asList("Munib", "Evan", "Rafi", "Imtiaz", "Maliha", "Abida");
        friends.forEach(name -> System.out.println(name));
    }
}
```

আমরা আগের উদাহরণ গুলতে প্যারামিটারের টাইপ বলে দিয়েছি এবং প্যারামিটাকে ফাইনাল করে দিয়েছি, যেটি ল্যামডা এক্সপ্রেশনের মধ্যে ভ্যালু পরিবর্তন করতে দিচ্ছে না। সাধারণত প্যারামিটারের ভ্যালু পরিবর্তন করা ঠিক না(প্রোগ্রামে সাইড ইফেক্টস হয়) তাই ফাইনাল করে দেওয়াটা উত্তম।

এখন আমরা প্রোগ্রামটিকে আরও ছোট করতে পারি।
```java
import java.util.*;
public class Collection7 {
    public static void main(String[] args) {
        final List<String> friends = Arrays.asList("Munib", "Evan", "Rafi", "Imtiaz", "Maliha", "Abida");
        friends.forEach(System.out::println);
    }
}
```

এখানে আমরা মেথড রেফারেন্স ব্যবহার করেছি। জাভা প্রোগ্রামের বডিকে মেথডের নাম দিয়ে রিপ্লেস করে দিছে। স্যার এন্টইন ডি সেন্ট-এক্সপেরি একটা উক্তি আছে “Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away.” পরবর্তী পর্ব গুলোতে দেখব কিভাবে ল্যামডা এক্সপ্রেশনের মাধ্যমে মিউটিবিলিটি দুর করা যায়।

[পুর্বে প্রকাশিত](https://medium.com/@cmabdullah/%E0%A6%9C%E0%A6%BE%E0%A6%AD%E0%A6%BE-%E0%A6%AB%E0%A6%BE%E0%A6%82%E0%A6%B6%E0%A6%A8%E0%A6%BE%E0%A6%B2-%E0%A6%AA%E0%A7%8D%E0%A6%B0%E0%A7%8B%E0%A6%97%E0%A7%8D%E0%A6%B0%E0%A6%BE%E0%A6%AE%E0%A6%BF%E0%A6%82-%E0%A6%AA%E0%A6%B0%E0%A7%8D%E0%A6%AC-%E0%A7%A8-%E0%A6%95%E0%A6%BE%E0%A6%B2%E0%A7%87%E0%A6%95%E0%A6%B6%E0%A6%A8-%E0%A6%8F-%E0%A6%AA%E0%A6%BF-%E0%A6%86%E0%A6%87-ca42ebc1a8d7)