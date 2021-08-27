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

# Configure

Configurations are passed by Hexo's `_config.yml`. Available options (and their default values) are:

```yaml
syzoj_renderer:
  cache_file: cache.json       # File to store cache, related to Hexo's base directory.
  highlighter: prism           # Code highlighter, 'prism' or 'hexo', the later uses highlight.js.
  options:                     # syzoj-renderer's options, see https://github.com/syzoj/syzoj-renderer.
    highlight:
      expandTab: null          # expandTab > 0 to enable expand tab, which replaces one tab to that namy spaces.
      wrapper:                 # Strings that'll be added to highlighted code's beginning and ending.
        - <pre><code>
        - </code></pre>
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
