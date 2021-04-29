title: Tarjan 割点学习笔记
categories:
  - OI
tags:
  - Tarjan
  - 割点
  - 图论
  - 学习笔记
  - 算法模板
permalink: tarjan-cut-notes
date: '2016-09-08 19:45:00'
---

在一个无向图中，如果删掉点 $ v $ 后图的连通块数量增加，则称点 $ v $ 为图的**割点**。

<!-- more -->

### 定义

$ \mathrm{dfn}(u) $ 表示进入节点 $ u $ 时的时间。

$ \mathrm{low}(u) $ 表示由节点 $ u $ 开始搜索所能到达的点中，在搜索树上是 $ u $ 的祖先且 $ \mathrm{dfn} $ 最小的节点的 $ \mathrm{dfn} $。

### 算法描述

类似于 Tarjan 求强连通分量的算法。

1. 从起点开始 DFS；
2. 进入一个节点时，初始化它的 $ \mathrm{dfn} $ 和 $ \mathrm{low} $ 均为当前时间戳；
3. 枚举当前点 $ v $ 的所有邻接点；
4. 如果某个邻接点 $ u $ 已被访问过，则更新 $ \mathrm{low}(v) = \min(\mathrm{low}(v), \mathrm{dfn}(u)) $；
5. 如果某个邻接点 $ u $ 未被访问过，则对 $ u $ 进行 DFS，并在回溯后更新 $ \mathrm{low}(v) = \min(\mathrm{low}(v), \mathrm{low(u)}) $；
6. 对于一个搜索树上的非根节点 $ u $，如果存在子节点 $ v $，满足 $ \mathrm{low}(v) \geq \mathrm{dfn}(u) $，则 $ u $ 为割点；
7. 对于根节点，如果它有两个或更多的子节点，则它为割点。

### 解释

> 对于根节点，如果它有两个或更多的子节点，则它为割点。

显然，根是两棵子树上节点的唯一连通方式。

> 对于一个搜索树上的非根节点 $ u $，如果存在子节点 $ v $，满足 $ \mathrm{low}(v) \geq \mathrm{dfn}(u) $，则 $ u $ 为割点；

$ \mathrm{low}(v) \geq \mathrm{dfn}(u) $ 的意义是，$ v $ 向上无法到达 $ u $ 的父节点。

### 模板

递归（CodeVS 5524）：

更新于 2016 年 12 月 29 日。


```cpp
#include <cstdio>
#include <algorithm>

const int MAXN = 20000;

struct Node
{
    struct Edge *firstEdge;
    Node *fa;
    int dfn, low;
    bool vis, isCut;
} N[MAXN + 1];

struct Edge
{
    Node *from, *to;
    Edge *next;

    Edge(Node *from, Node *to) : from(from), to(to), next(from->firstEdge) {}
};

inline void addEdge(int s, int t)
{
    N[s].firstEdge = new Edge(&N[s], &N[t]);
    N[t].firstEdge = new Edge(&N[t], &N[s]);
}

inline int tarjan(Node *v)
{
    static int ts = 0;
    v->dfn = v->low = ++ts;
    v->vis = true;

    int res = 0, childCnt = 0;
    for (Edge *e = v->firstEdge; e; e = e->next)
    {
        if (!e->to->vis)
        {
            e->to->fa = v;
            res += tarjan(e->to);
            v->low = std::min(v->low, e->to->low);

            if (v->fa)
            {
                // 某个子节点能到达的最高点不高于 v
                if (e->to->low >= v->dfn) v->isCut = true;
            }
            else
            {
                // 不是搜索树的根
                // 有两个以上的子树
                if (++childCnt == 2) v->isCut = true;
            }
        }
        else
        {
            // 无向图 DFS 树没有横叉边，所有非树边均为返祖边
            v->low = std::min(v->low, e->to->dfn);
        }
    }

    if (v->isCut) res++;

    return res;
}

int main()
{
    int n, m;
    scanf("%d %d", &n, &m);
    while (m--)
    {
        int u, v;
        scanf("%d %d", &u, &v);
        addEdge(u, v);
    }

    int ans = 0;
    for (int i = 1; i <= n; i++)
    {
        if (!N[i].vis) ans += tarjan(&N[i]);
    }

    printf("%d\n", ans);

    for (int i = 1; i <= n; i++)
    {
        for (Edge *&e = N[i].firstEdge, *next; e; next = e->next, delete e, e = next);
        N[i].vis = N[i].isCut = false;
        N[i].dfn = N[i].low = 0;
        N[i].fa = NULL;
    }

    return 0;
}
```

非递归：

```cpp
struct Node {
    struct Edge *e, *c;
    Node *p;
    int dfn, low;
    bool v, pushed, flag;
} N[MAXN];

struct Edge {
    Node *s, *t;
    Edge *next;

    Edge(Node *s, Node *t) : s(s), t(t), next(s->e) {}
};

inline void addEdge(const int s, const int t) {
    N[s].e = new Edge(&N[s], &N[t]);
    N[t].e = new Edge(&N[t], &N[s]);
}

int n;

inline int tarjan() {
    int ts = 0, cnt = 0;
    for (int i = 0; i < n; i++) {
        if (N[i].v) continue;
        std::stack<Node *> s;
        s.push(&N[i]);
        N[i].pushed = true;

        while (!s.empty()) {
            Node *v = s.top();
            if (!v->v) {
                v->v = true;
                v->c = v->e;
                v->low = v->dfn = ++ts;
            }

            if (v->c) {
                Edge *&e = v->c;
                if (e->t->v) v->low = std::min(v->low, e->t->dfn);
                else if (!e->t->pushed) e->t->pushed = true, s.push(e->t), e->t->p = v;
                e = e->next;
            } else {
                if (v != &N[i]) for (Edge *e = v->e; e; e = e->next) if (e->t->low >= v->dfn && e->t->p == v) {
                    v->flag = true;
                    break;
                }

                if (v->flag) cnt++;

                if (v->p) v->p->low = std::min(v->p->low, v->low);

                s.pop();
            }
        }

        int cnt = 0;
        for (Edge *e = N[i].e; e; e = e->next) if (e->t->p == &N[i]) cnt++;
        N[i].flag = cnt >= 2;
    }

    return cnt;
}
```