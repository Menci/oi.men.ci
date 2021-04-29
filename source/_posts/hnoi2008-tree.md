title: 「HNOI2008」明明的烦恼 - Prüfer 序列
categories:
  - OI
tags:
  - BZOJ
  - HNOI
  - Prüfer 序列
  - 数学
  - 高精度
permalink: hnoi2008-tree
date: '2016-10-11 18:51:00'
---

给出标号为 $ 1 $ 到 $ N $ 的点，以及某些点最终的度数，允许在任意两点间连线，求可产生多少棵度数满足要求的树。

<!-- more -->

### 链接

[BZOJ 1005](http://www.lydsy.com/JudgeOnline/problem.php?id=1005)

### 题解

此题用到一个东西叫「Prufer 序列」，虽然不懂是什么东西，但只需要一个结论：

> 对于一个 $ n $ 个节点的树，其 Prufer 序列的长度为 $ n - 2 $，且一个点的度数 $ -1 $ 等于它在 Prufer 序列中的出现次数。

设共有 $ k $ 个点被限制度，$ d_i $ 表示节点 $ i $ 的度，$ s = \sum\limits_{d_i \neq -1} d_i - 1 $。即被限制度的点共出现了 $ s $ 次。

考虑他们在 Prufer 序列中的出现位置，并乘上一个重复元素排列，即

$$ C(n - 2, s) \times \frac{s!}{\prod\limits_{i = 1} ^ k (d_i - 1) !} $$

继续考虑剩余的 $ n - k $ 个无度限制的点，剩余的 $ n - 2 - s $ 个位置可以任意放这些点，即

$$ C(n - 2, s) \times \frac{s!}{\prod\limits_{i = 1} ^ k (d_i - 1) !} \times (n - k) ^ {n - 2 - s} $$

整理，得

$$ \begin{aligned} &= \frac{(n - 2)!}{s!(n - 2 - s)!} \times \frac{s!}{\prod\limits_{i = 1} ^ k (d_i - 1) !} \times (n - k) ^ {n - 2 - s} \\ &= \frac{(n - 2)! (n - k) ^ {n - 2 - s}}{(n - 2 - s)! \prod\limits_{i = 1} ^ k (d_i - 1) !} \end{aligned} $$

### 代码

```python
import java.math.BigInteger;
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();

        int d[] = new int[n], s = 0, k = 0;
        boolean invalid = false;
        for (int i = 0; i < n; i++) {
            d[i] = sc.nextInt();
            if (d[i] != -1) {
                k++;
                if (d[i] <= 0 || d[i] >= n + 1) invalid = true;
                s += d[i] - 1;
            }
        }

        if (n == 1) {
            if (d[0] == 0 || d[0] == -1) System.out.println(1);
            else System.out.println(0);
        } else if (n == 2) {
            if ((d[0] == 1 || d[0] == -1) && (d[1] == 1 || d[1] == -1)) System.out.println(1);
            else System.out.println(0);
        } else if (invalid) {
            System.out.println(0);
        } else {
            BigInteger fac[] = new BigInteger[n - 1];
            fac[0] = BigInteger.ONE;
            for (int i = 1; i <= n - 2; i++) fac[i] = fac[i - 1].multiply(BigInteger.valueOf(i));

            BigInteger ans = BigInteger.ONE;
            ans = ans.multiply(fac[n - 2]).multiply(BigInteger.valueOf(n - k).pow(n - 2 - s)).divide(fac[n - 2 - s]);
            for (int i = 0; i < n; i++) if (d[i] > 1) ans = ans.divide(fac[d[i] - 1]);
            System.out.println(ans);
        }
    }
}
```