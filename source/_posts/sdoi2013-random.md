title: 「SDOI2013」随机数生成器 - 数学 + BSGS
categories:
  - OI
tags:
  - BSGS
  - BZOJ
  - SDOI
  - 数学
  - 数论
permalink: sdoi2013-random
date: '2017-04-06 11:33:00'
---

给定 $ p $、$ a $、$ b $、$ x_1 $，现有一数列

$$ x_{i + 1} = (ax_i + b) \bmod p $$

求最小的 $ i $ 满足 $ x_i = t $。

<!-- more -->

### 链接

[BZOJ 3122](http://www.lydsy.com/JudgeOnline/problem.php?id=3122)

### 题解

$$ \begin{aligned} x_i &\equiv ax_{i - 1} + b &&\pmod p \\ &\equiv a(ax_{i - 2} + b) + b &&\pmod p \\ &\equiv a(a(ax_{i - 3} + b) + b) + b &&\pmod p \\ &\equiv a ^ 3 x_{i - 3} + a ^ 2 b + ab + b &&\pmod p \\ &\equiv a ^ k x_{i - k} + \sum\limits_{j = 0} ^ {k - 1} a ^ j b &&\pmod p \\ \end{aligned} $$

令 $ k = i - 1 $，得

$$ \begin{aligned} x_i &\equiv a ^ {i - 1} x_{i - (i - 1)} + \sum\limits_{j = 0} ^ {i - 2} a ^ j b &&\pmod p \\ &\equiv a ^ {i - 1} x_1 + \sum\limits_{j = 0} ^ {i - 2} a^ j b &&\pmod p \\ \end{aligned} $$

当 $ a = 1 $ 时

$$ \begin{aligned} x_i &\equiv x_1 + (i - 1)b &&\pmod p \\ \frac{x_i - x_1}{b} + 1 &\equiv i &&\pmod p \end{aligned} $$

否则，设 $ f(n) = \sum\limits_{i = 0} ^ {i - 2} a ^ i $

$$ \begin{aligned} f(i) &= 1 + a + a ^ 2 + \cdots + a ^ {i - 3} + a ^ {i - 2} \\ af(i) &= \ \ \ \ \ \ \ a + a ^ 2 + \cdots + a ^ {i - 3} + a ^ {i - 2} + a ^ {i - 1} \\ (1 - a)f(i) &= 1 - a ^ {i - 1} \\ f(i) &= \frac{1 - a ^ {i - 1}}{1 - a} \end{aligned} $$

令 $ q = (1 - a) ^ {-1} $ 代入得

$$ \begin{aligned} x_i &\equiv a ^ {i - 1} x_1 + bq(1 - a ^ {i - 1}) &&\pmod p \\ &\equiv a ^ {i - 1} x_1 + bq - a ^ {i - 1} bq &&\pmod p \\ \\ x_i - bq &\equiv a ^ {i - 1} x_1 - a ^ {i - 1} bq &&\pmod p \\ x_i - bq &\equiv a ^ {i - 1} (x_1 - bq) &&\pmod p \\ \\ a ^ {i - 1} &\equiv \frac{x_i - bq}{x_1 - bq} &&\pmod p \end{aligned} $$

未知量只有左边 $ a $ 的指数，使用 BSGS 求出即可。

### 代码

```cpp
#include <cstdio>
#include <cmath>
#include <map>

inline void exgcd(long long a, long long b, long long &g, long long &x, long long &y) {
    if (!b) g = a, x = 1, y = 0;
    else exgcd(b, a % b, g, y, x), y -= x * (a / b);
}

inline long long inv(long long x, long long p) {
    long long g, res, tmp;
    exgcd(x, p, g, res, tmp);
    return (res % p + p) % p;
}

inline long long bsgs(long long a, long long b, long long p) {
    a %= p;
    b %= p;
    /*
    long long tmp = 1;
    for (int i = 1; i <= p; i++) {
        if (tmp == b) return i - 1;
        tmp = tmp * a % p;
    }
    return -1;
    */

    std::map<long long, long long> map;
    long long m = ceil(sqrt(p)), t = 1;
    for (int i = 0; i < m; i++) {
        if (!map.count(t)) map[t] = i;
        t = t * a % p;
    }

    long long k = inv(t, p), w = b;
    for (int i = 0; i < m; i++) {
        if (map.count(w)) return i * m + map[w];
        w = w * k % p;
    }

    return -1;
}

inline long long solve(long long p, long long a, long long b, long long x1, long long t) {
    if (t == x1) return 1;
    else if (a == 0) return b == t ? 2 : -1;
    else if (a == 1) {
        if (!b) return -1;
        return ((((t - x1) % p + p) % p) * inv(b, p) % p) + 1;
    } else {
        long long q = inv(1 - a + p, p);
        long long d = (((t - b * q) % p + p) % p) * inv(((x1 - b * q) % p + p) % p, p);
        long long ans = bsgs(a, d, p);
        if (ans == -1) return -1;
        else return ans + 1;
    }
}

inline long long force(int p, int a, int b, int x1, int t) {
    if (a == 1) {
        if (!b) return -1;
        return ((((t - x1) % p + p) % p) * inv(b, p) % p) + 1;
    }

    /*
    int x = x1;
    for (int i = 1; i <= p; i++) {
        // printf("a[%d] = %d\n", i, x);
        if (x == t) return i;
        x = (a * x + b) % p;
    }
    return -1;
    */

    long long q = inv(1 - a + p, p), ai = 1;
    /*
    for (int i = 1; i <= p; i++) {
        long long x = (ai * (((x1 - b * q) % p + p) % p) + b * q % p) % p;
        // printf("a[%d] = %lld\n", i, x);
        if (x == t) return i;
        ai = (ai * a) % p;
    }
    return -1;
    */

    long long tmp = (((t - b * q) % p + p) % p) * inv(((x1 - b * q) % p + p) % p, p) % p;
    for (int i = 1; i <= p; i++) {
        if (ai == tmp) return i;
        ai = (ai * a) % p;
    }

    return -1;
}

int main() {
    int T;
    scanf("%d", &T);
    while (T--) {
        int p, a, b, x1, t;
        scanf("%d %d %d %d %d", &p, &a, &b, &x1, &t);
        printf("%lld\n", solve(p, a, b, x1, t));
    }
}
```