title: 「NOI2016」网格 - 图连通性
categories: OI
tags: 
  - BZOJ
  - NOI
  - Tarjan
  - 图论
  - 割点
permalink: noi2016-grid
date: 2016-09-08 19:40:00
---

在一个 $ n \times m $ 的网格上，有 $ c $ 个障碍，其余均为空地。求至少需要将多少空地转化为障碍，可以使得存在两个空地在四连通意义下不在同一连通块中。

<!-- more -->

### 链接
[BZOJ 4651](http://www.lydsy.com/JudgeOnline/problem.php?id=4651)  
[UOJ #220](http://uoj.ac/problem/220)

### 题解
显然，如果有解，则答案最大为 $ 2 $。我们只需要依次判断答案是否为无解、$ -1 $、$ 0 $、$ 1 $ 即可。

#### 判断无解
无解有两种情况：

1. 没有空地；
2. 只有两块在四连通意义下相邻的空地。

对于第一种情况，只需要判断 $ n \times m = c $ 即可，第二种情况，因为 $ n $ 和 $ m $ 不大（$ n \times m = c + 2 $），可以标记所有障碍格子，取出两块空地格子的坐标，判断 $ | x_1 - x_2 | + | y_1 - y_2 | = 1 $ 即可。

#### 判断答案为 $ 0 $
答案为 $ 0 $ 的充要条件为，存在一圈障碍（或边界），把内部和外部的空地隔开。即，**空地被障碍分成了多个连通块**。

因为空地非常多，所以不能直接对空地做 FloodFill。但很多空地是多余的，「有用」的空地只会有 $ O(c) $ 个。

考虑什么情况下障碍可以围成一个圈 —— **围成圈的障碍块一定是一个八连通块**，很显然，如果存在两个障碍块不在同一个八连通块中，则这个「圈」至少有两个缺口。

我们从第一块障碍开始，向八连通方向对障碍块做 FloodFill。会得到一个极大的八连通分量。使用这个八连通分量中**与每个障碍块八连通的空地**建图，四连通空地建连边，如果图不连通，则答案为 $ 0 $。

#### 判断答案为 $ 1 $
答案为 $ 1 $ 的充要条件为，整个图存在一个点，将这个点变为障碍后，图不连通，即存在**割点**。

和刚才一样，需要取出「有用」的空地来建图。考虑与每个障碍八连通的空地，如果整个图存在割点，则这些点中一定存在割点。

但我们不能简单地使用这些点来建图，考虑下面这种情况：

```plain
.......
...111.
...1*1.
.11111.
.1*1...
.111...
.......
```

如果只使用所有被标为的 $ 1 $ 的点来建图，则中间的点为割点 —— 但它不是整个图的割点。

我们可以再加一层空地，即将所有与**与障碍块八连通的空地**八连通的空地加到图中：

```plain
..22222
..21112
2221*12
2111112
21*1222
21112..
22222..
```

可以证明，这样建出的图，如果**被标为 $ 1 $ 的点**中有割点，则整个图有割点。

#### 只有一行或一列时
只有一行或一列时，如果有解，则答案最大为 $ 1 $。考虑如何判断。

如果答案为 $ 0 $，则序列上存在一个由障碍组成的子序列，它的两边均为空地。排序后线性扫描即可。

### 代码
```c++
#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <algorithm>

#define HASH(x, y) (static_cast<unsigned long long>(x) << 32) | static_cast<unsigned long long>(y)
#define inline inline __attribute__((always_inline))

const int MAXC = 100000;
const int MAXN = MAXC * 24;
const int dx[4] = { 1, -1, 0, 0 };
const int dy[4] = { 0, 0, 1, -1 };

template <typename Tk, typename Tv>
struct HashMap {
	const static size_t HASH_SIZE = 7979717;
	struct Node {
		struct Pair {
			Tk first;
			Tv second;
		} p;
		int time;
	} N[HASH_SIZE];

	typedef typename Node::Pair *iterator;

	int time;

	inline HashMap() : time(1) {}

	inline int hash(const Tk &k) {
		return k % HASH_SIZE;
	}

	inline Node *locate(const Tk &k) {
		register int i;
		for (i = hash(k); N[i].time == time && N[i].p.first != k; (++i == HASH_SIZE) && (i = 0));
		return &N[i];
	}

	inline iterator find(const Tk &k) {
		register Node *v = locate(k);
		if (v->time != time || v->p.first != k) return end();
		return &v->p;
	}

	inline Tv &operator[](const Tk &k) {
		register Node *v = locate(k);
		if (v->time != time || v->p.first != k) {
			v->time = time, v->p.first = k, v->p.second = Tv();
		}
		return v->p.second;
	}

	inline void clear() { time++; }

	inline iterator end() const { return NULL; }
};

struct Node {
	struct Edge *e, *c;
	Node *p;
	int type, dfn, low;
	bool v, pushed, flag;
	int x, y;
} N[MAXN], *p = N;

struct Edge {
	Node *s, *t;
	Edge *next;

	inline Edge(Node *s, Node *t) : s(s), t(t), next(s->e) {}
};

inline void addEdge(Node *s, Node *t) {
	s->e = new Edge(s, t);
}

int n, m, c;
struct Point {
	int x, y;

	inline Point(const int x = 0, const int y = 0) : x(x), y(y) {}

	inline bool operator<(const Point &other) const {
		return y < other.y;
	}
} a[MAXN];

HashMap<unsigned long long, Node *> map;

inline Node *clear(Node *p) {
	for (Edge *&e = p->e, *next; e; next = e->next, delete e, e = next);
	memset(p, 0, sizeof(Node));
	return p;
}

#ifdef DBG
char str[1000][1000];
#endif

inline void getNodes(const int x, const int y, const bool second = false) {
	for (register int fx = -1; fx <= 1; fx++) for (register int fy = -1; fy <= 1; fy++) if (!(fx == 0 && fy == 0) && !(x + fx < 1 || x + fx > n || y + fy < 1 || y + fy > m)) {
		register int nx = x + fx, ny = y + fy;
		register HashMap<unsigned long long, Node *>::iterator it = map.find(HASH(nx, ny));
		if (it == map.end() || it->second != NULL) {
			Node *v;
			if (it == map.end()) {
				v = map[HASH(nx, ny)] = clear(p++);
				v->x = nx, v->y = ny;
			} else v = it->second;
			v->type = 1;
#ifdef DBG
			str[v->x][v->y] = 'A';
#endif
			if (second) for (register int fx = -1; fx <= 1; fx++) for (register int fy = -1; fy <= 1; fy++) if (!(fx == 0 && fy == 0) && !(nx + fx < 1 || nx + fx > n || ny + fy < 1 || ny + fy > m)) {
				register int nx2 = nx + fx, ny2 = ny + fy;
				register HashMap<unsigned long long, Node *>::iterator it = map.find(HASH(nx2, ny2));
				if (it == map.end()) {
					clear(p);
					p->type = 2;
					p->x = nx2, p->y = ny2;
#ifdef DBG
					str[p->x][p->y] = 'B';
#endif
					map[HASH(nx2, ny2)] = p++;
				}
			}
		}
	}
}

inline void addEdges() {
	// for (HashMap<unsigned long long, Node *>::iterator it = map.begin(); it != map.end(); it++) if (it->second) {
	for (Node *v = N; v != p; v++) {
		register int &x = v->x, &y = v->y;
		for (register int i = 0; i < 4; i++) if (!(x + dx[i] < 1 || x + dx[i] > n || y + dy[i] < 1 || y + dy[i] > m)) {
			register int nx = x + dx[i], ny = y + dy[i];
			register HashMap<unsigned long long, Node *>::iterator it2 = map.find(HASH(nx, ny));
			if (it2 != map.end() && it2->second) {
#ifdef DBG
				printf("[%d, %d] -> [%d, %d]\n", v->x, v->y, it2->second->x, it2->second->y);
#endif
				addEdge(v, it2->second);
			}
		}
	}
}

inline int tarjan() {
	register int ts = 0, cnt = 0;
	for (Node *start = N; start != p; start++) {
		if (start->v) continue;

		static Node *s[MAXN];
		Node **top = s;
		start->pushed = true;
		*top = start;

		while (top != s - 1) {
			Node *v = *top;

			if (!v->v) {
				v->v = true;
				v->dfn = v->low = ++ts;
				v->c = v->e;
			}

			if (v->c) {
				Edge *&e = v->c;
				if (e->t->v && e->t != v->p) v->low = std::min(v->low, e->t->dfn);
				else if (!e->t->pushed) *++top = e->t, e->t->pushed = true, e->t->p = v;
				e = e->next;
			} else {
				if (v != start) for (Edge *e = v->e; e; e = e->next) if (e->t->p == v && e->t->low >= v->dfn) {
					v->flag = true;
					break;
				}
				if (v->flag && v->type == 1) cnt++;

				if (v->p) v->p->low = std::min(v->p->low, v->low);

				top--;
			}
		}

		int ch = 0;
		for (Edge *e = start->e; e; e = e->next) if (e->t->p == start) ch++;
		start->flag = ch >= 2;
		if (start->flag && start->type == 1) cnt++;
	}

	return cnt;
}

inline bool isOne() {
	for (register int i = 0; i < c; i++) {
		register int &x = a[i].x, &y = a[i].y;
		map[HASH(x, y)] = NULL;
	}

	p = N;

	for (register int i = 0; i < c; i++) {
		getNodes(a[i].x, a[i].y, true);
	}

	addEdges();

	return tarjan() != 0;
}

inline bool bfsCount() {
	bool flag = false;
	for (Node *start = N; start != p; start++) {
		if (start->v) continue;
		if (flag) return true;
		flag = true;

		static Node *q[MAXN];
		Node **l = q, **r = q;
		start->v = true;
		*l = start;

		while (l <= r) {
			Node *v = *l++;

			for (Edge *e = v->e; e; e = e->next) if (!e->t->v) {
				e->t->v = true;
				*++r = e->t;
			}
		}
	}
	return false;
}

inline bool isZero() {
	static HashMap<unsigned long long, bool> map2;
	map2.clear();
	for (register int i = 0; i < c; i++) {
		map2[HASH(a[i].x, a[i].y)] = false;
	}
	bool ans = false;
#ifdef DBG
	int id = 0;
#endif
	for (int i = 0; i < c; i++) {
		register int &x = a[i].x, &y = a[i].y;
		register bool &f = map2[HASH(x, y)];
		if (f) continue;
		f = true;

#ifdef DBG
		id++;
#endif

		static Point vec[MAXC];
		int cnt = 0;

		map.clear();
		p = N;

		static Point q[MAXC];
		Point *l = q, *r = q;
		*l = Point(x, y);
		while (l <= r) {
			Point p = *l++;

#ifdef DBG
			str[p.x][p.y] = id + '0';
#endif

			map[HASH(p.x, p.y)] = NULL;
			vec[cnt++] = p;

			for (register int fx = -1; fx <= 1; fx++) for (register int fy = -1; fy <= 1; fy++) if (!(fx == 0 && fy == 0) && !(p.x + fx < 1 || p.x + fx > n || p.y + fy < 1 || p.y + fy > m)) {
				register int nx = p.x + fx, ny = p.y + fy;
				HashMap<unsigned long long, bool>::iterator it = map2.find(HASH(nx, ny));
				if (it != map2.end() && it->second == false) {
					it->second = true;
					*++r = Point(nx, ny);
				}
			}
		}

		for (int i = 0; i < cnt; i++) getNodes(vec[i].x, vec[i].y);
		addEdges();
		if (bfsCount()) {
			ans = true;
			break;
		}
	}
	map.clear();
	return ans;
}

inline bool isInvalid() {
	const unsigned long long r = static_cast<unsigned long long>(n) * m - c;
	if (r < 2) return true;
	else if (r == 2) {
		static bool flag[MAXC];
		for (int i = 0; i < c; i++) {
			flag[(a[i].x - 1) * m + a[i].y - 1] = true;
		}

		Point pts[2];
		for (int i = 0, cnt = 0; i < n; i++) for (int j = 0; j < m; j++) {
			if (!flag[i * m + j]) pts[cnt++] = Point(i, j);
			flag[i * m + j] = false;
		}

		return abs(pts[0].x - pts[1].x) + abs(pts[0].y - pts[1].y) == 1;
	} else return false;
}

inline const char *special() {
	std::sort(a, a + c);
	int last = 0, cnt = 0;
	for (int i = 0; i < c; i++) {
		if (a[i].y != last + 1) {
			cnt++;
		}
		last = a[i].y;
	}
	if (last != m) cnt++;
	return cnt == 1 ? "1" : "0";
}

template <typename T>
inline void read(T &x) {
	x = 0;
	register char ch;
	while (ch = getchar_unlocked(), !(ch >= '0' && ch <= '9'));
	do x = x * 10 + ch - '0'; while (ch = getchar_unlocked(), (ch >= '0' && ch <= '9'));
}

int main() {
	int t;
	read(t);
	while (t--) {
		read(n), read(m), read(c);
		for (int i = 0; i < c; i++) {
			read(a[i].x), read(a[i].y);
			if (n > m) std::swap(a[i].x, a[i].y);
		}

		if (n > m) std::swap(n, m);

		if (isInvalid()) puts("-1");
		else if (n == 1) puts(special());
		else if (isZero()) puts("0");
		else if (isOne()) puts("1");
		else puts("2");

#ifdef DBG
		for (Node *v = N; v != p; v++) {
			printf("[%d, %d] => %d\n", v->x, v->y, v->type);
		}
		for (int i = 1; i <= n; i++) {
			for (int j = 1; j <= m; j++) {
				HashMap<unsigned long long, Node *>::iterator it = map.find(HASH(i, j));
				if (it == map.end()) putchar('-');
				else if (!it->second) putchar('X');
				else putchar('0' + it->second->type);
			}
			putchar('\n');
		}

		/*
		for (int i = 1; i <= n; i++) {
			for (int j = 1; j <= m; j++) {
				putchar(str[i][j] ? str[i][j] : '-');
			}
			putchar('\n');
		}
		*/
#endif
	}

	return 0;
}
```
