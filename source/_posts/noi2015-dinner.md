title: 「NOI2015」寿司晚宴 - 状压 DP
categories: OI
tags: 
  - NOI
  - BZOJ
  - DP
  - 状压 DP
  - 背包 DP
permalink: noi2015-dinner
date: 2016-07-01 13:23:00
---

给定 $ 2 $ ~ $ n $ 这 $ n - 1 $ 个数，让两个人分别选出一些数，使得对于第一个人选择的任意一个数 $ a $ 和第二个人选择的任意一个数 $ b $，有 $ \gcd(a, b) = 1 $，求方案数。

<!-- more -->

### 链接
[BZOJ 4197](http://www.lydsy.com/JudgeOnline/problem.php?id=4197)  
[UOJ #129](http://uoj.ac/problem/129)

### 题解
因为题目要求的条件不互质就是指没有相同的质因子，一个显然的思路是求出这些数的所有质因子，用 $ f(a, b) $（$ a $、$ b $ 为二进制集合）表示第一个人选择的质因子集合为 $ a $、第二个人为 $ b $ 的方案数。

但是这些数的质因子太多，无法进行状压，如果我们不考虑每个数 $ x $ 的（最多一个的）大于 $ \sqrt x $ 的质因子，则质因子只有 $ 8 $ 个 —— $ 2, 3, 5, 7, 11, 13, 17, 19 $，将这些质因子状压。

考虑另一个质因子的影响，设它为 $ z $，则如果一个人选了一个含有质因子 $ z $ 的数，另一个人不能选取任何含有质因子 $ z $ 的数。

将所有数按照 $ z $ 分组，对于每一组，以二进制集合的方式储存其所有数的其它质因子，设第 $ i $ 个数为 $ S_i $。一组数中，最多由某一个人选若干个。

设 $ f(a, b) $ 表示**不选**当前组的情况下，第一个人所选集合为 $ a $，第二个人所选集合为 $ b $ 的方案总数。

对于每一个集合，设 $ g(i, k, a, b) $ 表示组内前 $ i $ 个数，全部由第 $ k $ 个人来选，第一个人所选集合为 $ a $，第二个人所选集合为 $ b $ 的方案总数。

转移时，枚举组内每个数 $ x $，分别以 $ g(i - 1, 0) $ 和 $ g(i - 1, 1) $ 更新 $ g(i, 0) $ 和 $ g(i, 1) $。

$$
\begin{aligned}
g(i, 0, a, b) &=
  \begin{cases}
  f(a, b) & S_i \cap b \neq \emptyset \\
  \sum\limits_{a' \cup S_i = a} g(i - 1, a', b) + f(a, b) & S_i \cap b = \emptyset
  \end{cases} \\
g(i, 1, a, b) &=
  \begin{cases}
  f(a, b) & S_i \cap a \neq \emptyset \\
  \sum\limits_{b' \cup S_i = b} g(i - 1, a, b') + f(a, b) & S_i \cap a = \emptyset
  \end{cases}
\end{aligned}
$$

注意到枚举 $ a' $ 和 $ b' $ 时，所枚举到的 $ a' $ 或 $ b' $ 均为 $ a $ 或 $ b $ 的字集，体现在十进制意义下，即 $ a' \leq a $、$ b' \leq b $。这启发我们可以像背包一样，滚动掉第一维 $ i $，从大到小枚举 $ a $ 和 $ b $，同时刷表更新 $ g(0) $ 和 $ g(1) $。

$$
\mathrm {for \ each} \ i.\ a = U \to \emptyset,\ b = U \to \emptyset \\
\begin{aligned}
g(0, a \cup S_i, b) \leftarrow g(0, a \cup S_i, b) + g(0, a, b) && S_i \cap b = \emptyset \\
g(0, a, b \cup S_i) \leftarrow g(0, a, b \cup S_i) + g(0, a, b) && S_i \cap a = \emptyset \\
\end{aligned}
$$

最后一个问题，对于每个没有大于 $ \sqrt x $ 的因子的数 $ x $，将这些数每个单独分一组即可。

### 代码
```c++
#include <cstdio>
#include <cstring>
#include <utility>
#include <algorithm>
#include <vector>

const int MAXN = 500;
const int MAXK = 8;
const int MAXSTAT = 1 << 8;
const int PRIMES[] = { 2, 3, 5, 7, 11, 13, 17, 19 };

int main() {
	int n, p;
	scanf("%d %d", &n, &p);

	std::vector< std::vector<int> > v;
	std::vector< std::pair<int, int> > tmp;
	for (int i = 2; i <= n; i++) {
		int x = i, t = 0;
		for (int j = 0; j < 8; j++) {
			if (x % PRIMES[j] == 0) {
				while (x % PRIMES[j] == 0) x /= PRIMES[j];
				t |= 1 << j;
			}
		}

		tmp.push_back(std::make_pair(x, t));
	}

	std::sort(tmp.begin(), tmp.end());

	for (std::vector< std::pair<int, int> >::const_iterator it = tmp.begin(); it != tmp.end(); it++) {
		if (it == tmp.begin() || it->first == 1 || it->first != (it - 1)->first) {
			v.resize(v.size() + 1);
		}
		v.back().push_back(it->second);
	}

	static int f[MAXSTAT][MAXSTAT], g[2][MAXSTAT][MAXSTAT];
	f[0][0] = 1;
	for (std::vector< std::vector<int> >::const_iterator it = v.begin(); it != v.end(); it++) {
		memcpy(g[0], f, sizeof(f));
		memcpy(g[1], f, sizeof(f));

		// puts("new");
		for (std::vector<int>::const_iterator it2 = it->begin(); it2 != it->end(); it2++) {
			// printf("%d\n", *it2);
			for (int a = MAXSTAT - 1; a >= 0; a--) {
				for (int b = MAXSTAT - 1; b >= 0; b--) {
					// printf("%d %d\n", a, b);
					if (!(b & *it2)) /* printf("[0] += %d\n", g[0][a][b]), */ (g[0][a | (*it2)][b] += g[0][a][b]) %= p;
					if (!(a & *it2)) /* printf("[1] += %d\n", g[1][a][b]), */ (g[1][a][b | (*it2)] += g[1][a][b]) %= p;
					// printf("%d\n", *it2);
					// printf("%d %d\n", g[0][a][b], g[1][a][b]);
				}
			}
		}

		for (int a = MAXSTAT - 1; a >= 0; a--) {
			for (int b = MAXSTAT - 1; b >= 0; b--) {
				f[a][b] = ((g[0][a][b] + g[1][a][b] - f[a][b]) % p + p) % p;
			}
		}
	}

	int ans = 0;
	for (int a = MAXSTAT - 1; a >= 0; a--) {
		for (int b = MAXSTAT - 1; b >= 0; b--) {
			if (!(a & b)) (ans += f[a][b]) %= p;
		}
	}

	printf("%d\n", ans);

	return 0;
}
```
