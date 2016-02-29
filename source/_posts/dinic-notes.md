title: Dinic 学习笔记
categories: OI
tags: 
  - 学习笔记
  - 图论
  - 网络流
  - Dinic
permalink: dinic-notes
id: 40
updated: '2016-02-19 17:22:35'
date: 2016-02-03 18:57:59
---

Dinic 算法是一种对于网络流问题的增广路算法，它通过对残量网络进行分层，并在层次图上寻找增广路的方式，实现了在$ O(n^2m) $的时间内求出网络的最大流。

<!-- more -->

### 定义
* 容量：`capacity(e)` 表示一条有向边 `e(u, v)` 的最大允许的流量。

* 流量：`flow(e)` 表示一条有向边 `e(u, v)` 总容量中已被占用的流量。

* 剩余容量：即 `capacity(e) - flow(e)`，表示当前时刻某条有向边 `e(u, v)` 总流量中未被占用的部分。

* 反向边：原图中每一条有向边在残量网络中都有对应的反向边，反向边的容量为 0，容量的变化与原边相反；『反向边』的概念是相对的，即一条边的反向边的反向边是它本身。

* 残量网络：在原图的基础之上，添加每条边对应的反向边，并储存每条边的当前流量。残量网络会在算法进行的过程中被修改。

* 增广路（augmenting path）：残量网络中从源点到汇点的一条路径，增广路上所有边中最小的剩余流量为**增广流量**。

* 增广（augmenting）：在残量网络中寻找一条增广路，并将增广路上所有边的流量加上**增广流量**的过程。

* 层次： `level(u)` 表示节点 `u` 在层次图中与源点的距离。

* 层次图：在原残量网络中按照每个节点的层次来分层，只保留**相邻两层**的节点的图，**满载（即流量等于容量）的边不存在于层次图中**。

### 算法
1. 遍历残量网络，建立层次图；
2. 在层次图上寻找任意一条增广路，进行增广，并将答案加上增广流量；
3. 重复 `(2)`，直至层次图中不存在增广路，回到 `(1)` 重新建立层次图；
4. 直到层次图无法建立，则当前流量即为最大流量。

每次建立层次图后都可以进行多次增广，无法增广时重新建立层次图，此时的层次图不再包含之前进行增广后满载的边。无法建立层次图时，说明源点到汇点的任意一条简单路径中，都至少有一条边满载，这也在直观上验证了最小割最大流定理。

### 优化
Dinic 有一个常见的优化——当前弧优化。

该优化基于一个显而易见的事实，每次建立层次图后，如果在某一次增广前，某个点有一条边增广过了，则这条边在当前的层次图中不会再用到了，即下一次 DFS 这个点的时候直接可以从这条边的下一条边开始。

### 代码实现
```c++
struct Node {
	struct Edge *firstEdge, *currentEdge;
	int level;
} nodes[MAXN];

struct Edge {
	Node *from, *to;
	int capacity, flow;
	Edge *next, *reversedEdge;

	Edge(Node *from, Node *to, int capacity) : from(from), to(to), capacity(capacity), next(from->firstEdge), flow(0) {}
};

struct Dinic {
	bool makeLevelGraph(Node *s, Node *t, int n) {
		for (int i = 0; i < n; i++) nodes[i].level = 0, nodes[i].currentEdge = nodes[i].firstEdge;

		std::queue<Node *> q;
		q.push(s);
		s->level = 1;

		while (!q.empty()) {
			Node *v = q.front();
			q.pop();

			for (Edge *e = v->firstEdge; e; e = e->next) {
				if (e->flow < e->capacity && e->to->level == 0) {
					e->to->level = v->level + 1;
					if (e->to == t) return true;
					else q.push(e->to);
				}
			}
		}

		return false;
	}

	int findPath(Node *s, Node *t, int limit = INT_MAX) {
		if (s == t) return limit;

		for (Edge *&e = s->currentEdge; e; e = e->next) {
			if (e->flow < e->capacity && e->to->level == s->level + 1) {
				int flow = findPath(e->to, t, std::min(limit, e->capacity - e->flow));
				if (flow > 0) {
					e->flow += flow;
					e->reversedEdge->flow -= flow;
					return flow;
				}
			}
		}

		return 0;
	}

	int operator()(int s, int t, int n) {
		int ans = 0;
		while (makeLevelGraph(&nodes[s], &nodes[t], n)) {
			int flow;
			while ((flow = findPath(&nodes[s], &nodes[t])) > 0) ans += flow;
		}

		return ans;
	}
} dinic;

inline void addEdge(int from, int to, int capacity) {
	nodes[from].firstEdge = new Edge(&nodes[from], &nodes[to], capacity);
	nodes[to].firstEdge = new Edge(&nodes[to], &nodes[from], 0);

	nodes[from].firstEdge->reversedEdge = nodes[to].firstEdge, nodes[to].firstEdge->reversedEdge = nodes[from].firstEdge;
}
```
