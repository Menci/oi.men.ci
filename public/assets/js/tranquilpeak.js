(function($) {
  'use strict';

  // Fade out the blog and let drop the about card of the author and vice versa

  /**
   * AboutCard
   * @constructor
   */
  var AboutCard = function() {
    this.$openBtn = $("#sidebar, #header").find("a[href*='#about']");
    this.$closeBtn = $('#about-btn-close');
    this.$blog = $('#blog');
    this.$about = $('#about');
    this.$aboutCard = $('#about-card');
  };

  AboutCard.prototype = {

    /**
     * Run AboutCard feature
     * @return {void}
     */
    run: function() {
      var self = this;
      // Detect click on open button
      self.$openBtn.click(function(e) {
        e.preventDefault();
        self.play();
      });
      // Detect click on close button
      self.$closeBtn.click(function(e) {
        e.preventDefault();
        self.playBack();
      });
    },

    /**
     * Play the animation
     * @return {void}
     */
    play: function() {
      var self = this;
      // Fade out the blog
      self.$blog.fadeOut();
      // Fade in the about card
      self.$about.fadeIn();
      // Small timeout to drop the about card after that
      // the about card fade in and the blog fade out
      setTimeout(function() {
        self.dropAboutCard();
      }, 300);
    },

    /**
     * Play back the animation
     * @return {void}
     */
    playBack: function() {
      var self = this;
      // Lift the about card
      self.liftAboutCard();
      // Fade in the blog after that the about card lifted up
      setTimeout(function() {
        self.$blog.fadeIn();
      }, 500);
      // Fade out the about card after that the about card lifted up
      setTimeout(function() {
        self.$about.fadeOut();
      }, 500);
    },

    /**
     * Slide the card to the middle
     * @return {void}
     */
    dropAboutCard: function() {
      var self = this;
      var aboutCardHeight = self.$aboutCard.innerHeight();
      // default offset from top
      var offsetTop = ($(window).height() / 2) - (aboutCardHeight / 2) + aboutCardHeight;
      // if card is longer than the window
      // scroll is enable
      // and re-define offsetTop
      if (aboutCardHeight + 30 > $(window).height()) {
        offsetTop = aboutCardHeight;
      }
      self.$aboutCard
        .css('top', '0px')
        .css('top', '-' + aboutCardHeight + 'px')
        .show(500, function() {
          self.$aboutCard.animate({
            top: '+=' + offsetTop + 'px'
          });
        });
    },

    /**
     * Slide the card to the top
     * @return {void}
     */
    liftAboutCard: function() {
      var self = this;
      var aboutCardHeight = self.$aboutCard.innerHeight();
      // default offset from top
      var offsetTop = ($(window).height() / 2) - (aboutCardHeight / 2) + aboutCardHeight;
      if (aboutCardHeight + 30 > $(window).height()) {
        offsetTop = aboutCardHeight;
      }
      self.$aboutCard.animate({
        top: '-=' + offsetTop + 'px'
      }, 500, function() {
        self.$aboutCard.hide();
        self.$aboutCard.removeAttr('style');
      });
    }
  };

  $(document).ready(function() {
    var aboutCard = new AboutCard();
    aboutCard.run();
  });
})(jQuery);
;(function($) {
  'use strict';

  // Filter posts by using their date on archives page : `/archives`

  /**
   * ArchivesFilter
   * @param {String} archivesElem
   * @constructor
   */
  var ArchivesFilter = function(archivesElem) {
    this.$form = $(archivesElem).find('#filter-form');
    this.$searchInput = $(archivesElem).find('input[name=date]');
    this.$archiveResult = $(archivesElem).find('.archive-result');
    this.$postsYear = $(archivesElem).find('.archive-year');
    this.$postsMonth = $(archivesElem).find('.archive-month');
    this.$postsDay = $(archivesElem).find('.archive-day');
    this.postsYear = archivesElem + ' .archive-year';
    this.postsMonth = archivesElem + ' .archive-month';
    this.postsDay = archivesElem + ' .archive-day';
    this.messages = {
      zero: this.$archiveResult.data('message-zero'),
      one: this.$archiveResult.data('message-one'),
      other: this.$archiveResult.data('message-other')
    };
  };

  ArchivesFilter.prototype = {

    /**
     * Run ArchivesFilter feature
     * @return {void}
     */
    run: function() {
      var self = this;

      self.$searchInput.keyup(function() {
        self.filter(self.sliceDate(self.getSearch()));
      });

      // Block submit action
      self.$form.submit(function(e) {
        e.preventDefault();
      });
    },

    /**
     * Get Filter entered by user
     * @returns {String} The date entered by the user
     */
    getSearch: function() {
      return this.$searchInput.val().replace(/([\/|.|-])/g, '').toLowerCase();
    },

    /**
     * Slice the date by year, month and day
     * @param {String} date - The date of the post
     * @returns {Array} The date of the post splitted in a list
     */
    sliceDate: function(date) {
      return [
        date.slice(0, 4),
        date.slice(4, 6),
        date.slice(6)
      ];
    },

    /**
     * Show related posts and hide others
     * @param {String} date - The date of the post
     * @returns {void}
     */
    filter: function(date) {
      var numberPosts;

      // Check if the search is empty
      if (date[0] === '') {
        this.showAll();
        this.showResult(-1);
      }
      else {
        numberPosts = this.countPosts(date);

        this.hideAll();
        this.showResult(numberPosts);

        if (numberPosts > 0) {
          this.showPosts(date);
        }
      }
    },

    /**
     * Display results
     * @param {Number} numbPosts - The number of posts found
     * @returns {void}
     */
    showResult: function(numbPosts) {
      if (numbPosts === -1) {
        this.$archiveResult.html('').hide();
      }
      else if (numbPosts === 0) {
        this.$archiveResult.html(this.messages.zero).show();
      }
      else if (numbPosts === 1) {
        this.$archiveResult.html(this.messages.one).show();
      }
      else {
        this.$archiveResult.html(this.messages.other.replace(/\{n\}/, numbPosts)).show();
      }
    },

    /**
     * Count number of posts
     * @param {String} date - The date of the post
     * @returns {Number} The number of posts found
     */
    countPosts: function(date) {
      return $(this.postsDay + '[data-date^=' + date[0] + date[1] + date[2] + ']').length;
    },

    /**
     * Show all posts from a date
     * @param {String} date - The date of the post
     * @returns {void}
     */
    showPosts: function(date) {
      $(this.postsYear + '[data-date^=' + date[0] + ']').show();
      $(this.postsMonth + '[data-date^=' + date[0] + date[1] + ']').show();
      $(this.postsDay + '[data-date^=' + date[0] + date[1] + date[2] + ']').show();
    },

    /**
     * Show all posts
     * @returns {void}
     */
    showAll: function() {
      this.$postsYear.show();
      this.$postsMonth.show();
      this.$postsDay.show();
    },

    /**
     * Hide all posts
     * @returns {void}
     */
    hideAll: function() {
      this.$postsYear.hide();
      this.$postsMonth.hide();
      this.$postsDay.hide();
    }
  };

  $(document).ready(function() {
    if ($('#archives').length) {
      var archivesFilter = new ArchivesFilter('#archives');
      archivesFilter.run();
    }
  });
})(jQuery);
;/* global katex */

