title: 「CodeVS 2598」编辑距离问题 - 线性DP
categories: OI
tags: 
  - CodeVS
  - DP
  - 字符串
  - 线性DP
permalink: codevs-2598
id: 17
updated: '2016-01-19 21:05:21'
date: 2016-01-09 05:32:19
---

设 A 和 B 是 2 个字符串。要用最少的字符操作将字符串 A 转换为字符串 B。这里所说的字符操作包括：

1. 删除一个字符；
2. 插入一个字符；
3. 将一个字符改为另一个字符。

求将字符串 A 变换为字符串 B 所用的最少字符操作数，即 A 到 B 的编辑距离。

字符串 A、B 的长度均不超过4000。

<!-- more -->

### 链接
[CodeVS 2598](http://codevs.cn/problem/2598/)

### 题解
字符串的题乍一看都很恶心，但这道题仔细想想还是很简单的。
用 `f[i][j]` 表示字符串 A 的前 `i` 个字符到字符串 B 的前 `j` 个字符的编辑距离，则转移方程为：

$$ f[i][j] = \cases{ f[i-1][j-1] & A[i]=B[j] \\ {\min}(f[i][j-1],f[i-1][j],f[i-1][j-1])+1 & A[i] ≠ B[j]} $$

当 $ A[i]=B[j] $ 时，当前位置无需编辑，直接等于上一位的编辑距离。

当 $ A[i]≠B[j] $ 时，有三种情况：

1. 字符串 B 的前 `j` 位可由 $A[i]$ 编辑到 $B[j-1]$ 后插入 B 的第 `j` 个字符得到。
2. 字符串 B 的前 `j` 位可由 $A[i-1]$ 编辑到 $B[j]$ 后删除 A 的第 `i` 个字符得到。
3. 字符串 B 的前 `j` 位可由 $A[i-1]$ 编辑到 $B[j-1]$ 后修改 A 的第 `i` 个字符为 B 的第 `j` 个字符得到。

### 代码
```C++
#include <cstdio>
#include <cstring>
#include <climits>
#include <algorithm>

const int MAXN = 4000;

char s1[MAXN + 1], s2[MAXN + 1];
int n1, n2, ans[MAXN][MAXN];
bool calced[MAXN][MAXN];

int search(int i, int j) {
	if (i == 0) return j;
	if (j == 0) return i;

	if (!calced[i - 1][j - 1]) {
		if (s1[i - 1] == s2[j - 1]) {
			ans[i - 1][j - 1] = search(i - 1, j - 1);
		} else {
			ans[i - 1][j - 1] = INT_MAX;
			ans[i - 1][j - 1] = std::min(ans[i - 1][j - 1], search(i - 1, j - 1) + 1);
			ans[i - 1][j - 1] = std::min(ans[i - 1][j - 1], search(i - 1, j) + 1);
			ans[i - 1][j - 1] = std::min(ans[i - 1][j - 1], search(i, j - 1) + 1);
		}

		calced[i - 1][j - 1] = true;
	}

	return ans[i - 1][j - 1];
}

int main() {
	scanf("%s %s", s1, s2);
	n1 = strlen(s1), n2 = strlen(s2);

	printf("%d\n", search(n1, n2));
	return 0;
}
```