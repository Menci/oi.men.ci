title: STL 在 OI 中的应用
categories: OI
tags: 
  - C++
  - STL
permalink: stl-in-oi
id: 8
updated: '2016-02-17 10:35:37'
date: 2015-12-24 05:43:15
---

在 OI 竞赛中，可以使用的语言有 C++、C、Pascal，其中 C++ 最大的优势是，它本身提供了一个模板库 —— Standard Template Library（标准模板库），简称 STL。STL 包含一系列算法和容器等，合理地使用 STL，可以在提高编写代码的效率。NOI 系列比赛自 2011 年起允许 C++ 选手使用 STL，所以我们应该利用好 STL，发挥 C++ 语言的优势。

<!-- more -->

### 分类
> STL 可分为容器（containers）、迭代器（iterators）、空间配置器（allocator）、配接器（adapters）、算法（algorithms）、仿函数（functors）六个部分。

本文主要讲解容器、迭代器、算法，其他的几个部分在竞赛中很少使用到。

### 命名空间
命名空间（namespace）是 C++ 的一个特性，它被用于解决名称冲突，比如假设 Menci 和 aby890 都在自己的头文件里编写了一个 `work()` 函数，如果这两个函数我们都要用，则名称会产生冲突，但如果两人都将自己的函数写在单独的命名空间内，就成了 `Menci::work()` 和 `aby890::work()`，就不会冲突了。

STL 的所有内容都包含在 `std` 命名空间内。为什么命名空间不叫 `stl`？我也不知道。

如果我们要调用 STL 中的 `sort` 函数（下文会有提到），要这样写：

```cpp
std::sort(a, a + n);
```

我们也可以将 `std::sort` 这个函数“导入”到全局中，就可以直接 `sort(a, a + n)` 这样调用了。  
使用 `using` 关键字来“导入”命名空间中的函数或类。

```cpp
using std::sort;
```

也可以将整个命名空间导入全局，这样就可以直接访问命名空间中的所有内容，但更容易产生名称冲突（比如你可能会声明一个叫做 `max` 的变量，但它会覆盖 STL 中的 `max` 函数）。  
使用 `using namespace` 来“导入”整个命名空间。

```cpp
using namespace std;
```

### 算法
STL 中的算法主要包含在 `<algorithm>` 头文件中，这个文件名要记住，每天念一遍。

##### 排序
STL 中提供一系列与排序有关的函数，其中最常用到的是 `sort` 和 `stable_sort`，`sort` 是不稳定的排序，它的期望时间复杂度为 $O(n {\log} n)$，`stable_sort` 是稳定的排序，它的时间复杂度为 $O(n {\log} n)$。

`sort` 使用类似与快速排序的算法，在大多数情况下能获得最高的效率，`stable_sort` 使用多路归并排序算法，可以在稳定的前提下取得较高的效率。一般常用 `sort`。

用法（以 `sort` 为例，`stable_sort` 相同）：

对左闭右开区间 [l, r) 排序，使用 `sort(l, r)`。其中 l 和 r 是指向元素的**迭代器**，在了解**迭代器**之前，我们可以将其理解为指向元素的指针。

注意这里的区间表示是一个**左闭右开区间**，STL 中经常会出现这种区间，如果我们要对一个数组 a 的前 n 个元素进行排序，则对应区间为 [a, a + n)，因为 a 指向数组的第一个元素（下标为 0），a + n 指向数组的第 n 个元素**之后**。

`sort` 函数默认是升序排序，如果需要降序，可以通过自定义“比较函数”来实现。

```cpp
bool compare(int a, int b) {
    return a > b;
}

std::sort(a, a + n, &compare);
```

下面的代码演示了读入 n（n <= 100000）个数，并**降序**排序后输出。

```cpp
#include <cstdio>
#include <algorithm>

const int MAXN = 100000;

int n;
int a[MAXN];

bool compare(int a, int b) {
    return a > b;
}

int main() {
	scanf("%d", &n);

	for (int i = 0; i < n; i++) {
		scanf("%d", &a[i]);
	}

	std::sort(a, a + n, &compare);

	for (int i = 0; i < n; i++) {
		printf("%d\n", a[i]);
	}

	return 0;
}
```

