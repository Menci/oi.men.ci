title: 「NOIP 模拟赛」Azuki loves chess - 数论
categories:
  - OI
tags:
  - 数学
  - 数论
permalink: azuki-loves-chess
date: '2018-07-18 08:53:00'
---

在一个无穷大的中国象棋棋盘上，马每次可以在一个方向上移动一个单位，在另一个方向上移动两个单位。现将规则改为，马每次可以在一个方向上移动 $a$ 个单位，在另一个方向上移动 $b$ 个单位。问放置在 $(0,0)$ 的马能否移动到 $(n,m)$。

<!-- more -->

### 链接
[LYOI #406](https://ly.men.ci/problem/406)

### 题解
题意可转化为，判断以下关于 $x,y,z,w$ 的方程是否存在整数解：

$$x(a,b)+y(b,a)+z(-b,a)+w(-a,b)=(n,m)$$

将两维分开考虑，即

$$
\begin{aligned}
ax+by-bz-aw&=n \\
bx+ay+az+bw&=m
\end{aligned}
$$

两式相加得

$$
(a+b)x+(a+b)y+(a-b)z-(a-b)w=n+m
$$

整理这三个式子得到

$$
\begin{aligned}
a(x-w)+b(y-z)&=n \\
b(x+w)+a(y+z)&=m \\
(a+b)(x+y)+(a-b)(z-w)&=n+m
\end{aligned}
$$

**结论**：这三个二元一次不定方程同时有解，是本题答案为 Yes 的充要条件，即：

$$
\begin{cases}
\gcd(a,b)|n \\
\gcd(a,b)|m \\
\gcd(a+b,a-b)|n+m
\end{cases}
$$

必要性显然，下证充分性。

如果前两个方程有解，那么，通过它们的解构造出一组原方程一组可行解的方法是：

$$
\begin{cases}
x=\frac{(x+w)+(x-w)}{2} \\
y=\frac{(y+z)+(y-z)}{2} \\
z=\frac{(y+z)-(y-z)}{2} \\
w=\frac{(x+w)-(x-w)}{2}
\end{cases}
$$

所以，原题有解，等价于前两个方程有解，且对应位置的未知数值的奇偶性相同。即，对于以下两个方程，存在一组整数解，使得 $p_1$ 与 $p_2$ 奇偶性相同，$q_1$ 与 $q_2$ 奇偶性相同。

$$
\begin{aligned}
ap_1+bq_1&=n \\
bp_2+aq_2&=m
\end{aligned}
$$

我们可以将上式都除去 $\gcd(a,b)$，即

$$
\begin{aligned}
a'&=\frac{a}{\gcd(a,b)} \\
b'&=\frac{b}{\gcd(a,b)} \\
n'&=\frac{n}{\gcd(a,b)} \\
m'&=\frac{m}{\gcd(a,b)}
\end{aligned}
$$

上述方程化为

$$
\begin{aligned}
a'p_1+b'q_1&=n' \\
b'p_2+a'q_2&=m'
\end{aligned}
$$

下面证明，在第三个方程有解的前提条件下，从前两个方程的任意一组解，都可得到一组满足条件（对应未知数的值奇偶性相同）的解。

由于 $a',b'$ 互质，所以它们不可能都是偶数。

#### 当 $a',b'$ 一奇一偶时
根据一元二次不定方程 $a'x+b'y=c$ 的通解公式（$t$ 为任意整数）：

$$
\begin{aligned}
x_i=x_0+t\cdot b'\\
y_i=y_0-t\cdot a'
\end{aligned}
$$

调整 $t$ 的大小，可以在保持 $a',b'$ 中一个数的奇偶性不变的情况下，调整另一个数的奇偶性。

所以可以通过调整，使得

$$
\begin{aligned}
a'p_1+b'q_1&=n' \\
b'p_2+a'q_2&=m'
\end{aligned}
$$

中 $p_1$ 的奇偶性与 $p_2$ 相同，$q_2$ 的奇偶性与 $q_1$ 相同。

#### 当 $a',b'$ 均为奇数时
方程三 $(a'+b')(x+y)+(a'-b')(z-w)=n'+m'$ 有解的充要条件为 $\gcd(a'+b',a'-b')|n'+m'$。而 $\gcd(a'+b',a'-b')=\gcd(a'+b',a'+b'-(a'-b'))=\gcd(a'+b',2b')$ 一定是一个偶数（并且其值为 $2$，因为 $a',b'$ 互质），所以此时 $n'+m'$ 一定是偶数，所以 $n',m'$ 一定均为奇数或均为偶数。

如果 $n',m'$ 均为奇数，以方程一 $a'p_1+b'q_1=n'$ 为例，只有当 $a'p_1$ 和 $b'q_1$ 一奇一偶时，方程才有解，这时 $p_1,q_1$ 一定是一奇一偶。方程二同理。

如果 $n',m'$ 均为偶数，以方程一 $a'p_1+b'q_1=n'$ 为例，只有当 $a'p_1$ 和 $b'q_1$ 均为奇数时，方程才有解，这时 $p_1,q_1$ 一定均为奇数。方程二同理。

Q.E.D.

### 代码
```c++
#include <cstdio>
#include <algorithm>

int main() {
	freopen("chess.in", "r", stdin);
	freopen("chess.out", "w", stdout);
	int T;
	scanf("%d", &T);
	while (T--) {
		long long a, b, n, m;
		scanf("%lld %lld %lld %lld", &a, &b, &n, &m);
		puts((n % std::__gcd(a, b) == 0 && m % std::__gcd(a, b) == 0 && (n + m) % std::__gcd(a + b, a - b) == 0) ? "Yes" : "No");
	}
}
```
