title: 「HAOI2008」玩具取名 - 区间DP
categories: OI
tags: 
  - BZOJ
  - HAOI
  - DP
  - 区间DP
permalink: haoi2008-name
date: 2016-07-06 11:37:00
---

某人有一套玩具，并想法给玩具命名。首先他选择 `WING` 四个字母中的任意一个字母作为玩具的基本名字。然后他会根据自己的喜好，将名字中任意一个字母用 `WING` 中任意两个字母代替，使得自己的名字能够扩充得很长。

现在，他想请你猜猜某一个很长的名字，最初可能是由哪几个字母变形过来的。

<!-- more -->

### 链接
[BZOJ 1055](http://www.lydsy.com/JudgeOnline/problem.php?id=1055)

### 题解
用四个二进制位表示一个名字可能由哪些字母变形而来。设 $ f(l, r) $ 表示 $ [l, r] $ 这段区间能由哪些字母变形而来。枚举断点，并枚举左右区间可能由哪些字母变形而来，推出整个区间的答案。

### 代码
```c++
#include <cstdio>
#include <cstring>

const int MAXN = 200;
const int K = 4;

int n, a[MAXN];
bool map[K][K][K];

inline int id(const char ch) {
	switch (ch) {
		case 'W': return 0;
		case 'I': return 1;
		case 'N': return 2;
		case 'G': return 3;
		default: return -1;
	}
}

inline char letter(const int x) {
	return ("WING")[x];
}

inline void setMap(const int x, const int n) {
	for (int i = 0; i < n; i++) {
		char s[3];
		scanf("%s", s);
		map[id(s[0])][id(s[1])][x] = true;
	}
}

inline int dp(const int l, const int r) {
	static int mem[MAXN][MAXN];
	int &ans = mem[l][r];
	static bool calced[MAXN][MAXN];
	if (calced[l][r]) return ans;
	calced[l][r] = true;

	if (l == r) return ans = 1 << a[l];

	for (int i = l; i < r; i++) {
		const int a = dp(l, i), b = dp(i + 1, r);

		for (int i = 0; i < K; i++) if (a & (1 << i)) for (int j = 0; j < K; j++) if (b & (1 << j)) {
			for (int k = 0; k < K; k++) if (map[i][j][k]) ans |= 1 << k;
		}
	}

	// printf("dp(%d, %d) = %d\n", l, r, ans);
	return ans;
}

int main() {
	int cnt[K];
	for (int i = 0; i < K; i++) scanf("%d", &cnt[i]);
	for (int i = 0; i < K; i++) setMap(i, cnt[i]);

	static char s[MAXN + 1];
	scanf("%s", s);
	n = strlen(s);

	for (int i = 0; i < n; i++) a[i] = id(s[i]);

	int res = dp(0, n - 1);
	bool flag = false;
	for (int i = 0; i < K; i++) if (res & (1 << i)) putchar(letter(i)), flag = true;

	if (flag) putchar('\n');
	else puts("The name is wrong!");

	return 0;
}
```
