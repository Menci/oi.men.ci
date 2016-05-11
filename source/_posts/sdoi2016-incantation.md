title: 「SDOI2016」生成魔咒 - 后缀数组
date: 2016-04-12 21:57:57
categories: OI
tags:
  - SDOI
  - COGS
  - BZOJ
  - 后缀数组
  - 字符串
  - RMQ
permalink: sdoi2016-incantation
---

魔咒串由许多魔咒字符组成，魔咒字符可以用数字表示。例如可以将魔咒字符 $ 1 $、$ 2 $ 拼凑起来形成一个魔咒串 $ [1, 2] $。  
一个魔咒串 $ S $ 的非空字串被称为魔咒串 $ S $ 的生成魔咒。  
例如 $ S = [1, 2, 1] $ 时，它的生成魔咒有 $ [1] $、$ [2] $、$ [1, 2] $、$ [2, 1] $、$ [1, 2, 1] $ 五种。$ S = [1, 1, 1] $ 时，它的生成魔咒有 $ [1] $、$ [1, 1] $、$ [1, 1, 1] $ 三种。  
最初 $ S $ 为空串。共进行 $ n $ 次操作，每次操作是在 $ S $ 的结尾加入一个魔咒字符。每次操作后都需要求出，当前的魔咒串 $ S $ 共有多少种生成魔咒。

<!-- more -->

