title: 「APIO2009」抢掠计划 - 强联通分量
categories: OI
tags: 
  - BZOJ
  - APIO
  - 强联通分量
  - Tarjan
  - 缩点
  - DAG
  - 最长路
  - Bellman-Ford
permalink: apio2009-atm
date: 2016-03-10 19:57:45
---

城中的道路都是单向的。不同的道路由路口连接。在每个路口都设立了一个 ATM 取款机。酒吧也都设在路口，虽然并不是每个路口都设有酒吧。他将从市中心出发，沿着单向道路行驶，抢劫所有他途径的 ATM 机，最终他将在一个酒吧庆祝他的胜利。

他获知了每个 ATM 机中可以掠取的现金数额。他希望你帮助他计算从市中心出发最后到达某个酒吧时最多能抢劫的现金总数。他可以经过同一路口或道路任意多次。但只要他抢劫过某个 ATM 机后，该 ATM 机里面就不会再有钱了。

<!-- more -->

### 题目链接
[CodeVS 1611](http://codevs.cn/problem/1611/)  
[BZOJ 1179](http://www.lydsy.com/JudgeOnline/problem.php?id=1179)

### 解题思路
Tarjan 求强联通分量，一个强联通分量中的点肯定可以同时被抢走。缩点后图转化为 DAG，求出 DAG 上的最长路即为答案。

### AC代码
```cpp
#include <cstdio>
#include <algorithm>
#include <stack>
#include <queue>

const int MAXN = 500000;
const int MAXM = 500000;

struct Node;
struct Edge;
struct SCC;

struct Node {
	Edge *firstEdge, *inEdge, *currentEdge;
	int dfn, low, w, dist;
	bool inStack, pushed, visited, isBar, inQueue;
	SCC *scc;
} nodes[MAXN];

struct Edge {
	Node *from, *to;
	Edge *next;

	Edge(Node *from, Node *to) : from(from), to(to), next(from->firstEdge) {}
};

struct SCC {
	Node v;
	int size;
} sccs[MAXN];

inline void addEdge(int from, int to) {
	nodes[from].firstEdge = new Edge(&nodes[from], &nodes[to]);
}

int n;

inline int tarjan() {
	int timeStamp = 0, count = 0;
	for (int i = 0; i < n; i++) {
		if (nodes[i].visited) continue;

		std::stack<Node *> s, t;

		s.push(&nodes[i]);
		nodes[i].pushed = true;

		while (!s.empty()) {
			Node *v = s.top();

			if (!v->visited) {
				v->visited = true;
				v->dfn = v->low = timeStamp++;
				v->currentEdge = v->firstEdge;
				v->inStack = true;
				t.push(v);
			}

			if (v->currentEdge) {
				Edge *&e = v->currentEdge;
				if (e->to->inStack) v->low = std::min(v->low, e->to->dfn);
				else if (!e->to->pushed) s.push(e->to), e->to->pushed = true, e->to->inEdge = e;
				e = e->next;
			} else  {
				s.pop();

				if (v->dfn == v->low) {
					Node *u;
					v->scc = &sccs[count++];
					do {
						u = t.top();
						t.pop();
						u->inStack = false;
						u->scc = v->scc;
						u->scc->size++;
						u->scc->v.w += u->w;
						u->scc->v.isBar |= u->isBar;
					} while (u != v);
				}

				if (v->inEdge) v->inEdge->from->low = std::min(v->inEdge->from->low, v->low);
			}
		}
	}

	return count;
}

inline void contract() {
	for (int i = 0; i < n; i++) {
		for (Edge *e = nodes[i].firstEdge; e; e = e->next) {
			if (e->from->scc != e->to->scc) {
				Node *from = &e->from->scc->v, *to = &e->to->scc->v;
				from->firstEdge = new Edge(from, to);
			}
		}
	}
}

inline void bellmanford(int start) {
	std::queue<Node *> q;

	q.push(&nodes[start].scc->v);
	nodes[start].scc->v.dist = nodes[start].scc->v.w;

	while (!q.empty()) {
		Node *v = q.front();
		q.pop();
		v->inQueue = false;

		for (Edge *e = v->firstEdge; e; e = e->next) {
			if (e->to->dist < v->dist + e->to->w) {
				e->to->dist = v->dist + e->to->w;
				
				if (!e->to->inQueue) {
					e->to->inQueue = true;
					q.push(e->to);
				}
			}
		}
	}
}

int main() {
	int m;
	scanf("%d %d", &n, &m);

	for (int i = 0; i < m; i++) {
		int from, to;
		scanf("%d %d", &from, &to), from--, to--;

		addEdge(from, to);
	}

	for (int i = 0; i < n; i++) {
		scanf("%d", &nodes[i].w);
	}

	int s, p;
	scanf("%d %d", &s, &p), s--;

	for (int i = 0; i < p; i++) {
		int x;
		scanf("%d", &x), x--;
		nodes[x].isBar = true;
	}

	int count = tarjan();
	contract();

	bellmanford(s);

	int ans = 0;
	for (int i = 0; i < count; i++) {
		if (sccs[i].v.isBar) ans = std::max(ans, sccs[i].v.dist);
	}

	printf("%d\n", ans);

	return 0;
}
```

### 吐槽
一开始想到最长路，然后写了个 Dijkstra …… 写了个 Dijkstra ……

(╯‵□′)╯︵┻━┻ 为什么我要写 Dijkstra！

┬—┬ノ('-'ノ) 改成 Bellman-Ford 之后 WA 的更离谱了 ……

最后发现是读进来的起点下标忘了减一 ……

以后不能再出这种沙茶错误了啊啊啊啊啊啊 OvO ……

### 还是吐槽
从测试点命名中我们可以看出出题人的恶意 →_→

|       测试点      | 结果| 内存使用量 | 时间使用量|
| ---------------- |:--:|:--------:|:--------:|
| large-dag-0.in   | AC | 42504kB  | 423ms    |
| large-dag-1.in   | AC | 51052kB  | 476ms    |
| large-path-0.in  | AC | 55288kB  | 491ms    |
| large-path-1.in  | AC | 53096kB  | 494ms    |
| large-tree-0.in  | AC | 49512kB  | 430ms    |
| large-tree-1.in  | AC | 49772kB  | 406ms    |
| medium-dag-0.in  | AC | 364kB    | 2ms      |
| medium-dag-1.in  | AC | 492kB    | 2ms      |
| medium-path-0.in | AC | 488kB    | 2ms      |
| medium-path-1.in | AC | 492kB    | 2ms      |
| medium-tree-0.in | AC | 360kB    | 2ms      |
| medium-tree-1.in | AC | 492kB    | 1ms      |
| small-dag-0.in   | AC | 128kB    | 1ms      |
| small-path-0.in  | AC | 128kB    | 1ms      |
| small-tree-0.in  | AC | 256kB    | 1ms      |
