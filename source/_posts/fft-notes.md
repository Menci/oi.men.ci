title: FFT 学习笔记
categories: OI
tags: 
  - FFT
  - 数学
  - 学习笔记
  - 算法模板
  - 多项式
permalink: fft-notes
date: 2016-06-03 19:41:00
---

快速傅里叶变换（Fast Fourier Transform，FFT）是一种可在 $ O(n \log n) $ 时间内完成的离散傅里叶变换（Discrete Fourier transform，DFT）算法，在 OI 中的主要应用之一是加速多项式乘法的计算。

<!-- more -->

### 定义
#### 多项式
##### 系数表示与点值表示
多项式的系数表示，设 $ A(x) $ 表示一个 $ n - 1 $ 次多项式，所有项的系数组成的 $ n $ 维向量 $ ( a_0,\ a_1,\ a_2,\ \dots,\ a_{n - 1} ) $ 唯一确定了这个多项式。

$$
\begin{align*}
A(x) &= \sum\limits_{i = 0} ^ {n - 1} a_i x ^ i \\
&= a_0 + a_1 x + a_2 x ^ 2 + \dots + a_{n - 1} x ^ {n - 1}
\end{align*}
$$

多项式的点值表示，将一组**互不相同**的 $ n $ 个 $ x $ 带入多项式，得到的 $ n $ 个值。设它们组成的 $ n $ 维向量分别为 $ ( x_0,\ x_1,\ x_2,\ \dots,\ x_{n - 1} ) $、$ ( y_0,\ y_1,\ y_2,\ \dots,\ y_{n - 1} ) $。

$$
\begin{align*}
y_i &= A(x_i) \\
&= \sum\limits_{j = 0} ^ {n - 1} a_j x_i ^ j
\end{align*}
$$

##### 求值与插值
> 定理：一个 $ n - 1 $ 次多项式在 $ n $ 个不同点的取值唯一确定了该多项式。

证明：假设命题不成立，存在两个不同的 $ n - 1 $ 次多项式 $ A(x) $、$ B(x) $，满足对于任何 $ i \in [0,\ n - 1] $，有 $ A(x_i) = B(x_i) $。

令 $ C(x) = A(x) - B(x) $，则 $ C(x) $ 也是一个 $ n - 1 $ 次多项式。对于任何 $ i \in [0,\ n - 1] $，有 $ C(x_i) = 0 $。

即 $ C(x) $ 有 $ n $ 个根，这与代数基本定理（一个 $ n - 1 $ 次多项式在复数域上有且仅有 $ n - 1 $ 个根）相矛盾，故 $ C(x) $ 并不是一个 $ n - 1 $ 次多项式，原命题成立，证毕。

如果我们按照定义求一个多项式的点值表示，时间复杂度为 $ O(n ^ 2) $。

已知多项式的点值表示，求其系数表示，可以使用**插值**。朴素的插值算法时间复杂度为 $ O(n ^ 2) $。

##### 多项式乘法
我们定义两个多项式 $ A(x) = \sum\limits_{i = 0} ^ {n - 1} a_i x ^ i $ 与 $ B(x) = \sum\limits_{i = 0} ^ {n - 1} b_i x ^ i $ 相乘的结果为 $ C(x) $（假设两个多项式次数相同，若不同可在后面补零）。

$$ C(x) = A(x) \times B(x) = \sum\limits_{k = 0} ^ {2n - 2} (\sum\limits_{k = i + j} a_i b_j) x ^ k $$

两个 $ n - 1 $ 次多项式相乘，得到的是一个 $ 2n - 2 $ 次多项式，时间复杂度为 $ O(n ^ 2) $。

如果使用两个多项式在 $ 2n - 1 $ 个点处取得的点值表示，那么

$$ {y_3}_i = (\sum\limits_{j = 0} ^ {2n - 1} a_j x_i ^ j) \times (\sum\limits_{j = 0} ^ {2n - 1} b_j x_i ^ j) = {y_1}_i \times {y_2}_i $$

时间复杂度为 $ O(n) $。

