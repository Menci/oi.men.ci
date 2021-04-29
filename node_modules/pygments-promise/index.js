let util = require('util');
let pygments = require('./lib/pygments');

module.exports = {
  pygmentize: util.promisify(pygments.pygmentize),
  pygmentizeFile: util.promisify(pygments.pygmentizeFile)
};
