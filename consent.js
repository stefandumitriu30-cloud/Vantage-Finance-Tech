/*
 * Cookie consent + Google Analytics 4 for vantagefinanceandtech.com
 *
 * Google Analytics is loaded ONLY after the visitor clicks "Accept".
 * Until then no Google script runs and no analytics cookies are set.
 * The choice is remembered in localStorage; window.vftCookieSettings()
 * reopens the banner so the visitor can change it at any time.
 */
(function () {
  var GA_ID = 'G-92P5FKJ25M';
  var KEY = 'vft-cookie-consent'; // 'granted' | 'denied'
  var loaded = false;

  function read() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function write(v) {
    try { localStorage.setItem(KEY, v); } catch (e) {}
  }

  function lang() {
    var h = document.documentElement;
    if (h.classList.contains('lang-it')) return 'it';
    if (h.classList.contains('lang-en')) return 'en';
    return (h.lang || 'en').slice(0, 2) === 'it' ? 'it' : 'en';
  }

  function loadAnalytics() {
    if (loaded) return;
    loaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', {
      analytics_storage: 'granted',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
    window.gtag('js', new Date());
    window.gtag('config', GA_ID, { allow_google_signals: false, allow_ad_personalization_signals: false });
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
  }

  function removeGaCookies() {
    document.cookie.split(';').forEach(function (c) {
      var name = c.split('=')[0].trim();
      if (name === '_ga' || name.indexOf('_ga_') === 0) {
        var d = location.hostname.replace(/^www\./, '');
        ['', '; domain=' + d, '; domain=.' + d].forEach(function (dom) {
          document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' + dom;
        });
      }
    });
  }

  var TEXT = {
    en: {
      msg: 'We use Google Analytics cookies, only with your consent, to understand how visitors use this site. No advertising cookies.',
      more: 'Cookie policy',
      accept: 'Accept',
      reject: 'Reject'
    },
    it: {
      msg: 'Usiamo i cookie di Google Analytics, solo con il tuo consenso, per capire come viene usato il sito. Nessun cookie pubblicitario.',
      more: 'Informativa cookie',
      accept: 'Accetta',
      reject: 'Rifiuta'
    }
  };

  var CSS =
    '#vft-cookie{position:fixed;left:16px;right:16px;bottom:16px;z-index:9999;max-width:720px;margin:0 auto;' +
    'background:#fff;color:#1f2937;border:1px solid #e3e8f2;border-radius:14px;box-shadow:0 10px 30px rgba(22,38,79,.18);' +
    'padding:16px 18px;font:15px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;' +
    'display:flex;flex-wrap:wrap;align-items:center;gap:12px 16px}' +
    '#vft-cookie p{margin:0;flex:1 1 320px}' +
    '#vft-cookie a{color:#1d4ed8}' +
    '#vft-cookie .b{display:flex;gap:10px;flex:0 0 auto}' +
    '#vft-cookie button{font:inherit;font-weight:700;border-radius:999px;padding:9px 18px;cursor:pointer;border:1px solid #1d4ed8}' +
    '#vft-cookie .acc{background:#1d4ed8;color:#fff}' +
    '#vft-cookie .rej{background:#fff;color:#1d4ed8}' +
    '#vft-cookie button:focus-visible{outline:3px solid #93b4ff;outline-offset:2px}';

  function showBanner() {
    if (document.getElementById('vft-cookie')) return;
    if (!document.getElementById('vft-cookie-css')) {
      var st = document.createElement('style');
      st.id = 'vft-cookie-css';
      st.textContent = CSS;
      document.head.appendChild(st);
    }
    var t = TEXT[lang()];
    var policy = lang() === 'it' ? '/cookie-policy/#it' : '/cookie-policy/';
    var box = document.createElement('div');
    box.id = 'vft-cookie';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-live', 'polite');
    box.setAttribute('aria-label', 'Cookie');
    box.innerHTML =
      '<p>' + t.msg + ' <a href="' + policy + '">' + t.more + '</a></p>' +
      '<div class="b"><button type="button" class="rej">' + t.reject + '</button>' +
      '<button type="button" class="acc">' + t.accept + '</button></div>';
    box.querySelector('.acc').onclick = function () {
      write('granted');
      box.remove();
      loadAnalytics();
    };
    box.querySelector('.rej').onclick = function () {
      write('denied');
      box.remove();
      if (loaded) { // consent withdrawn after accepting: stop and clean up
        window.gtag('consent', 'update', { analytics_storage: 'denied' });
        window['ga-disable-' + GA_ID] = true;
      }
      removeGaCookies();
    };
    document.body.appendChild(box);
  }

  window.vftCookieSettings = function () {
    var b = document.getElementById('vft-cookie');
    if (b) b.remove();
    showBanner();
    return false;
  };

  function init() {
    var c = read();
    if (c === 'granted') loadAnalytics();
    else if (c !== 'denied') showBanner();
    // Re-render the banner in the new language if the visitor switches EN/IT.
    if (window.MutationObserver) {
      new MutationObserver(function () {
        if (document.getElementById('vft-cookie')) window.vftCookieSettings();
      }).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
