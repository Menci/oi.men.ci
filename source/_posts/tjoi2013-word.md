title: 「TJOI2013」单词 - AC 自动机
categories:
  - OI
tags:
  - AC 自动机
  - BZOJ
  - TJOI
  - 字符串
permalink: tjoi2013-word
date: '2016-09-12 07:07:00'
---

某人读论文，一篇论文是由许多单词组成。但他发现一个单词会在论文中出现很多次，现在想知道每个单词分别在论文中出现多少次。

<!-- more -->

### 链接

[BZOJ 3172](http://www.lydsy.com/JudgeOnline/problem.php?id=3172)

### 题解

AC 自动机可以用来多模式串匹配。对所有的单词建 AC 自动机，在所有单词中间加一个非字母字符隔开组成论文。在 AC 自动机中匹配论文串，记录每个串的匹配次数即可。

### 代码

```cpp
#include <cstdio>
#include <cstring>
#include <queue>

const int MAXN = 1e6 + 200;
const int CHARSET_SIZE = 'z' - '`' + 1;
const char BASE_CHAR = '`';

struct Trie {
    struct Node {
        Node *c[CHARSET_SIZE], *next, *fail;
        bool isWord;
#ifdef DBG
        char ch;
#endif
        int ans;

        Node(const bool isWord = false) : next(NULL), fail(NULL), isWord(isWord) {
            for (int i = 0; i < CHARSET_SIZE; i++) c[i] = NULL;
        }

        void apply() {
            ans++;
            if (next) next->apply();
        }
    } *root;

    Trie() : root(new Node()) {}

    Node *insert(const char *begin, const char *end) {
        Node **v = &root;
        for (const char *p = begin; p != end; p++) {
            if (!*v) *v = new Node;
            v = &(*v)->c[*p];
        }
        if (!*v) *v = new Node(true);
        else (*v)->isWord = true;
#ifdef DBG
        v = &root;
        for (const char *p = begin; p != end; p++) {
            v = &(*v)->c[*p];
            (*v)->ch = *p + 'a';
        }
#endif
        return *v;
    }

    void build() {
        std::queue<Node *> q;
        q.push(root);
        root->fail = root;
        root->next = NULL;
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

    void exec(const char *begin, const char *end) {
        Node *v = root;
        for (const char *p = begin; p != end; p++) {
            while (v != root && !v->c[*p]) v = v->fail;
            v = v->c[*p] ? v->c[*p] : root;
            if (v->isWord) v->apply();
            else if (v->next) v->next->apply();
        }
    }
} t;

int main() {
    int n;
    scanf("%d", &n);
    static char s[MAXN + 1];
    char *p = s;

    static Trie::Node *node[MAXN];
    for (int i = 0; i < n; i++) {
        static char s[MAXN + 1];
        scanf("%s", s);
        int len = strlen(s);
        for (int i = 0; i < len; i++) s[i] -= BASE_CHAR, *p++ = s[i];
        *p++ = 0;
        node[i] = t.insert(s, s + len);
    }

    *--p = 0;
    // for (char *c = s; c != p; c++) putchar(*c + BASE_CHAR);

    t.build();
    t.exec(s, p);

    for (int i = 0; i < n; i++) printf("%d\n", node[i]->ans);

    return 0;
}
```