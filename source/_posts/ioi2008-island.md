title: 「IOI2008」岛屿 - 基环树 DP
categories:
  - OI
tags:
  - BZOJ
  - DP
  - SHOI
  - Tarjan
  - 基环树
permalink: ioi2008-island
date: '2016-10-24 21:39:00'
---

给一个由多个基环树构成的图，求所有基环树最长链之和。

<!-- more -->

### 链接

[BZOJ 1791](http://www.lydsy.com/JudgeOnline/problem.php?id=1791)

### 题解

首先，考虑没有环的情况，也就是说，求一棵树的最长链。

设 $ f(i) $ 表示从节点 $ i $ 向子树延伸的最长路径，显然，对于 $ i $ 的每个子节点 $ j $，$ f(i) = \max\{ f(j) + d(i, j) \} $。

对于每个节点，用两个不同的子树 $ u $、$ v $ 的路径和 $ f(u) + d(i, u) + f(v) + d(i, v) $ 来更新答案。

如果没有环，则每个连通块就是一棵树，答案是从某一个点向下延伸的两条最长路径之和。有了环之后，拓扑排序找出环，以环为根做树形 DP，答案可能是环上两个点向下延伸的最长路径之和，加上这两个点在环上的距离。

任选一个节点开始，把环断成链，设 $ f'(i) $ 表示环上的第 $ i $ 个点的 $ f $ 值。$ s(i) $ 表示环上第 $ i $ 个点与第一个点的距离。答案可以表示为

走完 $ i $ 向下延伸的最长链，从 $ i $ 沿着链的方向走到 $ j $，再走 $ i $ 向下延伸的最长链：

$$ \begin{aligned} & f'(i) + f'(j) + s(i) - s(j) \pod {i > j} \\ = & f'(j) - s(j) + f'(i) + s(i) \end{aligned} $$

沿着环的另一个方向（顺时针、逆时针）从 $ i $ 走到 $ j $（$ S $ 表示整个环的长度）：

$$ \begin{aligned} & f'(i) + f'(j) + S - (s(i) - s(j)) \pod {i > j} \\ = & f'(i) + f'(j) + S - s(i) + s(j) \\ = & f'(j) + s(j) + S + f'(i) - s(i) \end{aligned} $$

按照链的顺序扫描环上的节点，维护 $ f'(j) + s(j) + S $ 的最大值，更新答案即可。

### 代码

```cpp
#include <cstdio>
#include <climits>
#include <queue>
#include <stack>
#include <vector>

const int MAXN = 1000000;

struct Node {
    struct Edge *e, *c, *in;
    Node *parent;
    bool inCircle, solved, visited, pushed;
    int depth, inDegree;
    long long len;
} N[MAXN];

struct Edge {
    Node *s, *t;
    long long w;
    Edge *next, *r;
    bool disabled;

    Edge(Node *s, Node *t, const int w) : s(s), t(t), w(w), next(s->e) {}
};

int n;
inline void addEdge(const int s, const int t, const int w) {
    N[s].e = new Edge(&N[s], &N[t], w);
    N[t].e = new Edge(&N[t], &N[s], w);
    (N[s].e->r = N[t].e)->r = N[s].e;
}

inline std::vector<Node *> getBlock(Node *start) {
    std::queue<Node *> q;
    q.push(start);
    start->inDegree = 0;
    start->visited = true;

    std::vector<Node *> block;
    while (!q.empty()) {
        Node *v = q.front();
        q.pop();

        block.push_back(v);

        for (Edge *e = v->e; e; e = e->next) {
            if (e == v->in || e->t->solved) continue;
            if (!e->t->visited) {
                e->t->visited = true;
                e->t->inDegree = 1;
                e->t->in = e;
                q.push(e->t);
            } else e->t->inDegree++;
        }
    }

    return block;
}

inline void toposort(std::vector<Node *> &v) {
    std::queue<Node *> q;
    for (size_t i = 0; i < v.size(); i++) {
#ifdef DBG
        printf("toposort(): inDegree[%lu] = %d\n", v[i] - N + 1, v[i]->inDegree);
#endif
        if (v[i]->inDegree == 1) q.push(v[i]);
        else v[i]->inCircle = true;
    }

    while (!q.empty()) {
        Node *v = q.front();
        q.pop();

        v->inCircle = false;
#ifdef CHECK
        printf("%lu\n", v - N);
#endif

        for (Edge *e = v->e; e; e = e->next) {
            if (e->t->solved) continue;
            if (--e->t->inDegree == 1) {
                q.push(e->t);
            }
        }
    }
}

inline long long calcTree(std::vector<Node *> &v) {
    for (size_t i = 0; i < v.size(); i++) {
        v[i]->visited = false;
        v[i]->inDegree = 0;
        v[i]->depth = 0;
    }

    std::stack<Node *> s;
    for (size_t i = 0; i < v.size(); i++) {
        if (v[i]->inCircle) {
            v[i]->depth = 1;
            s.push(v[i]);
        }
    }

    long long ans = 0;
    while (!s.empty()) {
        Node *v = s.top();

        if (!v->visited) {
            v->visited = true;
            v->c = v->e;
        }

        while (v->c && (v->c->t->inCircle || v->c->t->pushed || v->c->t->solved)) v->c = v->c->next;
        if (v->c) {
            Edge *&e = v->c;
            e->t->pushed = true;
            e->t->parent = v;
            s.push(e->t);
            e = e->next;
        } else {
            v->len = 0;
            for (Edge *e = v->e; e; e = e->next) {
                if (e->t->inCircle || e->t->parent != v) continue;

                ans = std::max(ans, v->len + e->t->len + e->w);
                v->len = std::max(v->len, e->t->len + e->w);
            }

            s.pop();
        }
    }

#ifdef DBG
    printf("calcTree(size = %lu) = %lld\n", v.size(), ans);
#endif
    return ans;
}

inline long long calcCircle(std::vector<Node *> &v) {
    Node *start;
    for (size_t i = 0; i < v.size(); i++) v[i]->visited = false;
    for (size_t i = 0; i < v.size(); i++) {
        if (v[i]->inCircle) {
            v[i]->visited = true;
            start = v[i];
            break;
        }
        for (Edge *e = v[i]->e; e; e = e->next) e->disabled = false;
    }

    static Node *c[MAXN];
    static long long s[MAXN];
    int cnt = 0;
    long long sum = 0;

#ifdef DBG
    for (int i = 0; i < MAXN; i++) c[i] = NULL, s[i] = 0;
#endif

    Node *u = start;
    c[cnt++] = u;
    while (1) {
        Node *next = NULL;
        for (Edge *e = u->e; e; e = e->next) {
            if (e->disabled || e->t->solved) continue;
            if (!e->t->visited && e->t->inCircle) {
                c[cnt] = e->t;
                s[cnt] = e->w;
                sum += e->w;
                cnt++;
                e->t->visited = true;
                e->r->disabled = true;
                next = e->t;
                break;
            }
        }
        if (next) {
            u = next;
        } else {
            for (Edge *e = u->e; e; e = e->next) {
                if (e->disabled || e->t->solved) continue;
                if (e->t == start) {
                    sum += e->w;
                    break;
                }
            }
            break;
        }
    }

    if (n == 0) return 0;
    /*
    if (cnt == 2) {
        long long ans = c[0]->len + c[1]->len + std::max(s[1], sum - s[1]);
#ifdef DBG
        printf("%lld %lld\n", s[1], sum);
        printf("calcCircle(size = 2) = %lld\n", ans);
#endif
        return ans;
    }
    */

    for (int i = 1; i < cnt; i++) s[i] += s[i - 1];

    // ans1 = f[a] + f[b] + s[a] - s[b]
    // ans2 = f[a] + f[b] + sum - (s[a] - s[b]) = sum + f[a] + f[b] - s[a] + s[b]
    // maintain the max of f[b] - s[b] and f[b] + s[b]
    long long ans = 0, max1 = LLONG_MIN, max2 = LLONG_MIN;
    for (int i = 0; i < cnt; i++) {
        ans = std::max(ans, c[i]->len + s[i] + max1);
        ans = std::max(ans, sum + c[i]->len - s[i] + max2);

        max1 = std::max(max1, c[i]->len - s[i]);
        max2 = std::max(max2, c[i]->len + s[i]);

#ifdef DBG
        printf("ans = %lld, max1 = %lld, max2 = %lld\n", ans, max1, max2);
#endif
    }

#ifdef DBG
    printf("calcCircle(size = %lu, cnt = %d) = %lld\n", v.size(), cnt, ans);
#endif
    return ans;
}

inline long long solve() {
    long long ans = 0;
    for (int i = 0; i < n; i++) {
        if (N[i].solved) continue;

        std::vector<Node *> block = getBlock(&N[i]);
        toposort(block);

        long long tmp = calcTree(block);
        tmp = std::max(tmp, calcCircle(block));
        ans += tmp;

        for (size_t i = 0; i < block.size(); i++) block[i]->solved = true;
    }

    return ans;
}

int main() {
    scanf("%d", &n);
    for (int i = 0; i < n; i++) {
        int u, w;
        scanf("%d %d", &u, &w), u--;
        addEdge(i, u, w);
    }

    printf("%lld\n", solve());

#ifdef CHECK
    for (int i = 0; i < n; i++) printf("f[%d] = %lld\n", i, N[i].len);
#endif

    return 0;
}
```