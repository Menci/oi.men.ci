title: 高精度加、减、乘模板
categories: OI
tags: 
  - 高精度
  - 算法模板
permalink: bigint-template
date: 2016-03-14 21:34:42
---

今天早上写了一道高精度的题，一口气敲完了高精度加、减、乘。现在把模板放在这备用着 
…… 需要者自取。

<!-- more -->

```cpp
#include <cstring>
#include <iostream>
#include <vector>

struct BigInt {
	std::vector<char> v;

	BigInt() {
		*this = 0;
	}

	BigInt(int x) {
		*this = x;
	}

	BigInt &operator=(int x) {
		v.clear();
		do v.push_back(x % 10); while (x /= 10);
		return *this;
	}

	BigInt &operator=(const BigInt &x) {
		v.resize(x.v.size());
		memcpy(const_cast<char *>(v.data()), x.v.data(), 
x.v.size() * sizeof(char));
		return *this;
	}
};

std::ostream &operator<<(std::ostream &out, const BigInt &x) {
	for (int i = x.v.size() - 1; i >= 0; i--) out << (char)(x.v[i] 
+ '0');
	return out;
}

BigInt operator+(const BigInt &a, const BigInt &b) {
	BigInt result;
	result.v.clear();
	bool flag = false;
	for (int i = 0; i < (int)std::max(a.v.size(), b.v.size()); 
i++) {
		int tmp = 0;
		if (i < (int)a.v.size()) tmp += a.v[i];
		if (i < (int)b.v.size()) tmp += b.v[i];
		if (flag) tmp++, flag = false;
		if (tmp >= 10) tmp -= 10, flag = true;
		result.v.push_back(tmp);
	}
	if (flag) result.v.push_back(1);

	return result;
}

BigInt &operator+=(BigInt &a, const BigInt &b) {
	return a = a + b;
}

BigInt operator-(const BigInt &a, const BigInt &b) {
	BigInt result;
	result.v.clear();
	bool flag = false;
	for (int i = 0; i < (int)a.v.size(); i++) {
		int tmp = a.v[i];
		if (i < (int)b.v.size()) tmp -= b.v[i];
		if (flag) tmp--, flag = false;
		if (tmp < 0) tmp += 10, flag = true;
		result.v.push_back(tmp);
	}

	int size = result.v.size();
	while (size > 1 && result.v[size - 1] == 0) size--;
	result.v.resize(size);

	return result;
}

BigInt operator*(const BigInt &a, const BigInt &b) {
	BigInt result;
	result.v.resize(a.v.size() + b.v.size());
	for (int i = 0; i < (int)a.v.size(); i++) {
		for (int j = 0; j < (int)b.v.size(); j++){
			result.v[i + j] += a.v[i] * b.v[j];
			result.v[i + j + 1] += result.v[i + j] / 10;
			result.v[i + j] %= 10;
		}
	}

	int size = result.v.size();
	while (size > 1 && result.v[size - 1] == 0) size--;
	result.v.resize(size);

	return result;
}
```
