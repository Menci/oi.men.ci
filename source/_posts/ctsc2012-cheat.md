title: 「CTSC2012」Cheat - SAM + 二分 + 单调队列 DP
categories:
  - OI
tags:
  - BZOJ
  - CTSC
  - DP
  - SAM
  - 二分
  - 单调队列
  - 字符串
permalink: ctsc2012-cheat
date: '2017-04-06 21:09:00'
---

给出 $ m $ 个串组成的「标准作文库」。对于任意一个串，如果它的长度不少于 $ L $ 且在标准作文库中出现过，则它是「熟悉」的。对于任意一个串，如果能将它划分为若干个串，使「熟悉」的串的长度超过总长度的 $ 90\% $，则称这个串是「熟悉的文章」，定义 $ L_0 $ 为使这个串成为「熟悉的文章」的最大的 $ L $。给出若干个串，求每个串的 $ L $ 值。

<!-- more -->

### 链接

[BZOJ 2806](http://www.lydsy.com/JudgeOnline/problem.php?id=2806)

### 题解

对标准做文库中的串建立 SAM，将每个串在 SAM 上运行，求出以每个字符结尾的最长匹配长度 $ a_i $。二分一个 $ L $，设 $ f(i) $ 表示前 $ i $ 个字符划分为若干个串，「熟悉」的串的长度和的最大值，则有

$$ f(i) = \max\limits_{j = i - a_i} ^ {i - L} f(j) + (i - j) $$

化为这种形式

$$ f(i) = \max\limits_{j = i - a_i} ^ {i - L} (f(j) - j) + i $$

单调队列优化即可。

### 代码

```cpp
#include <cstdio>
#include <cstring>
#include <algorithm>

const int MAXN = 1100000;
const int CHARSET_SIZE = 3;
const double EPS = 1e-6;

struct SuffixAutomaton {
    struct Node {
        Node *ch[CHARSET_SIZE], *next;
        int max;

        Node(int max = 0) : ch(), next(NULL), max(max) {}
    } *start, *last;

    void init() {
        start = last = new Node;
    }

    Node *extend(int c) {
        Node *u = new Node(last->max + 1), *v = last;
        do {
            v->ch[c] = u;
            v = v->next;
        } while (v && !v->ch[c]);

        if (!v) {
            u->next = start;
        } else if (v->ch[c]->max == v->max + 1) {
            u->next = v->ch[c];
        } else {
            Node *n = new Node(v->max + 1), *o = v->ch[c];
            std::copy(o->ch, o->ch + CHARSET_SIZE, n->ch);
            n->next = o->next;
            o->next = u->next = n;
            for (; v && v->ch[c] == o; v = v->next) v->ch[c] = n;
        }

        last = u;
        return u;
    }
} sam;

char s[MAXN + 2];
int len, matchLen[MAXN + 1];

inline void match() {
    SuffixAutomaton::Node *v = sam.start;
    int matched = 0;
    for (int i = 1; i <= len; i++) {
        int c = s[i] - '0';

        while (v != sam.start && !v->ch[c]) {
            v = v->next;
            matched = v->max;
        }

        if (v->ch[c]) {
            v = v->ch[c];
            matched++;
        }

        matchLen[i] = matched;
        // printf("%d, matched = %d\n", c, matched);
    }
}

/*
inline bool check(int l) {
    // printf("l = %d\n", l);
    static int f[MAXN + 1];
    std::fill(f + 1, f + len + 1, 0);
    for (int i = 1; i <= len; i++) {
        f[i] = f[i - 1];
        for (int j = i - matchLen[i]; j <= i - l; j++) {
            // f[i] = std::max(f[i], f[j] + (i - j));
            f[i] = std::max(f[i], f[j] - j + i);
        }
        // printf("f[%d] = %d\n", i, f[i]);
    }
    return f[len] + EPS >= len * 0.9;
}
*/

inline bool check(int l) {
    static int q[MAXN + 1], f[MAXN + 1];
    int *ql = q, *qr = q - 1;
    std::fill(f + 1, f + len + 1, 0);
    for (int i = 1; i <= len; i++) {
        f[i] = f[i - 1];

        // Insert curr pos
        int curr = i - l;
        if (curr >= 0) {
            while (ql <= qr && f[curr] - curr > f[*qr] - *qr) qr--;
            *++qr = curr;
        }

        // Remove invalid pos
        while (ql <= qr && *ql < i - matchLen[i]) ql++;

        // Get best pos
        if (ql <= qr) f[i] = std::max(f[i], f[*ql] - *ql + i);
    }

    return f[len] + EPS >= len * 0.9;
}

int main() {
    int n, m;
    scanf("%d %d", &n, &m);

    sam.init();
    while (m--) {
        scanf("%s", s + 1);
        int len = strlen(s + 1);
        for (int i = 1; i <= len; i++) sam.extend(s[i] - '0');

        if (m) sam.extend(2);
    }

    while (n--) {
        scanf("%s", s + 1);
        len = strlen(s + 1);

        match();
        /*
        check(4);
        break;
        */

        int l = 0, r = len;
        while (l < r) {
            int mid = l + (r - l) / 2 + 1;
            if (check(mid)) l = mid;
            else r = mid - 1;
        }

        printf("%d\n", l);
    }
}
```