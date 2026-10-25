(function () {
  var currentScript = document.currentScript;
  if (!currentScript) {
    return;
  }

  function getAssetBase() {
    if (window.StroybrigadaSettings && window.StroybrigadaSettings.themeAssetsBase) {
      return window.StroybrigadaSettings.themeAssetsBase;
    }

    try {
      return new URL('../', currentScript.src).href;
    } catch (error) {
      return '/assets/dist/';
    }
  }

  var footerUrl = currentScript.getAttribute('data-footer-url') || getAssetBase() + 'partials/site-footer.html';

  try {
    var request = new XMLHttpRequest();
    request.open('GET', footerUrl, false);
    request.send(null);

    var isSuccess = (request.status >= 200 && request.status < 300) || request.status === 0;
    if (!isSuccess) {
      throw new Error('Unexpected status ' + request.status);
    }

    currentScript.insertAdjacentHTML('beforebegin', request.responseText);
    currentScript.remove();
  } catch (error) {
    console.error('Failed to load shared site footer:', error);
  }
})();
