title: 「JSOI2007」建筑抢修 - 贪心
categories:
  - OI
tags:
  - BZOJ
  - JSOI
  - 贪心
permalink: jsoi2007-repair
date: '2016-11-13 09:11:00'
---

部落基地里只有一个修理工人，虽然他能瞬间到达任何一个建筑，但是修复每个建筑都需要一定的时间。同时，修理工人修理完一个建筑才能修理下一个建筑，不能同时修理多个建筑。如果某个建筑在一段时间之内没有完全修理完毕，这个建筑就报废了。你的任务是帮小刚合理的制订一个修理顺序，以抢修尽可能多的建筑。

<!-- more -->

### 链接

[BZOJ 1029](http://www.lydsy.com/JudgeOnline/problem.php?id=1029)

### 题解

将所有建筑按照最晚修理时间排序，维护当前时间点，枚举每个建筑，如果当前安时间足够修理这个建筑，则修理这个建筑，并将当前时间加上修理所用时间。如果当前时间不足以修改这个建筑，则尝试替换之前修理的**所用时间最多**的一个建筑。因为当前建筑的最晚修理时间更大，且用时更短，所以这样替换一定合法，并且这样替换可以使答案不变的情况下当前时间点尽量小。

使用优先队列维护最大值。

### 代码

```cpp
#include <cstdio>
#include <queue>
#include <utility>
#include <algorithm>

const int MAXN = 150000;

int main() {
    int n;
    scanf("%d", &n);

    static std::pair<int, int> a[MAXN];
    for (int i = 0; i < n; i++) scanf("%d %d", &a[i].second, &a[i].first);

    std::sort(a, a + n);

    std::priority_queue<int> q;
    long long t = 0;
    int ans = 0;
    for (int i = 0; i < n; i++) {
        if (t + a[i].second <= a[i].first) {
            t += a[i].second;
            q.push(a[i].second);
            ans++;
        } else if (!q.empty() && q.top() > a[i].second) {
            t -= q.top();
            t += a[i].second;
            q.pop();
            q.push(a[i].second);
        }
    }

    printf("%d\n", ans);

    return 0;
}
```