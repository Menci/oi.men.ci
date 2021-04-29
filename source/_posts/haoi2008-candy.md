title: 「HAOI2008」糖果传递 - 数学
categories:
  - OI
tags:
  - BZOJ
  - HAOI
  - 数学
permalink: haoi2008-candy
date: '2016-11-13 11:45:00'
---

有 $ n $ 个小朋友坐成一圈，每人有 $ a_i $ 个糖果。每人只能给左右两人传递糖果。每人每次传递一个糖果代价为 $ 1 $。求使所有人获得均等糖果的最小代价。

<!-- more -->

### 链接

[BZOJ 1045](http://www.lydsy.com/JudgeOnline/problem.php?id=1045)

### 题解

设 $ v = \frac{\sum\limits_{i = 1} ^ n a_i}{n} $，$ x_1 $ 表示第 $ i - 1 $ 个人给第 $ i $ 个人的数量，则有

$$ \begin{aligned} v &= a_i + x_i - x_{i - 1} \\ x_{i + 1} &= x_i - v + a_i \end{aligned} $$

即

$$ \begin{aligned} x_2 &= x_1 - v + a_1 \\ x_3 &= x_2 - v + a_2 \\ &= x_1 - v + a_1 - v + a_2 \\ x_4 &= x_3 - v + a_3 \\ &= x_1 - v + a_1 - v + a_2 - v + a_3 \end{aligned} $$

我们的目标是最小化 $ \sum\limits_{i = 1} ^ n | x_i | $。

设 $ c_0 = 0, c_i = c_{i - 1} + v - a_i $，则

$$ \begin{aligned} x_1 &= x_1 - c_0 \\ x_2 &= x_1 - c_1 \\ x_3 &= x_1 - c_2 \\ x_4 &= x_1 - c_3 \end{aligned} $$

即，最小化

$$ \sum\limits_{i = 1} ^ n | x_1 - c_{i - 1} | $$

问题转化为，在数轴上找一个点，到给定一些点的距离之和最小。答案即为 $ c_i $ 的中位数。

### 代码

```cpp
#include <cstdio>
#include <algorithm>

const int MAXN = 1000000;

int main() {
    int n;
    scanf("%d", &n);

    static long long a[MAXN];
    long long sum = 0;
    for (int i = 0; i < n; i++) {
        scanf("%lld", &a[i]);
        sum += a[i];
    }

    long long avg = sum / n;
    static long long c[MAXN];
    c[0] = 0;
    for (int i = 1; i < n; i++) c[i] = c[i - 1] - a[i] + avg;

    std::sort(c, c + n);

    long long mid = c[n / 2], ans = 0;
    for (int i = 0; i < n; i++) ans += llabs(c[i] - mid);

    printf("%lld\n", ans);

    return 0;
}
```