title: KMP 学习笔记
categories: OI
tags: 
  - CodeVS
  - KMP
  - 字符串
  - 学习笔记
  - 算法模板  
permalink: kmp-notes
date: 2015-12-30 04:19:36
---

KMP（Knuth-Morris-Pratt）是算法竞赛中常用的字符串匹配算法之一，它可以有效地利用失配信息来使得匹配全过程中不回溯，从而在线性时间内完成匹配。

<!-- more -->

### 原理
设模式串 `pattern` 为 `"utqqutnu"`，目标串 `target` 为 `"utqlwutqqutnu`"，使用朴素算法进行匹配时（`"-"` 表示匹配成功，`"|"` 表示在此字符失配）：

```
utqqutlwutqqutnu
------|
utqqutnu
```

首先，将两串首部对齐，逐个字符匹配，可见在字符 `'l'` 处失配，按照朴素算法的思想，我们需要把模式串右移一个字符，然后再从模式串首部开始匹配，即：

```
utqqutlwutqqutnu
 |
 utqqutnu
```

这时发现从第一个字符起就不匹配，还要继续右移 ……

但是，似乎有一种更好的策略：我们可以直接把模式串的开头对齐目标串的 `"ut"` 处，就可以一次跳过几个字符，并且模式串无需回溯：

```
utqqutlwutqqutnu
    --|
    utqqutnu
```

而接下来这次失配后，本来需要将模式串与 `'t'` 对齐，但事实上并不需要，将模式串直接与 `'l'` 对齐即可。

```
utqqutlwutqqutnu
      |
      utqqutnu
```

KMP 算法就是利用了失配后的**部分匹配**信息来选择模式串的移动方式，尽可能地避免无用的匹配。

### 失配信息的利用
通过上述例子我们可以观察到，如果**部分匹配**的串有对称的**前后缀**，则我们可以直接将**模式串**中**部分匹配串**的前缀与**目标串**中**部分匹配串**的后缀对齐，如：

```
utqqutlwutqqutnu
------|
utqqutnu
```

例子中的部分匹配串为 `"utqqut"`，有对称的前后缀 `"ut"`，则可以直接将目标串的第二个 `"ut"` 与模式串的第一个 `"ut"` 对齐。

再来看这个例子，模式串为 `"ttitty"`，目标串为 `"ttittitty"`

```
ttittittypoi
-----|
ttitty
```

此时的部分匹配串为 `"ttitt"`，它有两个对称的前后缀，分别是 `"tt"` 和 `"t"`，我们会想，以 `"t"` 对齐，可以移动更长的距离，事实上呢？

```
ttittittypoi
    -|
    ttitty
```

在模式串第二个 `'t'` 处失配后，继续匹配，最终结果是匹配失败。

然而，如果我们以 `"tt"` 对齐，则有：

```
ttittittypoi
   ------
   ttitty
```

结果是匹配成功。

这个例子告诉我们，当部分匹配串有多个对称前后缀时，需要选择**最长的**，以保证匹配结果的正确。

### 失配信息的推导
事实上，KMP 算法利用的**失配信息**是与目标串无关的，它仅与模式串有关，我们可以用递推的方法在线性的时间内求出模式串的**每个可能的部分匹配串（即所有前缀）**前缀的失配信息。

我们定义 `fail` 数组是一个长度等于模式串长度的数组，它的第 `i` 个成员代表以模式串前 `i` 个字符作为部分匹配串时，部分匹配串的**最长对称前后缀**长度。

```
      | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
target| u | t | q | q | u | t | n | u
fail  | 0 | 0 | 0 | 0 | 1 | 2 | 0 | 1
```

推导 `fail[i]` 的方法如下：

1. 如果 `fail[i - 1]` 不为 0，且第 `i` 个字符与第 `fail[i - 1] +　１` 个字符相同，则 `fail[i]` 即为 `fail[i - 1] + 1`；
2. 如果 `fail[i - 1]` 为 0，且第 `i` 个字符与首个字符相同，则 `fail[i] = 1`，否则 `fail[i] = 0`；
3. 难点：如果 `fail[i - 1]` 不为 0，且第 `i` 个字符与第 `fail[i - 1] +　１` 个字符**不同**，则继续对比第 `i` 个字符与 `fail[fail[i - 1]] + 1` 个字符，一直向前找直到匹配或者找到了 0。

