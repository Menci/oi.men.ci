title: 「NOIP2016」组合数问题 - 递推 + 前缀和
categories:
  - OI
tags:
  - NOIP
  - 前缀和
  - 数学
  - 组合数
permalink: noip2016-problem
date: '2016-11-29 20:54:00'
---

组合数表示的是从 $ n $ 个物品中选出 $ m $ 个物品的方案数。举个例子，从 $ (1, 2, 3) $ 三个物品中选择两个物品可以有 $ (1, 2) $，$ (1, 3) $，$ (2, 3) $ 这三种选择方法。

根据组合数的定义，我们可以给出计算组合数的一般公式：

$$ C_n ^ m = \frac{n!}{m!(n - m)!} $$

其中 $ n! = 1 \times 2 \times \cdots \times n $。

小葱想知道如果给定 $ n $，$ m $ 和 $ k $，对于所有的 $ 0 \leq i \leq n $，$ 0 \leq j \leq \min(i, m) $ 有多少对 $ (i, j) $ 满足是 $ k $ 的倍数。

<!-- more -->

### 链接

[Luogu 2822](https://www.luogu.org/problem/show?pid=2822)  
[LYOI #102](https://ly.men.ci/problem/102)

### 题解

根据 Pascal 定理，有

$$ C_n ^ m = C_{n - 1} ^ {m - 1} + C_{n - 1} ^ {m} $$

预处理出每个 $ C_i ^ j \bmod k $，前缀和 $ s(u, i) $ 统计对于 $ 1 \leq j \leq i $，有多少 $ C_u ^ j \bmod k = 0 $。每次询问 $ O(n) $ 的在前缀和中求和即可。

### 代码

```cpp
#include <cstdio>
#include <cstring>
#include <algorithm>

const int MAXN = 2000 + 10;

int C[MAXN + 1][MAXN + 1], cnt[MAXN + 1][MAXN + 1];

int main() {
    freopen("problem.in", "r", stdin);
    freopen("problem.out", "w", stdout);

    int t, k;
    scanf("%d %d", &t, &k);

    for (int i = 1; i <= MAXN; i++) {
        C[i][0] = C[i][i] = 1;
        for (int j = 1; j < i; j++) {
            C[i][j] = (C[i - 1][j] + C[i - 1][j - 1]) % k;
        }

        for (int j = 1; j <= i; j++) {
            cnt[i][j] = cnt[i][j - 1];
            if (C[i][j] == 0) cnt[i][j]++;
        }
    }

    while (t--) {
        int n, m;
        scanf("%d %d", &n, &m);

        int ans = 0;
        for (int i = 1; i <= n; i++) {
            ans += cnt[i][std::min(i, m)];
        }

        printf("%d\n", ans);
    }

    fclose(stdin);
    fclose(stdout);

    return 0;
}
```