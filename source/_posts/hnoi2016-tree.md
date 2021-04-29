title: 「HNOI2016」树 - 最近公共祖先 + 主席树
categories:
  - OI
tags:
  - BZOJ
  - COGS
  - HNOI
  - 主席树
  - 最近公共祖先
  - 树链剖分
permalink: hnoi2016-tree
date: '2016-05-11 17:28:00'
---

小 A 想做一棵很大的树，但是他手上的材料有限，只好用点小技巧了。开始，小 A 只有一棵结点数为 $ N $ 的树，结点的编号为 $ 1,\ 2,\ \dots,\ N $，其中结点 $ 1 $ 为根；我们称这颗树为模板树。小 A 决定通过这棵模板树来构建一颗大树。构建过程如下：

1. 将模板树复制为初始的大树；
2. 以下 3，4，5 步循环执行 $ M $ 次；
3. 选择两个数字 $ a,\ b $，其中 $ 1 \leq a \leq N $，$ 1 \leq b \leq $ 当前大树的结点数；
4. 将模板树中以结点 $ a $ 为根的子树复制一遍，挂到大树中结点 $ b $ 的下方（也就是说，模板树中的结点 $ a $ 为根的子树复制到大树中后，将成为大树中结点 $ b $ 的子树)；
5. 将新加入大树的结点按照在模板树中编号的顺序重新编号。例如，假设在进行 4 步之前大树有 $ L $ 个结点，模板树中以 $ a $ 为根的子树共有 $ C $ 个结点，那么新加入模板树的 $ C $ 个结点在大树中的编号将是 $ L + 1,\ L + 2,\ \dots,\ L + C $；大树中这 $ C $ 个结点编号的大小顺序和模板树中对应的 $ C $ 个结点的大小顺序是一致的。

现在他想问你，树中一些结点对的距离是多少。

<!-- more -->

### 链接

