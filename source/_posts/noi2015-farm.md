title: 「NOI2015」小园丁与老司机 - DP + 上下界网络流
categories: OI
tags: 
  - NOI
  - BZOJ
  - DP
  - 网络流
  - 上下界网络流
  - Dinic
permalink: noi2015-farm
date: 2016-06-29 18:33:00
---

在坐标系的第一象限内有 $ n $ 个点。

1. 从原点开始，每次向左、右、上、左上 $ 45 ^ \circ $、右上 $ 45 ^ \circ $ **任意一个方向**走到**第一个未到过**的点，重复这个过程，求最多能经过多少点；
2. 求 (1) 中的一个最优方案；
3. 对于 (1) 中的**所有**最优方案，其所有上、左上 $ 45 ^ \circ $、右上 $ 45 ^ \circ $ 的边组成了一个 DAG，求该 DAG 的可重叠最小路径覆盖。

<!-- more -->

### 链接
[BZOJ 4200](http://www.lydsy.com/JudgeOnline/problem.php?id=4200)  
[UOJ #132](http://uoj.ac/problem/132)

### 题解
#### 第一问
我们可以发现，对于两个点 $ (x_1, y_1) $ 和 $ (x_2, y_2) $，如果 $ y_1 = y_2 $，则它们在同一行，如果 $ x_1 + y_1 = x_2 + y_2 $ 或 $ x_1 - y_1 = x_2 - y_2 $，说明它们在同一对角线上。

记录每一行、每一主对角线、每一副对角线上的点，并进行排序，处理行之间的转移时，可以直接由这些方向上前一个点转移而来。

显而易见的两个结论：

1. 除最后一行外，同一行的若干次移动完成后，一定继续移动到上面的某一行上；
2. 每一行内，任意两个点都可以通过左右移动到达。

这为我们提供了一个计算顺序 —— 对于每一行，先计算出每个点向上移动的最多步数，再计算同一行以每个点开始到另一个点最多移动的步数，取最大值。

但是，这样做时间复杂度太高，需要优化。考虑到对于同一行的两个点 $ a $、$ b $（$ a $ 在 $ b $ 左侧），从 $ a $ 到达 $ b $ 的最优方案为：先从 $ a $ 经过若干个点移动到一行中的最左端点，然后移动到 $ a $ 右边最近的点，继续向右移动到 $ b $。

打出从 $ a $ 到达 $ b $ 的最多步数表可以发现，当 $ a $ 增大 $ 1 $ 时，到所有 $ b $ 的步数，只有两个会改变：

|   | 1 | 2 | 3 | 4 | 5 |
|:-:|:-:|:-:|:-:|:-:|:-:|
| 5 | 0 | 1 | 2 | 3 | 4 |
| 5 | 4 | 0 | 2 | 3 | 4 |
| 5 | 4 | 3 | 0 | 3 | 4 |
| 5 | 4 | 3 | 2 | 0 | 4 |
| 5 | 4 | 3 | 2 | 1 | 0 |

使用线段树维护当前点到 $ b $ 的步数加 $ b $ 向上走的最大步数，可以在 $ O(\log n) $ 的时间内求出每个点的结果。

算上排序，第一问的总时间复杂度为 $ O(n \log n) $。

#### 第二问
要求出一种方案，我们可以在第一问的转移中记录每个状态的前驱。不同行间的转移可以直接找到前驱，同一行内的转移需要找到行内的目标点后，模拟出走到行首（行尾）后走回目标点的过程。

一个细节是如何判断应该向上走还是走同一行。如果上一次走了同一行到达当前点，那么这一次一定向上走，否则可能会死循环。

#### 第三问
要求出所有方案中可能的上、左上、右上的边。

从源点的一行开始向上考虑。对于每一行，枚举所有从下面转移过来的点，在与第一问相同的线段树上为所有最大值的点打标记，枚举完一整行后，取出所有被打标记的点，并以这些点开始向上继续考虑。枚举三个方向，对于可以取得最大值的方向，在网络上连一条流量下界为 $ 1 $，上界为 $ +\infty $ 的边，并对这些方向上的目标点打上标记。

最终，网络的最小可行流为第三问答案。

### 代码
```cpp
#include <cstdio>
#include <cstdlib>
#include <climits>
#include <cassert>
#include <vector>
#include <queue>
#include <utility>
#include <algorithm>
#include <tr1/unordered_map>
#include <tr1/functional>

const int MAXN = 50000 + 1;

struct Node;
struct Edge;

struct Node {
	Edge *e, *c;
	int l, in;
} N[MAXN + 2 + 2];

struct Edge {
	Node *s, *t;
	int f, c;
	Edge *next, *r;

	Edge(Node *s, Node *t, const int c) : s(s), t(t), f(0), c(c), next(s->e) {}
};

struct Dinic {
	bool makeLevelGraph(Node *s, Node *t, const int n) {
		for (int i = 0; i < n; i++) N[i].c = N[i].e, N[i].l = 0;

		std::queue<Node *> q;
		q.push(s);

		s->l = 1;

		while (!q.empty()) {
			Node *v = q.front();
			q.pop();

			for (Edge *e = v->e; e; e = e->next) if (!e->t->l && e->f < e->c) {
				e->t->l = v->l + 1;
				if (e->t == t) return true;
				else q.push(e->t);
			}
		}

		return false;
	}

	int findPath(Node *s, Node *t, const int limit = INT_MAX) {
		if (s == t) return limit;

		for (Edge *&e = s->c; e; e = e->next) if (e->t->l == s->l + 1 && e->f < e->c) {
			int f = findPath(e->t, t, std::min(limit, e->c - e->f));
			if (f) {
				e->f += f;
				e->r->f -= f;
				return f;
			}
		}

		return 0;
	}

	int operator()(const int s, const int t, const int n) {
		int res = 0;
		while (makeLevelGraph(&N[s], &N[t], n)) {
			int f;
			while ((f = findPath(&N[s], &N[t])) > 0) res += f;
		}

#ifdef DBG
		printf("dinic(%d, %d, %d) = %d\n", s, t, n, res);
#endif
		return res;
	}
} dinic;

inline Edge *addEdge(const int s, const int t, const int c) {
#ifdef DBG
	printf("E(%d, %d, %d)\n", s, t, c);
#endif
	N[s].e = new Edge(&N[s], &N[t], c);
	N[t].e = new Edge(&N[t], &N[s], 0);
	return (N[s].e->r = N[t].e)->r = N[s].e;
}

inline void addEdge(const int s, const int t, const int l, const int r) {
	N[s].in -= l;
	N[t].in += l;
	addEdge(s, t, r - l);
}

inline int minFlow(const int s, const int t, const int n) {
	const int S = n, T = n + 1;
	int full = 0;
	for (int i = 0; i < n; i++) {
		if (N[i].in > 0) addEdge(S, i, N[i].in), full += N[i].in;
		else if (N[i].in < 0) addEdge(i, T, -N[i].in);
	}
	Edge *e = addEdge(t, s, INT_MAX);

	assert(dinic(S, T, n + 2) == full);

	int f = e->f;

	e->c = e->r->c = 0;
	for (e = N[s].e; e; e = e->next) e->c = e->r->c = 0;
	for (e = N[t].e; e; e = e->next) e->c = e->r->c = 0;

	return f - dinic(t, s, n);
}

struct DPValue;
struct Point;

struct DPValue {
	Point *prec;
	int x;

	DPValue(Point *prec = NULL, const int x = 0) : prec(prec), x(x) {}

	DPValue extend(Point &p, const int delta) { return DPValue(&p, x + delta); }

	operator int() const { return x; }
};

struct Point {
	int id, x, y, lineIndex;
	std::vector< std::tr1::reference_wrapper<Point> >::iterator itX, itDiagonal1, itDiagonal2;
	DPValue dpUp, dpInline;
	bool flagUp, flagInline;

	std::vector< std::tr1::reference_wrapper<Point> > &getVectorY() const;
	std::vector< std::tr1::reference_wrapper<Point> > &getVectorX() const;
	std::vector< std::tr1::reference_wrapper<Point> > &getVectorDiagonal1() const;
	std::vector< std::tr1::reference_wrapper<Point> > &getVectorDiagonal2() const;
};

bool compareByY(const Point &a, const Point &b) { return a.y > b.y; }
bool compareByX(const Point &a, const Point &b) { return a.x > b.x; }
bool compareByDiagonal1(const Point &a, const Point &b) { return a.x > b.x; }
bool compareByDiagonal2(const Point &a, const Point &b) { return a.x < b.x; }

int n, lineCnt;
Point a[MAXN];
std::vector< std::tr1::reference_wrapper<Point> > lines[MAXN];
std::tr1::unordered_map< int, std::vector< std::tr1::reference_wrapper<Point> > > mapX, mapDiagonal1, mapDiagonal2;

std::vector< std::tr1::reference_wrapper<Point> > &Point::getVectorY() const { return lines[lineIndex]; }
std::vector< std::tr1::reference_wrapper<Point> > &Point::getVectorX() const { return mapX[x]; }
std::vector< std::tr1::reference_wrapper<Point> > &Point::getVectorDiagonal1() const { return mapDiagonal1[x + y]; }
std::vector< std::tr1::reference_wrapper<Point> > &Point::getVectorDiagonal2() const { return mapDiagonal2[x - y]; }

inline void dpUp(const int lineIndex) {
	std::vector< std::tr1::reference_wrapper<Point> > &v = lines[lineIndex];
	for (std::vector< std::tr1::reference_wrapper<Point> >::iterator it = v.begin(); it != v.end(); it++) {
		Point &p = it->get();
		// p.dpUp = DPValue(NULL, 1);

		if (p.itX != p.getVectorX().begin()) {
			p.dpUp = std::max(p.dpUp, (p.itX - 1)->get().dpInline.extend((p.itX - 1)->get(), 1));
		}

		if (p.itDiagonal1 != p.getVectorDiagonal1().begin()) {
			p.dpUp = std::max(p.dpUp, (p.itDiagonal1 - 1)->get().dpInline.extend((p.itDiagonal1 - 1)->get(), 1));
		}

		if (p.itDiagonal2 != p.getVectorDiagonal2().begin()) {
			p.dpUp = std::max(p.dpUp, (p.itDiagonal2 - 1)->get().dpInline.extend((p.itDiagonal2 - 1)->get(), 1));
		}
	}
}

inline void dpInline(const int lineIndex) {
	struct SegmentTree {
		int l, r, m;
		SegmentTree *lc, *rc;
		DPValue val;

		SegmentTree(const int l, const int r, SegmentTree *lc, SegmentTree *rc) : l(l), r(r), m(l + (r - l) / 2), lc(lc), rc(rc) {}

		~SegmentTree() {
			if (lc) delete lc;
			if (rc) delete rc;
		}

		void update(const int pos, const DPValue &val) {
			if (l == r) this->val = val;
			else (pos <= m ? lc : rc)->update(pos, val), this->val = std::max(lc->val, rc->val);
		}

		DPValue query() { return val; }

		static SegmentTree *build(const int l, const int r) {
			if (l > r) return NULL;
			else if (l == r) return new SegmentTree(l, r, NULL, NULL);
			else {
				int m = l + (r - l) / 2;
				return new SegmentTree(l, r, build(l, m), build(m + 1, r));
			}
		}
	} *segment;

	std::vector< std::tr1::reference_wrapper<Point> > &v = lines[lineIndex];

	segment = SegmentTree::build(0, v.size() - 1);
	for (size_t i = 0; i < v.size(); i++) {
		segment->update(i, v[i].get().dpUp.extend(v[i].get(), i));
	}

	for (size_t i = 0; i < v.size(); i++) {
		v[i].get().dpInline = segment->query();
		if (i < v.size() - 1) {
			segment->update(i, v[i].get().dpUp.extend(v[i].get(), v.size() - i - 1));
			segment->update(i + 1, v[i + 1].get().dpUp.extend(v[i + 1].get(), 0));
		}
	}

	delete segment;
}

inline void dp() {
	for (int i = 0; i < n; i++) {
		if (i != 0) dpUp(i);
		dpInline(i);
	}
}

inline void getInlinePath(std::vector<Point *> &v, Point *s, Point *t) {
	std::vector< std::tr1::reference_wrapper<Point> > &line = s->getVectorY();
	std::vector< std::tr1::reference_wrapper<Point> >::iterator a = std::lower_bound(line.begin(), line.end(), *s, &compareByX), b = std::lower_bound(line.begin(), line.end(), *t, &compareByX);

	assert(&a->get() == s);
	assert(&b->get() == t);

#ifdef DBG
	printf("getInlinePath(%d(%d, %d), %d(%d, %d))\n", s->id, s->x, s->y, t->id, t->x, t->y);
#endif

	if (a < b) {
		for (std::vector< std::tr1::reference_wrapper<Point> >::iterator it = a - 1; it >= line.begin(); it--) {
#ifdef DBG
			printf("to %d(%d, %d)\n", it->get().id, it->get().x, it->get().y);
#endif
			v.push_back(&it->get());
		}

#ifdef DBG
		puts("reverse!");
#endif

		for (std::vector< std::tr1::reference_wrapper<Point> >::iterator it = a + 1; it <= b; it++) {
#ifdef DBG
			printf("to %d(%d, %d)\n", it->get().id, it->get().x, it->get().y);
#endif
			v.push_back(&it->get());
		}
	} else {
		for (std::vector< std::tr1::reference_wrapper<Point> >::iterator it = a + 1; it != line.end(); it++) {
#ifdef DBG
			printf("to %d(%d, %d)\n", it->get().id, it->get().x, it->get().y);
#endif
			v.push_back(&it->get());
		}

#ifdef DBG
		puts("reverse!");
#endif

		for (std::vector< std::tr1::reference_wrapper<Point> >::iterator it = a - 1; it >= b; it--) {
#ifdef DBG
			printf("to %d(%d, %d)\n", it->get().id, it->get().x, it->get().y);
#endif
			v.push_back(&it->get());
		}
	}
}

inline void getPath(std::vector<Point *> &v) {
	Point *p = &a[n - 1];
	bool flag = false;
	while (p->dpUp.x || (!flag && p->dpInline.x && p->dpInline.prec != p)) {
		if (flag || p->dpInline.prec == p || p->dpInline.x <= p->dpUp.x) {
#ifdef DBG
			printf("%d(%d, %d) -> %d(%d, %d)\n", p->id, p->x, p->y, p->dpUp.prec->id, p->dpUp.prec->x, p->dpUp.prec->y);
#endif
			p = p->dpUp.prec;
			v.push_back(p);
			flag = false;
		} else {
			getInlinePath(v, p, p->dpInline.prec);
			p = p->dpInline.prec;
			flag = true;
		}
	}
}

inline void getEdges(std::vector< std::pair<Point *, Point *> > &E) {
	struct SegmentTree {
		int l, r, m;
		SegmentTree *lc, *rc;
		DPValue val;
		bool flag;

		SegmentTree(const int l, const int r, SegmentTree *lc, SegmentTree *rc) : l(l), r(r), m(l + (r - l) / 2), lc(lc), rc(rc), flag(false) {}

		~SegmentTree() {
			if (flag) pushDown();
			if (lc) delete lc;
			if (rc) delete rc;
		}

		void pushDown() {
			if (flag) {
				if (lc || rc) {
					if (val.x == lc->val.x) lc->flag = true;
					if (val.x == rc->val.x) rc->flag = true;
				} else {
					val.prec->flagInline = true;
				}
				flag = false;
			}
		}

		void update(const int pos, const DPValue &val) {
			pushDown();
			if (l == r) this->val = val;
			else (pos <= m ? lc : rc)->update(pos, val), this->val = std::max(lc->val, rc->val);
		}

		DPValue query() { return val; }

		void mark() { flag = true; }

		static SegmentTree *build(const int l, const int r) {
			if (l > r) return NULL;
			else if (l == r) return new SegmentTree(l, r, NULL, NULL);
			else {
				int m = l + (r - l) / 2;
				return new SegmentTree(l, r, build(l, m), build(m + 1, r));
			}
		}
	} *segment;

	a[n - 1].flagUp = true;

	for (int i = lineCnt - 1; i >= 0; i--) {
		std::vector< std::tr1::reference_wrapper<Point> > &v = lines[i];
		segment = SegmentTree::build(0, v.size() - 1);
		for (size_t j = 0; j < v.size(); j++) {
			segment->update(j, v[j].get().dpUp.extend(v[j].get(), j));
		}

		for (size_t j = 0; j < v.size(); j++) {
			if (v[j].get().flagUp) {
				segment->mark();
			}

			if (j < v.size() - 1) {
				segment->update(j, v[j].get().dpUp.extend(v[j].get(), v.size() - j - 1));
				segment->update(j + 1, v[j + 1].get().dpUp.extend(v[j + 1].get(), 0));
			}
		}

		delete segment;

		for (size_t j = 0; j < v.size(); j++) {
			if (v[j].get().flagInline) {
				Point &p = v[j].get();
				// p.dpUp = DPValue(NULL, 1);

				if (p.itX != p.getVectorX().begin() && p.dpUp.x == (p.itX - 1)->get().dpInline.x + 1) {
					(p.itX - 1)->get().flagUp = true;
#ifdef DBG
					printf("(%d, %d) flagUp (%d, %d)\n", p.x, p.y, (p.itX - 1)->get().x, (p.itX - 1)->get().y);
#endif
					E.push_back(std::make_pair(&p, &(p.itX - 1)->get()));
				}

				if (p.itDiagonal1 != p.getVectorDiagonal1().begin() && p.dpUp.x == (p.itDiagonal1 - 1)->get().dpInline.x + 1) {
					(p.itDiagonal1 - 1)->get().flagUp = true;
#ifdef DBG
					printf("(%d, %d) flagUp (%d, %d)\n", p.x, p.y, (p.itDiagonal1 - 1)->get().x, (p.itDiagonal1 - 1)->get().y);
#endif
					E.push_back(std::make_pair(&p, &(p.itDiagonal1 - 1)->get()));
				}

				if (p.itDiagonal2 != p.getVectorDiagonal2().begin() && p.dpUp.x == (p.itDiagonal2 - 1)->get().dpInline.x + 1) {
					(p.itDiagonal2 - 1)->get().flagUp = true;
#ifdef DBG
					printf("(%d, %d) flagUp (%d, %d)\n", p.x, p.y, (p.itDiagonal2 - 1)->get().x, (p.itDiagonal2 - 1)->get().y);
#endif
					E.push_back(std::make_pair(&p, &(p.itDiagonal2 - 1)->get()));
				}
			}
		}
	}
}

inline void sort() {
	for (int i = 0; i < lineCnt; i++) {
		std::sort(lines[i].begin(), lines[i].end(), &compareByX);
	}
	
	for (std::tr1::unordered_map< int, std::vector< std::tr1::reference_wrapper<Point> > >::iterator it = mapX.begin(); it != mapX.end(); it++) {
		std::sort(it->second.begin(), it->second.end(), &compareByY);
		for (std::vector< std::tr1::reference_wrapper<Point> >::iterator it2 = it->second.begin(); it2 != it->second.end(); it2++) {
			Point &p = *it2;
			p.itX = it2;
		}
	}

	for (std::tr1::unordered_map< int, std::vector< std::tr1::reference_wrapper<Point> > >::iterator it = mapDiagonal1.begin(); it != mapDiagonal1.end(); it++) {
		std::sort(it->second.begin(), it->second.end(), &compareByDiagonal2);
		for (std::vector< std::tr1::reference_wrapper<Point> >::iterator it2 = it->second.begin(); it2 != it->second.end(); it2++) {
			Point &p = *it2;
			p.itDiagonal1 = it2;
		}
	}

	for (std::tr1::unordered_map< int, std::vector< std::tr1::reference_wrapper<Point> > >::iterator it = mapDiagonal2.begin(); it != mapDiagonal2.end(); it++) {
		std::sort(it->second.begin(), it->second.end(), &compareByDiagonal1);
		for (std::vector< std::tr1::reference_wrapper<Point> >::iterator it2 = it->second.begin(); it2 != it->second.end(); it2++) {
			Point &p = *it2;
			p.itDiagonal2 = it2;
		}
	}
}

#ifdef DBG
inline void debugPrint() {
	for (int i = 0; i < lineCnt; i++) {
		printf("lines[%d] = { ", i);
		for (std::vector< std::tr1::reference_wrapper<Point> >::const_iterator it = lines[i].begin(); it != lines[i].end(); it++) {
			const Point &p = *it;
			printf("(%d, %d)%s", p.x, p.y, it + 1 == lines[i].end() ? " }\n" : ", ");
		}
	}
	putchar('\n');

	for (std::tr1::unordered_map< int, std::vector< std::tr1::reference_wrapper<Point> > >::const_iterator it = mapX.begin(); it != mapX.end(); it++) {
		printf("x[%d] = { ", it->first);
		for (std::vector< std::tr1::reference_wrapper<Point> >::const_iterator it2 = it->second.begin(); it2 != it->second.end(); it2++) {
			const Point &p = *it2;
			printf("(%d, %d)%s", p.x, p.y, it2 + 1 == it->second.end() ? " }\n" : ", ");
		}
	}
	putchar('\n');

	for (std::tr1::unordered_map< int, std::vector< std::tr1::reference_wrapper<Point> > >::const_iterator it = mapDiagonal1.begin(); it != mapDiagonal1.end(); it++) {
		printf("diagonal1[%d] = { ", it->first);
		for (std::vector< std::tr1::reference_wrapper<Point> >::const_iterator it2 = it->second.begin(); it2 != it->second.end(); it2++) {
			const Point &p = *it2;
			printf("(%d, %d)%s", p.x, p.y, it2 + 1 == it->second.end() ? " }\n" : ", ");
		}
	}
	putchar('\n');

	for (std::tr1::unordered_map< int, std::vector< std::tr1::reference_wrapper<Point> > >::const_iterator it = mapDiagonal2.begin(); it != mapDiagonal2.end(); it++) {
		printf("diagonal2[%d] = { ", it->first);
		for (std::vector< std::tr1::reference_wrapper<Point> >::const_iterator it2 = it->second.begin(); it2 != it->second.end(); it2++) {
			const Point &p = *it2;
			printf("(%d, %d)%s", p.x, p.y, it2 + 1 == it->second.end() ? " }\n" : ", ");
		}
	}
	putchar('\n');

	for (int i = 0; i < n; i++) {
		printf("(%d, %d): ", a[i].x, a[i].y);
		if (a[i].dpUp.prec) printf("dpUp[%d] = { (%d, %d), %d }, ", i, a[i].dpUp.prec->x, a[i].dpUp.prec->y, a[i].dpUp.x);
		else printf("dpUp[%d] = { nullptr, %d }, ", i, a[i].dpUp.x);
		if (a[i].dpInline.prec) printf("dpInline[%d] = { (%d, %d), %d }\n", i, a[i].dpInline.prec->x, a[i].dpInline.prec->y, a[i].dpInline.x);
		else printf("dpInline[%d] = { nullptr, %d }\n", i, a[i].dpInline.x);
	}
}
#endif

int main() {
	scanf("%d", &n);

	for (int i = 0; i < n; i++) {
		scanf("%d %d", &a[i].x, &a[i].y);
		a[i].id = i;
	}
	a[n].x = 0, a[n].y = 0, a[n].id = n, n++;

	std::sort(a, a + n, &compareByY);

	for (int i = 0, last; i < n; i++) {
		Point &p = a[i];

		if (!i || p.y != a[last].y) ++lineCnt;
		lines[lineCnt - 1].push_back(std::tr1::reference_wrapper<Point>(p));
		p.lineIndex = lineCnt - 1;

		mapX[p.x].push_back(std::tr1::reference_wrapper<Point>(p));
		mapDiagonal1[p.x + p.y].push_back(std::tr1::reference_wrapper<Point>(p));
		mapDiagonal2[p.x - p.y].push_back(std::tr1::reference_wrapper<Point>(p));

		last = i;
	}

	sort();


#ifdef DBG
	debugPrint();
#endif
	
	dp();

	int cnt = a[n - 1].dpInline.x;
	printf("%d\n", cnt);

	std::vector<Point *> v;
	getPath(v);
#ifdef DBG
	for (size_t i = 0; i < v.size(); i++) printf("%d: (%d, %d)\n", v[i]->id + 1, v[i]->x, v[i]->y);
#else
	for (size_t i = 0; i < v.size(); i++) printf("%d%c", v[i]->id + 1, i == v.size() - 1 ? '\n' : ' ');
#endif

	std::vector< std::pair<Point *, Point *> > E;
	getEdges(E);

	const int s = 0, t = n + 1;
	for (int i = 1; i <= n; i++) addEdge(s, i, INT_MAX), addEdge(i, t, INT_MAX);
	for (std::vector< std::pair<Point *, Point *> >::const_iterator it = E.begin(); it != E.end(); it++) {
		addEdge(it->first->id + 1, it->second->id + 1, 1, INT_MAX);
	}

	printf("%d\n", minFlow(s, t, n + 2));

	return 0;
}
```
