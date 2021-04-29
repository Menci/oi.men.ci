title: 「JSOI2010」部落划分 - Kruskal
categories:
  - OI
tags:
  - BZOJ
  - JSOI
  - Kruskal
  - 最小生成树
permalink: jsoi2010-group
date: '2017-04-05 18:00:00'
---

在二维平面上给若干个点，将这些点划分为若干个区域，定义两个区域的距离为这两个区域之间最近点对的距离。求将这些点划分为 $ k $ 个区域，使得最近的两个区域的距离最大值。

<!-- more -->

### 链接

[BZOJ 1821](http://www.lydsy.com/JudgeOnline/problem.php?id=1821)

### 题解

要使得区域间的距离更远，就要使得区域内的点距离尽量近 —— 每次找距离最近的两个区域合并可以得到一组最优解。在每两个点之间连边，用 Kruskal 做一遍最小生成树，求出连接两个连通块的最短的边即为答案。

### 代码

```cpp
#include <cstdio>
#include <cmath>
#include <algorithm>

const int MAXN = 1000;
const int MAXM = MAXN * (MAXN - 1);

struct Edge {
    int u, v;
    double w;

    Edge() {}
    Edge(int u, int v, double w) : u(u), v(v), w(w) {}

    bool operator<(const Edge &other) const {
        return w < other.w;
    }
} E[MAXM + 1];

struct UnionFindSet {
    int f[MAXN + 1];

    void init(int n) {
        for (int i = 1; i <= n; i++) f[i] = i;
    }

    int find(int x) {
        return x == f[x] ? x : f[x] = find(f[x]);
    }

    void merge(int x, int y) {
        f[find(x)] = find(y);
    }
} ufs;

int n, m, k;

inline double solve() {
    std::sort(E + 1, E + m + 1);

    ufs.init(n);
    int cnt = n;
    for (int i = 1; i <= m; i++) {
        Edge &e = E[i];
        if (ufs.find(e.u) == ufs.find(e.v)) continue;

        if (cnt == k) return E[i].w;
        ufs.merge(e.u, e.v);
        cnt--;
    }

    return -1;
}

struct Point {
    int x, y;

    Point() {}
    Point(int x, int y) : x(x), y(y) {}
} a[MAXN + 1];

inline double sqr(int x) {
    return x * x;
}

inline double dist(Point a, Point b) {
    return sqrt(sqr(a.x - b.x) + sqr(a.y - b.y));
}

int main() {
    scanf("%d %d", &n, &k);
    for (int i = 1; i <= n; i++) {
        scanf("%d %d", &a[i].x, &a[i].y);
    }

    for (int i = 1; i <= n; i++) {
        for (int j = i + 1; j <= n; j++) {
            E[++m] = Edge(i, j, dist(a[i], a[j]));
        }
    }

    printf("%.2lf\n", solve());
}
```