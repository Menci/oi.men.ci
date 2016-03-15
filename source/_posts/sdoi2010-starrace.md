title: 「SDOI2010」星际竞速 - 费用流 
date: 2016-02-29 21:30:11
categories: OI
tags:
  - BZOJ
  - SDOI
  - Edmonds-Karp
  - 图论
  - 网络流
  - 费用流
permalink: sdoi2010-starrace
---

大赛要求车手们从一颗与这 $ N $ 颗行星之间没有任何航路的天体出发，访问这 $ N $ 颗行星每颗恰好一次。超能电驴有两种移动模式：高速航行模式和能力爆发模式。在高速航行模式下，超能电驴会沿星际航路高速航行。在能力爆发模式下，经过一段时间的定位之后，它能瞬间移动到任意一个行星。在使用高速航行模式的时候，只能由每个星球飞往引力比它大的星球，否则赛车就会发生爆炸。求完成比赛的最少时间。

<!-- more -->

### 题目链接
[BZOJ 1927](http://www.lydsy.com/JudgeOnline/problem.php?id=1927)  
[CodeVS 2313](http://codevs.cn/problem/2313/)

### 解题思路
求完成比赛的最少时间，很容易想到最短路，然而不确定起点终点而且恰好访问一次都不太适合最短路 …… 考虑网络流建模吧。

刚开始想到的一个**错误**的解法：

1. 把每个点拆成两个点，一个表示入另一个表示出，之间连一条容量为 1，费用为零的边；
2. 从源点到每个入点连一条容量为 1 费用为零的边；
3. 从每个出点到汇点连一条容量为 1 费用为零的边；
4. 对于每个点，从它的出点到所有他所能到达的点的入点连一条容量为 1 费用为航行时间的边；
5. 建立『中转站』，从每个点到中转站连一条容量为 1 费用为 0 的边；从中转站到每个点连一条容量为 1 费用为定位时间的边。

求出最小费用最大流 …… 呃，答案就是零 ……

很容易想出上面的模型是错的，因为它不能保证每个点都被访问过 —— 虽然它比较直观。

再来分析一下题意，每个点都经过一次，有点类似路径覆盖，而路径覆盖中是没有边权的，考虑把边权加在费用上。

一种**类似于路径覆盖**的建模方式：

1. 把每个点拆成两个点，一个表示入另一个表示出；
2. 从源点向每个入点连一条容量为 1 费用为零的边；
3. 从每个出点向汇点连一条容量为 1 费用为零的边；
4. 对于每个点，从它的出点到所有他所能到达的点的入点连一条容量为 1 费用为航行时间的边；
5. 从源点向每个**出点**连一条容量为 1 费用为定位时间的边。

这种建模思想抓住了题目中『每个点经过一次』的条件，避开了路径上的问题 —— 整个网络保证了到汇点边全部满流，也就对应了每个点被经过一次。

处理『瞬间移动』的思路是，不考虑是从哪个星球移动过来，向哪里走 —— 因为从每个点向哪里走是由选择的边决定的（甚至可能瞬移到的点就是终点），只需要考虑，瞬移经过的点不需要再在其他路径上被经过，所以直接从源点连到某个点的出点就好啦。

### AC代码
```cpp
#include <cstdio>
#include <climits>
#include <algorithm>
#include <queue>

const int MAXN = 800;
const int MAXM = 15000;

struct Node;
struct Edge;

struct Node {
	Edge *firstEdge, *inEdge;
	int flow, dist;
	bool inQueue;
} nodes[MAXN * 2 + 2];

struct Edge {
	Node *from, *to;
	int capacity, flow, cost;
	Edge *next, *reversedEdge;

	Edge(Node *from, Node *to, int capacity, int cost) : from(from), to(to), capacity(capacity), flow(0), cost(cost), next(from->firstEdge) {}
};

struct EdmondsKarp {
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
						q.push(e->to);
						e->to->inQueue = true;
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

int n, m;

int main() {
	scanf("%d %d", &n, &m);

	const int s = 0, t = n * 2 + 1;

	for (int i = 1; i <= n; i++) {
		int x;
		scanf("%d", &x);

		addEdge(s, i + n, 1, x);

		addEdge(s, i, 1, 0);
		addEdge(i + n, t, 1, 0);
	}

	for (int i = 0; i < m; i++) {
		int u, v, w;
		scanf("%d %d %d", &u, &v, &w);
		if (u > v) std::swap(u, v);

		addEdge(u, v + n, 1, w);
	}

	int flow, cost;
	edmondskarp(s, t, n * 2 + 2, flow, cost);

	printf("%d\n", cost);

	return 0;
}
```
