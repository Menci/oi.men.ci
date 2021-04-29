title: 「APIO2012」Dispatching - 左偏树
categories:
  - OI
tags:
  - APIO
  - BZOJ
  - 左偏树
  - 数据结构
permalink: apio2012-dispatching
date: '2017-01-04 11:33:00'
---

给定一棵 $ n $ 个点的有根树，每个点有两个属性 $ C_i $ 与 $ L_i $，现在你要指定一个点 $ R $，并在 $ R $ 的子树内选取若干点（可以选取 $ R $ 自己），使得这些点的 $ C_i $ 的和不超过 $ M $，而一个选取方案的价值为选取人数 $ \times L_R $，求选取方案的最大价值。

<!-- more -->

### 链接

[BZOJ 2809](http://www.lydsy.com/JudgeOnline/problem.php?id=2809)

### 题解

坑。

### 代码


```cpp
#include <cstdio>
#include <queue>

const int MAXN = 100000;

struct LeftTree
{
    LeftTree *lc, *rc;
    long long dist, sum, x, size;

    LeftTree(long long x) : lc(NULL), rc(NULL), dist(0), sum(x), x(x), size(1) {}

    // 维护 size 和 sum
    void maintain()
    {
        size = (lc ? lc->size : 0) + (rc ? rc->size : 0) + 1;
        sum = (lc ? lc->sum : 0) + (rc ? rc->sum : 0) + x;
    }

    // 合并 a、b 两棵左偏树，将 a 作为根返回
    static LeftTree *merge(LeftTree *a, LeftTree *b)
    {
        if (!a) return b;
        if (!b) return a;
        if (a->x < b->x) std::swap(a, b); // 保证根 >= 儿子

        // 递归合并右子树
        a->rc = merge(a->rc, b);

        // 如果右儿子距离更大了，需要交换左右儿子
        if (!a->lc || a->lc->dist < a->rc->dist) std::swap(a->lc, a->rc);

        // 计算新根的距离
        a->dist = a->rc ? a->rc->dist + 1 : 0;
        a->maintain();

        return a;
    }
};

struct Node
{
    struct Edge *e;
    long long c, l;
    LeftTree *lt;
} N[MAXN + 1], *seq[MAXN + 1]; // 记录 BFS 序

struct Edge
{
    Node *s, *t;
    Edge *next;

    Edge(Node *s, Node *t) : s(s), t(t), next(s->e) {}
};

inline void addEdge(int s, int t)
{
    N[s].e = new Edge(&N[s], &N[t]);
}

inline void bfs()
{
    std::queue<Node *> q;
    q.push(&N[1]);

    int cnt = 0;
    while (!q.empty()) {
        Node *v = q.front();
        q.pop();

        // 记录 BFS 序
        seq[++cnt] = v;

        for (Edge *e = v->e; e; e = e->next)
        {
            q.push(e->t);
        }
    }
}

int main()
{
    int n;
    long long m;
    scanf("%d %lld", &n, &m);

    for (int i = 1; i <= n; i++)
    {
        int fa;
        scanf("%d", &fa);
        if (fa) addEdge(fa, i);

        scanf("%lld %lld", &N[i].c, &N[i].l);

        // 创建左偏树
        N[i].lt = new LeftTree(N[i].c);
    }

    bfs();

    long long ans = 0;
    for (int i = n; i >= 1; i--)
    {
        Node *v = seq[i];

        // 将所有子节点加入
        for (Edge *e = v->e; e; e = e->next)
        {
            v->lt = LeftTree::merge(v->lt, e->t->lt);
        }

        // 删除最大的节点，直到总和 <= M
        while (v->lt->sum > m) v->lt = LeftTree::merge(v->lt->lc, v->lt->rc);

        ans = std::max(ans, v->lt->size * v->l);
    }

    printf("%lld\n", ans);

    return 0;
}
```