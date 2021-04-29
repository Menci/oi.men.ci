title: 「SDOI2010」古代猪文 - 费马小定理 + Lucas + CRT
categories:
  - OI
tags:
  - BZOJ
  - CRT
  - Lucas 定理
  - SDOI
  - 费马小定理
permalink: sdoi2010-ancient
date: '2017-04-06 11:55:00'
---

远古时期猪王国有 $ n $ 个文字，现有的文字数量为远古时期的 $ 1 / k $（$ k $ 是 $ n $ 的一个正约数），剩余的 $ n / k $ 个文字有很多种情况，假设有 $ p $ 种情况，则研究这些文字的代价为 $ g ^ p $，求这个代价对 $ 999911659 $ 取模后的结果。

<!-- more -->

### 链接

[BZOJ 1951](http://www.lydsy.com/JudgeOnline/problem.php?id=1951)

### 题解

列出式子，答案为

$$ g ^ {\sum\limits_{d | n} C(n, \frac{n}{d})} \bmod 999911659 $$

模数 $ 999911659 $ 是指数，根据费马小定理，指数可以化为

$$ \sum\limits_{d | n} C(n, \frac{n}{d}) \bmod 999911658 $$

枚举 $ d $，转化为快速求组合数。对模数 $ 999911658 $ 分解质因数的结果为 $ \{ 2, 3, 4679, 35617 \} $，分别预处理在模这几个数意义下的阶乘及阶乘逆元，用 Lucas 定理计算出在模每个数意义下的组合数，并用 CRT 合并。

最后使用快速幂计算即可。

### 代码

```cpp
#include <cstdio>

const long long MOD = 999911659;
const long long MOD_FACTORS[] = { 2, 3, 4679, 35617 }; // Factors of 999911659 - 1
const int MAXN = 35617;

long long n;
long long fac[4][MAXN + 1], facInv[4][MAXN + 1];

inline void exgcd(long long a, long long b, long long &g, long long &x, long long &y) {
    if (!b) g = a, x = 1, y = 0;
    else exgcd(b, a % b, g, y, x), y -= x * (a / b);
}

inline long long inv(long long a, long long p) {
    long long g, res, tmp;
    exgcd(a, p, g, res, tmp);
    return (res % p + p) % p;
}

inline void prepare() {
    for (int i = 0; i < 4; i++) {
        int p = MOD_FACTORS[i];
        fac[i][0] = facInv[i][0] = 1;
        for (int j = 1; j <= MAXN; j++) {
            fac[i][j] = fac[i][j - 1] * j % p;
            facInv[i][j] = inv(fac[i][j], p);
        }
    }
}

inline long long C(int n, int k, int i) {
    if (!k) return 1;
    if (n < k) return 0;
    int p = MOD_FACTORS[i];
    // printf("C(%d, %d) %% %d = %lld\n", n, k, p, fac[i][n] * facInv[i][k] % p * facInv[i][n - k] % p);
    return fac[i][n] * facInv[i][k] % p * facInv[i][n - k] % p;
}

// mod MOD_FACTORS[i]
inline long long lucas(long long n, long long k, int i) {
    if (!k) return 1;
    int p = MOD_FACTORS[i];
    return C(n % p, k % p, i) * lucas(n / p, k / p, i) % p;
}

inline void crtMerge(long long a1, long long p1, long long a2, long long p2, long long &na, long long &np) {
    // x = a1 (mod p1)
    // x = a2 (mod p2)
    //
    // => x = a1 + p1 * t1
    //    x = a2 + p2 * t2
    //
    // => a1 + p1 * t1 = a2 + p2 * t2
    //    a1 - a2 = p2 * t2 - p1 * t1
    //
    // => g = gcd(p1, p2) = p2 * d2 - p1 * d1
    //    t2 = d2 * ((a1 - a2) / g)
    //    t1 = d1 * ((a1 - a2) / g)

    long long g, d1, d2;
    exgcd(p2, -p1, g, d2, d1);

    long long t2 = d2 * ((a1 - a2) / g);

    np = p1 / g * p2;
    if (np < 0) np = -np;
    na = ((a2 + p2 * t2) % np + np) % np;

    // printf("crtMerge((%lld, %lld), (%lld, %lld)) = (%lld, %lld)\n", a1, p1, a2, p2, na, np);
}

inline long long crt(const long long a[], const long long p[], int n) {
    long long a0 = a[0], p0 = p[0];
    for (int i = 1; i < n; i++) {
        long long na, np;
        crtMerge(a0, p0, a[i], p[i], na, np);
        a0 = na;
        p0 = np;
    }
    return a0;
}

inline long long addFactor(long long d) {
    long long a[4];
    for (int i = 0; i < 4; i++) {
        a[i] = lucas(n, n / d, i);
        // printf("C(%lld, %lld) = %lld\n", n, n / d, a[i]);
    }

    long long res = crt(a, MOD_FACTORS, 4);
    // printf("addFactor(%lld) = %lld\n", d, res);
    return res;
}

inline long long pow(long long a, long long n, long long p) {
    long long res = 1;
    for (; n; n >>= 1, a = a * a % p) if (n & 1) res = res * a % p;
    return res;
}

int main() {
    prepare();

    long long g;
    scanf("%lld %lld", &n, &g);

    if (g == MOD) {
        puts("0");
    } else {
        long long sum = 0;
        for (int d = 1; (long long)d * d <= n; d++) {
            if (n % d == 0) {
                sum += addFactor(d);
                if (d != n / d) sum += addFactor(n / d);

                sum %= (MOD - 1);
            }
        }

        long long ans = pow(g, sum, MOD);
        printf("%lld\n", ans);
    }
}
```