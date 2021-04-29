title: 「TJOI2015」组合数学 - DP + 结论
categories:
  - OI
tags:
  - BZOJ
  - DP
  - TJOI
  - 结论
permalink: tjoi2015-math
date: '2017-02-21 11:18:00'
---

给出一个网格图，其中某些格子有财宝，每次从左上角出发，只能向下或右走。问至少走多少次才能将财宝捡完。此对此问题变形，假设每个格子中有好多财宝，而每一次经过一个格子至多只能捡走一块财宝，至少走多少次才能把财宝全部捡完。

<!-- more -->

### 链接

[BZOJ 3997](http://www.lydsy.com/JudgeOnline/problem.php?id=3997)

### 题解

结论题。

> 答案是，满足每一个点都在前一个点的严格右下方的最长链长度。

所以，从右上角到左下角做一遍以下 DP 即可。

$$ f(i, j) = \max(f(i - 1, j + 1) + w(i, j), f(i - 1, j), f(i, j + 1)) $$

答案即为 $ f(n, 0) $。

### 代码

```cpp
#include <cstdio>
#include <cstring>
#include <algorithm>

const int MAXN = 1000;

int main() {
    int T;
    scanf("%d", &T);
    while (T--) {
        int n, m;
        scanf("%d %d", &n, &m);

        static int a[MAXN + 1][MAXN + 1];
        for (int i = 1; i <= n; i++) {
            for (int j = 1; j <= m; j++) {
                scanf("%d", &a[i][j]);
            }
        }

        static int dp[MAXN + 1][MAXN + 1];
        memset(dp, 0, sizeof(dp));

        for (int i = 1; i <= n; i++) {
            for (int j = m; j >= 1; j--) {
                dp[i][j] = std::max(dp[i - 1][j + 1] + a[i][j], std::max(dp[i - 1][j], dp[i][j + 1]));
            }
        }

        printf("%d\n", dp[n][1]);
    }

    return 0;
}
```