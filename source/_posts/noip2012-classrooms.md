title: 「NOIP2012」借教室 - 二分 / 线段树
categories:
  - OI
tags:
  - COGS
  - CodeVS
  - NOIP
  - 二分
  - 差分
  - 线段树
permalink: noip2012-classrooms
date: '2016-10-08 16:56:00'
---

我们需要处理接下来 $ n $ 天的借教室信息，其中第 $ i $ 天学校有 $ r_i $ 个教室可供租借。共有 $ m $ 份订单，每份订单用三个正整数描述，分别为 $ d_j, s_j, t_j $，表示某租借者需要从第 $ s_j $ 天到第 $ t_j $ 天租借教室（包括第 $ s_j $ 天和第 $ t_j $ 天），每天需要租借 $ d_j $ 个教室。

现在我们需要知道，是否会有订单无法完全满足。如果有，需要通知哪一个申请人修改订单。

<!-- more -->

### 链接

[COGS 1266](http://cogs.pro/cogs/problem/problem.php?pid=1266)  
[CodeVS 1217](http://codevs.cn/problem/1217/)

### 题解

#### 解法一

对天数建立线段树，维护区间最小值，每次租借时查询区间最小值，如果小于租借数量，则无法满足，否则对一个区间减去租借数量，继续处理下一个订单。

期望得分 100 分，**实际得分 95 分**。

#### 解法二

二分天数 $ x $，使用差分 \+ 前缀和检验前 $ x $ 天是否可以完全满足。

期望得分 100 分，实际得分 100 分。

### 代码

线段树，TLE

```cpp
#include <cstdio>
#include <climits>
#include <algorithm>
#include <new>

const int MAXN = 1000000;
const int MAXR = 1000000000;

template <typename T, size_t SIZE>
struct MemoryPool {
    char a[SIZE * sizeof(T)];
    T *p;

    MemoryPool() : p((T *)a) {}

    T *alloc() {
        return p++;
    }
};

struct SegmentTree {
    struct Node {
        Node *lchild, *rchild;
        int l, r;
        int value, min, lazy;

        Node(int l, int r, Node *lchild, Node *rchild) : l(l), r(r), lchild(lchild), rchild(rchild) {}

        void pushDown() {
            if (lazy) {
                if (lchild) lchild->value += lazy, lchild->min += lazy, lchild->lazy += lazy;
                if (rchild) rchild->value += lazy, rchild->min += lazy, rchild->lazy += lazy;

                lazy = 0;
            }
        }

        int queryMin(int l, int r) {
            if (l > this->r || r < this->l) return INT_MAX;
            else if (l <= this->l && r >= this->r) return min;
            else {
                pushDown();
                int ans = INT_MAX;
                if (lchild) ans = std::min(ans, lchild->queryMin(l, r));
                if (rchild) ans = std::min(ans, rchild->queryMin(l, r));
                return ans;
            }
        }

        void update(int l, int r, int x) {
            if (l > this->r || r < this->l) return;
            else if (l <= this->l && r >= this->r) value += x, min += x, lazy += x;
            else {
                pushDown();
                if (lchild) lchild->update(l, r, x);
                if (rchild) rchild->update(l, r, x);

                min = INT_MAX;
                if (lchild) min = std::min(min, lchild->min);
                if (rchild) min = std::min(min, rchild->min);
            }
        }
    } *root;

    SegmentTree(int l, int r) {
        root = build(l, r);
    }

    Node *build(int l, int r) {
        static MemoryPool<Node, MAXN * 2> pool;
        if (l > r) return NULL;
        else if (l == r) return new (pool.alloc()) Node(l, r, NULL, NULL);
        else return new (pool.alloc()) Node(l, r, build(l, l + ((r - l) >> 1)), build(l + ((r - l) >> 1) + 1, r));
    }

    int queryMin(int l, int r) {
        return root->queryMin(l, r);
    }

    void update(int l, int r, int x) {
        root->update(l, r, x);
    }
};

int n, m;

template <typename T>
inline void read(T &x) {
    x = 0;
    char ch;
    while (ch = getchar(), !(ch >= '0' && ch <= '9'));
    do x = x * 10 + (ch - '0'); while (ch = getchar(), ch >= '0' && ch <= '9');
}

int main() {
    read(n), read(m);

    SegmentTree segmentTree(1, n);
    for (int i = 1; i <= n; i++) {
        int x;
        read(x);

        segmentTree.update(i, i, x);
    }

    int day = 0;
    for (int i = 1; i <= m; i++) {
        int x, l, r;
        read(x), read(l), read(r);

        segmentTree.update(l, r, -x);
        if (segmentTree.queryMin(1, n) < 0) {
            day = i;
            break;
        }
    }

    if (day != 0) printf("-1\n%d\n", day);
    else puts("0");

    return 0;
}
```

二分，AC

```cpp
#include <cstdio>

const int MAXN = 1e6;

int main() {
    int n, m;
    scanf("%d %d", &n, &m);

    static int available[MAXN];
    static struct Request {
        int l, r, cnt;
    } req[MAXN];

    for (int i = 0; i < n; i++) scanf("%d", &available[i]);
    for (int i = 0; i < m; i++) scanf("%d %d %d", &req[i].cnt, &req[i].l, &req[i].r), req[i].l--, req[i].r--;

    int l = -1, r = m - 1;
    static int used[MAXN];
    while (l < r) {
        const int mid = l + (r - l) / 2 + 1;
        bool valid = true;

        for (int i = 0; i < n; i++) used[i] = 0;
        for (int i = 0; i <= mid; i++) {
            used[req[i].l] += req[i].cnt;
            if (req[i].r != n - 1) used[req[i].r + 1] -= req[i].cnt;
        }
        for (int i = 1; i < n; i++) used[i] += used[i - 1];
        for (int i = 0; i < n; i++) {
            if (used[i] > available[i]) {
                valid = false;
                break;
            }
        }

#ifdef DBG
        printf("[%d, %d] => %d\n", l, r, mid);
#endif

        if (valid) l = mid;
        else r = mid - 1;
    }


    if (l == m - 1) puts("0");
    else printf("-1\n%d\n", l + 1 + 1);

    return 0;
}
```