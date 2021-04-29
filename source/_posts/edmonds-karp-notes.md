title: Edmonds-Karp 费用流学习笔记
categories:
  - OI
tags:
  - Edmonds-Karp
  - 图论
  - 学习笔记
  - 算法模板
  - 网络流
  - 费用流
permalink: edmonds-karp-notes
date: '2016-02-19 17:04:38'
---

有一类网络流问题，最大流并不唯一，而每一条边都有一个单位流量的费用，最优解的目标是保证流量最大的前提下使总费用最小。单纯的最大流可以使用 Edmonds-Karp 算法求解，但这个算法不够优，最常用的是 Dinic 算法。但 Edmonds-Karp 确是最小费用流问题最常用的算法。

<!-- more -->

### 定义

费用（$ \mathrm{cost} $）：单位流量流过一条边需要支付的费用，算法的目标是使总流量最大的前提下总费用最小。

其他的定义和 Dinic 中基本相同，但 Edmonds-Karp 中没有「层次」和「层次图」的概念。

Edmonds-Karp 的反向边的费用是原边的费用相反数。

### 算法

1. 在残量网络中以「费用」为距离，沿着未满流边找出一条从源点到汇点的最短路，并进行增广。
2. 增广时将总费用加上**汇点的距离** $ \times $ **增广流量**。
3. 无法找到增广路时算法结束，此时已找出网络的最小费用最大流。

找最短路时，一般使用 Bellman-Ford 算法，因为网络中一般都会存在负权边，而不可能有负环 —— 当有负环时，最小费用最大流不存在。

Edmonds-Karp 基于一个事实：如果当前费用是在当前流量下的最小费用，那么以最小费用增广之后的费用也为增广后的流量下的最小费用。不断增广找到的就是最小费用最大流。

### 代码实现

```cpp
#include <cstdio>
#include <climits>
#include <algorithm>
#include <queue>

const int MAXN = 400;

struct Node {
    struct Edge *firstEdge, *inEdge;
    int flow, dist;
    bool inQueue;
} N[MAXN + 1];

struct Edge {
    Node *from, *to;
    int capacity, flow, cost;
    Edge *next, *reversedEdge;

    Edge(Node *from, Node *to, int capacity, int cost) : from(from), to(to), capacity(capacity), flow(0), cost(cost), next(from->firstEdge) {}
};

inline void addEdge(int from, int to, int capacity, int cost) {
    N[from].firstEdge = new Edge(&N[from], &N[to], capacity, cost);
    N[to].firstEdge = new Edge(&N[to], &N[from], 0, -cost);

    N[from].firstEdge->reversedEdge = N[to].firstEdge;
    N[to].firstEdge->reversedEdge = N[from].firstEdge;
}

inline void edmondskarp(int s, int t, int n, int &flow, int &cost) {
    flow = cost = 0;
    while (1) {
        for (int i = 1; i <= n; i++) {
            N[i].inEdge = NULL;
            N[i].flow = 0;
            N[i].dist = INT_MAX;
            N[i].inQueue = false;
        }

        std::queue<Node *> q;
        q.push(&N[s]);

        N[s].flow = INT_MAX;
        N[s].dist = 0;

        while (!q.empty()) {
            Node *v = q.front();
            q.pop();

            v->inQueue = false;

            for (Edge *e = v->firstEdge; e; e = e->next) {
                if (e->flow < e->capacity && e->to->dist > v->dist + e->cost) {
                    e->to->dist = v->dist + e->cost;
                    e->to->inEdge = e;
                    e->to->flow = std::min(v->flow, e->capacity - e->flow);
                    if (!e->to->inQueue) {
                        q.push(e->to);
                        e->to->inQueue = true;
                    }
                }
            }
        }

        if (N[t].dist == INT_MAX) break;

        for (Edge *e = N[t].inEdge; e; e = e->from->inEdge) {
            e->flow += N[t].flow;
            e->reversedEdge->flow -= N[t].flow;
        }

        flow += N[t].flow;
        cost += N[t].dist * N[t].flow;
    }
}

int main() {
    int n, m;
    scanf("%d %d", &n, &m);
    while (m--) {
        int u, v, cap, cost;
        scanf("%d %d %d %d", &u, &v, &cap, &cost);
        addEdge(u, v, cap, cost);
    }

    int flow, cost;
    edmondskarp(1, n, n, flow, cost);

    printf("%d %d\n", flow, cost);

    return 0;
}
```