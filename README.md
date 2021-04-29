# Menci's OI Blog

这是存放 Menci 的 OI 博客数据的仓库。内含包括源代码和网站文件在内的所有数据，包含在三个 branch 中：

### [`master`](https://github.com/Menci/oi.men.ci/tree/master)

最新的博客源代码，包含整个 `hexo-site` 项目目录的拷贝。

根目录和主题的 `node_modules` 已经完整上传，且其中的依赖包源代码已被重度修改，**请不要运行任何会影响依赖包内文件的 `npm` 或 `yarn` 命令**。

> 请注意，在实际开发中，将 `node_modules` 添加到版本控制系统往往并不是一个良好的实践。本项目由于历史原因不得不这么做。在新项目中请尽量使用 [`patch-package`](https://www.npmjs.com/package/patch-package) 来将对依赖包中文件的修改持久化。

可在 Node.js v16.0.0 和 v15.14.0 下成功运行（但不保证 Windows 兼容性），需要系统中包含可运行的 `pygmentize` 命令（即 Pygments 代码高亮工具）。

Hexo 主题为 [NeXT](https://github.com/theme-next/hexo-theme-next)，在 commit [`9f245fa`](https://github.com/theme-next/hexo-theme-next/commit/9f245fa8aa5150f294177b5e41d296854028f2ac) 的基础之上修改。

请运行使用项目自带的 `hexo-cli` 工具，即 `node_modules/.bin/hexo`，而不是自行安装的全局命令（以避免跨版本兼容性问题）。


### [`old-archive`](https://github.com/Menci/oi.men.ci/tree/old-archive)

旧的博客源代码仓库的备份，最后一次更新为 2017 年 4 月 5 日，且不会继续更新。仅供对于博客源代码的历史记录的查阅。同样包含 `node_modules` 目录，但不保证能在较新版本的操作系统与 Node.js 环境下运行。


### [`website`](https://github.com/Menci/oi.men.ci/tree/website)

项目生成的静态网站文件，与 https://oi.men.ci 的服务器保持同步。

# 部署

> 本博客使用 [hexo-renderer-syzoj-renderer](https://github.com/Menci/hexo-renderer-syzoj-renderer) 渲染器，需要系统中包含可运行的 `pygmentize` 命令（即 Pygments 代码高亮工具）。

克隆本仓库到本地：

```bash
# 显式指定 Git 仅克隆 master 分支
git clone git@github.com:Menci/oi.men.ci --branch master --single-branch
cd oi.men.ci
```

运行 Hexo 以生成网站：

```bash
node_modules/.bin/hexo g
# 或使用 Shell 别名
# alias hexo="$(pwd)/node_modules/.bin/hexo --cwd '$(pwd)'"
# hexo g
```

第一次生成将耗费较长时间，且可能需要 3 GiB 以上的内存。如果 Node.js 因 `JavaScript heap out of memory` 错误（即堆内存不足）而崩溃，请使用以下命令增大 Node.js 的堆内存大小限制：

```bash
node --max_old_space_size=8192 node_modules/.bin/hexo g
```

如果一切正常，网站将被生成在 `public` 目录下。

# 贡献

如果您发现了本博客中的错误或遗漏，欢迎向本仓库提出 Pull Request。如果您的本地环境不方便部署运行该项目，可以不进行测试。

本博客不接受新增内容的投稿，不接受新的友情链接，敬请谅解。

# 许可证

博客内的所有学术/技术类文章（即 Diary 分类以外的所有文章）及相关插图均以 [CC-BY-NC-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) 协议授权。

所有对于主题以及依赖包的**修改**均发布在公有领域，可自由参考。
