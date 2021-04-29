# hexo-katex

Use KaTeX to display math in Hexo sites.

## Install 

Install `hexo-render-pandoc` and modify /node_modules/hexo-render-pandoc/index.js:

```
//var args = [ '-f', 'markdown', '-t', 'html', '--mathjax', '--smart'];
var args = [ '-f', 'markdown', '-t', 'html', '--katex', '--smart'];
```

Then install hexo-katex.

```
npm install hexo-katex --save
```

## Writing

Inline math `$E=m*c^2$`

Display math  

```
$$
E = m * c^2
$$
```
