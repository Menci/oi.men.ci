title: 「HNOI2004」L语言 - Trie
categories: OI
tags: 
  - BZOJ
  - HNOI
  - 字符串
  - Trie
permalink: hnoi2004-language
date: 2016-09-13 07:40:00
---

我们称一段文章 $ T $ 在某个字典 $ D $ 下是可以被理解的，是指如果文章 $ T $ 可以被分成若干部分，且每一个部分都是字典 $ D $ 中的单词。

给定一个字典 $ D $，你的程序需要判断若干段文章在字典 $ D $ 下是否能够被理解。并给出其在字典 $ D $ 下能够被理解的最长前缀的位置。

<!-- more -->

### 链接
[BZOJ 1212](http://www.lydsy.com/JudgeOnline/problem.php?id=1212)

### 题解
设 $ f_i $ 表示文章的前 $ i $ 个字符是否可被理解，如果 $ f_{i - 1} $ 为真，则对于每一个长度为 $ m $ 单词，若它能从 $ i $ 位置开始完全匹配，则 $ f_{i + m - 1} $ 为真。

### 代码
```c++
#include <cstdio>
#include <cstring>
#include <queue>

const int MAXN = 1024 * 1024;
const int CHARSET_SIZE = 'z' - 'a' + 1;
const int BASE_CHAT = 'a';

struct Trie {
	struct Node {
		Node *c[CHARSET_SIZE]; //, *fail, *next;
		bool isWord;

		Node(const bool isWord) : /* fail(NULL), next(NULL), */ isWord(isWord) {
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

	/*
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
	*/
} t;

int main() {
	int n, m;
	scanf("%d %d", &n, &m);

	static char s[MAXN + 1];
	while (n--) {
		scanf("%s", s);
		const int len = strlen(s);
		for (int i = 0; i < len; i++) s[i] -= 'a';
		t.insert(s, s + len);
	}

	// t.build();

	while (m--) {
		scanf("%s", s);
		const int len = strlen(s);
		static bool _f[MAXN + 1], *f = _f + 1;
		for (int i = 0; i < len; i++) s[i] -= 'a', f[i] = false;
		int ans = -1;
		f[-1] = true;
		for (int i = 0; i < len; i++) {
			if (!f[i - 1]) continue;
			Trie::Node *v = t.root;
			for (int j = i; j < len; j++) {
				// while (v != t.root && !v->c[s[j]]) v = v->fail;
				if (!v->c[s[j]]) break;
				v = v->c[s[j]];
				if (v->isWord) f[j] = true, ans = std::max(ans, j);
			}
		}
		printf("%d\n", ans + 1);
	}

	return 0;
}
```