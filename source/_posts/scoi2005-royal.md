title: 「SCOI2005」王室联邦 - 树分块
categories:
  - OI
tags:
  - BZOJ
  - SCOI
  - 分块
  - 数据结构
  - 树分块
permalink: scoi2005-royal
date: '2016-12-30 11:10:00'
---

他想把他的国家划分成若干个省，每个省都由他们王室联邦的一个成员来管理。他的国家有 $ n $ 个城市，编号为 $ 1 \ldots n $。一些城市之间有道路相连，任意两个不同的城市之间有且仅有一条直接或间接的道路。

每个省至少要有 $ B $ 个城市，最多只有 $ 3B $ 个城市。

每个省必须有一个省会，这个省会可以位于省内，也可以在该省外。但是该省的任意一个城市到达省会所经过的道路上的城市（除了最后一个城市，即该省省会）都必须属于该省。

一个城市可以作为多个省的省会。

<!-- more -->

### 链接

[BZOJ 1086](http://www.lydsy.com/JudgeOnline/problem.php?id=1086)

### 题解

DFS 整棵树，处理每个节点时，将其一部分子节点分块，将未被分块的子节点返回。

枚举 $ u $ 每个子节点 $ v $，递归处理子树后将每个子节点返回的未被分块的节点（下文有解释）累加到集合 $ S $ 中，一但累加的数量达到 $ B $，就把集合 $ S $ 中的点作为一个新的块，并将当前节点 $ u $ 作为该块的「省会」，然后清空 $ S $ 继续枚举下一棵子树。

处理完所有子树后，将 $ u $ 自身也加入集合 $ S $，此时剩余在集合 $ S $ 中的节点为「未被分块的节点」，这些节点被返回到上一层。显然，$ S $ 大小最大为 $ B $（$ B - 1 $ 个子树上的节点加上 $ u $ 本身）。

即，使用上述分块方法，整棵树 DFS 完成时，每个块的大小最大为 $ 2B - 1 $。

DFS 完成整棵树后，剩余在集合 $ S $ 中的点最多有 $ B $ 个，将这些点加入到最后一个块（DFS 根节点时创建的最后一个块）中，这个块的大小最大为 $ 3B - 1 $。

集合 $ S $ 可以用一个栈来维护，用**进入节点时的栈顶**到**当前栈顶**之间的元素表示集合 $ S $。

### 代码

```cpp
#include <cstdio>
#include <stack>

const int MAXN = 1000;

struct Node {
    struct Edge *e;
    struct Block *block;
} N[MAXN + 1];

struct Edge {
    Node *s, *t;
    Edge *next;

    Edge(Node *s, Node *t) : s(s), t(t), next(s->e) {}
};

struct Block {
    Node *top;
} blocks[MAXN + 1];

inline void addEdge(int s, int t) {
    N[s].e = new Edge(&N[s], &N[t]);
    N[t].e = new Edge(&N[t], &N[s]);
}

int n, b, blockCount;
std::stack<Node *> s;

inline void dfs(Node *v, Node *fa) {
    size_t status = s.size();

    for (Edge *e = v->e; e; e = e->next) {
        if (e->t != fa) {
            dfs(e->t, v);

            if (int(s.size() - status) >= b) {
                blocks[++blockCount].top = v;
                while (s.size() != status) {
                    Node *u = s.top();
                    s.pop();
                    u->block = &blocks[blockCount];
                }
            }
        }
    }

    s.push(v);
}

inline void solve() {
    dfs(&N[1], NULL);
    while (!s.empty()) {
        Node *u = s.top();
        s.pop();
        u->block = &blocks[blockCount];
    }
}

int main() {
    scanf("%d %d", &n, &b);
    for (int i = 1; i <= n - 1; i++) {
        int u, v;
        scanf("%d %d", &u, &v);
        addEdge(u, v);
    }

    solve();

    printf("%d\n", blockCount);
    for (int i = 1; i <= n; i++) printf("%lu%c", N[i].block - blocks, i == n ? '\n' : ' ');
    for (int i = 1; i <= blockCount; i++) printf("%lu%c", blocks[i].top - N, i == blockCount ? '\n' : ' ');

    return 0;
}
```