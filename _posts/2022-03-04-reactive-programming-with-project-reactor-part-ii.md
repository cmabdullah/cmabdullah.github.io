---

image: '/assets/img/consumerization_article_006.jpeg'

---
## প্রজেক্ট রিয়েক্টর দ্বিতীয় পর্ব।
জাভা স্ট্রিমস এবং রিএক্টিভ স্ট্রিমস এর মধ্যে অনেকটা মিল রয়েছে আবার কিছু পার্থক্য রয়েছে আসুন আমরা এখন জাভা স্ট্রিমস এবং রিএকটিভ স্ট্রিমস এর মধ্যে পার্থক্য দেখব।

ধরুন একটা উপাদানের লিস্ট ইটারেট করে আমাদের কিছু ভ্যালু প্রিন্ট করতে হবে সে ক্ষেত্রে আমরা স্ট্রিম এপিআই ব্যবহার করতে পারি, খেয়াল করুন আমরা যে লিস্ট ইটারেট করতে যাচ্ছি সেটাতে ফিনিট সেট অফ ডাটা আছে। অলরেডি লিস্ট এর সাইজ ফিক্সট, তার মানে বোঝা গেল আমরা নির্দিষ্ট সংখ্যক ডেটার উপর ইটারেট করতেছি।

সেহেতু লিস্ট থেকে একটি একটি করে উপাদান আসবে এবং উপাদানগুলোকে মডিফাই করব সুতরাং বলা যায় জাভা স্ট্রিমস বাই ডিফল্ট সিনক্রোনাস।

 রিএক্টিভ স্ট্রিমস এর বিহেভিয়ার কিছুটা আলাদা, এর মাধ্যমে ইনফিনিট ডাটা সেট অ্যাসিনক্রোনাসলি প্রসেস করা যায়, রিয়েল টাইম ডেটা যখনই স্ট্রিমসে এভেইলেবল হয় তখন ব্যাক প্রেসার এর মাধ্যমে সাবস্ক্রাইবারকে জানিয়ে দেয়।

জাভা ৮ এর প্রধান ফিচার গুলোর মধ্যে দুটি ফিচার হচ্ছে  স্ট্রিমস এপিআই এবং অপশনাল।

Streams<Integer> API: আমরা স্ট্রিমস পাইপ লাইন ব্যবহার করে ০ থেকে N সংখ্যক উপাদান বিভিন্ন ধরনের ফিল্টারের মডিফাই করে আবার টার্মিনাল অপারেশনের মাধ্যমে কোন একটা লিস্ট অথবা ম্যাপে জমা করতে পারি। তারমানে একের অধিক উপাদান প্রসেস করা সম্ভব।


চলুন একটু উদাহরণ দেখে আসি একটি ইন্টিজার স্ট্রিমস থেকে ফিল্টার করে একটি লিস্ট তৈরি করব।

```java
public static void main(String[] args) {
  var integerStreams = Stream.of(10, 20, 25, 30, 35, 40);
  var filteredIntegerList = integerStreams.filter(n -> n % 2 == 0).collect(Collectors.toList());
  filteredIntegerList.forEach(System.out::println);
}
```

যেহেতু ইন্টিজার স্ট্রিমসকে ব্যবহার করে filteredIntegerList  তৈরি করে ফেলেছি, এখন যদি দ্বিতীয়বার ব্যবহার করতে চাই সেক্ষেত্রে IllegalStateException: খাবে.

```java
public static void main(String[] args) {
  var integerStreams = Stream.of(10, 20, 25, 30, 35, 40);
  var filteredIntegerList = integerStreams.filter(n -> n % 2 == 0).collect(Collectors.toList());
  filteredIntegerList.forEach(System.out::println);
 
  integerStreams.filter(n -> n % 2 == 1).forEach(System.out::println);
}

```
output
![Data types](/assets/img/reactive-2-1-1.png)

