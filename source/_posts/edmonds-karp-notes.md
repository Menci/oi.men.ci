title: Edmonds-Karp 费用流学习笔记
categories: OI
tags: 
  - 图论
  - 网络流
  - 费用流
  - Edmonds-Karp
  - 学习笔记
permalink: edmonds-karp-notes
id: 55
updated: '2016-02-19 17:24:00'
date: 2016-02-19 17:04:38
---

有一类网络流问题，最大流并不唯一，而每一条边都有一个单位流量的费用，最优解的目标是保证流量最大的前提下使总费用最小。单纯的最大流可以使用 Edmonds-Karp 算法求解，但这个算法不够优，最常用的是 Dinic 算法。但 Edmonds-Karp 确是最小费用流问题最常用的算法。

<!-- more -->

### 定义
费用（`cost`）：单位流量流过一条边需要支付的费用，算法的目标是使总流量最大的前提下总费用最小。

其他的定义和 Dinic 中基本相同，但 Edmonds-Karp 中没有『层次』和『层次图』的概念。

Edmonds-Karp 的反向边的费用是原边的费用相反数。

### 算法
1. 在残量网络中以『费用』为距离，沿着未满流边找出一条从源点到汇点的最短路，并进行增广。
2. 增广时将总费用加上**汇点的距离** × **增广流量**。
3. 无法找到增广路时算法结束，此时已找出网络的最小费用最大流。

找最短路时，一般使用 Bellman-Ford 算法，因为网络中一般都会存在负权边，而不可能有负环——当有负环时，最小费用最大流不存在。

Edmonds-Karp 基于一个事实：如果当前费用是在当前流量下的最小费用，那么以最小费用增广之后的费用也为增广后的流量下的最小费用。不断增广找到的就是最小费用最大流。

### 代码实现
```c++
struct Node {
	Edge *firstEdge, *inEdge;
	int flow, dist;
	bool inQueue;
} nodes[MAXN];

struct Edge {
	Node *from, *to;
	int capacity, flow, cost;
	Edge *next, *reversedEdge;

	Edge(Node *from, Node *to, int capacity, int cost) : from(from), to(to), capacity(capacity), cost(cost), flow(0), next(from->firstEdge) {}
};

struct EdmondsKarp {
	bool bellmanford(Node *s, Node *t, int n, int &flow, int &cost) {
		for (int i = 0; i < n; i++) {
			nodes[i].dist = INT_MAX;
			nodes[i].inEdge = NULL;
			nodes[i].flow = 0;
			nodes[i].inQueue = false;
		}

		s->flow = INT_MAX;
		s->dist = 0;

		std::queue<Node *> q;
		q.push(s);
		
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

		for (Node *v = t; v != s; v = v->inEdge->from) {
			v->inEdge->flow += t->flow;
			v->inEdge->reversedEdge->flow -= t->flow;
		}

		cost += t->dist * t->flow;
		flow += t->flow;
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
```
