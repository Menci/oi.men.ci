title: 「HNOI2016」网络 - 树链剖分 + DFS 序
categories:
  - OI
tags:
  - BZOJ
  - COGS
  - DFS 序
  - HNOI
  - 树链剖分
permalink: hnoi2016-network
date: '2016-05-11 17:08:00'
---

一个简单的网络系统可以被描述成一棵无根树。两个服务器进行数据的交互时，数据会经过连接这两个服务器的路径上的所有服务器（包括这两个服务器自身）。当路径上的某个服务器出现故障，无法正常运行时，数据便无法交互。此外，每个数据交互请求都有一个重要度。在每一个时刻，只有可能出现下列三种事件中的一种：

1. 在某两个服务器之间出现一条新的数据交互请求；
2. 某个数据交互结束请求；
3. 某个服务器出现故障。

系统会在任何故障发生后立即修复。也就是在出现故障的时刻之后，这个服务器依然是正常的。但在服务器产生故障时依然会对需要经过该服务器的数据交互请求造成影响。你的任务是在每次出现故障时，维护未被影响的请求中重要度的最大值。

<!-- more -->

### 链接

[BZOJ 4538](http://www.lydsy.com/JudgeOnline/problem.php?id=4538)  
[COGS 2215](http://cogs.top/cogs/problem/problem.php?pid=2215)

### 题解

对树进行树链剖分，并得到其 DFS 序。树上的一条路经转化为 DFS 序上的 $ O(\log n) $ 个区间。

考虑一条未完成的交互请求**不**会受到某服务器故障的影响，当且仅当这条交互请求**不**经过这台服务器。所以只需要维护不经过某台服务器的请求即可。一条请求会影响树的 DFS 序上 $ O(\log n) $ 个区间，其补集即为不经过的服务器，仍然是 $ O(\log n) $ 个区间。

再就是维护重要度最大的请求，可以在线段树的每个节点上维护一个堆，并将标记永久化（不下传标记，用从根到叶子的一条链上的值更新答案），同时存储每条请求是否已结束，并及时将堆顶已结束的请求删除。

总时间复杂度为 $ O(n \log ^ 3 n) $。

### 代码

```cpp
#include <cstdio>
#include <stack>
#include <queue>
#include <algorithm>
#include <utility>

const int MAXN = 100000;
const int MAXM = 200000;

struct Node;
struct Edge;

struct Node {
    Edge *e;
    Node *p, *c, *t;
    int d, i, s;
    bool v;
} N[MAXN];

struct Edge {
    Node *s, *t;
    Edge *next;

    Edge(Node *const s, Node *const t) : s(s), t(t), next(s->e) {}
};

struct SegmentTree {
    int l, r;
    SegmentTree *lc, *rc;
    std::priority_queue< std::pair<int, bool *> > q;

    SegmentTree(const int l, const int r, SegmentTree *const lc, SegmentTree *const rc) : l(l), r(r), lc(lc), rc(rc) {}
    ~SegmentTree() {
        if (lc) delete lc;
        if (rc) delete rc;
    }

    void update(const int l, const int r, const std::pair<int, bool *> &p) {
        if (l > this->r || r < this->l) return;
        else if (l <= this->l && r >= this->r) /* printf("> [%d, %d]\n", this->l, this->r), */ q.push(p);
        else lc->update(l, r, p), rc->update(l, r, p);
    }

    int query(const int i) {
        if (i < this->l || i > this->r) return -1;
        else {
            int ans = -1;
            if (i >= this->l && i <= this->r) {
                while (!q.empty() && *q.top().second) q.pop();
                if (!q.empty()) ans = std::max(ans, q.top().first);
            }
            if (lc) ans = std::max(ans, lc->query(i));
            if (rc) ans = std::max(ans, rc->query(i));
            return ans;
        }
    }
} *seg;

inline void addEdge(const int u, const int v) {
    N[u].e = new Edge(&N[u], &N[v]);
    N[v].e = new Edge(&N[v], &N[u]);
}

int n, m;
bool del[MAXM];

inline SegmentTree *buildSegment(const int l, const int r) {
    if (l > r) return NULL;
    else if (l == r) return new SegmentTree(l, r, NULL, NULL);
    else return new SegmentTree(l, r, buildSegment(l, l + ((r - l) >> 1)), buildSegment(l + ((r - l) >> 1) + 1, r));
}

inline void cut() {
    std::stack<Node *> s;
    s.push(&N[0]);
    N[0].d = 1;

    while (!s.empty()) {
        Node *v = s.top();
        if (!v->v) {
            v->v = true;
            for (Edge *e = v->e; e; e = e->next) if (!e->t->d) {
                e->t->d = v->d + 1;
                e->t->p = v;
                s.push(e->t);
            }
        } else {
            v->s = 1;
            for (Edge *e = v->e; e; e = e->next) {
                v->s += e->t->s;
                if (!v->c || v->c->s < e->t->s) v->c = e->t;
            }
            s.pop();
        }
    }

    for (int i = 0; i < n; i++) N[i].v = false;
    s.push(&N[0]);

    int time = -1;
    while (!s.empty()) {
        Node *v = s.top();
        if (!v->v) {
            v->v = true;
            if (!v->p || v != v->p->c) v->t = v;
            else v->t = v->p->t;
            v->i = ++time;
            for (Edge *e = v->e; e; e = e->next) if (e->t->p == v && e->t != v->c) s.push(e->t);
            if (v->c) s.push(v->c);
        } else s.pop();
    }

    seg = buildSegment(0, n - 1);
}

inline void update(const int u, const int v, const std::pair<int, bool *> &p) {
    Node *a = &N[u], *b = &N[v];
    std::vector< std::pair<int, int> > vec;
    while (a->t != b->t) {
        if (a->t->d < b->t->d) std::swap(a, b);
        vec.push_back(std::make_pair(a->t->i, a->i));
        a = a->t->p;
    }

    if (a->i > b->i) std::swap(a, b);
    vec.push_back(std::make_pair(a->i, b->i));

    if (vec.empty()) return;

    std::sort(vec.begin(), vec.end());
    std::pair<int, int> last = std::make_pair(-1, -1);
    for (std::vector< std::pair<int, int> >::const_iterator it = vec.begin(); it != vec.end(); it++) {
        seg->update(last.second + 1, it->first - 1, p);
        // printf("[%d, %d]\n", last.second + 1, it->first - 1);
        last = *it;
    }
    seg->update(last.second + 1, n - 1, p);
    // printf("[%d, %d]\n", last.second + 1, n - 1);
}

inline int query(const int x) {
    // printf("query(%d)\n", x);
    return seg->query(N[x].i);
}

int main() {
    freopen("network_tenderRun.in", "r", stdin);
    freopen("network_tenderRun.out", "w", stdout);

    scanf("%d %d", &n, &m);
    for (int i = 0; i < n - 1; i++) {
        int u, v;
        scanf("%d %d", &u, &v), u--, v--;
        addEdge(u, v);
    }

    cut();

    // for (int i = 0; i < n; i++) printf("#%d: i = %d\n", i + 1, N[i].i);

    for (int i = 0; i < m; i++) {
        int c;
        scanf("%d", &c);
        if (c == 0) {
            int u, v, w;
            scanf("%d %d %d", &u, &v, &w), u--, v--;
            update(u, v, std::make_pair(w, &del[i]));
        } else if (c == 1) {
            int t;
            scanf("%d", &t), t--;
            del[t] = true;
        } else if (c == 2) {
            int x;
            scanf("%d", &x), x--;
            printf("%d\n", query(x));
        }
    }

    fclose(stdin);
    fclose(stdout);

    return 0;
}
```