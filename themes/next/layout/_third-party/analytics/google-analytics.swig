{% if theme.google_analytics %}
<script>
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
            (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
          m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
  ga('create', '{{ theme.google_analytics }}', 'auto');
  ga('send', 'pageview');
</script>
{% endif %}
<script async data-domain="oi.men.ci" src="https://stat.u.sb/js/script.outbound-links.js"></script>
