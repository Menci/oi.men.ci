title: 「HAOI2016」食物链 - 拓扑排序 + DP
categories:
  - OI
tags:
  - BZOJ
  - COGS
  - DP
  - HAOI
  - 拓扑排序
permalink: haoi2016-chain
date: '2016-04-28 22:20:45'
---

给 $ n $ 个物种和 $ m $ 条能量流动关系，求其中的食物链条数。

<!-- more -->

### 链接

[BZOJ 4562](http://www.lydsy.com/JudgeOnline/problem.php?id=4562)  
[COGS 2266](http://cogs.top/cogs/problem/problem.php?pid=2266)

### 题解

题意中没有说清楚**食物链**的概念，根据样例可知，由生产者走向最高级消费者的简单路径，多条食物链可以有重叠。

我们令边的方向为生产者到最高级消费者，对整张图进行拓扑排序，同时 DP 出从入度为零的点（生产者）到该点的路径条数（一定是简单路径）。

所有出度为零（保证是最高级消费者）且原入度不为零（保证**不是**生产者，单独一个生产者没有消费者不算食物链）的点上的路径条数和即为食物链数量。

### 代码

```cpp
#include <cstdio>
#include <queue>

const int MAXN = 100000;
const int MAXM = 200000;

struct Node;
struct Edge;

struct Node {
    Edge *e;
    int originInDegree, inDegree, outDegree;
    int cnt;
} N[MAXN];

struct Edge {
    Node *s, *t;
    Edge *next;

    Edge(Node *const s, Node *const t) : s(s), t(t), next(s->e) {}
};

inline void addEdge(const int s, const int t) {
    N[s].e = new Edge(&N[s], &N[t]);
    N[s].outDegree++, N[t].inDegree++, N[t].originInDegree++;
}

int n, m;

inline void toposort() {
    std::queue<Node *> q;
    for (int i = 0; i < n; i++) {
        if (N[i].inDegree == 0) N[i].cnt = 1, q.push(&N[i]);
    }

    while (!q.empty()) {
        Node *v = q.front();
        q.pop();

        for (Edge *e = v->e; e; e = e->next) {
            e->t->cnt += v->cnt;
            if (!--e->t->inDegree) {
                q.push(e->t);
            }
        }
    }
}

int main() {
    freopen("chain_2016.in", "r", stdin);
    freopen("chain_2016.out", "w", stdout);

    scanf("%d %d", &n, &m);

    for (int i = 0; i < m; i++) {
        int u, v;
        scanf("%d %d", &u, &v), u--, v--;

        addEdge(u, v);
    }

    toposort();

    int ans = 0;
    for (int i = 0; i < n; i++) {
        if (N[i].outDegree == 0 && N[i].originInDegree != 0) ans += N[i].cnt;
    }

    printf("%d\n", ans);

    fclose(stdin);
    fclose(stdout);

    return 0;
}
```