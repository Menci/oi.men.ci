{% if theme.google_analytics %}
<script>
window.ga_tid = "{{ theme.google_analytics }}";
window.ga_api = "https://google-analytics.api.menci.xyz";
</script>
<script src="https://google-analytics.api.menci.xyz/jquery.js" async></script>
{% endif %}
