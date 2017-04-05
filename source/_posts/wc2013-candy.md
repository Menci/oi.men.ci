title: 「WC2013」糖果公园 - 树链剖分 + 莫队
categories: OI
tags: 
  - BZOJ
  - WC
  - 数据结构
  - 最近公共祖先
  - 树链剖分
  - 莫队
permalink: wc2013-candy
date: 2017-01-13 09:45:00
---

Candyland 有一座糖果公园，公园里不仅有美丽的风景、好玩的游乐项目，还有许多免费糖果的发放点，这引来了许多贪吃的小朋友来糖果公园玩。

糖果公园的结构十分奇特，它由 $ n $ 个游览点构成，每个游览点都有一个糖果发放处，我们可以依次将游览点编号为 $ 1 $ 至 $ n $。有 $ n - 1 $ 条**双向道路**连接着这些游览点，并且整个糖果公园都是**连通的**，即从任何一个游览点出发都可以通过这些道路到达公园里的所有其它游览点。

糖果公园所发放的糖果种类非常丰富，总共 $ m $ 种，它们的编号依次为 $ 1 $ 至 $ m $。每一个糖果发放处都只发放某种特定的糖果，我们用 $ c_i $ 来表示 $ i $ 号游览点的糖果。

来到公园里游玩的游客都**不喜欢走回头路**，他们总是从某个特定的游览点出发前往另一个特定的游览点，并游览途中的景点，这条路线一定是唯一的。他们经过每个游览点，都可以品尝到一颗对应种类的糖果。

大家对不同类型的糖果的喜爱程度都不尽相同。根据游客们的反馈打分，我们得到了糖果的美味指数，第 $ i $ 种糖果的美味指数为 $ v_i $。另外，如果一位游客反复地品尝同一种类的糖果，他肯定会觉得有一些腻。根据量化统计，我们得到了游客第 $ i $ 次品尝某类糖果的新奇指数 $ w_i $，如果一位游客第 $ i $ 次品尝第 $ j $ 种糖果，那么他的愉悦指数 $ H $ 将会增加对应的美味指数与新奇指数的乘积，即 $ v_j w_i $。这位游客游览公园的愉悦指数最终将是这些乘积的和。

当然，公园中每个糖果发放点所发放的糖果种类不一定是一成不变的。有时，一些糖果点所发放的糖果种类可能会更改（也只会是 $ m $ 种中的一种），这样的目的是能够让游客们总是感受到惊喜。
糖果公园的工作人员小 A 接到了一个任务，那就是**根据公园最近的数据统计出每位游客游玩公园的愉悦指数**。但数学不好的小 A 一看到密密麻麻的数字就觉得头晕，作为小 A 最好的朋友，你决定帮他一把。

<!-- more -->