Optional<Integer> API: অপশনাল অনেকটা স্ট্রিমস এপিআই এর মতই কিন্তু অপশনালে 0 অথবা একটি থাকা সম্ভব।

```java
public static void main(String[] args) {

  Optional<Integer> optionalInteger = Stream.of(10, 20, 40).findFirst();
  Optional<Integer> optionalEmptyInteger = Stream.of(10, 20, 40).filter(n -> n % 2 == 1).findFirst();
  optionalInteger.ifPresent(System.out::println);
  optionalEmptyInteger.ifPresent(System.out::println);
}

```

optionalInteger  এ স্ট্রিমস এর প্রথম উপাদান ১০ পাওয়া যাবে, অন্যদিকে optionalEmptyInteger এ স্ট্রিমস ইটারেট করে কোন বিজোড় সংখ্যা না পাওয়ায় খালি থেকে যাবে।

Mono<Integer> অনেকটা Optional<Integer> এর মত বাট যখন ডেটা সোর্স থেকে একটি ডেটা ইমিট করবে তখন ডেটা রিটার্ন করবে এবং onComplete() মেথড কল করে বের হয়ে আসবে যদি ডেটা সোর্স এরর  আসে তখন  onError() মেথড কল করে জানিয়ে দিবে ডেটা সোর্স থেকে ডেটা পাওয়া যায়নি ডেটার পরিবর্তে এরর পাওয়া গেছে।

মনো হচ্ছে রিয়াক্টিভ স্ট্রিমস থেকে পাওয়া সিঙ্গেল ইউনিট।

মনো কয়েক ভাবে তৈরি করা যায় 
1. Mono.just(2021)
2. Mono.defer(supplier)
3. Mono.create()
4. Mono.fromCallable(() -> 1)
5. Mono.fromSupplier(() -> "a");
6. Mono.fromFuture(supplier)

Mono.just() এর মাধ্যমে আমরা মনোর একটি সিঙ্গেল ইউনিট তৈরি করতে পারি, যখন সাবস্ক্রাইবার সাবস্ক্রাইব করবে তখন মনোর ভিতরের ইন্টিজার ভ্যালুটি প্রিন্ট করবে। Mono.just() হচ্ছে এগার পাবলিশার, কেউ সাবস্কারাইব করুক আর না করুক স্ট্রিমসে ভ্যালু পাবলিশ করে বসে থাকে।


```java
   public static void main(String[] args) {
     Mono<Integer> integerMono = Mono.just(2021).log();
     integerMono.subscribe(System.out::println);
  }

```

output
![Data types](/assets/img/reactive-2-1-2.png)


Mono.defer()  এর মাধ্যমেও আমরা মনো তৈরি করতে পারি, যখন সাবস্ক্রাইবার সাবস্ক্রাইব করবে তখন মনোর ভিতরের ভ্যালুটি প্রিন্ট করবে। Mono.defer(supplierMono) ল্যাযি পাবলিশার, Mono.defer()  তখনি একজিকিঊট করবে যখন কেউ সাবস্কারাইব করবে। Mono.defer() সর্বদা সাপ্পলায়ার গ্রহণ করে, সাপ্পলায়ার ভ্যলিড ভ্যালু অথবা এররর রিটার্ন করবে।



```java
@Test
public void defer(){
  Supplier<Mono<String>> supplierMono = () -> Mono.just("Hello");
  Mono<String> deferMono = Mono.defer(supplierMono).log();
  deferMono.subscribe(System.out::println);
}

```

Mono.create() মনো তৈরি করার সবচেয়ে এডভান্স মেথড, এটির মাধ্যমে অন্য কোন ডেটা সোর্স থেকে ঈমিট করা ভ্যালুকে পুর্ন কন্ট্রোল করার সুভিধা দেয়। প্রথম সোর্স থেকে পাওয়া ডেটার উপর ভিত্তি করে  MonoSink.success(value), MonoSink.error(throwable) মেথডের মাধ্যমে সাকসেস অথবা এররর মনো তৈরি করতে পারি।

