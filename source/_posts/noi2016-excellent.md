title: 「NOI2016」优秀的拆分 - Hash
categories: OI
tags: 
  - NOI
  - BZOJ
  - 字符串
  - Hash
permalink: noi2016-excellent
date: 2016-09-06 07:34:00
---

如果一个字符串可以被拆分为 `AABB` 的形式，其中 $ A $ 和 $ B $ 是任意非空字符串，则我们称该字符串的这种拆分是优秀的。

例如，对于字符串 `aabaabaa`，如果令 $ A = \texttt{aab}, B = \texttt{a} $，我们就找到了这个字符串拆分成 `AABB` 的一种方式。

一个字符串可能没有优秀的拆分，也可能存在不止一种优秀的拆分。比如我们令 $ A = \texttt{a}, B = \texttt{baa} $，也可以用 `AABB` 表示出上述字符串；但是，字符串 `abaabaa` 就没有优秀的拆分。

现在给出一个长度为 $ n $ 的字符串 $ S $，我们需要求出，在它所有子串的所有拆分方式中，优秀拆分的总个数。

<!-- more -->

### 题解
[点我去看题解](https://blog.sengxian.com/solutions/bzoj-4650)

### 代码
Hash T 飞了 ……
```c++
#pragma GCC optimize("O3")

#include <cstdio>
#include <climits>
#include <cassert>
#include <cstring>
#include <algorithm>

typedef unsigned __int128 hash1_t;

const int MAXN = 30000;
const hash1_t BASE1 = 233;
// const hash2_t BASE2 = 233;
// const hash3_t BASE3 = 53;

char s[MAXN];
int n;
long long forward[MAXN + 1], backward[MAXN + 1];

hash1_t hash1[MAXN], base1[MAXN + 1];
// hash2_t hash2[MAXN], base2[MAXN + 1];
// hash3_t hash3[MAXN], base3[MAXN + 1];

inline __attribute__((always_inline)) bool compare(const int a, const int b, const int len) {
	return hash1[b + len - 1] - hash1[b - 1] * base1[len] == hash1[a + len - 1] - hash1[a - 1] * base1[len];
		// && hash2[b + len - 1] - hash2[b - 1] * base2[len] == hash2[a + len - 1] - hash2[a - 1] * base2[len]
		// && hash3[b + len - 1] - hash3[b - 1] * base3[len] == hash3[a + len - 1] - hash3[a - 1] * base3[len];
	// register long long h1 = ((hash[b + len - 1] - hash[b - 1] * base[len] % MOD) % MOD + MOD) % MOD;
	// register long long h2 = ((hash[a + len - 1] - hash[a - 1] * base[len] % MOD) % MOD + MOD) % MOD;
	// register hash_t h1 = hash[b + len - 1] - hash[b - 1] * base[len];
	// register hash_t h2 = hash[a + len - 1] - hash[a - 1] * base[len];
	// const bool res = h1 == h2;
	// assert(res == (memcmp(&s[a], &s[b], len) == 0));
	// return h1 == h2;
	// return memcmp(&s[a], &s[b], len) == 0;
}

inline __attribute__((always_inline)) int lcp(register int a, register int b) {
	if (a > b) std::swap(a, b);
	if (a < 0 || b >= n) return 0;
	register int l = 0, r = n - b;
	while (l != r) {
		const register int m = l + (r - l) / 2 + 1;
		if (compare(a, b, m)) {
			l = m;
		} else r = m - 1;
	}
	return l;
}

inline __attribute__((always_inline)) int lcs(register int a, register int b) {
	if (a > b) std::swap(a, b);
	if (a < 0 || b >= n) return 0;
	register int l = 0, r = a + 1;
	while (l != r) {
		const register int m = l + (r - l) / 2 + 1;
		if (compare(a - m + 1, b - m + 1, m)) {
			l = m;
		} else r = m - 1;
	}
	return l;
}

int main() {
	// base1[0] = base2[0] = base3[0] = 1;
	base1[0] = 1;
	// for (int i = 1; i <= MAXN; i++) base[i] = base[i - 1] * BASE % MOD;
	for (register int i = 1; i <= MAXN; i++) {
		base1[i] = base1[i - 1] * BASE1;
		// base2[i] = base2[i - 1] * BASE2;
		// base3[i] = base3[i - 1] * BASE3;
	}

	int t;
	scanf("%d", &t);
	while (t--) {
		scanf("%s", s);
		n = strlen(s);
		for (register int i = 0; i < n; i++) s[i] -= 'a' - 1;

		// hash1[0] = hash2[0] = hash3[0] = s[0];
		hash1[0] = s[0];
		// for (int i = 1; i < n; i++) hash[i] = (hash[i - 1] * BASE + s[i]) % MOD;
		for (register int i = 1; i < n; i++) {
			hash1[i] = (hash1[i - 1] * BASE1 + s[i]);
			// hash2[i] = (hash2[i - 1] * BASE2 + s[i]);
			// hash3[i] = (hash3[i - 1] * BASE3 + s[i]);
		}

		for (register int k = 1; k <= n / 2; k++) {
			// printf("k = %d\n", k);
			for (register int i = 0; i < n; i += k) {
				const register int a = std::min(lcs(i, i + k), k) - 1, b = std::min(lcp(i, i + k), k);
				// printf("lcs(%d, %d) - 1 = %d, lcp(%d, %d) = %d\n", i, i + k, a, i, i + k, b);
				if (a + b >= k) {
					register int l, r;
					l = i + k + k - a - 1, r = l + (a + b - k);
					// l = std::max(i + k + k - a, i + k), r = std::min(l + (a + b - k), i + k + k - 1);
					// printf("[%d, %d]\n", l, r);
					// for (int i = l; i <= r; i++) backward[i]++;
					backward[l]++, backward[r + 1]--;
					r = r - 2 * k + 1, l = l - 2 * k + 1;
					// for (int i = l; i <= r; i++) forward[i]++;
					forward[l]++, forward[r + 1]--;
				}
			}
		}

		for (register int i = 1; i < n; i++) forward[i] += forward[i - 1], backward[i] += backward[i - 1];

		register long long ans = 0;
		for (register int i = 1; i < n; i++) ans += backward[i - 1] * forward[i];

		for (register int i = 0; i < n; i++) {
			hash1[i] = 0;
			// hash2[i] = 0;
			// hash3[i] = 0;
			backward[i] = forward[i] = 0;
		}
		forward[n] = backward[n] = 0;

		printf("%lld\n", ans);
	}

	return 0;
}
```