### 链接
[BZOJ 3052](http://www.lydsy.com/JudgeOnline/problem.php?id=3052)

### 题解
带修改树上莫队模板题。

对树分块，排序。

维护两点 $ (u, v) $ 间的路径上不包含 $ \text{lca}(u, v) $ 的点的贡献和，每次转移到 $ (u', v') $ 时，将 $ (u, u') $ 和 $ (v, v') $ 路径上的点的是否在答案中取反。对于 $ \text{lca}(u, v) $ 单独考虑即可。

### 代码
```c++
#include <cstdio>
#include <cmath>
#include <algorithm>
#include <stack>

const int MAXN = 100000;

struct Node {
	struct Edge *e;
	Node *fa, *top, *ch;
	int blockID, depth, w, size;
	bool added, vis;
} N[MAXN + 1];

struct Edge {
	Node *s, *t;
	Edge *next;

	Edge(Node *s, Node *t) : s(s), t(t), next(s->e) {}
};

inline void addEdge(int s, int t) {
	N[s].e = new Edge(&N[s], &N[t]);
	N[t].e = new Edge(&N[t], &N[s]);
}

struct Update {
	Node *v;
	int oldVal, newVal;
} U[MAXN + 1];

struct Query {
	int time;
	long long *ans;
	Node *u, *v;

	bool operator<(const Query &other) const {
		if (u->blockID < other.u->blockID) return true;
		else if (u->blockID == other.u->blockID && v->blockID < other.v->blockID) return true;
		else if (u->blockID == other.u->blockID && v->blockID == other.v->blockID && time < other.time) return true;
		else return false;
	}
} Q[MAXN + 1];

int n, max, m, cntQuery, cntUpdate, v[MAXN + 1], w[MAXN + 1], cnt[MAXN + 1], blockSize, blockCount;

std::stack<Node *> s;
inline void dfs(Node *v) {
	size_t status = s.size();

	for (Edge *e = v->e; e; e = e->next) {
		if (e->t != v->fa) {
			e->t->fa = v;
			e->t->depth = v->depth + 1;
			dfs(e->t);

			if (int(s.size() - status) >= blockSize) {
				v->blockID = ++blockCount;
				while (s.size() != status) {
					Node *u = s.top();
					s.pop();
					u->blockID = blockCount;
				}
			}
		}
	}

	s.push(v);
}

inline void assignBlocks() {
	N[1].fa = NULL;
	N[1].depth = 1;
	dfs(&N[1]);
	while (!s.empty()) {
		Node *u = s.top();
		s.pop();
		u->blockID = blockCount;
	}
}

inline void prepare() {
	static int newC[MAXN + 1];
	for (int i = 1; i <= n; i++) newC[i] = N[i].w;

	for (int i = 1; i <= cntUpdate; i++) {
		U[i].oldVal = newC[U[i].v - N];
		newC[U[i].v - N] = U[i].newVal;
	}
}

inline void split() {
	std::stack<Node *> s;
	s.push(&N[1]);

	while (!s.empty()) {
		Node *v = s.top();
		if (!v->vis) {
			v->vis = true;

			for (Edge *e = v->e; e; e = e->next) {
				if (e->t->fa == v) {
					s.push(e->t);
				}
			}
		} else {
			v->size = 1;
			for (Edge *e = v->e; e; e = e->next) {
				v->size += e->t->size;
				if (!v->ch || v->ch->size < e->t->size) v->ch = e->t;
			}
			s.pop();
		}
	}

	s.push(&N[1]);
	while (!s.empty()) {
		Node *v = s.top();
		s.pop();

		v->top = (!v->fa || v != v->fa->ch) ? v : v->fa->top;

		for (Edge *e = v->e; e; e = e->next) {
			if (e->t->fa == v) {
				s.push(e->t);
			}
		}
	}
}

inline Node *lca(Node *u, Node *v) {
	while (u->top != v->top) {
		if (u->top->depth < v->top->depth) std::swap(u, v);
		u = u->top->fa;
	}
	return u->depth < v->depth ? u : v;
}

inline void reverse(Node *v, long long &ans) {
	if (!v->added) {
#ifdef DBG
		printf("add(%lu)\n", v - N);
#endif
		ans += (long long)::v[v->w] * w[++cnt[v->w]];
	} else {
#ifdef DBG
		printf("del(%lu)\n", v - N);
#endif
		ans -= (long long)::v[v->w] * w[cnt[v->w]--];
	}

	v->added ^= 1;
}

inline void extend(Node *&s, Node *t, long long &ans) {
	Node *p = lca(s, t);

	for (Node *v = s; v != p; v = v->fa) reverse(v, ans);
	for (Node *v = t; v != p; v = v->fa) reverse(v, ans);

	s = t;
}

inline void apply(int time, int d, long long &ans) {
	bool flag = U[time].v->added;
	if (flag) reverse(U[time].v, ans);

#ifdef DBG
	printf("apply(time = %d, d = %d), N[%lu].w = %d => ", time, d, U[time].v - N, U[time].v->w);
#endif
	if (d == 1) {
		U[time].v->w = U[time].newVal;
	} else {
		U[time].v->w = U[time].oldVal;
	}
#ifdef DBG
	printf("%d\n", U[time].v->w);
#endif

	if (flag) reverse(U[time].v, ans);
}

inline void update(int &fromTime, int toTime, long long &ans) {
#ifdef DBG
	long long _ans = ans;
#endif
	if (fromTime < toTime) {
		for (int i = fromTime + 1; i <= toTime; i++) apply(i, 1, ans);
	} else if (fromTime > toTime) {
		for (int i = fromTime; i >= toTime + 1; i--) apply(i, -1, ans);
	}

#ifdef DBG
	printf("update(%d to %d), ans = %lld => %lld\n", fromTime, toTime, _ans, ans);
#endif
	fromTime = toTime;
}

inline void solve() {
	int time = 0;
	Node *u = &N[1], *v = &N[1];
	long long ans = 0;
	for (int i = 1; i <= cntQuery; i++) {
		const Query &q = Q[i];

		extend(u, q.u, ans);
		extend(v, q.v, ans);

		update(time, q.time, ans);

		Node *p = lca(u, v);
		reverse(p, ans);
		*q.ans = ans;
		reverse(p, ans);

#ifdef DBG
		printf("query(%lu, %lu) = %lld\n", u - N, v - N, *q.ans);
		printf("added:");
		for (int i = 1; i <= n; i++) if (N[i].added) printf(" %d", i);
		puts("");
#endif
	}
}

int main() {
	scanf("%d %d %d", &n, &max, &m);
	blockSize = pow(n, 2.0 / 3);
	for (int i = 1; i <= max; i++) scanf("%d", &v[i]);
	for (int i = 1; i <= n; i++) scanf("%d", &w[i]);

	for (int i = 1; i <= n - 1; i++) {
		int u, v;
		scanf("%d %d", &u, &v);

		addEdge(u, v);
	}

	for (int i = 1; i <= n; i++) scanf("%d", &N[i].w);

	static long long ans[MAXN + 1];
	for (int i = 1; i <= m; i++) {
		int t, x, y;
		scanf("%d %d %d", &t, &x, &y);

		if (t == 0) {
			++cntUpdate;
			U[cntUpdate].v = &N[x];
			U[cntUpdate].newVal = y;
		} else {
			if (x > y) std::swap(x, y);

			++cntQuery;
			Q[cntQuery].u = &N[x];
			Q[cntQuery].v = &N[y];
			Q[cntQuery].time = cntUpdate;
			Q[cntQuery].ans = &ans[cntQuery];
		}
	}

	assignBlocks();
	split();
	prepare();

	std::sort(Q + 1, Q + cntQuery + 1);

	solve();

	for (int i = 1; i <= cntQuery; i++) printf("%lld\n", ans[i]);

	return 0;
}
```
