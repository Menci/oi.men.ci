title: GDB 入门教程
categories: OI
tags: 
  - GDB
  - 调试
  - C++
permalink: gnu-debugger
id: 41
updated: '2016-02-05 10:59:41'
date: 2016-02-05 10:58:07
---

GDB（GNU Debugger）是 GNU 计划中的标准调试器，可以在 UNIX、Linux 和 Windows 下运行，支持多种语言（如 C、C++、Pascal 等）程序的调试。

<!-- more -->

### 安装
#### Linux
在 Ubuntu 及其衍生版本下，使用 `apt` 安装 GDB。
```bash
sudo apt-get install gdb
```
另外，NOI Linux 也中有预装的 GDB。

在 RHEL/Fedora/Archlinux 下，使用其各自的包管理器来安装 GDB。
```bash
sudo yum install gdb  # RHEL
sudo dnf install gdb  # Fedora
sudo pacman -S gdb    # Archlinux
```

#### Windows
在 Windows 下，可选择 Cygwin/MSYS2 环境，也需使用其各自的包管理器来安装 GDB，但通常使用更加轻量的 MinGW 工具集。

一般地，Dev-C++ 安装时会配带 MinGW，我们可以在其 `bin` 目录下找到 `gdb.exe`，为了方便，我们通常将 `bin` 目录的路径添加进 `PATH` 环境变量中，这样我们就可以直接在 `cmd` 中执行 `gdb` 命令。

### 启动
在控制台中输入 `gdb` 命令（Windows 系统有时需要手动配置环境变量），启动 GDB：
```bash
gdb
```
在 GDB 中，用 `file` 命令指定需要被调试的程序：
```bash
(gdb) file test
```
或者，也可以直接在启动 GDB 的时候指定需要被调试的程序：
```bash
gdb test
```
其中 `test` 为被调试的程序的可执行文件名。

需要注意的是，被 GDB 调试的程序，**在编译时需要加上 `-g` 选项，表示在生成的可执行文件中包含调试信息**。
```bash
g++ test.cpp -o test -g
fpc test.cpp -g
```
GDB 启动时的提示大概是酱紫的：
```bash
Menci@Menci-Laptop:~$ gdb
GNU gdb (Ubuntu 7.10-1ubuntu2) 7.10
Copyright (C) 2015 Free Software Foundation, Inc.
License GPLv3+: GNU GPL version 3 or later <http://gnu.org/licenses/gpl.html>
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.  Type "show copying"
and "show warranty" for details.
This GDB was configured as "x86_64-linux-gnu".
Type "show configuration" for configuration details.
For bug reporting instructions, please see:
<http://www.gnu.org/software/gdb/bugs/>.
Find the GDB manual and other documentation resources online at:
<http://www.gnu.org/software/gdb/documentation/>.
For help, type "help".
Type "apropos word" to search for commands related to "word".
(gdb) 
```

### 运行
使用 `run`（简写为 `r`）命令运行被调试的程序。
```bash
(gdb) run
```
之后可以像直接运行程序一样输入数据并获得输出，程序正常退出时，会得到类似于以下的提示：
```bash
[Inferior 1 (process 52800) exited with code 1]
```
如果程序出现运行时错误（Runtime Error，RE），则会有一下提示，此时程序中断（以访问无效内存为例）：
```bash
Program received signal SIGSEGV, Segmentation fault.
0x0000000000400598 in main () at test.cpp:6
6		aby[8999999999990] = 1;
```
其中 `SIGSEGV` 表示程序中断的信号，后面跟着解释文本“Segmentation fault”，即“段错误”。中间一行是程序中断所在函数及其调用参数，下面一行是程序中断所在行的代码，开头 `6` 为行号。

出现这种情况时，我们可以使用各种调试命令对其进行调♂试。

### 退出
使用 `quit`（简写为 `q`）命令退出。

如果程序正常运行结束，则 `q` 命令会成功退出 GDB，否则我们将会收到类似如下的提示：
```bash
(gdb) q
A debugging session is active.

	Inferior 1 [process 52800] will be killed.

Quit anyway? (y or n) 
```
这时候输入 `y` 后回车，可以强制杀死被调试的进行并退出 GDB。

