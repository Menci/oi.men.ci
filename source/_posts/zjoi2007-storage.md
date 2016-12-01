title: 「ZJOI2007」仓库建设 - 斜率优化 DP
categories: OI
tags: 
  - BZOJ
  - COGS
  - ZJOI
  - 斜率优化
  - 单调队列
  - DP
permalink: zjoi2007-storage
date: 2016-05-18 11:58:00
---

第 $ i $ 个工厂目前已有成品 $ P_i $ 件，在第 $ i $ 个位置建立仓库的费用是 $ C_i $。对于没有建立仓库的工厂，其产品应被运往其他的仓库进行储藏，而由于公司产品的对外销售处设置在山脚的工厂 $ N $，故产品只能往山下运（即只能运往编号更大的工厂的仓库），当然运送产品也是需要费用的，假设一件产品运送 $ 1 $ 个单位距离的费用是 $ 1 $。假设建立的仓库容量都都是足够大的，可以容下所有的产品。你将得到以下数据：

1. 工厂 $ i $ 距离工厂 $ 1 $ 的距离 $ x_i $（其中 $ x_1 = 0 $）；
2. 工厂 $ i $ 目前已有成品数量 $ p_i $；
3. 在工厂 $ i $ 建立仓库的费用 $ c_i $。

请你帮助公司寻找一个仓库建设的方案，使得总的费用（建造费用 + 运输费用）最小。

<!-- more -->

### 链接
[BZOJ 1096](http://www.lydsy.com/JudgeOnline/problem.php?id=1096)  
[COGS 367](http://cogs.top/cogs/problem/problem.php?pid=367)

### 题解
将整个序列翻转，变为从编号大的运往编号小的，设 $ S(i) $ 表示前 $ i $ 个工厂全部运到 $ 1 $ 号工厂的费用，$ s(i) $ 表示前 $ i $ 个工厂的成品总数量。

设 $ f(i) $ 表示前 i 个工厂处理完成的最小花费，则

$$ f(i) = \min\limits_{j = 0} ^ {i - 1} \{ f(j) + c(j + 1) + S(i) - S(j) - (s(i) - s(j)) \times d(j + 1) \} $$

斜率优化，考虑两个决策 $ a $、$ b $（$ a > b $），若 $ a $ 比 $ b $ 优，则有

$$
\begin{align*}
f(a) + c(a + 1) + S(i) - S(a) - (s(i) - s(a)) \times d(a + 1) & < f(b) + c(b + 1) + S(i) - S(b) - (s(i) - s(b)) \times d(b + 1) \\
f(a) + c(a + 1) - S(a) - (s(i) - s(a)) \times d(a + 1) & < f(b) + c(b + 1) - S(b) - (s(i) - s(b)) \times d(b + 1) \\
f(a) + c(a + 1) - S(a) - s(i) \times d(a + 1) - s(a) \times d(a + 1) & < f(b) + c(b + 1) - S(b) - s(i) \times d(b + 1) - s(b) \times d(b + 1) \\
(f(a) + c(a + 1) - S(a) - s(a) \times d(a + 1)) - (f(b) + c(b + 1) - S(b) - s(b) \times d(b + 1)) & < s(i) \times d(a + 1) - s(i) \times d(b + 1) \\
(f(a) + c(a + 1) - S(a) - s(a) \times d(a + 1)) - (f(b) + c(b + 1) - S(b) - s(b) \times d(b + 1)) \over d(a + 1) - d(b + 1) & < s(i) \\
\end{align*}
$$

维护决策点，使斜率递增，最优决策取队首。时间复杂度为 $ O(n) $。

### 代码
```c++
#include <cstdio>
#include <climits>
#include <algorithm>
 
const int MAXN = 1000000;
 
int n;
long long d[MAXN + 1], p[MAXN + 1], c[MAXN + 1];
long long s[MAXN + 1], S[MAXN + 1];
long long f[MAXN + 1];
 
inline void prepare() {
    std::reverse(p + 1, p + n + 1);
    std::reverse(c + 1, c + n + 1);
    for (int i = n; i >= 1; i--) d[i] -= d[i - 1];
    std::reverse(d + 2, d + n + 1);
    for (int i = 1; i <= n; i++) d[i] += d[i - 1];
 
    for (int i = 1; i <= n; i++) {
        s[i] = s[i - 1] + p[i];
        S[i] = S[i - 1] + p[i] * d[i];
    }
}
 
/*
inline void force() {
    std::fill(f, f + n + 1, LLONG_MAX);
    f[0] = 0;
    for (int i = 1; i <= n; i++) {
        int _j = -1;
        for (int j = 0; j < i; j++) {
            if (f[i] > f[j] + c[j + 1] + S[i] - S[j] - (s[i] - s[j]) * d[j + 1]) {
                f[i] = f[j] + c[j + 1] + S[i] - S[j] - (s[i] - s[j]) * d[j + 1];
                _j = j;
            }
        }
        // printf("%d --> %d\n", i, _j);
    }
}
*/
 
inline long long x(const int i) { return f[i] + c[i + 1] - S[i] + s[i] * d[i + 1]; }
 
inline double slope(const int a, const int b) {
    // printf("slope(%d, %d) = %.4lf\n", a, b, double(x(a) - x(b)) / double(d[a + 1] - d[b + 1]));
    return double(x(a) - x(b))
         / double(d[a + 1] - d[b + 1]);
}
 
inline void dp() {
    std::fill(f, f + n + 1, LLONG_MAX);
    f[0] = 0;
 
    static int q[MAXN + 1];
    int *l = q, *r = q;
    *r = 0;
 
    for (int i = 1; i <= n; i++) {
        while (l < r && slope(*(l + 1), *l) < s[i]) l++;
 
        // if (l < r) {
        //     printf("%lld %lld\n", f[*l] + c[*l + 1] + S[i] - S[*l] - (s[i] - s[*l]) * d[*l + 1], f[*(l + 1)] + c[*(l + 1) + 1] + S[i] - S[*(l + 1)] - (s[i] - s[*(l + 1)]) * d[*(l + 1) + 1]);
        // }
 
        int &j = *l;
        f[i] = f[j] + c[j + 1] + S[i] - S[j] - (s[i] - s[j]) * d[j + 1];
        // printf("%d --> %d\n", i, j);
 
        if (i < n) {
            while (l < r && slope(*r, *(r - 1)) > slope(i, *r)) r--;
            *++r = i;
        }
    }
}
 
int main() {
    scanf("%d", &n);
 
    for (int i = 1; i <= n; i++) {
        scanf("%lld %lld %lld", &d[i], &p[i], &c[i]);
    }
 
    prepare();
 
    // force();
    dp();
    printf("%lld\n", f[n]);
 
    return 0;
}
```
