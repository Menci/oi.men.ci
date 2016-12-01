title: 「HNOI2008」玩具装箱 - 斜率优化 DP
categories: OI
tags: 
  - BZOJ
  - CodeVS
  - COGS
  - HNOI
  - 斜率优化
  - 单调队列
  - DP
permalink: hnoi2008-toy
date: 2016-04-24 11:23:41
---

P 教授有编号为 $ 1 $ ~ $ N $ 的 $ N $ 件玩具，第 $ i $ 件玩具经过压缩后变成一维长度为 $ C_i $。为了方便整理，P 教授要求在一个一维容器中的玩具编号是连续的。如果将第 $ i $ 件玩具到第 $ j $ 个玩具放到一个容器中，那么容器的长度将为 $ x = j - i + \sum\limits_{k = i} ^ j C_k $。如果容器长度为 $ x $。其制作费用为 $ (x - L) ^ 2 $。其中 $ L $ 是一个常量。P 教授不关心容器的数目，他可以制作出任意长度的容
器，甚至超过 $ L $。但他希望费用最小。

<!-- more -->

### 链接
[BZOJ 1010](http://www.lydsy.com/JudgeOnline/problem.php?id=1010)  
[CodeVS 1319](http://codevs.cn/problem/1319/)  
[COGS 1330](http://cogs.top/cogs/problem/problem.php?pid=1330)

### 题解
动态规划，设 $ f[i] $ 表示前 i 件玩具放进若干个容器中的最小费用，前缀和 $ s(n) = \sum\limits_{i = 1} ^ {n} C[i]  $。

转移时枚举前面多少个装在同一个箱子里，设它为 $ j $，则第 $ j + 1 $ ~ $ i $ 个装在同一个箱子里，长度为 $ i - j - 1 + s(i) - s(j) $，即

$$ f[i] = \min\limits_{j = 0} ^ {i - 1} \big \{ f[j] + (i - j - 1 + s(i) - s(j) - L) ^ 2 \big \} $$

直接计算的复杂度为 $ O(n ^ 2) $，超时，考虑优化。

设 $ g(i) = s(i) + i - L - 1 $，$ h(j) = s(j) + j $，上面的方程可以转化为

$$ f[i] = \min\limits_{j = 0} ^ {i - 1} \big \{ f[j] + \big [ g(i) - h(j) \big ] ^ 2 \big \} $$

考虑两个决策 $ j = a $ 和 $ j = b $（$ a > b $），若 a 比 b 优，当且仅当

$$
\begin{align*}
f[a] + \big [ g(i) - h(a) \big ] ^ 2 & < f[b] + \big [ g(i) - h(b) \big ] ^ 2 \\
f[a] + g(i) ^ 2 + h(a) ^ 2 - 2g(i)h(a) & < f[b] + g(i) ^ 2 + h(b) ^ 2 - 2g(i)h(b) \\
f[a] + h(a) ^ 2 - 2g(i)h(a) & < f[b] + h(b) ^ 2 - 2g(i)h(b) \\
(f[a] + h(a) ^ 2)  - (f[b] + h(b) ^ 2) & < 2g(i)h(a) - 2g(i)h(b) \\
(f[a] + h(a) ^ 2)  - (f[b] + h(b) ^ 2) & < 2g(i) \big [h(a) - h(b) \big ] \\
\frac{(f[a] + h(a) ^ 2)  - (f[b] + h(b) ^ 2)}{h(a) - h(b)} & < 2g(i) \\
\end{align*}
$$

左边成为了斜率的形式，三个式子都是单调的，因此可以用一个单调队列维护每个决策，保证最优决策在队首，两两决策点形成的斜率递增，每次状态转移复杂度降为 $ O(1) $，总时间复杂度为 $ O(n) $。

### 代码
```c++
#include <cstdio>

const int MAXN = 50000;

int n, L, a[MAXN];
long long s[MAXN + 1], f[MAXN + 1];

template <typename T> inline T sqr(const T &x) { return x * x; }

inline long long g(const int i) { return s[i] + i - L - 1; }
inline long long h(const int j) { return s[j] + j; }

inline double slope(const int a, const int b) {
    return double((f[a] + sqr(h(a))) - (f[b] + sqr(h(b)))) / double(h(a) - h(b));
}

int main() {
    scanf("%d %d", &n, &L);
    for (int i = 0; i < n; i++) scanf("%d", &a[i]);
    for (int i = 1; i <= n; i++) s[i] = s[i - 1] + a[i - 1];

    static long long q[MAXN];
    long long *l = q, *r = q - 1;
    *++r = 0;

    for (int i = 1; i <= n; i++) {
        while (l < r && slope(*(l + 1), *l) <= 2 * g(i)) l++;
        f[i] = f[*l] + sqr(g(i) - h(*l));
        while (l < r && slope(*r, *(r - 1)) > slope(i, *r)) r--;
        *++r = i;
    }

    printf("%lld\n", f[n]);

    return 0;
}
```
