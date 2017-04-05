title: Tarjan 强连通分量学习笔记
categories: OI
tags: 
  - 学习笔记
  - 图论
  - 强连通分量
  - Tarjan
  - 算法模板
permalink: tarjan-scc-notes
date: 2016-03-03 21:12:23
---

在一个有向图中，如果某两点间都有**互相**到达的路径，那么称中两个点**强连通**，如果任意两点都强连通，那么称这个图为**强连通图**；一个有向图的**极大**强连通子图称为**强连通分量**。

Tarjan 算法可以在 $ O(n + m) $ 的时间内求出一个图的所有强连通分量。

<!-- more -->

### 定义
Tarjan 算法的核心过程是一次 DFS，它基于的事实是，一个强连通分量中的点一定处于搜索树中同一棵子树中。

栈，搜索树中同一棵子树中的点在栈中是相邻的。

$ {\rm dfn}(u) $ 表示进入节点 $ u $ 时的时间。

$ {\rm low}(u) $ 表示由节点 $ u $ 开始搜索所能到达的点中，在搜索树上是 $ u $ 的祖先且 $ {\rm dfn} $ 最小的节点的 $ {\rm dfn} $。

### 算法描述
1. 从起点开始 DFS；
2. 进入一个节点时，初始化它的 $ {\rm dfn} $ 和 $ {\rm low} $ 均为当前时间戳，并进栈；
3. 枚举当前点 $ v $ 的所有邻接点；
4. 如果某个邻接点 $ u $ 已在栈中，则更新 $ {\rm low}(v) = \min({\rm low}(v), {\rm dfn}(u)) $；
5. 如果某个邻接点 $ u $ 未被访问过，则对 $ u $ 进行 DFS，并在回溯后更新 $ {\rm low}(v) = \min({\rm low}(v), {\rm low(u)}) $；
6. 所有邻接点回溯完成后，如果当前点仍满足 $ {\rm low}(v) = {\rm dfn}(v) $，则将栈中从 $ v $ 到栈顶的所有元素出栈，并标记为一个强连通分量。

### 解释
枚举 $ v $ 的邻接点时，如果某个邻接点 $ u $ 已在栈中，则更新

$$ {\rm low}(v) = \min({\rm low}(v), {\rm dfn}(u)) $$

因为栈中的所有点均为搜索树上点 $ v $ 的祖先，从搜索树上一个点搜到它的祖先，说明找到了一个环。此时用 $ u $ 去更新 $ v $ 的最远祖先。

如果某个邻接点 $ u $ 未被访问过，则对 $ u $ 进行 DFS，并在回溯后更新

$$ {\rm low}(v) = \min({\rm low}(v), {\rm low}(u)) $$

点 $ u $ 出发能到达的点，点 $ v $ 必定也能到达。尽管 $ {\rm low}(u) $ 可能不是 $ v $ 的祖先（可能是 $ u $ 或 $ v $ 本身），但这并不影响。

所有邻接点回溯完成后，如果当前点仍满足

$$ {\rm low}(v) = {\rm dfn}(v) $$

说明从当前点出发不可能回到任意一个搜索树上的祖先，即当前节点是某个强连通分量所在子树的根节点，而这些节点都在当前节点之后被压在了栈中。

注意，同一个强连通分量的点一定有相同的 $ {\rm low} $ 值，$ {\rm low} $ 值相同的两个点也一定在同一个强连通分量中。

### 模板
实际代码中要用到两个栈，一个用于控制 DFS（代码中的 `s`），另一个用于 Tarjan 算法（代码中的 `t`）。

因为图不一定是弱连通图，所以要以每个点为起点进行一次上述算法。

```cpp
struct Node {
	Edge *firstEdge, *currentEdge, *inEdge;
	Connected *connected;
	int dfn, low;
	bool inStack, visited, pushed;
} nodes[MAXN];

struct Edge {
	Node *from, *to;
	Edge *next;

	Edge(Node *from, Node *to) : from(from), to(to), next(from->firstEdge) {}
};

struct Connected {
	int size;
} connecteds[MAXN];

int n;

inline int tarjan() {
	int timeStamp = 0, count = 0;

	for (int i = 0; i < n; i++) {
		if (nodes[i].visited) continue;

		std::stack<Node *> s, t;
		s.push(&nodes[i]);
		nodes[i].pushed = true;

		while (!s.empty()) {
			Node *v = s.top();

			if (!v->visited) {
				v->visited = true;
				v->currentEdge = v->firstEdge;
				v->dfn = v->low = timeStamp++;
				v->inStack = true;
				t.push(v);
			}

			if (v->currentEdge) {
				Edge *&e = v->currentEdge;
				if (!e->to->pushed) s.push(e->to), e->to->pushed = true, e->to->inEdge = e;
				else if (e->to->inStack) v->low = std::min(v->low, e->to->dfn);
				e = e->next;
			} else {
				if (v->dfn == v->low) {
					v->connected = &connecteds[count++];
					Node *u;
					do {
						u = t.top();
						t.pop();
						u->inStack = false;
						u->connected = v->connected;
						u->connected->size++;
					} while (u != v);
				}

				if (v->inEdge) v->inEdge->from->low = std::min(v->inEdge->from->low, v->low);

				s.pop();
			}
		}
	}

	return count;
}
```
