title: 「ZJOI2007」最大半连通子图 - 强连通分量
categories: OI
tags: 
  - BZOJ
  - ZJOI
  - 强连通分量
  - Tarjan
  - 缩点
  - DP
permalink: zjoi2007-semi
date: 2016-09-04 07:38:00
---

一个有向图 $ G = (V, E) $ 称为半连通的（Semi-Connected），如果满足：

> $ \forall u, v \in V $，满足 $ u \rightarrow v $ 或 $ v \rightarrow u $，即对于图中任意两点 $ u $，$ v $，存在一条 $ u $ 到 $ v $ 的有向路径或者从 $ v $ 到 $ u $ 的有向路径。

若 $ G' = (V', E') $ 满足 $ V' \subseteq V $，$ E' $ 是 $ E $ 中所有跟 $ V' $ 有关的边，则称 $ G' $ 是 $ G $ 的一个导出子图。  
若 $ G' $ 是 $ G $ 的导出子图，且 $ G' $ 半连通，则称 $ G' $ 为 $ G $ 的半连通子图。  
若 $ G' $ 是 $ G $ 所有半连通子图中包含节点数最多的，则称 $ G' $ 是 $ G $ 的最大半连通子图。

给定一个有向图 $ G $，请求出 $ G $ 的最大半连通子图拥有的节点数 $ K $，以及不同的最大半连通子图的数目 $ C $。由于 $ C $ 可能比较大，仅要求输出 $ C $ 对 $ X $ 的余数。

<!-- more -->

### 链接
[BZOJ 1093](http://www.lydsy.com/JudgeOnline/problem.php?id=1093)

### 题解
显然，一个强连通分量中的点是半连通的，一条链上的所有点是半连通的。

将原图的强连通分量缩为点，问题转化为求 DAG 上最长路，拓扑排序后 DP 即可。

对于方案统计，求出从起点到每一个点的最长路 $ d(i) $ 后，对于每条边 $ u \rightarrow v $，如果 $ d(v) = d(u) + s(v) $（$ s(i) $ 表示点 $ i $ 所对应原图的强连通分量大小），则这条边在一条或多条最长路中，对所有在最长路上的边构成的图求路径数即可。

注意重边需要特判。

### 代码
```c++
#include <cstdio>
#include <algorithm>
#include <queue>
#include <stack>
#include <tr1/unordered_set>

const int MAXN = 100000;
const int MAXM = 1000000;
const int MAXX = 100000000;

struct Node {
	struct Edge *e, *c;
	struct SCC *s;
	Node *p;
	bool inStack, pushed, visited;
	int dfn, low, d, sum;
} N[MAXN];

struct Edge {
	Node *s, *t;
	Edge *next;

	Edge(Node *s, Node *t) : s(s), t(t), next(s->e) {}
};

struct SCC {
	Node v;
	int size, inDegree, in, len, sum;
} S[MAXN];

inline void addEdge(const int s, const int t) {
	N[s].e = new Edge(&N[s], &N[t]);
}

int n, x;

inline int tarjan() {
	int cnt = 0, ts = 0;
	for (int i = 0; i < n; i++) {
		if (N[i].visited) continue;

		std::stack<Node *> s, t;
		s.push(&N[i]);
		N[i].pushed = true;
		
		while (!s.empty()) {
			Node *v = s.top();
			if (!v->visited) {
				v->visited = true;
				v->c = v->e;
				t.push(v);
				v->inStack = true;
				v->dfn = v->low = ++ts;
			}

			if (v->c) {
				Edge *&e = v->c;
				if (e->t->inStack) v->low = std::min(v->low, e->t->dfn);
				else if (!e->t->pushed) e->t->pushed = true, e->t->p = v, s.push(e->t);
				e = e->next;
			} else {
				s.pop();

				if (v->dfn == v->low) {
					SCC *scc = &S[cnt++];
					scc->v.s = scc;
					Node *u;
					do {
						u = t.top();
						t.pop();
						u->inStack = false;
						u->s = scc;
						scc->size++;
					} while (u != v);
				}

				if (v->p) v->p->low = std::min(v->p->low, v->low);
			}
		}
	}

	return cnt;
}

inline void contract() {
	std::tr1::unordered_set<unsigned long long> s;
	for (int i = 0; i < n; i++) {
		for (Edge *e = N[i].e; e; e = e->next) {
			unsigned long long x = (static_cast<unsigned long long>(e->s->s - S) << 32) | static_cast<unsigned long long>(e->t->s - S);
			if (e->s->s != e->t->s && !s.count(x)) {
				s.insert(x);
				// printf("[%ld, %ld]\n", e->s->s - S + 1, e->t->s - S + 1);
				e->s->s->v.e = new Edge(&e->s->s->v, &e->t->s->v);
				e->t->s->inDegree++;
			}
		}
	}
}

inline int dp(const int cnt) {
	std::queue<Node *> q;
	for (int i = 0; i < cnt; i++) {
		// printf("size[%d] = %d\n", i, S[i].size);
		if (S[i].inDegree == 0) q.push(&S[i].v);
		S[i].v.d = S[i].size;
		S[i].in = S[i].inDegree;
	}

	while (!q.empty()) {
		Node *v = q.front();
		q.pop();

		for (Edge *e = v->e; e; e = e->next) {
			e->t->d = std::max(e->t->d, v->d + e->t->s->size);
			if (!--e->t->s->in) {
				q.push(e->t);
			}
		}
	}

	int ans = 0;
	for (int i = 0; i < cnt; i++) if (!S[i].v.e) ans = std::max(ans, S[i].v.d);
	return ans;
}

inline int dpSum(const int cnt, const int d) {
	std::queue<Node *> q;
	for (int i = 0; i < cnt; i++) {
		if (S[i].inDegree == 0) {
			q.push(&S[i].v);
			S[i].v.sum = 1;
		}
		S[i].in = S[i].inDegree;
	}

	while (!q.empty()) {
		Node *v = q.front();
		q.pop();

		for (Edge *e = v->e; e; e = e->next) {
			if (e->t->d == v->d + e->t->s->size) (e->t->sum += v->sum) %= x;
			if (!--e->t->s->in) {
				q.push(e->t);
			}
		}
	}

	int ans = 0;
	for (int i = 0; i < cnt; i++) if (S[i].v.d == d) (ans += S[i].v.sum) %= x;
	return ans;
}

int main() {
	int m;
	scanf("%d %d %d", &n, &m, &x);

	while (m--) {
		int u, v;
		scanf("%d %d", &u, &v), u--, v--;
		addEdge(u, v);
	}

	int cnt = tarjan();
	contract();

	int d = dp(cnt);

	printf("%d\n", d);
	printf("%d\n", dpSum(cnt, d));

	return 0;
}
```