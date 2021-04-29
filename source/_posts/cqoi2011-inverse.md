title: 「CQOI2011」动态逆序对 - CDQ
categories:
  - OI
tags:
  - BZOJ
  - CDQ
  - CQOI
  - 分治
  - 数据结构
  - 树状数组
permalink: cqoi2011-inverse
date: '2016-06-20 20:10:00'
---

对于序列 $ A $，它的逆序对数定义为满足 $ i < j $，且 $ A_i > A_j $ 的数对 $ (i,\ j) $ 的个数。给 $ 1 $ 到 $ n $ 的一个排列，按照某种顺序依次删除 $ m $ 个元素，你的任务是在每次删除一个元素之前统计整个序列的逆序对数。

<!-- more -->

### 链接

[BZOJ 3295](http://www.lydsy.com/JudgeOnline/problem.php?id=3295)

### 题解

离线将删除转换为添加，并在开始将未被删除的元素加入。

考虑加入一个元素时，增加的逆序对数量 —— 等于在它**左边**比它**大**的元素数量加在它**右边**比它**小**的元素数量。

对于前一半，将每个数 $ a_i $ 改为 $ n - a_i + 1 $，则转化为在它**左边**比它**小**的数量，经典的三维（时间、位置、大小）偏序问题，使用 CDQ 分治解决。

对于后一半，将每个数的位置 $ i $ 改为 $ n - i + 1 $，则同样转化为在它左边比它小的数量，同理用 CDQ 分治解决即可。

求出每次对答案的贡献后做前缀和即可。

### 代码

```cpp
#include <cstdio>
#include <cassert>
#include <algorithm>

const int MAXN = 100000;
const int MAXM = 50000;

struct Triple {
    int id, pos, num;
    unsigned int *ans;

    Triple(const int pos, const int num, unsigned int *ans) : pos(pos), num(num), ans(ans) {
        static int id = 0;
        this->id = id++;
    }

    Triple() {}

    bool operator<(const Triple &other) const { return id < other.id; }
} a[MAXN];

int n, m;

struct BinaryIndexedTree {
    unsigned int a[MAXN];

    static int lowbit(const int x) { return x & -x; }

    unsigned int query(const int x) {
        unsigned int ans = 0;
        for (int i = x; i > 0; i -= lowbit(i)) ans += a[i - 1];
        return ans;
    }

    void update(const int x, const int delta) {
        for (int i = x; i <= n; i += lowbit(i)) a[i - 1] += delta;
    }

    void clear(const int x) {
        for (int i = x; i <= n; i += lowbit(i)) {
            if (a[i - 1]) a[i - 1] = 0;
            else break;
        }
    }
} bit;

inline void cdq(Triple *l, Triple *r) {
    /*
    for (Triple *a = l; a <= r; a++) {
        if (a->ans) {
            for (Triple *b = l; b < a; b++) {
                if (b->pos < a->pos && b->num < a->num) (*a->ans)++;
            }
        }
    }

    return;
    */

    if (l == r) return;

    Triple *m = l + (r - l) / 2;

    cdq(l, m);
    cdq(m + 1, r);

    static Triple tmp[MAXN];
    for (Triple *q = tmp, *p1 = l, *p2 = m + 1; q <= tmp + (r - l); q++) {
        if ((p1 <= m && p1->pos <= p2->pos) || p2 > r) {
            *q = *p1++;
            bit.update(q->num, 1);
        } else {
            *q = *p2++;
            if (q->ans) *q->ans += bit.query(q->num);
        }
    }

    for (Triple *q = tmp, *p = l; p <= r; q++, p++) {
        bit.clear(q->num);
        *p = *q;
        assert(p->num != 0);
    }
}

/*
inline void print() {
    for (int i = 0; i < n; i++) {
        printf("[%d, %d, %d]%s", a[i].id, a[i].pos, a[i].num, i == n - 1 ? "\n" : ", ");
    }
}
*/

int main() {
    scanf("%d %d", &n, &m);
    static int num[MAXN], pos[MAXN], del[MAXM];
    for (int i = 0; i < n; i++) scanf("%d", &num[i]), pos[num[i] - 1] = i + 1;

    static bool deleted[MAXN];
    for (int i = 0; i < m; i++) {
        int x;
        scanf("%d", &x);
        del[i] = pos[x - 1];
        deleted[del[i] - 1] = true;
    }

    static unsigned int ans[MAXN];
    int cnt = 0;
    for (int i = 1; i <= n; i++) if (!deleted[i - 1]) {
        a[cnt] = Triple(i, num[i - 1], &ans[n - cnt - 1]); // , printf("ans[%d]\n", n - cnt - 1);
        cnt++;
    }

    // const int invalidCnt = cnt;

    for (int i = m - 1; i >= 0; i--) {
        a[cnt++] = Triple(del[i], num[del[i] - 1], &ans[i]); // , printf("ans[%d]\n", i);
    }

    for (int i = 0; i < cnt; i++) {
        a[i].pos = n - a[i].pos + 1;
    }

    // print();

    cdq(a, a + n - 1);

    std::sort(a, a + cnt);

    for (int i = 0; i < cnt; i++) {
        a[i].pos = n - a[i].pos + 1;
        a[i].num = n - a[i].num + 1;
    }

    // print();

    cdq(a, a + n - 1);

    for (int i = n - 2; i >= 0; i--) ans[i] += ans[i + 1];
    for (int i = 0; i < m; i++) printf("%u\n", ans[i]);

    return 0;
}
```