#### 复数
设 $ a $、$ b $ 为实数，$ i ^ 2 = -1 $，形如 $ a + bi $ 的数叫做**复数**，其中 $ i $ 被称为**虚数单位**。复数域是已知最大的域。

##### 复平面
在复平面中，$ x $ 轴代表实数、$ y $ 轴（除原点外的所有点）代表虚数。每一个复数 $ a + bi $ 对应复平面上一个从 $ (0,\ 0) $ 指向 $ (a,\ b) $ 的向量。

该向量的长度 $ \sqrt {a ^ 2 + b ^ 2} $ 叫做模长。表示从 $ x $ 轴正半轴到该向量的转角的有向（以逆时针为正方向）角叫做幅角。

复数相加遵循平行四边形定则。

复数相乘时，模长相乘，幅角相加。

### 单位根
下文中，如不特殊指明，均设 $ n $ 为 $ 2 $ 的正整数次幂。

在复平面上，以原点为圆心，$ 1 $ 为半径作圆，所得的圆叫做单位圆。以原点为起点，单位圆的 $ n $ 等分点为终点，作 $ n $ 个向量。设所得的**幅角为正且最小**的向量对应的复数为 $ \omega_n $，称为 $ n $ 次单位根。

由复数乘法的定义（模长相乘，幅角相加）可知，其与的 $ n - 1 $ 个向量对应的复数分别为 $ \omega_n ^ 2,\ \omega_n ^ 3,\ \dots,\ \omega_n ^ n $，其中 $ \omega_n ^ n = \omega_n ^ 0 = 1 $。

单位根的幅角为周角的 $ 1 \over n $，这为我们提供了一个计算单位根及其幂的公式

$$ \omega_n ^ k = \cos k \frac{2 \pi}{n} + i\sin k \frac{2 \pi}{n} $$

#### 单位根的性质

> 性质一：$ \omega_{2n} ^ {2k} = \omega_n ^ k $

从几何意义上看，在复平面上，二者表示的向量终点相同。

更具体的，有

$$ \cos 2k \frac{2 \pi}{2n} + i\sin 2k \frac{2 \pi}{2n} = \cos k \frac{2 \pi}{n} + i\sin k \frac{2 \pi}{n} $$

> 性质二：$ \omega_n ^ { k + \frac{n}{2} } = -\omega_n ^ k $

等式左边相当于 $ \omega_n ^ k $ 乘上 $ \omega_n ^ { \frac{n}{2} } $，考虑其值

$$
\begin{align*}
\omega_n ^ { \frac{n}{2} } &= \cos \frac{n}{2} \cdot \frac{2 \pi}{n} + i\sin \frac{n}{2} \cdot \frac{2 \pi}{n} \\
&= \cos \pi + i\sin \pi \\
&= -1
\end{align*}
$$

### 快速傅里叶变换
考虑多项式 $ A(x) $ 的表示。将 $ n $ 次单位根的 $ 0 $ 到 $ n - 1 $ 次幂带入多项式的系数表示，所得点值向量 $ (A(\omega_n ^ 0),\ A(\omega_n ^ 1),\ \dots,\ A(\omega_n ^ {n - 1})) $ 称为其系数向量 $ (a_0,\ a_1,\ \dots,\ a_{n - 1}) $ 的**离散傅里叶变换**。

按照朴素算法来求离散傅里叶变换，时间复杂度仍然为 $ O(n ^ 2) $。

考虑将多项式按照系数下标的奇偶分为两部分

$$ A(x) = (a_0 + a_2 x ^ 2 + a_4 x ^ 4 + \dots + a_{n - 2} x ^ {n - 2}) + (a_1 x + a_3 x ^ 3 + a_5 x ^ 5 + \dots + a_{n - 1} x ^ {n - 1}) $$

令

$$
\begin{align*}
A_1(x) &= a_0 + a_2 x + a_4 x ^ 2 + \dots + a_{n - 2} x ^ {\frac{n}{2} - 1} \\
A_2(x) &= a_1 + a_3 x + a_5 x ^ 2 + \dots + a_{n - 1} x ^ {\frac{n}{2} - 1}
\end{align*}
$$

