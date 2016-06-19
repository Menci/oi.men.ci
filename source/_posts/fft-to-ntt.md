title: 从傅里叶变换到数论变换
categories: OI
tags: 
  - 数学
  - 学习笔记
  - 算法模板
  - 多项式
  - 数论
  - 原根
permalink: fft-to-ntt
date: 2016-06-17 21:38:00
---

FFT 可以用来计算多项式乘法，但复数的运算会产生浮点误差。对于只有整数参与的多项式运算，有时，使用数论变换（Number-Theoretic Transform）会是更好的选择。

<!-- more -->

### 原根
FFT 中，我们使用单位复根 $ \omega_n ^ k = \cos \frac{2 \pi}{n}k + i \sin\frac{2 \pi}{n}k $。我们需要单位复根的以下性质。

1. $ \omega_n ^ t (0 \leq t \leq n - 1) $ 互不相同，保证点值表示的合法；
2. $ \omega_{2n} ^ {2k} = \omega_n ^ k $，用于分治；
3. $ \omega_n ^ { k + \frac{n}{2} } = -\omega_n ^ k $，用于分治；
3. 当 $ k \neq 0 $ 时，$ 1 + \omega_n ^ k + (\omega_n ^ k) ^ 2 + \dots + (\omega_n ^ k) ^ {n - 1} = 0 $，用于逆变换。

在数论中，考虑一个质数 $ p = qn + 1 $（其中 $ n $ 为 $ 2 $ 的幂）。定义其**原根** $ g $ 为使得 $ g ^ i(0 \leq i \leq p - 1) $ 互不相同的数。

#### 性质一

令 $ \omega_n = g ^ q $，由于 $ 1,\ g ^ q,\ g ^ {2q},\ \dots,\ g ^ {(n - 1)q} $ 互不相同，满足**性质一**。

#### 性质二

由 $ \omega_n = g ^ q $ 可知 $ \omega_{2n} = g ^ { \frac{q}{2} } $（$ p = \frac{q}{2} \times 2n + 1 $），故 $ \omega_{2n} ^ {2k} = g ^ {2k \frac{q}{2} } = g ^ {kq} = \omega_n ^ k $，满足**性质二**。

#### 性质三

根据费马小定理得

$$ \omega_n ^ n = g ^ {nq} = g ^ {p - 1} \equiv 1 \pmod p $$

又因为 $ (\omega_{n} ^ { \frac{n}{2} }) ^ 2 = \omega_n ^ n $，所以 $ \omega_n ^ { \frac{n}{2} } \equiv \pm 1 \pmod p $，而根据性质一可得 $ \omega_n ^ { \frac{n}{2} } \neq \omega_n ^ 0 \ $，即 $ \omega_n ^ { \frac{n}{2} } \equiv -1 \pmod p $。可推出 $ \omega_n ^ { k + \frac{n}{2} } = \omega_n ^ k \times \omega_n ^ { \frac{n}{2} } \equiv -\omega_n ^ k \pmod p $，满足**性质三**。

#### 性质四
当 $ k \neq 0 $ 时

$$
\begin{aligned}
S(\omega_n ^ k) &= 1 + \omega_n ^ k + (\omega_n ^ k) ^ 2 + \dots + (\omega_n ^ k) ^ {n - 1} \\
\omega_n ^ k S(\omega_n ^ k) &= \omega_n ^ k + (\omega_n ^ k) ^ 2 + (\omega_n ^ k) ^ 3 + \dots + (\omega_n ^ k) ^ n \\
\omega_n ^ k S(\omega_n ^ k) - S(\omega_n ^ k) &= (\omega_n ^ k) ^ n - 1 \\
S(\omega_n ^ k) &= \frac{(\omega_n ^ k) ^ n - 1}{\omega_n ^ k - 1}
\end{aligned}
$$

由**性质三**中的推论可知，$ (\omega_n ^ k) ^ n - 1 \equiv 0 \pmod p $，故 $ S(\omega_n ^ k) \equiv 0  \pmod p $，**性质四**成立。

### 求原根
求一个质数的原根，可以使用枚举法 —— 枚举 $ g $，检验 $ g $ 是否为 $ p $ 的原根。

