title: 「HNOI2016」最小公倍数 - 分块 + 并查集
categories: OI
tags:
  - BZOJ
  - COGS
  - CodeVS
  - HNOI
  - 分块
  - 并查集
permalink: hnoi2016-multiple
date: 2016-05-11 16:39:00
---

给定一张 $ N $ 个顶点 $ M $ 条边的无向图（顶点编号为 $ 1,\ 2,\ \dots,\ n $），每条边上带有权值。所有权值都可以分解成 $ 2 ^ a 3 ^ b $ 的形式。现在有 $ q $ 个询问，每次询问给定四个参数 $ u $、$ v $、$ a $ 和 $ b $，请你求出是否存在一条顶点 $ u $ 到 $ v $ 之间的路径，使得路径依次经过的边上的权值的最小公倍数为 $ 2 ^ a 3 ^ b $。

<!-- more -->

### 链接
[BZOJ 4537](http://www.lydsy.com/JudgeOnline/problem.php?id=4537)  
[COGS 2241](http://cogs.top/cogs/problem/problem.php?pid=2241)  
[CodeVS 4890](http://codevs.cn/problem/4890/)

### 题解
因为**路径**可以不是**简单路径**，所以只要两个点在同一连通块内，就一定可以找到一条连接它们的路径。多个数写成 $ 2 $ 和 $ 3 $ 的幂的积的形式的数 $ 2 ^ {a_1} 3 ^ {b_1},\ 2 ^ {a_2} 3 ^ {b_2},\ \dots,\ 2 ^ {a_n} 3 ^ {b_n} $ 的最小公倍数，为这些数中 $ 2 $ 的最高次幂乘以 $ 3 $ 的最高次幂，即 $ 2 ^ {\max\{a_i\}} 3 ^ {\max\{b_i\}} $。

问题转化为，判断是否能选取若干条组成同一连通块的边，保证给定的两个点相连通，并且连通块内 $ a $ 和 $ b $ 的最大值分别等于给定的值。

显然，边上的 $ a $ 和 $ b $ 中的任意一个比询问的对应值要大，则这条边不会对询问产生影响。考虑对于某一次询问，从小到大加入 $ a $ 和 $ b $ 均小于等于询问值的边，使用并查集维护连通性和连通块内的最大值，并在加入所有边后判断连通块内最大值是否等于询问值。总时间复杂度为 $ O(qm \  \alpha(m)) $，超时。

注意到，如果我们将边按照 $ a $ 排序，并离线处理所有询问，可以每次将 $ a $ 小于等于某个询问的边按照 $ b $ 再次排序，得到所有对答案有贡献的边。

考虑将所有边按照 $ a $ 排序后分为 $ T $ 块，每次处理某一块时，取出之前所有块中的边（这些边中的 $ a $ 均小于等于当前块内的所有询问中的 $ a $），并将其按照 $ b $ 排序。取出询问值 $ a $ 在当前块范围内的所有询问，也将其按照 $ b $ 排序。将取出的所有边增量加入并查集，并同时依次处理所有取出的询问。而块内的边也会对块内询问有影响，每处理一次询问时，枚举块内所有边，用上文中的暴力方式将其加入并查集，并在处理完一次询问后将操作**撤销**。

撤销并查集的方法是，维护一个栈，栈内存储所有被修改的位置及其原本的值，以栈的大小作为状态。恢复时，从栈顶弹出，每次将原本的值修改回去，直到栈大小等于原本的栈大小。注意这里**不能**使用路径压缩，而是要使用**按秩合并**。

分析一下上述算法的时间复杂度：每个询问只会被处理最多一次，处理每次询问时遍历了大小为 $ O(\frac{n}{T}) $ 的块，其中对并查集进行了最多 $ O(\frac{n}{T}) $ 次，这部分的时间复杂度为 $ O(q \frac{n}{T} \log \frac{n}{T}) $。处理块之前的边时，每条边最多参与 $ T $ 次排序，每个询问最多参与 $ 1 $ 次排序，这部分的时间复杂度为 $ O(T m \log m + q \log q) $。取 $ T = \sqrt m $，则总时间复杂度为 $ O(q \sqrt m \log \sqrt m + m \sqrt m \log m + q \log q) $。

### 代码
```c++
#include <cstdio>
#include <cmath>
// #include <cstring>
// #include <cassert>
#include <algorithm>
#include <stack>
#include <utility>
#include <vector>

const int MAXN = 50000;
const int MAXM = 100000;
const int MAXQ = 50000;

struct UnionFindSet {
    int p[MAXN], rk[MAXN], a[MAXN], b[MAXN];
    // int n;
    std::stack< std::pair<int *, int> > s;

    inline void init(const int n) {
        // this->n = n;
        for (int i = 0; i < n; i++) p[i] = i, rk[i] = 1, a[i] = -1, b[i] = -1;
        while (!s.empty()) s.pop();
    }

    inline int find(const int x) {
        // assert(x < n);
        return p[x] == x ? x : find(p[x]);
    }

    inline int find(const int x, int &a, int &b) {
        // assert(x < n);
        if (p[x] == x) {
            a = this->a[x], b = this->b[x];
            return x;
        }
        return find(p[x], a, b);
    }

    inline void merge(const int x, const int y, const int a, const int b) {
        int _x = find(x), _y = find(y);
        if (_x != _y) {
            if (rk[_x] == rk[_y]) {
                s.push(std::make_pair(&rk[_y], rk[_y]));
                rk[_y]++;
            } else if (rk[_x] > rk[_y]) {
                std::swap(_x, _y);
            }

            s.push(std::make_pair(&this->a[_y], this->a[_y]));
            s.push(std::make_pair(&this->b[_y], this->b[_y]));
            s.push(std::make_pair(&p[_x], p[_x]));

            p[_x] = _y;
            this->a[_y] = std::max(this->a[_y], this->a[_x]);
            this->a[_y] = std::max(this->a[_y], a);
            this->b[_y] = std::max(this->b[_y], this->b[_x]);
            this->b[_y] = std::max(this->b[_y], b);
        } else {
            s.push(std::make_pair(&this->a[_y], this->a[_y]));
            s.push(std::make_pair(&this->b[_y], this->b[_y]));

            this->a[_x] = std::max(this->a[_x], a);
            this->b[_x] = std::max(this->b[_x], b);
        }
    }

    inline size_t status() { return s.size(); }

    inline void restore(const size_t s) {
        while (this->s.size() > s) {
            const std::pair<int *, int> p = this->s.top();
            *p.first = p.second;
            this->s.pop();
        }
    }
} ufs;

struct Edge {
    int u, v, a, b;
} E[MAXM];

struct Query {
    int u, v, a, b; // , cnt;
    bool ans; // , solved;
} Q[MAXQ];

int n, m, q;
// bool ans[MAXQ];

inline bool compareByA(const Edge &a, const Edge &b) {
    return a.a < b.a;
}

inline bool compareByB(const Edge &a, const Edge &b) {
    return a.b < b.b;
}

inline bool compareQueryByB(const Query *a, const Query *b) {
    return a->b < b->b;
}

/*
inline void forceSolve() {
    for (int i = 0; i < q; i++) {
        ufs.init(n);
        for (int j = 0; j < m; j++) {
            if (E[j].a <= Q[i].a && E[j].b <= Q[i].b) ufs.merge(E[j].u, E[j].v, E[j].a, E[j].b);
        }
        int a, b;
        if (ufs.find(Q[i].u, a, b) == ufs.find(Q[i].v)) {
            if (a == Q[i].a && b == Q[i].b) Q[i].ans = true;
            else Q[i].ans = false;
        } else Q[i].ans = false;
    }
}
*/

inline void solve() {
    std::sort(E, E + m, &compareByA);
    int blockSize = floor(sqrt(m) + 1);
    // printf("blockSize = %d\n", blockSize);

    for (int i = 0; i < m; i += blockSize) {
        int curr = std::min(m - 1, i);
        // printf("curr = %d, curr + blockSize = %d\n", curr, curr + blockSize);

        std::sort(E, E + curr, &compareByB);
        ufs.init(n);

        std::vector<Query *> vec;
        for (int j = 0; j < q; j++) {
            if (Q[j].a >= E[curr].a && (curr + blockSize >= m || Q[j].a < E[curr + blockSize].a)) {
                vec.push_back(&Q[j]);
                // printf("getting queries ->  saved  { %d -> %d, [%d, %d] }\n", Q[j].u + 1, Q[j].v + 1, Q[j].a, Q[j].b);
            } else {
                // printf("getting queries -> ignored { %d -> %d, [%d, %d] }\n", Q[j].u + 1, Q[j].v + 1, Q[j].a, Q[j].b);
            }
        }
        std::sort(vec.begin(), vec.end(), &compareQueryByB);

        int j = 0;
        for (std::vector<Query *>::const_iterator it = vec.begin(); it != vec.end(); it++) {
            Query *p = *it;
            while (j < curr && E[j].b <= p->b) {
                Edge &e = E[j];
                ufs.merge(e.u, e.v, e.a, e.b);
                // printf("E(%d -> %d, [%d, %d])\n", e.u + 1, e.v + 1, e.a, e.b);
                j++;
            }

            // static char restoreBuffers[sizeof(UnionFindSet)];
            // memcpy(restoreBuffers, &ufs, sizeof(UnionFindSet));
            size_t s = ufs.status();

            for (int k = curr; k < std::min(curr + blockSize, m); k++) {
            // for (int k = 0; k < m; k++) {
                Edge &e = E[k];
                if (e.a <= p->a && e.b <= p->b) {
                    ufs.merge(e.u, e.v, e.a, e.b);
                }
            }

            int a, b;
            if (ufs.find(p->u, a, b) == ufs.find(p->v)) {
                if (a == p->a && b == p->b) p->ans = true;
                else p->ans = false;
            } else p->ans = false;

            // assert(p->ans == ans[&*p - Q]);

            // if (p - Q + 1 >= 200 && p - Q + 1 <= 220) {
            //     printf("Q(%d -> %d, [%d, %d]) = %s\n", p->u + 1, p->v + 1, p->a, p->b, p->ans ? "Yes" : "No");
            // }

            // p->cnt++;
            // p->solved = true;

            ufs.restore(s);
            // memcpy(&ufs, restoreBuffers, sizeof(UnionFindSet));
        }
    }
}

int main() {
    freopen("multiple.in", "r", stdin);
    freopen("multiple.out", "w", stdout);

    scanf("%d %d", &n, &m);
    for (int i = 0; i < m; i++) {
        scanf("%d %d %d %d", &E[i].u, &E[i].v, &E[i].a, &E[i].b);
        E[i].u--, E[i].v--;
    }

    scanf("%d", &q);
    for (int i = 0; i < q; i++) {
        scanf("%d %d %d %d", &Q[i].u, &Q[i].v, &Q[i].a, &Q[i].b);
        Q[i].u--, Q[i].v--;
    }

    // forceSolve();
    solve();

    for (int i = 0; i < q; i++) {
        // assert(Q[i].solved);
        // printf("%d ", Q[i].cnt);
        puts(Q[i].ans ? "Yes" : "No");
    }

    fclose(stdin);
    fclose(stdout);

    return 0;
}
```
