title: '最小生成树 && 次小生成树'
categories: OI
tags: 
  - Kruskal
  - POJ
  - Prim
  - 倍增
  - 图论
  - 学习笔记
  - 并查集
  - 最小生成树
permalink: minimum-spanning-tree-notes
id: 13
updated: '2016-02-22 00:55:03'
date: 2016-01-02 06:08:50
---

最近回顾了一下图论中的最小生成树算法，又学习了神奇（个卵）的“次小生成树”的算法。

总体来说，图论里面的东西还是挺灵活的嘛 ~

<!-- more -->

### 最小生成树

#### Kruskal 算法
对所有边进行排序，用**并查集**维护连通性，从小到大枚举边，判断当前边的起止点是否在同一连通块中，若不是，则加入这条边，否则放弃这条边。

图结构需要以边集数组储存。

时间复杂度为 $O(m{\log}m)$（其中 `m` 为边数）。

据说适用于稀疏图。

```c++
struct UndirectedEdge {
	int u, v, w;

	UndirectedEdge() {}
	UndirectedEdge(int u, int v, int w) : u(u), v(v), w(w) {}

	bool operator<(const UndirectedEdge &other) const {
		return w < other.w;
	}
} edges[MAXM];

struct UnionFindSet {
	int f[MAXN];

	UnionFindSet(int n) {
		for (int i = 0; i < n; i++) {
			f[i] = i;
		}
	}

	int find(int x) {
		return f[x] == x ? x : f[x] = find(f[x]);
	}

	void merge(int x, int y) {
		f[find(x)] = find(y);
	}
};

inline int kruskal() {
	int sum = 0, count = 0;
	UnionFindSet ufs(n);
	std::sort(edges, edges + m);

	for (int i = 0; i < m; i++) {
		if (ufs.find(edges[i].u) != ufs.find(edges[i].v)) {
			ufs.merge(edges[i].u, edges[i].v);
			sum += edges[i].w;
			count++;

			if (count == n - 1) {
				break;
			}
		}
	}

	return sum;
}
```

#### Prim 算法
Prim 算法相对于 Kruskal 算法而言有一定难度，它把所有的点分为两个集合：在最小生成树中和不在最小生成树中，每次找到一条连接两个集合的**权值最小**的边，将它添加到最小生成树中。

对于 Prim 算法，可以考虑类似于 Dijkstra 单源最短路算法的堆优化，即设置一个优先队列，初始时将从源点（可任取）出发的边加进优先队列中，每次从优先队列中不断弹出权值最小的边，直至得到一条边连接两个集合，则将这条边添加到最小生成树中，然后将这条边的出点的所有出边加入优先队列中。

图结构需要以邻接表储存。

使用优先队列的时间复杂度为 $O(m{\log}n)$（其中 `n` 为结点数，`m` 为边数）。  
不使用任何优化的时间复杂度为 $O(n^2)$（其中 `n` 为结点数）。

据说适用于稠密图。

```C++
struct Node {
	Edge *edges;
	bool visited;
} nodes[MAXN];

struct Edge {
	Node *from, *to;
	int w;
	Edge *next;
	bool used;

	Edge(Node *from, Node *to, int w) : from(from), to(to), w(w), next(from->edges), used(false) {}

	struct Compare {
		bool operator()(Edge *a, Edge *b) const {
			return a->w > b->w;
		}
	};
};

inline void addEdge(int u, int v, int w) {
	nodes[u].edges = new Edge(&nodes[u], &nodes[v], w);
	nodes[v].edges = new Edge(&nodes[v], &nodes[u], w);
}

inline int prim() {
	std::priority_queue<Edge *, vector<Edge *>, Edge::Compare> q;
	int sum = 0;
	Node *node = &nodes[0];
	node->visited = true;
	for (Edge *edge = node->edges; edge; edge = edge->next) {
		q.push(edge);
	}

	int count = 0;
	while (!q.empty()) {
		Edge *minEdge = q.top();
		q.pop();
		if (minEdge->to->visited) {
			continue;
		}

		sum += minEdge->w;
		minEdge->used = true;
		minEdge->to->visited = true;
		count++;

		if (count == n - 1) {
			break;
		}

		for (Edge *edge = minEdge->to->edges; edge; edge = edge->next) {
			if (!edge->to->visited) {
				q.push(edge);
			}
		}
	}

	return sum;
}
```

### 次小生成树
一个图的次小生成树，是指**异于该图的最小生成树**的**边权和最小**的生成树。

注意，这里的次小生成树是**非严格**次小，即可能存在一个图，其最小生成树与次小生成树的边权和相等。

#### 算法
不难得出，次小生成树可以由最小生成树更换一条边得到。

首先构造原图的最小生成树，然后枚举每一条**不在最小生成树中**的边 `(u, v, w)`，尝试将这条边加入生成树，因为直接加入边会产生环，所以我们需要在加边之前删去最小生成树上 `u` 到 `v` 的路径上**权值最大**的边。在枚举每一条边时我们都会得到一棵生成树，这些生成树中边权和最小的即为要求的次小生成树。

需要在构造最小生成树时将完整的树结构构造出来，并且使用树上倍增算法查询两点间边权值最大的值。

