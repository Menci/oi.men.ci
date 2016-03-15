title: 「SDOI2015」星际战争 - 网络流
date: 2016-02-29 15:42:11
categories: OI
tags:
  - BZOJ
  - SDOI
  - Dinic
  - 图论
  - 网络流
  - 二分答案
  - 实数二分
permalink: sdoi2015-war
---

Y 军团一共派遣了 $ N $ 个巨型机器人进攻 X 军团的阵地，其中第 $ i $ 个巨型机器人的装甲值为 $ A_i $。当一个巨型机器人的装甲值减少到 0 或者以下时，这个巨型机器人就被摧毁了。X 军团有 $ M $ 个激光武器，其中第 $ i $ 个激光武器每秒可以削减一个巨型机器人 $ B_i $ 的装甲值。激光武器的攻击是连续的。这种激光武器非常奇怪，一个激光武器只能攻击一些特定的敌人。Y 军团需要知道 X 军团最少需要用多长时间才能将 Y 军团的所有巨型机器人摧毁。

<!-- more -->

### 题目链接
[BZOJ 3993](http://www.lydsy.com/JudgeOnline/problem.php?id=3993)

### 解题思路
先二分一个时间，然后用网络流判定是否能在这段时间内打完。

1. 从源点到每一个武器连一条边，容量为武器的威力 × 时间；
2. 从每一个机器人向汇点连一条边，容量为该机器人的装甲值；
3. 从每个武器向所有从该武器能攻击的机器人连一条边，容量为正无穷。

嗯，说起来很容易对吧w ……

然而答案是实数，实数二分倒没什么问题，要注意的是 Dinic 模板也要改成实数的。

二分的范围不太好确定，既然题目明确有解，那就定上界为**用一个威力最小的武器打所有机器人所用时间**，反正不会错。

### AC代码
```cpp
#include <cstdio>
#include <climits>
#include <cmath>
#include <cfloat>
#include <algorithm>
#include <queue>
 
const int MAXN = 50;
const int MAXM = 50;
const double EPS = 1e-4;
 
struct Node;
struct Edge;
 
struct Node {
	Edge *firstEdge, *currentEdge;
	int level;
} nodes[MAXN + MAXM + 2];
 
struct Edge {
	Node *from, *to;
	double capacity, flow;
	Edge *next, *reversedEdge;
 
	Edge(Node *from, Node *to, double capacity) : from(from), to(to), capacity(capacity), flow(0), next(from->firstEdge) {}
};
 
int n, m, robot[MAXN], sumRobot, gun[MAXM], minGun = INT_MAX, attack[MAXM][MAXN];
 
inline bool equal(double a, double b) {
	return fabs(a - b) < EPS;
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
				if (!equal(e->capacity - e->flow, 0) && e->to->level == 0) {
					e->to->level = v->level + 1;
					if (e->to == t) return true;
					else q.push(e->to);
				}
			}
		}
 
		return false;
	}
 
	double findPath(Node *s, Node *t, double limit = DBL_MAX) {
		if (s == t) return limit;
 
		for (Edge *&e = s->currentEdge; e; e = e->next) {
			if (e->to->level == s->level + 1 && !equal(e->capacity - e->flow, 0)) {
				double flow = findPath(e->to, t, std::min(limit, e->capacity - e->flow));
				if (flow > 0) {
					e->flow += flow;
					e->reversedEdge->flow -= flow;
					return flow;
				}
			}
		}
 
		return 0;
	}
 
	double operator()(int s, int t, int n) {
		double ans = 0;
		while (makeLevelGraph(&nodes[s], &nodes[t], n)) {
			for (int i = 0; i < n; i++) nodes[i].currentEdge = nodes[i].firstEdge;
			double flow;
			while ((flow = findPath(&nodes[s], &nodes[t])) > 0) ans += flow;
		}
 
		return ans;
	}
} dinic;
 
inline void addEdge(int from, int to, double capacity) {
	nodes[from].firstEdge = new Edge(&nodes[from], &nodes[to], capacity);
	nodes[to].firstEdge = new Edge(&nodes[to], &nodes[from], 0);
 
	nodes[from].firstEdge->reversedEdge = nodes[to].firstEdge, nodes[to].firstEdge->reversedEdge = nodes[from].firstEdge;
}
 
inline void cleanUp(int n) {
	for (int i = 0; i < n; i++) {
		Edge *next;
		for (Edge *&e = nodes[i].firstEdge; e; next = e->next, delete e, e = next);
	}
}
 
inline bool check(double time) {
	const int s = 0, t = n + m + 1;
 
	for (int i = 1; i <= m; i++) addEdge(s, i, gun[i - 1] * time);
	for (int i = 1; i <= n; i++) addEdge(i + m, t, robot[i - 1]);
 
	for (int i = 1; i <= m; i++) {
		for (int j = 1; j <= n; j++) {
			if (attack[i - 1][j - 1] == 1) {
				addEdge(i, j + m, DBL_MAX);
			}
		}
	}
 
	double flow = dinic(s, t, n + m + 2);
 
	cleanUp(n + m + 2);
 
	//printf("%.3lf %d\n", flow, sumRobot);
	return equal(flow, sumRobot);
}
 
inline double dichotomy() {
	double l = 0, r = ((double)sumRobot) / ((double)minGun);
	while (r - l > EPS) {
		double mid = l + (r - l) / 2;
		//printf("mid = %.6lf\n", mid);
		if (check(mid)) r = mid;
		else l = mid;
	}
 
	return l + (r - l) / 2;
}
 
int main() {
	scanf("%d %d", &n, &m);
 
	for (int i = 0; i < n; i++) scanf("%d", &robot[i]), sumRobot += robot[i];
	for (int i = 0; i < m; i++) scanf("%d", &gun[i]), minGun = std::min(minGun, gun[i]);
 
	for (int i = 0; i < m; i++) {
		for (int j = 0; j < n; j++) {
			scanf("%d", &attack[i][j]);
		}
	}
 
	printf("%.6lf\n", dichotomy());
 
	return 0;
}
```
