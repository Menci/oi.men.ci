title: 「HAOI2007」理想的正方形 - 单调队列
categories:
  - OI
tags:
  - BZOJ
  - HAOI
  - 单调队列
permalink: haoi2007-square
date: '2016-12-02 07:16:00'
---

有一个 $ n \times m $ 的整数组成的矩阵，现请你从中找出一个 $ k \times k $ 的正方形区域，使得该区域所有数中的最大值和最小值的差最小。

<!-- more -->

### 链接

[BZOJ 1047](http://www.lydsy.com/JudgeOnline/problem.php?id=1047)

### 题解

对每一行应用单调队列，求出 $ b(i, j) = \max\limits_{t = j - k + 1} ^ j a(i, t) $（即每个数向左 $ k $ 个数以内的最大值）。对每一列应用单调队列，求出 $ c(i, j) = \max\limits_{t = i - k + 1} ^ i b(t, j) $（即每个数向上 $ k $ 个数以内的最大值）。两次操作的结果是每个数向上 $ k $ 个数以内的每个数向左 $ k $ 个数以内的最大值，即一个 $ k \times k $ 的正方形的最大值。

用相同的方法求出最小值，枚举每个 $ k \times k $ 的正方形，即可得到答案。

### 代码

```cpp
#include <cstdio>
#include <climits>
#include <algorithm>
#include <functional>

const int MAXN = 1000;

int n, m, k, a[MAXN + 1][MAXN + 1];

template <typename T>
inline void workColumns(int a[MAXN + 1][MAXN + 1], int b[MAXN + 1][MAXN + 1], T comp) {
    static int q[MAXN + 1];
    for (int i = 1; i <= n; i++) {
        int *l = q, *r = q - 1;
        for (int j = 1; j <= m; j++) {
            while (l <= r && j - *l >= k) l++;
            while (l <= r && comp(a[i][j], a[i][*r])) r--;
            *++r = j;
            b[i][j] = a[i][*l];
#ifdef DBG
            printf("%d%c", b[i][j], j == m ? '\n' : ' ');
#endif
        }
    }
}

template <typename T>
inline void workRows(int a[MAXN + 1][MAXN + 1], int b[MAXN + 1][MAXN + 1], T comp) {
    static int q[MAXN + 1];
    for (int i = 1; i <= m; i++) {
        int *l = q, *r = q - 1;
        for (int j = 1; j <= n; j++) {
            while (l <= r && j - *l >= k) l++;
            while (l <= r && comp(a[j][i], a[*r][i])) r--;
            *++r = j;
            b[j][i] = a[*l][i];
        }
    }
#ifdef DBG
    for (int i = 1; i <= n; i++) for (int j = 1; j <= m; j++) printf("%d%c", b[i][j], j == m ? '\n' : ' ');
#endif
}

int main() {
    scanf("%d %d %d", &n, &m, &k);

    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= m; j++) {
            scanf("%d", &a[i][j]);
        }
    }

    static int columnMax[MAXN + 1][MAXN + 1], rowMax[MAXN + 1][MAXN + 1];
    workColumns(a, columnMax, std::greater<int>());
    workRows(columnMax, rowMax, std::greater<int>());

    static int columnMin[MAXN + 1][MAXN + 1], rowMin[MAXN + 1][MAXN + 1];
    workColumns(a, columnMin, std::less<int>());
    workRows(columnMin, rowMin, std::less<int>());

    int ans = INT_MAX;
    for (int i = k; i <= n; i++) for (int j = k; j <= m; j++) ans = std::min(ans, rowMax[i][j] - rowMin[i][j]);
    printf("%d\n", ans);

    return 0;
}
```