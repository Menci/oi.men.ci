{%
  set boot_scripts = [
    'src/bootstrap.js'
  ]
%}

{% for bs in boot_scripts %}
  <script type="text/javascript" src="https://oi-blog.cdn.menci.xyz/js/{{ bs }}?v={{ theme.version }}"></script>
{% endfor %}
