title: 「HNOI2008」神奇的国度 - 最大势
categories:
  - OI
tags:
  - BZOJ
  - HNOI
  - 弦图
  - 最大势
permalink: hnoi2008-kingdom
date: '2016-10-17 11:07:00'
---

给一个弦图，求它的最小染色数。

<!-- more -->

### 链接

[BZOJ 1006](http://www.lydsy.com/JudgeOnline/problem.php?id=1006)

### 题解

使用最大势（MCS）算法，求出一个**弦图**的**完美消除序列**，染色时，对完美消除序列从后向前染当前能染的最小颜色，即为最优方案。

最大势算法的流程是：

1. 选一个点作为初始点，排在完美消除序列的最后一个；
2. 将这个点邻接点的势 $ +1 $；
3. 从它的邻接点中选择一个势最大的，且未被选中过的点，作为完美消除序列的下一个点；
4. 返回 (2)，直到完美消除序列构造完毕。

朴素算法的时间复杂度为 $ O(n ^ 2 + m) $ 使用链表优化，可将时间复杂度降为 $ O(n + m) $。

### 代码

```cpp
#include <cstdio>
#include <climits>
#include <set>
#include <list>

const int MAXN = 10000;
const int MAXM = 1000000;

struct Node {
    struct Edge *e;
    int d, color;
    bool visited;
    std::list<Node *>::iterator iterator;
} N[MAXN], *seq[MAXN];

struct Edge {
    Node *s, *t;
    Edge *next;

    Edge(Node *s, Node *t) : s(s), t(t), next(s->e) {}
};

inline void addEdge(const int s, const int t) {
    N[s].e = new Edge(&N[s], &N[t]);
    N[t].e = new Edge(&N[t], &N[s]);
}

int n, m;

inline void mcs() {
    static std::list<Node *> lists[MAXN];
    for (int i = 0; i < n; i++) {
        N[i].d = 0;
        N[i].visited = false;
        lists[0].push_front(&N[i]);
        N[i].iterator = lists[0].begin();
    }

    int max = 0;
    for (int i = n - 1; i >= 0; i--) {
        while (lists[max].empty()) max--;
        Node *v = lists[max].front();
        lists[max].pop_front();
        seq[i] = v;
        // printf("%lu\n", seq[i] - N + 1);
        v->visited = true;

        for (Edge *e = v->e; e; e = e->next) {
            if (!e->t->visited) {
                lists[e->t->d].erase(e->t->iterator);
                e->t->d++;
                lists[e->t->d].push_front(e->t);
                e->t->iterator = lists[e->t->d].begin();
                max = std::max(max, e->t->d);
            }
        }
    }
}

int main() {
    scanf("%d %d", &n, &m);
    while (m--) {
        int u, v;
        scanf("%d %d", &u, &v), u--, v--;
        addEdge(u, v);
    }

    mcs();

    int ans = 0;
    for (int i = n - 1; i >= 0; i--) {
        std::set<int> s;
        for (Edge *e = seq[i]->e; e; e = e->next) {
            if (e->t->color) s.insert(e->t->color);
        }
        s.insert(INT_MAX);

        int last = 0;
        for (std::set<int>::const_iterator it = s.begin(); it != s.end(); it++) {
            if (last + 1 != *it) {
                seq[i]->color = last + 1;
                break;
            }
            last = *it;
        }

        ans = std::max(ans, seq[i]->color);
    }

    printf("%d\n", ans);

    return 0;
}
```