### 断点
使用 `break`（简写为 `b`）命令设置断点，后跟一个行号或者函数名，之后程序会在执行到该行时中断。
```bash
(gdb) b 9
Breakpoint 1 at 0x4004fa: file test.cpp, line 9.
```
```bash
(gdb) b main
Breakpoint 1 at 0x4004fa: file test.cpp, line 9.
```
`break` 命令也可以在断点位置后跟一个条件，仅当该条件为真时程序中断。
```c++
#include <cstdio>

int main() {
	int a;
	scanf("%d", &a);
	printf("%dn", a);
	return 0;
}
```
```bash
(gdb) b 6 if a == 528
```
使用 `r` 运行程序，当你输入 `528` 时，程序中断，否则程序继续运行。

Pascal 在设置条件断点时会有所不同，如这里的 `==` 需要改为 `=`。

### 控制
使用 `continue`（简写为 `c`）命令使中断的程序继续运行。

注意，这里“中断的程序”指的是**通过断点中断**的程序，而不是**运行时错误**而中断的，如果我们强制让一个运行时错误的程序继续运行 …… 你猜它会怎样 ……

使用 `step`（简写为 `s`）命令使中断的程序执行一行，如果该行有函数调用，程序将跟踪进入函数，在函数体的第一行中断。
```c++
int foo() {
	return 2333;
}

int main() {
	foo();
	return 0;
}
```
```bash
(gdb) b 6
Breakpoint 1 at 0x40058f: file test.cpp, line 6.
(gdb) r
Starting program: /home/Menci/test 

Breakpoint 1, main () at test.cpp:6
6		foo();
(gdb) s
foo () at test.cpp:2
2		return 2333;
```
或者，你想让我用 Pascal 来演示一下的话，是酱紫的：
```pascal
Program Test;
Function Foo(): Longint;
Begin
        Exit(2333);
End;
Begin
        Foo();
End.
```
```bash
(gdb) b 7
Breakpoint 1 at 0x4001c1: file test.pas, line 7.
(gdb) r
Starting program: /home/Menci/test 

Breakpoint 1, main () at test.pas:7
7		Foo();
(gdb) s
FOO () at test.pas:4
4		Exit(2333);
```
使用 `next`（简写为 `n`）命令使中断的程序执行一行，如果该行有函数调用，程序将**不**跟踪进入函数，直接在下一行中断。

源程序不变，执行效果如下：
```bash
(gdb) b 6
Breakpoint 1 at 0x40058f: file test.cpp, line 6.
(gdb) r
Starting program: /home/Menci/test 

Breakpoint 1, main () at test.cpp:6
6		foo();
(gdb) n
7		return 0;
```
```bash
(gdb) b 7
Breakpoint 1 at 0x4001c1: file test.pas, line 7.
(gdb) r
Starting program: /home/Menci/test 

Breakpoint 1, main () at test.pas:7
7		Foo();
(gdb) n
8	End.
```

### 监视
在 GDB 中，可以对表达式的值进行监视。

使用 `print`（简写为 `p`）命令输出一个表达式的值，这里的表达式可以只是一个变量，也可以是包含了多个函数调用的复杂表达式。

