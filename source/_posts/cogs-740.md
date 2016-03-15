title: 「COGS 740」分配问题 - 二分图最大权匹配
categories: OI
tags: 
  - COGS
  - 图论
  - 网络流
  - 网络流24题
  - Edmonds-Karp
  - 费用流
  - 二分图匹配
permalink: cogs-740
id: 60
updated: '2016-02-25 08:10:00'
date: 2016-02-25 08:08:29
---

有 `n` 件工作要分配给 `n` 个人做。第 `i` 个人做第 `j` 件工作产生的效益为 `c[i][j]`。试设计一个将 `n` 件工作分配给 `n` 个人做的分配方案，使产生的总效益最大。

<!-- more -->

### 题目链接
[COGS 740](http://cogs.top/cogs/problem/problem.php?pid=740)

### 解题思路
把工作和人放在网络流模型中，可以发现这是一张二分图，问题转化为从图中选取一些边，使这些边没有交点（没有人做重复的工作，没有工作被重复做），并且边权总和最大。即**二分图最大权匹配**。

建立源点与汇点，从源点向每个人连一条边，容量为 1（每个人只能匹配一次），费用为 0；从每个工作到汇点连一条边，容量为 1（每个工作只能匹配一次），费用为 0；从每个人向每个工作连一条边，容量为 0，费用为效益的相反数。求出网络的最小费用最大流，所得费用的相反数即为最大权匹配。

### AC代码
```cpp
#include <cstdio>
#include <climits>
#include <algorithm>
#include <queue>

const int MAXN = 100;

struct Node;
struct Edge;

struct Node {
	Edge *firstEdge, *inEdge;
	int dist, flow;
	bool inQueue;
} nodes[MAXN + MAXN + 2];

struct Edge {
	Node *from, *to;
	int capacity, flow, cost;
	Edge *next, *reversedEdge;

	Edge(Node *from, Node *to, int capacity, int cost) : from(from), to(to), next(from->firstEdge), capacity(capacity), flow(0), cost(cost) {}
};

int n, a[MAXN][MAXN];

struct EdmondsKarp {
	bool bellmanford(Node *s, Node *t, int n, int &flow, int &cost) {
		for (int i = 0; i < n; i++) {
			nodes[i].dist = INT_MAX;
			nodes[i].inEdge = NULL;
			nodes[i].flow = 0;
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
	for (int i = 0; i < n + n + 2; i++) {
		Edge *next;
		for (Edge *&e = nodes[i].firstEdge; e; next = e->next, delete e, e = next);
	}

	const int s = 0, t = n + n + 1;

	for (int i = 1; i <= n; i++) {
		addEdge(s, i, 1, 0);
		addEdge(n + i, t, 1, 0);
	}

	for (int i = 1; i <= n; i++) {
		for (int j = 1; j <= n; j++) {
			addEdge(i, n + j, 1, a[i - 1][j - 1] * d);
		}
	}

	int flow, cost;
	edmondskarp(s, t, n + n + 2, flow, cost);
	return cost * d;
}

int main() {
	freopen("job.in", "r", stdin);
	freopen("job.out", "w", stdout);

	scanf("%d", &n);

	for (int i = 0; i < n; i++) {
		for (int j = 0; j < n; j++) {
			scanf("%d", &a[i][j]);
		}
	}

	printf("%d\n", solve(1));
	printf("%d\n", solve(-1));

	fclose(stdin);
	fclose(stdout);

	return 0;
}


```