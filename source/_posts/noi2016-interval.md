title: 「NOI2016」区间 - 线段树
categories:
  - OI
tags:
  - BZOJ
  - NOI
  - 线段树
permalink: noi2016-interval
date: '2016-09-06 07:19:00'
---

在数轴上有 $ n $ 个闭区间 $ [l_1, r_1], [l_2, r_2] , \ldots, [l_n, r_n] $。现在要从中选出 $ m $ 个区间，使得这 $ m $ 个区间共同包含至少一个位置。换句话说，就是使得存在一个 $ x $，使得对于每一个被选中的区间 $ [l_i, r_i] $，都有 $ l_i \leq x \leq r_i $。

对于一个合法的选取方案，它的花费为被选中的最长区间长度减去被选中的最短区间长度。区间 $ [l_i, r_i] $ 的长度定义为 $ r_i − l_i $，即等于它的右端点的值减去左端点的值。

求所有合法方案中最小的花费。

<!-- more -->

### 链接

[BZOJ 4653](http://www.lydsy.com/JudgeOnline/problem.php?id=4653)

### 题解

将所有区间按照长度排序，按长度从小到大枚举每个区间，在线段树上对其标记，如果线段树上已有一点被 $ m $ 个区间覆盖，则从小到大删除区间，每次更新答案。

### 代码

```cpp
#include <cstdio>
#include <climits>
#include <algorithm>

const int MAXN = 500000;
const int MAXM = 200000;

struct SegmentTree {
    int l, r;
    SegmentTree *lc, *rc;
    int val, tag;

    SegmentTree(const int l, const int r, SegmentTree *lc, SegmentTree *rc) : l(l), r(r), lc(lc), rc(rc), val(0) {}

    void cover(const int delta) {
        val += delta;
        tag += delta;
    }

    void pushDown() {
        if (tag) {
            lc->cover(tag);
            rc->cover(tag);
            tag = 0;
        }
    }

    void update(const int l, const int r, const int delta) {
        if (l > this->r || r < this->l) return;
        else if (l <= this->l && r >= this->r) cover(delta);
        else {
            pushDown();
            lc->update(l, r, delta);
            rc->update(l, r, delta);
            val = std::max(lc->val, rc->val);
        }
    }

    int query(const int l, const int r) {
        if (l > this->r || r < this->l) return 0;
        else if (l <= this->l && r >= this->r) return val;
        else {
            pushDown();
            return std::max(lc->query(l, r), rc->query(l, r));
        }
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

struct Interval {
    int l, r, len;

    bool operator<(const Interval &other) const { return len < other.len; }
} a[MAXN];

int n, m;

int main() {
    scanf("%d %d", &n, &m);

    for (int i = 0; i < n; i++) scanf("%d %d", &a[i].l, &a[i].r), a[i].len = a[i].r - a[i].l;

    static int set[MAXN * 2];
    int cnt = 0, max = 0;
    for (int i = 0; i < n; i++) set[cnt++] = a[i].l, set[cnt++] = a[i].r;
    std::sort(set, set + n * 2);
    int *end = std::unique(set, set + n * 2);
    for (int i = 0; i < n; i++) a[i].l = std::lower_bound(set, end, a[i].l) - set, a[i].r = std::lower_bound(set, end, a[i].r) - set, max = std::max(max, a[i].r);

    std::sort(a, a + n);

    segment = SegmentTree::build(0, max);

    int ans = INT_MAX;
    for (Interval *l = a, *r = a; r != a + n; r++) {
        segment->update(r->l, r->r, 1);
        while (l <= r && segment->query(0, max) >= m) {
            ans = std::min(ans, r->len - l->len);
            segment->update(l->l, l->r, -1);
            l++;
        }
    }

    if (ans == INT_MAX) puts("-1");
    else printf("%d\n", ans);

    return 0;
}
```