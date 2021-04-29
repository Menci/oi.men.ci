title: 「SHOI2008」堵塞的交通 - 线段树
categories:
  - OI
tags:
  - BZOJ
  - SHOI
  - 线段树
permalink: shoi2008-traffic
date: '2016-10-19 14:30:00'
---

整个国家的交通系统可以被看成是一个 $ 2 $ 行 $ C $ 列的矩形网格，网格上的每个点代表一个城市，相邻的城市之间有一条道路，所以总共有 $ 2C $ 个城市和 $ 3C - 2 $ 条道路。

交通信息可以分为以下几种格式：

1. `Close r1 c1 r2 c2`，相邻的两座城市 $ (r_1, c_1) $ 和 $ (r_2, c_2) $ 之间的道路被堵塞了；
2. `Open r1 c1 r2 c2`，相邻的两座城市 $ (r_1, c_1) $ 和 $ (r_2, c_2) $ 之间的道路被疏通了；
3. `Ask r1 c1 r2 c2`，询问城市 $ (r_1, c_1) $ 和 $ (r_2, c_2) $ 是否连通。

<!-- more -->

### 链接

[BZOJ 1018](http://www.lydsy.com/JudgeOnline/problem.php?id=1018)

### 题解

对所有列建立线段树，维护一个区间的连通性。我们用 $ (i, 0) $ 和 $ (i, 1) $ 分别表示第 $ i $ 列的上面和下面的位置。

线段树中 $ [l, r] $ 区间维护 $ (l, 0), (l, 1) $ 分别与 $ (r, 0), (r, 1) $ 的连通性。

如果第 $ i $ 列上下连通，则认为区间 $ [l = i, r = i] $ 的 $ (l, 0) $ 与 $ (r, 1) $、$ (l, 1) $ 与 $ (r, 0) $ 连通。

合并 $ [l, m] $ 与 $ [m + 1, r] $ 两个区间时，枚举经过 $ m \leftrightarrow m + 1 $ 的上方还是下方的路径。

查询区间 $ [l, r] $ 列时，首先二分从 $ l $ 能到达的最左列 $ l' $ 和 $ r $ 能到的的最右列 $ r' $，在线段树上查询 $ [l', r'] $ 即可。

具体细节见代码。

### 代码

```cpp
#include <cstdio>
#include <algorithm>

const int MAXN = 100000;

int n;
bool right[MAXN][2], middle[MAXN + 1];

struct Connectivity {
    bool a[2][2];

    Connectivity(const bool init) {
        a[0][0] = a[0][1] = a[1][0] = a[1][1] = init;
    }

    bool &operator()(const int i, const int j) { return a[i][j]; }
    bool operator()(const int i, const int j) const { return a[i][j]; }

    operator bool() const { return a[0][0] || a[0][1] || a[1][0] || a[1][1]; }
};

Connectivity merge(Connectivity a, Connectivity b, const int mid) {
    Connectivity res(false);
    for (int i = 0; i < 2; i++) {
        for (int j = 0; j < 2; j++) {
            for (int k = 0; k < 2; k++) {
                res(i, j) |= a(i, k) && right[mid][k] && b(k, j);
            }
        }
    }
    return res;
}

struct SegmentTree {
    int l, r, mid;
    SegmentTree *lc, *rc;
    Connectivity conn;

    SegmentTree(const int l, const int r, SegmentTree *lc, SegmentTree *rc) : l(l), r(r), mid(l + (r - l) / 2), lc(lc), rc(rc), conn(l == r) {}

    void update(const int l, const int r) {
        if (l > this->r || r < this->l) return;
        else if (this->l == this->r) {
            conn(0, 0) = conn(1, 1) = true;
            conn(0, 1) = conn(1, 0) = middle[mid];
            return;
        } else if (!(l <= this->l && r >= this->r)) {
            lc->update(l, r);
            rc->update(l, r);
        } else if (this->l == this->r - 1) lc->update(l, r), rc->update(l, r);
        conn = merge(lc->conn, rc->conn, mid);
    }

    Connectivity query(const int l, const int r) {
        if (l <= this->l && r >= this->r) return conn;
        else if (r <= mid) return lc->query(l, r);
        else if (l > mid) return rc->query(l, r);
        else return merge(lc->query(l, r), rc->query(l, r), mid);
    }

    static SegmentTree *build(const int l, const int r) {
        if (l > r) return NULL;
        else if (l == r) return new SegmentTree(l, r, NULL, NULL);
        else {
            const int mid = l + (r - l) / 2;
            return new SegmentTree(l, r, build(l, mid), build(mid + 1, r));
        }
    }
} *segment;

inline void update(int r1, int c1, int r2, int c2, const bool val) {
    if (r1 == r2) {
        right[std::min(c1, c2)][r1] = val;
    } else {
        middle[c1] = val;
    }
    segment->update(std::min(c1, c2), std::max(c1, c2));
}

inline bool query(int r1, int c1, int r2, int c2) {
    int l, r;

    l = 1, r = c1;
    while (l < r) {
        const int mid = l + (r - l) / 2;
        Connectivity res = segment->query(mid, c1);
        if (res(0, r1) || res(1, r1)) r = mid;
        else l = mid + 1;
    }
    const int lpos = l;
    Connectivity lconn = segment->query(lpos, c1);

    l = c2, r = n;
    while (l < r) {
        const int mid = l + (r - l) / 2 + 1;
        Connectivity res = segment->query(c2, mid);
        if (res(r2, 0) || res(r2, 1)) l = mid;
        else r = mid - 1;
    }
    const int rpos = l;
    Connectivity rconn = segment->query(c2, rpos);

    Connectivity conn = segment->query(lpos, rpos);
    for (int i = 0; i < 2; i++) {
        for (int j = 0; j < 2; j++) {
            if (lconn(i, r1) && rconn(r2, j) && conn(i, j)) return true;
        }
    }
    return false;
}

int main() {
    scanf("%d", &n);
    segment = SegmentTree::build(1, n);

    char cmd[5];
    while (~scanf("%s", cmd)) {
        if (cmd[0] == 'E') break;
        else if (cmd[0] == 'O') {
            int r1, c1, r2, c2;
            scanf("%d %d %d %d", &r1, &c1, &r2, &c2);
            update(r1 - 1, c1, r2 - 1, c2, true);
        } else if (cmd[0] == 'C') {
            int r1, c1, r2, c2;
            scanf("%d %d %d %d", &r1, &c1, &r2, &c2);
            update(r1 - 1, c1, r2 - 1, c2, false);
        } else if (cmd[0] == 'A') {
            int r1, c1, r2, c2;
            scanf("%d %d %d %d", &r1, &c1, &r2, &c2);
            if (c1 > c2) std::swap(c1, c2), std::swap(r1, r2);
            puts(query(r1 - 1, c1, r2 - 1, c2) ? "Y" : "N");
        }
    }

    return 0;
}
```