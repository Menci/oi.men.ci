import util from 'util';
import EscapeHTML from 'escape-html';

import AsyncRenderer from './async-renderer';

const getMathjax = (() => {
  const { mathjax } = require('mathjax-full/js/mathjax.js');
  const { TeX } = require('mathjax-full/js/input/tex.js');
  const { SVG } = require('mathjax-full/js/output/svg.js');
  const { liteAdaptor } = require('mathjax-full/js/adaptors/liteAdaptor.js');
  const { RegisterHTMLHandler } = require('mathjax-full/js/handlers/html.js');

  const { AllPackages } = require('mathjax-full/js/input/tex/AllPackages.js');

  const adaptor = liteAdaptor();
  RegisterHTMLHandler(adaptor);
  const tex = new TeX({ packages: AllPackages });
  const svg = new SVG();
  const html = mathjax.document('', { InputJax: tex, OutputJax: svg });

  /**
   * @param input {string}
   * @param displayMode {boolean}
   */
  return (input, displayMode) => {
    const node = html.convert(input, { display: displayMode });
    return adaptor.innerHTML(node);
  }
});

function formatErrorMessage(message) {
  let htmlContext = EscapeHTML(message.trim('\n')).split('\n').join('<br>');
  return '<span class="math-rendering-error-message">'
        + htmlContext
        + '</span>';
};

// This class is previously intented to call KaTeX and MathJax in _doRender
// to render asynchronously, but then I moved to render all maths within
// a single call to MathJax, so now this class overrides doRender and handle
// all tasks in a single function. And cache is NOT used.
export default class MathRenderer extends AsyncRenderer {
  constructor(cache, callbackAddReplace) {
    // Don't cache it since a page must be rendered in the same time.
    super(null, callbackAddReplace);
  }

  addRenderTask(texCode, displayMode) {
    return this._addRenderTask({
      texCode: texCode,
      displayMode: displayMode
    });
  }

  async doRender(callbackCheckFiltered) {
    const mathjax = getMathjax();

    for (const task of this.tasks) {
      if (callbackCheckFiltered(task.uuid)) continue;

      let result = null;
      try {
        result = mathjax(task.task.texCode, task.task.displayMode);
      } catch (e) {
        let errorMessage = `Failed to render ${task.task.displayMode ? 'display' : 'inline'} math: `
                         + util.inspect(task.task.texCode) + '\n'
                         + e.toString();
        result = formatErrorMessage(errorMessage);
      }

      if (task.task.displayMode) result = `<p><span style="margin-left: 50%; transform: translateX(-50%); display: inline-block; ">${result}</span></p>`
      this.callbackAddReplace(task.uuid, result);
    }
  }
}
