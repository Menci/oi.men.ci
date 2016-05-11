title: 「SCOI2015」小凸玩密室 - 树形DP
categories: OI
tags: 
  - BZOJ
  - SCOI
  - 安徽集训
  - DP
  - 树形DP
permalink: scoi2015-light
date: 2016-03-23 23:16:05
---

密室是一棵有 $ n $ 个节点的完全二叉树，每个节点有一个灯泡。点亮所有灯泡即可逃出密室。每个灯泡有个权值 $ A_i $，每条边也有个权值 $ B_i $。点亮第 $ 1 $ 个灯泡不需要花费，之后每点亮 $ 1 $ 个新的灯泡 $ V $ 的花费，等于上一个被点亮的灯泡 $ U $ 到这个点 $ V $ 的距离 $ D_{u, v} $，乘以这个点的权值 $ A_v $。在点灯的过程中，要保证任意时刻所有被点亮的灯泡必须连通，在点亮一个灯泡后必须先点亮其子树所有灯泡才能点亮其他灯泡。请告诉他们，逃出密室的最少花费是多少。

<!-- more -->

### 链接
[BZOJ 4446](http://www.lydsy.com/JudgeOnline/problem.php?id=4446)

### 题解
动态规划，用 $ f_{x, i} $ 表示走完 $ x $ 及其子树再走到其第 $ i $ 层祖先的另一个孩子的最小代价。


当 $ x $ 为叶子节点时，直接走过去

$$ f_{x, i} = {\rm dist}(x, y) $$

当 $ x $ 只有左儿子时，先走到左孩子，再从左孩子走过去

$$ f_{x, i} = f_{ {\rm lchild}[x], i} * {\rm dist}(x, { {\rm lchild}[x]}) $$

当 $ x $ 既有左儿子，又有右儿子时，考虑先走哪个最优

另一个 DP：$ g_{x, i} $ 表示走完 $ x $ 及其子树再走到其第 $ i $ 层祖先的最小代价。

当 $ x $ 为叶子节点时，直接走过去

$$ g_{x, i} = {\rm dist}(x, y) $$

当 $ x $ 只有左儿子时，先走到左孩子，再从左孩子走过去

$$ g_{x, i} = g_{ {\rm lchild}[x], i} * {\rm dist}(x, { {\rm lchild}[x]}) $$

当 $ x $ 既有左儿子，又有右儿子时，考虑先走哪个最优


状态表示中，$ i = 0 $ 表示停在任意位置，因为计算 $ {\rm dist} $ 的时候任何一个点走到 $ 0 $ 的花费都是 $ 0 $。

枚举从哪个点开始，如果从根开始，答案为 $ g_{1, 0} $，否则先走自己，再走兄弟，再走父亲，再走父亲的兄弟的顺序，直到走到根，取所有答案的最小值。

### 代码
```c++
#include <cstdio>
#include <cstdlib>
#include <algorithm>

const int MAXN = 200000;
const int MAXLOGN = 18;

int n, l[MAXN + 1];
long long a[MAXN + 1], b[MAXN + 1], d[MAXN + 1], f[MAXN + 1][MAXLOGN + 1], g[MAXN + 1][MAXLOGN + 1];

inline void dp() {
	for (int x = n; x; x--) {
		for (int i = l[x] - 1; i >= 0; i--) {
			int lchild = x << 1, rchild = lchild + 1, target = x >> (l[x] - i - 1) ^ 1;
			if (lchild > n) {
				f[x][i] = a[target] * (d[x] + d[target] - (d[target >> 1] << 1));
			} else if (rchild > n) {
				f[x][i] = f[lchild][i] + a[lchild] * b[lchild];
			} else {
				f[x][i] = std::min(
					a[lchild] * b[lchild] + f[lchild][l[x]] + f[rchild][i],
					a[rchild] * b[rchild] + f[rchild][l[x]] + f[lchild][i]
				);
			}
		}
	}

	for (int x = n; x; x--) {
		for (int i = l[x]; i >= 0; i--) {
			int lchild = x << 1, rchild = lchild + 1, target = x >> (l[x] - i);
			if (lchild > n) {
				g[x][i] = a[target] * (d[x] - d[target]);
			} else if (rchild > n) {
				g[x][i] = g[lchild][i] + a[lchild] * b[lchild];
			} else {
				g[x][i] = std::min(
					a[lchild] * b[lchild] + f[lchild][l[x]] + g[rchild][i],
					a[rchild] * b[rchild] + f[rchild][l[x]] + g[lchild][i]
				);
			}
		}
	}
}

inline long long calc(int x) {
	long long result = g[x][l[x] - 1];
	for (; x != 1; x >>= 1) {
		int brother = x ^ 1, parent = x >> 1;
		if (brother > n) {
			result += a[parent >> 1] * b[parent];
		} else {
			result += a[brother] * b[brother] + g[brother][l[parent] - 1];
		}
	}

	return result;
}

inline long long solve() {
	long long ans = g[1][0];
	for (int i = 2; i <= n; i++) ans = std::min(ans, calc(i));
	return ans;
}

int main() {
	// freopen("light.in", "r", stdin);
	// freopen("light.out", "w", stdout);

	scanf("%d", &n);
	for (int i = 1; i <= n; i++) {
		scanf("%lld", &a[i]);
	}

	for (int i = 2; i <= n; i++) {
		scanf("%lld", &b[i]);
	}

	l[1] = 1, d[1] = 0;
	for (int i = 2; i <= n; i++) {
		l[i] = l[i >> 1] + 1;
		d[i] = d[i >> 1] + b[i];
	}

	dp();
	printf("%lld\n", solve());

	fclose(stdin);
	fclose(stdout);

	return 0;
}
```
