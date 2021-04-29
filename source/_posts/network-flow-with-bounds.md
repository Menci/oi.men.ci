title: 上下界网络流学习笔记
categories:
  - OI
tags:
  - OI
  - 学习笔记
  - 算法模板
  - 网络流
permalink: network-flow-with-bounds
date: '2017-01-16 16:45:00'
---

在普通的网络流问题中，给定单一的源点与汇点，每条边有流量上界（容量），在其它所有点满足流量平衡条件，且流出 $ s $ 的流量等于流入 $ t $ 的流量的前提下，求 $ s $ 到 $ t $ 的最大流。而有一类网络流问题，每条边不仅有流量上界，还有流量下界，这类问题需要转化求解。

<!-- more -->

### 无源汇可行流

> 给定 $ n $ 个点、$ m $ 条边，每条边 $ e $ 从 $ \text{from}(e) $ 指向 $ \text{to}(e) $，它的的流量必须在 $ [\text{lower}(e), \text{upper}(e)] $ 内，没有源点与汇点，要求所有点满足流量平衡条件，判断是否有解，并求一组可行解。

#### 初步转化

为了转化问题，我们添加一个超级源点 $ S $ 和超级汇点 $ T $。

考虑一条边 $ e $，它的流量至少要为 $ \text{lower}(e) $，即无论如何，$ \text{from}(e) $ 至少要流出 $ \text{lower}(e) $ 的流量，而 $ \text{to}(e) $ 至少要流入 $ \text{lower}(e) $ —— 为了满足这个下界，我们从超级源点 $ S $ 向 $ \text{to}(e) $ 连一条容量为 $ \text{lower}(e) $ 的边，从 $ \text{from}(e) $ 向超级汇点 $ T $ 连一条容量为 $ \text{lower}(e) $ 的边。现在这条边的下界已经满足，而又因为它的上界为 $ \text{upper}(e) $，所以它有 $ \text{upper(e)} - \text{lower}(e) $ 的流量是「可流可不流」的，这部分流量被称为**自由流**。即，从 $ \text{from}(e) $ 向 $ \text{to}(e) $ 连一条容量为 $ \text{upper(e)} - \text{lower}(e) $ 的边。

总结一下，对于一条边 $ e $，转化为以下三类边：

1. 从超级源点 $ S $ 到 $ \text{to}(e) $，容量为 $ \text{lower}(e) $，为了使 $ \text{to}(e) $ 一定有 $ \text{lower}(e) $ 的流量流入；
2. 从 $ \text{from}(e) $ 到超级汇点 $ T $，容量为 $ \text{lower}(e) $，为了使 $ \text{from}(e) $ 一定有 $ \text{lower}(e) $ 的流量流出；
3. 从 $ \text{from}(e) $ 到 $ \text{to}(e) $，容量为 $ \text{upper}(e) - \text{lower}(e) $。

![初步转化](network-flow-with-bounds/1.svg)

求出转化后的图中 $ S $ 到 $ T $ 的最大流，如果从 $ S $ 出发的边全部满流，则说明所有边的下界均已满足，即原问题有解。所有转化后的容量为原边自由流的边（上述第三类边）的流量加上其各自的流量下界即为一组解。

#### 第二步转化

考虑到转化后的图中，可能会有这种情况

![第二步转化](network-flow-with-bounds/2.svg)

对于某个点 $ v $，在转化的过程中，有一条边（或多条边的和）由 $ S $ 连向 $ v $，容量为 $ x $；另一条边（或多条边的和）由 $ v $ 连向 $ T $，容量为 $ y $。

假设 $ x < y $，我们可以用一条由 $ v $ 连向 $ T $ 的容量为 $ y - x $ 的边代替，因为从 $ S $ 到 $ T $ 的最大流显然至少要流 $ x $ 的流量。

同理，如果 $ x > y $，我们可以用一条由 $ S $ 连向 $ v $ 的容量为 $ x - y $ 的边代替。

