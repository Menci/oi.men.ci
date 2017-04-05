title: 「NOI2014」魔法森林 - LCT
categories: OI
tags: 
  - NOI
  - BZOJ
  - LCT
  - 数据结构
permalink: noi2014-forest
date: 2016-07-11 23:50:00
---

魔法森林是一个 $ N $ 个节点 $ M $ 条边的无向图，节点标号为 $ 1 \ldots N $，边标号为 $ 1 \ldots M $。初始时小 E 同学在号节点 $ 1 $，隐士在节点 $ N $。

无向图中的每一条边 $ E_i $ 包含两个权值 $ A_i $ 与 $ B_i $。若身上携带的 A 型守护精灵个数不少于 $ A_i $，且 B 型守护精灵个数不少于 $ B_i $，这条边上的妖怪就发起攻击。

小 E 想要知道，要能够成功拜访到隐士，最少需要携带守护精灵的总个数。

<!-- more -->

### 链接
[BZOJ 3669](http://www.lydsy.com/JudgeOnline/problem.php?id=3669)  
[UOJ #3](http://uoj.ac/problem/3)

### 题解
将边按照 $ A_i $ 排序，以 $ B_i $ 作为边权，加入到 LCT 中（每条边拆成一个点和两条边，分别与两个端点相连）。每当出现环时，删除环上 $ B_i $ 最大的边。每次判断 $ 1 $ 到 $ n $ 是否连通，更新答案。

注意自环。

### 代码
```c++
#include <cstdio>
#include <climits>
#include <cassert>
#include <algorithm>

const int MAXN = 50000;
const int MAXM = 100000;

struct LinkCutTree {
	struct Node {
		Node *c[2], *p, *pp, *max;
		int w;
		bool rev;

		Node() : p(NULL), pp(NULL), max(this), w(0) {}

		int relation() { return this == p->c[0] ? 0 : 1; }

		void maintain() {
			max = this;
			if (c[0] && c[0]->max->w > max->w) max = c[0]->max;
			if (c[1] && c[1]->max->w > max->w) max = c[1]->max;
		}

		void pushDown() {
			if (rev) {
				std::swap(c[0], c[1]);
				if (c[0]) c[0]->rev ^= 1;
				if (c[1]) c[1]->rev ^= 1;
				rev = false;
			}
		}

		void rotate() {
			std::swap(pp, p->pp);
			int r = relation();
			Node *o = p;
			
			p = o->p;
			if (o->p) o->p->c[o->relation()] = this;

			o->c[r] = c[r ^ 1];
			if (c[r ^ 1]) c[r ^ 1]->p = o;

			c[r ^ 1] = o;
			o->p = this;

			o->maintain(), maintain();
		}

		void splay() {
			while (p) {
				if (p->p) p->p->pushDown();
				p->pushDown(), pushDown();

				if (!p->p) rotate();
				else if (p->relation() == relation()) p->rotate(), rotate();
				else rotate(), rotate();
			}
			pushDown();
		}

		void expose() {
			splay();
			if (c[1]) {
				std::swap(c[1]->p, c[1]->pp);
				c[1] = NULL;
				maintain();
			}
		}

		bool splice() {
			splay();
			if (!pp) return false;
			pp->expose();
			pp->c[1] = this;
			pp->maintain();
			std::swap(p, pp);
			return true;
		}

		void access() {
			expose();
			while (splice());
		}

		void evert() {
			access();
			splay();
			rev ^= 1;
		}
	} N[MAXN], E[MAXM], *a[MAXM][2];

	void link(Node *u, Node *v) {
		// printf("Linking %ld as %ld's parent.\n", u - N + 1, v - N + 1);
		v->evert();
		u->expose();
		v->pp = u;
	}

	void link(const int u, const int v, const int i, const int w) {
		E[i].w = w;
		a[i][0] = &N[u];
		a[i][1] = &N[v];
		link(&N[u], &E[i]);
		link(&E[i], &N[v]);
	}

	void cut(Node *u, Node *v) {
		v->evert();
		v->expose();
		u->splay();
		u->pp = NULL;
	}

	void cut(const int i) {
		cut(a[i][0], &E[i]);
		cut(&E[i], a[i][1]);
	}

	Node *find(const int u) {
		Node *v = &N[u];
		v->access();
		v->splay();
		if (!v->c[0]) {
			// printf("find(%d) = %ld\n", u + 1, v - N + 1);
			return v;
		}
		while (v->c[0]) v = v->c[0];
		// printf("find(%d) = %ld\n", u + 1, v - N + 1);
		return v;
	}

	bool test(const int u, const int v) {
		return find(u) == find(v);
	}

	int queryMax(const int u, const int v) {
		N[u].evert();
		N[v].access();
		N[v].splay();
		assert(N[v].max >= E);
		return N[v].max - E;
	}
} lct;

struct Edge {
	int u, v, a, b;

	bool operator<(const Edge &other) const { return a < other.a; }
} E[MAXM];

int main() {
	int n, m;
	scanf("%d %d", &n, &m);

	for (int i = 0; i < m; i++) scanf("%d %d %d %d", &E[i].u, &E[i].v, &E[i].a, &E[i].b), E[i].u--, E[i].v--;
	std::sort(E, E + m);

	int ans = INT_MAX;
	for (int i = 0; i < m; i++) {
		Edge &e = E[i];
		if (e.u == e.v) continue;
		if (lct.test(e.u, e.v)) {
			// printf("[%d, %d, %d, %d] will lead to a circle!\n", e.u + 1, e.v + 1, e.a, e.b);
			int max = lct.queryMax(e.u, e.v);
			// printf("max = %d\n", max);
			if (E[max].b > e.b) {
				lct.cut(max);
				lct.link(e.u, e.v, i, e.b);
			}
		} else {
			// printf("Connecting [%d, %d, %d, %d] ...\n", e.u + 1, e.v + 1, e.a, e.b);
			lct.link(e.u, e.v, i, e.b);
		}

		if (lct.test(0, n - 1)) ans = std::min(ans, e.a + E[lct.queryMax(0, n - 1)].b);
	}

	printf("%d\n", ans == INT_MAX ? -1 : ans);

	return 0;
}
```
