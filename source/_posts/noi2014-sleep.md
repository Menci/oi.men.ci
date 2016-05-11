title: 「NOI2014」起床困难综合征 - 位运算 + 贪心
categories: OI
tags: 
  - NOI
  - BZOJ
  - 位运算
  - 贪心
permalink: noi2014-sleep
date: 2016-04-03 22:39:31
---

drd 有着十分特殊的技能，他的防御战线能够使用一定的运算来改变他受到的伤害。具体说来，drd 的防御战线由 $ n $ 扇防御门组成。每扇防御门包括一个运算 $ \rm op $ 和一个参数 $ t $，其中运算一定是 $ \rm OR $，$ \rm XOR $，$ \rm AND $ 中的一种，参数则一定为非负整数。如果还未通过防御门时攻击力为 $ x $，则其通过这扇防御门后攻击力将变为 $ x ~ {\rm op} ~ t $。最终 drd 受到的伤害为对方初始攻击力 $ x $ 依次经过所有 $ n $ 扇防御门后转变得到的攻击力。
由于 atm 水平有限，他的初始攻击力只能为 $ 0 $ 到 $ m $ 之间的一个整数（即他的初始攻击力只能在 $ 0 $，$ 1 $，$ … $，$ m $ 中任选，但在通过防御门之后的攻击力不受 $ m $ 的限制）。为了节省体力，他希望通过选择合适的初始攻击力使得他的攻击能让 drd 受到最大的伤害。

<!-- more -->

### 链接
[BZOJ 3668](http://www.lydsy.com/JudgeOnline/problem.php?id=3668)

### 题解
贪心从高位到低位枚举，检验当前位在初始值为 $ 0 $ 情况下的答案是否可以为 $ 1 $，如果不能则检验当前位初始值能否为 $ 1 $，并检验当前位在初始值为 $ 1 $ 情况下的答案是否可以为 $ 1 $。

注意要用 `unsigned int`，否则会变成负数。

### 代码
```c++
#include <cstdio>

const int MAXN = 100000;
const int MAXM = 1e9;

enum OperatorType {
	And = 0, Or = 1, Xor = 2
};

struct BitwiseOperator {
	OperatorType type;
	bool bits[32];
} ops[MAXN];

int n;
unsigned int m;

inline bool check(const int k, const bool value) {
	bool flag = value;
	for (int i = 0; i < n; i++) {
		if (ops[i].type == And) flag &= ops[i].bits[k];
		else if (ops[i].type == Or) flag |= ops[i].bits[k];
		else if (ops[i].type == Xor) flag ^= ops[i].bits[k];
	}

	return flag;
}

inline unsigned int solve() {
	unsigned int num = 0, ans = 0;
	for (int i = 32 - 1; i >= 0; i--) {
		if (check(i, 0)) ans |= (1 << i);
		else if ((num | (1 << i)) <= m && check(i, 1)) ans |= (1 << i), num |= (1 << i);
	}

	return ans;
}

int main() {
	// freopen("sleep.in", "r", stdin);
	// freopen("sleep.out", "w", stdout);

	scanf("%d %u", &n, &m);

	for (int i = 0; i < n; i++) {
		BitwiseOperator &op = ops[i];
		char str[sizeof("AND")];
		int x;
		scanf("%s %d", str, &x);
		if (str[0] == 'A') op.type = And;
		else if (str[0] == 'O') op.type = Or;
		else if (str[0] == 'X') op.type = Xor;

		for (int i = 0; i < 32; i++) op.bits[i] = ((x & (1 << i)) == 0) ? false : true;
		// for (int i = 0; i < 32; i++) putchar(op.bits[i] ? '1' : '0');
		// putchar('\n');
	}

	printf("%u\n", solve());

	fclose(stdin);
	fclose(stdout);

	return 0;
}
```
