title: 「COGS 746」骑士共存 - 二分图最大独立集
categories: OI
tags: 
  - COGS
  - 图论
  - 网络流
  - Dinic
  - 网络流24题
  - 最大独立集
permalink: cogs-746
id: 53
updated: '2016-02-19 11:44:48'
date: 2016-02-19 11:43:42
---

在一个 $ N * N $ 个方格的国际象棋棋盘上，马（骑士）可以攻击的棋盘方格如图所示。棋盘上某些方格设置了障碍，骑士不得进入。问最多可以在棋盘上放多少个其实。

<!-- more -->

### 题目链接
[COGS 746](http://cogs.top/cogs/problem/problem.php?pid=746)

### 解题思路
在题图中可以发现，每个马可以攻击的格子都在与自身颜色不同的格子上，即整个棋盘可以建立为二分图，并使能互相攻击到的格子位于不同的两列。

> 根据定理，二分图最大独立集即为最小点覆盖集的补集，而最小点覆盖集可以用最小割模型来求解。

> 建立源点 S 和汇点 T，对于二分图中每个 X 点集中的点，从 S 向其连一条边，容量为点权；对于每个 Y 点集中的点，从该点向汇点连一条边，容量为点权；对于原图中的每条边，转化为从 X 点集的点连接到 Y 点集中的点的边，容量为无穷大。求出最小割，则该最小割为简单割，即任意一条割边不可能是中间那条无穷大的边，而这些割边恰好不重复的覆盖了整个二分图中的所有点，并且权值和最小。

> ——摘自《「COGS 734」方格取数 - 二分图最大独立集》

### AC代码
<!-- c++ -->
```
#include <cstdio>
#include <climits>
#include <algorithm>
#include <queue>

const int MAXN = 200;
const int MAXM = MAXN * MAXN;

struct Point {
	int x, y;

	Point(int x, int y) : x(x), y(y) {}

	Point operator+(const Point &pt) const {
		return Point(x + pt.x, y + pt.y);
	}
};

const Point turns[8] = {
	Point(1, 2),
	Point(2, 1),
	Point(-1, -2),
	Point(-2, -1),
	Point(1, -2),
	Point(-2, 1),
	Point(-1, 2),
	Point(2, -1)
};

struct Node;
struct Edge;

struct Node {
	Edge *firstEdge, *currentEdge;
	int level;
} nodes[MAXN * MAXN + 2];

struct Edge {
	Node *from, *to;
	int capacity, flow;
	Edge *next, *reversedEdge;

	Edge(Node *from, Node *to, int capacity) : from(from), to(to), capacity(capacity), flow(0), next(from->firstEdge) {}
};

int n, m;
bool blocked[MAXN][MAXN];

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

inline int getNodeID(int x, int y) {
	return y * n + x + 1;
}

int main() {
	freopen("knight.in", "r", stdin);
	freopen("knight.out", "w", stdout);

	scanf("%d %d", &n, &m);

	for (int i = 0; i < m; i++) {
		int x, y;
		scanf("%d %d", &x, &y), x--, y--;

		blocked[x][y] = true;
	}

	const int s = 0, t = n * n + 1;

	int sum = 0;
	for (int i = 0; i < n; i++) {
		for (int j = 0; j < n; j++) {
			if (blocked[i][j]) continue;

			sum++;

			int id = getNodeID(i, j);

			if ((i + j) % 2 == 0) {
				//printf("S => (%d, %d)\n", i + 1, j + 1);
				addEdge(s, id, 1);
				for (int k = 0; k < 8; k++) {
					Point pt = Point(i, j) + turns[k];
					if (pt.x < 0 || pt.x > n - 1 || pt.y < 0 || pt.y > n - 1 || blocked[pt.x][pt.y]) continue;

					//printf("(%d, %d) => (%d, %d)\n", i + 1, j + 1, pt.x + 1, pt.y + 1);
					addEdge(id, getNodeID(pt.x, pt.y), INT_MAX);
				}
			} else addEdge(id, t, 1);//, printf("(%d, %d) => T\n", i + 1, j + 1);
		}
	}

	int maxFlow = dinic(s, t, n * n + 2);
	printf("%d\n", sum - maxFlow);

	fclose(stdin);
	fclose(stdout);

	return 0;
}
```