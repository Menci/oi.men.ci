title: 「NOIP2012」开车旅行 - 倍增
categories: OI
tags: 
  - NOIP
  - CodeVS
  - 倍增
permalink: noip2012-drive
date: 2016-11-13 17:14:00
---

小 A 和小 B 决定利用假期外出旅行，他们将想去的城市从 $ 1 $ 到 $ N $ 编号，且编号较小的城市在编号较大的城市的西边，已知各个城市的海拔高度互不相同，记城市 $ i $ 的海拔高度为 $ H_i $，城市 $ i $ 和城市 $ j $ 之间的距离 $ d(i, j) $ 恰好是这两个城市海拔高度之差的绝对值，即 $ d(i, j) = |H_i − H_j| $。

旅行过程中，小 A 和小 B 轮流开车，第一天小 A 开车，之后每天轮换一次。他们计划选择一个城市 $ S $ 作为起点，一直向东行驶，并且最多行驶 $ X $ 公里就结束旅行。小 A 和小 B 的驾驶风格不同，小 B 总是沿着前进方向选择一个最近的城市作为目的地，而小 A 总是沿着前进方向选择第二近的城市作为目的地（注意：本题中如果当前城市到两个城市的距离相同，则认为离海拔低的那个城市更近）。如果其中任何一人无法按照自己的原则选择目的城市，或者到达目的地会使行驶的总距离超出 $ X $ 公里，他们就会结束旅行。

在启程之前，小 A 想知道两个问题：

1. 对于一个给定的 $ X = X_0 $，从哪一个城市出发，小 A 开车行驶的路程总数与小 B 行驶的路程总数的比值最小（如果小 B 的行驶路程为 $ 0 $，此时的比值可视为无穷大，且两个无穷大视为相等）。如果从多个城市出发，小 A 开车行驶的路程总数与小 B 行驶的路程总数的比值都最小，则输出海拔最高的那个城市。
2. 对任意给定的 $ X = X_i $ 和出发城市 $ S_i $，小 A 开车行驶的路程总数以及小 B 行驶的路程总数。

<!-- more -->