所有，对于 $ S $ 到 $ v $ 或者 $ v $ 到 $ T $ 的多条重复的边，可以合并成一条。合并方法是，维护每个点需要额外流入的流量 $ \text{extra-in}(v) $ —— 对于原图中的每条边 $ e $，对 $ \text{extra-in}(\text{to}(e)) $ 增加 $ \text{lower}(e) $，对 $ \text{extra-in}(\text{from}(e)) $ 减少 $ \text{lower}(e) $。

对于每一个点 $ v $，如果 $ \text{extra-in}(v) > 0 $，说明 $ v $ 需要额外流入一些流量，才能满足与其相关的边的下界，即连一条由 $ S $ 到 $ v $ 的容量为 $ \text{extra-in}(v) $ 的边；否则，说明 $ v $ 需要额外流出一些流量，即连一条由 $ v $ 到 $ T $ 的容量为 $ -\text{extra-in}(v) $ 的边。

这样便完成了无源汇可行流的转化。

```cpp
struct Node
{
    struct Edge *firstEdge, *currEdge;
    int level, extraIn;
} N[MAXN + 2];

struct Edge
{
    Node *from, *to;
    int cap, flow, lower;
    Edge *next, *revEdge;

    Edge(Node *from, Node *to, int cap) : from(from), to(to), cap(cap), flow(0), lower(0), next(from->firstEdge) {}
};

inline Edge *addEdge(int from, int to, int lower, int upper)
{
    int cap = upper - lower;
    Edge *e = addEdge(from, to, cap);

    e->lower = lower;

    N[to].extraIn += lower;
    N[from].extraIn -= lower;

    return e;
}

inline bool solve(int n)
{
    int S = 0, T = n + 1;

    int sum = 0;
    for (int i = 1; i <= n; i++)
    {
        if (N[i].extraIn > 0)
        {
            addEdge(S, i, 0, N[i].extraIn);
            sum += N[i].extraIn; // 记录由 S 出发的边的容量总和
        }
        else if (N[i].extraIn < 0)
        {
            addEdge(i, T, 0, -N[i].extraIn);
        }
    }

    int flow = dinic(S, T, n + 2);
    if (flow < sum) return false; // 如果从 S 出发的边没有全部满流

    return true;
}
```

注意，求无源汇可行流时，$ S $ 到 $ T $ 的最大流的意义是，超级源点 $ S $ 向所有需要补充流量的节点实际补充的流量的总和，而**没有其它意义**。

### 有源汇可行流

> 给定 $ n $ 个点、$ m $ 条边，每条边 $ e $ 从 $ \text{from}(e) $ 指向 $ \text{to}(e) $，它的的流量必须在 $ [\text{lower}(e), \text{upper}(e)] $ 内，给定源点 $ s $ 与汇点 $ t $，要求除源汇点外所有点满足流量平衡条件，流出源点的流量等于流入汇点的流量，判断是否有解，并求一组可行解。

有源汇可行流可以看做无源汇可行流中加入两个特殊点 $ s $ 与 $ t $，且流出 $ s $ 的流量比如等于流入 $ t $ 的流量 —— 我们增加一条从 $ t $ 到 $ s $ 的容量为 $ +\infty $ 的边，使 $ s $ 与 $ t $ 也满足流量平衡条件，即可转化为无源汇可行流。

```cpp
inline bool flow(int s, int t, int n)
{
    int S = 0, T = n + 1;

    // 加一条 t 到 s 的容量为正无穷的边
    addEdge(t, s, INT_MAX);

    int sum = 0;
    for (int i = 1; i <= n; i++)
    {
        if (N[i].extraIn > 0)
        {
            addEdge(S, i, N[i].extraIn);
            sum += N[i].extraIn;
        }
        else if (N[i].extraIn < 0)
        {
            addEdge(i, T, -N[i].extraIn);
        }
    }

    return dinic(S, T, n + 2) == sum;
}
```

### 有源汇最大流

> 给定 $ n $ 个点、$ m $ 条边，每条边 $ e $ 从 $ \text{from}(e) $ 指向 $ \text{to}(e) $，它的的流量必须在 $ [\text{lower}(e), \text{upper}(e)] $ 内，给定源点 $ s $ 与汇点 $ t $，要求除源汇点外所有点满足流量平衡条件，流出源点的流量等于流入汇点的流量，判断是否有解，并求出 $ s $ 到 $ t $ 的最大流。

