title: 「COGS 396」魔术球问题 - 贪心
categories: OI
tags: 
  - COGS
  - 贪心
  - 网络流24题
permalink: cogs-396
id: 46
updated: '2016-02-06 23:04:22'
date: 2016-02-06 23:02:55
---

假设有 `n` 根柱子，现要按下述规则在这n根柱子中依次放入编号为 1，2，3，4 ...... 的球。

1. 每次只能在某根柱子的最上面放球；
2. 在同一根柱子中，任何 2 个相邻球的编号之和为完全平方数。

试设计一个算法，计算出在 `n` 根柱子上最多能放多少个球。

<!-- more -->

### 链接
[COGS 396](http://cogs.top/cogs/problem/problem.php?pid=396)

### 题解
放球的两个条件很显然，在上面放再多的球是不影响下面的。并且，某个球放在哪一根柱子上，只会影响其之上的球的编号，而不会影响全局的球总数。

所以可以使用贪心解决：策略是，先从一个柱子开始，每次枚举所有柱子，只要某个柱子能放就放上去，然后继续放下一个；直到所有的柱子不能放当前的球，则添加一个柱子；最后不能在添加时，就是最优解。

### 代码
```cpp
#include <cstdio>
#include <cmath>
#include <vector>

const int MAXN = 60;

int n;
std::vector<int> v[MAXN];

inline bool isSquareNumber(int x) {
	int root = floor(sqrt(x));
	return root * root == x;
}

int main() {
	freopen("balla.in", "r", stdin);
	freopen("balla.out", "w", stdout);

	scanf("%d", &n);

	int x = 1;
	for (int k = 1; k <= n; k++) {
		while (20000528) {
			bool flag = false;

			for (int i = 0; i < k; i++) {
				if (v[i].empty() || isSquareNumber(v[i].back() + x)) {
					v[i].push_back(x++);
					flag = true;
					break;
				}
			}

			if (!flag) break;
		}
	}

	printf("%d\n", x - 1);

	fclose(stdin);
	fclose(stdout);

	return 0;
}
```
