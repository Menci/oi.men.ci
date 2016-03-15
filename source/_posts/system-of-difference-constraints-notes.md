title: 差分约束系统学习笔记
categories: OI
tags: 
  - 图论
  - 学习笔记
  - 差分约束系统
  - 最短路
  - 算法模板
permalink: system-of-difference-constraints-notes
date: 2016-01-02 00:18:34
---

差分约束系统，就是给出一组形如 $x_i-x_j>=d$ 的不等式，求出这组不等式的一组解。这类问题通常转化为图论中的最短路来解。

<!-- more -->

### 原理
在图论中，求解单源最短路的算法在进行每一次每条边上的“松弛”操作时，都是根据以下条件：

（其中 `from`、`to` 表示边的起点、终点，`$` 表示某个点到源点的当前距离）

```php
if ($to > $from + w) {
    $to = $from + w;
}
```

也就是说，每一次松弛操作保证了：

```php
$to - $from >= w
```

于是，我们可以把差分约束系统中的变量看做图中的**点**，把不等关系看做**边**，然后对整个图进行一次单源最短路算法，即可使所有不等式满足。

如果图中存在**权值和为负**的环，则说明不等式组无解。

### 实现
对于每一个不等式 $x_i-x_j>=d$，从 `j` 向 `i` 连一条边，权值为 `d`。

如果不等号的方向相反，即 $x_i-x_j>=d$，则应在不等式两边同时乘以 `-1`，变成 $x_j-x_i<=-d$，即从 `i` 到 `j` 连一条边，权值为 `-d`。

算法初始化时，将源点的 `dist` 置为 `0`，其他的点 `dist` 置为无穷大。若有解，则算法结束后每个点的 `dist` 值即为解。

如果图中有负边，则必须使用 Bellman-Ford 算法，如果 Bellman-Ford 算法在 `n - 1` 次松弛后还继续进行松弛，则说明图中有**权值和为负**的环，原不等式组无解。

如果使用带有队列优化的 Bellman-Ford 算法，则每个点入队次数超过 `n` 时说明图中有**权值和为负**的环，原不等式组无解。

### 例题
[CodeVS 4416](http://codevs.cn/problem/4416/) - FFF 团卧底的后宫

给出 `n` 个形如 $x_i-x_j<=d$ 或 $x_i-x_j>=d$ 的不等式，求一组使 $x_1$ 与 $x_n$ 差最大的解，输出最大差值，若无解输出 `-1`，若 $x_1$ 与 $x_n$ 的差为无限大则输出 `-2`。

```C++
#include <cstdio>
#include <climits>
#include <algorithm>
#include <queue>

const int MAXN = 1000;
const int MAXM = 10000;

struct Edge;
struct Node;

struct Node {
	Edge *edges;
	bool inQueue;
	int dist;
	int count;
} nodes[MAXN];

struct Edge {
	Node *from, *to;
	int w;
	Edge *next;

	Edge(Node *from, Node *to, int w) : from(from), to(to), w(w), next(from->edges) {}
};

int n, m, k;

inline void addEdge(int from, int to, int w) {
	nodes[from].edges = new Edge(&nodes[from], &nodes[to], w);
}

inline bool bellmanFord() {
	std::queue<Node *> q;

	q.push(&nodes[0]);
	while (!q.empty()) {
		Node *node = q.front();
		q.pop();
		node->inQueue = false;

		for (Edge *edge = node->edges; edge; edge = edge->next) {
			if (edge->to->dist > node->dist + edge->w) {
				edge->to->dist = node->dist + edge->w;

				if (!edge->to->inQueue) {
					edge->to->inQueue = true;
					edge->to->count++;
					q.push(edge->to);

					if (edge->to->count > n) {
						return false;
					}
				}
			}
		}
	}

	return true;
}

int main() {
	scanf("%d %d %d", &n, &m, &k);

	for (int i = 0; i < n; i++) {
		nodes[i].dist = INT_MAX;
	}

	nodes[0].dist = 0;

	for (int i = 0; i < m; i++) {
		int a, b, d;
		scanf("%d %d %d", &a, &b, &d);
		a--, b--;

		addEdge(a, b, d);
		// $b - $a <= d
		// $a + d >= $b
	}

	for (int i = 0; i < k; i++) {
		int a, b, d;
		scanf("%d %d %d", &a, &b, &d);
		a--, b--;

		addEdge(b, a, -d);
		// $b - $a >= d
		// $a - $b <= -d
		// $b + -d >= $a
	}

	if (!bellmanFord()) {
		puts("-1");
	} else {
		if (nodes[n - 1].dist == INT_MAX) {
			puts("-2");
		} else {
			printf("%d\n", nodes[n - 1].dist);
		}
	}

	return 0;
}
```
