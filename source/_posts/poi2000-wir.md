title: 「POI2000」病毒 - AC 自动机 + 拓扑排序
categories:
  - OI
tags:
  - AC 自动机
  - BZOJ
  - POI
  - 字符串
  - 拓扑排序
permalink: poi2000-wir
date: '2016-09-13 07:46:00'
---

二进制病毒审查委员会最近发现了如下的规律：某些确定的二进制串是病毒的代码。如果某段代码中不存在任何一段病毒代码，那么我们就称这段代码是安全的。现在委员会已经找出了所有的病毒代码段，试问，是否存在一个无限长的安全的二进制代码。

<!-- more -->

### 链接

[BZOJ 2938](http://www.lydsy.com/JudgeOnline/problem.php?id=2938)

### 题解

为病毒代码建立 AC 自动机，如果一个节点是单词节点，或者它可以通过后缀链接转移到单词节点，则这个节点是无效的。

按照 AC 自动机建图，对于每个节点，向在之后添加 $ 0 $ 和 $ 1 $ 所到达的点连边。如果图中包含一个由有效节点组成的环，且 AC 自动机根节点对应节点可以到达这个环，则答案为真。

### 代码

```cpp
#include <cstdio>
#include <cstring>
#include <queue>

const int CHARSET_SIZE = '1' - '0' + 1;
const int BASE_CHAR = '0';
const int MAXN = 30000;

int n;

struct Trie {
    struct Node {
        Node *c[CHARSET_SIZE], *fail, *next;
        bool isWord, visited;
        int id;

        Node(const bool isWord = false) : fail(NULL), next(NULL), isWord(isWord), visited(false) {
            this->id = n++;
            for (int i = 0; i < CHARSET_SIZE; i++) c[i] = NULL;
        }
    } *root;

    Trie() : root(NULL) {}

    void insert(const char *begin, const char *end) {
        Node **v = &root;
        for (const char *p = begin; p != end; p++) {
            if (!*v) *v = new Node();
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
} t;

struct Node {
    struct Edge *e;
    int inDegree;
    bool invalid, flag, visited;
} N[MAXN];

struct Edge {
    Node *s, *t;
    Edge *next;

    Edge(Node *s, Node *t) : s(s), t(t), next(s->e) {}
};

inline void addEdge(const int s, const int t) {
    // printf("Edge(%d, %d)\n", s, t);
    N[s].e = new Edge(&N[s], &N[t]);
    N[t].inDegree++;
}

inline void build() {
    std::queue<Trie::Node *> q;
    q.push(t.root);
    t.root->visited = true;
    while (!q.empty()) {
        Trie::Node *v = q.front();
        q.pop();

        if (v->isWord || v->next) N[v->id].invalid = true;

        for (int i = 0; i < CHARSET_SIZE; i++) {
            Trie::Node *u = v;
            while (u != t.root && !u->c[i]) u = u->fail;
            if (u->c[i]) {
                if (!v->isWord && !v->next && !u->c[i]->isWord) addEdge(v->id, u->c[i]->id);
            } else {
                if (!v->isWord && !v->next) addEdge(v->id, t.root->id);
            }

            if (!v->c[i]) continue;
            v->c[i]->visited = true;
            q.push(v->c[i]);
        }
    }
}

inline bool solve() {
    std::queue<Node *> q;
    int cnt = 0;
    for (int i = 0; i < n; i++) if (!N[i].inDegree && !N[i].invalid) {
        q.push(&N[i]);
        cnt++;
    }

    while (!q.empty()) {
        Node *v = q.front();
        q.pop();

        cnt--;
        v->flag = true;

        for (Edge *e = v->e; e; e = e->next) {
            if (e->t->invalid) continue;
            if (!--e->t->inDegree) {
                q.push(e->t);
            }
        }
    }

    if (!cnt) return false;

    q.push(&N[0]);
    N[0].visited = true;
    while (!q.empty()) {
        Node *v = q.front();
        q.pop();
        if (!v->flag) return true;
        for (Edge *e = v->e; e; e = e->next) if (!e->t->visited && !e->t->invalid) e->t->visited = true, q.push(e->t);
    }

    return false;
}

int main() {
    int n;
    scanf("%d", &n);
    static char s[MAXN + 1];
    while (n--) {
        scanf("%s", s);
        const int len = strlen(s);
        for (int i = 0; i < len; i++) s[i] -= BASE_CHAR;
        t.insert(s, s + len);
    }

    t.build();
    build();

    puts(solve() ? "TAK" : "NIE");

    return 0;
}
```