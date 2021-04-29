title: 「JSOI2008」最小生成树计数 - 搜索
categories:
  - OI
tags:
  - BZOJ
  - JSOI
  - 搜索
  - 最小生成树
permalink: jsoi2008-award
date: '2016-10-18 21:34:00'
---

求一个图的不同的最小生成树的数量，保证相同权值的边数量 $ \leq 10 $。

<!-- more -->

### 链接

[BZOJ 1016](http://www.lydsy.com/JudgeOnline/problem.php?id=1016)

### 题解

> 对于一个最小生成树，使用相同数量的一些边替换掉其中与其权值相同的边，如果得到的图没有环，则仍然是一棵最小生成树。

详细证明见：[https://blog.sengxian.com/solutions/bzoj-1016](https://blog.sengxian.com/solutions/bzoj-1016)

对于每一种权值，枚举所有不在最小生成树中的边，乘法原理即可。

### 代码

```cpp
#include <cstdio>
#include <algorithm>
#include <queue>
#include <map>

const int MAXN = 100;
const int MAXM = 1000;
const int MAXC = 1000000000;
const int MOD = 31011;

struct Edge {
    int u, v, w;
    bool used;

    bool operator<(const Edge &other) const { return w < other.w; }
} E[MAXM];

struct UnionFindSet {
    int a[MAXN];

    void init(const int n) { for (int i = 0; i < n; i++) a[i] = i; }

    int find(const int x) { return x == a[x] ? x : a[x] = find(a[x]); }

    void merge(const int x, const int y) {
        a[find(x)] = find(y);
    }

    bool test(const int x, const int y) { return find(x) == find(y); }
} ufs;

struct EdgeGroup {
    int used;
    std::vector<Edge> edges;
};

int n, m, graph[MAXN][MAXN];
std::map<int, EdgeGroup> groups;

inline bool kruskal() {
    std::sort(E, E + m);
    ufs.init(n);
    int cnt = 0;
    for (int i = 0; i < m; i++) {
        if (!ufs.test(E[i].u, E[i].v)) {
            ufs.merge(E[i].u, E[i].v);
            E[i].used = true;
            groups[E[i].w].used++;
            cnt++;
        }
        groups[E[i].w].edges.push_back(E[i]);
    }
    return cnt == n - 1;
}

int main() {
    scanf("%d %d", &n, &m);
    for (int i = 0; i < m; i++) {
        scanf("%d %d %d", &E[i].u, &E[i].v, &E[i].w), E[i].u--, E[i].v--;
    }

    if (!kruskal()) {
        puts("0");
    } else {
        long long ans = 1;
        for (int i = 0; i < m; i++) if (E[i].used) graph[E[i].u][E[i].v] = graph[E[i].v][E[i].u] = true;
        for (std::map<int, EdgeGroup>::const_iterator it = groups.begin(); it != groups.end(); it++) {
            if (it->second.used == 0) continue;
            int t = 0;
            for (unsigned int s = 1; s < (1 << it->second.edges.size()); s++) {
                int popcount = 0;
                for (unsigned int i = 0; i < it->second.edges.size(); i++) if (s & (1 << i)) popcount++;
                if (popcount != it->second.used) continue;

                for (std::vector<Edge>::const_iterator e = it->second.edges.begin(); e != it->second.edges.end(); e++) {
                    graph[e->u][e->v] = graph[e->v][e->u] = false;
                }

                for (std::vector<Edge>::const_iterator e = it->second.edges.begin(); e != it->second.edges.end(); e++) {
                    if (!(s & (1 << (e - it->second.edges.begin())))) continue;

                    graph[e->u][e->v] = graph[e->v][e->u] = true;
                }

                ufs.init(n);
                for (int i = 0; i < n; i++) {
                    for (int j = i + 1; j < n; j++) {
                        if (graph[i][j]) {
                            if (ufs.test(i, j)) {
                                goto nextLoop;
                            }
                            ufs.merge(i, j);
                        }
                    }
                }

                t++;
nextLoop:;
            }
            // printf("t = %d\n", t);
            (ans *= t) %= MOD;

            for (std::vector<Edge>::const_iterator e = it->second.edges.begin(); e != it->second.edges.end(); e++) {
                graph[e->u][e->v] = graph[e->v][e->u] = e->used;
            }
        }

        printf("%lld\n", ans);
    }

    return 0;
}
```