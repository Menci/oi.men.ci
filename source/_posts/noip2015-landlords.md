title: 「NOIP2015」斗地主 - 搜索
categories:
  - OI
tags:
  - BZOJ
  - CodeVS
  - NOIP
  - 搜索
permalink: noip2015-landlords
date: '2016-10-19 16:30:00'
---

给一组扑克牌，按照斗地主的规则出牌，求最少多少次出完。

<!-- more -->

### 链接

[BZOJ 4325](http://www.lydsy.com/JudgeOnline/problem.php?id=4325)  
[CodeVS 4610](http://codevs.cn/problem/4610/)

### 题解

以每种点数的牌的数量为状态（状态可压缩进一个 64 位整数中），搜索。

### 代码

```cpp
#include <cstdio>
#include <climits>
#include <vector>
#include <algorithm>

const int MAXN = 13;

const int CARD_JOKER = 0;
const int CARD_2 = 1;
const int CARD_3 = 2;
const int CARD_4 = 3;
const int CARD_5 = 4;
const int CARD_6 = 5;
const int CARD_7 = 6;
const int CARD_8 = 7;
const int CARD_9 = 8;
const int CARD_10 = 9;
const int CARD_J = 10;
const int CARD_Q = 11;
const int CARD_K = 12;
const int CARD_A = 13;

typedef unsigned long long Status;

inline int id(const int x) {
    if (x == 1) return 13;
    return (x >= 2 && x <= 13) ? (x - 1) : x;
}

inline int get(const Status &s, const int index) {
    return (s >> (index << 2)) & 15ll;
}

#ifdef DBG
inline void print(const Status &s, const bool newLine = true) {
    // for (int i = 0; i < 64; i++) putchar((s & (1ll << i)) ? '1' : '0');
    for (int i = 0; i < 14; i++) printf("%d ", get(s, i));
    if (newLine) putchar('\n');
}
#endif

inline void set(Status &s, const int index, const int val) {
    /*
    if (val < 0) {
        puts("???");
    }
    */
#ifdef DBG
    print(s, false);
    printf("=> ");
#endif
    s &= ~(15ll << (index << 2));
    s |= (val & 15ll) << (index << 2);
#ifdef DBG
    print(s);
#endif
}

inline void change(Status &s, const int index, const int delta) {
    set(s, index, get(s, index) + delta);
}

int n, ans;
// std::tr1::unordered_map<Status, int> map;

struct HashMap {
    const static int HASH_SIZE = 7979717;
    struct Node {
        Status key;
        int val, time;
    } N[HASH_SIZE];

    int time;

    HashMap() : time(1) {}

    int locate(const Status &key) {
        int i;
        for (i = key % HASH_SIZE; N[i].time == time && N[i].key != key; (i < HASH_SIZE - 1) ? (i++) : (i = 0));
        if (N[i].time != time) {
            N[i].time = time;
            N[i].key = key;
            N[i].val = INT_MAX;
        }
        return i;
    }

    int &operator[](const Status &key) {
        return N[locate(key)].val;
    }

    void clear() {
        time++;
    }
} map;

inline void search(const Status &s, const int step = 0) {
#ifdef DBG
    print(s, false);
    printf("[%d, %d]\n", step, ans);
#endif
    if (step >= ans) return;

    int &x = map[s];
    if (step >= x) return;
    x = step;

    /*
    std::tr1::unordered_map<Status, int>::iterator it = map.find(s);
    if (it != map.end() && step >= it->second) return;
    map[s] = step;
    */

    if (!s) {
        ans = step;
        return;
    }

    // 333 444
    for (int i = CARD_3; i <= CARD_K; i++) {
        Status next = s;
        int x = get(next, i);
        if (x < 3) {
            continue;
        } else set(next, i, x - 3);

        for (int j = i + 1; j <= CARD_A; j++) {
            int x = get(next, j);
            if (x < 3) {
                break;
            } else {
                set(next, j, x - 3);
                search(next, step + 1);
            }
        }
    }

    // 33 44 55
    for (int i = CARD_3; i <= CARD_Q; i++) {
        bool valid = true;
        Status next = s;
        for (int j = i; j < i + 2; j++) {
            int x = get(next, j);
            if (x < 2) {
                valid = false;
                break;
            } else set(next, j, x - 2);
        }
        if (!valid) continue;

        for (int j = i + 2; j <= CARD_A; j++) {
            int x = get(next, j);
            if (x < 2) {
                break;
            } else {
                set(next, j, x - 2);
                search(next, step + 1);
            }
        }
    }

    // 3 4 5 6 7
    for (int i = CARD_3; i <= CARD_10; i++) {
        bool valid = true;
        Status next = s;
        for (int j = i; j < i + 4; j++) {
            int x = get(next, j);
            if (x < 1) {
                valid = false;
                break;
            } else set(next, j, x - 1);
        }
        if (!valid) continue;

        for (int j = i + 4; j <= CARD_A; j++) {
            int x = get(next, j);
            if (x < 1) {
                break;
            } else {
                set(next, j, x - 1);
                search(next, step + 1);
            }
        }
    }

    std::vector<int> four, three, two, one;
    for (int i = CARD_JOKER; i <= CARD_A; i++) {
        int x = get(s, i);
        if (x == 4) four.push_back(i);
        else if (x == 3) three.push_back(i);
        else if (x == 2) two.push_back(i);
        else if (x == 1) one.push_back(i);
    }

    // 2222 [3 4] / 2222 [33 44]
    for (std::vector<int>::const_iterator it = four.begin(); it != four.end(); it++) {
        Status tmp = s;
        set(tmp, *it, 0);

        for (std::vector<int>::const_iterator a = two.begin(); a != two.end(); a++) {
            if (*a == 0) continue;
            for (std::vector<int>::const_iterator b = a + 1; b != two.end(); b++) {
                if (*b == 0) continue;
                Status next = tmp;
                set(next, *a, 0);
                set(next, *b, 0);
                search(next, step + 1);
            }

            for (std::vector<int>::const_iterator b = three.begin(); b != three.end(); b++) {
                Status next = tmp;
                change(next, *a, -2);
                change(next, *b, -2);
                search(next, step + 1);
            }

            Status next = tmp;
            set(next, *a, 0);
            search(next, step + 1);
        }

        for (std::vector<int>::const_iterator a = four.begin(); a != four.end(); a++) {
            if (*a == *it) continue;
            Status next = tmp;
            set(next, *a, 0);
            search(next, step + 1);
        }

        for (std::vector<int>::const_iterator a = one.begin(); a != one.end(); a++) {
            for (std::vector<int>::const_iterator b = a + 1; b != one.end(); b++) {
                Status next = tmp;
                set(next, *a, 0);
                set(next, *b, 0);
                search(next, step + 1);
            }

            for (std::vector<int>::const_iterator b = three.begin(); b != three.end(); b++) {
                Status next = tmp;
                change(next, *a, -1);
                change(next, *b, -1);
                search(next, step + 1);
            }
        }

        search(tmp, step + 1);
    }

    // 222 [3] / 222 [33]
    for (std::vector<int>::const_iterator it = three.begin(); it != three.end(); it++) {
        Status tmp = s;
        set(tmp, *it, 0);

        for (std::vector<int>::const_iterator a = three.begin(); a != three.end(); a++) {
            if (*a == *it) continue;
            Status next = tmp;
            change(next, *a, -1);
            search(next, step + 1);
            change(next, *a, -1);
            search(next, step + 1);
        }

        for (std::vector<int>::const_iterator a = two.begin(); a != two.end(); a++) {
            if (*a == 0) {
                // Take only one joker
                Status next = tmp;
                set(next, *a, 1);
                search(next, step + 1);
                continue;
            }
            Status next = tmp;
            set(next, *a, 0);
            search(next, step + 1);
        }

        for (std::vector<int>::const_iterator a = one.begin(); a != one.end(); a++) {
            Status next = tmp;
            set(next, *a, 0);
            search(next, step + 1);
        }

        search(tmp, step + 1);
    }

    // 22
    for (std::vector<int>::const_iterator it = two.begin(); it != two.end(); it++) {
        Status next = s;
        set(next, *it, 0);
        search(next, step + 1);
    }

    // 2
    for (std::vector<int>::const_iterator it = one.begin(); it != one.end(); it++) {
        Status next = s;
        set(next, *it, 0);
        search(next, step + 1);
    }
}

int main() {
    int t;
    scanf("%d %d", &t, &n);
    while (t--) {
        Status init = 0;
        for (int i = 0; i < n; i++) {
            int a, b;
            scanf("%d %d", &a, &b);
            change(init, id(a), 1);
        }

        map.clear();
        ans = INT_MAX;
        search(init);

        printf("%d\n", ans);
    }

    return 0;
}
```