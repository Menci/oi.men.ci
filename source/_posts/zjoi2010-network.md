title: 「ZJOI2010」网络扩容 - 网络流 + 费用流
categories: OI
tags: 
  - BZOJ
  - ZJOI
  - 网络流
  - Dinic
  - 费用流
  - Edmonds-Karp
permalink: zjoi2010-network
date: 2016-06-21 08:48:00
---

给定一张有向图，每条边都有一个容量 $ C $ 和一个扩容费用 $ W $。这里扩容费用是指将容量扩大 $ 1 $ 所需的费用，求

1. 在不扩容的情况下，$ 1 $ 到 $ N $ 的最大流；
2. 将 $ 1 $ 到 $ N $ 的最大流增加 $ K $ 所需的最小扩容费用。

<!-- more -->

### 链接
[BZOJ 1834](http://www.lydsy.com/JudgeOnline/problem.php?id=1834)

### 题解
第一问直接跑网络流。

第二问，考虑扩容的实质是**增加**一条连接原来两个点的边，并且这条边费用为 $ W $。  
将每一条边对应新增的边加入到残量网络中，限制流量为 $ K $ 跑最小费用流即可。

### 代码
```c++
#include <cstdio>
#include <climits>
#include <algorithm>
#include <queue>

const int MAXN = 1000;
const int MAXM = 5000;
const int MAXK = 10;

struct Node;
struct Edge;

struct Node {
	Edge *e, *c, *in;
	int l, d, f;
	bool q;
} N[MAXN + 1];

struct Edge {
	Node *s, *t;
	int f, c, w;
	Edge *next, *r;

	Edge(Node *s, Node *t, const int c, const int w) : s(s), t(t), f(0), c(c), w(w), next(s->e) {}
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

inline void edmondskarp(const int s, const int t, const int n, int &f, int &c) {
	f = c = 0;
	while (true) {
		for (int i = 0; i < n; i++) {
			N[i].f = 0;
			N[i].d = INT_MAX;
			N[i].q = false;
			N[i].in = NULL;
		}

		std::queue<Node *> q;

		q.push(&N[s]);

		N[s].d = 0, N[s].f = INT_MAX;

		while (!q.empty()) {
			Node *v = q.front();
			q.pop();

			v->q = false;

			for (Edge *e = v->e; e; e = e->next) if (e->f < e->c && e->t->d > v->d + e->w) {
				e->t->d = v->d + e->w;
				e->t->in = e;
				e->t->f = std::min(v->f, e->c - e->f);
				if (!e->t->q) {
					e->t->q = true;
					q.push(e->t);
				}
			}
		}

		if (N[t].d == INT_MAX) return;

		for (Edge *e = N[t].in; e; e = e->s->in) {
			e->f += N[t].f;
			e->r->f -= N[t].f;
		}

		f += N[t].f;
		c += N[t].f * N[t].d;
	}
}

inline void addEdge(const int s, const int t, const int c, const int w = 0) {
	N[s].e = new Edge(&N[s], &N[t], c, w);
	N[t].e = new Edge(&N[t], &N[s], 0, -w);
	(N[s].e->r = N[t].e)->r = N[s].e;
}

int main() {
	int n, m, k;
	static struct Edge {
		int s, t, c, w;
	} E[MAXM];

	scanf("%d %d %d", &n, &m, &k);
	for (int i = 0; i < m; i++) {
		Edge &e = E[i];
		scanf("%d %d %d %d", &e.s, &e.t, &e.c, &e.w);
		addEdge(e.s, e.t, e.c, 0);
	}

	int maxFlow = dinic(1, n, n + 1);

	for (int i = 0; i < m; i++) {
		Edge &e = E[i];
		addEdge(e.s, e.t, INT_MAX, e.w);
	}

	addEdge(0, 1, k, 0);

	int flow, cost;
	edmondskarp(0, n, n + 1, flow, cost);
	printf("%d %d\n", maxFlow, cost);

	return 0;
}
```
