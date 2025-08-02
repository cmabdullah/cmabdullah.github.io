### What Is Linear Regression (in ML terms)?

Linear regression is a supervised machine learning algorithm that tries to model the relationship between input variables (features) 
and an output variable (label) by fitting a straight line to the data.

General Form Equation (Simple Linear Regression)
For one input feature 𝑥, the model is: 𝑦 = 𝑤𝑥 + 𝑏

Let’s say you want to predict someone's weight based on their height:

- Feature: height (in cm)
- Label: weight (in kg)

Where:

- 𝑦: is the label (target/output variable) — in your example, weight
- 𝑥: is the feature (input variable) — in your example, height
- 𝑤: is the weight (slope) — how much 𝑦 changes when 𝑥 increases
- 𝑏: is the bias (intercept) — the value of 𝑦 when 𝑥 = 0

Find the best values of 𝑤 and 𝑏 such that the predicted values ŷ are as close as possible to the actual values 𝑦.

Linear regression form: weight = 𝑤 ⋅ height + 𝑏

Matches: 𝑦 = 𝑤𝑥 + 𝑏

So, when doing machine learning:

- 𝑥 can represent any input (feature), like height, age, number of hours studied, etc.
- 𝑦 is the prediction the model makes.
- 𝑤 and 𝑏 are what the model learns from training data.

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

Find the best-fit line: <span class="result-equation">$$\text{weight} = w \cdot \text{height} + b$$</span>

### Step 3: Use the Formulas
To calculate 𝑤 and 𝑏, we use the least squares method:

<span class="result-equation">$$
w = \frac{n\sum(x_i \cdot y_i) - \sum x_i \sum y_i}{n\sum x_i^2 - (\sum x_i)^2}
$$

<span class="result-equation">$$
b = \frac{\sum y_i - w \sum x_i}{n}
$$</span>

<div class="left-aligned-list">

**Where:**
- <span class="inline-math">$$x_i$$</span> = height of the i-th person
- <span class="inline-math">$$y_i$$</span> = weight of the i-th person
- <span class="inline-math">$$n$$</span> = number of data points
- <span class="inline-math">$$\Sigma$$</span> = summation (e.g., <span class="inline-math">$$\Sigma x_i = x_1 + x_2 + ... + x_n$$</span>)

</div>


Step 4: Plug in the Values
Let’s calculate the required sums:

| Height (x) | Weight (y) | x * y   | x^2       |            |
|------------|------------|---------|-----------|------------|
| 160        | 50         | 8000    | 25600     |            |
| 165        | 55         | 9075    | 27225     |            |
| 170        | 60         | 10200   | 28900     |            |
| 175        | 65         | 11375   | 30625     |            |
| 180        | 70         | 12600   | 32400     |            |
| **Σ**      | **830**    | **300** | **51250** | **144750** |


<div style="text-align: left;">

- <span class="inline-math">$$n = 5$$</span>
- <span class="inline-math">$$\sum x_i = 850$$</span>
- <span class="inline-math">$$\sum y_i = 300$$</span>
- <span class="inline-math">$$\sum x_i y_i = 51250$$</span>
- <span class="inline-math">$$\sum x_i^2 = 144750$$</span>

</div>

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

<div class="left-align-math">

$$
\text{weight} = 1 \cdot 172 - 110 = 62 \text{ kg}
$$

</div>