title: 「SDOI2008」Sandy 的卡片 - 差分 + SAM
categories:
  - OI
tags:
  - BZOJ
  - SAM
  - SDOI
  - 差分
permalink: sdoi2008-card
date: '2017-04-05 21:50:00'
---

相同的定义为：两个子串长度相同且一个串的全部元素加上一个数就会变成另一个串。给 $ n $ 个串，求它们相同的子串最大长度。

<!-- more -->

### 链接

[BZOJ 4698](http://www.lydsy.com/JudgeOnline/problem.php?id=4698)

### 题解

将每个串差分（转化 $ b_i = a_{i} - a_{i - 1} $），转化为求最长公共子串，然后将结果 $ +1 $ 即为答案。

对第一个串建立 SAM，对 SAM 的每个节点维护当前匹配长度。对于每个串，将其放在 SAM 上运行，在每个节点处走到这个节点时这个串的最长匹配后缀长度。然后用每个点的当前匹配长度去更新其后缀链接指向节点的当前匹配长度（$ v $ 能匹配这么长，则 $ \text{next}(v) $ 也能匹配这么长）。每个串的匹配长度取最小值，即为最长的公共「这个节点上字符串」长度。对每个节点的这个值去最大，即为答案。

### 代码

```cpp
#include <cstdio>
#include <climits>
#include <vector>
#include <algorithm>
#include <map>

const int MAXN = 1000;
const int MAXL = 1000;

struct SuffixAutomaton {
    struct Node {
        std::map<int, Node *> ch;
        Node *next;
        int max, currMatch, minMatch;

        Node(int max = 0) : next(NULL), max(max), currMatch(0), minMatch(max) {}
    } *start, *last, _pool[MAXL * 2 + 1], *_curr;

    std::vector<Node *> topo;

    void init() {
        _curr = _pool;
        start = last = new (_curr++) Node;
    }

    Node *extend(int c) {
        Node *u = new (_curr++) Node(last->max + 1), *v = last;

        for (; v && !v->ch[c]; v = v->next) v->ch[c] = u;

        if (!v) {
            u->next = start;
        } else if (v->ch[c]->max == v->max + 1) {
            u->next = v->ch[c];
        } else {
            Node *o = v->ch[c], *n = new (_curr++) Node(v->max + 1);
            n->ch = o->ch;
            n->next = o->next;
            u->next = o->next = n;
            for (; v && v->ch[c] == o; v = v->next) v->ch[c] = n;
        }

        last = u;
        return u;
    }

    std::vector<Node *> toposort() {
        static int buc[MAXL * 2 + 1];
        int max = 0;
        for (Node *p = _pool; p != _curr; p++) {
            buc[p->max]++;
            max = std::max(max, p->max);
        }

        for (int i = 1; i <= max; i++) buc[i] += buc[i - 1];

        topo.resize(_curr - _pool);
        for (Node *p = _pool; p != _curr; p++) topo[--buc[p->max]] = p;

        std::fill(buc, buc + max + 1, 0);

        return topo;
    }
} sam;

inline int lcs(std::vector<int> a[], int n) {
    sam.init();
    for (int i = 1; i <= int(a[1].size()); i++) {
        sam.extend(a[1][i]);
    }

    int ans = a[1].size() - 1;
    std::vector<SuffixAutomaton::Node *> topo = sam.toposort();
    for (int i = 2; i <= n; i++) {
        SuffixAutomaton::Node *v = sam.start;
        int l = 0;
        for (int j = 1; j <= int(a[i].size()); j++) {
            int c = a[i][j];

            while (v != sam.start && !v->ch.count(c)) {
                v = v->next;
                l = v->max;
            }

            if (v->ch.count(c)) {
                v = v->ch[c];
                l++;
            }

            v->currMatch = std::max(v->currMatch, l);
        }

        int tmp = 0;
        for (int i = topo.size() - 1; i > 0; i--) {
            SuffixAutomaton::Node *v = topo[i];
            v->next->currMatch = std::max(v->next->currMatch, v->currMatch);
            v->minMatch = std::min(v->minMatch, v->currMatch);
            v->currMatch = 0;

            tmp = std::max(tmp, v->minMatch);
        }

        ans = std::min(ans, tmp);
    }

    return ans;
}

int main() {
    int n;
    scanf("%d", &n);

    static std::vector<int> a[MAXN + 1];
    int maxAns = INT_MAX;
    for (int i = 1; i <= n; i++) {
        int m;
        scanf("%d", &m);

        maxAns = std::min(maxAns, m);

        a[i].resize(m + 1);
        for (int j = 1; j <= m; j++) {
            scanf("%d", &a[i][j]);
        }

        for (int j = m; j > 1; j--) a[i][j] -= a[i][j - 1];
    }

    printf("%d\n", std::min(lcs(a, n) + 1, maxAns));
}
```