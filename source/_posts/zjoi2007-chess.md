title: 「ZJOI2007」棋盘制作 - 悬线法
categories:
  - OI
tags:
  - BZOJ
  - ZJOI
  - 悬线法
permalink: zjoi2007-chess
date: '2016-12-13 17:23:00'
---

在一个 $ N \times M $ 的 $ 01 $ 矩阵中，求面积最大的相邻位置数字不同的矩形和正方形。

<!-- more -->

### 链接

[BZOJ 1057](http://www.lydsy.com/JudgeOnline/problem.php?id=1057)

### 题解

定义「极大合法子矩阵」为满足题目要求（相邻位置数字不同）的每一条边都不能向外扩展的子矩阵。面积最大的合法矩形一定是一个极大合法子矩阵。而面积最大的合法正方形一定是以一个极大和法子矩阵为边长的正方形。

对于每个位置，求出从这个位置向上能延伸到的满足题目要求（相邻位置数字不同）的最高点，用一条线连结，称这条线为「悬线」。求出悬线向左向右能延伸到的最远位置，则悬线左右移动的轨迹为一个合法子矩阵，且这个子矩阵的上边、左边、右边不能延伸。如果它的下边可以延伸，则在接下来的枚举中，延伸得到的矩阵可以被枚举到，否则它就是一个极大合法子矩阵。

这种枚举的方法可以枚举到所有高度（上边到下边距离，即悬线的长度）的极大合法子矩阵，所以不会漏解。

求每个位置向上、向左、向右能延伸到的最高点可以使用递推，而悬线向左或向右延伸的最远位置是一个后缀最小值，也可以递推。时间复杂度为 $ O(nm) $。

### 代码

```cpp
#include <cstdio>
#include <algorithm>

const int MAXN = 2000;

inline int sqr(int x) {
    return x * x;
}

int main() {
    int n, m;
    scanf("%d %d", &n, &m);

    static int a[MAXN + 1][MAXN + 1];
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= m; j++) {
            scanf("%d", &a[i][j]);
        }
    }

    // for (int i = 1; i <= n; i++) f[i][0] = -1;
    // for (int j = 1; j <= m; j++) f[0][j] = -1;

    static int f[MAXN + 1][MAXN + 1], g[MAXN + 1][MAXN + 1];
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= m; j++) {
            if (j == 1 ||  a[i][j] == a[i][j - 1]) {
                f[i][j] = 1;
            } else {
                f[i][j] = f[i][j - 1] + 1;
            }
            // printf("f(%d, %d) = %d\n", i, j, f[i][j]);
        }

        for (int j = m; j >= 1; j--) {
            if (j == m || a[i][j] == a[i][j + 1]) {
                g[i][j] = 1;
            } else {
                g[i][j] = g[i][j + 1] + 1;
            }
        }
    }

    int ansSquare = 1, ansRectangle = 1;
    for (int j = 1; j <= m; j++) {
        int up = 0, left = 0, right = 0;
        for (int i = 1; i <= n; i++) {
            if (i == 1 || a[i][j] == a[i - 1][j]) {
                up = 1;
                left = f[i][j];
                right = g[i][j];
            } else {
                up++;
                left = std::min(left, f[i][j]);
                right = std::min(right, g[i][j]);
            }

            // printf("up = %d, left = %d, right = %d\n", up, left, right);
            ansRectangle = std::max(ansRectangle, up * (left + right - 1));
            ansSquare = std::max(ansSquare, sqr(std::min(up, left + right - 1)));
        }
    }

    printf("%d\n%d\n", ansSquare, ansRectangle);

    return 0;
}
```