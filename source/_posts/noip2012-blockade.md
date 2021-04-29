title: 「NOIP2012」疫情控制 - 二分 + 倍增 + 贪心
categories:
  - OI
tags:
  - CodeVS
  - NOIP
  - 二分
  - 倍增
  - 贪心
permalink: noip2012-blockade
date: '2016-11-13 17:44:00'
---

H 国有 $ n $ 个城市，这 $ n $ 个城市用 $ n - 1 $ 条双向道路相互连通构成一棵树，$ 1 $ 号城市是首都，也是树中的根节点。

H 国的首都爆发了一种危害性极高的传染病。当局为了控制疫情，不让疫情扩散到边境城市（叶子节点所表示的城市），决定动用军队在一些城市建立检查点，使得从首都到边境城市的每一条路径上都至少有一个检查点，边境城市也可以建立检查点。但特别要注意的是，首都是不能建立检查点的。

现在，在 H 国的一些城市中已经驻扎有军队，且一个城市可以驻扎多个军队。一支军队可以在有道路连接的城市间移动，并在除首都以外的任意一个城市建立检查点，且只能在一个城市建立检查点。一支军队经过一条道路从一个城市移动到另一个城市所需要的时间等于道路的长度（单位：小时）。

请问最少需要多少个小时才能控制疫情。注意，不同的军队可以同时移动。

<!-- more -->

### 链接

