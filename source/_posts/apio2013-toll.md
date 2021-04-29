title: 「APIO2013」TOLL - 搜索 + 最小生成树
categories:
  - OI
tags:
  - APIO
  - BZOJ
  - UOJ
  - 搜索
  - 最小生成树
permalink: apio2013-toll
date: '2017-05-27 10:31:00'
---

幸福国度可以用 $N$ 个城镇（用 $1$ 到 $N$ 编号）构成的集合来描述，这些城镇最开始由 $M$ 条双向道路（用 $1$ 到 $M$ 编号）连接。城镇 $1$ 是中央城镇。保证一个人从城镇 $1$ 出发，经过这些道路，可以到达其他的任何一个城市。这些道路都是收费道路，道路 $i$ 的使用者必须向道路的主人支付 $c_i$ 分钱的费用。已知所有的这些 $c_i$ 是互不相等的。最近有 $K$ 条新道路建成，这些道路都属于亿万富豪 Mr. Greedy。

Mr. Greedy 可以决定每条新道路的费用（费用可以相同），并且他必须在明天宣布这些费用。

两周以后，幸福国度将举办一个盛况空前的嘉年华！大量的参与者将沿着这些道路游行并前往中央城镇。共计 $p_j$ 个参与者将从城镇 $j$ 出发前往中央城镇。这些人只会沿着一个选出的道路集合前行，并且这些选出的道路将在这件事的前一天公布。根据一个古老的习俗，这些道路将由幸福国度中最有钱的人选出，也就是 Mr. Greedy。同样根据这个习俗，Mr. Greedy 选出的这个道路集合必须使所有选出道路的费用之和最小，并且仍要保证任何人可以从城镇 $j$ 前往城镇 $1$（因此，这些选出的道路来自将费用作为相应边边权的“最小生成树”）。如果有多个这样的道路集合，Mr. Greedy 可以选其中的任何一个，只要满足费用和是最小的。

Mr. Greedy 很明确地知道，他从 $K$ 条新道路中获得的收入不只是与费用有关。一条道路的收入等于所有经过这条路的人的花费之和。更准确地讲，如果 $p$ 个人经过道路 $i$，道路 $i$ 产生的收入为乘积 $c_i \cdot p$。注意 Mr. Greedy 只能从新道路收取费用，因为原来的道路都不属于他。

Mr. Greedy 有一个阴谋。他计划通过操纵费用和道路的选择来最大化他的收入。他希望指定每条新道路的费用（将在明天公布），并且选择嘉年华用的道路（将在嘉年华的前一天公布），使得他在 $K$ 条新道路的收入最大。注意 Mr. Greedy 仍然需要遵循选出花费之和最小的道路集合的习俗。

你是一个记者，你想揭露他的计划。为了做成这件事，你必须先写一个程序来确定 Mr. Greedy 可以通过他的阴谋获取多少收入。

<!-- more -->

### 链接

