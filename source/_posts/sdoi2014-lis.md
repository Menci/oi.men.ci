title: 「SDOI2014」LIS - 最小割 + 网络流退流
categories:
  - OI
tags:
  - BZOJ
  - SDOI
  - 最小割
  - 网络流
permalink: sdoi2014-lis
date: '2017-03-01 10:41:00'
---

给定序列 $ A $，序列中的每一项 $ A_i $ 有删除代价 $ B_i $ 和附加属性 $ C_i $。请删除若干项，使得 $ A $ 的最长上升子序列长度减少至少 $ 1 $，且付出的代价之和最小，并输出方案。

如果有多种方案，请输出将删去项的附加属性排序 $ C_i $ 之后，字典序最小的一种。

<!-- more -->

### 链接

[BZOJ 3632](http://www.lydsy.com/JudgeOnline/problem.php?id=3532)

### 题解

首先，第一问，求最小的删除代价使得 LIS 长度减少。

* 为序列中的每一项建立两个点 $ i $ 与 $ i' $，连边 $ i \xrightarrow{C_i} i' $；
* 动态规划求出 $ f(i) $ 表示以 $ i $ 结尾的 LIS 长度，设 $ k = \max\{ f(i) \} $
    * 如果能从 $ i $ 转移到 $ j $，则连边 $ i' \xrightarrow{+\infty} j $；
    * 对于每个 $ f(i) = 1 $ 的 $ i $，连边 $ S \xrightarrow{+\infty} i $；
    * 对于每个 $ f(i) = k $ 的 $ i $，连边 $ i' \xrightarrow{+\infty} T $。

求出 $ S $ 到 $ T $ 的最小割，即为最小删除代价和 —— 因为这样所有的从 $ S $ 到 $ T $ 的路径都不连通的，即所有的原最长的上升序列都被断开了。

第二问，要求求一组方案使得 $ C_i $ 字典序最小 —— 我们检查按照 $ C_i $ 从小到大的顺序检查每一条 $ i \rightarrow i' $ 的边，如果它满流，并且从 $ i $ 无法到达 $ i' $，则表明 $ i \rightarrow i' $ 可以成为一条割边（但它不一定实际存在于当前残量网络的最小割集中）。我们将 $ i $ 记录到方案中，并且，为了使这条边实际成为割边，我们将这条边删除（将其本身和其反向边的容量置空），然后消除它对残量网络的影响 —— 从 $ T $ 到 $ i' $ 进行一次最大流，从 $ i $ 到 $ S $ 进行一次最大流，这样使经过这条边的所有流量回到了源点，而这条边则相当于是一条割边。

### 代码

```cpp
#include <cstdio>
#include <climits>
#include <algorithm>
#include <queue>

const int MAXN = 700;

struct Node {
    std::vector<struct Edge> e;
    struct Edge *c;
    int l;
} N[MAXN * 2 + 2];

struct Edge {
    Node *s, *t;
    int f, c, r;

    Edge(Node *s, Node *t, int c, int r) : s(s), t(t), f(0), c(c), r(r) {}
};

inline int addEdge(int s, int t, int c) {
    // printf("%2d -> %2d = %d\n", s, t, c);
    N[s].e.push_back(Edge(&N[s], &N[t], c, N[t].e.size()));
    N[t].e.push_back(Edge(&N[t], &N[s], 0, N[s].e.size() - 1));
    return N[s].e.size() - 1;
}

struct Dinic {
    bool level(Node *s, Node *t, int n) {
        for (int i = 0; i < n; i++) {
            N[i].c = &N[i].e.front();
            N[i].l = 0;
        }

        std::queue<Node *> q;
        q.push(s);

        s->l = 1;

        while (!q.empty()) {
            Node *v = q.front();
            q.pop();

            for (Edge *e = &v->e.front(); e <= &v->e.back(); e++) {
                if (e->f < e->c && !e->t->l) {
                    e->t->l = v->l + 1;
                    if (e->t == t) return true;
                    else q.push(e->t);
                }
            }
        }

        return false;
    }

    int find(Node *s, Node *t, int limit = INT_MAX) {
        if (s == t) return limit;

        for (Edge *&e = s->c; e <= &s->e.back(); e++) {
            if (e->f < e->c && e->t->l == s->l + 1) {
                int f = find(e->t, t, std::min(limit, e->c - e->f));
                if (f) {
                    e->f += f;
                    e->t->e[e->r].f -= f;
                    return f;
                }
            }
        }

        return 0;
    }

    int operator()(int s, int t, int n) {
        int res = 0;
        while (level(&N[s], &N[t], n)) {
            int f;
            while ((f = find(&N[s], &N[t])) > 0) res += f;
        }
        return res;
    }
} dinic;

int main() {
    int T;
    scanf("%d", &T);
    while (T--) {
        int n;
        scanf("%d", &n);

        static int a[MAXN + 1], b[MAXN + 1], c[MAXN + 1];
        for (int i = 1; i <= n; i++) scanf("%d", &a[i]);
        for (int i = 1; i <= n; i++) scanf("%d", &b[i]);
        for (int i = 1; i <= n; i++) scanf("%d", &c[i]);

        // DP
        static int f[MAXN + 1];
        int maxLen = 0;
        for (int i = 1; i <= n; i++) {
            f[i] = 0;
            for (int j = 0; j < i; j++) {
                if (a[j] < a[i]) {
                    f[i] = std::max(f[i], f[j] + 1);
                    maxLen = std::max(maxLen, f[i]);
                }
            }
        }

        // Build Graph
        int s = 0, t = n * 2 + 1;
        static int edge[MAXN + 1];
        for (int i = 1; i <= n; i++) {
            edge[i] = addEdge(i, i + n, b[i]);

            if (f[i] == 1) addEdge(s, i, INT_MAX);
            if (f[i] == maxLen) addEdge(i + n, t, INT_MAX);

            for (int j = 1; j < i; j++) {
                if (a[j] < a[i] && f[j] == f[i] - 1) {
                    addEdge(j + n, i, INT_MAX);
                }
            }
        }

        int ans = dinic(s, t, n * 2 + 2);

        // Sort by C[i]
        static std::pair<int, int> p[MAXN + 1];
        for (int i = 1; i <= n; i++) p[i] = std::make_pair(c[i], i);
        std::sort(p + 1, p + n + 1);

        // Calc the plan
        std::vector<int> plan;
        for (int j = 1; j <= n; j++) {
            int i = p[j].second;

            Edge &e = N[i].e[edge[i]];

            int u = e.s - N, v = e.t - N;

            if (e.f == e.c && !dinic.level(e.s, e.t, n * 2 + 2)) {
                e.f = e.c = e.t->e[e.r].f = e.t->e[e.r].c = 0;
                dinic(u, s, n * 2 + 2);
                dinic(t, v, n * 2 + 2);

                plan.push_back(i);
            }
        }

        printf("%d %d\n", ans, int(plan.size()));

        std::sort(plan.begin(), plan.end());
        for (size_t i = 0; i < plan.size(); i++) printf("%d%c", plan[i], " \n"[i == plan.size() - 1]);

        // Clear up
        for (int i = 0; i < n * 2 + 2; i++) N[i].e.clear();
    }

    return 0;
}
```