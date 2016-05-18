title: 「APIO2010」特别行动队 - 斜率优化DP
categories: OI
tags: 
  - BZOJ
  - APIO
  - DP
  - 单调队列
  - 斜率优化
permalink: apio2010-commando
date: 2016-05-13 20:16:00
---

一支部队由 $ n $ 名预备役士兵组成，士兵从 $ 1 $ 到 $ n $ 编号，要将他们拆分成若干特别行动队，同一队中队员的编号应该连续。

士兵 $ i $ 的初始战斗力为 $ x_i $ 一支特别行动队的初始战斗力 $ x $ 为各士兵初始战斗力之和。一支特别行动队的战斗力会被修正为 $ x' = Ax ^ 2 + Bx + C $，其中 $ A $、$ B $、$ C $ 已知，$ A < 0 $。

求出将所有士兵组成若干特别行动队的最大总战斗力。

<!-- more -->

### 链接
[BZOJ 1911](http://www.lydsy.com/JudgeOnline/problem.php?id=1911)

### 题解
设 $ f[i] $ 表示前 $ i $ 名士兵分成若干特别行动队的最大战斗力，$ s_i $ 表示前缀和。

枚举 $ j $，将第 $ j + 1 $ 到 $ i $ 个分在同一队里，状态转移方程为

$$ f[i] = \max\limits_{j = 0} ^ {i - 1} \{ f[j] + A(s_i - s_j) ^ 2 + B(s_i - s_j) + C \} $$

时间复杂度为 $ O(n ^ 2) $，超时，需要优化。

考虑两个决策点 $ j = a $、$ j = b $（$ a > b $），若 $ a $ 比 $ b $ 优，则有

$$
f[a] + A(s_i - s_a) ^ 2 + B(s_i - s_a) + C > f[b] + A(s_i - s_b) ^ 2 + B(s_i - s_b) + C \\
f[a] + A(s_i ^ 2 + s_a ^ 2 - 2 s_i s_a) + B(s_i - s_a) + C > f[b] + A(s_i ^ 2 + s_b ^ 2 - 2 s_i s_b) + B(s_i - s_b) + C \\
f[a] + A s_i ^ 2 + A s_a ^ 2 - 2 A s_i s_a + B s_i - B s_a + C > f[b] + A s_i ^ 2 + A s_b ^ 2 - 2 A s_i s_b + B s_i - B s_b + C \\
f[a] + A s_a ^ 2 - 2 A s_i s_a - B s_a > f[b] + A s_b ^ 2 - 2 A s_i s_b - B s_b \\
f[a] - f[b] + A s_a ^ 2 - A s_b ^ 2 - B s_a + B s_b > 2 A s_a s_i + 2 A s_b s_i \\
(f[a] + A s_a ^ 2 - B s_a) - (f[b] + A s_b ^ 2 - B s_b) > 2 A s_i(s_a - s_b) \\
{ {(f[a] + A s_a ^ 2 - B s_a) - (f[b] + A s_b ^ 2 - B s_b)} \over {s_a - s_b} } > 2 A s_i \\
$$

不等式右边单调递减，左边分母上的前缀和单调递增。

用单调队列存储所有决策点，维护一个上凸壳，从左到后两两之间的斜率递减，且均小于当前的 $ 2 A s_i $，每次最优决策从最左边取得。

时间复杂度为 $ O(n) $。

### 代码
```c++
#include <cstdio>

const int MAXN = 1000000;

int n;
long long a[MAXN], A, B, C;
long long s[MAXN + 1], f[MAXN + 1];

template <typename T> inline T sqr(const T &x) { return x * x; }

inline long long y(const int a) {
    return f[a] + A * sqr(s[a]) - B * s[a];
}

inline long long x(const int a) {
    return s[a];
}

inline long long g(const int i) {
    return 2 * A * s[i];
}

inline double slope(const int a, const int b) {
    return static_cast<double>(y(a) - y(b))
         / static_cast<double>(x(a) - x(b));
}

int main() {
    int n;
    scanf("%d", &n);
    scanf("%lld %lld %lld", &A, &B, &C);
    for (int i = 0; i < n; i++) scanf("%lld", &a[i]);
    for (int i = 1; i <= n; i++) s[i] = s[i - 1] + a[i - 1];
    
    static long long q[MAXN + 1];
    
    long long *l = q, *r = q;
    *r = 0;
    
    for (int i = 1; i <= n; i++) {
        while (l < r && slope(*(l + 1), *l) > g(i)) l++;
        
        int j = *l;
        
        // int _j = -1;
        // for (int j = 0; j < i; j++) {
        //     if (_j == -1 || f[j] + A * sqr(s[i] - s[j]) + B * (s[i] - s[j]) + C > f[_j] + A * sqr(s[i] - s[_j]) + B * (s[i] - s[_j]) + C) _j = j;
        // }
        // j = _j;
        
        // printf("i = %d, j = %d\n", i, j);
        f[i] = f[j] + A * sqr(s[i] - s[j]) + B * (s[i] - s[j]) + C;
        
        // printf("i = %d, _j = %d\n", i, _j);
        
        while (l < r && slope(*r, *(r - 1)) < slope(i, *r)) r--;
        
        *++r = i;
    }
    
    printf("%lld\n", f[n]);
    
    return 0;
}
```
