title: 「SCOI2007」蜥蜴 - 网络流
categories: OI
tags: 
  - BZOJ
  - SCOI
  - 网络流
  - Dinic
permalink: scoi2007-lizard
date: 2016-09-03 21:47:00
---

在一个 $ r $ 行 $ c $ 列的网格地图中有一些高度不同的石柱，一些石柱上站着一些蜥蜴，你的任务是让尽量多的蜥蜴逃到边界外。

每行每列中相邻石柱的距离为 $ 1 $，蜥蜴的跳跃距离是 $ d $，即蜥蜴可以跳到平面**曼哈顿**距离不超过 $ d $ 的任何一个石柱上。

石柱都不稳定，每次当蜥蜴跳跃时，所离开的石柱高度减 $ 1 $（如果仍然落在地图内部，则到达的石柱高度不变），如果该石柱原来高度为 $ 1 $，则蜥蜴离开后消失。以后其他蜥蜴不能落脚。

任何时刻不能有两只蜥蜴在同一个石柱上。

<!-- more -->

### 链接
[BZOJ 1066](http://www.lydsy.com/JudgeOnline/problem.php?id=1066)

### 题解
网络流，从每个点向所有与其曼哈顿距离在 $ d $ 以内的点连双向边，对每个点设置流量限制为石柱高度，蜥蜴数量减去最大流即为答案。

### 代码
```c++
#include <cstdio>
#include <climits>
#include <algorithm>
#include <queue>

const int MAXN = 20;
const int MAXD = 4;

struct Node;
struct Edge;

struct Node {
	Edge *e, *c;
	int l;
} N[MAXN * MAXN * 2 + 2];

struct Edge {
	Node *s, *t;
	int f, c;
	Edge *next, *r;

	Edge(Node *s, Node *t, const int c) : s(s), t(t), f(0), c(c), next(s->e) {}
};

struct Dinic {
	bool makeLevelGraph(Node *s, Node *t, const int n) {
		for (int i = 0; i < n; i++) N[i].l = 0, N[i].c = N[i].e;

		std::queue<Node *> q;
		q.push(s);
		s->l = 1;

		while (!q.empty()) {
			Node *v = q.front();
			q.pop();

			for (Edge *e = v->e; e; e = e->next) if (!e->t->l && e->f < e->c) {
				e->t->l = v->l + 1;
				if (e->t == t) return true;
				else q.push(e->t);
			}
		}

		return false;
	}

	int findPath(Node *s, Node *t, const int limit = INT_MAX) {
		if (s == t) return limit;
		for (Edge *&e = s->c; e; e = e->next) if (e->t->l == s->l + 1 && e->f < e->c) {
			int f = findPath(e->t, t, std::min(limit, e->c - e->f));
			if (f) {
				e->f += f, e->r->f -= f;
				return f;
			}
		}
		return 0;
	}

	int operator()(const int s, const int t, const int n) {
		int res = 0;
		while (makeLevelGraph(&N[s], &N[t], n)) {
			int f;
			while ((f = findPath(&N[s], &N[t])) > 0) res += f;
		}
		return res;
	}
} dinic;

inline void addEdge(const int s, const int t, const int c) {
	// printf("addEdge(%d, %d, %d)\n", s, t, c);
	N[s].e = new Edge(&N[s], &N[t], c);
	N[t].e = new Edge(&N[t], &N[s], 0);
	(N[s].e->r = N[t].e)->r = N[s].e;
}

int n, m;

inline int id(const int i, const int j, const int l) {
	return l * n * m + i * m + j + 1;
}

int main() {
	int d;
	scanf("%d %d %d", &n, &m, &d);

	/*
	printf("%d -> %d\n", id(2, 2, 1), id(2, 2, 0));
	printf("%d -> %d\n", id(2, 2, 0), id(2, 2, 2));
	printf("%d -> %d\n", id(2, 2, 2), id(2, 1, 1));
	printf("%d -> %d\n", id(2, 1, 1), id(3, 1, 0));
	printf("%d -> %d\n", id(3, 1, 0), id(3, 1, 2));
	printf("%d -> %d\n", id(3, 1, 2), id(3, 0, 1));
	*/
	/*
	for (int h = 0; h <= d; h++) for (int i = 0; i < n; i++) for (int j = 0; j < m; j++) printf("%d\n", id(i, j, h));
	printf("t = %d\n", n * m * (d + 1) + 1);
	return 0;
	*/

	const int s = 0, t = n * m * 2 + 1;
	for (int i = 0; i < n; i++) {
		static char buf[MAXN + 1];
		scanf("%s", buf);
		for (int j = 0; j < m; j++) {
			addEdge(id(i, j, 0), id(i, j, 1), buf[j] - '0');
		}
	}

	int cnt = 0;
	for (int i = 0; i < n; i++) {
		static char buf[MAXN + 1];
		scanf("%s", buf);
		for (int j = 0; j < m; j++) {
			if (buf[j] == 'L') addEdge(s, id(i, j, 0), 1), cnt++;
		}
	}

	for (int i = 0; i < n; i++) {
		for (int j = 0; j < m; j++) {
			for (int k = 0; k < n; k++) {
				for (int l = 0; l < m; l++) {
					if (abs(i - k) + abs(j - l) <= d) {
						addEdge(id(i, j, 1), id(k, l, 0), INT_MAX);
						addEdge(id(k, l, 1), id(i, j, 0), INT_MAX);
					}
				}
			}
			if (i < d || i > n - d - 1 || j < d || j > m - d - 1) addEdge(id(i, j, 1), t, INT_MAX);
		}
	}

	int ans = dinic(s, t, n * m * 2 + 2);
	printf("%d\n", cnt - ans);

	return 0;
}
```