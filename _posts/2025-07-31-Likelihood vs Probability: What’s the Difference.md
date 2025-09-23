---
title: Likelihood vs. Probability, What’s the Difference (and Why It Matters in Machine Learning)?
header:
  teaser: /assets/images/unsplash-image-4.jpg
categories:
  - Machine Learning
  - Data Science
tags:
  - probability
---
> “Given a model, what’s the chance of this data?” vs. “Given this data, what’s the best model?”

Whether you're diving into machine learning, statistics, or even just curious about coin tosses, understanding the difference between probability and likelihood is foundational — yet often misunderstood.

In this blog, we’ll explore both concepts through simple, visual, and intuitive examples — with a little help from our old friend: the coin.

---

## Part 1: Understanding Probability

### What Is Probability?

**Probability** is about predicting how likely a certain event is **before** it happens — assuming we already know the rules of the system.

### Think Forward:

> “If I know the coin is fair, what’s the chance of getting 3 heads in a row?”

This is a **forward problem**. You already know the model — now you’re trying to calculate the probability of an outcome.

---

### Example: Fair Coin Toss

Assume the coin is fair:

- p = 0.5 → Probability of Head
- 1 - p = 0.5 → Probability of Tail

You toss the coin 3 times.

**What's the chance of getting HHH?**

Since each flip is independent:

P(HHH | p = 0.5) = 0.5 × 0.5 × 0.5 = 0.125

That’s a 12.5% chance — only 1 of 8 possible outcomes (since 2^3 = 8).

---

## Part 2: Understanding Likelihood

### What Is Likelihood?

**Likelihood** flips the question.

> “I’ve seen 3 heads in a row — what’s the most likely value of **p** ?”

Now, instead of assuming the model and asking about outcomes, you assume the **data** and ask:

> What model (what value of **p** ) makes this data most plausible?

This is the **reverse direction** — and it’s the foundation of **Maximum Likelihood Estimation (MLE)**.

---

## Example 1: You Observe HHH (3 Heads)

Let’s say you toss a coin 3 times, and observe: Result = H, H, H

You don’t know if the coin is fair. You want to estimate **p** — the probability of Heads — that makes this sequence most likely.

### Likelihood Function:
L(p) = p × p × p = p^3

Why? Because each Head has probability p, and:

L(p) = P(H) × P(H) × P(H) = p^3

### Maximize It:

Maximize L(p) = p^3 ⇒ Highest when p = 1

So:

- **MLE estimate**: p̂ = 1

In other words, based on HHH, you'd conclude the coin is fully biased toward Heads — even though that conclusion is **shaky with such little data**.

*Note: Likelihood doesn't judge; it just finds the best fit for the data you’ve got.*

---

## Example 2: You Observe HHT (2 Heads, 1 Tail)

Now let’s say you observe: Result = H, H, T

This time, the likelihood function becomes:

L(p) = p^2 * (1 - p)

- 2 Heads → p^2
- 1 Tail → (1 - p)

### Evaluate \( \mathcal{L}(p) \) for Different Values:

| p    | L(p) = p^2 * (1 - p)        |
|------|-----------------------------|
| 0.1  | 0.01 × 0.9 = **0.009**      |
| 0.3  | 0.09 × 0.7 = **0.063**      |
| 0.5  | 0.25 × 0.5 = **0.125**      |
| 0.6  | 0.36 × 0.4 = **0.144**      |
| 0.66 | 0.4356 × 0.34 ≈ **_0.148_** |
| 0.9  | 0.81 × 0.1 = **0.081**      |

### Result:

The **maximum likelihood occurs at** p ≈ 0.66

So:

- **MLE estimate**: p̂ = 2/3

Why? Because HHT happened, and p = 0.66 makes that sequence most plausible.

---

## Putting It All Together

| Concept     | Direction     | Assumes     | Solves for         | Example                                |
|-------------|---------------|-------------|--------------------|----------------------------------------|
| Probability | Forward       | Known model | Likelihood of data | What's P(HHH) if p = 0.5?              |
| Likelihood  | Reverse (MLE) | Known data  | Best-fitting model | What's best p if HHH observed?         |


---

## Why This Matters in Machine Learning

In machine learning, especially during model training:

- We assume the **data is fixed** (it’s our training set)
- We optimize the model parameters to **maximize the likelihood**

So every time your model “learns,” it’s usually **maximizing a likelihood function**.

---

## Final Thought

> **Probability predicts. Likelihood explains.**

They may look like twins, but they walk in **opposite directions**.  
Mastering both helps you think clearly about data, models, and uncertainty — whether you're flipping coins or training neural networks.

---