![Data types](/assets/img/reactive-2-1-3.svg)

```java
@Test
public void create() {
  String sendMessage = "Привет мир";
  Consumer<MonoSink<String>> callback = (MonoSink<String> sink) -> {
     if (isValidEncoded(sendMessage)) {
        sink.success(sendMessage);
     } else {
        sink.error(new RuntimeException("Encoding failed"));
     }
  };
  Mono<String> createMono = Mono.create(callback);
  createMono.subscribe(System.out::println);
}

private boolean isValidEncoded(String message){
  byte[] bytes = message.getBytes(StandardCharsets.UTF_8);
  String asciiEncodedString = new String(bytes, StandardCharsets.US_ASCII);
  return message.equals(asciiEncodedString);
}

```

Mono.fromCallable(() -> "Hello") মাধ্যমে কোন Callable থ্রেডের রেসপন্স থেকে মনো তৈরি করতে পারি।


```java
@Test
public void fromCallable() {
  Callable<String> stringCallable =  () -> "Hello";
  Mono<String> callableMono = Mono.fromCallable(stringCallable);
  callableMono.subscribe(System.out::println);
}

```

Mono.fromSupplier(() -> "Hello") মেথড কল করে কোন Supplier থেকে মনো তৈরি করতে পারি।

```java
@Test
public void fromSupplier() {
  Supplier<String> supplier =  () -> "Hello";
  Mono<String> supplierMono = Mono.fromSupplier(supplier);
  supplierMono.subscribe(System.out::println);
}

```

Mono.fromFuture(supplier) মেথড Supplier গ্রহণ করে, Supplier এর রিটার্ন টাইপ অবশ্যই CompletableFuture টাইপের হতে হবে।

```java
@Test
public void fromFuture1() {
  Supplier<CompletableFuture<String>> supplier =  () -> CompletableFuture.completedFuture("hello");
  Mono.fromFuture(supplier).subscribe(System.out::println);
}

```

Mono.fromFuture(completableFuture) মেথড সরাসরি CompletableFuture এর ইন্সটান্স ও পাঠানো যায়  মনো তৈরি করার জন্য।


```java
@Test
public void fromFuture2() {
  CompletableFuture<String> completableFuture = CompletableFuture.supplyAsync( () -> "Hello");
  Mono.fromFuture(completableFuture).subscribe(System.out::println);
}

```

ফ্লাক্স হচ্ছে রিয়াক্টিভ স্ট্রিমস থেকে পাওয়া মাল্টিপল ইউনিট। ফ্লাক্স শূন্য থেকে n সংখ্যক উপাদান ইমিট করতে পারে, ফ্লাক্স পাইপলাইন সম্পূর্ণ এসিনক্রোনাসলি ডেটা সার্ভ করে, অন্যদিকে জাভা স্ট্রিম পাইপলাইন সিনক্রোনাস।ফ্লাক্স হচ্ছে রিয়াক্টিভ স্ট্রিমস পাইপলাইন থেকে 50 থেকে 100 উপাদান(ফিনিট সংখ্যক) ইমিট করার পরিবর্তে এই পাইপলাইন থেকে যেই উপাদানগুলো পাওয়া যায় সেগুলো হচ্ছে রিয়াল টাইম ডেটা(ক্রিকেটে খেলার স্কোর)।

ফ্লাক্স কয়েক ভাবে তৈরি করা যায় 
1. Flux.just("Time ", "for ", "fun");
2. Flux.fromArray(new String[]{"Time ", "for ", "fun"});
3. Flux.fromStream(Stream.of("Time ", "for ", "fun"));
4. ​​Flux.create((FluxSink<Integer> fluxSink))
5. Flux<T> defer(Supplier<? extends Publisher<T>> supplier)
6. Flux<O> zip(Publisher<? extends T1> source1,
                                    Publisher<? extends T2> source2,
                                    BiFunction<? super T1,? super T2,? extends O> combinator)


