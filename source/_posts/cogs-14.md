title: 「COGS 14」搭配飞行员 - 二分图匹配
categories: OI
tags: 
  - COGS
  - 图论
  - 网络流
  - Dinic
  - 二分图匹配
  - 网络流24题
permalink: cogs-14
id: 44
updated: '2016-02-06 22:22:28'
date: 2016-02-06 22:21:18
---

从一个二分图中选出尽量多的边，使得任意两条边没有公共点。

<!-- more -->

### 题目链接
[COGS 14](http://cogs.top/cogs/problem/problem.php?pid=14)

### 解题思路
二分图匹配，可以用匈牙利~~也可以用带花树~~，然而我不会写。

所以要把二分图最大匹配转化成最大流 …… 

设二分图左右两列分别为 `X` 和 `Y`，建立超级源点 `S`，从 `S` 向 `X` 中的每个点连一条边，容量为 `1`，建立超级汇点 `T`，从 `Y` 中的每个点向 `T` 连一条边，容量为 `1`。最后对于原图的每一条边 `(u, v)`（假设 `u` 在左侧 `v` 在右侧），连接一条由 `u` 指向 `v` 的**有向**边，容量为 `1`。然后跑一遍最大流就是最大匹配啦！

### AC代码
```c++
#include <cstdio>
#include <climits>
#include <algorithm>
#include <queue>

const int MAXN = 100;

struct Node;
struct Edge;

struct Node {
	Edge *firstEdge;
	int level;
} nodes[MAXN + 2];

struct Edge {
	Node *from, *to;
	int capacity, flow;
	Edge *next, *reversedEdge;

	Edge(Node *from, Node *to, int capacity) : from(from), to(to), capacity(capacity), flow(0), next(from->firstEdge) {}
};

int n, n1;

inline void addEdge(int from, int to, int capacity) {
	nodes[from].firstEdge = new Edge(&nodes[from], &nodes[to], capacity);
	nodes[to].firstEdge = new Edge(&nodes[to], &nodes[from], 0);

	nodes[from].firstEdge->reversedEdge = nodes[to].firstEdge, nodes[to].firstEdge->reversedEdge = nodes[from].firstEdge;
}

struct Dinic {
	bool makeLevelGraph(Node *s, Node *t) {
		for (int i = 0; i < n + 1; i++) nodes[i].level = 0;

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
			if (e->to->level == s->level + 1 && e->capacity > e->flow) {
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

	int operator()(int s, int t) {
		int ans = 0;
		while (makeLevelGraph(&nodes[s], &nodes[t])) {
			int flow;
			while ((flow = findPath(&nodes[s], &nodes[t])) > 0) ans += flow;
		}

		return ans;
	}
} dinic;

int main() {
	freopen("flyer.in", "r", stdin);
	freopen("flyer.out", "w", stdout);

	scanf("%d %d", &n, &n1);

	const int s = 0, t = n + 1;

	for (int i = 1; i <= n1; i++) addEdge(s, i, 1);
	for (int i = n1 + 1; i <= n; i++) addEdge(i, t, 1);

	while (!feof(stdin)) {
		int u, v;
		scanf("%d %d", &u, &v);
		if (u > v) std::swap(u, v);

		addEdge(u, v, 1);
	}

	printf("%d\n", dinic(s, t));

	fclose(stdin);
	fclose(stdout);

	return 0;
}
```
