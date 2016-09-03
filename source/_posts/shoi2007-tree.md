title: 「SHOI2007」园丁的烦恼 - CDQ
categories: OI
tags: 
  - BZOJ
  - SHOI
  - 数据结构
  - CDQ
  - 树状数组
  - 分治
permalink: shoi2007-tree
date: 2016-06-25 10:54:00
---

每一棵树可以用一个整数坐标来表示，每次询问你某一个矩阵内有多少树。

<!-- more -->

### 链接
[BZOJ 1935](http://www.lydsy.com/JudgeOnline/problem.php?id=1935)

### 题解
同 [BZOJ 1176](bzoj-1176)。

### 代码
```cpp
#include <cstdio>
#include <algorithm>

const int MAXN = 500000;
const int MAXM = 500000;
const int MAXX = 10000000;

struct Triple {
	int x, y, *ans, k;

	Triple() {}
	Triple(const int x, const int y, int *ans, const int k) : x(x), y(y), ans(ans), k(k) {}
} a[MAXN + MAXM * 4];

int max = 0;

struct BinaryIndexedTree {
	int a[MAXX + 2];

	static int lowbit(const int x) { return x & -x; }

	int query(const int x) const {
		int ans = 0;
		for (int i = x; i > 0; i -= lowbit(i)) ans += a[i - 1];
		// printf("sum[1, %d] = %d\n", x, ans);
		return ans;
	}

	void update(const int x, const int delta) {
		// printf("a[%d] += %d\n", x, delta);
		for (int i = x; i <= max; i += lowbit(i)) a[i - 1] += delta;
	}

	void clear(const int x) {
		// printf("a[%d] = 0\n", x);
		for (int i = x; i <= max; i += lowbit(i)) {
			if (a[i - 1]) a[i - 1] = 0;
			else break;
		}
	}
} bit;

void cdq(Triple *l, Triple *r) {
	if (l == r) return;

	Triple *mid = l + (r - l) / 2;

	cdq(l, mid);
	cdq(mid + 1, r);

	static Triple tmp[MAXN + MAXM * 4];
	for (Triple *q = tmp, *p1 = l, *p2 = mid + 1; q <= tmp + (r - l); q++) {
		if ((p1 <= mid && p1->x <= p2->x) || p2 > r) {
			*q = *p1++;
			if (!q->ans) bit.update(q->y, 1);
		} else {
			*q = *p2++;
			// printf("ans += %d\n", bit.query(q->y) * q->k);
			if (q->ans) *q->ans += bit.query(q->y) * q->k;
		}
	}

	for (Triple *q = tmp, *p = l; p <= r; q++, p++) {
		*p = *q;
		bit.clear(p->y);
	}
}

int main() {
	int n, m;
	scanf("%d %d", &n, &m);

	for (int i = 0; i < n; i++) {
		scanf("%d %d", &a[i].x, &a[i].y), a[i].x += 2, a[i].y += 2;
		max = std::max(max, a[i].y);
	}

	static int ans[MAXM];
	int cnt = n;
	for (int i = 0; i < m; i++) {
		int x1, y1, x2, y2;
		scanf("%d %d %d %d", &x1, &y1, &x2, &y2), x1 += 2, y1 += 2, x2 += 2, y2 += 2;
		int *p = &ans[i];

		a[cnt++] = Triple(x2, y2, p, 1);
		a[cnt++] = Triple(x1 - 1, y1 - 1, p, 1);
		a[cnt++] = Triple(x1 - 1, y2, p, -1);
		a[cnt++] = Triple(x2, y1 - 1, p, -1);

		max = std::max(max, y1);
		max = std::max(max, y2);
	}

	// for (int i = 0; i < cnt; i++) {
	// 	if (a[i].ans) printf("Query [%d, %d] for ans[%ld]\n", a[i].x, a[i].y, a[i].ans - ans);
	// 	else printf("Update [%d, %d] = 1\n", a[i].x, a[i].y);
	// }

	cdq(a, a + cnt - 1);

	for (int i = 0; i < m; i++) printf("%d\n", ans[i]);

	return 0;
}
```
