title: 「AHOI2008」紧急集合 - LCA
categories: OI
tags: 
  - BZOJ
  - AHOI
  - LCA
  - 乱搞
  - 倍增
permalink: ahoi2008-meet
date: 2016-03-07 20:36:46
---

在树上寻找一个点，使其到给定三点的距离之和最小。

<!-- more -->

### 题目链接
[BZOJ 1787](http://www.lydsy.com/JudgeOnline/problem.php?id=1787)

### 解题思路
从样例中找出规律，三个点两两之间的 LCA 必有一对相等，写了个数据生成器用大数据验证了一下，确实是成立的。

进一步得到规律，要找的点就是除了相等的一对 LCA 以外的另一个 LCA …… 别问我怎么证明，我不会 qwq

### AC代码
```c++
#include <cstdio>
#include <climits>
#include <cassert>
#include <algorithm>
#include <queue>

const int MAXN = 500000;
const int MAXLOGN = 19; // log(500000, 2) = 18.931568569324174
const int MAXM = 500000;

struct Node;
struct Edge;

struct Node {
	Edge *firstEdge;
	int id, depth;
	
	struct SparseTable {
		int dist;
		Node *v;
	} st[MAXLOGN + 1];
} nodes[MAXN];

struct Edge {
	Node *from, *to;
	Edge *next;

	Edge(Node *from, Node *to) : from(from), to(to), next(from->firstEdge) {}
};

int n, m;

inline void addEdge(int u, int v) {
	nodes[u].firstEdge = new Edge(&nodes[u], &nodes[v]);
	nodes[v].firstEdge = new Edge(&nodes[v], &nodes[u]);
}

inline void makeSparseTable() {
	std::queue<Node *> q;
	q.push(&nodes[0]);
	nodes[0].depth = 1;

	while (!q.empty()) {
		Node *v = q.front();
		q.pop();


		for (Edge *e = v->firstEdge; e; e = e->next) {
			if (e->to->depth == 0) {
				e->to->depth = v->depth + 1;

				e->to->st[0].v = v;
				e->to->st[0].dist = 1;

				q.push(e->to);
			}
		}
	}

	nodes[0].st[0].v = &nodes[0];
	nodes[0].st[0].dist = 0;

	for (int j = 1; (1 << j) <= n; j++) {
		for (int i = 0; i < n; i++) {
			nodes[i].st[j].v = nodes[i].st[j - 1].v->st[j - 1].v;
			nodes[i].st[j].dist = nodes[i].st[j - 1].dist + nodes[i].st[j - 1].v->st[j - 1].dist;
		}
	}
}

inline int query(const int a, const int b, Node **lca = NULL) {
	Node *u = &nodes[a], *v = &nodes[b];
	int dist = 0;

	if (u->depth < v->depth) {
		std::swap(u, v);
	}

	if (u->depth != v->depth) {
		for (int i = MAXLOGN; i >= 0; i--) {
			if (u->st[i].v != NULL && u->st[i].v->depth >= v->depth) {
				dist += u->st[i].dist;
				u = u->st[i].v;
			}
		}
	}

	if (u != v) {
		for (int i = MAXLOGN; i >= 0; i--) {
			if (u->st[i].v != v->st[i].v) {
				dist += u->st[i].dist + v->st[i].dist;
				u = u->st[i].v;
				v = v->st[i].v;
			}
		}

		dist += u->st[0].dist + v->st[0].dist;
		
		if (lca) *lca = u->st[0].v;
		return dist;
	}

	if (lca) *lca = u;
	return dist;
}

inline int solve(int a, int b, int c) {
	Node *ab, *bc, *ca;
	int distAB, distBC, distCA;

	query(a, b, &ab);
	query(b, c, &bc);
	query(c, a, &ca);

	// printf("%d, %d, %d\n", ab->id, bc->id, ca->id);

	Node *v;
	if (ab == bc) {
		v = ca;
	} else if (bc == ca) {
		v = ab;
	} else if (ca == ab) {
		v = bc;
	}

	assert(v != NULL);
	return v->id;
}

int main() {
	scanf("%d %d", &n, &m);

	for (int i = 0; i < n; i++) nodes[i].id = i + 1;

	for (int i = 0; i < n - 1; i++) {
		int u, v;
		scanf("%d %d", &u, &v), u--, v--;
		
		addEdge(u, v);
	}

	makeSparseTable();

	for (int i = 0; i < m; i++) {
		int a, b, c;
		scanf("%d %d %d", &a, &b, &c), a--, b--, c--;

		int id = solve(a, b, c);
		int dist = query(a, id - 1) + query(b, id - 1) + query(c, id - 1);

		printf("%d %d\n", id, dist);
	}

	return 0;
}
```

### 数据生成器
```c++
#include <cstdio>
#include <cstdlib>
#include <ctime>
#include <algorithm>

const int MAXN = 500000;
const int MAXM = 500000;

struct UnionFindSet {
	int a[MAXN];

	void init(int n) {
		for (int i = 0; i < n; i++) a[i] = i;
	}

	int find(int x) {
		return a[x] == x ? x : a[x] = find(a[x]);
	}

	void merge(int x, int y) {
		a[find(x)] = find(y);
	}
};

inline int rand(int l, int r) {
	const int MAGIC_NUMBER = 20000528;
	int x = rand();
	srand((time(NULL) << 16) | ((clock() << 16) >> 16) ^ x ^ MAGIC_NUMBER);
	return (rand() ^ x) % (r - l + 1) + l;
}

int main() {
	int n = MAXN, m = MAXM;

	static UnionFindSet ufs;
	ufs.init(n);

	printf("%d %d\n", n, m);

	for (int i = 0; i < n - 1; ) {
		int u, v;
		u = rand(1, n), v = rand(1, n);

		if (ufs.find(u - 1) != ufs.find(v - 1)) {
			ufs.merge(u - 1, v - 1);
			printf("%d %d\n", u, v);
			i++;
		}
	}

	for (int i = 0; i < m; i++) {
		int a, b, c;
		a = rand(1, n), b = rand(1, n), c = rand(1, n);

		printf("%d %d %d\n", a, b, c);
	}

	return 0;
}
```
