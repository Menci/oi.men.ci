title: 「HAOI2007」覆盖问题 - 二分答案 + 枚举
categories:
  - OI
tags:
  - BZOJ
  - HAOI
  - 二分答案
  - 枚举
permalink: haoi2007-cover
date: '2016-12-13 16:37:00'
---

用三个 $ L \times L $ 的正方形覆盖一些点，使最大正方形的边长最小。

<!-- more -->

### 链接

[BZOJ 1052](http://www.lydsy.com/JudgeOnline/problem.php?id=1052)

### 题解

二分答案，考虑如何检验。

首先，求出一个能覆盖所有点的最小矩形。

考虑到第一个正方形一定放在一个角上（第一个正方形不放在角上一定不会比放在角上更优），枚举四个角，将覆盖到的点做标记后再求出能覆盖剩下所有点的最小矩形，再枚举这个矩形的四个角，放置第二个正方形，之后只需要判定剩余的点是否可以被一个正方形围住即可。

时间复杂度 $ O(4 \times 4 \times n \log n) $。

### 代码

```cpp
#include <cstdio>
#include <climits>
#include <algorithm>

const int MAXN = 20000;

struct Point {
    int x, y;
    bool covered[2];
} a[MAXN + 1];

struct Rectangle {
    int x1, y1, x2, y2;
};

int n;

inline Rectangle getBound() {
    Rectangle rect;
    rect.x1 = rect.y1 = INT_MAX, rect.x2 = rect.y2 = INT_MIN;
    for (int i = 1; i <= n; i++) {
        if (a[i].covered[0] || a[i].covered[1]) continue;
        rect.x1 = std::min(rect.x1, a[i].x);
        rect.y1 = std::min(rect.y1, a[i].y);
        rect.x2 = std::max(rect.x2, a[i].x);
        rect.y2 = std::max(rect.y2, a[i].y);
    }
    return rect;
}

inline void cover(int x, int y, int len, int index, bool flag) {
    for (int i = 1; i <= n; i++) {
        if (a[i].x >= x && a[i].x <= x + len && a[i].y >= y && a[i].y <= y + len) {
            a[i].covered[index] = flag;
        }
    }
}

inline void cover(Rectangle rect, int limit, int corner, int index, bool flag) {
    if (corner == 1) cover(rect.x1, rect.y1, limit, index, flag);
    else if (corner == 2) cover(rect.x2 - limit, rect.y1, limit, index, flag);
    else if (corner == 3) cover(rect.x2 - limit, rect.y2 - limit, limit, index, flag);
    else cover(rect.x1, rect.y2 - limit, limit, index, flag);
}

inline bool check(int limit) {
    for (int i = 1; i <= n; i++) {
        a[i].covered[0] = a[i].covered[1] = false;
    }

    Rectangle rect1 = getBound();
    for (int i = 1; i <= 4; i++) {
        cover(rect1, limit, i, 0, true);

        Rectangle rect2 = getBound();
        for (int j = 1; j <= 4; j++) {
            cover(rect2, limit, j, 1, true);

            Rectangle rect3 = getBound();
            if (std::max(rect3.x2 - rect3.x1, rect3.y2 - rect3.y1) <= limit) return true;

            cover(rect2, limit, j, 1, false);
        }

        cover(rect1, limit, i, 0, false);
    }

    return false;
}

int main() {
    scanf("%d", &n);
    for (int i = 1; i <= n; i++) {
        scanf("%d %d", &a[i].x, &a[i].y);
    }

    Rectangle rect = getBound();

    int l = 0, r = std::max(rect.x2 - rect.x1, rect.y2 - rect.y1);
    while (l < r) {
        int mid = l + (r - l) / 2;
        if (check(mid)) r = mid;
        else l = mid + 1;
    }

    printf("%d\n", l);

    return 0;
}
```