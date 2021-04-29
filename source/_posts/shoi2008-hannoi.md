title: 「SHOI2008」汉诺塔 - DP
categories:
  - OI
tags:
  - BZOJ
  - DP
  - SHOI
permalink: shoi2008-hannoi
date: '2016-10-19 15:24:00'
---

在任何操作执行之前，我们以任意的次序为六种操作（AB、AC、BA、BC、CA 和 CB）赋予不同的优先级，然后，我们总是选择符合以下两个条件的操作来移动盘子，直到所有的盘子都从柱子 A 移动到另一根柱子：

1. 这种操作是所有合法操作中优先级最高的；
2. 这种操作所要移动的盘子不是上一次操作所移动的那个盘子。

可以证明，上述策略一定能完成汉诺塔游戏。
现在你的任务就是假设给定了每种操作的优先级，计算按照上述策略操作汉诺塔移动所需要的步骤数。

<!-- more -->

### 链接

[BZOJ 1019](http://www.lydsy.com/JudgeOnline/problem.php?id=1019)

### 题解

设 $ f(j, i) $ 表示只考虑柱子 $ i $ 上的最上面的 $ j $ 个盘子（不考虑下面更大的盘子和其它柱子上的盘子），将这些盘子移动到 $ g(j, i) $ 上的步数。

根据汉诺塔的规则，我们需要先移动前 $ j - 1 $ 个盘子，需要 $ f(j - 1, i) $ 次操作，这些盘子被移动到 $ g(j - 1, i) $ 上。设 $ a = g(j - 1, i) $，则另一个柱子 $ b = 3 - a - i $。我们需要把第 $ j $ 个盘子移动到 $ b $ 上。

继续考虑移动到 $ a $ 上的 $ j - 1 $ 个盘子，这些盘子需要移动到 $ g(j - 1, a) $ 上，如果 $ g(j - 1, a) = b $，则直接将它们移到 $ b $ 上，此时 $ j $ 个盘子均已移动到 $ b $ 上，所以 $ f(j, i) = f(j - 1, i) + 1 + f(j - 1, a) $，$ g(j, i) = b $。

如果 $ g(j - 1, a) = i $ 则需要将 $ j - 1 $ 个盘子移回 $ i $ 柱子，然后将最大的盘子移到 $ a $ 上，再将前 $ j - 1 $ 个盘子移到 $ a $ 上（因为 $ g(j - 1, i) = a $）。所以 $ f(j, i) = f(j - 1, i) + 1 + f(j - 1, a) + 1 + f(j - 1, i) $，$ g(j, i) = a $

### 代码

```cpp
#include <cstdio>

const int MAXN = 30;

int main() {
    int n;
    scanf("%d", &n);

    static int g[MAXN + 1][3];
    g[1][0] = g[1][1] = g[1][2] = -1;
    for (int i = 0; i < 6; i++) {
        char s[3];
        scanf("%s", s);
        int a = s[0] - 'A', b = s[1] - 'A';
        if (g[1][a] == -1) g[1][a] = b;
    }

    static long long f[MAXN + 1][3];
    f[1][0] = f[1][1] = f[1][2] = 1;

    for (int j = 2; j <= n; j++) {
        for (int i = 0; i < 3; i++) {
            const int a = g[j - 1][i], b = 3 - a - i;
            if (g[j - 1][a] == b) {
                f[j][i] = f[j - 1][i] + 1 + f[j - 1][a];
                g[j][i] = b;
            } else {
                f[j][i] = f[j - 1][i] + 1 + f[j - 1][a] + 1 + f[j - 1][i];
                g[j][i] = a;
            }
        }
    }

    printf("%lld\n", f[n][0]);

    return 0;
}
```