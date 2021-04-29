title: 「NOI2005」维修数列 - Splay
categories:
  - OI
tags:
  - BZOJ
  - Splay
  - 数据结构
permalink: noi2005-sequence
date: '2017-01-13 09:38:00'
---

请写一个程序，要求维护一个数列，支持以下 $ 6 $ 种操作。

| 操作 | 输入格式 | 说明 |
|:---:|:---:|:---:|
| 插入 | `INSERT pos cnt a[1] a[2] ...... a[cnt]` | 在当前数列的第 $ \text{pos} $ 个数字后插入 $ \text{cnt} $ 个数字：$ a_1, a_2 \ldots, a_{\text{cnt}} $，如果 $ \text{pos} = 0 $，则在首部插入 |
| 删除 | `DELETE pos cnt` | 从当前数列的第 $ \text{pos} $ 个数字开始，删除连续的 $ \text{cnt} $ 个数字 |
| 修改 | `MAKE-SAME pos cnt x` | 将当前数列的第 $ \text{pos} $ 个数字开始的连续 $ \text{cnt} $ 个数字统一修改为 $ x $ |
| 翻转 | `REVERSE pos cnt` | 取出当前数列的第 $ \text{pos} $ 个数字开始的连续 $ \text{cnt} $ 个数字，翻转后放入原来的位置 |
| 求和 | `GET-SUM pos cnt x` | 计算从当前数列的第 $ \text{pos} $ 个数字开始的连续 $ \text{cnt} $ 个数字的和并输出 |
| 最大子段和 | `MAX-SUM` | 求出当前数列中和最大的一段子序列，并输出其和 |

<!-- more -->

### 链接

