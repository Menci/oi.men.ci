title: Splay 学习笔记（三）
categories: OI
tags: 
  - Splay
  - 高级数据结构
  - 学习笔记
  - 数据结构
permalink: splay-notes-3
id: 28
updated: '2016-01-19 21:02:27'
date: 2016-01-19 20:02:00
---

在《Splay 学习笔记（一）》中，我们学会了利用 Splay 来维护二叉排序树，现在让我们来把我们的 Splay 变得更加优美。

<!-- more -->

### 结构体定义
两个孩子用一个数组来存，0 表示左孩子，1 表示右孩子，不需要再编写函数来获得某个孩子的引用了。

引入 `count` 成员，表示这个值共出现了几次，不再重复插入相同的值，效率可以得到提高，特别是求前趋后继，实现起来也会变得更加简单。
<!-- c++ -->
```
enum Relation {
	L = 0, R = 1
};

struct Node {
	Node *child[2], *parent, **root;
	T value;
	int size, count;
}
```

### Splay 操作
把之前的“旋转到某位置”改为“旋转直到某节点成为自己的父节点”，不需要二级指针了，也不需要判断如果参数为 `NULL` 那么转到根了。

<!-- c++ -->
```
void splay(Node *targetParent = NULL) {
	while (parent != targetParent) {
		if (parent->parent == targetParent) rotate();
		else if (parent->relation() == relation()) parent->rotate(), rotate();
		else rotate(), rotate();
	}
}
```

### 节点的前趋 / 后继
直接 `Splay` 后求即可，不需要多次迭代了。

<!-- c++ -->
```
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
```

### 选择
选择第 `k` 小的元素时，需要把循环的条件改为**`k` 是否在 `[rank + 1, rank + count]`**的范围内，迭代到右子树时也要做相应的改动。

<!-- c++ -->
```
Node *select(int k) {
	k++;
	Node *v = root;
	while (!(v->rank() + 1 <= k && v->rank() + v->count >= k)) {
		if (k < v->rank() + 1) {
			v = v->child[L];
		} else {
			k -= v->rank() + v->count;
			v = v->child[R];
		}
	}
	v->splay();
	return v;
}
```

### 完整代码（普通平衡树）
<!-- c++ -->
```
#include <cstdio>
#include <climits>

const int MAXN = 100000;

template <typename T, T INF>
struct Splay {
	enum Relation {
		L = 0, R = 1
	};

	struct Node {
		Node *child[2], *parent, **root;
		T value;
		int size, count;

		Node(Node *parent, const T &value, Node **root) : parent(parent), value(value), root(root), count(1) {
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
			size = (child[L] ? child[L]->size : 0) + (child[R] ? child[R]->size : 0) + count;
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
			while (parent != targetParent) {
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
			return !child[L] ? 0 : child[L]->size;
		}
	} *root;

	Splay() : root(NULL) {
		insert(INF), insert(-INF);
	}

	~Splay() {
		delete root;
	}

	Node *find(const T &value) {
		Node *v = root;
		while (v && value != v->value) {
			if (value < v->value) {
				v = v->child[L];
			} else {
				v = v->child[R];
			}
		}

		if (!v) return NULL;

		v->splay();
		return v;
	}

	Node *insert(const T &value) {
		Node *v = find(value);
		if (v) {
			v->count++, v->maintain();
			return v;
		}

		Node **target = &root, *parent = NULL;

		while (*target) {
			parent = *target;
			parent->size++;
			if (value < parent->value) {
				target = &parent->child[L];
			} else {
				target = &parent->child[R];
			}
		}

		*target = new Node(parent, value, &root);
		(*target)->splay();

		return root;
	}

	void erase(const T &value) {
		erase(find(value));
	}

	void erase(Node *v) {
		if (v->count != 1) {
			v->splay();
			v->count--;
			v->maintain();
			return;
		}

		Node *pred = v->pred();
		Node *succ = v->succ();

		pred->splay();
		succ->splay(pred);

		delete succ->child[L];
		succ->child[L] = NULL;

		succ->maintain(), pred->maintain();
	}

	int rank(const T &value) {
		Node *v = find(value);
		if (v) return v->rank();
		else {
			v = insert(value);
			int ans = v->rank();
			erase(v);
			return ans;
		}
	}

	Node *select(int k) {
		k++;
		Node *v = root;
		while (!(v->rank() + 1 <= k && v->rank() + v->count >= k)) {
			if (k < v->rank() + 1) {
				v = v->child[L];
			} else {
				k -= v->rank() + v->count;
				v = v->child[R];
			}
		}
		v->splay();
		return v;
	}

	const T &pred(const T &value) {
		Node *v = find(value);
		if (v) return v->pred()->value;
		else {
			v = insert(value);
			const T &ans = v->pred()->value;
			erase(v);
			return ans;
		}
	}

	const T &succ(const T &value) {
		Node *v = find(value);
		if (v) return v->succ()->value;
		else {
			v = insert(value);
			const T &ans = v->succ()->value;
			erase(v);
			return ans;
		}
	}
};

int n;
Splay<int, INT_MAX> splay;

void dfs(Splay<int, INT_MAX>::Node *v, int depth) {
	if (v->child[Splay<int, INT_MAX>::L]) dfs(v->child[Splay<int, INT_MAX>::L], depth + 1);
	for (int i = 0; i < depth; i++) {
		putchar(' ');
	}
	printf("%d\n", v->value);
	if (v->child[Splay<int, INT_MAX>::R]) dfs(v->child[Splay<int, INT_MAX>::R], depth + 1);
}

void print() {
	dfs(splay.root, 0);
	puts("--------------------------------------------------");
}

int main() {
	scanf("%d", &n);

	for (int i = 0; i < n; i++) {
		int command, x;
		scanf("%d %d", &command, &x);
		if (command == 1) {
			splay.insert(x);
		} else if (command == 2) {
			splay.erase(x);
		} else if (command == 3) {
			printf("%d\n", splay.rank(x));
		} else if (command == 4) {
			printf("%d\n", splay.select(x)->value);
		} else if (command == 5) {
			printf("%d\n", splay.pred(x));
		} else if (command == 6) {
			printf("%d\n", splay.succ(x));
		}
	}

	return 0;
}
```