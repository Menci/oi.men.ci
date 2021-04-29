title: Manacher 学习笔记
categories:
  - OI
tags:
  - Manacher
  - 字符串
  - 学习笔记
  - 算法模板
permalink: manacher-notes
date: '2017-01-02 20:14:00'
---

Manacher 可在 $ O(n) $ 的时间内求出一个字符串**以每个位置为中心**的最长回文子串。

<!-- more -->

为了避免分类讨论，在字符串的首部的尾部添加两个不同的在串中没有出现过的字符（这里分别使用 `@` 和空白字符 `\0`），每两个字符之间加入另一个在串中没有出现过的字符（这里使用 `$`）。这样，原串中长度为奇数和偶数的回文串的长度均变为奇数，且原串中回文串的长度为新串回文串半径减一。

设置两个状态 $ \max $ 和 $ p $，$ p $ 表示当前已找到的回文串中，向右延伸最远的中心位置，$ \max $ 表示其右端点。

设 $ r(i) $ 表示（新串中）第 $ i $ 个位置的回文半径（回文串长度的一半，包括第 $ i $ 个字符）按从左到右的顺序求解，枚举到第 $ i $ 个字符时，分三种情况考虑：

设 $ j $ 为 $ i $ 关于 $ p $ 的对称点，即 $ j = 2p - i $。

![](manacher-notes/1.svg)

$ \max < i $，即向右延伸最远的回文子串（黑色）没有覆盖 $ i $，此时只有 $ r(i) \geq 1 $。

![](manacher-notes/2.svg)

$ \max \geq i $ 且 $ \max - i \geq r(j) $，即向右延伸最远的回文子串（黑色）覆盖了 $ i $，并且以 $ j $ 为中心的最长回文子串完全与以 $ i $ 为中心的最长回文子串对称（蓝色），此时一定有 $ r(i) = r(j) $，即 $ r(i) \geq r(j) $。

![](manacher-notes/3.svg)

$ \max \geq i $ 且 $ \max - i \geq r(j) $，即向右延伸最远的回文子串（黑色）覆盖了 $ i $，但没有覆盖以 $ j $ 为中心的最长回文子串的对称位置串，所以 $ r(i) $ 只能取被覆盖的（黄色）一部分，即 $ r(i) \geq \max - i $。

### 代码（[POJ 3974](http://poj.org/problem?id=3974)）


```cpp
#include <cstdio>
#include <cstring>
#include <algorithm>

const int MAXN = 1000000;

// s1 原串，s2 新串
char s1[MAXN + 2], s2[MAXN * 2 + 3];
int n, len, r[MAXN * 2 + 3];

inline void prepare()
{
    n = strlen(s1);

    s2[++len] = '@'; // 边界字符
    s2[++len] = '$';
    for (int i = 0; i < n; i++)
    {
        s2[++len] = s1[i];
        s2[++len] = '$';
    }

    s2[len + 1] = '\0'; // 使用 0 作为结束字符和边界字符
}

inline void manacher()
{
    // 新字符串首部为 '@'，尾部为 '\0'（空字符），中间为 '$'
    int right = 0, mid = 0; // right 当前回文最右点，mid 是 right 对应的回文中心
    for (int i = 1; i <= len; i++)
    {
        int x;
        if (right < i) x = 1;
        else x = std::min(r[mid * 2 - i], right - i);

        // 逐位匹配
        while (s2[i + x] == s2[i - x]) ++x;

        // 更新最右点
        if (i + x > right)
        {
            right = i + x;
            mid = i;
        }

        r[i] = x;
    }
}

int main() {
    int T = 0;
    while (scanf("%s", s1), memcmp(s1, "END", 4) != 0)
    {
        prepare();
        manacher();

        // printf("%s\n", s2 + 1);
        // for (int i = 1; i <= len; i++) printf("%d%c", r[i], i == len ? '\n' : ' ');

        int ans = 0;
        for (int i = 1; i <= len; i++) ans = std::max(ans, r[i] - 1);
        printf("Case %d: %d\n", ++T, ans);

        len = 0;
    }

    return 0;
}
```