[BZOJ 1500](http://www.lydsy.com/JudgeOnline/problem.php?id=1500)

### 题解

求最大子段和时，维护整体的最大子段和，强制包含左端点的最大子段和，强制包含右端点的最大子段和，整体和，即可合并。

修改时打标记即可。

注意提取区间，打标记后要即使维护前两层节点的信息。

### 代码

```cpp
#include <cstdio>
#include <cassert>
#include <climits>
#include <algorithm>

const int MAXN = 500000;

struct Data {
    int sum, maxSum, lMaxSum, rMaxSum;

    Data(int x = INT_MIN) : sum(x), maxSum(x), lMaxSum(x), rMaxSum(x) {}

    static Data merge(const Data &l, const Data &r) {
        Data res;
        // printf("merge(%d, %d)\n", l.sum, r.sum);
        res.sum = l.sum + r.sum;
        res.lMaxSum = std::max(std::max(l.lMaxSum, l.sum + r.lMaxSum), res.sum);
        res.rMaxSum = std::max(std::max(r.rMaxSum, l.rMaxSum + r.sum), res.sum);
        res.maxSum = std::max(std::max(l.maxSum, r.maxSum), std::max(l.rMaxSum + r.lMaxSum, res.sum));
        return res;
    }

    static Data merge(const Data &l, int x, const Data &r) {
        if (l.sum == INT_MIN && r.sum == INT_MIN) return x;
        else {
            if (l.sum == INT_MIN) {
                if (x == INT_MIN) {
                    return r;
                } else {
                    return merge(x, r);
                }
            } else if (r.sum == INT_MIN) {
                if (x == INT_MIN) {
                    return l;
                } else {
                    return merge(l, x);
                }
            } else {
                if (x == INT_MIN) {
                    return merge(l, r);
                } else {
                    return merge(merge(l, x), r);
                }
            }
        }
    }
};

struct Splay {
    struct Node {
        Node *c[2], *fa, **root;
        int x, size, realSize, tagAssign;
        bool rev;
        Data data;
        bool bound;

        Node(Node *fa, int x, Node **root, bool bound = false) : fa(fa), root(root), x(x), size(1), realSize(!bound), tagAssign(INT_MIN), rev(false), data(x), bound(bound) {}

        ~Node() {
            if (c[0]) delete c[0];
            if (c[1]) delete c[1];
        }

        void maintain() {
            size = (c[0] ? c[0]->size : 0) + (c[1] ? c[1]->size : 0) + 1;
            realSize = (c[0] ? c[0]->realSize : 0) + (c[1] ? c[1]->realSize : 0) + 1;

            Data ld = INT_MIN, rd = INT_MIN;
            if (c[0]) ld = c[0]->data;
            if (c[1]) rd = c[1]->data;
            data = Data::merge(ld, bound ? INT_MIN : x, rd);
        }

        void pushDown() {
            if (rev) {
                std::swap(c[0], c[1]);

                if (c[0]) c[0]->reverse();
                if (c[1]) c[1]->reverse();

                rev = false;
            }

            if (tagAssign != INT_MIN) {
                if (c[0]) c[0]->assign(tagAssign);
                if (c[1]) c[1]->assign(tagAssign);

                tagAssign = INT_MIN;
            }
        }

        int relation() {
            return this == fa->c[1];
        }

        void rotate() {
            pushDown();

            int x = relation();
            Node *o = fa;

            fa = o->fa;
            if (fa) fa->c[o->relation()] = this;

            o->c[x] = c[x ^ 1];
            if (c[x ^ 1]) c[x ^ 1]->fa = o;

            c[x ^ 1] = o;
            o->fa = this;

            o->maintain();
            maintain();

            if (!fa) {
                *root = this;
            }
        }

        void splay(Node *targetFa = NULL) {
            while (fa != targetFa) {
                if (fa->fa) fa->fa->pushDown();
                fa->pushDown();

                if (fa->fa == targetFa) rotate();
                else if (fa->relation() == relation()) fa->rotate(), rotate();
                else rotate(), rotate();
            }
        }

        void assign(int x) {
            if (bound) {
                if (c[0]) c[0]->assign(x);
                if (c[1]) c[1]->assign(x);
            } else {
                this->x = tagAssign = x;
                data = Data(x * realSize);
            }
        }

        void reverse() {
            rev ^= 1;
            std::swap(data.lMaxSum, data.rMaxSum);
        }

        int lSize() {
            return c[0] ? c[0]->size : 0;
        }

        void normalize() {
            pushDown();
            if (c[0]) c[0]->normalize();
            if (c[1]) c[1]->normalize();
            maintain();
        }
    } *root;

    Splay() : root(NULL) {
        buildBound();
    }

    void buildBound() {
        root = new Node(NULL, INT_MIN, &root, true);
        root->c[1] = new Node(root, INT_MIN, &root, true);
        root->size = 2;
    }

    Node *select(int k) {
        // printf("select(%d) = ", k);
        Node *v = root;
        while (v->pushDown(), k != v->lSize()) {
            if (k < v->lSize()) {
                v = v->c[0];
            } else {
                k -= v->lSize() + 1;
                v = v->c[1];
            }
        }

        // printf("%d\n", v->x);
        return v;
    }

    Node *select(int l, int r) {
        Node *pred = select(l - 1), *succ = select(r + 1);
        pred->splay();
        succ->splay(pred);
        return succ->c[0];
    }

    Node *build(int *l, int *r, Node *fa) {
        if (l > r) return NULL;
        int *mid = l + (r - l) / 2;
        Node *v = new Node(fa, *mid, &root);
        v->c[0] = build(l, mid - 1, v);
        v->c[1] = build(mid + 1, r, v);
        v->maintain();
        return v;
    }

    void insert(int pos, int *a, int n) {
        Node *pred = select(pos), *succ = select(pos + 1);
        pred->splay();
        succ->splay(pred);

        succ->c[0] = build(a + 1, a + n, succ);

        succ->maintain();
        pred->maintain();
    }

    void erase(int l, int r) {
        Node *pred = select(l - 1), *succ = select(r + 1);
        pred->splay();
        succ->splay(pred);

        delete succ->c[0];
        succ->c[0] = NULL;

        succ->maintain();
        pred->maintain();
    }

    void reverse(int l, int r) {
        Node *pred = select(l - 1), *succ = select(r + 1);
        pred->splay();
        succ->splay(pred);

        succ->c[0]->reverse();
        succ->maintain();
        pred->maintain();
    }

    int sum(int l, int r) {
        return select(l, r)->data.sum;
    }

    int maxSum() {
        return root->data.maxSum;
    }

    void assign(int l, int r, int x) {
        Node *pred = select(l - 1), *succ = select(r + 1);
        pred->splay();
        succ->splay(pred);

        succ->c[0]->assign(x);
        succ->maintain();
        pred->maintain();
    }

    void print(Node *v, int dep = 0) {
        if (!v) return;
        v->pushDown();
        print(v->c[0], dep + 1);
        for (int i = 0; i < dep * 2; i++) putchar(' ');
        if (v->bound) puts("[[Bound]]");
        else printf("%d -> sum = %d, maxSum = %d, lMaxSum = %d, rMaxSum = %d\n", v->x, v->data.sum, v->data.maxSum, v->data.lMaxSum, v->data.rMaxSum);
        print(v->c[1], dep + 1);
    }
} splay;

int main() {
    int n, m;
    scanf("%d %d", &n, &m);

    static int a[MAXN + 1];
    for (int i = 1; i <= n; i++) scanf("%d", &a[i]);

    splay.insert(0, a, n);

    while (m--) {
        /*
        puts("------------------------------------------------------------------------");
        splay.print(splay.root);
        puts("------------------------------------------------------------------------");
        */
        // splay.root->normalize();

        char s[sizeof("MAKE-SAME")];
        scanf("%s", s);

        if (s[2] == 'S') {
            int pos, cnt;
            scanf("%d %d", &pos, &cnt);
            for (int i = 1; i <= cnt; i++) scanf("%d", &a[i]);

            splay.insert(pos, a, cnt);
        } else if (s[2] == 'L') {
            int pos, cnt;
            scanf("%d %d", &pos, &cnt);

            splay.erase(pos, pos + cnt - 1);
        } else if (s[2] == 'K') {
            int pos, cnt, x;
            scanf("%d %d %d", &pos, &cnt, &x);

            /*
            for (int i = 1; i <= cnt; i++) a[i] = x;
            splay.erase(pos, pos + cnt - 1);
            splay.insert(pos - 1, a, cnt);
            */
            splay.assign(pos, pos + cnt - 1, x);
        } else if (s[2] == 'V') {
            int pos, cnt;
            scanf("%d %d", &pos, &cnt);

            splay.reverse(pos, pos + cnt - 1);
        } else if (s[2] == 'T') {
            int pos, cnt;
            scanf("%d %d", &pos, &cnt);

            if (cnt == 0) puts("0");
            else printf("%d\n", splay.sum(pos, pos + cnt - 1));
        } else {
            printf("%d\n", splay.maxSum());
        }
    }
}
```