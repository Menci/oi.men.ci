title: Splay 学习笔记（二）
categories: OI
tags: 
  - BZOJ
  - Splay
  - 学习笔记
  - 数据结构
  - 高级数据结构
permalink: splay-notes-2
id: 7
updated: '2016-01-19 21:07:35'
date: 2015-12-23 05:44:41
---

在 Splay 学习笔记（一）中，我们学会了用 Splay 维护二叉排序树，来实现了有序集合的查询 / 修改操作，接下来，我们来研究 Splay 在维护数列中的用途。

<!-- more -->

### 基本原理
我们知道，Splay 可以在不改变二叉树的中序遍历的情况下对节点进行旋转，通常我们用 Splay 来维护二叉排序树，用 Splay 维护的二叉排序树支持**区间删除**操作，但我们也可以通过一个数列的中序遍历创建一棵 Splay，然后使用类似区间删除中选择区间的原理来处理区间问题。

这里，我们使用 Splay 实现数列的区间反转，反转一段区间，就对应了二叉树中的反转其**中序遍历**，我们可以使用递归交换左右子树的方法来实现，类比线段树的区间操作，在这里也可以应用线段树中的 `lazy-tag` 思想，给区间打标记。

```cpp
struct node_t {
	node_t *lchild, *rchild, *parent, **root;
	T value;
	uint size;
	bool reversed;
	bool bound;
}
```

其中 `reversed` 表示以该节点为根的 Splay（其中序序列）有没有被反转，`bound` 表示该节点是否为数列的边界（相当于原 Splay 二叉排序树中的 `MIN` 和 `MAX` 两个虚拟节点）。

### 数列de构建
我们通常使用一个数列（数组）来初始化 Splay，这里使用递归构造每个区间的方式实现。具体我们编写两个 `build()`，分别针对**整棵树**和**一个区间**。

```cpp
void build(const T *a, uint n) {
	root = build(a, 1, n, NULL);

	node_t **lbound = &root, *lbound_parent = NULL;
	while (*lbound) {
		lbound_parent = *lbound;
		lbound_parent->size++;
		lbound = &(*lbound)->lchild;
	}
	*lbound = new node_t(lbound_parent, &root, 0, true);


	node_t **rbound = &root, *rbound_parent = NULL;
	while (*rbound) {
		rbound_parent = *rbound;
		rbound_parent->size++;
		rbound = &(*rbound)->rchild;
	}
	*rbound = new node_t(rbound_parent, &root, 0, true);
}

node_t *build(const T *a, uint l, uint r, node_t *parent) {
	if (l > r) {
		return NULL;
	}

	uint mid = l + ((r - l) >> 1);
		
	node_t *node = new node_t(parent, &root, a[mid - 1]);
	if (l != r) {
		node->lchild = build(a, l, mid - 1, node);
		node->rchild = build(a, mid + 1, r, node);
		node->maintain();
	}

	return node;
}
```

为了方便区间操作，我们在树的最左下端和最右下端分别创建一个虚拟节点，表示整棵树所表示的**开区间**的边界。

注意递归构建时的区间计算，与线段树的**只有叶子节点表示单点，其它节点全部表示区间**不同，Splay 的每个节点都既表示**一个单点**，又表示**以该节点为根的 Splay 的所有节点构成的区间**，每个节点所代表的区间都会根据树的形态变化而变化，正因为如此，我们才可以通过 Splay 实现灵活的区间操作。

### 标记de下放
我们对区间操作的维护采用了类似线段树中 `lazy-tag` 的思想。同样，在 Splay 中，我们也需要在必要时对标记进行下放。

```cpp
node_t *pushdown() {
	if (reversed) {
		std::swap(lchild, rchild);

		if (lchild) {
			lchild->reversed ^= 1;
		}

		if (rchild) {
			rchild->reversed ^= 1;
		}

		reversed = false;
	}

	return this;
}
```
反转标记的下放非常简单，交换左右子树，然后将标记打到子树上（`^= 1` 这里使用位运算异或来实现取反）。

### 单点de选择
当我们需要查询数列中某个点的信息时，我们需要对单点进行 `select()` 操作，这恰好对应了原 Splay 中选择第 `k` 大的操作。

```cpp
node_t *select(uint k) {
	k++;
	node_t *node = root;
	while (k != node->pushdown()->lsize() + 1) {
		if (k < node->lsize() + 1) {
			node = node->lchild;
		} else {
			k -= node->lsize() + 1;
			node = node->rchild;
		}
	}

	return node->splay();
}
```

