title: 「NOIP2016」愤怒的小鸟 - 状态压缩 + BFS
categories:
  - OI
tags:
  - BFS
  - NOIP
  - 搜索
  - 状态压缩
permalink: noip2016-angrybirds
date: '2016-11-29 21:21:00'
---

Kiana 最近沉迷于一款神奇的游戏无法自拔。

简单来说，这款游戏是在一个平面上进行的。

有一架弹弓位于 $ (0, 0) $ 处，每次 Kiana 可以用它向第一象限发射一只红色的小鸟，小鸟们的飞行轨迹均为形如 $ y = ax ^ 2 + bx $ 的曲线，其中 $ a $，$ b $ 是 Kiana 指定的参数，且必须满足 $ a < 0 $。

当小鸟落回地面（即 $ x $ 轴）时，它就会瞬间消失。

在游戏的某个关卡里，平面的第一象限中有 $ n $ 只绿色的小猪，其中第 $ i $ 只小猪所在的坐标为 $ (x_i, y_i) $。

如果某只小鸟的飞行轨迹经过了$ (x_i, y_i) $，那么第 $ i $ 只小猪就会被消灭掉，同时小鸟将会沿着原先的轨迹继续飞行；

如果一只小鸟的飞行轨迹没有经过$ (x_i, y_i) $，那么这只小鸟飞行的全过程就不会对第 $ i $ 只小猪产生任何影响。

例如，若两只小猪分别位于 $ (1, 3) $ 和 $ (3, 3) $，Kiana 可以选择发射一只飞行轨迹为 $ y = -x ^ 2 + 4x $ 的小鸟，这样两只小猪就会被这只小鸟一起消灭。

而这个游戏的目的，就是通过发射小鸟消灭所有的小猪。

这款神奇游戏的每个关卡对 Kiana 来说都很难，所以 Kiana 还输入了一些神秘的指令，使得自己能更轻松地完成这个游戏。这些指令将在「输入格式」中详述。

假设这款游戏一共有 $ T $ 个关卡，现在 Kiana 想知道，对于每一个关卡，至少需要发射多少只小鸟才能消灭所有的小猪。由于她不会算，所以希望由你告诉她。

<!-- more -->

### 链接

