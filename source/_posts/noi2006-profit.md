title: 「NOI2006」最大获利 - 最大权闭合子图
categories: OI
tags: 
  - NOI
  - BZOJ
  - CodeVS
  - 图论
  - 网络流
  - 最小割
  - 最大权闭合子图
  - Dinic
permalink: noi2006-profit
date: 2016-03-10 19:33:42
---

在前期市场调查和站址勘测之后，公司得到了一共 $ N $ 个可以作为通讯信号中转站的地址，建立第 $ i $ 个通讯中转站需要的成本为 $ Pi $（$ 1 ≤ i ≤ N $）。另外公司调查得出了所有期望中的用户群，一共 $ M $ 个。关于第 $ i $ 个用户群的信息概括为 $ Ai $, $ Bi $ 和 $ Ci $：这些用户会使用中转站 $ Ai $ 和中转站 $ Bi $ 进行通讯，公司可以获益 $ Ci $。（$ 1 ≤ i ≤ M $，$ 1 ≤ Ai $，$ Bi ≤ N $）公司可以有选择的建立一些中转站（投入成本），为一些用户提供服务并获得收益（获益之和）。那么如何选择最终建立的中转站才能让公司的净获利最大呢？

<!-- more -->

### 题目链接
[CodeVS 1789](http://codevs.cn/problem/1789/)  
[BZOJ 1497](http://www.lydsy.com/JudgeOnline/problem.php?id=1497)

### 解题思路
裸的最大权闭合子图，用最小割。

### AC代码
```cpp
#include <cstdio>
#include <climits>
#include <algorithm>
#include <queue>

const int MAXN = 5000;
const int MAXM = 50000;

struct Node;
struct Edge;

struct Node {
	Edge *firstEdge, *currentEdge;
	int level, id;
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
				if (e->to->level == 0 && e->flow < e->capacity) {
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
			if (e->to->level == s->level + 1 && e->flow < e->capacity) {
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

int n, m, a[MAXN];

int main() {
	scanf("%d %d", &n, &m);

	const int s = 0, t = n + m + 1;
	
	for (int i = 1; i <= n; i++) {
		int x;
		scanf("%d", &x);

		addEdge(i, t, x);
	}

	int sum = 0;
	for (int i = n + 1; i <= n + m; i++) {
		int a, b, c;
		scanf("%d %d %d", &a, &b, &c);

		sum += c;
		addEdge(s, i, c);

		addEdge(i, a, INT_MAX);
		addEdge(i, b, INT_MAX);
	}

	int maxFlow = dinic(s, t, n + m + 2);
	printf("%d\n", sum - maxFlow);

	return 0;
}
```
