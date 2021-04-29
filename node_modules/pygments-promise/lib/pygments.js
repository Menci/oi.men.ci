var spawn = require('child_process').spawn,
    fs = require('fs'),
    PygmentizeOptions = require('./pygmentize_options'),
    bin = 'pygmentize';

/**
 * Highlight a block of code
 *
 * Example:
 *
 *     var pygmentize = require('pygments-async').pygmentize
 *       , markup;
 * 
 *     pygmentize("puts 'Hello, world!'", {lexer: 'ruby'}, function(err, out) {
 *       // out contains pygmentized code
 *       markup = out;
 *     });
 *
 * Allowed options are:
 *
 * - `lexer`: Specify lexer for pygmentize
 * - `formatter`: Specify pygmentize lexer
 *
 * @param {String} code - Code snippet
 * @param {Object} [options] - options for this module and pygmentize
 * @param {Function} done - Callback accepting err and results
 * @api public
 */

var pygmentize = exports.pygmentize = function (code, options, done) {

  if(typeof done === "undefined") {
    done = options;
    options = {};
  }

  var opt = PygmentizeOptions(options || {});

  run(code, opt, done);

};

/**
 * Load a file and pygmentize it
 *
 * Example:
 *
 *     var pygmentize = require('pygments-async').pygmentize
 *       , markup;
 *
 *     pygmentizeFile("package.json", function(err, out) {
 *       // out contains pygmentized package.json
 *       markup = out;
 *     });
 * 
 * @param {String} file - file to load and pygmentize
 * @param {Object} [options] - options for this module and pygmentize
 * @param {Function} done - Callback accepting err and results
 * @api public
 * @see exports.pygmentize
 */

exports.pygmentizeFile = function (file, options, done) {
  if(typeof done === "undefined")
    done = options;

  fs.readFile(file, {encoding: 'utf8'}, function(err, contents) {
    pygmentize(contents.toString(), options, done);
  });

};

/**
 * Run pygmentize
 *
 * @param {String} code
 * @param {PygmentizeOptions} args
 * @param {Function} done
 * @api private
 */

var run = function (code, args, done) {
  var pyg = spawn(bin, args.toArray()),
      out = [],
      failed = false;

  pyg.on('error', function() {
    failed = true;
    done.apply(this, arguments);
  })

  pyg.stdout.setEncoding('utf8');
  pyg.stderr.setEncoding('utf8');

  var pusher = function(data) {
    out.push(data.toString());
  }

  pyg.stdout.on('data', pusher);
  pyg.stderr.on('data', pusher);

  pyg.on('exit', function (status) {
    // Return if done already called
    if(failed)
      return

    // pygmentize was successful
    if(status == 0)
      return done(null, out.join(''));

    // pygmentize was unsuccessful (cli error?)
    return done(out.join(''));
  });

  pyg.stdin.write(code);
  pyg.stdin.end();

};
