var validate = {
  'lexer': /[a-z0-9+-]+/i,
  'formatter': /(console|html)/i
};

/**
 * Wrap an options object with convenience methods
 * for working with pygmentize
 *
 * @param {Object} options
 */

function PygmentizeOptions (options) {
  if(!(this instanceof PygmentizeOptions))
    return new PygmentizeOptions(options);

  if(options.lexer && validate.lexer.test(options.lexer))
    this.lexer = options.lexer;

  if(options.guess && !this.lexer)
    this.guess = true;

  if(options.formatter && validate.formatter.test(options.formatter))
    this.formatter = options.formatter;
  else
    this.formatter = 'html'

  this.options = options.options;
}

/**
 * Generate pygmentize CLI arguments from internal options hash
 *
 * @return {Array} pygmentizeArgs
 * @api public
 */

PygmentizeOptions.prototype.toArray = function() {
  var args = [];
  
  if(this.lexer) {
    args.push('-l');
    args.push(this.lexer);
  }

  if(this.guess || !(this.guess || this.lexer))
    args.push('-g');

  args.push('-f');
  args.push(this.formatter);

  if (typeof this.options === 'object') {
    var options = this.options;
    Object.keys(options).forEach(function (key) {
      args.push('-P', key + '=' + options[key])
    });
  }

  return args;
};

module.exports = PygmentizeOptions;
