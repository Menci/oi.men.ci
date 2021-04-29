title: 离散对数与 BSGS
categories:
  - OI
tags:
  - BSGS
  - 学习笔记
  - 数学
  - 离散对数
  - 算法模板
permalink: bsgs-notes
date: '2016-06-13 11:52:00'
---


对于给定的 $ a $、$ b $、$ p $ 存在一个 $ x $，使得

$$ a ^ x \equiv b \pmod p $$

则称 $ x $ 为 $ b $ 在模 $ p $ 意义下以 $ a $ 为底的**离散对数**。

<!-- more -->

### 性质

离散对数有类似于一般的对数的性质

$$ \begin{aligned} \log_g x + \log_g y &\equiv \log_g xy \pmod p \\ \log_g x ^ y &\equiv y \log_g x \pmod p \end{aligned} $$

### BSGS

求解离散对数问题常用的算法是 BSGS（Baby-Step Giant-Step）。

我们需要求解的方程为（$ p $ 为质数）

$$ a ^ x \equiv b \pmod p $$

令 $ m = \lceil \sqrt p \rceil $。
根据费马小定理，有 $ a ^ {p - 1} \equiv 1 \pmod p $，故若方程有解，则必然存在一个 $ 0 \leq x < p - 1 $。

设 $ x = im + j $，其中 $ 0 \leq i,\ j \leq m $。

方程可化为

$$ \begin{align*} a ^ {x} &\equiv b \pmod p \\ a ^ {im + j} &\equiv b \pmod p \\ a ^ {j} &\equiv b \times a ^ {-im} \pmod p \\ a ^ {j} &\equiv b \times (a ^ {-m}) ^ i \pmod p \end{align*} $$

我们只需要找到一组 $ i $、$ j $ 使得最后一个式子成立即可。

枚举 $ j $，递推出左边 $ a ^ j \bmod p $ 的所有取值，并将其按照 $ (a ^ j \bmod p) \mapsto j $ 的映射关系插入到哈希表中。

之后，求出 $ a ^ m \bmod p $ 的乘法逆元，即 $ a ^ {-m} \bmod p $。枚举 $ i $，递推出所有的 $ b \times (a ^ {-m}) ^ i $，每得到一个值后，从哈希表中查找该值，如果存在，取出其对应的 $ j $，$ x = im + j $ 即为一个解。

时间复杂度为 $ O(\sqrt p) $。

#### 模板

```cpp
inline void exgcd(long long a, long long b, long long &g, long long &x, long long &y)
{
    if (!b) g = a, x = 1, y = 0;
    else exgcd(b, a % b, g, y, x), y -= x * (a / b);
}

inline long long inv(long long x, long long p)
{
    long long g, r, y;
    exgcd(x, p, g, r, y);
    return (r % p + p) % p;
}

inline long long bsgs(long long a, long long b, long long p)
{
    if (a == 0) return b == 0 ? 1 : -1;

    std::map<long long, long long> map;

    long long m = ceil(sqrt(p)), t = 1;
    for (int i = 0; i < m; i++)
    {
        if (!map.count(t)) map[t] = i;
        t = t * a % p;
    }

    long long k = inv(t, p), w = b;
    for (int i = 0; i < m; i++)
    {
        if (map.count(w)) return i * m + map[w];
        w = w * k % p;
    }

    return -1;
}
```

### EXBSGS

用 BSGS 求解离散对数需要 $ p $ 为质数，因为算法中用到了 $ a $ 的乘法逆元。实际上，只要 $ \gcd(a,\ p) = 1 $ 成立即可。

考虑方程

$$ a ^ x \equiv b \pmod p $$

将它写成二元不定方程的形式

$$ a ^ x = b + kp $$

令 $ d = \gcd(a,\ p) $，若 $ d \mid b $，则有

$$ a ^ {x - 1} \frac{a}{d} = \frac{b}{d} + k \frac{p}{d} $$

即

$$ a ^ {x - 1} \frac{a}{d} \equiv \frac{b}{d} \pmod { \frac{p}{d} } $$

此时 $ \gcd(\frac{a}{d},\ \frac{p}{d}) = 1 $，可以求出 $ \frac{a}{d} $ 的乘法逆元，乘到右边去

$$ a ^ {x - 1} \equiv \frac{b}{d} \times (\frac{a}{d}) ^ {-1} \pmod { \frac{p}{d} } $$

至此，问题转化为规模更小的子问题，继续如上过程直到 $ d = 1 $ 时调用 BSGS 求解即可。若过程中出现 $ d \not \mid b $ 则无解，若 $ b = 1 $ 则答案为 $ 0 $（加上之前所有减去的 $ 1 $）。

#### 模板

```cpp
inline long long exbsgs(long long a, long long b, long long p)
{
    long long t, c = 0;
    while ((t = std::__gcd(a, p)) != 1)
    {
        if (b == 1) return c;
        if (b % t != 0) return -1;
        p /= t;
        b = b / t * inv(a / t, p) % p;
        c++;
    }

    long long r = bsgs(a, b, p);
    if (r == -1) return -1;
    else return r + c;
}
```