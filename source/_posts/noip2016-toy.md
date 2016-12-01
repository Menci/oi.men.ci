title: 「NOIP2016」玩具谜题 - 模拟
categories: OI
tags: 
  - NOIP
  - 模拟
permalink: noip2016-toy
date: 2016-11-29 11:25:00
---

小南有一套可爱的玩具小人，它们各有不同的职业。

有一天，这些玩具小人把小南的眼镜藏了起来。小南发现玩具小人们围成了一个圈，它们有的面朝圈内，有的面朝圈外。

这时 `singer` 告诉小南一个谜题：「眼镜藏在我左数第 $ 3 $ 个玩具小人的右数第 $ 1 $ 个玩具小人的左数第 $ 2 $ 个玩具小人那里。」

小南发现，这个谜题中玩具小人的朝向非常关键， 因为朝内和朝外的玩具小人的左右方向是相反的：面朝圈内的玩具小人，它的左边是顺时针方向，右边是逆时针方向；而面向圈外的玩具小人，它的左边是逆时针方向，右边是顺时针方向。

小南一边艰难地辨认着玩具小人，一边数着：

`singer` 朝内，左数第 $ 3 $ 个是 `archer`。  
`archer` 朝外，右数第 $ 1 $ 个是 `thinker`。  
`thinker` 朝外，左数第 $ 2 $ 个是 `writer`。

所以眼镜藏在 `writer` 这里！

虽然成功找回了眼镜，但小南并没有放心。如果下次有更多的玩具小人藏他的眼镜，或是谜题的长度更长，他可能就无法找到眼镜了。所以小南希望你写程序帮他解决类似的谜题。这样的谜题具体可以描述为：

有 $ n $ 个玩具小人围成一圈，已知它们的职业和朝向。现在第 $ 1 $ 个玩具小人告诉小南一个包含 $ m $ 条指令的谜题。其中第 $ i $ 条指令形如「左数/右数第 $ s_i $ 个玩具小人」。你需要输出依次数完这些指令后，到达的玩具小人的职业。

<!-- more -->

### 链接
[Luogu 1563](https://www.luogu.org/problem/show?pid=1563)  
[LYOI #99](https://ly.men.ci/problem/99)

### 题解
维护当前是第几个小人，通过每个小人的朝向和指令方向判断下标的增减，每次增减下标后对 $ n $ 取模。

### 代码
```c++
#include <cstdio>

const int MAXN = 1e5 + 10;
const int MAXM = 1e5 + 10;

int main() {
	freopen("toy.in", "r", stdin);
	freopen("toy.out", "w", stdout);

	int n, m;
	scanf("%d %d", &n, &m);

	static struct Node {
		char name[10 + 1];
		int opposite;
	} a[MAXN];

	for (int i = 0; i < n; i++) {
		scanf("%d %s", &a[i].opposite, a[i].name);
	}

	int curr = 0;
	while (m--) {
		// printf("%d: %s\n", curr, a[curr].name);

		int k, s;
		scanf("%d %d", &k, &s);

		int d = (k ^ a[curr].opposite) ? 1 : -1;

		(((curr += d * s) %= n) += n) %= n;
	}

	printf("%s\n", a[curr].name);

	fclose(stdin);
	fclose(stdout);

	return 0;
}
```
