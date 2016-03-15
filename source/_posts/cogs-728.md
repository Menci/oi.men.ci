title: 「COGS 728」最小路径覆盖问题 - 二分图匹配
categories: OI
tags: 
  - COGS
  - 图论
  - 网络流
  - Dinic
  - 二分图匹配
  - 网络流24题
permalink: cogs-728
id: 45
updated: '2016-02-06 22:53:58'
date: 2016-02-06 22:52:12
---

给定有向图 $G=(V,E)$ 。设 P 是 G 的一个简单路（顶点不相交）的集合。如果 V 中每个顶点恰好在 P 的一条路上，则称 P 是 G 的一个路径覆盖。P 中路径可以从 V 的任何一个顶点开始，长度也是任意的，特别地，可以为 0。G 的最小路径覆盖是 G 的所含路径条数最少的路径覆盖。

设计一个有效算法求一个有向无环图 G 的最小路径覆盖。

<!-- more -->

### 题目链接
[COGS 728](http://cogs.top/cogs/problem/problem.php?pid=728)

### 解题思路
用最少的路径覆盖所有的点。先从最简单的图开始，如果图中没有边，那么每个点都是一条独立的路径；如果添加一条边进去，那么需要的路径数量就减小 1；如果再添加一条边进去，并且这条边与上一条边有相同起点或终点的话，那么这条边对答案是没有贡献的，如果这条边与上一条边首尾相接或者不相交的话，那么需要的路径数量减小 1。

综上所述，问题转化为，从一个有向无环图中选出尽量多的边，使任意两条边没有相同起点或终点。

进一步将问题转化为二分图匹配，将每个点拆成左右两个，对于原图中任意一条有向边 `(u, v)`，在新图中将左边的 `u` 和右边的 `v` 连接，然后求出最大匹配，用总点数减去最大匹配就是答案。

输出方案嘛，只要枚举起点然后沿着匹配边向下搜就好咯 ……

### AC代码
```cpp
#include <cstdio>
#include <climits>
#include <algorithm>
#include <queue>

const int MAXN = 150;

struct Node;
struct Edge;

struct Node {
	Edge *firstEdge;
	int id, level;
	bool visited;
} nodes[MAXN * 2 + 2];

struct Edge {
	Node *from, *to;
	int capacity, flow;
	Edge *next, *reversedEdge;

	Edge(Node *from, Node *to, int capacity) : from(from), to(to), capacity(capacity), flow(0), next(from->firstEdge) {}
};

int n, m;

inline void addEdge(int from, int to, int capacity) {
	nodes[from].firstEdge = new Edge(&nodes[from], &nodes[to], capacity);
	nodes[to].firstEdge = new Edge(&nodes[to], &nodes[from], 0);

	nodes[from].firstEdge->reversedEdge = nodes[to].firstEdge, nodes[to].firstEdge->reversedEdge = nodes[from].firstEdge;
}

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

	int operator()(int s, int t, int n) {
		int ans = 0;
		while (makeLevelGraph(&nodes[s], &nodes[t], n)) {
			int flow;
			while ((flow = findPath(&nodes[s], &nodes[t])) > 0) ans += flow;
		}

		return ans;
	}
} dinic;

inline void printPath(Node *v) {
	printf("%d ", v->id);

	v->visited = true;
	for (Edge *e = v->firstEdge; e; e = e->next) {
		if (e->flow == e->capacity && e->to->id != 0 && !nodes[e->to->id].visited) {
			printPath(&nodes[e->to->id]);
			break;
		}
	}
}

int main() {
	freopen("path3.in", "r", stdin);
	freopen("path3.out", "w", stdout);

	scanf("%d %d", &n, &m);

	const int s = 0, t = n * 2 + 1;

	for (int i = 1; i <= n; i++) addEdge(s, i, 1), addEdge(i + n, t, 1), nodes[i].id = nodes[i + n].id = i;

	for (int i = 0; i < m; i++) {
		int u, v;
		scanf("%d %d", &u, &v);

		addEdge(u, v + n, 1);
	}

	int maxMatch = dinic(s, t, n * 2 + 2);

	for (int i = 1; i <= n; i++) {
		if (!nodes[i].visited) {
			printPath(&nodes[i]);
			putchar('\n');
		}
	}

	printf("%d\n", n - maxMatch);

	fclose(stdin);
	fclose(stdout);

	return 0;
}
```
