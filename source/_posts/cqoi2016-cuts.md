title: 「CQOI2016」不同的最小割 - 分治 + 网络流
date: 2016-04-21 18:57:52
categories: OI
tags:
  - CQOI
  - BZOJ
  - 网络流
  - Dinic
  - 分治
permalink: cqoi2016-cuts
---

对于一个图，某个对图中结点的划分将图中所有结点分成两个部分，如果结点 $ s $，$ t $ 不在同一个部分中，则称这个划分是关于 $ s $，$ t $ 的割。对于带权图来说，将所有顶点处在不同部分的边的权值相加所得到的值定义为这个割的容量，而 $ s $，$ t $ 的最小割指的是在关于 $ s $，$ t $ 的割中容量最小的割。

考虑有 $ N $ 个点的无向连通图中所有点对的最小割的容量，共能得到 $ \frac{N(N − 1)}{2} $个数值。这些数值中互不相同的有多少个呢？

<!-- more -->

### 链接
[BZOJ 4519](http://www.lydsy.com/JudgeOnline/problem.php?id=4519)

### 题解
首先从所有点中，任选两个点 $ s $、$ t $ 做最小割，可以得到 $ S $ 和 $ T $ 两个集合。

然后从 $ S $ 集合（$ T $ 集合对应相同）中任选一个点 $ u $，做 $ s $ 和 $ u $ 的最小割（全局），得到两个集合 $ S' $、$ T' $，取出 $ S $ 和 $ S' $ 的交集，作为新的集合递归下去。直到集合中只剩下一个点为止。

上述操作共进行了 $ N - 1 $ 次，所得的所有最小割容量中不同的数量即为答案。

### 代码
```c++
#include <cstdio>
#include <climits>
#include <algorithm>
#include <queue>
#include <vector>
#include <tr1/unordered_set>

const int MAXN = 7800;
const int MAXM = 78000;

const int S = 1;
const int T = -1;

struct Node;
struct Edge;

struct Node {
	Edge *e, *c;
	int l, set, lastSet, time;
} N[MAXN];

struct Edge {
	Node *s, *t;
	int f, c;
	Edge *next, *r;

	Edge(Node *const s, Node *const t, const int c) : s(s), t(t), f(0), c(c), next(s->e) {}
};

struct Dinic {
	bool makeLevelGraph(Node *const s, Node *const t, const int n) {
		for (int i = 0; i < n; i++) N[i].l = 0, N[i].c = N[i].e;

		std::queue<Node *> q;
		q.push(s);
		s->l = 1;

		while (!q.empty()) {
			Node *v = q.front();
			q.pop();

			for (Edge *e = v->e; e; e = e->next) if (e->f < e->c && e->t->l == 0) {
				e->t->l = v->l + 1;
				if (e->t == t) return true;
				else q.push(e->t);
			}
		}

		return false;
	}

	int findPath(Node *const s, Node *const t, const int limit = INT_MAX) {
		if (s == t) return limit;
		for (Edge *&e = s->c; e; e = e->next) if (e->f < e->c && e->t->l == s->l + 1) {
			const int f = findPath(e->t, t, std::min(limit, e->c - e->f));
			if (f > 0) {
				e->f += f, e->r->f -= f;
				// printf("[%ld => %ld] = %d\n", s - N + 1, t - N + 1, f);
				return f;
			}
		}

		return 0;
	}

	int operator()(const int s, const int t, const int n) {
		int ans = 0;
		while (makeLevelGraph(&N[s], &N[t], n)) {
			// puts("Leveled!");
			int f;
			while ((f = findPath(&N[s], &N[t])) > 0) ans += f;
		}

		// printf("dinic(%d, %d, %d) = %d\n", s + 1, t + 1, n, ans);
		return ans;
	}
} dinic;

inline void addEdge(const int u, const int v, const int c) {
	N[u].e = new Edge(&N[u], &N[v], c);
	N[v].e = new Edge(&N[v], &N[u], c);
	N[u].e->r = N[v].e, N[v].e->r = N[u].e;
}

int n, m;

inline void cleanUp() {
	for (int i = 0; i < n; i++) for (Edge *e = N[i].e; e; e = e->next) e->f = 0;
}

inline void minCut(const int s, const int t) {
	for (int i = 0; i < n; i++) N[i].set = T;

	static int time = 0;
	time++;

	const int S = 1, T = -1;

	std::queue<Node *> q;
	q.push(&N[s]);
	N[s].set = S;
	while (!q.empty()) {
		Node *v = q.front();
		q.pop();

		for (Edge *e = v->e; e; e = e->next) if (e->f < e->c && e->t->time != time) {
			e->t->time = time;
			e->t->set = S;
			q.push(e->t);
		}
	}
}

inline void reMark(const std::vector<int> &vs, const std::vector<int> &vt) {
	for (std::vector<int>::const_iterator p = vs.begin(); p != vs.end(); p++) N[*p].lastSet = S;
	for (std::vector<int>::const_iterator p = vt.begin(); p != vt.end(); p++) N[*p].lastSet = T;
}

std::tr1::unordered_set<int> set;
inline void solve(const int s, const int t, const int lastSet) {
	cleanUp();
	int f = dinic(s, t, n);
	set.insert(f);

	minCut(s, t);
	std::vector<int> vs, vt;
	for (int i = 0; i < n; i++) {
		if (N[i].set == S && (N[i].lastSet == lastSet || lastSet == 0)) vs.push_back(i);
		else if (N[i].set == T && (N[i].lastSet == lastSet || lastSet == 0)) vt.push_back(i);
	}

	for (std::vector<int>::const_iterator p = vs.begin(); p != vs.end(); p++) if (*p != s) {
		reMark(vs, vt);
		solve(s, *p, S);
		break;
	}
	
	for (std::vector<int>::const_iterator p = vt.begin(); p != vt.end(); p++) if (*p != t) {
		reMark(vs, vt);
		solve(*p, t, T);
		break;
	}
}

inline int solve() {
	if (n < 2) return 0;
	else {
		solve(0, 1, 0);
		return set.size();
	}
}

int main() {
	// freopen("cuts.in", "r", stdin);
	// freopen("cuts.out", "w", stdout);

	scanf("%d %d", &n, &m);

	for (int i = 0; i < m; i++) {
		int u, v, w;
		scanf("%d %d %d", &u, &v, &w), u--, v--;

		addEdge(u, v, w);
	}

	printf("%d\n", solve());

	fclose(stdin);
	fclose(stdout);

	return 0;
}
```
