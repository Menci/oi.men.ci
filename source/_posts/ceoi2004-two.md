title: 「CEOI2004」锯木厂选址 - 斜率优化 DP
categories: OI
tags: 
  - COGS
  - CEOI
  - 斜率优化
  - 单调队列
  - DP
permalink: ceoi2004-two
date: 2016-05-18 18:03:00
---

从山顶上到山底下沿着一条直线种植了 $ n $ 棵老树。当地的政府决定把他们砍下来。为了不浪费任何一棵木材，树被砍倒后要运送到锯木厂。
木材只能按照一个方向运输：朝山下运。山脚下有一个锯木厂。另外两个锯木厂将新修建在山路上。你必须决定在哪里修建两个锯木厂，使得传输的费用总和最小。假定运输每公斤木材每米需要一分钱。

<!-- more -->

### 链接
[COGS 362](http://cogs.top/cogs/problem/problem.php?pid=362)

### 题解
将整个序列反转，目标变为将所有树运到 $ 0 $ 号点。

设 $ f[i][j] $ 表示前 $ i $ 棵树，修建 $ j $ 个锯木厂的最小花费。使用滚动数组去掉第二维，设 $ f(i) $ 为原有的 $ f[i][j] $，$ g(i) $ 为原有的 $ f[i][j - 1] $。$ S(i) $ 表示前 $ i $ 棵树全部运到 $ 0 $ 号点的花费，$ s(i) $ 表示前 $ i $ 棵树的总质量。

$$ f(i) = \min\limits_{j = 0} ^ {i} \{ g(j) + S(i) - S(j) - (s(i) - s(j)) \times d(j + 1) \} $$

斜率优化，考虑两个决策点 $ a $、$ b $，若 $ a $ 比 $ b $ 优，则有

$$
{(g(a) - S(a) + s(a) \times d(a + 1)) - (g(b) - S(b) + s(b) \times d(b + 1)) \over d(a + 1) - d(b + 1)} < s(i)
$$

维护决策点，使斜率递增，最优决策取队首。时间复杂度为 $ O(n) $。

### 代码
```c++
#include <cstdio>
#include <climits>
#include <algorithm>

const int MAXN = 20000;
const int MAXM = 3;

int n;
long long w[MAXN + 1], d[MAXN + 1], s[MAXN + 1], S[MAXN + 1];
long long g[MAXN + 1], f[MAXN + 1];

inline void prepare() {
    std::reverse(w + 1, w + n + 1);
    std::reverse(d + 1, d + n + 1);
    
    for (int i = 1; i <= n; i++) {
        d[i] += d[i - 1];
        s[i] = s[i - 1] + w[i];
        S[i] = S[i - 1] + w[i] * d[i];
    }
}

/*
inline void force() {
    std::copy(S, S + n + 1, f);
    for (int k = 1; k < MAXM; k++) {
        std::copy(f, f + n + 1, g);
        std::fill(f, f + n + 1, LLONG_MAX);

        f[0] = 0;
        for (int i = 1; i <= n; i++) {
            int _j = -1;
            for (int j = 0; j < i; j++) {
                if (f[i] > g[j] + S[i] - S[j] - (s[i] - s[j]) * d[j + 1]) {
                    f[i] = g[j] + S[i] - S[j] - (s[i] - s[j]) * d[j + 1];
                    _j = j;
                }
            }
            printf("%d --> %d\n", i, _j);
        }
    }
}
*/

inline long long x(const int i) { return g[i] - S[i] + s[i] * d[i + 1]; }

inline double slope(const int a, const int b) {
    return double(x(a) - x(b))
         / double(d[a + 1] - d[b + 1]);
}

inline void dp() {
    std::copy(S, S + n + 1, f);
    for (int k = 1; k < MAXM; k++) {
        std::copy(f, f + n + 1, g);
        std::fill(f, f + n + 1, LLONG_MAX);

        f[0] = 0;

        static int q[MAXN];
        int *l = q, *r = q;
        *r = 0;

        for (int i = 1; i <= n; i++) {
            while (l < r && slope(*(l + 1), *l) < s[i]) l++;

            int &j = *l;
            f[i] = g[j] + S[i] - S[j] - (s[i] - s[j]) * d[j + 1];
            // printf("%d --> %d\n", i, j);

            if (i < n) {
                while (l < r && slope(*r, *(r - 1)) > slope(i, *r)) r--;
                *++r = i;
            }
        }
    }
}

int main() {
    freopen("two.in", "r", stdin);
    freopen("two.out", "w", stdout);

    scanf("%d", &n);
    for (int i = 1; i <= n; i++) {
        scanf("%lld %lld", &w[i], &d[i]);
    }

    prepare();
    // force();
    dp();
    printf("%lld\n", f[n]);

    fclose(stdin);
    fclose(stdout);

    return 0;
}
```