[Luogu 2831](https://www.luogu.org/problem/show?pid=2831)  
[LYOI #104](https://ly.men.ci/problem/104)

### 题解

在 $ y = ax ^ 2 + bx + c $ 中，考虑到 $ c $ 为常数，两个点即可确定这条抛物线。枚举每两个点，计算过这两个点的抛物线，如果 $ a \leq 0 $ 则舍去，得到 $ O(n ^ 2) $ 条抛物线。枚举每条抛物线，计算有哪些猪在这条抛物线上（即一次操作可以消灭的猪的集合），使用一个二进制数存储。另外，对于不在任何一个合法抛物线上的猪，新增加一条「只过这个猪」的「虚拟」抛物线。

以「当前剩余的猪的集合」为点，每个抛物线为边，建立状态图，BFS 即可得到答案。

时间复杂度 $ O(2 ^ n n ^ 2) $。

### 代码

```cpp
#include <cstdio>
#include <cmath>
#include <climits>
#include <algorithm>
#include <queue>

const int MAXN = 18 + 3;
const int MAXSTATUS = (1 << (MAXN + 1));
const double EPS = 1e-6;

struct Point {
    double x, y;

    Point(double x = 0, double y = 0) : x(x), y(y) {}
} a[MAXN];

inline bool dcmp(double x) {
    return fabs(x) <= EPS;
}

inline bool dcmp(double x, double y) {
    return dcmp(x - y);
}

struct Line {
    double a, b;
    bool valid;
    unsigned int kill;

    Line(unsigned int kill = 0) : a(0), b(0), valid(true), kill(kill) {}

    bool operator<(const Line &other) const {
        return kill > other.kill;
    }

    bool operator==(const Line &other) const {
        return kill == other.kill;
    }
} lines[MAXN * MAXN];

struct Node {
    bool visited;
    int dist;
} N[MAXSTATUS];

int n, cmd, limit, lineCnt;

/*
#ifdef DBG
inline void print(int s) {
    for (int i = 0; i < n; i++) putchar((s & (1u << i)) ? '1' : '0');
}
#endif
*/

inline int bfs(int status) {
    if (!status) return 0;

    std::queue<int> q;
    q.push(status);
    N[status].visited = true;
    N[status].dist = 0;

    while (!q.empty()) {
        int v = q.front();
        q.pop();

        if (N[v].dist == limit) continue;

        for (int i = 1; i <= lineCnt; i++) {
            Line &l = lines[i];
            if (l.valid && (l.kill & status)) {
                int u = v;
                u &= ~l.kill;

                if (!N[u].visited) {
                    N[u].visited = true;
                    N[u].dist = N[v].dist + 1;
                    if (!u) return N[u].dist;
                    q.push(u);
                }
            }
        }
    }

    return n;
}

/*
inline void massert(bool x) {
    if (!x) {
        int b = 0;
        b = 1;
        b = 2;
    }
}
*/

inline Line getLine(const Point &a, const Point &b) {
    Line l;
//    printf("%lf %lf %u\n", l.a, l.b, l.kill);
    // a = (x1 * y2 - x2 * y1) / (x1 * x2 ^ 2 - x2 * x1 ^ 2)
    l.a = (a.x * b.y - b.x * a.y) / (a.x * b.x * b.x - b.x * a.x * a.x);
    // b = (y1 - a * x1 ^ 2) / x1
    l.b = (a.y - l.a * a.x * a.x) / a.x;
//    printf("%lf %lf %u\n", l.a, l.b, l.kill);
//    if (!dcmp(l.b, (b.y - l.a * b.x * b.x) / b.x)) {
//        printf("ERROR: %lf %lf\n", l.b, (b.y - l.a * b.x * b.x) / b.x);
//    }
    return l;
}

inline bool onLine(const Line &l, const Point &a) {
    return dcmp(l.a * a.x * a.x + l.b * a.x, a.y);
}

inline int solve() {
    bool flags[MAXN];
    for (int i = 1; i <= n; i++) flags[i] = false;
    for (int i = 1; i <= n; i++) {
        for (int j = i + 1; j <= n; j++) {
            if (dcmp(a[i].x, a[j].x)) continue;
            Line l = getLine(a[i], a[j]);
            if (l.a >= 0) continue;

            flags[i] = flags[j] = true;
            lines[++lineCnt] = l;
        }
    }

    for (int i = 1; i <= lineCnt; i++) {
        for (int j = 1; j <= n; j++) {
            if (onLine(lines[i], a[j])) {
                lines[i].kill |= (1u << (j - 1));
            }
        }
        /*
#ifdef DBG
        printf("[a = %lf, b = %lf]: ", lines[i].a, lines[i].b);
        print(lines[i].kill);
        putchar('\n');
#endif
        */
    }

    for (int i = 1; i <= n; i++) {
        if (!flags[i]) {
            lines[++lineCnt] = Line(1u << (i - 1));
        }
    }

    std::sort(lines + 1, lines + lineCnt + 1);

    for (int i = 1; i <= lineCnt; i++) {
        for (int j = i + 1; j <= lineCnt; j++) {
            if ((lines[i].kill | lines[j].kill) == lines[i].kill) {
                lines[j].valid = false;
            }
        }
    }

    for (unsigned int i = 0; i < (1u << n); i++) {
        N[i].visited = false;
    }

    return bfs((1u << n) - 1);
}

int main() {
    freopen("angrybirds.in", "r", stdin);
    freopen("angrybirds.out", "w", stdout);

    int t;
    scanf("%d", &t);
    while (t--) {
        scanf("%d %d", &n, &cmd);
        for (int i = 1; i <= n; i++) {
            scanf("%lf %lf", &a[i].x, &a[i].y);
        }
        lineCnt = 0;

        if (cmd == 1) {
            limit = ceil(double(n) / 3 + 1);
        } else {
            limit = n;
        }

        printf("%d\n", solve());
    }

    fclose(stdin);
    fclose(stdout);
}
```