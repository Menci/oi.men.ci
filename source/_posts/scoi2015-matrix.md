title: 「SCOI2015」小凸玩矩阵 - 二分图匹配
categories: OI
tags: 
  - BZOJ
  - SCOI
  - 安徽集训
  - 二分答案
  - 二分图匹配
  - 网络流
  - Dinic
permalink: scoi2015-matrix
date: 2016-03-22 17:56:34
---

小方给小凸一个 $ N * M $（$ N \leq M $）的矩阵 $ A $，要求小秃从其中选出 $ N $个数，其中任意两个数字不能在同一行或同一列，现小凸想知道选出来的 $ N $ 个数中第 $ K $ 大的数字的最小值是多少。

<!-- more -->

### 链接
[BZOJ 4443](http://www.lydsy.com/JudgeOnline/problem.php?id=4443)

### 题解
二分第 $ K $ 大的数是多少，然后建二分图，用行匹配列，检验匹配数是不是大于等于 $ N - K + 1 $。

注意，是第 $ K $ 大，不是第 $ K $ 小！

### 代码
```c++
#include <cstdio>
#include <climits>
#include <algorithm>
#include <queue>

const int MAXN = 250;
const int MAXM = 250;
const int MAXK = 250;
const int CACHE_FIX = 3;

struct Node;
struct Edge;

struct Node {
	Edge *firstEdge, *currentEdge;
	int level;
} nodes[MAXN + MAXM + 2];

struct Edge {
	Node *from, *to;
	int capacity, flow;
	Edge *next, *reversedEdge;

	Edge(Node *from, Node *to, int capacity) : from(from), to(to), capacity(capacity), flow(0), next(from->firstEdge) {}
};

struct Dinic {
	bool makeLevelGraph(Node *s, Node *t, int n) {
		for (int i = 0; i < n; i++) nodes[i].level = 0;

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
			for (int i = 0; i < n; i++) nodes[i].currentEdge = nodes[i].firstEdge;
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

int n, m, k, a[MAXN + CACHE_FIX][MAXM], max;

void cleanUp() {
	for (int i = 0; i < n + m + 2; i++) {
		Edge *next;
		for (Edge *&e = nodes[i].firstEdge; e; next = e->next, delete e, e = next);
	}
}

bool check(int limit) {
	cleanUp();

	const int s = 0, t = n + m + 1;

	for (int i = 1; i <= n; i++) addEdge(s, i, 1);
	for (int j = 1; j <= m; j++) addEdge(n + j, t, 1);
	for (int i = 1; i <= n; i++) {
		for (int j = 1; j <= m; j++) {
			if (a[i - 1][j - 1] <= limit) addEdge(i, n + j, 1);
		}
	}

	int maxFlow = dinic(s, t, n + m + 2);
	// printf("%d\n", maxFlow);
	return maxFlow >= n - k + 1;
}

inline int solve() {
	static int tmp[MAXN * MAXM];
	for (int i = 0, c = 0; i < n; i++) {
		for (int j = 0; j < m; j++) {
			tmp[c++] = a[i][j];
		}
	}
	std::sort(tmp, tmp + n * m);

	int *l = tmp, *r = std::unique(tmp, tmp + n * m) - 1;
	while (l < r) {
		int *const mid = l + ((r - l) >> 1);
		if (check(*mid)) r = mid;
		else l = mid + 1;
	}

	return *l;
}

int main() {
	// freopen("matrix.in", "r", stdin);
	// freopen("matrix.out", "w", stdout);

	scanf("%d %d %d", &n, &m, &k);
	for (int i = 0; i < n; i++) {
		for (int j = 0; j < m; j++) {
			scanf("%d", &a[i][j]);
		}
	}

	printf("%d\n", solve());

	fclose(stdin);
	fclose(stdout);

	return 0;
}
```
