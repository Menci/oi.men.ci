title: 「JSOI2012」玄武密码 - SAM
categories:
  - OI
tags:
  - BZOJ
  - JSOI
  - SAM
  - 字符串
permalink: jsoi2012-symbol
date: '2017-04-05 20:00:00'
---

给一个字符串 $ S $，给一些字符串 $ s_i $，求每个 $ s_i $ 的最长的在 $ S $ 中出现过的前缀的长度。

<!-- more -->

### 链接

[BZOJ 4327](http://www.lydsy.com/JudgeOnline/problem.php?id=4327)

### 题解

对 $ S $ 建立 SAM，将每个 $ s_i $ 放在 SAM 上运行即可。

### 代码

```cpp
#include <cstdio>
#include <cstring>
#include <algorithm>

const int MAXN = 1e7;
const int CHARSET_SIZE = 4;

struct SuffixAutomaton {
    struct Node {
        Node *ch[CHARSET_SIZE], *next;
        int max;

        Node(int max = 0) : ch(), next(NULL), max(max) {}
    } *start, *last;

    void init()
    {
        start = last = new Node;
    }

    Node *extend(int c)
    {
        Node *u = new Node(last->max + 1), *v = last;
        for (; v && !v->ch[c]; v = v->next) v->ch[c] = u;

        if (!v)
        {
            u->next = start;
        }
        else if (v->ch[c]->max == v->max + 1)
        {
            u->next = v->ch[c];
        }
        else
        {
            Node *n = new Node(v->max + 1), *o = v->ch[c];
            std::copy(o->ch, o->ch + CHARSET_SIZE, n->ch);
            n->next = o->next;
            u->next = o->next = n;
            for (; v && v->ch[c] == o; v = v->next) v->ch[c] = n;
        }

        last = u;
        return u;
    }
} sam;

inline int convert(char ch)
{
    switch (ch)
    {
        case 'N': return 0;
        case 'S': return 1;
        case 'W': return 2;
        case 'E': return 3;
        default: return -1;
    }
}

inline int solve(char *s)
{
    int len = strlen(s);
    SuffixAutomaton::Node *v = sam.start;
    for (int i = 0; i < len; i++)
    {
        int c = convert(s[i]);
        if (v->ch[c]) v = v->ch[c];
        else return i; // The i-th char is not matched
    }

    return len;
}

int main()
{
    int n, m;
    static char s[MAXN + 1];
    scanf("%d %d\n%s", &n, &m, s);

    sam.init();
    for (int i = 0; i < n; i++)
    {
        sam.extend(convert(s[i]));
    }

    while (m--)
    {
        static char s[MAXN + 1];
        scanf("%s", s);
        printf("%d\n", solve(s));
    }
}
```