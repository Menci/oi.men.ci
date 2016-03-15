title: 数论学习笔记（一）
categories: OI
tags: 
  - 数学
  - 数论
  - 学习笔记
  - 算法模板  
permalink: number-theory-notes-1
date: 2016-01-19 21:48:24
---

数论是 OI 中很重要的一部分，然而我基本上都不会，所以从现在开始我要学数论！

<!-- more -->

### 欧几里得
算是 OI 中数论最基本的了吧，求两个数的最大公约数。

$$ \gcd(a,b)=\cases{ a & b = 0 \\ \gcd(b,a \ {\rm mod} \ b) & b ≠ 0 } $$

```cpp
int gcd(int a, int b) {
	return !b ? a : gcd(b, a % b);
}
```

顺便求两个数的最小公倍数。

$$ {\rm lcm}(a,b)=\frac{a*b}{\gcd(a,b)} $$

写程序时先除后乘防炸。

```cpp
int lcm(int a, int b) {
	return a / gcd(a, b) * b;
}
```

### 扩展欧几里得
扩展欧几里得 `exgcd` 可以在求出 $\gcd(a,b)$ 的同时求出二元一次不定方程 $ax+by=\gcd(a,b)$的一组整数解。

举个栗子，求 $\gcd(47,30)$ 时，得到以下式子。

$$
\begin{align*}
& 47=30*1+17 \\
& 30=17*1+13 \\
& 17=13*1+4  \\
& 13=4*3+1   \\
\end{align*}
$$

把余数移到左边

$$
\begin{align*}
& 17=47+30*(-1) \\
& 13=30+17*(-1) \\
& 4=17+13*(-1)  \\
& 1=13+4*(-3)   \\
\end{align*}
$$

从 $\gcd(47,30)=1$ 开始，将四个式子依次带入，得

$$
\begin{align*}
& \gcd(47,30)             \\
& =1                      \\
& =13*1+4*(-3)            \\
& =13*1+[17+13*(-1)]*(-3) \\
& =13*4+17*(-3)           \\
& =17*3+13*4              \\
& =17*3+[30+17*(-1)]*4    \\
& =17*(-7)+30*4           \\
& =30*4+17*(-7)           \\
& =30*4+[47+30*(-1)]*(-7) \\
& =30*11+47*(-7)          \\
& =47*(-7)+30*11          \\
\end{align*}
$$

解得 $x=-7,y=11$。

由上述式子可观察到，每次辗转交换了 `x` 和 `y`，并将 `y` 减去了原 `x` 与辗转相除所得商的乘积。

```cpp
void exgcd(int a, int b, int g, int &x, int &y) {
	if (b == 0) {
		x = 1, y = 0;
		g = a;
	} else {
		exgcd(b, a % b, g, y, x);
		y -= x * (a / b);
	}
}
```

### Eratosthenes 筛法
在筛选之前，先认为每个数都是素数。枚举所有数，如果这个数是素数，那么筛掉这个数的所有倍数，标记它们为“不是素数”。

```cpp
bool isNotPrime[MAXN + 1];
std::vector<int> primes;

inline void getPrimes(int n) {
	for (int i = 2; i <= n; i++) {
		if (isNotPrime[i]) continue;
		for (int j = i * 2; j <= n; j += i) isNotPrime[j] = true;
	}

	primes.reserve(n);
	for (int i = 2; i <= n; i++) if (!isNotPrime[i]) primes.push_back(i);
}
```

两个优化：
1. 第二层循环可以从 $i^2$ 开始，因为对于每个小于 $i$ 的数 $i'$，$i*i'$ 都已经在第 $i'$ 次循环筛掉了。
2. 枚举 $[2,\sqrt{n}]$ 的素数即可，因为对于每个合数 $p>\sqrt{n}$，则必有素数 $k$ 满足 $p=k*k'$ 且 $k< \sqrt{n}$，所以 $p$ 会在第 $k$ 次循环被筛掉。

```cpp
bool isNotPrime[MAXN + 1];
std::vector<int> primes;

inline void getPrimes(int n) {
	int m = floor(sqrt(n + 0.5));
	for (int i = 2; i <= m; i++) {
		if (isNotPrime[i]) continue;
		for (int j = i * i; j <= n; j += i) isNotPrime[j] = true;
	}

	primes.reserve(n);
	for (int i = 2; i <= n; i++) if (!isNotPrime[i]) primes.push_back(i);
}
```

### 欧拉函数
根据唯一分解定理，任何一个正整数 $n$ 都可以写成 $k$ 个素数的幂的积的形式，其中第 $i$ 个素数的指数为 $a_i$。即：

$$ n={\prod_{i=1}^{k}} \ {p_i}^{a_i} $$

根据容斥原理，从总数 $n$ 中先减去每个 $p_i$ 的倍数，再把多减的补回来，再把多补的减回来 …… 最终得到公式

$$ \phi(n)={\sum_{S{\subseteq}\{p_1,p_2,\ldots,p_k\}}{(-1)^{|S|}} *  {\frac{n}{ {\prod_{ {p_i}{\in}S} } \ p_i }}} $$

把求和和容斥原理的应用全部展开之后就是

$$ \phi(n)=n*\prod_{i=1}^{k} (1 - \frac{1}{p_i}) $$

程序实现就是先令结果为 $n$，每次把结果除掉一个 $p$ 再乘上 $p-1$。嗯，不是很好理解 ……

对于给定的 $n$，用类似筛法的思想枚举素数，每次找到一个素数后把它的倍数全部筛掉。

```cpp
int phi() {
	int m = floor(sqrt(n + 0.5)), ans = n;
	for (int i = 2; i <= m; i++) {
		if (n % i == 0) {
			ans = ans / i * (i - 1);
			while (n % i == 0) n /= i;
		}
	}

	if (n != 1) ans = ans / n * (n - 1); // 前面没筛干净的
	return ans;
}
```

未完待续 ……
