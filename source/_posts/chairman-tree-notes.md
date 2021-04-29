title: 主席树学习笔记
categories:
  - OI
tags:
  - 主席树
  - 学习笔记
  - 数据结构
  - 算法模板
permalink: chairman-tree-notes
date: '2016-05-11 21:06:00'
---

主席树是一种数据结构，其主要应用是区间第 $ k $ 大问题。

<!-- more -->

### 权值线段树

传统的线段树用于维护一条线段上的区间，可以方便地查询区间信息。而如果将线段树转化为『权值线段树』，每个叶子节点存储某个元素出现次数，一条线段的总和表示区间内所有数出现次数的总和。

利用权值线段树可以方便地求出整体第 $ k $ 大 —— 从根节点向下走，如果 $ k $ 小于等于左子树大小，说明第 $ k $ 大在左子树的区间中，在左子树中继续查找即可；否则，说明第 $ k $ 大在右子树的区间中，此时将 $ k $ 减去左子树大小，并在右子树中继续查找。

查找过程类似平衡树，时间复杂度为 $ O(\log n) $。

### 前缀和

上述算法可以用来处理整个序列上的第 $ k $ 大，而我们可以对于一个长度为 $ n $ 的序列 $ a $ 建立 $ n $ 棵上述的权值线段树，第 $ i $ 棵表示『$ a_1 $ ~ $ a_i $ 的所有数』组成的权值线段树。如果要查询 $ [l, r] $ 中的第 $ k $ 大，可以使用第 $ r $ 棵线段树减去第 $ l - 1 $ 棵线段树，得到整个区间组成的权值线段树，并进行上述算法得到区间中的第 $ k $ 大。

这个算法存在两个问题：

1. 每个线段树要占用 $ O(n \log n) $ 的空间，算法的空间复杂度为 $ O(n ^ 2 \log n) $，占用空间过多；
2. 建立每棵线段树至少要用 $ O(n \log n) $ 的时间，每次查询又要用 $ O(n \log n) $ 的时间构建区间的权值线段树，总时间复杂度 $ O((n + m) n \log n) $。

看上去还不如**每次直接提取出区间，并使用后线性选择得到答案**的 $ O(n ^ 2) $ 的朴素算法优秀。

### 主席树

仔细思考，发现上述算法的 $ n $ 棵线段树中，相邻的两棵线段树仅有 $ O(\log n) $ 个节点不同，因此本质不同的节点只有 $ O(n \log n) $ 个。我们可以充分利用这一特点，每次只重新创建与上次所不同的节点，相同的节点直接使用前一棵的即可。

为了节省空间，可以将第 $ 0 $ 棵线段树置为空，每次插入一个新叶子节点时接入一条长度为 $ O(\log n) $ 的链。总空间、时间复杂度仍为 $ O(n \log n) $

查询时构造整棵线段树，需要构造 $ O(n \log n) $ 个节点，但每次查询只会用到 $ O(\log n) $ 个节点，直接动态构造这些节点即可。为了方便，可以不显式构造这些节点，而是直接用两棵线段树上的值相减。

### 模板

[POJ 2104](http://poj.org/problem?id=2104)  
动态分配内存会超时，需要静态分配内存。

```cpp
#include <cstdio>
#include <climits>
#include <algorithm>
#include <new>

const int MAXN = 100000;
const int MAXM = 5000;

template <size_t SIZE>
struct MemoryPool {
    char buf[SIZE], *cur;

    MemoryPool() : cur(buf) {}

    void *alloc(const int size) {
        if (cur == buf + SIZE) return malloc(size);
        else {
            char *p = cur;
            cur += size;
            return p;
        }
    }
};

MemoryPool<(4 + 4 + 8 + 8 + 4) * MAXN * 10> pool;
struct ChairmanTree {
    struct Node {
        int l, r;
        Node *lc, *rc;
        int cnt;

        Node(const int l, const int r, Node *lc = NULL, Node *rc = NULL) : l(l), r(r), lc(lc), rc(rc), cnt((lc ? lc->cnt : 0) + (rc ? rc->cnt : 0)) {}
        Node(const int l, const int r, const int cnt) : l(l), r(r), lc(NULL), rc(NULL), cnt(cnt) {}

        void pushDown() {
            if (lc && rc) return;
            int mid = l + ((r - l) >> 1);
            if (!lc) lc = new (pool.alloc(sizeof(Node))) Node(l, mid);
            if (!rc) rc = new (pool.alloc(sizeof(Node))) Node(mid + 1, r);
        }

        Node *insert(const int num) {
            if (num < l || num > r) return this;
            else if (num == l && num == r) return new (pool.alloc(sizeof(Node))) Node(l, r, this->cnt + 1);
            else {
                const int mid = l + ((r - l) >> 1);
                pushDown();
                if (num <= mid) return new (pool.alloc(sizeof(Node))) Node(l, r, lc->insert(num), rc);
                else return new (pool.alloc(sizeof(Node))) Node(l, r, lc, rc->insert(num));
            }
        }

        int rank() const {
            return lc ? lc->cnt : 0;
        }
    } *root[MAXN + 1];
    int n;

    void build(const int a[], const int n) {
        this->n = n;
        root[0] = new (pool.alloc(sizeof(Node))) Node(0, n - 1);
        for (int i = 1; i <= n; i++) {
            root[i] = root[i - 1]->insert(a[i - 1]);
        }
    }

    int query(const int l, const int r, int k) {
        Node *L = root[l - 1], *R = root[r];
        int min = 0, max = n - 1;
        while (min != max) {
            L->pushDown(), R->pushDown();
            int mid = min + ((max - min) >> 1), t = R->rank() - L->rank();
            if (k <= t) L = L->lc, R = R->lc, max = mid;
            else k -= t, L = L->rc, R = R->rc, min = mid + 1;
        }
        return min;
    }
} t;

int n, m, a[MAXN];

int main() {
    scanf("%d %d", &n, &m);
    for (int i = 0; i < n; i++) scanf("%d", &a[i]);

    static int set[MAXN];
    std::copy(a, a + n, set);
    std::sort(set, set + n);
    int *end = std::unique(set, set + n);
    for (int i = 0; i < n; i++) a[i] = std::lower_bound(set, end, a[i]) - set;

    t.build(a, n);

    for (int i = 0; i < m; i++) {
        int l, r, k;
        scanf("%d %d %d", &l, &r, &k);
        int ans = t.query(l, r, k);
        printf("%d\n", set[ans]);
    }

    return 0;
}
```