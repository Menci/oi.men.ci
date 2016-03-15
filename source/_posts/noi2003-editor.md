title: 「NOI2003」文本编辑器 - Splay
categories: OI
tags: 
  - NOI
  - BZOJ
  - Splay
  - 高级数据结构
  - 数据结构
permalink: noi2003-editor
date: 2016-03-06 19:49:35
---

|        操作名称        | 输入文件中的格式 | 功能 |
|:----------------------:|:----------------:| ---- |
| $ {\rm MOVE}(k) $      | `Move k`         | 将光标移动到第 $ k $ 个字符之后，如果 $ k=0 $，将光标移到文本第一个字符之前 |
| $ {\rm INSERT}(n, s) $ | `Insert n S`     | 在光标后插入长度为 $ n $ 的字符串 $ s $，光标位置不变，$ n ≥ 1 $ |
| $ {\rm DELETE}(n) $    | `Delete n`       | 删除光标后的 $ n $ 个字符，光标位置不变，$ n ≥ 1 $ |
| $ {\rm GET}(n) $       | `Get n`          | 输出光标后的 $ n $ 个字符，光标位置不变，$ n ≥ 1 $ |
| $ {\rm PREV}() $       | `Prev`           | 光标前移一个字符
| $ {\rm NEXT}() $       | `Next`           | 光标后移一个字符

<!-- more -->

### 题目链接
[BZOJ 1507](http://www.lydsy.com/JudgeOnline/problem.php?id=1507)

### 解题思路
块状链表太鬼畜辣！还是 Splay 比较好写好调w

一点小技巧，插入的时候可以照着选择区间的方法选出一段空白区间，然后 `build` 出一棵子树给接上去，可以少一个 $ \log $。

### AC代码
```cpp
#include <cstdio>
#include <vector>
#include <algorithm>

const int MAXM = 50000 + 4000 + 200000;

template <typename T>
struct Splay {
	enum Relation {
		L = 0, R = 1
	};

	struct Node {
		Node *child[2], *parent, **root;
		T value;
		int size;
		bool bound;

		Node(Node *parent, const T &value, Node **root, bool bound = false) : parent(parent), value(value), root(root), size(1), bound(bound) {
			child[L] = child[R] = NULL;
		}

		~Node() {
			if (child[L]) delete child[L];
			if (child[R]) delete child[R];
		}

		Relation relation() {
			return this == parent->child[L] ? L : R;
		}

		void maintain() {
			//if (child[L]) child[L]->maintain();
			//if (child[R]) child[R]->maintain();
			size = (child[L] ? child[L]->size : 0) + (child[R] ? child[R]->size : 0) + 1;
		}

		void rotate() {
			Relation x = relation();
			Node *oldParent = parent;

			if (oldParent->parent) oldParent->parent->child[oldParent->relation()] = this;
			parent = oldParent->parent;

			oldParent->child[x] = child[x ^ 1];
			if (child[x ^ 1]) child[x ^ 1]->parent = oldParent;

			child[x ^ 1] = oldParent;
			oldParent->parent = this;

			oldParent->maintain(), maintain();

			if (!parent) *root = this;
		}

		void splay(Node *targetParent = NULL) {
			while (parent != targetParent){
				if (parent->parent == targetParent) rotate();
				else if (parent->relation() == relation()) parent->rotate(), rotate();
				else rotate(), rotate();
			}
		}

		Node *pred() {
			splay();
			Node *v = child[L];
			while (v->child[R]) v = v->child[R];
			return v;
		}

		Node *succ() {
			splay();
			Node *v = child[R];
			while (v->child[L]) v = v->child[L];
			return v;
		}

		int rank() {
			return child[L] ? child[L]->size : 0;
		}
	} *root;

	Splay() : root(NULL) {
		buildBound(L), buildBound(R);
	}

	~Splay() {
		if (root) delete root;
	}

	void buildBound(Relation x) {
		Node **v = &root, *parent = NULL;
		while (*v) {
			parent = *v;
			parent->size++;
			v = &parent->child[x];
		}

		*v = new Node(parent, 0, &root, true);
	}

	Node *build(const T *a, int l, int r, Node *parent = NULL) {
		if (l > r) return NULL;
		int mid = l + ((r - l) >> 1);
		Node *v = new Node(parent, a[mid - 1], &root);
		v->child[L] = build(a, l, mid - 1, v);
		v->child[R] = build(a, mid + 1, r, v);
		v->maintain();
		return v;
	}

	Node *select(int k) {
		k++;
		//printf("select(%d) in size = %d\n", k, root->size);
		Node *v = root;
		while (v->maintain(), k != v->rank() + 1) {
			if (k < v->rank() + 1) v = v->child[L];
			else k -= v->rank() + 1, v = v->child[R];
		}

		return v;
	}

	Node *&select(int l, int r) {
		Node *lbound = select(l - 1);
		Node *rbound = select(r + 1);

		lbound->splay();
		rbound->splay(lbound);

		return rbound->child[L];
	}

	void insert(const T *a, int n, int pos) {
		Node *&v = select(pos + 1, pos);
		v = build(a, 1, n, root->child[R]);
		root->child[R]->maintain(), root->maintain();
	}

	void erase(int l, int r) {
		Node *&v = select(l, r);
		delete v;
		v = NULL;
		root->child[R]->maintain(), root->maintain();
	}

	void fetch(T *a, int l, int r) {
		int i = 0;
		dfs(select(l, r), a, i);
	}

	void dfs(Node *v, T *a, int &i) {
		if (!v) return;
		dfs(v->child[L], a, i);
		a[i++] = v->value;
		dfs(v->child[R], a, i);
	}
};

int t, pos;
Splay<char> splay;

inline bool isValid(char ch) {
	return ch >= 32 && ch <= 126;
}

int main() {
	scanf("%d", &t);

	static std::vector<char> buffers;
	for (int i = 0; i < t; i++) {
		char command[sizeof("Insert")];
		scanf("%s", command);

		if (command[0] == 'M') {
			scanf("%d", &pos);
		} else if (command[0] == 'I') {
			int n;
			scanf("%d", &n);

			buffers.clear();
			buffers.reserve(n);

			char ch;
			for (int i = 0; i < n; ) {
				if (isValid(ch = getchar())) {
					buffers.push_back(ch);
					i++;
				}
			}

			splay.insert(buffers.data(), n, pos);
		} else if (command[0] == 'D') {
			int n;
			scanf("%d", &n);
			splay.erase(pos + 1, pos + n);
		} else if (command[0] == 'G') {
			int n;
			scanf("%d", &n);

			buffers.clear();
			buffers.resize(n + 1);

			splay.fetch(const_cast<char *>(buffers.data()), pos + 1, pos + n);
			buffers[n] = '\0';

			printf("%s\n", buffers.data());
		} else if (command[0] == 'P') pos--;
		else if (command[0] == 'N') pos++;
	}

	return 0;
}
```
