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

  // Derive base URL from script src
  var scriptUrl = new URL(src);
  var baseUrl = scriptUrl.origin;

  var iframeUrl = baseUrl + '/chat/' + widgetId;

  // Create the iframe
  var iframe = document.createElement('iframe');
  iframe.src = iframeUrl;
  iframe.id = 'rhcb-frame-' + widgetId;
  iframe.allow = 'clipboard-write';
  iframe.setAttribute('aria-label', 'Customer support chat');
  iframe.setAttribute('role', 'complementary');

  // Collapsed state styles
  var collapsedStyles = {
    position: 'fixed',
    bottom: '0',
    right: '0',
    width: '80px',
    height: '80px',
    border: 'none',
    zIndex: '2147483647',
    background: 'transparent',
    display: 'block',
    transition: 'width 0.2s ease, height 0.2s ease',
    overflow: 'hidden',
    pointerEvents: 'all',
  };

  var expandedStyles = {
    position: 'fixed',
    bottom: '0',
    right: '0',
    width: '420px',
    height: '580px',
    border: 'none',
    zIndex: '2147483647',
    background: 'transparent',
    display: 'block',
    transition: 'width 0.2s ease, height 0.2s ease',
    overflow: 'hidden',
    pointerEvents: 'all',
  };

  function applyStyles(el, styles) {
    for (var key in styles) {
      el.style[key] = styles[key];
    }
  }

  applyStyles(iframe, collapsedStyles);
  document.body.appendChild(iframe);

  var isOpen = false;

  // Listen for messages from iframe
  window.addEventListener('message', function (e) {
    if (!e.data || e.data.type !== 'rhcb:resize') return;

    isOpen = e.data.open;
    if (isOpen) {
      applyStyles(iframe, expandedStyles);
    } else {
      applyStyles(iframe, collapsedStyles);
    }
  });

  // Responsive: on mobile, use full-screen when open
  function applyResponsive() {
    if (!isOpen) return;
    if (window.innerWidth < 480) {
      iframe.style.width = '100vw';
      iframe.style.height = '100vh';
      iframe.style.bottom = '0';
      iframe.style.right = '0';
    } else {
      iframe.style.width = expandedStyles.width;
      iframe.style.height = expandedStyles.height;
    }
  }

  window.addEventListener('resize', applyResponsive);
})();