降序排序是**大于号**，升序排序是**小于号**（注意**不能**加等号变成大于等于、小于等于），如果不指定比较函数，默认为**升序**。

也可以通过**重载运算符**或者定义**比较函数**的方法对结构体进行排序：

```cpp
struct student_t {
    unsigned int id;
    long double score;
 
    bool operator<(const student_t &other) const {
        return score < other.score;
    }
} students[MAXN];
 
bool compare(const student_t &student1, const student_t &student2) {
    return student1.score < student2.score;
}
 
std::sort(students, students + n, &compare);
```

写在结构体中的 `operator<` 即为重载运算符，这让我们的结构体支持小于号的比较操作。  
结构体下面的 `compare` 是比较函数，**比较函数**和**重载运算符**只需要写一个就够了。

注意两种写法中的 `const` 和 `&` 都不能省略。

##### 去重

使用 `unique` 函数来去除数组中的重复元素，其调用格式与 `sort` 类似，注意调用 `unique` 前必须保证数组是有序的（升序降序都可以）。

```cpp
std::sort(a, a + n);
std::unique(a, a + n);
```

`unique` 函数返回去重后的数组的最后一个元素之后，一般通过用返回值减去首地址的方法获得不重复的元素数量：

```cpp
int count = std::unique(a, a + n) - a;
```

下面的代码演示了读入 n（n <= 100000）个数，并升序排序并去重后输出。

```cpp
#include <cstdio>
#include <algorithm>
 
const int MAXN = 100000;
 
int n;
int a[MAXN];
 
int main() {
    scanf("%d", &n);
 
    for (int i = 0; i < n; i++) {
        scanf("%d", &a[i]);
    }
 
    std::sort(a, a + n);
    int count = std::unique(a, a + n) - a;
 
    for (int i = 0; i < count; i++) {
        printf("%d\n", a[i]);
    }
 
    return 0;
}
```

##### 较大、较小值

使用 `max` 和 `min` 来取得两个数中较大或较小的。

```cpp
int a = -1, b = 890;
x = std::max(a, b); // 结果为 890
y = std::min(a, b); // 结果为 -1
```

##### 查找

STL 中常用的用于查找的函数有三个：`lower_bound`、`upper_bound`、`binary_search`，一般 `lower_bound` 最为常用。

`lower_bound` 用于在一个升序序列中查找某个元素，并返回第一个**不小于**该元素的元素的迭代器，如果找不到，则返回指向序列中最后一个元素**之后**的迭代器。

`upper_bound` 用于在一个升序序列中查找某个元素，并返回第一个**大于**该元素的元素的迭代器，如果找不到，则返回指向序列中最后一个元素**之后**的迭代器。

`binary_search` 用于确定某个元素有没有在一个升序序列中出现过，返回 `true` 或 `false`。

三个函数的时间复杂度均为$O({\log}n)$。

```cpp
int a[8] = { -9, 5, -1, 2, 7, 1, -2, 2 }, n = 8;

std::sort(a, a + n);

// a = { -9, -2, -1, 1, 2, 2, 5, 7 }

int *p1 = std::lower_bound(a, a + n, 1);
// p1 指向 a 中第 4 个元素 a[3] = 1

int *p2 = std::lower_bound(a, a + n, 2);
// p2 指向 a 中第 5 个元素 a[4] = 2

int *p3 = std::upper_bound(a, a + n, 2);
// p3 指向 a 中第 7 个元素 a[6] = 5

int *p4 = std::lower_bound(a, a + n, 8);
// p4 = a + n，因为数组 a 中没有不小于 8 的元素，此时访问 *p4 会越界

bool flag = std::binary_search(a, a + n, 3);
// flag = false 因为数组 a 中没有 3
```

##### 交换
使用 `swap` 函数交换两个变量的值。

```cpp
int a = -1, b = 1;
std::swap(a, b);

// a = 1, b = -1
```

### 迭代器
迭代器是用于访问 STL 容器中元素的一种数据类型，一般迭代器的声明如下：

```cpp
std::CONTAINER<T>::iterator p;
```

