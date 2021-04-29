title: 「HNOI2008」Cards - Burnside 引理
categories:
  - OI
tags:
  - BZOJ
  - Burnside 引理
  - HNOI
  - 数学
  - 群论
permalink: hnoi2008-cards
date: '2016-10-17 10:57:00'
---

给 $ n $ 张牌，3 种颜色，和 $ m $ 种洗牌方案，求本质不同的染色方案数。

<!-- more -->

### 链接

[BZOJ 1004](http://www.lydsy.com/JudgeOnline/problem.php?id=1004)

### 题解

Burnside 引理，求出对于每一种洗牌方案，洗完牌后不变的方案数 —— 将每种洗牌方案拆成若干个循环，只需保证每个循环中的牌颜色相同即可，对每个循环的长度做背包即可。

求出这些方案数后，在模意义下除以 $ m $ 得到答案。

### 代码

```cpp
#include <cstdio>
#include <cstring>
#include <vector>

const int MAXX = 20;
const int MAXN = 60;
const int MAXM = 60;

int a, b, c, n, mod;

inline int calc(const int *map) {
    bool flag[MAXM] = { false };
    std::vector<int> v;

    for (int i = 0; i < n; i++) {
        int x = 0;
        for (int t = i; !flag[t]; t = map[t]) {
            flag[t] = true;
            x++;
        }
        if (x) v.push_back(x);
    }

    static int f[MAXX + 1][MAXX + 1][MAXX + 1];
    memset(f, 0, sizeof(f));
    f[0][0][0] = 1;
    for (std::vector<int>::const_iterator it = v.begin(); it != v.end(); it++) {
        for (int i = a; i >= 0; i--) {
            for (int j = b; j >= 0; j--) {
                for (int k = c; k >= 0; k--) {
                    if (i >= *it) (f[i][j][k] += f[i - *it][j][k]) %= mod;
                    if (j >= *it) (f[i][j][k] += f[i][j - *it][k]) %= mod;
                    if (k >= *it) (f[i][j][k] += f[i][j][k - *it]) %= mod;
                }
            }
        }
    }

    // printf("calc() = %d\n", f[a][b][c]);

    return f[a][b][c];
}

inline void exgcd(const int a, const int b, int &g, int &x, int &y) {
    if (!b) g = a, x = 1, y = 0;
    else exgcd(b, a % b, g, y, x), y -= x * (a / b);
}

inline int inv(const int x) {
    int tmp1, tmp2, res;
    exgcd(x, mod, tmp1, res, tmp2);
    return (res % mod + mod) % mod;
}

int main() {
    int m;
    scanf("%d %d %d %d %d", &a, &b, &c, &m, &mod);
    n = a + b + c;

    int sum = 0;
    for (int i = 0; i < m; i++) {
        int map[MAXN];
        for (int j = 0; j < n; j++) scanf("%d", &map[j]), map[j]--;
        (sum += calc(map)) %= mod;
    }

    int map[MAXN];
    for (int i = 0; i < n; i++) map[i] = i;
    (sum += calc(map)) %= mod;

    int ans = sum * inv(m + 1) % mod;
    printf("%d\n", ans);

    return 0;
}
```