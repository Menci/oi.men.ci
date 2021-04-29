title: 「SCOI2015」国旗计划 - 贪心 + 倍增
categories:
  - OI
tags:
  - BZOJ
  - SCOI
  - 倍增
  - 安徽集训
  - 贪心
permalink: scoi2015-flag
date: '2016-03-22 18:25:14'
---

A 国幅员辽阔，边境线上设有 $ M $ 个边防站，顺时针编号 $ 1 $ 至 $ M $。每名边防战士常驻两个边防站，并且善于在这两个边防站之间长途奔袭，我们称这两个边防站之间的路程是这个边防战士的奔袭区间。每名战士的奔袭区间都不会被其他战士的奔袭区间所包含。

现在，局长希望知道，至少需要多少名战士，才能使得他们的奔袭区间覆盖全部的边境线。局长还希望知道对于每一名战士，在他必须参加国旗计划的前提下，至少需要多少名战士才能覆盖全部边境线。

<!-- more -->

### 链接

[BZOJ 4444](http://www.lydsy.com/JudgeOnline/problem.php?id=4444)

### 题解

首先，明确一个贪心的思路：对于任何一个战士，选择他后要选择的下一个，一定是在他后面并且与他奔袭区间交集最小的（因为所有的区间完全覆盖并且没有相互包含）。

把所有区间翻倍存储，以左端点排序。

40 分：枚举每个战士，在他之后的所有战士中确定一个与他奔袭区间交集最小的，作为他的下一个（时间复杂度 $ O(n ^ 2) $）；然后对于每个询问从该战士开始不断找下一个战士，直到找回来为止；

70 分：把找「下一个战士」的复杂度优化为 $ O(n \log n) $，使用 `std::upper_bound`，用当前战士的区间右端点和其他区间的左端点比较，返回的结果 -1 即为要找的「下一个战士」。

100 分：思考回答询问时的过程，每次线性地向后扫描做了很多重复的工作，考虑到无论从那个战士出发，经过的相同位置向后的路线都是相同的，所以可以先 $ O(n \log n) $ 地预处理出一个稀疏表，用 $ next_{i, j} $ 表示战士 $ i $ 向后找 $ 2 ^ j $ 次所到达的战士，然后就可以 $ O(\log n) $ 地回答每个询问了。

### 代码

```cpp
#include <cstdio>
#include <algorithm>

const int MAXN = 200000;
const int MAXLOGN = 18;

struct Fighter {
    int id, l, r, ans;
    Fighter *next[MAXLOGN + 1];
} fighters[MAXN * 2];

int n, m, ans[MAXN];

bool operator<(const Fighter &a, const Fighter &b) {
    return a.l < b.l;
}

bool operator<(int r, const Fighter &a) {
    return r < a.l;
}

int main() {
    freopen("flag.in", "r", stdin);
    // freopen("flag.out", "w", stdout);

    scanf("%d %d", &n, &m);
    for (int i = 0; i < n; i++) {
        Fighter &a = fighters[i];
        a.id = i;
        scanf("%d %d", &a.l, &a.r);
        if (a.l > a.r) a.r += m;
        fighters[i + n].l = a.l + m, fighters[i + n].r = a.r + m;
    }

    std::sort(fighters, fighters + n * 2);

    for (int i = 0; i < n * 2; i++) {
        Fighter &a = fighters[i];
        a.next[0] = std::upper_bound(fighters, fighters + n * 2, a.r) - 1;
    }

    for (int j = 1; (1 << j) <= n * 2; j++) {
        for (int i = 0; i < n * 2; i++) {
            Fighter &a = fighters[i];
            if (a.next[j - 1]) {
                a.next[j] = a.next[j - 1]->next[j - 1];
            }
        }
    }

    for (int i = 0; i < n; i++) {
        Fighter *p = &fighters[i];
        for (int j = MAXLOGN; j >= 0; j--) {
            if (p->next[j] && p->next[j]->r < fighters[i].l + m) {
                ans[fighters[i].id] += (1 << j);
                p = p->next[j];
            }
        }
    }

    for (int i = 0; i < n; i++) {
        printf("%d ", ans[i] + 2);
    }
    putchar('\n');

    fclose(stdin);
    fclose(stdout);

    return 0;
}
```