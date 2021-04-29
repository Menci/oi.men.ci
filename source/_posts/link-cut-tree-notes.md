title: Link-Cut Tree 学习笔记
categories:
  - OI
tags:
  - Link-Cut Tree
  - Splay
  - 动态树
  - 数据结构
  - 算法模板
  - 高级数据结构
permalink: link-cut-tree-notes
date: '2016-01-19 20:50:40'
---

Link-Cut Tree 是一种用来维护动态森林连通性的数据结构，适用于动态树问题。它采用类似树链剖分的轻重边路径剖分，把树边分为实边和虚边，并用 Splay 来维护每一条实路径。Link-Cut Tree 的基本操作复杂度为均摊 $O({\log}n)$，但常数因子较大，一般效率会低于树链剖分。

<!-- more -->

### 定义

一棵 Link-Cut Tree 上的边分为两种：实边和虚边。每一种边都是有向的，由子节点指向父节点。首尾相连的实边组成的不可延伸的链叫做路径。路径中**深度最大**的节点称为路径头部，**深度最小**的节点称为路径尾部。

将每一条路径上的节点按照深度排序，得到一个序列，用 Splay 来维护这个序列。

每一条链对应着一棵 Splay，每棵 Splay 的根节点有一个成员 `Path Parent`，表示该 Splay 维护的路径的尾部的节点的**父节点**，整棵树的根节点所对应的 Splay 节点的 `Path Parent` 为空；其他节点（不是其所在 Splay 的根节点的节点）的 `Path Parent` 也为空。

`value` 用于维护点权，`sum` 和 `max` 是根据题目要求维护的链上的区间信息。`reversed` 表示以该节点为根的 Splay 有没有被翻转。

```cpp
struct Node {
    Node *child[2], *parent, *pathParent;
    T value, sum, max;
    bool reversed;
}
```

### 操作

Link-Cut Tree 支持以下几种基本操作：

1. `Access(u)`，“访问”某个节点 `u`，被“访问”过的节点会与根节点之间以路径相连，并且该节点为路径头部（最下端）；
2. `Evert(u)`，将某个节点 `u` 置为其所在树的根节点，该操作等价于把该节点到根节点所经过的所有边方向取反；
3. `Link(u, v)`，将某两个节点 `u` 和 `v` 连接，执行操作后 `u` 成为 `v` 的父节点；
4. `Cut(u, v)`，将某两个节点 `u` 和 `v` 分离，执行操作后 `v` 及其子节点组成单独的一棵树；
5. `FindRoot(u)`，查找某个节点 `u` 所在树的根节点；
6. `MakeTree()`，向森林中种植一棵新的树。

### `Access` 操作

#### `Expose` 操作

在实现 `Access` 操作前，我们先来实现 `Expose` 操作，它的作用是将当前节点置为其所在路径的头部节点，即切断自该节点向下的部分路径。

1. 将该节点 `Splay` 到其所在 Splay 的根节点；
2. 如果该节点有右孩子，那么断开其与其右孩子的连接。

不要忘了各种标记的下放和值的维护。

```cpp
void expose() {
    splay();
    pushDown();
    if (child[R]) {
        child[R]->parent = NULL;
        child[R]->pathParent = this;
        child[R] = NULL;
        maintain();
    }
}
```

#### `Splice` 操作

接下来，我们来实现 `Splice` 操作，它的作用是将**当前节点**所在的路径与**其尾部节点的父节点**所在的路径合并，即实现了路径的向上延长。

1. 将该节点 `Splay` 到其所在 Splay 的根节点；
2. 如果该节点没有 `Path Parent`，那么说明该节点所在路径中包含根节点，即 `Splice` 操作失败。
3. 对该节点的 `Path Parent` 执行 `Expose` 操作，将其原有的路径断开；
4. 将该节点连接到其 `Path Parent` 的右孩子上，并将 `Path Parent` 置为空。

```cpp
bool splice() {
    splay();
    if (!pathParent) return false;

    pathParent->expose();
    pathParent->child[R] = this;
    parent = pathParent;
    pathParent = NULL;
    parent->maintain();

    return true;
}
```

#### `Access` 操作

有了 `Expose` 和 `Splice`，`Access` 就简单多了，`Expose` 后执行 `Splice` 直到失败即可。

```cpp
void access() {
    expose();
    while (splice());
}
```

### `Evert` 操作

首先执行 `Access`，将该节点与根节点之间用一条完整的路径连接，然后翻转这条路径即可。

```cpp
void evert() {
    access();
    splay();
    reversed ^= 1;
}
```

### `Link` 操作

将节点 `v` 置为其所在树的根，然后将其 `Path Parent` 置为节点 `u` 即可。

```cpp
void link(int u, int v) {
    nodes[v - 1]->evert();
    nodes[v - 1]->pathParent = nodes[u - 1];
}
```

