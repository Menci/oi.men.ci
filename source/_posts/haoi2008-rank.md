title: 「HAOI2008」排名系统 - map + Splay
categories: OI
tags: 
  - BZOJ
  - HAOI
  - map
  - Splay
  - 数据结构
permalink: haoi2008-rank
date: 2016-12-13 17:08:00
---

排名系统通常要应付三种请求：上传一条新的得分记录、查询某个玩家的当前排名以及返回某个区段内的排名记录。当某个玩家上传自己最新的得分记录时，他原有的得分记录会被删除。为了减轻服务器负担，在返回某个区段内的排名记录时，最多返回 $ 10 $ 条记录。对于得分相同的，上传时间早的排名高。

<!-- more -->

### 链接
[BZOJ 1056](http://www.lydsy.com/JudgeOnline/problem.php?id=1056)

### 题解
使用 Splay 存储每个用户的分数，查询记录时提取区间即可。使用 `map` 建立从用户名到 Splay 节点指针的关系。

### 代码
```c++
#include <cstdio>
// #include <cassert>
#include <climits>
#include <vector>
#include <map>
#include <iostream>

struct Splay {
	struct Node {
		Node *c[2], *fa, **root;
		const std::map<std::string, Node *>::iterator it;
		std::pair<int, int> x;
		int size;

		Node(Node **root, Node *fa, const std::pair<int, int> &x, const std::map<std::string, Node *>::iterator it) : fa(fa), root(root), it(it), x(x), size(0) {
			c[0] = c[1] = NULL;
		}

		void maintain() {
			size = (c[0] ? c[0]->size : 0) + (c[1] ? c[1]->size : 0) + 1;
		}

		int relation() {
			return this == fa->c[1];
		}

		void rotate() {
			Node *o = fa;
			int x = relation();
			
			if (o->fa) o->fa->c[o->relation()] = this;
			fa = o->fa;

			o->c[x] = c[x ^ 1];
			if (c[x ^ 1]) c[x ^ 1]->fa = o;

			c[x ^ 1] = o;
			o->fa = this;

			o->maintain(), maintain();
			if (!fa) *root = this;
		}

		Node *splay(Node *target = NULL) {
			while (fa != target) {
				if (fa->fa == target) rotate();
				else if (relation() == fa->relation()) fa->rotate(), rotate();
				else rotate(), rotate();
			}
			return this;
		}

		Node *prev() {
			Node *v = splay()->c[0];
			while (v->c[1]) v = v->c[1];
			return v;
		}

		Node *succ() {
			Node *v = splay()->c[1];
			while (v->c[0]) v = v->c[0];
			return v;
		}

		int rank() {
			return c[0] ? c[0]->size : 0;
		}
	} *root;

	Splay(const std::map<std::string, Node *>::iterator null) : root(NULL) {
		insert(std::make_pair(INT_MIN, INT_MIN), null);
		insert(std::make_pair(INT_MAX, INT_MAX), null);
	}

	Node *insert(const std::pair<int, int> &x, std::map<std::string, Node *>::iterator it) {
		Node **v = &root, *fa = NULL;
		while (*v) {
			fa = *v;
			fa->size++;
			v = &fa->c[x > fa->x];
		}
		*v = new Node(&root, fa, x, it);
		return (*v)->splay();
	}

	void erase(Node *v) {
		Node *l = v->prev(), *r = v->succ();
		r->splay();
		l->splay(r);
		// assert(v == l->c[1]);
		delete v;
		l->c[1] = NULL;
		l->size--, r->size--;
	}

	Node *select(int k) {
		int x = k;
		Node *v = root;
		while (v->rank() != x) {
			if (v->rank() > x) v = v->c[0];
			else x -= v->rank() + 1, v = v->c[1];
		}
		return v->splay();
	}

	Node *select(int l, int r) {
		Node *prev = select(l - 1), *succ = select(r + 1);
		succ->splay();
		prev->splay(succ);
		return prev->c[1];
	}

	int size() {
		return root->size - 2;
	}
};

std::map<std::string, Splay::Node *> map;
Splay splay(map.end());

void dfs(Splay::Node *v, std::vector<const std::string *> &vec) {
	if (!v) return;
	dfs(v->c[0], vec);
	if (v->it != map.end()) vec.push_back(&v->it->first);
	dfs(v->c[1], vec);
}

inline int parseInt(std::string s) {
	int x = 0;
	for (std::string::iterator it = s.begin(); it != s.end(); it++) x = x * 10 + (*it - '0');
	return x;
}

int main() {
	int n;
	scanf("%d", &n);

	while (n--) {
		std::string cmd;
		std::cin >> cmd;
		if (cmd[0] == '+') {
			std::string name = cmd.substr(1, cmd.length() - 1);
			int x;
			scanf("%d", &x);

			std::map<std::string, Splay::Node *>::iterator it = map.find(name);
			if (it != map.end()) {
				splay.erase(it->second);
			} else {
				it = map.insert(std::make_pair(name, static_cast<Splay::Node *>(NULL))).first;
			}

			it->second = splay.insert(std::make_pair(-x, -n), it);
		} else if (cmd[0] == '?') {
			std::string arg = cmd.substr(1, cmd.length() - 1);
			if (arg[0] >= '0' && arg[0] <= '9') {
				int x = parseInt(arg);
				Splay::Node *v = splay.select(x, std::min(splay.size(), x + 10 - 1));

				std::vector<const std::string *> vec;
				dfs(v, vec);

				for (std::vector<const std::string *>::iterator it = vec.begin(); it != vec.end(); it++) std::cout << **it << (it == vec.end() - 1 ? '\n' : ' ');
			} else {
				Splay::Node *v = map[arg];
				printf("%d\n", v->splay()->rank());
			}
		}
	}

	return 0;
}
```