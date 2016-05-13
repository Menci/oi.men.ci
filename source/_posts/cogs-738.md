title: 「COGS 738」数字梯形 - 费用流
categories: OI
tags: 
  - COGS
  - 图论
  - 网络流
  - 费用流
  - Edmonds-Karp
  - 网络流 24 题
permalink: cogs-738
id: 52
updated: '2016-02-19 11:35:21'
date: 2016-02-19 11:33:27
---

一个数字梯形，共有 `n` 行，第一行有 `m` 个数字，每一行都比上一行多一个数字。从第一行的每一个数字开始，每一次向左下方或左上方走，直到最后一行，有以下三种规则：

1. 任意两条路径没有公共部分；
2. 任意两条路径只能在点（数字）上有公共部分，不能在边（数字与数字之间）上有公共部分；
3. 任意两条路径可以在点上或边上有公共部分。

求分别在这三种规则下的路径所经过数字总和的最大值。

<!-- more -->

### 链接
[COGS 738](http://cogs.top/cogs/problem/problem.php?pid=738)

### 题解
因为是从第一行走到最后一行，对于路径有限制，并且最大化总和，所以考虑费用流建模。

将每个数字拆成两个点，中间一条边容量为 1，费用为该数字的相反数；从源点到第一行每个数字的入点连一条边，容量为 1，费用为 0；从最后一行每个数字的出点向汇点连一条边，容量为 1，费用为 1；对于除最后一行外的每个数字，从其出点向其下方两个数字的入点分别连一条边，容量为 1，费用为 0。求出网络的最小费用最大流，则结果费用的相反数即为第一问答案。

有了第一问的基础，后面两问就比较容易了，第二问因为可以在数字上重复，就把每个数字的入点和出点之间的边容量改为正无穷，把指向汇点的边容量也改为正无穷；第三问因为可以在边上重复，就在第二问的基础上把每个数字的出点向下方连接的两条边容量改为正无穷。

一定要注意，计算网络流节点编号要用**梯形面积公式**，设源点 `s` 的编号为 0，则对数字进行拆点后所得的点数量为 $ \frac{(m + (m + n - 1)) * n} {2} * 2 $，即汇点的编号为 $ \frac{(m + (m + n - 1)) * n} {2} * 2 + 1 $。

### 代码
```cpp
#include <cstdio>
#include <climits>
#include <cassert>
#include <algorithm>
#include <queue>

const int MAXM = 20;
const int MAXN = 20;
const int L = 0, R = 1, IN = 0, OUT = 1;

struct Point {
	int x, y;

	Point() {}
	Point(int x, int y) : x(x), y(y) {}
};

struct Node;
struct Edge;

struct Node {
	Edge *firstEdge, *inEdge;
	int flow, dist;
	bool inQueue;
} nodes[((MAXM + (MAXM + MAXN - 1)) * MAXN / 2) * 2 + 2];

struct Edge {
	Node *from, *to;
	int capacity, flow, cost;
	Edge *next, *reversedEdge;

	Edge(Node *from, Node *to, int capacity, int cost) : from(from), to(to), capacity(capacity), cost(cost), flow(0), next(from->firstEdge) {}
};

int n, m, a[MAXN][MAXM + MAXN - 1], s, t;
int mapNode[MAXN][MAXM + MAXN - 1][2], mapEdge[MAXN][MAXM + MAXN - 1][2];

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
					//printf("dist((%d, %d), (%d, %d)) = %d\n", e->to->pt1.x, e->to->pt1.y, e->to->pt2.x, e->to->pt2.y, e->to->dist);
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
		//printf("flow += %d\n", t->flow);
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

inline void releaseMemory() {
	for (int i = 0; i < ((m + (m + n - 1)) * n / 2) * 2 + 2; i++) {
		Edge *next;
		for (Edge *e = nodes[i].firstEdge; e; next = e->next, delete e, e = next);
		nodes[i].firstEdge = NULL;
	}
}

inline void buildNetwork(int limitPerNode, int limitPerEdge) {
	releaseMemory();
	for (int i = 0; i < m; i++) addEdge(s, mapNode[0][i][IN], 1, 0);
	for (int i = 0; i < n; i++) {
		for (int j = 0; j < m + i; j++) {
			//printf("i(%d) -> %d, j(%d) -> %d\n", i + 1, n, j + 1, m + i);
			int (&v)[2] = mapNode[i][j];
			int (&e)[2] = mapEdge[i][j];
			//printf("a[i][j] = %d\n", a[i][j]);
			addEdge(v[IN], v[OUT], limitPerNode, -a[i][j]);

			if (i == n - 1) {
				//printf("OUT(%d, %d) = %d to t\n", i + 1, j + 1, a[i][j]);
				addEdge(v[OUT], t, limitPerNode, 0);
			} else {
				//printf("OUT(%d, %d) = %d to IN(%d, %d) = %d\n", i + 1, j + 1, a[i][j], i + 1 + 1, j + 1, a[i + 1][j]);
				addEdge(v[OUT], e[L], limitPerEdge, 0);
				//printf("OUT(%d, %d) = %d to IN(%d, %d) = %d\n", i + 1, j + 1, a[i][j], i + 1 + 1, j + 1 + 1, a[i + 1][j + 1]);
				addEdge(v[OUT], e[R], limitPerEdge, 0);
			}
		}
	}
}

inline int solve() {
	int flow, cost;
	edmondskarp(s, t, ((m + (m + n - 1)) * n / 2) * 2 + 2, flow, cost);
	return -cost;
}

inline int task1() {
	buildNetwork(1, 1);
	return solve();
}

inline int task2() {
	buildNetwork(INT_MAX, 1);
	return solve();
}

inline int task3() {
	buildNetwork(INT_MAX, INT_MAX);
	return solve();
}

int main() {
	freopen("digit.in", "r", stdin);
	freopen("digit.out", "w", stdout);

	scanf("%d %d", &m, &n);
	
	s = 0, t = ((m + (m + n - 1)) * n / 2) * 2 + 1;
	//printf("t = %d\n", t);
	
	int k = 1;
	for (int i = 0; i < n; i++) {
		for (int j = 0; j < m + i; j++) {
			scanf("%d", &a[i][j]);

			mapNode[i][j][IN] = k++;
			mapNode[i][j][OUT] = k++;
			assert(k - 1 < ((m + (m + n - 1)) * n / 2) * 2 + 1);
		}
	}

	for (int i = 0; i < n - 1; i++) {
		for (int j = 0; j < m + i; j++) {
			mapEdge[i][j][L] = mapNode[i + 1][j][IN];
			mapEdge[i][j][R] = mapNode[i + 1][j + 1][IN];
		}
	}

	printf("%d\n", task1());
	printf("%d\n", task2());
	printf("%d\n", task3());

	fclose(stdin);
	fclose(stdout);

	return 0;
}
```