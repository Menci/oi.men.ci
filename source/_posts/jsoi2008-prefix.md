title: 「JSOI2008」火星人 - Splay + Hash
categories: OI
tags: 
  - BZOJ
  - JSOI
  - Splay
  - Hash
  - 字符串
permalink: jsoi2008-prefix
date: 2016-10-18 20:16:00
---

给定一个字符串，每次修改一个字符、插入一个字符、查询某两个后缀的最长公共前缀。

<!-- more -->

### 链接
[BZOJ 1014](http://www.lydsy.com/JudgeOnline/problem.php?id=1014)

### 题解
使用 Splay 维护字符串 Hash，在每个节点上维护整棵子树的 Hash 值，合并两棵子树的 Hash 值时，右子树的 Hash 值乘以一个较高次幂。

二分求 LCP 即可。

### 代码
```c++
#include <cstdio>
#include <cstring>
#include <algorithm>

const int MAXN = 100000;
const int MAXM = 150000;
const unsigned long long BASE = 233;

unsigned long long base[MAXN + 1];

struct Splay {
	struct Node {
		Node *c[2], *p, **r;
		int size;
		char val;
		unsigned long long hash;

		Node(Node *p, Node **r, const char val) : p(p), r(r), size(1), val(val), hash(val) {
			c[0] = c[1] = NULL;
		}

		int relation() { return this == p->c[0] ? 0 : 1; }

		void rotate() {
			Node *o = p;
			int x = relation();

			p = o->p;
			if (o->p) o->p->c[o->relation()] = this;

			o->c[x] = c[x ^ 1];
			if (c[x ^ 1]) c[x ^ 1]->p = o;

			c[x ^ 1] = o;
			o->p = this;

			o->maintain(), maintain();
			if (!p) *r = this;
		}

		Node *splay(Node *targetParent = NULL) {
			while (p != targetParent) {
				if (p->p == targetParent) rotate();
				else if (relation() == p->relation()) p->rotate(), rotate();
				else rotate(), rotate();
			}

			return this;
		}

		void maintain() {
			size = 1;
			if (c[0]) size += c[0]->size;
			if (c[1]) size += c[1]->size;

			hash = val;
			if (c[1]) hash += c[1]->hash * BASE;
			if (c[0]) hash = hash * base[c[0]->size] + c[0]->hash;
		}

		int lsize() { return c[0] ? c[0]->size : 0; }

		void print(const int depth = 0) {
			if (c[1]) c[1]->print(depth + 1);
			for (int i = 0; i < depth; i++) putchar(' ');
			printf("%c\n", val == 0 ? ' ' : val);
			if (c[0]) c[0]->print(depth + 1);
		}
	} *r;

	Splay() : r(NULL) {}

	Node *build(const char *first, const char *last, Node *p) {
		if (first > last) return NULL;
		if (first == last) return new Node(p, &r, *first);
		else {
			const char *mid = first + (last - first) / 2;
			Node *v = new Node(p, &r, *mid);
			v->c[0] = build(first, mid - 1, v);
			v->c[1] = build(mid + 1, last, v);
			v->maintain();
			return v;
		}
	}

	void buildBounds(const int x) {
		Node *v = r;
		while (v->c[x]) v = v->c[x];
		v->c[x] = new Node(v, &r, 0);
		Node *u = v;
		do {
			u->maintain();
			u = u->p;
		} while (u);
		v->c[x]->splay();
	}

	void build(const char *first, const char *last) {
		r = build(first, last, NULL);
		buildBounds(0);
		buildBounds(1);
	}

	Node *select(const int k) {
		int x = k + 1;
		Node *v = r;
		while (x != v->lsize() + 1) {
			if (x < v->lsize() + 1) v = v->c[0];
			else x -= v->lsize() + 1, v = v->c[1];
		}
		return v->splay();
	}

	Node *select(const int l, const int r) {
		Node *a = select(l - 1), *b = select(r + 1);
		a->splay();
		b->splay(a);
		return b->c[0];
	}

	Node *insert(const int pos, const char ch) {
		Node *a = select(pos), *b = select(pos + 1);
		a->splay();
		b->splay(a);
		b->c[0] = new Node(b, &r, ch);
		Node *v = b->c[0];
		do {
			v->maintain();
			v = v->p;
		} while (v);
		return b->c[0]->splay();
	}

	void update(const int pos, const char ch) {
		Node *v = select(pos);
		v->val = ch;
		v->maintain();
	}

	unsigned long long query(const int l, const int r) {
		return select(l, r)->hash;
	}

	int size() { return r->size - 2; }
} splay;

inline void print() {
	splay.r->print();
	puts("------------------------");
}

inline int lcp(const int a, const int b) {
	int l = 0, r = std::min(splay.size() - a + 1, splay.size() - b + 1);
	while (l != r) {
		const int mid = l + (r - l) / 2 + 1;
		if (splay.query(a, a + mid - 1) == splay.query(b, b + mid - 1)) {
			l = mid;
		} else {
			r = mid - 1;
		}
	}
	return l;
}

int main() {
	base[0] = 1;
	for (int i = 1; i <= MAXN; i++) base[i] = base[i - 1] * BASE;

	static char s[MAXN + 1];
	scanf("%s", s);
	int n = strlen(s);
	splay.build(s, s + n - 1);

	int m;
	scanf("%d", &m);
	while (m--) {
		char cmd[2];
		scanf("%s", cmd);
		if (cmd[0] == 'Q') {
			int a, b;
			scanf("%d %d", &a, &b);
			printf("%d\n", lcp(a, b));
		} else if (cmd[0] == 'R') {
			int pos;
			char ch[2];
			scanf("%d %s", &pos, ch);
			splay.update(pos, ch[0]);
		} else if (cmd[0] == 'I') {
			int pos;
			char ch[2];
			scanf("%d %s", &pos, ch);
			splay.insert(pos, ch[0]);
		}

		// print();
	}

	return 0;
}
```