则有

$$ A(x) = A_1(x ^ 2) + x A_2(x ^ 2) $$

假设 $ k < \frac{n}{2} $，现在要求 $ A(\omega_n ^ k) $

$$
\begin{align*}
A(\omega_n ^ k) &= A_1(\omega_n ^ {2k}) + \omega_n ^ {k} A_2(\omega_n ^ {2k}) \\
&= A_1(\omega_{\frac{n}{2}} ^ {k}) + \omega_n ^ {k} A_2(\omega_{\frac{n}{2}} ^ {k}) \\
\end{align*}
$$

这一步转化利用了单位根的性质一。

对于 $ A(\omega_n ^ {k + \frac{n}{2}}) $

$$
\begin{align*}
A(\omega_n ^ {k + \frac{n}{2}}) &= A_1(\omega_n ^ {2k + n}) + \omega_n ^ {k + \frac{n}{2}} A_2(\omega_n ^ {2k + n}) \\
&= A_1(\omega_n ^ {2k} \times \omega_n ^ n) - \omega_n ^ {k} A_2(\omega_n ^ {2k} \times \omega_n ^ n) \\
&= A_1(\omega_n ^ {2k}) - \omega_n ^ {k} A_2(\omega_n ^ {2k}) \\
&= A_1(\omega_{\frac{n}{2}} ^ {k}) - \omega_n ^ {k} A_2(\omega_{\frac{n}{2}} ^ {k}) \\
\end{align*}
$$

这一步转化除性质一外，还利用到了性质二和 $ \omega_n ^ n = 1 $ 这一显然的结论。

注意到，当 $ k $ 取遍 $ [0,\ \frac{n}{2} - 1] $ 时，$ k $ 和 $ k + \frac{n}{2} $ 取遍了 $ [0,\ n - 1] $。

也就是说，如果已知 $ A_1(x) $ 和 $ A_2(x) $ 在 $ \omega_{ \frac{n}{2} } ^ 0,\ \omega_{ \frac{n}{2} } ^ 1,\ \dots,\ \omega_{ \frac{n}{2} } ^ { \frac{n}{2} - 1 } $ 处的点值，就可以在 $ O(n) $ 的时间内求得 $ A(x) $ 在 $ \omega_n ^ 0,\ \omega_n ^ 1,\ \dots,\ \omega_n ^ {n - 1} $ 处的取值。而关于 $ A_1(x) $ 和 $ A_2(x) $ 的问题都是相对于原问题规模缩小了一半的子问题，分治的边界为一个常数项 $ a_0 $。

根据主定理，该分治算法的时间复杂度为

$$ T(n) = 2T( \frac{n}{2} ) + O(n) = O(n \log n) $$

这就是最常用的 FFT 算法 —— Cooley-Tukey 算法。

### 傅里叶逆变换
将点值表示的多项式转化为系数表示，同样可以使用快速傅里叶变换，这个过程叫做**傅里叶逆变换**。

设 $ (y_0,\ y_1,\ y_2,\ \dots,\ y_{n - 1}) $ 为 $ (a_0,\ a_1,\ a_2,\ \dots,\ a_{n - 1}) $ 的傅里叶变换。考虑另一个向量 $ (c_0,\ c_1,\ c_2,\ \dots,\ c_{n - 1}) $ 满足

$$
c_k = \sum\limits_{i = 0} ^ {n - 1} y_i (\omega_n ^ {-k}) ^ i
$$

即多项式 $ B(x) = y_0 + y_1 x + y_2 x ^ 2 + \dots + y_{n - 1} x ^ {n - 1} $ 在 $ \omega_n ^ 0,\ \omega_n ^ {-1},\ \omega_n ^ {-2},\ \dots,\  \omega_n ^ {-(n - 1)} $ 处的点值表示。

将上式展开，得

