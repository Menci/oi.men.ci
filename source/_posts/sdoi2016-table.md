title: 「SDOI2016」储能表 - 二进制
date: 2016-04-18 17:06:53
categories: OI
tags:
  - SDOI
  - COGS
  - BZOJ
  - 二进制
  - 异或
  - 位运算
permalink: sdoi2016-table
---

有一个 $ n $ 行 $ m $ 列的表格，行从 $ 0 $ 到 $ n - 1 $ 编号，列从 $ 0 $ 到 $ m - 1 $ 编号。  
每个格子都储存着能量。最初，第 $ i $ 行第 $ j $ 列的格子储存着 $ (i \ {\rm xor} \ j) $ 点能量。所以，整个表格储存的总能量是，

$$ \sum\limits_{i = 0} ^ {n - 1} \sum\limits_{j = 0} ^ {m - 1} (i \ {\rm xor} \ j) $$

随着时间的推移，格子中的能量会渐渐减少。一个时间单位，每个格子中的能量都会减少 $ 1 $。显然，一个格子的能量减少到 $ 0 $ 之后就不会再减少了。  
也就是说，$ k $ 个时间单位后，整个表格储存的总能量是，

$$ \sum\limits_{i = 0} ^ {n - 1} \sum\limits_{j = 0} ^ {m - 1} \max((i \ {\rm xor} \ j) - k, 0) $$

给出一个表格，求 $ k $ 个时间单位后它储存的总能量。  
由于总能量可能较大，输出时对 $ p $ 取模。

<!-- more -->

