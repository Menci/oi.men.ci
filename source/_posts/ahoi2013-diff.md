title: 「AHOI2013」差异 - 后缀数组
categories: OI
tags: 
  - BZOJ
  - AHOI
  - 字符串
  - 后缀数组
  - 单调栈
permalink: ahoi2013-diff
date: 2016-09-29 21:07:00
---

一个长度为 $ n $ 的字符串，令 $ T_i $ 表示它从第 $ i $ 个字符开始的后缀，求

$$ \sum\limits_{1 \leq i < j \leq n} \mathrm{len}(T_i) + \mathrm{len}(T_j) - 2 \times \mathrm{lcp}(T_i, T_j) $$

<!-- more -->

### 链接
[BZOJ 3238](http://www.lydsy.com/JudgeOnline/problem.php?id=3238)

### 题解
通过打表找规律可得

$$ \sum\limits_{1 \leq i < j \leq n} \mathrm{len}(T_i) + \mathrm{len}(T_j) = \sum\limits_{i = 2} ^ n \frac{i(i - 1)}{2} + i(i - 1) $$

剩下的一部分为

$$ -2 \sum\limits_{1 \leq i < j \leq n} \mathrm{lcp}(T_i, T_j) $$

每两两间的 LCP 都被计算了一次。

它相当于 $ \mathrm{height}[] $ 数组中每个区间的最小值。我们考虑一个数 $ a_i $ 在哪些区间里会成为最小值。

使用单调栈求出每个数 $ a_i $ 左边第一个**大于等于**（方便处理相等的数）它的数的位置，右边第一个**大于**它的数的位置，中间的所有区间内，$ a_i $ 均为最小值。

设 $ a_i $ 左边到第一个大于等于它的数之前共有 $ l_i $ 个数（不含 $ a_i $ 和大于等于它的数），右边到第一个大于它的数之前共有 $ r_i $ 个数，则 $ a_i $ 对答案的贡献为

$$ (l_i + 1) \times (r_i + 1) \times a_i $$

求和即可

### 代码
```c++
#include <cstdio>
#include <cstring>
#include <algorithm>
#include <stack>

const int MAXN = 500000;

int n, sa[MAXN], rk[MAXN], ht[MAXN];
unsigned long long l[MAXN], r[MAXN];
char s[MAXN];

inline void suffixArray() {
	static int set[MAXN], a[MAXN];
	for (int i = 0; i < n; i++) set[i] = s[i];
	std::sort(set, set + n);
	int *end = std::unique(set, set + n);
	for (int i = 0; i < n; i++) a[i] = std::lower_bound(set, end, s[i]) - set;

	static int fir[MAXN], sec[MAXN], tmp[MAXN], _buc[MAXN + 1], *buc = _buc + 1;
	for (int i = 0; i < n; i++) buc[a[i]]++;
	for (int i = 0; i < n; i++) buc[i] += buc[i - 1];
	for (int i = 0; i < n; i++) rk[i] = buc[a[i] - 1];
	for (int t = 1; t < n; t *= 2) {
		for (int i = 0; i < n; i++) fir[i] = rk[i];
		for (int i = 0; i < n; i++) sec[i] = i + t >= n ? -1 : rk[i + t];

		std::fill(buc - 1, buc + n, 0);
		for (int i = 0; i < n; i++) buc[sec[i]]++;
		for (int i = 0; i < n; i++) buc[i] += buc[i - 1];
		for (int i = 0; i < n; i++) tmp[n - buc[sec[i]]--] = i;

		std::fill(buc - 1, buc + n, 0);
		for (int i = 0; i < n; i++) buc[fir[i]]++;
		for (int i = 0; i < n; i++) buc[i] += buc[i - 1];
		for (int i = 0; i < n; i++) sa[--buc[fir[tmp[i]]]] = tmp[i];

		for (int i = 0; i < n; i++) {
			if (!i) rk[sa[i]] = 0;
			else if (fir[sa[i]] == fir[sa[i - 1]] && sec[sa[i]] == sec[sa[i - 1]]) rk[sa[i]] = rk[sa[i - 1]];
			else rk[sa[i]] = rk[sa[i - 1]] + 1;
		}
	}

	// for (int i = 0; i < n; i++) printf("%d%c", sa[i], i == n - 1 ? '\n' : ' ');
	// for (int i = 0; i < n; i++) printf("%d%c", rk[i], i == n - 1 ? '\n' : ' ');
	
	for (int i = 0, k = 0; i < n; i++) {
		int j = sa[rk[i] - 1];
		if (k) k--;
		while (i + k < n && j + k < n && a[i + k] == a[j + k]) k++;
		ht[rk[i]] = k;
	}

	// for (int i = 0; i < n; i++) printf("%s\n", &s[sa[i]]);
	// for (int i = 0; i < n; i++) printf("%d%c", ht[i], i == n - 1 ? '\n' : ' ');
}

/*
inline int lcp(const int i, const int j) {
	/ *
	int a = rk[i], b = rk[j], ans = n;
	if (a > b) std::swap(a, b);
	for (int i = a + 1; i <= b; i++) ans = std::min(ans, ht[i]);
	// printf("- %d %d => %d\n", a + 1, b, ans);
	return ans;
	* /

	int ans = 0;
	while (s[i + ans] == s[j + ans] && i + ans < n && j + ans < n) ans++;
	return ans;
}
*/

inline void prepare() {
	std::stack<int> s;
	for (int i = 1; i < n; i++) {
		while (!s.empty() && ht[s.top()] > ht[i]) s.pop();
		l[i] = s.empty() ? i - 1 : i - s.top() - 1;
		s.push(i);
	}
	while (!s.empty()) s.pop();

	for (int i = n - 1; i >= 1; i--) {
		while (!s.empty() && ht[s.top()] >= ht[i]) s.pop();
		r[i] = s.empty() ? n - i - 1 : s.top() - i - 1;
		s.push(i);
	}
}

int main() {
	scanf("%s", s);
	n = strlen(s);
	suffixArray();

	unsigned long long sumLcp = 0;
	/*
	for (int i = 1; i < n; i++) for (int j = i; j < n; j++) {
		int min = n;
		for (int k = i; k <= j; k++) min = std::min(min, ht[k]);
		sumLcp += min;
	}
	*/
	/*
	for (int i = 0; i < n; i++) {
		for (int j = i + 1; j < n; j++) {
			sumLcp += lcp(i, j);
		}
	}
	*/

	prepare();
	// /*
	for (int i = 1; i < n; i++) {
		// printf("%d: %d %d\n", i, l[i], r[i]);
		sumLcp += static_cast<unsigned long long>(l[i] + 2) * (r[i] + 1) * ht[i];
	}
	// */

	unsigned long long sum = 0;
	for (int i = 2; i <= n; i++) {
		unsigned long long t = static_cast<unsigned long long>(1 + (i - 1)) * (i - 1) / 2 + static_cast<unsigned long long>(i) * (i - 1);
		// printf("- %lld\n", t);
		sum += t;
		// printf("sum = %llu\n", sum);
	}
	/*
	for (int i = 0; i < n; i++) {
		for (int j = i + 1; j < n; j++) {
			// printf("- %d %d\n", n - i, n - j);
			sum += n - i + n - j;
		}
	}
	*/

	printf("%llu\n", sum - 2 * sumLcp);

	return 0;
}
```