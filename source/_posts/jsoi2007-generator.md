title: 「JSOI2007」文本生成器 - AC 自动机
categories:
  - OI
tags:
  - AC 自动机
  - BZOJ
  - DP
  - JSOI
  - 字符串
permalink: jsoi2007-generator
date: '2016-09-12 07:19:00'
---

「文本生成器」可以随机生成一些文章 ―― 总是生成一篇长度固定且完全随机的文章 —— 也就是说，生成的文章中每个字节都是完全随机的。

如果一篇文章中至少包含使用者们了解的一个单词，那么我们说这篇文章是可读的（我们称文章 $ a $ 包含单词 $ b $，当且仅当单词 $ b $ 是文章 $ a $ 的子串）。

求生成的所有文本中可读文本的数量。

<!-- more -->

### 链接

[BZOJ 1030](http://www.lydsy.com/JudgeOnline/problem.php?id=1030)

### 题解

首先，考虑只有一个单词的情况，这个单词出现了，当且仅当之前连续若干个位置匹配了单词的前面若干个字符，并且当前字符是单词的最后一个字符。

我们可以设计 DP 状态 —— 还要生成 $ i $ 个字符，在这之前生成的最后若干个字符匹配了单词中的前 $ j $ 个字符，最终生成串不包含单词串方案数。枚举第一个字符，尝试继续匹配，如果不能匹配则跳转到 KMP 的失配位置。

对于多个单词的情况，只需要将 KMP 改为 AC 自动机即可，「匹配了单词中的前 $ j $ 个字符」改为「当前状态为 AC 自动机的节点 $ j $」。

### 代码

```cpp
#include <cstdio>
#include <cstring>
#include <queue>
#include <vector>

const int MAXN = 60;
const int MAXM = 100;
const int CHARSET_SIZE = 'Z' - 'A' + 1;
const char BASE_CHAR = 'A';
const int MOD = 10007;

struct Trie {
    struct Node {
        int id;
        Node *c[CHARSET_SIZE], *fail, *next;
        bool isWord;

        Node(const bool isWord = false) : fail(NULL), next(NULL), isWord(isWord) {
            for (int i = 0; i < CHARSET_SIZE; i++) c[i] = NULL;
        }
    } *root;

    Trie() : root(NULL) {}

    void insert(const char *begin, const char *end) {
        Node **v = &root;
        for (const char *p = begin; p != end; p++) {
            if (!*v) *v = new Node(false);
            v = &(*v)->c[*p];
        }
        if (!*v) *v = new Node(true);
        else (*v)->isWord = true;
    }

    void build() {
        std::queue<Node *> q;
        q.push(root);
        root->fail = root, root->next = NULL;
        while (!q.empty()) {
            Node *v = q.front();
            q.pop();

            for (int i = 0; i < CHARSET_SIZE; i++) {
                Node *&c = v->c[i];
                if (!c) continue;
                Node *u = v->fail;
                while (u != root && !u->c[i]) u = u->fail;
                c->fail = v != root && u->c[i] ? u->c[i] : root;
                c->next = c->fail->isWord ? c->fail : c->fail->next;
                q.push(c);
            }
        }
    }

    bool next(Node *v, const char ch, Node *&next) {
        while (v != root && !v->c[ch]) v = v->fail;
        next = v->c[ch] ? v->c[ch] : root;
        if (!v->c[ch]) return false;
        else if (v->c[ch]->isWord) return true;
        else if (v->c[ch]->next) return true;
        else return false;
    }

    void getNodeList(std::vector<Node *> &vec) {
        std::queue<Node *> q;
        q.push(root);
        while (!q.empty()) {
            Node *v = q.front();
            q.pop();
            vec.push_back(v);
            for (int i = 0; i < CHARSET_SIZE; i++) if (v->c[i]) q.push(v->c[i]);
        }
    }
} t;

inline int pow(int x, int n) {
    int ans = 1;
    for (; n; n >>= 1, x = x * x % MOD) if (n & 1) ans = ans * x % MOD;
    return ans;
}

int main() {
    int n, m;
    scanf("%d %d", &n, &m);
    while (n--) {
        char s[MAXM + 1];
        scanf("%s", s);
        int len = strlen(s);
        for (int i = 0; i < len; i++) s[i] -= BASE_CHAR;
        t.insert(s, s + len);
    }

    t.build();

    std::vector<Trie::Node *> vec;
    t.getNodeList(vec);

    // std::tr1::unordered_map<Trie::Node *, int> f[MAXM + 1];
    static int f[MAXM + 1][MAXM * MAXN + 1];
    // for (size_t i = 0; i < vec.size(); i++) for (int j = 0; j < CHARSET_SIZE; j++) if (!vec[i]->c[j] || !vec[i]->c[j]->isWord) f[1][vec[i]]++;
    for (size_t i = 0; i < vec.size(); i++) vec[i]->id = i, f[0][i] = 1;

    for (int i = 1; i <= m; i++) {
        for (size_t j = 0; j < vec.size(); j++) {
            for (int k = 0; k < CHARSET_SIZE; k++) {
                Trie::Node *next;
                if (!t.next(vec[j], k, next)) {
                    (f[i][j] += f[i - 1][next->id]) %= MOD;
                    // if (k <= 5) printf("(%d, %lu) => %d (%d)\n", i, j, k, f[i - 1][next]);
                }
            }
        }
    }

    /*
    for (int i = 1; i <= m; i++) {
        for (size_t j = 0; j < vec.size(); j++) printf("f(%d, %lu) = %d\n", i, j, f[i][vec[j]]);
        putchar('\n');
    }
    // */

    // printf("%d\n", f[m][t.root]);
    printf("%d\n", ((pow(CHARSET_SIZE, m) - f[m][t.root->id]) % MOD + MOD) % MOD);

    return 0;
}
```