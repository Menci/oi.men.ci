var pygments = require('..');
var pygmentize = pygments.pygmentize;
var pygmentizeFile = pygments.pygmentizeFile;
var assert = require('assert');
var fs = require('fs');

describe('pygments-async', function() {
  describe('pygmentize', function() {
    var html;

    it('should render html when passed a string and language', function(done) {
      html = "<div class=\"highlight\"><pre><span class=\"nb\">puts</span> " +
        "<span class=\"s2\">&quot;Hello World&quot;</span>\n</pre></div>\n";
      pygmentize('puts "Hello World"', {lexer: 'ruby', formatter: 'html'}).then(
        function(out) {
        assert.deepEqual(out, html);
        done();
      });
    });

    it('should work without options specified', function(done) {
      html = '<div class="highlight"><pre><span class="n">puts</span> ' +
        '<span class="s">&quot;Hello World&quot;</span>\n</pre></div>\n';

      pygmentize('puts "Hello World"').then(function(out) {
        if(err) done(err);
        assert.deepEqual(out, html);
        done();
      });
    });
  });

  describe('pygmentizeFile', function() {
    var html;

    it('should pygmentize the file', function(done) {
      pygmentizeFile('package.json').then(function(out) {
        if(err) done(err);
        assert.ok(/span class/.test(out));
        done();
      })
    });
  });

});

