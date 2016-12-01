title: 「ZJOI2004」沼泽鳄鱼 - 矩阵乘法
categories: OI
tags: 
  - BZOJ
  - COGS
  - ZJOI
  - 矩阵乘法
  - DP
permalink: zjoi2004-swamp
date: 2016-10-08 06:54:00
---

给一个图，有一些鳄鱼在两个、三个或四个点之间周期性移动，求从 $ s $ 点到 $ t $ 点，恰好走 $ k $ 步，任意时刻都不与鳄鱼同时到达同一个点的方案数。

<!-- more -->

### 链接
[BZOJ 1898](www.lydsy.com/JudgeOnline/problem.php?id=1898)  
[COGS 1469](http://cogs.pro/cogs/problem/problem.php?pid=1469)

### 题解
如果没有鳄鱼的限制，答案就是邻接矩阵的 $ k $ 次方中 $ s $ 行 $ t $ 列的值。

有了鳄鱼之后，每一时刻都不能和鳄鱼停在同一个点上，所以每一次要乘的图是不同的。对于每个时间点，将鳄鱼到达点的所有出边删掉（表示，**到达**这个点会被鳄鱼吃掉）。

取 $ \mathrm{lcm}(2, 3, 4) = 12 $，图的形态每 $ 12 $ 个单位时间循环一次。分别求出这 $ 12 $ 个矩阵和它们的积，对 $ k $ 的大于 $ 12 $ 的部分做快速幂，剩余部分乘上最多 $ 11 $ 个矩阵即可。

### 代码
```c++
#include <cstdio>
#include <cstring>

const int MAXN = 50;
const int MAXM = 20;
const long long MAXK = 2e9;
const int CYCLE_LCM = 12;
const int MOD = 10000;

struct Matrix {
	int a[MAXN][MAXN];

	Matrix(const bool unit = false) {
		memset(a, 0, sizeof(a));
		if (unit) for (int i = 0; i < MAXN; i++) a[i][i] = 1;
	}

	int &operator()(const int i, const int j) { return a[i][j]; }
	const int &operator()(const int i, const int j) const { return a[i][j]; }
};

Matrix operator*(const Matrix &a, const Matrix &b) {
	Matrix res;
	for (int i = 0; i < MAXN; i++) for (int j = 0; j < MAXN; j++) for (int k = 0; k < MAXN; k++) (res(i, j) += a(i, k) * b(k, j)) %= MOD;
	return res;
}

Matrix pow(Matrix a, int n) {
	Matrix res(true);
	for (; n; n >>= 1, a = a * a) if (n & 1) res = res * a;
	return res;
}

int main() {
	freopen("swamp.in", "r", stdin);
	freopen("swamp.out", "w", stdout);

	int n, m, st, ed, k;
	scanf("%d %d %d %d %d", &n, &m, &st, &ed, &k);

	Matrix g;
	while (m--) {
		int u, v;
		scanf("%d %d", &u, &v);

		g(u, v)++;
		g(v, u)++;
	}

	Matrix gs[CYCLE_LCM];
	for (int i = 0; i < CYCLE_LCM; i++) gs[i] = g;

	scanf("%d", &m);
	while (m--) {
		int cycle;
		scanf("%d", &cycle);
		for (int i = 0; i < cycle; i++) {
			int x;
			scanf("%d", &x);
			for (int j = i; j < CYCLE_LCM; j += cycle) {
				for (int l = 0; l < n; l++) gs[j](x, l) = 0;
			}
		}
	}

#ifdef DBG
	for (int i = 0; i < n; i++) for (int j = 0; j < n; j++) printf("%d%c", g(i, j), j == n - 1 ? '\n' : ' ');
	puts("-------------");
	for (int l = 0; l < CYCLE_LCM; l++) {
		for (int i = 0; i < n; i++) for (int j = 0; j < n; j++) printf("%d%c", gs[l](i, j), j == n - 1 ? '\n' : ' ');
		puts("-------------");
	}
#endif

#ifndef FORCE
	Matrix prod(true);
	for (int i = 0; i < CYCLE_LCM; i++) prod = prod * gs[i];

	Matrix res = pow(prod, k / CYCLE_LCM);
	for (int i = 0; i < k % CYCLE_LCM; i++) res = res * gs[i];
#else
	Matrix res(true);
	for (int i = 0; i < k; i++) res = res * gs[i % CYCLE_LCM];
#endif

	printf("%d\n", res(st, ed));

#ifdef DBG
	for (int i = 0; i < n; i++) for (int j = 0; j < n; j++) printf("%d%c", res(i, j), j == n - 1 ? '\n' : ' ');
#endif

	fclose(stdin);
	fclose(stdout);

	return 0;
}
```