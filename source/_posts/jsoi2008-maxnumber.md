title: 「JSOI2008」最大数 - Splay
categories: OI
tags: 
  - BZOJ
  - JSOI
  - Splay
  - 数据结构
  - 高级数据结构
permalink: jsoi2008-maxnumber
id: 56
updated: '2016-02-20 10:13:55'
date: 2016-02-20 10:11:00
---

现在请求你维护一个数列，要求提供以下两种操作：

1. 查询操作。  
   语法：`Q L`  
   功能：查询当前数列中末尾 `L` 个数中的最大的数，并输出这个数的值。  
   限制：`L` 不超过当前数列的长度。
2. 插入操作。
   语法：`A n`  
   功能：将 `n` 加上 `t`，其中 `t` 是最近一次查询操作的答案（如果还未执行过查询操作，则 `t = 0`)，并将所得结果对一个固定的常数 `D` 取模，将所得答案插入到数列的末尾。  
   限制：`n` 是非负整数并且在长整范围内。

注意：初始时数列是空的，没有一个数。

<!-- more -->

### 链接
[BZOJ 1012](http://www.lydsy.com/JudgeOnline/problem.php?id=1012)

### 题解
Splay 裸题不用说了吧 ……

话说开一棵大线段树也资磁吧？

敲个 Splay 练练代码能力，结果折腾了俩小时，这段时间代码能力急剧下降啊！qwq

### 代码
```cpp
#include <cstdio>
#include <algorithm>

const int MAXM = 200000;

template <typename T>
struct Splay {
	enum Relation {
		L = 0, R = 1
	};

	struct Node {
		Node *parent, *child[2], **root;
		int value, max;
		int size;
		bool bound;

		Node(Node *parent, const T &value, Node **root, bool bound = false) : parent(parent), value(value), root(root), bound(bound), size(1) {}

		void maintain() {
			size = (child[L] ? child[L]->size : 0) + (child[R] ? child[R]->size : 0) + 1;
			max = value;
			if (child[L] && !child[L]->bound) max = std::max(max, child[L]->max);
			if (child[R] && !child[R]->bound) max = std::max(max, child[R]->max);
		}

		Relation relation() {
			return this == parent->child[L] ? L : R;
		}

		void rotate() {
			Relation r = relation();
			Node *oldParent = parent;

			if (oldParent->parent) oldParent->parent->child[oldParent->relation()] = this;
			parent = oldParent->parent;

			oldParent->child[r] = child[r ^ 1];
			if (child[r ^ 1]) child[r ^ 1]->parent = oldParent;

			child[r ^ 1] = oldParent;
			oldParent->parent = this;

			oldParent->maintain(), maintain();
			if (!parent) *root = this;
		}

		void splay(Node *targetParent = NULL) {
			while (parent != targetParent) {
				if (parent->parent == targetParent) rotate();
				else if (relation() == parent->relation()) parent->rotate(), rotate();
				else rotate(), rotate();
			}
		}

		int rank() {
			return child[L] ? child[L]->size : 0;
		}

		Node *pred() {
			splay();
			Node *v = this->child[L];
			while (v->child[R]) v = v->child[R];
			return v;
		}

		Node *succ() {
			splay();
			Node *v = this->child[R];
			while (v->child[L]) v = v->child[L];
			return v;
		}

		void print(int depth = 0) {
			if (child[L]) child[L]->print(depth + 1);
			for (int i = 0; i < depth; i++) putchar(' ');
			//printf("%d\n", value);
			if (child[R]) child[R]->print(depth + 1);
		}
	} *root;

	Splay() {
		buildBound(L), buildBound(R);
	}

	void print() {
		root->print();
		puts("---------------------------");
	}

	void buildBound(Relation r) {
		Node **v = &root, *parent = NULL;
		while (*v) {
			parent = *v;
			parent->size++;
			v = &parent->child[r];
		}

		*v = new Node(parent, r == L ? -1 : 1, &root, true);
	}

	void append(const T &value) {
		Node **v = &root, *parent = NULL;
		while (*v) {
			parent = *v;
			parent->size++;
			if (parent->bound && parent->value == 1) v = &parent->child[L];
			else v = &parent->child[R];
		}

		*v = new Node(parent, value, &root);
		//print();
		(*v)->splay();
	}

	Node *select(int k) {
		k++;
		Node *v = root;
		while (k != v->rank() + 1) {
			//printf("select(k = %d) in [%d] - { size = %d, rank = %d }\n", k, v->value, v->size, v->rank());
			if (k < v->rank() + 1) v = v->child[L];
			else k -= v->rank() + 1, v = v->child[R];
		}

		return v;
	}

	Node *select(int l, int r) {
		Node *pred = select(l)->pred();
		Node *succ = select(r)->succ();

		pred->splay();
		succ->splay(root);
		return succ->child[L];
	}

	const T &queryMax(int l, int r) {
		return select(l, r)->max;
	}

	int size() {
		return root->size - 2;
	}
};

int m, p, lastAns;
Splay<int> splay;

inline char isVaild(char ch) {
	return ch == 'A' || ch == 'Q';
}

int main() {
	scanf("%d %d", &m, &p);

	for (int i = 0; i < m; i++) {
		char cmd;
		while (!isVaild(cmd = getchar()));
		//printf("cmd('%c')\n", cmd);

		if (cmd == 'A') {
			int n;
			scanf("%d", &n);

			splay.append((n + lastAns) % p);
		} else {
			int l;
			scanf("%d", &l);

			printf("%d\n", lastAns = splay.queryMax(splay.size() - l + 1, splay.size()));
		}
	}

	return 0;
}
```