title: 乘法逆元的几种计算方法
categories:
  - OI
tags:
  - 乘法逆元
  - 学习笔记
  - 数学
  - 数论
  - 算法模板
permalink: mul-inverse
date: '2016-04-13 12:11:17'
---

乘法逆元是数论中重要的内容，也是 OI 中常用到的数论算法之一。所以，如何高效的求出乘法逆元是一个值得研究的问题。

这里我们只讨论当模数为素数的情况，因为如果模数不为素数，则不一定每个数都有逆元。

<!-- more -->

### 定义

在 $ {\rm mod} \ p $ 的意义下我们把 $ x $ 的乘法逆元写作 $ x ^ {-1} $。
乘法逆元有如下的性质：

$$ x \times x ^ {-1} \equiv 1 \pmod p $$

乘法逆元的一大应用是模意义下的除法，除法在模意义下并不是封闭的，但我们可以根据上述公式，将其转化为乘法。

$$ \frac{x}{y} \equiv x \times y ^ {-1} \pmod p $$

### 费马小定理

$$ a ^ {p - 1} \equiv 1 \pmod p $$

要求 $ p $ 为素数。

上述公式可变形为

$$ a \times a ^ {p - 2} \equiv 1 \pmod p $$

由乘法逆元的定义，$ a ^ {p - 2} $ 即为 $ a $ 的乘法逆元。

使用快速幂计算 $ a ^ {p - 2} $，总时间复杂度为 $ O(\log a) $。

#### 代码

```cpp
inline int pow(const int n, const int k) {
    long long ans = 1;
    for (long long num = n, t = k; t; num = num * num % MOD, t >>= 1) if (t & 1) ans = ans * num % MOD;
    return ans;
}

inline int inv(const int num) {
    return pow(num, MOD - 2);
}
```

### 扩展欧几里得

扩展欧几里得（EXGCD）算法可以在 $ O(\log \max(a, b)) $ 的时间内求出关于 $ x $、$ y $ 的方程

$$ ax + by = \gcd(a, b) $$

的一组整数解

当 $ b $ 为素数时，$ \gcd(a, b) = 1 $，此时有

$$ ax \equiv 1 \pmod b $$

时间复杂度为 $ O(\log a) $。

#### 代码

```cpp
void exgcd(const int a, const int b, int &g, int &x, int &y) {
    if (!b) g = a, x = 1, y = 0;
    else exgcd(b, a % b, g, y, x), y -= x * (a / b);
}

inline int inv(const int num) {
    int g, x, y;
    exgcd(num, MOD, g, x, y);
    return ((x % MOD) + MOD) % MOD;
}
```

### 递推法

设 $ p = k \times i + r $，（$ r < i $，$ 1 < i < p $），则有

$$ k \times i + r \equiv 0 \pmod p $$

两边同时乘上 $ r ^ {-1} + i ^ {-1} $，得

$$ k \times r ^ {-1} + i ^ {-1} \equiv 0 \pmod p $$

移项，得

$$ i ^ {-1} \equiv -k \times r ^ {-1} \pmod p $$

即

$$ i ^ {-1} \equiv - \lfloor \frac{p}{i} \rfloor \times (p \bmod i) ^ {-1} \pmod p $$

我们可以利用这个式子进行递推，边界条件为 $ 1 ^ {-1} \equiv 1 \pmod p $，时间复杂度为 $ O(n) $。

#### 代码

```cpp
inv[1] = 1;
for (int i = 2; i <= MAXN; i++) inv[i] = ((-(MOD / i) * inv[MOD % i]) % MOD + MOD) % MOD;
```