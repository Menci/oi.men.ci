title: 「HAOI2006」受欢迎的牛 - 强联通分量
categories: OI
tags: 
  - BZOJ
  - HAOI
  - 强联通分量
  - Tarjan
  - 缩点
permalink: haoi2006-cow
date: 2016-03-04 21:28:17
---

每一头牛的愿望就是变成一头最受欢迎的牛。现在有 $ N $ 头牛，给你 $ M $ 对整数 $ (A,B) $，表示牛 $ A $ 认为牛 $ B $ 受欢迎。 这种关系是具有传递性的，如果 $ A $ 认为 $ B $ 受欢迎，$ B $ 认为 $ C $ 受欢迎，那么牛 $ A $ 也认为牛 $ C $ 受欢迎。你的任务是求出有多少头牛被所有的牛认为是受欢迎的。

<!-- more -->

### 题目链接
[BZOJ 1051](http://www.lydsy.com/JudgeOnline/problem.php?id=1051)

### 解题思路
求出强联通分量，缩点，然后判断是不是只有一个出度为零的点，如果是输出它的大小。

### AC代码
<!-- c++ -->
```
#include <cstdio>
#include <algorithm>
#include <stack>

const int MAXN = 10000;

struct Node;
struct Edge;
struct Connected;

struct Node {
	Edge *firstEdge, *currentEdge, *inEdge;
	int dfn, low, outDegree;
	bool visited, pushed, inStack;
	Connected *connected;
} nodes[MAXN];

struct Edge {
	Node *from, *to;
	Edge *next;

	Edge(Node *from, Node *to) : from(from), to(to), next(from->firstEdge) {}
};

struct Connected {
	int size;
	Node v;
} connecteds[MAXN];

int n, m;

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
				if (!e->to->pushed) {
					s.push(e->to);
					e->to->pushed = true;
					e->to->inEdge = e;
				} else if (e->to->inStack) v->low = std::min(v->low, e->to->dfn);

				e = e->next;
			} else {
				s.pop();

				if (v->dfn == v->low) {
					v->connected = &connecteds[count++];
					Node *u;
					do {
						u = t.top();
						t.pop();
						u->inStack = false;
						u->connected = v->connected;
						u->connected->size++;
					} while (u != v);
				}

				if (v->inEdge) v->inEdge->from->low = std::min(v->inEdge->from->low, v->low);
			}
		}
	}

	return count;
}

inline Connected *contract(int count) {
	int zeroCount = count;
	for (int i = 0; i < n; i++) {
		for (Edge *e = nodes[i].firstEdge; e; e = e->next) {
			if (e->from->connected != e->to->connected) {
				e->from->connected->v.firstEdge = new Edge(&e->from->connected->v, &e->to->connected->v);
				if (e->from->connected->v.outDegree++ == 0) zeroCount--;
			}
		}
	}

	if (zeroCount != 1) return NULL;

	for (int i = 0; i < count; i++) {
		if (connecteds[i].v.outDegree == 0) return &connecteds[i];
	}

	return NULL;
}

inline void addEdge(int from, int to) {
	nodes[from].firstEdge = new Edge(&nodes[from], &nodes[to]);
}

int main() {
	scanf("%d %d", &n, &m);

	for (int i = 0; i < m; i++) {
		int from, to;
		scanf("%d %d", &from, &to), from--, to--;

		addEdge(from, to);
	}

	int count = tarjan();
	Connected *popular = contract(count);

	if (!popular) puts("-1");
	else printf("%d\n", popular->size);

	return 0;
}
```
