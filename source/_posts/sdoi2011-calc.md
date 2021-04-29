title: 「SDOI2011」计算器 - 快速幂 + EXGCD + BSGS
categories:
  - OI
tags:
  - BSGS
  - BZOJ
  - EXGCD
  - SDOI
  - 快速幂
  - 数学
permalink: sdoi2011-calc
date: '2016-06-13 12:07:00'
---

你被要求设计一个计算器完成以下三项任务：

1. 给定 $ y $、$ z $、$ p $，计算 $ y ^ z \bmod p $ 的值；
2. 给定 $ y $、$ z $、$ p $，计算满足 $ xy \equiv z \pmod p $ 的最小非负整数 $ x $；
3. 给定 $ y $、$ z $、$ p $，计算满足 $ y ^ x \equiv z \pmod p $的最小非负整数 $ x $。

<!-- more -->

### 链接

[BZOJ 2242](http://www.lydsy.com/JudgeOnline/problem.php?id=2242)

### 题解

第一种，快速幂。

第二种，当 $ y \equiv 0 \pmod p $ 且 $ z \not \equiv 0 \pmod p $ 时无解。
否则当 $ z \equiv 0 \pmod p $ 时答案为 $ 0 $。

其它情况，考虑 $ y $ 在模 $ p $ 意义下的乘法逆元

$$ x \equiv z \times y ^ {-1} \pmod p $$

EXGCD 求解逆元即可。

第三种，BSGS 求解离散对数。

### 代码

```cpp
#include <cstdio>
#include <cmath>
#include <tr1/unordered_map>

template <typename T>
inline T pow(const T a, const T n, const T p) {
    T ans = 1;
    for (T x = a, tmp = n; tmp; tmp >>= 1, x = x * x % p) if (tmp & 1) ans = ans * x % p;
    return ans;
}

template <typename T>
inline void exgcd(const T a, const T b, T &g, T &x, T &y) {
    if (!b) g = a, x = 1, y = 0;
    else exgcd(b, a % b, g, y, x), y -= x * (a / b);
}

template <typename T>
inline T inv(const T x, const T p) {
    T g, r, y;
    exgcd(x, p, g, r, y);
    return (r % p + p) % p;
}

template <typename T>
inline T bsgs(const T a, const T b, const T p) {
    if (a == 0) {
        return b == 0 ? 1 : -1;
    }

    std::tr1::unordered_map<T, T> map;
    T m = ceil(sqrt(static_cast<double>(p))), t = 1;
    for (int i = 0; i < m; i++) {
        if (!map.count(t)) map[t] = i;
        t = t * a % p;
    }

    T r = b, k = inv(t, p) % p;
    for (int i = 0; i < m; i++) {
        if (map.count(r)) return map[r] + i * m;
        r = r * k % p;
    }

    return -1;
}

int main() {
    int t, k;
    scanf("%d %d", &t, &k);
    while (t--) {
        long long a, b, p;
        scanf("%lld %lld %lld", &a, &b, &p);
        if (k == 1) {
            printf("%lld\n", pow(a, b, p));
        } else if (k == 2) {
            if (a > p && a % p == 0) puts("Orz, I cannot find x!");
            else {
                long long t = inv(a, p);
                printf("%lld\n", b * t % p);
            }
        } else if (k == 3) {
            long long ans = bsgs(a % p, b % p, p);
            if (ans == -1) puts("Orz, I cannot find x!");
            else printf("%lld\n", ans);
        }
    }

    return 0;
}
```