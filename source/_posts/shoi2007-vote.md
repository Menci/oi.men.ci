title: 「SHOI2007」善意的投票 - 最小割
categories:
  - OI
tags:
  - BZOJ
  - Dinic
  - SHOI
  - 最小割
  - 网络流
permalink: shoi2007-vote
date: '2016-06-21 15:04:00'
---

幼儿园里有 $ n $ 个小朋友打算通过投票来决定睡不睡午觉。他们也可以投和自己本来意愿相反的票。我们定义一次投票的冲突数为好朋友之间发生冲突的总数加上和所有和自己本来意愿发生冲突的人数。每位小朋友应该怎样投票，才能使冲突数最小？

<!-- more -->

### 链接

[BZOJ 1934](http://www.lydsy.com/JudgeOnline/problem.php?id=1934)

### 题解

从源点向每个意愿反对的人连边，从每个意愿赞成的人向汇点连边，「好朋友」之间连单向边，容量均为 $ 1 $。最小割即为答案。

对于一条增广路 $ S - u - v - T $，$ u $ 意愿反对，$ v $ 意愿赞成。如果割掉中间 $ u - v $ 的边，表示 $ u $ 和 $ v $ 分别按照自己的意愿投票，两个人之间冲突，代价 $ +1 $。如果割掉 $ S - u $ 或 $ v - T $，表示 $ u $ 或 $ v $ 不按照自己的意愿，自身发生冲突，代价 $ +1 $。

### 代码

```cpp
#include <cstdio>
#include <climits>
#include <queue>
#include <algorithm>

const int MAXN = 300;
const int MAXM = MAXN * (MAXN - 1) / 2;

struct Node;
struct Edge;

struct Node {
    Edge *e, *c;
    int l;
} N[MAXN + 2];

struct Edge {
    Node *s, *t;
    int f, c;
    Edge *next, *r;

    Edge(Node *s, Node *t, const int c) : s(s), t(t), f(0), c(c), next(s->e) {}
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

            for (Edge *e = v->e; e; e = e->next) if (!e->t->l && e->f < e->c) {
                e->t->l = v->l + 1;
                if (e->t == t) return true;
                else q.push(e->t);
            }
        }

        return false;
    }

    int findPath(Node *s, Node *t, const int limit = INT_MAX) {
        if (s == t) return limit;

        for (Edge *e = s->e; e; e = e->next) if (e->t->l == s->l + 1 && e->f < e->c) {
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

        return res;
    }
} dinic;

inline void addEdge(const int s, const int t, const int c, const int rc = 0) {
    // printf("[%d, %d, %d, %d]\n", s, t, c, rc);
    N[s].e = new Edge(&N[s], &N[t], c);
    N[t].e = new Edge(&N[t], &N[s], rc);
    (N[s].e->r = N[t].e)->r = N[s].e;
}

int main() {
    int n, m;
    scanf("%d %d", &n, &m);

    const int s = 0, t = n + 1;
    for (int i = 1; i <= n; i++) {
        int x;
        scanf("%d", &x);
        if (x == 0) {
            addEdge(s, i, 1);
        } else {
            addEdge(i, t, 1);
        }
    }

    for (int i = 0; i < m; i++) {
        int u, v;
        scanf("%d %d", &u, &v);

        addEdge(u, v, 1, 1);
    }

    int maxFlow = dinic(s, t, n + 2);
    printf("%d\n", maxFlow);

    return 0;
}
```