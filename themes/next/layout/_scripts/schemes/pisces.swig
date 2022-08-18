{%
  set scripts = [
    'src/affix.js',
    'src/schemes/pisces.js'
  ]
%}

{% for script in scripts %}
  <script type="text/javascript" src="https://static.cdn.menci.xyz/menci-oi-blog/js/{{ script }}?v={{ theme.version }}"></script>
{% endfor %}
