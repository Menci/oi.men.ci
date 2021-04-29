title: 「集训队互测 2015」未来程序 · 改 - 编译原理
categories:
  - OI
tags:
  - Python
  - UOJ
  - 编译原理
  - 集训队互测
permalink: uoj-98
date: '2017-02-14 16:01:00'
---

在 2111 年，第 128 届全国青少年信息学奥林匹克冬令营前夕，Z 君找到了 2015 年，第 32 届冬令营的题目来练习。

他打开了第三题「未来程序」这道题目：

「本题是一道提交答案题，一共 10 个测试点。

对于每个测试点，你会得到一段程序的源代码和这段程序的输入。你要运行这个程序，并保存这个程序的输出。

遗憾的是这些程序都效率极其低下，无法在比赛的 5 个小时内得到输出。」

Z 君想了一下，决定用 2111 年的计算机来试着运行这个题目，但是问题来了，Z 君已经找不到 96 年前的那次比赛的测试数据了 ……

没有给出输入数据的提交答案题就不成其「提交答案题」之名，为了解决这个问题，Z 君决定将这个题目改造成传统题。

Z 君知道 96 年前的计算机的性能比现在差多了，所以这道题的测试数据中，输入数据的规模被设计成很小，从而，做这道题的选手只需要暴力模拟源代码的工作流程就可以通过它。

现在这道题摆到了你的面前。

本题是一道传统题，一共有 10 个测试点。

对于每个测试点，你的程序会得到一段程序的源代码和这段程序的输入。你的程序需要运行这段程序，并输出这段程序的输出。

<!-- more -->

### 链接

