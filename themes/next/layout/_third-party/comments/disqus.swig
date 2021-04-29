{% if not (theme.duoshuo and theme.duoshuo.shortname) and not theme.duoshuo_shortname %}
  {% if theme.disqus.enable %}

    {% if theme.disqus.count  %}
      <script id="dsq-count-scr" src="https://{{theme.disqus.shortname}}.disqus.com/count.js" async></script>
    {% endif %}

    {% if page.comments %}
      <script type="text/javascript">
        function MenciRemoveIndexDotHtml(url) {
          if (url.substr(-10, 10) == 'index.html') return url.substr(0, url.length - 10);
          else return url;
        }

        var disqus_config = function () {
          this.page.url = MenciRemoveIndexDotHtml('{{ page.permalink }}');
        };

        var d = document, s = d.createElement('script');
        s.src = 'https://{{theme.disqus.shortname}}.disqus.com/embed.js';
        s.setAttribute('data-timestamp', '' + +new Date());
        (d.head || d.body).appendChild(s);
      </script>
    {% endif %}

  {% endif %}
{% endif %}
