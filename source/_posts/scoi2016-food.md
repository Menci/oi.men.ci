title: 「SCOI2016」美味 - 贪心 + 主席树
categories: OI
tags: 
  - BZOJ
  - SCOI
  - 贪心
  - 主席树
permalink: scoi2016-food
date: 2017-02-21 12:21:00
---

一家餐厅有 $ n $ 道菜，编号 $ 1 \ldots n $，大家对第 $ i $ 道菜的评价值为 $ i $（$ 1 \leq i \leq n $）。有 $ m $ 位顾客，第 $ i $ 位顾客的期望值为 $ b_i $，而他的偏好值为 $ x_i $。因此，第 $ i $ 位顾客认为第 $ j $ 道菜的美味度为 $ b_i \mathbin{\text{xor}} (a_j + x_i) $（$ \text{xor} $ 表示异或运算）。第 $ i $ 位顾客希望从这些菜中挑出他认为最美味的菜，即美味值最大的菜，但由于价格等因素，他只能从第 $ l_i $ 道到第 $ r_i $ 道中选择。请你帮助他们找出最美味的菜。

<!-- more -->

### 链接
[BZOJ 4571](http://www.lydsy.com/JudgeOnline/problem.php?id=4571)

### 题解
先考虑问题的一个简化版本 —— 给一个序列 $ a_j $，第 $ i $ 个询问为 $ \max\limits_{j = 1} ^ {n} \{ a_j \mathbin{\text{xor}} b_i \} $。这个问题可以使用 Trie 树存储序列 $ a_j $ 的所有数，从高位到低位贪心解决。

Trie 树上从高位到低位贪心的实质是，对于前面若干位考虑过的值为 $ q $，考虑第 $ i $ 位，查询序列 $ a_j $ 中是否有数在 $ [q, q + 2 ^ i - 1] $ 和 $ [q + 2 ^ i, q + 2 ^ {i + 1} - 1] $ 这两个区间内，所以我们可以把 Trie 树换成权值线段树。这一步转化十分关键。

继续考虑一个更接近原问题的简化版本 —— 给一个序列 $ a_j $，第 $ i $ 个询问为 $ \max\limits_{j = 1} ^ {n} \{ (a_j + x_i) \mathbin{\text{xor}} b_i \} $。即，每次查询前对整个 $ a_j $ 序列加上一个数 $ x_i $。考虑到权值线段树无法整体将所有值加上一个数（因为整体右移整棵树会改变树的形态），一个显然的思路是每次查询 $ [q, q + 2 ^ i - 1] $ 和 $ [q + 2 ^ i, q + 2 ^ {i + 1} - 1] $ 这两个区间时，将要查询的区间整体左移，即改为查询 $ [q - x_i, q + 2 ^ i - 1 - x_i] $ 和 $ [q + 2 ^ i - x_i, q + 2 ^ {i + 1} - 1 - x_i] $ 这两个区间。

现在回到原问题，给一个序列 $ a_j $，第 $ i $ 个询问为 $ \max\limits_{j = l_i} ^ {r_i} \{ (a_j + x_i) \mathbin{\text{xor}} b_i \} $。我们只需要在前一个问题的基础上，把普通的线段树改为主席树即可。

### 代码
```c++
#include <cstdio>

const int MAXN = 2e5;
const int MAXM = 1e5;
const int HIGHEST_BIT = 17;

struct PSegT {
	struct SegT {
		int l, r;
		SegT *lc, *rc;
		int cnt;

		SegT() {}
		SegT(int l, int r, SegT *lc, SegT *rc, int cnt) : l(l), r(r), lc(lc), rc(rc), cnt(cnt) {}
		SegT(int l, int r, SegT *lc, SegT *rc) : l(l), r(r), lc(lc), rc(rc), cnt(lc->cnt + rc->cnt) {}

		int query(int l, int r) {
			if (l > this->r || r < this->l) return 0;
			else if (l <= this->l && r >= this->r) return cnt;
			else return lc->query(l, r) + rc->query(l, r);
		}
	} *rt[MAXN + 1], *null;

	PSegT() {
		null = new SegT(-1, -1, NULL, NULL, 0);
		rt[0] = null->lc = null->rc = null;
	}

	SegT *insert(SegT *v, int l, int r, int x) {
		if (l == r) return new SegT(l, r, null, null, v->cnt + 1);
		int mid = l + (r - l) / 2;
		if (x > mid) return new SegT(l, r, v->lc, insert(v->rc, mid + 1, r, x));
		else return new SegT(l, r, insert(v->lc, l, mid, x), v->rc);
	}

	void build(int *a, int n) {
		for (int i = 1; i <= n; i++) {
			rt[i] = insert(rt[i - 1], 0, MAXN - 1, a[i]);
		}
	}

	int maxAddXor(int ql, int qr, int add, int x) {
		SegT *tr = rt[qr], *tl = rt[ql - 1];
		int ans = 0, xorWith = 0;
		for (int i = HIGHEST_BIT; i >= 0; i--) {
			int k = 1 << i;

			if (k & x) { // The k-th lower bit of `x` is 1
				bool canZero = tr->query(xorWith - add, xorWith + k - 1 - add) - tl->query(xorWith - add, xorWith + k - 1 - add) != 0;
				if (canZero) {
					ans |= k;
				} else {
					xorWith |= k;
				}
			} else {     // The k-th lower bit of `x` is 0
				bool canOne = tr->query(xorWith + k - add, xorWith + 2 * k - 1 - add) - tl->query(xorWith + k - add, xorWith + 2 * k - 1 - add) != 0;
				if (canOne) {
					ans |= k;
					xorWith |= k;
				}
			}
		}
		return ans;
	}
} ps;

int main() {
	int n, m;
	scanf("%d %d", &n, &m);

	static int a[MAXN + 1];
	for (int i = 1; i <= n; i++) {
		scanf("%d", &a[i]);
	}

	ps.build(a, n);

	while (m--) {
		int b, x, l, r;
		scanf("%d %d %d %d", &b, &x, &l, &r);
		printf("%d\n", ps.maxAddXor(l, r, x, b));
	}

	return 0;
}
```
