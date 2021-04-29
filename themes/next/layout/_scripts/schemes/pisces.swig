{%
  set scripts = [
    'src/affix.js',
    'src/schemes/pisces.js'
  ]
%}

{% for script in scripts %}
  <script type="text/javascript" src="https://menci-oi.upyun.menci.memset0.cn/js/{{ script }}?v={{ theme.version }}"></script>
{% endfor %}
