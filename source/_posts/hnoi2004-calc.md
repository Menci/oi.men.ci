title: 「HNOI2004」高精度开根 - 高精度 + 二分
categories: OI
tags: 
  - BZOJ
  - HNOI
  - 高精度
  - 二分
permalink: hnoi2004-calc
date: 2017-02-28 21:48:20
---

给 $ m $ 和一个高精度数 $ n $，求 $ \lfloor \sqrt[m]n \rfloor $。

<!-- more -->

### 链接
[BZOJ 1213](http://www.lydsy.com/JudgeOnline/problem.php?id=1213)

### 题解
首先，从 $ 1 $ 开始每次扩大一倍，确定答案的范围。

然后二分答案检验即可。

高精度用 Python 比较方便。

### 代码
```python
m = input()
n = input()
l = 0
r = 1
while r ** m < n:
    r *= 2

while l < r:
    # print "l = %d, r = %d" % (l, r)
    mid = (l + r) // 2 + 1
    x = mid ** m
    if x <= n:
        l = mid
    else:
        r = mid - 1
print l
```