**注意**：`while` 循环判断条件中，调用 `node->lsize()` 取得其左子树大小前，一定要先将 `node` 的标记下放。**如果某个节点上的标记没有被下放，那么对其左、右孩子的访问都是非法的。**

### 区间de选择
为了实现区间操作，我们需要选择某个区间。注意这里的 `select()` 操作得到区间是指**代表该区间的节点**。为了准确的选择区间，我们需要对树的形态做一些调整。

在 Splay 中选择一个开区间的步骤：

1. 将区间的左端点 `Splay` 到**根**；
2. 将区间的右端点 `Splay` 到**根的右子树**；
3. 右端点的左子树即为要选择的区间。

代码实现要注意**闭区间**到**开区间**的转化，同时，这里也体现出了两个虚拟节点带来的便利。

```cpp
node_t *select(uint l, uint r) {
	node_t *lbound = select(l - 1);
	node_t *rbound = select(r + 1);

	lbound->splay();
	rbound->splay(&lbound->rchild);

	return rbound->lchild;
}
```

### 区间de操作
对区间进行操作时，我们只需要选择这段区间，并对所得的节点打上标记即可。

以区间反转为例：

```cpp
void reverse(uint l, uint r) {
	node_t *range = select(l, r);
	range->reversed ^= 1;
}
```

### 结果de获取
为了在结束时获取操作结果并输出，我们编写 `fetch()` 方法，将整棵树的中序序列复制到一个数组中。

```C++
void fetch(T *a) {
	dfs(a, root);
}

void dfs(T *&a, node_t *node) {
	if (node) {
		node->pushdown();

		dfs(a, node->lchild);

		if (!node->bound) {
			*a++ = node->value;
		}

		dfs(a, node->rchild);
	}
}
```

需要注意及时进行 `pushdown()` 操作和对边界的判断。

### 注意事项
需要注意的是，在访问每个节点之前，我们都需要保证树上没有**针对该节点**的标记（即从根节点到该节点的一整条链上没有标记），否则即为不可预料的非法访问。

旋转，操作前先对父节点和自身执行 `pushdown()`，**然后再求 `relation()`**。

```C++
void rotate() {
	parent->pushdown();
	pushdown();

	node_t *old = parent;
	uint x = relation();

	if (grandparent()) {
		grandparent()->child(old->relation()) = this;
	}
	parent = grandparent();

	old->child(x) = child(x ^ 1);
	if (child(x ^ 1)) {
		child(x ^ 1)->parent = old;
	}

	child(x ^ 1) = old;
	old->parent = this;

	old->maintain();
	maintain();

	if (!parent) {
		*root = this;
	}
}
```

`Splay` 操作，每次循环开始时需要对父节点进行一次 `pushdown()`，因为接下来就要调用 `relation()`。

```C++
node_t *splay(node_t **target = NULL) {
	if (!target) {
		target = root;
	}

	while (this != *target) {
		parent->pushdown();

		if (parent == *target) {
			rotate();
		} else if (relation() == parent->relation()) {
			parent->rotate(), rotate();
		} else {
			rotate(), rotate();
		}
	}

	return *target;
}
```

还有上文提到过的单点选择 `select()` 和 `dfs()` 遍历，因为涉及到对子节点的访问，所以在访问前也需要 `pushdown()`。

### 完整代码（Tyvj / BZOJ 文艺平衡树）

