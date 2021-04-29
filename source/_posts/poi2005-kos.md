title: 「POI2005」Kos-Dicing - 二分答案 + 网络流
categories:
  - OI
tags:
  - BZOJ
  - Dinic
  - POI
  - 二分答案
  - 网络流
permalink: poi2005-kos
date: '2016-06-22 18:25:00'
---

Dicing 是一个两人玩的游戏，人们专门成立了这个游戏的一个俱乐部，俱乐部的人时常在一起玩这个游戏然后评选出玩得最好的人。有一个人想知道比赛以后赢的最多的那个家伙最少会赢多少场。

<!-- more -->

### 链接

[BZOJ 1532](http://www.lydsy.com/JudgeOnline/problem.php?id=1532)

### 题解

二分答案 $ x $，从源点向每个人连边容量为 $ x $，从每个人向他参加的比赛连边容量为 $ 1 $，每个比赛向汇点连边容量为 $ 1 $，若最大流为 $ m $ 则可行。

每一条单位为 $ 1 $ 的增广路表示一个人赢了一场比赛。

### 代码

```cpp
#include <cstdio>
#include <climits>
#include <queue>
#include <algorithm>

const int MAXN = 10000;
const int MAXM = 10000;

struct Node;
struct Edge;

struct Node {
    Edge *e, *c;
    int l;
} N[MAXN + MAXM + 2];

struct Edge {
    Node *t;
    int f, c;
    Edge *next, *r;

    Edge(Node *s, Node *t, const int c) : t(t), f(0), c(c), next(s->e) {}
};

struct Dinic {
    bool makeLevelGraph(Node *s, Node *t, const int n) {
        for (int i = 0; i < n; i++) N[i].l = 0, N[i].c = N[i].e;

        std::queue<Node *> q;
        q.push(s);

        s->l = 1;

        while (!q.empty()) {
            Node *v = q.front();
            q.pop();

            for (Edge *e = v->e; e; e = e->next) if (!e->t->l && e->c > e->f) {
                e->t->l = v->l + 1;
                if (e->t == t) return true;
                else q.push(e->t);
            }
        }

        return false;
    }

    int findPath(Node *s, Node *t, const int limit = INT_MAX) {
        if (s == t) return limit;

        for (Edge *&e = s->c; e; e = e->next) if (e->t->l == s->l + 1 && e->c > e->f) {
            int f = findPath(e->t, t, std::min(limit, e->c - e->f));
            if (f) {
                e->f += f, e->r->f -= f;
                return f;
            }
        }

        return 0;
    }

    int operator()(const int s, const int t, const int n) {
        int res = 0;
        while (makeLevelGraph(&N[s], &N[t], n)) {
            int f;
            while ((f = findPath(&N[s], &N[t])) > 0) res += f;
        }

        // printf("dinic() = %d\n", res);
        return res;
    }
} dinic;

inline Edge *addEdge(const int s, const int t, const int c) {
    N[s].e = new Edge(&N[s], &N[t], c);
    N[t].e = new Edge(&N[t], &N[s], 0);
    return (N[s].e->r = N[t].e)->r = N[s].e;
}

int n, m;
Edge *E[MAXN];

inline void reset(const int c) {
    for (int i = 0; i < n + m + 2; i++) {
        if (i < n) E[i]->c = c;
        for (Edge *e = N[i].e; e; e = e->next) e->f = 0;
    }
}

inline int solve(const int s, const int t, const int n) {
    int l = 0, r = m;
    while (l < r) {
        // printf("[%d, %d]\n", l, r);
        int mid = l + (r - l) / 2;

        reset(mid);

        if (dinic(s, t, n) < m) l = mid + 1;
        else r = mid;
    }

    return l;
}

int main() {
    scanf("%d %d", &n, &m);

    const int s = 0, t = n + m + 1;

    for (int i = 1; i <= n; i++) E[i - 1] = addEdge(s, i, 0);

    for (int i = 1; i <= m; i++) {
        int a, b;
        scanf("%d %d", &a, &b);

        addEdge(a, n + i, 1);
        addEdge(b, n + i, 1);

        addEdge(n + i, t, 1);
    }

    printf("%d\n", solve(s, t, n + m + 2));

    return 0;
}
```