来看这个经典的 A + B 问题：
```c++
#include <cstdio>

int main() {
	int a, b;
	scanf("%d %d", &a, &b);
	printf("%dn", a + b);
	return 0;
}
```
```bash
(gdb) b 6
Breakpoint 1 at 0x400642: file test.cpp, line 6.
(gdb) r
Starting program: /home/Menci/test 
233 2333

Breakpoint 1, main () at test.cpp:6
6		printf("%dn", a + b);
(gdb) p a
$1 = 233
(gdb) p b
$2 = 2333
```
使用 `display`（简写为 `disp`）命令持续监视某个表达式的值。
```c++
#include <cstdio>

int doSomething(int x) {
	return x * 10;
}

int main() {
	int n = 10;
	for (int i = 0; i < n; i++) {
		printf("i = %dn", i);
	}
	return 0;
}
```
```bash
(gdb) b 10
Breakpoint 1 at 0x400603: file test.cpp, line 10.
(gdb) r
Starting program: /home/Menci/test 

Breakpoint 1, main () at test.cpp:10
10			printf("i = %dn", i);
(gdb) disp doSomething(i)
1: doSomething(i) = 0
(gdb) n
i = 0
9		for (int i = 0; i < n; i++) {
1: doSomething(i) = 0
(gdb) n

Breakpoint 1, main () at test.cpp:10
10			printf("i = %dn", i);
1: doSomething(i) = 10
(gdb) n
i = 1
9		for (int i = 0; i < n; i++) {
1: doSomething(i) = 10
(gdb) n

Breakpoint 1, main () at test.cpp:10
10			printf("i = %dn", i);
1: doSomething(i) = 20
(gdb) n
i = 2
```
在 GDB 7.0 之后的版本，可以直接使用 `p` 命令输出 STL 容器的内容。

### 栈
在函数调用时，系统栈会储存函数的调用信息，使用 `backtrace`（简写为 `bt`）命令查看调用栈。

为了方便演示，我们写一个使系统栈溢出的函数来演示。
```c++
int fac(int x) {
	if (x == 0) return 1;
	else return x * fac(x - 1);
}

int main() {
	int x = fac(1000000000);
	return 0;
}
```
```bash
(gdb) r
Starting program: /home/Menci/test 

Program received signal SIGSEGV, Segmentation fault.
0x00000000004005a5 in fac (x=999737953) at test.cpp:3
3		else return x * fac(x - 1);
(gdb) bt
#0  0x00000000004005a5 in fac (x=999737953) at test.cpp:3
#1  0x00000000004005aa in fac (x=999737954) at test.cpp:3
#2  0x00000000004005aa in fac (x=999737955) at test.cpp:3
#3  0x00000000004005aa in fac (x=999737956) at test.cpp:3
#4  0x00000000004005aa in fac (x=999737957) at test.cpp:3
#5  0x00000000004005aa in fac (x=999737958) at test.cpp:3
```
（以上省略 272043 行）

`bt` 命令可以看到函数的调用信息，同时调用参数、调用位置（行号）也会被显示。

使用 `frame` 命令切换正在调试的函数上下文。
```c++
int a(int x) {
	return x - 4;
}

int b(int x) {
	return a(x * 3);
}

int c(int x) {
	return b(x + 10);
}

int d(int x) {
	return c(x / 2);
}

int main() {
	int x = d(4);
	return 0;
}
```
```bash
(gdb) b 2
Breakpoint 1 at 0x400577: file test.cpp, line 2.
(gdb) r
Starting program: /home/Menci/test 

Breakpoint 1, a (x=36) at test.cpp:2
2		return x - 4;
(gdb) bt
#0  a (x=36) at test.cpp:2
#1  0x00000000004005a7 in b (x=12) at test.cpp:6
#2  0x00000000004005c9 in c (x=2) at test.cpp:10
#3  0x00000000004005f5 in d (x=4) at test.cpp:14
#4  0x0000000000400619 in main () at test.cpp:18
(gdb) frame 3
#3  0x00000000004005f5 in d (x=4) at test.cpp:14
14		return c(x / 2);
(gdb) p x
$1 = 4
```
从例子中我们看到，`frame 3` 命令使当前上下文切换到了 `d(x)` 函数中，此时 `p x` 输出的值为 `4`，与我们调用时所传递的值相同。

`frame` 命令在调试在 STL 中崩溃的程序时有很大作用，我们需要切换到自己的函数的上下文中，而不是对 STL 进行调试。

### 查看代码
使用 `list`（简写为 `l`）命令查看部分代码，后跟一个行号，表示查看从该行开始若干行的代码。

```bash
(gdb) l 1
1	int a(int x) {
2		return x - 4;
3	}
4	
5	int b(int x) {
6		return a(x * 3);
7	}
8	
9	int c(int x) {
10		return b(x + 10);
```
