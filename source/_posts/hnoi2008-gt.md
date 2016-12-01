title: 「HNOI2008」GT考试 - KMP + 矩阵乘法
categories: OI
tags: 
  - BZOJ
  - HNOI
  - DP
  - KMP
  - 字符串
  - 矩阵乘法
  - 快速幂
permalink: hnoi2008-gt
date: 2016-10-08 06:43:00
---

给一个长度为 $ m $ 的字符串 $ T $，求长度为 $ n $ 且不包含 $ T $ 的字符串的数量。

<!-- more -->

### 连接
[BZOJ 1009](http://www.lydsy.com/JudgeOnline/problem.php?id=1009)

### 题解
对 $ T $ 串进行 KMP 预处理，设状态 $ f(i, j) $ 表示目标串的前 $ i $ 个字符，匹配到 $ T $ 串的第 $ j $ 个字符，的方案数。每次枚举下一个字符，刷表转移。

显然，每一阶段的结果都是与上一阶段结果呈线性的，可以使用矩阵快速幂优化，时间复杂度为 $ O(m ^ 3 \log n) $。

### 代码
```c++
#include <cstdio>
#include <cstring>

const int MAXN = 1e9;
const int MAXM = 20;
const int MAXK = 1000;

struct Matrix {
	int a[MAXM][MAXM];

	Matrix(const bool unit = false) {
		memset(a, 0, sizeof(a));
		if (unit) {
			for (int i = 0; i < MAXM; i++) a[i][i] = 1;
		}
	}

	int &operator()(const int i, const int j) {
		return a[i][j];
	}

	const int &operator()(const int i, const int j) const {
		return a[i][j];
	}
};

int mod;

Matrix operator*(const Matrix &a, const Matrix &b) {
	Matrix res(false);
	for (int i = 0; i < MAXM; i++) for (int j = 0; j < MAXM; j++) for (int k = 0; k < MAXM; k++) (res(i, j) += a(i, k) * b(k, j)) %= mod;
	return res;
}

Matrix pow(Matrix a, int n) {
	Matrix res(true);
	for (; n; n >>= 1, a = a * a) if (n & 1) res = res * a;
	return res;
}

int main() {
	int n, m;
	char s[MAXM + 2];
	scanf("%d %d %d\n%s", &n, &m, &mod, s + 1);

	int fail[MAXM + 1];
	fail[0] = fail[1] = 0;
	for (int i = 2; i <= m; i++) {
		int k = fail[i - 1];
		while (k && s[k + 1] != s[i]) k = fail[k];
		if (s[k + 1] == s[i]) fail[i] = k + 1;
		else fail[i] = 0;
	}

	// for (int i = 0; i <= m; i++) printf("%d%c", fail[i], i == m ? '\n' : ' ');

	/*
	int f[50][MAXM + 1];
	memset(f, 0, sizeof(f));

	f[0][0] = 1;
	for (int i = 0; i < n; i++) {
		for (int j = 0; j < m; j++) {
			for (char c = '0'; c <= '9'; c++) {
				int k = j;
				while (k && s[k + 1] != c) k = fail[k];
				if (s[k + 1] == c) k++;

				f[i + 1][k] += f[i][j];
			}
		}
	}
	*/

	Matrix shift(false);
	for (int i = 0; i < m; i++) {
		for (char c = '0'; c <= '9'; c++) {
			int k = i;
			while (k && s[k + 1] != c) k = fail[k];
			if (s[k + 1] == c) k++;
			if (k < m) shift(i, k)++;
		}
	}

	Matrix init(false);
	init(0, 0) = 1;
	Matrix res = init * pow(shift, n);

	int ans = 0;
	for (int i = 0; i < m; i++) (ans += res(0, i)) %= mod;

	printf("%d\n", ans);

	// for (int i = 0; i < MAXM; i++) for (int j = 0; j < MAXM; j++) printf("%d%c", res(i, j), j == MAXM - 1 ? '\n' : ' ');

	/*
	for (int i = 0; i <= n; i++) {
		for (int j = 0; j <= m; j++) {
			printf("f[%d][%d] = %d\n", i, j, f[i][j]);
		}
	}
	*/

	return 0;
}
```