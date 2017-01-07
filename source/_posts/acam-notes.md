title: AC 自动机学习笔记
categories: OI
tags: 
  - AC 自动机
  - 字符串
  - 学习笔记
  - 算法模板
permalink: acam-notes
date: 2016-09-19 07:04:00
---

AC 自动机是一种多模式串匹配算法，可以用来在文本串中匹配一系列模式串，其时间复杂度与串的总长度成正比。

<!-- more -->

### 引入
> 给一个 Trie 和一个文本串，求 Trie 上所有单词在文本串中的出现次数。

如果使用朴素的匹配算法，时间复杂度非常高。如果对 Trie 上每个单词使用 KMP 预处理后匹配，还是需要做 $ O(n) $ 次的匹配。

### 失配函数
我们知道，在 KMP 算法中，如果在模式串的一个位置失配，则需要回到模式串的前面一个位置继续匹配。从位置 $ i $ 处失配后回到位置 $ j $，记作 $ \mathrm{fail}(i) = j $。

考虑 $ \mathrm{fail}(i) = j $ 的条件 —— 串的前 $ j $ 个字符组成的前缀，是前 $ i $ 个字符组成前缀的**后缀**。理论依据是，这样可以保证每一时刻已匹配的字符尽量多，避免遗漏。

现在将问题转化为，在一棵 Trie 上，求一个节点 $ j $，使得从根到 $ j $ 的路径组成的串是从根到 $ i $ 的路径组成串的**后缀**。

### 构造
![AC 自动机](acam-notes/acam.svg)

设 $ i $ 父节点为 $ i' $，$ i $ 的入边上的字母为 $ c $。

一个显然的结论是，如果 $ \mathrm{fail}(i') $ 有字母 $ c $ 的出边，则该出边指向的点即为 $ \mathrm{fail}(i) $。  
例如，上图中 $ \mathrm{fail}(7) = 1, \mathrm{fail}(8) = 2 $。

如果 $ \mathrm{fail}(i') $ 没有字母 $ c $ 的出边，则沿着失配函数继续向上找，找到 $ \mathrm{fail}(\mathrm{fail}(i')) $ …… 直到找到根为止，如果找不到一个符合条件的节点，则 $ \mathrm{fail}(i) $ 为根。  
例如，上图中 $ \mathrm{fail}(3) = 0 $。

### 匹配
用于匹配字符串时，设置一个当前状态 $ i $，它的初始值为根。每一次新加入一个字符 $ c $，首先检查状态 $ i $ 有没有出边 $ c $，如果有，则转移到出边指向的点上，否则继续检查 $ \mathrm{fail}(i) $ 有无字符 $ c $ 的出边。如果找不到满足条件的节点，则转移到根节点上。

如果状态转移到一个单词节点上，则代表这个单词被匹配到。但有时会出现，一个节点 $ i $ 不是单词，$ \mathrm{fail}(i) $ 是单词。

如下图，`a` 和 `bac` 组成的 AC 自动机（一些失配边已略去）。
![AC 自动机](acam-notes/acam2.svg)

节点 3 可以通过失配边连向 1，如果输入 `ba` 则会到达节点 3，节点 1 处的单词则被忽略。为了解决这一问题，我们引入另一个指针 —— 后缀链接，$ \mathrm{next}(i) $ 表示从节点 $ i $ 沿着失配边转移，能到达的第一个单词节点，如上图 $ \mathrm{next}(3) = 1 $。

有了后缀链接，便可以在匹配时检查每个节点的后缀链接，记录匹配单词时要遍历被匹配节点后缀链接。

后缀链接可以在失配指针之后求出 —— 如果 $ \mathrm{fail}(i) $ 为单词节点，则 $ \mathrm{next}(i) = \mathrm{fail}(i) $，否则 $ \mathrm{next}(i) = \mathrm{next}(\mathrm{fail}(i)) $。

### 优化
由于每次失配时需要使用失配指针，每次输入一个字符时经过的节点数不确定，时间复杂度可能会退化。

一个显然的结论是，对于一个状态，对它添加一个字符之后，转移到的状态是确定的。**也就是说，我们可以预处理每一个状态可能转移到的所有状态**。

对于节点 $ i $，如果它有字符 $ c $ 的出边，则在加入字符 $ c $ 时，它可以直接转移到该出边指向的节点上。否则，应该转移到 $ \mathrm{fail}(i) $ 加入对应字符时转移到的点上。我们可以用递推的方式求出这些转移方式，并且在 Trie 树上加上这些边，得到**Trie 图**。

### 模板
统计每个模式串的出现次数。

更新于 2016 年 12 月 27 日。

![zyz 大佬的评价](images/zyz.png)

```c++
const int CHARSET_SIZE = 'z' - 'a' + 1; // 字符集大小
const char BASE_CHAR = 'a'; // 最小的字符

struct Trie
{
	struct Node
	{
		Node *c[CHARSET_SIZE], *next, *fail;
		bool isWord;
		int ans;

		Node(bool isWord = false) : next(NULL), fail(NULL), isWord(isWord)
		{
			for (int i = 0; i < CHARSET_SIZE; i++) c[i] = NULL;
		}

		void apply()
		{
			ans++;
			if (next) next->apply();
		}
	} *root;

	Trie() : root(new Node()) {}

	Node *insert(const char *begin, const char *end)
	{
		// 插入过程类似 Splay
		Node **v = &root;
		for (const char *p = begin; p != end; p++)
		{
			// 向下找到对应节点的位置
			if (!*v) *v = new Node;
			v = &(*v)->c[*p];
		}
		if (!*v) *v = new Node(true);
		else (*v)->isWord = true;
		return *v;
	}

	void build()
	{
		std::queue<Node *> q;
		q.push(root);
		root->fail = root; // 边界
		root->next = NULL;
		while (!q.empty())
		{
			Node *v = q.front();
			q.pop();

			for (int i = 0; i < CHARSET_SIZE; i++)
			{
				// 使用引用减少代码量
				Node *&c = v->c[i];

				// 补全为 Trie 图
				if (!c)
				{
					// 如果 v == root，则 v->fail == root，c 和 v->fail->c[i] 是同一个变量
                    c = v == root ? root : v->fail->c[i];
                    continue;
                }
				Node *u = v->fail;

				// 类似 KMP 的方法，求失配指针
				// while (u != root && !u->c[i]) u = u->fail; // 补全为 Trie 图，此行可省略

				// 如果 v == root，则失配后一定回到根节点
				c->fail = v != root && u->c[i] ? u->c[i] : root;

				// 沿着 fail 指针能走到的第一个单词节点
				c->next = c->fail->isWord ? c->fail : c->fail->next;
				q.push(c);
			}
		}
	}

	void exec(const char *begin, const char *end)
	{
		Node *v = root;
		for (const char *p = begin; p != end; p++)
		{
			// 状态转移
			v = v->c[*p];

			// 统计答案
			if (v->isWord) v->apply();
			else if (v->next) v->next->apply(); // 注意是 else if
		}
	}
};
```
