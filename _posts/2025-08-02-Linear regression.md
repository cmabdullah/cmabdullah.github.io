---
title: "Linear Regression: A Complete Guide with Examples"
header:
  teaser: /assets/images/unsplash-image-2.jpg
categories:
  - Machine Learning
  - Data Science
tags:
  - linear regression
  - machine learning
  - mathematics
  - statistics
mathjax: true
---

### What Is Linear Regression (in ML terms)?

Linear regression is a supervised machine learning algorithm that tries to model the relationship between input variables (features) 
and an output variable (label) by fitting a straight line to the data.

**General Form Equation (Simple Linear Regression)**

For one input feature x, the model is:

$$y = wx + b$$

Let’s say you want to predict someone's weight based on their height:

- Feature: height (in cm)
- Label: weight (in kg)

Where:

- $y$: is the label (target/output variable) — in your example, weight
- $x$: is the feature (input variable) — in your example, height  
- $w$: is the weight (slope) — how much $y$ changes when $x$ increases
- $b$: is the bias (intercept) — the value of $y$ when $x = 0$

Find the best values of $w$ and $b$ such that the predicted values $\hat{y}$ are as close as possible to the actual values $y$.

Linear regression form: **weight = $w \cdot \text{height} + b$**

**Machine Learning Notation:** 

$$f_{w,b}(x) = wx + b$$

In machine learning, we use $f_{w,b}(x)$ because:

- **Function notation:** Emphasizes that this is a function that takes x as input
- **Parameter subscripts:** The subscripts {w,b} show which parameters the function depends on  
- **Prediction emphasis:** Makes it clear this is a prediction/estimate, not the true y value

This matches: $y = wx + b$

So, when doing machine learning:

- $x$ can represent any input (feature), like height, age, number of hours studied, etc.
- $y$ is the prediction the model makes.
- $w$ and $b$ are what the model learns from training data.

Step 1: Sample Data

| Person | Height (cm) | Weight (kg) |
|--------|-------------|-------------|
| A      | 160         | 50          |
| B      | 165         | 55          |
| C      | 170         | 60          |
| D      | 175         | 65          |
| E      | 180         | 70          |

Here:

- height is the feature (input).
- weight is the label (output).

### Step 2: Goal

Find the best-fit line: 

$$\text{weight} = w \cdot \text{height} + b$$

### Step 3: Use the Formulas
To calculate $w$ and $b$, we use the least squares method:

$$w = \frac{n\sum(x_i \cdot y_i) - \sum x_i \sum y_i}{n\sum x_i^2 - (\sum x_i)^2}$$

$$b = \frac{\sum y_i - w \sum x_i}{n}$$

**Where:**
- $x_i$ = height of the i-th person
- $y_i$ = weight of the i-th person
- $n$ = number of data points
- $\Sigma$ = summation (e.g., $\Sigma x_i = x_1 + x_2 + ... + x_n$)


Step 4: Plug in the Values
Let’s calculate the required sums:

| Height <span class="inline-math">$$(x)$$</span> | Weight <span class="inline-math">$$(y)$$</span> | <span class="inline-math">$$x \cdot y$$</span> | <span class="inline-math">$$x^2$$</span> | 
|-------------------------------------------------|-------------------------------------------------|------------------------------------------------|------------------------------------------| 
| 160                                             | 50                                              | 8000                                           | 25600                                    |       
| 165                                             | 55                                              | 9075                                           | 27225                                    |       
| 170                                             | 60                                              | 10200                                          | 28900                                    |        
| 175                                             | 65                                              | 11375                                          | 30625                                    |        
| 180                                             | 70                                              | 12600                                          | 32400                                    |      
| **<span class="inline-math">$$\Sigma$$</span>** | **850**                                         | **300**                                        | **51250**                                | **144750**                               |





- <span class="inline-math">$$n = 5$$</span>
- <span class="inline-math">$$\sum x_i = 850$$</span>
- <span class="inline-math">$$\sum y_i = 300$$</span>
- <span class="inline-math">$$\sum x_i y_i = 51250$$</span>
- <span class="inline-math">$$\sum x_i^2 = 144750$$</span>


## Calculate slope <span class="inline-math">$$w$$</span>:

<span class="result-equation">$$
w = \frac{5 \cdot 51250 - 850 \cdot 300}{5 \cdot 144750 - 850^2} = \frac{256250 - 255000}{723750 - 722500} = \frac{1250}{1250} = 1
$$</span>

## Calculate intercept <span class="inline-math">$$b$$</span>:

<span class="result-equation">$$
b = \frac{300 - 1 \cdot 850}{5} = \frac{-550}{5} = -110
$$</span>

## Final Linear Equation


<span class="result-equation">$$
\boxed{\text{weight} = 1 \cdot \text{height} - 110}
$$</span>

This means: for a given height (in cm), you can estimate the weight (in kg) with this formula.

## Example Use

If someone's height is 172 cm:

<span class="result-equation">$$
\text{weight} = 1 \cdot 172 - 110 = 62 \text{ kg}
$$</span>