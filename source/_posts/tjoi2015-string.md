title: 「TJOI2015」弦论 - SAM
categories:
  - OI
tags:
  - BZOJ
  - SAM
  - TJOI
permalink: tjoi2015-string
date: '2017-04-06 16:46:00'
---

对于一个给定长度为 $ n $ 的字符串，求它的字典序第 $ k $ 小的子串。

<!-- more -->

### 链接

[BZOJ 3998](http://www.lydsy.com/JudgeOnline/problem.php?id=3998)

### 题解

对串建立 SAM，预处理出每个节点沿着转移边向下走能走到的节点数量和节点的 $ \text{end-pos} $ 大小之和，然后用类似权值线段树的方式查找第 $ k $ 小。

### 代码

```cpp
#include <cstdio>
#include <cstring>
#include <vector>

const int MAXN = 5e5;
const int CHARSET_SIZE = 26;

struct SuffixAutomaton {
    struct Node {
        Node *ch[CHARSET_SIZE], *next;
        int max, posCnt, size, sizeAll;

        Node(int max = 0, bool newSuffix = false) : ch(), next(NULL), max(max), posCnt(newSuffix) {}

        int getMin() {
            return next->max + 1;
        }
    } *start, *last, _pool[MAXN * 2 + 1], *_curr;

    std::vector<Node *> topo;

    void init() {
        _curr = _pool;
        start = last = new (_curr++) Node;
    }

    Node *extend(int c) {
        Node *u = new (_curr++) Node(last->max + 1, true), *v = last;
        do {
            v->ch[c] = u;
            v = v->next;
        } while (v && !v->ch[c]);

        if (!v) {
            u->next = start;
        } else if (v->ch[c]->max == v->max + 1) {
            u->next = v->ch[c];
        } else {
            Node *n = new (_curr++) Node(v->max + 1, false), *o = v->ch[c];
            std::copy(o->ch, o->ch + CHARSET_SIZE, n->ch);
            n->next = o->next;
            o->next = u->next = n;
            for (; v && v->ch[c] == o; v = v->next) v->ch[c] = n;
        }

        last = u;
        return u;
    }

    std::vector<Node *> &toposort() {
        static int buc[MAXN * 2 + 1];

        int max = 0;
        for (Node *p = _pool; p != _curr; p++) {
            max = std::max(max, p->max);
            buc[p->max]++;
        }
        for (int i = 1; i <= max; i++) buc[i] += buc[i - 1];

        topo.resize(_curr - _pool);
        for (Node *p = _pool; p != _curr; p++) {
            topo[--buc[p->max]] = p;
        }

        return topo;
    }

    void calc() {
        toposort();

        for (int i = topo.size() - 1; i > 0; i--) {
            Node *v = topo[i];
            v->next->posCnt += v->posCnt;
        }

        for (int i = topo.size() - 1; i > 0; i--) {
            Node *v = topo[i];
            v->size = 1;
            v->sizeAll = v->posCnt;

            for (int j = 0; j < CHARSET_SIZE; j++) {
                if (v->ch[j]) {
                    v->size += v->ch[j]->size;
                    v->sizeAll += v->ch[j]->sizeAll;
                }
            }

            // printf("topo[%d]: (max = %d, min = %d, wordCnt = %d / %d, posCnt = %d, size = %d, sizeAll = %d)\n", i, v->max, v->getMin(), v->getWordCnt(true), v->getWordCnt(false), v->posCnt, v->size, v->sizeAll);
        }
    }
} sam;

inline void solveNoDup(int k) {
    SuffixAutomaton::Node *v = sam.start;
    while (k) {
        bool flag = false;
        for (int i = 0; i < CHARSET_SIZE; i++) {
            if (v->ch[i]) {
                if (k - v->ch[i]->size <= 0) {
                    v = v->ch[i];
                    k--;
                    putchar('a' + i);
                    flag = true;
                    break;
                } else k -= v->ch[i]->size;
            }
        }

        if (!flag) {
            puts("-1");
            return;
        }
    }
    putchar('\n');
}

inline void solveDup(int k) {
    SuffixAutomaton::Node *v = sam.start;
    while (k) {
        bool flag = false;
        for (int i = 0; i < CHARSET_SIZE; i++) {
            if (v->ch[i]) {
                if (k - v->ch[i]->sizeAll <= 0) {
                    v = v->ch[i];
                    k -= v->posCnt;
                    putchar('a' + i);
                    flag = true;
                    break;
                } else k -= v->ch[i]->sizeAll;
            }
        }

        if (!flag) {
            puts("-1");
            return;
        }
    }
    putchar('\n');
}

int main() {
    static char s[MAXN + 1];
    scanf("%s", s);
    int n = strlen(s);

    sam.init();
    for (int i = 0; i < n; i++) sam.extend(s[i] - 'a');

    sam.calc();

    int t, k;
    scanf("%d %d", &t, &k);
    if (t == 0) solveNoDup(k);
    else solveDup(k);

    return 0;
}
```