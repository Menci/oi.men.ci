title: 「NOIP2015」子串 - DP
categories: OI
tags: 
  - NOIP
  - CodeVS
  - DP
permalink: noip2015-substring
date: 2016-10-19 16:48:00
---

有两个仅包含小写英文字母的字符串 $ A $ 和 $ B $。现在要从字符串 $ A $ 中取出 $ k $ 个互不重叠的非空子串，然后把这 $ k $ 个子串按照其在字符串 $ A $ 中出现的顺序依次连接起来得到一个新的字符串，请问有多少种方案可以使得这个新串与字符串 $ B $ 相等？  
注意：子串取出的位置不同也认为是不同的方案。

<!-- more -->

### 链接
[CodeVS 4560](http://codevs.cn/problem/4560/)

### 题解
设 $ f(i, j, t) $ 表示字符串 $ A $ 的前 $ i $ 位和字符串 $ B $ 的前 $ j $ 位（必选 $ A_i $），取出 $ t $ 个子串的方案数；$ g(i, j, t) $ 表示字符串 $ A $ 的前 $ i $ 位和字符串 $ B $ 的前 $ j $ 位（不必选 $ A_i $），取出 $ t $ 个子串的方案数。

计算 $ f(i, j, t) $ 时，考虑匹配到前一个字符时的方案数（最后一个子串加一个字符），和单独作为一个子串的方案数。

$$
f(i, j, t) =
\begin{cases}
f(i - 1, j - 1, t) + g(i - 1, j - 1, t - 1) & A_i = B_j \\
0 & A_i \neq B_j
\end{cases}
$$

$ g(i, j, t) $ 比较显然

$$
g(i, j, t) =
\begin{cases}
g(i - 1, j, t) + f(i, j, t) & A_i = B_j \\
g(i - 1, j, t) & A_i \neq B_j
\end{cases}
$$

边界为 $ f(i, 0, 0) = g(i, 0, 0) = 1 $。

需要滚动数组。

### 代码
```c++
#include <cstdio>
#include <cstring>
#include <algorithm>

const int MAXN = 1000;
const int MAXM = 200;
const int MAXK = 200;
const int MOD = 1e9 + 7;

int main() {
	int n, m, k;
	scanf("%d %d %d", &n, &m, &k);

	static char a[MAXN + 1], b[MAXM + 1];
	scanf("%s\n%s", a, b);

	static int f[2][MAXM + 1][MAXK + 1], g[2][MAXM + 1][MAXK + 1];
	g[0][0][0] = 1;
	for (int i = 1; i <= n; i++) {
		const int curr = i % 2, prev = !curr;
		memset(f[curr], 0, sizeof(f[curr]));
		memset(g[curr], 0, sizeof(g[curr]));

		g[curr][0][0] = f[curr][0][0] = 1;
		for (int j = 1; j <= m; j++) {
			for (int t = 1; t <= std::min(j, k); t++) {
				if (a[i - 1] == b[j - 1]) {
					f[curr][j][t] = (f[prev][j - 1][t] + g[prev][j - 1][t - 1]) % MOD;
					g[curr][j][t] = (g[prev][j][t] + f[curr][j][t]) % MOD;
#ifdef DBG
					printf("g[%d][%d][%d] = %d\n", i, j, t, g[curr][j][t]);
					printf("f[%d][%d][%d] = %d\n", i, j, t, f[curr][j][t]);
#endif
				} else {
					f[curr][j][t] = 0;
					g[curr][j][t] = g[prev][j][t];
				}
			}
		}
	}

	printf("%d\n", g[n % 2][m][k]);

	return 0;
}
```
