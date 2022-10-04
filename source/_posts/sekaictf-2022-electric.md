title: 「Sekai CTF 2022」Electric Box - 计算几何 + 并查集
categories:
  - OI
tags:
  - 二分答案
  - 计算几何
  - 并查集
permalink: sekaictf-2022-electric
date: '2022-10-04 12:07:00'
---

在一个宽度无限（横坐标 $-\infty$ 到 $+\infty$），高度有限（纵坐标 $0$ 到 $W$，其中整数 $W\leq10^4$）的游戏场地上，有 $M$（$M\leq2000$）个圆形障碍物，分布在横坐标 $0$ 到 $L$（其中整数 $L\leq10^4$）的位置，玩家同样为圆形。给定每个障碍物的坐标和半径（均为整数），玩家需要从左侧无限远的位置开始，经过障碍物区域，在不与上下边界及任何障碍物接触的情况下，到达右侧无限远的位置。

给定玩家的初始半径。为了增加游戏难度，玩家拥有 $N$（$N\leq10^4$）份强化材料，其中第 $i$ 份材料可以将玩家的半径扩大 $t_i$（$t_i$ 为整数；与使用顺序无关）。问最多使用多少份强化材料，可以使得游戏能够通关。

<!-- more -->

### 链接

[Project SEKAI Online Judge](http://algo-server.ctf.sekai.team/)

### 题解

由于使用顺序无关，强化材料的最优使用方案一定是从小到大依次使用。二分玩家的最大可通关半径，最后按从小到大顺序检查每个材料是否可以使用可得答案。转化为判定在给定的半径下，玩家是否可通关。虽然场地的参数、障碍物的坐标与半径、强化材料增加的半径均为整数，但显然玩家的最大半径可能不是整数，故采用浮点数二分。

对于一个给定的玩家半径 $r$，将每个障碍物半径各扩大 $r$，并将场地的上下边界各向内收缩 $r$，转化为判定是否存在一条通道使得无限小的玩家能够从左到右通过。考虑此时每个由一个或多个相交（或相切，下同）的障碍物组成的连通块，如果某个障碍物连通块同时与上下边界相交，则玩家不可能通过；否则该连通块的存在不影响玩家是否可通过。

使用计算几何判定每两个障碍物的是否相交，判定每个障碍物是否与边界相交，并使用并查集维护每个连通块与边界的相交关系，最后检查是否有连通块同时与上下边界相交即可。

时间复杂度为 $O(M^2 \log W)$。

### 代码

```cpp
#include <cstdio>
#include <cmath>
#include <vector>
#include <algorithm>
#include <functional>

const double EPS_CAL = 1e-7;
const double EPS_BS = 1e-5;
const double EPS_CMP = 1e-3;

inline bool dcmp(double a, double b, double eps = EPS_CAL) {
    return fabs(a - b) <= eps;
}

double binarySearch(double l, double r, std::function<bool (double)> check) {
    double mid;
    while (r - l > EPS_BS) {
        mid = l + (r - l) / 2;
        if (check(mid))
            l = mid;
        else
            r = mid;
    }

    return mid;
}

double sq(double x) {
    return x * x;
}

double sqLen(double x1, double y1, double x2, double y2) {
    return sq(x1 - x2) + sq(y1 - y2);
}

bool circleIntersect(double x1, double y1, double r1, double x2, double y2, double r2) {
    double cd = sqLen(x1, y1, x2, y2);
    double rs = sq(r1 + r2);
    return cd < rs || dcmp(cd, rs);
}

bool circleIntersectLine(double x1, double y1, double x2, double y2, double xc, double yc, double r) {
    double v1x = x2 - x1, v1y = y2 - y1;
    double v2x = xc - x1, v2y = yc - y1;
    double cross = v1x * v2y - v2x * v1y;
    double l1 = sqrt(sqLen(x1, y1, x2, y2));
    double dist = fabs(cross / l1);
    return dist < r || dcmp(dist, r);
}

struct UnionFindSet {
    std::vector<int> a;

    void init(int n) {
        a.resize(n);
        for (int i = 0; i < n; i++) a[i] = i;
    }

    int find(int x) {
        return x == a[x] ? x : (a[x] = find(a[x]));
    }

    void merge(int x, int y) {
        a[x] = y;
    }
};

struct Intersectable {
    bool intersectWithTop;
    bool intersectWithRight;
    bool intersectWithBottom;
    bool intersectWithLeft;
};

struct Circle : Intersectable {
    int x, y, originalRaduis;

    double currentRadius;
};

int main() {
    int r, n;
    scanf("%d %d", &r, &n);
    std::vector<int> t(n);
    for (int i = 0; i < n; i++)
        scanf("%d", &t[i]);

    int l, w, m;
    scanf("%d %d %d", &l, &w, &m);

    std::vector<Circle> circles(m);
    for (int i = 0; i < m; i++)
        scanf("%d %d %d", &circles[i].x, &circles[i].y, &circles[i].originalRaduis);

    UnionFindSet ufs;
    std::vector<Intersectable> regions(m);
    double maxPlayerRadius = binarySearch(0, (double)std::min(l, w) / 2 - EPS_BS, [&] (double d) {
        double left = 0;
        double bottom = d;
        double right = l;
        double top = w - d;

        for (int i = 0; i < m; i++) {
            double r = circles[i].originalRaduis + d;
            circles[i].currentRadius = r;

            // top: (0, w) - (l, w)
            regions[i].intersectWithTop = circles[i].intersectWithTop = circleIntersectLine(left, top, right, top, circles[i].x, circles[i].y, r);
            // right: (l, 0) - (l, w)
            regions[i].intersectWithRight = circles[i].intersectWithRight = circleIntersectLine(right, bottom, right, top, circles[i].x, circles[i].y, r);
            // bottom: (0, 0) - (l, 0)
            regions[i].intersectWithBottom = circles[i].intersectWithBottom = circleIntersectLine(left, bottom, right, bottom, circles[i].x, circles[i].y, r);
            // left: (0, 0) - (0, w)
            regions[i].intersectWithLeft = circles[i].intersectWithLeft = circleIntersectLine(left, top, left, bottom, circles[i].x, circles[i].y, r);
        }

        ufs.init(m);
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < i; j++) {
                if (circleIntersect(circles[i].x, circles[i].y, circles[i].currentRadius, circles[j].x, circles[j].y, circles[j].currentRadius)) {
                    int r1 = ufs.find(i), r2 = ufs.find(j);
                    if (r1 == r2) continue;
                    ufs.merge(r1, r2);
                    regions[r2].intersectWithTop = regions[r1].intersectWithTop || regions[r2].intersectWithTop;
                    regions[r2].intersectWithRight = regions[r1].intersectWithRight || regions[r2].intersectWithRight;
                    regions[r2].intersectWithBottom = regions[r1].intersectWithBottom || regions[r2].intersectWithBottom;
                    regions[r2].intersectWithLeft = regions[r1].intersectWithLeft || regions[r2].intersectWithLeft;
                }
            }
        }

        for (int i = 0; i < m; i++) {
            auto &region = regions[ufs.find(i)];
            if (region.intersectWithTop && region.intersectWithBottom) {
                return false;
            }
        }

        return true;
    });

    // printf("maxPlayerRadius = %f\n", maxPlayerRadius);
    if (maxPlayerRadius < r || dcmp(maxPlayerRadius, r, EPS_CMP)) {
        puts("-1");
    } else {
        std::sort(t.begin(), t.end());
        int answer = 0;
        for (int i = 0, curr = r; i < n; i++) {
            curr += t[i];
            if (curr < maxPlayerRadius && !dcmp(curr, maxPlayerRadius, EPS_CMP))
                answer++;
            else
                break;
        }

        printf("%d\n", answer);
    }

    return 0;
}
```
