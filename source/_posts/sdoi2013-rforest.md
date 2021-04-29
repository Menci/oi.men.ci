title: 「SDOI2013」森林 - LCA + 主席树 + 启发式合并
categories:
  - OI
tags:
  - BZOJ
  - SDOI
  - 主席树
  - 启发式合并
  - 并查集
  - 最近公共祖先
permalink: sdoi2013-rforest
date: '2016-09-05 21:49:00'
---

森林中有 $ n $ 个点，$ m $ 条边，每个点有点权，执行 $ T $ 次操作：

1. 查询两点间点权的第 $ k $ 小；
2. 连接两个点，保证图在操作后仍然为森林。

<!-- more -->

### 链接

[BZOJ 3123](http://www.lydsy.com/JudgeOnline/problem.php?id=3123)

### 题解

对于第 $ k $ 小的询问，可以使用类似树上前缀和求两点距离的方法，使用主席树。将主席树的序列前缀和改为树上前缀和即可。

对于合并操作，每次将较小树合并到较大树上（使用并查集维护每棵树的大小），可以证明总复杂度为 $ O(n \log ^ 2 n) $。

### 代码

```cpp
#pragma GCC optimize("O3")

#include <cstdio>
#include <algorithm>
#include <queue>

#define inline inline __attribute__((always_inline))

const int MAXN = 80000;
const int MAXN_LOG = 17;

struct UnionFindSet {
    int a[MAXN], s[MAXN];

    inline void init(const int n) { for (register int i = 0; i < n; i++) a[i] = i, s[i] = 1; }

    int find(const int x) { return x == a[x] ? x : a[x] = find(a[x]); }

    inline int getSize(const int x) { return s[find(x)]; }

    inline void merge(const int x, const int y) {
        const register int p = find(x), q = find(y);
        a[p] = q;
        s[q] += s[p];
    }
} ufs;

struct SegmentTree {
    int l, r;
    SegmentTree *lc, *rc;
    int cnt, refCnt;

    inline SegmentTree(const int l, const int r, SegmentTree *lc = NULL, SegmentTree *rc = NULL, const int cnt = 0) : l(l), r(r), lc(lc), rc(rc), cnt(cnt), refCnt(1) {}

    inline static SegmentTree *newNode();
    inline static void deleteNode(SegmentTree *v);

    ~SegmentTree() {
        if (r - l < 600) return;
        if (lc && lc->unref()) deleteNode(lc);
        if (rc && rc->unref()) deleteNode(rc);
    }

    inline SegmentTree *buildChild(const int x) {
        register int mid = l + (r - l) / 2;
        if (x <= mid) return new (newNode()) SegmentTree(l, mid, NULL, NULL, 0);
        else return new (newNode()) SegmentTree(mid + 1, r, NULL, NULL, 0);
    }

    SegmentTree *insertSelf(const int x) {
        cnt++;
        register int mid = l + (r - l) / 2;
        if (x == l && x == r) return this;
        else if (x <= mid) return (lc = buildChild(x))->insertSelf(x), this;
        else return (rc = buildChild(x))->insertSelf(x), this;
    }

    SegmentTree *insert(const int x) {
        register int mid = l + (r - l) / 2;
        if (x == l && x == r) return new (newNode()) SegmentTree(l, r, NULL, NULL, cnt + 1);
        else if (x <= mid) return new (newNode()) SegmentTree(l, r, lc ? lc->insert(x) : buildChild(x)->insertSelf(x), rc ? rc->ref() : NULL, cnt + 1);
        else return new (newNode()) SegmentTree(l, r, lc ? lc->ref() : NULL, rc ? rc->insert(x) : buildChild(x)->insertSelf(x), cnt + 1);
    }

    inline SegmentTree *ref() {
        refCnt++;
        return this;
    }

    inline bool unref() {
        return !--refCnt;
    }

    int query(const int l, const int r) {
        if (l > this->r || r < this->l) return 0;
        else if (l <= this->l && r >= this->r) return cnt;
        else return lc->query(l, r) + rc->query(l, r);
    }

    inline int rank() {
        return lc ? lc->cnt : 0;
    }
} *segRoot;

template <typename T, size_t SIZE>
struct MemoryPool {
    char buf[sizeof(T) * SIZE], *p;
    T *recycle[SIZE], **pr;

    inline MemoryPool() : p(buf), pr(recycle) {}

    inline T *alloc() {
        if (p == buf + sizeof(T) * SIZE) {
            if (pr <= recycle) throw std::bad_alloc();
            else return *--pr;
        } else {
            register char *res = p;
            p += sizeof(T);
            return reinterpret_cast<T *>(res);
        }
    }

    inline void free(T *p) {
        *pr++ = p;
    }
};

MemoryPool<SegmentTree, MAXN * MAXN_LOG * 10> pool;
inline SegmentTree *SegmentTree::newNode() {
    return pool.alloc();
}

inline void SegmentTree::deleteNode(SegmentTree *p) {
    p->~SegmentTree();
    pool.free(p);
}

struct Node {
    struct Edge *e;
    Node *p;
    int w, ts, d;
    bool v;
    SegmentTree *seg;
    Node *f[MAXN_LOG + 1];
} N[MAXN];

struct Edge {
    Node *s, *t;
    Edge *next;

    Edge(Node *s, Node *t) : s(s), t(t), next(s->e) {};
};

inline void addEdge(const int u, const int v) {
    N[u].e = new Edge(&N[u], &N[v]);
    N[v].e = new Edge(&N[v], &N[u]);
}

int n, ts, logn = 0;

inline void bfs(Node *start, const bool init = true) {
    ++ts;
    std::queue<Node *> q;
    start->ts = ts;
    if (init) {
        start->p = start->f[0] = start;
        start->seg = segRoot->insert(start->w);
        start->d = 0;
    }
    q.push(start);

    while (!q.empty()) {
        Node *v = q.front();
        q.pop();

        for (register int j = 1; j <= logn; j++) {
            v->f[j] = v->f[j - 1]->f[j - 1];
        }

        for (Edge *e = v->e; e; e = e->next) if (e->t->ts != ts && (init || e->t != start->p)) {
            e->t->ts = ts;
            e->t->p = e->t->f[0] = v;
            if (e->t->seg) SegmentTree::deleteNode(e->t->seg);
            e->t->seg = v->seg->insert(e->t->w);
            e->t->d = v->d + 1;
            q.push(e->t);
        }
    }
}

inline void bfs() {
    for (register int i = 0; i < n; i++) if (N[i].ts == 0) bfs(&N[i]);
}

inline void link(int u, int v) {
    const register int su = ufs.getSize(u), sv = ufs.getSize(v);
    if (su > sv) std::swap(u, v);

    addEdge(u, v);
    N[u].p = N[u].f[0] = &N[v];
    SegmentTree::deleteNode(N[u].seg);
    N[u].seg = N[v].seg->insert(N[u].w);
    N[u].d = N[v].d + 1;
    bfs(&N[u], false);

    ufs.merge(u, v);
}

inline Node *lca(Node *u, Node *v) {
    if (u->d < v->d) std::swap(u, v);
    if (u->d != v->d) {
        for (register int i = logn; i >= 0; i--) if (u->f[i]->d >= v->d) u = u->f[i];
    }
    if (u != v) {
        for (register int i = logn; i >= 0; i--) if (u->f[i] != v->f[i]) u = u->f[i], v = v->f[i];
        return u->p;
    }
    return u;
}

inline int query(Node *u, Node *v, int k) {
    Node *p = lca(u, v);
    register int min = 0, max = n - 1;
    SegmentTree *sa = u->seg, *sb = v->seg, *sc = p->seg, *sd = p->p != p ? p->p->seg : segRoot;
    while (min != max) {
        const register int mid = min + (max - min) / 2;
        register int t = 0;
        if (sa) t += sa->rank();
        if (sb) t += sb->rank();
        if (sc) t -= sc->rank();
        if (sd) t -= sd->rank();
        if (k <= t) {
            if (sa) sa = sa->lc;
            if (sb) sb = sb->lc;
            if (sc) sc = sc->lc;
            if (sd) sd = sd->lc;
            max = mid;
        } else {
            if (sa) sa = sa->rc;
            if (sb) sb = sb->rc;
            if (sc) sc = sc->rc;
            if (sd) sd = sd->rc;
            k -= t, min = mid + 1;
        }
    }
    return min;
}

int main() {
    int tc;
    scanf("%d", &tc);
    int m, t;
    scanf("%d %d %d", &n, &m, &t);
    ufs.init(n);
    for (; (1 << (logn + 1)) <= n; logn++);

    for (register int i = 0; i < n; i++) scanf("%d", &N[i].w);
    static int set[MAXN];
    for (register int i = 0; i < n; i++) set[i] = N[i].w;
    std::sort(set, set + n);
    register int *end = std::unique(set, set + n);
    for (register int i = 0; i < n; i++) N[i].w = std::lower_bound(set, end, N[i].w) - set;

    segRoot = new SegmentTree(0, n - 1);

    while (m--) {
        int u, v;
        scanf("%d %d", &u, &v), u--, v--;
        addEdge(u, v);
    }

    bfs();

    register int lastAns = 0;
    while (t--) {
        char cmd[2];
        int u, v;
        scanf("%s %d %d", cmd, &u, &v), u ^= lastAns, v ^= lastAns, u--, v--;
        if (cmd[0] == 'Q') {
            int k;
            scanf("%d", &k);
            k ^= lastAns;
            printf("%d\n", lastAns = set[query(&N[u], &N[v], k)]);
        } else {
            link(u, v);
        }
    }

    return 0;
}
```