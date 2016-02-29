title: 自动将 LaTex 代码转义为 Markdown 格式的小程序
categories: Geek
tags: 
  - Markdown
  - LaTex
  - GitHub
permalink: markdown-latex-helper
id: 39
updated: '2016-01-27 13:28:28'
date: 2016-01-24 23:43:18
---

### 项目地址
https://github.com/Menci/markdown-latex-helper

### 功能
写文章时经常用 LaTex 来写公式，因为这样可以通过 MathJax 来方便地渲染。

但是 LaTex 代码中的一些符号（如 `*` 和 `~`）会与 Markdown 语法冲突。于是，就有了这个小程序，它可以自动把文档中的 LaTex 代码转义为 Markdown 的格式。

<!-- more -->

使用前
```latex
\phi(n)={\sum_{S{\subseteq}\{p_1,p_2,\ldots,p_k\}}{(-1)^{|S|}} * {\frac{n}{ {\prod_{ {p_i}{\in}S} } \ p_i }}}
```

使用后
```latex
\\phi\(n\)=\{\\sum\_\{S\{\\subseteq\}\\\{p\_1\,p\_2\,\\ldots\,p\_k\\\}\}\{\(\-1\)^\{|S|\}\} \*  \{\\frac\{n\}\{ \{\\prod\_\{ \{p\_i\}\{\\in\}S\} \} \\ p\_i \}\}\}
```

### 编译与使用
```bash
$ clang++ markdown-latex-helper.cpp -o markdown-latex-helper -std=c++11
```

`clang++` 可以换成你喜欢的编译器，注意 `-std=c++11` 不能省。

```bash
$ markdown-latex-helper < infile.md > outfile.md
```

使用的时候要通过命令行，暂时没有图形界面。