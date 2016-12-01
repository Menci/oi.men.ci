title: 「NOIP2014」解方程 - Hash
categories: OI
tags: 
  - NOIP
  - CodeVS
  - BZOJ
  - Hash
  - 数学
permalink: noip2014-equation
date: 2016-10-19 16:25:00
---

已知多项式方程：

$$ a_0 + a_1 x + a_2 x ^ 2 + \cdots + a_n x ^ n = 0 $$

求这个方程在 $ [1, m] $ 内的整数解。

<!-- more -->

### 链接
[BZOJ 3751](http://www.lydsy.com/JudgeOnline/problem.php?id=3751)  
[CodeVS 4610](http://codevs.cn/problem/4610/)

### 题解
设 $ f(x) = a_0 + a_1 x + a_2 x ^ 2 + \cdots + a_n x ^ n = 0 $，我们对于一个质数 $ p $ 取模，如果 $ f(x) = 0 $，则一定有 $ f(x) \bmod p = 0 $。

求出所有满足 $ f(x) \bmod p = 0 $ 的 $ x $（根据拉格朗日定理，最多有 $ n $ 个解），则所有 $ x' = x + kp \leq m $ 均可能为原方程的解。在模另一个质数 $ p' $ 的意义下检验，如果 $ f(x') \bmod p' = 0 $，则可以认为 $ x' $ 是原方程的解。

时间复杂度为 $ O(np + n \frac{nm}{p}) $，取 $ p \approx \sqrt {nm} $ 时，复杂度为 $ O(n \sqrt{nm}) $。

### 代码
```c++
#include <cstdio>
#include <list>

const int MAXN = 100;
const int MAXLEN = 10000 + 1;
const int MAXM = 1000000;
const int MOD = 21893;
const int MOD2 = 18341629;

int parse(const char *s, const int mod) {
	int res = 0, sgn = 1;
	if (*s == '-') s++, sgn = -1;
	for (const char *p = s; *p; p++) res = (res * 10 + *p - '0') % mod;
	return res * sgn;
}

int main() {
	static char s[MAXN + 1][MAXLEN + 1];
	int n, m;
	scanf("%d %d", &n, &m);

	for (int i = 0; i <= n; i++) {
		scanf("%s", s[i]);
	}

	static int a[MAXN + 1];
	for (int i = 0; i <= n; i++) a[i] = parse(s[i], MOD);

	std::list<int> roots;
	for (int i = 1; i < MOD; i++) {
		long long pow = 1, val = 0;
		for (int j = 0; j <= n; j++) {
			(val += a[j] * pow) %= MOD;
			pow = pow * i % MOD;
		}
		
		if (val == 0) {
			for (int j = i; j <= m; j += MOD) roots.push_back(j);
		}
	}

	for (int j = 0; j <= n; j++) a[j] = parse(s[j], MOD2);

	for (std::list<int>::iterator it = roots.begin(); it != roots.end(); ) {
		long long pow = 1, val = 0;
		for (int j = 0; j <= n; j++) {
			(val += a[j] * pow) %= MOD2;
			pow = pow * *it % MOD2;
		}

		if (val != 0) it = roots.erase(it);
		else it++;
	}

	printf("%lu\n", roots.size());
	roots.sort();
	for (std::list<int>::iterator it = roots.begin(); it != roots.end(); it++) printf("%d\n", *it);

	return 0;
}
```