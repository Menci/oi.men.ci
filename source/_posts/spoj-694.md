title: 「SPOJ 694」Distinct Substrings - 后缀数组
categories:
  - OI
tags:
  - SPOJ
  - 后缀数组
  - 字符串
permalink: spoj-694
date: '2016-04-12 21:40:06'
---

给定一个字符串，求该字符串含有的本质不同的子串数量。

<!-- more -->

### 链接

[SPOJ 694](http://www.spoj.com/problems/DISUBSTR/)

### 题解

每个子串都是原字符串的某个后缀的前缀，所以我们可以统计每个后缀的前缀数量。在后缀数组中，排名第 $ i $ 的后缀与排名第 $ i - 1 $ 的后缀有 $ {\rm height}[i] $ 个相同的前缀，所以要从答案中减去这些。

设数组下标从 1 开始，则答案为

$$ \sum\limits_{i = 1} ^ { {\rm len}(s)} ({\rm len}({\rm suffix}(i)) - {\rm height}[i]) $$

### 代码

```cpp
#include <cstdio>
#include <cstring>
#include <algorithm>

const int MAXT = 20;
const int MAXN = 1000;
const int CHARSET_SIZE = 256;

char s[MAXN];
int n, sa[MAXN + 1], rk[MAXN + 1], ht[MAXN + 1];

inline void suffixArray() {
    static int fir[MAXN], sec[MAXN], tmp[MAXN + 1], _buc[MAXN + 2], *buc = _buc + 1;
    std::fill(sa + 1, sa + n + 1, 0);
    std::fill(rk + 1, rk + n + 1, 0);
    std::fill(ht + 1, ht + n + 1, 0);
    std::fill(fir, fir + n, 0);
    std::fill(sec, sec + n, 0);
    std::fill(tmp + 1, tmp + n + 1, 0);
    std::fill(buc, buc + MAXN + 1, 0);

    for (int i = 0; i < n; i++) buc[(int)s[i]]++;
    for (int i = 0; i < CHARSET_SIZE; i++) buc[i] += buc[i - 1];
    for (int i = 0; i < n; i++) rk[i + 1] = buc[(int)s[i] - 1] + 1;

    for (int t = 1; t <= n; t <<= 1) {
        for (int i = 0; i < n; i++) fir[i] = rk[i + 1];
        for (int i = 0; i < n; i++) sec[i] = (i + t >= n) ? 0 : fir[i + t];

        std::fill(buc, buc + n + 1, 0);
        for (int i = 0; i < n; i++) buc[sec[i]]++;
        for (int i = 0; i <= n; i++) buc[i] += buc[i - 1];
        for (int i = 0; i < n; i++) tmp[buc[sec[i]]--] = i;

        std::fill(buc, buc + n + 1, 0);
        for (int i = 0; i < n; i++) buc[fir[i]]++;
        for (int i = 0; i <= n; i++) buc[i] += buc[i - 1];
        for (int j = n, i; j > 0; j--) i = tmp[j], sa[buc[fir[i]]--] = i + 1;

        for (int i = 1; i <= n; i++) rk[sa[i]] = i;
        for (int j = 1, i, last = 0; j <= n; j++, last = i) {
            i = sa[j] - 1;
            if (last && fir[i] == fir[last] && sec[i] == sec[last]) rk[i + 1] = rk[last + 1];
        }
    }

    for (int i = 1, t = 0; i <= n; i++) {
        if (rk[i] == 1) continue;
        int j = sa[rk[i] - 1];
        if (t > 0) t--;
        while (s[i + t - 1] == s[j + t - 1]) t++;
        ht[rk[i]] = t;
    }
}

int main() {
    int t;
    scanf("%d", &t);
    while (t--) {
        scanf("%s", s);
        n = strlen(s);
        suffixArray();

        int ans = 0;
        for (int i = 1; i <= n; i++) {
            ans += (n - i + 1) - ht[i];
        }

        printf("%d\n", ans);
    }

    return 0;
}
```