title: 「CQOI2009」跳舞 - 网络流
date: 2017-02-21 11:32:00
categories: OI
tags:
  - CQOI
  - BZOJ
  - 网络流
  - 二分答案
permalink: cqoi2009-dance
---

一次舞会有 $ n $ 个男孩和 $ n $ 个女孩。每首曲子开始时，所有男孩和女孩恰好配成 $ n $ 对跳交谊舞。每个男孩都不会和同一个女孩跳两首（或更多）舞曲。有一些男孩女孩相互喜欢，而其他相互不喜欢（不会「单向喜欢」）。每个男孩最多只愿意和 $ k $ 个不喜欢的女孩跳舞，而每个女孩也最多只愿意和 $ k $ 个不喜欢的男孩跳舞。给出每对男孩女孩是否相互喜欢的信息，舞会最多能有几首舞曲？

<!-- more -->

### 链接
[BZOJ 1305](http://www.lydsy.com/JudgeOnline/problem.php?id=1305)

### 题解
二分答案。

* 对于每个男孩 $ i $ 建两个点 $ b_i $ 和 $ b'_i $，其中 $ b_i $ 连出的边表示和喜欢的女孩跳舞，$ b'_i $ 连出的边表示和不喜欢的女孩跳舞；
* 对于每个女孩 $ i $ 建两个点 $ g_i $ 和 $ g'_i $，其中 $ g_i $ 连入的边表示和喜欢的男孩跳舞，$ g'_i $ 连入的边表示和不喜欢的女孩跳舞；
* 从每个 $ b_i $ 和 $ g'_i $ 分别向 $ b'_i $ 和 $ g_i $ 连一条容量为 $ k $ 的边，表示最多只能和 $ k $ 个不喜欢的人跳舞；
* 建立源点 $ S $ 与汇点 $ T $，对于每个 $ i $，连容量为答案的边 $ S \rightarrow b_i $ 与 $ g_i \rightarrow T $，表示每个男孩或女孩可以跳舞无限次。

最大流即为每个男生能跳的舞的数量的和，如果最大流为答案的 $ n $ 倍，则答案合法。

### 代码
```c++
#include <cstdio>
#include <climits>
#include <queue>
#include <vector>

const int MAXN = 50;
const int MAX_ANS = 10000;

struct Node {
	std::vector<struct Edge> edges;
	struct Edge *currEdge;
	int l;
} N[MAXN * 4 + 2];

struct Edge {
	Node *s, *t;
	int flow, cap, rev;

	Edge(Node *s, Node *t, int cap, int rev) : s(s), t(t), flow(0), cap(cap), rev(rev) {}
};

inline void addEdge(int s, int t, int cap) {
	N[s].edges.push_back(Edge(&N[s], &N[t], cap, N[t].edges.size()));
	N[t].edges.push_back(Edge(&N[t], &N[s], 0, N[s].edges.size() - 1));
}

struct Dinic {
	bool level(Node *s, Node *t, int n) {
		for (int i = 0; i < n; i++) {
			N[i].l = 0;
			N[i].currEdge = &N[i].edges.front();
		}

		std::queue<Node *> q;
		q.push(s);
		
		s->l = 1;

		while (!q.empty()) {
			Node *v = q.front();
			q.pop();

			for (Edge *e = &v->edges.front(); e <= &v->edges.back(); e++) {
				if (e->flow < e->cap && !e->t->l) {
					e->t->l = v->l + 1;
					if (e->t == t) return true;
					else q.push(e->t);
				}
			}
		}

		return false;
	}

	int findPath(Node *s, Node *t, int limit = INT_MAX) {
		if (s == t) return limit;

		for (Edge *&e = s->currEdge; e <= &s->edges.back(); e++) {
			if (e->flow < e->cap && e->t->l == s->l + 1) {
				int flow = findPath(e->t, t, std::min(limit, e->cap - e->flow));
				if (flow) {
					e->flow += flow;
					e->t->edges[e->rev].flow -= flow;
					return flow;
				}
			}
		}

		return 0;
	}

	int operator()(int s, int t, int n) {
		int res = 0;
		while (level(&N[s], &N[t], n)) {
			int flow;
			while ((flow = findPath(&N[s], &N[t])) > 0) res += flow;
		}
		return res;
	}
} dinic;

int n, k;
char s[MAXN + 1][MAXN + 2];

inline bool check(int limit) {
	for (int i = 0; i < n * 4 + 2; i++) N[i].edges.clear();

	for (int i = 1; i <= n; i++) {
		addEdge(i, i + n * 2, k);
	}

	for (int i = n + 1; i <= n * 2; i++) {
		addEdge(i + n * 2, i, k);
	}

	int s = 0, t = n * 4 + 1;
	for (int i = 1; i <= n; i++) {
		addEdge(s, i, limit);
	}

	for (int i = n + 1; i <= n * 2; i++) {
		addEdge(i, t, limit);
	}

	for (int i = 1; i <= n; i++) {
		for (int j = 1; j <= n; j++) {
			if (::s[i][j] == 'Y') {
				addEdge(i, n + j, 1);
			} else {
				addEdge(i + n * 2, n + j + n * 2, 1);
			}
		}
	}

	return dinic(s, t, n * 4 + 2) == limit * n;
}

int main() {
	scanf("%d %d", &n, &k);

	for (int i = 1; i <= n; i++) {
		scanf("%s", s[i] + 1);
	}

	int l = 0, r = MAX_ANS;
	while (l < r) {
		int mid = l + (r - l) / 2 + 1;
		if (check(mid)) l = mid;
		else r = mid - 1;
	}

	printf("%d\n", l);

	return 0;
}
```
