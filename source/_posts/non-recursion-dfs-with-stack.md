title: '用 std::stack 实现非递归 DFS'
categories:
  - OI
tags:
  - DFS
  - STL
  - Tarjan
  - 强连通分量
  - 树链剖分
  - 算法模板
permalink: non-recursion-dfs-with-stack
date: '2016-04-08 14:30:21'
---

众所周知，在有些省份（比如山东、河南），省选时使用 Windows 垃圾系统评测，而 Windows 下默认的系统栈非常小（只有 1M），这造成了有些 DFS 相关算法无法通过极端数据，而是发生『栈溢出』的错误。一种解决方法是使用非递归的 DFS。

<!-- more -->

### 框架

我们通常这样实现递归 DFS：

```cpp
void dfs(Iterator x) {
    x->visited = true;
    x->initialization();
    for (Iterator i = x->subIterators.begin(); i != x->subIterators.end(); i++) {
        if (!i->visited) {
            x->pushDown(i);
            dfs(i);
            x->pushUpBack();
        } else x->pushUp(i);
    }
    x->exit();
}
```

第一次访问每个元素时，标记它为访问过，并对其进行初始化操作；枚举所有子元素，分为『未访问过』和『已访问过』分别进行处理。

为了将这个过程转化为非递归，我们使用一个栈来存储 DFS 搜索树上的一条链。

```cpp
void dfs(Iterator start) {
    std::stack<Iterator> s;
    s.push(start);
    start->pushed = true;

    while (!s.empty()) {
        Iterator x = s.top();

        if (!x->visited) {
            x->visited = true;
            x->initialization();
            x->currentSubIterator = x->subIterators.begin();
        }

        if (x->currentSubIterator != x->subIterators.end()) {
            Iterator &i = x->currentSubIterator;
            if (!i->pushed) {
                x->pushDown(i);
                i->predecessor = x;
                i->pushed = true;
                s.push(i);
            } else {
                x->pushUp(i);
            }
            i++;
        } else {
            x->exit();
            x->predecessor->pushUpBack(i);
            s.pop();
        }
    }
}
```

### Tarjan 强连通分量模板

```cpp
struct Node {
    Edge *firstEdge, *currentEdge, *inEdge;
    Connected *connected;
    int dfn, low;
    bool inStack, visited, pushed;
} nodes[MAXN];

struct Edge {
    Node *from, *to;
    Edge *next;

    Edge(Node *from, Node *to) : from(from), to(to), next(from->firstEdge) {}
};

struct Connected {
    int size;
} connecteds[MAXN];

int n;

inline int tarjan() {
    int timeStamp = 0, count = 0;

    for (int i = 0; i < n; i++) {
        if (nodes[i].visited) continue;

        std::stack<Node *> s, t;
        s.push(&nodes[i]);
        nodes[i].pushed = true;

        while (!s.empty()) {
            Node *v = s.top();

            if (!v->visited) {
                v->visited = true;
                v->currentEdge = v->firstEdge;
                v->dfn = v->low = timeStamp++;
                v->inStack = true;
                t.push(v);
            }

            if (v->currentEdge) {
                Edge *&e = v->currentEdge;
                if (!e->to->pushed) s.push(e->to), e->to->pushed = true, e->to->inEdge = e;
                else if (e->to->inStack) v->low = std::min(v->low, e->to->dfn);
                e = e->next;
            } else {
                if (v->dfn == v->low) {
                    v->connected = &connecteds[count++];
                    Node *u;
                    do {
                        u = t.top();
                        t.pop();
                        u->inStack = false;
                        u->connected = v->connected;
                        u->connected->size++;
                    } while (u != v);
                }

                if (v->inEdge) v->inEdge->from->low = std::min(v->inEdge->from->low, v->low);

                s.pop();
            }
        }
    }

    return count;
}
```

### 树链剖分模板

树链剖分的 DFS 过程比较特殊，我们可以每次将一个节点的所有子节点压入栈中，所有子树全部遍历完后回溯回来上传信息。

```cpp
struct Node {
    Edge *e;
    Node *c, *p;
    int size, pos, posEnd;
    bool visited;
    Path *path;
} N[MAXN];

struct Edge {
    Node *s, *t;
    Edge *next;

    Edge(Node *s, Node *t) : s(s), t(t), next(s->e) {}
};

struct Path {
    Node *top;

    Path(Node *top) : top(top) {}
};

inline void cut() {
    std::stack<Node *> s;
    s.push(&N[0]);

    while (!s.empty()) {
        Node *v = s.top();
        if (!v->visited) {
            v->visited = true;
            for (Edge *e = v->e; e; e = e->next) if (e->t->p == NULL && e->t != v->p) e->t->p = v, s.push(e->t);
        } else {
            v->size = 1;
            for (Edge *e = v->e; e; e = e->next) if (e->t->p == v) {
                v->size += e->t->size;
                if (v->c == NULL || v->c->size < e->t->size) v->c = e->t;
            }

            s.pop();
        }
    }

    for (int i = 0; i < n; i++) N[i].visited = false;

    s.push(&N[0]);
    int time = -1;
    while (!s.empty()) {
        Node *v = s.top();
        if (!v->visited) {
            v->visited = true;
            v->pos = ++time;

            if (!v->p || v != v->p->c) v->path = new Path(v);
            else v->path = v->p->path;

            for (Edge *e = v->e; e; e = e->next) if (e->t->p == v && e->t != v->c) s.push(e->t);
            if (v->c) s.push(v->c);
        } else v->posEnd = time, s.pop();
    }
}
```