title: 「SCOI2016」背单词 - Trie + 贪心
categories:
  - OI
tags:
  - BZOJ
  - SCOI
  - Trie
  - 字符串
  - 贪心
permalink: scoi2016-word
date: '2017-04-05 16:27:00'
---

总共有 $ n $ 个单词，对于一个序号为 $ x $ 的单词（序号 $ 1 \ldots x - 1 $ 都已经被填入）：

1. 如果存在一个单词是它的后缀，并且当前没有被填入表内，代价为 $ n \times n $ 颗泡椒才能学会；
2. 当它的所有后缀都被填入表内的情况下，如果在 $ 1 \ldots x - 1 $ 的位置上的单词都不是它的后缀，那么代价为 $ x $；
3. 当它的所有后缀都被填入表内的情况下，如果 $ 1 \ldots x - 1 $ 的位置上存在是它后缀的单词，所有是它后缀的单词中，序号最大为 $ y $，那么代价为 $ x - y $。

<!-- more -->

### 链接

[BZOJ 4567](http://www.lydsy.com/JudgeOnline/problem.php?id=4567)

### 题解

第一种情况一定不会存在 —— 因为这种情况完全可以避免，而且在避免这种情况的情况下，最大代价不会超过 $ n \times n $。

现在相当于，题目多了一个限制条件，每个字符串的后缀必须先被填入。我们把每个字符串反转，转化为每个字符串的前缀必须先被填入。

问题在于，填完一个字符串后，以它为前缀的字符串们被填入的顺序如何确定 —— 我们建立一棵 Trie 树，DFS 求出每个点 $ u $ 向上最近的单词点 $ p(u) $，注意这里的 $ u $ 不一定是 $ p(u) $ 的子节点，$ p(u) $ 可以通过添加一个或多个字符来得到 $ u $。

将每个 $ p(u) $ 与 $ u $ 建立父子节点关系，在新的树上 DFS，优先走子树大小（子树上的单词数量）较小的节点，记录每个节点的 DFS 序即为填写顺序。

### 代码

```cpp
#include <cstdio>
#include <cstring>
#include <vector>
#include <algorithm>

const int MAXN = 100000;
const int MAXL = 510000;
const int CHARSET_SIZE = 26;

struct Node {
    Node *ch[CHARSET_SIZE];
    std::vector<Node *> chWord;
    int size, wordID;
    bool isWord;

    Node() : ch(), size(0), isWord(false) {}
} _pool[MAXL + 1], *_curr = _pool, *rt = new (_curr++) Node;

inline void insert(char *begin, char *end) {
    Node *v = rt;
    for (char *p = begin; p != end; p++) {
        v->size++;
        if (!v->ch[*p]) {
            v->ch[*p] = new (_curr++) Node;
        }
        v = v->ch[*p];
    }
    v->size++;
    v->isWord = true;
}

long long ans;

inline bool compare(Node *a, Node *b) {
    int x = a ? a->size : 0;
    int y = b ? b->size : 0;
    return x < y;
}

inline void dfs(Node *v, Node *lastPrefix) {
    if (v->isWord) {
        lastPrefix->chWord.push_back(v);
    }

    for (int i = 0; i < CHARSET_SIZE; i++) {
        if (v->ch[i]) {
            dfs(v->ch[i], v->isWord ? v : lastPrefix);
        }
    }
}

inline void dfs2(Node *v, int dfnFa) {
    static int ts = 0;
    int dfn = ts++; // root's dfn is 0

    ans += dfn - dfnFa;

    std::sort(v->chWord.begin(), v->chWord.end(), compare);
    for (size_t i = 0; i < v->chWord.size(); i++) {
        dfs2(v->chWord[i], dfn);
    }
}

int main() {
    int n;
    scanf("%d", &n);
    while (n--) {
        static char s[MAXL + 1];
        scanf("%s", s);
        int len = strlen(s);
        for (int i = 0; i < len; i++) s[i] -= 'a';

        std::reverse(s, s + len);
        // puts(s);

        insert(s, s + len);
    }

    dfs(rt, rt);
    dfs2(rt, 0);

    printf("%lld\n", ans);
}
```