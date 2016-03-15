title: 「NOIP2006」金明的预算方案 - 背包DP + 树形DP
categories: OI
tags: 
  - CodeVS
  - DP
  - Tyvj
  - Vijos
  - 树形DP
  - 洛谷
  - 背包DP
permalink: noip2006-budget
id: 25
updated: '2016-01-19 21:02:58'
date: 2016-01-17 06:11:03
---

金明今天很开心，家里购置的新房就要领钥匙了，新房里有一间金明自己专用的很宽敞的房间。更让他高兴的是，妈妈昨天对他说：“你的房间需要购买哪些物品，怎么布置，你说了算，只要不超过N元钱就行”。今天一早，金明就开始做预算了，他把想买的物品分为两类：主件与附件，附件是从属于某个主件的。

如果要买归类为附件的物品，必须先买该附件所属的主件。每个主件可以有0个、1个或2个附件。附件不再有从属于自己的附件。金明想买的东西很多，肯定会超过妈妈限定的N元。于是，他把每件物品规定了一个重要度，分为5等：用整数1~5表示，第5等最重要。他还从因特网上查到了每件物品的价格（都是10元的整数倍）。他希望在不超过N元（可以等于N元）的前提下，使每件物品的价格与重要度的乘积的总和最大。

<!-- more -->

### 题目链接
[CodeVS 1155](http://codevs.cn/problem/1155/)  
[Tyvj 1057](http://tyvj.cn/p/1057)  
[洛谷 1064](http://www.luogu.org/problem/show?pid=1064)  
[Vijos 1313](https://vijos.org/p/1313?pid=1313)

### 解题思路
其实题挺水的，直接枚举选哪个附件就好，但学了树形 DP 就要写一写嘛。

首先，我们有一个 01 背包的方程：

$$ f[v] = \max(f[v],f[v-c[i]]+w[i]) $$

对某个节点求解时，先对每一个子物品递归求解，然后进行一次 01 背包，得到一个由该物品及其附属物品组成的泛化物品组，然后一级一级地传到最顶层。

设置一个价值与费用均为 `0` 的虚拟节点并将其作为所有无依赖的物品的父节点，求解 `0` 即为最终结果。

更具体的讲解详见《背包九讲》。~~我太弱了讲不明白呢。~~

PS：有个“坑”就是题目中的背包容量太大太大了，是妥妥的要 TLE 的（只能过前五个），但是因为背包容量和每件物品的体积都是 `10` 的倍数，所以读入数据后直接除以 `10` 就好。

### AC代码
```cpp
#include <cstdio>
#include <cstring>
#include <algorithm>

const int MAXN = 60;
const int MAXV = 3200;

int n, V;

struct Tree {
	Tree *children, *next;
	int c, w;
	int f[MAXV + 1];

	Tree() {}
	Tree(Tree *parent, int c, int w) : next(parent->children), c(c), w(w) {
		memset(f, 0, sizeof(f));
	}

	void solve() {
		for (int v = V; v >= c; v--) f[v] = w;
		for (Tree *t = children; t; t = t->next) {
			t->solve();
			for (int v = V - c; v >= t->c; v--) {
				for (int i = t->c; i <= std::min(V - c, v + c); i++) {
					f[v + c] = std::max(f[v + c], f[v + c - i] + t->f[i]);
				}
			}
		}
	}
} trees[MAXN + 1];

inline void addTree(int id, int parent, int c, int w) {
	trees[parent].children = new (&trees[id]) Tree(&trees[parent], c, w);
}

int main() {
	scanf("%d %d", &V, &n);
	V /= 10;

	for (int i = 0; i < n; i++) {
		int c, p, q;
		scanf("%d %d %d", &c, &p, &q);

		addTree(i + 1, q, c / 10, c * p);
	}

	trees[0].solve();

	printf("%d\n", trees[0].f[V]);

	return 0;
}
```