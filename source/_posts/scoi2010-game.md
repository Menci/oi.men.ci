title: 「SCOI2010」游戏 - 二分图匹配
categories: OI
tags: 
  - BZOJ
  - SCOI
  - 图论
  - 二分图匹配
  - 匈牙利算法
  - 枚举答案
permalink: scoi2010-game
date: 2016-03-07 09:43:18
---

在游戏里，他拥有很多的装备，每种装备都有两个属性，这些属性的值用 $ [1, 10000] $ 之间的数表示。当他使用某种装备时，他只能使用该装备的某一个属性。并且每种装备最多只能使用一次。 终极 BOSS 很奇怪，攻击他的装备所使用的属性值必须从 $ 1 $ 开始连续递增地攻击，才能对 BOSS 产生伤害。也就是说一开始的时候，只能使用某个属性值为 $ 1 $ 的装备攻击 BOSS，然后只能使用某个属性值为 $ 2 $ 的装备攻击 BOSS，然后只能使用某个属性值为 $ 3 $ 的装备攻击 BOSS …… 以此类推。他最多能连续攻击 BOSS 多少次？

<!-- more -->

### 题目链接
[BZOJ 1854](http://www.lydsy.com/JudgeOnline/problem.php?id=1854)

### 解题思路
看一下数据范围 $ N ≤ 1000000 $，如果枚举每件武器，肯定要 $ O(n) $ 的算法才能过，但又想不出 $ O(n) $ 的算法来 ……

我们换一种思路，从属性值小到大，之间如果有一个数不能没有可用的武器，则不可能继续打出比这个数更大的属性值了。也就是说答案具有单调性，可以采用枚举答案并检验的方法。

题目中并没有要求某个属性值要由特定的武器打出，所以说可以任意选择某个可用的武器来打出指定的属性值。

从 $ 1 $ 开始，任选一个可打出 $ 1 $ 的武器并标记为使用过，枚举时如果发现能打出 $ X $ 的武器全部被用过了，就尝试将某一件属性值为 $ \{X, Y\} $ 武器标记为 $ X $，并寻找 $ Y $ 的替代（$ Y < X $），这样递归下去，直到某个属性值使用了一件没有被使用武器，则成功，否则失败。

算法思想与『二分图匹配』中的匈牙利算法比较相似。

### AC代码
<!-- c++ -->
```
#include <cstdio>
#include <vector>

const int MAXN = 1000000;
const int MAXX = 10000;

struct Gun {
	int x[2];
	int selected;

	Gun() : selected(-1) {}

	void select(int x) {
		if (this->x[0] == x) selected = 0;
		else selected = 1;
	}
} guns[MAXN];

int n;
std::vector<int> gunID[MAXX];

inline bool check(int x, int ignore = -1) {
	for (std::vector<int>::const_iterator p = gunID[x].begin(); p != gunID[x].end(); p++) {
		Gun &g = guns[*p];
		if (g.selected == -1) {
			g.select(x);
			return true;
		}
	}

	for (std::vector<int>::const_iterator p = gunID[x].begin(); p != gunID[x].end(); p++) {
		if (*p == ignore) continue;

		Gun &g = guns[*p];
		if (check(g.x[g.selected ^ 1], *p)) {
			g.select(x);
			return true;
		}
	}

	return false;
}

int main() {
	scanf("%d", &n);

	for (int i = 0; i < n; i++) {
		Gun &g = guns[i];

		scanf("%d %d", &g.x[0], &g.x[1]), g.x[0]--, g.x[1]--;

		gunID[g.x[0]].push_back(i);
		gunID[g.x[1]].push_back(i);
	}

	int i;
	for (i = 0; i < MAXX; i++) {
		if (!check(i)) break;
	}

	printf("%d\n", i);

	return 0;
}
```