```cpp
#include <cstdio>
#include <algorithm>

typedef unsigned int uint;

const uint MAXN = 100000;
const uint MAXM = 100000;

void print(void *node);

template <typename T>
struct splay_t {
	struct node_t {
		node_t *lchild, *rchild, *parent, **root;
		T value;
		uint size;
		bool reversed;
		bool bound;

		node_t(node_t *parent, node_t **root, const T &value, bool bound = false) : parent(parent), lchild(NULL), rchild(NULL), root(root), value(value), size(1), reversed(false), bound(bound) {}

		~node_t() {
			if (lchild) {
				delete lchild;
			}

			if (rchild) {
				delete rchild;
			}
		}

		void maintain() {
			size = lsize() + rsize() + 1;
		}

		uint lsize() {
			return lchild ? lchild->size : 0;
		}

		uint rsize() {
			return rchild ? rchild->size : 0;
		}

		node_t *&child(uint x) {
			return !x ? lchild : rchild;
		}

		node_t *grandparent() {
			return !parent ? NULL : parent->parent;
		}

		uint relation() {
			return this == parent->lchild ? 0 : 1;
		}

		node_t *pushdown() {
			if (reversed) {
				std::swap(lchild, rchild);

				if (lchild) {
					lchild->reversed ^= 1;
				}

				if (rchild) {
					rchild->reversed ^= 1;
				}

				reversed = false;
			}

			return this;
		}

		void rotate() {
			parent->pushdown();
			pushdown();

			node_t *old = parent;
			uint x = relation();

			if (grandparent()) {
				grandparent()->child(old->relation()) = this;
			}
			parent = grandparent();

			old->child(x) = child(x ^ 1);
			if (child(x ^ 1)) {
				child(x ^ 1)->parent = old;
			}

			child(x ^ 1) = old;
			old->parent = this;

			old->maintain();
			maintain();

			if (!parent) {
				*root = this;
			}
		}

		node_t *splay(node_t **target = NULL) {
			if (!target) {
				target = root;
			}

			while (this != *target) {
				parent->pushdown();

				if (parent == *target) {
					rotate();
				} else if (relation() == parent->relation()) {
					parent->rotate(), rotate();
				} else {
					rotate(), rotate();
				}
			}

			return *target;
		}
	} *root;

	~splay_t() {
		delete root;
	}

	void build(const T *a, uint n) {
		root = build(a, 1, n, NULL);

		node_t **lbound = &root, *lbound_parent = NULL;
		while (*lbound) {
			lbound_parent = *lbound;
			lbound_parent->size++;
			lbound = &(*lbound)->lchild;
		}
		*lbound = new node_t(lbound_parent, &root, 0, true);


		node_t **rbound = &root, *rbound_parent = NULL;
		while (*rbound) {
			rbound_parent = *rbound;
			rbound_parent->size++;
			rbound = &(*rbound)->rchild;
		}
		*rbound = new node_t(rbound_parent, &root, 0, true);
	}

	node_t *build(const T *a, uint l, uint r, node_t *parent) {
		if (l > r) {
			return NULL;
		}

		uint mid = l + ((r - l) >> 1);
		
		node_t *node = new node_t(parent, &root, a[mid - 1]);
		if (l != r) {
			node->lchild = build(a, l, mid - 1, node);
			node->rchild = build(a, mid + 1, r, node);
			node->maintain();
		}

		return node;
	}

	node_t *select(uint k) {
		k++;
		node_t *node = root;
		while (k != node->pushdown()->lsize() + 1) {
			if (k < node->lsize() + 1) {
				node = node->lchild;
			} else {
				k -= node->lsize() + 1;
				node = node->rchild;
			}
		}

		return node->splay();
	}

	node_t *select(uint l, uint r) {
		node_t *lbound = select(l - 1);
		node_t *rbound = select(r + 1);

		lbound->splay();
		rbound->splay(&lbound->rchild);

		return rbound->lchild;
	}

	void reverse(uint l, uint r) {
		node_t *range = select(l, r);
		range->reversed ^= 1;
	}

	void fetch(T *a) {
		dfs(a, root);
	}

	void dfs(T *&a, node_t *node) {
		if (node) {
			node->pushdown();

			dfs(a, node->lchild);

			if (!node->bound) {
				*a++ = node->value;
			}
			
			dfs(a, node->rchild);
		}
	}
};

void dfs(splay_t<uint>::node_t *node, uint depth = 0) {
	if (node) {
		dfs(node->rchild, depth + 1);
		
		for (uint i = 0; i < depth; i++) {
			putchar(' ');
		}
		printf("%d : %u\n", node->value, node->size);
		
		dfs(node->lchild, depth + 1);
	}
}

void print(void *node) {
	puts("------------------------------------------");
	dfs((splay_t<uint>::node_t *)node);
	puts("------------------------------------------");
}

uint n, m;
splay_t<uint> splay;
uint a[MAXN];

int main() {
	scanf("%u %u", &n, &m);

	for (uint i = 0; i < n; i++) {
		a[i] = i + 1;
	}

	splay.build(a, n);

	for (uint i = 0; i < m; i++) {
		uint l, r;
		scanf("%u %u", &l, &r);
		splay.reverse(l, r);
	}

	splay.fetch(a);

	for (uint i = 0; i < n; i++) {
		printf("%u ", a[i]);
	}

	return 0;
}
```

### 总结
学完了这些，对 Splay 维护数列的原理与实现也就基本了解了。其他的一些功能，比如区间最值，区间求和也都大同小异。有些区间操作使用线段树也可实现，但 Splay 的另一个优势在于，它可以动态地插入、删除节点，也就可以实现动态插入、删除区间，这是线段树所不具备的。