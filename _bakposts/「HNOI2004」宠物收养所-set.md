title: 「HNOI2004」宠物收养所 - set
categories: OI
tags: 
  - BZOJ
  - CodeVS
  - HNOI
  - set
  - STL
permalink: hnoi2004-chong-wu-shou-yang-suo
id: 5
updated: '2016-01-19 21:08:01'
date: 2015-12-16 05:14:20
---

有 `N`（<= 80000）个宠物或领养者，每个宠物或者领养者有一个特点值 `a`，每次当宠物或领养者到来时，从已有的当中匹配一个与其特点值相差最小（且特点值较小）的并删除，计算所有的领养特点值差的总和。

<!-- more -->

### 题目链接
[CodeVS 1285](http://codevs.cn/problem/1285/)  
[BZOJ 1208](http://www.lydsy.com/JudgeOnline/problem.php?id=1208)  
[Tyvj 1852](http://tyvj.cn/p/1852)

### 解题思路
匹配相差最小的元素，很容易联想到复杂度为$O({\log} n)$的二分查找，但是题目要求动态插入删除，考虑使用 STL 中的 set。

为宠物和领养者各维护一个 set，每当有新的到来时，从另一个 set 中 `lower_bound` 找出**第一个大于等于**该特点值的元素，该元素的上一个即为**第一个小于**该特点值的元素，取二者与新加入的特点值相差较小的即可。

### AC 代码
```c++
#include <cstdio>
#include <set>
#include <algorithm>

inline bool isempty(char ch) {
	return ch != '-' && (ch < '0' || ch > '9');
}

template <typename T>
inline void read(T &x) {
	x = 0;
	register char ch;
	while (isempty(ch = getchar()));

	register bool flag = false;
	if (ch == '-') {
		flag = true;
		ch = getchar();
	}

	do {
		x = x * 10 + (ch - '0');
	} while (!isempty(ch = getchar()));

	if (flag) {
		x = -x;
	}
}

const unsigned int MAXN = 80000;
const unsigned int p = 1000000;

std::set<unsigned int> pets, owners;
unsigned int n, ans;

inline unsigned int diff(unsigned int x, unsigned int y) {
	return std::max(x, y) - std::min(x, y);
}

inline void add(unsigned int x, unsigned int y) {
	ans = (ans + (diff(x, y) % p)) % p;
}

inline void solve(std::set<unsigned int> &set, unsigned int x) {
	if (set.size() == 1) {
		add(x, *set.begin());
		set.clear();
	} else {
		std::set<unsigned int>::const_iterator r = set.lower_bound(x);

		if (r == set.begin()) {
			add(x, *r);
			set.erase(r);
		} else {
			std::set<unsigned int>::const_iterator l = --set.lower_bound(x);

			if (r == set.end() || diff(x, *l) <= diff(x, *r)) {
				add(x, *l);
				set.erase(l);
			} else {
				add(x, *r);
				set.erase(r);
			}
		}
	}
}

int main() {
	read(n);

	for (unsigned int i = 0; i < n; i++) {
		register unsigned int type, x;
		read(type), read(x);

		if (type == 0) { // pet
			if (owners.empty()) {
				pets.insert(x);
			} else {
				solve(owners, x);
			}
		} else { // owner
			if (pets.empty()) {
				owners.insert(x);
			} else {
				solve(pets, x);
			}
		}
	}

	printf("%u\n", ans);

	return 0;
}
```