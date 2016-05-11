title: 「HAOI2011」Problem b - 莫比乌斯反演
categories: OI
tags: 
  - BZOJ
  - COGS
  - HAOI
  - 莫比乌斯反演
  - 数论
  - 数学
  - 线性筛
permalink: haoi2011-problemb
date: 2016-04-08 11:32:33
---

对于给出的 $ n $ 个询问，每次求有多少个数对 $ (x, y) $，满足 $ a \leq x \leq b $，$ c \leq y \leq d $，且 $ \gcd(x, y) = k $，$ \gcd(x, y) $函数为 $ x $ 和 $ y $ 的最大公约数。

<!-- more -->

### 链接
[BZOJ 2301](http://www.lydsy.com/JudgeOnline/problem.php?id=2301)  
[COGS 548](http://cogs.top/cogs/problem/problem.php?pid=548)

### 题解
问题为：求

$$ \sum\limits_{i = a} ^ {b} \sum\limits_{j = c} ^ {d} [\gcd(i, j) = k] $$

设

$$ F(n, m, k) = \sum\limits_{i = 1} ^ {n} \sum\limits_{j = 1} ^ {m} [\gcd(i, j) = k] $$

根据容斥原理，答案即为

$$ F(b, d, k) - F(a - 1, d, k) - F(b, c - 1, k) + F(a - 1, c - 1, k) $$

现在的问题就是求出 $ F $ 函数的值

设

$$
\begin{align}
f(k) &= \sum\limits_{i = 1} ^ {n} \sum\limits_{j = 1} ^ {m} [\gcd(i, j) = k] \\
\end{align}
$$

构造函数 $ g(k) $

$$
\begin{align}
g(k) &= \sum\limits_{k \mid d} f(d) \\
&= \sum\limits_{t = 1} ^ {\lfloor \frac{n}{k} \rfloor} f(t \times k) \\
&= \sum\limits_{t = 1} ^ {\lfloor \frac{n}{k} \rfloor} \sum\limits_{i = 1} ^ {n} \sum\limits_{j = 1} ^ {m} [\gcd(i, j) = t \times k] \\
&= \sum\limits_{i = 1} ^ {n} \sum\limits_{j = 1} ^ {m} [k \mid \gcd(i, j)] \\
&= \lfloor \frac{n}{k} \rfloor \lfloor \frac{m}{k} \rfloor \\
\end{align}
$$

由莫比乌斯反演得

$$
\begin{align}
f(k) &= \sum\limits_{k \mid d} g(d) \mu(\frac{d}{k}) \\
&= \sum\limits_{t = 1} ^ {\lfloor \frac{n}{k} \rfloor} g(tk) \mu(t) \\
&= \sum\limits_{t = 1} ^ {\lfloor \frac{n}{k} \rfloor} \lfloor \frac{n}{tk} \rfloor \lfloor \frac{m}{tk} \rfloor \mu(t) \\
\end{align}
$$

这时候我们已经可以暴力计算 $ F(n, m, k) $ 了

```c++
int ans = 0;
for (int d = 1; d <= (n / k); d++) {
	ans += mu[d] * (n / (k * d)) * (m / (k * d));
}
```

但是这样的复杂度还是会超时的，我们考虑分块计算。

注意到我们的代码中多次出现了形如 $ \frac{n}{k} $ 的式子，考虑构造一个新函数 $ F'(n', m') $

$$
\begin{align}
n' &= \lfloor \frac{n}{k} \rfloor \\
m' &= \lfloor \frac{m}{k} \rfloor \\
F(n, m, k) &= F'(\lfloor \frac{n}{k} \rfloor, \lfloor \frac{m}{k} \rfloor) \\
F'(n', m') &= \sum\limits_{T = 1} ^ {n'} \lfloor \frac{n'}{T} \rfloor \lfloor \frac{m'}{T} \rfloor \mu(T) \\
\end{align}
$$

此时的 $ F' $ 已经可以分块计算了，通过预处理 $ \mu(T) $ 的前缀和，我们可以在 $ O(\sqrt{n}) $ 的时间内回答一组询问。

### 代码
```c++
#include <cstdio>
#include <algorithm>

const int MAXT = 50000;
const int MAXN = 50000;
const int MAXK = 50000;

bool isNotPrime[MAXN + 1];
int mu[MAXN + 1], s[MAXN + 1], primes[MAXN + 1], cnt;
inline void getPrimes() {
	isNotPrime[0] = isNotPrime[1] = true;
	mu[1] = 1;
	for (int i = 2; i <= MAXN; i++) {
		if (!isNotPrime[i]) {
			primes[cnt++] = i;
			mu[i] = -1;
		}

		for (int j = 0; j < cnt; j++) {
			int t = i * primes[j];
			if (t > MAXN) break;
			isNotPrime[t] = true;
			if (i % primes[j] == 0) {
				mu[t] = 0;
				break;
			} else mu[t] = -mu[i];
		}
	}

	for (int i = 1; i <= MAXN; i++) s[i] = s[i - 1] + mu[i];
}

inline int gcd(const int a, const int b) { return !b ? a : gcd(b, a % b); }

inline int solve(int n, int m, const int k) {
	if (n > m) std::swap(n, m);
	n /= k, m /= k;
	int ans = 0;
	for (int l = 1, r; l <= n; l = r + 1) {
		r = std::min(n / (n / l), m / (m / l));
		ans += (s[r] - s[l - 1]) * ((n / l) * (m / l));
	}

	return ans;

	/*int ans = 0;
	for (int i = 1; i <= n; i++) for (int j = 1; j <= m; j++) if (gcd(i, j) == k) ans++;
	return ans;*/

	/*int ans = 0;
	for (int d = 1; d <= (n / k); d++) {
		ans += mu[d] * (n / (k * d)) * (m / (k * d));
	}*/
	// printf("solve(%d, %d, %d) = %d\n", n, m, k, ans);
	return ans;
}

inline int solve(const int a, const int b, const int c, const int d, const int k) {
	return solve(b, d, k) - solve(a - 1, d, k) - solve(b, c - 1, k) + solve(a - 1, c - 1, k);
}

int main() {
	getPrimes();
	int t;
	scanf("%d", &t);
	while (t--) {
		int a, b, c, d, k;
		scanf("%d %d %d %d %d", &a, &b, &c, &d, &k);
		printf("%d\n", solve(a, b, c, d, k));
	}

	return 0;
}
```
