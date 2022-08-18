{# Reset `window.Promise` when it was not a function. #}
{# IE refers the element whose id is `Promise` as `window.Promise`, this causes Velocity throwing an exception #}
<script type="text/javascript">
  if (Object.prototype.toString.call(window.Promise) !== '[object Function]') {
    window.Promise = null;
  }
</script>

{% set js_vendors = {} %}
{% set js_vendors.jquery      = 'https://lf26-cdn-tos.bytecdntp.com/cdn/expire-1-y/jquery/2.1.3/jquery.min.js' %}
{% set js_vendors.fastclick   = 'https://lf26-cdn-tos.bytecdntp.com/cdn/expire-1-y/fastclick/1.0.6/fastclick.min.js' %}
{% set js_vendors.lazyload    = 'https://lf26-cdn-tos.bytecdntp.com/cdn/expire-1-y/jquery_lazyload/1.9.7/jquery.lazyload.min.js' %}
{% set js_vendors.velocity    = 'https://lf3-cdn-tos.bytecdntp.com/cdn/expire-1-y/velocity/2.0.6/velocity.min.js' %}
{% set js_vendors.velocity_ui = 'https://lf6-cdn-tos.bytecdntp.com/cdn/expire-1-y/velocity/2.0.6/velocity.ui.min.js' %}

{% if theme.fancybox %}
  {% set js_vendors.fancybox  = 'https://lf6-cdn-tos.bytecdntp.com/cdn/expire-1-y/fancybox/2.1.5/jquery.fancybox.pack.js' %}
{% endif %}
{% if theme.canvas_nest %}
  {% set js_vendors.canvas_nest  = 'https://lf9-cdn-tos.bytecdntp.com/cdn/expire-1-y/canvas-nest.js/1.0.1/canvas-nest.min.js' %}
{% endif %}

{% if theme.three_waves %}
  {% set js_vendors.three  = 'https://static.cdn.menci.xyz/menci-oi-blog/lib/three/three.min.js' %}
  {% set js_vendors.three_waves  = 'https://static.cdn.menci.xyz/menci-oi-blog/lib/three/three-waves.min.js' %}
{% endif %}

{% if theme.canvas_lines %}
  {% set js_vendors.three  = 'https://static.cdn.menci.xyz/menci-oi-blog/lib/three/three.min.js' %}
  {% set js_vendors.canvas_lines  = 'https://static.cdn.menci.xyz/menci-oi-blog/lib/three/canvas_lines.min.js' %}
{% endif %}

{% if theme.canvas_sphere %}
  {% set js_vendors.three  = 'https://static.cdn.menci.xyz/menci-oi-blog/lib/three/three.min.js' %}
  {% set js_vendors.canvas_sphere  = 'https://static.cdn.menci.xyz/menci-oi-blog/lib/three/canvas_sphere.min.js' %}
{% endif %}

{% if theme.canvas_ribbon and theme.scheme === 'Pisces'%}
  {% set js_vendors.canvas_ribbon  = 'https://static.cdn.menci.xyz/menci-oi-blog/lib/canvas-ribbon/canvas-ribbon.js' %}
{% endif %}

{% for name, internal in js_vendors %}
  {% set internal_script = internal %}
  <script type="text/javascript" src="{{ theme.vendors[name] | default(internal_script) }}"></script>
{% endfor %}
