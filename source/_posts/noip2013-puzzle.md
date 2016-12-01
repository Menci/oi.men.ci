title: 「NOIP2013」华容道 - BFS + SPFA
categories: OI
tags: 
  - NOIP
  - CodeVS
  - 搜索
  - 最短路
  - SPFA
  - BFS
permalink: noip2013-puzzle
date: 2016-11-13 17:00:00
---

1. 在一个 $ n \times m $ 棋盘上有 $ n\times m $ 个格子，其中有且只有一个格子是空白的，其余 $ n \times m - 1 $ 个格子上每个格子上有一个棋子，每个棋子的大小都是 $ 1 \times 1 $ 的；
2. 有些棋子是固定的，有些棋子则是可以移动的；
3. 任何与空白的格子相邻（有公共的边）的格子上的棋子都可以移动到空白格子上。游戏的目的是把某个指定位置可以活动的棋子移动到目标位置。

给定一个棋盘，游戏可以玩 $ q $ 次，当然，每次棋盘上固定的格子是不会变的，但是棋盘上空白的格子的初始位置、指定的可移动的棋子的初始位置和目标位置却可能不同。第 $ i $ 次玩的时候，空白的格子在第 $ EX_i $ 行第 $ EY_i $ 列，指定的可移动棋子的初始位置为第 $ SX_i $ 行第 $ SY_i $ 列，目标位置为第 $ TX_i $ 行第 $ TY_i $ 列。

假设小 B 每秒钟能进行一次移动棋子的操作，而其他操作的时间都可以忽略不计。请你告诉小 B 每一次游戏所需要的最少时间，或者告诉他不可能完成游戏。

<!-- more -->

