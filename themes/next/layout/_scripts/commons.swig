{%
  set js_commons = [
    'src/utils.js',
    'src/motion.js'
  ]
%}

{% for common in js_commons %}
  <script type="text/javascript" src="https://oi-blog.cdn.menci.xyz/js/{{ common }}?v={{ theme.version }}"></script>
{% endfor %}
