title: 「HAOI2007」反素数 - 搜索
categories:
  - OI
tags:
  - BZOJ
  - HAOI
  - 搜索
  - 数学
permalink: haoi2007-ant
date: '2016-12-13 16:57:00'
---

对于任何正整数 $ x $，其约数的个数记作 $ g(x) $，例如 $ g(1) = 1 $、$ g(6) = 4 $。如果某个正整数 $ x $ 对于任何 $ i \in (0, x) $ 都满足 $ g(x) > g(i) $，则称 $ x $ 为反质数。

给定一个数 $ N $，求最大的不超过 $ N $ 的反质数。

<!-- more -->

### 链接

[BZOJ 1053](http://www.lydsy.com/JudgeOnline/problem.php?id=1053)

### 题解

一个反质数 $ x $ 一定是 $ [1, x] $ 内约数个数最多的数，并且不存在一个 $ y < x $ 使 $ y $ 的约数个数与 $ x $ 的相等。

所以，对于因子数量相同的数，较小的才有可能是反质数。由此可知，反质数的质因子一定是从 $ 2 $ 开始连续的若干个质数。

设 $ x $ 的唯一分解式为 $ x = 2 ^ {t_1} \times 3 ^ {t_2} \times \ldots \times p_k ^ {t_k} $。则 $ x $ 的约数个数 $ g(x) = \prod\limits_{i = 1} ^ k t_i $。假设存在一个 $ j $ 满足 $ p_j $ 和 $ p_{j + 1} $ 不是连续的质数，则令 $ p_{j + 1} $ 为 $ p_j $ 的下一个质数，$ p_{j + 2} \sim p_k $ 向后顺延，这样得到的唯一分解式中，$ \{ t_i \} $ 不变，而 $ x $ 变小了。上述推论得证。

所以，本题的答案的质因子一定是前若干个质数，通过计算可知，前 $ 11 $ 个质数（$ \{ 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31 \} $）的积大于 $ 2 \times 10 ^ 9 $。

搜索每个质数的次数，如果得到一个比当前答案约数数量更多的数，或者得到一个与当前答案约数数量相等但本身更小的数，则更新答案。

### 代码

```cpp
#include <cstdio>

const int MAXN = 2e9;

const int PRIMES[] = { 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31 };
const int PRIMES_CNT = 11;

int n, cntAns;
long long ans;

inline void search(int i, long long x, int cnt) {
    if (i == PRIMES_CNT) {
        if ((cnt == cntAns && x < ans) || (cnt > cntAns)) {
            ans = x;
            cntAns = cnt;
            // printf("%lld\n", ans);
        }
        return;
    }

    long long t = 1;
    for (int j = 0; x * t <= n; j++) {
        search(i + 1, x * t, cnt * (j + 1));
        t *= PRIMES[i];
    }
}

int main() {
    scanf("%d", &n);
    search(0, 1, 1);
    printf("%lld\n", ans);

    return 0;
}
```