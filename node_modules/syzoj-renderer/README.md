# syzoj-renderer

SYZOJ's renderer for markdown, math and highlight.

# Example

```javascript
let { markdown, highlight } = require('syzoj-renderer');

console.log(await markdown(text));
console.log(await highlight(code, language));
```

# API

## `async markdown(text, [cache, filterFunction, options])`

`text` is the Markdown text to be rendered.

`cache` is `null` or a object with two functions to manipulate a Key-Value store (`key` is hashed before passing to `cache`):

* `async get(string key)`
* `async set(string key, string value)`

`filterFunction(html)` is a function to filter rendered HTML. It can be used to prevent XSS attack. Should return filtered HTML.

`options` is a object, may contain:

* `markdownIt`: Overrides default options in `new MarkdownIt(options)`. (See [markdown-it](https://github.com/markdown-it/markdown-it))
* `markdownItMath`: Overrides default options in `markdownIt.use(MathdownItMath, options)`. (See [markdown-it-math-loose](https://github.com/Menci/markdown-it-math-loose))
* `markdownItMergeCells`: Set to false to disable [markdown-it-merge-cells](https://github.com/Menci/markdown-it-merge-cells) in markdown tables, which will merge adjacent cells with same content in tables
* `highlight`: Same as `highlight`'s `options` parameter, used when highlighting code in markdown.

Return rendered HTML. Won't throw.

## `async highlight(code, language[, cache, options])`

Highlight some code with pygments.

`code` is the code to be highlighted. `language` is `code`'s language.

`cache` is same as the parameter in `markdown()`.

`options` is a object, may contain:

* `pygments`: Overrides default options in `Pygments.pygmentize(code, options)`. (See [pygments-promise](https://github.com/Menci/pygments-promise))
* `highlighter`: Pass a function `async function (code, language)` to replace the defualt pygments highlighter. If a function is passed, pygments won't be used and `pygments` option will be ignored.
* `wrapper`: An array `[before, after]`. Highlighted code's HTML will be wrapped by `before` and `after`. Defaults to `['<pre><code>', '</code></pre>']`.

Return highlighted code in HTML. Won't throw.

# Notes

* Markdown backend is [markdown-it](https://github.com/markdown-it/markdown-it).
    * GFM is supported.
    * By default, `linkify` and `html` are enabled, `typographer` and `breaks` are disabled.
* By default, code highlight's backend is [pygments](http://pygments.org), which requires pygments to be installed.
    * If no `pygmentize` is available, it'll always return unhighlighted code.
    * `pygmentize`'s default commandline arguments are: `pygmentize -l <language> -f html -P nowrap=false -P classprefix=pl-`.
    * A theme CSS is required to display highlighted code properly. See [Generating styles](http://pygments.org/docs/cmdline/#generating-styles) section of pygments's document.
* Math backend is [mathjax-node-page](https://github.com/pkra/mathjax-node-page).
    * Maths are rendered to `<svg>` HTML elements, `dist/math.css` is required to display properly.
    * Maths with spaces within dollar sign like `$ a+b $` will work.
    * Complex maths like `$ \sum\limits_{i=0}^na_i $` won't be broken by Markdown.
    * To ensure each document's math rendering state isolated, `\require` is disabled.
    * Maths that failed to render would result in displaying error message.

# License

[AGPL-3.0](LICENSE). Contact me if you *really* want this to be MIT license.
