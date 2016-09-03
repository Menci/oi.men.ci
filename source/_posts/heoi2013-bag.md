title: 「HEOI2013」Eden 的新背包问题 - 背包DP
categories: OI
tags: 
  - BZOJ
  - HEOI
  - DP
  - 背包DP
permalink: heoi2013-bag
date: 2016-07-11 23:10:00
---

有 $ n $ 个玩偶，每个玩偶有对应的价值、价钱，每个玩偶都可以被买有限次，在携带的价钱 $ m $ 固定的情况下，如何选择买哪些玩偶以及每个玩偶买多少个，才能使得选择的玩偶总价钱不超过 $ m $，且价值和最大。

多次询问，每次询问都将给出新的总价钱，并且会去掉某个玩偶（即这个玩偶不能被选择），再问此时的多重背包的答案。

<!-- more -->

### 链接
[BZOJ 3163](http://www.lydsy.com/JudgeOnline/problem.php?id=3163)

### 题解
用 $ f(i, j) $ 表示第 $ i $ 件**及其之前**物品装进容量为 $ j $ 的背包中的最大收益；用 $ g(i, j) $ 表示第 $ i $ 件**及其之后**物品装进容量为 $ j $ 的背包中的最大收益；

对于无法选择 $ a $ 物品，背包容量为 $ m $，答案为

$$
\max\limits_{i = 0} ^ {m} \{ f(a - 1, i) + g(a + 1, m - i) \}
$$

### 代码
```c++
#include <cstdio>
#include <algorithm>
#include <utility>

const int MAXN = 1000;
const int MAXM = 1000;
const int MAXLOGN = 10;
const int MAXQ = 300000;

int main() {
	int n;
	static int w[MAXN], v[MAXN], cnt[MAXN];

	scanf("%d", &n);
	for (int i = 0; i < n; i++) scanf("%d %d %d", &w[i], &v[i], &cnt[i]);

	static std::pair<int, int> r[MAXN];
	static int W[MAXN * MAXLOGN], V[MAXN * MAXLOGN];
	int N = 0;
	for (int i = 0; i < n; i++) {
		r[i].first = N + 1;
		for (int j = 1; j <= cnt[i]; cnt[i] -= j, j *= 2) {
		// for (int j = 1; cnt[i]; cnt[i]--) {
			N++;
			W[N] = w[i] * j;
			V[N] = v[i] * j;
		}
		if (cnt[i]) {
			N++;
			W[N] = w[i] * cnt[i];
			V[N] = v[i] * cnt[i];
		}
		r[i].second = N;
	}

	static int f[MAXN * MAXLOGN + 1][MAXM + 1], g[MAXN * MAXLOGN + 2][MAXM + 1];
	// for (int i = 0; i <= N; i++) f[i][0] = 1;
	// for (int i = 1; i <= N + 1; i++) g[i][0] = 1;

	for (int i = 1; i <= N; i++) {
		for (int j = 0; j <= MAXM; j++) {
			if (j < W[i]) f[i][j] = f[i - 1][j];
			else f[i][j] = std::max(f[i - 1][j], f[i - 1][j - W[i]] + V[i]);
		}
	}

	for (int i = N; i >= 1; i--) {
		for (int j = 0; j <= MAXM; j++) {
			if (j < W[i]) g[i][j] = g[i + 1][j];
			else g[i][j] = std::max(g[i + 1][j], g[i + 1][j - W[i]] + V[i]);
		}
	}

	int q;
	scanf("%d", &q);
	for (int i = 0; i < q; i++) {
		int id, m;
		scanf("%d %d", &id, &m);

		int ans = 0, a = r[id].first - 1, b = r[id].second + 1;
		for (int j = 0; j <= m; j++) ans = std::max(ans, f[a][j] + g[b][m - j]);

		printf("%d\n", ans);
	}

	return 0;
}
```
