title: 「SCOI2009」粉刷匠 - 背包 DP
categories: OI
tags: 
  - BZOJ
  - SCOI
  - DP
  - 背包 DP
permalink: scoi2009-paint
date: 2016-07-11 22:59:00
---

windy 有 $ N $ 条木板需要被粉刷。每条木板被分为 $ M $ 个格子。 每个格子要被刷成红色或蓝色。 windy 每次粉刷，只能选择一条木板上一段连续的格子，然后涂上一种颜色。每个格子最多只能被粉刷一次。如果 windy 只能粉刷 $ T $ 次，他最多能正确粉刷多少格子？

一个格子如果未被粉刷或者被粉刷错颜色，就算错误粉刷。

<!-- more -->

### 链接
[BZOJ 1296](http://www.lydsy.com/JudgeOnline/problem.php?id=1296)

### 题解
对于每一行，用 $ f(j, k) $ 表示前 $ j $ 个格子刷 $ k $ 次的最大正确数量。枚举最后一次刷的区间，刷较多的颜色。

用 $ w(i, j) $ 表示第 $ i $ 行刷 $ j $ 次的最大正确数量。最后用背包求解即可。

### 代码
```c++
#include <cstdio>
#include <cstring>
#include <algorithm>

const int MAXN = 50;
const int MAXM = 50;
const int MAXT = 2500;

int main() {
	int n, m, t;
	scanf("%d %d %d", &n, &m, &t);

	static int w[MAXN][MAXM + 1], f[MAXM + 1][MAXM + 1];
	for (int i = 0; i < n; i++) {
		memset(f, 0, sizeof(f));
		static char s[MAXM + 1];
		scanf("%s", s);

		for (int j = 1; j <= m; j++) {
			for (int k = 1; k <= j; k++) {
				int cnt[2] = { 0, 0 };
				for (int l = j - 1; l >= k - 1; l--) {
					cnt[s[l] - '0']++;
					f[j][k] = std::max(f[j][k], f[l][k - 1] + std::max(cnt[0], cnt[1]));
					w[i][k] = std::max(w[i][k], f[j][k]);
				}
				// printf("f[%d][%d][%d] = %d\n", i, j, k, f[j][k]);
			}
		}

		// for (int j = 1; j <= m; j++) printf("w[%d][%d] = %d\n", i, j, w[i][j]);
	}

	static int g[MAXT + 1];
	for (int i = 0; i < n; i++) {
		for (int j = t; j >= 0; j--) {
			for (int k = 1; k <= m; k++) {
				if (k <= j) g[j] = std::max(g[j], g[j - k] + w[i][k]);
			}
		}
	}

	printf("%d\n", g[t]);

	return 0;
}
```
