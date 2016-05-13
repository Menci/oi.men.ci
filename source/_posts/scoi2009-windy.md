title: 「SCOI2009」windy 数 - 数位DP
categories: OI
tags: 
  - BZOJ
  - SCOI
  - 数位DP
  - DP
permalink: scoi2009-windy
date: 2016-05-12 17:25:00
---

windy 定义了一种 windy 数。不含前导零且相邻两个数字之差至少为 $ 2 $ 的正整数被称为 windy 数。

windy 想知道，在 $ A $ 和 $ B $ 之间，包括 $ A $ 和 $ B $，总共有多少个 windy 数？

<!-- more -->

### 链接
[BZOJ 1026](http://www.lydsy.com/JudgeOnline/problem.php?id=1026)

### 题解
数位 DP，设

$$ f[n][last][notZero][limited] $$

表示最后 $ n $ 位数，这 $ n $ 位数的前一位数是 $ last $，之前是否有非零数（如果前面全是零则不考虑差分限制），是否达到上界，的总数量。

PS：不允许有前导零的实现方式是，允许前导零，但不对前导零设置限制。

### 代码
```c++
#include <cstdio>
#include <cmath>
#include <cstring>
#include <algorithm>

const int MAXX = 2000000000;
const int MAXN = 10;
const int MINGAP = 2;

const int CHARSET_SIZE = 10;
const int FLAG = 2;

int a[MAXN], n;

int mem[MAXN][CHARSET_SIZE][FLAG][FLAG];
bool calced[MAXN][CHARSET_SIZE][FLAG][FLAG];

inline int dp(const int n, const int last, const bool notZero, const bool limited) {
    int &ans = mem[n][last][notZero][limited];
    if (calced[n][last][notZero][limited]) return ans;
    calced[n][last][notZero][limited] = true;
    
    if (n == 0) {
        ans = 1;
    } else {
        int limit;
        if (limited) limit = a[::n - n];
        else limit = CHARSET_SIZE - 1;
        
        for (int i = 0; i <= limit; i++) {
            if (notZero && abs(i - last) < MINGAP) continue;
            ans += dp(n - 1, i, notZero || i != 0, limited && i == limit);
        }
    }
    
    return ans;
}

inline int solve(const char *s) {
    std::fill(a, a + n, 0);
    int len = strlen(s);
    for (int i = 0; i < len; i++) a[i] = s[len - i - 1] - '0';
    std::reverse(a, a + n);
    
    // for (int i = 0; i < n; i++) putchar('0' + a[i]);
    // putchar('\n');
    
    memset(mem, 0, sizeof(mem));
    memset(calced, 0, sizeof(calced));
    
    int ans = 0;
    for (int i = 0; i <= a[0]; i++) {
        ans += dp(n - 1, i, i != 0, i == a[0]);
    }
    
    return ans;
}

int main() {
    int l, r;
    scanf("%d %d", &l, &r);
    
    char s1[MAXN + 1], s2[MAXN + 1];
    sprintf(s1, "%d", l - 1);
    sprintf(s2, "%d", r);
    
    n = strlen(s2);
    
    printf("%d\n", solve(s2) - solve(s1));
    
    return 0;
}
```
