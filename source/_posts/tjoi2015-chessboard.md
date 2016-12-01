title: 「TJOI2015」棋盘 - 状压 DP + 矩阵乘法
categories: OI
tags: 
  - BZOJ
  - TJOI
  - 状压 DP
  - 矩阵乘法
permalink: tjoi2015-chessboard
date: 2016-10-08 07:39:00
---

有一个 $ n $ 行 $ m $ 列的棋盘，每个棋子可以攻击到本行、上一行、下一行的一些棋子，求有多少种放棋子的方案使得任意两个棋子都不会互相攻击。

<!-- more -->

### 链接
[BZOJ 4000](http://www.lydsy.com/JudgeOnline/problem.php?id=4000)  
[COGS 1979](http://cogs.pro/cogs/problem/problem.php?pid=1979)

### 题解
枚举一行内放置的所有方案，求出每种方案是否可行，并求出相邻两行放置的所有方案是否可行。

设 $ f(i, j) $ 表示前 $ i $ 行，第 $ i $ 行放置状态为 $ j $ 的方案数，转移时枚举上一行的所有可行方案，累加。

使用矩阵快速幂优化，时间复杂度为 $ O(m ^ 3 \log n) $。

### 代码
```c++
#include <cstdio>
#include <cstring>

const int MAXN = 1000000;
const int MAXM = 6;
const int MAXSTATUS = 1 << 6;

struct Matrix {
	unsigned int a[MAXSTATUS][MAXSTATUS];

	Matrix(const bool unit = false) {
		memset(a, 0, sizeof(a));
		if (unit) for (int i = 0; i < MAXSTATUS; i++) a[i][i] = true;
	}

	unsigned int &operator()(const int i, const int j) { return a[i][j]; }
	const unsigned int &operator()(const int i, const int j) const { return a[i][j]; }
};

Matrix operator*(const Matrix &a, const Matrix &b) {
	Matrix res(false);
	for (int i = 0; i < MAXSTATUS; i++) for (int j = 0; j < MAXSTATUS; j++) for (int k = 0; k < MAXSTATUS; k++) res(i, j) += a(i, k) * b(k, j);
	return res;
}

Matrix pow(Matrix a, int n) {
	Matrix res(true);
	for (; n; n >>= 1, a = a * a) if (n & 1) res = res * a;
	return res;
}

#ifdef DBG
inline void print(const int x, const int m) {
	for (int i = 0; i < m; i++) putchar((x & (1 << i)) ? '1' : '0');
	// putchar('\n');
}
#endif

int m, w, pos;

inline void apply(const bool *tpl, const int j, bool *target) {
	for (int k = 0; k < w; k++) {
		if (j - pos + k >= 0 && j - pos + k < m && tpl[k]) target[j - pos + k] = true;
	}
}

int main() {
	freopen("tjoi2015_board.in", "r", stdin);
	freopen("tjoi2015_board.out", "w", stdout);

	int n;
	scanf("%d %d %d %d", &n, &m, &w, &pos);

	static bool attack[3][MAXM];
	for (int i = 0; i < 3; i++) for (int j = 0; j < w; j++) {
		int x;
		scanf("%d", &x);
		attack[i][j] = x;
	}
	attack[1][pos] = false;

	static bool valid[MAXSTATUS];
	for (int i = 0; i < (1 << m); i++) {
		static bool tmp[MAXM];
		for (int k = 0; k < m; k++) tmp[k] = false;
		valid[i] = true;

		for (int j = 0; j < m; j++) if (i & (1 << j)) apply(attack[1], j, tmp);

		for (int j = 0; j < m; j++) if (i & (1 << j) && tmp[j]) {
			valid[i] = false;
			break;
		}

#ifdef DBG
		printf(valid[i] ? "valid: " : "invalid: ");
		print(i, m);
		putchar('\n');
#endif
	}

	static bool near[MAXSTATUS][MAXSTATUS];
	for (int i = 0; i < (1 << m); i++) for (int j = 0; j < (1 << m); j++) {
		if (!valid[i] || !valid[j]) {
			near[i][j] = false;
			continue;
		}

		near[i][j] = true;
		static bool tmpA[MAXM], tmpB[MAXM];
		for (int k = 0; k < m; k++) tmpA[k] = tmpB[k] = false;

		for (int k = 0; k < m; k++) {
			if (!(i & (1 << k))) continue;
			apply(attack[2], k, tmpB);
		}

		for (int k = 0; k < m; k++) {
			if (!(j & (1 << k))) continue;
			apply(attack[0], k, tmpA);
		}


		for (int k = 0; k < m; k++) {
			if (((i & (1 << k)) && tmpA[k]) || ((j & (1 << k)) && tmpB[k])) {
				near[i][j] = false;
				break;
			}
		}

#ifdef DBG
		printf(near[i][j] ? "valid: " : "invalid: ");
		print(i, m);
		putchar(' ');
		print(j, m);
		putchar('\n');

		if (valid[i] && valid[j]) printf("near[%d][%d] = %d\n", i, j, static_cast<int>(near[i][j]));
#endif
	}

#ifdef DBG
	static unsigned int f[MAXN + 1][MAXSTATUS];
	f[0][0] = 1;
	for (int i = 1; i <= n; i++) {
		for (int j = 0; j < (1 << m); j++) {
			if (!valid[j]) continue;
			for (int k = 0; k < (1 << m); k++) {
				if (!valid[k]) continue;
				if (near[k][j]) f[i][j] += f[i - 1][k];
			}

			printf("f(%d, [", i);
			print(j, m);
			printf("] = %u\n", f[i][j]);
		}
	}

	unsigned int ansCheck = 0;
	for (int i = 0; i < MAXSTATUS; i++) ansCheck += f[n][i];
#endif

	Matrix shift(false);
	for (int i = 0; i < (1 << m); i++) {
		if (valid[i]) {
			for (int j = 0; j < (1 << m); j++) {
				if (valid[j]) {
					if (near[j][i]) {
						shift(j, i) = 1;
					}
				}
			}
		}
	}

	Matrix init(false);
	init(0, 0) = 1;

#ifndef FORCE
	Matrix res = pow(shift, n) * init;
#else
	Matrix res(true);
	for (int i = 1; i <= n; i++) {
		res = res * shift;
#ifdef DBG
		for (int i = 0; i < MAXSTATUS; i++) for (int j = 0; j < MAXSTATUS; j++) printf("%d%c", res(i, j), j == MAXSTATUS - 1 ? '\n' : ' ');
#endif
	}
	res = res * init;
#endif

	unsigned int ans = 0;
	for (int i = 0; i < MAXSTATUS; i++) ans += res(i, 0);
	printf("%u\n", ans);

#ifdef DBG
	printf("ansCheck = %u\n", ansCheck);
#endif

	fclose(stdin);
	fclose(stdout);

	return 0;
}
```
