title: 「CTSC1997」选课 - 树形 DP
categories:
  - OI
tags:
  - CTSC
  - CodeVS
  - DP
  - 树形 DP
permalink: ctsc1997-course
date: '2016-01-07 05:12:01'
---

学校开设了 N（<= 300）门课程，每门课程有不同的学分，每个学生最多可以选择 M 门课程，有些课程有“先修课”，即这门课必须在先修课选定之后再选，每门课程的先修课最多有一门。求获得学分最多的选课方案。

<!-- more -->

### 链接

[CodeVS 1378](http://codevs.cn/problem/1378/)

### 题解

很显然，这里的依赖关系是以森林的形式给出的，我们增加一个虚拟节点作为所有无先修课的课程的父节点，搜索这棵树，用 $f[i][m]$ 表示选择第 `i` 个节点及其之后节点（兄弟或孩子）中的 `m` 个节点所对应的课程所获得的最大学分，则有两个转移方向：

1. 给第 `i` 个节点和它的**一个或多个子节点**分配一定的课程数量 `k`，剩余课程数量 `m - k - 1` 分给**下一个兄弟节点**。
2. 不选择第 `i` 个节点，全部课程数量 `m` 分配给**下一个兄弟节点**。

$$f[i][m]={\max}( {\max}\{ f[i.children][k] + f[i.next][m-k-1],k{\in}[0,m-1] \},f[i.next][m] )$$

树结构储存时使用类似邻接表的结构，储存当前节点的第一个孩子节点，和下一个兄弟节点。

```cpp
struct Tree {
    Tree *children, *next;
    int w;

    struct Answer {
        bool solved;
        int value;

        inline Answer() : solved(false) {}
    } ans[MAXM + 1];

    inline Tree() {}
    inline Tree(Tree *parent, int w) : w(w), next(parent->children) {}
} trees[MAXN + 1];
```

### 代码

```cpp
#include <cstdio>
#include <algorithm>

const int MAXN = 300;
const int MAXM = 300;

struct Tree {
    Tree *children, *next;
    int w;

    struct Answer {
        bool solved;
        int value;

        inline Answer() : solved(false) {}
    } ans[MAXM + 1];

    inline Tree() {}
    inline Tree(Tree *parent, int w) : w(w), next(parent->children) {}
} trees[MAXN + 1];

int n, m;

inline void addTree(int parent, int child, int w) {
    trees[parent].children = new (&trees[child]) Tree(&trees[parent], w);
}

int solve(Tree *t, int m) {
    if (!t || m < 0) return 0;

    if (!t->ans[m].solved) {
        t->ans[m].value = 0;
        for (int i = 0; i < m; i++) {
            t->ans[m].value = std::max(t->ans[m].value, solve(t->children, i) + solve(t->next, m - i - 1) + t->w);
        }
        t->ans[m].value = std::max(t->ans[m].value, solve(t->next, m));

        t->ans[m].solved = true;
    }

    return t->ans[m].value;
}

int main() {
    scanf("%d %d", &n, &m);

    for (int i = 1; i <= n; i++) {
        int parent, w;
        scanf("%d %d", &parent, &w);
        addTree(parent, i, w);
    }

    printf("%d\n", solve(&trees[0], m + 1));

    return 0;
}
```