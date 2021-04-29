title: 「APIO2014」Split the sequence - 斜率优化 DP
categories:
  - OI
tags:
  - APIO
  - BZOJ
  - DP
  - UOJ
permalink: apio2014-sequence
date: '2017-05-26 21:48:00'
---

你正在玩一个关于长度为 $ n $ 的非负整数序列的游戏。这个游戏中你需要把序列分成 $ k + 1 $ 个非空的块。为了得到 $ k + 1 $ 块，你需要重复下面的操作 $ k $ 次：

1. 选择一个有超过一个元素的块（初始时你只有一块，即整个序列）
2. 选择两个相邻元素把这个块从中间分开，得到两个非空的块。

每次操作后你将获得那两个新产生的块的元素和的乘积的分数。你想要最大化最后的总得分。

<!-- more -->

### 链接

[BZOJ 3675](http://www.lydsy.com/JudgeOnline/problem.php?id=3675)  
[UOJ #104](http://uoj.ac/problem/104)

### 题解

首先，可以发现分割顺序对答案不影响，所以可以 DP，设 $ f(i, j) $ 表示前 $ i $ 个数分成 $ j $ 段的答案，设 $ s_i $ 为前缀和，则

$$ f(i, j) = \max\limits_{k = j - 1} ^ {i - 1} \{ f(k, j - 1) + (s_i - s_k)(s_n - s_i) \} $$

时间复杂度为 $ O(n ^ 3) $，考虑优化

设 $ g(i) = f(i, j - 1) $，上式化为

$$ \begin{aligned} g(i) &= \max\limits_{k = j - 1} ^ {i - 1} \{ g(k) + (s_i - s_k)(s_n - s_i) \} \\ &= \max\limits_{k = j - 1} ^ {i - 1} \{ g(k) + s_i s_n - s_k s_n - s_i ^ 2 + s_k s_i \} \\ &= \max\limits_{k = j - 1} ^ {i - 1} \{ g(k) - s_k s_n + (s_i s_n - s_i ^ 2) + s_k s_i \} \\ &= (s_i s_n - s_i ^ 2) + \max\limits_{k = j - 1} ^ {i - 1} \{ g(k) - s_k s_n + s_k s_i \} \end{aligned} $$

设 $ G(i) = g(i) - s_i s_n $ 考虑两个决策 $ k_1 $ 和 $ k_2 $，$ k_1 $ 比 $ k_2 $ 优当且仅当

$$ \begin{aligned} G(i) - s_i s_{k_1} &> G(j) - s_i s_{k_2} \\ G(i) - G(j) &> s_i s_{k_1} - s_i s_{k_2} \\ \frac{G(i) - G(j)}{s_{k_1} - s_{k_2}} &> s_i \\ \end{aligned} $$

斜率优化。

### 代码

```cpp
#include <cstdio>
#include <cstring>
#include <cfloat>
#include <algorithm>

const int MAXN = 100000;
const int MAXK = 200;

long long f[MAXK + 1][MAXN], *f0;
int n, t, g[MAXK + 1][MAXN];
long long s[MAXN + 1];

inline long long F(int i) {
    return f0[i] - s[i] * s[n];
}

inline double slope(int k1, int k2) {
    return s[k2] == s[k1] ? -DBL_MAX : (double)(F(k1) - F(k2)) / (s[k2] - s[k1]);
}

inline long long solve() {
    long long ans = 0;
    for (int j = 1; j <= t; j++) {
        f0 = f[j - 1];

        static int q[MAXN + 1];
        int *l = q, *r = q - 1;
        *++r = j - 1;

        for (int i = j; i < n; i++) {
            while (r - l >= 1 && slope(*l, *(l + 1)) <= s[i]) l++;
            f[j][i] = F(*l) + s[i] * (s[n] - s[i] + s[*l]);
            g[j][i] = *l;
            // printf("f(%d, %d) = %lld (%d)\n", i, j, f[j][i], *l);
            ans = std::max(ans, f[j][i]);
            while (r - l >= 1 && slope(*r, i) < slope(*(r - 1), *r)) r--;
            *++r = i;
            // *++r = f0[i] - s[i] * s[n];
        }
    }

    return ans;
}

int main() {
    scanf("%d %d", &n, &t);

    static int a[MAXN + 1];
    for (int i = 1; i <= n; i++) {
        scanf("%d", &a[i]);
        s[i] = s[i - 1] + a[i];
    }

    /*
    static long long f[MAXN + 1][MAXK + 1];
    static int g[MAXN + 1][MAXK + 1];

    // long long ans = 0;
    for (int j = 1; j <= t; j++) {
        for (int i = j; i <= n; i++) {
            for (int k = j - 1; k <= i - 1; k++) {
                if (f[i][j] < f[k][j - 1] + (s[i] - s[k]) * (s[n] - s[i])) {
                    f[i][j] = f[k][j - 1] + (s[i] - s[k]) * (s[n] - s[i]);
                    // ans = std::max(ans, f[i][j]);
                    g[i][j] = k;
                }
            }
            printf("f(%d, %d) = %lld (%d)\n", i, j, f[i][j], g[i][j]);
        }
    }
    */

    long long ans = solve();

    printf("%lld\n", ans);
    for (int i = n - 1; i >= 0; i--) {
        if (f[t][i] == ans) {
            printf("%d", i);
            for (int k = t, p = g[t][i], cnt = 1; cnt < t; p = g[--k][p], cnt++) printf(" %d", p);
            puts("");
            goto end;
        }
    }

end:;
}
```