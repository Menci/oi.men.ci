title: 「COGS 729」圆桌聚餐 - 网络流
categories: OI
tags: 
  - COGS
  - 图论
  - 网络流
  - 网络流24题
  - Dinic
permalink: cogs-729
id: 47
updated: '2016-02-09 14:41:05'
date: 2016-02-09 13:42:59
---

假设有来自 `m` 个不同单位的代表参加一次国际会议。每个单位的代表数分别为 `ri`。会议餐厅共有 `n` 张餐桌，每张餐桌可容纳 `ci` 个代表就餐。

为了使代表们充分交流，希望从同一个单位来的代表不在同一个餐桌就餐。试设计一个算法，给出满足要求的代表就餐方案。

<!-- more -->

### 题目链接
[COGS 729](http://cogs.top/cogs/problem/problem.php?pid=729)

### 解题思路
问题的关键就是：

**每个单位最多有一个人做到一张单独的餐桌上！**

进行网络流建模，建立源点 `S`，由 `S` 向每个代表单位的点连一条边，容量为单位人数；建立汇点 `T`，由每个代表餐桌的点向 `T` 连一条边，容量为餐桌容纳人数；分别从每个单位向所有餐桌连一条边，容量为 `1`。

然后求出最大流，如果最大流小于所有单位人数总和，那么问题无解，否则有解，即所有由单位指向餐桌的边构成了一组解。

### AC代码
```cpp
#include <cstdio>
#include <climits>
#include <algorithm>
#include <queue>
#include <vector>

const int MAXN = 270;
const int MAXM = 150;

struct Node;
struct Edge;

struct Node {
	Edge *firstEdge;
	int level, id;
} nodes[MAXN + MAXM + 2];

struct Edge {
	Node *from, *to;
	int capacity, flow;
	Edge *next, *reversedEdge;

	Edge(Node *from, Node *to, int capacity) : from(from), to(to), capacity(capacity), flow(0), next(from->firstEdge) {}
};

int m, n;

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

	int findPath(Node *s, Node *t, int limit) {
		if (s == t) return limit;

		for (Edge *e = s->firstEdge; e; e = e->next) {
			if (e->flow < e->capacity && e->to->level == s->level + 1) {
				int flow = findPath(e->to, t, std::min(e->capacity - e->flow, limit));
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
			while ((flow = findPath(&nodes[s], &nodes[t], INT_MAX)) > 0) ans += flow;
		}

		return ans;
	}
} dinic;

inline void addEdge(int from, int to, int capacity) {
	nodes[from].firstEdge = new Edge(&nodes[from], &nodes[to], capacity);
	nodes[to].firstEdge = new Edge(&nodes[to], &nodes[from], 0);

	nodes[from].firstEdge->reversedEdge = nodes[to].firstEdge, nodes[to].firstEdge->reversedEdge = nodes[from].firstEdge;
}

int main() {
	freopen("roundtable.in", "r", stdin);
	freopen("roundtable.out", "w", stdout);

	scanf("%d %d", &m, &n);

	for (int i = 0; i < m + n + 2; i++) nodes[i].id = i;

	const int s = 0, t = m + n + 1;

	int sum = 0;
	for (int i = 1; i <= m; i++) {
		int x;
		scanf("%d", &x);
		sum += x;

		addEdge(s, i, x);

		for (int j = m + 1; j <= m + n; j++) addEdge(i, j, 1);
	}

	for (int i = m + 1; i <= m + n; i++) {
		int x;
		scanf("%d", &x);

		addEdge(i, t, x);
	}

	int maxFlow = dinic(s, t, m + n + 2);
	if (maxFlow == sum) {
		puts("1");
		for (int i = 1; i <= m; i++) {
			std::vector<int> v;
			for (Edge *e = nodes[i].firstEdge; e; e = e->next) {
				if (e->to->id > m && e->to->id <= m + n && e->flow == e->capacity) {
					v.push_back(e->to->id - m);
				}
			}

			std::sort(v.begin(), v.end());

			for (std::vector<int>::const_iterator p = v.begin(); p != v.end(); p++) {
				printf("%d ", *p);
			}
			putchar('\n');
		}
	} else puts("0");

	fclose(stdin);
	fclose(stdout);

	return 0;
}
```