$$
\begin{align*}
c_k &= \sum\limits_{i = 0} ^ {n - 1} y_i (\omega_n ^ {-k}) ^ i \\
&= \sum\limits_{i = 0} ^ {n - 1} (\sum\limits_{j = 0} ^ {n - 1} a_j (\omega_n ^ i) ^ j) (\omega_n ^ {-k}) ^ i \\
&= \sum\limits_{i = 0} ^ {n - 1} (\sum\limits_{j = 0} ^ {n - 1} a_j (\omega_n ^ j) ^ i (\omega_n ^ {-k}) ^ i) \\
&= \sum\limits_{i = 0} ^ {n - 1} (\sum\limits_{j = 0} ^ {n - 1} a_j (\omega_n ^ j) ^ i) (\omega_n ^ {-k}) ^ i \\
&= \sum\limits_{i = 0} ^ {n - 1} \sum\limits_{j = 0} ^ {n - 1} a_j (\omega_n ^ {j - k}) ^ i \\
&= \sum\limits_{j = 0} ^ {n - 1} a_j (\sum\limits_{i = 0} ^ {n - 1} (\omega_n ^ {j - k}) ^ i)
\end{align*}
$$

考虑一个式子

$$ S(\omega_n ^ k) = 1 + \omega_n ^ k + (\omega_n ^ k) ^ 2 + \dots + (\omega_n ^ k) ^ {n - 1} $$

当 $ k \neq 0 $ 时，两边同时乘上 $ \omega_n ^ k $ 得

$$ \omega_n ^ k S(\omega_n ^ k) = \omega_n ^ k + (\omega_n ^ k) ^ 2 + (\omega_n ^ k) ^ 3 + \dots + (\omega_n ^ k) ^ n $$

两式相减，整理后得

$$
\begin{align*}
\omega_n ^ k S(\omega_n ^ k) - S(\omega_n ^ k) &= (\omega_n ^ k) ^ n - 1 \\
S(\omega_n ^ k) &= \frac{(\omega_n ^ k) ^ n - 1}{\omega_n ^ k - 1}
\end{align*}
$$

分子为零，分母不为零，所以

$$ S(\omega_n ^ k) = 0 $$

当 $ k = 0 $ 时，显然 $ S(\omega_n ^ k) = n $。

继续考虑上式

$$
\begin{align*}
c_k &= \sum\limits_{j = 0} ^ {n - 1} a_j (\sum\limits_{i = 0} ^ {n - 1} (\omega_n ^ {j - k}) ^ i) \\
&= \sum\limits_{j = 0} ^ {n - 1} a_j S(\omega_n ^ {j - k})
\end{align*}
$$

当 $ j = k $ 时，$ S(\omega_n ^ {j - k}) = n $，否则 $ S(\omega_n ^ {j - k}) = 0 $，即

$$
\begin{align*}
c_i &= n a_i \\
a_i &= \frac{1}{n} c_i
\end{align*}
$$

所以，使用单位根的倒数代替单位根，做一次类似快速傅里叶变换的过程，再将结果每个数除以 $ n $，即为傅里叶逆变换的结果。

### 实现
C++ 的 STL 在头文件 `complex` 中提供一个复数的模板实现 `std::complex<T>`，其中 `T` 为实数类型，一般取 `double`，在对精度要求较高的时候可以使用 `long double` 或 `__float128`（不常用）。

考虑到单位根的倒数等于其共轭复数，在程序实现中，为了减小误差，通常使用 `std::conj()` 取得 IDFT 所需的「单位根的倒数」。

#### 递归实现
直接按照上面得到的结论来实现即可，比较直观。

##### 代码

```c++
const double PI = acos(-1);

bool inversed = false;

inline std::complex<double> omega(const int n, const int k) {
    if (!inversed) return std::complex<double>(cos(2 * PI / n * k), sin(2 * PI / n * k));
    else return std::conj(std::complex<double>(cos(2 * PI / n * k), sin(2 * PI / n * k)));
}

inline void transform(std::complex<double> *a, const int n) {
    if (n == 1) return;

    static std::complex<double> buf[MAXN];
    const int m = n / 2;
    // 按照系数奇偶划分为两半
    for (int i = 0; i < m; i++) {
        buf[i] = a[i * 2];
        buf[i + m] = a[i * 2 + 1];
    }
    std::copy(buf, buf + n, a);

    // 分治
    std::complex<double> *a1 = a, *a2 = a + m;
    fft(a1, m);
    fft(a2, m);

    // 合并两个子问题
    for (int i = 0; i < m; i++) {
        std::complex<double> x = omega(n, i);
        buf[i] = a1[i] + x * a2[i];
        buf[i + m] = a1[i] - x * a2[i];
    }

    std::copy(buf, buf + n, a);
}
```

