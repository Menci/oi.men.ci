title: 「NOIP2013」火柴排队 - 逆序对
categories: OI
tags: 
  - NOIP
  - CodeVS
  - 逆序对
  - 树状数组
permalink: noip2013-match
date: 2016-10-13 16:15:00
---

涵涵有两盒火柴，每盒装有 $ n $ 根火柴，每根火柴都有一个高度。现在将每盒中的火柴各自排成一列，同一列火柴的高度互不相同，两列火柴之间的距离定义为

$$ \sum\limits_{i = 1} ^ n (a_i - b_i) ^ 2 $$

其中 $ a_i $ 表示第一列火柴中第 $ i $ 个火柴的高度，$ b_i $ 表示第二列火柴中第 $ i $ 个火柴的高度。

每列火柴中相邻两根火柴的位置都可以交换，请你通过交换使得两列火柴之间的距离最小。请问得到这个最小的距离，最少需要交换多少次？

<!-- more -->

### 链接
[CodeVS 3286](http://codevs.cn/problem/3286/)

### 题解
显然，最优方案为，对于每一个 $ k \in [1, n] $，第一列中的第 $ k $ 大和第二列中的第 $ k $ 大在相同位置上。

构造一个数组 $ a $，对于第二列火柴中的第 $ i $ 个，设它为第二列中的第 $ k $ 大，设第一列火柴中的第 $ k $ 大为第 $ j $ 个，则 $ a[i] = j $。求出 $ a $ 的逆序对数即为答案。

### 代码
```c++
#include <cstdio>
#include <algorithm>

const int MAXN = 100000;
const int MOD = 99999997;

struct Match {
	int index, rank, value, w;
} a[MAXN + 1], b[MAXN + 1];

int n;

struct BinaryIndexedTree {
	int a[MAXN + 1];

	static int lowbit(int x) {
		return x & -x;
	}

	int query(int pos) {
		int res = 0;
		for (int i = pos; i > 0; i -= lowbit(i)) res += a[i];
		return res;
	}

	int query(int l, int r) {
		return query(r) - query(l - 1);
	}

	void update(int pos, int delta) {
		for (int i = pos; i <= n; i += lowbit(i)) a[i] += delta;
	}
} bit;

inline bool byVal(const Match &a, const Match &b) {
	return a.value < b.value;
}

inline bool byID(const Match &a, const Match &b) {
	return a.index < b.index;
}

int main() {
	scanf("%d", &n);
	for (int i = 1; i <= n; i++) scanf("%d", &a[i].value), a[i].index = i;
	for (int i = 1; i <= n; i++) scanf("%d", &b[i].value), b[i].index = i;

	std::sort(a + 1, a + n + 1, &byVal);
	std::sort(b + 1, b + n + 1, &byVal);

	for (int i = 1; i <= n; i++) {
		a[i].rank = b[i].rank = i;
	}

	for (int i = 1; i <= n; i++) {
		b[i].w = a[i].index;
	}

	std::sort(b + 1, b + n + 1, &byID);

	// for (int i = 1; i <= n; i++) printf("%d\n", b[i].w);

	long long ans = 0;
	for (int i = 1; i <= n; i++) {
		ans += bit.query(b[i].w + 1, n);
		bit.update(b[i].w, 1);
	}

	printf("%lld\n", ans % MOD);

	return 0;
}
```