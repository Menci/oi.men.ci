{%
  set boot_scripts = [
    'src/bootstrap.js'
  ]
%}

{% for bs in boot_scripts %}
  <script type="text/javascript" src="https://menci-oi.upyun.menci.memset0.cn/js/{{ bs }}?v={{ theme.version }}"></script>
{% endfor %}
