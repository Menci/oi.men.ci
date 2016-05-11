title: 「JSOI2016」灯塔 - 分块 + RMQ
categories: OI
tags: 
  - JSOI
  - 分块
  - 乱搞
  - RMQ
permalink: jsoi2016-light
date: 2016-04-20 22:56:35
---

JSOI 的国境线上有 $ N $ 一座连续的山峰，其中第 $ i $ 座的高度是 $ h_i $。为了简单起见，我们认为这 $ N $ 座山峰排成了连续一条直线。

如果在第 $ i $ 座山峰上建立一座高度为 $ p \ (p \geq 0) $ 的灯塔，JYY 发现，这座灯塔能够照亮第 $ j $ 座山峰，当且仅当满足如下不等式：

$$ h_j \leq h_i + p - \sqrt{\mid i - j \mid} $$

JSOI 国王希望对于每一座山峰，JYY 都能提供建造一座能够照亮全部其他山峰的灯塔所需要的最小高度。你能帮助 JYY 么？

<!-- more -->

### 题解
题目要求计算所有

$$ p_i = \min\limits_{j = 1} ^ n \{ h_j - h_i + \lceil \sqrt{\mid i - j \mid} \rceil \} $$

打表可以发现 $ \lceil \sqrt{\mid i - j \mid} \rceil $ 的取值有 $ O(\sqrt{n}) $ 种，而对于每种取值，$ j $ 总是连续的最多两段区间。

考虑每个 $ j $ 对 $ p_i $ 的影响，当 $ \lceil \sqrt{\mid i - j \mid} \rceil $ 相同时，只有 $ h_j $ 最大的 $ j $ 会对 $ p_j $ 有影响。

枚举 i，然后枚举 $ \lceil \sqrt{\mid i - j \mid} \rceil $ 的值，问题转化为求一段区间内 $ h_j $ 的最大值，即 RMQ 问题，使用稀疏表即可解决。

总时间复杂度为 $ O(n \log n + n \sqrt n) $，最大的数据要跑接近 3s ……

### 代码
```c++
#include <cstdio>
#include <cstdlib>
#include <cmath>
#include <algorithm>

const int MAXN = 100000;
const int MAXLOGN = 17; // log(100000, 2) = 16.609640474436812

int n, a[MAXN];
int st[MAXN][MAXLOGN + 1];

template <typename T> inline T sqr(const T x) { return x * x; }
template <typename T> inline void cmax(T &x, const T &y) { if (y > x) x = y; }
template <typename T> inline void cmin(T &x, const T &y) { if (y < x) x = y; }

inline void sparseTable() {
	for (int i = 0; i < n - 1; i++) st[i][0] = std::max(a[i], a[i + 1]);
	st[n - 1][0] = a[n - 1];

	for (int j = 1; (1 << j) <= n; j++) {
		for (int i = 0; i < n; i++) {
			st[i][j] = std::max(st[i][j - 1], st[std::min(i + (1 << (j - 1)), n - 1)][j - 1]);
		}
	}
}

inline int query(const int l, const int r) {
	/*
	if (l > r) return 0;
	int res = 0;
	for (int i = l; i <= r; i++) cmax(res, a[i - 1]);
	return res;
	*/

	if (l > r) return 0;
	else if (l == r) return a[l - 1];
	else {
		int t = floor(log2(r - l));
		return std::max(st[l - 1][t], st[r - 1 - (1 << t)][t]);
	}
}

inline void getRange(const int i, const int s, int &l1, int &r1, int &l2, int &r2) {
	if (s == 0) l1 = r1 = l2 = r2 = i;
	else if (s == 1) l1 = r1 = i - 1, l2 = r2 = i + 1;
	else {
		int l = sqr(s - 1) + 1, r = sqr(s);
		l1 = i - r, r1 = i - l, l2 = i + l, r2 = i + r;
	}

	if (l1 < 1) l1 = 1;
	if (l2 < 1) l2 = 1;
	if (r1 > n) r1 = n;
	if (r2 > n) r2 = n;

	// printf("i = %d, s = %d, [%d, %d], [%d, %d]\n", i, s, l1, r1, l2, r2);
}

inline int solve(const int i) {
	int max = 0;
	static int lim = ceil(sqrt(n));
	for (int s = 0; s <= lim; s++) {
		int l1, r1, l2, r2;
		getRange(i, s, l1, r1, l2, r2);
		
		cmax(max, query(l1, r1) - a[i - 1] + s);
		cmax(max, query(l2, r2) - a[i - 1] + s);
	}
	return max;

	/*
	int p = 0;
	for (int j = 1; j <= n; j++) {
		int s = ceil(sqrt(abs(i - j)));
		printf("(%d, %d) -> %d\n", i, j ,s);
		p = std::max(p, a[j - 1] + s - a[i - 1]);
	
	}
	return p;
	*/
}

int main() {
	freopen("light.in", "r", stdin);
	// freopen("light.out", "w", stdout);
	
	scanf("%d", &n);
	for (int i = 0; i < n; i++) scanf("%d", &a[i]);

	sparseTable();

	for (int i = 1; i <= n; i++) {
		printf("%d\n", solve(i));
	}

	fclose(stdin);
	fclose(stdout);

	return 0;
}
```
