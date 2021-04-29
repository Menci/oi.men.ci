title: 「JSOI2008」星球大战 - 离线 + 并查集
categories:
  - OI
tags:
  - BZOJ
  - JSOI
  - 并查集
  - 离线
permalink: jsoi2008-starwar
date: '2016-10-18 21:14:00'
---

给一个图，每次删除一个点，求连通块数量。

<!-- more -->

### 链接

[BZOJ 1015](http://www.lydsy.com/JudgeOnline/problem.php?id=1015)

### 题解

记录所有被删除的点，将除这些点邻边之外所有的边加入并查集，将操作离线变为加边，每次加入一个点的一些邻边，当某个邻边指向的点已被加入时，加入这条边。

### 代码

```cpp
#include <cstdio>
#include <vector>

const int MAXM = 200000;
const int MAXN = 2 * MAXM;

struct UnionFindSet {
    int a[MAXN], rk[MAXN];

    void init(const int n) { for (int i = 0; i < n; i++) a[i] = i, rk[i] = 1; }

    int find(const int x) { return x == a[x] ? x : a[x] = find(a[x]); }

    bool test(const int x, const int y) { return find(x) == find(y); }

    void merge(const int x, const int y) {
        const int p = find(x), q = find(y);
        if (p == q) return;
        if (rk[p] > rk[q]) a[q] = p;
        else if (rk[q] > rk[p]) a[p] = q;
        else a[p] = q, rk[q]++;
    }
} ufs;

struct Edge {
    bool added;
    int u, v;
} E[MAXM];

struct Node {
    std::vector<Edge *> e;
    bool added;
    bool willDelete;
} N[MAXN];

inline void addAllEdge(Node *v, int &ans) {
    ans++;
    for (std::vector<Edge *>::const_iterator it = v->e.begin(); it != v->e.end(); it++) {
        Edge *const &e = *it;
        if (!e->added && N[e->u].added && N[e->v].added && !ufs.test(e->u, e->v)) {
            ufs.merge(e->u, e->v);
            // printf("merge(%d, %d)\n", e->u, e->v);
            ans--;
            e->added = true;
        }
    }
}

int main() {
    int n, m, k, ans;
    static int a[MAXN];
    scanf("%d %d", &n, &m), ans = 0;

    ufs.init(n);

    for (int i = 0; i < m; i++) scanf("%d %d", &E[i].u, &E[i].v), N[E[i].u].e.push_back(&E[i]), N[E[i].v].e.push_back(&E[i]);

    scanf("%d", &k);
    for (int i = k - 1; i >= 0; i--) scanf("%d", &a[i]), N[a[i]].willDelete = true;

    for (int i = 0; i < n; i++) if (!N[i].willDelete) N[i].added = true, addAllEdge(&N[i], ans);

    std::vector<int> anses;
    anses.push_back(ans);

    for (int i = 0; i < k; i++) {
        // printf("before %d\n", a[i]);
        Node *v = &N[a[i]];
        v->added = true;
        addAllEdge(v, ans);
        anses.push_back(ans);
    }

    for (std::vector<int>::const_reverse_iterator it = anses.rbegin(); it != anses.rend(); it++) printf("%d\n", *it);

    return 0;
}
```