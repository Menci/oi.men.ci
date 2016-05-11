title: 「NOIP2000」乘积最大 - 划分DP
categories: OI
tags: 
  - CodeVS
  - DP
  - NOIP
  - 划分DP
permalink: noip2000-cheng-ji-zui-da
id: 16
updated: '2016-01-19 21:05:38'
date: 2016-01-09 05:10:45
---

在一个长度为 `N`（<= 400）的数字字符串中加上 `K`（<= 6）个乘号，使所得表达式值最大。

<!-- more -->

### 链接
[CodeVS 1017](http://codevs.cn/problem/1017/)

### 题解
考虑划分 DP，以加入的乘号数量作为划分阶段，用 `f[n][k]` 表示原数字前 `n` 位中加入 `k` 个乘号所得表达式的最大值，预处理出 `a[i][j]` 表示原数字第 `i` 位到第 `j` 位组成的数字，则转移方程为：

$$ f[n][k] = {\max}\{f[i][k - 1] * a[i + 1][n],i{\in}[k,n)\} $$

因为数据较水，所以使用 `long long` 即可，无需高精。

### 代码
```C++
#include <cstdio>
#include <algorithm>

const int MAXN = 40;
const int MAXK = 6;

int n, k;
char num[MAXN + 1];
long long a[MAXN][MAXN], ans[MAXN][MAXK];
bool calced[MAXN][MAXK];

inline void preProcess() {
	for (int i = 0; i < n; i++) {
		for (int j = 0; j < n; j++) {
			if (i <= j) {
				for (int k = i; k <= j; k++) {
					a[i][j] *= 10;
					a[i][j] += (num[k] - '0');
				}
			}
		}
	}
}

long long search(int n, int k) {
	if (k == 0) return a[0][n - 1];

	if (!calced[n - 1][k - 1]) {
		for (int i = k; i < n; i++) {
			ans[n - 1][k - 1] = std::max(ans[n - 1][k - 1], search(i, k - 1) * a[i + 1 - 1][n - 1]);
		}
		
		calced[n - 1][k - 1] = true;
	}

	return ans[n - 1][k - 1];
}

int main() {
	scanf("%d %d\n%s", &n, &k, num);
	preProcess();

	printf("%lld\n", search(n, k));
	return 0;
}
```