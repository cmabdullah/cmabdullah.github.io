---
title: Understanding Loss Functions in Linear Regression
header:
  image: /assets/images/unsplash-image-3.jpg
  teaser: /assets/images/unsplash-image-3.jpg
  caption: "Photo credit: [Unsplash](https://unsplash.com/)"
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

In machine learning, loss is the numerical heartbeat that tells us how well our model is performing.
The fundamental goal of training any machine learning model is simple: minimize this loss to make our predictions as accurate as possible.

Imagine you're trying to predict house prices. If your model predicts $300,000 but the actual sale price was $280,000, 
the loss quantifies that $20,000 difference. The smaller this difference across all predictions, the better your model performs.

## The Core Concept: Distance, Not Direction

This is why all loss functions employ techniques to remove the sign from the error:

- Taking the absolute value: <span class="inline-math">$$|\text{actual} - \text{predicted}|$$</span>
- Squaring the difference: (prediction - actual)²
### Linear Regression Loss

1. Mean Absolute Error (MAE) - L1 Loss
   - It simply averages the absolute differences between predictions and actual values.
     - <span class="inline-math">$$\text{MAE} = \frac{1}{n} \sum_{i=1}^{n} |\text{actual}_i - \text{predicted}_i|$$</span>
     - <span class="inline-math">$$\text{MAE} = \frac{1}{n} \sum_{i=1}^{n} |y_i - \hat{y}_i|$$</span>
2. Mean Squared Error (MSE) - L2 Loss
   - Mean Squared Error (MSE) is a loss function that measures the average of the squared differences between predicted and actual values.
     - <span class="inline-math">$$\text{MSE} = \frac{1}{n} \sum_{i=1}^{n} (\text{actual}_i - \text{predicted}_i)^2$$</span>
     - <span class="inline-math">$$\text{MSE} = \frac{1}{n} \sum_{i=1}^{n} (y_i - \hat{y}_i)^2$$</span>

#### Calculating loss example

Let's work through a concrete example with house price predictions to see how MAE and MSE are calculated.

**Sample Data:**

| House | Actual Price | Predicted Price | Error    |
|-------|--------------|-----------------|----------|
| 1     | $280,000     | $300,000        | -$20,000 |
| 2     | $350,000     | $330,000        | $20,000  |
| 3     | $420,000     | $400,000        | $20,000  |
| 4     | $180,000     | $190,000        | -$10,000 |
| 4     | $390,000     | $400,000        | -$10,000 |

**Calculating Mean Absolute Error (MAE):**

Step 1: Take the absolute value of each error:
- <span class="inline-math">$$|−20,000| = 20,000 $$</span>
- <span class="inline-math">$$|20,000| = 20,000  $$</span>
- <span class="inline-math">$$|20,000| = 20,000  $$</span>
- <span class="inline-math">$$|−10,000| = 10,000 $$</span>
- <span class="inline-math">$$|−10,000| = 10,000 $$</span>

Step 2: Calculate the mean:
<span class="inline-math">$$\text{MAE} = \frac{20,000 + 20,000 + 20,000 + 10,000 + 10,000}{5} = \frac{80,000}{5} = 16,000$$</span>

**Calculating Mean Squared Error (MSE):**

Step 1: Square each error:
- (−20,000)² = 400,000,000
- (20,000)² = 400,000,000
- (20,000)² = 400,000,000
- (−10,000)² = 100,000,000
- (−10,000)² = 100,000,000

Step 2: Calculate the mean:
<span class="inline-math">$$\text{MSE} = \frac{400,000,000 + 400,000,000 + 400,000,000 + 100,000,000 + 100,000,000}{5}$$</span>

<span class="inline-math">$$\text{MSE} = \frac{1,400,000,000}{5} = 280,000,000$$</span>

**Key Observations:**

1. **Scale Difference**: MAE gives us $16,000 while MSE gives us 280,000,000. MSE values are much larger because we're squaring the errors.

2. **Sensitivity to Outliers**: Notice how the $20,000 errors contribute proportionally more to MSE (400,000,000 each) compared to the $10,000 errors (100,000,000 each). In MAE, they contribute proportionally (20,000 vs 10,000).

3. **Practical Interpretation**: 
   - MAE tells us our predictions are off by an average of $16,000
   - MSE penalizes larger errors more heavily, making it useful when big mistakes are particularly costly

**Root Mean Squared Error (RMSE):**

To make MSE more interpretable, we can take its square root:
<span class="inline-math">$$\text{RMSE} = \sqrt{280,000,000} = 16,733$$</span>

RMSE brings us back to the same units as our original data (dollars), making it easier to interpret than MSE.