### 链接
[COGS 2223](http://cogs.top/cogs/problem/problem.php?pid=2223)  
[BZOJ 4516](http://www.lydsy.com/JudgeOnline/problem.php?id=4516)

### 题解
如果没有加入字符的操作，可以直接使用后缀数组的 $ {\rm height} $ 计算。有了在结尾加入字符的操作，我们可以将整个串反转，变成在开头加入字符，这样相当于每次添加一个后缀。

将操作离线，得到最终的串，对它建立后缀数组和稀疏表。

用一个 `std::set` 维护当前已经被加入的后缀的排名，以方便查询当前加入的后缀的排名前、后一位的后缀。

考虑每次加入一个新的后缀对答案的贡献。统计每个时刻串中的重复子串数量，设新加入的后缀为 $ i $，排在它前、后一位的后缀分别为 $ pred $、$ succ $。

在加入之前，$ pred $、$ succ $ 的排名是相邻的，而现在不相邻了，需要减去它们的最长公共前缀长度。加入之后，$ pred $、$ succ $ 都与 $ i $ 相邻，需要加上它们的最长公共前缀长度。

$$ {\rm LCP}(pred, i) + {\rm LCP}(i, succ) - {\rm LCP}(pred, succ) $$

根据等差数列求和公式，长度为 $ i $ 的字符串的总子串数量为

$$ \sum\limits_{j = 1} ^ {i} j = \frac{i \times (i + 1)}{2} $$

每次用总子串数量减去重复数量即可。

### 代码
```c++
#include <cstdio>
#include <cstring>
#include <cmath>
#include <algorithm>
#include <set>

const int MAXN = 100000;
const int MAXLOGN = 17; // log(100000, 2) = 16.609640474436812

int n, a[MAXN], sa[MAXN], rk[MAXN], ht[MAXN], st[MAXN][MAXLOGN + 1];

inline void ary(const int *a, const int n) {
	for (int i = 0; i < n - 1; i++) printf("%d ", a[i]);
	printf("%d\n", a[n - 1]);
}

inline void suffixArray() {
	static int fir[MAXN], sec[MAXN], tmp[MAXN], _buc[MAXN + 1], *buc = _buc + 1;

	for (int i = 0; i < n; i++) buc[a[i]]++;
	for (int i = 0; i < n; i++) buc[i] += buc[i - 1];
	for (int i = 0; i < n; i++) rk[i] = buc[a[i] - 1];

	for (int t = 1; t < n; t <<= 1) {
		for (int i = 0; i < n; i++) fir[i] = rk[i];
		for (int i = 0; i < n; i++) sec[i] = (i + t >= n) ? -1 : fir[i + t];

		std::fill(buc - 1, buc + n, 0);
		for (int i = 0; i < n; i++) buc[sec[i]]++;
		for (int i = 0; i < n; i++) buc[i] += buc[i - 1];
		for (int i = 0; i < n; i++) tmp[n - buc[sec[i]]--] = i;

		std::fill(buc - 1, buc + n, 0);
		for (int i = 0; i < n; i++) buc[fir[i]]++;
		for (int i = 0; i < n; i++) buc[i] += buc[i - 1];
		for (int j = 0, i; j < n; j++) i = tmp[j], sa[--buc[fir[i]]] = i;
		for (int j = 0, i, last = -1; j < n; j++) {
			i = sa[j];
			if (last == -1) rk[i] = 0;
			else if (fir[i] == fir[last] && sec[i] == sec[last]) rk[i] = rk[last];
			else rk[i] = rk[last] + 1;
			last = i;
		}
	}

	for (int i = 0, k = 0; i < n; i++) {
		if (rk[i] == 0) k = 0;
		else {
			if (k > 0) k--;
			int j = sa[rk[i] - 1];
			while (i + k < n && j + k < n && a[i + k] == a[j + k]) k++;
		}
		ht[rk[i]] = k;
	}
}

inline void sparseTable() {
	for (int i = 0; i < n - 1; i++) st[i][0] = ht[i + 1];
	for (int t = 1; (1 << t) < n; t++) {
		for (int i = 0, j = (1 << t); i < n; i++) {
			if (i + j >= n) break;
			st[i][t] = std::min(st[i][t - 1], st[i + (1 << (t - 1))][t - 1]);
		}
	}
}

inline int lcp(int a, int b) {
	if (a > b) std::swap(a, b);
	// printf("%d %d\n", a, b);
	int res;
	if (a == b) res = n - a;
	else {
		int t = (int)floor(log2(b - a));
		res = std::min(st[a][t], st[b - (1 << t)][t]);
	}

	// static char s[MAXN];
	// for (int i = 0; i < n; i++) s[i] = ::a[i] + 'a';
	// printf("LCP( '%s', '%s' ) = %d\n", &s[sa[a]], &s[sa[b + 1]], res);

	return res;
}

std::set<int> s;

inline int queryPred(const int r) {
	std::set<int>::const_iterator a = s.lower_bound(r);
	if (a == s.begin()) return -1;
	else return *--a;
}

inline int querySucc(const int r) {
	std::set<int>::const_iterator a = s.lower_bound(r);
	if (a == s.end()) return -1;
	else return *a;
}

template <typename T>
inline void read(T &x) {
	x = 0;
	register char ch;
	while (ch = getchar(), !(ch >= '0' && ch <= '9'));
	do x = x * 10 + ch - '0'; while (ch = getchar(), (ch >= '0' && ch <= '9'));
}

template <typename T>
inline void write(T x) {
	static char s[64];
	int len = 0;
	do s[len++] = x % 10; while (x /= 10);
	while (len--) putchar(s[len] + '0');
	putchar('\n');
}

int main() {
	freopen("menci_incantation.in", "r", stdin);
	freopen("menci_incantation.out", "w", stdout);

	// scanf("%d", &n);
	read(n);

	// for (int i = n - 1; i >= 0; i--) scanf("%d", &a[i]);
	for (int i = n - 1; i >= 0; i--) read(a[i]);

	static int set[MAXN];
	std::copy(a, a + n, set);
	std::sort(set, set + n);
	int *end = std::unique(set, set + n);
	for (int i = 0; i < n; i++) a[i] = std::lower_bound(set, end, a[i]) - set;

	suffixArray();
	sparseTable();

	int cnt = 0;
	for (int i = n - 1; i >= 0; i--) {
		int pred = queryPred(rk[i]);
		int succ = querySucc(rk[i]);

		if (pred != -1 && succ != -1) cnt -= lcp(pred, succ);
		if (pred != -1) cnt += lcp(pred, rk[i]);
		if (succ != -1) cnt += lcp(rk[i], succ);

		s.insert(rk[i]);
		// printf("%lld\n", (long long)(n - i) * (n - i + 1) / 2 - cnt);
		write((long long)(n - i) * (n - i + 1) / 2 - cnt);
	}

	// for (int i = 0; i < n; i++) printf("%lld\n", ans[i]);

	fclose(stdin);
	fclose(stdout);

	return 0;
}
```
