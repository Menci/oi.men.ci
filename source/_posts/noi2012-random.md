title: 「NOI2012」随机数生成器 - 矩阵乘法
categories:
  - OI
tags:
  - BZOJ
  - COGS
  - NOI
  - 矩阵乘法
permalink: noi2012-random
date: '2016-10-08 07:29:00'
---

已知

$$ x_{n + 1} = (a x_n + c) \bmod m $$

给定 $ m, a, c, x_0, n, g $，求 $ x_n \bmod g $。

<!-- more -->

### 链接

[BZOJ 2875](www.lydsy.com/JudgeOnline/problem.php?id=2875)  
[COGS 963](http://cogs.pro/cogs/problem/problem.php?pid=963)

### 题解

用矩阵乘法计算递推。

两个数相乘结果可能溢出，需要使用类似快速幂的方法拆成二进制每次乘 $ 2 $。

### 代码

```cpp
#include <cstdio>
#include <cstring>

const long long MAXN = 1e18;
const long long MAXG = 1e8;

long long mod;

struct Matrix {
    long long a[2][2];

    Matrix(const bool unit = false) {
        memset(a, 0, sizeof(a));
        if (unit) for (int i = 0; i < 2; i++) a[i][i] = 1;
    }

    long long &operator()(const int i, const int j) { return a[i][j]; }
    const long long &operator()(const int i, const int j) const { return a[i][j]; }
};

long long mul(long long a, long long b) {
    long long res = 0;
    for (; b; b >>= 1, a = (a + a) % mod) if (b & 1) res = (res + a) % mod;
    return res;
}

Matrix operator*(const Matrix &a, const Matrix &b) {
    Matrix res(false);
    for (int i = 0; i < 2; i++) for (int j = 0; j < 2; j++) for (int k = 0; k < 2; k++) (res(i, j) += mul(a(i, k), b(k, j))) %= mod;
    return res;
}

Matrix pow(Matrix a, long long n) {
    Matrix res(true);
    for (; n; n >>= 1, a = a * a) if (n & 1) res = res * a;
    return res;
}

int main() {
    freopen("randoma.in", "r", stdin);
    freopen("randoma.out", "w", stdout);

    long long a, c, x, n, g;
    scanf("%lld %lld %lld %lld %lld %lld", &mod, &a, &c, &x, &n, &g);
    // mod = 1e9 + 7;

    Matrix init(false);
    init(0, 0) = x;
    init(1, 0) = c;

    Matrix shift(false);
    shift(0, 0) = a, shift(0, 1) = 1;
    shift(1, 0) = 0, shift(1, 1) = 1;

#ifdef FORCE
    Matrix res = init;
    for (int j = 0; j < 2; j++) for (int k = 0; k < 2; k++) printf("%lld%c", res(j, k), k == 2 - 1 ? '\n' : ' ');
    puts("----------------------");
    for (int i = 0; i < n; i++) {
        res = shift * res;
        for (int j = 0; j < 2; j++) for (int k = 0; k < 2; k++) printf("%lld%c", res(j, k), k == 2 - 1 ? '\n' : ' ');
        puts("----------------------");
    }
#else
    Matrix res = pow(shift, n) * init;
#endif

    printf("%lld\n", res(0, 0) % g);

    fclose(stdin);
    fclose(stdout);

    return 0;
}
```