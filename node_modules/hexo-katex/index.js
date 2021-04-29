'use strict';

var katex = require('katex');
var cheerio;

hexo.extend.filter.register('after_post_render', function(data){
  var content = data.content;

  if (!cheerio) cheerio = require('cheerio');

  var $ = cheerio.load(data.content, {decodeEntities: false});

  $('.math.inline').each(function(){
    var html = katex.renderToString($(this).text());
    $(this).replaceWith(html)
  });

  $('.math.display').each(function(){
    var html = katex.renderToString($(this).text(), { displayMode: true });
    $(this).replaceWith(html)
  });

  data.content = $.html();
});
