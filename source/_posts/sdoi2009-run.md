title: 「SDOI2009」晨跑 - 费用流
categories:
  - OI
tags:
  - BZOJ
  - Edmonds-Karp
  - SDOI
  - 网络流
  - 费用流
permalink: sdoi2009-run
date: '2016-06-21 20:24:00'
---

现在给出一张地图，地图中包含 $ N $ 个十字路口和 $ M $ 条街道，Elaxia 只能从一个十字路口跑向另外一个十字路口，街道之间只在十字路口处相交。Elaxia 每天从寝室出发跑到学校，保证寝室编号为 $ 1 $，学校编号为 $ N $。Elaxia 的晨跑计划是按周期（包含若干天）进行的，由于他不喜欢走重复的路线，所以在一个周期内，每天的晨跑路线都不会相交（在十字路口处），寝室和学校不算十字路口。
他希望在一个周期内跑的路程尽量短，但是又希望训练周期包含的天数尽量长。

<!-- more -->

### 链接

[BZOJ 1877](http://www.lydsy.com/JudgeOnline/problem.php?id=1877)

### 题解

将每个点拆成两个点，中间设置 $ 1 $ 的流量限制，求出最小费用最大流，费用为路程，流量为天数。

### 代码

```cpp
#include <cstdio>
#include <climits>
#include <queue>
#include <algorithm>

const int MAXN = 200;
const int MAXM = 20000;

struct Node;
struct Edge;

struct Node {
    Edge *e, *in;
    int f, d;
    bool q;
} N[MAXN * 2 + 2];

struct Edge {
    Node *s, *t;
    int f, c, w;
    Edge *next, *r;

    Edge(Node *s, Node *t, const int c, const int w) : s(s), t(t), f(0), c(c), w(w), next(s->e) {}
};

inline void addEdge(const int s, const int t, const int c, const int w) {
    N[s].e = new Edge(&N[s], &N[t], c, w);
    N[t].e = new Edge(&N[t], &N[s], 0, -w);
    (N[s].e->r = N[t].e)->r = N[s].e;
}

inline void edmondskarp(const int s, const int t, const int n, int &f, int &c) {
    f = c = 0;
    while (true) {
        // printf("%d %d\n", f, c);
        for (int i = 0; i < n; i++) {
            N[i].in = NULL;
            N[i].f = 0;
            N[i].d = INT_MAX;
            N[i].q = false;
        }

        std::queue<Node *> q;
        q.push(&N[s]);
        N[s].f = INT_MAX, N[s].d = 0;

        while (!q.empty()) {
            Node *v = q.front();
            q.pop();

            v->q = false;

            for (Edge *e = v->e; e; e = e->next) if (e->t->d > v->d + e->w && e->f < e->c) {
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
            // printf("[%ld, %ld]\n", e->s - N, e->t - N);
            e->f += N[t].f;
            e->r->f -= N[t].f;
        }

        f += N[t].f;
        c += N[t].f * N[t].d;
    }
}

int main() {
    int n, m;
    scanf("%d %d", &n, &m);

    for (int i = 1; i <= n; i++) addEdge(i, i + n, 1, 0);

    const int s = 0, t = n * 2 + 1;
    for (int i = 0; i < m; i++) {
        int u, v, w;
        scanf("%d %d %d", &u, &v, &w);

        addEdge(u + n, v, 1, w);
    }

    addEdge(s, 1 + n, INT_MAX, 0);
    addEdge(n, t, INT_MAX, 0);

    int f, c;
    edmondskarp(s, t, n * 2 + 2, f, c);
    printf("%d %d\n", f, c);

    return 0;
}
```