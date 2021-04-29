title: 「NOI2010」超级钢琴 - 可持久化线段树 + 堆
categories:
  - OI
tags:
  - NOI
  - 可持久化线段树
  - 堆
permalink: noi2010-piano
date: '2018-08-18 08:12:00'
---

给一个长度为 $n$ 的序列 $\{a_i\}$，定义一个区间 $[l,r]$ 的价值为这个区间中数的总和。求区间长度在 $[L,R]$ 之间的所有区间中，价值最大 $k$ 的个区间的价值总和。

<!-- more -->

### 链接
[BZOJ 2006](https://www.lydsy.com/JudgeOnline/problem.php?id=2006)  
[Luogu 2048](https://www.luogu.org/problemnew/show/P2048)

### 题解
预处理整个序列的前缀和 $\{s_i\}$，将区间 $[l,r]$ 的总和转化为 $s_r-s_{l-1}$。

建立 $n$ 棵可持久化线段树，初始时每棵线段树的维护值均为 $s$ 数组。

首先求出以每个位置为左端点的价值最大的区间（通过线段树查询与前缀和转化得到），将它们加入到堆中。每次从堆中取出最大的区间价值，假设它为 $[l,r]$，那么在第 $l$ 棵线段树中将 $r$ 处的值置为 $-\infty$（以确保这个区间不会被再次使用），并重新求出以 $l$ 为左端点的的价值最大的区间，加入到堆中。以上过程重复 $k$ 次即可得到答案。

时空复杂度均为 $O(n\log n)$。

### 代码
```c++
#include <cstdio>
#include <climits>
#include <algorithm>

const int MAXN = 500000;
const int MAXN_LOG = 19; // Math.log2(500000) = 18.931568569324174

struct Value {
    int pos;
    long long val;

    Value() {}
    Value(int pos, long long val) : pos(pos), val(val) {}

    bool operator<(const Value &other) const {
        return val < other.val;
    }
};

extern struct SegT *curr;

struct SegT {
    SegT *lc, *rc;
    int l, r;
    Value val;

    SegT() {}
    SegT(int l, int r, SegT *lc, SegT *rc, const Value &val) : l(l), r(r), lc(lc), rc(rc), val(val) {}
    SegT(int l, int r, SegT *lc, SegT *rc) : l(l), r(r), lc(lc), rc(rc), val(std::max(lc->val, rc->val)) {}

    SegT *update(int pos, long long newVal) {
        if (pos < l || pos > r) return this;
        else if (l == r) return new (curr++) SegT(l, r, NULL, NULL, Value(pos, newVal));
        else return new (curr++) SegT(l, r, lc->update(pos, newVal), rc->update(pos, newVal));
    }

    Value query(int l, int r) {
        if (l <= this->l && r >= this->r) return val;
        else {
            int mid = this->l + (this->r - this->l) / 2;
            Value res(-1, LLONG_MIN);
            if (l <= mid) res = std::max(res, lc->query(l, r));
            if (r > mid) res = std::max(res, rc->query(l, r));
            return res;
        }
    }

    static SegT *build(int l, int r, long long *a) {
        if (l == r) return new (curr++) SegT(l, r, NULL, NULL, Value(l, a[l]));
        else {
            int mid = l + (r - l) / 2;
            return new (curr++) SegT(l, r, build(l, mid, a), build(mid + 1, r, a));
        }
    }
} *segt[MAXN + 1], _pool[MAXN * MAXN_LOG * 2], *curr = _pool;

long long sum[MAXN + 1];
int min, max;

struct Interval {
    int l, r, maxPos;
    long long val;

    Interval() {}
    Interval(int l, int r) : l(l), r(r) {
        int ql = l + min - 1, qr = std::min(l + max - 1, r);
        if (ql > r) val = LLONG_MIN, maxPos = -1;
        else {
            Value x = segt[l]->query(ql, qr);
            val = x.val - sum[l - 1];
            maxPos = x.pos;
        }
        // printf("Interval(%d, %d): ql = %d, qr = %d, maxPos = %d, val = %lld\n", l, r, ql, qr, maxPos, val);
    }

    bool operator<(const Interval &other) const {
        return val < other.val;
    }
};

struct Heap {
    Interval a[MAXN + 1];
    int n;

    void push(const Interval &x) {
        int i = ++n;
        a[i] = x;
        while (i > 1 && a[i / 2] < a[i]) {
            std::swap(a[i], a[i / 2]);
            i /= 2;
        }
    }

    const Interval &top() {
        return a[1];
    }

    int size() {
        return n;
    }

    void pop() {
        a[1] = a[n--];
        int i = 1;
        while (i * 2 <= n) {
            int l = i * 2, r = i * 2 + 1;
            int next = r <= n && a[l] < a[r] ? r : l;
            if (a[i] < a[next]) {
                std::swap(a[next], a[i]);
                i = next;
            } else break;
        }
    }
} heap;

int main() {
    int n, k;
    scanf("%d %d %d %d", &n, &k, &min, &max);

    static int a[MAXN + 1];
    for (int i = 1; i <= n; i++) {
        scanf("%d", &a[i]);
        sum[i] = sum[i - 1] + a[i];
    }

    SegT *init = SegT::build(1, n, sum);
    for (int i = 1; i <= n; i++) segt[i] = init;

    for (int i = 1; i <= n; i++) heap.push(Interval(i, n));

    long long ans = 0;
    while (k--) {
        Interval v = heap.top();
        heap.pop();

        ans += v.val;
        // printf("ans += %lld\n", v.val);

        segt[v.l] = segt[v.l]->update(v.maxPos, LLONG_MIN);

        v = Interval(v.l, v.r);
        if (v.val != LLONG_MAX) heap.push(v);
    }

    printf("%lld\n", ans);
}
```
