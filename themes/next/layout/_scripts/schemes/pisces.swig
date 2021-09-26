{%
  set scripts = [
    'src/affix.js',
    'src/schemes/pisces.js'
  ]
%}

{% for script in scripts %}
  <script type="text/javascript" src="https://oi-blog.cdn.menci.xyz/js/{{ script }}?v={{ theme.version }}"></script>
{% endfor %}
