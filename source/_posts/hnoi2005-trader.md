title: 「HNOI2005」狡猾的商人 - 差分约束
categories: OI
tags: 
  - BZOJ
  - HNOI
  - 差分约束
  - 图论
permalink: hnoi2005-trader
date: 2017-02-28 22:05:00
---

刁姹接到一个任务，为税务部门调查一位商人的账本，看看账本是不是伪造的。账本上记录了 $ n $ 个月以来的收入情况，其中第 $ i $ 个月的收入额为 $ A_i $。当 $ A_i $ 大于 $ 0 $ 时表示这个月盈利 $ A_i $ 元，当 $ A_i $ 小于 $ 0 $ 时表示这个月亏损 $ A_i $ 元。所谓一段时间内的总收入，就是这段时间内每个月的收入额的总和。刁姹的任务是秘密进行的，为了调查商人的账本，她只好跑到商人那里打工。她趁商人不在时去偷看账本，可是她无法将账本偷出来，每次偷看账本时她都只能看某段时间内账本上记录的收入情况，并且她只能记住这段时间内的总收入。现在，刁姹总共偷看了 $ m $ 次账本，当然也就记住了 $ m $ 段时间内的总收入，你的任务是根据记住的这些信息来判断账本是不是假的。

<!-- more -->

### 链接
[BZOJ 1202](http://www.lydsy.com/JudgeOnline/problem.php?id=1202)

### 题解
设 $ A_i $ 的前缀和为 $ S_i $，对于一个条件 $ (u, v, w) $，将其转化为 $ S_v - S_{u - 1} = w $，转化为差分约束问题。

进而，对于每个条件，在图中添加一条 $ u - 1 $ 到 $ v $ 权值为 $ w $ 边和一条 $ v $ 到 $ u - 1 $ 权值为 $ -w $ 的边。DFS 判断差分约束是否有解即可。

从每个未访问过的点出发，设它的值为 $ 0 $，DFS 过程中找到树边则更新邻接点的值，找到返祖边则检验是否有矛盾，不会出现横叉边。

### 代码
```c++
#include <cstdio>
#include <vector>

const int MAXN = 100;

struct Node {
	std::vector<struct Edge> e;
	int d;
	bool vis;
} N[MAXN + 1];

struct Edge {
	Node *s, *t;
	int w;

	Edge(Node *s, Node *t, int w) : s(s), t(t), w(w) {}
};

inline void addEdge(int s, int t, int w) {
	N[s].e.push_back(Edge(&N[s], &N[t], w));
	N[t].e.push_back(Edge(&N[t], &N[s], -w));
}

inline bool dfs(Node *v) {
	for (Edge *e = &v->e.front(); e && e <= &v->e.back(); e++) {
		if (!e->t->vis) {
			e->t->vis = true;
			e->t->d = v->d + e->w;
			if (!dfs(e->t)) return false;
		} else if (e->t->d != v->d + e->w) return false;
	}

	return true;
}

int main() {
	int T;
	scanf("%d", &T);
	while (T--) {
		int n, m;
		scanf("%d %d", &n, &m);

		while (m--) {
			int u, v, w;
			scanf("%d %d %d", &u, &v, &w);
			addEdge(u - 1, v, w);
		}

		bool ans = true;
		for (int i = 0; i <= n; i++) {
			if (!N[i].vis) {
				N[i].vis = true;
				if (!dfs(&N[i])) {
					ans = false;
					break;
				}
			}
		}

		puts(ans ? "true" : "false");

		for (int i = 0; i <= n; i++) {
			N[i].e.clear();
			N[i].d = 0;
			N[i].vis = false;
		}
	}

	return 0;
}
```
