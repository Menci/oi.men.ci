/**
 * @fileOverview Migrate Ghost blog to Hexo
 * @author  jasonslyvia<jasonslyvia@gmail.com>
 */
'use strict';

var _ = require('lodash');
var async = require('async');
var fs = require('fs');
var moment = require('moment');

hexo.extend.migrator.register('ghost', function(args, callback){
  var source = args._.shift();
  var log = hexo.log;

  if (!source){
    handleError(callback);
  }

  fs.readFile(source, {encoding: 'utf-8'}, function(err, data){
    if (err) {
      handleError(callback, 'Can\'t read file '+source);
    }

    try {
      data = JSON.parse(data);
      data = data.db[0].data;

      var posts = data.posts;
      var postsTags = data.posts_tags;
      var tags = data.tags;


      // remap all tags
      var tagsObj = {};
      tags.forEach(function(tag){
        tagsObj[tag.id] = tag;
      });


      // remap all posts
      var postsObj = {};
      posts.forEach(function(post){
        postsObj[post.id] = post;
      });

      // rematch tags to posts
      postsTags.forEach(function(pair){
        var tagName = tagsObj[pair.tag_id].name;
        var post = postsObj[pair.post_id];

        if (!post.tags) {
          post.tags = [];
        }

        post.tags.push(tagName);
      });

      var postsArr = _.toArray(postsObj);
      async.each(postsArr, function(post, next){
        var isPage = post.page !== 0;
        log.i('%s found: %s', isPage ? 'Page' : 'Post', post.title);

        var postData = {
          title: post.title,
          permalink: post.slug,
          content: post.markdown,
          id: post.id,
          date: post.created_at,
          updated: moment(post.updated_at).format('YYYY-MM-DD HH:mm:ss')
        };

        if (!isPage) {
          postData.tags = post.tags && ('\n- ' + (post.tags).join('\n- '));
          postData.layout = post.status === 'published' ? 'post' : 'draft';
        }
        else {
          postData.layout = 'page';
        }

        hexo.post.create(postData, next);
      }, function(err){
        if (err) {
          handleError(callback, 'Error creating posts in Hexo!');
        }

        log.i('%d posts migrated.', posts.length);
        callback();
      });
    }
    catch (e) {
      throw (e);
      handleError(callback, 'Malformed export data!');
    }
  });
});

function handleError(callback, extraMessage){
  extraMessage = extraMessage || '';

  var help = [
    extraMessage,
    'Usage: hexo migrate ghost <source>',
    '',
    'For more help, you can check the docs: http://hexo.io/docs/migration.html'
  ];

  console.log(help.join('\n'));
  return callback();
}