#### 迭代实现
递归实现的 FFT 效率不高，实际中一般采用迭代实现。

##### 二进制位翻转
考虑递归 FFT 分治到边界时，每个数的顺序，及其二进制位。

```plain
000 001 010 011 100 101 110 111
 0   1   2   3   4   5   6   7
 0   2   4   6 - 1   3   5   7
 0   4 - 2   6 - 1   5 - 3   7
 0 - 4 - 2 - 6 - 1 - 5 - 3 - 7
000 100 010 110 001 101 011 111
```

发现规律，分治到边界后的下标等于原下标的二进制位翻转。

代码实现，枚举每个二进制位即可。

```c++
int k = 0;
while ((1 << k) < n) k++;
for (int i = 0; i < n; i++) {
    int t = 0;
    for (int j = 0; j < k; j++) if (i & (1 << j)) t |= (1 << (k - j - 1));
    if (i < t) std::swap(a[i], a[t]);
}
```

##### 蝴蝶操作
考虑合并两个子问题的过程，假设 $ A_1(\omega_{ \frac{n}{2} } ^ k) $ 和 $ A_2(\omega_{ \frac{n}{2} } ^ k) $ 分别存在 $ a(k) $ 和 $ a(\frac{n}{2} + k) $ 中，$ A(\omega_n ^ {k}) $ 和 $ A(\omega_n ^ {k + \frac{n}{2} }) $ 将要被存放在 $ b(k) $ 和 $ b(\frac{n}{2} + k) $ 中，合并的单位操作可表示为

$$
\begin{align*}
b(k) & \leftarrow a(k) + \omega_n ^ k \times a(\frac{n}{2} + k) \\
b(\frac{n}{2} + k) & \leftarrow a(k) - \omega_n ^ k \times a(\frac{n}{2} + k) \\
\end{align*}
$$

考虑加入一个临时变量 $ t $，使得这个过程可以在原地完成，不需要另一个数组 $ b $，也就是说，将 $ A(\omega_n ^ {k}) $ 和 $ A(\omega_n ^ {k + \frac{n}{2} }) $ 存放在 $ a(k) $ 和 $ a(\frac{n}{2} + k) $ 中，覆盖原来的值

$$
\begin{align*}
t & \leftarrow \omega_n ^ k \times a(\frac{n}{2} + k) \\
a(\frac{n}{2} + k) & \leftarrow a(k) - t \\
a(k) & \leftarrow a(k) + t \\
\end{align*}
$$

这一过程被称为**蝴蝶操作**。

##### 代码
`omega[k]` 中保存 $ \omega_n ^ k $（IDFT 时保存 $ \omega_n ^ {-k} $）。

枚举 $ l $，表示一次要将 $ \frac{l}{2} $ 长度的序列答案合并为长度为 $ l $ 的，根据单位根的性质一，有 $ \omega_l ^ k = \omega_n ^ { \frac{n}{l} k } $。

```c++
void transform(std::complex<double> *a, const int n, const std::complex<double> *omega) {
    // 此处省略二进制位翻转的代码
    for (int l = 2; l <= n; l *= 2) {
        int m = l / 2;
        // 将两个长度为 m 的序列的答案合并为长度为 l 的序列的答案
        for (std::complex<double> *p = a; p != a + n; p += l) {
            for (int i = 0; i < m; i++) {
                // 蝴蝶操作
                std::complex<double> t = omega[n / l * i] * p[m + i];
                p[m + i] = p[i] - t;
                p[i] += t;
            }
        }
    }
}
```

