title: 「JSOI2009」游戏 - 博弈 + 二分图匹配
categories:
  - OI
tags:
  - BZOJ
  - Dinic
  - JSOI
  - 二分图匹配
  - 博弈
  - 网络流
permalink: jsoi2009-game
date: '2016-04-28 22:10:42'
---

在 $ N \times M $ 的迷宫中有一个棋子，AA 首先任意选择棋子放置的位置。然后，YY 和 AA 轮流将棋子移动到相邻的格子里。

游戏的规则规定，在一次游戏中，同一个格子不能进入两次，且不能将棋子移动到某些格子中去。当玩家无法继续移动棋子时，游戏结束，最后一个移动棋子的玩家赢得了游戏。

求 AA 初始将棋子放在哪些格子会有必胜策略。

<!-- more -->

### 链接

[BZOJ 1443](http://www.lydsy.com/JudgeOnline/problem.php?id=1443)

### 题解

题目要求 AA 初始放置棋子的位置，使得 AA 有必胜策略，即为求必败态（因为 AA 是后手）。

对网格图进行奇偶染色，建立二分图，求出有效格子的最大匹配。

考虑将初始点放置在非匹配点上，如果此时没有任何边与其相连，则 YY 负，否则 YY 一定会沿着一条**非匹配**边走向另一个**匹配**点（如果这个点是非匹配点，则匹配这条边后，总匹配数可以增加，显然与最大匹配相矛盾），此时 AA 一定可以沿着一条匹配边走回来，状态恢复到初始状态，最终 YY 找不到一条非匹配边，负。

我们得到结论：不在最大匹配上的点，一定是先手必败点。

而如果一个点在最大匹配上，我们考虑这样一条路径，从该点开始沿着匹配边 \- 非匹配边 \- 匹配边 \- 非匹配边 …… 走下去，如果这条路径的长度（边的数量）为偶数，则终点和起点在（二分图划分中的）同一集合中。此时将整个路径中每条边时候匹配取反，则整张图仍然是一个最大匹配。

另一个结论：如果一个点**不一定**在最大匹配上，则它一定是先手必败点。

使用 Dinic 算法求出二分图最大匹配后，在残量网络上进行 BFS，从源点开始，始终沿着**不满流**的边走，所有经过的且在左侧的点均**不一定在最大匹配上**，右边同理。

考虑上述算法的正确性，从源点走向的第一个点一定是**非匹配点**，继续走一步，一定是沿着**非匹配边**会走到右侧点，再走一步，一定是沿着**匹配边的反向边**走回左侧。显然，每次走到左侧的点时，路径长度均为偶数，且沿着二分图中的匹配边 \- 非匹配边 \- 匹配边 \- 非匹配边 …… 得证。

### 代码

```cpp
#include <cstdio>
#include <climits>
#include <queue>
#include <algorithm>

const int MAXN = 100;
const int DX[4] = { 1, 0, -1, 0 };
const int DY[4] = { 0, 1, 0, -1 };

struct Node;
struct Edge;

struct Node {
    Edge *e, *c;
    int l;
    bool fs, ft;
} N[MAXN * MAXN + 2];

struct Edge {
    Node *s, *t;
    int f, c;
    Edge *next, *r;

    Edge(Node *const s, Node *const t, const int c) : s(s), t(t), f(0), c(c), next(s->e) {}
};

inline void addEdge(const int s, const int t, const int c) {
    N[s].e = new Edge(&N[s], &N[t], c);
    N[t].e = new Edge(&N[t], &N[s], 0);
    (N[s].e->r = N[t].e)->r = N[s].e;
}

struct Dinic {
    bool makeLevelGraph(Node *const s, Node *const t, const int n) {
        for (int i = 0; i < n; i++) N[i].l = 0, N[i].c = N[i].e;

        std::queue<Node *> q;
        q.push(s);
        s->l = 1;

        while (!q.empty()) {
            Node *v = q.front();
            q.pop();

            for (Edge *e = v->e; e; e = e->next) if (e->t->l == 0 && e->f < e->c) {
                e->t->l = v->l + 1;
                if (e->t == t) return true;
                else q.push(e->t);
            }
        }

        return false;
    }

    int findPath(Node *const s, Node *const t, const int limit = INT_MAX) {
        if (s == t) return limit;

        for (Edge *&e = s->c; e; e = e->next) if (e->t->l == s->l + 1 && e->f < e->c) {
            int f = findPath(e->t, t, std::min(limit, e->c - e->f));
            if (f > 0) {
                e->f += f, e->r->f -= f;
                return f;
            }
        }

        return 0;
    }

    int operator()(const int s, const int t, const int n) {
        int ans = 0;
        while (makeLevelGraph(&N[s], &N[t], n)) {
            int f;
            while ((f = findPath(&N[s], &N[t])) > 0) ans += f;
        }

        return ans;
    }
} dinic;

int n, m;
char invalid[MAXN][MAXN];

struct Point {
    int i, j;

    Point(const int i, const int j) : i(i), j(j) {}

    operator int() const { return i * m + j + 1; }
    bool valid() const { return i >= 0 && i < n && j >= 0 && j < m && !invalid[i][j]; }
    Point offset(const int dx, const int dy) const { return Point(i + dx, j + dy); }
};

inline void bfs(const int s, const int t) {
    std::queue<Node *> q;
    q.push(&N[s]);
    N[s].fs = true;

    while (!q.empty()) {
        Node *v = q.front();
        q.pop();

        for (Edge *e = v->e; e; e = e->next) if (e->f < e->c && !e->t->fs) {
            e->t->fs = true;
            q.push(e->t);
        }
    }

    q.push(&N[t]);
    N[t].ft = true;

    while (!q.empty()) {
        Node *v = q.front();
        q.pop();

        for (Edge *e = v->e; e; e = e->next) if (e->r->f < e->r->c && !e->t->ft) {
            // printf("%ld to %ld\n", v - N + 1, e->t - N + 1);
            e->t->ft = true;
            q.push(e->t);
        }
    }
}

int main() {
    scanf("%d %d", &n, &m);
    for (int i = 0; i < n; i++) {
        char s[MAXN + 1];
        scanf("%s", s);
        for (int j = 0; j < m; j++) {
            invalid[i][j] = (s[j] == '#');
        }
    }

    const int s = 0, t = n * m + 1;
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < m; j++) {
            Point p(i, j);
            if (!p.valid()) continue;
            if ((i + j) % 2 == 0) {
                for (int k = 0; k < 4; k++) {
                    Point p2 = p.offset(DX[k], DY[k]);
                    if (p2.valid()) {
                        addEdge(p, p2, 1);
                    }
                }

                if (!invalid[i][j]) addEdge(s, p, 1);
            } else if (!invalid[i][j]) addEdge(p, t, 1);
        }
    }

    int maxFlow = dinic(s, t, n * m + 2);

    if (maxFlow == 0) puts("LOSE");
    else {
        puts("WIN");

        bfs(s, t);
        for (int i = 0; i < n; i++) for (int j = 0; j < m; j++) {
            if ((i + j) % 2 == 0) {
                if (N[Point(i, j)].fs) printf("%d %d\n", i + 1, j + 1);
            } else {
                if (N[Point(i, j)].ft) printf("%d %d\n", i + 1, j + 1);
            }
        }
    }
    // printf("%d\n", maxFlow);

    /*
    for (int i = 0; i < n * m + 2; i++) {
        for (Edge *e = N[i].e; e; e = e->next) {
            if (e->c > 0) printf("E(%ld, %ld, %d, [%d])\n", e->s - N, e->t - N, e->c, e->f);
        }
    }
    */

    return 0;
}
```