### `Cut` 操作

`Cut` 操作稍微复杂一点：

1. 将节点 `u` 置为其所在树的根节点，以保证 `v` 是 `u` 的子节点；
2. 对 `v` 执行 `Access` 操作，将 `v` 与 `u` 之间用一条完整的路径连接；
3. 对 `v` 执行 `Splay` 操作，将 `v` 置于**其所在 Splay 的根节点**；
4. 将 `v` 与其左子树分离，即将路径断开。

```cpp
void cut(int u, int v) {
    nodes[u - 1]->evert();
    nodes[v - 1]->access();
    nodes[v - 1]->splay();
    nodes[v - 1]->pushDown();
    nodes[v - 1]->child[L]->parent = NULL;
    nodes[v - 1]->child[L] = NULL;
    nodes[v - 1]->maintain();
}
```

### `Query` 和 `Update` 操作

以 `QueryMax(u, v)` 查询两个点之间的点权最大值为例。首先在 `Node` 结构体中存储 `max` 成员，并在 `Maintain()` 中维护它。

首先，如果需要查询某个点到根节点之间的点权最大值，只需先访问这个节点，即 `Access(u)`，然后对该节点执行 `Splay` 操作，将其置为其所在 Splay 的根节点，此时 `u` 的 `max` 存储的值即为 `u` 到其所在树的根节点的路径上的点权最大值。

如果要查询任意两点间的点权最大值，只需要先对其中一个节点执行 `Evert` 操作，将其置为树根，就可以转化为上述情况进行处理。

```cpp
const T &Node::queryMax() {
    access();
    splay();
    return max;
}

const T &queryMax(int u, int v) {
    nodes[u - 1]->evert();
    return nodes[v - 1]->queryMax();
}
```

要修改某个点的点权值，只需要对该节点执行 `Splay` 操作，将其置为其所在 Splay 的根节点，然后直接修改即可，这样可以避免修改时标记的向上传递。

```cpp
void update(int u, const T &value) {
    nodes[u - 1]->splay();
    nodes[u - 1]->value = value;
    nodes[u - 1]->maintain();
}
```

### `MakeTree` 操作

直接新建节点就可以。

```cpp
void makeTree(int u, const T &value) {
    nodes[u - 1] = new Node(value);
}
```

### 其他操作 & 注意事项

1. 进行 `Splay` 和 `Rotate` 时，要注意标记的传递；
2. `Rotate` 时，需要将自己的 `Path Parent` 与父节点的 `Path Parent` 互换，以保证 `Path Parent` 成员的有效值总在一棵 Splay 的根节点上。

```cpp
void pushDown() {
    if (reversed) {
        std::swap(child[L], child[R]);
        if (child[L]) child[L]->reversed ^= 1;
        if (child[R]) child[R]->reversed ^= 1;
        reversed = false;
    }
}

void maintain() {
    sum = value;
    if (child[L]) sum += child[L]->sum;
    if (child[R]) sum += child[R]->sum;

    max = value;
    if (child[L]) max = std::max(max, child[L]->max);
    if (child[R]) max = std::max(max, child[R]->max);
}

void rotate() {
    if (parent->parent) parent->parent->pushDown();
    parent->pushDown(), pushDown();
    std::swap(pathParent, parent->pathParent);

    Relation x = relation();
    Node *oldParent = parent;

    if (oldParent->parent) oldParent->parent->child[oldParent->relation()] = this;
    parent = oldParent->parent;

    oldParent->child[x] = child[x ^ 1];
    if (child[x ^ 1]) child[x ^ 1]->parent = oldParent;

    child[x ^ 1] = oldParent;
    oldParent->parent = this;

    oldParent->maintain(), maintain();
}

void splay() {
    while (parent) {
        if (!parent->parent) rotate();
        else {
            parent->parent->pushDown(), parent->pushDown();
            if (relation() == parent->relation()) parent->rotate(), rotate();
            else rotate(), rotate();
        }
    }
}
```

### 完整代码（树的统计）

