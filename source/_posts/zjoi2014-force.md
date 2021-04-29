title: 「ZJOI2014」力 - FFT
categories:
  - OI
tags:
  - BZOJ
  - FFT
  - ZJOI
  - 数学
permalink: zjoi2014-force
date: '2016-06-11 21:27:00'
---

已知

$$ E_i = \frac{F_i}{q_i} $$$$ F_j = \sum\limits_{i < j} \frac{q_i q_j}{(i - j) ^ 2} - \sum\limits_{i > j} \frac{q_i q_j}{(i - j) ^ 2} $$

求数列 $ E $。

<!-- more -->

### 链接

[BZOJ 3527](http://www.lydsy.com/JudgeOnline/problem.php?id=3527)

### 题解

由题意得

$$ E_j = \sum\limits_{i < j} \frac{q_i}{(i - j) ^ 2} - \sum\limits_{i > j} \frac{q_i}{(i - j) ^ 2} $$

设 $ E_j = A_j - B_j $ 考虑前一半，它等价于

$$ A_j = \sum\limits_{i = 1} ^ {j - 1} \frac{q_j}{(i - j) ^ 2} $$

考虑这样两个函数

$$ g(i) = \begin{cases} \frac{1}{i ^ 2} & i \neq 0 \\ 0 & i = 0 \end{cases} $$$$ f(i) = \begin{cases} q_i & i \neq 0 \\ 0 & i = 0 \end{cases} $$

上式化为

$$ A_j = \sum\limits_{i = 0} ^ {j} f(i) g(j - i) $$

为~多项式乘法~卷积的形式，可以用 FFT 加速计算。

同理，对于后一半，有

$$ A_j = \sum\limits_{i = j + 1} ^ {n} \frac{q_j}{(i - j) ^ 2} $$

与 [BZOJ 2194](bzoj-2194) 一题相似，将 $ A $ 翻转后计算即可。

### 代码

```cpp
#include <cstdio>
#include <cmath>
#include <complex>
#include <algorithm>

const int MAXN = 100000;
const int MAXN_EXTENDED = 262144;
const long double PI = acos(-1);

struct FastFourierTransform {
    std::complex<long double> omega[MAXN_EXTENDED], omegaInverse[MAXN_EXTENDED];

    void init(const int n) {
        for (int i = 0; i < n; i++) {
            omega[i] = std::complex<long double>(cosl(2 * PI / n * i), sinl(2 * PI / n * i));
            omegaInverse[i] = std::conj(omega[i]);
        }
    }

    void transform(std::complex<long double> *a, const int n, const std::complex<long double> *omega) {
        int k = 0;
        while ((1 << k) != n) k++;
        for (int i = 0; i < n; i++) {
            int t = 0;
            for (int j = 0; j < k; j++) if (i & (1 << j)) t |= (1 << (k - j - 1));
            if (t > i) std::swap(a[t], a[i]);
        }

        for (int l = 2; l <= n; l *= 2) {
            const int m = l / 2;
            for (std::complex<long double> *p = a; p != a + n; p += l) {
                for (int i = 0; i < m; i++) {
                    const std::complex<long double> t = omega[n / l * i] * p[i + m];
                    p[i + m] = p[i] - t;
                    p[i] += t;
                }
            }
        }
    }

    void dft(std::complex<long double> *a, const int n) {
        transform(a, n, omega);
    }

    void idft(std::complex<long double> *a, const int n) {
        transform(a, n, omegaInverse);
        for (int i = 0; i < n; i++) a[i] /= n;
    }

    void multiply(std::complex<long double> *a, std::complex<long double> *b, const int n) {
        int size = 1;
        while (size < n * 2) size *= 2;

        /*
        static std::complex<long double> c[MAXN_EXTENDED];
        for (int i = 0; i < n; i++) c[i] = 0;
        for (int j = 0; j < n; j++) {
            for (int i = 0; i <= j; i++) {
                c[j] += a[i] * b[j - i];
            }
        }

        std::copy(c, c + n, a);
        return;
        */

        init(size);

        dft(a, size);
        dft(b, size);

        for (int i = 0; i < size; i++) a[i] *= b[i];

        idft(a, size);
    }
} fft;

int n;
long double q[MAXN + 1];

inline void calc(const long double *q, long double *E) {
    static std::complex<long double> f[MAXN_EXTENDED], g[MAXN_EXTENDED];
    std::fill(f, f + MAXN_EXTENDED, 0);
    std::fill(g, g + MAXN_EXTENDED, 0);
    std::copy(q, q + n + 1, f);
    f[0] = g[0] = std::complex<long double>(0, 0);
    for (int i = 1; i <= n; i++) {
        g[i] = std::complex<long double>(1.0 / pow(i, 2), 0);
    }

    fft.multiply(f, g, n + 1);
    for (int i = 1; i <= n; i++) E[i] = f[i].real();

    /*
    for (int i = 0; i < (n + 1) * 2; i++) printf("* %lf\n", static_cast<double>(f[i].real()));
    putchar('\n');

    return;

    static std::complex<long double> r[MAXN_EXTENDED];
    for (int j = 0; j <= n; j++) {
        r[j] = 0;
        for (int i = 0; i <= j; i++) {
            r[j] += f[i] * g[j - i];
        }
    }

    for (int i = 0; i <= n; i++) printf("* %lf\n", static_cast<double>(r[i].real()));
    putchar('\n');

    for (int i = 1; i <= n; i++) E[i] = r[i].real();
    */
}

int main() {
    scanf("%d", &n);
    for (int i = 1; i <= n; i++) {
        double x;
        scanf("%lf", &x);
        q[i] = x;
    }

    static long double E1[MAXN + 1], E2[MAXN + 1];
    calc(q, E1);
    std::reverse(q + 1, q + n + 1);
    calc(q, E2);

    for (int i = 1; i <= n; i++) printf("%.3lf\n", static_cast<double>(E1[i] - E2[n - i + 1]));

    return 0;
}
```