[BZOJ 3206](http://www.lydsy.com/JudgeOnline/problem.php?id=3206)  
[UOJ #108](http://uoj.ac/problem/108)

### 题解

问题的本质是，用 $ k $ 条边中的一些边去替换最小生成树中的边，使得最小生成树大小不变，并使得每条新边的经过次数乘上边权的总和最大。

如果我们将所有 $ k $ 条新边都加入到最小生成树中，然后从小到大加入原有的边。考虑这些仍然被加入到最小生成树中的旧边，这些边是无论如何都要被加入的 —— 所以可以缩点，缩点后只会剩下 $ k + 1 $ 个点，剩下的旧边只会有 $ O(k ^ 2) $ 条。搜索 $ k $ 条边要选哪些，将其加入后从小到大加入旧边，之后每一条边 $ (u, v) $ 都会使 $ u $ 到 $ v $ 路径上的所有新边的权值对其权值取 $ \min $。

并查集维护这个取 $ \min $ 的过程即可。

### 代码

```cpp
#include <cstdio>
#include <cctype>
#include <cassert>
#include <climits>
#include <cstring>
#include <algorithm>
#include <vector>

const int __buffsize = 500000;
char __buff[__buffsize];
char *__buffs, *__buffe;

#define getchar() (__buffs == __buffe ? fread(__buff, 1, __buffsize, stdin), __buffe = __buff + __buffsize, *((__buffs = __buff)++) : *(__buffs++))

inline int read() {
    static int n, ch;
    n = 0, ch = getchar();
    while (!isdigit(ch)) ch = getchar();
    while (isdigit(ch)) n = n * 10 + ch - '0', ch = getchar();
    return n;
}

const int MAXN = 100000;
const int MAXK = 20;
const int MAXM = 300000 + MAXK;

struct Node {
    std::vector<struct Edge> e;
    Node *fa;
    int w, dep;
    long long s, initS;
    bool modifiable;
} N[MAXK + 1 + 1];

struct Edge {
    Node *s, *t;
    int w;

    Edge(Node *s, Node *t, int w) : s(s), t(t), w(w) {}
};

inline void addEdge(int s, int t, int w) {
#ifdef DBG
    printf("addEdge(%d, %d, %d)\n", s, t, w);
#endif
    N[s].e.push_back(Edge(&N[s], &N[t], w));
    N[t].e.push_back(Edge(&N[t], &N[s], w));
}

struct PlainEdge {
    int u, v, w;
    bool selected;

    bool operator<(const PlainEdge &other) const {
        return w < other.w;
    }
} E[MAXM + 1], newE[MAXM + 1];

int n, m, k, p[MAXN + 1], cnt, belong[MAXN + 1], edgeCnt;

struct UnionFindSet {
    int fa[MAXN + 1];

    void init(int n) {
        for (int i = 1; i <= n; i++) fa[i] = i;
    }

    void merge(int x, int y) {
        fa[find(x)] = find(y);
    }

    int find(int x) {
        return x == fa[x] ? x : fa[x] = find(fa[x]);
    }
} ufs;

inline void prepare() {
    // Kruskal
    ufs.init(n);
    for (int i = m + 1; i <= m + k; i++) {
        ufs.merge(E[i].u, E[i].v);
    }

    std::sort(E + 1, E + m + 1);

    for (int i = 1; i <= m; i++) {
        if (ufs.find(E[i].u) != ufs.find(E[i].v)) {
            E[i].selected = true;
            ufs.merge(E[i].u, E[i].v);
#ifdef DBG
            printf("Must Select Edge: (%d, %d, %d)\n", E[i].u, E[i].v, E[i].w);
#endif
        }
    }

    // Discrete

    ufs.init(n);
    for (int i = 1; i <= m; i++) if (E[i].selected) ufs.merge(E[i].u, E[i].v);

    static int a[MAXN + 1];
    for (int i = 1; i <= n; i++) a[i] = ufs.find(i);

    static int set[MAXN + 1];
    std::copy(a + 1, a + n + 1, set + 1);
    std::sort(set + 1, set + n + 1);
    int *end = std::unique(set + 1, set + n + 1);

    for (int i = 1; i <= n; i++) {
        belong[i] = std::lower_bound(set + 1, end, a[i]) - set;
#ifdef DBG
        printf("%d belongs to block %d\n", i, belong[i]);
#endif
        N[belong[i]].initS += p[i];
    }

    cnt = end - (set + 1);

    static int w[MAXK + 2][MAXK + 2];
    for (int i = 1; i <= cnt; i++) for (int j = 1; j <= cnt; j++) w[i][j] = INT_MAX;

    for (int i = 1; i <= m; i++) {
        if (E[i].selected) continue;
        int u = belong[E[i].u], v = belong[E[i].v];
        w[u][v] = w[v][u] = std::min(w[v][u], E[i].w);
    }

    for (int i = 1; i <= cnt; i++) {
        for (int j = i + 1; j <= cnt; j++) {
            if (w[i][j] != INT_MAX) {
                edgeCnt++;
                newE[edgeCnt].u = i;
                newE[edgeCnt].v = j;
                newE[edgeCnt].w = w[i][j];
                // addEdge(i, j, w[i][j]);
            }
        }
    }

    std::sort(newE + 1, newE + edgeCnt + 1);
    // assert(belong[1] == 1);
}

inline void dfs(Node *v, Node *fa = NULL) {
    v->s = v->initS;

    for (Edge *e = &v->e.front(); e && e <= &v->e.back(); e++) {
        if (e->t == fa) continue;

        e->t->modifiable = e->w == INT_MAX;
        e->t->w = e->w;
        e->t->fa = v;
        e->t->dep = v->dep + 1;

        dfs(e->t, v);

        v->s += e->t->s;
    }
}

inline void clear() {
    for (int i = 1; i <= edgeCnt; i++) newE[i].selected = false;
    for (int i = 1; i <= cnt; i++) {
        N[i].modifiable = false;
        N[i].w = N[i].dep = N[i].s = 0;
        N[i].fa = NULL;
        N[i].e.clear();
    }
#ifdef DBG
    puts("[Cleared]");
#endif
}

/*
inline Node *lca(Node *u, Node *v) {
    for (; u != v; u = u->fa) if (u->dep < v->dep) std::swap(u, v);
    return u;
}
*/

inline void applyMin(int u, int v, int w) {
    /*
    Node *p = lca(&N[u], &N[v]);
    for (Node *a = &N[u]; a != p; a = a->fa) if (a->modifiable) a->w = std::min(a->w, w);
    for (Node *a = &N[v]; a != p; a = a->fa) if (a->modifiable) a->w = std::min(a->w, w);
    */

    // printf("apply min (%d, %d, %d)\n", v, u, w);

    u = ufs.find(u);
    v = ufs.find(v);

    while (u != v) {
        if (N[u].dep < N[v].dep) std::swap(u, v);
        if (N[u].modifiable) N[u].w = w;
        ufs.merge(u, N[u].fa - N);
        u = ufs.find(u);
    }
}

inline long long solve() {
    long long ans = 0;
    for (int s = 0; s < (1 << k); s++) {
        clear();

        ufs.init(cnt);

        // k new edges
        bool circle = false;
        for (int i = 0; i < k; i++) {
            if (s & (1 << i)) {
                int u = belong[E[m + 1 + i].u], v = belong[E[m + 1 + i].v];
                if (ufs.find(u) != ufs.find(v)) {
                    ufs.merge(u, v);
                    addEdge(u, v, INT_MAX);
                } else {
                    circle = true;
                    break;
                }
            }
        }

        if (circle) continue;

        // Old edges
        for (int i = 1; i <= edgeCnt; i++) {
            if (ufs.find(newE[i].u) != ufs.find(newE[i].v)) {
                ufs.merge(newE[i].u, newE[i].v);
                newE[i].selected = true;
                addEdge(newE[i].u, newE[i].v, newE[i].w);
            }
        }

        /*
        for (int i = 1; i <= cnt; i++) {
            for (int j = i + 1; j <= cnt; j++) {
                if (w[i][j] != INT_MAX) {
                    if (ufs.find(i) != ufs.find(j)) {
                        ufs.merge(i, j);
                        selected[i][j] = true;
                        addEdge(i, j, w[i][j]);
                    }
                }
            }
        }
        */

        dfs(&N[belong[1]]);

        ufs.init(cnt);
        for (int i = 1; i <= edgeCnt; i++) {
            if (!newE[i].selected) {
                applyMin(newE[i].u, newE[i].v, newE[i].w);
            }
        }

        long long sum = 0;
        for (int i = 1; i <= cnt; i++) {
            if (N[i].modifiable) sum += N[i].s * N[i].w;
        }

        ans = std::max(ans, sum);
    }

    return ans;
}

int main() {
    n = read(), m = read(), k = read();
    for (int i = 1; i <= m; i++) {
        E[i].u = read();
        E[i].v = read();
        E[i].w = read();
        // scanf("%d %d %d", &E[i].u, &E[i].v, &E[i].w);
    }

    for (int i = m + 1; i <= m + k; i++) {
        E[i].u = read();
        E[i].v = read();
        // scanf("%d %d", &E[i].u, &E[i].v);
        E[i].w = -1;
    }

    for (int i = 1; i <= n; i++) p[i] = read(); // scanf("%d", &p[i]);

    prepare();

    printf("%lld\n", solve());
}
```