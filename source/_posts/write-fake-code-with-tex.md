title: 用 TeX 书写伪代码
categories: OI
tags: 
  - TeX
  - 伪代码
permalink: write-fake-code-with-tex
date: 2017-01-16 10:52:00
---

举个栗子，矩阵乘法 + 快速幂（不要问我为什么是这个 ……）

$$
\renewcommand{\tab}[1]{\hskip{#1 em}\hskip{#1 em}} 

\renewcommand{\func}{\text}

\renewcommand{\if}{\textbf{If} ~~}
\renewcommand{\then}{\textbf{Then} ~~}
\renewcommand{\for}{\textbf{For} ~~}
\renewcommand{\while}{\textbf{While} ~~}
\renewcommand{\return}{\textbf{Return} ~~}
\renewcommand{\assert}{\textbf{Assert} ~~}
\renewcommand{\to}{~~ \textbf{To} ~~}
\renewcommand{\not}{\textbf{Not} ~}
\renewcommand{\and}{~ \textbf{And} ~}
\renewcommand{\or}{~ \textbf{Or} ~}
\renewcommand{\bnot}{\textbf{Bitwise-Not} ~}
\renewcommand{\band}{~ \textbf{Bitwise-And} ~}
\renewcommand{\bor}{~ \textbf{Bitwise-Or} ~}
\renewcommand{\xor}{~ \textbf{Bitwise-Xor} ~}
\renewcommand{\shr}{~ \textbf{Right-Shift} ~}
\renewcommand{\shl}{~ \textbf{Left-Shift} ~}

\renewcommand{\type}[1]{\textbf {#1} ~}

\begin{aligned}
& \tab{0} \func{Matrix-Multiple}(\type{Matrix} A, \type{Matrix} B) \\
& \tab{1} \assert \func{column}(A) = \func{row}(B) \\
& \tab{1} C \leftarrow \type{Zero-Matrix}(\func{row}(A), \func{column}(B)) \\
& \tab{1} \for i \leftarrow 1 \to \func{row}(A) \\
& \tab{2} \for j \leftarrow 1 \to \func{column}(B) \\
& \tab{3} \for k \leftarrow 1 \to \func{column}(A) \\
& \tab{4} C(i, j) \leftarrow C(i, j) + A(i, k) \times B(k, j) \\
& \tab{1} \return C

\\ \\

& \tab{0} \func{Matrix-Power}(\type{Matrix} M, \type{Integer} n) \\
& \tab{1} \assert \func{row}(M) = \func{column}(M) \\
& \tab{1} C \leftarrow \type{Unit-Matrix}(\func{row}(M), \func{column}(M)) \\
& \tab{1} \while n \neq 0 \\
& \tab{2} \if n \band 1 = 1 \\
& \tab{3} C \leftarrow \func{Matrix-Multiple}(C, M) \\
& \tab{2} M \leftarrow \func{Matrix-Multiple}(M, M) \\
& \tab{2} n \leftarrow n \shr 1 \\
& \tab{1} \return C
\end{aligned}
$$

<!-- more -->

TeX 代码：

```tex
\renewcommand{\tab}[1]{\hskip{#1 em}\hskip{#1 em}} 

\renewcommand{\func}{\text}

\renewcommand{\if}{\textbf{If} ~~}
\renewcommand{\then}{\textbf{Then} ~~}
\renewcommand{\for}{\textbf{For} ~~}
\renewcommand{\while}{\textbf{While} ~~}
\renewcommand{\return}{\textbf{Return} ~~}
\renewcommand{\assert}{\textbf{Assert} ~~}
\renewcommand{\to}{~~ \textbf{To} ~~}
\renewcommand{\not}{\textbf{Not} ~}
\renewcommand{\and}{~ \textbf{And} ~}
\renewcommand{\or}{~ \textbf{Or} ~}
\renewcommand{\bnot}{\textbf{Bitwise-Not} ~}
\renewcommand{\band}{~ \textbf{Bitwise-And} ~}
\renewcommand{\bor}{~ \textbf{Bitwise-Or} ~}
\renewcommand{\xor}{~ \textbf{Bitwise-Xor} ~}
\renewcommand{\shr}{~ \textbf{Right-Shift} ~}
\renewcommand{\shl}{~ \textbf{Left-Shift} ~}

\renewcommand{\type}[1]{\textbf {#1} ~}

\begin{aligned}
& \tab{0} \func{Matrix-Multiple}(\type{Matrix} A, \type{Matrix} B) \\
& \tab{1} \assert \func{column}(A) = \func{row}(B) \\
& \tab{1} C \leftarrow \type{Zero-Matrix}(\func{row}(A), \func{column}(B)) \\
& \tab{1} \for i \leftarrow 1 \to \func{row}(A) \\
& \tab{2} \for j \leftarrow 1 \to \func{column}(B) \\
& \tab{3} \for k \leftarrow 1 \to \func{column}(A) \\
& \tab{4} C(i, j) \leftarrow C(i, j) + A(i, k) \times B(k, j) \\
& \tab{1} \return C

\\ \\

& \tab{0} \func{Matrix-Power}(\type{Matrix} M, \type{Integer} n) \\
& \tab{1} \assert \func{row}(M) = \func{column}(M) \\
& \tab{1} C \leftarrow \type{Unit-Matrix}(\func{row}(M), \func{column}(M)) \\
& \tab{1} \while n \neq 0 \\
& \tab{2} \if n \band 1 = 1 \\
& \tab{3} C \leftarrow \func{Matrix-Multiple}(C, M) \\
& \tab{2} M \leftarrow \func{Matrix-Multiple}(M, M) \\
& \tab{2} n \leftarrow n \shr 1 \\
& \tab{1} \return C
\end{aligned}
```