[BZOJ 4539](http://www.lydsy.com/JudgeOnline/problem.php?id=4539)  
[COGS 2052](http://cogs.top/cogs/problem/problem.php?pid=2052)

### 题解

在新树中用一个节点代表模板树中的一棵子树，存储每个节点在模板树中的根，其真实父节点在模板树中的节点，边设置为新节点到其新树中父节点的根节点的距离。对新树和模板树分别进行树链剖分。

需要从编号求出在新树中的节点时，记录新树中每个节点代表的区间，进行二分查找。需要求出模板树中的节点时，先求出在区间内的编号，再做区间第 $ k $ 大查询，使用主席树即可。

求距离时，分三种情况讨论：

1. 两个点在新树中的统一节点内，直接在模板树中找最近公共租先；
2. 两个点在新树中的节点的的最近公共租先为其中一个节点，分别求出多段距离相加减；
3. 其他情况，比情况 2 复杂一些，方法类似。

总时间复杂度为 $ O((m + q) \log n) $，具体实现细节见代码。

### 代码

```cpp
#include <cstdio>
#include <climits>
#include <stack>
#include <algorithm>

const int MAXN = 100000;
const int MAXM = 100000;
const int MAXQ = 100000;

struct Range {
    long long l, r;

    Range(const long long l = 0, const long long r = 0) : l(l), r(r) {}
};

struct Node;
struct TemplateTreeNode;
struct TargetTreeNode;

struct Node {
    int id, depth, size, pos, posEnd;
    long long dist;
    Node *parent, *child, *top;
    bool visited;
};

template <typename T>
struct Edge {
    T *s, *t;
    long long w;
    Edge<T> *next;

    Edge(T *const s, T *const t, const long long w) : s(s), t(t), w(w), next(s->e) {}
};

struct TemplateTreeNode : public Node {
    Edge<TemplateTreeNode> *e;
} templateTree[MAXN];

struct TargetTreeNode : public Node {
    Edge<TargetTreeNode> *e;
    TemplateTreeNode *rootInTemplateTree, *parentInTemplateTree;
    Range idRange;

    friend bool operator<(const TargetTreeNode &v, const long long x) {
        return v.idRange.r < x;
    }
} targetTree[MAXM + 1];

struct ChairmanTree {
    struct SegmentTree {
        int l, r, mid;
        SegmentTree *lc, *rc;
        int cnt;

        SegmentTree(const int l, const int r, SegmentTree *const lc = NULL, SegmentTree *const rc = NULL) : l(l), r(r), mid(l + ((r - l) >> 1)), lc(lc), rc(rc), cnt((lc ? lc->cnt : 0) + (rc ? rc->cnt : 0)) {}
        SegmentTree(const int l, const int r, const int cnt) : l(l), r(r), lc(NULL), rc(NULL), cnt(cnt) {}

        void pushDown() {
            if (!lc) lc = new SegmentTree(l, mid);
            if (!rc) rc = new SegmentTree(mid + 1, r);
        }

        SegmentTree *insert(const int num) {
            if (num < l || num > r) return this;
            else if (num == l && num == r) return new SegmentTree(l, r, cnt + 1);
            else {
                pushDown();
                if (num <= mid) return new SegmentTree(l, r, lc->insert(num), rc);
                else return new SegmentTree(l, r, lc, rc->insert(num));
            }
        }

        int rank() const {
            return lc ? lc->cnt : 0;
        }
    } *root[MAXN + 1];
    int n;

    void build(const int *a, const int n) {
        this->n = n;
        root[0] = new SegmentTree(0, n - 1);
        for (int i = 1; i <= n; i++) root[i] = root[i - 1]->insert(a[i - 1]);
    }

    int query(const int l, const int r, int k) {
        SegmentTree *L = root[l - 1], *R = root[r];
        int min = 0, max = n - 1;
        while (min != max) {
            L->pushDown(), R->pushDown();
            int mid = min + ((max - min) >> 1), t = R->rank() - L->rank();
            if (k <= t) L = L->lc, R = R->lc, max = mid;
            else k -= t, L = L->rc, R = R->rc, min = mid + 1;
        }
        return min;
    }
} chairmanTree;

int n, m, q, dfsSequence[MAXN];
int cnt;

template <typename T>
inline void addEdge(T *const N, const int u, const int v, const long long w) {
    N[u].e = new Edge<T>(&N[u], &N[v], w);
    N[v].e = new Edge<T>(&N[v], &N[u], w);
}

template <typename T>
inline void cut(T *const N, const int n) {
    std::stack<T *> s;
    s.push(&N[0]);
    N[0].depth = 1;
    N[0].dist = 0;

    while (!s.empty()) {
        T *v = s.top();
        if (!v->visited) {
            v->visited = true;
            for (Edge<T> *e = v->e; e; e = e->next) {
                if (!e->t->depth) {
                    e->t->depth = v->depth + 1;
                    e->t->dist = v->dist + e->w;
                    e->t->parent = v;
                    s.push(e->t);
                }
            }
        } else {
            v->size = 1;
            for (Edge<T> *e = v->e; e; e = e->next) {
                if (static_cast<T *>(e->t->parent) == v) {
                    v->size += e->t->size;
                    if (!v->child || v->child->size < e->t->size) v->child = e->t;
                }
            }
            s.pop();
        }
    }

    for (int i = 0; i < n; i++) N[i].visited = false;

    int time = -1;
    s.push(&N[0]);
    N[0].depth = 1;
    while (!s.empty()) {
        T *v = s.top();
        if (!v->visited) {
            v->visited = true;
            if (v->parent == NULL || v != static_cast<T *>(v->parent->child)) v->top = v;
            else v->top = v->parent->top;
            v->pos = ++time;
            for (Edge<T> *e = v->e; e; e = e->next) {
                if (static_cast<T *>(e->t->parent) == v) {
                    if (e->t != v->child) s.push(e->t);
                }
            }
            if (v->child) s.push(static_cast<T *>(v->child));
        } else {
            v->posEnd = time;
            s.pop();
        }
    }
}

template <typename T>
inline T *lca(T *const u, T *const v) {
    Node *a = u, *b = v;
    while (a->top != b->top) {
        if (a->top->depth < b->top->depth) std::swap(a, b);
        a = a->top->parent;
    }
    if (a->depth > b->depth) std::swap(a, b);
    return static_cast<T *>(a);
}

template <typename T>
inline T *lcaDown(T *const u, T *const v, T *&uDown, T *&vDown) {
    T *p = lca(u, v);

    struct {
        T *operator()(Node *const p, Node *const v) {
            Node *tmp = v;
            while (tmp->top->parent != p) {
                if (p->top == tmp->top) return static_cast<T *>(p->child);
                tmp = tmp->top->parent;
            }
            return static_cast<T *>(tmp->top);
        }
    } down;

    uDown = down(p, u), vDown = down(p, v);

    return p;
}

template <typename T>
inline long long calcDist(T *const u, T *const v) {
    const T *p = lca(u, v);
    return (u->dist - p->dist) + (v->dist - p->dist);
}

template <typename T>
inline long long getDist(T *const u, T *const v) {
    return llabs(u->dist - v->dist);
}

inline void getNode(const long long id, TargetTreeNode *&targetTreeNode, TemplateTreeNode *&templateTreeNode) {
    targetTreeNode = NULL;
    templateTreeNode = NULL;
    targetTreeNode = std::lower_bound(targetTree, targetTree + cnt, id);
    /*for (int i = 0; i <= cnt; i++) {
        if (id >= targetTree[i].idRange.l && id <= targetTree[i].idRange.r) {
            targetTreeNode = &targetTree[i];
            break;
        }
    }*/

    // printf("%ld\n", targetTreeNode - targetTree);
    if (targetTreeNode == NULL) throw;
    if (targetTreeNode == &targetTree[0]) templateTreeNode = &templateTree[id];
    else {
        const int k = id - targetTreeNode->idRange.l;

        TemplateTreeNode *root = targetTreeNode->rootInTemplateTree;

        const int x = chairmanTree.query(root->pos + 1, root->posEnd + 1, k + 1);
        templateTreeNode = &templateTree[x];
        return;

        // static int tmp[MAXN];
        // std::copy(dfsSequence + root->pos, dfsSequence + root->pos + root->size, tmp);
        // // std::nth_element(tmp, tmp + root->size, tmp + k);
        // std::sort(tmp, tmp + root->size);
        // templateTreeNode = &templateTree[tmp[k]];
    }
}

inline long long query(const long long u, const long long v) {
    TargetTreeNode *aTarget, *bTarget;
    TemplateTreeNode *aTemplate, *bTemplate;
    getNode(u, aTarget, aTemplate), getNode(v, bTarget, bTemplate);
    if (aTarget == bTarget) {
        return calcDist(aTemplate, bTemplate);
    } else {
        TargetTreeNode *aDown, *bDown;
        TemplateTreeNode *aUp, *bUp;

        TargetTreeNode *pTarget = lcaDown(aTarget, bTarget, aDown, bDown);
        if (aTarget->depth > bTarget->depth) std::swap(aTarget, bTarget), std::swap(aTemplate, bTemplate), std::swap(aDown, bDown);

        aUp = static_cast<TemplateTreeNode *>(aDown->parentInTemplateTree);
        bUp = static_cast<TemplateTreeNode *>(bDown->parentInTemplateTree);

        long long d = 0;
        if (aTarget == pTarget) {
            d += getDist(bTarget, pTarget);
            d -= getDist(bUp, pTarget->rootInTemplateTree);
            d += calcDist(bUp, aTemplate);
            d += getDist(bTemplate, bTarget->rootInTemplateTree);
        } else {
            d += getDist(aTarget, pTarget) + getDist(bTarget, pTarget);
            d -= getDist(bUp, pTarget->rootInTemplateTree);
            d -= getDist(aUp, pTarget->rootInTemplateTree);
            d += calcDist(aUp, bUp);
            d += getDist(bTemplate, bTarget->rootInTemplateTree);
            d += getDist(aTemplate, aTarget->rootInTemplateTree);
        }
        return d;
    }
}

int main() {
    // freopen("tree_tenderRun.in", "r", stdin);
    // freopen("tree_tenderRun.out", "w", stdout);

    scanf("%d %d %d", &n, &m, &q);
    for (int i = 0; i < n - 1; i++) {
        templateTree[i].id = i;
        int u, v;
        scanf("%d %d", &u, &v), u--, v--;
        addEdge(templateTree, u, v, 1);
    }

    cut<TemplateTreeNode>(templateTree, n);

    for (int i = 0; i < n; i++) dfsSequence[templateTree[i].pos] = i;
    chairmanTree.build(dfsSequence, n);

    targetTree[0].id = 0;
    targetTree[0].rootInTemplateTree = &templateTree[0];
    targetTree[0].idRange = Range(0, n - 1);
    long long lastEnd = n - 1;
    for (int i = 1; i <= m; i++) {
        cnt = i;

        targetTree[i].id = i;
        long long a, b;
        scanf("%lld %lld", &a, &b), a--, b--;
        targetTree[i].idRange = Range(lastEnd + 1, lastEnd + templateTree[a].size);
        lastEnd = targetTree[i].idRange.r;

        TargetTreeNode *V;
        TemplateTreeNode *v;
        getNode(b, V, v);

        addEdge(targetTree, V->id, i, getDist(v, V->rootInTemplateTree) + 1);

        targetTree[i].rootInTemplateTree = &templateTree[a];
        targetTree[i].parentInTemplateTree = v;
    }

    cut<TargetTreeNode>(targetTree, m + 1);

    for (int i = 0; i < q; i++) {
        long long u, v;
        scanf("%lld %lld", &u, &v), u--, v--;
        printf("%lld\n", query(u, v));
    }

    // fclose(stdin);
    // fclose(stdout);

    return 0;
}
```