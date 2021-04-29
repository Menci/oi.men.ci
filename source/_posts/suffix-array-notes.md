title: 后缀数组学习笔记
categories:
  - OI
tags:
  - 后缀数组
  - 字符串
  - 学习笔记
  - 稀疏表
  - 算法模板
permalink: suffix-array-notes
date: '2016-04-12 19:29:14'
---

在 OI 竞赛中，有一类题目是面向字符串的。这类题目往往要求选手的程序快速地求出给定的字符串的某些信息，这就需要一些对应的数据结构和算法来维护字符串。后缀数组就是一个这样的数据结构 —— 它通过对字符串后缀的处理，可以方便地得到子串的信息。

<!-- more -->

### 定义

字符串 $ s $ 连续的一段字符组成的串叫做字符串，更广义地，任何一个由可比较大小的元素组成的数组都可称为字符串。字符串的下标从 $ 0 $ 开始，长度为 $ {\rm length}(s) $。

后缀：$ {\rm suffix}(i) $ 表示字符串 $ s $ 从第 $ i $ 个位置开始的后缀，即由 $ s[i] $ ~ $ s[n - 1] $ 组成的子串。

字符串的比较：
两个字符串大小的比较，从首位开始，一位一位地按照 ASCII 码比较，如果从某位置开始不相同，则认为该位置处字符 ASCII 码小的字符串小；
如果一个字符串比较完了最后一位，而另一个没有，则认为前者（长度小的）小；
如果两个字符串长度相同并且所有位置上的字符均相同，则认为两个字符串相等。

注意，同一个字符串的两个后缀是不可能相等的，因为无法满足相等的必要条件**长度相同**。

后缀数组：$ {\rm SA}[] $ 是一个一维数组，保存了对字符串 $ s $ 的所有后缀排序后的结果。$ {\rm SA}[i] $ 表示第 $ i $ 小的后缀在原串中的起始位置。

名次数组：$ {\rm rank}[] $ 是一个一维数组，按起始位置保存了每个后缀在 $ {\rm SA}[] $ 中的排名。$ {\rm rank}[i] $ 表示 $ {\rm suffix}(i) $ 的排名，即 $ {\rm rank}[{\rm SA}[i]] = i $（第 $ i $ 小的后缀的排名为 $ i $）。

高度数组：$ {\rm height}[] $ 是一个一维数组，保存了相邻两个后缀的最长公共前缀（Longest Common Prefix，LCP）长度。

$$ {\rm height}[i] = \begin{cases} 0 & i = 0 \\ {\rm LCP}({\rm suffix}({\rm SA}[i]), {\rm suffix}({\rm SA}[i - 1])) & i > 0 \\ \end{cases} $$

即 $ {\rm height}[i] $ 表示存在的最大的 $ x $，满足对于任何 $ k \in [0, x) $ 有 $ s[{\rm SA}[i] + k] = s[{\rm SA}[i - 1] + k] $。

### 后缀数组与名次数组的构造

#### 朴素构造算法

如果我们直观地通过定义来构造后缀数组与名次数组（即将每个后缀看做独立的字符串进行快速排序），时间复杂度为 $ O(n ^ 2 \log n) $，但平方级别的复杂度通常是无法承受的。

上述构造方法的瓶颈在于**字符串的比较**，原串的每个后缀的长度是 $ O(n) $ 级别的，最坏情况下需要 $ O(n) $ 次比较操作才能得到两个后缀的大小关系。

##### 基于 Hash 的优化

考虑对字符串进行 Hash。使用 BKDRHash 算法 $ O(n) $ 地预处理整个字符串后，可以 $ O(1) $ 地得到任意子串的 Hash 值，比较两个子串是否相等。

这样，我们就得到了一个改进算法：比较两个后缀时，二分它们的 LCP 长度，并比较第一位不同的字符，总时间复杂度为 $ O(n \log n \log n) $。

使用 Hash 来构造后缀数组的好处在于时间复杂度较低，并且可以动态维护（使用 `std::set`），坏处在于 Hash 的不稳定性。

#### 倍增算法

上述两个算法，我们都是将两个后缀看做独立字符串进行比较，而忽视了后缀之间的内在联系。一个更优的算法是**倍增算法**，它的主要思路是，每次利用上一次的结果，倍增计算出从每个位置 $ i $ 开始长度为 $ 2 ^ k $ 的子串的排名。

