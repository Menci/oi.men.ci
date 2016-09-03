title: 「SDOI2014」旅行 - 树链剖分
date: 2016-09-02 21:39:00
categories: OI
tags:
  - BZOJ
  - SDOI
  - 树链剖分
  - 数据结构
permalink: sdoi2014-journey
---

给一棵树，每个点有其初始颜色和权值，每次修改一个点的颜色或权值，查询路径上颜色与起点相同点权值的和或最大值。

<!-- more -->

### 链接
[BZOJ 3531](http://www.lydsy.com/JudgeOnline/problem.php?id=3531)

### 题解
树链剖分，对每种颜色单独建立线段树，线段树动态开点、删点，时间复杂度与空间复杂度均为 $ O(n \log n) $ 级别。

### 代码
```c++
#include <cstdio>
#include <algorithm>
#include <stack>

const int MAXN = 1e5;
const int MAXQ = 1e5;
const int MAXC = 1e5;

struct SegmentTree {
	int l, r, mid;
	SegmentTree *lc, *rc;
	int max, sum;

	SegmentTree(const int l, const int r) : l(l), r(r), mid(l + (r - l) / 2), lc(NULL), rc(NULL), max(0), sum(0) {}

	void update(const int pos, const int val) {
		if (l != r) {
			SegmentTree *&c = pos <= mid ? lc : rc;
			if (!c) c = (pos <= mid) ? new SegmentTree(l, mid) : new SegmentTree(mid + 1, r);
			c->update(pos, val);
			if (val == 0 && !c->lc && !c->rc) delete c, c = NULL;
			max = sum = 0;
			if (lc) max = std::max(max, lc->max), sum += lc->sum;
			if (rc) max = std::max(max, rc->max), sum += rc->sum;
		} else sum = max = val;
	}

	int querySum(const int l, const int r) {
		if (l > this->r || r < this->l) return 0;
		else if (l <= this->l && r >= this->r) return sum;
		else return (lc ? lc->querySum(l, r) : 0) + (rc ? rc->querySum(l, r) : 0);
	}

	int queryMax(const int l, const int r) {
		if (l > this->r || r < this->l) return 0;
		else if (l <= this->l && r >= this->r) return max;
		else return std::max(lc ? lc->queryMax(l, r) : 0, rc ? rc->queryMax(l, r) : 0);
	}
} *seg[MAXC];

struct Node;
struct Edge;

struct Node {
	Edge *e;
	int d, s, i;
	bool f;
	Node *p, *c, *t;
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

int n, q, f[MAXN], v[MAXN];

inline void cut() {
	std::stack<Node *> s;
	s.push(&N[0]);
	N[0].d = 1;

	while (!s.empty()) {
		Node *v = s.top();
		if (!v->f) {
			v->f = true;
			for (Edge *e = v->e; e; e = e->next) if (!e->t->d) {
				e->t->d = v->d + 1;
				e->t->p = v;
				s.push(e->t);
			}
		} else {
			v->s = 1;
			for (Edge *e = v->e; e; e = e->next) if (e->t->p == v) {
				v->s += e->t->s;
				if (!v->c || v->c->s < e->t->s) v->c = e->t;
			}
			s.pop();
		}
	}

	s.push(&N[0]);
	int i = 0;
	while (!s.empty()) {
		Node *v = s.top();
		if (v->f) {
			v->f = false;
			v->i = i++;
			if (!v->p || v != v->p->c) v->t = v;
			else v->t = v->p->t;
			for (Edge *e = v->e; e; e = e->next) if (e->t->p == v && e->t != v->c) s.push(e->t);
			if (v->c) s.push(v->c);
		} else s.pop();
	}
}

inline int querySum(const int u, const int v, SegmentTree *seg) {
	Node *a = &N[u], *b = &N[v];
	int ans = 0;
	while (a->t != b->t) {
		if (a->t->d < b->t->d) std::swap(a, b);
		ans += seg->querySum(a->t->i, a->i);
		a = a->t->p;
	}
	if (a->d > b->d) std::swap(a, b);
	return ans + seg->querySum(a->i, b->i);
}

inline int queryMax(const int u, const int v, SegmentTree *seg) {
	Node *a = &N[u], *b = &N[v];
	int ans = 0;
	while (a->t != b->t) {
		if (a->t->d < b->t->d) std::swap(a, b);
		ans = std::max(ans, seg->queryMax(a->t->i, a->i));
		a = a->t->p;
	}
	if (a->d > b->d) std::swap(a, b);
	return std::max(ans, seg->queryMax(a->i, b->i));
}

int main() {
	scanf("%d %d", &n, &q);

	for (int i = 0; i < MAXC; i++) seg[i] = new SegmentTree(0, n - 1);
	for (int i = 0; i < n; i++) {
		scanf("%d %d", &v[i], &f[i]);
		f[i]--;
		// printf("seg[%d]->update(%d, %d)\n", f[i], i, v[i]);
		// seg[f[i]]->update(i, v[i]);
	}

	for (int i = 0; i < n - 1; i++) {
		int u, v;
		scanf("%d %d", &u, &v), u--, v--;
		addEdge(u, v);
	}

	cut();

	for (int i = 0; i < n; i++) seg[f[i]]->update(N[i].i, v[i]);

	while (q-- ) {
		char s[3];
		int a, b;
		scanf("%s %d %d", s, &a, &b);
		
		if (s[1] == 'C') {
			a--, b--;
			seg[f[a]]->update(N[a].i, 0);
			seg[b]->update(N[a].i, v[a]);
			f[a] = b;
		} else if (s[1] == 'W') {
			a--;
			seg[f[a]]->update(N[a].i, b);
			v[a] = b;
		} else if (s[1] == 'S') {
			a--, b--;
			printf("%d\n", querySum(a, b, seg[f[a]]));
		} else if (s[1] == 'M') {
			a--, b--;
			printf("%d\n", queryMax(a, b, seg[f[a]]));
		}
	}

	return 0;
}
```