上述代码声明了一个迭代器 `p`，其中 `CONTAINER` 是容器类型，可以是 `vector`、`set` 等，`T` 是容器中元素的类型。

一般的，容器的 `begin()` 方法返回**首个元素**的迭代器， `end()` 方法返回**最后一个元素之后**的迭代器。这两个迭代器确定了一个包含容器内所有元素的**左闭右开区间** `[begin(), end())`。对于任何指向有效元素的迭代器都有其**不等于** `end()`，`end()` 并不指向任何一个元素，试图访问 `end()` 对应的元素是非法的。

在使用 STL 提供的算法时，可以用迭代器表示一个区间，如：

```cpp
std::sort(v.begin(), v.end());
```

一些容器的迭代器可以支持**随机访问**，如指向 `vector[i]` 的迭代器为 `vector.begin() + i`，而另一些容器如 `set` 不支持这种用法。

所有的迭代器都支持使用 `++` 和 `--` 运算符将迭代器加一或减一。

迭代器的用法类似于指向数组元素的指针，对于迭代器 `p`，用 `*p` 得到迭代器对应的元素；如果该迭代器所对应的元素类型为结构体，则可以直接使用 `->` 访问其对应结构体中的元素。

一般的，使用迭代器遍历容器类似于下述代码：

```cpp
for (std::CONTAINER<T>::iterator p = C.begin(); p != C.end(); p++) {
    std::cout << *p << std::endl;
}
```

### 容器

##### 数组 vector
STL 在头文件 `<vector>` 提供了一个**可变长**的数组 `vector`，它支持动态的插入、删除操作。

以下代码声明了一个 `vector`，它的每个元素类型为 `int`，初始元素数量为 0。

```cpp
std::vector<int> v;
```

以下代码声明了一个 `vector`，它的每个元素类型为 `int`，初始元素数量为 n。

```cpp
std::vector<int> v(n);
```

`vector` 提供 `begin()` 和 `end()`，分别获取指向**第一个元素**和**最后一个元素之后**的迭代器。

以下代码对 v 中的所有元素以升序排序：

```cpp
std::sort(v.begin(), v.end());
```

使用 `size()` 得到 `vector` 的元素数量，使用 `resize()` 重新指定 `vector` 的元素数量。

分别使用 `push_back()` 和 `pop_back()` 在 `vector` 的**尾部**加入或删除元素，这两个过程的时间复杂度为$O(1)$。

使用 `insert()` 在某个特定的位置插入一个元素，时间复杂度为$O(n)$。

使用 `erase()` 删除某个位置的元素，时间复杂度为$O(n)$。

```cpp
std::vector<int> v;
// v.size() = 0

v.push_back(23333);
// v.size() = 1, v = { 23333 }

v.insert(v.begin() + 0, 890);
// v.size() = 2, v = { 890, 23333 }

v.insert(v.begin() + 1, 12345);
// v.size() = 3, v = { 890, 12345, 23333 }

v.erase(v.begin() + 0);
// v.size() = 2, v = { 12345, 23333 }

for (nt i = 0; i < v.size(); i++) {
    printf("%d\n", v[i]);
}
// 依次输出 12345、23333

v.pop_back();
// v.size() = 1, v = { 12345 }
```

注意，在加入元素时，如果 `vector` 拥有的内存空间不足以存放欲加入的元素，则 `vector` 会申请一块新的内存，并将旧数据拷贝过去，这个过程通常花费 $O(n)$ 的时间。

##### 集合 set
STL 在头文件 `<set>` 中提供了一个**有序集合** `set`，其中的元素全部是**唯一**的，并且插入进的元素自动按照升序排列，但 `set` 不支持通过下标定位某个元素，只能通过**迭代器**遍历。

以下代码声明了一个 `int` 类型的集合。

```cpp
std::set<int> s;
```

使用 `insert()` 在集合中加入一个元素，其时间复杂度为$O({\log}n)$。

使用 `erase()` 删除集合中**某个元素**或**某个位置的元素**，其时间复杂度均为$O({\log}n)$。

`set` 自身提供 `lower_bound()` 用于定位元素，其作用与前文中的同名函数类似，也可以使用 `find()` 来精确查找元素。

