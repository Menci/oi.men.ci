title: 「CodeVS 3269」混合背包 - 背包DP + 单调队列
categories: OI
tags: 
  - CodeVS
  - DP
  - 单调队列
  - 背包DP
permalink: codevs-3269-monotone-queue
id: 23
updated: '2016-01-19 21:03:26'
date: 2016-01-15 05:47:45
---

背包体积为 `V`（<= 200,000），给出 `N`（<= 200）个物品，每个物品占用体积为 `Vi`，价值为 `Wi`，每个物品要么至多取 `1` 件，要么至多取 `Mi`（> `1`）件，要么数量无限，求装入背包内物品总价值的最大值。

<!-- more -->

### 链接
[CodeVS 3269](htp://codevs.cn/problem/3269/)

### 题解
01 和完全这两种之前写过，这里就重点说说怎么用单调队列来解多重。

首先，对于多重背包的每件物品，`n` 表示这件物品的数量，`w` 表示这件物品的体积，`c` 表示这件物品的价值。

朴素的多重背包状态转移方程为：

$$ f[i]=\max\{f[i-k*c]+k*w,k{\in}[0,n]\} $$

设 $r=i ~~ \% ~~ c$，$m=i ~~ / ~~ c$。

`m` 的意义为，如果当前状态的背包容量全部用来放当前物品，能放多少件。  
`r` 的意义为，如果当前状态的背包容量全部用来放当前物品，则剩下的容量是多少。

到此，我们可以修改一下方程，使原来的枚举 `i` 变为先枚举 `r`，然后在 $[0,m]$ 上枚举 `d`，以 $(m-d)*c+r$代替原来的 `i`。

$$ f[(m-d)*c+r]=\max\{f[(m-d)*c+r]+d*w,d{\in}[0,m],r{\in}[0,V \ \% \ c]\} $$

令

$$ k=m-d $$

代入上式得

$$ f[k*c+r]=\max\{f[k*c+r]+(m-k)*w,k{\in}[m-n,m],r{\in}[0,V \ \% \ c]\} $$

进一步化为

$$ f[k*c+r]=\max\{f[k*c+r]-k*w,k{\in}[m-n,m],r{\in}[0,V \ \% \ c]\} + m * w $$

令

$$ g(k,r)=f[k*c+r]-k*w $$

代入上式得

$$ f[k*c+r]=\max\{g(k,r),k{\in}[m-n,m],r{\in}[0,V \ \% \ c]\} + m * w $$

由此得到一个可以用单调队列优化的方程，结合方程我们知道，$ f[k*c+r] $是由之前的 `n + 1` 项的最大值推出的，于是用一个长度为 `n + 1` 的单调队列维护 $g(k,r)$，就可以 $O(1)$ 地求出每个状态。

需要注意的是，在使用单调队列实现这个算法时，方程中的 `m` 应该被替换为当前状态对应的 `k`，因为枚举的 `k` 总是当前状态的**背包容量全部用来放当前物品的最大件数**。

### 代码
```cpp
#include <cstdio>
#include <deque>
#include <algorithm>

const int MAXN = 200;
const int MAXV = 200000;

template <typename T>
struct MonotoneQueue {
	std::deque<T> q, m;

	void push(const T &x) {
		q.push_back(x);
		while (!m.empty() && m.back() < x) m.pop_back();
		m.push_back(x);
	}

	void pop() {
		T x = q.front();
		q.pop_front();
		if (x == m.front()) m.pop_front();
	}

	size_t size() {
		return q.size();
	}

	T top() {
		return m.front();
	}
};

int n, V;
int f[MAXV + 1];

inline void pack(int c, int w, int n) {
	if (n == 1) {
		for (int v = V; v >= c; v--) {
			f[v] = std::max(f[v], f[v - c] + w);
		}
	} else if (n == -1) {
		for (int v = c; v <= V; v++) {
			f[v] = std::max(f[v], f[v - c] + w);
		}
	} else {
		n = std::min(n, V / c);
		for (int r = 0; r < c; r++) {
			MonotoneQueue<int> q;
			int m = (V - r) / c;
			for (int k = 0; k <= m; k++) {
				if (q.size() == n + 1) q.pop();
				q.push(f[k * c + r] - k * w);
				f[k * c + r] = q.top() + k * w;
			}
		}
	}
}

int main() {
	scanf("%d %d", &n, &V);

	for (int i = 0; i < n; i++) {
		int c, w, n;
		scanf("%d %d %d", &c, &w, &n);
		pack(c, w, n);
	}

	printf("%d\n", f[V]);

	return 0;
}
```