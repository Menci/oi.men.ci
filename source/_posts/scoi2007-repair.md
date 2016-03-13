title: 「SCOI2007」修车 - 费用流
categories: OI
tags: 
  - BZOJ
  - CodeVS
  - SCOI
  - 图论
  - 网络流
  - 费用流
  - Edmonds-Karp
permalink: scoi2007-repair
date: 2016-03-09 09:52:35
---

同一时刻有 $ N $ 位车主带着他们的爱车来到了汽车维修中心。维修中心共有 $ M $ 位技术人员，不同的技术人员对不同的车进行维修所用的时间是不同的。现在需要安排这 $ M $ 位技术人员所维修的车及顺序，使得顾客平均等待的时间最小。

顾客的等待时间是指从他把车送至维修中心到维修完毕所用的时间。

<!-- more -->

### 题目链接
[BZOJ 1070](http://www.lydsy.com/JudgeOnline/problem.php?id=1070)  
[CodeVS 2436](http://codevs.cn/problem/2436/)

### 解题思路
为每辆车建立点，为每个技术人员的**每一次修车**建立点。

设第 $ i $ 个技术人员修第 $ j $ 辆车所用时间为 $ t_{i, j} $，第 $ i $ 辆车的点为 $ v_i $，第 $ i $ 个技术人员倒数第 $ k $ 次修车（此时有 $ k $ 个人在等待）的点为 $ v_{j, k} $（$ k {\in} [1, n] $）。

从源点向每辆车连边，容量为 1，费用为 0；从每个 $ v_i $ 向每个 $ v_{j, k} $ 连边，容量为 1，费用为 $ t_{i, j} * k $；从每个 $ v_{j, k} $ 向汇点连边，容量为 1，费用为 0。

### AC代码
<!-- c++ -->
```
#include <cstdio>
#include <climits>
#include <algorithm>
#include <queue>

const int MAXN = 60;
const int MAXM = 9;
const int MAXT = 1000;

struct Node;
struct Edge;

struct Node {
	Edge *firstEdge, *inEdge;
	int flow, dist;
	bool inQueue;
} nodes[MAXN + MAXM * MAXN + 2];

struct Edge {
	Node *from, *to;
	int flow, capacity, cost;
	Edge *next, *reversedEdge;

	Edge(Node *from, Node *to, int capacity, int cost) : from(from), to(to), flow(0), capacity(capacity), cost(cost), next(from->firstEdge) {}
};

struct Dinic {
	bool bellmanford(Node *s, Node *t, int n, int &flow, int &cost) {
		for (int i = 0; i < n; i++) {
			nodes[i].inEdge = NULL;
			nodes[i].flow = 0;
			nodes[i].dist = INT_MAX;
			nodes[i].inQueue = false;
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
		cost += t->flow * t->dist;

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

int n, m, time[MAXM][MAXN];

inline int hash(int j, int k) {
	return n + (j - 1) * n + k;
}

int main() {
	scanf("%d %d", &m, &n);

	for (int i = 0; i < n; i++) {
		for (int j = 0; j < m; j++) {
			scanf("%d", &time[j][i]);
		}
	}

	const int s = 0, t = n + n * m + 1;
	//printf("s = %d, t = %d\n", s, t);

	for (int i = 1; i <= n; i++) {
		addEdge(s, i, 1, 0);
	}

	for (int j = 1; j <= m; j++) {
		for (int k = 1; k <= n; k++) {
			addEdge(hash(j, k), t, 1, 0);
			for (int i = 1; i <= n; i++) {
				//printf("%d -> %d\n", i, hash(j, k));
				addEdge(i, hash(j, k), 1, time[j - 1][i - 1] * k);
			}
		}
	}

	int flow, cost;
	edmondskarp(s, t, n + n * m + 2, flow, cost);

	printf("%.2lf\n", (double)cost / (double)n);

	return 0;
}
```

### 吐槽
又一次把 $ n $、$ m $ 读入倒了 ……

又一次敲错 EK 模板 ……

hehe
