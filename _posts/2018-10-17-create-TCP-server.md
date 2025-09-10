---
layout: post
title: খুব সহজেই বানিয়ে ফেলুন TCP সার্ভার

[//]: # (description: >)

[//]: # ( Transmission Control Protocol)
sitemap: false
hide_last_modified: true
---

![800x400](/assets/img/img.png "Large example image")

জাভা একটি প্রিমিয়ার ল্যাঙ্গুয়েজ নেটওয়ার্ক প্রোগ্রামিং এর জন্য। সকেট প্রোগ্রামিং এর মধ্যে অন্যতম। বিশেষ করে যারা ক্লায়েন্ট সার্ভার বেসড এপ্লিকেশন কাজ করেন।

import java.net.*; প্যাকেজ কিছু class এবং interface সরবরাহ করে নেটওয়ার্কিং সংক্রান্ত প্রোগ্রাম লিখার জন্য। TCP/IP সকেট এর মাধ্যমে প্রোগ্রামার অন্য নেটওয়ার্ক এর সাথে যোগাযোগ করতে পারে।

এখন আসি সকেট কি ? ক্লায়েন্ট সার্ভার যোগাযোগ রক্ষার জন্য ক্লায়েন্ট এর একটা end point থাকে, সার্ভার এর একটা end point থাকে। সকেট হচ্ছে একটা end point দুইটা ক্লায়েন্ট সার্ভার যোগাযোগ মাধ্যমের। সকেট কে একটা পোর্ট নাম্বার দিয়ে বাউন্ড করতে হয়। যাতে TCP লেয়ার প্রোগ্রাম কে বুঝতে পারে,।

সকেটের বৈশিষ্ট্য

১ রিমোট সার্ভারের সাথে যোগাযোগ স্থাপন করে।

২ তথ্য পাঠাতে পারে।

৩ তথ্য গ্রোহন করে।

৪ রিমোট সার্ভারের সাথে যোগাযোগ বিচ্ছিন্ন করে।

৫ নতুন একটা পোর্ট এর সাথে বাইন্ড করে।

৬ রিমোট সার্ভার থেকে ইনকামিং ডাটা লিসেন করে।

৭ পোর্ট বাইন্ড এর মাধ্যমে রিমোট সার্ভারের সাথে যোগাযোগ রক্ষা করে।

ServerSocket server = new ServerSocket(8081);

ServerSocket অবজেক্ট ৮০৮১ পোর্ট এর মাধ্যমে রিমোট সার্ভার এর সাথে যোগাযোগ স্থাপন করে, এবং InputStream/OutputStream এর মাধ্যমে তথ্য আদান প্রদান করে। এ ধরনের কানেকশন সাধারণত ফুল ডুপ্লেক্স হয়ে থাকে।

এখন আমরা ক্লায়েন্ট এর জন্য একটা মেসেজ প্রিন্ট করে নেই।।

System.out.println(“waiting for clients….”);

Socket socket = serverSocket.accept();

accept() মেথড রিটার্ন করে সকেট অবজেক্ট যেটি আমরা ব্যবহার করবো ক্লায়েন্টের কাছে ডাটা পরিবহনের জন্য। accept() সার্ভারকে ব্লক করে রাখে যথক্ষন পর্যন্ত ক্লায়েন্ট থেকে কোনো রিকুয়েস্ট না পায়। যখন ক্লায়েন্ট সার্ভারের সাথে কানেক্টেড হয় তখন accept() মেথড রিটার্ন করে সকেট অবজেক্ট তারপর পরবর্তী লাইন রান করে,

যেহেতু আমরা ক্লায়েন্ট কে একটা ছোটো মেসেজ পাঠাব তাই আমরা PrintWriter ব্যবহার করতে পারি

PrintWriter out = new PrintWriter(socket.getOutputStream(),true);//write message

আমরা ক্লায়েন্টকে কি মেসেজ পাঠাব তাই লিখে ফেলি

out.println(“Hello client!”);

এখন আমরা ক্লায়েন্টের থেকে কিছু ডাটা রিড করব। এজন্য আমরা BufferedReader ব্যবহার করতে পারি কারন আমরা একটা মেসেজ পড়তে যাচ্ছি ক্লায়েন্টের থেকে।।

BufferedReader input = new BufferedReader(new InputStreamReader(socket.getInputStream()));//read message….

এখন আমরা Input অবজেক্ট রিড করতে পারব ক্লায়েন্ট থেকে(একটা ফাইল থেকে ডাটা রিড করা এবং একটা সকেট থেকে ডাটা রিড করা অনেকটা একই রকম)

String clientInput = input.readLine();

এখন আমরা মেসেজটা প্রিন্ট করে দিতে পারি

System.out.println(clientInput);

এখন আমরা যেই কানেকশন গুলো ওপেন করেছিলাম সেইগুলো ক্লোজ করে দেই

input.close();

out.close();

socket.close();

serverSocket.close();

সম্পূর্ণ কোড এখানে

```java
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.ServerSocket;
import java.net.Socket;

public class App {
	public static void main(String[] args) throws IOException {
		ServerSocket serverSocket = new ServerSocket(8081);// bind with this port number....
		System.out.println("witing for clients....");
		Socket socket = serverSocket.accept();
		PrintWriter out = new PrintWriter(socket.getOutputStream(), true);// write message
		out.println("Hello client!");
		BufferedReader input = new BufferedReader(new InputStreamReader(socket.getInputStream()));// read message....
		String clientInput = input.readLine();
		System.out.println(clientInput);
		input.close();
		out.close();
		socket.close();
		serverSocket.close();
	}
}
```

এখন আমাদের একজন ক্লায়েন্ট দরকার, আমরা operating systen এর telnet ক্লায়েন্ট ব্যবহার করতে পারি , আমরা telnet কানেকশন terminal এর মাধ্যমে ওপেন করতে পারি. মেশিনে ইন্সটল না থাকলে করে নিবো।

![800x400](/assets/img/img_1.png "Large example image")

আমরা মেশিনে telnet আছে কিনা নিশ্চিত হই

![800x400](/assets/img/img_2.png "Large example image")
প্রোগ্রামটা রান করি
![800x400](/assets/img/img_3.png "Large example image")

Localhost এর 8081 পোর্টে telnet ক্লায়েন্ট সার্ভার রান করি, আমরা দেখতে পাব এপ্লিকেশন সার্ভার থেকে Hello client! মেসেজ রিড করবে। এখন আমরা যদি একটা মেসেজ রাইট করি hello server i am back তবে আমরা এপ্লিকেশন সার্ভারের console এ দেখতে পাব।

![800x400](/assets/img/img_4.png "Large example image")


অবশেষে আমরা আমাদের সার্ভার বানিয়ে ফেলেছি, পরবর্তীতে আমরা দেখব কিভাবে non blocking I/O সার্ভার বানাবো।

[পুর্বে প্রকাশিত](https://medium.com/@cmabdullah/%E0%A6%96%E0%A7%81%E0%A6%AC-%E0%A6%B8%E0%A6%B9%E0%A6%9C%E0%A7%87%E0%A6%87-%E0%A6%AC%E0%A6%BE%E0%A6%A8%E0%A6%BF%E0%A7%9F%E0%A7%87-%E0%A6%AB%E0%A7%87%E0%A6%B2%E0%A7%81%E0%A6%A8-tcp-%E0%A6%B8%E0%A6%BE%E0%A6%B0%E0%A7%8D%E0%A6%AD%E0%A6%BE%E0%A6%B0-da7e3fd8ecb9)