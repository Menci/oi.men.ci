title: 「COGS 734」方格取数 - 二分图最大独立集
categories:
  - OI
tags:
  - COGS
  - Dinic
  - 图论
  - 最大独立集
  - 网络流
  - 网络流 24 题
permalink: cogs-734
date: '2016-02-15 17:02:01'
---

在一个有 $ M * N $ 个方格的棋盘中，每个方格中有一个正整数。现要从方格中取数，使任意两个数所在方格没有公共边，且取出的数的总和最大。

<!-- more -->

### 链接

[COGS 734](http://cogs.top/cogs/problem/problem.php?pid=734)

### 题解

任意两个数所在的方格没有公共边，考虑把所有的格子建成图，不能同时选择的点之间两两连边，求出一个点权和最大的子图（最大独立集），其和即为答案。

进一步分析，发现这个图是一个二分图 —— 因为每个点只会和**棋盘中与其相邻的点**连边。

根据定理，二分图最大独立集即为最小点覆盖集的补集，而最小点覆盖集可以用最小割模型来求解。

建立源点 S 和汇点 T，对于二分图中每个 X 点集中的点，从 S 向其连一条边，容量为点权；对于每个 Y 点集中的点，从该点向汇点连一条边，容量为点权；对于原图中的每条边，转化为从 X 点集的点连接到 Y 点集中的点的边，容量为无穷大。求出最小割，则该最小割为简单割，即任意一条割边不可能是中间那条无穷大的边，而这些割边恰好不重复的覆盖了整个二分图中的所有点，并且权值和最小。

建立二分图模型的时候注意细节。

### 代码

```cpp
#include <cstdio>
#include <climits>
#include <algorithm>
#include <queue>

const int MAXN = 30;
const int MAXM = 30;

struct Node;
struct Edge;

struct Node {
    Edge *firstEdge;
    int level;
} nodes[MAXN * MAXM + 2];

struct Edge {
    Node *from, *to;
    int capacity, flow;
    Edge *next, *reversedEdge;

    Edge(Node *from, Node *to, int capacity) : from(from), to(to), next(from->firstEdge), capacity(capacity), flow(0) {}
};

int n, m;

struct Dinic {
    bool makeLevelGraph(Node *s, Node *t, int n) {
        for (int i = 0; i < n; i++) nodes[i].level = 0;

        std::queue<Node *> q;
        q.push(s);
        s->level = 1;

        while (!q.empty()) {
            Node *v = q.front();
            q.pop();

            for (Edge *e = v->firstEdge; e; e = e->next) {
                if (e->flow < e->capacity && e->to->level == 0) {
                    e->to->level = v->level + 1;
                    if (e->to == t) return true;
                    else q.push(e->to);
                }
            }
        }

        return false;
    }

    int findPath(Node *s, Node *t, int limit = INT_MAX) {
        if (s == t) return limit;

        for (Edge *e = s->firstEdge; e; e = e->next) {
            if (e->flow < e->capacity && e->to->level == s->level + 1) {
                int flow = findPath(e->to, t, std::min(limit, e->capacity - e->flow));
                if (flow > 0) {
                    e->flow += flow;
                    e->reversedEdge->flow -= flow;
                    return flow;
                }
            }
        }

        return 0;
    }

    int operator()(int s, int t, int n) {
        int ans = 0;
        while (makeLevelGraph(&nodes[s], &nodes[t], n)) {
            int flow;
            while ((flow = findPath(&nodes[s], &nodes[t])) > 0) ans += flow;
        }

        return ans;
    }
} dinic;

inline void addEdge(int from, int to, int capacity) {
    nodes[from].firstEdge = new Edge(&nodes[from], &nodes[to], capacity);
    nodes[to].firstEdge = new Edge(&nodes[to], &nodes[from], 0);

    nodes[from].firstEdge->reversedEdge = nodes[to].firstEdge, nodes[to].firstEdge->reversedEdge = nodes[from].firstEdge;
}

inline int getNodeID(int x, int y) {
    return x * n + y + 1;
}

int main() {
    freopen("grid.in", "r", stdin);
    freopen("grid.out", "w", stdout);

    scanf("%d %d", &m, &n);

    const int s = 0, t = n * m + 1;

    int sum = 0;
    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++) {
            int num;
            scanf("%d", &num);
            sum += num;

            int id = getNodeID(i, j);
            bool flag = (i + j) % 2 == 0;

            if (flag) addEdge(s, id, num);
            else addEdge(id, t, num);

            if (flag) {
                if (i > 0) addEdge(id, getNodeID(i - 1, j), INT_MAX);
                if (i < m - 1) addEdge(id, getNodeID(i + 1, j), INT_MAX);
                if (j > 0) addEdge(id, getNodeID(i, j - 1), INT_MAX);
                if (j < n - 1) addEdge(id, getNodeID(i, j + 1), INT_MAX);
            }
        }
    }

    int maxFlow = dinic(s, t, n * m + 2);
    printf("%d\n", sum - maxFlow);

    fclose(stdin);
    fclose(stdout);

    return 0;
}
```