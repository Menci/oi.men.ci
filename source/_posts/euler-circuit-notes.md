title: 欧拉回路学习笔记
categories:
  - OI
tags:
  - 图论
  - 学习笔记
  - 欧拉回路
  - 算法模板
permalink: euler-circuit-notes
date: '2017-01-01 11:09:00'
---

若图 $ G $ 中存在这样一个环，使得 $ G $ 中每条边都恰好在环上出现一次，则称为欧拉回路。

具有欧拉回路的图称为欧拉图。

<!-- more -->

### 欧拉图的判定

一个无向图是欧拉图，当且仅当该图所有节点度均为偶数，且除孤立点（度为零的点）外是连通图。

一个有向图是欧拉图，当且仅当该图所有节点入度等于出度，且除孤立点（度为零的点）外是连通图。

### 求欧拉回路

从一个非孤立点开始 DFS，点可以重复经过，每次任意走一条边并将这条边从邻接表中删除（如果是无向图，其反向边也要被标记为删除），最终所有边一定会都会被经过。

DFS 回溯时记录每一条边，最终将记录的逆序即为欧拉回路。

### 代码（[UOJ #117](http://uoj.ac/problem/117)）


```cpp
#include <cstdio>
#include <cassert>
#include <vector>
#include <algorithm>

const int MAXN = 1e5;

struct Node
{
    struct Edge *e;
    int deg; // 无向图
    int inDeg, outDeg; // 有向图
} N[MAXN + 1];

struct Edge
{
    int id;
    Node *s, *t;
    bool vis;
    Edge *next, *revEdge;

    Edge(int id, Node *s, Node *t) : id(id), s(s), t(t), vis(false), next(s->e) {}
};

int T;

inline void addEdge(int id, int s, int t)
{
    Edge *e1 = N[s].e = new Edge(id, &N[s], &N[t]);

    if (T == 1)
    {
        Edge *e2 = N[t].e = new Edge(-id, &N[t], &N[s]);

        e1->revEdge = e2;
        e2->revEdge = e1;

        // 因为有自环，不能简单地 N[s]->firstEdge->revEdge = N[t].e，此时正向边已经不是 firstEdge 了

        N[s].deg++;
        N[t].deg++;
    }
    else
    {
        N[s].outDeg++;
        N[t].inDeg++;
    }
}

std::vector<Edge *> path;

// 无向图
inline void dfs1(Node *v)
{
    while (v->e)
    {
        Edge *e = v->e;
        v->e = v->e->next; // 从邻接表中删边，但实际上未释放内存

        if (e->vis) continue; // 如果它的反向边被删掉了，它的 vis 会被赋值为 true

        e->revEdge->vis = true; // 标记反向边已被访问

        dfs1(e->t);

        path.push_back(e);
    }
}

// 有向图
inline void dfs2(Node *v)
{
    while (v->e)
    {
        Edge *e = v->e;
        v->e = v->e->next; // 从邻接表中删边，但实际上未释放内存

        dfs2(e->t);

        path.push_back(e);
    }
}

int main()
{
    scanf("%d", &T);

    int n, m;
    scanf("%d %d", &n, &m);
    for (int i = 1; i <= m; i++)
    {
        int u, v;
        scanf("%d %d", &u, &v);

        addEdge(i, u, v); // 带编号加边
    }

    int haveAns = true;
    if (T == 1)
    {
        for (int i = 1; i <= n; i++)
        {
            if (N[i].deg % 2 == 1) // 度为奇数
            {
                haveAns = false;
                break;
            }
        }
    }
    else
    {
        for (int i = 1; i <= n; i++)
        {
            if (N[i].inDeg != N[i].outDeg) // 入度不等于出度
            {
                haveAns = false;
                break;
            }
        }
    }

    if (!haveAns) puts("NO");
    else
    {
        if (T == 1)
        {
            for (int i = 1; i <= n; i++)
            {
                if (N[i].deg) // 从一个非孤立点开始搜
                {
                    dfs1(&N[i]);
                    break;
                }
            }
        }
        else
        {
            for (int i = 1; i <= n; i++)
            {
                if (N[i].outDeg) // 从一个非孤立点开始搜
                {
                    dfs2(&N[i]);
                    break;
                }
            }
        }

        if (path.size() != m) // 如果不能经过所有边
        {
            puts("NO");
        }
        else
        {
            puts("YES");
            for (int i = path.size() - 1; i >= 0; i--)
            {
                printf("%d%c", path[i]->id, i == 0 ? '\n' : ' ');
            }
        }
    }

    return 0;
}
```
