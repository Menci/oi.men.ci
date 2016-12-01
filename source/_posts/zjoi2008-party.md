title: 「ZJOI2008」生日聚会 - DP
categories: OI
tags: 
  - BZOJ
  - ZJOI
  - DP
permalink: zjoi2008-party
date: 2016-11-13 10:00:00
---

对于任意连续的一段，男孩与女孩的数目之差不超过 $ k $。假设参加 party 的人中共有 $ n $ 个男孩与 $ m $ 个女孩，求方案总数。

<!-- more -->

### 链接
[BZOJ 1037](http://www.lydsy.com/JudgeOnline/problem.php?id=1037)

### 题解
设 $ f(i, j, p, q) $ 表示前 $ i $ 个人中，有 $ j $ 个男孩，包含第 $ i $ 个人的连续区间中，男孩最多比女孩多 $ p $ 个，女孩最多比男孩多 $ q $ 个，的方案数。

如果第 $ i $ 个是男孩

$$ f(i, j, p, q) \rightarrow f(i + 1, j + 1, p + 1, \max(q - 1, 0)) $$


如果第 $ i $ 个是男孩

$$ f(i, j, p, q) \rightarrow f(i + 1, j, \max(p - 1, 0), q + 1) $$

答案即为 $ \sum\limits_{p = 0} ^ k \sum\limits_{q = 0} ^ k f(n + m, n, p, q) $。

### 代码
```c++
#include <cstdio>
#include <algorithm>

const int MAXN = 150;
const int MAXK = 20;
const int MOD = 12345678;

int main() {
	int n, m, k;
	scanf("%d %d %d", &n, &m, &k);

	// f[i][j][p][q], left i, j boys, max(boys - girls) = p, max(girls - boys) = q
	static int f[MAXN * 2 + 1][MAXN + 1][MAXK + 2][MAXK + 2];
	f[0][0][0][0] = 1;
	for (int i = 0; i < n + m; i++) {
		for (int j = 0; j <= n; j++) {
			for (int p = 0; p <= k; p++) {
				for (int q = 0; q <= k; q++) {
					// Add a boy
					(f[i + 1][j + 1][p + 1][std::max(q - 1, 0)] += f[i][j][p][q]) %= MOD;
					// Add a girl
					(f[i + 1][j][std::max(p - 1, 0)][q + 1] += f[i][j][p][q]) %= MOD;
				}
			}
		}
	}

	int ans = 0;
	for (int p = 0; p <= k; p++) for (int q = 0; q <= k; q++) (ans += f[n + m][n][p][q]) %= MOD;
	printf("%d\n", ans);

	return 0;
}
```