### 模板
需要注意的是，在求两个次数分别为 $ n_1 - 1 $ 和 $ n_2 - 1 $ 的多项式的乘积时，需要分别求出其在**至少** $ n_1 + n_2 - 1 $ 个点处的点值，因为这样才能保证相乘后的点值能唯一确定一个 $ n_1 + n_2 - 2 $ 次多项式。

```c++
struct FastFourierTransform {
    std::complex<double> omega[MAXN], omegaInverse[MAXN];

    void init(const int n) {
        for (int i = 0; i < n; i++) {
            omega[i] = std::complex<double>(cos(2 * PI / n * i), sin(2 * PI / n * i));
            omegaInverse[i] = std::conj(omega[i]);
        }
    }

    void transform(std::complex<double> *a, const int n, const std::complex<double> *omega) {
        int k = 0;
        while ((1 << k) < n) k++;
        for (int i = 0; i < n; i++) {
            int t = 0;
            for (int j = 0; j < k; j++) if (i & (1 << j)) t |= (1 << (k - j - 1));
            if (i < t) std::swap(a[i], a[t]);
        }

        for (int l = 2; l <= n; l *= 2) {
            int m = l / 2;
            for (std::complex<double> *p = a; p != a + n; p += l) {
                for (int i = 0; i < m; i++) {
                    std::complex<double> t = omega[n / l * i] * p[m + i];
                    p[m + i] = p[i] - t;
                    p[i] += t;
                }
            }
        }
    }

    void dft(std::complex<double> *a, const int n) {
        transform(a, n, omega);
    }

    void idft(std::complex<double> *a, const int n) {
        transform(a, n, omegaInverse);
        for (int i = 0; i < n; i++) a[i] /= n;
    }
} fft;

inline void multiply(const int *a1, const int n1, const int *a2, const int n2, int *res) {
    int n = 1;
    while (n < n1 + n2) n *= 2;
    static std::complex<double> c1[MAXN], c2[MAXN];
    for (int i = 0; i < n1; i++) c1[i].real(a1[i]);
    for (int i = 0; i < n2; i++) c2[i].real(a2[i]);
    fft.init(n);
    fft.dft(c1, n), fft.dft(c2, n);
    for (int i = 0; i < n; i++) c1[i] *= c2[i];
    fft.idft(c1, n);
    for (int i = 0; i < n1 + n2 - 1; i++) res[i] = static_cast<int>(floor(c1[i].real() + 0.5));
}
```

### 参考资料
* [多項式 - 维基百科，自由的百科全书](https://zh.wikipedia.org/zh/%E5%A4%9A%E9%A0%85%E5%BC%8F)，Wikipedia
* [复平面 - 维基百科，自由的百科全书](https://zh.wikipedia.org/wiki/%E5%A4%8D%E5%B9%B3%E9%9D%A2)，Wikipedia
* [复数 (数学) - 维基百科，自由的百科全书](https://zh.wikipedia.org/wiki/%E5%A4%8D%E6%95%B0_(%E6%95%B0%E5%AD%A6))，Wikipedia
* [快速傅里叶变换 - 维基百科，自由的百科全书](https://zh.wikipedia.org/wiki/%E5%BF%AB%E9%80%9F%E5%82%85%E9%87%8C%E5%8F%B6%E5%8F%98%E6%8D%A2)，Wikipedia
* [FFT & NTT | ZYK1997](http://zyk1997.github.io/2015/06/08/FFT/)，ZYK1997
* [BZOJ 3992 SDOI2015 序列统计 - Fuxey - 博客频道 - CSDN.NET](http://blog.csdn.net/fuxey/article/details/50840881)，Fuxey
* [从多项式乘法到快速傅里叶变换 - Miskcoo's Space](http://blog.miskcoo.com/2015/04/polynomial-multiplication-and-fast-fourier-transform)，Miskcoo
* [OI 中的 FFT - zball - 博客园](http://www.cnblogs.com/tmzbot/p/4320955.html)，zball
* [Fourier transform](https://pan.baidu.com/wap/album/file?uk=3325080974&album_id=2474841267539644259&fsid=845742707277510&adapt=pc&fr=ftw)，郭晓旭
