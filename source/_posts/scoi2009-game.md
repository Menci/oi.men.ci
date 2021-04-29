title: 「SCOI2009」游戏 - 群论 + 背包 DP
categories:
  - OI
tags:
  - BZOJ
  - DP
  - SCOI
  - 数学
  - 群论
  - 背包 DP
permalink: scoi2009-game
date: '2016-11-13 08:24:00'
---

windy 学会了一种游戏。对于 $ 1 $ 到 $ N $ 这 $ N $ 个数字，都有唯一且不同的 $ 1 $ 到 $ N $ 的数字与之对应。最开始 windy 把数字按顺序 $ 1, 2, 3, \ldots, N $ 写一排在纸上。然后再在这一排下面写上它们对应的数字。然后又在新的一排下面写上它们对应的数字。如此反复，直到序列再次变为 $ 1, 2, 3, \ldots, N $。

如：$ 1, 2, 3, 4, 5, 6 $ 对应的关系为

$$ \begin{cases} 1 \rightarrow 2 \\ 2 \rightarrow 3 \\ 3 \rightarrow 1 \\ 4 \rightarrow 5 \\ 5 \rightarrow 4 \\ 6 \rightarrow 6 \end{cases} $$

windy 的操作如下：

$$ \begin{gather} 1, 2, 3, 4, 5, 6 \\ \downarrow \\ 2, 3, 1, 5, 4, 6 \\ \downarrow \\ 3, 1, 2, 4, 5, 6 \\ \downarrow \\ 1, 2, 3, 5, 4, 6 \\ \downarrow \\ 2, 3, 1, 4, 5, 6 \\ \downarrow \\ 3, 1, 2, 5, 4, 6 \\ \downarrow \\ 1, 2, 3, 4, 5, 6 \end{gather} $$

这时，我们就有若干排 $ 1 $ 到 $ N $ 的排列，上例中有 $ 7 $ 排。现在 windy 想知道，对于所有可能的对应关系，有多少种可能的排数。

<!-- more -->

### 链接

[BZOJ 1025](http://www.lydsy.com/JudgeOnline/problem.php?id=1025)

### 题解

对于一个置换，我们可以将其分解为若干个循环，问题中的「排数」即为这些循环长度的最小公倍数。设这些循环长度分别为

$$ \{ x_1, x_2, \ldots, x_m \} $$

对于某个 $ x_k $ 的一个质因子 $ p $，它对 $ \mathrm{lcm}(x_1, x_2, \ldots, x_m) $ 有贡献，当且仅当 $ p $ 在 $ x_k $ 的唯一分解式中的次数是所有 $ x_i $ 中最大的。

为了便于统计，我们只考虑每个 $ x_i $ 都是不同的质数的幂的情况（暂不考虑 $ x_i = 1 $ 的情况）

$$ \begin{cases} x_1 = p_1 ^ {k_1} \\ x_2 = p_2 ^ {k_2} \\ \cdots \\ x_m = p_m ^ {k_m} \end{cases} $$

这种情况下，$ \mathrm{lcm}(x_1, x_2, \ldots, x_m) = x_1 \times x_2 \times \ldots \times x_m $。而 $ \{ x_1. x_2, \ldots, x_m \} $ 是一组合法的循环长度，当且仅当 $ x_1 + x_2 + \ldots + x_m = n $。因为我们可以任意添加长度为 $ 1 $ 的循环，而不对其最小公倍数产生影响，所以 $ x_1 + x_2 + \ldots + x_m \leq n $ 即为合法方案。

现在的问题变成，有一些质数 $ p_i $，每个质数可以不选，也可以选择一个特定的幂 $ p_i ^ {k_i} $。要求最终选择的所有数之和 $ \leq n $，求方案总数。这个问题可以转化为分组背包的方案计数问题 —— 第 $ i $ 组物品体积为 $ p_i ^ 1, p_i ^ 2, \ldots p_i ^ {k_i} $（$ p_i ^ {k_i} \leq n $），背包容量为 $ n $。

### 代码

```cpp
#include <cstdio>

const int MAXN = 1000;

int primes[MAXN], isNotPrime[MAXN + 1], cnt;

inline void getPrimes() {
    isNotPrime[0] = isNotPrime[1] = true;
    for (int i = 2; i <= MAXN; i++) {
        if (!isNotPrime[i]) {
            primes[++cnt] = i;
        }
        for (int j = 1; j <= cnt && i * primes[j] <= MAXN; j++) {
            isNotPrime[i * primes[j]] = true;
            if (i % primes[j] == 0) break;
        }
    }
    // for (int i = 0; i < cnt; i++) printf("%d\n", primes[i]);
}

int main() {
    int n;
    scanf("%d", &n);

    getPrimes();

    static long long f[MAXN + 1][MAXN + 1];
    f[0][0] = 1;
    for (int i = 1; i <= cnt; i++) {
        for (int k = 0; k <= n; k++) f[i][k] = f[i - 1][k];
        for (int p = primes[i]; p <= n; p *= primes[i]) {
            for (int k = p; k <= n; k++) {
                f[i][k] += f[i - 1][k - p];
            }
        }
        // for (int k = 0; k <= n; k++) printf("f[%d][%d] = %d\n", i, k, f[i][k]);
    }

    long long ans = 0;
    for (int i = 0; i <= n; i++) ans += f[cnt][i];
    printf("%lld\n", ans);

    return 0;
}
```