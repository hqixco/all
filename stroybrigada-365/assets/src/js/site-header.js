(function () {
  (function (m, e, t, r, i, k, a) {
    m[i] = m[i] || function () {
      (m[i].a = m[i].a || []).push(arguments);
    };
    m[i].l = 1 * new Date();

    for (var j = 0; j < document.scripts.length; j += 1) {
      if (document.scripts[j].src === r) {
        return;
      }
    }

    k = e.createElement(t);
    a = e.getElementsByTagName(t)[0];
    k.async = 1;
    k.src = r;
    a.parentNode.insertBefore(k, a);
  })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js?id=108767903', 'ym');

  window.ym(108767903, 'init', {
    ssr: true,
    webvisor: true,
    clickmap: true,
    ecommerce: 'dataLayer',
    referrer: document.referrer,
    url: location.href,
    accurateTrackBounce: true,
    trackLinks: true
  });

  var currentScript = document.currentScript;
  if (!currentScript) {
    return;
  }

  function getAssetBase() {
    if (window.StroybrigadaSettings && window.StroybrigadaSettings.themeAssetsBase) {
      return window.StroybrigadaSettings.themeAssetsBase;
    }

    var scriptSrc = currentScript.getAttribute('src') || '';
    var assetsIndex = scriptSrc.indexOf('/assets/');

    if (assetsIndex !== -1) {
      return scriptSrc.slice(0, assetsIndex + '/assets/'.length);
    }

    return '/assets/';
  }

  var headerUrl = currentScript.getAttribute('data-header-url') || getAssetBase() + 'partials/site-header.html';

  try {
    var request = new XMLHttpRequest();
    request.open('GET', headerUrl, false);
    request.send(null);

    var isSuccess = (request.status >= 200 && request.status < 300) || request.status === 0;
    if (!isSuccess) {
      throw new Error('Unexpected status ' + request.status);
    }

    currentScript.insertAdjacentHTML('afterend', request.responseText);
    currentScript.remove();
  } catch (error) {
    console.error('Failed to load shared site header:', error);
  }
})();
