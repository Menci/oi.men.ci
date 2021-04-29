import MarkdownIt from 'markdown-it';
import MarkdownItMath from 'markdown-it-math-loose';
import MarkdownItMergeCells from 'markdown-it-merge-cells';
import ObjectHash from 'object-hash';
import ObjectAssignDeep from 'object-assign-deep';

import MathRenderer from './internal/math-renderer';
import HighlightRenderer from './internal/highlight-renderer';

export default async function render(input, cache, callbackFilter, options) {
  // Check cache first.
  let cacheKey;
  if (cache) {
    cacheKey = ObjectHash({
      type: "Markdown",
      task: input,
      options: options
    });

    let cachedResult = await cache.get(cacheKey);
    if (cachedResult) return cachedResult;
  }

  // Merge options with default values and normalize non-object input for options.
  options = Object.assign({
    markdownItMergeCells: true
  }, options);

  // Maths and highlights are rendered asynchronously, so a UUID placeholder is
  // returned to markdown-it during markdown rendering process. After markdown
  // and these finish rendering, replace the placeholder with rendered content
  // in markdown rendering result.
  let uuidReplaces = {};

  let mathRenderer = new MathRenderer(cache, (uuid, result) => {
    uuidReplaces[uuid] = result;
  });

  let highlightRenderer = new HighlightRenderer(cache, (uuid, result) => {
    uuidReplaces[uuid] = result;
  }, options.highlight);

  const renderer = new MarkdownIt(ObjectAssignDeep({
    html: true,
    breaks: false,
    linkify: true,
    typographer: false,
    highlight: (code, language) => highlightRenderer.addRenderTask(code, language)
  }, options.markdownIt));

  renderer.use(MarkdownItMath, ObjectAssignDeep({
    inlineOpen: '$',
    inlineClose: '$',
    blockOpen: '$$',
    blockClose: '$$',
    inlineRenderer: str => mathRenderer.addRenderTask(str, false),
    blockRenderer: str => mathRenderer.addRenderTask(str, true)
  }, options.markdownItMath));

  // Inject merge table cell support.
  if (options.markdownItMergeCells) {
    renderer.use(MarkdownItMergeCells);
  }
  
  let htmlResult = renderer.render(input);
  if (callbackFilter) {
    // Useful for XSS filtering.
    htmlResult = callbackFilter(htmlResult);
  }
  
  // Do math and highlight rendering.
  await mathRenderer.doRender(uuid => htmlResult.indexOf(uuid) === -1);
  await highlightRenderer.doRender(uuid => htmlResult.indexOf(uuid) === -1);

  // Replace placeholders back.
  let replacedHtmlResult = htmlResult;
  for (let uuid in uuidReplaces) {
    replacedHtmlResult = replacedHtmlResult.replace(uuid, uuidReplaces[uuid]);
  }

  // Set cache.
  if (cache) {
    await cache.set(cacheKey, replacedHtmlResult);
  }

  return replacedHtmlResult;
}
