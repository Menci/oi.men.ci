{%
  set js_commons = [
    'src/utils.js',
    'src/motion.js'
  ]
%}

{% for common in js_commons %}
  <script type="text/javascript" src="https://static.cdn.menci.xyz/menci-oi-blog/js/{{ common }}?v={{ theme.version }}"></script>
{% endfor %}
