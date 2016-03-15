title: 「CTSC1999」星际转移 - 网络流
categories: OI
tags: 
  - COGS
  - CTSC
  - 图论
  - 网络流
  - Dinic
  - 网络流24题
  - 枚举答案
permalink: ctsc1999-home
id: 59
updated: '2016-02-24 21:42:46'
date: 2016-02-24 21:41:36
---

现有 `n` 个太空站位于地球与月球之间，且有 `m` 艘太空船在其间来回穿梭。每个太空站可容纳无限多的人，第 `i` 个太空船只可容纳 `H[i]` 个人。每艘太空船将周期性地停靠一系列的太空站。每一艘太空船从一个太空站驶往任一太空站耗时均为 1。人们只能在太空船停靠太空站（或月球、地球）时上、下船。初始时所有人全在地球上，太空船全在初始站。求让所有人尽快地全部转移到月球上的最短时间。

<!-- more -->

### 题目链接
[COGS 736](http://cogs.top/cogs/problem/problem.php?pid=736)

### 解题思路
话说这题真是难调 …… qwq

考虑到『一个太空站和一个时间点』确定了一个状态，枚举答案 `t`，将每个太空站拆成 `t + 1` 个点（因为初始状态是在 0 时刻）。对于每一个时刻，从**上一时刻每个太空船的停留站**到**这一时刻每个太空船的停留站**连一条边，容量为该太空船载客量；对于任何一个太空站，从上一时刻到这一时刻连一条边，容量为正无穷（表示人停留在太空站）；对于任意时刻的地球，从源点向其连一条边，容量为正无穷；对于任意时刻的月球，从其向汇点连一条边，容量为正无穷。

从小到大枚举答案，答案每增大 1，在原图中加入新边。直到汇点的流量大于等于总人数，则答案合法。

也可以二分答案 …… 不过那样要拆掉图重建，总感觉数据小的情况下比枚举还要慢。qwq

数据范围有坑！数据范围有坑！数据范围有坑！`n` 和 `m` 的最大值颠倒了！

### AC代码
```cpp
#include <cstdio>
#include <climits>
#include <algorithm>
#include <queue>
#include <vector>

const int MAXN = 13;
const int MAXM = 20;
const int MAXK = 50;

struct Node;
struct Edge;

struct Node {
	Edge *firstEdge, *currentEdge;
	int level;
	//char info[256];
} nodes[MAXN * (MAXN + 2) * (MAXM + 1) * MAXK * 2 + 2];

struct Edge {
	Node *from, *to;
	int capacity, flow;
	Edge *next, *reversedEdge;

	Edge(Node *from, Node *to, int capacity) : from(from), to(to), capacity(capacity), flow(0), next(from->firstEdge) {}
};

int n, m, k, a[MAXM];
std::vector<int> v[MAXM];
std::vector<int>::const_iterator currentStation[MAXM];

inline void print(Node *v) {
	//printf("%s", v->info);
	return;
	//int x = (int)(v - nodes);
	//if (x == 0) putchar('s');
	//else if (x == n * (n + 2) * (m + 1) * k * 2 + 1) putchar('t');
	//else {
	//	printf("{ day: %d, station: %d }", x / (n + 2), x % (n + 2) - 2);
	//}
}

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
					//print(e->from);
					//printf(" -> ");
					//print(e->to);
					//putchar('\n');
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
				int flow = findPath(e->to, t, std::min(e->capacity - e->flow, limit));

				if (flow > 0) {
					//printf("(%d)\n", (int)(s - nodes));
					e->flow += flow;
					e->reversedEdge->flow -= flow;
					return flow;
				}
			}
		}

		return 0;
	}

	int operator()(int s, int t, int n) {
		for (int i = 0; i < n; i++) {
			for (Edge *e = nodes[i].firstEdge; e; e = e->next) {
				e->flow = 0;
			}
		}

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
	//printf("\t\t%d\n", capacity);
	nodes[from].firstEdge = new Edge(&nodes[from], &nodes[to], capacity);
	nodes[to].firstEdge = new Edge(&nodes[to], &nodes[from], 0);

	nodes[from].firstEdge->reversedEdge = nodes[to].firstEdge, nodes[to].firstEdge->reversedEdge = nodes[from].firstEdge;
}

inline int stationID(int station, int day) {
	//sprintf(nodes[day * (n + 2) + station].info, "{ day: %d, station: %d }", day, station - 2);
	return day * (n + 2) + station;
}

inline int solve() {
	const int s = 0, t = n * (n + 2) * (m + 1) * k * 2 + 1;
	//nodes[s].info[0] = 's';
	//nodes[t].info[0] = 't';

	//puts("s --> { day: 0, station: 0 }");
	addEdge(s, stationID(2, 0), INT_MAX);
	//puts("s --> { day: 0, station: -1 }");
	addEdge(stationID(1, 0), t, INT_MAX);

	for (int i = 1; i <= (n + 2) * (m + 1) * k * 2; i++) {
		for (int j = 1; j <= m; j++) {
			int oldStation = *currentStation[j - 1];

			currentStation[j - 1]++;
			if (currentStation[j - 1] == v[j - 1].end()) currentStation[j - 1] = v[j - 1].begin();

			int newStation = *currentStation[j - 1];

			//printf("{ day: %d, station: %d } --> { day: %d, station: %d }\n", i - 1, oldStation - 2, i, newStation - 2);
			addEdge(stationID(oldStation, i - 1), stationID(newStation, i), a[j - 1]);
		}
		
		//printf("s --> { day: %d, station: 0 }\n", i);
		//printf("{ day: %d, station: -1 } --> t\n", i);
		addEdge(stationID(1, i), t, INT_MAX);
		addEdge(s, stationID(2, i), INT_MAX);
		
		for (int j = 3; j <= n + 2; j++) {
			//printf("{ day: %d, station: %d } --> { day: %d, station: %d }\n", i - 1, j - 2, i, j - 2);
			addEdge(stationID(j, i - 1), stationID(j, i), INT_MAX);
		}

		int flow = dinic(s, t, n * (n + 2) * (m + 1) * k * 2 + 2);
		//printf("%d\n", flow);
		if (flow >= k) return i;
	}

	return 0;
}

int main() {
	//printf("%d\n", sizeof(nodes));
	freopen("home.in", "r", stdin);
	freopen("home.out", "w", stdout);

	scanf("%d %d %d", &n, &m, &k);

	for (int i = 0; i < m; i++) {
		scanf("%d", &a[i]);

		int t;
		scanf("%d", &t);

		for (int j = 0; j < t; j++) {
			int x;
			scanf("%d", &x);

			v[i].push_back(x + 2);
		}

		currentStation[i] = v[i].begin();
	}

	printf("%d\n", solve());

	fclose(stdin);
	fclose(stdout);

	return 0;
}
```