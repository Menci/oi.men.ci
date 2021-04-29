"use strict";

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var config = MathJax.Hub.CombineConfig('Reset', {});

// From https://github.com/mathjax/MathJax-node/pull/348#issuecomment-476374035.
MathJax.Hub.Register.StartupHook("TeX begingroup Ready", function () {
  var TEX = MathJax.InputJax.TeX,
      NSSTACK = TEX.nsStack,
      NSFRAME = NSSTACK.nsFrame;
  var rootStack = TEX.rootStack,
      FIND = rootStack.Find.bind(rootStack);

  // Save the original global definitions.
  rootStack.globalFrame = rootStack.stack[0];

  // A new (temporary) global definition holder.
  rootStack.stack[0] = NSFRAME();

  rootStack.Find = function (name, type) {
    // Don't let this be redefined.
    if (name === config.resetMacroName && type === "macros") return config.resetMacroName;
    // Look up the name.
    return FIND(name, type) || this.globalFrame.Find(name, type);
  };

  // Define the reset macro to clear the stack.
  TEX.Definitions.macros[config.resetMacroName] = config.resetMacroName;
  TEX.Parse.Augment(_defineProperty({}, config.resetMacroName, function (name) {
    rootStack.Clear();
  }));
});

MathJax.Ajax.loadComplete("[syzoj-renderer-mathjax]/reset.js");