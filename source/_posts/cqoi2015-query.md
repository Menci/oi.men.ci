title: 「CQOI2015」任务查询系统 - 主席树
date: 2017-02-21 11:44:00
categories: OI
tags:
  - CQOI
  - BZOJ
  - 主席树
  - 数据结构
permalink: cqoi2015-query
---

最近实验室正在为其管理的超级计算机编制一套任务管理系统，而你被安排完成其中的查询部分。超级计算机中的任务用三元组 $ (S_i, E_i, P_i) $ 描述，$ (S_i, E_i, P_i) $ 表示任务从第 $ S_i $ 秒开始，在第 $ E_i $ 秒后结束（第 $ S_i $ 秒和 $ E_i $ 秒任务也在运行），其优先级为 $ P_i $。同一时间可能有多个任务同时执行，它们的优先级可能相同，也可能不同。调度系统会经常向查询系统询问，第 $ X_i $ 秒正在运行的任务中，优先级最小的 $ K_i $ 个任务（即将任务按照优先级从小到大排序后取前 $ K_i $ 个）的优先级之和是多少。特别的，如果 $ K_i $ 大于第 $ X_i $ 秒正在运行的任务总数，则直接回答第 $ X_i $ 秒正在运行的任务优先级之和。上述所有参数均为整数，时间的范围在 $ 1 $ 到 $ n $ 之间（包含 $ 1 $ 和 $ n $）。

<!-- more -->

### 链接
[BZOJ 3932](http://www.lydsy.com/JudgeOnline/problem.php?id=3932)

### 题解
如果题目没有强制在线，则有一种显然的思路 —— 对于每个任务，将它拆分为在 $ S_i $ 时间加入一个数 $ P_i $，在 $ T_i + 1 $ 时间删去一个数 $ P_i $。将询问按照 $ X_i $ 排序，按照时间顺序，使用平衡树或线段树等数据结构维护当前时间点的所有数即可。

之后，在线的思路也比较显然了 —— 建立 $ n $ 棵可持久化线段树，预处理出每个时间点上的线段树，然后依次处理每个询问即可。

### 代码
```c++
#include <cstdio>
#include <algorithm>
#include <vector>

const int MAXN = 100000;
const int MAXX = 10000000;

struct Tag {
	int x;
	bool del;

	Tag(int x, bool del) : x(x), del(del) {}
};

extern struct SegT *null;

struct SegT {
	SegT *lc, *rc;
	int cnt;
	long long sum;

	SegT() : lc(this), rc(this), cnt(0), sum(0) {}
	SegT(SegT *lc, SegT *rc) : lc(lc), rc(rc), cnt(lc->cnt + rc->cnt), sum(lc->sum + rc->sum) {}
	SegT(SegT *lc, SegT *rc, int cnt, long long sum) : lc(lc), rc(rc), cnt(cnt), sum(sum) {}

	SegT *insert(int l, int r, int x, int delta) {
		int mid = l + (r - l) / 2;
		if (l == r) return new SegT(null, null, cnt + delta, sum + (long long)delta * l);
		if (x <= mid) return new SegT(lc->insert(l, mid, x, delta), rc);
		else return new SegT(lc, rc->insert(mid + 1, r, x, delta));
	}

	long long query(int l, int r, int k) {
		int mid = l + (r - l) / 2;
		if (k > cnt) return sum;
		else if (l == r) return (long long)k * l;
		else if (k == lc->cnt) return lc->sum;
		else if (k > lc->cnt) return lc->sum + rc->query(mid + 1, r, k - lc->cnt);
		else return lc->query(l, mid, k);
	}
} *rt[MAXN + 1], *null;

inline void init() {
	null = new SegT();
}

int m, n;
std::vector<Tag> tags[MAXN + 1];

inline void build() {
	rt[0] = null;
	for (int i = 1; i <= n; i++) {
		SegT *v = rt[i - 1];
		for (std::vector<Tag>::iterator it = tags[i].begin(); it != tags[i].end(); it++) {
			v = v->insert(1, MAXX, it->x, it->del ? -1 : 1);
		}
		rt[i] = v;
	}
}

int main() {
	scanf("%d %d", &m, &n);
	
	for (int i = 1; i <= m; i++) {
		int l, r, x;
		scanf("%d %d %d", &l, &r, &x);
		tags[l].push_back(Tag(x, false));
		if (r + 1 <= n) tags[r + 1].push_back(Tag(x, true));
	}

	init();
	build();

	long long lastAns = 1;
	for (int i = 1; i <= n; i++) {
		int x, a, b, c;
		scanf("%d %d %d %d", &x, &a, &b, &c);
		int k = 1 + (a * lastAns + b) % c;

		lastAns = rt[x]->query(1, MAXX, k);
		printf("%lld\n", lastAns);
	}

	return 0;
}
```
