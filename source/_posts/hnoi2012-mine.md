title: 「HNOI2012」矿场搭建 - 割点
categories:
  - OI
tags:
  - BZOJ
  - HNOI
  - Tarjan
  - 割点
  - 图论
permalink: hnoi2012-mine
date: '2016-09-08 07:52:00'
---

煤矿工地可以看成是由隧道连接挖煤点组成的无向图。为安全起见，希望在工地发生事故时所有挖煤点的工人都能有一条出路逃到救援出口处。于是矿主决定在某些挖煤点设立救援出口，使得无论哪一个挖煤点坍塌之后，其他挖煤点的工人都有一条道路通向救援出口。

请写一个程序，用来计算至少需要设置几个救援出口，以及不同最少救援出口的设置方案总数。

<!-- more -->

### 链接

[BZOJ 2730](http://www.lydsy.com/JudgeOnline/problem.php?id=2730)

### 题解

考虑删掉所有割点，图被分成若干个连通块，如果一个连通块与两个以上的割点连通，则不需要单独建设出口，否则需要单独建设一个出口。

如果图没有割点，需要任意找两个点建设出口。

### 代码

```cpp
#include <cstdio>
#include <queue>
#include <stack>
#include <tr1/unordered_set>

const int MAXN = 100000;

struct Node {
    struct Edge *e, *c;
    Node *p;
    int dfn, low;
    bool v, pushed, flag;
} N[MAXN];

struct Edge {
    Node *s, *t;
    Edge *next;

    Edge(Node *s, Node *t) : s(s), t(t), next(s->e) {}
};

inline void addEdge(const int s, const int t) {
    N[s].e = new Edge(&N[s], &N[t]);
    N[t].e = new Edge(&N[t], &N[s]);
}

int n;

inline int tarjan() {
    int ts = 0, cnt = 0;
    for (int i = 0; i < n; i++) {
        if (N[i].v) continue;
        std::stack<Node *> s;
        s.push(&N[i]);
        N[i].pushed = true;

        while (!s.empty()) {
            Node *v = s.top();
            if (!v->v) {
                v->v = true;
                v->c = v->e;
                v->low = v->dfn = ++ts;
            }

            if (v->c) {
                Edge *&e = v->c;
                if (e->t->v) v->low = std::min(v->low, e->t->dfn);
                else if (!e->t->pushed) e->t->pushed = true, s.push(e->t), e->t->p = v;
                e = e->next;
            } else {
                if (v != &N[i]) for (Edge *e = v->e; e; e = e->next) if (e->t->low >= v->dfn && e->t->p == v) {
                    v->flag = true;
                    break;
                }
                // if (v->flag) printf("!!!: %lu\n", v - N + 1);
                if (v->flag) cnt++;

                if (v->p) v->p->low = std::min(v->p->low, v->low);

                s.pop();
            }
        }

        int cnt = 0;
        for (Edge *e = N[i].e; e; e = e->next) if (e->t->p == &N[i]) cnt++;
        N[i].flag = cnt >= 2;
    }

    return cnt;
}

inline void solve(int &min, long long &cnt) {
    min = 0, cnt = 1;
    for (int i = 0; i < n; i++) N[i].v = false;
    for (int i = 0; i < n; i++) {
        if (N[i].v || N[i].flag) continue;
        std::queue<Node *> q;
        q.push(&N[i]);
        N[i].v = true;

        std::tr1::unordered_set<unsigned long> s;
        int size = 0;
        while (!q.empty()) {
            Node *v = q.front();
            q.pop();

            size++;

            for (Edge *e = v->e; e; e = e->next) {
                if (e->t->flag) s.insert(e->t - N);
                else if (!e->t->v) q.push(e->t), e->t->v = true;
            }
        }

        if (s.size() == 1) min++, cnt *= size;
    }

    if (!min) min = 2, cnt = n * (n - 1) / 2;
}

int main() {
    for (int i = 1, m; ~scanf("%d", &m) && m; i++) {
        n = 0;
        while (m--) {
            int u, v;
            scanf("%d %d", &u, &v);
            n = std::max(n, std::max(u, v));
            u--, v--;
            addEdge(u, v);
        }

        tarjan();

        int min;
        long long cnt;
        solve(min, cnt);
        printf("Case %d: %d %lld\n", i, min, cnt);

        for (int i = 0; i < n; i++) {
            N[i].v = N[i].pushed = N[i].flag = false;
            N[i].dfn = N[i].low = 0;
            N[i].p = NULL;
            Edge *next;
            for (Edge *&e = N[i].e; e; next = e->next, delete e, e = next);
        }
    }
    return 0;
}
```