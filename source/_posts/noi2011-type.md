title: 「NOI2011」阿狸的打字机 - AC 自动机
categories:
  - OI
tags:
  - AC 自动机
  - BZOJ
  - NOI
  - 字符串
permalink: noi2011-type
date: '2016-09-12 07:38:00'
---

打字机上只有 $ 28 $ 个按键，分别印有 $ 26 $ 个小写英文字母和 `B`、`P` 两个字母。

经阿狸研究发现，这个打字机是这样工作的：

* 输入小写字母，打字机的一个凹槽中会加入这个字母（这个字母加在凹槽的最后）。
* 按一下印有 `B` 的按键，打字机凹槽中最后一个字母会消失。
* 按一下印有 `P` 的按键，打字机会在纸上打印出凹槽中现有的所有字母并换行，但凹槽中的字母不会消失。

我们把纸上打印出来的字符串从 $ 1 $ 开始顺序编号，一直到 $ n $。打字机有一个非常有趣的功能，在打字机中暗藏一个带数字的小键盘，在小键盘上输入两个数 $ (x, y) $（其中 $ 1 \leq x, y \leq n $），打字机会显示第 $ x $ 个打印的字符串在第 $ y $ 个打印的字符串中出现了多少次。

<!-- more -->

### 链接

[BZOJ 2434](http://www.lydsy.com/JudgeOnline/problem.php?id=2434)

### 题解

使用 Trie 储存操作序列，问题转化为，在 Trie 上求一个单词在另一个单词中的出现次数。

建立 AC 自动机，可以发现如果 $ y $ 中出现了 $ x $，那么 $ y $ 到根路径上的某个节点的 `fail` 指针（直接或间接地）指向 $ x $。问题转化为，在 AC 自动机上求 $ y $ 到根的路径上有多少节点可以经过 `fail` 指针转移到 $ x $。

将 `fail` 指针反向，形成一棵树，称为 Fail 树。在 Fail 树上，子节点可以在 AC 自动机上经过 `fail` 指针转移到父节点上。问题转化，AC 自动机中在 $ y $ 到根路径上的节点，有多少个在 Fail 树上对应节点在 $ x $ 的子树中。

考虑这样一种暴力 —— 在 AC 自动机上从根走到 $ y $，对于经过的每一个节点，将它在 Fail 树上对应节点的权值置为 $ 1 $，之后枚举要对 $ y $ 查询的所有 $ x $，每一次的答案即为 $ x $ 在 Fail 树上子树中所有节点的权值和。

对于子树权值和，我们可以用 DFS 序 + 树状数组维护。根据按照操作序列重新遍历 AC 自动机，进入每个节点时，它在 Fail 树上对应节点的权值置为 $ 1 $，退出时置为 $ 0 $，每次走到一个单词节点时，处理由该节点作为 $ y $ 的所有询问。

### 代码

```cpp
#include <cstdio>
#include <cassert>
#include <queue>
#include <stack>
#include <algorithm>

const int MAXN = 1e5;
const int CHARSET_SIZE = 'z' - 'a' + 1;
const int BASE_CHAR = 'a';

struct Trie {
    struct Node {
        Node *c[CHARSET_SIZE], *fail, *next, *p;
        int id;
        bool isWord;
        struct Query {
            Node *x;
            int *ans;

            Query(Node *x, int *ans) : x(x), ans(ans) {}
        };
        std::vector<Query> q;

        Node(Node *p, bool isWord, const int id) : fail(NULL), next(NULL), p(p), id(id), isWord(isWord) {
            for (int i = 0; i < CHARSET_SIZE; i++) c[i] = NULL;
        }
    } *root;

    Trie() : root(NULL) {}

    int init(const char *s, std::vector<Node *> &vec) {
        int cnt = 0;
        Node *v = root = new Node(NULL, false, cnt++);
        for (const char *p = s; *p; p++) {
            assert(*p == 'P' || *p == 'B' || (*p >= 'a' && *p <= 'z'));
            if (*p == 'P') v->isWord = true, vec.push_back(v);
            else if (*p == 'B') v = v->p;
            else {
                if (!v->c[*p - BASE_CHAR]) v->c[*p - BASE_CHAR] = new Node(v, false, cnt++);
                v = v->c[*p - BASE_CHAR];
            }
        }
        return cnt;
    }

    void build() {
        std::queue<Node *> q;
        root->fail = root, root->next = NULL;
        q.push(root);
        while (!q.empty()) {
            Node *v = q.front();
            q.pop();
            assert(v->q.size() < MAXN);

            for (int i = 0; i < CHARSET_SIZE; i++) {
                Node *&c = v->c[i];
                if (!c) continue;
                Node *u = v->fail;
                while (u != root && !u->c[i]) u = u->fail;
                c->fail = v != root && u->c[i] ? u->c[i] : root;
                c->next = c->fail->isWord ? c->fail : c->fail->next;
                q.push(c);
                assert(v->q.size() < MAXN);
                assert(c->q.size() < MAXN);
            }
        }
    }
} t;

struct Node {
    Node *p, *c, *next;
    int l, r;
    bool v;
} N[MAXN];

int n;

inline void addEdge(const int p, const int c) {
    // printf("addEdge(%d, %d)\n", p, c);
    N[c].next = N[p].c;
    N[p].c = &N[c];
    N[c].p = &N[p];
}

inline void buildFailTree() {
    std::queue<Trie::Node *> q;
    q.push(t.root);

    while (!q.empty()) {
        Trie::Node *v = q.front();
        q.pop();

        for (int i = 0; i < CHARSET_SIZE; i++) {
            Trie::Node *&c = v->c[i];
            if (!c) continue;
            addEdge(c->fail->id, c->id);
            q.push(c);
        }
    }
}

inline void dfs() {
    std::stack<Node *> s;
    s.push(&N[0]);

    int ts = 0;
    while (!s.empty()) {
        Node *v = s.top();
        if (!v->v) {
            v->v = true;
            v->l = ++ts;
            for (Node *c = v->c; c; c = c->next) s.push(c);
        } else {
            v->r = ts;
            s.pop();
        }
    }
}

struct BinaryIndexedTree {
    int a[MAXN + 1], n;

    void init(const int n) { this->n = n; }

    static int lowbit(const int x) { return x & -x; }

    void update(const int pos, const int delta) {
        for (int i = pos; i <= n; i += lowbit(i)) a[i] += delta;
    }

    int query(const int pos) {
        int ans = 0;
        for (int i = pos; i > 0; i -= lowbit(i)) ans += a[i];
        return ans;
    }
} bit;

char op[MAXN + 1];
inline void solve() {
    bit.init(n);
    Trie::Node *y = t.root;
    for (const char *p = op; *p; p++) {
        if (*p == 'P') {
            for (std::vector<Trie::Node::Query>::iterator it = y->q.begin(); it != y->q.end(); it++) {
                *it->ans = bit.query(N[it->x->id].r) - bit.query(N[it->x->id].l - 1);
            }
        } else if (*p == 'B') {
            bit.update(N[y->id].l, -1);
            y = y->p;
        } else {
            y = y->c[*p - BASE_CHAR];
            bit.update(N[y->id].l, 1);
        }
    }
}

int main() {
    scanf("%s", op);

    std::vector<Trie::Node *> vec;
    n = t.init(op, vec);
    t.build();

    buildFailTree();
    dfs();

    int m;
    static int ans[MAXN];
    scanf("%d", &m);
    for (int i = 0; i < m; i++) {
        int x, y;
        scanf("%d %d", &x, &y), x--, y--;
        vec[y]->q.push_back(Trie::Node::Query(vec[x], &ans[i]));
    }

    solve();
    for (int i = 0; i < m; i++) printf("%d\n", ans[i]);

    return 0;
}
```