title: 「SDOI2008」洞穴勘测 - Link-Cut Tree
categories:
  - OI
tags:
  - BZOJ
  - CodeVS
  - Link-Cut Tree
  - SDOI
  - 动态树
  - 数据结构
  - 高级数据结构
permalink: sdoi2008-cave
date: '2016-03-15 20:06:34'
---

如果监测到洞穴 $ u $ 和洞穴 $ v $ 之间出现了一条通道，终端机上会显示一条指令 `Connect u v`；如果监测到洞穴 $ u $ 和洞穴 $ v $ 之间的通道被毁，终端机上会显示一条指令 `Destroy u v`。辉辉希望能随时通过终端机发出指令 `Query u v`，向监测仪询问此时洞穴 $ u $ 和洞穴 $ v $ 是否连通。已知在第一条指令显示之前，洞穴群中没有任何通道存在。

<!-- more -->

### 链接

[BZOJ 2049](http://www.lydsy.com/JudgeOnline/problem.php?id=2049)  
[CodeVS 1839](http://codevs.cn/problem/1839/)

### 题解

最简单的 Link-Cut Tree 模板题。

相当于能拆的并查集。

### 代码

```cpp
#include <cstdio>
#include <algorithm>

const int MAXN = 10000;
const int MAXM = 200000;

struct LinkCutTree {
    enum Relation {
        L = 0, R = 1
    };

    struct Node {
        Node *child[2], *parent, *pathParent;
        bool reversed;

        Node() : parent(NULL), pathParent(NULL), reversed(false) {
            child[0] = child[1] = NULL;
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

        void rotate() {
            if (parent->parent) parent->parent->pushDown();
            parent->pushDown(), pushDown();            

            Node *oldParent = parent;
            Relation r = relation();

            if (oldParent->parent) oldParent->parent->child[oldParent->relation()] = this;
            parent = oldParent->parent;

            if (child[r ^ 1]) child[r ^ 1]->parent = oldParent;
            oldParent->child[r] = child[r ^ 1];

            oldParent->parent = this;
            child[r ^ 1] = oldParent;

            std::swap(pathParent, oldParent->pathParent);
        }

        void splay() {
            while (parent != NULL) {
                if (parent->parent) parent->parent->pushDown();
                parent->pushDown(), pushDown();

                if (parent->parent == NULL) rotate();
                else if (parent->relation() == relation()) parent->rotate(), rotate();
                else rotate(), rotate();
            }
            pushDown();
        }

        void expose() {
            splay();
            if (child[R]) {
                std::swap(child[R]->pathParent, child[R]->parent);
                child[R] = NULL;
            }
        }

        bool splice() {
            splay();
            if (!pathParent) return false;
            pathParent->expose();
            pathParent->child[R] = this;
            std::swap(parent, pathParent);
            return true;
        }

        void access() {
            expose();
            while (splice());
        }

        Node *findRoot() {
            access();
            splay();
            Node *v = this;
            while (v->pushDown(), v->child[L]) v = v->child[L];
            return v;
        }

        void evert() {
            access();
            splay();
            reversed ^= 1;
        }
    } nodes[MAXN];

    void link(int u, int v) {
        nodes[v - 1].evert();
        nodes[v - 1].pathParent = &nodes[u - 1];
    }

    void cut(int u, int v) {
        nodes[u - 1].evert();
        nodes[v - 1].access();
        nodes[u - 1].splay();
        nodes[u - 1].child[R] = NULL;
        nodes[v - 1].parent = NULL;
    }

    Node *find(int u) {
        return nodes[u - 1].findRoot();
    }
} lct;

int main() {
    int n, m;
    scanf("%d %d", &n, &m);

    for (int i = 0; i < m; i++) {
        char command[sizeof("Connect")];
        int u, v;
        scanf("%s %d %d", command, &u, &v);

        if (command[0] == 'C') lct.link(u, v);
        else if (command[0] == 'D') lct.cut(u, v);
        else if (command[0] == 'Q') {
            if (lct.find(u) == lct.find(v)) puts("Yes");
            else puts("No");
        }
    }

    return 0;
}
```