title: 「CQOI2016」手机号码 - 数位DP
date: 2016-04-21 23:31:24
categories: OI
tags:
  - CQOI
  - BZOJ
  - 数位DP
  - DP
permalink: cqoi2016-number
---

工具需要检测的号码特征有两个：号码中要出现至少 $ 3 $ 个相邻的相同数字，号码中不能同时出现 $ 8 $ 和 $ 4 $。号码必须同时包含两个特征才满足条件。满足条件的号码例如：$ 3000988721 $、$ 23333333333 $、$ 14444101000 $。而不满足条件的号码例如：$ 1015400080 $、$ 10010012022 $。

手机号码一定是 $ 11 $ 位数，前不含前导的 $ 0 $。工具接收两个数 $ L $ 和 $ R $，自动统计出 $ [L, R] $ 区间内所有满足条件的号码数量。$ L $ 和 $ R $ 也是 $ 11 $ 位的手机号码。

<!-- more -->

### 链接
[BZOJ 4521](http://www.lydsy.com/JudgeOnline/problem.php?id=4521)

### 题解
设 $ F(x) $ 表示小于等于 $ x $ 的电话号码中合法的数量，$ F(R) - F(L - 1) $ 即为答案。

计算 $ F(x) $ 时枚举最高位，使用数位 DP，状态为：

$$ f[n][limit][last][equal][flag][four][eight] $$

从前到后依次表示：还剩几位、最高位最大是几（$ 10 $ 表示从这一位开始均不限制）、上一位是几、上一位与上上一位是否相等、是否已有三个相邻的相同数字、是否已有 $ 4 $、是否已有 $ 8 $。

转移时，枚举最高位上的数，如果最高位 $ < limit $，则之后的位上的数的大小均无限制。如果上上一位于上一位相等且当前位于上一位相等，认为已有三个相邻的相同数字。

每次数位 DP 的时间复杂度为 $ O(10 ^ 4 * 2 ^ 4) $。

### 代码
```c++
#include <cstdio>
#include <cstring>
#include <algorithm>

const long long MINN = 1e10;
const long long MAXN = 1e11 - 1;
const int LEN = 11;

int a[LEN];

long long mem[LEN][11][10][2][2][2][2];
bool calced[LEN][11][10][2][2][2][2];

long long f(const int n, const int limit, const int last, const bool equal, const bool flag, const bool four, const bool eight) {
	long long &ans = mem[n][limit][last][equal][flag][four][eight];
	if (calced[n][limit][last][equal][flag][four][eight]) return ans;
	calced[n][limit][last][equal][flag][four][eight] = true;

	// printf("f(n = %d, limit = %d, last = %d, [%s], [%s], [%s], [%s])\n", n, limit, last, equal ? "equal" : "", flag ? "flag" : "", four ? "four" : "", eight ? "eight" : "");

	ans = 0;
	if (n == 1) {
		for (int i = 0; i <= std::min(limit, 9); i++) {
			if (i == 4 && eight) continue;
			if (i == 8 && four) continue;

			if (flag || (equal && i == last)) ans++;
		}
	} else {
		int &next = a[LEN - n + 1];
		for (int i = 0; i <= std::min(limit, 9); i++) {
			if (i == 4 && eight) continue;
			if (i == 8 && four) continue;

			int t;
			if (i < limit || limit > 9) {
				t = 10;
			} else t = next;

			ans += f(n - 1, t, i, i == last, flag || (equal && i == last), four || (i == 4), eight || (i == 8));
		}
	}

	return ans;
}

inline long long solve(const long long num) {
	if (num < MINN) return 0;

	char s[LEN + 1];
	sprintf(s, "%lld", num);
	for (int i = 0; i < LEN; i++) a[i] = s[i] - '0';

	memset(mem, 0, sizeof(mem));
	memset(calced, 0, sizeof(calced));

	int &limit = a[0];
	long long ans = 0;
	for (int i = 1; i <= limit; i++) {
		int t;
		if (i < limit) t = 10;
		else t = a[1];
		ans += f(LEN - 1, t, i, false, false, i == 4, i == 8);
	}

	return ans;
}

int main() {
	// freopen("number.in", "r", stdin);
	// freopen("number.out", "w", stdout);

	long long l, r;
	scanf("%lld %lld", &l, &r);

	long long L = solve(l - 1), R = solve(r);

	// printf("%lld\n%lld\n", L, R);;
	printf("%lld\n", R - L);

	fclose(stdin);
	fclose(stdout);

	return 0;
}
```