```cpp
#include <cstdio>
#include <climits>
#include <algorithm>

const int MAXN = 30000;

void print(void *p);

template <typename T>
struct LinkCutTree {
    enum Relation {
        L = 0, R = 1
    };

    struct Node {
        Node *child[2], *parent, *pathParent;
        T value, sum, max;
        bool reversed;

        Node(const T &value) : reversed(false), value(value), sum(value), max(value), parent(NULL), pathParent(NULL) {
            child[L] = child[R] = NULL;
        }

        Relation relation() {
            return this == parent->child[L] ? L : R;
        }

        void pushDown() {
            if (reversed) {
                std::swap(child[L], child[R]);
                if (child[L]) child[L]->reversed ^= 1;
                if (child[R]) child[R]->reversed ^= 1;
                reversed = false;
            }
        }

        void maintain() {
            sum = value;
            if (child[L]) sum += child[L]->sum;
            if (child[R]) sum += child[R]->sum;

            max = value;
            if (child[L]) max = std::max(max, child[L]->max);
            if (child[R]) max = std::max(max, child[R]->max);
        }

        void rotate() {
            if (parent->parent) parent->parent->pushDown();
            parent->pushDown(), pushDown();
            std::swap(pathParent, parent->pathParent);

            Relation x = relation();
            Node *oldParent = parent;

            if (oldParent->parent) oldParent->parent->child[oldParent->relation()] = this;
            parent = oldParent->parent;

            oldParent->child[x] = child[x ^ 1];
            if (child[x ^ 1]) child[x ^ 1]->parent = oldParent;

            child[x ^ 1] = oldParent;
            oldParent->parent = this;

            oldParent->maintain(), maintain();
        }

        void splay() {
            while (parent) {
                if (!parent->parent) rotate();
                else {
                    parent->parent->pushDown(), parent->pushDown();
                    if (relation() == parent->relation()) parent->rotate(), rotate();
                    else rotate(), rotate();
                }
            }
        }

        void evert() {
            access();
            splay();
            reversed ^= 1;
        }

        void expose() {
            splay();
            pushDown();
            if (child[R]) {
                child[R]->parent = NULL;
                child[R]->pathParent = this;
                child[R] = NULL;
                maintain();
            }
        }

        bool splice() {
            splay();
            if (!pathParent) return false;

            pathParent->expose();
            pathParent->child[R] = this;
            parent = pathParent;
            pathParent = NULL;
            parent->maintain();

            return true;
        }

        void access() {
            expose();
            while (splice());
        }

        const T &querySum() {
            access();
            splay();
            return sum;
        }

        const T &queryMax() {
            access();
            splay();
            return max;
        }
    };

    Node *nodes[MAXN];

    void makeTree(int u, const T &value) {
        nodes[u - 1] = new Node(value);
    }

    void link(int u, int v) {
        nodes[v - 1]->evert();
        nodes[v - 1]->pathParent = nodes[u - 1];
    }

    void cut(int u, int v) {
        nodes[u - 1]->evert();
        nodes[v - 1]->access();
        nodes[v - 1]->splay();
        nodes[v - 1]->pushDown();
        nodes[v - 1]->child[L]->parent = NULL;
        nodes[v - 1]->child[L] = NULL;
        nodes[v - 1]->maintain();
    }

    const T &querySum(int u, int v) {
        nodes[u - 1]->evert();
        return nodes[v - 1]->querySum();
    }

    const T &queryMax(int u, int v) {
        nodes[u - 1]->evert();
        return nodes[v - 1]->queryMax();
    }

    void update(int u, const T &value) {
        nodes[u - 1]->splay();
        nodes[u - 1]->value = value;
        nodes[u - 1]->maintain();
    }
};

struct UndirectedEdge {
    int u, v;

    UndirectedEdge() {}

    UndirectedEdge(int u, int v) : u(u), v(v) {}
} edges[MAXN - 1];

int n, q;
LinkCutTree<int> lct;

void dfs(LinkCutTree<int>::Node *v, int depth) {
    if (!v) return;
    dfs(v->child[LinkCutTree<int>::L], depth + 1);
    for (int i = 0; i < depth; i++) putchar(' ');
    printf("%d, max = %d, sum = %d\n", v->value, v->max, v->sum);
    dfs(v->child[LinkCutTree<int>::R], depth + 1);
}

void print(void *p) {
    dfs((LinkCutTree<int>::Node *)p, 0);
}

int main() {
    scanf("%d", &n);

    for (int i = 0; i < n - 1; i++) {
        int u, v;
        scanf("%d %d", &u, &v);
        edges[i] = UndirectedEdge(u, v);
    }

    for (int i = 1; i <= n; i++) {
        int value;
        scanf("%d", &value);
        lct.makeTree(i, value);
    }

    for (int i = 0; i < n - 1; i++) {
        lct.link(edges[i].u, edges[i].v);
    }

    scanf("%d", &q);

    for (int i = 0; i < q; i++) {
        char str[6 + 1];
        scanf("%s", str);
        if (str[1] == 'H') {
            int u, t;
            scanf("%d %d", &u, &t);
            lct.update(u, t);
        } else if (str[1] == 'M') {
            int u, v;
            scanf("%d %d", &u, &v);
            printf("%d\n", lct.queryMax(u, v));
        } else if (str[1] == 'S') {
            int u, v;
            scanf("%d %d", &u, &v);
            printf("%d\n", lct.querySum(u, v));
        }
    }

    return 0;
}
```