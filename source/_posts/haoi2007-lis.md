title: 「HAOI2007」上升序列 - DP + 贪心
categories: OI
tags: 
  - BZOJ
  - HAOI
  - DP
  - 贪心
permalink: haoi2007-lis
date: 2016-12-01 11:43:00
---

对于一个给定的 $ S = \{ a_1, a_2, a_3, \ldots , a_n \} $，若有 $ P = \{ a_{x_1},a_{x_2}, a_{x_3}, \ldots, a_{x_m} \} $，满足 $ x_1 < x_2 < \ldots < x_m $ 且 $ a_{x_1} < a_{x_2} < \ldots < a_{x_m} $，那么就称 $ P $ 为 $ S $ 的一个上升序列。如果有多个 $ P $ 满足条件，那么我们想求字典序最小的那个。

任务给出 $ S $ 序列，给出若干询问。对于第 $ i $ 个询问，求出长度为 $ L_i $ 的上升序列，如有多个，求出**下标**字典序最小的那个。

<!-- more -->

### 链接
[BZOJ 1046](http://www.lydsy.com/JudgeOnline/problem.php?id=1046)

### 题解
动态规划求出 $ f(i) $ 表示以第 $ i $ 个数**开始**的最长上升子序列长度，即

$$ f(i) = \max\limits_{j > i, a_j > a_i}\{ f(j) \} + 1 $$

对于每个询问，按顺序扫描整个序列，如果从当前位置开始的最长上升序列长度 $ \leq l $，则将当前位置的数加入答案序列中，并将 $ l $ 减去 $ 1 $。如果最终 $ l \neq 0 $，则无解。

### 代码
```c++
#include <cstdio>
#include <climits>
#include <algorithm>

const int MAXN = 10000;

int main() {
	int n;
	scanf("%d", &n);
	static int a[MAXN + 1];
	for (int i = 1; i <= n; i++) scanf("%d", &a[i]);

	static int f[MAXN + 1];
	for (int i = n; i >= 1; i--) {
		f[i] = 1;
		for (int j = i + 1; j <= n; j++) {
			if (a[i] < a[j] && f[j] + 1 > f[i]) f[i] = f[j] + 1;
		}
#ifdef DBG
		printf("f[%d] = %d\n", i, f[i]);
#endif
	}

	int m;
	scanf("%d", &m);
	while (m--) {
		int l;
		scanf("%d", &l);

		static int tmp[MAXN + 1];
		int cnt = 0;

		int last = 0;
		for (int i = 1; i <= n; i++) {
			if (f[i] >= l && a[i] > last) {
				l--;
				last = a[i];
				tmp[++cnt] = a[i];
			}
			if (!l) break;
		}

		if (l) puts("Impossible");
		else for (int i = 1; i <= cnt; i++) printf("%d%c", tmp[i], i == cnt ? '\n' : ' ');
	}

	return 0;
}
```
