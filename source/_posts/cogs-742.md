title: 「COGS 742」深海机器人 - 费用流
categories: OI
tags: 
  - COGS
  - Edmonds-Karp
  - 网络流24题
  - 图论
  - 网络流
  - 费用流
permalink: cogs-742
id: 58
updated: '2016-02-23 21:44:58'
date: 2016-02-23 21:44:06
---

有多个深海机器人到达深海海底后离开潜艇向预定目标移动。深海机器人在移动中还必须沿途采集海底生物标本。沿途生物标本由最先遇到它的深海机器人完成采集。每条预定路径上的生物标本的价值是已知的，而且生物标本只能被采集一次。深海机器人只能从其出发位置沿着向北或向东的方向移动，而且多个深海机器人可以在同一时间占据同一位置。

<!-- more -->

### 题目链接
[COGS 742](http://cogs.top/cogs/problem/problem.php?pid=742)

### 解题思路
最大费用最大流建模，从源点向每个起点连一条边，流量为出发的机器人数量，费用为零；从每个终点向汇点连一条边，流量为到达的机器人数量，费用为零；把每个格点看做点，从每个格点向其东边、北边各连**两条**边，第一条容量为 1，费用为生物标本价值的相反数（保证第一个通过的机器人取走标本），另一条容量为正无穷，费用为 0（保证多个机器人可占据同一位置，并且路径可重叠）。

计算坐标是个大坑。

### AC代码
```cpp
#include <cstdio>
#include <climits>
#include <cassert>
#include <algorithm>
#include <queue>

const int MAXP = 15;
const int MAXQ = 15;
const int MAXA = 10;
const int MAXB = 10;

struct Node;
struct Edge;

struct Node {
	Edge *firstEdge, *inEdge;
	int flow, dist;
	bool inQueue;
} nodes[(MAXP + 1) * (MAXQ + 1) + 2];

struct Edge {
	Node *from, *to;
	int capacity, flow, cost;
	Edge *next, *reversedEdge;

	Edge(Node *from, Node *to, int capacity, int cost) : from(from), to(to), capacity(capacity), flow(0), cost(cost), next(from->firstEdge) {}
};

int a, b, p, q;

struct EdmondsKarp {
	bool bellmanford(Node *s, Node *t, int n, int &flow, int &cost) {
		for (int i = 0; i < n; i++) {
			nodes[i].dist = INT_MAX;
			nodes[i].inQueue = false;
			nodes[i].flow = 0;
			nodes[i].inEdge = NULL;
		}

		std::queue<Node *> q;
		q.push(s);
		
		s->flow = INT_MAX;
		s->dist = 0;

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

		if (t->dist == INT_MAX) return false;

		for (Edge *e = t->inEdge; e; e = e->from->inEdge) {
			//printf("%d -> %d = %d\n", (int)(e->from - nodes), (int)(e->to - nodes), t->flow);
			e->flow += t->flow;
			e->reversedEdge->flow -= t->flow;
		}

		flow += t->flow;
		cost += t->dist * t->flow;
		//printf("flow += %d, cost += %d\n", t->flow, t->dist * t->flow);

		return true;
	}

	void operator()(int s, int t, int n, int &flow, int &cost) {
		flow = cost = 0;
		while (bellmanford(&nodes[s], &nodes[t], n, flow, cost));
	}
} edmondskarp;

inline void addEdge(int from, int to, int capacity, int cost) {
	assert(from < (p + 1) * (q + 1) + 2);
	assert(to < (p + 1) * (q + 1) + 2);

	nodes[from].firstEdge = new Edge(&nodes[from], &nodes[to], capacity, cost);
	nodes[to].firstEdge = new Edge(&nodes[to], &nodes[from], 0, -cost);

	nodes[from].firstEdge->reversedEdge = nodes[to].firstEdge, nodes[to].firstEdge->reversedEdge = nodes[from].firstEdge;
}

inline int getNodeID(int x, int y) {
	return x * (q + 1) + y + 1;
}

int main() {
	freopen("shinkai.in", "r", stdin);
	freopen("shinkai.out", "w", stdout);

	scanf("%d %d\n%d %d", &a, &b, &p, &q);

	const int s = 0, t = (p + 1) * (q + 1) + 1;

	for (int i = 0; i < p + 1; i++) {
		for (int j = 0; j < q; j++) {
			int x;
			scanf("%d", &x);

			//printf("(%d, %d) -> (%d, %d) = %d\n", i, j, i, j + 1, x);
			addEdge(getNodeID(i, j), getNodeID(i, j + 1), 1, -x);
			addEdge(getNodeID(i, j), getNodeID(i, j + 1), INT_MAX, 0);
		}
	}

	for (int j = 0; j < q + 1; j++) {
		for (int i = 0; i < p; i++) {
			int x;
			scanf("%d", &x);

			//printf("(%d, %d) -> (%d, %d) = %d\n", i, j, i + 1, j, x);
			addEdge(getNodeID(i, j), getNodeID(i + 1, j), 1, -x);
			addEdge(getNodeID(i, j), getNodeID(i + 1, j), INT_MAX, 0);
		}
	}

	for (int i = 0; i < a; i++) {
		int k, x, y;
		scanf("%d %d %d", &k, &x, &y);

		addEdge(s, getNodeID(x, y), k, 0);
	}

	for (int i = 0; i < b; i++) {
		int k, x, y;
		scanf("%d %d %d", &k, &x, &y);

		addEdge(getNodeID(x, y), t, k, 0);
	}

	int flow, cost;
	edmondskarp(s, t, (p + 1) * (q + 1) + 2, flow, cost);

	printf("%d\n", -cost);

	fclose(stdin);
	fclose(stdout);

	return 0;
}
```