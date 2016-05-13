title: 「COGS 731」最长递增子序列 - 线性DP + 网络流
categories: OI
tags: 
  - COGS
  - 图论
  - 网络流
  - Dinic
  - 网络流 24 题
permalink: cogs-731
id: 48
updated: '2016-02-09 14:40:10'
date: 2016-02-09 14:37:32
---

给定正整数序列 `X1 ~ Xn`。

1. 计算其最长递增子序列的长度 `s`。
2. 计算从给定的序列中最多可取出多少个长度为 `s` 的递增子序列。
3. 如果允许在取出的序列中多次使用 `X1` 和 `Xn`，则从给定序列中最多可取出多少个长度为 `s` 的递增子序列。

<!-- more -->

### 链接
[COGS 731](http://cogs.top/cogs/problem/problem.php?pid=731)

### 题解
首先，重要的事情说三遍：**非严格递增！非严格递增！非严格递增！**

设以 $X_i$ 结尾的最长递增子序列长度为 $F_i$，用动态规划求出每个 $F_i$，最大的一个就是第一问答案，设它为 $K$。

第二问采用网络流建模：

1. 对于每个满足 $F_i = K$ 的点，从该点向汇点连一条边，容量为 1；
2. 对于每个满足 $F_i = 1$ 的点，从源点向该点连一条边，容量为 1；
3. 对于第一问中每一次所有的有效状态转移（即满足$ X_j≤X_i $且$F_i=F_j+1$的点对 `i`、`j`）从 `j` 向 `i` 连一条边，容量为 1。

求出最大流即为答案。

但是这样做有个问题，某一个点可能被使用所次，不符合题目要求。解决方法是把每一个点 `i` 拆成两个点 `i` 和 `i'`，所有进入该点的边连接 `i`，所有出该点边从 `i'` 连出，并从 `i` 到 `i'` 连接一条容量为 1 的边，保证了流过每个点的流量最多为 1。

第三问只需要在第二问的基础上做出一些修改，把所有与 `1`、`n` 两个点相关的边容量改为无穷大，就可以使这两个数“可多次使用”。

**注意特判**，如果输入进来的是一个严格递降序列，答案就是 1、N、N。从这里我们可以看出细节的重要性以及出题人的恶意。

### 代码
```cpp
#include <cstdio>
#include <climits>
#include <cstring>
#include <algorithm>
#include <queue>
#include <vector>

const int MAXN = 500;

struct Node;
struct Edge;

struct Node {
	Edge *firstEdge;
	int level, id;
} nodes[MAXN * 2 + 2];

struct Edge {
	Node *from, *to;
	int capacity, flow;
	Edge *next, *reversedEdge;

	Edge(Node *from, Node *to, int capacity) : from(from), to(to), capacity(capacity), flow(0), next(from->firstEdge) {}
};

int n, a[MAXN], f[MAXN], k;

struct Dinic {
	bool makeLevelGraph(Node *s, Node *t, int n) {
		for (int i = 0; i < n; i++) nodes[i].level = 0;

		std::queue<Node *> q;
		q.push(s);
		s->level = 1;

		while (!q.empty()) {
			Node *v = q.front();
			q.pop();

			for (Edge *e = v->firstEdge; e; e = e->next) {
				if (e->flow < e->capacity && e->to->level == 0) {
					e->to->level = v->level + 1;
					if (e->to == t) return true;
					else q.push(e->to);
				}
			}
		}

		return false;
	}

	int findPath(Node *s, Node *t, int limit) {
		if (s == t) return limit;

		for (Edge *e = s->firstEdge; e; e = e->next) {
			if (e->flow < e->capacity && e->to->level == s->level + 1) {
				int flow = findPath(e->to, t, std::min(e->capacity - e->flow, limit));
				if (flow > 0) {
					e->flow += flow;
					e->reversedEdge->flow -= flow;
					return flow;
				}
			}
		}

		return 0;
	}

	int operator()(int s, int t, int n) {
		int ans = 0;
		while (makeLevelGraph(&nodes[s], &nodes[t], n)) {
			int flow;
			while ((flow = findPath(&nodes[s], &nodes[t], INT_MAX)) > 0) ans += flow;
		}

		return ans;
	}
} dinic;

inline void addEdge(int from, int to, int capacity) {
	nodes[from].firstEdge = new Edge(&nodes[from], &nodes[to], capacity);
	nodes[to].firstEdge = new Edge(&nodes[to], &nodes[from], 0);

	nodes[from].firstEdge->reversedEdge = nodes[to].firstEdge, nodes[to].firstEdge->reversedEdge = nodes[from].firstEdge;
}

inline int dp() {
	int ans = 0;
	for (int i = 0; i < n; i++) {
		int last = 0;

		for (int j = 0; j < i; j++) {
			if (a[j] <= a[i] && f[j] > last) last = f[j];
		}

		f[i] = last + 1;
		ans = std::max(ans, f[i]);
	}

	return ans;
}

inline int solve2() {
	memset(nodes, 0, sizeof(Node) * (n * 2 + 2));

	const int s = 0, t = n * 2 + 1;
	for (int i = 1; i <= n; i++) {
		addEdge(i, i + n, 1);

		if (f[i - 1] == 1) addEdge(s, i, 1);
		else if (f[i - 1] == k) addEdge(i + n, t, 1);

		for (int j = 1; j < i; j++) {
			if (f[j - 1] == f[i - 1] - 1) addEdge(j + n, i, 1);
		}
	}

	return dinic(s, t, n * 2 + 2);
}

inline int solve3() {
	memset(nodes, 0, sizeof(Node) * (n * 2 + 2));

	const int s = 0, t = n * 2 + 1;
	for (int i = 1; i <= n; i++) {
		int capacity = 1;
		if (i == 1 || i == n) capacity = INT_MAX;

		addEdge(i, i + n, capacity) ;

		if (f[i - 1] == 1) addEdge(s, i, capacity);
		else if (f[i - 1] == k) addEdge(i + n, t, capacity);

		for (int j = 1; j < i; j++) {
			if (f[j - 1] == f[i - 1] - 1 && a[j - 1] <= a[i - 1]) addEdge(j + n, i, 1);
		}
	}

	return dinic(s, t, n * 2 + 2);
}

int main() {
	freopen("alis.in", "r", stdin);
	freopen("alis.out", "w", stdout);

	scanf("%d", &n);

	for (int i = 0; i < n; i++) {
		scanf("%d", &a[i]);
	}

	k = dp();
	printf("%d\n", k);

	if (k == 1) printf("%d\n%d\n", n, n);
	else {
		printf("%d\n", solve2());
		printf("%d\n", solve3());
	}

	fclose(stdin);
	fclose(stdout);

	return 0;
}
```
