title: 「HAOI2008」圆上的整点 - 数学
categories: OI
tags: 
  - BZOJ
  - HAOI
  - 数学
permalink: haoi2008-cir
date: 2016-11-13 10:56:00
---

求一个给定的圆 $ x ^ 2 + y ^ 2 = r ^ 2 $，在圆周上有多少个点的坐标是整数。

<!-- more -->

### 链接
[BZOJ 1041](http://www.lydsy.com/JudgeOnline/problem.php?id=1041)

### 题解
$$
\begin{aligned}
x ^ 2 + y ^ 2 &= r ^ 2 \\
y ^ 2 &= r ^ 2 - x ^ 2 \\
y ^ 2 &= (r + x) \times (r - x)
\end{aligned}
$$

设 $ d = \gcd(r + x, r - x) $，$ a = \frac{r - x}{d} $，$ b = \frac{r + x}{d} $，必有 $ \gcd(a, b) = 1 $。

$$
\begin{aligned}
y ^ 2 &= (r + x) \times (r - x) \\
&= d ^ 2 \times a \times b
\end{aligned}
$$

$ d ^ 2 $ 和 $ y ^ 2 $ 是完全平方数，所以 $ a \times b $ 是完全平方数；又因为 $ \gcd(a, b) = 1 $，所以 $ a $ 和 $ b $ 分别是完全平方数。

$$
\begin{aligned}
a + b &= \frac{r - x}{d} + \frac{r + x}{d} \\
a + b &= \frac{2r}{d}
\end{aligned}
$$

即，每一个整点都对应了一组 $ \{ a, b, d \} $，满足 $ a $ 和 $ b $ 是完全平方数，且 $ d $ 是 $ 2r $ 的约数。

枚举 $ d $，枚举 $ \sqrt a $，求出 $ b $，判断 $ \gcd(a, b) = 1 $ 即可。

这样求出的是第一象限的整点数量，设它为 $ k $，则答案为 $ 4k + 4 $。

### 代码
```c++
#include <cstdio>
#include <cmath>
#include <algorithm>

const int MAXN = 2e9;
const double EPS = 1e-6;

int main() {
	long long r;
	scanf("%lld", &r);

	// 2 * r = d * (a ^ 2 + b ^ 2)
	long long cnt = 0;
	for (long long i = 1; i * i <= r * 2; i++) {
		if (2 * r % i != 0) continue;

		long long d = i;
		long long t = 2 * r / i;
		for (int j = 0; j < 2; j++) {
			for (long long a = 1; a * a < t / 2; a++) {
				double b = sqrt(t - a * a);
				long long _b = static_cast<long long>(b);
				if (fabs(b - _b) <= EPS && std::__gcd(a, _b) == 1) {
					// printf("d = %lld, a = %lld, b = %lld\n", d, a, _b);
					cnt++;
				}
			}

			if (t != d) std::swap(t, d);
			else break;
		}
	}

	printf("%lld\n", cnt * 4 + 4);

	return 0;
}
```