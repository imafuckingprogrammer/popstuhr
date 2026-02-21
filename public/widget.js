(function () {
  'use strict';

  // Get widget ID from this script's own src URL
  var scripts = document.querySelectorAll('script[src*="/widget.js"]');
  var src = '';
  for (var i = 0; i < scripts.length; i++) {
    if (scripts[i].src && scripts[i].src.indexOf('/widget.js') !== -1) {
      src = scripts[i].src;
      break;
    }
  }

  var params = new URLSearchParams(src.split('?')[1] || '');
  var widgetId = params.get('id');
  if (!widgetId) { console.warn('[RedHotChatbot] No widget id found.'); return; }

  var scriptUrl = new URL(src);
  var baseUrl = scriptUrl.origin;
  var iframeUrl = baseUrl + '/chat/' + widgetId;

  // Fetch widget config to get position setting, then init
  fetch(baseUrl + '/api/widget-config/' + widgetId)
    .then(function (r) { return r.ok ? r.json() : {}; })
    .catch(function () { return {}; })
    .then(function (config) {
      init(config.position === 'bottom-left');
    });

  function init(isLeft) {
    var side = isLeft ? 'left' : 'right';
    var oppSide = isLeft ? 'right' : 'left';

    function makeStyles(w, h) {
      return {
        position: 'fixed',
        bottom: '0',
        border: 'none',
        zIndex: '2147483647',
        background: 'transparent',
        display: 'block',
        width: w,
        height: h,
        transition: 'width 0.2s ease, height 0.2s ease',
        overflow: 'hidden',
        pointerEvents: 'all',
      };
    }

    var collapsedStyles = makeStyles('80px', '80px');
    var expandedStyles  = makeStyles('420px', '580px');

    function applyStyles(el, styles) {
      for (var key in styles) { el.style[key] = styles[key]; }
      el.style[side] = '0';
      el.style[oppSide] = 'auto';
    }

    var iframe = document.createElement('iframe');
    iframe.src = iframeUrl;
    iframe.id = 'rhcb-frame-' + widgetId;
    iframe.allow = 'clipboard-write';
    iframe.setAttribute('aria-label', 'Customer support chat');
    iframe.setAttribute('role', 'complementary');

    applyStyles(iframe, collapsedStyles);
    document.body.appendChild(iframe);

    var isOpen = false;

    // Only accept postMessages from our own origin
    window.addEventListener('message', function (e) {
      if (e.origin !== baseUrl) return;
      if (!e.data || e.data.type !== 'rhcb:resize') return;

      isOpen = e.data.open;
      if (isOpen) {
        applyStyles(iframe, expandedStyles);
        applyResponsive();
      } else {
        applyStyles(iframe, collapsedStyles);
      }
    });

    // Full-screen on mobile when open
    function applyResponsive() {
      if (!isOpen) return;
      if (window.innerWidth < 480) {
        iframe.style.width = '100vw';
        iframe.style.height = '100vh';
        iframe.style.bottom = '0';
        iframe.style[side] = '0';
        iframe.style[oppSide] = 'auto';
      } else {
        iframe.style.width = expandedStyles.width;
        iframe.style.height = expandedStyles.height;
      }
    }

    window.addEventListener('resize', applyResponsive);
  }
})();
