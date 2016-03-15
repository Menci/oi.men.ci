title: 「NOI2004」郁闷的出纳员 - Splay
categories: OI
tags: 
  - NOI
  - BZOJ
  - CodeVS
  - Splay
  - 高级数据结构
  - 数据结构
permalink: noi2004-cashier
id: 37
updated: '2016-01-24 23:11:06'
date: 2016-01-24 23:09:03
---

工资的频繁调整很让员工反感，尤其是集体扣除工资的时候，一旦某位员工发现自己的工资已经低于了合同规定的工资下界，他就会立刻气愤地离开公司，并且再也不会回来了。每位员工的工资下界都是统一规定的。每当一个人离开公司，我就要从电脑中把他的工资档案删去，同样，每当公司招聘了一位新员工，我就得为他新建一个工资档案。老板经常到我这边来询问工资情况，现在工资第 `k` 多的员工拿多少工资。

<!-- more -->

### 题目链接
[BZOJ 1503](http://www.lydsy.com/JudgeOnline/problem.php?id=1503)  
[CodeVS 1286](http://codevs.cn/problem/1286/)

### 解题思路
这是道 Splay 入门题，多思考思考还是挺容易的。

唯一的难点貌似在同时修改工资，这时候只要像维护数列那样弄一个标记，然后向下传就好咯。扣工资时直接删掉 $[-{\infty}+1,min-1]$ 范围内的节点就好。

还有统计离开公司人数，一开始还在想删除时用了辅助节点，不知道该怎么算，一想才知道，直接看整棵树的大小变了多少嘛！

第四次敲 Splay，在从临沂经西安到成都的飞机上用了一个小时。

### AC 代码
```cpp
#include <cstdio>
#include <climits>

const int MAXN = 200100;

template <typename T, T INF>
struct Splay {
	enum Relation {
		L = 0, R = 1
	};

	struct Node {
		Node *child[2], *parent, **root;
		T value, lazy;
		int size, count;

		Node(Node *parent, Node **root, const T &value) : parent(parent), root(root), value(value), size(1), count(1), lazy(0) {
			child[L] = child[R] = NULL;
		}

		~Node() {
			if (child[L]) delete child[L];
			if (child[R]) delete child[R];
		}

		void pushDown() {
			if (lazy) {
				if (child[L]) child[L]->update(lazy);
				if (child[R]) child[R]->update(lazy);
				lazy = 0;
			}
		}

		void maintain() {
			pushDown();
			size = count;
			if (child[L]) size += child[L]->size;
			if (child[R]) size += child[R]->size;
		}

		void update(const T &value) {
			if (this->value != INF && this->value != -INF) this->value += value;
			this->lazy += value;
		}

		Relation relation() {
			return this == parent->child[L] ? L : R;
		}

		void rotate() {
			pushDown();

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
				parent->pushDown(), pushDown();
				if (parent->parent == targetParent) rotate();
				else {
					parent->parent->pushDown();
					if (relation() == parent->relation()) parent->rotate(), rotate();
					else rotate(), rotate();
				}
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
		insert(INF), insert(-INF);
	}

	~Splay() {
		delete root;
	}

	Node *find(const T &value) {
		Node *v = root;
		while (v && value != v->value) {
			v->pushDown();
			if (value < v->value) v = v->child[L];
			else v = v->child[R];
		}

		if (v) v->splay();
		return v;
	}

	Node *insert(const T &value) {
		Node *v = find(value);
		if (v) {
			v->count++, v->size++;
			return v;
		}

		Node **target = &root, *parent = NULL;
		while (*target) {
			parent = *target;
			parent->pushDown();
			parent->size++;
			if (value < parent->value) target = &parent->child[L];
			else target = &parent->child[R];
		}

		*target = new Node(parent, &root, value);
		(*target)->splay();
		return root;
	}

	const T &select(int k) {
		k++;
		Node *v = root;
		while (v->pushDown(), !(v->rank() + 1 <= k && v->rank() + v->count >= k)) {
			if (k < v->rank() + 1) v = v->child[L];
			else k -= v->rank() + v->count, v = v->child[R];
		}
		v->splay();
		return v->value;
	}

	void erase(Node *v) {
		if (v->count > 1) v->count--;
		else erase(v, v);
	}

	void erase(Node *l, Node *r) {
		Node *pred = l->pred();
		Node *succ = r->succ();

		pred->splay();
		succ->splay(pred);

		delete succ->child[L];
		succ->child[L] = NULL;
		succ->maintain(), pred->maintain();
	}

	void erase(const T &l, const T &r) {
		Node *vl = find(l), *vr = find(r);
		if (!vl) vl = insert(l);
		if (!vr) vr = insert(r);
		erase(vl, vr);
	}

	void update(const T &value) {
		root->update(value);
	}

	int rank(const T &value) {
		Node *v = find(value);
		if (v) return v->rank();
		else {
			v = insert(value);
			int result = v->rank();
			erase(v);
			return result;
		}
	}

	int size() {
		return root->size - 2;
	}
};

int n, min, deletedCount;
Splay<int, INT_MAX> splay;

void dfs(Splay<int, INT_MAX>::Node *v, int depth = 0) {
	if (!v) return;
	v->pushDown();
	dfs(v->child[Splay<int, INT_MAX>::L], depth + 1);
	for (int i = 0; i < depth; i++) putchar(' ');
	printf("%d\n", v->value);
	dfs(v->child[Splay<int, INT_MAX>::R], depth + 1);
}

inline void print() {
	dfs(splay.root);
	puts("----------------------");
}

inline bool isValid(char c) {
	return c == 'I' || c == 'A' || c == 'S' || c == 'F';
}

int main() {
	scanf("%d %d", &n, &min);

	for (int i = 0; i < n; i++) {
		char c;
		int k;
		while (!isValid(c = getchar()));
		scanf("%d", &k);
		//printf("{ command: '%c', k: '%d' }\n", c, k);
		if (c == 'I') {
			if (k >= min) splay.insert(k);
		} else if (c == 'A') {
			splay.update(k);
		} else if (c == 'S') {
			splay.update(-k);
			int oldSize = splay.size();
			splay.erase(-INT_MAX + 1, min - 1);
			deletedCount += oldSize - Splay.size();
		} else if (c == 'F') {
			if (k < 1 || k > splay.size()) puts("-1");
			else printf("%d\n", splay.select(splay.size() - k + 1));
		}

		//print();
	}

	printf("%d\n", deletedCount);

	return 0;
}
```