title: 「SCOI2011」糖果 - 强联通分量 + 拓扑排序
categories: OI
tags: 
  - BZOJ
  - SCOI
  - 强联通分量
  - Tarjan
  - 缩点
  - 拓扑排序
  - 差分约束系统
permalink: scoi2011-candy
date: 2016-03-04 21:32:23
---

幼儿园里有 $ N $ 个小朋友，老师现在想要给这些小朋友们分配糖果，要求每个小朋友都要分到糖果。在分配糖果的时候，需要满足小朋友们的 $ K $ 个要求。幼儿园的糖果总是有限的，想知道他至少需要准备多少个糖果，才能使得每个小朋友都能够分到糖果，并且满足小朋友们所有的要求。

<!-- more -->

### 题目链接
[BZOJ 2330](http://www.lydsy.com/JudgeOnline/problem.php?id=2330)

### 解题思路
在满足题目的要求下，最优解一定是：最少的一个，比别人多也只多一个。很容易想到用查分约束系统来做。

然而刚学了 Tarjan 就想乱搞搞，做法是，把所有关系转化为小于等于和小于两种，先把小于等于的边全部加进去，跑一遍 Tarjan，然后缩点，此时一个强联通分量上的小朋友糖果数是相同的。

把小于的边再加上，进行拓扑排序，如果有环说明无解。把小于等于的边权值置为 0，小于的边权值置为 1，入度为零的点距离置为 1。求出所有最长路，每个点距离乘以该点小朋友的数量的和即为答案。

注意开 `long long`。

### AC代码
```c++
#include <cstdio>
#include <algorithm>
#include <stack>
#include <queue>

const int MAXN = 100000;
const int MAXK = 100000;

struct Node;
struct Edge;
struct Connected;

struct Node {
	Edge *firstEdge, *currentEdge, *inEdge;
	int dfn, low, inDegree, dist;
	bool visited, pushed, inStack;
	Connected *scc;
} nodes[MAXN];

struct Edge {
	Node *from, *to;
	Edge *next;
	int w;

	Edge(Node *from, Node *to, int w) : from(from), to(to), next(from->firstEdge), w(w) {}
};

struct Connected {
	int size;
	Node v;
} sccs[MAXN];

struct Condition {
	int x, u, v;
} conditions[MAXK];

int n, k;

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
				v->currentEdge = v->firstEdge;
				v->dfn = v->low = timeStamp++;
				v->inStack = true;
				t.push(v);
			}

			if (v->currentEdge) {
				Edge *&e = v->currentEdge;
				if (!e->to->pushed) s.push(e->to), e->to->pushed = true, e->to->inEdge = e;
				else if (e->to->inStack) v->low = std::min(v->low, e->to->dfn);
				e = e->next;
			} else {
				s.pop();

				if (v->dfn == v->low) {
					v->scc = &sccs[count++];
					Node *u;
					do {
						u = t.top();
						t.pop();
						u->inStack = false;
						u->scc = v->scc;
						u->scc->size++;
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
				e->from->scc->v.firstEdge = new Edge(&e->from->scc->v, &e->to->scc->v, e->w);
				e->to->scc->v.inDegree++;
			}
		}
	}
}

inline long long topoSort(int count) {
	std::queue<Node *> q;

	for (int i = 0; i < count; i++) {
		if (sccs[i].v.inDegree == 0) {
			sccs[i].v.dist = 1;
			q.push(&sccs[i].v);
		}
	}

	int x = count;
	while (!q.empty()) {
		Node *v = q.front();
		q.pop();

		x--;

		for (Edge *e = v->firstEdge; e; e = e->next) {
			if (e->to->dist == 0 || e->to->dist < v->dist + e->w) e->to->dist = v->dist + e->w;
			if (--e->to->inDegree == 0) {
				q.push(e->to);
			}
		}
	}

	if (x > 0) return -1;
	else {
		long long ans = 0;
		for (int i = 0; i < count; i++) {
			ans += (long long)sccs[i].size * (long long)sccs[i].v.dist;
		}

		return ans;
	}
}

inline void addEdge(int from, int to, int w) {
	nodes[from].firstEdge = new Edge(&nodes[from], &nodes[to], w);
}

int main() {
	scanf("%d %d", &n, &k);

	for (int i = 0; i < k; i++) {
		scanf("%d %d %d", &conditions[i].x, &conditions[i].u, &conditions[i].v);
		conditions[i].u--, conditions[i].v--;

		if (conditions[i].x == 4) {
			std::swap(conditions[i].u, conditions[i].v);
			conditions[i].x = 2;
		} else if (conditions[i].x == 3) {
			std::swap(conditions[i].u, conditions[i].v);
			conditions[i].x = 5;
		}
	}

	for (int i = 0; i < k; i++) {
		if (conditions[i].x == 1) {
			addEdge(conditions[i].u, conditions[i].v, 0);
			addEdge(conditions[i].v, conditions[i].u, 0);
		} else if (conditions[i].x == 5) {
			addEdge(conditions[i].u, conditions[i].v, 0);
		}
	}

	int count = tarjan();
	contract();

	for (int i = 0; i < k; i++) {
		if (conditions[i].x == 2) {
			Node *u = &nodes[conditions[i].u].scc->v, *v = &nodes[conditions[i].v].scc->v;
			u->firstEdge = new Edge(u, v, 1);
			v->inDegree++;
		}
	}

	printf("%lld\n", topoSort(count));

	return 0;
}
```
