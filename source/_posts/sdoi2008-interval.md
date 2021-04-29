title: 「SDOI2008」校门外的区间 - 线段树
categories:
  - OI
tags:
  - BZOJ
  - SDOI
  - 数据结构
  - 线段树
permalink: sdoi2008-interval
date: '2016-09-02 21:07:00'
---

受校门外的树这道经典问题的启发，A 君根据基本的离散数学的知识，抽象出 $ 5 $ 种运算维护集合 $ S $（$ S $初始为空）并最终输出 $ S $。现在，请你完成这道校门外的树之难度增强版 —— 校门外的区间。

$ 5 $ 种运算如下：

1. $ A = A \cup B $；
2. $ A = A \cap B $
3. $ A = \{ x \mid x \in A \ \mathrm{and} \ x \notin B \} $
4. $ A = \{ x \mid x \notin A \ \mathrm{and} \ x \in B \} $
5. $ A = \{ x \mid x \in A \ \mathrm{and} \ x \notin B \} \cup \{ x \mid x \notin A \ \mathrm{and} \ x \in B \} $

<!-- more -->

### 链接

[BZOJ 3226](http://www.lydsy.com/JudgeOnline/problem.php?id=3226)

### 题解

比较容易想到，用线段树维护区间。因为区间端点均为整数，所以对于开区间 $ (a, b) $，可以转化为闭区间 $ [a + 0.5, b - 0.5] $，再两端点同时 $ \times 2 $，得到 $ [2a + 1, 2b - 1] $。

对于每种操作：

1. 对 $ B $ 区间置 $ 1 $；
2. 对非 $ B $ 区间置 $ 0 $；
3. 对 $ B $ 区间置 $ 0 $；
4. 反转整个序列，并将非 $ B $ 区间置 $ 0 $；
5. 反转 $ B $ 区间。

这两种标记是可以合并的：置 $ 0 $ 和置 $ 1 $ 可以替换任何标记，反转叠加在置 $ 0 $ 上变成置 $ 1 $，叠加在置 $ 1 $ 上变成置 $ 0 $，反转互相叠加可以抵销。

查询时，从根到叶子找到第一个置 $ 0 $ 或置 $ 1 $，并记录路径上反转标记的数量。

### 代码

```cpp
#include <cstdio>

const int MAXN = 65535;
const int MAXM = 70000;

struct SegmentTree {
    int l, r, mid;
    SegmentTree *lc, *rc;
    enum TagType {
        Zero, One, Reverse, None
    } tag;
    bool val;

    SegmentTree(const int l, const int r, const int mid, SegmentTree *lc, SegmentTree *rc) : l(l), r(r), mid(mid), lc(lc), rc(rc), tag(None), val(false) {}

    void setTag(const TagType t) {
        if (t == Reverse) {
            if (l == r) val ^= 1;
            else {
                if (tag == Reverse) tag = None;
                else if (tag == Zero) tag = One;
                else if (tag == One) tag = Zero;
                else tag = Reverse;
            }
        } else {
            if (l == r) val = t == One;
            else tag = t;
        }
    }

    void pushDown() {
        if (tag != None) {
            lc->setTag(tag);
            rc->setTag(tag);
            tag = None;
        }
    }

    void update(const int l, const int r, const TagType t) {
        if (l > this->r || r < this->l) return;
        else if (l <= this->l && r >= this->r) setTag(t);
        else {
            pushDown();
            lc->update(l, r, t);
            rc->update(l, r, t);
        }
    }

    bool query(const int pos) {
        SegmentTree *v = this;
        bool rev = false;
        while (!(v->l == v->r || v->tag == Zero || v->tag == One)) {
            if (v->tag == Reverse) rev ^= 1;
            v = (pos <= v->mid) ? v->lc : v->rc;
        }
        if (v->tag == Zero) v->val = false;
        else if (v->tag == One) v->val = true;
        return rev ? v->val ^ 1 : v->val;
    }

    static SegmentTree *build(const int l, const int r) {
        if (l > r) return NULL;
        else if (l == r) return new SegmentTree(l, r, l, NULL, NULL);
        else {
            const int mid = l + (r - l) / 2;
            return new SegmentTree(l, r, mid, build(l, mid), build(mid + 1, r));
        }
    }

    /*
    static bool a[MAXN * 2 + 1];

    static void update(const int l, const int r, const TagType t) {
        if (l > r) return;
        for (int i = l; i <= r; i++) {
            if (t == Zero) a[i] = false;
            else if (t == One) a[i] = true;
            else if (t == Reverse) a[i] ^= 1;
        }
    }

    static bool query(const int pos) { return a[pos]; }

    static SegmentTree *build(const int l, const int r) { return NULL; }
    */
} *segment;

// bool SegmentTree::a[MAXN * 2 + 1];

inline void parse(char *s, int &l, int &r) {
    char ch;
    bool fl = false;
    ch = *s++;
    if (ch == '(') fl = true;
    l = 0;
    while ((ch = *s++) != ',') l = l * 10 + ch - '0';
    l *= 2;
    if (fl) l++;
    r = 0;
    while ((ch = *s++), (ch >= '0' && ch <= '9')) r = r * 10 + ch - '0';
    r *= 2;
    if (ch == ')') r--;
}

inline void print() {
    int l = -1;
    bool flag = false;
    for (int i = 0; i <= MAXN * 2; i++) {
        bool val = segment->query(i);
        if (l == -1 && val) {
            l = i;
        } else if (l != -1 && !val) {
            printf("%c%d,%d%c ", l % 2 == 0 ? '[' : '(', l / 2, (i - 1 + 1) / 2, (i - 1) % 2 == 0 ? ']' : ')');
            flag = true;
            l = -1;
        }
    }
    if (l != -1) printf("%c%d,%d%c ", l % 2 == 0 ? '[' : '(', l / 2, MAXN, ']'), flag = true;
    if (!flag) printf("empty set");
    putchar('\n');
}

int main() {
    segment = SegmentTree::build(0, MAXN * 2);
    char cmd[2], s[100];
    while (~scanf("%s %s", cmd, s)) {
        int l, r;
        parse(s, l, r);
        // printf("read: [%d, %d]\n", l, r);

        if (cmd[0] == 'U') {
            segment->update(l, r, SegmentTree::One);
        } else if (cmd[0] == 'I') {
            segment->update(0, l - 1, SegmentTree::Zero);
            segment->update(r + 1, MAXN * 2, SegmentTree::Zero);
        } else if (cmd[0] == 'D') {
            segment->update(l, r, SegmentTree::Zero);
        } else if (cmd[0] == 'C') {
            segment->update(0, MAXN * 2, SegmentTree::Reverse);
            segment->update(0, l - 1, SegmentTree::Zero);
            segment->update(r + 1, MAXN * 2, SegmentTree::Zero);
        } else if (cmd[0] == 'S') {
            segment->update(l, r, SegmentTree::Reverse);
        }

        // print();
    }

    print();

    return 0;
}
```