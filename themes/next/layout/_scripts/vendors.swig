{# Reset `window.Promise` when it was not a function. #}
{# IE refers the element whose id is `Promise` as `window.Promise`, this causes Velocity throwing an exception #}
<script type="text/javascript">
  if (Object.prototype.toString.call(window.Promise) !== '[object Function]') {
    window.Promise = null;
  }
</script>

{% set js_vendors = {} %}
{% set js_vendors.jquery      = 'https://cdn.jsdelivr.net/npm/jquery@2.1.3/dist/jquery.min.js' %}
{% set js_vendors.fastclick   = 'https://cdn.jsdelivr.net/npm/fastclick@1.0.6/lib/fastclick.min.js' %}
{% set js_vendors.lazyload    = 'https://cdn.jsdelivr.net/npm/jquery-lazyload@1.9.7/jquery.lazyload.min.js' %}
{% set js_vendors.velocity    = 'https://cdn.jsdelivr.net/npm/velocity-animate@1.4.3/velocity.min.js' %}
{% set js_vendors.velocity_ui = 'https://cdn.jsdelivr.net/npm/velocity-animate@1.4.3/velocity.min.js' %}

{% if theme.fancybox %}
  {% set js_vendors.fancybox  = 'https://cdn.jsdelivr.net/npm/jquery.fancybox@2.1.5/source/jquery.fancybox.pack.min.js' %}
{% endif %}
{% if theme.canvas_nest %}
  {% set js_vendors.canvas_nest  = 'https://cdn.jsdelivr.net/npm/canvas-nest.js@1.0.1/dist/canvas-nest.min.js' %}
{% endif %}

{% if theme.three_waves %}
  {% set js_vendors.three  = 'https://menci-oi.upyun.menci.memset0.cn/lib/three/three.min.js' %}
  {% set js_vendors.three_waves  = 'https://menci-oi.upyun.menci.memset0.cn/lib/three/three-waves.min.js' %}
{% endif %}

{% if theme.canvas_lines %}
  {% set js_vendors.three  = 'https://menci-oi.upyun.menci.memset0.cn/lib/three/three.min.js' %}
  {% set js_vendors.canvas_lines  = 'https://menci-oi.upyun.menci.memset0.cn/lib/three/canvas_lines.min.js' %}
{% endif %}

{% if theme.canvas_sphere %}
  {% set js_vendors.three  = 'https://menci-oi.upyun.menci.memset0.cn/lib/three/three.min.js' %}
  {% set js_vendors.canvas_sphere  = 'https://menci-oi.upyun.menci.memset0.cn/lib/three/canvas_sphere.min.js' %}
{% endif %}

{% if theme.canvas_ribbon and theme.scheme === 'Pisces'%}
  {% set js_vendors.canvas_ribbon  = 'https://menci-oi.upyun.menci.memset0.cn/lib/canvas-ribbon/canvas-ribbon.js' %}
{% endif %}

{% for name, internal in js_vendors %}
  {% set internal_script = internal %}
  <script type="text/javascript" src="{{ theme.vendors[name] | default(internal_script) }}"></script>
{% endfor %}
