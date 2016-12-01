title: 「SHOI2008」小约翰的游戏 - 博弈论
categories: OI
tags: 
  - BZOJ
  - SHOI
  - 数学
  - 博弈论
permalink: shoi2008-john
date: 2016-10-19 15:53:00
---

桌子上有 $ n $ 堆石子，轮流取石子，每个人取的时候，可以随意选择一堆石子，在这堆石子中取走任意多的石子，但不能一粒石子也不取，我们规定取到最后一粒石子的人算**输**。求先手是否必胜。

<!-- more -->

### 链接
[BZOJ 1022](http://www.lydsy.com/JudgeOnline/problem.php?id=1022)

### 题解
如果每堆石子都只有一个，则先手只能每次取一颗石子。如果有奇数堆，则先手必败，否则先手必胜。

如果至少有一堆石子不止有一个，则**每堆石子数量的异或不为零时，先手必胜**。

证明：如果当前每堆石子数量的异或和不为零，则先手玩家一定存在一种方案取走若干颗石子，使它们的异或和为零。下一次取时，后手玩家的任意方案均会使这个异或和变得不为零。最终，先手玩家存在一种方案，使得剩下一堆一个石子，后手玩家取到这颗石子后输。

### 代码
```c++
#include <cstdio>

const int MAXN = 50;

int main() {
	int t;
	scanf("%d", &t);
	while (t--) {
		int n;
		scanf("%d", &n);
		int s = 0;
		bool flag = false;
		while (n--) {
			int x;
			scanf("%d", &x);
			s ^= x;
			if (x > 1) flag = true;
		}

		puts(((!flag && s == 0) || (flag && s != 0)) ? "John" : "Brother");
	}

	return 0;
}
```