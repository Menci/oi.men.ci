title: 「JSOI2007」字符加密 - 后缀数组
categories:
  - OI
tags:
  - BZOJ
  - JSOI
  - 后缀数组
  - 字符串
permalink: jsoi2007-cipher
date: '2016-09-29 21:00:00'
---

把一个字符串 $ S $ 排成一圈，从每个字符开始读一圈，把每次读到的字符串排序，按顺序将每个串的最后一个字符排成一个新字符串，求新字符串。

<!-- more -->

### 链接

[BZOJ 1031](http://www.lydsy.com/JudgeOnline/problem.php?id=1031)

### 题解

将串翻倍，建立后缀数组，得到循环意义下每个串的排序，找到每个串的最后一个字符输出即可。

### 代码

```cpp
#include <cstdio>
#include <cstring>
#include <algorithm>

const int MAXN = 1e5 * 2;

char s[MAXN];
int n, sa[MAXN], rk[MAXN], ht[MAXN];

inline void print(const int *a) {
    for (int i = 0; i < n; i++) printf("%d%c", a[i], i == n - 1 ? '\n' : ' ');
}

inline void suffixArray() {
    static int set[MAXN], a[MAXN];
    for (int i = 0; i < n; i++) set[i] = s[i];
    std::sort(set, set + n);
    int *end = std::unique(set, set + n);
    for (int i = 0; i < n; i++) a[i] = std::lower_bound(set, end, s[i]) - set;

    static int fir[MAXN], sec[MAXN], tmp[MAXN], _buc[MAXN + 1], *buc = _buc + 1;
    for (int i = 0; i < n; i++) buc[a[i]]++;
    for (int i = 0; i < n; i++) buc[i] += buc[i - 1];
    for (int i = 0; i < n; i++) rk[i] = buc[a[i] - 1];

    for (int t = 1; t < n; t *= 2) {
        for (int i = 0; i < n; i++) fir[i] = rk[i], sec[i] = i + t >= n ? -1 : rk[i + t];

        std::fill(buc - 1, buc + n, 0);
        for (int i = 0; i < n; i++) buc[sec[i]]++;
        for (int i = 0; i < n; i++) buc[i] += buc[i - 1];
        // print(fir);
        // print(sec);
        for (int i = 0; i < n; i++) tmp[n - buc[sec[i]]--] = i;
        // print(tmp);

        std::fill(buc - 1, buc + n, 0);
        for (int i = 0; i < n; i++) buc[fir[i]]++;
        for (int i = 0; i < n; i++) buc[i] += buc[i - 1];
        // print(buc);
        for (int i = 0; i < n; i++) sa[--buc[fir[tmp[i]]]] = tmp[i];
        // print(sa);
        for (int i = 0; i < n; i++) {
            if (!i) rk[sa[i]] = 0;
            else if (fir[sa[i]] == fir[sa[i - 1]] && sec[sa[i]] == sec[sa[i - 1]]) rk[sa[i]] = rk[sa[i - 1]];
            else rk[sa[i]] = rk[sa[i - 1]] + 1;
        }
        // print(rk);

        // return;
    }
    // puts("----------------");
    // print(sa);
    // print(rk);
    // for (int i = 0; i < n; i++) printf("%s\n", s + sa[i]);

    /*
    for (int i = 0, j, k = 0; i < n; i++) {
        if (!rk[i]) continue;
        j = sa[rk[i] - 1];
        if (k) k--;
        // k = 0;
        while (i + k < n && j + k < n && s[i + k] == s[j + k]) k++;
        ht[rk[i]] = k;
    }
    */
    // print(ht);
}

int main() {
    scanf("%s", s);
    n = strlen(s);
    for (int i = 0; i < n; i++) s[i + n] = s[i];
    n *= 2;
    suffixArray();
    // for (int i = 0; i < n; i++) printf("%d%c", sa[i] + 1, i == n - 1 ? '\n' : ' ');
    // for (int i = 1; i < n; i++) printf("%d%c", ht[i], i == n - 1 ? '\n' : ' ');

    for (int i = 0; i < n; i++) {
        if (sa[i] < n / 2) {
            putchar(s[sa[i] + n / 2 - 1]);
        }
    }
    putchar('\n');

    return 0;
}
```