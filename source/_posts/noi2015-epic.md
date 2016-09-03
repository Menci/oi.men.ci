title: 「NOI2015」荷马史诗 - 哈夫曼树
categories: OI
tags: 
  - NOI
  - BZOJ
  - 哈夫曼树
  - 数据结构
  - 堆
permalink: noi2015-epic
date: 2016-07-01 09:27:00
---

有 $ n $ 种不同的单词，从 $ 1 $ 到 $ n $ 进行编号。其中第 $ i $ 种单词出现的总次数为 $ W_i $。要用 $ k $ 进制串 $ S_i $ 来替换第 $ i $ 种单词，满足对于任意的 $ 1 \leq i,j \leq n,\ i \neq j $，都有：$ S_i $ 不是 $ S_j $ 的前缀。

1. 替换以后得到的新的长度最小为多少；
2. 在确保总长度最小的情况下，最长的 $ S_i $ 的最短长度是多少？

<!-- more -->

### 链接
[BZOJ 4198](http://www.lydsy.com/JudgeOnline/problem.php?id=4198)  
[UOJ #130](http://uoj.ac/problem/130)

### 题解
考虑当 $ k = 2 $ 时，其最优化条件相当于哈夫曼树，即：将所有单词作为一棵树放在集合中，每次取出两个最小的合并起来，放回集合，直到集合中只剩下一个元素。

显然，$ k \neq 2 $ 时，将「两个最小的」换成「$ k $ 个」即可。

考虑第二个条件，使最长的 $ S_i $ 最短。在哈夫曼树算法中 $ S_i $ 的长度体现在一个节点被合并的次数上，只需要将每一个节点被合并的次数作为第二关键字即可。

最后一个问题，如果每次取出 $ k $ 个，加入 $ 1 $ 个，最后不够 $ k $ 个怎么办。考虑到每次减少了 $ k - 1 $ 个，需要将 $ n - 1 $ 个减掉 —— 只需加入一些空节点（$ W_i = 0 $）使 $ (n - 1) \bmod (k - 1) = 0 $ 即可。

### 代码
```c++
#include <cstdio>
#include <queue>
#include <utility>

const int MAXN = 100000;
const int MAXK = 9;

int main() {
	int n, k;
	scanf("%d %d", &n, &k);

	std::priority_queue< std::pair<long long, int>, std::vector< std::pair<long long, int> >, std::greater< std::pair<long long, int> > > q;

	for (int i = 0; i < n; i++) {
		long long x;
		scanf("%lld", &x);
		q.push(std::make_pair(x, 0));
	}

	while ((q.size() - 1) % (k - 1) != 0) q.push(std::make_pair(0, 0));

	long long ans = 0;
	while (q.size() > 1) {
		std::pair<long long, int> newNode;
		for (int i = 0; i < k; i++) {
			std::pair<long long, int> p = q.top();
			q.pop();
			ans += p.first;
			newNode.first += p.first;
			newNode.second = std::max(newNode.second, p.second);
		}

		newNode.second++;

		q.push(newNode);
	}

	std::pair<long long, int> p = q.top();
	printf("%lld\n%d\n", ans, p.second);

	return 0;
}
```
