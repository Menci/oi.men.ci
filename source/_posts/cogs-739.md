title: 「COGS 739」运输问题 - 费用流
categories: OI
tags: 
  - COGS
  - 图论
  - 网络流
  - 费用流
  - Edmonds-Karp
  - 网络流 24 题
permalink: cogs-739
id: 57
updated: '2016-02-23 20:35:48'
date: 2016-02-20 21:37:35
---

W 公司有 `m` 个仓库和 `n` 个零售商店。第 `i` 个仓库有 $ a_i $ 个货物，第 `j` 个商店需要 $ b_j $ 个货物，从第 `i` 个仓库运输到第 `j` 个零售商店的费用为 $ c_{ij} $，要将所有货物运到商店，最小费用是多少？

<!-- more -->

### 链接
[COGS 739](http://cogs.top/cogs/problem/problem.php?pid=739)

### 题解
裸费用流。

从源点向每个仓库连接一条边，容量为仓库的货物数量；从每个商店向汇点连一条边，容量为商店需要的货物数量；在每一对仓库和商店之间连接一条边，容量为无穷大，费用为运输费用。分别求出最大、最小费用最大流就是答案。

### 代码
```cpp
#include <cstdio>
#include <climits>
#include <algorithm>
#include <queue>

const int MAXN = 100;
const int MAXM = 100;

struct Node;
struct Edge;

struct Node {
	Edge *firstEdge, *inEdge;
	int dist, flow;
	bool inQueue;
} nodes[MAXM + MAXN + 2];

struct Edge {
	Node *from, *to;
	int capacity, flow, cost;
	Edge *next, *reversedEdge;

	Edge(Node *from, Node *to, int capacity, int cost) : from(from), to(to), capacity(capacity), flow(0), cost(cost), next(from->firstEdge) {}
};

int n, m, a[MAXM], b[MAXN], cost[MAXM][MAXN];

struct EdmondsKarp {
	bool bellmanford(Node *s, Node *t, int n, int &flow, int &cost) {
		for (int i = 0; i < n; i++) {
			nodes[i].flow = 0;
			nodes[i].inEdge = NULL;
			nodes[i].dist = INT_MAX;
			nodes[i].inQueue = false;
		}

		std::queue<Node *> q;
		q.push(s);

		s->dist = 0;
		s->flow = INT_MAX;

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
						e->to->inQueue = true;
						q.push(e->to);
					}
				}
			}
		}

		if (t->dist == INT_MAX) return false;

		for (Edge *e = t->inEdge; e; e = e->from->inEdge) {
			e->flow += t->flow;
			e->reversedEdge->flow -= t->flow;
		}

		flow += t->flow;
		cost += t->dist * t->flow;

		return true;
	}

	void operator()(int s, int t, int n, int &flow, int &cost) {
		flow = cost = 0;
		while (bellmanford(&nodes[s], &nodes[t], n, flow, cost));
	}
} edmondskarp;

inline void addEdge(int from, int to, int capacity, int cost) {
	nodes[from].firstEdge = new Edge(&nodes[from], &nodes[to], capacity, cost);
	nodes[to].firstEdge = new Edge(&nodes[to], &nodes[from], 0, -cost);

	nodes[from].firstEdge->reversedEdge = nodes[to].firstEdge, nodes[to].firstEdge->reversedEdge = nodes[from].firstEdge;
}

inline int solve(int d) {
	for (int i = 0; i < m + n + 2; i++) {
		Edge *next;
		for (Edge *&e = nodes[i].firstEdge; e; next = e->next, delete e, e = next);
	}

	const int s = 0, t = m + n + 1;
	
	for (int i = 1; i <= m; i++) addEdge(s, i, a[i - 1], 0);
	for (int j = 1; j <= n; j++) addEdge(m + j, t, b[j - 1], 0);

	for (int i = 1; i <= m; i++) {
		for (int j = 1; j <= n; j++) {
			addEdge(i, m + j, INT_MAX, cost[i - 1][j - 1] * d);
		}
	}

	int flow, cost;
	edmondskarp(s, t, m + n + 2, flow, cost);
	
	return cost * d;
}

int main() {
	freopen("tran.in", "r", stdin);
	freopen("tran.out", "w", stdout);

	scanf("%d %d", &m, &n);

	for (int i = 0; i < m; i++) scanf("%d", &a[i]);
	for (int j = 0; j < n; j++) scanf("%d", &b[j]);

	for (int i = 0; i < m; i++) {
		for (int j = 0; j < n; j++) {
			scanf("%d", &cost[i][j]);
		}
	}

	printf("%d\n", solve(1));
	printf("%d\n", solve(-1));

	fclose(stdin);
	fclose(stdout);

	return 0;
}
```