var findEndOfMath = function(delimiter, text, startIndex) {
    // Adapted from
    // https://github.com/Khan/perseus/blob/master/src/perseus-markdown.jsx
    var index = startIndex;
    var braceLevel = 0;

    var delimLength = delimiter.length;

    while (index < text.length) {
        var character = text[index];

        if (braceLevel <= 0 &&
            text.slice(index, index + delimLength) === delimiter) {
            return index;
        } else if (character === "\\") {
            index++;
        } else if (character === "{") {
            braceLevel++;
        } else if (character === "}") {
            braceLevel--;
        }

        index++;
    }

    return -1;
};

var splitAtDelimiters = function(startData, leftDelim, rightDelim, display) {
    var finalData = [];

    for (var i = 0; i < startData.length; i++) {
        if (startData[i].type === "text") {
            var text = startData[i].data;

            var lookingForLeft = true;
            var currIndex = 0;
            var nextIndex;

            nextIndex = text.indexOf(leftDelim);
            if (nextIndex !== -1) {
                currIndex = nextIndex;
                finalData.push({
                    type: "text",
                    data: text.slice(0, currIndex)
                });
                lookingForLeft = false;
            }

            while (true) {
                if (lookingForLeft) {
                    nextIndex = text.indexOf(leftDelim, currIndex);
                    if (nextIndex === -1) {
                        break;
                    }

                    finalData.push({
                        type: "text",
                        data: text.slice(currIndex, nextIndex)
                    });

                    currIndex = nextIndex;
                } else {
                    nextIndex = findEndOfMath(
                        rightDelim,
                        text,
                        currIndex + leftDelim.length);
                    if (nextIndex === -1) {
                        break;
                    }

                    finalData.push({
                        type: "math",
                        data: text.slice(
                            currIndex + leftDelim.length,
                            nextIndex),
                        rawData: text.slice(
                            currIndex,
                            nextIndex + rightDelim.length),
                        display: display
                    });

                    currIndex = nextIndex + rightDelim.length;
                }

                lookingForLeft = !lookingForLeft;
            }

            finalData.push({
                type: "text",
                data: text.slice(currIndex)
            });
        } else {
            finalData.push(startData[i]);
        }
    }

    return finalData;
};

