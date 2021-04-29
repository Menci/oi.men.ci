title: 「HAOI2008」移动玩具 - 状态压缩 + BFS
categories:
  - OI
tags:
  - BFS
  - BZOJ
  - HAOI
  - 状态压缩
permalink: haoi2008-move
date: '2016-12-13 17:01:00'
---

在一个 $ 4 \times 4 $ 的方框内摆放了若干个相同的玩具，要将这些玩具重新摆放成为理想的状态，规定移动时只能将玩具向上下左右四个方向移动，并且移动到的位置不能有玩具，求最小移动次数。

<!-- more -->

### 链接

[BZOJ 1054](http://www.lydsy.com/JudgeOnline/problem.php?id=1054)

### 题解

将所有 $ 16 $ 个方框的状态存入一个整数的二进制位中，BFS 即可。

### 代码

```cpp
#include <cstdio>
#include <climits>
#include <queue>

const int MAXN = 16;

inline unsigned int read() {
    unsigned int res = 0;
    for (int i = 0; i < 4; i++) {
        char s[4 + 1];
        scanf("%s", s);
        for (int j = 0; j < 4; j++) {
            if (s[j] == '1') res |= (1 << (4 * i + j));
        }
    }
    return res;
}

inline int bfs(unsigned int s, unsigned int t) {
    static int dist[1 << MAXN];
    for (int i = 0; i < (1 << MAXN); i++) dist[i] = INT_MAX;

    std::queue<unsigned int> q;
    dist[s] = 0;
    q.push(s);

    while (!q.empty()) {
        unsigned int v = q.front();
        q.pop();

        if (v == t) return dist[v];

        for (int i = 0; i < 4; i++) {
            for (int j = 0; j < 4; j++) {
                int a = 4 * i + j;
                unsigned int va = !!(v & (1 << a));

                if (i != 3) {
                    int b = 4 * (i + 1) + j;
                    unsigned int vb = !!(v & (1 << b));
                    if (va != vb) {
                        unsigned int u = v;
                        if (vb) u |= (1 << a);
                        else u &= ~(1 << a);

                        if (va) u |= (1 << b);
                        else u &= ~(1 << b);

                        if (dist[u] > dist[v] + 1) {
                            dist[u] = dist[v] + 1;
                            q.push(u);
                        }
                    }
                }
                if (j != 3) {
                    int b = 4 * i + (j + 1);
                    unsigned int vb = !!(v & (1 << b));
                    if (va != vb) {
                        unsigned int u = v;
                        if (vb) u |= (1 << a);
                        else u &= ~(1 << a);

                        if (va) u |= (1 << b);
                        else u &= ~(1 << b);

                        if (dist[u] > dist[v] + 1) {
                            dist[u] = dist[v] + 1;
                            q.push(u);
                        }
                    }
                }
            }
        }
    }

    return -1;
}

int main() {
    unsigned int s = read(), t = read();
    printf("%d\n", bfs(s, t));
    return 0;
}
```