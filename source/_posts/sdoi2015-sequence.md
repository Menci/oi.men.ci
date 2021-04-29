title: 「SDOI2015」序列统计 - 生成函数 + NTT
categories:
  - OI
tags:
  - BZOJ
  - FFT
  - NTT
  - SDOI
  - 原根
  - 快速幂
  - 数学
  - 生成函数
permalink: sdoi2015-sequence
date: '2016-06-12 09:27:00'
---

小 C 有一个集合 $ S $，里面的元素都是小于 $ M $ 的非负整数。他用程序编写了一个数列生成器，可以生成一个长度为 $ N $ 的数列，数列中的每个数都属于集合 $ S $。

小 C 用这个生成器生成了许多这样的数列。但是小 C 有一个问题需要你的帮助：给定整数 $ x $，求所有可以生成出的，且满足数列中所有数的乘积 $ \bmod M $ 的值等于 $ x $ 的不同的数列的有多少个。小 C 认为，两个数列 $ \{ A_i \} $ 和 $ \{B_i\} $ 不同，当且仅当至少存在一个整数 $ i $，满足 $ A_i \neq B_i $。另外，小 C 认为这个问题的答案可能很大，因此他只需要你帮助他求出答案 $ \bmod 1004535809 $ 的值就可以了。

<!-- more -->

### 链接

