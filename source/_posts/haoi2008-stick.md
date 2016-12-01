title: 「HAOI2008」木棍分割 - 二分 + DP
categories: OI
tags: 
  - BZOJ
  - HAOI
  - 二分
  - DP
permalink: haoi2008-stick
date: 2016-11-13 11:31:00
---

有 $ n $ 根木棍，第 $ i $ 根木棍的长度为 $ L_i $，$ n $ 根木棍依次连结了一起，总共有 $ n - 1 $ 个连接处。现在允许你最多砍断 $ m $ 个连接处，砍完后 $ n $ 根木棍被分成了很多段，要求满足总长度最大的一段长度最小，和有多少种砍的方法使得总长度最大的一段长度最小。

<!-- more -->

### 链接
[BZOJ 1044](http://www.lydsy.com/JudgeOnline/problem.php?id=1044)

### 题解
第一问，求最大一段长度最小，二分答案，设答案为 $ t $。

第二问，求方案数，设 $ f(i, j) $ 表示前 $ i $ 根木棍，分成 $ j $ 段，最大长度不大于 $ t $ 的方案数。

设前缀和 $ s(i) $ 为前 $ i $ 根木棍的和

$$ f(i, j) = \sum\limits_{s(i) - s(k - 1) \leq t} f(k - 1, j - 1)  $$

显然，满足条件的 $ k $ 一定是紧贴着 $ i $ 的连续的一段，并且对于同一个 $ j $，最小的 $ k $ 是不降的。

对 $ f(i, j - 1) $ 的 $ i $ 做前缀和，每次找到满足条件的 $ k $ 即可。

需要滚动数组。

### 代码
```c++
#include <cstdio>
#include <algorithm>

const int MAXN = 50000;
const int MAXM = 1000;
const int MO = 10007;

int n, m, a[MAXN + 1], s[MAXN + 1];

inline bool check(int limit) {
	int k = m, s = 0;
	for (int i = 1; i <= n; i++) {
		if (s + a[i] > limit) k--, s = a[i];
		else s += a[i];
	}
	return k >= 1;
}

int main() {
	scanf("%d %d", &n, &m), m++;

	int max = 0;
	for (int i = 1; i <= n; i++) scanf("%d", &a[i]), max = std::max(max, a[i]);
	for (int i = 1; i <= n; i++) s[i] = s[i - 1] + a[i];

	int l = max, r = s[n];
	while (r - l >= 5) {
		int mid = l + (r - l) / 2;
		// printf("[%d, %d, %d]\n", l, r, mid);
		if (check(mid)) r = mid;
		else l = mid;
	}

	int ans;
	for (int i = l; i <= r; i++) {
		if (check(i)) {
			ans = i;
			break;
		}
	}

	printf("%d ", ans);

	int tot = 0;
	static int f[MAXN + 1][2];
	for (int i = 1; i <= n; i++) f[i][1] = s[i] <= ans ? 1 : 0;
	for (int j = 2; j <= m; j++) {
		for (int i = 1; i <= n; i++) (f[i][(j - 1) & 1] += f[i - 1][(j - 1) & 1]) %= MO;
		for (int i = 1, k = j; i <= n; i++) {
			f[i][j & 1] = 0;
			while (k <= i && s[i] - s[k - 1] > ans) k++;
			if (k <= i && s[i] - s[k - 1] <= ans) {
				// printf("f(%d, %d) += f([%d, %d], %d)\n", i, j, i - 1, k - 1, j - 1);
				(f[i][j & 1] += f[i - 1][(j - 1) & 1] - f[k - 2][(j - 1) & 1]) %= MO;
			}

			/*
			for (int k = j; k <= i; k++) {
				if (s[i] - s[k - 1] <= ans) {
					f[i][j] += f[k - 1][j - 1];
				}
			}
			*/

			// printf("f(%d, %d) = %d\n", i, j, f[i][j]);

			// f[i][j] += f[i - 1][j];
		}
		(tot += f[n][j & 1]) %= MO;
	}

	// for (int i = 1; i <= n; i++) for (int j = 1; j <= m; j++) printf("f(%d, %d) = %d\n", i, j, f[i][j]);

	printf("%d\n", (tot + MO) % MO);

	return 0;
}
```