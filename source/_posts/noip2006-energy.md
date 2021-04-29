title: 「NOIP2006」能量项链 - 区间 DP
categories:
  - OI
tags:
  - CodeVS
  - DP
  - NOIP
  - Tyvj
  - 区间 DP
permalink: noip2006-energy
date: '2016-01-13 05:19:28'
---

在Mars星球上，每个Mars人都随身佩带着一串能量项链。在项链上有N颗能量珠。能量珠是一颗有头标记与尾标记的珠子，这些标记对应着某个正整数。并且，对于相邻的两颗珠子，前一颗珠子的尾标记一定等于后一颗珠子的头标记。因为只有这样，通过吸盘（吸盘是Mars人吸收能量的一种器官）的作用，这两颗珠子才能聚合成一颗珠子，同时释放出可以被吸盘吸收的能量。如果前一颗能量珠的头标记为m，尾标记为r，后一颗能量珠的头标记为r，尾标记为n，则聚合后释放的能量为$m*r*n$（Mars单位），新产生的珠子的头标记为m，尾标记为n。需要时，Mars人就用吸盘夹住相邻的两颗珠子，通过聚合得到能量，直到项链上只剩下一颗珠子为止。显然，不同的聚合顺序得到的总能量是不同的，请你设计一个聚合顺序，使一串项链释放出的总能量最大。

<!-- more -->

### 链接

[CodeVS 1154](http://codevs.cn/problem/1154/)  
[Tyvj 1056](http://tyvj.cn/p/1056)

### 题解

首先，项链是一个环，枚举断点给它拆开。

区间DP，用 $a[i]$ 表示第 `i` 颗珠子的头标记（即第 `i + 1` 颗珠子的尾标记），用 $f[i][j]$ 表示第 `i` 到第 `j` 颗珠子聚合成一颗后释放能量的最大值，枚举 `k`，自 `k` 处断开后，无论左右两段如何聚合，两段分别聚合成的两个珠子的标记值是不变的，即状态转移方程为：

$$f[i][j]=\max\{f[i][k]+f[k+1][j]+a[i]*a[k+1]*a[j+1],k{\in}[i,j-1]\}$$

边界条件为：

$$ f[i][j]=\cases{0 & i=j \\ a[i]*a[j]*a[j+1] & j=i+1} $$

注意代码编写时，访问最后一颗珠子的尾标记时，会越界，可以通过将下标对珠子总数取模的方法解决，因为最后一颗珠子的尾标记等于第一颗珠子的头标记。

总时间复杂度为 $O(n^4)$，刚好解决 $n=100$ 的最大测试点 TvT。

调试可费了大功夫，详见**注释掉的代码**。

### 代码

```cpp
#include <cstdio>
#include <cstring>
#include <algorithm>
#include <cassert>

const int MAXN = 100;

int n, a[MAXN];

int ans[MAXN][MAXN];
bool calced[MAXN][MAXN];

int search(int i, int j) {
    if (i == j) return 0;

    if (!calced[i - 1][j - 1]) {
        if (j - i == 1) ans[i - 1][j - 1] = a[i - 1] * a[j - 1] * a[(j + 1 - 1) % (n)];
        else {
            ans[i - 1][j - 1] = 0;
            int p = a[i - 1] * a[(j + 1 - 1) % (n)];
            int m = -1;
            for (int k = i; k <= j - 1; k++) {
                ans[i - 1][j - 1] = std::max(ans[i - 1][j - 1], search(i, k) + search(k + 1, j) + p * a[(k + 1 - 1) % (n)]);
                /*if (search(i, k) + search(k + 1, j) + p * a[(k + 1 - 1) % (n)] > ans[i - 1][j - 1]) {
                    ans[i - 1][j - 1] = search(i, k) + search(k + 1, j) + p * a[(k + 1 - 1) % (n)];
                    m = k;
                }*/
            }
            //printf("%d %d %d\n", i, (m + 1), (j + 1));
            //printf("from k = %d, %d * %d * %d, ", m, a[i - 1], a[(m + 1 - 1) % (n - 1)], a[(j + 1 - 1) % (n - 1)]);
        }

        calced[i - 1][j - 1] = true;
        //printf("f[%d][%d] = %d\n", i, j, ans[i - 1][j - 1]);
    }

    return ans[i - 1][j - 1];
}

int main() {
    scanf("%d", &n);

    for (int i = 0; i < n; i++) {
        scanf("%d", &a[i]);
    }

    int ans = 0;
    for (int i = 0; i < n; i++) {
        int first = a[0];
        for (int i = 0; i < n - 1; i++) {
            a[i] = a[i + 1];
        }
        a[n - 1] = first;

        memset(calced, 0, sizeof(calced));
        /*for (int i = 0; i < n; i++) {
            printf("%d ", a[i]);
        }
        putchar('\n');*/
        ans = std::max(ans, search(1, n));
    }

    printf("%d\n", ans);

    return 0;
}
```