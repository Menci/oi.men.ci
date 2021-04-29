title: 「ZJOI2008」泡泡堂 - 贪心
categories:
  - OI
tags:
  - BZOJ
  - ZJOI
  - 贪心
permalink: zjoi2008-bnb
date: '2016-11-13 09:53:00'
---

两队分别 $ n $ 个选手对战，已知每个选手的实力，实力强的选手一定获胜。每一场胜、平、败的得分分别为 $ 2, 1, 0 $。求一个队能获得的最高得分和最低得分。

<!-- more -->

### 链接

[BZOJ 1034](http://www.lydsy.com/JudgeOnline/problem.php?id=1034)

### 题解

贪心，从弱到强考虑队伍 A 中的每一个人，如果它可以战胜 B 中的某一个人，则让它战胜 B 中它能战胜的最强的人。最后考虑 A 中剩余的人，尽量让这些人和 B 中的人平局。

证明略。

### 代码

```cpp
#include <cstdio>
#include <set>

const int MAXN = 100000;

int n;

inline int solve(const int *a, const int *b) {
    std::multiset<int> sa, sb;
    for (int i = 0; i < n; i++) sa.insert(a[i]), sb.insert(b[i]);

    int ans = 0;
    for (std::multiset<int>::iterator it = sa.begin(); it != sa.end(); ) {
        std::multiset<int>::iterator target = sb.lower_bound(*it);
        if (target == sb.begin()) {
            it++;
        } else {
            target--;
            sb.erase(target);
            sa.erase(it++);
            ans += 2;
        }
    }

    for (std::multiset<int>::iterator it = sa.begin(); it != sa.end(); it++) {
        std::multiset<int>::iterator target = sb.lower_bound(*it);
        if (*target == *it) sb.erase(target), ans++;
    }

    return ans;
}

int main() {
    scanf("%d", &n);

    static int a[MAXN], b[MAXN];
    for (int i = 0; i < n; i++) scanf("%d", &a[i]);
    for (int i = 0; i < n; i++) scanf("%d", &b[i]);

    /*
    std::sort(a, a + n);
    std::sort(b, b + n);
    */

    printf("%d %d\n", solve(a, b), n * 2 - solve(b, a));

    return 0;
}
```