> 对于一个数 $ g $，最小的满足 $ g ^ k \equiv 1 \pmod p $ 的正整数 $ k $ 一定是 $ p - 1 $ 的约数。

证明：假设最小的 $ k $ 不是 $ p - 1 $ 的约数，找到 $ x $ 满足 $ xk > p - 1 > (x - 1)k $，由费马小定理可知

$$ g ^ {xk} \equiv g ^ {p - 1} \equiv 1 \equiv g ^ {xk - (p - 1)} \pmod p $$

$ xk - (p - 1) < k $，与假设矛盾。

检验时，只需要枚举 $ p - 1 $ 的所有约数 $ q $，检验 $ g ^ q \not\equiv 1 \pmod p $ 即可。

```c++
inline long long pow(const long long x, const long long n, const long long p) {
	long long ans = 1;
	for (long long num = x, tmp = n; tmp; tmp >>= 1, num = num * num % p) if (tmp & 1) ans = ans * num % p;
	return ans;
}

inline long long root(const long long p) {
	for (int i = 2; i <= p; i++) {
		int x = p - 1;
		bool flag = false;
		for (int k = 2; k * k <= p - 1; k++) if (x % k == 0) {
			if (pow(i, (p - 1) / k, p) == 1) {
				flag = true;
				break;
			}
			while (x % k == 0) x /= k;
		}

		if (!flag && (x == 1 || pow(i, (p - 1) / x, p) != 1)) {
			return i;
		}
	}
	throw;
}
```

### 模板
把原有的复数运算改为模意义下的运算即可。

注意 $ \div n $ 要改为 $ \times n ^ {-1} $。

```c++
inline long long pow(const long long x, const long long n, const long long p) {
	long long ans = 1;
	for (long long num = x, tmp = n; tmp; tmp >>= 1, num = num * num % p) if (tmp & 1) ans = ans * num % p;
	return ans;
}

inline long long root(const long long p) {
	for (int i = 2; i <= p; i++) {
		int x = p - 1;
		bool flag = false;
		for (int k = 2; k * k <= p - 1; k++) if (x % k == 0) {
			if (pow(i, (p - 1) / k, p) == 1) {
				flag = true;
				break;
			}
			while (x % k == 0) x /= k;
		}

		if (!flag && (x == 1 || pow(i, (p - 1) / x, p) != 1)) {
			return i;
		}
	}
	throw;
}

inline void exgcd(const long long a, const long long b, long long &g, long long &x, long long &y) {
	if (!b) g = a, x = 1, y = 0;
	else exgcd(b, a % b, g, y, x), y -= x * (a / b);
}

inline long long inv(const long long a, const long long p) {
	long long g, x, y;
	exgcd(a, p, g, x, y);
	return (x + p) % p;
}

struct NumberTheoreticTransform {
	long long omega[MAXM_EXTENDED], omegaInverse[MAXM_EXTENDED];

	void init(const int n) {
		long long g = root(MOD), x = pow(g, (MOD - 1) / n, MOD);
		for (int i = 0; i < n; i++) {
			assert(i < MAXM_EXTENDED);
			omega[i] = (i == 0) ? 1 : omega[i - 1] * x % MOD;
			omegaInverse[i] = inv(omega[i], MOD);
		}
	}

	void transform(long long *a, const int n, const long long *omega) {
		int k = 0;
		while ((1 << k) != n) k++;
		for (int i = 0; i < n; i++) {
			int t = 0;
			for (int j = 0; j < k; j++) if (i & (1 << j)) t |= (1 << (k - j - 1));
			if (t > i) std::swap(a[i], a[t]);
		}
		for (int l = 2; l <= n; l *= 2) {
			int m = l / 2;
			for (long long *p = a; p != a + n; p += l) {
				for (int i = 0; i < m; i++) {
					long long t = omega[n / l * i] * p[i + m] % MOD;
					p[i + m] = (p[i] - t + MOD) % MOD;
					(p[i] += t) %= MOD;
				}
			}
		}
	}

	void dft(long long *a, const int n) {
		transform(a, n, omega);
	}

	void idft(long long *a, const int n) {
		transform(a, n, omegaInverse);
		long long x = inv(n, MOD);
		for (int i = 0; i < n; i++) a[i] = a[i] * x % MOD;
	}
} ntt;
```
