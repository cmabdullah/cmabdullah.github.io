---
layout: post
title: জাভা ফাংশনাল প্রোগ্রামিং পর্ব ৩ (ল্যামডা এক্সপ্রেশন, স্ট্রিম এ পি আই)

[//]: # (description: >)

[//]: # ( Transmission Control Protocol)
sitemap: false
hide_last_modified: true
---

![800x400](/assets/img/function-3.jpeg "Large example image")

একটা কালেকশন থেকে ইটারেশনের মাধ্যমে কিছু ভ্যালু পাওয়া সহজ। ধরুন একটা স্ট্রিং লিস্ট থেকে ছোট হাতের লিখা গুলোকে বড় হাতের লিখায় রূপান্তর করতে বলা হল, তাহলেতো আগের ভ্যালু গুলো হারাতে হবে এবং ইমিউটাবিলিটি নিয়ে প্রশ্ন আসবে যেমন Arrays.asList() মেথড যে ভ্যালু রিটার্ন করে সেগুলি পরিবর্তন করতে পারি না। আমরা ছোট হাতের লিখা গুলোকে বড় হাতের লিখায় রূপান্তর করে নতুন একটা লিস্টে রাখার মাধ্যমে এই সমস্যার সমাধান করতে পারি।

উদাহরণঃ

```java
import java.util.*;
public class _01TransformingAList {
    public static void main(String[] args) {
        final List<String> friends = Arrays.asList("Munib", "Evan", "Rafi", "Imtiaz", "Maliha", "Abida");
        final List<String> uppercaseNames = new ArrayList<String>();
        for(String name : friends) {
            uppercaseNames.add(name.toUpperCase());
        }
        System.out.println(uppercaseNames);
    }//result [MUNIB, EVAN, RAFI, IMTIAZ, MALIHA, ABIDA]
}
```

এখানে কি হচ্ছে? নতুন একটা খালি লিস্ট নিয়েছি, ইটারেশনের সময় ভ্যালু গুলোকে বড় হাতের লিখায় রূপান্তর করে খালি লিস্টে পাঠিয়ে দিলাম।
এখন আমরা ধীরে ধীরে ফাংশনাল পদ্ধতিতে প্রোগ্রাম লিখার দিকে আগাব, for লুপের পরিবর্তে forEach ব্যবহার করব।

```java
import java.util.*;
public class _02TransformingAListUsingLambda {
    public static void main(String[] args) {
        final List<String> friends = Arrays.asList("Munib", "Evan", "Rafi", "Imtiaz", "Maliha", "Abida");
        final List<String> uppercaseNames = new ArrayList<String>();
        friends.forEach(name -> uppercaseNames.add(name.toUpperCase()));
        System.out.println(uppercaseNames);
    }//result [MUNIB, EVAN, RAFI, IMTIAZ, MALIHA, ABIDA]
}
```
এখানে আমরা ইন্টারনাল ইটারেশন ব্যবহার করলাম, কিন্তু এখন আমাদের একটা খালি লিস্ট রাখা লাগতেছে, এখন stream() মেথড ব্যবহার করে এই সমস্যার সমাধান করবো।

```java
import java.util.*;
public class _03TransformingAListUsingLambdaAndStream {
    public static void main(String[] args) {
        final List<String> friends = Arrays.asList("Munib", "Evan", "Rafi", "Imtiaz", "Maliha", "Abida");
        friends
                .stream()
                .map(name -> name.toUpperCase())
                .forEach(name -> System.out.print(name + " "));
    }//reslut MUNIB EVAN RAFI IMTIAZ MALIHA ABIDA
}
```
stream() মেথড JDK 8 ও পরবর্তী সংস্করণ গুলোতে আছে, stream কি? ধরুন আমরা কোন একটা ভিডিও লাইভ দেখতেছি , আমাকে কিন্তু ভিডিওটার একটা নির্দিষ্ট অংশ দেখানো হচ্ছে পুরা ভিডিওটা ডাউনলোড করতে হচ্ছে না, কিংবা মুল ভিডিওর কোন পরিবর্তন হচ্ছে না , শুধু মুল ভিডিওর একটা কপি আমাকে দেওয়া হচ্ছে এটাই stream এর সংক্ষিপ্ত ধারনা।


![800x400](/assets/img/function-3.1.jpeg "Large example image")

এখানে stream() কালেকশন অবজেক্টের একটা ইন্সটান্স নেয় , map() মেথড একটা ল্যামডা এক্সপ্রেশন প্যারামিটার হিসেবে নেয় এক্সপ্রেশনকে রান করে এবং ফলাফল কালেকশন অবজেক্ট রিটার্ন করে, অবশেষে forEach() মেথডের মাধ্যমে ফলাফল প্রিন্ট করে। map() মেথড যতগুলি ভ্যালু নিবে ঠিক ততগুলি ভ্যালু রিটার্ন করে, map() মেথড কোন একটা কালেকশন থেকে ডাটা রিড করে ডাটাকে বিভিন্নভাবে পরিবর্তন করে আউটপুট বের করার জন্য কাজে লাগে, এক্ষেত্রে ইনপুট ডাটাটাইপ ও আউটপুট ডাটাটাইপ সমান না ও থাকতে পারে।

উদাহরণঃ

```java
import java.util.*;
public class _04TransformingAListUsingLambdaAndStreamInputOutputType {
    public static void main(String[] args) {
        final List<String> friends = Arrays.asList("Munib", "Evan", "Rafi", "Imtiaz", "Maliha", "Abida");
        friends.stream()
                .map(name -> name.length())
                .forEach(count -> System.out.print(count + " "));
    }//result 5 4 4 6 6 5
}
```
এই প্রোগ্রামটিতে কোন মিউটেশন নেই এবং অনেক বেশি সংক্ষিপ্ত, আলাদা করে কোন কালেকশন বা কোন ভ্যারিয়াবল নেওয়া লাগেনি।

আমরা মেথড রেফারেন্স ব্যবহার করে প্রোগ্রামটি আর সংক্ষিপ্ত করতে পারি।

```java
import java.util.*;
public class _05TransformingAListUsingLambdaUsingMethodReferences {
    public static void main(String[] args) {
        final List<String> friends = Arrays.asList("Munib", "Evan", "Rafi", "Imtiaz", "Maliha", "Abida");
        friends.stream().map(String::toUpperCase).forEach(name -> System.out.print(name + " "));
    }//result MUNIB EVAN RAFI IMTIAZ MALIHA ABIDA
}
```
জাভা কম্পাইলার কোন একটা মেথডের মধ্যে ল্যামডা এক্সপ্রেশন অথবা মেথড রেফারেন্স নিতে পারে যে মেথডকে কোন ফাংশনাল ইন্টারফেস ইমপ্লিমেন্ট করে। তাই name -> name.toUpperCase() ল্যামডা এক্সপ্রেশনকে String::toUpperCase মেথড রেফারেন্সে পরিবর্তন করতে পারি। মেথড রেফারেন্সের কয়েকটা ভাগ আছে এটা হচ্ছে ইন্সটান্স মেথড রেফারেন্স, আসুন দেখি ভেতরে কি হচ্ছে map() মেথডের ভিতর String ক্লাসের মেথড toUpperCase কে মেথড রেফারেন্স হিসেবে পাঠানো হচ্ছে। আজ এতটুকুই পরবর্তী পর্বে মেথড রেফারেন্স নিয়ে লিখব ইনশাআল্লাহ।

[পুর্বে প্রকাশিত](https://medium.com/@cmabdullah/%E0%A6%9C%E0%A6%BE%E0%A6%AD%E0%A6%BE-%E0%A6%AB%E0%A6%BE%E0%A6%82%E0%A6%B6%E0%A6%A8%E0%A6%BE%E0%A6%B2-%E0%A6%AA%E0%A7%8D%E0%A6%B0%E0%A7%87%E0%A6%BE%E0%A6%97%E0%A7%8D%E0%A6%B0%E0%A6%BE%E0%A6%AE%E0%A6%BF%E0%A6%82-%E0%A6%AA%E0%A6%B0%E0%A7%8D%E0%A6%AC-%E0%A7%A9-%E0%A6%B2%E0%A7%8D%E0%A6%AF%E0%A6%BE%E0%A6%AE%E0%A6%A1%E0%A6%BE-%E0%A6%8F%E0%A6%95%E0%A7%8D%E0%A6%B8%E0%A6%AA%E0%A7%8D%E0%A6%B0%E0%A7%87%E0%A6%B6%E0%A6%A8-%E0%A6%B8%E0%A7%8D%E0%A6%9F%E0%A7%8D%E0%A6%B0%E0%A6%BF%E0%A6%AE-%E0%A6%8F-%E0%A6%AA%E0%A6%BF-%E0%A6%86%E0%A6%87-61a3890b13b5)