遍历 `set` 只能使用**迭代器**。`set` 的迭代器为 `set<T>::iterator`，其中 `T` 为元素类型。

```cpp
std::set<int> s;

s.insert(23333);
s.insert(23333); // 重复插入无效
s.insert(66666);
s.insert(890);
s.insert(-1);
// s.size() = 4, s = { -1, 890, 23333, 66666 }

s.erase(66666);
// s.size() = 3, s = { -1, 890, 23333 }

std::set<int>::iterator p1 = s.lower_bound(555);
// *p1 = 890

std::set<int>::iterator p2 = s.find(555);
// p2 = s.end()，因为未找到 555

s.erase(p1);
// s.size() = 2, s = { -1, 23333 }

for (std::set<int>::iterator p = s.begin(); p != s.end(); p++) {
    printf("%d\n", *p);
}
// 依次输出 -1、23333
```

上述代码中运用的迭代器的方法在 STL 容器中较为常见。

##### 字符串 string
STL 在头文件 `<string>` 中将一些与字符串有关的操作封装在了 `string` 内。

使用 `cin` 和 `cout` 来输入、输出字符串。

使用 `find()` 查找另一个字符串在该字符串中的出现位置，返回结果从 0 开始。

使用 `c_str()` 获得 `string` 对应的 `const char *` 类型数据，可用于向 C 库函数传递。

```cpp
std::string s = "Menci";

int pos = s.find("23333");
// pos = string::npos，因为没有找到 23333

pos = s.find("ci");
// pos = 3，因为出现位置为第 4 个字符

char ch = s[0];
// ch = 'M'

std::cout << s << std::endl;
puts(s.c_str());
// 输出两次 Menci
```

##### 队列 queue
STL 在头文件 `<queue>` 中提供了先入先出（FIFO）队列 `queue`。

使用 `push()` 向队列中加入元素。

使用 `front()` 获取队首元素（并不删除）。

使用 `pop()` 删除队首元素。

使用 `empty()` 判断队列是否为空。

```cpp
std::queue<int> q;

bool flag = q.empty();
// flag = true，队列初始为空

q.push(23333);
q.push(66666);

while (!q.empty()) {
    printf("%d\n", q.front());
    q.pop();
}
// 依次输出 23333，66666
```

##### 栈 stack
STL 在头文件 `<stack>` 提供了后入先出（LIFO）栈 `stack`。

使用 `push()` 向栈中加入元素。

使用 `top()` 获取栈顶元素（并不删除）。

使用 `pop()` 删除栈顶元素。

使用 `empty()` 判断栈是否为空。

```cpp
std::stack<int> s;

bool flag = s.empty();
// flag = true，栈初始为空

s.push(23333);
s.push(66666);

while (!s.empty()) {
    printf("%d\n", s.top());
    s.pop();
}
// 依次输出 66666，23333
```

##### 优先队列 priority_queue
STL 在头文件 `<queue>` 中提供优先队列 `priority_queue`，在任意时间都能取出队列中的**最大值**。

使用 `push()` 向优先队列中加入元素，其时间复杂度为$O({\log}n)$。

使用 `top()` 获取优先队列中**最大**的元素（并不删除），其时间复杂度为$O(1)$。

使用 `pop()` 删除优先队列中**最大**元素，其时间复杂度为$O({\log}n)$。

使用 `empty()` 判断优先队列是否为空。

```cpp
std::priority_queue<int> q;

bool flag = q.empty();
// flag = true，优先队列初始为空

q.push(23333);
q.push(-1);
q.push(66666);

while (!q.empty()) {
    printf("%d\n", q.top());
    q.pop();
}
// 依次输出 66666，23333，-1
```

`priority_queue` 默认提供队列中的**最大值**，也可以以以下声明方式让 `priority_queue` 提供**最小值**。

```cpp
std::priority_queue<T, std::vector<T>, std::greater<T> > q;
```

注意把三个 `T` 换成优先队列中元素的类型（如 `int`）；`std::greater<T>` 的右边要加一个空格，否则会被编译器误认为是 `>>` 右移运算符。