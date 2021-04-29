title: 「AHOI2014」支线剧情 - 费用流
categories:
  - OI
tags:
  - AHOI
  - BZOJ
  - Edmonds-Karp
  - 上下界网络流
  - 网络流
  - 费用流
permalink: ahoi2014-story
date: '2016-04-08 17:57:21'
---

游戏中有 $ N $ 个剧情点，由 $ 1 $ 到 $ N $ 编号，第 $ i $ 个剧情点可以经过不同的支线剧情，前往 $ K_i $ 种不同的新的剧情点。当然如果为 $ 0 $，则说明 $ i $ 号剧情点是游戏的一个结局了。

开始处在 $ 1 $ 号剧情点。任何一个剧情点都是从 $ 1 $ 号剧情点可达的。从任意剧情点出发，都不能再回到这个剧情点。要想回到之前的剧情点，唯一的方法就是开始新的游戏，回到 $ 1 $ 号剧情点。可以在任何时刻退出游戏并重新开始。求花费最少的时间，看完所有不同的支线剧情。

<!-- more -->

### 链接

[BZOJ 3876](http://www.lydsy.com/JudgeOnline/problem.php?id=3876)

### 题解

题目是一个这样的模型：给出一个带权 DAG，从每个点均可回到 1 号点且不需要花费，求从 1 号点出发遍历整个 DAG 的最小花费。

建立有上下界的费用流模型。

对于原图中的每条边 $ (u, v, w) $，转化为 $ (u, v, [1, \infty], w) $ 表示可以经过一次或多次这条边。对于不是 $ 1 $ 号点的任意一点 $ u $，连接 $ (u, 1, \infty, 0) $ 表示在任意一点可无限次回到 $ 1 $ 号点。

考虑去掉容量下界，对于原图中的每条边 $ (u, v, w) $，连接 $ (S, v, 1, w) $，表示这条边至少被走一次，连接 $ (u, T, 1, 0) $ 表示把从源点强行流给 $ v $ 的流量补给汇点。

实际上，$ (u, T, 1, 0) $ 类型的边是可以合并的，实现时只需要连边 $ (u, T, k_i, 0) $。

### 代码

```cpp
#include <cstdio>
#include <cstdlib>
#include <climits>
#include <queue>
#include <algorithm>

const int MAXN = 300;
const int MAXK = 50;

struct Node;
struct Edge;

struct Node {
    Edge *e, *in;
    int f, d;
    bool q;
} N[MAXN + 2];

struct Edge {
    Node *s, *t;
    int f, c, w;
    Edge *next, *r;

    Edge(Node *const s, Node *const t, const int c, const int w) : s(s), t(t), f(0), c(c), w(w), next(s->e) {}
};

template <typename T, size_t SIZE>
struct MemoryPool {
    char buf[SIZE * sizeof(T)], *cur;

    MemoryPool() : cur(buf) {}

    T *alloc() {
        if (cur == buf + (SIZE * sizeof(T))) return (T *)malloc(sizeof(T));
        else {
            char *p = cur;
            cur += sizeof(T);
            return (T *)p;
        }
    }
};

MemoryPool<Edge, MAXN * MAXK * 5> pool;
inline void addEdge(const int s, const int t, const int c, const int w) {
    N[s].e = &(*(pool.alloc()) = Edge(&N[s], &N[t], c, w));
    N[t].e = &(*(pool.alloc()) = Edge(&N[t], &N[s], 0, -w));
    N[s].e->r = N[t].e, N[t].e->r = N[s].e;
}

inline void edmondskarp(const int s, const int t, const int n, int &flow, int &cost) {
    flow = cost = 0;
    while (1) {
        for (int i = 0; i < n; i++) {
            N[i].q = false;
            N[i].in = NULL;
            N[i].f = 0;
            N[i].d = INT_MAX;
        }

        N[s].f = INT_MAX, N[s].d = 0;
        std::queue<Node *> q;
        q.push(&N[s]);

        while (!q.empty()) {
            Node *v = q.front();
            q.pop();
            v->q = false;

            for (Edge *e = v->e; e; e = e->next) {
                if (e->f < e->c && e->t->d > v->d + e->w) {
                    e->t->d = v->d + e->w;
                    e->t->in = e;
                    e->t->f = std::min(v->f, e->c - e->f);
                    if (!e->t->q) {
                        e->t->q = true;
                        q.push(e->t);
                    }
                }
            }
        }

        if (N[t].d == INT_MAX) return;

        for (Edge *e = N[t].in; e; e = e->s->in) {
            e->f += N[t].f;
            e->r->f -= N[t].f;
        }

        flow += N[t].f, cost += N[t].d * N[t].f;
    }
}

int n;

int main() {
    scanf("%d", &n);

    const int s = 0, t = n + 1;
    for (int u = 1, k; u <= n; u++) {
        scanf("%d", &k);

        for (int j = 0, v, w; j < k; j++) {
            scanf("%d %d", &v, &w);

            addEdge(u, v, INT_MAX, w);
            addEdge(s, v, 1, w);
        }

        addEdge(u, t, k, 0);
        if (u != 1) addEdge(u, 1, INT_MAX, 0);
    }

    int flow, cost;
    edmondskarp(s, t, n + 2, flow, cost);

    printf("%d\n", cost);

    return 0;
}
```