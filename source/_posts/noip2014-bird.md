title: 「NOIP2014」飞扬的小鸟 - 背包 DP
categories:
  - OI
tags:
  - COGS
  - CodeVS
  - DP
  - NOIP
  - 背包 DP
permalink: noip2014-bird
date: '2016-10-08 17:06:00'
---

* 游戏界面是一个长为 $ n $，高为 $ m $ 的二维平面，其中有 $ k $ 个管道（忽略管道的宽度）。
* 小鸟始终在游戏界面内移动。小鸟从游戏界面最左边任意整数高度位置出发，到达游戏界面最右边时，游戏完成。
* 小鸟每个单位时间沿横坐标方向右移的距离为 $ 1 $，竖直移动的距离由玩家控制。如果点击屏幕，小鸟就会上升一定高度 $ X $，每个单位时间可以点击多次，效果叠加；如果不点击屏幕，小鸟就会下降一定高度 $ Y $。小鸟位于横坐标方向不同位置时，上升的高度 $ X $ 和下降的高度 $ Y $ 可能互不相同。
* 小鸟高度等于 $ 0 $ 或者小鸟碰到管道时，游戏失败。小鸟高度为 $ m $ 时，无法再上升。

现在,请你判断是否可以完成游戏。如果可以，输出最少点击屏幕数；否则，输出小鸟最多可以通过多少个管道缝隙。

<!-- more -->

### 链接

[COGS 1805](http://cogs.pro/cogs/problem/problem.php?pid=1805)  
[CodeVS 3729](http://codevs.cn/problem/3729/)

### 题解

动态规划，设 $ f(i, j) $ 表示飞到横坐标为 $ i $，纵座标为 $ j $ 处的最少屏幕点击次数。

考虑每一个状态是如何到达的 —— 可能是在横坐标 $ i - 1 $ 处点击 $ k $ 次屏幕，上升 $ k \times X $ 个单位高度后到达；也可能是不点击屏幕，下降 $ Y $ 个单位高度后到达。如果我们枚举 $ k $，则状态转移方程为

$$ f(i, j) = \min(\min\limits_k \{ f(i - 1, j - kX) \} + k, f(i - 1, j + Y)) $$

显然，每次状态转移的时间为 $ O(m) $，总时间复杂度为 $ O(nm ^ 2) $，会超时。

考虑「点击 $ k $ 次」和「点击 $ k - 1 $ 次」之间的联系，如果最优方案中，点击了 $ k $ 次到达纵坐标 $ j $，则如果点击 $ k - 1 $ 次，会到达纵坐标 $ j - X $，此时的状态转移方程（只考虑点击）为

$$ f(i, j) = \min(f(i - 1, j - X) + 1, f(i, j - X) + 1) $$

即，「只点击一次」和「从点击若干次到达的将要位置上再点击一次」。这是一种类似完全背包中「多装一个」的思想。

需要注意的是，使用优化后的状态转移方程计算时，不能简单地将障碍位置的答案直接置为正无穷 —— 考虑有一种情况，点击 $ k - 1 $ 次后会到达下方的管道的位置，而点击 $ k $ 次不会，而点击 $ k $ 次的答案需要由 $ k - 1 $ 次得到。解决方法是计算完一列的状态之后，将障碍区域的答案全部置为正无穷。

统计答案时，如果到达最右边一列某些位置的步数不为正无穷，则取这些中的最小值作为最小步数，否则扫描每一列，记录管道数量，直到「不可达」的一列为止。

### 代码

```cpp
#include <cstdio>
#include <climits>

const int MAXN = 10000;
const int MAXM = 1000;

struct Pipe {
    bool exist;
    int top, bottom;
} a[MAXN + 1];

int n, m, k, up[MAXN + 1], down[MAXN + 1];

template <typename T> bool cmin(T &a, const T &b) {
    return (a > b) ? (a = b, true) : false;
}

int main() {
    scanf("%d %d %d", &n, &m, &k);

    for (int i = 0; i < n; i++) {
        scanf("%d %d", &up[i], &down[i]);
    }

    while (k--) {
        int i;
        scanf("%d", &i);
        scanf("%d %d", &a[i].bottom, &a[i].top);
        a[i].exist = true;
    }

    static int f[MAXN + 1][MAXM + 1];
    // for (int i = 1; i <= m; i++) f[0][i] = 0;
    f[0][0] = INT_MAX;

    for (int i = 1; i <= n; i++) {
        f[i][0] = INT_MAX;
        for (int j = 1; j < m; j++) {
            f[i][j] = INT_MAX;
            // if (a[i].exist && (j <= a[i].bottom || j >= a[i].top)) continue;

            if (j >= up[i - 1]) {
                if (f[i - 1][j - up[i - 1]] != INT_MAX) cmin(f[i][j], f[i - 1][j - up[i - 1]] + 1);
                if (f[i][j - up[i - 1]] != INT_MAX) cmin(f[i][j], f[i][j - up[i - 1]] + 1);
            }

            /*
            if (j <= m - down[i - 1]) {
                if (f[i - 1][j + down[i - 1]] != INT_MAX) cmin(f[i][j], f[i - 1][j + down[i - 1]]);
            }
            */

#ifdef DBG
            printf("f[%d][%d] = %d\n", i, j, f[i][j]);
#endif
        }

        for (int j = 1; j <= m - down[i - 1]; j++) {
            // if (a[i].exist && (j <= a[i].bottom || j >= a[i].top)) continue;
            if (f[i - 1][j + down[i - 1]] != INT_MAX) cmin(f[i][j], f[i - 1][j + down[i - 1]]);
        }

        f[i][m] = INT_MAX;
        // if (a[i].exist) continue;
        for (int k = m - up[i - 1]; k <= m; k++) {
            if (f[i - 1][k] != INT_MAX) cmin(f[i][m], f[i - 1][k] + 1);
            if (f[i][k] != INT_MAX) cmin(f[i][m], f[i][k] + 1);
        }

        if (a[i].exist) for (int j = 1; j <= m; j++) if (j <= a[i].bottom || j >= a[i].top) f[i][j] = INT_MAX;
    }

    int clicks = INT_MAX;
    for (int i = 1; i <= m; i++) cmin(clicks, f[n][i]);

    if (clicks != INT_MAX) {
        printf("1\n%d\n", clicks);
    } else {
        int pos = -1;
        for (int i = n - 1; i >= 0; i--) {
            for (int j = 1; j <= m; j++) {
                if (f[i][j] != INT_MAX) {
                    pos = i;
                    break;
                }
            }
            if (pos != -1) break;
        }

        int pipeCnt = 0;
        for (int i = 1; i <= pos; i++) if (a[i].exist) pipeCnt++;

        printf("0\n%d\n", pipeCnt);
    }

    return 0;
}
```