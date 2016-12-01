title: 「SHOI2008」循环的债务 - DP
categories: OI
tags: 
  - BZOJ
  - SHOI
  - DP
permalink: shoi2008-debt
date: 2016-10-19 15:35:00
---

A、B、C 三个人之间互相有一些债务，每个人有每种面值 $ 1, 5, 10, 20, 50, 100 $ 的钞票若干，求使他们把债务还清的最少交换的现金数量。

<!-- more -->

### 链接
[BZOJ 1021](http://www.lydsy.com/JudgeOnline/problem.php?id=1021)

### 题解
设 $ f(i, a, b) $ 表示考虑了前 $ i $ 种面值的钞票，使 A 拥有 $ a $ 元，B 拥有 $ b $ 元的最少交换次数。

每一次考虑一种面值的钞票，枚举以下几种转移方式，使用**刷表**转移：

* $ a \rightarrow b, c $
* $ b \rightarrow a, c $
* $ c \rightarrow a, b $
* $ a, b \rightarrow c $
* $ a, c \rightarrow b $
* $ b, c \rightarrow a $

### 代码
```c++
#include <cstdio>
#include <climits>
#include <algorithm>

const int MAXN = 1000;
const int VAL[] = { -1, 1, 5, 10, 20, 50, 100 };

int main() {
	int a, b, c;
	scanf("%d %d %d", &a, &b, &c);

	if (a > 0 && b > 0 && c > 0) {
		const int min = std::min(std::min(a, b), c);
		a -= min, b -= min, c -= min;
	} else if (a < 0 && b < 0 && c < 0) {
		const int max = std::max(std::max(a, b), c);
		a -= max, b -= max, c -= max;
	}

	int has[3][6 + 1];
	int sum = 0, sums[3] = { 0, 0, 0 };
	for (int i = 0; i < 3; i++) {
		for (int j = 0; j < 6; j++) {
			scanf("%d", &has[i][6 - j]);
			sums[i] += has[i][6 - j] * VAL[6 - j];
#ifdef DBG
			for (int k = 0; k < has[i][6 - j]; k++) printf("%d\n", VAL[6 - j]);
#endif
		}
		sum += sums[i];
#ifdef DBG
		putchar('\n');
#endif
	}
#ifdef DBG
	printf("%d %d %d\n", sums[0], sums[1], sums[2]);
#endif

	static int f[6 + 1][MAXN + 1][MAXN + 1];
	for (int i = 0; i <= 6; i++) for (int j = 0; j <= MAXN; j++) for (int k = 0; k <= MAXN; k++) f[i][j][k] = INT_MAX;

	f[0][sums[0]][sums[1]] = 0;
	for (int i = 0; i < 6; i++) {
		for (int a = 0; a <= sum; a++) {
			for (int b = 0; b <= sum - a; b++) {
				const int c = sum - a - b;
				if (f[i][a][b] == INT_MAX) continue;

				// a -> b, c
				for (int tb = 0; tb <= has[0][i + 1]; tb++) {
					for (int tc = 0; tc <= has[0][i + 1] - tb; tc++) {
						if (tb + tc == 0) continue;
						const int _a = a - VAL[i + 1] * (tb + tc);
						const int _b = b + VAL[i + 1] * tb;
						const int _c = c + VAL[i + 1] * tc;
						if (_a > sum || _b < 0 || _c < 0) continue;
						f[i + 1][_a][_b] = std::min(f[i + 1][_a][_b], f[i][a][b] + tb + tc);
					}
				}

				// b -> a, c
				for (int ta = 0; ta <= has[1][i + 1]; ta++) {
					for (int tc = 0; tc <= has[1][i + 1] - ta; tc++) {
						if (ta + tc == 0) continue;
						const int _a = a + VAL[i + 1] * ta;
						const int _b = b - VAL[i + 1] * (ta + tc);
						const int _c = c + VAL[i + 1] * tc;
						if (_a < 0 || _b > sum || _c < 0) continue;
						f[i + 1][_a][_b] = std::min(f[i + 1][_a][_b], f[i][a][b] + ta + tc);
					}
				}

				// c -> a, b
				for (int ta = 0; ta <= has[2][i + 1]; ta++) {
					for (int tb = 0; tb <= has[2][i + 1] - ta; tb++) {
						if (ta + tb == 0) continue;
						const int _a = a + VAL[i + 1] * ta;
						const int _b = b + VAL[i + 1] * tb;
						const int _c = c - VAL[i + 1] * (ta + tb);
						if (_a < 0 || _b < 0 || _c > sum) continue;
						f[i + 1][_a][_b] = std::min(f[i + 1][_a][_b], f[i][a][b] + ta + tb);
					}
				}

				// a, b -> c
				for (int fa = 0; fa <= has[0][i + 1]; fa++) {
					for (int fb = 0; fb <= has[1][i + 1]; fb++) {
						if (fa + fb == 0) continue;
						const int _a = a - VAL[i + 1] * fa;
						const int _b = b - VAL[i + 1] * fb;
						const int _c = c + VAL[i + 1] * (fa + fb);
						if (_a > sum || _b > sum || _c < 0) continue;
						f[i + 1][_a][_b] = std::min(f[i + 1][_a][_b], f[i][a][b] + fa + fb);
					}
				}

				// a, c -> b
				for (int fa = 0; fa <= has[0][i + 1]; fa++) {
					for (int fc = 0; fc <= has[2][i + 1]; fc++) {
						if (fa + fc == 0) continue;
						const int _a = a - VAL[i + 1] * fa;
						const int _b = b + VAL[i + 1] * (fa + fc);
						const int _c = c - VAL[i + 1] * fc;
						if (_a > sum || _b < 0 || _c > sum) continue;
						f[i + 1][_a][_b] = std::min(f[i + 1][_a][_b], f[i][a][b] + fa + fc);
					}
				}

				// b, c -> a
				for (int fb = 0; fb <= has[1][i + 1]; fb++) {
					for (int fc = 0; fc <= has[2][i + 1]; fc++) {
						if (fb + fc == 0) continue;
						const int _a = a + VAL[i + 1] * (fb + fc);
						const int _b = b - VAL[i + 1] * fb;
						const int _c = c - VAL[i + 1] * fc;
						if (_a < 0 || _b > sum || _c > sum) continue;
						f[i + 1][_a][_b] = std::min(f[i + 1][_a][_b], f[i][a][b] + fb + fc);
					}
				}

#ifdef DBG
				if (f[i + 1][a][b] != INT_MAX) printf("f(%d, %d, %d) = %d\n", i + 1, a, b, f[i + 1][a][b]);
#endif
				f[i + 1][a][b] = std::min(f[i + 1][a][b], f[i][a][b]);
			}
		}
	}

	int resA = sums[0] - a + c, resB = sums[1] - b + a, resC = sums[2] - c + b;
#ifdef DBG
	printf("%d %d %d\n", resA, resB, resC);
#endif
	if (resA < 0 || resB < 0 || resC < 0 || f[6][resA][resB] == INT_MAX) puts("impossible");
	else printf("%d\n", f[6][resA][resB]);

	return 0;
}
```