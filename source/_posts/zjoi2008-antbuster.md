title: 「ZJOI2008」杀蚂蚁 - 模拟 + 几何
categories: OI
tags: 
  - BZOJ
  - COGS
  - ZJOI
  - 模拟
  - 几何
  - 数学
permalink: zjoi2008-antbuster
date: 2016-05-23 21:26:00
---

题面见[杀蚂蚁的可读版本](https://www.zybuluo.com/Jerusalem/note/221811)。

<!-- more -->

### 链接
[BZOJ 1033](http://www.lydsy.com/JudgeOnline/problem.php?id=1033)  
[COGS 2048](http://cogs.top/cogs/problem/problem.php?pid=2048)

### 题解
根据题意模拟即可 ……

唯一的难点是判断线段和圆的交点。先过圆心做线段的垂线，判断与线段是否有交点，如果有，则设点到线段距离为 $ a $，圆心与线段端点距离的较大值为 $ b $；否则设圆心与线段距离较小值为 $ a $，较大值为 $ b $。

满足

$$
\begin{cases}
a \leq r \\
b \gt r
\end{cases}
$$

即可

保存直线的时候可以用斜截式，但注意斜率不存在和斜率为零的特判。

还有就是不要**写错变量名** ……

### 代码
```c++
#include <cstdio>
#include <cmath>
#include <list>
#include <algorithm>

typedef long double real;

const int MAXN = 8;
const int MAXM = 8;
const int MAXS = 20;
const int MAXT = 200000;
const real EPS = 1e-6;

int n, m, s, d, r, t, time;

struct Map {
	int message;
	bool reachable;

	Map() : message(0), reachable(true) {}
} map[MAXN + 1][MAXM + 1];

template <typename T>
struct Point {
	T x, y;

	Point(const T x = 0, const T y = 0) : x(x), y(y) {}

	Map *operator->() const { return &map[static_cast<int>(x)][static_cast<int>(y)]; }

	Point offset(const int id) const {
		switch (id) {
			case 0: return Point(x, y + 1);
			case 1: return Point(x + 1, y);
			case 2: return Point(x, y - 1);
			case 3: return Point(x - 1, y);
			default: return *this;
		}
	}

	bool valid() const { return x >= 0 && x <= n && y >= 0 && y <= m; }

	bool operator==(const Point &p) const { return x == p.x && y == p.y; }
};

inline bool dcmp(const real a) { return fabs(a) <= EPS; }
inline bool dcmp(const real a, const real b) { return dcmp(a - b); }

inline bool isnan(const real x) { return x != x; }
inline bool isinf(const real x) { return !isnan(x) && isnan(x - x); }

template <typename T> inline T sqr(const T &x) { return x * x; }

template <typename Ta, typename Tb>
inline real distance(const Point<Ta> a, const Point<Tb> b) {
	return sqrt(static_cast<real>(sqr(a.x - b.x) + sqr(a.y - b.y)));
}

struct Ant {
	Point<int> position, lastPosition;
	int level;
	int hpLimit, hp;
	bool hasCake;
	int spawnTime;

	Ant(const int level) : position(0, 0), lastPosition(-1, -1), level(level), hpLimit(floor(4 * pow(1.1, level))), hp(hpLimit), hasCake(false), spawnTime(time) {
		// printf("spawn Ant(%d)\n", level);
		position->reachable = false;
	}

	inline void moveTo(const Point<int> &nextPosition) {
		lastPosition = position;
		position = nextPosition;
		if (lastPosition == position) return;
		// printf("moveTo(): from [%d, %d] to [%d, %d]\n", lastPosition.x, lastPosition.y, position.x, position.y);
		lastPosition->reachable = true;
		position->reachable = false;
	}

	inline int age() const {
		return time - spawnTime;
	}

	inline bool attackable(const Point<int> &p) {
		const real dist = distance(position, p);
		return dist < r || dcmp(dist, r);
	}
};

struct Line {
	real k, b;

	/*
	 * k != nan: y = kx + b
	 * k == nan: x = b
	 */

	Line(const Point<int> &p1, const Point<int> &p2) {
		const real x1 = p1.x, y1 = p1.y, x2 = p2.x, y2 = p2.y;
		if (x1 == x2) {
			k = NAN;
			b = x1;
		} else {
			k = (y2 - y1) / (x2 - x1);
			b = y1 - k * x1;
		}
	}

	Line(const real k, const Point<int> &p1) : k(isinf(k) ? NAN : k), b(isinf(k) ? p1.x : (p1.y - k * p1.x)) {}

	Line(const real k, const real b) : k(k), b(b) {}

	Line perpendicular(const Point<int> &p1) const {
		if (isnan(k)) return Line(0, p1.y);
		else return Line(-1.0 / k, p1);
	}
};

struct Segment {
	Point<int> p1, p2;
	Line line;
	real length;

	Segment(const Point<int> &p1, const Point<int> &p2) : p1(p1), p2(p2), line(p1, p2) {
		length = distance(p1, p2);
	}
};

Point<real> lineIntersection(const Line &a, const Line &b) {
	if (isnan(a.k) && isnan(b.k) || a.k == b.k) throw;
	if (isnan(a.k)) return Point<real>(a.b, a.b * b.k + b.b);
	if (isnan(b.k)) return Point<real>(b.b, b.b * a.k + a.b);
	const real x = (b.b - a.b) / (a.k - b.k);
	const real y = a.k * x + a.b;
	return Point<real>(x, y);
}

bool pointOnSegment(const Point<real> &p, const Segment &s) {
	return dcmp(distance(p, s.p1) + distance(p, s.p2) - s.length);
}

bool segmentCircleIntersection(const Segment &s, const Point<int> &p, const real r) {
	Line v = s.line.perpendicular(p);
	Point<real> is = lineIntersection(v, s.line);
	real min, max;
	if (pointOnSegment(is, s)) {
		min = distance(is, p);
		max = std::max(distance(is, s.p1), distance(is, s.p2));
	} else {
		min = distance(p, s.p1);
		max = distance(p, s.p2);
		if (min > max) std::swap(min, max);
	}

	return (min < r || dcmp(min, r)) && (max > r || dcmp(max, r));
}

std::list<Ant> ants;
std::list<Ant>::iterator cakeOwner = ants.end();
Point<int> towers[MAXS];

inline void spawn() {
	if (ants.size() < 6) {
		if (map[0][0].reachable == false) return;

		static int cnt = -1;
		cnt++;
		ants.push_back(Ant(cnt / 6 + 1));
	}
}

inline void incMessage() {
	for (std::list<Ant>::const_iterator it = ants.begin(); it != ants.end(); it++) {
		it->position->message += it->hasCake ? 5 : 2;
	}
}

inline void move() {
	for (std::list<Ant>::iterator it = ants.begin(); it != ants.end(); it++) {
		// static int _cnt = 0;
		// _cnt++;
		// printf("move(): _cnt = %d\n", _cnt);

		int id = -1;
		// printf("move(): lastPosition = [%d, %d]\n", it->lastPosition.x, it->lastPosition.y);
		for (int i = 0; i < 4; i++) {
			Point<int> newPosition = it->position.offset(i);

			if (!newPosition.valid()) continue;
			if (newPosition == it->lastPosition) continue;
			if (!newPosition->reachable) continue;

			if (id == -1 || newPosition->message > it->position.offset(id)->message) {
				id = i;
			}
		}

		// if (id != -1) printf("move(): checking moving to [%d, %d]\n", it->position.offset(id).x, it->position.offset(id).y);

		if (id != -1 && (it->age() + 1) % 5 == 0) {
			// printf("move(): special, before = [%d, %d]\n", it->position.offset(id).x, it->position.offset(id).y);
			Point<int> newPosition;
			do {
				id = (id - 1 + 4) % 4;
				newPosition = it->position.offset(id);
			} while (!newPosition.valid() || !newPosition->reachable || newPosition == it->lastPosition);
			// printf("move(): special, after = [%d, %d]\n", it->position.offset(id).x, it->position.offset(id).y);
		}

		it->moveTo(it->position.offset(id));
	}
}

inline void getCake() {
	if (cakeOwner != ants.end()) return;

	for (std::list<Ant>::iterator it = ants.begin(); it != ants.end(); it++) {
		if (it->position == Point<int>(n, m)) {
			cakeOwner = it;
			it->hasCake = true;
			it->hp = std::min(it->hpLimit, it->hp + it->hpLimit / 2);
			// puts("getCake(): got");
			break;
		}
	}
}

inline void attack() {
	for (int i = 0; i < s; i++) {
		// static int _cnt = 0;
		// _cnt++;
		// printf("attack(): _cnt = %d\n", _cnt);

		std::list<Ant>::iterator target = ants.end();
		if (cakeOwner != ants.end() && cakeOwner->attackable(towers[i])) {
			target = cakeOwner;
		}

		if (target == ants.end()) {
			for (std::list<Ant>::iterator it = ants.begin(); it != ants.end(); it++) {
				real d = distance(it->position, towers[i]);
				if ((d < r || dcmp(d, r)) && (target == ants.end() || distance(it->position, towers[i]) < distance(target->position, towers[i]))) {
					target = it;
				}
			}
		}

		if (target != ants.end()) {
			target->hp -= d;
			Segment s(towers[i], target->position);
			for (std::list<Ant>::iterator it = ants.begin(); it != ants.end(); it++) {
				if (it != target && segmentCircleIntersection(s, it->position, 0.5)) {
					// printf("attack(): _cnt = %d, through [%d, %d]\n", _cnt, it->position.x, it->position.y);
					it->hp -= d;
				}
				
				// if (it == target) printf("attack(): _cnt = %d, target [%d, %d]\n", _cnt, target->position.x, target->position.y);
			}
		}
	}
}

inline void kill() {
	for (std::list<Ant>::iterator it = ants.begin(); it != ants.end(); ) {
		if (it->hp < 0) {
			it->position->reachable = true;
			if (it == cakeOwner) cakeOwner = ants.end();
			it = ants.erase(it);
		} else it++;
	}
}

inline bool check() {
	for (std::list<Ant>::const_iterator it = ants.begin(); it != ants.end(); it++) {
		if (it->position == Point<int>(0, 0) && it->hasCake) return false;
	}

	return true;
}

inline void decMessage() {
	for (int i = 0; i <= n; i++) {
		for (int j = 0; j <= m; j++) {
			if (map[i][j].message > 0) map[i][j].message--;
		}
	}
}

int main() {
	freopen("data.in", "r", stdin);

	scanf("%d %d\n%d %d %d", &n, &m, &s, &d, &r);
	for (int i = 0; i < s; i++) {
		scanf("%d %d", &towers[i].x, &towers[i].y);
		towers[i]->reachable = false;
	}
	scanf("%d", &t);

	time = 1;
	for (; time <= t; time++) {
		// printf("main(): time = %d\n", time);
		spawn();
		incMessage();
		move();
		getCake();
		attack();
		kill();
		if (!check()) break;
		decMessage();

		// for (std::list<Ant>::const_iterator it = ants.begin(); it != ants.end(); it++) printf("%d %d %d %d %d\n", it->age(), it->level, it->hp, it->position.y, it->position.x);
		// putchar('\n');
	}

	if (time > t) puts("The game is going on");
	else printf("Game over after %d seconds\n", time);

	printf("%d\n", ants.size());
	for (std::list<Ant>::const_iterator it = ants.begin(); it != ants.end(); it++) printf("%d %d %d %d %d\n", it->age(), it->level, it->hp, it->position.x, it->position.y);

	fclose(stdin);

	return 0;
}
```
