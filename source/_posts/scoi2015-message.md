title: 「SCOI2015」情报传递 - 离线 + Link-Cut Tree
categories: OI
tags: 
  - BZOJ
  - SCOI
  - 安师大附中集训
  - 离线
  - Link-Cut Tree
  - 数据结构
  - 高级数据结构
permalink: scoi2015-message
date: 2016-03-22 18:09:12
---

奈特公司有着庞大的情报网络。情报网络中共有 $ n $ 名情报员。每名情报员有若干名下线，除 1 名大头目外其余 $ n - 1 $ 名情报员有且仅有 1 名上线。每名情报员只能与自己的上、下线联系，同时，情报网络中任意两名情报员一定能够通过情报网络传递情报。
奈特公司每天会派发以下两种任务中的一个任务：

1. 搜集情报：指派 $ T $ 号情报员搜集情报；
2. 传递情报：将一条情报从 $ X $ 号情报员传递给 $ Y $ 号情报员。

情报员最初处于潜伏阶段，危险值为 0；一旦某个情报员开始搜集情报，他的危险值就会持续增加，每天增加 1 点危险值（开始搜集情报的当天危险值仍为 0，第 2 天危险值为 1，以此类推）。传递情报并不会使情报员的危险值增加。

为了保证传递情报的过程相对安全，每条情报都有一个风险控制值 $ C $。公司认为，传递这条情报的所有情报员中，危险值大于 $ C $ 的情报员将对该条情报构成威胁。现在，奈特公司希望知道，对于每个传递情报任务，参与传递的情报员有多少个，其中对该条情报构成威胁的情报员有多少个。

<!-- more -->

### 题目链接
[BZOJ 4448](http://www.lydsy.com/JudgeOnline/problem.php?id=4448)

### 解题思路
因为整个网络是一棵树，所以可以用一棵 Link-Cut Tree 来维护。

前 30 分，无修改操作，直接求出两点距离。

30 ~ 60 分，保证 $ C = 0 $，修改直接单点修改值为 1，查询直接查询有多少 1 即可。

后 40 分，考虑到对于每个查询操作，只有距离它 $ C + 1 $ 天之前的修改操作对它有贡献，所以可以将操作离线，保证每次修改后直接处理查询即可。

### AC代码
```c++
#include <cstdio>
#include <climits>
#include <queue>
#include <algorithm>

const int MAXN = 200000;
const int MAXM = 200000;

struct LinkCutTree {
	enum Relation {
		L = 0, R = 1
	};

	struct Node {
		Node *child[2], *parent, *pathParent;
		int value, sum, size;
		bool reversed;

		Node() : parent(NULL), pathParent(NULL), value(0), sum(0), size(1), reversed(false) {
			child[L] = child[R] = NULL;
		}

		void pushDown() {
			if (reversed) {
				std::swap(child[L], child[R]);
				if (child[L]) child[L]->reversed ^= 1;
				if (child[R]) child[R]->reversed ^= 1;
				reversed = false;
			}
		}

		void maintain() {
			sum = value, size = 1;
			if (child[L]) sum += child[L]->sum, size += child[L]->size;
			if (child[R]) sum += child[R]->sum, size += child[R]->size;
		}

		Relation relation() {
			return this == parent->child[L] ? L : R;
		}

		void rotate() {
			if (parent->parent) parent->parent->pushDown();
			parent->pushDown(), pushDown();
			std::swap(pathParent, parent->pathParent);

			Relation x = relation();
			Node *oldParent = parent;

			if (oldParent->parent) oldParent->parent->child[oldParent->relation()] = this;
			parent = oldParent->parent;

			if (child[x ^ 1]) child[x ^ 1]->parent = oldParent;
			oldParent->child[x] = child[x ^ 1];

			child[x ^ 1] = oldParent;
			oldParent->parent = this;

			oldParent->maintain(), maintain();
		}

		void splay() {
			while (parent != NULL) {
				if (parent->parent == NULL) rotate();
				else {
					parent->parent->pushDown(), parent->pushDown();
					if (parent->relation() == relation()) parent->rotate(), rotate();
					else rotate(), rotate();
				}
			}
			pushDown();
		}

		void expose() {
			splay();
			if (child[R]) {
				std::swap(child[R]->parent, child[R]->pathParent);
				child[R] = NULL;
				maintain();
			}
		}

		bool splice() {
			splay();
			if (!pathParent) return false;
			pathParent->expose();
			pathParent->child[R] = this;
			pathParent->maintain();
			std::swap(parent, pathParent);
			return true;
		}

		void access() {
			expose();
			while (splice());
		}

		void evert() {
			access();
			splay();
			reversed ^= 1;
		}
	} nodes[MAXN];

	void query(int u, int v, int &size, int &sum) {
		nodes[u - 1].evert();
		nodes[v - 1].access();
		nodes[v - 1].splay();
		size = nodes[v - 1].size;
		sum = nodes[v - 1].sum;
	}

	void update(int u, int value) {
		nodes[u - 1].splay();
		nodes[u - 1].value = value;
		nodes[u - 1].maintain();
	}

	void link(int u, int v) {
		nodes[v - 1].evert();
		nodes[v - 1].splay();
		nodes[v - 1].pathParent = &nodes[u - 1];
	}
} lct;

struct Day {
	int id;
	int task;
	int u, v, c;

	bool operator<(const Day &other) const {
		return c < other.c;
	}
} days[MAXM];

int n, m;

inline void bfs() {
	std::queue<Tree *> q;
	q.push(&nodes[0]);
	nodes[0].depth = 1;

	while (!q.empty()) {
		Tree *t = q.front();
		q.pop();

		for (Tree *c = t->firstChild; c; c = c->next) {
			c->depth = t->depth + 1;
			q.push(c);
		}
	}
}

inline void work() {
	for (int i = 0; i < m; i++) {
		if (days[i].task == 2) lct.update(days[i].u, 1);
		else {
			int size, sum;
			lct.query(days[i].u, days[i].v, size, sum);
			printf("%d %d\n", size, sum);
		}
	}
}

int main() {
	// freopen("message.in", "r", stdin);
	// freopen("message.out", "w", stdout);

	scanf("%d", &n);

	for (int i = 1; i <= n; i++) {
		int u;
		scanf("%d", &u);
		if (u != 0) lct.link(u, i);
	}

	scanf("%d", &m);
	bool flag1 = true, flag2 = true;
	for (int i = 0; i < m; i++) {
		days[i].id = i;
		scanf("%d", &days[i].task);
		if (days[i].task == 2) scanf("%d", &days[i].u), days[i].c = i;
		else {
			int tmp;
			scanf("%d %d %d", &days[i].u, &days[i].v, &tmp);
			days[i].c = i - tmp;
		}
	}

	std::sort(days, days + m);

	work();
	
	fclose(stdin);
	fclose(stdout);

	return 0;
}
```