[UOJ #98](http://uoj.ac/problem/98)

### 题解

题目要求编写一个 C++（的子集）解释器，一个可行的思路是，将 C++ 代码编译为等价的 Python 代码，然后调用 `exec()` 执行 Python 代码；同时，Python 的字符串处理非常方便，对于这道题来说是一个不错的选择。

先说 Parser。

从顶层做起，顶层只可能是函数或者全局变量定义，并且一定以一个 `int` 开始。向后读，读到 `(`、`,` 或 `;` 停止，如果读到了 `(`，表示这是一个函数定义，接下来读到 `)` 停止，得到参数列表，以 `,` 分割并解析参数列表，然后读取并解析函数体即可；如果读到 `,`，表示这是一条全局变量定义，并且定义了多个全局变量，接下来继续读到 `;` 停止，可以读取出定义的所有的变量，以 `,` 分割并解析变量列表即可；如果读到 `;`，则表示是单条变量定义，直接解析即可。

我们可以将函数体看作一个「复合语句」，接下来只需要考虑语句的解析即可。

对于一个语句的分析，首先从头开始读到空白字符停止。

* 如果读到了 `{`，则这是一个复合语句，向后读匹配的括号，读到 `}` 停止，即可得到整个复合语句，去除外层的花括号，继续递归处理里面的语句即可。
* 如果读到了 `if`，读匹配括号取出判断条件，对于之后的部分递归处理一个语句，如果接下来是 `else`，则再递归处理一个语句。
* 如果读到了 `while` 或者 `for`，读括号内部的内容，对于 `for`，可以直接用 `;` 分割三个语句，之后递归处理一个语句。
* 如果读到了 `int`，则这是一个变量定义，读到 `;`，以 `,` 分割即可。
* 否则，这是一个普通语句，读到 `;` 停止即可。

注意到，给出的代码中没有字符串常量，所以读到某符号停止不会受到干扰。

这样，我们就得到了一棵语句级别的 AST，接下来考虑表达式语法的处理。

对于普通变量，这里的方法是，定义一个变量容器的类型，重载它的一些运算符。`=`、`&&`、`||`、`!` 四个运算符找不到对应优先级的可重载的 Python 运算符，前三个的解决方法是将其转化为函数调用，对于 `!`，可以替换为 `X **`，其中 `X` 是一个对象，我们定义 `X ** a` 的返回值为将 `a` 取反 —— 因为 `**` 运算符没有被用到，并且它的优先级类似于 `!`。对于 `cin`、`cout` 的 `>>` 和 `<<`，可以替换它们，在两边加上括号，如 `cin >> <expr> >> <expr2>` 替换为 `(cin) >> (<expr>) >> (<expr2>)`。

数组，对于多维数组，我们可以计算其大小，并为其写一个寻址器，每一维的 `[]` 会返回下一维的寻址器，最后一维的 `[]` 返回变量的容器。这里还有一个小小的 Trick —— 对于没有访问到的数组，不实际为其分配空间，可以节省很多时间。

再接下来，我们需要生成与 AST 等价的 Python 代码。

具体的思路仍然是递归，对于一个复合语句，在需要增加一级缩进。变量的定义需要被生成为变量容器的构造。

一个问题是变量的作用域，复合语句内部的变量会遮蔽外部的变量 —— 解决方法是给每次变量定义分配一个唯一的 ID，将所有语句变量名替换为 ID + 原变量名即可。

`for` 语句的处理，对于一个这样的 `for` 语句：

```cpp
for (int i; i < n; i = i + 1) {
    s = s + i;
    cout << i << endl;
}
```

转化为：

```cpp
if (1) {
    int i;
    while (i < n) {
        s = s + i;
        cout << i << endl;
    }
    i = i + 1;
}
```

注意全局变量必须在每个函数开头声明 `global VAR`，如果某一个全局变量与参数重名，则不再声明这个全局变量。

题目中的递归深度很大，可以通过 `sys.setrecursionlimit(1000000)` 增大 Python 的递归深度限制。

### 代码

```python
#!/usr/bin/python3

# 用于辅助代码执行的类与函数
class IntegerVariable:
    def __init__(self, x):
        if (isinstance(x, IntegerVariable)):
            self.val = x.val
        else:
            self.val = int(x)

    def __repr__(self):
        return repr(self.val)

    def __add__(self, x):
        if (not isinstance(x, IntegerVariable)):
            x = IntegerVariable(x)
        return IntegerVariable(self.val + x.val)

    def __radd__(self, x):
        if (not isinstance(x, IntegerVariable)):
            x = IntegerVariable(x)
        return IntegerVariable(x.val + self.val)

    def __sub__(self, x):
        if (not isinstance(x, IntegerVariable)):
            x = IntegerVariable(x)
        return IntegerVariable(self.val - x.val)

    def __rsub__(self, x):
        if (not isinstance(x, IntegerVariable)):
            x = IntegerVariable(x)
        return IntegerVariable(x.val - self.val)

    def __mul__(self, x):
        if (not isinstance(x, IntegerVariable)):
            x = IntegerVariable(x)
        return IntegerVariable(self.val * x.val)

    def __rmul__(self, x):
        if (not isinstance(x, IntegerVariable)):
            x = IntegerVariable(x)
        return IntegerVariable(x.val * self.val)

    def __floordiv__(self, x):
        if (not isinstance(x, IntegerVariable)):
            x = IntegerVariable(x)
        return IntegerVariable(self.val // x.val)

    def __rfloordiv__(self, x):
        if (not isinstance(x, IntegerVariable)):
            x = IntegerVariable(x)
        return IntegerVariable(x.val // self.val)

    def __mod__(self, x):
        if (not isinstance(x, IntegerVariable)):
            x = IntegerVariable(x)
        return IntegerVariable(self.val % x.val)

    def __rmod__(self, x):
        if (not isinstance(x, IntegerVariable)):
            x = IntegerVariable(x)
        return IntegerVariable(x.val % self.val)

    def __lt__(self, x):
        if (not isinstance(x, IntegerVariable)):
            x = IntegerVariable(x)
        return IntegerVariable(self.val < x.val)

    def __le__(self, x):
        if (not isinstance(x, IntegerVariable)):
            x = IntegerVariable(x)
        return IntegerVariable(self.val <= x.val)

    def __eq__(self, x):
        if (not isinstance(x, IntegerVariable)):
            x = IntegerVariable(x)
        return IntegerVariable(self.val == x.val)

    def __ne__(self, x):
        if (not isinstance(x, IntegerVariable)):
            x = IntegerVariable(x)
        return IntegerVariable(self.val != x.val)

    def __gt__(self, x):
        if (not isinstance(x, IntegerVariable)):
            x = IntegerVariable(x)
        return IntegerVariable(self.val > x.val)

    def __ge__(self, x):
        if (not isinstance(x, IntegerVariable)):
            x = IntegerVariable(x)
        return IntegerVariable(self.val >= x.val)

    def __xor__(self, x):
        if (not isinstance(x, IntegerVariable)):
            x = IntegerVariable(x)
        return IntegerVariable(self.val ^ x.val)

    def __rxor__(self, x):
        if (not isinstance(x, IntegerVariable)):
            x = IntegerVariable(x)
        return IntegerVariable(x.val ^ self.val)

    def assign_with(self, x):
        if (not isinstance(x, IntegerVariable)):
            x = IntegerVariable(x)
        self.val = x.val
        return self

def logical_and(x, y):
    if (not isinstance(x, IntegerVariable)):
        x = IntegerVariable(x)
    if (not isinstance(y, IntegerVariable)):
        y = IntegerVariable(y)
    return IntegerVariable((x.val != 0) and (y.val != 0))

def logical_or(x, y):
    if (not isinstance(x, IntegerVariable)):
        x = IntegerVariable(x)
    if (not isinstance(y, IntegerVariable)):
        y = IntegerVariable(y)
    return IntegerVariable((x.val != 0) or (y.val != 0))

# 将逻辑非（'!'）运算符转化为乘方（'**'）运算符
class LogicalNotHelper:
    def __pow__(self, x):
        if (not isinstance(x, IntegerVariable)):
            x = IntegerVariable(int(x))
        return IntegerVariable(int(not x.val))

logical_not = LogicalNotHelper()

class ArrayAccessProxy:
    def __init__(self, l, length, lengths, curr_dim, curr_pos):
        self.l = l
        self.length = length
        self.lengths = lengths
        self.curr_dim = curr_dim
        self.curr_pos = curr_pos

    def __getitem__(self, x):
        new_length = self.length // self.lengths[self.curr_dim]
        new_pos = self.curr_pos + x * new_length
        if self.curr_dim + 1 == len(self.lengths):
            return self.l[new_pos]
        else:
            return ArrayAccessProxy(self.l, new_length, self.lengths, self.curr_dim + 1, new_pos)

    def __setitem__(self, x, val):
        new_length = self.length // self.lengths[self.curr_dim]
        new_pos = self.curr_pos + x * new_length
        if self.curr_dim + 1 == len(self.lengths):
            self.l[new_pos] = IntegerVariable(val)
        else:
            raise TypeError('Assign to a Array')

class Array:
    def __init__(self, lengths):
        self.lengths = lengths
        self.length = 1
        for i in lengths:
            self.length *= i
        self.l = None

    def __repr__(self):
        return repr(self.l)

    def construct(self):
        if not self.l:
            self.l = [IntegerVariable(0) for i in range(0, self.length)]

    def __getitem__(self, x):
        if not self.l:
            self.construct()

        if isinstance(x, IntegerVariable):
            x = x.val
        if len(self.lengths) == 1:
            return self.l[x]
        else:
            new_length = self.length // self.lengths[0]
            new_pos = x * new_length
            return ArrayAccessProxy(self.l, new_length, self.lengths, 1, new_pos)

    def __setitem__(self, x, val):
        if not self.l:
            self.construct()

        if (not isinstance(x, IntegerVariable)):
            x = IntegerVariable(x)
        if len(self.lengths) == 1:
            self.l[x.val] = val
        else:
            raise TypeError('Assign to a Array')

class OutputStream:
    def __lshift__(self, x):
        if isinstance(x, EndLine):
            print('\n', end = '')
        elif isinstance(x, IntegerVariable):
            print(x.val, end = '')
        else:
            print(x, end = '')
        return self

class InputStream:
    def __init__(self):
        self.index = 0

    def __rshift__(self, x):
        x.val = self.data[self.index]
        self.index += 1
        return self

class EndLine:
    def __init__(self):
        pass

cout = OutputStream()
cin = InputStream()
endl = EndLine()

def variable(array_lengths):
    if array_lengths == None or len(array_lengths) == 0:
        return IntegerVariable(0)
    else:
        return Array(array_lengths)

def get_value(x):
    if not isinstance(x, IntegerVariable):
        return x
    else:
        return x.val

def init_arg(x):
    if isinstance(x, IntegerVariable):
        return IntegerVariable(x.val)
    else:
        return IntegerVariable(int(x))

def putchar(ch):
    print(chr(get_value(ch)), end = '')

# 读取输入数据，初始化 cin 输入流
def init_input_stream():
    def read_integers():
        return list(map(int, str(input()).split(' ')))
    a = read_integers()
    data = []
    n = a.pop(0)
    for i in range(0, n):
        if len(a) == 0:
            a = read_integers()
        data.append(a.pop(0))
    cin.data = data

# 从字符串最右边向左取出尽量多的字符，直到下一个字符会导致括号不能匹配或【下一个字符为逗号（','）且当前的括号是匹配的】
def left_until_nearest_unmatched_bracket_or_comma(s):
    right_bracket_count = 0
    res = ''
    while len(s) > 0:
        ch = s[-1:]
        if ch == ',':
            if right_bracket_count == 0:
                break
        elif ch in ')]}':
            right_bracket_count += 1
        elif ch in '([{':
            right_bracket_count -= 1
            if right_bracket_count < 0:
                break
        res = ch + res
        s = s[:-1]
    return s, res

# 从字符串最左边向右取出尽量多的字符，直到下一个字符会导致括号不能匹配或【下一个字符为逗号（','）且当前的括号是匹配的】
def right_until_nearest_unmatched_bracket_or_comma(s):
    left_bracket_count = 0
    res = ''
    while len(s) > 0:
        ch = s[:1]
        if ch == ',':
            if left_bracket_count == 0:
                break
        elif ch in '([{':
            left_bracket_count += 1
        elif ch in ')]}':
            left_bracket_count -= 1
            if left_bracket_count < 0:
                break
        res += ch
        s = s[1:]
    return s, res

# 转化赋值运算符为函数调用
def transform_expression_assignment(s):
    s = s.strip()
    pos = s.find('=')

    # 找到的等号是不等于（!=）、等于（==）、大于等于（>=）、小于等于（<=）运算符的一部分
    while pos != -1 and (s[pos + 1] == '=' or s[pos - 1] in '!><'):
        pos = s.find('=', pos + 2)

    # 找不到赋值运算符
    if pos == -1:
        return s

    left = s[:pos].strip()
    left, left_exp = left_until_nearest_unmatched_bracket_or_comma(left)
    right = s[pos + 1:].strip()
    right, right_exp = right_until_nearest_unmatched_bracket_or_comma(right)
    return '%s((%s).assign_with(%s))%s' % (left, left_exp, transform_expression_assignment(right_exp), transform_expression_assignment(right))

# 转化逻辑运算符为函数调用
def transform_expression_logical_operators(s, op, function_name):
    s = s.strip()
    pos = s.find(op)

    # 找不到对应的运算符
    if pos == -1:
        return s

    left = s[:pos].strip()
    left, left_exp = left_until_nearest_unmatched_bracket_or_comma(left)
    right = s[pos + 2:].strip()
    right, right_exp = right_until_nearest_unmatched_bracket_or_comma(right)
    # print('transform_expression_logical_operators(%s): left = "%s", right = "%s"' % (op, left, right))
    return '%s(%s(%s, %s))%s' % (left, function_name, left_exp, transform_expression_logical_operators(right_exp, op, function_name), transform_expression_logical_operators(right, op, function_name))

# 转化运算符
def transform_expression_operators(s):
    # 将 '!exp' 替换为 'logical_not ** exp'
    s = s.replace('!=', '$')
    s = s.replace('!', 'logical_not ** ')
    s = s.replace('$', '!=')
    # 将 '/' 替换为 '//'
    # 保证之前替换过的不会再次替换
    s = s.replace('//', '/')
    s = s.replace('/', '//')
    return s

# 对表达式进行转化
def transform_expression(s):
    def transform(s):
        s = transform_expression_operators(s)
        s = transform_expression_logical_operators(s, '||', 'logical_or')
        s = transform_expression_logical_operators(s, '&&', 'logical_and')
        s = transform_expression_assignment(s)
        return s

    last_l = len(s)
    last_r = 0
    while True:
        # 从右向左找更靠右的圆括号（'('）或方括号（'['）
        l_round = s.rfind('(', 0, last_l)
        l_box = s.rfind('[', 0, last_l)

        if l_round == -1 and l_box == -1:
            break

        # 优先处理更靠右的
        right_bracket = ')' if l_round > l_box else ']'
        l = l_round if l_round > l_box else l_box

        left = s[:l + 1]
        right, mid = right_until_nearest_unmatched_bracket_or_comma(s[l + 1:])

        # r = s.find(right_bracket, l + 1)

        # print('transform_expression(): Find expression %s' % s[l + 1:r])

        # s = s[:l + 1] + transform(s[l + 1:r]) + s[r:]
        s = left + transform(mid) + right
        last_l = l

    return transform(s)

# 跳过开头的 3 行
def skip_header():
    for i in range(0, 3):
        input()

# 读代码，即从当前标准输入读到文件结束
def read_code():
    code = ''
    while True:
        try:
            code += input() + '\n'
        except EOFError:
            break
    return code

# 判断一个字符（串）是否为空字符
def is_empty(str):
    return not str.strip()

# 增加一级缩进（4 个空格）
def indent(code):
    return '\n'.join(list(map(lambda s: '    ' + s, code.split('\n'))))

# 文本处理器
class Tokenizer:
    def __init__(self, s):
        self.s = s
        self.pos = 0

    # 读取下一个字符，但不改变当前位置
    def peek(self):
        if self.pos == len(self.s):
            raise IndexError('peek() reached end of string')

        return self.s[self.pos]

    # 读取下一个字符，并将当前位置向后移动一个字符
    def next(self):
        if self.pos == len(self.s):
            raise IndexError('next() reached end of string')

        ch = self.s[self.pos]
        self.pos += 1
        return ch

    # 将当前位置向前移动一个字符
    def back(self):
        if self.pos == 0:
            raise IndexError('back() reached begin of string')
        self.pos -= 1

    # 向后读取，直到读到空白字符
    def next_until_empty(self):
        s = ''
        while is_empty(self.peek()):
            self.next()
        while self.pos < len(self.s) and (not is_empty(self.peek())):
            s += self.next()
        return s

    # 向后读取，直到读到空白字符，不改变当前位置
    def peek_until_empty(self):
        pos_bak = self.pos
        res = self.next_until_empty()
        self.pos = pos_bak
        return res

    # 向后读取，直到读到 `strings` 中的任何一个字符串停止，不改变当前位置
    # 返回一个二元组，读到的字符串（不包含结束字符串）和结束字符串
    def peek_until(self, strings):
        pos_bak = self.pos
        res = self.next_until(strings)
        self.pos = pos_bak
        return res

    # 向后读取，直到读到 `strings` 中的任何一个字符串停止
    # 返回一个二元组，读到的字符串（不包含结束字符串）和结束字符串
    def next_until(self, strings):
        s = ''
        while is_empty(self.peek()):
            self.next()
        while True:
            for i in strings:
                if s.endswith(i):
                    return s[:len(s) - len(i)], i
            s += self.next()

    # 向后读取一个括号匹配的块
    # 这里并没有保证对应匹配（即比如 ] 可以匹配 (），因为题目保证源代码合法
    def next_brackets_block(self):
        left_count = 0
        s = ''
        while True:
            ch = self.next()
            s += ch
            if ch in '([{':
                left_count += 1
            elif ch in '}])':
                left_count -= 1
                if left_count == 0:
                    return s.strip()

# 替换整个 Token
def replace_token(s, to_replace, replace_with):
    def is_part_of_token(ch):
        if ord(ch) >= ord('A') and ord(ch) <= ord('Z'):
            return True
        if ord(ch) >= ord('a') and ord(ch) <= ord('z'):
            return True
        if ord(ch) >= ord('0') and ord(ch) <= ord('9'):
            return True
        if ch == '_':
            return True
        return False
    last_l = len(s)
    while True:
        l = s.rfind(to_replace, 0, last_l)
        if l == -1:
            break

        last_l = l
        r = l + len(to_replace) - 1

        if (l - 1 >= 0 and is_part_of_token(s[l - 1])) or (r + 1 < len(s) and is_part_of_token(s[r + 1])):
            continue

        s_l = s[:l]
        s_r = s[r + 1:]
        s = s_l + replace_with + s_r

    return s

# 应用变量名映射
def apply_var_map(expression, var_map):
    for x in var_map:
        expression = replace_token(expression, x, var_map[x])
    return expression

# 生成表达式
def generate_expression(expression, var_map):
    return transform_expression(apply_var_map(expression, var_map))

# 一些语句相关的结构体

global_variables = []

# 变量或数组变量
class VariableDeclaration:
    def __init__(self, name, array_lengths):
        self.name = name
        self.array_lengths = array_lengths

    def __repr__(self):
        return '<VariableDeclaration name=%s array_lengths=%s>' % (repr(self.name), repr(self.array_lengths))

    def generate(self, var_map):
        # 如果 var_map 为 None，则表示这是一条全局变量定义
        name = self.name if var_map == None else var_map[self.name]
        if self.array_lengths == None:
            # 非数组变量
            return '%s = variable(None)' % name
        else:
            # 数组变量
            array_lengths = ', '.join(list(map(lambda x: str(x), self.array_lengths)))
            return '%s = variable([%s])' % (name, array_lengths)

# 表达式语句
class ExpressionStatement:
    def __init__(self, expression):
        self.expression = expression

    def __repr__(self):
        return '<ExpressionStatement expression=%s>' % repr(self.expression)

    def generate(self, var_map):
        expression = generate_expression(self.expression, var_map)
        if expression.find('<<') != -1:
            expression = '(%s)' % expression.replace('<<', ') << (')
        elif expression.find('>>') != -1:
            expression = '(%s)' % expression.replace('>>', ') >> (')
        return expression

    def get_var_map(self):
        return {}

# 返回语句
# 将可能返回的常数值转换为 IntegerVariable
class ReturnStatement:
    def __init__(self, return_value):
        self.return_value = return_value

    def __repr__(self):
        return '<ReturnStatement return_value=%s>' % repr(self.return_value)

    def generate(self, var_map):
        if self.return_value == '':
            return 'return'
        else:
            return 'return IntegerVariable(%s)' % generate_expression(self.return_value, var_map)

    def get_var_map(self):
        return {}

# if 语句
# condition 为 'if ()' 括号里面的表达式
# statement_true 为 'if ()' 后跟的语句
# statement_false 为 'else' 后跟的语句（如果没有 'else'，则为 None）
class IfStatement:
    def __init__(self, condition, statement_true, statement_false):
        self.condition = condition
        self.statement_true = statement_true
        self.statement_false = statement_false

    def __repr__(self):
        return '<IfStatement condition=%s statement_true=%s statement_false=%s>' % (repr(self.condition), repr(self.statement_true), repr(self.statement_false))

    def generate(self, var_map):
        condition = generate_expression(self.condition, var_map)
        statement_true = indent(self.statement_true.generate(var_map))
        if self.statement_false:
            statement_false = indent(self.statement_false.generate(var_map))
            return 'if get_value(%s):\n%s\nelse:\n%s' % (condition, statement_true, statement_false)
        else:
            return 'if get_value(%s):\n%s' % (condition, statement_true)

    def get_var_map(self):
        return {}

# while 语句
# condition 为 'while ()' 括号里面的表达式
# statement 为 'while ()' 后跟的语句
class WhileStatement:
    def __init__(self, condition, statement):
        self.condition = condition
        self.statement = statement

    def __repr__(self):
        return '<WhileStatement condition=%s statement=%s>' % (repr(self.condition), repr(self.statement))

    def generate(self, var_map):
        condition = generate_expression(self.condition, var_map)
        statement = indent(self.statement.generate(var_map))
        return 'while get_value(%s):\n%s' % (condition, statement)

    def get_var_map(self):
        return {}

# for 语句
# control_statements 为 'for ()' 括号里面的三个语句，表示为一个列表
# statement 为 'for ()' 后跟的语句
class ForStatement:
    def __init__(self, control_statements, statement):
        assert len(control_statements) == 3
        self.control_statements = control_statements
        self.statement = statement

    def __repr__(self):
        return '<ForStatement control_statements=%s statement=%s>' % (repr(self.control_statements), repr(self.statement))

    def generate(self, var_map):
        while_condition = self.control_statements[1].expression if self.control_statements[1] else '1'
        while_inner_statements = [self.statement] + ([self.control_statements[2]] if self.control_statements[2] else [])
        while_statement = WhileStatement(while_condition, CompoundStatement(while_inner_statements))

        if_wrapper = IfStatement('1', CompoundStatement([self.control_statements[0], while_statement]), None)
        return if_wrapper.generate(var_map)

    def get_var_map(self):
        return {}

# 复合语句
class CompoundStatement:
    def __init__(self, statements):
        self.statements = statements

    def __repr__(self):
        return '<CompoundStatement statements=%s>' % repr(self.statements)

    def generate(self, var_map):
        res = ''
        curr_var_map = dict(var_map)
        for statement in self.statements:
            curr_var_map = dict(curr_var_map, **statement.get_var_map())
            res += statement.generate(curr_var_map) + '\n'
        return res

    def get_var_map(self):
        return {}

# 变量定义
variables_declaration_id = 0
class VariablesDeclaration:
    def __init__(self, var_list):
        global variables_declaration_id
        variables_declaration_id += 1
        self.var_list = var_list
        self.id = variables_declaration_id

    def __repr__(self):
        return '<VariablesDeclaration var_list=%s>' % repr(self.var_list)

    def generate(self, var_map = None):
        # 如果 var_map 为 None，则表示这是一条全局变量定义
        return '\n'.join(list(map(lambda var: var.generate(var_map), self.var_list)))

    def get_var_map(self):
        return {variable.name: '__local_var_%d_%s' % (self.id, variable.name) for variable in self.var_list}

# 函数
class Function:
    def __init__(self, name, arg_list, body):
        self.name = name
        self.arg_list = arg_list
        self.body = body

    def __repr__(self):
        return '<Function name=%s arg_list=%s body=%s>' % (repr(self.name), repr(self.arg_list), repr(self.body))

    def generate(self):
        args = ', '.join(self.arg_list)
        init_args = '\n'.join(['%s = init_arg(%s)' % (arg, arg) for arg in self.arg_list]) + '\n'
        declare_global_variables = '\n'.join(['global %s' % variable for variable in global_variables if variable not in self.arg_list]) + '\n'
        body = indent(init_args + declare_global_variables + self.body.generate({}) + '\nreturn 0\n')
        return 'def %s(%s):\n%s' % (self.name, args, body)

# 解释器
class Parser:
    def __init__(self, code):
        self.tokenizer = Tokenizer(code)
        self.pos = 0

    # 解析参数列表
    def parse_arg_list(self, s):
        if (not s.strip()):
            return []
        # 解析参数，去掉参数类型 int
        def parse_arg(s):
            s = s.strip()
            return s[s.find(' '):].strip()
        return list(map(parse_arg, s.split(',')))

    # 解析变量列表
    def parse_var_list(self, s):
        if (not s.strip()):
            return []
        # 解析数组变量
        def parse_var(s):
            s = s.strip()
            try:
                tokenizer = Tokenizer(s)
                name, ends_with = tokenizer.next_until(['['])
                lengths = []
                try:
                    tokenizer.back()
                    while True:
                        # print(tokenizer.s[tokenizer.pos:])
                        length = tokenizer.next_brackets_block().strip()
                        length = int(length[1:-1].strip())
                        lengths.append(length)
                except IndexError:
                    pass

                return VariableDeclaration(name, lengths)
            except IndexError:
                return VariableDeclaration(s, None)
        return list(map(parse_var, s.split(',')))

    # 解析一个普通语句（或声明）
    def parse_normal_statement(self, statement):
        if statement.startswith('int '):
            # 变量定义
            var_list = self.parse_var_list(statement[4:])
            # print('Variable Declaration: %s' % var_list)
            return VariablesDeclaration(var_list)
        elif statement.startswith('return '):
            # 单独处理 return 语句，原因见 ReturnStatement 的定义
            return ReturnStatement(statement[7:].strip())
        else:
            # 表达式语句
            # print('Normal Statement: "%s"' % statement)
            return ExpressionStatement(statement)

    # 解析下一个语句
    def next_statement(self, tokenizer):
        t = tokenizer.peek_until_empty()
        # 判断流程控制语句
        if t == 'if':
            # 读取圆括号中的内容（condition）
            tokenizer.next_until(['('])
            tokenizer.back()
            condition = tokenizer.next_brackets_block()[1:-1]

            # 读取 'if ()' 后跟的语句
            statement_true = self.next_statement(tokenizer)

            # 读取 'else' 及其后跟的语句
            statement_false = None
            try:
                if tokenizer.peek_until_empty() == 'else':
                    tokenizer.next_until_empty()
                    statement_false = self.next_statement(tokenizer)
            except IndexError:
                pass

            # print('If Statement: condition = "%s", statement_true = "%s", statement_false = "%s"' % (condition, statement_true, statement_false))
            return IfStatement(condition, statement_true, statement_false)
        elif t == 'while':
            # 读取圆括号中的内容（condition）
            tokenizer.next_until(['('])
            tokenizer.back()
            condition = tokenizer.next_brackets_block()[1:-1]

            # 读取 'while ()' 后跟的语句
            statement = self.next_statement(tokenizer)

            # print('While Statement: condition = "%s", statement = "%s"' % (condition, statement))
            return WhileStatement(condition, statement)
        elif t == 'for':
            # 读取圆括号中的内容（control_statements）
            tokenizer.next_until(['('])
            tokenizer.back()
            in_bracket = tokenizer.next_brackets_block()[1:-1]
            control_statements = list(map(lambda s: self.parse_normal_statement(s.strip()), in_bracket.split(';')))

            # 读取 'for ()' 后跟的语句
            statement = self.next_statement(tokenizer)

            # print('For Statement: control_statements = "%s", statement = "%s"' % (control_statements, statement))
            return ForStatement(control_statements, statement)
        # 判断复合语句
        elif t.startswith('{'):
            tokenizer.next_until_empty()
            for i in range(0, len(t)):
                tokenizer.back()
            s = tokenizer.next_brackets_block()
            statement = self.parse_compound(s)
            # print('Compound Statement: "%s", [parsed] = "%s"' % (s, statement))

            return statement
        else:
            # 表达式语句（或声明）
            # 直接读到分号 ';' 即为一条语句
            statement, ends_with = tokenizer.next_until([';'])
            return self.parse_normal_statement(statement)

    # 解析一个复合语句
    def parse_compound(self, content):
        # 去除最外侧花括号
        content = content.strip()
        content = content[1:-1].strip()

        # 编译每一条语句（或声明）
        tokenizer = Tokenizer(content)
        statements = []

        try:
            while True:
                statements.append(self.next_statement(tokenizer))
        except IndexError:
            pass

        return CompoundStatement(statements)


    # 解析顶层（全局变量与全局函数）
    def parse_top_level(self):
        global global_variables
        l = []
        try:
            while True:
                # 顶层可包含变量定义与函数定义
                # 变量定义与函数定义的开头均为类型名
                t = self.tokenizer.next_until_empty()

                # 读取函数或变量名
                name, ends_with = self.tokenizer.peek_until(['(', ',', ';'])
                if ends_with == '(': # 以 '(' 结束了一个函数名
                    self.tokenizer.next_until(['(', ',', ';'])
                    # 读到 ')'，获取参数列表
                    arg_list, ends_with = self.tokenizer.next_until([')'])
                    arg_list = self.parse_arg_list(arg_list)
                    body = self.tokenizer.next_brackets_block()
                    body = self.parse_compound(body)
                    l.append(Function(name, arg_list, body))
                else:
                    # 变量定义
                    statement, ends_with = self.tokenizer.next_until([';'])
                    var_list = self.parse_var_list(statement)
                    global_variables += [variable.name for variable in var_list]
                    l.append(VariablesDeclaration(var_list))
        except IndexError:
            pass

        return l

    def parse(self):
        ast = self.parse_top_level()
        return ast

# 生成 Python 代码
def generate_pycode(ast):
    pycode = ''
    for node in ast:
        pycode += node.generate() + '\n'
    return pycode

import sys
# sys.stdin = open('program10.in', 'r')
sys.setrecursionlimit(1000000)

# 读入
init_input_stream()
skip_header()
code = read_code()

# 编译
parser = Parser(code)
ast = parser.parse()
# print(ast)

# 生成代码
pycode = generate_pycode(ast)

# print('\n\n\n\n\n')
# print(pycode)

try:
    exec(pycode)
    main()
except Exception as e:
    # print(e)
    raise e

# print(transform_expression('putchar(c = a * b[7], 233, k * 5 + 0)'))
```