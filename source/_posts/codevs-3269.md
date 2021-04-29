title: 「CodeVS 3269」混合背包 - 背包 DP
categories:
  - OI
tags:
  - CodeVS
  - DP
  - 背包 DP
permalink: codevs-3269
date: '2015-11-23 05:00:15'
---

背包体积为 `V`（<= 200,000），给出 `N`（<= 200）个物品，每个物品占用体积为 `Vi`，价值为 `Wi`，每个物品要么至多取 `1` 件，要么至多取 `Mi`（\> 1）件，要么数量无限，求装入背包内物品总价值的最大值。

<!-- more -->

### 链接

[CodeVS 3269](http://codevs.cn/problem/3269/)

### 题解

混合三种背包问题，很经典的一个问题。
首先分开考虑这三种背包问题的解法。
使用动态规划，用 `f[v]` 表示把所有物品按要求装入一个体积为 `v`（`v` <= `V`）的背包时，装入背包内物品总价值的最大值。
首先，对于 01 背包，显而易见其方程为：

$$f[v] = max(f[v], f[v - Vi] + Wi)$$

实现代码（`t[i].v` 和 `t[i].w` 分别代表 `Vi` 和 `Wi`）

```cpp
for (unsigned int i = 0; i < n; i++) {
    for (int v = V; v >= 0; v--) {
        if (v >= t[i].v) {
            f[v] = std::max(f[v], f[v - t[i].v] + t[i].w);
        }
    }
}
```

特别注意第二层循环枚举 `v` 时的顺序，`v` 必须从 `V` 到 `0` 循环，因为当前 `f[v]` 要根据一个当 `v` 更小时的 `f[v]` 推出（为了腾出大小为 `Vi` 的空间防第 `i` 件物品），保证在计算 `f[v]` 时，`f[v - Vi]` 一定是**没有尝试过**放置第 `i` 件物品时的状态。

对于完全背包，我们可以将其每件拆分成 `V` / `Vi` 件 `01` 背包物品，对每件物品进行一次 01 背包处理。但显然这样做效率会很低。
考虑到完全背包与 01 背包的不同点，仅在于 01 背包每种物品**只能放置一次**，而完全背包可以放置**任意次**，将其体现在动态规划的状态转移上，即完全背包问题，需要保证在计算 `f[v]` 时，`f[v - Vi]` 一定是**已经尝试过**放置第 `i` 件物品时的状态。而只需将第二层循环 `v` 的遍历顺序改为从 `0` 到 `V` 即可。
实现代码为（`t[i].v` 和 `t[i].w` 分别代表 `Vi` 和 `Wi`）：

```cpp
for (unsigned int i = 0; i < n; i++) {
    for (unsigned int v = 0; v <= V; v++) {
        if (v >= t[i].v) {
            f[v] = std::max(f[v], f[v - t[i].v] + t[i].w);
        }
    }
}
```

这两段代码的差异比较难理解，这里举个例子：背包容量 `V = 10`，仅有一件物品体积 `Vi = 3`，价值 `Wi = 5`，现将这件物品尝试放入背包。

如果这件物品是 `01` 背包：
当 `v = 10` 时，**`f[v - Vi] = f[7] = 0`**，`f[v]` 被更新为 `5`。
当 `v = 9` 时，`f[v - Vi] = f[6] = 0`，`f[v]` 被更新为 `5`。
当 `v = 8` 时，`f[v - Vi] = f[5] = 0`，`f[v]` 被更新为 `5`。
**当 `v = 7` 时，`f[v - Vi] = f[4] = 0`，`f[v]` 被更新为 `5`。**  
……  
当 `v = 4` 时，`f[v - Vi] = f[1] = 0`，`f[v]` 被更新为 `5`。
当 `v = 3` 时，`f[v - Vi] = f[0] = 0`，`f[v]` 被更新为 `5`。

如果这件物品是完全背包：
当 `v = 3` 时，**`f[v - Vi] = f[0] = 0`**，`f[v]` 被更新为 `5`。
当 `v = 4` 时，`f[v - Vi] = f[1] = 0`，`f[v]` 被更新为 `5`。
……  
**当 `v = 6` 时，`f[v - Vi] = f[3] = 5`，`f[v]` 被更新为 `10`。**  
……  
**当 `v = 9` 时，`f[v - Vi] = f[6] = 10`，`f[v]` 被更新为 `15`。**  
当 `v = 10` 时，`f[v - Vi] = f[7] = 10`，`f[v]` 被更新为 `15`。

以上例子可以体现出 01 背包与完全背包解法上的区别与问题实质的联系。

回到原来的话题上来，我们已经解决了前两类问题——01 背包和完全背包，现在来看多重背包。
还是考虑拆分，把一件可以装 `Mi` 次的多重背包物品拆分成 `Mi` 件 01 背包物品，分别对其进行 01 背包处理。这种方法很好理解，但时间复杂度达到了$O(V*{\Sigma}Mi)$，考虑将其优化。
我们采用类似二进制的思想，将每个多重背包物品拆分为 `t` 个不同的 01 背包物品，每一个拆分后的物品都有一个系数 `k`，该物品的体积和价值分别等于**原物品的体积和价值乘以这个系数**，并且使所有拆分后的物品的系数之和${\Sigma}k = Mi$，即原物品最多被放置的次数。并且要使每个系数 `k` 分别为 $1$,$2$,$4$,…,$2 ^ {t - 1}$,$Wi - 2 ^ {t - 1}$。
举个例子，当 `Mi = 17` 时，将其拆成 `5` 件物品，系数 `k` 分别为 `1`,`2`,`4`,`8`,`2`。
使用二进制思想优化过的算法，复杂度降为了$O(V * {\Sigma}{\log}Wi)$。
实现代码为（`t[i].v` 和 `t[i].w` 分别代表 `Vi` 和 `Wi`）：

```cpp
for (unsigned int i = 0; i < n; i++) {
    unsigned int logx = log2(t[i].m), x = 0;
    for (unsigned int j = 0; j <= logx; j++) {
        x += (1 << j); // 1 << j 将 1 按二进制位左移 j 位，快速计算 2 的 j 次方
        for (int v = V; v >= 0; v--) { // 01 背包
            if (v >= t[i].v * (1 << j)) {
                f[v] = std::max(f[v], f[v - t[i].v * (1 << j)] + t[i].w * (1 << j));
            }
        }
    }

    if (x < t[i].m) { // 如果不能 2 的幂作为系数将原物品完全拆分，则多拆分出一件物品 k = Wi - 2 ^ (t - 1)
        for (int v = V; v >= 0; v--) { // 01 背包
            if (v >= t[i].v * (t[i].m - x)) {
                f[v] = std::max(f[v], f[v - t[i].v * (t[i].m - x)] + t[i].w * (t[i].m - x));
            }
        }
    }
}
```

三种背包问题的思路明确后，就可以考虑混合背包问题了，具体实现方法是对于每一种物品，判断物品类型，分别进行处理。

### 代码

```cpp
#include <cstdio>
#include <algorithm>

const unsigned int MAXN = 200;
const unsigned int MAXV = 200000;

unsigned int n, V;

struct thing_t {
    unsigned int v, w;
    int m;
} t[MAXN];

unsigned int f[MAXV + 1];

inline bool isempty(char ch) {
    return ch != '-' && (ch < '0' || ch > '9');
}

template <typename T>
inline void read(T &x) {
    x = 0;
    register char ch;
    while (isempty(ch = getchar()));

    register bool flag = false;
    if (ch == '-') {
        ch = getchar();
        flag = true;
    }

    do {
        x = x * 10 + (ch - '0');
    } while (!isempty(ch = getchar()));

    if (flag) {
        x = -x;
    }
}

unsigned int log2(unsigned int x) {
    unsigned int i = 0, y = 0;
    while ((y += (1 << i)) <= x) {
        i++;
    }
    return i - 1;
}

int main() {
    read(n), read(V);

    for (unsigned int i = 0; i < n; i++) {
        read(t[i].v), read(t[i].w), read(t[i].m);
    }

    register unsigned int result = 0;
    for (unsigned int i = 0; i < n; i++) {
        if (t[i].m == 1) {
            for (int v = V; v >= 0; v--) {
                if (v >= t[i].v) {
                    f[v] = std::max(f[v], f[v - t[i].v] + t[i].w);
                    result = std::max(result, f[v]);
                }
            }
        } else if (t[i].m == -1) {
            for (unsigned int v = 0; v <= V; v++) {
                if (v >= t[i].v) {
                    f[v] = std::max(f[v], f[v - t[i].v] + t[i].w);
                    result = std::max(result, f[v]);
                }
            }
        } else {
            unsigned int logx = log2(t[i].m), x = 0;
            for (unsigned int j = 0; j <= logx; j++) {
                x += (1 << j);
                for (int v = V; v >= 0; v--) {
                    if (v >= t[i].v * (1 << j)) {
                        f[v] = std::max(f[v], f[v - t[i].v * (1 << j)] + t[i].w * (1 << j));
                        result = std::max(result, f[v]);
                    }
                }
            }

            if (x < t[i].m) {
                for (int v = V; v >= 0; v--) {
                    if (v >= t[i].v * (t[i].m - x)) {
                        f[v] = std::max(f[v], f[v - t[i].v * (t[i].m - x)] + t[i].w * (t[i].m - x));
                        result = std::max(result, f[v]);
                    }
                }
            }
        }
    }

    printf("%u\n", result);

    return 0;
}
```

### 吐槽

这段时间在学习 dp，听 liujz 学长讲完后自己抱着书啃了好久 ……  
算是有些理解了吧 >_<
