title: 「SCOI2015」小凸解密码 - set
categories:
  - OI
tags:
  - BZOJ
  - SCOI
  - set
  - 乱搞
  - 安徽集训
permalink: scoi2015-password
date: '2016-03-25 08:53:27'
---

给定一个环形数列 $ A $ 和运算符序列 $ C $，可以从任意一个位置作为起点计算 $ B $，方法为：

1. $ B_0 = A_0 $；
2. 当 $ C_x = + $ 时，$ B_c = (A_x + A_{x - 1}) ~ {\rm mod} ~ 10 $；
3. 当 $ C_x = * $ 时，$ B_c = (A_x * A_{x - 1}) ~ {\rm mod} ~ 10 $；

每次可以修改 $ A $ 和 $ C $ 中的某一个元素，询问以指定起点开始计算 $ B $ 得到的环形数列 $ B $ 中距离 $ B_0 $ 最远的零区间中距离 $ B_0 $ 最近的零的距离。

<!-- more -->

### 链接

[BZOJ 4447](http://www.lydsy.com/JudgeOnline/problem.php?id=4447)

### 题解

首先，可以发现在没有修改的情况下，指定的不同起点只是起点得到的值不同，我们先直接递推计算出 B，查询的时候修改 $ B_0 = A_0 $ 查询完改回去。一次修改只会影响两个位置（$ B_i $ 和 $ B_{i + 1} $）。

所以问题转化为，维护一个环形零一串，每次修改一个位置，查询到某个位置的最近零区间。

用 `set` 维护每一个零区间，然后各种分情况讨论 ……

### 代码

```cpp
#include <cstdio>
#include <climits>
#include <algorithm>
#include <set>

const int MAXN = 100000;
const int MAXM = 100000;
const int MOD = 10;

struct ZeroRange {
    int l, r;

    ZeroRange(int pos) : l(pos) {}
    ZeroRange(int l, int r) : l(l), r(r) {}
};

bool operator<(const ZeroRange &a, const ZeroRange &b) {
    return a.l < b.l;
}

bool operator<(int x, const ZeroRange &range) {
    return x < range.l;
}

int n, m, A[MAXN], a[MAXN * 2];
char C[MAXN];
std::set<ZeroRange> s;

inline void update(int pos, int newValue) {
    if (newValue == 0 && a[pos] != 0) {
        for (int x = pos; x < n * 2; x += n) {
            std::set<ZeroRange>::iterator next = s.lower_bound(x);
            std::set<ZeroRange>::iterator prev = --s.lower_bound(x);
            if (next->l == x + 1 && prev->r == x - 1) {
                ZeroRange range(prev->l, next->r);
                s.erase(next), s.erase(prev), s.insert(range);
            } else if (next->l == x + 1) {
                ZeroRange range(x, next->r);
                s.erase(next), s.insert(range);
            } else if (prev->r == x - 1) {
                ZeroRange range(prev->l, x);
                s.erase(prev), s.insert(range);
            } else s.insert(ZeroRange(x, x));
        }
    } else if (newValue != 0 && a[pos] == 0) {
        for (int x = pos; x < n * 2; x += n) {
            std::set<ZeroRange>::iterator self = --s.upper_bound(x);
            if (x != self->l && x != self->r) {
                ZeroRange range1(self->l, x - 1), range2(x + 1, self->r);
                s.erase(self), s.insert(range1), s.insert(range2);
            } else if (x != self->r) {
                ZeroRange range(x + 1, self->r);
                s.erase(self), s.insert(range);
            } else if (x != self->l) {
                ZeroRange range(self->l, x - 1);
                s.erase(self), s.insert(range);
            } else s.erase(self);
        }
    }

    a[pos] = a[pos + n] = newValue;
}

inline int calc(int a, int b, char opt) {
    if (opt == '+') return (a + b) % MOD;
    else return (a * b) % MOD;
}

inline void update(int pos, int num, char opt) {
    A[pos] = num, C[pos] = opt;
    update(pos, calc(A[pos], A[(pos - 1 + n) % n], C[pos]));
    update((pos + 1) % n, calc(A[(pos + 1) % n], A[pos], C[(pos + 1) % n]));
}

inline int dist(int x, int y) {
    if (x > y) std::swap(x, y);
    return std::min(y - x, n + x - y);
}

inline int dist(int pos, const ZeroRange &range) {
    if (range.l == INT_MAX || range.l == INT_MIN) return -1;
    else if (range.l < n && range.r >= n) {
        if (pos % n >= range.l && pos % n <= range.r) return 0;
        else if (pos % n + n >= range.l && pos % n + n <= range.r) return 0;
    }
    if (pos % n >= range.l % n && pos % n <= range.r % n) return 0;
    else return std::min(dist(pos % n, range.l % n), dist(pos % n, range.r % n));
}

inline int query(int pos) {
    int bak = a[pos];
    update(pos, A[pos]);

    int ans;
    /* if (s.size() == 3 && a[pos] == 0) ans = 0;
    else */ if (s.size() == 2) ans = -1;
    else if (s.size() == 3) ans = dist(pos, *++s.begin());
    else {
        ans = -1;
        bool flag = (++s.begin())->l == ((--(--s.end()))->r + 1) % n;

        int oppositePos = ((pos - n / 2) + n) % n;
        std::set<ZeroRange>::iterator opposite = --s.upper_bound(oppositePos);
        if (opposite == s.begin()) opposite = --s.upper_bound(oppositePos + n);

        if (flag && (opposite == ++s.begin())) opposite = --s.upper_bound(oppositePos + n);
        // if (flag && (opposite == --(--s.end()))) opposite--;

        if (opposite != s.begin() && !(flag && (opposite == ++s.begin() || opposite == --(--s.end())))) ans = std::max(ans, dist(pos, *opposite));

        if (opposite != ++s.begin()) {
            std::set<ZeroRange>::iterator prev = opposite;
            prev--;
            if (!(flag && prev == ++s.begin())) ans = std::max(ans, dist(pos, *prev));
        }

        if (opposite != --s.end()) {
            std::set<ZeroRange>::iterator next = opposite;
            next++;
            // while (next->r != INT_MAX && flag && next == --(--s.end())) next++;
            if (!(flag && next == --(--s.end()))) ans = std::max(ans, dist(pos, *next));
        }
    }

    update(pos, bak);

    return ans;
}


int main() {
    // freopen("password.in", "r", stdin);
    // freopen("password.out", "w", stdout);

    scanf("%d %d", &n, &m);
    for (int i = 0; i < n; i++) {
        scanf("%d", &A[i]);
        while (C[i] = getchar(), C[i] != '+' && C[i] != '*');
    }

    for (int i = 0; i < n; i++) a[i] = a[i + n] = calc(A[i], A[(i - 1 + n) % n], C[i]);
    for (int l = 0; l < n * 2; ) {
        if (a[l] == 0) {
            int r = l;
            while (r + 1 < n * 2 && a[r + 1] == 0) r++;
            s.insert(ZeroRange(l, r));
            l = r + 1;
        } else l++;
    }
    s.insert(ZeroRange(INT_MIN, INT_MIN)), s.insert(ZeroRange(INT_MAX, INT_MAX));

    for (int i = 0; i < m; i++) {
        int type, pos;
        scanf("%d %d", &type, &pos);
        if (type == 1) {
            int num;
            char opt;
            scanf("%d", &num);
            while (opt = getchar(), opt != '+' && opt != '*');
            update(pos, num, opt);
        } else printf("%d\n", query(pos));
    }

    fclose(stdin);
    fclose(stdout);

    return 0;
}
```