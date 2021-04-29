title: 线性筛法筛素数、莫比乌斯函数、欧拉函数
categories:
  - OI
tags:
  - 学习笔记
  - 数学
  - 数论
  - 算法模板
  - 线性筛
permalink: euler-sieve
date: '2016-04-08 13:14:55'
---

线性筛法（欧拉筛法）可以在 $ O(n) $ 的时间内获得 $ [1, n] $ 的所有素数。算法保证每个合数都会被它的最小质因子筛掉，所以复杂度是线性的。同时，我们可以利用这一特性，结合积性函数的性质，在 $ O(n) $ 的时间内筛出一些积性函数的值。

<!-- more -->

### 欧拉函数

欧拉函数 $ \varphi(n) $ 的定义为：小于 $ n $ 的正整数中与 $ n $ 互质的数的个数，$ \varphi(1) = 1 $。

当 $ n $ 为质数时，根据定义，显然有 $ \varphi(n) = n - 1 $。

设 $ n = p_1 ^ {k_1} \times p_2 ^ {k_2} \times … \times p_N ^ {k_N} $，其中 $ p_i $ 为素数，则有

$$ \varphi(n) = n \prod\limits_{i = 1} ^ {n} \frac{p_i - 1}{p_i} $$

设 $ p_1 $ 为 $ n $ 最小质因子，$ n' = \frac{n}{p_1} $，在线性筛中，$ n $ 通过 $ n' \times p_1 $ 被筛掉。

当 $ n' \ {\rm mod} \ p_1 = 0 $，即 $ k_1 \gt 1 $ 时，$ n' $ 含有 $ n $ 的所有质因子，则有

$$ \begin{align} \varphi(n) &= n \prod\limits_{i = 1} ^ {n} \frac{p_i - 1}{p_i} \\ &= p_1 \times n' \prod\limits_{i = 1} ^ {n} \frac{p_i - 1}{p_i} \\ &= p_1 \times \varphi(n') \\ \end{align} $$

当 $ n' \ {\rm mod} \ p_1 \neq 0 $，即 $ k_1 = 1 $ 时，$ n' $ 与 $ p_1 $ 互质，根据积性函数的性质有

$$ \begin{align} \varphi(n) &= \varphi(n') \times \varphi(p_1) \\ &= (p_1 - 1) \times \varphi(n') \end{align} $$

### 莫比乌斯函数

莫比乌斯函数 $ \mu(n) $ 的定义：

设 $ n = p_1 ^ {k_1} \times p_2 ^ {k_2} \times … \times p_N ^ {k_N} $，其中 $ p_i $ 为素数

$$ \mu(n) = \begin{cases} 1 & n = 1 \\ (-1) ^ N & \prod\limits_{i = 1} ^ {N} k_i = 1 \\ 0 & k_i \gt 1 \end{cases} $$

当 $ n $ 为质数时，根据定义，显然有 $ \mu(n) = -1 $。

设 $ p_1 $ 为 $ n $ 最小质因子，$ n' = \frac{n}{p_1} $，在线性筛中，$ n $ 通过 $ n' \times p_1 $ 被筛掉。

当 $ n' \ {\rm mod} \ p_1 = 0 $，即 $ k_1 \gt 1 $ 时，由定义得

$$ \mu(n) = 0 $$

当 $ n' \ {\rm mod} \ p_1 \neq 0 $，即 $ k_1 = 1 $ 时，$ n' $ 有 $ N - 1 $ 个质因子，此时我们分情况讨论，若 $ \mu(n') \neq 0 $，即 $ n' $ 的所有质因子次数均为 $ 1 $，根据定义有

$$ \begin{align} \mu(n) &= (-1) ^ N \\ &= (-1) ^ {N - 1} \times (-1) \\ &= \mu(n') \times (-1) \\ &= -\mu(n') \end{align} $$

若 $ \mu(n') = 0 $，说明 $ \prod\limits_{i = 2} ^ {N} k_i \gt 1 $，根据定义显然有

$$ \mu(n) = 0 $$

此时 $ \mu(n) = -\mu(n') $ 仍然成立。

### 模板

```cpp
bool isNotPrime[MAXN + 1];
int mu[MAXN + 1], phi[MAXN + 1], primes[MAXN + 1], cnt;
inline void euler()
{
    isNotPrime[0] = isNotPrime[1] = true;
    mu[1] = 1;
    phi[1] = 1;
    for (int i = 2; i <= MAXN; i++)
    {
        if (!isNotPrime[i])
        {
            primes[++cnt] = i;
            mu[i] = -1;
            phi[i] = i - 1;
        }

        for (int j = 1; j <= cnt; j++)
        {
            int t = i * primes[j];
            if (t > MAXN) break;

            isNotPrime[t] = true;

            if (i % primes[j] == 0)
            {
                mu[t] = 0;
                phi[t] = phi[i] * primes[j];
                break;
            }
            else
            {
                mu[t] = -mu[i];
                phi[t] = phi[i] * (primes[j] - 1);
            }
        }
    }
}
```