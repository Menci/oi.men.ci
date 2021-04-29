title: 「NOIP2013」花匠 - 贪心
categories:
  - OI
tags:
  - CodeVS
  - NOIP
  - 贪心
permalink: noip2013-flower
date: '2016-10-13 16:42:00'
---

花匠栋栋种了一排花，每株花都有自己的高度。花儿越长越大，也越来越挤。栋栋决定把这排中的一部分花移走，将剩下的留在原地，使得剩下的花能有空间长大，同时，栋栋希望剩下的花排列得比较别致。

具体而言，栋栋的花的高度可以看成一列整数 $ h_1, h_2, \ldots, h_n $。设当一部分花被移走后，剩下的花的高度依次为 $ g_1, g_2, \ldots, g_m $，则栋栋希望下面两个条件中至少有一个满足：

条件 A：对于所有的 $ 1 < i < \frac{m}{2} $，$ g_{2i} > g_{2i - 1} $ 且 $ g_{2i} > g_{2i + 1} $；
条件 B：对于所有的 $ 1 < i < \frac{m}{2} $，$ g_{2i} < g_{2i - 1} $ 且 $ g_{2i} < g_{2i + 1} $。

注意上面两个条件在 $ m = 1 $ 时同时满足，当 $ m > 1 $ 时最多有一个能满足。
请问，栋栋最多能将多少株花留在原地。

<!-- more -->

### 链接

[CodeVS 3289](http://codevs.cn/problem/3289/)

### 题解

最长波动子序列，贪心。

记录在当前情况下最长波动子序列的最后两个数，设它们为 $ x $ 和 $ y $，考虑原序列最后加入一个 $ z $ 的影响。

如果 $ x < y $ 且 $ y > z $（$ x > y $ 且 $ y < z $），则 $ z $ 可以接在当前最长波动子序列的后面，答案 $ + 1 $。

如果 $ x < y $ 且 $ y < z $（$ x > y $ 且 $ y > z $），则可以用 $ z $ 替换 $ y $，这样一定不会使总的答案变差，并且可以使 $ z $ 之后一个（可能的）满足 $ k < y < z $ 的 $ k $ 接在 $ z $ 之后。

### 代码

```cpp
#include <cstdio>
#include <algorithm>

const int MAXN = 100000;

int main() {
    int n;
    scanf("%d", &n);

    int prev, curr, ans = 1;
    scanf("%d", &curr);
    for (int i = 1; i < n; i++) {
        int x;
        scanf("%d", &x);

        if (x == curr) continue;

        if (ans == 1 || (prev < curr) != (curr < x)) {
            ans++;
            prev = curr;
            curr = x;
        } else {
            if (prev < curr) curr = std::max(curr, x);
            else curr = std::min(curr, x);
        }
    }

    printf("%d\n", ans);

    return 0;
}
```