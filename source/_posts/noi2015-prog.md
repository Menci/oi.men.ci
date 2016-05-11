title: 「NOI2015」程序自动分析 - 离散化 + 并查集
categories: OI
tags: 
  - NOI
  - 离散化
  - 并查集
  - 哈希
  - map
permalink: noi2015-prog
id: 34
updated: '2016-01-21 21:36:13'
date: 2016-01-21 21:32:49
---

给定 `n` 个形如$x_i=x_j$或$x_i≠x_j$的变量相等 / 不等的约束条件，请判定是否可以分别为每一个变量赋予恰当的值，使得上述所有约束条件同时被满足。

<!-- more -->

### 链接
[CodeVS 4600](http://codevs.cn/problem/4600/)  
[BZOJ 4195](http://www.lydsy.com/JudgeOnline/problem.php?id=4195)

### 题解
首先，`x` 的值很大，我们要把它离散化掉。

然后用一个并查集，要离线做，先把相等的都并掉，然后枚举所有不相等的，如果某一对被并了说明不成立。

一定不要用 `std::map`！！！可以自己写哈希表或者用 `std::tr1::unordered_map`。

### 代码
#### 手写哈希表
```cpp
#include <cstdio>
#include <cstring>
#include <new>

const int HASH_SIZE = 10000007;
const int MAXN = 1000000;

template <typename T, size_t SIZE>
struct MemoryPool {
	char preAlloc[SIZE * sizeof(T)];
	T *curr;
	T *recycle[SIZE];
	int i;

	void init() {
		curr = (T *)preAlloc;
		i = -1;
	}

	T *alloc() {
		if (curr != (T *)preAlloc + SIZE) return curr++;
		else return recycle[i++];
	}

	void free(T *p) {
		recycle[++i] = p;
	}
};

template <typename T, T DEFAULT, size_t SIZE>
struct HashMap {
	struct Node {
		int key;
		T value;
		Node *next;

		Node(int key, const T &value, Node *next) : key(key), value(value), next(next) {}
	} *list[HASH_SIZE];
	MemoryPool<Node, SIZE> pool;

	void init() {
		pool.init();
		memset(list, 0, sizeof(list));
	}

	int hash(int x) {
		return (unsigned int)((x << 16) | (x >> 16)) % HASH_SIZE;
	}

	T &operator[](int key) {
		int i = hash(key);
		for (Node *v = list[i]; v; v = v->next) {
			if (v->key == key) return v->value;
		}
		list[i] = new(pool.alloc()) Node(key, DEFAULT, list[i]);
		return list[i]->value;
	}
};

template <size_t SIZE>
struct UnionFindSet {
	int p[SIZE];

	void init(int n) {
		for (int i = 0; i < n; i++) p[i] = i;
	}

	int find(int x) {
		return p[x] == x ? x : p[x] = find(p[x]);
	}

	void merge(int x, int y) {
		p[find(y)] = find(x);
	}
};

struct Query {
	int x, y, e, fx, fy;
} queries[MAXN];

HashMap<int, -1, MAXN * 2> map;
UnionFindSet<MAXN * 2> ufs;

int main() {
	int t;
	scanf("%d", &t);

	for (int i = 0; i < t; i++) {
		int n;
		scanf("%d", &n);

		map.init();
		ufs.init(n * 2);
		int k = 0;
		for (int i = 0; i < n; i++) {
			scanf("%d %d %d", &queries[i].x, &queries[i].y, &queries[i].e);

			int &fx = map[queries[i].x], &fy = map[queries[i].y];
			if (fx == -1) fx = k++;
			if (fy == -1) fy = k++;
			queries[i].fx = fx, queries[i].fy = fy;
		}

		for (int i = 0; i < n; i++) {
			if (queries[i].e == 1) {
				if (ufs.find(queries[i].fx) != ufs.find(queries[i].fy)) ufs.merge(queries[i].fx, queries[i].fy);
			}
		}

		bool flag = true;
		for (int i = 0; i < n; i++) {
			if (queries[i].e == 0) {
				if (ufs.find(queries[i].fx) == ufs.find(queries[i].fy)) {
					flag = false;
					break;
				}
			}
		}

		if (flag) puts("YES");
		else puts("NO");
	}

	return 0;
}
```

#### STL
```cpp
#include <cstdio>
#include <cstring>
#include <tr1/unordered_map>

const int HASH_SIZE = 10000007;
const int MAXN = 1000000;

template <typename T, T DEFAULT, size_t SIZE>
struct HashMap {
	std::tr1::unordered_map<int, T> map;

	void init() {
		map.clear();
	}

	T &operator[](int key) {
		if (map.count(key) == 0) map[key] = -1;
		return map[key];
	}
};

template <size_t SIZE>
struct UnionFindSet {
	int p[SIZE];

	void init(int n) {
		for (int i = 0; i < n; i++) p[i] = i;
	}

	int find(int x) {
		return p[x] == x ? x : p[x] = find(p[x]);
	}

	void merge(int x, int y) {
		p[find(y)] = find(x);
	}
};

struct Query {
	int x, y, e, fx, fy;
} queries[MAXN];

HashMap<int, -1, MAXN * 2> map;
UnionFindSet<MAXN * 2> ufs;

int main() {
	int t;
	scanf("%d", &t);

	for (int i = 0; i < t; i++) {
		int n;
		scanf("%d", &n);

		map.init();
		ufs.init(n * 2);
		int k = 0;
		for (int i = 0; i < n; i++) {
			scanf("%d %d %d", &queries[i].x, &queries[i].y, &queries[i].e);

			int &fx = map[queries[i].x], &fy = map[queries[i].y];
			if (fx == -1) fx = k++;
			if (fy == -1) fy = k++;
			queries[i].fx = fx, queries[i].fy = fy;
		}

		for (int i = 0; i < n; i++) {
			if (queries[i].e == 1) {
				if (ufs.find(queries[i].fx) != ufs.find(queries[i].fy)) ufs.merge(queries[i].fx, queries[i].fy);
			}
		}

		bool flag = true;
		for (int i = 0; i < n; i++) {
			if (queries[i].e == 0) {
				if (ufs.find(queries[i].fx) == ufs.find(queries[i].fy)) {
					flag = false;
					break;
				}
			}
		}

		if (flag) puts("YES");
		else puts("NO");
	}

	return 0;
}
```

### 吐槽
写这道题时共出了一下几条沙茶错误：

1. 忘记离线；
2. 并查集初始化太小；
3. 内存池类模板参数填错；
4. 多组数据忘记初始化；
5. 用了很奇怪的哈希方法，TLE。
