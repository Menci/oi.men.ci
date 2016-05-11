title: 「SDOI2016」征途 - 斜率优化DP
date: 2016-04-17 22:46:04
categories: OI
tags:
  - SDOI
  - COGS
  - BZOJ
  - DP
  - 斜率优化
  - 单调队列
permalink: sdoi2016-journey
---

Pine 开始了从 $ S $ 地到 $ T $ 地的征途。  
从 $ S $ 地到 $ T $ 地的路可以划分成 $ n $ 段，相邻两段路的分界点设有休息站。  
Pine 计划用 $ m $ 天到达 $ T $ 地。除第 $ m $ 天外，每一天晚上 Pine 都必须在休息站过夜。所以，一段路必须在同一天中走完。  
Pine 希望每一天走的路长度尽可能相近，所以他希望每一天走的路的长度的方差尽可能小。  
帮助 Pine 求出最小方差是多少。

设方差是 $ v $，可以证明，$ v \times m ^ 2 $ 是一个整数。为了避免精度误差，输出结果时输出 $ v \times m ^ 2 $。

<!-- more -->

### 链接
[COGS 2225](http://cogs.top/cogs/problem/problem.php?pid=2225)  
[BZOJ 4518](http://www.lydsy.com/JudgeOnline/problem.php?id=4518)

### 题解
设 $ a_i $ 为每一天的路程，$ S = \sum\limits_{i = 1} ^ n a_i $，题目要求即为最小化

$$
m ^ 2 \times \sum\limits_{i = 1} ^ m \frac{(a_i - \frac{S}{m}) ^ 2}{m}
$$

将上式展开，整理得

$$
\begin{align*}
  & m ^ 2 \times 
          \sum\limits_{i = 1} ^ m
                      \frac{(a_i - \frac{S}{m}) ^ 2}
                           {m} \\
= & m ^ 2 \times
          \sum\limits_{i = 1} ^ m
                      \frac{   a_i ^ 2
                             + (\frac{S}{m}) ^ 2
                             - 2 a_i \frac{S}{m}
                           }
                           {m} \\
= & m ^ 2 \times
         (\sum\limits_{i = 1} ^ m
                      \frac{a_i ^ 2}{m}
        + \sum\limits_{i = 1} ^ m
                      \frac{S ^ 2}{m ^ 3}
      - 2 \sum\limits_{i = 1} ^ m
                      a_i \frac{S}{m ^ 2} ) \\
= & m ^ 2 \times
         (\sum\limits_{i = 1} ^ m
                      \frac{a_i ^ 2}{m}
        +             \frac{S ^ 2}{m ^ 2}
      - 2      \times \frac{S ^ 2}{m ^ 2} ) \\
= & m ^ 2 \times
         (\sum\limits_{i = 1} ^ m
                      \frac{a_i ^ 2}{m}
        -             \frac{S ^ 2}{m ^ 2} ) \\
= & m \times \sum\limits_{i = 1} ^ m a_i ^ 2 - S ^ 2 \\
\end{align*}
$$

因为 $ m $ 是个常数，$ S ^ 2 $ 是个常数，所以只要最小化

$$ \sum\limits_{i = 1} ^ m a_i ^ 2 $$

即可

设 $ f[j][i] $ 表示前 $ i $ 段路，分成 $ j $ 天的最优方案对应上式的值，则有

$$ f[j][i] = \min\limits_{k = 1} ^ {j - 1}\{ f[j - 1][k] + (s[i] - s[k]) ^ 2 \} $$

直接以这个式子进行划分DP，状态数为 $ O(nm) $，时间复杂度为 $ O(nm ^ 2) $，预计得分 60 分。

尝试进行优化。首先，二维的状态存储，显然第一维是可以滚动的，设 $ g(i) = f[j - 1][i] $。考虑 $ k $ 的两个取值 $ k = a $ 和 $ k = b $（$ a > b $），若 $ a $ 比 $ b $ 优，则有

$$
\begin{align*}
g(a) + (s_i - s_a) ^ 2 & < g(b) + (s_i - s_b) ^ 2 \\
g(a) + s_i ^ 2 + s_a ^ 2 - 2 s_i s_a & < g(b) + s_i ^ 2 + s_b ^ 2 - 2 s_i s_b \\
g(a) + s_a ^ 2 - 2 s_i s_a & < g(b) + s_b ^ 2 - 2 s_i s_b \\
g(a) - g(b) + s_a ^ 2 - s_b ^ 2 & < 2 s_i s_a - 2 s_i s_b \\
g(a) - g(b) + s_a ^ 2 - s_b ^ 2 & < 2 s_i (s_a - s_b) \\
\frac{(g(a) + s_a ^ 2) - (g(b) + s_b ^ 2)}{s_a - s_b} & < 2 s_i \\
\end{align*}
$$

左边是一个斜率的式子，分子和分母都是单调的，右边也是单调的。使用一个单调队列来存储一些决策点，使得从前到后每一个决策点都比下一个决策点更优，需要满足的条件是：

1. 较后面的一对点组成的斜率比较前面一对点大；
2. 第 $ a $ 个点与第 $ b $ 个点（$ a > b $）组成的斜率大于 $ 2 s_i $（如果小于，说明较靠后的 $ a $ 点更优）。

因为斜率是单调递增的，所以第 2 条只需要使前两个元素满足条件即可。

枚举 $ i $，不需要枚举 $ k $，而是从单调队列中寻找最优决策点。首先检查队首元素，使其满足条件 2，此时队首即为最优解；然后将当前决策点作为新的 $ k $ 加入到队列尾部，需要先删除一些决策点使得条件 1 被满足。因为每个决策点最多会被添加、删除各一次，所以状态转移的代价为均摊 $ O(1) $，总时间复杂度降为 $ O(nm) $，可以通过本题。

注意正无穷的取值，合理取值可以避免特判。

### 代码
```c++
#include <cstdio>
#include <cstring>
#include <climits>
#include <algorithm>

const int MAXN = 3000;
const int MAXM = 3000;

int n, m, a[MAXN + 1], s[MAXN + 1];
long long f[MAXN + 1], g[MAXN + 1];

template <typename T>
inline T sqr(const T x) { return x * x; }

inline double slope(const int a, const int b) {
    // printf("K(%d, %d)\n", a, b);
    return (double)(g[a] - g[b] + sqr(s[a]) - sqr(s[b])) / (double)(s[a] - s[b]);
}

int main() {
    freopen("menci_journey.in", "r", stdin);
    freopen("menci_journey.out", "w", stdout);

    scanf("%d %d", &n, &m);
    for (int i = 1; i <= n; i++) scanf("%d", &a[i]);
    for (int i = 1; i <= n; i++) s[i] = s[i - 1] + a[i];

    for (int i = 1; i <= n; i++) f[i] = INT_MAX;
    for (int j = 1; j <= m; j++) {
        memcpy(g, f, sizeof(f));
        memset(f, 0, sizeof(f));

        static int q[MAXN];
        int l = 0, r = -1;
        q[++r] = 0;

        for (int i = 1; i <= n; i++) {
            while (l < r && slope(q[l + 1], q[l]) < 2 * s[i]) l++;

            int t = q[l];
            f[i] = g[t] + sqr(s[i] - s[t]);

            while (l < r && slope(q[r], q[r - 1]) > slope(q[r], i)) r--;

            q[++r] = i;
        }
    }

    // for (int i = 1; i <= n; i++) printf("s[%d] = %lld\n", i, s[i]);
    printf("%d\n", (int)(f[n] * m - sqr(s[n])));

    fclose(stdin);
    fclose(stdout);

    return 0;
}
```
