title: 「NOIP2010」关押罪犯 - 二分图染色
categories: OI
tags: 
  - NOIP
  - CodeVS
  - Vijos
  - 洛谷
  - 图论
  - 二分答案
  - 二分图染色
permalink: noip2010-prison
id: 54
updated: '2016-02-19 16:06:06'
date: 2016-02-19 16:00:26
---

S 城现有两座监狱，一共关押着 `N` 名罪犯，编号分别为 `1 ~ N`，我们用“怨气值”（一个正整数值）来表示某两名罪犯之间的仇恨程度，怨气值越大，则这两名罪犯之间的积怨越多。每年每一对有仇恨的罪犯会发生一次冲突。公务繁忙的 Z 市长只会去看列表中的第一个事件的影响力。那么，应如何分配罪犯，才能使 Z 市长看到的那个冲突事件的影响力最小，求这个最小值是多少？

<!-- more -->

### 链接
[CodeVS 1069](http://codevs.cn/problem/1069/)  
[Tyvj 1043](http://tyvj.cn/p/1403)  
[洛谷 1525](http://www.luogu.org/problem/show?pid=1525)

### 题解
因为要求最小值，所以考虑二分答案。当我们二分一个答案 `x` 后，只需要考虑怒气值大于 `x` 的成对罪犯了，这时候对整张图进行二分图染色，如果能被染色成为二分图，则这个答案合法。

二分图染色：把每个未标记的节点标记为任意一种颜色，对其进行一次 BFS，每一次扩展把未被染色的节点标记为与自身相反的颜色，如果发现扩展出去的节点的颜色与自身相同，则染色失败。

时间复杂度为 $ O(n{log}n) $，理论上来说可以过 100% 的数据，然而 Tyvj 的评测机太烂竟然 TLE 了一个点。

有神犇说可以用并查集，然而我太弱不会 …… qwq

### 代码
```cpp
#include <cstdio>
#include <algorithm>
#include <queue>

const int MAXN = 20000;
const int MAXM = 100000;

enum Color {
	None = 0,
	Red = 2000,
	Blue = 5280
};

struct Node;
struct Edge;

struct Node {
	Edge *firstEdge;
	Color color;
} nodes[MAXN];

struct Edge {
	Node *from, *to;
	int w;
	Edge *next;

	Edge(Node *from, Node *to, int w) : from(from), to(to), next(from->firstEdge), w(w) {}
};

int n, m, max;

inline void addEdge(int u, int v, int w) {
	nodes[u].firstEdge = new Edge(&nodes[u], &nodes[v], w);
	nodes[v].firstEdge = new Edge(&nodes[v], &nodes[u], w);
}

inline Color getReveseColor(Color c) {
	return c == Red ? Blue : Red;
}

inline bool bfs(Node *start, int limit) {

	return true;
}

inline bool check(int limit) {
	for (int i = 0; i < n; i++) nodes[i].color = None;

	for (int i = 0; i < n; i++) {
		if (nodes[i].color == None) {
			nodes[i].color = Red;

			std::queue<Node *> q;
			q.push(&nodes[i]);

			while (!q.empty()) {
				Node *v = q.front();
				q.pop();

				for (Edge *e = v->firstEdge; e; e = e->next) {
					if (e->w < limit) continue;

					if (e->to->color == None) {
						e->to->color = getReveseColor(v->color);
						q.push(e->to);
					} else if (e->to->color == v->color) return false;
				}
			}
		}
	}

	return true;
}

inline int solve() {
	int l = 1, r = max;
	while (l < r) {
		int mid = (l & r) + ((l ^ r) >> 1);
		//printf("[%d, %d] with `mid` = %d\n", l, r, mid);
		if (check(mid)) r = mid;
		else l = mid + 1;
	}

	return l - 1;
}

int main() {
	scanf("%d %d", &n, &m);

	for (int i = 0; i < m; i++) {
		int u, v, w;
		scanf("%d %d %d", &u, &v, &w), u--, v--;

		addEdge(u, v, w);
		max = std::max(max, w);
	}

	printf("%d\n", solve());

	return 0;
}
```