[BZOJ 3992](http://www.lydsy.com/JudgeOnline/problem.php?id=3992)

### 题解

首先，题目中要求乘起来为 $ x $ 的方案数，我们可以对 $ S_i $ 和 $ x $ 取关于 $ M $ 的原根的离散对数，转化为 $ \log S_i $ 加起来为 $ \log x $ 的方案数。

小于 $ M $ 的非负整数，除去 $ 0 $，共有 $ M - 2 $ 个，这些数 $ [1,\ M - 1] $ 的离散对数的取值范围为 $ [0,\ M - 2] $。因为根据费马小定理，有 $ g ^ {M - 1} \equiv g ^ 0 \equiv 1 \pmod {M} $。

定义生成函数

$$ A(x) = \sum\limits_{i = 0} ^ {\infty} a_i x ^ i $$

对于集合中的每个数 $ S_i $，令 $ a_{\log S_i} = 1 $，否则 $ a_{\log S_i} = 0 $。

快速幂求出 $ A ^ N(x) $ 的第 $ \log x $ 项即为答案。相乘时使用 NTT。

注意取离散对数后要求的是加起来 $ \bmod {M - 1} $ 为 $ \log x $，所以每次乘法后需要将所有次数 $ \bmod {M - 1} $ 为 $ i $ 的项系数加到 $ i $ 次项上。

时间复杂度为 $ O(M \sqrt M + M \log M \log N) $。

### 代码

```cpp
#include <cstdio>
#include <cassert>
#include <algorithm>

const int MAXM = 8000;
const int MAXM_EXTENDED = 16384;
const long long MOD = 1004535809;

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
            // printf("root(%lld) = %d\n", p, i);
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

int m;
long long log[MAXM];

inline void prepare() {
    long long t = 1, r = root(m);
    for (int i = 0; i < m - 1; i++) {
        log[t] = i;
        // printf("log(%lld) = %d\n", t, i);
        t = t * r % m;
    }
}

struct NumberTheoreticTransform {
    long long omega[MAXM_EXTENDED], omegaInverse[MAXM_EXTENDED];

    void init(const int n) {
        long long g = root(MOD), x = pow(g, (MOD - 1) / n, MOD);
        for (int i = 0; i < n; i++) {
            assert(i < MAXM_EXTENDED);
            omega[i] = (i == 0) ? 1 : omega[i - 1] * x % MOD;
            omegaInverse[i] = inv(omega[i], MOD);
            // printf("omega[%d] = %lld\n", i, omega[i]);
        }
    }

    void transform(long long *a, const int n, const long long *omega) {
        int k = 0;
        while ((1 << k) != n) k++;
        for (int i = 0; i < n; i++) {
            assert(i < MAXM_EXTENDED);
            int t = 0;
            for (int j = 0; j < k; j++) if (i & (1 << j)) t |= (1 << (k - j - 1));
            if (t > i) std::swap(a[i], a[t]);
            assert(t < MAXM_EXTENDED);
        }
        for (int l = 2; l <= n; l *= 2) {
            int m = l / 2;
            for (long long *p = a; p != a + n; p += l) {
                for (int i = 0; i < m; i++) {
                    assert(n / l * i < MAXM_EXTENDED);
                    assert(p - a + i < MAXM_EXTENDED);
                    long long t = omega[n / l * i] * p[i + m] % MOD;
                    // printf("use omega = %lld\n", omega[n / l * i]);
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

    void operator()(long long *a, long long *b, const int n) {
        assert(n <= MAXM_EXTENDED);
        /*
        putchar('{');
        for (int i = 0; i < n; i++) printf(" %lld%c", a[i], (i == n - 1) ? ' ' : ',');
        putchar('}');
        printf(" * ");
        putchar('{');
        for (int i = 0; i < n; i++) printf(" %lld%c", b[i], (i == n - 1) ? ' ' : ',');
        putchar('}');
        putchar('\n');
        */

        dft(a, n);
        /*
        printf("After NTT: {");
        for (int i = 0; i < n; i++) printf(" %lld%c", a[i], (i == n - 1) ? ' ' : ',');
        putchar('}');
        putchar('\n');
        */

        if (a != b) dft(b, n);
        /*
        printf("After NTT: {");
        for (int i = 0; i < n; i++) printf(" %lld%c", b[i], (i == n - 1) ? ' ' : ',');
        putchar('}');
        putchar('\n');
        */

        for (int i = 0; i < n; i++) a[i] = a[i] * b[i] % MOD;

        idft(a, n);
        if (a != b) idft(b, n);
    }
} ntt;

inline void pow(const long long *a, const int m, const int n, long long *res) {
    int size = 1;
    while (size < m + m) size *= 2;
    ntt.init(size);
    // printf("size = %d, m = %d\n", size, m);

    static long long buf[MAXM_EXTENDED], bufDft[MAXM_EXTENDED];
    std::copy(a, a + m, buf);
    std::copy(a, a + m, res);
    int tmp = n - 1;

    /*
    for (int i = 0; i < tmp; i++) {
        ntt(res, buf, size);
        for (int i = m; i < size; i++) (res[i % m] += res[i]) %= MOD, res[i] = 0;
    }
    return;
    */

    assert(size <= MAXM_EXTENDED);

    while (tmp) {
        if (tmp & 1) {
            ntt.dft(res, size);
            std::copy(buf, buf + size, bufDft);
            ntt.dft(bufDft, size);
            for (int i = 0; i < size; i++) (res[i] *= bufDft[i]) %= MOD;
            ntt.idft(res, size);
            for (int i = m; i < size; i++) (res[i % m] += res[i]) %= MOD, res[i] = 0;
        }
        tmp >>= 1;

        ntt.dft(buf, size);
        for (int i = 0; i < size; i++) (buf[i] *= buf[i]) %= MOD;
        ntt.idft(buf, size);
        for (int i = m; i < size; i++) (buf[i % m] += buf[i]) %= MOD, buf[i] = 0;
    }
}

int main() {
    long long n;
    int x, s;
    static long long a[MAXM];

    scanf("%lld %d %d %d", &n, &m, &x, &s);
    for (int i = 0; i < s; i++) scanf("%lld", &a[i]);

    prepare();

    static long long f[MAXM_EXTENDED];
    for (int i = 0; i < s; i++) {
        if (a[i] == 0) continue;
        f[log[a[i] % m]]++;
    }

    static long long res[MAXM_EXTENDED];
    pow(f, m - 1, n, res);

    assert(log[x] < MAXM_EXTENDED);

    long long ans = res[log[x]];
    printf("%lld\n", ans);

    return 0;
}
```