如模式串：*agct*agc**a**gct*agct*

加粗的 `'a'` 与最后一个 `'t'` 不匹配，此时向前找找到 `"agctagc"` 的最后一个 `'c'` 的**对称位置的后一个字符**，发现是 `'t'`，则找到前后的 `"agct"` 是一个对称的前后缀。

### 匹配
有了 `fail` 数组，匹配就简单多了，只要根据以下三种情况对应处理即可：

1. 如果当前字符匹配，则继续匹配下一个字符；
2. 如果当前在**模式串的首字符处**不匹配，则直接将模式串右移一个字符；
3. 否则移动模式串，使**模式串**中**部分匹配串**的前缀与**目标串**中**部分匹配串**的后缀对齐。

### 完整代码（POJ 3461）
更新于 2016 年 12 月 26 日。

![zyz 大佬的评价](kmp-notes/zyz.png)

```cpp
#include <cstdio>
#include <cstring>

const int MAXN = 1000000;

inline int kmp(char *a, char *b) // 在 a 中寻找 b
{
	// 求出字符串长度
	int na = strlen(a + 1), nb = strlen(b + 1);
	static int fail[MAXN + 1];

	fail[1] = 0;
	for (int i = 2; i <= nb; i++)
	{
		// 取上一位置的 fail 位置之后的字符，判断是否和该位相同
		int j = fail[i - 1];
		// 不断地向前找 fail 位置，直到找到 0 位置或可以匹配当前字符
		while (j != 0 && b[j + 1] != b[i]) j = fail[j];

		// 如果能匹配，设置当前位置的 fail 位置
		if (b[j + 1] == b[i]) fail[i] = j + 1;
		else fail[i] = 0; // 找不到匹配位置
	}

	int res = 0; // 匹配次数
	for (int i = 1, j = 0; i <= na; i++)
	{
		// 取上一位置的 fail 位置之后的字符，判断是否和要匹配的字符相同
		while (j != 0 && b[j + 1] != a[i]) j = fail[j];

		// 这一位可以匹配上
		if (b[j + 1] == a[i]) j++;

		// 匹配成功
		if (j == nb)
		{
			res++;
			j = fail[j]; // 为了能匹配重叠串
			// j = 0 // 如果不允许重叠匹配
		}
	}

	return res;
}

int main()
{
	int T;
	scanf("%d", &T);
	while (T--)
	{
		static char a[MAXN + 2], b[MAXN + 2];
		// 下标从 1 开始
		scanf("%s %s", a + 1, b + 1);
		printf("%d\n", kmp(b, a));
	}
	return 0;
}
```

<!--
### 完整代码（CodeVS 1204）
因为 C++ 中数组从 `0` 开始，所以有些地方与上文中的表示不同。

```cpp
#include <climits>
#include <cstring>
#include <iostream>
#include <string>

using std::cin;
using std::cout;
using std::endl;
using std::string;

typedef unsigned int uint;

const uint MAXN = 100;

inline size_t KMP(const string &target, const string &pattern) {
	uint fail[MAXN] = { 0 };

	fail[0] = 0;
	for (uint i = 1; i < pattern.length(); i++) {
		uint k = fail[i - 1];
		char ch = pattern[i];

		while (k && pattern[k] != ch) {
			k = fail[k - 1];
		}

		if (pattern[k] == ch) {
			fail[i] = k + 1;
		} else {
			fail[i] = 0;
		}
	}

	for (uint i = 0; i < pattern.length(); i++) {
		cout << fail[i] << endl;
	}

	uint i = 0, j = 0;
	while (i < target.length() && j < pattern.length()) {
		if (target[i] == pattern[j]) {
			i++, j++;
		} else {
			if (j == 0) {
				i++;
			} else {
				j = fail[j - 1];
			}
		}
	}

	if (j == pattern.length()) {
		return i - j;
	} else {
		return string::npos;
	}
}

int main() {
	string target, pattern;
	cin >> target >> pattern;
	cout << KMP(target, pattern) << endl;
	return 0;
}
```
-->