### 链接
[CodeVS 1218](http://codevs.cn/problem/1218/)

### 题解
一次游戏可以分为两个过程 —— 将空白格子移动到目标棋子的周围，将空白格子和目标棋子一起移动。显然，第二个过程中，每一步都是先将空白格子和目标格子交换，再将空白格子移动到目标格子的另一个相邻位置，下一步继续交换。

预处理出 $ f(i, j, a, b) $ 表示当目标棋子在 $ (i, j) $，空白格子在它的 $ a $ 相邻方向上，（保持目标棋子不动）将空白格子移动到 $ b $ 相邻方向上，所需的最小代价。

对于一次游戏，首先枚举将空白格子移动到目标棋子的哪个方向上，之后循环进行以下两个操作：

1. 交换空白格子和目标棋子；
2. 将空白格子移动到目标棋子的另一个相邻方向上。

我们可以用 $ (i, j, k) $ 描述一个状态 —— 目标棋子在 $ (i, j) $ 上，空白格子在它的 $ k $ 相邻方向上。结合预处理出的 $ f(i, j, a, b) $，在状态图上求最短路即可。

注意起点与终点相同的特判。

### 代码
```c++
#include <cstdio>
#include <climits>
#include <algorithm>
#include <queue>

const int MAXN = 30;
const int MAXQ = 500;
const int di[] = { 1, 0, 0, -1 };
const int dj[] = { 0, 1, -1, 0 };

int n, m;

struct Node {
	bool invalid;
	int cost[4][4];
	int dist;    // BFS prepare
	struct {
		int dist;
		bool inq;
	} v[4];      // SPFA
} map[MAXN + 1][MAXN + 1];

struct Point {
	int i, j;

	Point() {}
	Point(int i, int j) : i(i), j(j) {}

	Point move(int x) {
		return Point(i + di[x], j + dj[x]);
	}

	Node *operator->() const {
		return &map[i][j];
	}

	bool valid() const {
		return i > 0 && j > 0 && i <= n && j <= m;
	}

	bool operator==(const Point &other) const {
		return i == other.i && j == other.j;
	}
};

struct Status {
	Point p;
	int d;

	Status(Point p, int d) : p(p), d(d) {}
};

inline int bfs(Point s, Point t, Point p) {
	for (int i = 1; i <= n; i++) {
		for (int j = 1; j <= m; j++) {
			map[i][j].dist = INT_MAX;
		}
	}

	std::queue<Point> q;
	s->dist = 0;
	q.push(s);

	while (!q.empty()) {
		Point v = q.front();
		q.pop();

		if (v == t) return v->dist;

		for (int i = 0; i < 4; i++) {
			Point u = v.move(i);

			if (u->invalid || u == p) continue;

			if (u->dist > v->dist + 1) {
				u->dist = v->dist + 1;
				q.push(u);
			}
		}
	}

	return INT_MAX;
}

inline void prepare() {
	for (int i = 1; i <= n; i++) {
		for (int j = 1; j <= m; j++) {
			if (map[i][j].invalid) continue;

			Point v(i, j);
			for (int s = 0; s < 4; s++) {
				Point ps = v.move(s);

				for (int t = s + 1; t < 4; t++) {
					Point pt = v.move(t);

					if (!ps.valid() || ps->invalid || !pt.valid() || pt->invalid) v->cost[s][t] = v->cost[t][s] = INT_MAX;
					else v->cost[s][t] = v->cost[t][s] = bfs(ps, pt, v);

#ifdef DBG
					printf("[%d, %d] %d => %d = %d\n", v.i, v.j, s, t, v->cost[s][t]);
#endif
				}
			}
		}
	}
}

inline int spfa(Status s, Point t) {
	for (int i = 1; i <= n; i++) {
		for (int j = 1; j <= m; j++) {
			for (int k = 0; k < 4; k++) {
				map[i][j].v[k].dist = INT_MAX;
				map[i][j].v[k].inq = false;
			}
		}
	}

	std::queue<Status> q;
	q.push(s);
	s.p->v[s.d].dist = 0;

	while (!q.empty()) {
		Status status = q.front();
		q.pop();

		Point &v = status.p;
		int &d = status.d;

		v->v[d].inq = false;

		// Move the empty block
		for (int i = 0; i < 4; i++) {
			if (i == d || v->cost[d][i] == INT_MAX) continue;

			if (v->v[i].dist > v->v[d].dist + v->cost[d][i]) {
				v->v[i].dist = v->v[d].dist + v->cost[d][i];
#ifdef DBG
				printf("[%d, %d]->v[%d]->dist = %d\n", v.i, v.j, i, v->v[i].dist);
#endif
				if (!v->v[i].inq) {
					v->v[i].inq = true;
					q.push(Status(v, i));
				}
			}
		}

		// Swap
		if (v->v[d].dist != INT_MAX) {
			Point u = v.move(d);
			int t = 3 - d;
			if (u->v[t].dist > v->v[d].dist + 1) {
				u->v[t].dist = v->v[d].dist + 1;
				if (!u->v[t].inq) {
					u->v[t].inq = true;
					q.push(Status(u, t));
				}
			}
		}
	}

	int res = INT_MAX;
	for (int i = 0; i < 4; i++) {
		res = std::min(res, t->v[i].dist);
	}

	return res;
}

int main() {
	int q;
	scanf("%d %d %d", &n, &m, &q);
	for (int i = 1; i <= n; i++) {
		for (int j = 1; j <= m; j++) {
			int x;
			scanf("%d", &x);
			map[i][j].invalid = (x == 0);
		}
	}

	prepare();

	while (q--) {
		Point empty, s, t;
		scanf("%d %d %d %d %d %d", &empty.i, &empty.j, &s.i, &s.j, &t.i, &t.j);

		if (s == t) {
			puts("0");
			continue;
		}

		int ans = INT_MAX;
		for (int i = 0; i < 4; i++) {
			Point v = s.move(i);
			if (!v.valid()) continue;

			int d1 = bfs(empty, v, s);
			if (d1 == INT_MAX) continue;

			int d2 = spfa(Status(s, i), t);
			if (d2 == INT_MAX) continue;

			ans = std::min(ans, d1 + d2);
		}

		printf("%d\n", ans == INT_MAX ? -1 : ans);
	}

	return 0;
}
```
