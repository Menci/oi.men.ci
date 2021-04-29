# hexo-renderer-syzoj-renderer

Render Hexo's markdown documents with syzoj-renderer.

# Install

First, make sure that you've removed all other markdown renderers from Hexo. For example:

```bash
yarn remove hexo-renderer-marked
```

Then install this plugin:

```bash
yarn add hexo-renderer-syzoj-renderer
```

If you want to use [pygments](http://pygments.org) code highlighter (which is used by default), install one of Python 2 / Python 3 version of it via `pip`:

```bash
pip install pygments  # Python 2, python-pip on Ubuntu
pip3 install pygments # Python 3, python3-pip on Ubuntu
```

# Configure

Configurations are passed by Hexo's `_config.yml`. Available options (and their default values) are:

```yaml
syzoj_renderer:
  cache_file: cache.json       # File to store cache, related to Hexo's base directory.
  highlighter: pygments        # Code highlighter, 'pygments' or 'hexo', the later uses highlight.js.
  options:                     # syzoj-renderer's options, see https://github.com/syzoj/syzoj-renderer.
    highlight:
      expandTab: null          # expandTab > 0 to enable expand tab, which replaces one tab to that namy spaces.
      wrapper:                 # Strings that'll be added to highlighted code's beginning and ending.
        - <pre><code>
        - </code></pre>
      pygments:                # Pygments's options, see https://github.com/Menci/pygments-promise.
        lexer: language
        format: html
        options:
          nowrap: true,
          classprefix: pl-
    markdownItMergeCells: true # Enable markdown-it-merge-cells or not, which'll merge adjacent cells with same
                               # content in Markdown tables.
    markdownIt:                # markdown-it's options, see https://github.com/markdown-it/markdown-it.
      html: true
      breaks: false
      linkify: true
      typographer: false
    markdownItMath:            # markdown-it-math-loose's options, see https://github.com/Menci/markdown-it-math-loose.
      inlineOpen: $
      inlineClose: $
      blockOpen: $$
      blockClose: $$
```

# Notice

If you use [pygments](http://pygments.org) for highlighting, you **must** replace your theme's default highlight theme (which is usually for [highlight.js](https://highlightjs.org/)) with one for pygments. Use some command like:

```bash
pygmentize -f html -S colorful -a 'pre > code' -P classprefix=pl-
```

To generate theme CSS. See [Generating styles](http://pygments.org/docs/cmdline/#generating-styles) section of pygments's document. More themes like [tomorrow](https://github.com/mozmorris/tomorrow-pygments) is also available to download and use.

Also, [math.css](math.css) is required to display TeX equations correctly.
