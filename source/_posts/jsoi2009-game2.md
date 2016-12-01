title: 「JSOI2009」有趣的游戏 - AC 自动机 + 概率与期望
categories: OI
tags: 
  - BZOJ
  - JSOI
  - 字符串
  - AC 自动机
  - 概率与期望
  - 数学
  - 高斯消元
permalink: jsoi2009-game2
date: 2016-09-18 17:29:00
---

现有 $ n $ 个单词，均由前 $ m $ 个大写字母组成。每一时刻随机产生一个字母，产生第 $ i $ 个字母的概率为 $ {p_i \over q_i} (0 \leq p_i \leq q_i) $。$ T $ 时刻后会产生一个长度为 $ T $ 的串。

如果某个时刻，有一个单词在这个串中出现了，则过程结束。求产生的串中出现每个单词的概率。

<!-- more -->

### 链接
[BZOJ 1444](http://www.lydsy.com/JudgeOnline/problem.php?id=1444)

### 题解
对所有单词建立 AC 自动机，则问题转化为，在 AC 自动机上匹配产生的串，有多大概率使状态转移到每一个单词上。而每一个单词最多转移一次，问题又可以转化为，求在 AC 自动机上转移到每一个单词末尾节点上的期望次数。

考虑从一个节点转移到另一个节点的概率。设 $ p(i) = \frac{p_i}{q_i} $，节点 $ u $ 能在加入后转移到节点 $ v $ 的字母集合为 $ \{ c_i \} $，则从 $ u $ 转移到 $ v $ 的概率 $ P(u, v) = \sum p(c_i) $。

设转移到 AC 自动机上**非根**节点 $ i $ 的期望次数为 $ x_i $，则

$$
\begin{aligned}
x_i &= \sum\limits_{j} x_j P(j, i) \\
-x_i + \sum\limits_{j} x_j P(j, i) &= 0 \\
x_i(-1 + P(i, i)) + \sum\limits_{j \neq i} x_j P(j, i) &= 0 \\
\end{aligned}
$$

对于根节点，因为它是自动机的起始状态，所以初始有 $ 1 $ 的期望次数。

$$
\begin{aligned}
x_i &= \sum\limits_{j} x_j P(j, i) + 1 \\
-x_i + \sum\limits_{j} x_j P(j, i) &= -1 \\
x_i(-1 + P(i, i)) + \sum\limits_{j \neq i} x_j P(j, i) &= -1 \\
\end{aligned}
$$

列出方程组，高斯消元求解即可。

### 代码
```c++
#include <cstdio>
#include <cmath>
#include <algorithm>
#include <queue>

const int MAXN = 100;
const int CHARSET_SIZE = 'Z' - 'A' + 1;
const int BASE_CHAR = 'A';
const double EPS = 0.005;

int charsetSize, n;

struct Trie {
	struct Node {
		Node *c[CHARSET_SIZE], *fail, *next;
		bool isWord, visited;
		int id;

		Node(const bool isWord = false) : fail(NULL), next(NULL), isWord(isWord) {
			for (int i = 0; i < charsetSize; i++) c[i] = NULL;
			this->id = n++;
		}
	} *root;

	Trie() : root(NULL) {}

	Node *insert(const char *begin, const char *end) {
		Node **v = &root;
		for (const char *p = begin; p != end; p++) {
			if (!*v) *v = new Node;
			v = &(*v)->c[*p];
		}
		if (!*v) *v = new Node(true);
		else (*v)->isWord = true;
		return *v;
	}

	void build() {
		std::queue<Node *> q;
		q.push(root);
		root->fail = root, root->next = NULL;
		while (!q.empty()) {
			Node *v = q.front();
			q.pop();

			for (int i = 0; i < charsetSize; i++) {
				Node *&c = v->c[i];
				if (!c) {
					// c = v->fail->c[i] ? v->fail->c[i] : root;
					c = v == root ? root : v->fail->c[i];
					continue;
				}
				Node *u = v->fail;
				while (u != root && !u->c[i]) u = u->fail;
				c->fail = v != root && u->c[i] ? u->c[i] : root;
				c->next = c->fail->isWord ? c->fail : c->fail->next;
				q.push(c);
			}
		}
	}
} t;

double p[MAXN], matrix[MAXN + 1][MAXN + 1 + 1];

inline void buildMatrix() {
	for (int i = 1; i < n; i++) matrix[i][i] = -1;
	matrix[0][0] = -1, matrix[0][n] = -1;
	std::queue<Trie::Node *> q;
	q.push(t.root);
	t.root->visited = true;
	while (!q.empty()) {
		Trie::Node *v = q.front();
		q.pop();

		if (v->isWord || v->next) continue;

		for (int i = 0; i < charsetSize; i++) {
			// printf("%d -> %d\n", v->id, v->c[i]->id);
			matrix[v->c[i]->id][v->id] += p[i];
			if (!v->c[i]->visited) {
				v->c[i]->visited = true;
				q.push(v->c[i]);
			}
		}
	}
}

inline void gauss() {
	for (int i = 0; i < n; i++) {
		if (fabs(matrix[i][i]) < EPS) {
			for (int j = i + 1; j < n; j++) if (matrix[j][i] >= EPS) {
				std::swap(matrix[i], matrix[j]);
				break;
			}
		}
		// for (int j = i + 1; j < n; j++) if (max == -1 || fabs(matrix[j][i]) > fabs(matrix[max][i])) max = j;
		// if (max != i) std::swap(matrix[max], matrix[i]);

		double t = matrix[i][i];
		for (int j = 0; j < n + 1; j++) matrix[i][j] /= t;

		for (int j = 0; j < n; j++) if (j != i) {
			double t = matrix[j][i];
			for (int k = i; k < n + 1; k++) matrix[j][k] -= t * matrix[i][k];
		}
	}
}

bool gauss_jordan() {
    for (int i = 0; i < n; ++i) {
        int idx = i;
        for (int j = 0; j < n; ++j) if (fabs(matrix[j][i]) > fabs(matrix[idx][i])) idx = j;
        // if (fabs(matrix[idx][i]) <= eps) return false;
        if (idx != i) std::swap(matrix[i], matrix[idx]); // for (int j = i; j <= n; ++j) std::swap(matrix[i][j], matrix[idx][j]);
        for (int j = 0; j < n; ++j) if (i != j) {
            double tmp = matrix[j][i] / matrix[i][i];
            for (int k = n; k >= i; --k) matrix[j][k] -= matrix[i][k] * tmp;
        }
    }
    return true;
}

int main() {
	int m, l;
	scanf("%d %d %d", &m, &l, &charsetSize);
	for (int i = 0; i < charsetSize; i++) {
		double a, b;
		scanf("%lf %lf", &a, &b);
		p[i] = a / b;
	}

	static Trie::Node *a[MAXN];
	int cnt = 0;
	for (int i = 0; i < m; i++) {
		char s[MAXN + 1];
		scanf("%s", s);
		for (int i = 0; i < l; i++) {
			s[i] -= BASE_CHAR;
			if (p[s[i]] == 0) cnt++;
		}
		a[i] = t.insert(s, s + l);
	}

	/*
	if (cnt == m) {
		for (int i = 0; i < m; i++) puts("0.00");
		return 0;
	}
	*/

	t.build();

	buildMatrix();
	// for (int i = 0; i <= n; i++) matrix[0][i] = -matrix[0][i];
	gauss();

	/*
	for (int i = 0; i < n; i++) {
		for (int j = 0; j <= n; j++) printf("%.2lf%c", matrix[i][j], j == n ? '\n' : ' ');
	}
	*/

	for (int i = 0; i < m; i++) printf("%.2lf\n", matrix[a[i]->id][n] < EPS ? 0.0f : matrix[a[i]->id][n]);

	return 0;
}
```