1.আমরা খুব সহজেই Flux.just() ব্যবহার করে ফ্লাক্স স্ট্রিমস তৈরি করতে পারি, ডেটা সোর্সে যখন ডেটা অথবা এররর আসবে তখন subscribe() মেথড ইমিটেড উপাদান গ্রহণ করবে। 


```java
@Test
public void fluxJust() {
  Flux<String> justFlux = Flux.just("Time ", "for ", "fun");
  justFlux.subscribe(
        data -> System.out.println("Data " + data),
        error -> System.out.println("Error found " + error),
        () -> System.out.println("End"));
}

```

2.Flux.fromArray() মেথড ব্যবহার করে অ্যারে থেকে ফ্লাক্স স্ট্রিমস তৈরি করা যায়।
Flux.fromArray(new String[]{"Time ", "for ", "fun"});


```java
@Test
public void 1luxFromArray() {
  Flux<String> fluxFromArray = Flux.fromArray(new String[]{"Time ", "for ", "fun"});
  fluxFromArray.subscribe(System.out::println);
}

```

3.Flux.fromStream() মেথড ব্যবহার করে সাধারণ জাভা স্ট্রিমস থেকে রিয়াক্টিভ স্ট্রিমসে রূপান্তর করা যায়।
Flux.fromStream(Stream.of("Time ", "for ", "fun"));

```java
@Test
public void fluxFromStream() {
  var stringStream = Stream.of("Time ", "for ", "fun");
  Flux<String> fluxFromStream = Flux.fromStream(stringStream);
  fluxFromStream.subscribe(System.out::println);
}

```

