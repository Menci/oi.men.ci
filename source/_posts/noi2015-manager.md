title: 「NOI2015」软件包管理器 - 树链剖分
categories: OI
tags: 
  - NOI
  - CodeVS
  - BZOJ
  - 树链剖分
  - 数据结构
  - 高级数据结构
permalink: noi2015-manager
id: 35
updated: '2016-01-29 08:22:32'
date: 2016-01-23 10:10:12
---

你决定设计你自己的软件包管理器。不可避免地，你要解决软件包之间的依赖问题。如果软件包 A 依赖软件包 B，那么安装软件包 A 以前，必须先安装软件包 B。同时，如果想要卸载软件包 B，则必须卸载软件包A。现在你已经获得了所有的软件包之间的依赖关系。而且，由于你之前的工作，除 0 号软件包以外，在你的管理器当中的软件包都会依赖一个且仅一个软件包，而 0 号软件包不依赖任何一个软件包。依赖关系不存在环，当然也不会有一个软件包依赖自己。用户希望在安装和卸载某个软件包时，快速地知道这个操作实际上会改变多少个软件包的安装状态。

<!-- more -->

### 题目链接
[CodeVS 4621](http://codevs.cn/problem/4621/)  
[BZOJ 4196](http://www.lydsy.com/JudgeOnline/problem.php?id=4196)

### 解题思路
首先，两种操作抽象为树上询问与修改：

1. 询问某节点到根的一条链上有多少个节点打了标记；
2. 将某节点到根的一条链上所有节点打上标记；
3. 询问某节点的整棵子树上有多少个节点打了标记；
4. 将某节点的整棵子树上所有节点打上标记。

对于前两种，普通的树链剖分就可以了，但是对于后两种，我们还需要维护一个 DFS 序。DFS 序和轻重路径划分的维护看起来是有冲突的，实际上只要按照 DFS 的方式连接路径，并且在 DFS 时先遍历重链连接的子树，同时记录 DFS 序，这样得到的 DFS 序中，同一条路径是连续的，同一棵子树也是连续的。

### AC代码
<!-- c++ -->
```
#include <cstdio>
#include <stack>
#include <queue>

const int MAXN = 100000;

struct Tree;
struct SegmentTree;
struct Path;

struct SegmentTree {
	enum LazyTag {
		Cover = 1,
		Null = 0,
		Uncover = -1
	};

	struct Node {
		Node *lchild, *rchild;
		int l, r;
		LazyTag lazy;
		bool covered;
		int count;

		void pushDown() {
			if (lazy != Null) {
				if (lazy == Cover) {
					if (lchild) lchild->cover(true);
					if (rchild) rchild->cover(true);
				} else {
					if (lchild) lchild->cover(false);
					if (rchild) rchild->cover(false);
				}

				lazy = Null;
			}
		}

		void cover(bool flag) {
			if (flag) count = r - l + 1, covered = true, lazy = Cover;
			else count = 0, covered = false, lazy = Uncover;
		}

		void cover(int l, int r, bool flag) {
			if (l > this->r || r < this->l) return;
			else if (l <= this->l && r >= this->r) cover(flag);
			else {
				pushDown();
				count = 0;
				if (lchild) lchild->cover(l, r, flag), count += lchild->count;
				if (rchild) rchild->cover(l, r, flag), count += rchild->count;
			}
		}

		int query(int l, int r) {
			if (l > this->r || r < this->l) return 0;
			else if (l <= this->l && r >= this->r) return count;
			else {
				pushDown();
				return (lchild ? lchild->query(l, r) : 0) + (rchild ? rchild->query(l, r) : 0);
			}
		}

		Node(int l, int r, Node *lchild, Node *rchild) : l(l), r(r), lchild(lchild), rchild(rchild), covered(false), count(0), lazy(Null) {}
	} *root;

	static Node *build(int l, int r) {
		if (l > r) return NULL;
		else if (l == r) return new Node(l, r, NULL, NULL);
		else return new Node(l, r, build(l, l + ((r - l) >> 1)), build(l + ((r - l) >> 1) + 1, r));
	}

	SegmentTree(int l, int r) {
		root = build(l, r);
	}

	int query(int l, int r) {
		return root->query(l, r);
	}

	void cover(int l, int r, bool flag) {
		root->cover(l, r, flag);
	}
};

struct Path {
	Tree *top;

	Path(Tree *top) : top(top) {}
};

struct Tree {
	Path *path;
	Tree *parent, *children, *next;

	Tree *maxSizeChild;
	int size, pos, posEnd;
	bool visited;

	Tree() : children(NULL) {}
	Tree(Tree *parent) : parent(parent), next(parent->children), path(NULL), maxSizeChild(NULL), size(1) {}
} trees[MAXN + 1];

int n, q;
Tree *dfsOrder[MAXN + 1];
SegmentTree *segment;

inline void addEdge(int parent, int child) {
	trees[parent].children = new (&trees[child]) Tree(&trees[parent]);
}

inline void cutTree(Tree *root) {
	std::stack<Tree *> s;
	s.push(root);

	while (!s.empty()) {
		Tree *t = s.top();
		if (!t->visited) {
			for (Tree *c = t->children; c; c = c->next) {
				s.push(c);
			}

			t->visited = true;
		} else {
			for (Tree *c = t->children; c; c = c->next) {
				t->size += c->size;
				if (t->maxSizeChild == NULL || t->maxSizeChild->size < c->size) {
					t->maxSizeChild = c;
				}
			}

			s.pop();
		}
	}

	for (int i = 0; i < n; i++) trees[i].visited = false;

	int i = 0;
	s.push(root);
	while (!s.empty()) {
		Tree *t = s.top();
		if (!t->visited) {
			dfsOrder[t->pos = i++] = t;
			for (Tree *c = t->children; c; c = c->next) {
				if (c != t->maxSizeChild) s.push(c);
			}
			if (t->maxSizeChild) s.push(t->maxSizeChild);

			if (t == root || t != t->parent->maxSizeChild) {
				t->path = new Path(t);
			} else {
				t->path = t->parent->path;
			}

			t->visited = true;
		} else {
			t->posEnd = i - 1;
			s.pop();
		}
	}

	segment = new SegmentTree(0, n - 1);
}

int install(Tree *t) {
	int ans = 0;
	while (t) {
		ans += (t->pos - t->path->top->pos + 1) - segment->query(t->path->top->pos, t->pos);
		segment->cover(t->path->top->pos, t->pos, true);
		t = t->path->top->parent;
	}

	return ans;
}

int uninstall(Tree *t) {
	int ans = segment->query(t->pos, t->posEnd);
	segment->cover(t->pos, t->posEnd, false);
	return ans;
}

int main() {
	scanf("%d", &n);
	for (int i = 1; i < n; i++) {
		int p;
		scanf("%d", &p);

		addEdge(p, i);
	}

	cutTree(&trees[0]);

	scanf("%d", &q);
	for (int i = 0; i < q; i++) {
		char command[9 + 1];
		int u;
		scanf("%s %d", command, &u);

		if (command[0] == 'i') {
			printf("%d\n", install(&trees[u]));
		} else {
			printf("%d\n", uninstall(&trees[u]));
		}
	}

	return 0;
}
```