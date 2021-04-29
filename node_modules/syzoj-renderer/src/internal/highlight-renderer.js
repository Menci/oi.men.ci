import Pygments from 'pygments-promise';
import EscapeHTML from 'escape-html';
import ObjectHash from 'object-hash';
import ObjectAssignDeep from 'object-assign-deep';

import AsyncRenderer from './async-renderer';

export async function highlight(code, language, cache, options) {
  let cacheKey;
  if (cache) {
    cacheKey = ObjectHash({
      type: "Highlight",
      task: {
        code,
        language,
        options
      }
    });

    const cachedResult = await cache.get(cacheKey);
    if (cachedResult) return cachedResult;
  }

  options = ObjectAssignDeep({
    pygments: {
      lexer: language,
      format: 'html',
      options: {
        nowrap: true,
        classprefix: 'pl-'
      }
    },
    wrapper: ['<pre><code>', '</code></pre>'],
    expandTab: null
  }, options);

  let result;
  try {
    if (typeof options.highlighter === 'function') {
      result = await options.highlighter(code, language);
    } else {
      result = await Pygments.pygmentize(code, ObjectAssignDeep({
        lexer: language
      }, options.pygments));
    }
  } catch (e) {}

  // May error rendering.
  if (typeof result !== 'string' || result.length === 0) {
    result = EscapeHTML(code);
  }

  // Add wrapper.
  const wrapper = Array.isArray(options.wrapper) ? options.wrapper : [];
  if (typeof wrapper[0] === 'string') result = wrapper[0] + result;
  if (typeof wrapper[1] === 'string') result = result + wrapper[1];

  // Expand tab.
  if (typeof options.expandTab === 'number' && options.expandTab > 0) {
    result = result.split('\t').join(' '.repeat(options.expandTab));
  }

  if (cache) {
    await cache.set(cacheKey, result);
  }

  return result;
}

export default class HighlightRenderer extends AsyncRenderer {
  constructor(cache, callbackAddReplace, options) {
    super(cache, callbackAddReplace);
    this.options = options;
  }

  addRenderTask(code, language) {
    return this._addRenderTask({
      code: code,
      language: language,
      options: this.options
    });
  }

  // markdown-it will wrap the highlighted result if it's not started with '<pre'.
  // Wrap the uuid with a <pre> tag to make sure markdown-it's result is valid HTML
  // to prevent filter function from parse error.
  _generateUUID(uuidGenerator) {
    return '<pre>' + uuidGenerator() + '</pre>';
  }

  // Don't cache if language is plain -- it only need to be escaped, not highlighted.
  _shouldCache(task) {
    return task.language !== 'plain';
  }

  async _doRender(task) {
    return await highlight(task.code, task.language, this.cache, this.options, this.highlighter);
  }
}
