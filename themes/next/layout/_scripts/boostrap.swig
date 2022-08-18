{%
  set boot_scripts = [
    'src/bootstrap.js'
  ]
%}

{% for bs in boot_scripts %}
  <script type="text/javascript" src="https://static.cdn.menci.xyz/menci-oi-blog/js/{{ bs }}?v={{ theme.version }}"></script>
{% endfor %}
