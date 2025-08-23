# Understanding Loss Functions in Linear Regression

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