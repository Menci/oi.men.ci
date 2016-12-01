title: 「FJOI2007」轮状病毒 - 高精度
categories: OI
tags: 
  - BZOJ
  - FJOI
  - 高精度
permalink: fjoi2007-wheel
date: 2016-10-17 10:54:00
---

一个 $ N $ 轮状基由圆环上 $ N $ 个不同的基原子和圆心处一个核原子构成的，2 个原子之间的边表示这 2 个原子之间的信息通道。 $ N $ 轮状病毒的产生规律是在一个 $ N $ 轮状基中删去若干条边，使得各原子之间有唯一的信息通道，编程计算有多少个不同的 $ N $ 轮状病毒。

<!-- more -->

### 链接
[BZOJ 1002](http://www.lydsy.com/JudgeOnline/problem.php?id=1002)

### 题解
公式：$ f(i) = 3f(i - 1) - f(i - 2) + 2 $

需要高精度。

### 代码
```c++
#include <cstdio>
#include <iostream>
#include <string>
#include <vector>

const int MAXN = 100;

struct BigInt {
	std::vector<int> v;

	BigInt(const int n = 0) { *this = n; }
	BigInt(const std::string &s) { *this = s; }

	BigInt &operator=(int x) {
		v.clear();
		do v.push_back(x % 10); while (x /= 10);
	}

	BigInt &operator=(const std::string &s) {
		v.resize(s.length());
		for (size_t i = 0; i < s.length(); i++) v[i] = s[s.length() - i - 1] - '0';
	}

	void print() {
		for (int i = v.size() - 1; i >= 0; i--) printf("%d", v[i]);
		putchar('\n');
	}
};

BigInt operator+(const BigInt &a, const BigInt &b) {
	BigInt res;
	res.v.clear();
	bool flag = false;
	for (size_t i = 0; i < std::max(a.v.size(), b.v.size()); i++) {
		int t = 0;
		if (i < a.v.size()) t += a.v[i];
		if (i < b.v.size()) t += b.v[i];
		if (flag) t++, flag = false;
		if (t >= 10) t -= 10, flag = true;
		res.v.push_back(t);
	}
	if (flag) res.v.push_back(1);
	return res;
}

BigInt operator-(const BigInt &a, const BigInt &b) {
	BigInt res;
	res.v.clear();
	bool flag = false;
	for (size_t i = 0; i < std::max(a.v.size(), b.v.size()); i++) {
		int t = 0;
		if (i < a.v.size()) t += a.v[i];
		if (i < b.v.size()) t -= b.v[i];
		if (flag) t--, flag = false;
		if (t < 0) t += 10, flag = true;
		res.v.push_back(t);
	}
	return res;
}

BigInt operator*(const BigInt &a, const BigInt &b) {
	BigInt res;
	res.v.resize(a.v.size() + b.v.size() + 1);
	for (size_t i = 0; i < a.v.size(); i++) {
		for (size_t j = 0; j < b.v.size(); j++) {
			res.v[i + j] += a.v[i] * b.v[j];
			res.v[i + j + 1] += res.v[i + j] / 10;
			res.v[i + j] %= 10;
		}
	}
	while (res.v.size() > 1 && res.v.back() == 0) res.v.pop_back();
	return res;
}

int main() {
	int n;
	scanf("%d", &n);
	BigInt f[MAXN + 1];
	f[1] = 1, f[2] = 5;
	for (int i = 3; i <= n; i++) f[i] = f[i - 1] * 3 - f[i - 2] + 2;
	f[n].print();
	return 0;
}
```
