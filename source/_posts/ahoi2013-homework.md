title: 「AHOI2013」作业 - 莫队
categories:
  - OI
tags:
  - AHOI
  - BZOJ
  - 数据结构
  - 莫队
permalink: ahoi2013-homework
date: '2016-12-30 10:58:00'
---

给一个长度为 $ n $ 的序列，每次查询一个区间 $ x \in [l, r] $ 内满足 $ a_i \leq x \leq b_i $ 的 $ x $ 的数量和不重复的 $ x $ 的数量。

<!-- more -->

### 链接

[BZOJ 3236](http://www.lydsy.com/JudgeOnline/problem.php?id=3236)

### 题解

莫队处理询问，用一个树状数组维护当前区间的所有数。用一个数组维护当前区间每个数的出现次数，用另一个树状数组维护当前区间不重复的数，仅在每个数第一次出现或最后一次删除的时候对树状数组操作。

需要离散化。

### 代码

```cpp
#include <cstdio>
#include <cmath>
#include <utility>
#include <algorithm>

const int MAXN = 100000;
const int MAXM = 1000000;

int blockSize;

struct Query {
    int l, r, a, b;
    std::pair<int, int> *ans;

    bool operator<(const Query &other) const {
        if (l / blockSize == other.l / blockSize) return r < other.r;
        else return l / blockSize < other.l / blockSize;
    }
} Q[MAXM + 1];

int n, m, a[MAXN + 1];

struct BIT {
    int a[MAXN + MAXM * 2 + 1], n;

    void init(int n) {
        this->n = n;
    }

    static int lowbit(int x) {
        return x & -x;
    }

    void update(int pos, int x) {
        for (int i = pos; i <= n; i += lowbit(i)) a[i] += x;
    }

    int query(int pos) {
        int res = 0;
        for (int i = pos; i > 0; i -= lowbit(i)) res += a[i];
        return res;
    }

    int query(int l, int r) {
        return query(r) - query(l - 1);
    }
} bit1, bit2;

inline std::pair<int, int> calc(int a, int b) {
    return std::make_pair(bit1.query(a, b), bit2.query(a, b));
}

int cnt[MAXN + MAXM + 2 + 1];
inline void extend(int l, int r, bool left, int d) {
    int pos = left ? l : r;
    bit1.update(a[pos], d);
    if (d == 1) {
        if (++cnt[a[pos]] == 1) bit2.update(a[pos], 1);
    } else {
        if (--cnt[a[pos]] == 0) bit2.update(a[pos], -1);
    }
}

inline void solve() {
    int l = 1, r = 0;
    for (int i = 1; i <= m; i++) {
        while (r < Q[i].r) extend(l, ++r, false, 1);
        while (r > Q[i].r) extend(l, r--, false, -1);

        while (l > Q[i].l) extend(--l, r, true, 1);
        while (l < Q[i].l) extend(l++, r, true, -1);

        *Q[i].ans = calc(Q[i].a, Q[i].b);
    }
}

inline void prepare() {
    static int set[MAXN + MAXM * 2 + 1];
    std::copy(a + 1, a + n + 1, set + 1);
    for (int i = 1; i <= m; i++) set[n + i] = Q[i].a;
    for (int i = 1; i <= m; i++) set[n + m + i] = Q[i].b;

    std::sort(set + 1, set + n + m * 2 + 1);
    int *end = std::unique(set + 1, set + n + m * 2 + 1);

    for (int i = 1; i <= n; i++) a[i] = std::lower_bound(set + 1, end, a[i]) - set;
    for (int i = 1; i <= m; i++) Q[i].a = std::lower_bound(set + 1, end, Q[i].a) - set;
    for (int i = 1; i <= m; i++) Q[i].b = std::lower_bound(set + 1, end, Q[i].b) - set;

    int cnt = end - (set + 1);
    bit1.init(cnt);
    bit2.init(cnt);
}

int main() {
    scanf("%d %d", &n, &m);
    for (int i = 1; i <= n; i++) scanf("%d", &a[i]);

    static std::pair<int, int> ans[MAXN + 1];
    for (int i = 1; i <= m; i++) {
        scanf("%d %d %d %d", &Q[i].l, &Q[i].r, &Q[i].a, &Q[i].b);
        Q[i].ans = &ans[i];
    }

    prepare();

    blockSize = floor(sqrt(n) + 1);
    std::sort(Q + 1, Q + m + 1);
    solve();

    for (int i = 1; i <= m; i++) printf("%d %d\n", ans[i].first, ans[i].second);

    return 0;
}
```