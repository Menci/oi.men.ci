title: 「JSOI2016」飞机调度 - 最短路 + 网络流
categories: OI
tags: 
  - JSOI
  - 网络流
  - Dinic
  - 最短路
  - Floyd
permalink: jsoi2016-flight
date: 2016-04-24 00:41:33
---

JSOI 王国里有 $ N $ 个机场，编号为 $ 1 $ 到 $ N $。从 $ i $ 号机场到 $ j $ 号机场需要飞行 $ T_{i, j} $ 的时间。由于风向，地理位置和航空管制的因素，$ T_{i, j} $ 和 $ T_{j, i} $ 并不一定相同。

此外，由于飞机降落之后需要例行维修和加油。当一架飞机降落 $ k $ 号机场时，需要花费 $ P_k $ 的维护时间才能再次起飞。

JS Airways 一共运营 $ M $ 条航线，其中第 $ i $ 条直飞航线需要在 $ D_i $ 时刻从 $ X_i $ 机场起飞，不经停，飞往 $ Y_i $ 机场。

为了简化问题，我们假设 JS Airway 可以在 $ 0 $ 时刻在任意机场布置任意多架加油维护完毕的飞机；为了减少飞机的使用数，我们允许 JS Airways 增开任意多条临时航线以满足飞机的调度需求。

JYY 想知道，理论上 JS Airways 最少需要多少架飞机才能完成所有这 $ M $ 个航班。

<!-- more -->

### 题解
根据题意，从 $ i $ 机场经过 $ k $ 机场飞往 $ j $ 机场（不计在 $ i $、$ j $ 的维护时间）所需时间为 $ T[i][k] + P[k] + T[k][j] $，所以我们可以先使用 Floyd 求出任意两个机场之间经过若干次中转可以到达的最短时间。

考虑两条航线 $ A $ 和 $ B $，若一架飞机飞完 $ A $ 后可以接着飞 $ B $，则需要满足的条件为（二者之一）：

1. $ A $ 的终点为 $ B $ 的起点，且 $ A $ 的着陆时间加上维护时间早于 $ B $ 的起飞时间；
2. $ A $ 的着陆时间加上从 $ A $ 的终点经过若干次中转到 $ B $ 的起点所用时间加上若干次维护时间早于 $ B $ 的起飞时间。

根据上述两个条件，可以建立一张有向无环图，$ A \Rightarrow B $ 有边当且仅当一架飞机飞完 $ A $ 航线后可以接着飞 $ B $ 航线。即一架飞机连续飞的航线组成了图中的一条路径，题目中要求飞机数最少，即可转化为使用最少的路径覆盖整个图，转化为二分图匹配模型，使用网络流解决即可。

### 代码
```c++
#include <cstdio>
#include <climits>
#include <algorithm>
#include <queue>

const int MAXN = 500;
const int MAXM = 500;

struct Node;
struct Edge;

struct Node {
    Edge *e, *c;
    int l;
    bool flag;
} N[MAXM * 2 + 2];

struct Edge {
    Node *s, *t;
    int f, c;
    Edge *next, *r;

    Edge(Node *const s, Node *const t, const int c) : s(s), t(t), f(0), c(c), next(s->e) {}
};

inline void addEdge(const int s, const int t, const int c) {
    // printf("(%d, %d, %d)\n", s, t, c);
    N[s].e = new Edge(&N[s], &N[t], c);
    N[t].e = new Edge(&N[t], &N[s], 0);
    N[s].e->r = N[t].e, N[t].e->r = N[s].e;
}

struct Dinic {
    bool makeLevelGraph(Node *const s, Node *const t, const int n) {
        for (int i = 0; i < n; i++) N[i].l = 0, N[i].c = N[i].e;

        std::queue<Node *> q;
        q.push(s);
        s->l = 1;

        while (!q.empty()) {
            Node *v = q.front();
            q.pop();

            for (Edge *e = v->e; e; e = e->next) if (e->t->l == 0 && e->f < e->c) {
                e->t->l = v->l + 1;
                if (e->t == t) return true;
                else q.push(e->t);
            }
        }

        return false;
    }

    int findPath(Node *const s, Node *const t, const int limit = INT_MAX) {
        if (s == t) return limit;

        for (Edge *&e = s->c; e; e = e->next) if (e->t->l == s->l + 1 && e->f < e->c) {
            int f = findPath(e->t, t, std::min(limit, e->c - e->f));
            if (f > 0) {
                e->f += f, e->r->f -= f;
                return f;
            }
        }

        return 0;
    }

    int operator()(const int s, const int t, const int n) {
        int ans = 0;
        while (makeLevelGraph(&N[s], &N[t], n)) {
            int f;
            while ((f = findPath(&N[s], &N[t])) > 0) ans += f;
        }
        
        return ans;
    }
} dinic;

struct Airline {
    int s, t, time;
} A[MAXM];

int n, m, p[MAXN], t[MAXN][MAXN], d[MAXN][MAXN];
int S, T;

inline void floyd() {
    for (int k = 0; k < n; k++) for (int i = 0; i < n; i++) for (int j = 0; j < n; j++)
        if (i != j)
            d[i][j] = std::min(d[i][j], d[i][k] + p[k] + d[k][j]);

    // for (int i = 0; i < n; i++) {
    //     for (int j = 0; j < n; j++) printf("%d ", d[i][j]);
    //     putchar('\n');
    // }
}

inline void addEdge(const int u, const int v) {
    // printf("(%d, %d)\n", u, v);
    if (!N[u].flag) addEdge(S, u, 1), N[u].flag = true;
    addEdge(u, v + m, INT_MAX);
    if (!N[v + m].flag) addEdge(v + m, T, 1), N[v + m].flag = true;
}

int main() {
	freopen("flight.in", "r", stdin);
	// freopen("flight.out", "w", stdout);

	scanf("%d %d", &n, &m);
    for (int i = 0; i < n; i++) scanf("%d", &p[i]);
    for (int i = 0; i < n; i++) for (int j = 0; j < n; j++) scanf("%d", &t[i][j]), d[i][j] = t[i][j];

    floyd();

    for (int i = 0; i < m; i++) scanf("%d %d %d", &A[i].s, &A[i].t, &A[i].time), A[i].s--, A[i].t--;

    // for (int i = 0; i < n; i++) printf("%d\n", p[i]);
    // for (int i = 0; i < m; i++) printf("%d %d %d\n", A[i].s, A[i].t, A[i].time);

    S = 0, T = m * 2 + 1;
    for (int i = 1; i <= m; i++) {
        Airline &a = A[i - 1];
        for (int j = 1; j <= m; j++) {
            Airline &b = A[j - 1];

            if (   (a.time + t[a.s][a.t] + p[a.t] + d[a.t][b.s] + p[b.s] <= b.time)
                || (a.time + t[a.s][a.t] + p[a.t] <= b.time && a.t == b.s)
               ) {
                addEdge(i, j);
            }
        }
    }

    int flow = dinic(S, T, m * 2 + 2);
    printf("%d\n", m - flow);

	fclose(stdin);
	fclose(stdout);

	return 0;
}
```
