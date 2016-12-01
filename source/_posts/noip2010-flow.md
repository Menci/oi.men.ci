title: 「NOIP2010」引水入城 - BFS + DP
categories: OI
tags: 
  - NOIP
  - CodeVS
  - BFS
  - DP
  - 线性 DP
permalink: noip2010-flow
date: 2016-11-13 17:23:00
---

在一个遥远的国度，一侧是风景秀美的湖泊，另一侧则是漫无边际的沙漠。该国的行政区划十分特殊，刚好构成一个 $ N $ 行 $ M $ 列的矩形，如上图所示，其中每个格子都代表一座城市，每座城市都有一个海拔高度。

为了使居民们都尽可能饮用到清澈的湖水，现在要在某些城市建造水利设施。水利设施有两种，分别为蓄水厂和输水站。蓄水厂的功能是利用水泵将湖泊中的水抽取到所在城市的蓄水池中。因此，只有与湖泊毗邻的第 $ 1 $ 行的城市可以建造蓄水厂。而输水站的功能则是通过输水管线利用高度落差，将湖水从高处向低处输送。故一座城市能建造输水站的前提，是存在比它海拔更高且拥有公共边的相邻城市，已经建有水利设施。

由于第 $ N $ 行的城市靠近沙漠，是该国的干旱区，所以要求其中的每座城市都建有水利设施。那么，这个要求能否满足呢？如果能，请计算最少建造几个蓄水厂；如果不能，求干旱区中不可能建有水利设施的城市数目。

<!-- more -->

### 链接
[CodeVS 1066](http://codevs.cn/problem/1066/)

### 题解
对于第一问，以第一行为起点，做 Floodfill，如果最后一行均能访问到，则能满足。

对于第二问，分别以第一行每个点为起点，做 Floodfill，得到它能到达的最后一行的所有点，这些点一定构成了一个连续的区间（证明略）。得到 $ m $ 个区间，问题转化为选择尽量少的区间，覆盖整个区域 —— 排序后 DP 即可。

### 代码
```c++
#include <cstdio>
#include <climits>
#include <algorithm>
#include <vector>
#include <queue>

const int MAXN = 500;

const int di[] = { 0, 1, 0, -1 };
const int dj[] = { -1, 0, 1, 0 };

struct Node {
	int height;
	bool visited;
} map[MAXN + 2][MAXN + 2];

int n, m;

struct Point {
	int i, j;
	
	Point(int i = 0, int j = 0) : i(i), j(j) {}

	Point move(int x) {
		return Point(i + di[x], j + dj[x]);
	}

	bool valid() {
		return i > 0 && j > 0 && i <= n && j <= m;
	}

	Node *operator->() const {
		return &map[i][j];
	}
};

struct Interval {
	int l, r;

	Interval(int l = 0, int r = 0) : l(l), r(r) {}

	bool operator<(const Interval &other) const {
		return (l == other.l) ? (r < other.r) : (l < other.l);
	}
};

inline int bfs(Point start, Interval &interval) {
	for (int i = 1; i <= n; i++) for (int j = 1; j <= m; j++) map[i][j].visited = false;

	std::queue<Point> q;
	if (start.i == 0 && start.j == 0) {
		for (int i = 1; i <= m; i++) {
			map[1][i].visited = true;
			q.push(Point(1, i));
		}
	} else {
		q.push(start);
		start->visited = true;
	}

	while (!q.empty()) {
		Point v = q.front();
		q.pop();

		for (int i = 0; i < 4; i++) {
			Point u = v.move(i);
			if (!u.valid()) continue;

			if (u->height < v->height && !u->visited) {
				u->visited = true;
				q.push(u);
			}
		}
	}

	if (start.i == 0 && start.j == 0) {
		int cnt = 0;
		for (int i = 1; i <= m; i++) if (!map[n][i].visited) cnt++;
		return cnt;
	}

	bool flag = false;
#ifdef DBG
	printf("%d:", start.j);
#endif
	for (int i = 1; i <= m + 1; i++) {
#ifdef DBG
		if (map[n][i].visited) {
			printf(" %d", i);
		}
#endif
		if (!flag && map[n][i].visited) {
			interval.l = i;
			flag = true;
		} else if (flag && !map[n][i].visited) {
			interval.r = i - 1;
			break;
		}
	}

#ifdef DBG
	printf(" = [%d, %d]\n", interval.l, interval.r);
#endif

	return flag;
}

int main() {
	scanf("%d %d", &n, &m);
	for (int i = 1; i <= n; i++) for (int j = 1; j <= m; j++) scanf("%d", &map[i][j].height);

	Interval tmp;
	int cnt = bfs(Point(0, 0), tmp);

	if (cnt) {
		printf("0\n%d\n", cnt);
	} else {
		static Interval a[MAXN + 1];
		int k  = 0;
		for (int i = 1; i <= m; i++) {
			Interval interval;
			if (bfs(Point(1, i), interval)) {
				a[++k] = interval;
			}
		}

		std::sort(a + 1, a + k+ 1);

		static int f[MAXN + 1];
		int ans = INT_MAX;
		for (int i = 1; i <= k; i++) {
			f[i] = INT_MAX;
			for (int j = 0; j < i; j++) {
				if (a[j].r >= a[i].l - 1) {
					f[i] = std::min(f[i], f[j] + 1);
				}
			}
			if (a[i].r == m) ans = std::min(ans, f[i]);
		}

		printf("1\n%d\n", ans);
	}

	return 0;
}
```