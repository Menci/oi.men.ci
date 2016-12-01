title: 「NOIP2016」换教室 - Floyd + DP + 概率与期望
categories: OI
tags: 
  - NOIP
  - DP
  - Floyd
  - 概率与期望
permalink: noip2016-classroom
date: 2016-11-29 15:35:00
---

对于刚上大学的牛牛来说，他面临的第一个问题是如何根据实际情况申请合适的课程。

在可以选择的课程中，有 $ 2n $ 节课程安排在 $ n $ 个时间段上。在第 $ i $ （$ 1 \leq  i \leq n $）个时间段上，两节内容相同的课程同时在不同的地点进行，其中，牛牛预先被安排在教室 $ c_i $ 上课，而另一节课程在教室 $ d_i $ 进行。

在不提交任何申请的情况下，学生们需要按时间段的顺序依次完成所有的 $ n $ 节安排好的课程。如果学生想更换第i节课程的教室，则需要提出申请。若申请通过，学生就可以在第 $ i $ 个时间段去教室 $ d_i $ 上课，否则仍然在教室 $ c_i $ 上课。

由于更换教室的需求太多，申请不一定能获得通过。通过计算，牛牛发现申请更换第 $ i $ 节课程的教室时，申请被通过的概率是一个已知的实数 $ k_i $，并且对于不同课程的申请，被通过的概率是互相独立的。

学校规定，所有的申请只能在学期开始前一次性提交，并且每个人只能选择至多 $ m $ 节课程进行申请。这意味着牛牛必须一次性决定是否申请更换每节课的教室，而不能根据某些课程的申请结果来决定其他课程是否申请；牛牛可以申请白己最希望更换教室的 $ m $ 门课程，也可以不用完这 $ m $ 个申请的机会，甚至可以一门课程都不申请。

因为不同的课程可能会被安排在不同的教室进行，所以牛牛需要利用课问时间从一间教室赶到另一间教室。

牛牛所在的大学有 $ v $ 个教室，有 $ e $ 条道路。每条道路连接两间教室，并且是可以双向通行的。由于道路的长度和拥堵程度不同，通过不同的道路耗费的体力可能会有所不同。当第 $ i $（$ 1 \leq i \leq n - 1 $）节课结束后，牛牛就会从这节课的教室出发，选择一条耗费体力最少的路径前往下一节课的教室。

现在牛牛想知道，申请哪几门课程可以使他因在教室问移动耗费的体力值的总和的期望值最小，请你帮他求出这个最小值。

<!-- more -->

