title: 「NOIP2016」蚯蚓 - 队列
categories:
  - OI
tags:
  - NOIP
  - 队列
permalink: noip2016-earthworm
date: '2016-11-29 21:10:00'
---

本题中，我们将用符号 $ \lfloor c \rfloor $ 表示对 $ c $ 向下取整，例如：$ \lfloor 3.0 \rfloor = \lfloor 3.1 \rfloor = \lfloor 3.9 \rfloor = 3 $。

蛐蛐国最近蚯蚓成灾了！隔壁跳蚤国的跳蚤也拿蚯蚓们没办法，蛐蛐国王只好去请神刀手来帮他们消灭蚯蚓。

蛐蛐国里现在共有 $ n $ 只蚯蚓（$ n $ 为正整数）。每只蚯蚓拥有长度，我们设第 $ i $ 只蚯蚓的长度为 $ a_i $（$ i = 1, 2, \ldots , n $），并保证所有的长度都是非负整数（即：可能存在长度为 $ 0 $ 的蚯蚓）。

每一秒，神刀手会在所有的蚯蚓中，准确地找到最长的那一只（如有多个则任选一个）将其切成两半。神刀手切开蚯蚓的位置由常数 $ p $（是满足 $ 0 < p < 1 $ 的有理数）决定，设这只蚯蚓长度为 $ x $，神刀手会将其切成两只长度分别为 $ \lfloor px \rfloor $ 和 $ x - \lfloor px \rfloor $ 的蚯蚓。特殊地，如果这两个数的其中一个等于 $ 0 $，则这个长度为 $ 0 $ 的蚯蚓也会被保留。此外，除了刚刚产生的两只新蚯蚓，其余蚯蚓的长度都会增加 $ q $（是一个非负整常数）。

蛐蛐国王知道这样不是长久之计，因为蚯蚓不仅会越来越多，还会越来越长。蛐蛐国王决定求助于一位有着洪荒之力的神秘人物，但是救兵还需要 $ m $ 秒才能到来 ……（$ m $ 为非负整数）

蛐蛐国王希望知道这 $ m $ 秒内的战况。具体来说，他希望知道：

* $ m $ 秒内，每一秒被切断的蚯蚓被切断前的长度（有 $ m $ 个数）；
* $ m $ 秒后，所有蚯蚓的长度（有 $ n + m $ 个数）。

蛐蛐国王当然知道怎么做啦！但是他想考考你 ……

<!-- more -->

### 链接

[Luogu 2827](https://www.luogu.org/problem/show?pid=2827)  
[LYOI #103](https://ly.men.ci/problem/103)

### 题解

当 $ q = 0 $ 时，如果我们将每次切开后得到的蚯蚓分别放到两个序列中，则这两个序列都是单调的。将最初的蚯蚓排序，作为另一个序列。每次从三个序列中寻找最大值，删除，计算新蚯蚓插入到两个序列中即可。

当 $ q \neq 0 $ 时，每次只有两个新蚯蚓不增加长度，我们可以记录所有的蚯蚓被统一增加的长度，对每次不增加的减去这个长度。显然，单调性仍然满足。

时间复杂度为 $ O(n \log n + m) $。

### 代码

```cpp
#include <cstdio>
#include <algorithm>
#include <queue>

const int MAXN = 100000;
const int MAXM = 7000000;

template <typename T>
struct Queue {
    T a[MAXN + MAXM], *l, *r;

    Queue() : l(a), r(a - 1) {}

    void push(const T &x) { *++r = x; }
    void pop() { ++l; }
    T &front() { return *l; }
    bool empty() const { return l > r; }
};

#ifdef DBG
std::queue<int> q[3];
#else
Queue<int> q[3];
#endif

inline int getMax() {
    int res = -1;
    for (int i = 0; i < 3; i++) if (!q[i].empty() && (res == -1 || q[i].front() > q[res].front())) res = i;
    return res;
}

#ifdef DBG
inline void printAll(int d) {
    std::vector<int> v;
    for (int i = 0; i < 3; i++) {
        std::queue<int> a = ::q[i];
        while (!a.empty()) v.push_back(a.front()), a.pop();
    }
    std::sort(v.begin(), v.end());
    printf("%lu: ", v.size());
    for (std::vector<int>::iterator it = v.begin(); it != v.end(); it++) printf("%d%c", *it, it == --v.end() ? '\n' : ' ');
}
#endif

int main() {
    freopen("earthworm.in", "r", stdin);
    freopen("earthworm.out", "w", stdout);

    int n, m, k, u, v, t;
    scanf("%d %d %d %d %d %d", &n, &m, &k, &u, &v, &t);

    static int a[MAXN + 1];
    for (int i = 1; i <= n; i++) scanf("%d", &a[i]);

    std::sort(a + 1, a + n + 1);

    for (int i = n; i >= 1; i--) q[0].push(a[i]);

    int d = 0;
    for (int i = 1; i <= m; i++) {
        int j = getMax();

        int x = q[j].front();
        q[j].pop();

        x += d;

        if (i % t == 0) printf("%d ", x);

        int a = static_cast<long long>(x) * u / v, b = x - a;

        d += k;
        a -= d, b -= d;

        q[1].push(a), q[2].push(b);
    }

    putchar('\n');

    for (int i = 1; i <= n + m; i++) {
        int j = getMax();
        int x = q[j].front();
        q[j].pop();

        x += d;

        if (i % t == 0) printf("%d ", x);
    }

    putchar('\n');

    fclose(stdin);
    fclose(stdout);

    return 0;
}
```