title: 「NOI2015」品酒大会 - 后缀数组 + 并查集
categories:
  - OI
tags:
  - BZOJ
  - NOI
  - 后缀数组
  - 字符串
  - 并查集
permalink: noi2015-savour
date: '2016-06-26 18:14:00'
---

给定字符串 $ S $ 和序列 $ f(i) $，对于 $ r \in [0,\ n - 1] $，求：

1. 满足 $ \mathrm {LCP}(\mathrm{suffix}(i),\ \mathrm{suffix}(j)) \geq r $ 的无序二元组 $ (i,\ j) $ 数量；
2. 上述二元组 $ (i, j) $ 使 $ f(i) \times f(j) $ 取得的最大值。

<!-- more -->

### 链接

[BZOJ 4199](http://www.lydsy.com/JudgeOnline/problem.php?id=4199)  
[UOJ #130](http://uoj.ac/problem/130)

### 题解

使用后缀数组求出排名相邻后缀的 LCP，打出表，可以发现如果连续的一段后缀的相邻 LCP 长度都 $ \geq r $，那么这其中任意两个后缀都是**第一问**的一组解。进而得出，一个大小为 $ x $ 的块对答案的贡献为 $ \frac{x (x + 1)}{2} $。

对于第二问，每个块内两个 $ f(i) $ 值最大（或最小，因为有负数）的对应 $ f(i) $ 值乘积对答案有贡献。

使用带权并查集维护每个块的大小、最大值、次大值、最小值、次小值。

考虑到 $ r $ 较大时答案较小，且 $ r $ 减小时答案可累加。从大到小枚举 $ \mathrm{height}(i) $，每次判断当前后缀可否和前一个或后一个后缀所在块合并（可以合并的条件是对应的后缀的 $ \mathrm{height} $ 值大于等于当前后缀），并统计答案。注意，**连续两次被前后合并同一个块可能导致答案被统计多次**。

两问都需要 `long long`。

### 代码

```cpp
#include <cstdio>
#include <climits>
#include <cassert>
#include <vector>
#include <stack>
#include <utility>
#include <algorithm>
#include <functional>

const int MAXN = 300000;

char s[MAXN + 1];
int a[MAXN], A[MAXN], n, rk[MAXN], sa[MAXN], ht[MAXN];

inline void suffixArray() {
    static int set[MAXN], a[MAXN];
    for (int i = 0; i < n; i++) set[i] = s[i];
    std::sort(set, set + n);
    int *end = std::unique(set, set + n);
    for (int i = 0; i < n; i++) a[i] = std::lower_bound(set, end, s[i]) - set;

    static int fir[MAXN], sec[MAXN], tmp[MAXN], _buc[MAXN + 1], *buc = _buc + 1;
    for (int i = 0; i < n; i++) buc[a[i]]++;
    for (int i = 0; i < n; i++) buc[i] += buc[i - 1];
    for (int i = 0; i < n; i++) rk[i] = buc[a[i] - 1];

    for (int t = 1; t < n; t *= 2) {
        for (int i = 0; i < n; i++) fir[i] = rk[i];
        for (int i = 0; i < n; i++) sec[i] = i + t >= n ? -1 : fir[i + t];

        std::fill(buc - 1, buc + n, 0);
        for (int i = 0; i < n; i++) buc[sec[i]]++;
        for (int i = 0; i < n; i++) buc[i] += buc[i - 1];
        for (int i = 0; i < n; i++) tmp[n - buc[sec[i]]--] = i;

        std::fill(buc - 1, buc + n, 0);
        for (int i = 0; i < n; i++) buc[fir[i]]++;
        for (int i = 0; i < n; i++) buc[i] += buc[i - 1];
        for (int j = 0, i; j < n; j++) i = tmp[j], sa[--buc[fir[i]]] = i;

        for (int j = 0, i, last = -1; j < n; j++) {
            i = sa[j];
            if (last == -1) rk[i] = 0;
            else if (fir[i] == fir[last] && sec[i] == sec[last]) rk[i] = rk[last];
            else rk[i] = rk[last] + 1;
            last = i;
        }
    }

    for (int i = 0, k = 0; i < n; i++) {
        if (rk[i] == 0) k = 0;
        else {
            if (k > 0) k--;
            int j = sa[rk[i] - 1];
            while (i + k < n && j + k < n && a[i + k] == a[j + k]) k++;
        }
        ht[rk[i]] = k;
    }

    // for (int i = 0; i < n; i++) printf("%d%c", ht[i], i == n - 1 ? '\n' : ' ');

#ifdef DBG
    for (int i = 0; i < n; i++) printf("%3d %2d %s\n", ::a[sa[i]], ht[i], &s[sa[i]]);
    puts("----------------");
#endif
}

struct UnionFindSet {
    int f[MAXN], size[MAXN];
    int max[MAXN], max2[MAXN], min[MAXN], min2[MAXN];
#ifdef DBG
    bool invalid[MAXN];
    int top[MAXN], bottom[MAXN];
#endif

    void init() {
        for (int i = 1; i < n; i++) {
            i[f] = i;
            i[size] = 1;
            if (A[i] > A[i - 1]) i[max] = i[min2] = i, i[min] = i[max2] = i - 1;
            else i[max] = i[min2] = i - 1, i[min] = i[max2] = i;
#ifdef DBG
            i[top] = i[bottom] = i;
            i[invalid] = false;
#endif
        }
    }

    template <typename T>
    void updateMinMax(int &m, int &m2, const int x, T compare) {
        if (compare(A[x], A[m])) m2 = m, m = x;
        else if (x != m && compare(A[x], A[m2])) m2 = x;
    }

    void addTo(const int a, const int b) {
#ifdef DBG
        a[invalid] = true;
        b[top] = std::min(b[top], a[top]);
        b[bottom] = std::max(b[bottom], a[bottom]);
#endif
        b[size] = a[size] + b[size];
        a[size] = 0;

        updateMinMax(b[max], b[max2], a[max], std::greater<int>());
        updateMinMax(b[max], b[max2], a[max2], std::greater<int>());
        updateMinMax(b[max], b[max2], a[min], std::greater<int>());
        updateMinMax(b[max], b[max2], a[min2], std::greater<int>());

        updateMinMax(b[min], b[min2], a[min], std::less<int>());
        updateMinMax(b[min], b[min2], a[min2], std::less<int>());
        updateMinMax(b[min], b[min2], a[max], std::less<int>());
        updateMinMax(b[min], b[min2], a[max2], std::less<int>());
    }

    int find(const int x, int *size = NULL, int *max = NULL, int *max2 = NULL, int *min = NULL, int *min2 = NULL) {
        int res = x;
        while (res[f] != res) res = res[f];
        for (int i = x, tmp; i != res; ) {
            tmp = i[f];
            addTo(i, res);
            i[f] = res;
            i = tmp;
        }

        if (size) *size = this->size[res];
        if (max) *max = A[this->max[res]];
        if (max2) *max2 = A[this->max2[res]];
        if (min) *min = A[this->min[res]];
        if (min2) *min2 = A[this->min2[res]];

        return res;
    }

    bool test(const int a, const int b) {
        return find(a) == find(b);
    }

    void merge(const int a, const int b) {
        // printf("merge(%d, %d)\n", a, b);
        int x = find(a), y = find(b);
        // printf("-- merge(%d, %d)\n", x, y);
        assert(x != y);
        addTo(x, y);
        x[f] = y;
    }

#ifdef DBG
    void print() {
        for (int i = 1; i < n; i++) find(i);
        for (int i = 1; i < n; i++) {
            if (invalid[i]) continue;
            printf("[%d]: ", i);
            if (f[i] == i) printf("root, ");
            else printf("f = %d, ", f[i]);

            printf("[%d, %d], size = %d, max = [%d] -> %d, max2 = [%d] -> %d, min = [%d] -> %d, min2 = [%d] -> %d\n", top[i], bottom[i], size[i], max[i], max[i][sa][::a], max2[i], max2[i][sa][::a], min[i], min[i][sa][::a], min2[i], min2[i][sa][::a]);
        }
    }
#endif
} ufs;

inline long long calcCnt(const int x) {
    int size;
    ufs.find(x, &size);
    long long cnt = static_cast<long long>(size) * (size + 1) / 2;
    // printf("cnt(%d) = %d\n", x, cnt);
    return cnt;
}

inline long long calcMax(const int x) {
    int max, max2, min, min2;
    ufs.find(x, NULL, &max, &max2, &min, &min2);
    return std::max(static_cast<long long>(max) * max2, static_cast<long long>(min) * min2);
}

int main() {
    scanf("%d\n%s", &n, s);
    for (int i = 0; i < n; i++) scanf("%d", &a[i]);

    suffixArray();

    for (int i = 0; i < n; i++) A[i] = a[sa[i]];

    ufs.init();

    std::vector<int> v[MAXN];
    for (int i = 1; i < n; i++) v[ht[i]].push_back(i);

    long long cnt = 0, max = LLONG_MIN;
    std::stack< std::pair<long long, long long> > stack;
    for (int i = n - 1; i >= 0; i--) {
        for (std::vector<int>::const_iterator it = v[i].begin(); it != v[i].end(); it++) {
            // printf("ht[%d] = %d\n", *it, ht[*it]);

            if (!(it != v[i].end() - 1 && ufs.test(*(it + 1), *it + 1))) {
                if (*it != n - 1) {
                    if (ht[*it + 1] >= ht[*it] && !ufs.test(*it + 1, *it)) {
                        // puts("------- + 1");
                        cnt -= calcCnt(*it + 1);
                        ufs.merge(*it, *it + 1);
                    }
                }
            }

            if (*it != 1 && ht[*it - 1] >= ht[*it] && !ufs.test(*it - 1, *it)) {
                // puts("------- - 1");
                cnt -= calcCnt(*it - 1);
                ufs.merge(*it, *it - 1);
            }

            // puts("+++++++");
            cnt += calcCnt(*it);
            max = std::max(max, calcMax(*it));
#ifdef DBG
            printf("calcMax(%d) = %lld\n", *it, calcMax(*it));
#endif
        }

#ifdef DBG
        printf("%lld %lld\n", cnt, max == LLONG_MIN ? 0 : max);
        if (cnt != 0) ufs.print();
#else
        stack.push(std::make_pair(cnt, max == LLONG_MIN ? 0 : max));
#endif
    }

#ifndef DBG
    while (!stack.empty()) {
        printf("%lld %lld\n", stack.top().first, stack.top().second);
        stack.pop();
    }
#endif

    return 0;
}
```