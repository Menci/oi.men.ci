title: 「HAOI2008」硬币购物 - 背包 DP + 容斥原理
categories:
  - OI
tags:
  - BZOJ
  - DP
  - HAOI
  - 容斥原理
  - 数学
  - 背包 DP
permalink: haoi2008-coins
date: '2016-11-13 11:11:00'
---

一共有 $ 4 $ 种硬币。面值分别为 $ c_1, c_2, c_3, c_4 $。某人去商店买东西，去了 $ n $ 次。每次带 $ d_i $ 枚 $ c_i $ 硬币，买 $ s_i $ 的价格的东西。请问每次有多少种付款方法？

<!-- more -->

### 链接

[BZOJ 1042](http://www.lydsy.com/JudgeOnline/problem.php?id=1042)

### 题解

首先，求出不限制使用次数，购买价值为 $ c $ 时的方案数，设它为 $ f(c) $。

对于每次询问，我们可以用不限制使用次数，购买价值 $ s_i $ 的方案数，减去任意一种硬币超过限制的方案数。任意一种硬币超过限制的方案数可以使用容斥原理求出，即 —— 每一种硬币超过限制的方案数之和 \- 每两种硬币超过限制的方案数之和 \+ 每三种硬币超过限制的方案数之和 \- 四种硬币全部超过限制的方案数。

考虑如何求出第 $ i $ 种硬币超过限制的方案数 —— 我们至少要使用 $ d_i + 1 $ 个第 $ i $ 种硬币，剩余的 $ s - (d_i + 1) \times c_i $ 元可以任意选择，即 $ f(s - (d_i + 1) \times c_i) $。多种硬币同理。

### 代码

```cpp
#include <cstdio>

const int MAXN = 1000;
const int MAXM = 100000;

int main() {
    int c[4 + 1], n;
    scanf("%d %d %d %d %d", &c[1], &c[2], &c[3], &c[4], &n);

    static long long f[4 + 1][MAXM + 1];
    f[0][0] = 1;
    for (int i = 1; i <= 4; i++) {
        for (int j = 0; j <= MAXM; j++) {
            if (j < c[i]) f[i][j] = f[i - 1][j];
            else f[i][j] = f[i - 1][j] + f[i][j - c[i]];
        }
    }

    while (n--) {
        int d[4 + 1], m;
        scanf("%d %d %d %d %d", &d[1], &d[2], &d[3], &d[4], &m);

        long long ans = f[4][m];

        for (int i = 1; i <= 4; i++) {
            if (m - (d[i] + 1) * c[i] >= 0) ans -= f[4][m - (d[i] + 1) * c[i]];
        }

        for (int i = 1; i <= 4; i++) {
            for (int j = i + 1; j <= 4; j++) {
                if (m - (d[i] + 1) * c[i] - (d[j] + 1) * c[j] >= 0) ans += f[4][m - (d[i] + 1) * c[i] - (d[j] + 1) * c[j]];
            }
        }

        for (int i = 1; i <= 4; i++) {
            for (int j = i + 1; j <= 4; j++) {
                for (int k = j + 1; k <= 4; k++) {
                    if (m - (d[i] + 1) * c[i] - (d[j] + 1) * c[j] - (d[k] + 1) * c[k] >= 0) ans -= f[4][m - (d[i] + 1) * c[i] - (d[j] + 1) * c[j] - (d[k] + 1) * c[k]];
                }
            }
        }

        if (m - (d[1] + 1) * c[1] - (d[2] + 1) * c[2] - (d[3] + 1) * c[3] - (d[4] + 1) * c[4] >= 0) ans += f[4][m - (d[1] + 1) * c[1] - (d[2] + 1) * c[2] - (d[3] + 1) * c[3] - (d[4] + 1) * c[4]];

        printf("%lld\n", ans);
    }

    return 0;
}
```