title: 「COGS 741」负载平衡 - 费用流
categories: OI
tags: 
  - COGS
  - 图论
  - 网络流
  - 网络流24题
  - Edmonds-Karp
  - 费用流
permalink: cogs-741
id: 61
updated: '2016-02-25 15:38:10'
date: 2016-02-25 15:37:15
---

G 公司有 `n` 个沿铁路运输线环形排列的仓库，每个仓库存储的货物数量不等。如何用最少搬运量可以使 `n` 个仓库的库存数量相同。搬运货物时，只能在相邻的仓库之间搬运。

<!-- more -->

### 链接
[COGS 741](http://cogs.top/cogs/problem/problem.php?pid=741)

### 题解
这道题猛地看上去有点像之前写过的一道贪心 —— 均分纸牌，那道题只要把每一个数减去平均数，然后从左到右累加，特判一下零就好。但这题难点在于是环形的。

首先，还是要将每个仓库中的库存数量减去平均数，目标便转化为把正数全部加到负数中。『只能在相邻的仓库之间搬运』这一条件，让人很容易想到在相邻仓库之间连边，但稍微思考一下就会发现这样是不行的，因为有时候需要将货物重复移动多次才能到达目的仓库。

不妨只考虑最终的结果 —— 正数最后都要被移动到负数里面。在相邻的仓库之间转移，单位代价是 1，则隔着多个位置的仓库之间转移的代价就是**两间仓库的最短距离**，环中两点的最短路只有两种情况，顺时针走或者逆时针走，预处理出来就好。

从源点向每个库存量为正数的点连一条边，容量为库存量，费用为 0；从每个库存量为负数的点向汇点连一条边，容量为库存量的相反数，费用为 0；从每个库存量为正数的点向每个库存量为负数的点连一条边，容量为正无穷，费用为**两间仓库的最短距离**，求出最小费用最大流，则费用即为答案。

### 代码
```cpp
#include <cstdio>
#include <cstdlib>
#include <climits>
#include <algorithm>
#include <queue>

const int MAXN = 100;

struct Node;
struct Edge;

struct Node {
	Edge *firstEdge, *inEdge;
	int flow, dist;
	bool inQueue;
} nodes[MAXN + 2];

struct Edge {
	Node *from, *to;
	int flow, capacity, cost;
	Edge *next, *reversedEdge;

	Edge(Node *from, Node *to, int capacity, int cost) : from(from), to(to), capacity(capacity), flow(0), cost(cost), next(from->firstEdge) {}
};

int n, a[MAXN], dist[MAXN][MAXN];

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

inline void getDistances() {
	for (int i = 0; i < n; i++) {
		for (int j = i + 1; j < n; j++) {
			dist[i][j] = dist[j][i] = std::min(std::abs(j - i), (n - j) + i);
		}
	}
}

int main() {
	freopen("overload.in", "r", stdin);
	freopen("overload.out", "w", stdout);

	scanf("%d", &n);

	int sum = 0;
	for (int i = 0; i < n; i++) {
		scanf("%d", &a[i]);
		sum += a[i];
	}

	int average = sum / n;
	for (int i = 0; i < n; i++) a[i] -= average;

	getDistances();

	const int s = 0, t = n + 1;

	for (int i = 1; i <= n; i++) {
		if (a[i - 1] > 0) addEdge(s, i, a[i - 1], 0);
		else if (a[i - 1] < 0) addEdge(i, t, -a[i - 1], 0);
	}

	for (int i = 1; i <= n; i++) {
		if (a[i - 1] > 0) {
			for (int j = 1; j <= n; j++) {
				if (a[j - 1] < 0) addEdge(i, j, INT_MAX, dist[i - 1][j - 1]);
			}
		}
	}

	int flow, cost;
	edmondskarp(s, t, n + 2, flow, cost);

	printf("%d\n", cost);

	fclose(stdin);
	fclose(stdout);

	return 0;
}
```