### 链接
[COGS 2220](http://cogs.top/cogs/problem/problem.php?pid=2220)  
[BZOJ 4513](http://www.lydsy.com/JudgeOnline/problem.php?id=4513)

### 题解
正解是数位 DP …… 这里讲一种乱搞做法 ……

考虑异或的性质：

性质一：对于任意 $ x < 2 ^ N $，$ y < 2 ^ N $，必有 $ (x + 2 ^ N) \ {\rm xor} \ (y + 2 ^ N) = x \ {\rm xor} \ y $

> 证明：之前两个数的从低到高第 $ N $ 位均为 $ 0 $，现在均为 $ 1 $，异或后结果不变。

性质二：对于任意 $ x \neq y $，必有 $ x \ {\rm xor} \ z \neq y \ {\rm xor} \ z $

> 证明：反证法，假设 $ x \ {\rm xor} \ z = y \ {\rm xor} \ z = a $，则有 $ x \ {\rm xor} \ a = z $、$ y \ {\rm xor} \ a = z $，即 $ x = y $，与题设矛盾。

性质三：对于任意 $ x < 2 ^ N $，$ [0, 2 ^ N - 1] $ 的所有数与 $ x $ 的异或所得结果取遍 $ [0, 2 ^ N - 1] $ 的所有数。

> 证明：显然，有性质 2 可知这些数互不相同，并且二进制最多有 $ N $ 位，不可能大于等于 $ 2 ^ N $，即这 $ 2 ^ N - 1 $ 个互不相同的数都在 $ [0, 2 ^ N - 1] $ 内。

设 $ n > m $，为方便阅读，$ n $ 表示列数，$ m $ 表示行数。

打表找规律，先从最简单的开始搞。不考虑 $ k $，当 $ n = m = 2 ^ N $（$ N = 3 $）时，结果为

$$
\begin{matrix}
0 & 1 & 2 & 3 & 4 & 5 & 6 & 7 \\
1 & 0 & 3 & 2 & 5 & 4 & 7 & 6 \\
2 & 3 & 0 & 1 & 6 & 7 & 4 & 5 \\
3 & 2 & 1 & 0 & 7 & 6 & 5 & 4 \\
4 & 5 & 6 & 7 & 0 & 1 & 2 & 3 \\
5 & 4 & 7 & 6 & 1 & 0 & 3 & 2 \\
6 & 7 & 4 & 5 & 2 & 3 & 0 & 1 \\
7 & 6 & 5 & 4 & 3 & 2 & 1 & 0 \\
\end{matrix}
$$

可以看到，整个矩阵的每一行包含了 $ [0, 2 ^ N - 1] $ 的所有数字。直接使用等差数列求和公式计算即可。

稍复杂的情况，设 $ N = \lfloor \log_2 n \rfloor $，$ M = \lfloor \log_2 m \rfloor $。当 $ N = M $ 时，打表结果为

$$
\begin{matrix}
0 & 1 & 2 & 3 & 4 & 5 & 6 & 7 & \color{rgb(236, 62, 61)}{8} & \color{rgb(236, 62, 61)}{9} \\
1 & 0 & 3 & 2 & 5 & 4 & 7 & 6 & \color{rgb(236, 62, 61)}{9} & \color{rgb(236, 62, 61)}{8} \\
2 & 3 & 0 & 1 & 6 & 7 & 4 & 5 & \color{rgb(236, 62, 61)}{10} & \color{rgb(236, 62, 61)}{11} \\
3 & 2 & 1 & 0 & 7 & 6 & 5 & 4 & \color{rgb(236, 62, 61)}{11} & \color{rgb(236, 62, 61)}{10} \\
4 & 5 & 6 & 7 & 0 & 1 & 2 & 3 & \color{rgb(236, 62, 61)}{12} & \color{rgb(236, 62, 61)}{13} \\
5 & 4 & 7 & 6 & 1 & 0 & 3 & 2 & \color{rgb(236, 62, 61)}{13} & \color{rgb(236, 62, 61)}{12} \\
6 & 7 & 4 & 5 & 2 & 3 & 0 & 1 & \color{rgb(236, 62, 61)}{14} & \color{rgb(236, 62, 61)}{15} \\
7 & 6 & 5 & 4 & 3 & 2 & 1 & 0 & \color{rgb(236, 62, 61)}{15} & \color{rgb(236, 62, 61)}{14} \\
\color{rgb(20, 122, 4)}{8} & \color{rgb(20, 122, 4)}{9} & \color{rgb(20, 122, 4)}{10} & \color{rgb(20, 122, 4)}{11} & \color{rgb(20, 122, 4)}{12} & \color{rgb(20, 122, 4)}{13} & \color{rgb(20, 122, 4)}{14} & \color{rgb(20, 122, 4)}{15} & \color{rgb(249, 181, 37)}{0} & \color{rgb(249, 181, 37)}{1} \\
\color{rgb(20, 122, 4)}{9} & \color{rgb(20, 122, 4)}{8} & \color{rgb(20, 122, 4)}{11} & \color{rgb(20, 122, 4)}{10} & \color{rgb(20, 122, 4)}{13} & \color{rgb(20, 122, 4)}{12} & \color{rgb(20, 122, 4)}{15} & \color{rgb(20, 122, 4)}{14} & \color{rgb(249, 181, 37)}{1} & \color{rgb(249, 181, 37)}{0} \\
\end{matrix}
$$

左上角的黑色部分可以直接规约到第一种情况。红色的部分中，参与异或运算的一个数多了一个二进制位，根据性质三，这一部分能取到 $ [2 ^ N， 2 ^ N + 2 ^ M - 1] $ 的所有数。绿色部分同理。

对于黄色部分，相当于去掉了 $ n $ 和 $ m $ 的最高位后的一个子问题，递归计算即可。

更复杂的情况，当 $ N > M $（因为 $ n > m $ 所以不可能存在 $ N < M $）时，打表结果为

$$
\begin{matrix}
0 & 1 & 2 & 3 & 4 & 5 & 6 & 7 & \color{rgb(102, 204, 255)}{8} & \color{rgb(102, 204, 255)}{9} \\
1 & 0 & 3 & 2 & 5 & 4 & 7 & 6 & \color{rgb(102, 204, 255)}{9} & \color{rgb(102, 204, 255)}{8} \\
2 & 3 & 0 & 1 & 6 & 7 & 4 & 5 & \color{rgb(102, 204, 255)}{10} & \color{rgb(102, 204, 255)}{11} \\
3 & 2 & 1 & 0 & 7 & 6 & 5 & 4 & \color{rgb(102, 204, 255)}{11} & \color{rgb(102, 204, 255)}{10} \\
\end{matrix}
$$

由性质三得，左边黑色部分取遍了 $ [0, 2 ^ N - 1] $，可用等差数列求和公式直接计算，右边部分都大于等于 $ 2 ^ N $，将它们同时减去 $ 2 ^ N $ 后即为 $ N = M $ 的情况，递归处理后为每个数加上 $ 2 ^ N $ 即可。

现在考虑 $ k $ 对结果的影响，我们在计算一个等差数列 $ 0, 1, 2, 3, … n $ 时，前面所有 $ \leq k $ 的项都会变成 $ 0 $，后面所有项减去 $ k $，相当于一个以 $ 1 $ 开始，长度为 $ n - k $ 的等差数列，代入公式即可。

对于最后一种情况的递归，需要在 $ k $ 中将 $ n $ 的最高位去掉。最后为每个数加上时，对每个数的增量减去 $ k $ 即可。

每次递归时，会去掉 $ n $ 二进制最高位上的 $ 1 $，其他的计算都可以在常数时间内完成，总时间复杂度为 $ O(T \log (\max(n, m))) $。

### 代码
```c++
#include <cstdio>
#include <algorithm>

const int MAXT = 5000;
const long long MAXN = 1e18;
const long long MAXM = 1e18;
const long long MAXK = 1e18;
const int MAXP = 1e9;

long long p = MAXP;

/*
template <typename T>
inline int bitsCount(const T &x) {
    for (int i = sizeof(T) * 8 - 1; i >= 0; i--) if (x & ((T)1 << i)) return i + 1;
    return 0;
}
*/

template <typename T>
inline void bitsPrint(const T &x) {
    for (int i = sizeof(T) * 8 - 1; i >= 0; i--)
        if (x & ((T)1 << i)) putchar('1');
        else putchar('0');
    putchar('\n');
}

template <typename T>
inline T lowbit(const T &x) { return x & -x; }

template <typename T>
inline int log2(T x) {
    int ans = 0;
    while (x >>= 1) ans++;
    return ans;
}

template <typename T>
inline T mul(T x, T y, const T &z = 1) {
    // (x * y) / z, z is 1 or 2;
    if (z == 2) {
        if (x & 1) y >>= 1;
        else if (y & 1) x >>= 1;
        else throw;
    }
    return (x % p) * (y % p) % p;
}

inline long long sumTimes(long long first, long long n, const long long k, const long long t) {
   //  printf("from %lld to %lld = (%lld + %lld) * %lld / 2, and %lld times\n", first, first + n - 1, first, (first + n - 1), n, t);
    first -= k;
    if (first < 1) n -= (1 - first), first = 1;
    // printf("from %lld to %lld = (%lld + %lld) * %lld / 2, and %lld times\n", first, first + n - 1, first, (first + n - 1), n, t);
    if (n <= 0) return 0;
    return mul(mul(first + (first + n - 1), n, 2ll), t);
}

long long solve(long long n, long long m, long long k) {
    // printf("solve(%lld, %lld, %lld)\n", n, m, k);
    if (n == 0 || m == 0) return 0;

    if (k < 0) k = 0;
    if (n < m) std::swap(n, m);

    if (n == m && lowbit(n) == n) {
        return sumTimes(1, n - 1, k, m);
    }

    int N = log2(n), M = log2(m);
    long long centerWidth = (1ll << N), centerHeight = (1ll << M);
    if (N == M) {
        long long rightWidth = n - centerWidth, rightHeight = centerHeight;
        long long bottomWidth = centerWidth, bottomHeight = m - centerHeight;

        long long rightSum = sumTimes(centerWidth, rightHeight, k, rightWidth);
        long long bottomSum = sumTimes(centerHeight, bottomWidth, k, bottomHeight);

        long long sideSum = solve(rightWidth, bottomHeight, k);
        long long centerSum = solve(bottomWidth, rightHeight, k);

        return ((rightSum + bottomSum) % p + (sideSum + centerSum) % p) % p;
    } else {
        long long leftWidth = (1ll << N), leftHeight = m;
        long long rightWidth = n - leftWidth, rightHeight = leftHeight;

        long long leftSum = sumTimes(0, leftWidth, k, leftHeight);
        long long rightSum = solve(rightWidth, rightHeight, k - leftWidth);

        if (leftWidth > k) {
            rightSum += mul(mul(leftWidth - k, m), n - leftWidth);
            rightSum %= p;
        }

        return (leftSum + rightSum) % p;
    }
}

int main() {
    freopen("menci_table.in", "r", stdin);
    freopen("menci_table.out", "w", stdout);

    int t;
    scanf("%d", &t);
    while (t--) {
        long long n, m, k;
        scanf("%lld %lld %lld %lld", &n, &m, &k, &p);
        printf("%lld\n", solve(n, m, k));
    }

    // long long n, m, k;
    // scanf("%lld %lld %lld", &n, &m, &k);
    // bitsPrint(n), bitsPrint(m);

    // printf("lowbit(%lld) = %lld\nbitsCount(%lld) = %d\n2 ^ bitsCount(%lld) = %d\n", n, lowbit(n), n, bitsCount(n), n, 1 << (bitsCount(n)));
    // bitsPrint((1 << bitsCount(n)) - 1);

    /*long long ans = 0;
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < m; j++) {
            int t = std::max((i ^ j) - k, 0ll);
            printf("%3d", t);
            ans += t;
        }
        putchar('\n');
    }*/

    // printf("ans = %lld\n", ans);

    // printf("%lld\n", solve(n, m, k));

    fclose(stdin);
    fclose(stdout);

    return 0;
}
```