[CodeVS 1218](http://codevs.cn/problem/1218/)

### 题解

首先二分答案 $ t $，检验能否在 $ t $ 时间之内控制疫情。

倍增求出每个军队能到达的最高（深度最小的）点，考虑根节点的每棵子树，如果这棵子树无法被**未能到达根**的军队完全覆盖，则需要将一个到达根的军队移动到这棵子树上，或者让一个原本能从这棵子树移动到根军队回到这棵子树。

求出每个能到达根的军队的剩余时间（设它们为 $ X $ 集），和根到每个需要额外军队的子树的边权（设它们为 $ Y $ 集）。

问题转化为，用 $ X $ 集去覆盖 $ Y $ 集，$ X $ 集中的每个元素可以覆盖 $ Y $ 集中不大于它的元素，并且 $ X $ 中的每个元素可以额外覆盖 $ Y $ 集中的一个元素，求能否覆盖。

分别将 $ X $ 集和 $ Y $ 集排序，从小到大枚举 $ X $ 集中的每个元素，如果它可以额外覆盖的 $ Y $ 集元素未被覆盖，则去覆盖这个元素，否则覆盖最小未被覆盖的 $ Y $ 集元素。

### 代码

```cpp
#include <cstdio>
#include <algorithm>
#include <queue>
#include <vector>
#include <list>

const int MAXN = 50000;
const int MAXN_LOG = 16; // Math.log2(50000) = 15.609640474436812

struct Node {
    struct Edge *e;
    Node *parent;
    bool visited, settled, childSettled;
    std::vector<int> arrived;
} N[MAXN + 1], *seq[MAXN + 1];

struct Edge {
    Node *s, *t;
    Edge *next;

    int w;
    bool visited;
    std::list<Edge *>::iterator it;

    Edge(Node *s, Node *t, int w) : s(s), t(t), next(s->e), w(w) {}
};

inline void addEdge(int s, int t, int w) {
    N[s].e = new Edge(&N[s], &N[t], w);
    N[t].e = new Edge(&N[t], &N[s], w);
}

int n, m, a[MAXN + 1], logn;

int f[MAXN + 1][MAXN_LOG + 1];
long long g[MAXN + 1][MAXN_LOG + 1];

inline void prepare() {
    std::queue<Node *> q;

    N[1].visited = true;
    f[1][0] = 1;
    g[1][0] = 0;
    q.push(&N[1]);

    int cnt = 0;
    while (!q.empty()) {
        Node *v = q.front();
        q.pop();

        seq[++cnt] = v;

        for (Edge *e = v->e; e; e = e->next) {
            if (!e->t->visited) {
                e->t->visited = true;
                e->t->parent = v;
                f[e->t - N][0] = v - N;
                g[e->t - N][0] = e->w;
                q.push(e->t);
            }
        }
    }

    while ((1 << logn) <= n) logn++;
    logn--;

    for (int j = 1; j <= logn; j++) {
        for (int i = 1; i <= n; i++) {
            f[i][j] = f[f[i][j - 1]][j - 1];
            g[i][j] = g[i][j - 1] + g[f[i][j - 1]][j - 1];
        }
    }
}

inline bool compare(Edge *a, Edge *b) {
    return a->w < b->w;
}

inline bool check(long long limit) {
    for (int i = 1; i <= n; i++) {
        N[i].arrived.clear();
        N[i].settled = false;
        N[i].childSettled = false;
    }

    for (int i = 1; i <= m; i++) {
        int u = a[i];

        long long dist = 0;
        for (int j = logn; j >= 0; j--) {
            if (dist + g[u][j] <= limit && f[u][j] != 1) {
                dist += g[u][j];
                u = f[u][j];
            }
        }

        N[u].arrived.push_back(limit - dist);
    }

    for (int i = n; i >= 1; i--) {
        if (seq[i]->e->next || i == 1) { // It's not a leaf
            seq[i]->childSettled = true;
            for (Edge *e = seq[i]->e; e; e = e->next) {
                if (e->t == seq[i]->parent) continue;

                if (!e->t->settled) {
                    seq[i]->childSettled = false;
                    break;
                }
            }
        }

#ifdef DBG
        printf("%lu: childSettled = %d, settled = %d\n", seq[i] - N, seq[i]->childSettled, seq[i]->settled);
#endif

        seq[i]->settled = seq[i]->childSettled;

        if (seq[i]->arrived.size()) {
            seq[i]->settled = true;
        }
    }

    if (N[1].settled) return true;

    std::list< std::pair<int, Edge *> > atRoot;
    std::list<Edge *> needSettle;
    for (Edge *e = N[1].e; e; e = e->next) {
#ifdef DBG
        printf("%lu: childSettled = %d\n", e->t - N, e->t->childSettled);
#endif

        std::vector<int> &vec = e->t->arrived;
        std::sort(vec.begin(), vec.end());

        bool remain = e->t->childSettled;
        for (size_t i = 0; i < vec.size(); i++) {
            if (vec[i] >= e->w) atRoot.push_back(std::make_pair(vec[i] - e->w, e));
            else remain = true;
        }

        if (remain) {
            e->visited = true;
        } else {
            needSettle.push_back(e);
            e->it = --needSettle.end();
            e->visited = false;
        }
    }

    atRoot.sort();
    needSettle.sort(&compare);

#ifdef DBG
    std::vector< std::pair<int, Edge *> > _atRoot(atRoot.begin(), atRoot.end());
    std::vector<Edge *> _needSettle(needSettle.begin(), needSettle.end());
#endif
    // std::sort(needSettle.begin(), needSettle.end(), &compare);

    for (std::list< std::pair<int, Edge *> >::iterator it = atRoot.begin(); it != atRoot.end(); it++) {
        if (needSettle.empty()) break;
        if (!it->second->visited) {
            it->second->visited = true;
            needSettle.erase(it->second->it);
        } else {
            if (needSettle.front()->w <= it->first) {
                needSettle.front()->visited = true;
                needSettle.pop_front();
            }
        }
    }

    return needSettle.empty();
}

int main() {
    scanf("%d", &n);

    long long sum = 0;
    for (int i = 1; i <= n - 1; i++) {
        int u, v, w;
        scanf("%d %d %d", &u, &v, &w);

        sum += w;
        addEdge(u, v, w);
    }

    prepare();

    scanf("%d", &m);
    for (int i = 1; i <= m; i++) {
        scanf("%d", &a[i]);
    }

    int cnt = 0;
    for (Edge *e = N[1].e; e; e = e->next) cnt++;

    if (cnt > m) puts("-1");
    else {
        int l = 0, r = sum;
        while (l < r) {
            int mid = l + (r - l) / 2;
#ifdef DBG
            printf("[%d, %d], mid = %d\n", l, r, mid);
#endif
            if (check(mid)) r = mid;
            else l = mid + 1;
        }
        printf("%d\n", l);
    }

    return 0;
}
```