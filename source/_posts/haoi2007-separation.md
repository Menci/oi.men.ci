title: 「HAOI2007」分割矩阵 - 搜索
categories:
  - OI
tags:
  - BZOJ
  - DFS
  - DP
  - HAOI
  - 搜索
permalink: haoi2007-separation
date: '2016-12-05 07:52:00'
---

将一个 $ n \times m $ 的数字矩阵进行如下分割：将原矩阵沿某一条直线分割成两个矩阵，再将生成的两个矩阵继续如此分割（当然也可以只分割其中的一个），这样分割了 $ k - 1 $ 次后，原矩阵被分割成了 $ k $ 个矩阵。（每次分割都只能沿着数字间的缝隙进行）原矩阵中每一位置上有一个分值，一个矩阵的总分为其所含各位置上分值之和。现在需要把矩阵按上述规则分割成 $ n $ 个矩阵，并使各矩阵总分的均方差最小。请编程对给出的矩阵及 $ n $，求出均方差的最小值。

<!-- more -->

### 链接

[BZOJ 1048](http://www.lydsy.com/JudgeOnline/problem.php?id=1048)

### 题解

设答案为 $ s $，分割出的所有矩阵分数分别为 $ x_1 \sim x_k $，设总和 $ S = \sum\limits_{i = 1} ^ k x_i $ 平均值 $ x' = \frac{S}{k} $，则有

$$ \begin{aligned} s ^ 2 &= \frac{\sum\limits_{i = 1} ^ k (x_i - \frac{S}{k}) ^ 2}{k} \\ &= \frac{\sum\limits_{i = 1} ^ k(x_i ^ 2 + (\frac{S}{k}) ^ 2 + 2x_i\frac{S}{k})}{k} \\ &= \sum\limits_{i = 1} ^ k \frac{x_i ^ 2}{k} + \sum\limits_{i = 1} ^ k \frac{\frac{S ^ 2}{k ^ 2}}{k} - 2(\sum\limits_{i = 1} ^ k x_i) \frac{\frac{S}{k}}{k} \\ &= \sum\limits_{i = 1} ^ k \frac{x_i ^ 2}{k} + \frac{S ^ 2}{k^ 2} - 2 \frac{(\sum\limits_{i = 1} ^ k x_i) S}{k ^ 2} \\ &= \sum\limits_{i = 1} ^ k \frac{x_i ^ 2}{k} - \frac{S ^ 2}{k ^ 2} \\ &= \frac{k \sum\limits_{i = 1} ^ k x_i ^ 2 - S ^ 2}{k ^ 2} \end{aligned} $$

最小化 $ \sum\limits_{i = 1} ^ k x_i ^ 2 $，即每一块的平方和，即可。

记忆化搜索，$ f(i_1, j_1, i_2, j_2, k) $ 表示左上角为 $ (i_1, j_1) $，右下角为 $ (i_2, j_2) $ 的矩阵，切 $ k $ 刀得到的每一块的平方和的最小值。转移时枚举横切或纵切的位置，枚举切出的两块继续切的次数。

$ n $ 与 $ m $ 同阶，时间复杂度为 $ O(n ^ 4 k \times nk) $

### 代码

```cpp
#include <cstdio>
#include <cmath>
#include <climits>
#include <algorithm>

const int MAXN = 10;

int n, m, k, a[MAXN + 1][MAXN + 1], s[MAXN + 1][MAXN + 1];

inline int sum(int i1, int j1, int i2, int j2) {
    return s[i2][j2] - s[i1 - 1][j2] - s[i2][j1 - 1] + s[i1 - 1][j1 - 1];
}

inline void prepare() {
    for (int i = 1; i <= n; i++) {
        int sumLine = 0;
        for (int j = 1; j <= m; j++) {
            sumLine += a[i][j];
            s[i][j] = s[i - 1][j] + sumLine;
        }
    }
}

template <typename T> T sqr(T x) { return x * x; }

inline int search(int i1, int j1, int i2, int j2, int cnt) {
    static int mem[MAXN + 1][MAXN + 1][MAXN + 1][MAXN + 1][MAXN + 1];
    static bool calced[MAXN + 1][MAXN + 1][MAXN + 1][MAXN + 1][MAXN + 1];
    int &ans = mem[i1][j1][i2][j2][cnt];
    if (calced[i1][j1][i2][j2][cnt]) return ans;
    calced[i1][j1][i2][j2][cnt] = true;

    if (!cnt) {
        return ans = sqr(sum(i1, j1, i2, j2));
    }

    ans = INT_MAX;

    for (int i = i1; i < i2; i++) {
        for (int l = 0; l < cnt; l++) {
            int x1 = search(i + 1, j1, i2, j2, l);
            int x2 = search(i1, j1, i, j2, cnt - l - 1);
            if (x1 != INT_MAX && x2 != INT_MAX) ans = std::min(ans, x1 + x2);
        }
    }

    for (int j = j1; j < j2; j++) {
        for (int l = 0; l < cnt; l++) {
            int x1 = search(i1, j + 1, i2, j2, l);
            int x2 = search(i1, j1, i2, j, cnt - l - 1);
            if (x1 != INT_MAX && x2 != INT_MAX) ans = std::min(ans, x1 + x2);
        }
    }

    // printf("search(%d, %d, %d, %d, %d) = %d\n", i1, j1, i2, j2, cnt, ans);

    return ans;
}

int main() {
    scanf("%d %d %d", &n, &m, &k);
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= m; j++) {
            scanf("%d", &a[i][j]);
        }
    }

    prepare();

    int ans = search(1, 1, n, m, k - 1);

    // printf("%d\n", ans);
    printf("%.2lf\n", sqrt((ans * k - sqr(s[n][m])) / static_cast<double>(sqr(k))));

    return 0;
}
```