title: 「SDOI2009」HH 的项链 - 莫队
categories: OI
tags: 
  - BZOJ
  - SDOI
  - 数据结构
  - 莫队
permalink: sdoi2009-diff
date: 2017-01-13 09:45:00
---

给一个长度为 $ n $ 的序列，每次查询一个区间中不同的数的个数。

<!-- more -->

### 链接
[BZOJ 1878](http://www.lydsy.com/JudgeOnline/problem.php?id=1878)

### 题解
莫队模板题。

### 代码
```c++
#include <cstdio>
#include <cmath>
#include <algorithm>

const int MAXN = 50000;
const int MAXM = 200000;
const int MAXX = 1000000;

int n, m, blockSize, a[MAXN + 1], cnt[MAXX + 1];

struct Query
{
	int l, r, *ans;

	// 以左端点所在块为第一关键字，右端点为第二关键字
	bool operator<(const Query &other) const
	{
		if (l / blockSize == other.l / blockSize) return r < other.r;
		else return l / blockSize < other.l / blockSize;
	}
} Q[MAXM + 1];

// extend - 莫队扩展的通用写法
// 对于 [l, r] 这段区间，要把左端点（left = true）还是
// 右端点（left = false）加入（d = 1）答案或从答案中删去（d = -1）
inline int extend(int l, int r, bool left, int d)
{
	if (left)
	{
		if (d == 1)
		{
			if (++cnt[a[l]] == 1) return 1;
			else return 0;
		}
		else
		{
			if (--cnt[a[l]] == 0) return -1;
			else return 0;
		}
	}
	else
	{
		if (d == 1)
		{
			if (++cnt[a[r]] == 1) return 1;
			else return 0;
		}
		else
		{
			if (--cnt[a[r]] == 0) return -1;
			else return 0;
		}
	}
}

// 莫队主过程
inline void solve()
{
	// 因为先扩展右端点，所以第一次一定是 r 变为 1，变成一个合法区间的答案
	int l = 1, r = 0, ans = 0; // ans 表示当前 [l, r] 区间的答案
	for (int i = 1; i <= m; i++)
	{
		const Query &q = Q[i];

		// 扩展右端点
		while (r < q.r) ans += extend(l, ++r, false, 1);
		while (r > q.r) ans += extend(l, r--, false, -1);

		// 扩展左端点
		while (l > q.l) ans += extend(--l, r, true, 1);
		while (l < q.l) ans += extend(l++, r, true, -1);

		// 记录答案
		// 将 ans 写入到 q.ans 指向的变量中
		*q.ans = ans;
	}
}

int main()
{
	scanf("%d", &n);
	for (int i = 1; i <= n; i++) scanf("%d", &a[i]);

	// 求块大小 sqrt(n)
	blockSize = ceil(sqrt(n));

	scanf("%d", &m);
	// 记录答案的数组
	// 因为询问被排序，而要根据原顺序输出
	static int ans[MAXM + 1];
	for (int i = 1; i <= m; i++)
	{
		scanf("%d %d", &Q[i].l, &Q[i].r);
		Q[i].ans = &ans[i]; // 无论怎么排序，第 i 个询问的答案要存到 ans[i] 里
	}

	std::sort(Q + 1, Q + m + 1);
	solve();

	for (int i = 1; i <= m; i++) printf("%d\n", ans[i]);
}
```

精简版：

```c++
#include <cstdio>
#include <cmath>
#include <algorithm>

const int MAXN = 50000;
const int MAXM = 200000;
const int MAXX = 1000000;

int n, m, blockSize, a[MAXN + 1], cnt[MAXX + 1];

struct Query
{
	int l, r, *ans;

	// 以左端点所在块为第一关键字，右端点为第二关键字
	bool operator<(const Query &other) const
	{
		if (l / blockSize == other.l / blockSize) return r < other.r;
		else return l / blockSize < other.l / blockSize;
	}
} Q[MAXM + 1];

// extend - 本题莫队扩展的精简写法
// 把 x 这个数加入答案（d = 1）或从答案中删去（d = -1）
inline int extend(int x, int d)
{
	if (d == 1)
	{
		return ++cnt[x] == 1 ? 1 : 0; // 如果加入一个 x 后，x 的出现次数为 1，说明 x 首次出现，答案 +1
	}
	else
	{
		return --cnt[x] == 0 ? -1 : 0; // 如果删去一个 x 后，x 的出现次数为 0，说明原有的 x 全部被删除，答案 -1
	}
}

// 莫队主过程
inline void solve()
{
	// 因为先扩展右端点，所以第一次一定是 r 变为 1，变成一个合法区间的答案
	int l = 1, r = 0, ans = 0; // ans 表示当前 [l, r] 区间的答案
	for (int i = 1; i <= m; i++)
	{
		const Query &q = Q[i];

		// 扩展右端点
		while (r < q.r) ans += extend(a[++r], 1);
		while (r > q.r) ans += extend(a[r--], -1);

		// 扩展左端点
		while (l > q.l) ans += extend(a[--l], 1);
		while (l < q.l) ans += extend(a[l++], -1);

		// 记录答案
		// 将 ans 写入到 q.ans 指向的变量中
		*q.ans = ans;
	}
}

int main()
{
	scanf("%d", &n);
	for (int i = 1; i <= n; i++) scanf("%d", &a[i]);

	// 求块大小 sqrt(n)
	blockSize = ceil(sqrt(n));

	scanf("%d", &m);
	// 记录答案的数组
	// 因为询问被排序，而要根据原顺序输出
	static int ans[MAXM + 1];
	for (int i = 1; i <= m; i++)
	{
		scanf("%d %d", &Q[i].l, &Q[i].r);
		Q[i].ans = &ans[i]; // 无论怎么排序，第 i 个询问的答案要存到 ans[i] 里
	}

	std::sort(Q + 1, Q + m + 1);
	solve();

	for (int i = 1; i <= m; i++) printf("%d\n", ans[i]);
}
```
