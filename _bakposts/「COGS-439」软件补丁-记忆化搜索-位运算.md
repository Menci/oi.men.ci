title: 「COGS 439」软件补丁 - 记忆化搜索 + 位运算
categories: OI
tags: 
  - 搜索
  - 记忆化搜索
  - 位运算
  - COGS
  - 网络流24题
  - map
permalink: cogs-439
id: 50
updated: '2016-02-15 10:17:27'
date: 2016-02-15 10:13:28
---

现在有一个软件，共有 `n` 个 BUG，开发人员开发了 `m` 个补丁，每个补丁有一个应用条件，要求某些 BUG 比如存在，某些 BUG 可以不存在，某些 BUG 存在或不存在都可以；每个补丁有一个影响，会使某些 BUG 消失，会使某些 BUG 产生；每个 BUG 有一个应用时间。问修复所有 BUG 需要的最短时间为多少。

<!-- more -->

### 题目链接
[COGS 439](http://cogs.top/cogs/problem/problem.php?pid=439)

### 解题思路
记录状态：用一个 `unsigned int` 类型的数记录状态，从右边数第 `i` 个二进制位表示第 `i` 个 BUG 是否存在。用 `std::tr1::unordered_map`（哈希表）存储状态到所有时间的映射，即 `map[status]` 表示从初始状态到状态 `status` 所用的最短时间。

状态转移：每个补丁存储两个值 `effectAddition`、`effectSubtract`，前者表示应用该补丁后新增加的 BUG，后者表示减少的 BUG，则状态转移为：

```c++
newStatus = ~(~(status | effectAddition) | effectSubtract)
```

一个难点在于怎样判断补丁的应用条件，「某些 BUG 存在或不存在都可以」是难以用位运算来体现的（或者说我不会），所以我们可以把这种情况转化为「某些 BUG 必须存在」，然后在判断条件时先将当前状态加上那些「可有可无」的 BUG，然后继续判断。

```c++
  	((status | conditionAny) & conditionTrue)
		== (conditionTrue | conditionAny)
&&	(~status & conditionFalse)
		== conditionFalse
```

话说其实这道题暴力表示状态，一位一位地判断、转移也可以过的，而且照样是 COGS 上提交记录第一 ……

### AC代码
```c++
#include <cstdio>
#include <algorithm>
#include <tr1/unordered_map>
#include <queue>

const int MAXN = 20;
const int MAXM = 100;

struct Patch {
	unsigned int conditionTrue, conditionFalse, conditionAny;
	unsigned int effectAddition, effectSubtract;
	int time;
} patches[MAXM];

int n, m;
std::tr1::unordered_map<unsigned int, int> map;

inline void setBit(unsigned int &status, int i, bool flag) {
	if (flag) status |= (1 << i);
	else status &= ~(1 << i);
}

inline bool getBit(unsigned int &status, int i) {
	return ((status >> i) & 1) == 1;
}

inline void printStatus(unsigned int status, bool newLine = true) {
	for (int i = 0; i < n; i++) {
		if (getBit(status, i) == true) putchar('1');
		else putchar('0');
	}

	if (newLine) putchar('\n');
}

inline void bfs(unsigned int start) {
	std::queue<unsigned int> q;
	q.push(start);
	map[start] = 0;

	while (!q.empty()) {
		unsigned int status = q.front();
		//printStatus(status);
		q.pop();

		for (Patch *p = patches; p != patches + m; p++) {
			if (!(
						((status | p->conditionAny) & p->conditionTrue)
							== (p->conditionTrue | p->conditionAny)
					&&	(~status & p->conditionFalse)
							== p->conditionFalse
			)) continue;
			
			unsigned int newStatus = ~(~(status | p->effectAddition) | p->effectSubtract);

			int step = map[status];
			if (map.count(newStatus) != 0 && map[newStatus] <= step + p->time) continue;

			//printf("from `"), printStatus(status, false), printf("` useing `%d(%s, %s)`  to `", (int)(p - patches + 1), p->condition, p->effect), printStatus(newStatus, false), printf("`\n");

			map[newStatus] = step + p->time;
			q.push(newStatus);
		}
	}
}

int main() {
	freopen("bugs.in", "r", stdin);
	freopen("bugs.out", "w", stdout);

	scanf("%d %d", &n, &m);

	for (Patch *p = patches; p != patches + m; p++) {
		char condition[MAXN + 1], effect[MAXN + 1];
		scanf("%d %s %s", &p->time, condition, effect);

		for (int i = 0; i < n; i++) {
			if (condition[i] == '0') setBit(p->conditionAny, i, true), setBit(p->conditionTrue, i, true);
			else if (condition[i] == '+') setBit(p->conditionTrue, i, true);
			else if (condition[i] == '-') setBit(p->conditionFalse, i, true);

			if (effect[i] == '+') setBit(p->effectAddition, i, true);
			else if (effect[i] == '-') setBit(p->effectSubtract, i, true);
		}
	}

	unsigned int status = 0;
	for (int i = 0; i < n; i++) setBit(status, i, true);

	bfs(status);

	if (map.count(0) == 0) puts("-1");
	else printf("%d\n", map[0]);

	fclose(stdin);
	fclose(stdout);
	
	return 0;
}
```

### 吐槽
又是一道不是网络流但被放进「网络流24题」里的~~水~~题。