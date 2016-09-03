title: 「SDOI2010」地精部落 - DP
date: 2016-06-20 15:49:00
categories: OI
tags:
  - BZOJ
  - SDOI
  - DP
permalink: sdoi2010-goblin
---

我们称一个排列是合法的，当且仅当每一个数都满足这个数比它相邻的数都要大或都要小。

求长度为 $ N $ 的合法排列数量。

<!-- more -->

### 链接
[BZOJ 1925](http://www.lydsy.com/JudgeOnline/problem.php?id=1925)

### 题解
题目相当于要求 $ 0 $ ~ $ n - 1 $ 的合法排列数。

设 $ f(i,\ j) $ 表示 $ 0 $ ~ $ i $ 的排列，第一个数为 $ j $（$ j \leq i $），**且第二个数比第一个数小**的方案数。

考虑第二个数，当第二个数**小于** $ j - 1 $ 时，其方案数为第一个数为 $ j - 1 $ 时的方案数，即 $ f(i,\ j - 1) $。  
当第二个数**等于** $ j - 1 $ 时，从第二个数开始，是一个 $ 0 $ ~ $ i - 1 $ 的排列，这个排列的第二个数比第一个数**大**。如果将每个数 $ x $ 变成 $ (i - 1) - x $，那么就变成原有的第二个数比第一个数小的情况了。即 $ f(i - 1,\ (i - 1) - (j - 1)) $。

所以转移方程为 $ f(i,\ j) = f(i,\ j - 1) + f(i - 1, i - j) $。

答案为 $ 2 \sum\limits_{i = 0} ^ {n - 1} f(n - 1,\ i) $，因为要考虑第二个数**大于**第一个数的方案数所以乘 $ 2 $。

### 代码
不使用滚动数组，内存 30M+ 是可以过的。

```c++
#include <cstdio>

const int MAXN = 4200;

int n, p;
int _f[MAXN * (MAXN + 1) / 2];
int *f[MAXN + 1];

inline void init() {
	int *curr = _f;
	for (int i = 0; i < n; i++) {
		f[i] = curr;
		curr += i + 1;
	}
	// printf("%ld %d\n", curr - _f, n * (n + 1) / 2);
}

int main() {
	scanf("%d %d", &n, &p);
	init();

	f[1][1] = 1;
	for (int i = 2; i < n; i++) {
		for (int j = 1; j <= i; j++) {
			f[i][j] = (f[i][j - 1] + f[i - 1][i - j]) % p;
			// printf("f[%d][%d] = %d\n", i, j, f[i][j]);
		}
	}

	int ans = 0;
	for (int i = 0; i < n; i++) ans = (ans + f[n - 1][i]) % p;

	printf("%d\n", ans * 2 % p);

	return 0;
}
```

使用滚动数组之后，时间也快不少。

```c++
#include <cstdio>

const int MAXN = 4200;

int n, p;

int main() {
	scanf("%d %d", &n, &p);

	static int f[2][MAXN];
	f[1 % 2][1] = 1;
	for (int i = 2; i < n; i++) {
		for (int j = 1; j <= i; j++) {
			f[i % 2][j] = (f[i % 2][j - 1] + f[(i - 1) % 2][i - j]) % p;
		}
	}

	int ans = 0;
	for (int i = 0; i < n; i++) ans = (ans + f[(n - 1) % 2][i]) % p;

	printf("%d\n", ans * 2 % p);

	return 0;
}
```
