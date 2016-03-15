title: 「NOI2002」银河英雄传说 - 并查集
categories: OI
tags: 
  - CodeVS
  - NOI
  - 并查集
permalink: noi2002-galaxy
id: 2
updated: '2016-01-19 21:08:24'
date: 2015-11-23 01:14:53
---

有 30000 个元素，初始时每个元素以单独的队列形式存在，支持一下两种操作：

1.动态合并两条队列，将 `x` 元素所在队列首合并在 `y` 元素所在队列尾；  
2.查询 `x` 与 `y` 是否在同一条队列中，若是，查询 `x` 与 `y` 间隔元素数量。

共 500,000 次操作。

<!-- more -->

### 题目链接
[CodeVS 1540](http://codevs.cn/problem/1540/)

### 解题思路
由「查询」操作，考虑到使用并查集。用并查集维护两个元素是否在同一队列中，可以对查询是否在同一队列中作出回答。  
考虑将并查集扩展，维护每一个元素**所在队列**的队首和队尾。

```cpp
unsigned int find_head(unsigned int x) {
	return head[x] == x ? x : find_head(head[x]);
}

unsigned int find_tail(unsigned int x) {
	return tail[x] == x ? x : find_tail(tail[x]);
}

void merge(unsigned int x, unsigned int y) {
	unsigned int head_x = find_head(x);
	unsigned int tail_y = find_tail(y);
	head[head_x] = tail_y;
	tail[tail_y] = head_x;
}
```
然后就是查询间隔数量，这里采用前缀和的方式。
```cpp
unsigned int sum(unsigned int x, unsigned int y) {
	return std::max(pre(x), pre(y)) - std::min(pre(x), pre(y)) - 1;
}
```
`pre(x)` 的计算方法，根据合并时对 `head` 数组进行的修改，可得 `find_head(x)` 的迭代次数即为 `x` 到 `x` 所在队队首的元素数量。
```cpp
unsigned int pre(unsigned int x) {
	register unsigned int result = 0;
	
	while (head[x] != x) {
		result++;
		x = head[x];
	}
	return result;
}
```
使用这种方式维护并查集，不能对并查集使用路径压缩的优化，故整个算法时间复杂度为 $O(nm)$。  
所以 …… Boom！  

解决方法：在进行路径压缩的同时，维护每一个 `x` 到 `head[x]` 的「距离」 `prefix[x]`。  
在 `find(x)` 或者 `pre(x)` 每一次迭代时，进行路径压缩，并把 `prefix[x]` 加上 `pre(head[x])`，即**队列中在 `x` 元素之前的元素的「前缀和」**。  

注意：  
 1.**当迭代到根节点下时，不能对 `prefix[x]` 做修改。**  
 2.队首元素，即**满足 `head[x] == x` 的元素**的前缀和应总是0。  

```cpp
unsigned int find_head(unsigned int x) {
	if (head[x] == x) {
		return x;
	} else {
		if (head[head[x]] != head[x]) {
			prefix[x] += pre(head[x]); // 处理 prefix[] 数组
		}

		head[x] = find_head(head[x]); // 路径压缩
	}

	return head[x];
}

unsigned int pre(unsigned int x) {
	if (head[x] == x) {
		return prefix[x] = 0;
	} else {
		if (head[head[x]] != head[x]) {
			prefix[x] += pre(head[x]); // 处理 prefix[] 数组
		}
		head[x] = find_head(head[x]); // 路径压缩
	}

	return prefix[x];
}
```
### AC 代码
```cpp
#include <cstdio>
#include <algorithm>

const unsigned int MAXN = 30000;
const unsigned int MAXM = 500000;

unsigned int m;

struct unionfind {
	unsigned int head[MAXN], tail[MAXN], prefix[MAXN];

	void init(unsigned int n) {
		for (unsigned int i = 0; i < n; i++) {
			head[i] = i;
			tail[i] = i;
		}
	}

	unsigned int find_head(unsigned int x) {
		if (head[x] == x) {
			return x;
		} else {
			if (head[head[x]] != head[x]) {
				prefix[x] += pre(head[x]);
			}
			head[x] = find_head(head[x]);
		}

		return head[x];
	}

	unsigned int find_tail(unsigned int x) {
		return tail[x] == x ? x : tail[x] = find_tail(tail[x]);
	}

	unsigned int pre(unsigned int x) {
		if (head[x] == x) {
			return prefix[x] = 0;
		} else {
			if (head[head[x]] != head[x]) {
				prefix[x] += pre(head[x]);
			}
			head[x] = find_head(head[x]);
		}
		
		return prefix[x];
	}

	unsigned int sum(unsigned int x, unsigned int y) {
		return std::max(pre(x), pre(y)) - std::min(pre(x), pre(y)) - 1;
	}

	void merge(unsigned int x, unsigned int y) {
		unsigned int head_x = find_head(x);
		unsigned int tail_y = find_tail(y);
		head[head_x] = tail_y;
		tail[tail_y] = head_x;
		prefix[head_x] = 1;
	}
} uf;

inline bool isempty(char ch) {
	return ch != '-' && (ch < '0' || ch > '9');
}

template <typename T>
inline void read(T &x) {
	x = 0;
	register char ch;
	while (isempty(ch = getchar()));

	register bool flag = false;
	if (ch == '-') {
		flag = true;
		ch = getchar();
	}

	do {
		x = x * 10 + (ch - '0');
	} while (!isempty(ch = getchar()));

	if (flag) {
		x = -x;
	}
}

inline bool iscommand(char ch) {
	return ch == 'C' || ch == 'M';
}

int main() {
	read(m);

	uf.init(MAXN);
	for (unsigned int i = 0; i < m; i++) {
		register char command;
		register unsigned int x, y;

		while (!iscommand(command = getchar()));
		read(x), read(y);
		x--, y--;

		if (command == 'M') {
			uf.merge(x, y);
		} else {
			if (uf.find_head(x) == uf.find_head(y)) {
				printf("%u\n", uf.sum(x, y));
			} else {
				puts("-1");
			}
		}
	}

	return 0;
}
```
### 吐槽
这是当年 NOI2002 的一道水（大雾）题。  
刚开始学并查集的时候尝试做过这题，然后 …… 然后就没有然后了。  
今天突然想起这题，就用了一个小时把它 A 掉了。