var splitWithDelimiters = function (text, delimiters) {
    var data = [{type: "text", data: text}];
    for (var i = 0; i < delimiters.length; i++) {
        var delimiter = delimiters[i];
        data = splitAtDelimiters(
            data, delimiter.left, delimiter.right,
            delimiter.display || false);
    }
    return data;
};

var loadMathJax = function (element) {
    if(typeof MathJax !== "undefined"){
        // mathjax successfully loaded, let it render
        MathJax.Hub.Queue(["Typeset", MathJax.Hub, element]);
    }else {
        var mjaxURL = "//cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS_HTML";
        // load mathjax script
        $.getScript(mjaxURL, function () {
            // mathjax successfully loaded, let it render
			MathJax.Hub.Config({
				tex2jax: {
					inlineMath: [ ['$','$'], ["\\(","\\)"]  ],
					processEscapes: true,
					skipTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code']
				}
			});
            MathJax.Hub.Queue(["Typeset", MathJax.Hub, element]);
        });
    }
};

var renderMathInText = function (text, delimiters) {
    var data = splitWithDelimiters(text, delimiters);

    var fragment = document.createDocumentFragment();

    for (var i = 0; i < data.length; i++) {
        if (data[i].type === "text") {
            fragment.appendChild(document.createTextNode(data[i].data));
        } else {
            var span = document.createElement("span");
            var math = data[i].data;
            try {
                katex.render(math, span, {
                    displayMode: data[i].display
                });
            } catch (e) {
                if (!(e instanceof katex.ParseError)) {
                    throw e;
                }
                span.appendChild(document.createTextNode(data[i].rawData));
                loadMathJax(span);
            }
            fragment.appendChild(span);
        }
    }

    return fragment;
};

var renderElem = function (elem, delimiters, ignoredTags) {
    for (var i = 0; i < elem.childNodes.length; i++) {
        var childNode = elem.childNodes[i];
        if (childNode.nodeType === 3) {
            // Text node
            var frag = renderMathInText(childNode.textContent, delimiters);
            i += frag.childNodes.length - 1;
            elem.replaceChild(frag, childNode);
        } else if (childNode.nodeType === 1) {
            // Element node
            var shouldRender = ignoredTags.indexOf(
                    childNode.nodeName.toLowerCase()) === -1;

            if (shouldRender) {
                renderElem(childNode, delimiters, ignoredTags);
            }
        }
        // Otherwise, it's something else, and ignore it.
    }
};

var defaultOptions = {
    delimiters: [
        {left: "$$", right: "$$", display: true},
        {left: "\\[", right: "\\]", display: true},
        {left: "\\(", right: "\\)", display: false},
        // LaTeX uses this, but it ruins the display of normal `$` in text:
        {left: "$", right: "$", display: false}
    ],

    ignoredTags: [
        "script", "noscript", "style", "textarea", "pre", "code"
    ]
};

var extend = function (obj) {
    // Adapted from underscore.js' `_.extend`. See LICENSE.txt for license.
    var source, prop;
    for (var i = 1, length = arguments.length; i < length; i++) {
        source = arguments[i];
        for (prop in source) {
            if (Object.prototype.hasOwnProperty.call(source, prop)) {
                obj[prop] = source[prop];
            }
        }
    }
    return obj;
};

