title: 「SHOI2008」仙人掌图 - 仙人掌 DP
categories:
  - OI
tags:
  - BZOJ
  - DP
  - SHOI
  - Tarjan
  - 仙人掌
permalink: shoi2008-cactus
date: '2016-10-26 08:02:00'
---

求仙人掌图的直径。

<!-- more -->

### 链接

[BZOJ 1023](http://www.lydsy.com/JudgeOnline/problem.php?id=1023)

### 题解

任选一个点为根，DFS 整棵树，设 $ f(i) $ 表示 **DFS 树中以 $ i $ 为根的子树在原图中的诱导子图**中以 $ i $ 开始的最长路径。

如果直接树形 DP，得出的答案可能会偏大，因为环的存在会使树上两个点的距离变小。考虑进行树形 DP 时，不在**同一个环**上的点之间转移，即 $ f(i) $ 求出的路径均不包含 $ i $ 点所在环内的路径。

在 DFS 过程中维护 $ \mathrm{dfn}(i) $ 和 $ \mathrm{low}(i) $，在回溯时，对于 $ i $ 的邻接点 $ j $（$ j $ 不是 $ i $ 的父节点），如果 $ \mathrm{low}(j) > \mathrm{dfn}(i) $，则表明 $ j $ 与 $ i $ 不在同一个环中，这种情况下可以由 $ f(j) $ 转移到 $ f(i) $，并更新答案。如果 $ j $ 不是 $ i $ 的子节点且 $ \mathrm{dfn}(j) > \mathrm{dfn}(i) $，则连接 $ i $ 与 $ j $ 的边是一条返祖边。

对于一个环，我们称环上深度最小的点（返祖边的一个端点）为环的**最高点**。找到返祖边之后，一直向父节点走，可以遍历整个环。对于这个环的最高点 $ i $，根据 $ f(i) $ 的定义，整个环是包含在以 $ i $ 为根的子树的诱导子图中的，也就是说这里的 $ f(i) $ 可以包含环中的路径。考虑环上的另一个点 $ j $，$ f(i) $ 一定是 $ f(j) + \mathrm{dist}(j) $ 的形式。

环上的点也可以更新答案，答案的形式是 $ f(i) + f(j) + \mathrm{dist}(i, j) $ 的形式。这 $ s(i) $ 为环上第 $ i $ 个点到第一个点的距离，$ f'(i) $ 为环上第 $ i $ 个点的 $ f $ 值，则答案可表示为 $ f'(i) + f'(j) + s(i) - s(j) $ 的形式。将环拆成链，翻倍，使用单调队列维护 $ f'(j) - s(j) $ 的最大值，并保证 $ s(i) - s(j) $ 不大于环的一半。注意这里更新答案需要在更新最高点的 $ f $ 值之前。

### 代码

```cpp
#include <cstdio>
#include <algorithm>
#include <stack>

const int MAXN = 50000;

struct Node {
    struct Edge *e, *c, *in;
    Node *parent;
    int dfn, low, len;
    bool visited, pushed;
} N[MAXN];

struct Edge {
    Node *s, *t;
    Edge *next;

    Edge(Node *s, Node *t) : s(s), t(t), next(s->e) {}
};

int n;

inline void addEdge(const int s, const int t) {
    N[s].e = new Edge(&N[s], &N[t]);
    N[t].e = new Edge(&N[t], &N[s]);
}

inline void updateCircle(Node *top, Node *u, int &ans) {
#ifdef DBG
    printf("updateCircle(%lu, %lu)\n", top - N + 1, u - N + 1);
#endif
    static Node *v[MAXN * 2];
    int cnt = 0;
    while (1) {
        v[cnt++] = u;
        if (u == top) break;
        u = u->parent;
    }
    std::reverse(v, v + cnt);
    std::copy(v, v + cnt, v + cnt);

    int half = cnt / 2;

    static int q[MAXN * 2];
    int *l = q, *r = q;
    *r = 0;

    // ans = max{ f[i] + f[j] + i - j }
    // maintain the max of f[j] - j
    for (int i = 1; i < cnt * 2; i++) {
        while (i - *l > half) l++;
#ifdef DBG
        printf("updateCircle: ans <- %d\n", v[*l]->len + v[i]->len + i - *l);
#endif
        ans = std::max(ans, v[*l]->len + v[i]->len + i - *l);
        while (l <= r && v[i]->len - i > v[*r]->len - *r) r--;
        *++r = i;
    }

    int res = 0;
    for (int i = 1; i < cnt; i++) {
        // printf("updateCircle(%lu, %lu): (f[%lu] = %d) + min(%d, %d)\n", top - N + 1, u - N + 1, v[i] - N + 1, v[i]->len, i, cnt - i);
        res = std::max(res, v[i]->len + std::min(i, cnt - i));
    }

#ifdef CHECK
    printf("updateCircle(%lu, %lu) = %d\n", top - N + 1, u - N + 1, res);
#endif

    top->len = std::max(top->len, res);
}

inline int tarjan() {
    std::stack<Node *> s;
    s.push(&N[0]);
    N[0].pushed = true;

    int ts = 0, ans = 0;
    while (!s.empty()) {
        Node *v = s.top();

        if (!v->visited) {
            v->visited = true;
            v->c = v->e;
            v->dfn = v->low = ++ts;
        }

        if (v->c && v->c->t == v->parent) v->c = v->c->next;
        if (v->c) {
            Edge *&e = v->c;
            if (e->t->dfn) {
                v->low = std::min(v->low, e->t->dfn);
            } else {
                e->t->pushed = true;
                e->t->parent = v;
                s.push(e->t);
            }
            e = e->next;
        } else {
            for (Edge *e = v->e; e; e = e->next) {
                if (e->t == v->parent) continue;

                if (e->t->low > v->dfn) {
#ifdef DBG
                    printf("tarjan: ans <- (f[%lu] = %d) + (f[%lu] = %d) + 1\n", v - N + 1, v->len, e->t - N + 1, e->t->len);
#endif
                    ans = std::max(ans, v->len + e->t->len + 1);
                    v->len = std::max(v->len, e->t->len + 1);
#ifdef DBG
                    printf("tarjan: f[%lu] = %d\n", v - N + 1, v->len);
#endif
                }

                if (e->t->parent != v && e->t->dfn > v->dfn) {
                    updateCircle(v, e->t, ans);
#ifdef DBG
                    printf("tarjan: f[%lu] = %d (from circle)\n", v - N + 1, v->len);
#endif
                }
            }

            if (v->parent) v->parent->low = std::min(v->parent->low, v->low);

            s.pop();
        }
    }

    return ans;
}

int main() {
    int m;
    scanf("%d %d", &n, &m);
    while (m--) {
        int k, u;
        scanf("%d %d", &k, &u), u--, k--;
        while (k--) {
            int v;
            scanf("%d", &v), v--;
            addEdge(u, v);
            u = v;
        }
    }

    printf("%d\n", tarjan());

    return 0;
}
```