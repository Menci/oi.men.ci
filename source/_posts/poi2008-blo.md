title: 「POI2008」BLO - 割点
categories: OI
tags: 
  - BZOJ
  - POI
  - Tarjan
  - 图论
  - 割点
permalink: poi2008-blo
date: 2016-09-08 18:37:00
---

Byteotia 城市有 $ n $ 个 towns，$ m $ 条双向 roads。每条 road 连接两个不同的 towns，没有重复的 road。所有 towns 连通。

求当把每个点**封锁**时，会有多少**有序**点对 $ (u, v) $ 不连通。

<!-- more -->

### 链接
[BZOJ 1123](http://www.lydsy.com/JudgeOnline/problem.php?id=1123)

### 题解
如果一个点不是割点，则答案是 $ 2 \times (n - 1) $。

如果一个点是割点，则将它去掉后，剩下的所有连通块两两之间不连通，对于两个连通块，它们对答案的贡献是它们的大小之和。

DFS 时维护 DFS 树上每棵子树的大小，对于每个割点 $ u $，删掉它后，所有满足 $ \mathrm{low}(v) \geq \mathrm{dfn}(u) $ 的子节点 $ v $ 的子树均为一个对答案有贡献的连通块。另外，树上除 $ u $ 的整棵子树的其它部分也是一个连通块。

设每个连通块的大小分别为 $ x_1, x_2, \ldots, x_k $，$ s = \sum\limits_{i = 1} ^ k x_i $，则答案贡献为：

$$
\begin{aligned}
& x_1x_2 + x_1x_3 + \ldots + x_1x_k + \ldots + x_kx_{k - 1} \\
= & x_1(x_2 + x_3 + \ldots + x_k) + x_2(x_1 + x_3 + \ldots + x_k) + \ldots + x_k(x_1 + x_2 + \ldots + x_{k - 1}) \\
= & \sum\limits_{i = 1} ^ k x_i \times (s - x_i)
\end{aligned}
$$

### 代码
```c++
#include <cstdio>
#include <stack>
#include <vector>
#include <algorithm>

const int MAXN = 100000;

struct Node {
	struct Edge *e, *c;
	Node *p;
	int dfn, low, size;
	long long ans;
	bool flag, pushed, v;
} N[MAXN];

struct Edge {
	Node *s, *t;
	Edge *next;

	Edge(Node *s, Node *t) : s(s), t(t), next(s->e) {}
};

inline void addEdge(const int s, const int t) {
	N[s].e = new Edge(&N[s], &N[t]);
	N[t].e = new Edge(&N[t], &N[s]);
}

int n;

inline long long calc(const std::vector<long long> &vec) {
	long long s = 0, ans = 0;
	for (size_t i = 0; i < vec.size(); i++) s += vec[i];
	for (size_t i = 0; i < vec.size(); i++) ans += (s - vec[i]) * vec[i];
	return ans;
}

inline void tarjan() {
	int ts = 0;
	for (int i = 0; i < n; i++) {
		if (N[i].v) continue;

		std::stack<Node *> s;
		N[i].pushed = true;
		s.push(&N[i]);

		while (!s.empty()) {
			Node *v = s.top();
			
			if (!v->v) {
				v->v = true;
				v->dfn = v->low = ++ts;
				v->c = v->e;
				v->size = 1;
			}

			if (v->c) {
				Edge *&e = v->c;
				if (e->t->v) v->low = std::min(v->low, e->t->dfn);
				else if (!e->t->pushed) e->t->pushed = true, e->t->p = v, s.push(e->t);
				e = e->next;
			} else {
				std::vector<long long> vec;
				if (v != &N[i]) {
					for (Edge *e = v->e; e; e = e->next) {
						if (e->t->p != v) continue;
						if (e->t->low >= v->dfn) {
							v->flag = true;
							vec.push_back(e->t->size);
						}
						v->size += e->t->size;
					}
					int t = n - 1;
					for (size_t i = 0; i < vec.size(); i++) t -= vec[i];
					vec.push_back(t);
					if (v->flag) v->ans = calc(vec);
					// if (v->flag) printf("tarjan(): found %lu\n", v - N + 1);
				}

				if (v->p) v->p->low = std::min(v->p->low, v->low);

				s.pop();
			}
		}

		std::vector<long long> vec;
		for (Edge *e = N[i].e; e; e = e->next) if (e->t->p == &N[i]) vec.push_back(e->t->size);
		if (vec.size() >= 2) N[i].ans = calc(vec), N[i].flag = true;
		// if (N[i].flag) printf("tarjan(): found %d\n", i + 1);
	}
}

int main() {
	int m;
	scanf("%d %d", &n, &m);
	while (m--) {
		int u, v;
		scanf("%d %d", &u, &v), u--, v--;
		addEdge(u, v);
	}

	tarjan();

	for (int i = 0; i < n; i++) printf("%lld\n", N[i].ans + (n - 1) * 2);

	return 0;
}
```