var renderMathInElement = function (elem, options) {
    if (!elem) {
        throw new Error("No element provided to render");
    }

    options = extend({}, defaultOptions, options);

    renderElem(elem, options.delimiters, options.ignoredTags);
};
;(function($) {
  'use strict';

  // Filter posts by using their categories on categories page : `/categories`

  /**
   * CategoriesFilter
   * @param {String} categoriesArchivesElem
   * @constructor
   */
  var CategoriesFilter = function(categoriesArchivesElem) {
    this.$form = $(categoriesArchivesElem).find('#filter-form');
    this.$inputSearch = $(categoriesArchivesElem).find('input[name=category]');
    // Element where result of the filter are displayed
    this.$archiveResult = $(categoriesArchivesElem).find('.archive-result');
    this.$posts = $(categoriesArchivesElem).find('.archive');
    this.$categories = $(categoriesArchivesElem).find('.category-anchor');
    this.posts = categoriesArchivesElem + ' .archive';
    this.categories = categoriesArchivesElem + ' .category-anchor';
    // Html data attribute without `data-` of `.archive` element
    // which contains the name of category
    this.dataCategory = 'category';
    // Html data attribute without `data-` of `.archive` element
    // which contains the name of parent's categories
    this.dataParentCategories = 'parent-categories';
    this.messages = {
      zero: this.$archiveResult.data('message-zero'),
      one: this.$archiveResult.data('message-one'),
      other: this.$archiveResult.data('message-other')
    };
  };

  CategoriesFilter.prototype = {

    /**
     * Run CategoriesFilter feature
     * @return {void}
     */
    run: function() {
      var self = this;

      self.$inputSearch.keyup(function() {
        self.filter(self.getSearch());
      });

      // Block submit action
      self.$form.submit(function(e) {
        e.preventDefault();
      });
    },

    /**
     * Get the search entered by user
     * @returns {String} The name of the category
     */
    getSearch: function() {
      return this.$inputSearch.val().toLowerCase();
    },

    /**
     * Show related posts form a category and hide the others
     * @param {string} category - The name of the category
     * @return {void}
     */
    filter: function(category) {
      if (category === '') {
        this.showAll();
        this.showResult(-1);
      }
      else {
        this.hideAll();
        this.showPosts(category);
        this.showResult(this.countCategories(category));
      }
    },

    /**
     * Display results of the search
     * @param {Number} numbCategories - The number of categories found
     * @return {void}
     */
    showResult: function(numbCategories) {
      if (numbCategories === -1) {
        this.$archiveResult.html('').hide();
      }
      else if (numbCategories === 0) {
        this.$archiveResult.html(this.messages.zero).show();
      }
      else if (numbCategories === 1) {
        this.$archiveResult.html(this.messages.one).show();
      }
      else {
        this.$archiveResult.html(this.messages.other.replace(/\{n\}/, numbCategories)).show();
      }
    },

    /**
     * Count number of categories
     * @param {String} category - The name of theThe date of the post category
     * @returns {Number} The number of categories found
     */
    countCategories: function(category) {
      return $(this.posts + '[data-' + this.dataCategory + '*=\'' + category + '\']').length;
    },

    /**
     * Show all posts from a category
     * @param {String} category - The name of the category
     * @return {void}
     */
    showPosts: function(category) {
      var self = this;
      var parents;
      var categories = self.categories + '[data-' + self.dataCategory + '*=\'' + category + '\']';
      var posts = self.posts + '[data-' + self.dataCategory + '*=\'' + category + '\']';

      if (self.countCategories(category) > 0) {
        // Check if selected categories have parents
        if ($(categories + '[data-' + self.dataParentCategories + ']').length) {
          // Get all categories that matches search
          $(categories).each(function() {
            // Get all its parents categories name
            parents = $(this).attr('data-' + self.dataParentCategories).split(',');
            // Show only the title of the parents's categories and hide their posts
            parents.forEach(function(parent) {
              var dataAttr = '[data-' + self.dataCategory + '=\'' + parent + '\']';
              $(self.categories + dataAttr).show();
              $(self.posts + dataAttr).show();
              $(self.posts + dataAttr + ' > .archive-posts > .archive-post').hide();
            });
          });
        }
      }
      // Show categories and related posts found
      $(categories).show();
      $(posts).show();
      $(posts + ' > .archive-posts > .archive-post').show();
    },

    /**
     * Show all categories and all posts
     * @return {void}
     */
    showAll: function() {
      this.$categories.show();
      this.$posts.show();
      $(this.posts + ' > .archive-posts > .archive-post').show();
    },

    /**
     * Hide all categories and all posts
     * @return {void}
     */
    hideAll: function() {
      this.$categories.hide();
      this.$posts.hide();
    }
  };

  $(document).ready(function() {
    if ($('#categories-archives').length) {
      var categoriesFilter = new CategoriesFilter('#categories-archives');
      categoriesFilter.run();
    }
  });
})(jQuery);
;(function($) {
  'use strict';

  // Resize code blocks to fit the screen width

  /**
   * Code block resizer
   * @param {String} elem
   * @constructor
   */
  var CodeBlockResizer = function(elem) {
    this.$codeBlocks = $(elem);
  };

  CodeBlockResizer.prototype = {
    /**
     * Run main feature
     * @return {void}
     */
    run: function() {
      var self = this;
      // resize all codeblocks
      self.resize();
      // resize codeblocks when window is resized
      $(window).smartresize(function() {
        self.resize();
      });
    },

    /**
     * Resize codeblocks
     * @return {void}
     */
    resize: function() {
      var self = this;
      self.$codeBlocks.each(function() {
        var $gutter = $(this).find('.gutter');
        var $code = $(this).find('.code');
        // get padding of code div
        var codePaddings = $code.width() - $code.innerWidth();
        // code block div width with padding - gutter div with padding + code div padding
        var width = $(this).outerWidth() - $gutter.outerWidth() + codePaddings;
        // apply new width
        $code.css('width', width);
        $code.children('pre').css('width', width);
      });
    }
  };

  $(document).ready(function() {
    // register jQuery function to check if an element has an horizontal scroll bar
    $.fn.hasHorizontalScrollBar = function() {
      return this.get(0).scrollWidth > this.innerWidth();
    };
    var resizer = new CodeBlockResizer('figure.highlight');
    resizer.run();
  });
})(jQuery);
;(function($) {
  'use strict';
  
  // Run fancybox feature

  $(document).ready(function() {
    $(".fancybox").fancybox({
      maxWidth: 900,
      maxHeight: 800,
      fitToView: true,
      width: '50%',
      height: '50%',
      autoSize: true,
      closeClick: false,
      openEffect: 'elastic',
      closeEffect: 'elastic',
      prevEffect: 'none',
      nextEffect: 'none',
      padding: '0',
      helpers: {
        thumbs: {
          width: 70,
          height: 70
        },
        overlay: {
          css: {
            background: 'rgba(0, 0, 0, 0.85)'
          }
        }
      }
    });
  });
})(jQuery);
;(function($) {
  'use strict';

  // Hide the header when the user scrolls down, and show it when he scrolls up

  /**
   * Header
   * @constructor
   */
  var Header = function() {
    this.$header = $('#header');
    this.headerHeight = this.$header.height();
    // CSS class located in `source/_css/layout/_header.scss`
    this.headerUpCSSClass = 'header-up';
    this.delta = 5;
    this.lastScrollTop = 0;
  };

  Header.prototype = {

    /**
     * Run Header feature
     * @return {void}
     */
    run: function() {
      var self = this;
      var didScroll;

      // Detect if the user is scrolling
      $(window).scroll(function() {
        didScroll = true;
      });

      // Check if the user scrolled every 250 milliseconds
      setInterval(function() {
        if (didScroll) {
          self.animate();
          didScroll = false;
        }
      }, 250);
    },

    /**
     * Animate the header
     * @return {void}
     */
    animate: function() {
      var scrollTop = $(window).scrollTop();

      // Check if the user scrolled more than `delta`
      if (Math.abs(this.lastScrollTop - scrollTop) <= this.delta) {
        return;
      }

      // Checks if the user has scrolled enough down and has past the navbar
      if ((scrollTop > this.lastScrollTop) && (scrollTop > this.headerHeight)) {
        this.$header.addClass(this.headerUpCSSClass);
      }
      else if (scrollTop + $(window).height() < $(document).height()) {
        this.$header.removeClass(this.headerUpCSSClass);
      }

      this.lastScrollTop = scrollTop;
    }
  };

  $(document).ready(function() {
    var header = new Header();
    header.run();
  });
})(jQuery);
;(function($) {
  'use strict';

  // Resize all images of an image-gallery

  /**
   * ImageGallery
   * @constructor
   */
  var ImageGallery = function() {
    // CSS class located in `source/_css/components/_image-gallery.scss`
    this.photosBox = '.photo-box';
    this.$images = $(this.photosBox + ' img');
  };
  ImageGallery.prototype = {

    /**
     * Run ImageGallery feature
     * @return {void}
     */
    run: function() {
      var self = this;

      // Resize all images at the loading of the page
      self.resizeImages();

      // Resize all images when the user is resizing the page
      $(window).smartresize(function() {
        self.resizeImages();
      });
    },

    /**
     * Resize all images of an image gallery
     * @return {void}
     */
    resizeImages: function() {
      var photoBoxWidth;
      var photoBoxHeight;
      var imageWidth;
      var imageHeight;
      var imageRatio;
      var $image;

      this.$images.each(function() {
        $image = $(this);
        photoBoxWidth = $image.parent().parent().width();
        photoBoxHeight = $image.parent().parent().innerHeight();
        imageWidth = $image.width();
        imageHeight = $image.height();

        // Checks if image height is smaller than his box
        if (imageHeight < photoBoxHeight) {
          imageRatio = (imageWidth / imageHeight);
          // Resize image with the box height
          $image.css({
            height: photoBoxHeight,
            width: (photoBoxHeight * imageRatio)
          });
          // Center image in his box
          $image.parent().css({
            left: '-' + (((photoBoxHeight * imageRatio) / 2) - (photoBoxWidth / 2)) + 'px'
          });
        }

        // Update new values of height and width
        imageWidth = $image.width();
        imageHeight = $image.height();

        // Checks if image width is smaller than his box
        if (imageWidth < photoBoxWidth) {
          imageRatio = (imageHeight / photoBoxWidth);

          $image.css({
            width: photoBoxWidth,
            height: (photoBoxWidth * imageRatio)
          });
          // Center image in his box
          $image.parent().css({
            top: '-' + (((imageHeight) / 2) - (photoBoxHeight / 2)) + 'px'
          });
        }

        // Checks if image height is larger than his box
        if (imageHeight > photoBoxHeight) {
          // Center image in his box
          $image.parent().css({
            top: '-' + (((imageHeight) / 2) - (photoBoxHeight / 2)) + 'px'
          });
        }
      });
    }
  };

  $(document).ready(function() {
    if ($('.image-gallery').length) {
      var imageGallery = new ImageGallery();

      // Small timeout to wait the loading of all images.
      setTimeout(function() {
        imageGallery.run();
      }, 500);
    }
  });
})(jQuery);
;(function($) {
  'use strict';

  // Hide the post bottom bar when the post footer is visible by the user,
  // and show it when the post footer isn't visible by the user

  /**
   * PostBottomBar
   * @constructor
   */
  var PostBottomBar = function() {
    this.$postBottomBar = $('.post-bottom-bar');
    this.$postFooter = $('.post-actions-wrap');
    this.$header = $('#header');
    this.delta = 1;
    this.lastScrollTop = 0;
  };

  PostBottomBar.prototype = {

    /**
     * Run PostBottomBar feature
     * @return {void}
     */
    run: function() {
      var self = this;
      var didScroll;
      // Run animation for first time
      self.swipePostBottomBar();
      // Detects if the user is scrolling
      $(window).scroll(function() {
        didScroll = true;
      });
      // Check if the user scrolled every 250 milliseconds
      setInterval(function() {
        if (didScroll) {
          self.swipePostBottomBar();
          didScroll = false;
        }
      }, 250);
    },

    /**
     * Swipe the post bottom bar
     * @return {void}
     */
    swipePostBottomBar: function() {
      var scrollTop = $(window).scrollTop();
      var postFooterOffsetTop = this.$postFooter.offset().top;
      // show bottom bar
      // if the user scrolled upwards more than `delta`
      // and `post-footer` div isn't visible
      if (this.lastScrollTop > scrollTop &&
        (postFooterOffsetTop + this.$postFooter.height() > scrollTop + $(window).height() ||
        postFooterOffsetTop < scrollTop + this.$header.height())) {
        this.$postBottomBar.slideDown();
      }
      else {
        this.$postBottomBar.slideUp();
      }
      this.lastScrollTop = scrollTop;
    }
  };

  $(document).ready(function() {
    if ($('.post-bottom-bar').length) {
      var postBottomBar = new PostBottomBar();
      postBottomBar.run();
    }
  });
})(jQuery);
;(function($) {
  'use strict';

  // Open and close the share options bar

  /**
   * ShareOptionsBar
   * @constructor
   */
  var ShareOptionsBar = function() {
    this.$shareOptionsBar = $('#share-options-bar');
    this.$openBtn = $('.btn-open-shareoptions');
    this.$closeBtn = $('#share-options-mask');
  };

  ShareOptionsBar.prototype = {

    /**
     * Run ShareOptionsBar feature
     * @return {void}
     */
    run: function() {
      var self = this;

      // Detect the click on the open button
      self.$openBtn.click(function() {
        if (!self.$shareOptionsBar.hasClass('opened')) {
          self.openShareOptions();
          self.$closeBtn.show();
        }
      });

      // Detect the click on the close button
      self.$closeBtn.click(function() {
        if (self.$shareOptionsBar.hasClass('opened')) {
          self.closeShareOptions();
          self.$closeBtn.hide();
        }
      });
    },

    /**
     * Open share options bar
     * @return {void}
     */
    openShareOptions: function() {
      var self = this;

      // Check if the share option bar isn't opened
      // and prevent multiple click on the open button with `.processing` class
      if (!self.$shareOptionsBar.hasClass('opened') &&
        !this.$shareOptionsBar.hasClass('processing')) {
        // Open the share option bar
        self.$shareOptionsBar.addClass('processing opened');

        setTimeout(function() {
          self.$shareOptionsBar.removeClass('processing');
        }, 250);
      }
    },

    /**
     * Close share options bar
     * @return {void}
     */
    closeShareOptions: function() {
      var self = this;

      // Check if the share options bar is opened
      // and prevent multiple click on the close button with `.processing` class
      if (self.$shareOptionsBar.hasClass('opened') &&
        !this.$shareOptionsBar.hasClass('processing')) {
        // Close the share option bar
        self.$shareOptionsBar
          .addClass('processing')
          .removeClass('opened');

        setTimeout(function() {
          self.$shareOptionsBar.removeClass('processing');
        }, 250);
      }
    }
  };

  $(document).ready(function() {
    var shareOptionsBar = new ShareOptionsBar();
    shareOptionsBar.run();
  });
})(jQuery);
;(function($) {
  'use strict';

  // Open and close the sidebar by swiping the sidebar and the blog and vice versa

  /**
   * Sidebar
   * @constructor
   */
  var Sidebar = function() {
    this.$sidebar = $('#sidebar');
    this.$openBtn = $('#btn-open-sidebar');
    // Elements where the user can click to close the sidebar
    this.$closeBtn = $('#header, #main, .post-header-cover');
    // Elements affected by the swipe of the sidebar
    // The `pushed` class is added to each elements
    // Each element has a different behavior when the sidebar is opened
    this.$blog = $('.post-bottom-bar, #header, #main, .post-header-cover');
    // If you change value of `mediumScreenWidth`,
    // you have to change value of `$screen-min: (md-min)` too
    // in `source/_css/utils/variables.scss`
    this.mediumScreenWidth = 768;
  };

  Sidebar.prototype = {
    /**
     * Run Sidebar feature
     * @return {void}
     */
    run: function() {
      var self = this;
      // Detect the click on the open button
      self.$openBtn.click(function() {
        if (!self.$sidebar.hasClass('pushed')) {
          self.openSidebar();
        }
      });
      // Detect the click on close button
      self.$closeBtn.click(function() {
        if (self.$sidebar.hasClass('pushed')) {
          self.closeSidebar();
        }
      });
      // Detect resize of the windows
      $(window).resize(function() {
        // Check if the window is larger than the minimal medium screen value
        if ($(window).width() > self.mediumScreenWidth) {
          self.resetSidebarPosition();
          self.resetBlogPosition();
        }
        else {
          self.closeSidebar();
        }
      });
    },

    /**
     * Open the sidebar by swiping to the right the sidebar and the blog
     * @return {void}
     */
    openSidebar: function() {
      this.swipeBlogToRight();
      this.swipeSidebarToRight();
    },

    /**
     * Close the sidebar by swiping to the left the sidebar and the blog
     * @return {void}
     */
    closeSidebar: function() {
      this.swipeSidebarToLeft();
      this.swipeBlogToLeft();
    },

    /**
     * Reset sidebar position
     * @return {void}
     */
    resetSidebarPosition: function() {
      this.$sidebar.removeClass('pushed');
    },

    /**
     * Reset blog position
     * @return {void}
     */
    resetBlogPosition: function() {
      this.$blog.removeClass('pushed');
    },

    /**
     * Swipe the sidebar to the right
     * @return {void}
     */
    swipeSidebarToRight: function() {
      var self = this;
      // Check if the sidebar isn't swiped
      // and prevent multiple click on the open button with `.processing` class
      if (!self.$sidebar.hasClass('pushed') && !this.$sidebar.hasClass('processing')) {
        // Swipe the sidebar to the right
        self.$sidebar.addClass('processing pushed');

        setTimeout(function() {
          self.$sidebar.removeClass('processing');
        }, 250);
      }
    },

    /**
     * Swipe the sidebar to the left
     * @return {void}
     */
    swipeSidebarToLeft: function() {
      var self = this;
      // Check if the sidebar is swiped
      // and prevent multiple click on the close button with `.processing` class
      if (self.$sidebar.hasClass('pushed') && !this.$sidebar.hasClass('processing')) {
        // Swipe the sidebar to the left
        self.$sidebar
          .addClass('processing')
          .removeClass('pushed processing');
      }
    },

    /**
     * Swipe the blog to the right
     * @return {void}
     */
    swipeBlogToRight: function() {
      var self = this;
      // Check if the blog isn't swiped
      // and prevent multiple click on the open button with `.processing` class
      if (!self.$blog.hasClass('pushed') && !this.$blog.hasClass('processing')) {
        // Swipe the blog to the right
        self.$blog.addClass('processing pushed');

        setTimeout(function() {
          self.$blog.removeClass('processing');
        }, 250);
      }
    },

    /**
     * Swipe the blog to the left
     * @return {void}
     */
    swipeBlogToLeft: function() {
      var self = this;
      // Check if the blog is swiped
      // and prevent multiple click on the close button with `.processing` class
      if (self.$blog.hasClass('pushed') && !this.$blog.hasClass('processing')) {
        // Swipe the blog to the left
        self.$blog
          .addClass('processing')
          .removeClass('pushed');

        setTimeout(function() {
          self.$blog.removeClass('processing');
        }, 250);
      }
    }
  };

  $(document).ready(function() {
    var sidebar = new Sidebar();
    sidebar.run();
  });
})(jQuery);
;(function($, sr) {
  // debouncing function from John Hann
  // http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/
  var debounce = function(func, threshold, execAsap) {
    var timeout;

    return function debounced() {
      var obj = this;
      var args = arguments;

      function delayed() {
        if (!execAsap) {
          func.apply(obj, args);
        }

        timeout = null;
      }

      if (timeout) {
        clearTimeout(timeout);
      }
      else if (execAsap) {
        func.apply(obj, args);
      }

      timeout = setTimeout(delayed, threshold || 100);
    };
  };

  jQuery.fn[sr] = function(fn) {
    return fn ? this.bind('resize', debounce(fn)) : this.trigger(sr);
  };
})(jQuery, 'smartresize');
;(function($) {
  'use strict';

  // Animate tabs of tabbed code blocks

  /**
   * TabbedCodeBlock
   * @param {String} elems
   * @constructor
   */
  var TabbedCodeBlock = function(elems) {
    this.$tabbedCodeBlocs = $(elems);
  };

  TabbedCodeBlock.prototype = {
    /**
     * Run TabbedCodeBlock feature
     * @return {void}
     */
    run: function() {
      var self = this;
      self.$tabbedCodeBlocs.find('.tab').click(function() {
        var $codeblock = $(this).parent().parent().parent();
        var $tabsContent = $codeblock.find('.tabs-content').children('pre, .highlight');
        // remove `active` css class on all tabs
        $(this).siblings().removeClass('active');
        // add `active` css class on the clicked tab
        $(this).addClass('active');
        // hide all tab contents
        $tabsContent.hide();
        // show only the right one
        $tabsContent.eq($(this).index()).show();
      });
    }
  };

  $(document).ready(function() {
    var tabbedCodeBlocks = new TabbedCodeBlock('.codeblock--tabbed');
    tabbedCodeBlocks.run();
  });
})(jQuery);
;(function($) {
  'use strict';

  // Filter posts by using their categories on categories page : `/categories`

  /**
   * TagsFilter
   * @param {String} tagsArchivesElem
   * @constructor
   */
  var TagsFilter = function(tagsArchivesElem) {
    this.$form = $(tagsArchivesElem).find('#filter-form');
    this.$inputSearch = $(tagsArchivesElem + ' #filter-form input[name=tag]');
    this.$archiveResult = $(tagsArchivesElem).find('.archive-result');
    this.$tags = $(tagsArchivesElem).find('.tag');
    this.$posts = $(tagsArchivesElem).find('.archive');
    this.tags = tagsArchivesElem + ' .tag';
    this.posts = tagsArchivesElem + ' .archive';
    // Html data attribute without `data-` of `.archive` element which contains the name of tag
    this.dataTag = 'tag';
    this.messages = {
      zero: this.$archiveResult.data('message-zero'),
      one: this.$archiveResult.data('message-one'),
      other: this.$archiveResult.data('message-other')
    };
  };

  TagsFilter.prototype = {
    /**
     * Run TagsFilter feature
     * @return {void}
     */
    run: function() {
      var self = this;

      // Detect keystroke of the user
      self.$inputSearch.keyup(function() {
        self.filter(self.getSearch());
      });

      // Block submit action
      self.$form.submit(function(e) {
        e.preventDefault();
      });
    },

    /**
     * Get the search entered by user
     * @returns {String} the name of tag entered by the user
     */
    getSearch: function() {
      return this.$inputSearch.val().toLowerCase();
    },

    /**
     * Show related posts form a tag and hide the others
     * @param {String} tag - name of a tag
     * @return {void}
     */
    filter: function(tag) {
      if (tag === '') {
        this.showAll();
        this.showResult(-1);
      }
      else {
        this.hideAll();
        this.showPosts(tag);
        this.showResult(this.countTags(tag));
      }
    },

    /**
     * Display results of the search
     * @param {Number} numbTags - Number of tags found
     * @return {void}
     */
    showResult: function(numbTags) {
      if (numbTags === -1) {
        this.$archiveResult.html('').hide();
      }
      else if (numbTags === 0) {
        this.$archiveResult.html(this.messages.zero).show();
      }
      else if (numbTags === 1) {
        this.$archiveResult.html(this.messages.one).show();
      }
      else {
        this.$archiveResult.html(this.messages.other.replace(/\{n\}/, numbTags)).show();
      }
    },

    /**
     * Count number of tags
     * @param {String} tag
     * @returns {Number}
     */
    countTags: function(tag) {
      return $(this.posts + '[data-' + this.dataTag + '*=\'' + tag + '\']').length;
    },

    /**
     * Show all posts from a tag
     * @param {String} tag - name of a tag
     * @return {void}
     */
    showPosts: function(tag) {
      $(this.tags + '[data-' + this.dataTag + '*=\'' + tag + '\']').show();
      $(this.posts + '[data-' + this.dataTag + '*=\'' + tag + '\']').show();
    },

    /**
     * Show all tags and all posts
     * @return {void}
     */
    showAll: function() {
      this.$tags.show();
      this.$posts.show();
    },

    /**
     * Hide all tags and all posts
     * @return {void}
     */
    hideAll: function() {
      this.$tags.hide();
      this.$posts.hide();
    }
  };

  $(document).ready(function() {
    if ($('#tags-archives').length) {
      var tagsFilter = new TagsFilter('#tags-archives');
      tagsFilter.run();
    }
  });
})(jQuery);
