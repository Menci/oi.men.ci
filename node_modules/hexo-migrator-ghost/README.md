# hexo-migrator-ghost

Ghost migrator for Hexo.

## Install

``` bash
$ npm install hexo-migrator-ghost --save
```

## Usage

### Export from Ghost

Visit `http://yourblog.com/ghost/debug/` , click `Export` and download the JSON file.

### Import to Hexo

Execute the following command after installed. `source` is the file path exported by Ghost.

``` bash
$ hexo migrate ghost <source>
```

## Notice

This plugin will migrate following data from Ghost:

 - post title
 - post content
 - posd id
 - create date
 - update date
 - tags
 - status(is draft)
 - type(post or page)

Images will NOT be migrated!

In order to successfully migrate `tags`, you have to make sure the front-matter in `./scaffolds/post.md` look like this:

```markdown
title: {{ title }}
date: {{ date }}
tags: {{ tags }}
---

```

[Hexo]: http://zespia.tw/hexo
