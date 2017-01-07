title: Tarjan 双联通分量学习笔记
categories: OI
tags: 
  - 学习笔记
  - 图论
  - 双联通分量
  - Tarjan
  - 算法模板
permalink: tarjan-bcc-notes
date: 2017-01-01 08:09:00
---

坑。

<!-- more -->

### 代码（POJ 1523）
![zyz 大佬的评价](images/zyz.png)

```cpp
#include <cstdio>
#include <vector>
#include <stack>
#include <algorithm>

const int MAXN = 1000;

struct Node
{
	struct Edge *firstEdge, *inEdge;
	int dfn, low;
	bool vis, isCut;
	Node *fa;
	std::vector<struct BCC *> inBCC; // 一个点所属于的双连通分量们（只有割点会属于多个双连通分量）
} N[MAXN + 1];

struct Edge
{
	Node *from, *to;
	Edge *next, *revEdge; // 记录反向边

	Edge(Node *from, Node *to) : from(from), to(to), next(from->firstEdge) {}
};

struct BCC
{
	std::vector<Node *> nodes; // 可以记录，如，双连通分量中有哪些点
} bccs[MAXN + 1];

int cnt;

inline void addEdge(int from, int to)
{
	N[from].firstEdge = new Edge(&N[from], &N[to]);
	N[to].firstEdge = new Edge(&N[to], &N[from]);

	N[from].firstEdge->revEdge = N[to].firstEdge;
	N[to].firstEdge->revEdge = N[from].firstEdge;
}

inline void tarjan(Node *v)
{
	static int ts = 0;
	static std::stack<Edge *> s;
	v->dfn = v->low = ++ts;
	v->vis = true;

	int childCnt = 0;
	for (Edge *e = v->firstEdge; e; e = e->next)
	{
		if (e->revEdge == v->inEdge) continue; // 判断由父节点到该节点的边的反向边走回父节点

		if (!e->to->vis)
		{
			s.push(e); // 树边入栈

			childCnt++;

			e->to->fa = v;
			e->to->inEdge = e; // 记录入边
			tarjan(e->to);

			v->low = std::min(v->low, e->to->low);

			if (e->to->low >= v->dfn) // 找到割点
			{
				v->isCut = true;      // 根总是会在这里被认为是割点，稍后判断根是否为真正的割点

				// 记录点双连通分量
				Edge *tmp;
				BCC *bcc = &bccs[++cnt];
				do
				{
					tmp = s.top();
					s.pop();

					// 如果这个点「所属于的最后一个双连通分量」不是「当前的双连通分量 bcc」
					// 因为这些边可能枚举到重复的点，为了不重复记录一个点所属于的双连通分量
					if (tmp->from->inBCC.empty() || tmp->from->inBCC.back() != bcc)
					{
						tmp->from->inBCC.push_back(bcc);
						bcc->nodes.push_back(tmp->from);
					}

					// 同理
					if (tmp->to->inBCC.empty() || tmp->to->inBCC.back() != bcc)
					{
						tmp->to->inBCC.push_back(bcc);
						bcc->nodes.push_back(tmp->to);
					}
				}
				while (tmp != e); // 直到当前边为止，类比强连通分量的求法
			}
		}
		else
		{
			s.push(e); // 返祖边入栈
			v->low = std::min(v->low, e->to->dfn);
		}
	}

	if (!v->fa && childCnt < 2) v->isCut = false; // 如果根的子节点数量不够 2，则它不是一个割点
}

int main() {
	int T = 0;
	while (1)
	{
		++T;

		int n = 0;
		while (1)
		{
			int u, v;
			scanf("%d", &u);

			if (u == 0) break;

			scanf("%d", &v);

			n = std::max(n, u);
			n = std::max(n, v);

			addEdge(u, v);
		}

		if (n == 0) break;

		for (int i = 1; i <= n; i++)
		{
			if (!N[i].vis) tarjan(&N[i]);
		}

		if (T != 1) putchar('\n');
		printf("Network #%d\n", T);

		bool flag = false;
		for (int i = 1; i <= n; i++)
		{
			if (N[i].isCut)
			{
				printf("  SPF node %d leaves %d subnets\n", i, int(N[i].inBCC.size()));
				flag = true;
			}
		}

		if (!flag) puts("  No SPF nodes");

		for (int i = 1; i <= n; i++)
		{
			for (Edge *&e = N[i].firstEdge, *next; e; next = e->next, delete e, e = next);
			N[i].dfn = N[i].low = 0;
			N[i].isCut = N[i].vis = false;
			N[i].fa = NULL;
			N[i].inEdge = NULL;
			N[i].inBCC.clear();
		}

		for (int i = 1; i <= cnt; i++)
		{
			bccs[i].nodes.clear();
		}

		cnt = 0;

		if (n == 0) break;
	}

	return 0;
}
```