4. ​​Flux.create((FluxSink<Integer> fluxSink) ফ্লাক্স স্ট্রিমস তৈরি করার সবচেয়ে এডভান্স মেথড, এটির মাধ্যমে অন্য কোন ডেটা সোর্স থেকে ইমিট করা ভ্যালু পুর্ন কন্ট্রোল করার সুবিধা দেয়। প্রথম সোর্স থেকে পাওয়া ডেটার উপর বিভিন্ন ক্যালকুলেশন করে  মেথডের মাধ্যমে সাকসেস অথবা এরর রিটার্ন  করতে পারি। যখন কোন সাবস্ক্রাইবার এই স্ট্রিমসকে সাবস্ক্রাইব করবে প্রত্যেকে একটি করে FluxSink ইন্সটান্স পাবে যার মাধ্যমে ০ থেকে n সংখ্যক ভ্যালু পেতে পারে। সাবস্ক্রাইবার(ডাউন স্ট্রিমস) সিদ্ধান্ত নিবে কতগুলি ডেটা সোর্স থেকে পেতে চাচ্ছে। যদি কোন কারণে সোর্স থেকে ইমিটেড ডেটা কঞ্জিউম করতে ব্যার্থ হয় তা হলে রিয়েক্টর নতুন ডেটা পাবলিশ না করে সাবস্ক্রাইবারের রেসপন্স এর জন্য অপেক্ষা করতে থাকে।   

![Data types](/assets/img/reactive-2-1-4.svg)
```java
@Test
public void fluxCreate() {
  Consumer<FluxSink<Integer>> emitter = (FluxSink<Integer> fluxSink) -> {
     var random = new Random();
     IntStream.range(1, 4)
           .map(n -> {
              int rand = random.nextInt(10);
              System.out.println("emitting number : " + rand);
              return rand;
           })
           .forEach(value -> {
              if (value != 10) {
                 fluxSink.next(value);
              } else {
                 fluxSink.error(new RuntimeException("we cannot proceed value no 10"));
              }
           });
  };

  Flux<Integer> flux = Flux.create(emitter);//.log();
  flux.delayElements(Duration.ofMillis(0))
        .subscribe(value -> System.out.println("Subscriber 1 " + value));
  flux.delayElements(Duration.ofMillis(1))
        .subscribe(value -> System.out.println("Subscriber 2 " + value));
  flux.delayElements(Duration.ofMillis(2))
        .subscribe(value -> System.out.println("Subscriber 3 " + value));
}

```
output

    emitting number : 9
    emitting number : 9
    emitting number : 0
    emitting number : 5
    emitting number : 7
    emitting number : 0
    emitting number : 3
    Subscriber 2 5
    emitting number : 8
    emitting number : 6
    Subscriber 3 3
    Subscriber 1 9
    Subscriber 2 7
    Subscriber 1 9
    Subscriber 1 0
    Subscriber 3 8
    Subscriber 2 0
    Subscriber 3 6
    BUILD SUCCESSFUL in 4s

এখানে দেখতে পাচ্ছি ৩ জন সাবস্ক্রাইবারের জন্য emitting number ৯ বার কল হয়েছে, তার মানে প্রত্যেকে fluxSink এর একটি করে ইন্সটান্স পেয়েছে ব্যবহার, ধরুন আপনি youtube থেকে একটি একটি ভিডিও দেখতেছেন, আপনি যতও মিনিট যত সেকেন্ড দেখতেছেন অন্য একজনতো ওই অংশ না দেখে শেষের অংশ ও দেখতে পারে তাই না? যেমন আপনি ভিডিওটির প্রথম ১০ মিনিট দেখে ফেলেছেন, দ্বিতীয় ব্যাক্তি ভিডিওটির প্রথম থেকেই দেখা শুরু করতে পারতেছে, এমন না যেঁ আপনি যেই ১০ মিনিট বাফার করে ফেলেছেন ওই ১০ মিনিট দেখতে পারতেছে না।


আমরা কোল্ড পাবলিশার তৈরি করতে পারি যেটি এক বা একাধিক ভ্যালু রিটার্ন করতে পারে, চলুন মেথড সিগনেচার দেখে আসি।

5.Flux<T> defer(Supplier<? extends Publisher<T>> supplier)
এখানে ডেফার মেথড সাপ্লায়ার গ্রহণ করে এবং ফ্লাক্স স্ট্রিমস ল্যাযিলি রিটার্ন করে যখন তখনি যখন কেবল ডাউনস্ট্রিমস এর কেউ সাবস্ক্রাইব করে।

এখন প্রশ্ন আসতে পারে কোল্ড পাবলিশার কি?

এক্সিকিউটিং থ্রেড শুধুমাত্র তখনি এই ব্লক একজিকিউট করে যখন ডাউনস্ট্রিমস এর কেউ সাবস্ক্রাইব করে অন্যও দিকে হট পাবলিশার স্ট্রিমসে এগারলি ভ্যালু পাবলিশ করে। আমাদের Flux.just() হচ্ছে হট পাবলিশার।

![Data types](/assets/img/deferForFlux.svg)
Example: 1


```java
@Test
public void fluxDefer() {
  //call network
  /**
   * key company name
   * value share quantity
   * Map<String, Integer> stocks = new HashMap<>();
   * stocks.put("GOOG",5);
   * stocks.put("CSCO",8);
   * stocks.put("FB",6);
   */

  Supplier<Flux<Double>> supplier = () -> Flux.just(
        YahooFinance.getPrice("GOOG"),
        YahooFinance.getPrice("CSCO"),
        YahooFinance.getPrice("FB"));
  Flux<Double> flux = Flux.defer(supplier);
  flux.subscribe(company -> System.out.println("stock price of 2017-05-01 " + company));
}

```
output

![Data types](/assets/img/reactive-2-1-5.png)


Example: 2

যদি আমরা সাবস্ক্রাইব না করি কিছুই প্রিন্ট করবে না।


```java
@Test
public void fluxDefer() {
  //call network
  /**
   * key company name
   * value share quantity
   * Map<String, Integer> stocks = new HashMap<>();
   * stocks.put("GOOG",5);
   * stocks.put("CSCO",8);
   * stocks.put("FB",6);
   */

  Supplier<Flux<Double>> supplier = () -> Flux.just(
        YahooFinance.getPrice("GOOG"),
        YahooFinance.getPrice("CSCO"),
        YahooFinance.getPrice("FB"));
  Flux<Double> flux = Flux.defer(supplier);
  //flux.subscribe(company -> System.out.println("stock price of 2017-05-01 " + company));
}

```
output

![Data types](/assets/img/reactive-2-1-6.png)
Flux.defer() কখন ব্যবহার করব?

১। যখন আমাদের কোন শর্ত সাপেক্ষ কোন সাবস্ক্রাইবার কে পাবলিশার থেকে ডেটা নিতে হবে
২। যখন প্রত্যেক একজিকিউশনে ভিন্ন ভিন্ন ডেটা প্রত্যাশা করব। উদাহরণ ক্রিকেট ম্যাচ চলাকালে ক্রিকেট স্কোর আপডেট পাওয়ার জন্য।

6.Flux<O> zip(Publisher<? extends T1> source1,
                                    Publisher<? extends T2> source2,
                                    BiFunction<? super T1,? super T2,? extends O> combinator)

আমরা অনেকগুলি ডেটা সোর্সকে কম্বাইন করে একটি ডেটা সোর্স এ রূপান্তরিত করতে পারি জিপ মেথড ব্যবহার করে, প্রত্যেকটি  ডেটা সোর্স থেকে একটি করে উপাদান ইমিট করা পর্জন্ত অপেক্ষা করে তারপর টাপল আকারে রিটার্ন করে।

![Data types](/assets/img/zipTwoSourcesWithZipperForFlux.svg)

চলুন একটি উদাহরণ দেখে আসই

Example: 1


```java
@Test
public void fluxZip1() {
  Flux<String> nameFlux = Flux.just("Russia", "Ukraine", "Bangladesh");
  Flux<String> capitalFlux = Flux.just("Moscow", "Kyiv", "Dhaka");

  Flux<Country> countryFlux = Flux.zip(nameFlux, capitalFlux)
        .flatMap(dFlux ->
              Flux.just(new Country(dFlux.getT1(), dFlux.getT2())));
  countryFlux.subscribe(System.out::println);
}

```

Output

country info Country{name='Russia', capital='Moscow'}
country info Country{name='Ukraine', capital='Kyiv'}
country info Country{name='Bangladesh', capital='Dhaka'}


একটি বিষয় লক্ষণীয় যদি কোন ডেটা সোর্স অন্য কমপ্লিট ইভেন্ট ট্রিগার করে, অন্যান্য সোর্স ডেটা থাকলে ও পাওয়া যাবে না।

Example: 2


```java
@Test
public void fluxZip2() {
  Flux<String> nameFlux = Flux.just("Russia", "Ukraine", "Bangladesh");
  Flux<String> capitalFlux = Flux.just("Moscow");

  Flux<Country> countryFlux = Flux.zip(nameFlux, capitalFlux)
        .flatMap(dFlux ->
              Flux.just(new Country(dFlux.getT1(), dFlux.getT2())))
        //.log()
        ;
  countryFlux.subscribe(country -> System.out.println("country info "+country));
}

```

Output

country info Country{name='Russia', capital='Moscow'}

[পুর্বে প্রকাশিত](https://jugbd.org/reactive-programming-with-project-reactor-%e0%a6%b0%e0%a6%bf%e0%a6%8f%e0%a6%95%e0%a6%9f%e0%a6%bf%e0%a6%ad-%e0%a6%aa%e0%a7%8d%e0%a6%b0%e0%a7%8b%e0%a6%97%e0%a7%8d%e0%a6%b0%e0%a6%be%e0%a6%ae%e0%a6%bf/)

হ্যাপি রিডিং
