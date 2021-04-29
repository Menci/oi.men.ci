{%
  set js_commons = [
    'src/utils.js',
    'src/motion.js'
  ]
%}

{% for common in js_commons %}
  <script type="text/javascript" src="https://menci-oi.upyun.menci.memset0.cn/js/{{ common }}?v={{ theme.version }}"></script>
{% endfor %}
