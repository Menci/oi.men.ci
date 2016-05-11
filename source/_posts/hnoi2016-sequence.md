title: 「HNOI2016」序列 - 莫队 + RMQ
categories: OI
tags: 
  - BZOJ
  - HNOI
  - 莫队
  - RMQ
permalink: hnoi2016-sequence
date: 2016-04-30 21:23:18
---

给定长度为 $ n $ 的序列：$ a_1,\ a_2,\ \dots,\ a_n $，记为 $ a[1:n] $。类似的，$ a[l:r] $（$ 1 \leq l \leq r \leq n $）是指序列：$ a_l,\ a_{l + 1},\ \dots,\ a_{r - 1},\ a_r $。若 $ 1 \leq l \leq s \leq t \leq r \leq n $，则称 $ a[s:t] $ 是 $ a[l:r] $ 的子序列。

现在有 $ q $ 个询问，每个询问给定两个数 $ l $ 和 $ r $，$ 1 \leq l \leq r \leq n $，求 $ a[l:r] $ 的不同子序列的最小值之和。

<!-- more -->

### 链接
[BZOJ 4540](http://www.lydsy.com/JudgeOnline/problem.php?id=4540)

### 题解
[Sengxian 的题解](https://blog.sengxian.com/solutions/bzoj-4540)

对于无修改的区间询问，我们可以将操作离线，采用莫队算法解决。

为便于叙述，定义 $ [i] $ 为位置 $ i $ 处的元素（即 $ a_i $）；$ [ \ [l,\ r],\ R \ ] $ 为左端点属于 $ [l,\ r] $，右端点为 $ R $ 的所有子序列。

已知区间 $ [l,\ r - 1] $ 的答案，考虑新加入的元素 $ [r] $ 对询问的影响。新元素加入后，产生了 $ r - l + 1 $ 个子序列，它们是 $ [ \ [l,\ r] \ ,\ r \ ] $。

$ [l, r] $ 中存在一个最小值 $ [m] $，使得 $ [ \ [l,\ m],\ r \ ] $ 的最小值均为 $ [m] $，举个例子

| 位置 | *1* | 2 | 3 | *4* | 5 | 6 | 7 | 8 | 9 | *10* |
|:---:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:--:|
|  值  | 5 | 7 | 3 | 1 | 5 | 2 | 8 | 3 | 6 |  4 |
| 标记 | $ l $ |   |   | $ m $ |   |   |   |   |   |  $ r $ |

区间 $ [ \ [1,\ 4],\ 6 \ ] $ 的最小值均为 $ [4] $，即 $ 1 $。

考虑剩下的 $ r - m $ 个子序列，从 $ r $ 向左走，经过的所有比 $ [r] $ **大**的元素，以这些元素的位置为左端点，$ r $ 为右端点的所有子序列的最小值均为 $ [r] $。直到到达第一个比 $ [r] $ 小的元素（例子中的 $ [8] = 3 $），其位置记做 $ {\rm left}(r) = p $。

| 位置 | *1* | 2 | 3 | *4* | 5 | 6 | 7 | *8* | 9 | *10* |
|:---:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:--:|
|  值  | 5 | 7 | 3 | 1 | 5 | 2 | 8 | 3 | 6 |  4 |
| 标记 | $ l $ |   |   | $ m $ |   |   |   | $ p $ |   |  $ r $ |

$ p $ 右边有 $ r - p = 10 - 8 = 2 $ 个子序列，他们的最小值均为 $ [10] = 4 $，这些子序列对答案的贡献为 $ (r - p) \times [r] $。

仿照刚才的做法，继续向左找第一个小于 $ [p] = 3 $ 的元素，其值为 $ [6] = 2 $，即 $ {\rm left}(p) = p' = 6 $。

| 位置 | *1* | 2 | 3 | *4* | 5 | *6* | 7 | *8* | 9 | *10* |
|:---:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:--:|
|  值  | 5 | 7 | 3 | 1 | 5 | 2 | 8 | 3 | 6 |  4 |
| 标记 | $ l $ |   |   | $ m $ |   | $ p' $  |   | $ p $ |   |  $ r $ |

$ p' $ 右边有 $ p - p' = 8 - 6 = 2 $ 个子序列，他们的最小值均为 $ [8] = 3 $，这些子序列对答案的贡献为 $ (p - p') \times [p] $。

继续向左找，找到第一个比 $ p' $ 小的元素，其值为 $ 1 $，即 $ {\rm left}(p') = m = 4 $，注意此时已经找到整个区间内的最小值，左端点在 $ m $ 及其左侧的所有子序列对答案的贡献已经被考虑过，恰好只剩下 $ p' - m = 6 - 4 = 2 $ 个子序列，其最小值均为 $ [p'] = 2 $，这些子序列对答案的贡献为 $ (p' - m) \times [p'] $。

若直接使用上述算法计算每个元素的贡献，单次计算的时间复杂度为 $ O(n) $，超时。

定义 $ m = \min[l,\ r] $ 为区间 $ [l,\ r] $ 的最小值所在的位置，设 $ f(l, r) $ 为区间 $ [l,\ r] $ 内除最小值之外的其它值对答案的贡献，则有

$$
f(l, r) = 
\begin{cases}
0 & r = m \\
[r] \times (r - {\rm left}(r)) + f(l, {\rm left}(r)) & {\rm otherwise} \\
\end{cases}
$$

注意到整个式子除边界条件中的 $ m $ 之外，和 $ l $ 是无关的。

设 $ s(i) $ 为从 $ i $ 位置一直向左跳，直到跳到所有元素中的最小值，用上述方法计算出的贡献总和，则有

$$
s(i) = 
\begin{cases}
0 & i = \min[1,\ n] \\
[i] \times (i - {\rm left}(i)) + s({\rm left}(i)) & {\rm otherwise} \\
\end{cases}
$$

注意到刚才的例子中，$ {\rm left}(p') = {\rm left}(m + 1) = m $，即**最后一跳的位置**和**最小值的右边一个位置**向左跳跳到的位置相同。所以

$$ f(l, r) = s(r) - s(\min[l,\ r]) $$

使用单调栈算法（保持栈底到栈顶的元素单调递增）预处理出每个 $ {\rm left}(i) $，之后可以在 $ O(n) $ 的时间内递推出 $ s(i) $。区间向左扩展时同理，向右边跳即可。

而对于 RMQ，使用稀疏表在 $ O(n \log n) $ 的时间内预处理后，即可在 $ O(1) $ 的时间内回答每次查询。最终，每次转移的时间降为 $ O(1) $，总时间复杂度为 $ O(q \log q + n \sqrt n) $。

### 代码
```c++
#include <cstdio>
#include <cmath>
// #include <cassert>
#include <algorithm>
#include <stack>

const int MAXN = 100000;
const int MAXLOGN = 17; // log(100000, 2) = 16.609640474436812
const int MAXM = 100000;

struct Element {
    int val;
    Element *left, *right;
    long long sumLeft, sumRight;

    bool operator<(const Element &x) const { return val < x.val; }
    bool operator<=(const Element &x) const { return val <= x.val; }
} a[MAXN];

int n, m, logTable[MAXN + 1];
Element *st[MAXN][MAXLOGN + 1];
long long ans[MAXN];

struct Query {
    int l, r;
    long long *ans;

    bool operator<(const Query &x) const {
        static int blockSize = floor(sqrt(n));
        if (l / blockSize == x.l / blockSize) return r < x.r;
        else return l / blockSize < x.l / blockSize;
    }
} Q[MAXM];

inline Element *min(Element *const a, Element *const b) {
    if (!a) return b;
    if (!b) return a;
    return *a < *b ? a : b;
}

inline void sparseTable() {
    for (int i = 0; i < n - 1; i++) st[i][0] = min(&a[i], &a[i + 1]);
    st[n - 1][0] = &a[n - 1];

    for (int j = 1; (1 << j) <= n; j++) {
        for (int i = 0; i < n; i++) {
            if (i + (1 << (j - 1)) < n) {
                st[i][j] = min(st[i][j - 1], st[i + (1 << (j - 1))][j - 1]);
            }
        }
    }

    for (int i = 0; i <= n; i++) {
        logTable[i] = floor(log2(i));
    }
}

inline Element *rmq(const int l, const int r) {
    if (l == r) return &a[l];
    else {
        int t = logTable[r - l];
        return min(st[l][t], st[r - (1 << t)][t]);
    }
}

inline void prepare() {
    std::stack<Element *> s;
    s.push(&a[0]);

    for (int i = 1; i < n; i++) {
        while (!s.empty() && a[i] <= *s.top()) s.pop();
        if (!s.empty()) a[i].left = s.top();
        else a[i].left = NULL;
        s.push(&a[i]);
    }

    for (int i = 0; i < n; i++) {
        Element *x = &a[i];
        if (x->left == NULL) {
            x->sumLeft = 0;
        } else {
            x->sumLeft = x->left->sumLeft + (x - x->left) * static_cast<long long>(x->val);
        }
    }

    s.push(&a[n - 1]);
    for (int i = n - 2; i >= 0; i--) {
        while (!s.empty() && a[i] <= *s.top()) s.pop();
        if (!s.empty()) a[i].right = s.top();
        else a[i].right = NULL;
        s.push(&a[i]);
    }

    for (int i = n - 1; i >= 0; i--) {
        Element *x = &a[i];
        if (x->right == NULL) {
            x->sumRight = 0;
        } else {
            x->sumRight = x->right->sumRight + (x->right - x) * static_cast<long long>(x->val);
        }
    }

    sparseTable();
    std::sort(Q, Q + m);

    for (int i = 0; i < n; i++) {
        // printf("%lld %lld\n", a[i].sumLeft, a[i].sumRight);
        // printf("%d: sumLeft = %lld, sumRight = %lld, ", a[i].val, a[i].sumLeft, a[i].sumRight);
        // if (a[i].left == NULL) printf("left = NULL, ");
        // else printf("left = %ld[%d], ", a[i].left - a, a[i].left->val);
        // if (a[i].right == NULL) printf("right = NULL\n");
        // else printf("right = %ld[%d]\n", a[i].right - a, a[i].right->val);
    }
}

inline long long expandRight(const int l, const int r) {
    // printf("[%d, %d]\n", l, r);
    Element *pos = rmq(l, r);
    return (pos - &a[l] + 1) * static_cast<long long>(pos->val)
          + a[r].sumLeft - pos->sumLeft;
}

inline long long expandLeft(const int l, const int r) {
    // printf("[%d, %d]\n", l, r);
    Element *pos = rmq(l, r);
    return (&a[r] - pos + 1) * static_cast<long long>(pos->val)
          + a[l].sumRight - pos->sumRight;
}

inline void mo() {
    int l = 0, r = 0;
    long long ans = a[0].val;
    for (int i = 0; i < m; i++) {
        const Query &q = Q[i];
        // assert(l <= r);
        while (r < q.r) r++, ans += expandRight(l, r);
        while (l > q.l) l--, ans += expandLeft(l, r);
        while (r > q.r) ans -= expandRight(l, r), r--;
        while (l < q.l) ans -= expandLeft(l, r), l++;
        *q.ans = ans;
    }
}

int main() {
    scanf("%d %d", &n, &m);
    for (int i = 0; i < n; i++) scanf("%d", &a[i].val);
    for (int i = 0; i < m; i++) {
        scanf("%d %d", &Q[i].l, &Q[i].r);
        Q[i].l--, Q[i].r--;
        Q[i].ans = &ans[i];
    }

    prepare();
    mo();

    for (int i = 0; i < m; i++) printf("%lld\n", ans[i]);

    return 0;
}
```