算法的开始，我们有 `"heheda"`，从每个位置开始，长度为 $ 2 ^ 0 = 1 $ 的子串的排名分别为：

| $ s[i] $ | h | e | h | e | d | a |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| $ {\rm rank}[i] $ | 3 | 2 | 3 | 2 | 1 | 0 |

为了求出长度为 $ 2 ^ 1 = 2 $ 的子串的排名，我们以每个位置 $ i $ 开始，长度为 $ 2 ^ 0 = 1 $ 的子串的排名作为位置 $ i $ 的**第一关键字**，以每个位置 $ i + 2 ^ 0 = i + 1 $ 开始，长度为 $ 2 ^ 0 = 1 $ 的子串的排名作为位置 $ i $ 的**第二关键字**，进行双关键字排序。

对于 $ i + 2 ^ 0 \geq n $ 的位置，我们用一个比其他所有值都小的数作为它的第二关键字，即 $ -1 $。

| $ s[i] $ | h | e | h | e | d | a |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| $ {\rm first}[i] $ | 3 | 2 | 3 | 2 | 1 | 0 |
| $ {\rm second}[i] $ | 2 | 3 | 2 | 1 | 0 | -1 |
| $ {\rm rank}[i] $ | 4 | 3 | 4 | 2 | 1 | 0 |

重复以上过程，求出长度为 $ 2 ^ 2 = 4 $ 的子串的排名：

| $ s[i] $ | h | e | h | e | d | a |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| $ {\rm first}[i] $ | 4 | 3 | 4 | 2 | 1 | 0 |
| $ {\rm second}[i] $ | 4 | 2 | 1 | 0 | -1 | -1 |
| $ {\rm rank}[i] $ | 5 | 3 | 4 | 2 | 1 | 0 |

可以看出，这时候 $ {\rm rank}[] $ 数组的最终值已被求出。而对于任何一组数据，显然可以在最坏情况下 $ O(\log n) $ 轮上述过程后，求出 $ {\rm rank}[] $ 数组的最终值。

如果使用快速排序来实现双关键字排序，总时间复杂度为 $ O(n \log n \log n) $，实现难度比 Hash 的方法要低，并且更稳定。而考虑到每个关键字均为 $ [-1, n) $ 的整数，我们可以使用 $ O(n) $ 的基数排序，来将总时间复杂度将为 $ O(n \log n) $。

##### 代码

首先，将原数据进行离散化，保证每个元素的值在 $ [0, n) $ 内。

```cpp
static int set[MAXN + 1], a[MAXN + 1];
std::copy(s + 1, s + n + 1, set + 1);
std::sort(set + 1, set + n + 1);
int *end = std::unique(set + 1, set + n + 1);
for (int i = 1; i <= n; i++) a[i] = std::lower_bound(set + 1, end, s[i]) - set;
```

`fir` 和 `sec` 分别表示第一关键字和第二关键字，`buc` 表示基数排序所用的桶。关键字的取值范围为 $ [0, n] $。

```cpp
static int fir[MAXN + 1], sec[MAXN + 1], tmp[MAXN + 1], buc[MAXN + 1];
```

对每个单独的字符进行排序，得到它们的排名。

```cpp
for (int i = 1; i <= n; i++) buc[a[i]]++;
for (int i = 1; i <= n; i++) buc[i] += buc[i - 1];
for (int i = 1; i <= n; i++) rk[i] = buc[a[i] - 1] + 1;
```

进行 $ O(\log n) $ 次迭代（下文代码均为循环内操作）。

```cpp
for (int t = 1; t <= n; t *= 2)
```

设置每个位置的第一、第二关键字。

```cpp
for (int i = 1; i <= n; i++) fir[i] = rk[i];
for (int i = 1; i <= n; i++) sec[i] = i + t > n ? 0 : rk[i + t];
```

对第二关键字进行排序，$ {\rm tmp}[i] $ 存储第 $ i $ **大**的第二关键字的所在位置。

注意 `--buc[sec[i]]` 得到的是一个 $ [0, n) $ 的值，$ n $ 减去它可以得到一个 $ [1, n] $ 的值。

```cpp
std::fill(buc, buc + n + 1, 0);
for (int i = 1; i <= n; i++) buc[sec[i]]++;
for (int i = 1; i <= n; i++) buc[i] += buc[i - 1];
for (int i = 1; i <= n; i++) tmp[n - --buc[sec[i]]] = i;
```

