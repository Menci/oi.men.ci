title: 「JSOI2007」麻将 - 枚举 + 贪心
categories: OI
tags: 
  - BZOJ
  - JSOI
  - 枚举
  - 贪心
permalink: jsoi2007-mahjong
date: 2016-11-13 08:27:00
---

在这种特殊的麻将里，没有字牌，花色也只有一种。但是，序数
不被限制在一到九的范围内，而是在 $ 1 $ 到 $ n $ 的范围内。同时，也没有每一种牌四张的限制。一组和了的牌由 $ 3m + 2 $ 张牌组成，其中两张组成对子，其余 $ 3m $ 张组成三张一组的 $ m $ 组，每组须为顺子或刻子。现给出一组 $ 3m + 1 $ 张的牌，要求判断该组牌是否为听牌（即还差一张就可以和牌）。如果是的话，输出所有可能的等待牌。

<!-- more -->

### 链接
[BZOJ 1028](http://www.lydsy.com/JudgeOnline/problem.php?id=1028)

### 题解
枚举答案，将这种牌数量 $ +1 $，枚举对子，判断剩余的牌能否出完，即优先出三张相同的牌，不足三张的判断能否与之后的牌组成顺子。

### 代码
```c++
#include <cstdio>
#include <algorithm>

const int MAXN = 400;
const int MAXM = 1000;

int main() {
	int n, m;
	scanf("%d %d", &n, &m);

	static int a[MAXN];
	for (int i = 0; i < m * 3 + 1; i++) {
		int x;
		scanf("%d", &x);
		a[x - 1]++;
	}

	static int ans[MAXN];
	int cnt = 0;
	for (int i = 0; i < n; i++) {
		static int b[MAXN];
		std::copy(a, a + n, b);
		b[i]++;

		for (int j = 0; j < n; j++) {
			if (b[j] >= 2) {
				static int c[MAXN + 2];
				std::copy(b, b + n, c);
				c[j] -= 2;

				for (int k = 0; k < n; k++) {
					if (c[k] == 0) continue;
					c[k] %= 3;
					int x = std::min(std::min(c[k], c[k + 1]), c[k + 2]);
					if (x < c[k]) goto fail;
					c[k] -= x, c[k + 1] -= x, c[k + 2] -= x;
				}

				goto success;

fail:;
			}
		}

		continue;

success:
		ans[cnt++] = i + 1;
	}

	if (cnt) {
		for (int i = 0; i < cnt; i++) printf("%d%c", ans[i], i == cnt - 1 ? '\n' : ' ');
	} else puts("NO");

	return 0;
}
```