title: 「CodeVS 1563」奶牛的交通 - 网络流
categories: OI
tags: 
  - CodeVS
  - 网络流
  - Dinic
  - 图论
permalink: codevs-1563
id: 42
updated: '2016-02-06 22:23:12'
date: 2016-02-05 21:06:41
---

给出一个无向图，问最少割掉多少个点使 `s` 点与 `t` 点不连通。

<!-- more -->

### 链接
[CodeVS 1563](http://codevs.cn/problem/1563/)  
[洛谷 1345](http://www.luogu.org/problem/show?pid=1345)

### 题解
首先，这题一看就是最小割，由最小割最大流定理得，求出最大流就是最小割。

怎么流？

一般的网络流，流量都在边上，求出的割也是割的边 …… 而我们这次需要割点，那就拆点呀！

把每个点拆成 `i` 和 `i'` 两个点，`i` 表示进入这个点，`i'` 表示离开这个点。由 `i` 向 `i'` 连接一条有向边，容量为 1。对于原图中任意一条有向边 `(i, j)`，连接 `(i', j)`，容量为正无穷。

于是就完成了喜闻乐见的建模，求出 `s'` 到 `t` （想一想为什么不是 `s` 到 `t'`？）的最大流就是答案啦！

###代码
```cpp
#include <cstdio>
#include <climits>
#include <algorithm>
#include <queue>

const int MAXN = 100;
const int MAXM = 600;

struct Node;
struct Edge;

struct Node {
	Edge *firstEdge;
	int level;
} nodes[MAXN + MAXN];

struct Edge {
	Node *from, *to;
	int capacity, flow;
	Edge *next, *reversedEdge;

	Edge(Node *from, Node *to, int capacity) : from(from), to(to), capacity(capacity), flow(0), next(from->firstEdge) {}
};

int n, m, s, t;

inline void addEdge(int from, int to, int capacity) {
	//printf("addEdge(%d, %d, %d)\n", from + 1, to + 1, capacity);
	nodes[from].firstEdge = new Edge(&nodes[from], &nodes[to], capacity);
	nodes[to].firstEdge = new Edge(&nodes[to], &nodes[from], 0);

	nodes[from].firstEdge->reversedEdge = nodes[to].firstEdge, nodes[to].firstEdge->reversedEdge = nodes[from].firstEdge;
}

inline void link(int u, int v) {
	addEdge(u + n, v, INT_MAX);
	addEdge(v + n, u, INT_MAX);
}

struct Dinic {
	bool makeLevelGraph(Node *s, Node *t) {
		for (int i = 0; i < n + n; i++) nodes[i].level = 0;

		std::queue<Node *> q;
		q.push(s);
		s->level = 1;

		while (!q.empty()) {
			Node *v = q.front();
			q.pop();

			for (Edge *e = v->firstEdge; e; e = e->next) {
				if (e->to->level == 0 && e->capacity != e->flow) {
					e->to->level = v->level + 1;
					q.push(e->to);
				}
			}
		}

		return t->level != 0;
	}

	int findPath(Node *s, Node *t, int limit = INT_MAX) {
		if (s == t) return limit;

		for (Edge *e = s->firstEdge; e; e = e->next) {
			if (e->to->level == s->level + 1) {
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

	int operator()(int s, int t){
		int ans = 0;
		while (makeLevelGraph(&nodes[s], &nodes[t])) {
			int flow;
			while ((flow = findPath(&nodes[s], &nodes[t])) > 0) ans += flow;
		}

		return ans;
	}
} dinic;

int main() {
	scanf("%d %d %d %d", &n, &m, &s, &t), s--, t--;

	for (int i = 0; i < n; i++) addEdge(i, i + n, 1);

	for (int i = 0; i < m; i++) {
		int u, v;
		scanf("%d %d", &u, &v), u--, v--;

		link(u, v);
	}

	printf("%d\n", dinic(s + n, t));

	return 0;
}
```
