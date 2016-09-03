title: 「JSOI2009」魔兽地图 - 背包DP
categories: OI
tags: 
  - BZOJ
  - JSOI
  - DP
  - 背包DP
permalink: jsoi2008-dotr
date: 2016-07-11 23:10:00
---

游戏中，一些装备有价格，可以无限购买；另一些装备需要其它装备合成，这些装备有合成次数限制。每个装备都有膜法值，求 $ M $ 个金币最多能得到多少膜法值的装备。

<!-- more -->

### 链接
[BZOJ 1017](http://www.lydsy.com/JudgeOnline/problem.php?id=1017)

### 题解
对于每个装备，$ f(i, j) $ 表示先获取 $ i $ 个用于合成其它装备，一共最多用 $ j $ 个金币，的最大收益。

对于需要合成的装备，用 $ g(i, j) $ 表示前 $ i $ 棵子树用 $ j $ 个金币的最大收益。用类似背包的方法转移。

### 代码
```c++
#include <cstdio>
#include <cstring>
#include <climits>
#include <queue>

const int MAXN = 51;
const int MAXM = 2000;
const int MAXK = 100;

struct Node;
struct Edge;

struct Node {
	Edge *e;
	int cnt, cost, val, ind;
	bool basic; // , visited;
	int f[MAXK + 1][MAXM + 1];
} N[MAXN], *seq[MAXN];

struct Edge {
	Node *s, *t;
	int w;
	Edge *next;

	Edge(Node *s, Node *t, const int w) : s(s), t(t), w(w), next(s->e) {}
};

inline void addEdge(const int s, const int t, const int w) {
	// printf("E(%d, %d, %d)\n", s, t, w);
	N[t].ind++;
	N[s].e = new Edge(&N[s], &N[t], w);
}

int n, m, ans;

inline void bfs() {
	int pos = n;
	for (int i = 0; i < n; i++) {
		if (N[i].ind) continue;
		// printf("%d\n", i);
		std::queue<Node *> q;
		q.push(&N[i]);
		// N[i].visited = true;

		while (!q.empty()) {
			for (Edge *e = (seq[--pos] = q.front())->e; e; e = e->next) q.push(e->t); // , e->t->visited = true;
			q.pop();
		}
	}
}

inline void dp1() {
	for (int i = 0; i < n; i++) {
		Node *&v = seq[i];
		if (!v->basic) {
			v->cnt = INT_MAX;
			for (Edge *e = v->e; e; e = e->next) {
				v->cnt = std::min(v->cnt, e->t->cnt / e->w);
				v->cost += e->t->cost * e->w;
			}
			v->cnt = std::min(v->cnt, m / v->cost);
		}
	}
}

inline void dp2() {
	for (int i = 0; i < n; i++) {
		Node *&v = seq[i];
		int (&f)[MAXK + 1][MAXM + 1] = v->f;
		static int g[MAXN + 1][MAXM + 1];

		if (v->basic) {
			for (int i = 0; i <= v->cnt; i++) {
				for (int j = v->cost * i; j <= m; j++) {
					f[i][j] = std::max(f[i][j], std::min(v->cnt - i, (j - v->cost * i) / v->cost) * v->val);
				}
			}
		} else {
			for (int i = 0; i <= v->cnt; i++) {
				// memset(g, 0, sizeof(g));
				for (int i = 0; i <= MAXN; i++) for (int j = 0; j <= MAXM; j++) g[i][j] = i == 0 ? 0 : INT_MIN;
				// if (!v->e) {
					/*
					for (int j = 0; j <= i; j++) {
						for (int k = v->cost * i; k <= m; k++) {
							f[j][k] = std::max(f[j][k], v->val * (i - j));
						}
					}
					*/
				// } else {
					// for (int j = v->cost * i; j <= m; j++) g[j] = v->val * i;

				int id = 0;
				for (Edge *e = v->e; e; e = e->next) {
					id++;
					for (int j = m; j >= 0; j--) {
						for (int k = i * e->w * e->t->cost; k <= j; k++) {
							g[id][j] = std::max(g[id][j], g[id - 1][j - k] + e->t->f[e->w * i][k]);
							// if (j - k * e->t->cost >= v->cost * i) g[i][j] = std::max(g[i][j], g[i][j - k * e->t->cost]);
						}
					}
					// printf("g[%d][%d] = %d\n", i, j, g[i][j]);
				}

				for (int j = 0; j <= i; j++) {
					for (int k = v->cost * i; k <= m; k++) {
						f[j][k] = std::max(f[j][k], g[id][k] + (i - j) * v->val);
						ans = std::max(ans, f[j][k]);
					}
				}
			}
		}
	}
}

int main() {
	scanf("%d %d", &n, &m);

	for (int i = 0; i < n; i++) {
		scanf("%d", &N[i].val);
		char s[2];
		scanf("%s", s);

		if (s[0] == 'B') {
			scanf("%d %d", &N[i].cost, &N[i].cnt);
			N[i].basic = true;
		} else {
			int t;
			scanf("%d", &t);
			while (t--) {
				int u, w;
				scanf("%d %d", &u, &w), u--;
				addEdge(i, u, w);
			}
		}
	}

	bfs();
	dp1();
	dp2();

	printf("%d\n", ans);

	return 0;
}
```
