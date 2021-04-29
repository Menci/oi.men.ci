title: 「SDOI2016」排列计数 - 组合数学 + 错位排列
categories:
  - OI
tags:
  - BZOJ
  - COGS
  - SDOI
  - 数学
  - 组合数
  - 组合数学
  - 错位排列
permalink: sdoi2016-permutation
date: '2016-04-13 11:45:13'
---

求有多少种长度为 $ n $ 的序列 $ A $，满足以下条件：

* $ 1 $ ~ $ n $ 这 $ n $ 个数在序列中各出现了一次
* 若第 $ i $ 个数 $ A[i] $ 的值为 $ i $，则称 $ i $ 是稳定的。序列恰好有 $ m $ 个数是稳定的

满足条件的序列可能很多，序列数对 $ 10 ^ 9 + 7 $ 取模。

<!-- more -->

### 链接

[COGS 2224](http://cogs.top/cogs/problem/problem.php?pid=2224)  
[BZOJ 4517](http://www.lydsy.com/JudgeOnline/problem.php?id=4517)

### 题解

根据条件一，我们得知这是一个全排列。

对于条件二，我们可以先从 $ n $ 个数中选出 $ m $ 个，使它们的值是稳定的，然后使剩下的 $ n - m $ 全部错位排列。

设 $ f(i) $ 表示长度为 i 的序列的错位排列数，答案即为

$$ C(n, m) * f(n - m) $$

### 代码

```cpp
#include <cstdio>

const int MAXT = 500000;
const int MAXN = 1000000;
const int MAXM = 1000000;
const int MOD = 1e9 + 7;

long long fac[MAXN + 1], inv[MAXN + 1], facInv[MAXN + 1], f[MAXN + 1];

/*
inline int pow(const int n, const int k) {
    long long ans = 1;
    for (long long num = n, t = k; t; num = num * num % MOD, t >>= 1) if (t & 1) ans = ans * num % MOD;
    return ans;
}

void exgcd(const int a, const int b, int &g, int &x, int &y) {
    if (!b) g = a, x = 1, y = 0;
    else exgcd(b, a % b, g, y, x), y -= x * (a / b);
}

inline int inv(const int num) {
    int g, x, y;
    exgcd(num, MOD, g, x, y);
    return ((x % MOD) + MOD) % MOD;
}
*/

inline int C(const int n, const int k) {
    if (k == 0) return 1;
    return fac[n] * facInv[k] % MOD * facInv[n - k] % MOD;
}

inline void prepare() {
    fac[0] = 1;
    for (int i = 1; i <= MAXN; i++) fac[i] = fac[i - 1] * i % MOD;

    inv[1] = 1;
    for (int i = 2; i <= MAXN; i++) inv[i] = ((-(MOD / i) * inv[MOD % i]) % MOD + MOD) % MOD;

    facInv[0] = 1;
    for (int i = 1; i <= MAXN; i++) facInv[i] = facInv[i - 1] * inv[i] % MOD;

    f[0] = 0, f[1] = 0, f[2] = 1;
    for (int i = 3; i <= MAXN; i++) {
        f[i] = (i - 1) * (f[i - 1] + f[i - 2]) % MOD;
    }
}

inline int solve(const int n, const int m) {
    if (n < m || n == 0) return 0;
    else if (n == m) return 1;
    else {
        return C(n, m) * f[n - m] % MOD;
    }
}

int main() {
    freopen("menci_permutation.in", "r", stdin);
    freopen("menci_permutation.out", "w", stdout);

    prepare();

    int t;
    scanf("%d", &t);
    while (t--) {
        int n, m;
        scanf("%d %d", &n, &m);
        printf("%d\n", solve(n, m));
    }

    fclose(stdin);
    fclose(stdout);

    return 0;
}
```