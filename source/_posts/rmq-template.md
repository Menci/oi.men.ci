title: RMQ 模板
categories: OI
tags: 
  - RMQ
  - 数据结构
  - 算法模板
permalink: rmq-template
date: 2016-12-30 09:18:00
---

RMQ 稀疏表（Sparse Table）的模板。

![zyz 大佬的评价](images/zyz.png)

<!-- more -->

```c++
#include <cstdio>
#include <algorithm>

const int MAXN = 100000;
const int MAXN_LOG = 17; // Math.log2(100000) = 16.609640474436812

int n, a[MAXN + 1], st[MAXN + 1][MAXN_LOG + 1], logx[MAXN + 1]; // 不能直接叫 log

inline void sparseTable()
{
	for (int i = 1; i <= n; i++)
	{
		int t = 0;
		while ((1 << (t + 1)) <= i) t++;
		logx[i] = t;
	}

	for (int i = 1; i <= n; i++) st[i][0] = a[i]; // 初始值，以每个位置开始 2 ^ 0 = 1 长度的区间，即自身

	for (int j = 1; j <= logx[n]; j++)
	{
		for (int i = 1; i <= n; i++)
		{
			// 判断当前要计算的区间是否越界
			if (i + (1 << (j - 1)) <= n) st[i][j] = std::max(st[i][j - 1], st[i + (1 << (j - 1))][j - 1]);
			else st[i][j] = st[i][j - 1];
		}
	}
}

inline int rmq(int l, int r)
{
	int t = logx[r - l];
	return std::max(st[l][t], st[r - (1 << t) + 1][t]); // 左右两个区间，恰好覆盖
}

int main()
{
	scanf("%d", &n);
	for (int i = 1; i <= n; i++) scanf("%d", &a[i]);

	sparseTable();

	int m;
	scanf("%d", &m);
	for (int i = 1; i <= m; i++)
	{
		int l, r;
		scanf("%d %d", &l, &r);
		printf("%d\n", rmq(l, r));
	}

	return 0;
}
```
