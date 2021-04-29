title: 「POI2006」Szk-Schools - 费用流
categories:
  - OI
tags:
  - BZOJ
  - Edmonds-Karp
  - POI
  - 网络流
  - 费用流
permalink: poi2006-szk
date: '2016-06-22 18:20:00'
---

有一个长度为 $ n $ 的序列 $ a_i $，每个数都在 $ [1,\ n] $ 之间，要求把这些数变成一个 $ n $ 的排列：

1. $ a_i $ 可以被改成 $ [l_i,\ r_i] $ 之间的数；
2. $ a_i $ 改变为 $ x $ 的花费为 $ k \times | a_i - x | $。

求是否可行及最小花费。

<!-- more -->

### 链接

[BZOJ 1520](http://www.lydsy.com/JudgeOnline/problem.php?id=1520)

### 题解

对于第 $ i $ 个旧数字，向 $ [l_i,\ r_i] $ 中的每个新数字连一条边，容量为 $ 1 $，费用为花费。

源点向每个旧数字连边，容量为 $ 1 $；每个新数字向汇点连边，容量为 $ 1 $。

若最大流不为 $ n $ 则无解，否则最小费用即为答案。

### 代码

```cpp
#include <cstdio>
#include <cstdlib>
#include <climits>
#include <algorithm>
#include <queue>

const int MAXN = 200;

struct Node;
struct Edge;

struct Node {
    Edge *e, *in;
    int d, f;
    bool q;
} N[MAXN * 2 + 2];

struct Edge {
    Node *s, *t;
    int f, c, w;
    Edge *next, *r;

    Edge(Node *s, Node *t, const int c, const int w) : s(s), t(t), f(0), c(c), w(w), next(s->e) {}
};

inline void edmondskarp(const int s, const int t, const int n, int &f, int &c) {
    f = c = 0;
    while (true) {
        for (int i = 0; i < n; i++) {
            N[i].q = false;
            N[i].f = 0;
            N[i].d = INT_MAX;
            N[i].in = NULL;
        }

        std::queue<Node *> q;
        q.push(&N[s]);

        N[s].f = INT_MAX, N[s].d = 0;

        while (!q.empty()) {
            Node *v = q.front();
            q.pop();

            v->q = false;

            for (Edge *e = v->e; e; e = e->next) if (e->f < e->c && e->t->d > v->d + e->w) {
                e->t->d = v->d + e->w;
                e->t->f = std::min(v->f, e->c - e->f);
                e->t->in = e;
                if (!e->t->q) {
                    e->t->q = true;
                    q.push(e->t);
                }
            }
        }

        if (N[t].d == INT_MAX) return;

        for (Edge *e = N[t].in; e; e = e->s->in) {
            e->f += N[t].f;
            e->r->f -= N[t].f;
        }

        f += N[t].f;
        c += N[t].f * N[t].d;
    }
}

inline void addEdge(const int s, const int t, const int c, const int w) {
    N[s].e = new Edge(&N[s], &N[t], c, w);
    N[t].e = new Edge(&N[t], &N[s], 0, -w);
    (N[s].e->r = N[t].e)->r = N[s].e;
}

int main() {
    int n;
    scanf("%d", &n);

    const int s = 0, t = n * 2 + 1;
    for (int i = 1; i <= n; i++) {
        int m, l, r, k;
        scanf("%d %d %d %d", &m, &l, &r, &k);

        addEdge(s, i, 1, 0);
        addEdge(i + n, t, 1, 0);

        for (int j = l; j <= r; j++) {
            addEdge(i, n + j, 1, k * abs(j - m));
        }
    }

    int f, c;
    edmondskarp(s, t, n * 2 + 2, f, c);
    if (f != n) puts("NIE");
    else printf("%d\n", c);

    return 0;
}
```