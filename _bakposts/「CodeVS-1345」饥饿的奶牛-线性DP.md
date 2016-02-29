title: 「CodeVS 1345」饥饿的奶牛 - 线性DP
categories: OI
tags: 
  - CodeVS
  - DP
  - 线性DP
permalink: codevs-1345
id: 21
updated: '2016-01-19 21:04:02'
date: 2016-01-14 05:17:18
---

在 `n`（≤ 1000）条线段中选出若干条，保证任意两条线段没有公共点（端点也不能重合），使总长度最大。

<!-- more -->

### 题目链接
[CodeVS 1345](http://codevs.cn/problem/1345/)

### 解题思路
刚开始确实晕了，又是想线段树又是想背包 ……

保证线段不重合是个难点 …… 解决方法以线段的右端点排序，**去除后效性**。

以 $ f[i] $ 表示前 `i` 条线段中选出若干条（必选第 `i` 条）的最大总长度，则转移方程为：

$$ f[i]=\max\{f[j],r(j)< l(i)\}+length(i) $$

简单地说，就是只要**保证最后一条线段不与当前线段重合**，就可以添加当前线段。

注意最终答案是 $ max\{f[i],i{\in}[1,n]\} $，而不一定是 $f[n]$，因为不选最后一条线段可能比选最后一条线段更优。

### AC代码
```c++
#include <cstdio>
#include <algorithm>

const int MAXN = 1000;

struct Range {
	int l, r;

	int length() {
		return r - l + 1;
	}

	bool operator<(const Range &other) const {
		if (r == other.r) return l < other.l;
		else return r < other.r;
	}
} a[MAXN];

int n, f[MAXN];

int main() {
	scanf("%d", &n);

	for (int i = 0; i < n; i++) {
		scanf("%d %d", &a[i].l, &a[i].r);
	}

	std::sort(a, a + n);

	int ans = 0;

	for (int i = 0; i < n; i++) {
		int max = 0;
		for (int j = 0; j < i; j++) {
			if (a[j].r < a[i].l) max = std::max(max, f[j]);
		}

		f[i] = a[i].length() + max;
		ans = std::max(ans, f[i]);
	}

	printf("%d\n", ans);

	return 0;
}
```