title: 「SCOI2009」生日快乐 - 搜索
categories: OI
tags: 
  - BZOJ
  - SCOI
  - 搜索
  - DFS
permalink: scoi2009-cake
date: 2016-11-12 21:17:00
---

windy 的生日到了，为了庆祝生日，他的朋友们帮他买了一个边长分别为 $ X $ 和 $ Y $ 的矩形蛋糕。现在包括 windy，一共有 $ N $ 个人来分这块大蛋糕，要求每个人必须获得相同面积的蛋糕。windy 主刀，每一切只能平行于一块蛋糕的一边（任意一边），并且必须把这块蛋糕切成两块。这样，要切成 $ N $ 块蛋糕，windy 必须切 $ N - 1 $ 次。为了使得每块蛋糕看起来漂亮，我们要求 $ N $ 块蛋糕的长边与短边的比值的最大值最小。你能帮助 windy 求出这个比值么？

<!-- more -->

### 链接
[BZOJ 1024](http://www.lydsy.com/JudgeOnline/problem.php?id=1024)

### 题解
首先，为了保证**每个人必须获得相同面积的蛋糕**，假设某一次操作选择了蛋糕的一部分，这部分的面积为总面积的 $ k \over n $，我们必须在它的 $ k $ 等分点上切一刀，然后对切成的两个部分递归操作。

DFS 搜索每次切下的位置即可，分横切和纵切两种情况。

### 代码
```c++
#include <cstdio>
#include <cfloat>
#include <algorithm>

const int MAXN = 10;

double dfs(const int n, const double x, const double y) {
	if (n == 1) {
		return std::max(x, y) / std::min(x, y);
	}

	double res1 = DBL_MAX;
	for (int i = 1; i <= n / 2; i++) {
		res1 = std::min(res1, std::max(dfs(i, i * x / n, y), dfs(n - i, (n - i) * x / n, y)));
	}

	double res2 = DBL_MAX;
	for (int i = 1; i <= n / 2; i++) {
		res2 = std::min(res2, std::max(dfs(i, x, i * y / n), dfs(n - i, x, (n - i) * y / n)));
	}

	return std::min(res1, res2);
}

int main() {
	int x, y, n;
	scanf("%d %d %d", &x, &y, &n);
	printf("%.6lf\n", dfs(n, x, y));
	return 0;
}
```