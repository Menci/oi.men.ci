title: 「CEOI2008」Order - 最小割
categories:
  - OI
tags:
  - BZOJ
  - Dinic
  - 最小割
  - 网络流
permalink: ceoi2008-order
date: '2016-06-22 16:07:00'
---

有 $ N $ 个工作，$ M $ 种机器，每种机器你可以租或者买过来。每个工作（可以不做）包括若干道工序，每道工序需要某种机器来完成，你可以通过购买或租用机器来完成。求最大利润。

<!-- more -->

### 链接

[BZOJ 1391](http://www.lydsy.com/JudgeOnline/problem.php?id=1391)

### 题解

为每个工作和机器建点，增加源和汇。

从源点向每个工作连边，容量为利润；从每个工作向它需要的机器连边，容量为租用费用；从每个机器向汇点连边，容量为购买费用。

割源点连向工作的边表示不做工作，割中间的边表示租用一台机器，割机器到汇点的边表示购买机器。

所有工作利润的总和减去最小割即为答案。

### 代码

不知道哪里写错了，一直 MLE ……

```cpp
#include <cstdio>
#include <climits>
#include <algorithm>
// #include <queue>
// #include <vector>

const int MAXN = 1200;
const int MAXM = 1200;

struct Node;
struct Edge;

struct Node {
    Edge *e, *c;
    int l;
} N[MAXN + MAXM + 2];

struct Edge {
    Node *t;
    int c;
    Edge *next, *r;

    Edge(Node *s, Node *t, const int c) : t(t), c(c), next(s->e) {}
};

struct Dinic {
    bool makeLevelGraph(Node *s, Node *t, const int n) {
        for (int i = 0; i < n; i++) N[i].l = 0, N[i].c = N[i].e;

        // std::queue<Node *> q;
        // q.push(s);
        static Node *q[MAXN + MAXM + 2];
        Node **l = q, **r = q - 1;
        *++r = s;

        s->l = 1;

        while (l <= r /* !q.empty() */) {
            Node *v = *l++ /* q.front() */;
            // q.pop();

            for (Edge *e = v->e; e; e = e->next) if (!e->t->l && e->c) {
                e->t->l = v->l + 1;
                if (e->t == t) return true;
                else *++r = e->t; // q.push(e->t);
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

int main() {
    int n, m, sum = 0;
    scanf("%d %d", &n, &m);

    const int s = 0, t = n + m + 1;
    for (int i = 1; i <= n; i++) {
        int w, k;
        scanf("%d %d", &w, &k);
        sum += w;

        addEdge(s, i, w);

        for (int j = 0; j < k; j++) {
            int x, c;
            scanf("%d %d", &x, &c);

            addEdge(i, n + x, c);
        }
    }

    for (int i = 1; i <= m; i++) {
        int x;
        scanf("%d", &x);
        addEdge(n + i, t, x);
    }

    /*
    static int w[MAXN];
    static std::vector< std::pair<int, int> > used[MAXN];
    static std::vector<int> borrow[MAXM];
    static std::pair<int, int> buy[MAXM];
    int id = n + 1, sum = 0;

    for (int i = 1; i <= n; i++) {
        int k;
        scanf("%d %d", &w[i - 1], &k);
        sum += w[i - 1];

        for (int j = 0; j < k; j++) {
            int x, c;
            scanf("%d %d", &x, &c);

            int t = id++;
            used[i - 1].push_back(std::make_pair(t, c));
            borrow[x - 1].push_back(t);
        }
    }

    for (int i = 0; i < m; i++) {
        scanf("%d", &buy[i].second);
        buy[i].first = id++;
    }

    const int s = 0, t = id++;
    for (int i = 1; i <= n; i++) {
        addEdge(s, i, w[i - 1]);

        for (std::vector< std::pair<int, int> >::const_iterator it = used[i - 1].begin(); it != used[i - 1].end(); it++) {
            addEdge(i, it->first, it->second);
        }
    }

    for (int i = 0; i < m; i++) {
        for (std::vector<int>::const_iterator it = borrow[i].begin(); it != borrow[i].end(); it++) {
            addEdge(*it, buy[i].first, INT_MAX);
        }
        addEdge(buy[i].first, t, buy[i].second);
    }
    */

    int maxFlow = dinic(s, t, n + m + 2);
    printf("%d\n", sum - maxFlow);

    return 0;
}
```