#### 代码（POJ 1679）
题目链接：[POJ 1679](http://poj.org/problem?id=1679)

题目要求判断最小生成树的唯一性。求出该图的非严格次小生成树，与最小生成树的权值和作比较即可。

```C++
#include <cstdio>
#include <cstring>
#include <climits>
#include <algorithm>
#include <queue>

const int MAXT = 20;
const int MAXN = 100;
const int MAXM = MAXN * (MAXN - 1) / 2;
const int MAXLOGN = 7;

struct UndirectedEdge {
	int u, v, w;
	bool used;

	UndirectedEdge() {}
	UndirectedEdge(int u, int v, int w) : u(u), v(v), w(w), used(false) {}

	bool operator<(const UndirectedEdge &other) const {
		return w < other.w;
	}
} edges[MAXM];

struct UnionFindSet {
	int f[MAXN];

	UnionFindSet(int n) {
		for (int i = 0; i < n; i++) {
			f[i] = i;
		}
	}

	int find(int x) {
		return f[x] == x ? x : f[x] = find(f[x]);
	}

	void merge(int x, int y) {
		f[find(x)] = find(y);
	}
};

struct Edge;
struct Node;

struct Node {
	Edge *edges;
	int id;
	int depth;
} nodes[MAXN];

struct Edge {
	Node *from, *to;
	Edge *next;
	int w;

	Edge(Node *from, Node *to, int w) : from(from), to(to), w(w), next(from->edges) {}
};

struct SparseTable {
	Node *target;
	int max;
} f[MAXN][MAXLOGN + 1];

int t, n, m, logn;

inline void addEdge(int u, int v, int w) {
	nodes[u].edges = new Edge(&nodes[u], &nodes[v], w);
	nodes[v].edges = new Edge(&nodes[v], &nodes[u], w);
}

inline int kruskal() {
	int sum = 0, count = 0;
	UnionFindSet ufs(n);
	std::sort(edges, edges + m);

	for (int i = 0; i < m; i++) {
		if (ufs.find(edges[i].u) != ufs.find(edges[i].v)) {
			ufs.merge(edges[i].u, edges[i].v);
			sum += edges[i].w;
			count++;
			edges[i].used = true;
			addEdge(edges[i].u, edges[i].v, edges[i].w);

			if (count == n - 1) {
				break;
			}
		}
	}

	return sum;
}

inline int log(int x) {
	int i = 0;
	while ((1 << i) <= x) {
		i++;
	}

	return i;
}

inline void makeST() {
	for (int i = 0; i < n; i++) {
		nodes[i].id = i;
	}

	f[0][0].target = &nodes[0];
	f[0][0].max = 0;

	nodes[0].depth = 1;
	std::queue<Node *> q;
	q.push(&nodes[0]);

	while (!q.empty()) {
		Node *node = q.front();
		q.pop();

		for (Edge *edge = node->edges; edge; edge = edge->next) {
			if (edge->to->depth == 0) {
				edge->to->depth = node->depth + 1;
				q.push(edge->to);
				f[edge->to->id][0].target = node;
				f[edge->to->id][0].max = edge->w;
			}
		}
	}

	for (int j = 1; j <= logn; j++) {
		for (int i = 0; i < n; i++) {
			f[i][j].target = f[f[i][j - 1].target->id][j - 1].target;
			f[i][j].max = std::max(f[i][j - 1].max, f[f[i][j - 1].target->id][j - 1].max);
		}
	}
}

inline int queryMax(int u, int v) {
	Node *a = &nodes[u], *b = &nodes[v];

	if (a->depth < b->depth) {
		std::swap(a, b);
	}

	int max = 0;

	if (a->depth != b->depth) {
		for (int i = logn; i >= 0; i--) {
			if (f[a->id][i].target->depth >= b->depth) {
				max = std::max(max, f[a->id][i].max);
				a = f[a->id][i].target;
			}
		}
	}

	if (a != b) {
		for (int i = logn; i >= 0; i--) {
			if (f[a->id][i].target != f[b->id][i].target) {
				max = std::max(max, f[a->id][i].max);
				max = std::max(max, f[b->id][i].max);
				a = f[a->id][i].target;
				b = f[b->id][i].target;
			}
		}

		max = std::max(max, f[a->id][0].max);
		max = std::max(max, f[b->id][0].max);
	}

	return max;
}

int main() {
	scanf("%d", &t);

	while (~scanf("%d %d", &n, &m)) {
		logn = log(n);
		memset(edges, 0, sizeof(edges));
		memset(nodes, 0, sizeof(nodes));
		memset(f, 0, sizeof(f));

		for (int i = 0; i < m; i++) {
			int u, v, w;
			scanf("%d %d %d", &u, &v, &w);
			u--, v--;

			edges[i] = UndirectedEdge(u, v, w);
		}

		int sum = kruskal();
		makeST();

		int ans = int_MAX;
		for (int i = 0; i < m; i++) {
			if (!edges[i].used) {
				ans = std::min(ans, sum - queryMax(edges[i].u, edges[i].v) + edges[i].w);
			}
		}

		if (sum == ans) {
			puts("Not Unique!");
		} else {
			printf("%d\n", sum);
		}
	}

	return 0;
}
```