### 链接
[CodeVS 1199](http://codevs.cn/problem/1199/)

### 题解
使用排序 + 链表求出在以个点为起点时，小 A 和小 B 开车到达的地点。

设 $ f(k, i, j) $ 表示以小 A（$ k = 0 $）或小 B（$ k = 1 $）开始，以 $ i $ 为起点，$ 2 ^ j $ 天后到达的地点；$ g(k, i, j, l) $ 表示以小 A（$ k = 0 $）或小 B（$ k = 1 $）开始，以 $ i $ 为起点，$ 2 ^ j $ 天内，小 A（$ l = 0 $）或小 B（$ l = 1 $）或二者之和 $ l = 2 $ 的路程。

对于第一问，枚举起点即可。

### 代码
```c++
#include <cstdio>
#include <algorithm>
#include <vector>
#include <list>

const int MAXN = 100000;
const int MAXN_LOG = 17; // Math.log2(100000) = 16.609640474436812
const int MAXM = 10000;

struct Node {
	long long x;
	Node *nextA, *nextB;
	std::list<Node *>::iterator it;
} N[MAXN + 1];

int n, logn, f[2][MAXN + 1][MAXN_LOG + 1];
long long g[2][MAXN + 1][MAXN_LOG + 1][3];

inline bool compareNode(Node *a, Node *b) {
	return a->x < b->x;
}

inline bool comparePair(const std::pair<long long, Node *> &a, const std::pair<long long, Node *> &b) {
	if (a.first == b.first) return a.second->x < b.second->x;
	else return a.first < b.first;
}

inline void prepare() {
	std::list<Node *> list;
	for (int i = 1; i <= n; i++) {
		list.push_back(&N[i]);
		N[i].it = --list.end();
	}

	list.sort(&compareNode);

	for (int i = 1; i <= n; i++) {
		std::vector< std::pair<long long, Node *> > vec;

		std::list<Node *>::iterator near;
		near = N[i].it, near++;

		if (near != list.end()) {
			vec.push_back(std::make_pair(abs((*near)->x - N[i].x), *near));

			if (++near != list.end()) {
				vec.push_back(std::make_pair(llabs((*near)->x - N[i].x), *near));
			}
		}

		near = N[i].it;
		if (near != list.begin()) {
			near--;
			vec.push_back(std::make_pair(abs((*near)->x - N[i].x), *near));

			if (near != list.begin()) {
				near--;
				vec.push_back(std::make_pair(llabs((*near)->x - N[i].x), *near));
			}
		}

		std::sort(vec.begin(), vec.end(), comparePair);

		if (vec.size() >= 2) {
			N[i].nextA = vec[1].second;
#ifdef DBG
			printf("nextA(%lld) = %lld\n", N[i].x, N[i].nextA->x);
#endif
		} else N[i].nextA = &N[0];

		if (vec.size() >= 1) {
			N[i].nextB = vec[0].second;
#ifdef DBG
			printf("nextB(%lld) = %lld\n", N[i].x, N[i].nextB->x);
#endif
		} else N[i].nextB = &N[0];

		list.erase(N[i].it);
	}
	N[0].nextA = N[0].nextB = &N[0];

	// Build graph
	for (int i = 1; i <= n; i++) {
		f[0][i][0] = N[i].nextA - N;
		f[0][i][1] = N[i].nextA->nextB - N;
		
		f[1][i][0] = N[i].nextB - N;
		f[1][i][1] = N[i].nextB->nextA - N;

		g[0][i][0][0] = g[0][i][0][2] = N[i].nextA == &N[0] ? 0 : llabs(N[i].x - N[i].nextA->x);
		g[0][i][0][1] = 0;

		g[1][i][0][1] = g[1][i][0][2] = N[i].nextB == &N[0] ? 0 : llabs(N[i].x - N[i].nextB->x);
		g[1][i][0][0] = 0;
	}

	for (int i = 1; i <= n; i++) {
		g[0][i][1][0] = g[0][i][0][0];
		g[0][i][1][1] = g[1][N[i].nextA - N][0][1];
		g[0][i][1][2] = g[0][i][0][0] + g[1][N[i].nextA - N][0][1];

		g[1][i][1][1] = g[1][i][0][1];
		g[1][i][1][0] = g[0][N[i].nextB - N][0][0];
		g[1][i][1][2] = g[1][i][0][1] + g[0][N[i].nextB - N][0][0];
	}

	while ((1 << logn) <= n) logn++;
	logn--;

	for (int j = 2; j <= logn; j++) {
		for (int i = 1; i <= n; i++) {
			for (int k = 0; k < 2; k++) {
				for (int l = 0; l < 3; l++) {
					g[k][i][j][l] = g[k][i][j - 1][l] + g[k][f[k][i][j - 1]][j - 1][l];
				}
				f[k][i][j] = f[k][f[k][i][j - 1]][j - 1];
			}
		}
	}

#ifdef DBG
	for (int j = 0; j <= logn; j++) {
		for (int i = 1; i <= n; i++) {
			for (int k = 0; k < 2; k++) {
				printf("f(%d, %d, %d) = %d [%lld]\n\n", k, i, j, f[k][i][j], N[f[k][i][j]].x);
				for (int l = 0; l < 3; l++) {
					printf("g(%d, %d, %d, %d) = %lld\n", k, i, j, l, g[k][i][j][l]);
				}
				putchar('\n');
			}
		}
	}
#endif
}

inline long long solve(int start, long long limit, long long &sumA, long long &sumB) {
	int curr = start;
	long long sum = sumA = sumB = 0;
	for (int i = logn; i >= 1 && curr != 0; i--) {
		while (curr && limit >= sum + g[0][curr][i][2]) {
			sum += g[0][curr][i][2];
			sumA += g[0][curr][i][0];
			sumB += g[0][curr][i][1];
			curr = f[0][curr][i];
		}
	}

	if (curr && limit >= sum + g[0][curr][0][0]) {
		sumA += g[0][curr][0][0];
		sum += g[0][curr][0][0];
	}

	return sum;
}

inline int solve(long long limit) {
	int ans = 0;
	double k = -1;
	for (int i = 1; i <= n; i++) {
		long long tmpA, tmpB;
		solve(i, limit, tmpA, tmpB);
		double t = static_cast<double>(tmpA) / static_cast<double>(tmpB);
		if (k == -1 || t < k || (t == k && N[i].x > N[ans].x)) {
			k = t;
			ans = i;
		}
	}
	return ans;
}

int main() {
	scanf("%d", &n);
	for (int i = 1; i <= n; i++) scanf("%lld", &N[i].x);

	prepare();

	long long limit;
	scanf("%lld", &limit);
	printf("%d\n", solve(limit));

	int m;
	scanf("%d", &m);
	while (m--) {
		int start;
		long long limit;
		scanf("%d %lld", &start, &limit);
		long long sumA, sumB;
		solve(start, limit, sumA, sumB);
		printf("%lld %lld\n", sumA, sumB);
	}

	return 0;
}
```
