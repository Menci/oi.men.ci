title: 「ZJOI2006」物流运输 - 最短路 + DP
categories: OI
tags: 
  - BZOJ
  - COGS
  - ZJOI
  - 最短路
  - DP
permalink: zjoi2006-trans
date: 2016-05-23 21:41:00
---

物流公司要把一批货物从码头 $ A $ 运到码头 $ B $。由于货物量比较大，需要 $ n $ 天才能运完。货物运输过程中一般要转停好几个码头。物流公司通常会设计一条固定的运输路线，以便对整个运输过程实施严格的管理和跟踪。由于各种因素的存在，有的时候某个码头会无法装卸货物。这时候就必须修改运输路线，让货物能够按时到达目的地。但是修改路线是一件十分麻烦的事情，会带来额外的成本。因此物流公司希望能够订一个 $ n $ 天的运输计划，使得总成本尽可能地小。

<!-- more -->

### 链接
[BZOJ 1003](http://www.lydsy.com/JudgeOnline/problem.php?id=1003)  
[COGS 1824](http://cogs.top/cogs/problem/problem.php?pid=1824)

### 题解
首先，对时间暴力枚举一段区间，对这些天内任意一天不能使用的点标记，在剩余的点中求出最短路，以得到任意几天走相同路线的最少花费（最短路乘以天数）。

设 $ c(l,\ r) $ 表示第 $ l $ 天到第 $ r $ 天走相同路线的最少花费，设 $ f(i) $ 表示完成前 $ i $ 天的运输计划并修改路线的最少花费，则

$$ f(i) = \min\limits_{j = 0} ^ {i - 1} \{ f(j) + k + c(j + 1,\ i) \} $$

注意，当 $ c(j + 1,\ i) $ 无效，即第 $ j + 1 $ 天到第 $ i $ 天无法走同一条路线时不可转移。

最终答案为 $ f(n) - k $，时间复杂度为 $ O(n ^ 2 m \log m) $。

### 代码
```c++
#include <cstdio>
#include <climits>
#include <queue>
#include <utility>
#include <functional>

struct Node;
struct Edge;

const int MAXN = 20;
const int MAXD = 100;

struct Node {
	Edge *e;
	int d;
	bool flag[MAXD], invalid;
} N[MAXN];

struct Edge {
	Node *s, *t;
	int w;
	Edge *next;

	Edge(Node *const s, Node *const t, const int w) : s(s), t(t), w(w), next(s->e) {}
};

inline void addEdge(const int u, const int v, const int w) {
	N[u].e = new Edge(&N[u], &N[v], w);
	N[v].e = new Edge(&N[v], &N[u], w);
}

int d, n, k, m, c[MAXD + 1][MAXD + 1];
int f[MAXD + 1];

inline int dijkstra(const int s, const int t) {
	for (int i = 0; i < n; i++) N[i].d = INT_MAX;

	std::priority_queue< std::pair<int, Node *>, std::vector< std::pair<int, Node *> >, std::greater< std::pair<int, Node *> > > q;
	N[s].d = 0;
	q.push(std::make_pair(0, &N[s]));

	while (!q.empty()) {
		const std::pair<int, Node *> p = q.top();
		q.pop();

		Node *v = p.second;

		if (v->d != p.first) continue;
		if (v->d > N[t].d) break;

		for (Edge *e = v->e; e; e = e->next) {
			if (e->t->invalid) continue;

			if (e->t->d > v->d + e->w) {
				e->t->d = v->d + e->w;
				q.push(std::make_pair(e->t->d, e->t));
			}
		}
	}

	return N[t].d;
}

int main() {
	scanf("%d %d %d %d", &d, &n, &k, &m);

	for (int i = 0; i < m; i++) {
		int u, v, w;
		scanf("%d %d %d", &u, &v, &w), u--, v--;

		addEdge(u, v, w);
	}

	int t;
	scanf("%d", &t);
	while (t--) {
		int u, l, r;
		scanf("%d %d %d", &u, &l, &r), u--, l--, r--;
		std::fill(N[u].flag + l, N[u].flag + r + 1, true);
	}

	for (int i = 1; i <= d; i++) {
		for (int j = i; j <= d; j++) {
			for (int k = 0; k < n; k++) {
				N[k].invalid = false;
				for (int l = i; l <= j; l++) {
					if (N[k].flag[l - 1]) {
						N[k].invalid = true;
						break;
					}
				}
			}

			c[i][j] = dijkstra(0, n - 1);
			if (c[i][j] != INT_MAX) c[i][j] *= (j - i + 1);
			// printf("%d\n", c[i][j]);
		}
	}

	std::fill(f, f + d + 1, INT_MAX);
	f[0] = 0;
	for (int i = 1; i <= d; i++) {
		for (int j = 0; j < i; j++) {
			if (c[j + 1][i] != INT_MAX) {
				f[i] = std::min(f[i], f[j] + k + c[j + 1][i]);
			}
		}
	}

	printf("%d\n", f[d] - k);

	return 0;
}
```
