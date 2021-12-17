{% if theme.google_analytics %}
<script>
window.ga_tid = "{{ theme.google_analytics }}";
window.ga_api = "https://cdn.menci.xyz/google-analytics/";
</script>
<script src="https://cdn.menci.xyz/google-analytics/jquery.js" async></script>
{% endif %}