首先，使用有源汇可行流算法，判断是否有解。如果有解，残量网络的状态即为一组可行解。此时所有原图中边的下界均已满足，而这些下界的满足是由与超级源汇点 $ S $ 与 $ T $ 相连的边实现的。考虑直接从 $ s $ 向 $ t $ 增广 —— 因为 $ S $ 没有入边，并且 $ T $ 没有出边，所以 $ s $ 到 $ t $ 的增广路不可能经过 $ S $ 或 $ T $。并且 $ t $ 到 $ s $ 的边也不会影响增广。即，直接从 $ s $ 向 $ t $ 增广不会破坏已经满足的下界，且答案一定合法。

在求出可行流之后，直接在残量网络上求 $ s $ 到 $ t $ 的最大流即可。

```cpp
inline int flow(int s, int t, int n)
{
    addEdge(t, s, INT_MAX);

    int S = 0, T = n + 1;

    int sum = 0;
    for (int i = 1; i <= n; i++)
    {
        if (N[i].extraIn > 0)
        {
            addEdge(S, i, N[i].extraIn);
            sum += N[i].extraIn;
        }
        else if (N[i].extraIn < 0)
        {
            addEdge(i, T, -N[i].extraIn);
        }
    }

    // 求可行流，满足下界
    int flow = dinic(S, T, n + 2);
    if (flow < sum) return -1;

    // 直接增广得到最大流
    return dinic(s, t, n + 2);
}
```

### 有源汇最小流

> 给定 $ n $ 个点、$ m $ 条边，每条边 $ e $ 从 $ \text{from}(e) $ 指向 $ \text{to}(e) $，它的的流量必须在 $ [\text{lower}(e), \text{upper}(e)] $ 内，给定源点 $ s $ 与汇点 $ t $，要求除源汇点外所有点满足流量平衡条件，流出源点的流量等于流入汇点的流量，判断是否有解，并求出 $ s $ 到 $ t $ 的最小流。

类似最大流，首先也要求出可行流，并且得到 $ s $ 到 $ t $ 的流量，即求可行流时连接的从 $ t $ 到 $ s $ 的边的流量。

我们的最优化目标是使 $ s $ 到 $ t $ 的流量最小，即希望从可行流中尽量减去一些从 $ s $ 到 $ t $ 的流量，为了求出在满足流量平衡的情况下能减少的流量，我们从 $ t $ 向 $ s $ 增广，此时得到的 $ t $ 到 $ s $ 的最大流即为 $ s $ 到 $ t $ 的流量中能减去的最大的流量。

在求解可行流时，多加入的 $ t $ 到 $ s $ 的边会使 $ t $ 到 $ s $ 的最大流总是正无穷，我们必须删掉这条边，才能保证从 $ t $ 到 $ s $ 增广时只经过原图中的边。

```cpp
inline int flow(int s, int t, int n)
{
    Edge *e = addEdge(t, s, INT_MAX);

    int S = 0, T = n + 1;

    int sum = 0;
    for (int i = 1; i <= n; i++)
    {
        if (N[i].extraIn > 0)
        {
            addEdge(S, i, N[i].extraIn);
            sum += N[i].extraIn;
        }
        else if (N[i].extraIn < 0)
        {
            addEdge(i, T, -N[i].extraIn);
        }
    }

    // 求可行流，满足下界
    int flow = dinic(S, T, n + 2);
    if (flow < sum) return -1;

    int realFlow = e->flow;

    e->cap = e->revEdge->cap = 0; // 将容量置为零，相当于将边删除

    // 减去能退掉的流量
    return realFlow - dinic(t, s, n + 2);
}
```

### 总结

无源汇可行流是上下界网络流的基础，其它几种模型都需要转化为这种模型来求解。

求解有源汇上下界网络流时，常用 $ 1 \sim n $ 表示原图中的点，$ 0 $ 表示超级源点 $ S $，$ n + 1 $ 表示超级汇点 $ T $。如果原图中有 $ 0 $ 号点，则通常将所有点编号 $ +1 $。最终网络流建图的点编号仍是从 $ 0 $ 开始。