对第一关键字进行排序，按照 $ {\rm tmp}[] $ 中的顺序依次领取排名，在 $ {\rm tmp}[] $ 中靠前的位置将较早领取排名，而较早领取到的排名较大。

注意 `buc[fir[i]]--` 是一个 $ [1, n] $ 的值。

```cpp
std::fill(buc, buc + n + 1, 0);
for (int i = 1; i <= n; i++) buc[fir[i]]++;
for (int i = 1; i <= n; i++) buc[i] += buc[i - 1];
for (int j = 1, i; j <= n; j++) i = tmp[j], sa[buc[fir[i]]--] = i;
```

按照后缀数组 $ {\rm SA}[] $ 中的顺序求出名次数组 $ {\rm rank}[] $，因为中间过程中排名会有并列，所以要分情况讨论：

1. 没有前一名，当前位置的排名为 $ 1 $；
2. 当前位置和前一名位置的第一、第二关键字均相等，当前位置的排名与前一位置的排名相等；
3. 当前位置和前一名位置的第一或第二关键字不相等，当前位置的排名为前一位置的排名 $ + 1 $；

如果没有并列排名，说明已经排好序，可以提前跳出。

```cpp
bool unique = true;
for (int j = 1, i, last = 0; j <= n; j++)
{
    i = sa[j];
    if (!last) rk[i] = 1;
    else if (fir[i] == fir[last] && sec[i] == sec[last]) rk[i] = rk[last], unique = false;
    else rk[i] = rk[last] + 1;

    last = i;
}

if (unique) break;
```

由于倍增算法时间复杂度较为优秀，并且实现难度不高，在实践中较为常用。另外，后缀数组也有线性的构造方法，例如 DC3，但其实现难度较高，实际应用不如倍增算法广。

### 高度数组的计算

后缀数组的大部分应用，都需要高度数组 $ {\rm height}[] $ 的辅助，如果我们按照定义去计算 $ {\rm height}[] $，最坏的时间复杂度为 $ O(n ^ 2) $。平方级别的复杂度仍然是无法承受的。

#### 性质

定义 $ h(i) $ 表示从第 $ i $ 个位置开始的后缀与排在其前一名的后缀的最长公共前缀，即当 $ {\rm rank}[i] > 0 $ 时，有

$$ \begin{align} h(i) &= {\rm LCP}({\rm suffix}(i), {\rm suffix}({\rm SA}[{\rm rank}[i] - 1])) \\ &= {\rm height}[{\rm rank}[i]] \\ \end{align} $$

对于 $ h(i) $，有一个结论

$$ h(i) \geq h(i - 1) - 1 $$

当 $ h(i - 1) < 1 $ 时，结论显然是成立的，下面我们主要考虑 $ h(i - 1) \geq 1 $ 的情况。

令 $ u = {\rm suffix}(i) $，$ v = {\rm suffix}({\rm SA}[{\rm rank}[i] - 1]) $，即排在第 $ i $ 个位置的后缀和排在它前面一位的后缀；
令 $ u' = {\rm suffix}(i - 1) $，$ v' = {\rm suffix}({\rm SA}[{\rm rank}[i - 1] - 1]) $，即排在第 $ i - 1 $ 个位置的后缀和排在它前面一位的后缀。

我们需要证明 $ {\rm LCP}(u, v) \geq {\rm LCP}(u', v') - 1 $。

现在换一个字符串 `"heheheda"` 作为例子，关系对应如下：

| $ i $ | $ u $ | $ v $ | $ {\rm LCP}(u, v) $ |
|:---:|:---:|:---:|:---:|
| 1 | heheheda | heheda | 4 |
| 2 | eheheda | eheda | 3 |
| 3 | heheda | heda | 2 |
| 4 | eheda | eda | 1 |
| 5 | heda | eheheda | 0 |
| 6 | eda | da | 0 |
| 7 | da | a | 0 |
| 8 | a | - | - |

当 $ h(i - 1) \geq 1 $ 时，$ u' $ 与 $ v' $ 的第一个字符必定相等，同时去掉其第一个字符后，所得的两个新的后缀的最长公共前缀长度为 $ {\rm LCP}(u', v') - 1 $。这两个后缀不一定是 $ u $ 和 $ v $（如果它们排名 不相邻的话），但在后缀数组中，这两个后缀一定确定了一个包含 $ u $ 和 $ v $ 的区间（考虑位置靠前或靠后的后缀的影响），所以，结合下文中关于最长公共前缀的部分内容，$ {\rm LCP}(u, v) $ 一定不会比它更小。

