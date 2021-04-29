title: 「IOI2011」Race - 点分治
categories:
  - OI
tags:
  - BZOJ
  - IOI
  - 数据结构
  - 点分治
permalink: ioi2011-race
date: '2016-06-16 20:01:00'
---

给一棵树，每条边有权。求一条**简单**路径，权值和等于 $ K $，且边的数量最小。

<!-- more -->

### 链接

[BZOJ 2599](http://www.lydsy.com/JudgeOnline/problem.php?id=2599)

### 题解

点分治，考虑经过根的路径中权值和等于 $ K $ 的路径。

遍历整棵树，记录到达每一个点时的经过的边数 $ {\rm depth}(v) $ 和边权和 $ {\rm dist}(v) $。

设 $ f(i) $ 表示当前根的**之前几棵子树**中从根到某个节点边权和为 $ i $ 的路径经过的最少边数。

枚举当前子树的所有节点，用 $ {\rm depth}(i) + f(K - {\rm dist}(i)) $ 更新答案。

### 代码

```cpp
#include <cstdio>
#include <climits>
#include <cassert>
// #include "rand.h"
#include <queue>
#include <stack>

const int MAXN = 200000;
const int MAXK = 1000000;

struct Node;
struct Edge;

struct Node {
    Edge *e;
    int dist, depth, size, max;
    bool visited, solved;
    Node *parent;
} N[MAXN];

struct Edge {
    Node *s, *t;
    int w;
    Edge *next;

    Edge(Node *s, Node *t, const int w) : s(s), t(t), w(w), next(s->e) {}
};

inline void addEdge(const int s, const int t, const int w) {
    N[s].e = new Edge(&N[s], &N[t], w);
    N[t].e = new Edge(&N[t], &N[s], w);
}

int n, k;
int f[MAXK + 1];

inline Node *center(Node *start) {
    std::stack<Node *> s;
    s.push(start);
    start->parent = NULL;
    start->visited = false;

    static Node *a[MAXN];
    int cnt = 0;
    while (!s.empty()) {
        Node *v = s.top();
        if (!v->visited) {
            v->visited = true;
            a[cnt++] = v;
            for (Edge *e = v->e; e; e = e->next) if (!e->t->solved && e->t != v->parent) {
                e->t->parent = v;
                e->t->visited = false;
                s.push(e->t);
            }
        } else {
            v->size = 1;
            v->max = 0;
            for (Edge *e = v->e; e; e = e->next) if (!e->t->solved && e->t->parent == v) {
                v->size += e->t->size;
                v->max = std::max(v->max, e->t->size);
            }
            s.pop();
        }
    }

    // return a[rand(0, cnt - 1)];

    Node *res = NULL;
    for (int i = 0; i < cnt; i++) {
        // printf("%d %d\n", cnt, start->size);
        assert(cnt == start->size);
        a[i]->max = std::max(a[i]->max, cnt - a[i]->size);
        if (!res || res->max > a[i]->max) res = a[i];
    }

    // printf("root(%ld) = %ld\n", start - N + 1, res - N + 1);
    return res;
}

inline int calc(Node *root) {
    static int A[MAXN];
    int tot = 0, res = INT_MAX;
    for (Edge *e = root->e; e; e = e->next) if (!e->t->solved) {
        std::queue<Node *> q;
        q.push(e->t);
        e->t->parent = root;
        e->t->dist = e->w;
        e->t->depth = 1;

        static Node *a[MAXN];
        int cnt = 0;
        while (!q.empty()) {
            Node *v = q.front();
            q.pop();

            if (v->dist > k) continue;

            A[tot++] = v->dist;
            a[cnt++] = v;

            for (Edge *e = v->e; e; e = e->next) if (!e->t->solved && e->t != v->parent) {
                e->t->parent = v;
                e->t->dist = v->dist + e->w;
                e->t->depth = v->depth + 1;
                q.push(e->t);
            }
        }

        for (int i = 0; i < cnt; i++) {
            // assert(k - a[i]->dist >= 0 && k - a[i]->dist <= k);
            if (f[k - a[i]->dist] != INT_MAX) res = std::min(res, f[k - a[i]->dist] + a[i]->depth);
        }

        for (int i = 0; i < cnt; i++) {
            f[a[i]->dist] = std::min(f[a[i]->dist], a[i]->depth);
        }
    }

    for (int i = 0; i < tot; i++) {
        // assert(A[i] >= 0 && A[i] <= k);
        f[A[i]] = INT_MAX;
    }

    // printf("calc(%ld) = %d\n", root - N + 1, res);
    return res;
}

inline int solve() {
    std::stack<Node *> s;
    s.push(&N[0]);

    int ans = INT_MAX;
    while (!s.empty()) {
        Node *v = s.top();
        s.pop();

        Node *root = center(v);
        root->solved = true;

        ans = std::min(ans, calc(root));

        for (Edge *e = root->e; e; e = e->next) if (!e->t->solved) {
            s.push(e->t);
        }
    }

    return ans;
}

int main() {
    scanf("%d %d", &n, &k);

    // assert(n <= MAXN);
    // assert(k <= MAXK);

    for (int i = 0; i < n - 1; i++) {
        int u, v, w;
        scanf("%d %d %d", &u, &v, &w);
        addEdge(u, v, w);
    }

    for (int i = 1; i <= k; i++) f[i] = INT_MAX;

    int ans = solve();
    printf("%d\n", ans == INT_MAX ? -1 : ans);

    return 0;
}
```