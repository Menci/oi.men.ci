title: 「CodeVS 2822」爱在心中 - 强连通分量
categories: OI
tags: 
  - CodeVS
  - 图论
  - Tarjan
  - 强连通分量
  - 缩点
permalink: codevs-2822
date: 2016-03-04 10:47:42
---

在爱的国度里有 N 个人，在他们的心中都有着一个爱的名单，上面记载着他所爱的人（不会出现自爱的情况）。爱是具有传递性的，即如果 A 爱 B，B 爱 C，则 A 也爱 C。

如果有这样一部分人，他们彼此都相爱，则他们就超越了一切的限制，用集体的爱化身成为一个爱心天使。现在，我们想知道在这个爱的国度里会出现多少爱心天使。而且，如果某个爱心天使被其他所有人或爱心天使所爱则请输出这个爱心天使是由哪些人构成的，否则输出 -1。

<!-- more -->

### 链接
[CodeVS 2822](http://codevs.cn/problem/2822/)

### 题解
第一问很明显的，求出图中有多少不是单点的强连通分量就是答案。

第二问，把每个强连通分量缩成一个点，重新构图，如果新图中有出度为零的点，则该点对应的原图中的点集即为第二问答案。注意排除一个点情况。

### 代码
```cpp
#include <cstdio>
#include <algorithm>
#include <stack>
#include <vector>

const int MAXN = 1000;
const int MAXM = 1000;

struct Node;
struct Edge;
struct Connected;

struct Node {
	Edge *firstEdge, *currentEdge, *inEdge;
	int id, dfn, low, outDegree;
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
	std::vector<int> vec;

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
				if (!e->to->pushed) s.push(e->to), e->to->pushed = true, e->to->inEdge = e;
				else if (e->to->inStack) v->low = std::min(v->low, e->to->dfn);
				e = e->next;
			} else {
				if (v->dfn == v->low) {
					v->connected = &connecteds[count++];
					Node *u;
					do {
						u = t.top();
						t.pop();
						u->inStack = false;
						u->connected = v->connected;
						u->connected->size++;
						u->connected->vec.push_back(u->id);
					} while (u != v);
				}

				if (v->inEdge) v->inEdge->from->low = std::min(v->inEdge->from->low, v->low);

				s.pop();
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
		if (connecteds[i].size > 1 && connecteds[i].v.outDegree == 0) return &connecteds[i];
	}

	return NULL;
}

inline void addEdge(int from, int to) {
	nodes[from].firstEdge = new Edge(&nodes[from], &nodes[to]);
}

int main() {
	scanf("%d %d", &n, &m);

	for (int i = 0; i < n; i++) nodes[i].id = i + 1;

	for (int i = 0; i < m; i++) {
		int from, to;
		scanf("%d %d", &from, &to), from--, to--;

		addEdge(from, to);
	}

	int count = tarjan();

	int ans = 0;
	for (int i = 0; i < count; i++) {
		if (connecteds[i].size > 1) {
			ans++;
		}
	}

	printf("%d\n", ans);

	Connected *loved = contract(count);
	if (!loved) {
		puts("-1");
	} else {
		std::sort(loved->vec.begin(), loved->vec.end());

		for (std::vector<int>::const_iterator p = loved->vec.begin(); p != loved->vec.end(); p++) {
			printf("%d ", *p);
		}

		putchar('\n');
	}

	return 0;
}

```
