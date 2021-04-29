title: 「ZJOI2009」狼和羊的故事 - 最小割
categories:
  - OI
tags:
  - BZOJ
  - Dinic
  - ZJOI
  - 最小割
  - 网络流
permalink: zjoi2009-ws
date: '2016-06-23 18:23:00'
---

Orez 的羊狼圈可以看作一个 $ n \times m $ 个矩阵格子，这个矩阵的边缘已经装上了篱笆。他决定在羊狼圈中再加入一些篱笆，还是要将羊狼分开来养。通过仔细观察，Orez 发现狼和羊都有属于自己领地，Orez 想要添加篱笆的尽可能的短。篱笆不能改变狼羊的所属领地，篱笆必须修筑完整，也就是说必须修建在单位格子的边界上并且不能只修建一部分。

<!-- more -->

### 链接

[BZOJ 1412](http://www.lydsy.com/JudgeOnline/problem.php?id=1412)

### 题解

从源点向狼的领地连边，容量正无穷，从羊的领地向汇点连边，容量正无穷；相邻格子连无向边。最小割即为答案。

### 代码

```cpp
#include <cstdio>
#include <climits>
#include <algorithm>
#include <queue>

const int MAXN = 100;

struct Node;
struct Edge;

struct Node {
    Edge *e, *c;
    int l;
} N[MAXN * MAXN + 2];

struct Edge {
    Node *t;
    int c;
    Edge *next, *r;

    Edge(Node *s, Node *t, const int c) : t(t), c(c), next(s->e) {}
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

            for (Edge *e = v->e; e; e = e->next) if (!e->t->l && e->c) {
                e->t->l = v->l + 1;
                if (e->t == t) return true;
                else q.push(e->t);
            }
        }

        return false;
    }

    int findPath(Node *s, Node *t, const int limit = INT_MAX) {
        if (s == t) return limit;

        for (Edge *&e = s->c; e; e = e->next) if (e->t->l == s->l + 1 && e->c) {
            int f = findPath(e->t, t, std::min(limit, e->c));
            if (f) {
                e->c -= f, e->r->c += f;
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

        return res;
    }
} dinic;

inline void addEdge(const int s, const int t, const int c) {
    N[s].e = new Edge(&N[s], &N[t], c);
    N[t].e = new Edge(&N[t], &N[s], 0);
    (N[s].e->r = N[t].e)->r = N[s].e;
}

int n, m;

inline int id(const int i, const int j) { return (i - 1) * m + j; }

int main() {
    scanf("%d %d", &n, &m);

    const int s = 0, t = n * m + 1;

    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= m; j++) {
            int x;
            scanf("%d", &x);

            if (x == 1) addEdge(s, id(i, j), INT_MAX);
            else if (x == 2) addEdge(id(i, j), t, INT_MAX);

            if (i != 1) addEdge(id(i - 1, j), id(i, j), 1);
            if (i != n) addEdge(id(i + 1, j), id(i, j), 1);
            if (j != 1) addEdge(id(i, j - 1), id(i, j), 1);
            if (j != m) addEdge(id(i, j + 1), id(i, j), 1);
        }
    }

    const int maxFlow = dinic(s, t, n * m + 2);
    printf("%d\n", maxFlow);

    return 0;
}
```