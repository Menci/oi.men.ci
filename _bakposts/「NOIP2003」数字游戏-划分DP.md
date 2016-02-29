title: 「NOIP2003」数字游戏 - 划分DP
categories: OI
tags: 
  - CodeVS
  - DP
  - NOIP
  - 划分DP
  - 洛谷
  - Tyvj
permalink: noip2003-game
id: 20
updated: '2016-01-19 21:04:15'
date: 2016-01-14 04:23:38
---

在你面前有一圈整数（一共 `n`（≤ 50）个），你要按顺序将其分为 `m`（≤ 9）个部分，各部分内的数字相加，相加所得的 `m` 个结果对 10 取模后再相乘，最终得到一个数 `k`。游戏的要求是使你所得的 `k` 最大或者最小。

<!-- more -->

### 题目链接
[CodeVS 1085](http://codevs.cn/problem/1085/)  
[Tyvj 1901](http://tyvj.cn/p/1901)  
[洛谷 1043](http://www.luogu.org/problem/show?pid=1043)

### 解题思路
又是一道划分 DP，不过坑挺多的 …… 一是枚举断点，二是注意**负数对 `10` 取模后的结果是正数**。

以最大值为例，以“分的部分”的数量划分阶段，用 $ f[i][j] $ 表示前 `i` 个数划分为 `j` 个部分所得的最大值，状态转移方程为：

$$ f[i][j] = \max\{f[k][j-1]* (({\sum_{x=k+1}^{i}a[x]}) \ {\rm mod} \ 10),k{\in}[j-1,i-1]\} $$

边界条件为：

$$ f[i][1] = ({\sum_{x=1}^i{a[x]}}) \ {\rm mod} \ 10 $$

求和可以用前缀和来维护，但是注意**枚举每个断点都必须重新初始化前缀和**。

### AC代码
```c++
#include <cstdio>
#include <climits>
#include <cstring>
#include <typeinfo>
#include <algorithm>

typedef const int &(*Extreme)(const int &, const int &);

const int MAXN = 50;
const int MAXM = 9;

int n, m, a[MAXN], prefixSum[MAXN];
int ans[MAXN][MAXM];
bool calced[MAXN][MAXM];

inline int mod10(int x) {
	return ((x % 10) + 10) % 10;
}

inline void initPrefixSum() {
	prefixSum[0] = a[0];
	for (int i = 1; i < n; i++) {
		prefixSum[i] = prefixSum[i - 1] + a[i];
	}
}

inline int sum(int i, int j) {
	return mod10(i == 1 ? prefixSum[j - 1] : prefixSum[j - 1] - prefixSum[i - 1 - 1]);
}

int search(int i, int j, Extreme extreme) {
	if (!calced[i - 1][j - 1]) {
		if (j == 1) ans[i - 1][j - 1] = sum(1, i);
		else {
			for (int k = j - 1; k <= i - 1; k++) {
				ans[i - 1][j - 1] = extreme(ans[i - 1][j - 1], search(k, j - 1, extreme) * sum(k + 1, i));
			}
		}

		//printf("f[%d][%d] = %d\n", i, j, ans[i - 1][j - 1]);

		calced[i - 1][j - 1] = true;
	}

	return ans[i - 1][j - 1];
}

inline void work(int &ansMin, int &ansMax) {
	/*for (int i = 0; i < n; i++) {
		printf("%d ", a[i]);
	}
	putchar('\n');*/

	initPrefixSum();

	for (int i = 0; i < n; i++) {
		for (int j = 0; j < m; j++) {
			ans[i][j] = INT_MIN, calced[i][j] = false;
		}
	}

	ansMax = std::max(ansMax, search(n, m, std::max));

	for (int i = 0; i < n; i++) {
		for (int j = 0; j < m; j++) {
			ans[i][j] = INT_MAX, calced[i][j] = false;
		}
	}
	ansMin = std::min(ansMin, search(n, m, std::min));
}

int main() {
	scanf("%d %d", &n, &m);

	for (int i = 0; i < n; i++) {
		scanf("%d", &a[i]);
	}

	int ansMin = INT_MAX, ansMax = INT_MIN;
	for (int i = 0; i < n; i++) {
		int first = a[0];
		for (int i = 0; i < n - 1; i++) {
			a[i] = a[i + 1];
		}

		a[n - 1] = first;

		work(ansMin, ansMax);
	}

	printf("%d\n%d\n", ansMin, ansMax);

	return 0;
}
```