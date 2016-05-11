title: 「TJOI2013」最长上升子序列 - 离线 + 树状数组
categories: OI
tags: 
  - BZOJ
  - TJOI
  - 离线
  - Splay
  - 树状数组
permalink: tjoi2015-lis
date: 2016-04-03 22:49:33
---

给定一个序列，初始为空。现在我们将 $ 1 $ 到 $ N $ 的数字插入到序列中，每次将一个数字插入到一个特定的位置。每插入一个数字，我们都想知道此时最长上升子序列长度是多少？

<!-- more -->

### 链接
[BZOJ 3173](http://www.lydsy.com/JudgeOnline/problem.php?id=3173)

### 题解
首先，将操作离线，可以得到最终序列中每个元素的位置。

因为是从小到大加入，所以对某个元素的答案有贡献的元素仅为位置比它小且在它之前加入的元素，所以直接用一个树状数组维护前缀最大值即可。

### 代码
```c++
#include <cstdio>
#include <algorithm>

const int MAXN = 100000;

template <typename T>
struct Splay {
	enum Relation {
		L = 0, R = 1
	};

	struct Node {
		Node *c[2], *p, **r;
		T v;
		int s;
		bool b;

		Node(Node *p, Node **r, const T &v, bool b = false) : p(p), r(r), v(v), s(1), b(b) {}

		~Node() {
			if (c[L]) delete c[L];
			if (c[R]) delete c[R];
		}

		Relation relation() const {
			return this == p->c[L] ? L : R;
		}

		void maintain() {
			s = (c[L] ? c[L]->s : 0) + (c[R] ? c[R]->s : 0) + 1;
		}

		void rotate() {
			Relation x = relation();
			Node *o = p;

			if (o->p) o->p->c[o->relation()] = this;
			p = o->p;

			o->c[x] = c[x ^ 1];
			if (c[x ^ 1]) c[x ^ 1]->p = o;

			c[x ^ 1] = o;
			o->p = this;

			o->maintain(), maintain();
			if (!p) *r = this;
		}

		void splay(const Node *t = NULL) {
			while (p != t) {
				if (p->p == t) rotate();
				else if (p->relation() == relation()) p->rotate(), rotate();
				else rotate(), rotate();
			}
		}

		int rank() {
			return c[L] ? c[L]->s : 0;
		}
	} *r;

	Splay() : r(NULL) {
		buildBound(L), buildBound(R);
	}

	~Splay() {
		delete r;
	}

	void buildBound(Relation x) {
		Node **v = &r, *p = NULL;
		while (*v) p = *v, p->s++, v = &p->c[x];
		*v = new Node(p, &r, 0, true);
	}

	Node *select(int k) {
		Node *v = r;
		for (int x = k + 1; x != v->rank() + 1; ) {
			if (x < v->rank() + 1) v = v->c[L];
			else x -= v->rank() + 1, v = v->c[R];
		}
		return v;
	}

	void insert(int i, const T &v) {
		Node *a = select(i), *b = select(i + 1);
		a->splay(), b->splay(a);
		b->c[L] = new Node(b, &r, v), b->s++, b->s++;
	}

	void dfs(Node *v, T *a, int &i) {
		if (!v) return;
		dfs(v->c[L], a, i), v->b || (a[v->v - 1] = ++i), dfs(v->c[R], a, i);
	}

	void fetch(T *a) {
		int i = 0;
		dfs(r, a, i);
	}
};

int n, a[MAXN];

struct BinaryIndexedTree {
	int a[MAXN];

	static int lowbit(const int x) {
		return x & -x;
	}

	void update(const int i, const int v) {
		for (int j = i; j <= n; j += lowbit(j)) a[j - 1] = std::max(a[j - 1], v);
	}

	int query(const int i) {
		int x = 0;
		for (int j = i; j > 0; j -= lowbit(j)) x = std::max(x, a[j - 1]);
		return x;
	}
} b;

Splay<int> s;

int main() {
	scanf("%d", &n);
	for (int x = 1, i; x <= n; x++) {
		scanf("%d", &i), s.insert(i, x);
	}

	s.fetch(a);

	for (int i = 0, l = 0; i < n; i++) {
		int t = b.query(a[i] - 1) + 1;
		b.update(a[i], t);
		printf("%d\n", l = std::max(l, t));
	}

	return 0;
}
```
