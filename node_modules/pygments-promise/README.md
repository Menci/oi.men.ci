pygments-promise
==============

Fully Promise wrapper for Pygments

## Usage

There are two functions exported by the package - pygmentize and pygmentizeFile.

### pygmentize

Highlight a block of code

Example:

```javascript
var pygmentize = require('pygments-async').pygmentize
  , markup;

pygmentize("puts 'Hello, world!'", {lexer: 'ruby'}).then(function(out) {
  // out contains pygmentized code
  markup = out;
});
```

Allowed options are:

- `lexer`: Specify lexer for pygmentize
- `formatter`: Specify pygmentize lexer
- `options`: A object of options passed to pygmentize via `-P key=value`

Options need not be specified. If no lexer is provided pygmentize will attempt
to guess based on contents. The default formatter is `html`.

### pygmentizeFile

Load a file and pygmentize it

```javascript
var pygmentizeFile = require('pygments-async').pygmentizeFile
  , markup;

pygmentizeFile("package.json").then(function(out) {
  // out contains pygmentized package.json
  markup = out;
});
```

## License

MIT

## Alternatives
- [pygments](https://github.com/pksunkara/pygments.js)
- [pygments-async](https://github.com/Menci/pygments-async)
