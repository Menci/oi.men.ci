title: 「NOIP2012」同余方程 - 扩展欧几里得
categories: OI
tags: 
  - NOIP
  - CodeVS
  - Tyvj
  - 数论
  - EXGCD
  - 乘法逆元
permalink: noip2012-mod
date: 2016-01-19 21:20:19
---

求关于 `x` 同余方程 $ax ≡ 1 ({\rm mod} \ b)$的最小正整数解。 

<!-- more -->

### 链接
[CodeVS 1200](http://codevs.cn/problem/1200/)  
[Tyvj 2074](http://tyvj.cn/p/2074)

### 题解
扩展欧几里得裸题，注意求最小正整数解，求出来 `x` 要模一次 `b`，然后加上 `b` 再模一次。

### 代码
```cpp
#include <cstdio>

void exgcd(int a, int b, int g, int &x, int &y) {
	if (b == 0) {
		x = 1, y = 0;
		g = a;
	} else {
		exgcd(b, a % b, g, y, x);
		y -= x * (a / b);
	}
}

int main() {
	int a, b, g, x, y;
	scanf("%d %d", &a, &b);
	exgcd(a, b, g, x, y);
	x = ((x % b) + b) % b;
	printf("%d\n", x);

	return 0;
}
```
