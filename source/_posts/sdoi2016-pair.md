title: 「SDOI2016」数字配对 - 费用流
categories:
  - OI
tags:
  - BZOJ
  - COGS
  - Edmonds-Karp
  - SDOI
  - 二分答案
  - 数论
  - 素数判定
  - 线性筛
  - 网络流
  - 费用流
permalink: sdoi2016-pair
date: '2016-04-09 18:06:43'
---

有 $ n $ 种数字，第 $ i $ 种数字是 $ a_i $、有 $ b_i $ 个，权值是 $ c_i $。

若两个数字 $ a_i $、$ a_j $ 满足，$ a_i $ 是 $ a_j $ 的倍数，且 $ \frac{a_i}{a_j} $ 是一个质数，那么这两个数字可以配对，并获得 $ c_i \times c_j $ 的价值。

一个数字只能参与一次配对，可以不参与配对。
在获得的价值总和不小于 $ 0 $ 的前提下，求最多进行多少次配对。

<!-- more -->

### 链接

[BZOJ 4514](http://www.lydsy.com/JudgeOnline/problem.php?id=4514)  
[COGS 2221](http://cogs.top/cogs/problem/problem.php?pid=2221)

### 题解

线性筛预处理质数（到 $ 10 ^ 6 $ 肯定够用了），用试除法判断质数，可以匹配的数字连边，做一遍二分图染色。

源点到所有 $ X $ 点连边，容量为 $ b_i $ 费用为 $ 0 $；所有 $ Y $ 点向汇点连边，容量为 $ b_i $ 费用为 $ 0 $；可以匹配的数字从 $ X $ 点向 $ Y $ 点连边，容量为无穷大，费用为 $ -(c_i \times c_j) $。

先求出整张网络的最大流作为二分的上界。然后建立超级源点，并从超级源点向源点连边，二分这条边的容量，用费用流检验，如果费用 $ \leq 0 $ 说明可行。

### 代码

```cpp
#include <cstdio>
#include <climits>
#include <queue>
#include <algorithm>

const int MAXN = 200;
const int MAXA = 1e9;
const int MAXP = 1e6;

struct Node;
struct Edge;

struct Node {
    Edge *e, *in;
    int c, f;
    long long d;
    bool q;
} N[MAXN + 3];

struct Edge {
    Node *s, *t;
    int f, c;
    long long w;
    Edge *next, *r;

    Edge(Node *s, Node *t, const int c, const long long w) : s(s), t(t), f(0), c(c), w(w), next(s->e) {}
} *limE;

template <typename T, size_t SIZE>
struct MemoryPool {
    char buf[SIZE * sizeof(T)], *cur;

    MemoryPool() {
        reset();
    }

    void reset() { cur = buf; }

    T *alloc() {
        if (cur == buf + SIZE * sizeof(T)) return (T *)malloc(sizeof(T));
        else {
            char *p = cur;
            cur += sizeof(T);
            return (T *)p;
        }
    }
};

MemoryPool<Edge, MAXN * MAXN * 10> pool;
inline Edge *addEdge(int u, int v, const int c, const long long w) {
    // printf("E(%d, %d, %d, %d)\n", u, v, c, w);
    N[u].e = &(*(pool.alloc()) = Edge(&N[u], &N[v], c, w));
    N[v].e = &(*(pool.alloc()) = Edge(&N[v], &N[u], 0, -w));
    N[u].e->r = N[v].e, N[v].e->r = N[u].e;

    return N[u].e;
}

inline void edmondskarp(const int s, const int t, const int n, int &flow, long long &cost) {
    flow = cost = 0;
    while (1) {
        for (int i = 0; i < n; i++) {
            N[i].q = false;
            N[i].in = NULL;
            N[i].f = 0;
            N[i].d = LLONG_MAX;
        }

        std::queue<Node *> q;
        q.push(&N[s]);
        N[s].d = 0, N[s].f = INT_MAX;

        while (!q.empty()) {
            Node *v = q.front();
            q.pop();
            v->q = false;
            for (Edge *e = v->e; e; e = e->next) {
                if (e->f < e->c && e->t->d > v->d + e->w) {
                    e->t->d = v->d + e->w;
                    e->t->in = e;
                    e->t->f = std::min(v->f, e->c - e->f);
                    if (!e->t->q) {
                        e->t->q = true;
                        q.push(e->t);
                    }
                }
            }
        }

        if (N[t].d == LLONG_MAX) return;

        for (Edge *e = N[t].in; e; e = e->s->in) {
            e->f += N[t].f;
            e->r->f -= N[t].f;
        }

        flow += N[t].f;
        cost += N[t].f * N[t].d;
        // printf("cost = %d\n", -cost);
    }    
}

int n, s, ss, t;

struct Number {
    int a, b, c, t;

    bool operator<(const Number &o) const { return a < o.a; }
} a[MAXN + 1];

inline void color() {
    for (int i = 1; i <= n; i++) {
        if (N[i].c != 0) continue;

        std::queue<Node *> q;
        q.push(&N[i]);
        N[i].c = 1;

        while (!q.empty()) {
            Node *v = q.front();
            q.pop();

            for (Edge *e = v->e; e; e = e->next) {
                if (e->t->c == 0) {
                    e->t->c = (v->c == 1) ? -1 : 1;
                    q.push(e->t);
                } else {
                    // if (e->t->c == v->c) throw;
                }
            }
        }
    }    
}

inline bool check(const int limit) {
    for (int i = 0; i < n + 3; i++) {
        for (Edge *e = N[i].e; e; e = e->next) {
            e->f = 0;
        }
    }

    limE->c = limit;

    int flow;
    long long cost;
    edmondskarp(ss, t, n + 3, flow, cost);
    // printf("cost = %d\n", cost);
    return cost <= 0;
}

inline int solve() {
    limE->c = INT_MAX;
    int flow;
    long long cost;
    edmondskarp(ss, t, n + 3, flow, cost);

    int l = 0, r = flow;
    while (l < r) {
        // printf("(%d, %d)\n", l, r);
        int mid = l + ((r - l) >> 1) + 1;
        if (check(mid)) l = mid;
        else r = mid - 1;
    }

    return l;
}

bool isNotPrime[MAXP + 1];
int primes[MAXP], cnt;
inline void euler() {
    isNotPrime[0] = isNotPrime[1] = true;
    for (int i = 2; i <= MAXP; i++) {
        if (!isNotPrime[i]) {
            primes[cnt++] = i;
        }

        for (int j = 0; j < cnt; j++) {
            if (primes[j] * i > MAXP) break;
            isNotPrime[primes[j] * i] = true;
            if (i % primes[j] == 0) break; 
        }
    }
}

inline bool isPrime(const int x) {
    if (x <= MAXP && isNotPrime[x]) return false;
    if (x == 1) return false;
    for (int i = 0; i < cnt; i++) {
        int &p = primes[i];
        if (p * p > x) return true;
        if (x % p == 0) return false;
    }
    return true;
}

int main() {
    freopen("pair.in", "r", stdin);
    freopen("pair.out", "w", stdout);

    euler();

    scanf("%d", &n);
    int sum = 0;
    for (int i = 1; i <= n; i++) scanf("%d", &a[i].a);
    for (int i = 1; i <= n; i++) scanf("%d", &a[i].b), sum += a[i].b;
    for (int i = 1; i <= n; i++) scanf("%d", &a[i].c);
    std::sort(a + 1, a + n + 1);

    bool valid[MAXN + 1][MAXN + 1];
    for (int i = 1; i <= n; i++) {
        Number &xi = a[i];
        for (int j = 1; j < i; j++) {
            Number &xj = a[j];
            if (xi.a % xj.a == 0 && isPrime(xi.a / xj.a)) {
                valid[i][j] = true;
                addEdge(i, j, 0, 0);
            }
        }
    }

    color();

    for (int i = 1; i <= n; i++) {
        a[i].t = N[i].c;
        N[i].e = NULL;
    }

    pool.reset();

    s = 0, ss = n + 1, t = n + 2;
    for (int i = 1; i <= n; i++) {
        Number &xi = a[i];
        for (int j = 1; j < i; j++) {
            Number &xj = a[j];
            if (valid[i][j]) {
                // if (xi.t == xj.t) puts("failed!");
                if (xi.t == 1) {
                    addEdge(i, j, INT_MAX, -(long long)xi.c * xj.c);
                } else {
                    addEdge(j, i, INT_MAX, -(long long)xi.c * xj.c);
                }
            }
        }

        if (N[i].c == 1) {
            addEdge(s, i, xi.b, 0);
        } else {
            addEdge(i, t, xi.b, 0);
        }
    }

    limE = addEdge(ss, s, sum, 0);

    printf("%d\n", solve());

    fclose(stdin);
    fclose(stdout);

    return 0;
}
```