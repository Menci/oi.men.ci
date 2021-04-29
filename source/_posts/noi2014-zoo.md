title: 「NOI2014」动物园 - KMP
categories:
  - OI
tags:
  - BZOJ
  - KMP
  - NOI
  - 字符串
permalink: noi2014-zoo
date: '2016-07-11 23:41:00'
---

对于字符串 $ S $ 的前 $ i $ 个字符构成的子串，既是它的后缀同时又是它的前缀，并且该后缀与该前缀不重叠，将这种字符串的数量记作 $ \mathrm {num}(i) $，求

$$ \prod\limits_{i = 1} ^ n (\mathrm{num}(i) + 1) \pmod {1000000007} $$
<!-- more -->

### 链接

[BZOJ 3670](http://www.lydsy.com/JudgeOnline/problem.php?id=3670)  
[UOJ #5](http://uoj.ac/problem/5)

### 题解

考虑简化问题，去除「该后缀与该前缀不重叠」的限制后，问题变成了一个简单的 DP —— $ \mathrm{num}(i) = \mathrm{num}(\mathrm{next}(i)) + 1 $。

考虑限制条件 —— 我们需要对 $ \mathrm{next} $ 数组设置同样的限制条件，并设其为 $ \mathrm{next2} $。然后对于带限制的 $ \mathrm{num} $（设为 $ \mathrm{num2} $），发现 $ \mathrm{num2}(i) = \mathrm{num2}(\mathrm{next2}(i)) + 1 $ 并不成立，观察后可发现

$$ \mathrm{num2}(i) = \mathrm{num}(\mathrm{next2}(i)) + 1 $$

### 代码

```cpp
#include <cstdio>
#include <cstring>

const int MAXT = 5;
const int MAXN = 1000000;
const unsigned long long MOD = 1000000007;

int n, next[MAXN + 1], next2[MAXN + 1], num[MAXN + 1], num2[MAXN + 1];
char s[MAXN + 1];

inline unsigned long long kmp() {
    next[0] = next[1] = num[0] = num[1] = 0;
    for (int i = 2, t = 0, k = 0; i <= n; i++) {
        while (t && s[t] != s[i - 1]) t = next[t];
        while ((k && s[k] != s[i - 1]) || k >= i / 2) k = next[k];

        if (s[k] == s[i - 1]) num2[i] = num[++k] + 1;
        else num2[i] = 0;

        if (s[t] == s[i - 1]) next[i] = ++t, num[i] = num[t] + 1;
        else next[i] = num[i] = 0;
    }

    // for (int i = 1; i <= n; i++) printf("%d%c", f[i], i == n ? '\n' : ' ');
    // for (int i = 1; i <= n; i++) printf("%d%c", num[i], i == n ? '\n' : ' ');
    // for (int i = 1; i <= n; i++) printf("%d%c", num2[i], i == n ? '\n' : ' ');

    unsigned long long ans = 1;
    for (int i = 1; i <= n; i++) (ans *= (num2[i] + 1)) %= MOD;
    return ans;
}

int main() {
    int t = 1;
    scanf("%d", &t);
    while (t--) {
        scanf("%s", s);
        n = strlen(s);

        printf("%llu\n", kmp());
    }

    return 0;
}
```