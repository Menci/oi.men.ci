title: 「COGS 727」太空飞行计划 - 最大权闭合图
categories:
  - OI
tags:
  - COGS
  - Dinic
  - 图论
  - 最大权闭合图
  - 网络流
  - 网络流 24 题
permalink: cogs-727
date: '2016-02-15 08:39:38'
---

W 教授正在为国家航天中心计划一系列的太空飞行。可供选择的实验集合为 $ E = \{ E1, E2, …, Em \} $，这些实验需要使用的全部仪器的集合为 $ I = \{ I1, I2, …, In \} $。实验 $ E_j $ 需要用到的仪器是 $ R_j∈I $。仪器 $ I_k $ 的费用为 $ c_k $。实验 $ E_j $ 的赞助商为该实验结果支付 $ p_j $。设计方案使收益最大。

<!-- more -->

### 链接

[COGS 727](http://cogs.top/cogs/problem/problem.php?pid=727)

### 题解

首先，这个问题抽象出来是一个『最大权闭合图』问题 —— 把每个实验作为点，权值为获利；把每个仪器作为点，权值为费用的**相反数**，求出一个点权和最大的子图，使这个子图中的每个点的所有出边指向的点都在这个子图中。特殊的，这个子图可以为空。

根据胡伯涛的论文，最大权闭合图可以用最小割模型来求解：添加源点和汇点，对于原图中的每个**正权点**，连接一条从源点流向该点的边，容量为权值；对于原图中的每个**负权点**，连接一条从该点流向汇点的边，容量为权值的**绝对值**；对于原图中的每一条有向边，对应在网络中连接一条容量为正无穷的边。求出该网络的最小割，割边中所有边一定是从源点连接到一个正权点或从一个负权点连到汇点，这些与割边相连的正权点是**不选择**的点，与割边相连的负权点是**选择**的负权点。

重点来说下怎么求最小割，用 Dinic 求出最大流之后，在**包含反向边**的残量网络中沿着**不满流**的边进行 BFS，将遍历到的点做上标记。BFS 结束后，所有有标记的点组成 `S` 集合，无标记的点组成 `T` 集合。枚举每条边，所有跨越了 `S` 和 `T` 集合的边组成了最小割。

得到不选择的正权点之后，用 `std::set_difference` 求出与所有正权点的差集就是选择的正权点。

### 代码

```cpp
#include <cstdio>
#include <climits>
#include <iostream>
#include <string>
#include <sstream>
#include <algorithm>
#include <queue>
#include <list>
#include <utility>
#include <vector>
#include <set>
#include <iterator>

const int MAXN = 100;
const int MAXM = 100;

struct Node;
struct Edge;

struct Node {
    Edge *firstEdge;
    int level, id;
    bool flag;
} nodes[MAXM + MAXN + 2];

struct Edge {
    Node *from, *to;
    int capacity, flow;
    Edge *next, *reversedEdge;

    Edge(Node *from, Node *to, int capacity) : from(from), to(to), next(from->firstEdge), capacity(capacity), flow(0) {}
};

int n, m;
std::list<std::pair<Node *, Node *> > edgeList;

struct Dinic {
    bool makeLevelGraph(Node *s, Node *t, int n) {
        for (int i = 0; i < n; i++) nodes[i].level = 0;

        std::queue<Node *> q;
        q.push(s);
        s->level = 1;

        while (!q.empty()) {
            Node *v = q.front();
            q.pop();

            for (Edge *e = v->firstEdge; e; e = e->next) {
                if (e->flow < e->capacity && e->to->level == 0) {
                    e->to->level = v->level + 1;
                    if (e->to == t) return true;
                    else q.push(e->to);
                }
            }
        }

        return false;
    }

    int findPath(Node *s, Node *t, int limit) {
        if (s == t) return limit;

        for (Edge *e = s->firstEdge; e; e = e->next) {
            if (e->flow < e->capacity && e->to->level == s->level + 1) {
                int flow = findPath(e->to, t, std::min(limit, e->capacity - e->flow));
                if (flow > 0) {
                    e->flow += flow;
                    e->reversedEdge->flow -= flow;
                    return flow;
                }
            }
        }

        return 0;
    }

    int operator()(int s, int t, int n) {
        int ans = 0;
        while (makeLevelGraph(&nodes[s], &nodes[t], n)) {
            int flow;
            while ((flow = findPath(&nodes[s], &nodes[t], INT_MAX)) > 0) ans += flow;
        }

        return ans;
    }
} dinic;

inline void addEdge(int from, int to, int capacity) {
    nodes[from].firstEdge = new Edge(&nodes[from], &nodes[to], capacity);
    nodes[to].firstEdge = new Edge(&nodes[to], &nodes[from], 0);

    nodes[from].firstEdge->reversedEdge = nodes[to].firstEdge, nodes[to].firstEdge->reversedEdge = nodes[from].firstEdge;

    edgeList.push_back(std::make_pair(&nodes[from], &nodes[to]));
}

inline void minCut(int s) {
    std::queue<Node *> q;;
    q.push(&nodes[s]);
    nodes[s].flag = true;

    while (!q.empty()) {
        Node *v = q.front();
        q.pop();

        for (Edge *e = v->firstEdge; e; e = e->next) {
            if (e->flow < e->capacity && !e->to->flag) {
                e->to->flag = true;
                q.push(e->to);
            }
        }
    }

    std::list<std::pair<Node *, Node *> >::iterator p = edgeList.begin();
    while (p != edgeList.end()) {
        if (p->first->flag && !p->second->flag) p++;
        else p = edgeList.erase(p);
    }
}

int main() {
    freopen("shuttle.in", "r", stdin);
    freopen("shuttle.out", "w", stdout);

    scanf("%d %d\n", &m, &n);

    for (int i = 0; i < n + m + 1; i++) nodes[i].id = i;

    const int s = 0, t = n + m + 1;

    int sum = 0;
    for (int i = 1; i <= m; i++) {
        std::string str;
        std::getline(std::cin, str);

        std::stringstream ss;
        ss << str;

        int x;
        ss >> x;
        sum += x;
        addEdge(s, n + i, x);

        while (!ss.eof()) {
            ss >> x;
            addEdge(n + i, x, INT_MAX);
        }
    }

    for (int i = 1; i <= n; i++) {
        int x;
        scanf("%d", &x);
        addEdge(i, t, x);
    }

    int maxFlow = dinic(s, t, n + m + 2);

    minCut(s);

    std::vector<int> v;
    std::set<int> set, setAll;
    for (std::list<std::pair<Node *, Node *> >::const_iterator p = edgeList.begin(); p != edgeList.end(); p++) {
        if (p->first->id == s) set.insert(p->second->id - n);
        else v.push_back(p->first->id);
    }

    for (int i = 1; i <= m; i++) setAll.insert(i);

    std::set<int> setDifference;
    std::set_difference(setAll.begin(), setAll.end(), set.begin(), set.end(), std::inserter(setDifference, setDifference.begin()));
    std::copy(setDifference.begin(), setDifference.end(), std::ostream_iterator<int>(std::cout, " "));
    std::cout << std::endl;

    std::sort(v.begin(), v.end());
    std::copy(v.begin(), v.end(), std::ostream_iterator<int>(std::cout, " "));
    std::cout << std::endl;

    printf("%d\n", sum - maxFlow);

    fclose(stdin);
    fclose(stdout);

    return 0;
}
```