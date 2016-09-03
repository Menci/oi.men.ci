title: 「HNOI2010」合唱队 - 区间DP
categories: OI
tags: 
  - BZOJ
  - HNOI
  - DP
  - 区间DP
permalink: hnoi2010-chorus
date: 2016-07-06 12:08:00
---

合唱队的排队方式为：

1. 第一个人直接插入空的队形中；
2. 对于第二个人开始的每一个人，如果他比上一个人高，则站到最右边，否则站到最左边。

求对于某一个排好的序列，可以被多少种初始序列构建出，答案对任意数取模。

<!-- more -->

### 链接
[BZOJ 1996](http://www.lydsy.com/JudgeOnline/problem.php?id=1996)

### 题解
显然，某一个人是站在前面还是后面，只与上一个人有关。对于一个区间，考虑最后一个站进去的人，一定是最左边或者最右边的，并且这个人站在哪里，受到子区间两端的人的影响。

假设区间 $ [l, r] $ 中最后一个人 $ A $ 站在最右边，即 $ A $ 比 $ [l, r - 1] $ 的最后一个人要高。即，区间 $ [l, r - 1] $ 中，站在两边的比 $ A $ 矮的人都有可能是最后一个站进去的。

设 $ f(l, r, flag) $ 表示 $ [l, r] $ 内，按照 $ flag $ 的方式确定最后一个人是否可放在最左边或最右边，的方案总数。

### 代码
```c++
#include <cstdio>

const int MAXN = 1000;
const int MOD = 19650827;

const int DP_L = 0;
const int DP_R = 1;
const int DP_LR = 2;

int n, a[MAXN];

inline int dp(const int l, const int r, const int flag) {
	static int mem[MAXN][MAXN][3];
	static bool calced[MAXN][MAXN][3];
	int &ans = mem[l][r][flag];
	if (calced[l][r][flag]) return ans;
	calced[l][r][flag] = true;

	if (r - l + 1 == 2) {
		if (a[l] > a[r]) return ans = 0;
		else if (flag == DP_LR) return ans = 2;
		else return ans = 1;
	}

	if (flag != DP_L) {
		const int L = l, R = r - 1;
		if (a[r] > a[L] && a[r] > a[R]) ans += dp(L, R, DP_LR);
		else if (a[r] > a[L]) ans += dp(L, R, DP_L);
		else if (a[r] > a[R]) ans += dp(L, R, DP_R);
	}

	if (flag != DP_R) {
		const int L = l + 1, R = r;
		if (a[l] < a[L] && a[l] < a[R]) ans += dp(L, R, DP_LR);
		else if (a[l] < a[L]) ans += dp(L, R, DP_L);
		else if (a[l] < a[R]) ans += dp(L, R, DP_R);
	}

	return ans %= MOD;
}

int main() {
	scanf("%d", &n);
	for (int i = 0; i < n; i++) scanf("%d", &a[i]);

	printf("%d\n", dp(0, n - 1, DP_LR));

	return 0;
}
```
