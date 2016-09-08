title: Tarjan 割点学习笔记
categories: OI
tags: 
  - 学习笔记
  - 图论
  - 割点
  - Tarjan
  - 算法模板
permalink: tarjan-cut-notes
date: 2016-09-08 19:45:00
---

在一个无向图中，如果删掉点 $ v $ 后图的连通块数量增加，则称点 $ v $ 为图的**割点**。

<!-- more -->

### 定义
$ \mathrm{dfn}(u) $ 表示进入节点 $ u $ 时的时间。

$ \mathrm{low}(u) $ 表示由节点 $ u $ 开始搜索所能到达的点中，在搜索树上是 $ u $ 的祖先且 $ \mathrm{dfn} $ 最小的节点的 $ \mathrm{dfn} $。

### 算法描述
类似于 Tarjan 求强连通分量的算法。

1. 从起点开始 DFS；
2. 进入一个节点时，初始化它的 $ \mathrm{dfn} $ 和 $ \mathrm{low} $ 均为当前时间戳；
3. 枚举当前点 $ v $ 的所有邻接点；
4. 如果某个邻接点 $ u $ 已被访问过，则更新 $ \mathrm{low}(v) = \min(\mathrm{low}(v), \mathrm{dfn}(u)) $；
5. 如果某个邻接点 $ u $ 未被访问过，则对 $ u $ 进行 DFS，并在回溯后更新 $ \mathrm{low}(v) = \min(\mathrm{low}(v), \mathrm{low(u)}) $；
6. 对于一个搜索树上的非根节点 $ u $，如果存在子节点 $ v $，满足 $ \mathrm{low}(v) \geq \mathrm{dfn}(u) $，则 $ u $ 为割点；
7. 对于根节点，如果它有两个或更多的子节点，则它为割点。

### 解释
> 对于根节点，如果它有两个或更多的子节点，则它为割点。

显然，根是两棵子树上节点的唯一连通方式。

> 对于一个搜索树上的非根节点 $ u $，如果存在子节点 $ v $，满足 $ \mathrm{low}(v) \geq \mathrm{dfn}(u) $，则 $ u $ 为割点；

$ \mathrm{low}(v) \geq \mathrm{dfn}(u) $ 的意义是，$ v $ 向上无法到达 $ u $ 的父节点。

### 模板
```c++
struct Node {
	struct Edge *e, *c;
	Node *p;
	int dfn, low;
	bool v, pushed, flag;
} N[MAXN];

struct Edge {
	Node *s, *t;
	Edge *next;

	Edge(Node *s, Node *t) : s(s), t(t), next(s->e) {}
};

inline void addEdge(const int s, const int t) {
	N[s].e = new Edge(&N[s], &N[t]);
	N[t].e = new Edge(&N[t], &N[s]);
}

int n;

inline int tarjan() {
	int ts = 0, cnt = 0;
	for (int i = 0; i < n; i++) {
		if (N[i].v) continue;
		std::stack<Node *> s;
		s.push(&N[i]);
		N[i].pushed = true;

		while (!s.empty()) {
			Node *v = s.top();
			if (!v->v) {
				v->v = true;
				v->c = v->e;
				v->low = v->dfn = ++ts;
			}

			if (v->c) {
				Edge *&e = v->c;
				if (e->t->v) v->low = std::min(v->low, e->t->dfn);
				else if (!e->t->pushed) e->t->pushed = true, s.push(e->t), e->t->p = v;
				e = e->next;
			} else {
				if (v != &N[i]) for (Edge *e = v->e; e; e = e->next) if (e->t->low >= v->dfn && e->t->p == v) {
					v->flag = true;
					break;
				}
                
				if (v->flag) cnt++;

				if (v->p) v->p->low = std::min(v->p->low, v->low);
				
				s.pop();
			}
		}

		int cnt = 0;
		for (Edge *e = N[i].e; e; e = e->next) if (e->t->p == &N[i]) cnt++;
		N[i].flag = cnt >= 2;
	}

	return cnt;
}
```