#### 代码

有了这一性质，我们可以按照 $ {\rm height}[{\rm SA}[i]] $ 的顺序递推。
设 $ k = {\rm height}[{\rm rank}[i - 1]] $（即上文的 $ h(i - 1) $），显然在计算每个 $ {\rm height}[{\rm rank}[i]] $ 时，$ k $ 每次减小 $ 1 $，最多增加到 $ n $，所以这个过程的时间复杂度为 $ O(n) $。
相对于前面 $ O(n \log n) $ 的过程，线性的复杂度已经不会成为瓶颈。

```cpp
for (int i = 1, k = 0; i <= n; i++)
{
    if (rk[i] == 1) k = 0;
    else
    {
        if (k > 0) k--;
        int j = sa[rk[i] - 1];
        while (i + k <= n && j + k <= n && a[i + k] == a[j + k]) k++;
    }
    ht[rk[i]] = k;
}
```

值得注意的是，$ {\rm height}[0] $ 的值是无效的，因为排名最靠前的后缀没有前一名。

### 最长公共前缀

通过高度数组 $ {\rm height}[] $，我们可以得到排名相邻的两个后缀的最长公共前缀。

对于排名不相邻的两个后缀，它们的前缀的相似性比相邻后缀要差。显然排名不相邻的两个后缀的最长公共前缀长度**一定不会**比这两个后缀在后缀数组中确定的一段**区间中任意两个**相邻后缀的最长公共前缀长度**更长**。

所以，求出这段区间内最小的 $ {\rm height} $ 值即为这两个不相邻后缀的最长公共前缀长度。

问题转化为区间最值查询（Range Minimum/Maximum Query，RMQ）问题，可以使用稀疏表（Sparse Table，ST）算法解决。该算法在 $ O(n \log n) $ 的时间内预处理，并在 $ O(1) $ 的时间内完成每个询问。

### 模板

```cpp
inline void suffixArray()
{
    static int set[MAXN + 1], a[MAXN + 1];
    std::copy(s + 1, s + n + 1, set + 1);
    std::sort(set + 1, set + n + 1);
    int *end = std::unique(set + 1, set + n + 1);
    for (int i = 1; i <= n; i++) a[i] = std::lower_bound(set + 1, end, s[i]) - set;

    static int fir[MAXN + 1], sec[MAXN + 1], tmp[MAXN + 1], buc[MAXN + 1];
    for (int i = 1; i <= n; i++) buc[a[i]]++;
    for (int i = 1; i <= n; i++) buc[i] += buc[i - 1];
    for (int i = 1; i <= n; i++) rk[i] = buc[a[i] - 1] + 1;

    for (int t = 1; t <= n; t *= 2)
    {
        for (int i = 1; i <= n; i++) fir[i] = rk[i];
        for (int i = 1; i <= n; i++) sec[i] = i + t > n ? 0 : rk[i + t];

        std::fill(buc, buc + n + 1, 0);
        for (int i = 1; i <= n; i++) buc[sec[i]]++;
        for (int i = 1; i <= n; i++) buc[i] += buc[i - 1];
        for (int i = 1; i <= n; i++) tmp[n - --buc[sec[i]]] = i;

        std::fill(buc, buc + n + 1, 0);
        for (int i = 1; i <= n; i++) buc[fir[i]]++;
        for (int i = 1; i <= n; i++) buc[i] += buc[i - 1];
        for (int j = 1, i; j <= n; j++) i = tmp[j], sa[buc[fir[i]]--] = i;

        bool unique = true;
        for (int j = 1, i, last = 0; j <= n; j++)
        {
            i = sa[j];
            if (!last) rk[i] = 1;
            else if (fir[i] == fir[last] && sec[i] == sec[last]) rk[i] = rk[last], unique = false;
            else rk[i] = rk[last] + 1;

            last = i;
        }

        if (unique) break;
    }

    for (int i = 1, k = 0; i <= n; i++)
    {
        if (rk[i] == 1) k = 0;
        else
        {
            if (k > 0) k--;
            int j = sa[rk[i] - 1];
            while (i + k <= n && j + k <= n && a[i + k] == a[j + k]) k++;
        }
        ht[rk[i]] = k;
    }
}
```
