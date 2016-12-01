title: 「SCOI2003」字符串折叠 - 区间 DP
categories: OI
tags: 
  - BZOJ
  - SCOI
  - DP
  - 区间 DP
permalink: scoi2003-fold
date: 2016-07-06 11:54:00
---

折叠的定义如下：

1. 一个字符串可以看成它自身的折叠。
2. $ X(S) $ 是 $ X(X > 1) $ 个 $ S $ 连接在一起的串的折叠。
3. 如果 $ A $ 是 $ A’ $ 的折叠，$ B $ 是 $ B’ $ 的折叠，则 $ AB $ 是 $ A’B’ $ 的折叠。

给一个字符串，求它的最短折叠。

<!-- more -->

### 链接
[BZOJ 1090](http://www.lydsy.com/JudgeOnline/problem.php?id=1090)

### 题解
设 $ f(l, r) $ 为 $ [l, r] $ 区间内字符串的最短折叠。

四种转移：

1. 自身的长度 $ r - l + 1 $；
2. 枚举左边前缀的长度，将前缀向右匹配，将第一个失配点右边作为一个子区间处理；
3. 枚举右边后缀的长度，将后缀向左匹配，将第一个失配点左边作为一个子区间处理；
4. 枚举断点，将区间分成两个处理。

### 代码
```c++
#include <cstdio>
#include <cstring>
#include <algorithm>

const int MAXN = 100;

int n;
char s[MAXN + 1];

inline int numberLength(int x) {
	int res = 0;
	do res++; while (x /= 10);
	return res;
}

inline int dp(const int l, const int r) {
	static int mem[MAXN][MAXN];
	static bool calced[MAXN][MAXN];
	int &ans = mem[l][r];
	if (calced[l][r]) return ans;
	calced[l][r] = true;

	if (l == r) return ans = 1;
	else if (l > r) return ans = 0;

	ans = r - l + 1;

	for (int i = 1; i <= r - l + 1; i++) {
		int base = dp(l, l + i - 1);
		int pos = l + i, cnt = 1;
		while (pos + i - 1 <= r && strncmp(s + l, s + pos, i) == 0) pos += i, cnt++;
		ans = std::min(ans, dp(pos, r) + numberLength(cnt) + 2 + base);
	}

	for (int i = 1; i <= r - l + 1; i++) {
		int base = dp(r - i + 1, r);
		int pos = r - i - i + 1, cnt = 1;
		while (pos >= l && strncmp(s + r - i + 1, s + pos, i) == 0) pos -= i, cnt++;
		ans = std::min(ans, dp(l, pos + i - 1) + numberLength(cnt) + 2 + base);
	}

	for (int i = 1; i <= r - l + 1 - 1; i++) {
		ans = std::min(ans, dp(l, i) + dp(i + 1, r));
	}

	// printf("dp(%d, %d) = %d\n", l, r, ans);

	return ans;
}

int main() {
	scanf("%s", s);
	n = strlen(s);

	printf("%d\n", dp(0, n - 1));

	return 0;
}
```