### 链接
[Luogu 1850](https://www.luogu.org/problem/show?pid=1850)  
[LYOI #101](https://ly.men.ci/problem/101)

### 题解
使用 Floyd 算法求出任意两点间的最短路。考虑到某一节课的教室只会影响到最近两段路程，设 $ f(i, j, k) $ 表示前 $ i $ 节课，使用了 $ j $ 次申请交换，$ k \in \{ 0, 1 \} $ 表示第 $ i $ 次是否申请交换的最小期望。

首先考虑 $ f(i, j, 0) $ 的转移。上一次可以申请，也可以不申请，取较小值：

$$
f(i, j, 0) = \min
\begin{cases}
f(i - 1, j, 0) + \mathrm{dist}(c(i - 1), c(i)) \\ \\
\begin{aligned}
f(i - 1, j, 1) & + \mathrm{dist}(d(i - 1), c(i)) \times k(i - 1) \\
& + \mathrm{dist}(c(i - 1), c(i)) \times (1 - k(i - 1))
\end{aligned}
\end{cases}
$$

$ f(i, j, 1) $ 的转移稍微复杂一些

$$
f(i, j, 1) = \min
\begin{cases}
\begin{aligned}
f(i - 1, j - 1, 0) &+ \mathrm{dist}(c(i - 1), d(i)) \times k(i) \\
&+ \mathrm{dist}(c(i - 1), c(i)) \times (1 - k(i))
\end{aligned}
\\ \\
\begin{aligned}
f(i - 1, j - 1, 1) &+ \mathrm{dist}(d(i - 1), d(i)) \times k(i - 1) \times k(i) \\
&+ \mathrm{dist}(c(i - 1), d(i)) \times (1 - k(i - 1)) \times k(i) \\
&+ \mathrm{dist}(d(i - 1), c(i)) \times k(i - 1) \times (1 - k(i)) \\
&+ \mathrm{dist}(c(i - 1), c(i)) \times (1 - k(i - 1)) \times (1 - k(i))
\end{aligned}
\end{cases}
$$

边界

$$
\begin{aligned}
f(i, 0, 1) &= +\infty \\
f(1, 0, 0) &= 0
\end{aligned}
$$

时间复杂度为 $ O(v ^ 3 + nm) $。

### 代码
```c++
#include <cstdio>
#include <cfloat>
#include <climits>
#include <algorithm>

const int MAXCNT = 2000;
const int MAXN = 300;

int cnt, max, n, c[MAXCNT + 1], d[MAXCNT + 1], g[MAXN + 1][MAXN + 1];
double k[MAXCNT + 1];

int main() {
	freopen("classroom.in", "r", stdin);
	freopen("classroom.out", "w", stdout);

	int m;
	scanf("%d %d %d %d", &cnt, &max, &n, &m);

	for (int i = 1; i <= cnt; i++) scanf("%d", &c[i]);
	for (int i = 1; i <= cnt; i++) scanf("%d", &d[i]);
	for (int i = 1; i <= cnt; i++) scanf("%lf", &k[i]);

	for (int i = 1; i <= n; i++) {
		for (int j = 1; j <= n; j++) {
			g[i][j] = INT_MAX;
		}
	}

	while (m--) {
		int u, v, w;
		scanf("%d %d %d", &u, &v, &w);
		g[u][v] = g[v][u] = std::min(g[u][v], w);
	}

	for (int k = 1; k <= n; k++) {
		for (int i = 1; i <= n; i++) {
			for (int j = 1; j <= n; j++) {
				if (g[i][k] != INT_MAX && g[k][j] != INT_MAX && g[i][j] > g[i][k] + g[k][j]) {
					g[i][j] = g[i][k] + g[k][j];
				}
			}
		}
	}

	for (int i = 1; i <= n; i++) g[i][i] = 0;

	static double f[MAXCNT + 1][MAXCNT + 1][2];
	f[1][0][0] = 0;
	f[1][0][1] = DBL_MAX;

	for (int i = 2; i <= cnt; i++) {
		f[i][0][0] = f[i - 1][0][0] + g[c[i - 1]][c[i]];
		f[i][0][1] = DBL_MAX;

		for (int j = 1; j <= max; j++) {
			f[i][j][0] = f[i][j][1] = DBL_MAX;

			if (f[i - 1][j][0] != DBL_MAX) {
				f[i][j][0] = std::min(f[i][j][0], f[i - 1][j][0] + g[c[i - 1]][c[i]]);
			}

			if (f[i - 1][j][1] != DBL_MAX) {
				f[i][j][0] = std::min(f[i][j][0], f[i - 1][j][1]
													+ (g[d[i - 1]][c[i]] * k[i - 1])
													+ (g[c[i - 1]][c[i]] * (1 - k[i - 1]))
				);
			}

			if (f[i - 1][j - 1][0] != DBL_MAX) {
				f[i][j][1] = std::min(f[i][j][1], f[i - 1][j - 1][0]
													+ (g[c[i - 1]][d[i]] * k[i])
													+ (g[c[i - 1]][c[i]] * (1 - k[i]))
				);
			}

			if (f[i - 1][j - 1][1] != DBL_MAX) {
				f[i][j][1] = std::min(f[i][j][1], f[i - 1][j - 1][1]
													+ (g[d[i - 1]][d[i]] * k[i - 1] * k[i])
													+ (g[c[i - 1]][d[i]] * (1 - k[i - 1]) * k[i])
													+ (g[d[i - 1]][c[i]] * k[i - 1] * (1 - k[i]))
													+ (g[c[i - 1]][c[i]] * (1 - k[i - 1]) * (1 - k[i]))
				);
			}
		}

#ifdef DBG
		for (int j = 0; j <= max; j++) {
			printf("f[%d][%d][0] = %.4lf\n", i, j, f[i][j][0]);
			printf("f[%d][%d][1] = %.4lf\n", i, j, f[i][j][1]);
		}
#endif
	}

	double ans = DBL_MAX;
	for (int i = 0; i <= max; i++) {
		ans = std::min(ans, f[cnt][i][0]);
		ans = std::min(ans, f[cnt][i][1]);
	}

	printf("%.2lf\n", ans);

	fclose(stdin);
	fclose(stdout);

	return 0;
}
```
