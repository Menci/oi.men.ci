title: 「SCOI2012」喵星球上的点名 - AC 自动机
categories: OI
tags: 
  - BZOJ
  - SCOI
  - 字符串
  - AC 自动机
permalink: scoi2012-name
date: 2016-09-29 21:26:00
---

假设课堂上有 $ N $ 个喵星人，每个喵星人的名字由姓和名构成。喵星球上的老师会选择 $ M $ 个串来点名，每次读出一个串的时候，如果这个串是一个喵星人的姓或名的子串，那么这个喵星人就必须答到。

统计每次点名的时候有多少喵星人答到，以及 $ M $ 次点名结束后每个喵星人答到多少次。

<!-- more -->

### 链接
[BZOJ 2754](http://www.lydsy.com/JudgeOnline/problem.php?id=2754)

### 题解
对点名串建立 AC 自动机，用姓名串暴力跑后缀链接即可。

### 代码
```c++
#include <cstdio>
#include <cassert>
#include <map>
#include <queue>
#include <algorithm>

const int MAXN = 20000;
const int MAXM = 50000;
const int MAXLEN = 100000;

struct Trie {
	struct Node {
		std::map<int, Node *> c;
		Node *fail, *next;
		int wordCnt, ts, ans;

		Node(const int wordCnt = 0) : fail(NULL), next(NULL), wordCnt(wordCnt), ts(0), ans(0) {}
	} *root;

	Trie() : root(NULL) {}

	Node *insert(const int *begin, const int *end) {
#ifdef DBG
		puts("insert: ");
		for (const int *p = begin; p != end; p++) printf("%d%c", *p, p == end - 1 ? '\n' : ' ');
#endif
		Node **v = &root;
		for (const int *p = begin; p != end; p++) {
			if (!*v) *v = new Node;
			v = &(*v)->c[*p];
		}
		if (!*v) *v = new Node(1);
		else /*assert((*v)->isWord == false), */(*v)->wordCnt++;
		return *v;
	}

	void build() {
		std::queue<Node *> q;
		q.push(root);
		root->fail = root, root->next = NULL;
		while (!q.empty()) {
			Node *v = q.front();
			q.pop();

			for (std::map<int, Node *>::iterator it = v->c.begin(); it != v->c.end(); it++) {
				Node *&c = it->second, *u = v->fail;
				while (u != root && u->c.find(it->first) == u->c.end()) u = u->fail;
				c->fail = v != root && u->c.find(it->first) != u->c.end() ? u->c[it->first] : root;
				c->next = c->fail->wordCnt ? c->fail : c->fail->next;
				q.push(c);
			}
		}
	}

	int exec(const int *begin, const int *end) {
#ifdef DBG
		puts("exec: ");
		for (const int *p = begin; p != end; p++) printf("%d%c", *p, p == end - 1 ? '\n' : ' ');
#endif
		static int ts = 0;
		++ts;
		Node *v = root;
		int ans = 0;
		static int sumAns = 0;
		for (const int *p = begin; p != end; p++) {
			while (v != root && v->c.find(*p) == v->c.end()) v = v->fail;
			std::map<int, Node *>::iterator it;
			if ((it = v->c.find(*p)) != v->c.end()) v = it->second;
			// if (it != v->c.end()) v = it->second;
			Node *u = v->wordCnt ? v : v->next;
			while (u) {
#ifdef DBG
				printf("apply(%lu)\n", u);
#endif
				if (u->ts != ts) {
					u->ts = ts;
					u->ans++;
					ans += u->wordCnt;
					sumAns++;
					// printf("- %d %d\n", u->ans, ans);
					u = u->next;
				} else break;
			}
		}
		// printf("sumAns = %d\n", sumAns);
		return ans;
	}
} t;

int main() {
	int n, m;
	scanf("%d %d", &n, &m);
	static int buf[MAXN * 2 + MAXLEN], set[MAXLEN];
	int cnt = 0;
	for (int i = 0, tot = 0; i < n; i++) {
		for (int j = 0; j < 2; j++) {
			int l;
			scanf("%d", &l);
#ifdef DBG
			printf("--- %d ---\n", l);
#endif
			buf[tot++] = l;
			for (int k = 0; k < l; k++) {
				int x;
				scanf("%d", &x);
				buf[tot++] = set[cnt++] = x;
			}
		}
	}
	std::sort(set, set + cnt);
	int *end = std::unique(set, set + cnt);

	static Trie::Node *a[MAXM];
	for (int i = 0; i < m; i++) {
		int l;
		scanf("%d", &l);
		static int buf[MAXLEN];
		bool invalid = false;
		for (int j = 0; j < l; j++) {
			int x;
			scanf("%d", &x);
			/*
			if (i == 1354 - 1) {
				printf("(%d)\n", x);
			}
			*/
			int *p = std::lower_bound(set, end, x);
			if (p == end || *p != x) {
				invalid = true;
			}
			buf[j] = p - set;
		}
		if (!invalid) a[i] = t.insert(buf, buf + l);
		else a[i] = NULL;
		/*
		if (i == 1354 - 1) {
			printf("1354: ");
			for (int i = 0; i < l; i++) printf("%d%c", buf[i], i == l - 1 ? '\n' : ' ');
		}
		*/
	}

	t.build();

	static int ans[MAXN];
	for (int i = 0, pos = 0; i < n; i++) {
		static int buf2[MAXLEN + 1];
		int cnt = 0;
		for (int j = 0; j < 2; j++) {
			if (j == 1) buf2[cnt++] = -1;
			int l = buf[pos++];
			// printf("- ");
			for (int k = 0; k < l; k++) buf2[cnt++] = std::lower_bound(set, end, buf[pos++]) - set; // , printf("%d ", buf2[cnt - 1]);
			// putchar('\n');
		}
		ans[i] = t.exec(buf2, buf2 + cnt);
	}

	int sum1 = 0, sum2 = 0;
	for (int i = 0; i < m; i++) {
		sum1 += a[i] ? a[i]->ans : 0;
		// if (i == 1354 - 1) putchar('*');
		printf("%d\n", a[i] ? a[i]->ans : 0);
	}

	for (int i = 0; i < n; i++) {
		sum2 += ans[i];
		printf("%d%c", ans[i], i == n - 1 ? '\n' : ' ');
	}

	// printf("%d %d\n", sum1, sum2);

	return 0;
}
```