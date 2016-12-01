title: 「NOIP2015」运输计划 - 最近公共祖先 + 二分 + 树上路径交
categories: OI
tags: 
  - NOIP
  - BZOJ
  - CodeVS
  - 最近公共祖先
permalink: noip2015-transport
date: 2016-10-19 17:19:00
---

在一棵树上，每条边有边权，给定 $ m $ 个路径 $ u_i \leftrightarrow v_i $，求将其中一条边的边权置为 $ 0 $，使得 $ m $ 个路径的长度和最小。

<!-- more -->

### 链接
[CodeVS 4632](http://codevs.cn/problem/4632/)  
[CodeVS 5440](http://codevs.cn/problem/5440/)  
[BZOJ 4326](http://www.lydsy.com/JudgeOnline/problem.php?id=4326)  

### 题解
求出每条路径两个端点的最近公共祖先，进而求出每条路径的长度。二分一个答案 $ x $，所有长度 $ > x $ 的路径上都至少需要删去一条边。对这些路径求交，最优方案一定是删去路径交中长度最大的边，如果删去最大的边后，最长的路径仍不满足 $ \leq x $，则答案 $ x $ 不合法。

考虑如何求树上路径交。这里使用**树上前缀和**的方法，对于一条路径 $ u_i \leftrightarrow v_i $，设 $ p_i = \mathrm{lca}(u_i, v_i) $，在 $ u_i $ 和 $ v_i $ 上打上 $ +1 $ 标记，在 $ p_i $ 上打上 $ -2 $ 标记。从每个叶子节点向父节点走，走到根，路径上经过每一条边时的前缀和即为这条边被经过的次数。被每一条路径都经过的边组成的集合即为路径交。

### 代码
```c++
#pragma GCC optimize("O3")

#include <cstdio>
#include <algorithm>
#include <new>

#define inline inline __attribute__((always_inline))

const int MAXN = 300000;
const int MAXM = 300000;
const int MAXN_LOG = 20; // Math.log2(600000) = 19.194602975157967

struct Node {
	struct Edge *e, *c, *in;
	bool visited;
	int pos, depth, cover, dist;
} N[MAXN], *eulerTour[MAXN * 2], *dfsSequence[MAXN], *st[MAXN * 2][MAXN_LOG + 1];

struct Edge {
	Node *s, *t;
	int w, cover;
	Edge *next;

	Edge() {}
	Edge(Node *s, Node *t, const int w) : s(s), t(t), w(w), next(s->e) {}
} mEdges[MAXN * 2 - 2], *pEdge = mEdges, *E[MAXN - 1];

struct Path {
	Node *u, *v, *p;
	int dist;
} a[MAXM];

inline void addEdge(const int s, const int t, const int w) {
	N[s].e = new (pEdge++) Edge(&N[s], &N[t], w);
	N[t].e = new (pEdge++) Edge(&N[t], &N[s], w);
}

int n, m, log[MAXN * 2 + 1], max, eulerTourLen;

inline void dfs() {
	static Node *s[MAXN];
	Node **top = s;
	*s = &N[0];
	N[0].depth = 1;

	int ts = 0;
	while (top >= s) {
		Node *v = *top;
		if (!v->visited) {
			v->visited = true;
			v->c = v->e;
			v->pos = eulerTourLen;
			dfsSequence[ts++] = v;
		}

		eulerTour[eulerTourLen++] = v;

		while (v->c && v->c->t->depth) v->c = v->c->next;
		if (v->c) {
			if (!v->c->t->depth) {
				v->c->t->depth = v->depth + 1;
				v->c->t->dist = v->dist + v->c->w;
				v->c->t->in = v->c;
				*++top = v->c->t;
			}
			v->c = v->c->next;
		} else {
			top--;
		}
	}

	for (int i = 1; i < n; i++) E[i - 1] = N[i].in;
}

inline Node *min(Node *a, Node *b) {
	return a->depth < b->depth ? a : b;
}

inline void sparseTable() {
	for (int i = 0; i < eulerTourLen; i++) st[i][0] = eulerTour[i];
	for (int j = 1; (1 << j) <= eulerTourLen; j++) {
		for (int i = 0; i < eulerTourLen; i++) {
			if (i + (1 << (j - 1)) < eulerTourLen) st[i][j] = min(st[i][j - 1], st[i + (1 << (j - 1))][j - 1]);
			else st[i][j] = st[i][j - 1];
		}
	}

	for (int i = 0; i <= eulerTourLen; i++) {
		int x = 0;
		while ((1 << x) <= i) x++;
		log[i] = x - 1;
	}
}

inline Node *rmq(const int l, const int r) {
	if (l == r) return st[l][0];
	else {
		const int t = log[r - l];
		return min(st[l][t], st[r - (1 << t) + 1][t]);
	}
}

inline Node *lca(Node *u, Node *v) {
	return rmq(std::min(u->pos, v->pos), std::max(u->pos, v->pos));
}

inline int distance(Node *u, Node *v, Node *p) {
	return u->dist + v->dist - p->dist * 2;
}

inline bool check(const int limit) {
	int cnt = 0;
	for (int i = 0; i < m; i++) {
		if (a[i].dist > limit) {
			a[i].p->cover -= 2;
			a[i].u->cover++;
			a[i].v->cover++;
			cnt++;
		}
	}

	for (int i = n - 1; i >= 0; i--) {
		if (dfsSequence[i]->in) {
			dfsSequence[i]->in->cover = dfsSequence[i]->cover;
			dfsSequence[i]->in->s->cover += dfsSequence[i]->cover;
		}
		dfsSequence[i]->cover = 0;
	}

	Edge *maxEdge = NULL;
	for (int i = 0; i < n - 1; i++) {
		if (E[i]->cover == cnt && (!maxEdge || E[i]->w > maxEdge->w)) maxEdge = E[i];
	}

	return maxEdge && max - maxEdge->w <= limit;
}

template <typename T>
inline void read(T &x) {
	x = 0;
	register char ch;
	while (ch = getchar(), !(ch >= '0' && ch <= '9'));
	do x = x * 10 + ch - '0'; while (ch = getchar(), (ch >= '0' && ch <= '9'));
}

int main() {
	read(n), read(m);
	for (int i = 0; i < n - 1; i++) {
		int u, v, w;
		read(u), read(v), read(w), u--, v--;
		addEdge(u, v, w);
	}

	dfs();
	sparseTable();

	for (int i = 0; i < m; i++) {
		int u, v;
		read(u), read(v), u--, v--;
		a[i].u = &N[u], a[i].v = &N[v];
		a[i].p = lca(a[i].u, a[i].v);
		a[i].dist = distance(a[i].u, a[i].v, a[i].p);
		max = std::max(max, a[i].dist);
		// printf("lca(%lu, %lu) = %lu\n", a[i].u - N + 1, a[i].v - N + 1, a[i].p - N + 1);
	}

	int l = 0, r = max;
	while (l < r) {
		const int mid = l + (r - l) / 2;
		if (check(mid)) r = mid;
		else l = mid + 1;
	}
	// check(11);

	printf("%d\n", l);

	return 0;
}
```
