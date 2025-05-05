# Earthquake Data Analysis Documentation

## 1. Analysis Ideas

### 1.1 Analyze the Importance of Different Parameters
- Objective: Analyze and evaluate the significance of various parameters involved in the earthquake data (e.g., magnitude, depth, location, time).

### 1.2 Analyze the Similarity Patterns in Different Earthquakes at Different Locations
- Objective: Investigate similarity patterns of earthquake occurrences across different geographical locations.

### 1.3 Why Don't Consider the Magnitude 1-2?
- Explanation: 
    - Earthquakes with magnitudes in the range of 1-2 are generally considered too small to have significant impacts and are often lost in noise.
    - These low-magnitude events may not provide useful data for predictive models due to their unreliable nature.
    - **Recommendation:** Exclude this range to ensure more relevant data for training and analysis models.
### 1.4 Plot the distribution of the magnitude ranges

### 1.5 For the large data of magnitude ranges of 2-3 and 3-4 we can do random sampling, k fold(and all other techniques to select dataset)

### 1.6 We can compare noise and the genuine earthquake data to get the reasons why 0-2 magnitude data is neglected

### 1.7 CUDA vs ROCm

### 1.8 Gantt chart of project time line
---

## 2. Problems Faced During Data Processing

### 2.1 Imbalanced Dataset

| Chunk         | 2-3 Magnitude | 3-4 Magnitude | 4-5 Magnitude | 5-6 Magnitude | 6+ Magnitude | Total   |
|---------------|---------------|---------------|---------------|---------------|--------------|---------|
| **Chunk 2**   | 25,493        | 8,189         | 2,689         | 227           | 16           | 36,614  |
| **Chunk 3**   | 28,612        | 9,073         | 2,606         | 251           | 20           | 40,562  |
| **Chunk 4**   | 28,012        | 14,189        | 4,345         | 385           | 33           | 46,964  |
| **Chunk 5**   | 40,795        | 23,748        | 5,240         | 430           | 36           | 70,249  |
| **Chunk 6**   | 44,321        | 24,957        | 7,031         | 596           | 41           | 76,946  |
| **Noise**   | -        | -        | -         | -           | -           | 235,426  |
| **Total** | 167,233      | 80,156        | 21,911        | 1,889         | 146          | -       |

