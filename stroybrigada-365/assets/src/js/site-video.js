(function () {
  var INITIAL_VIDEO_COUNT = 8;
  var currentScript = document.currentScript;

  function getAssetBase() {
    if (window.StroybrigadaSettings && window.StroybrigadaSettings.themeAssetsBase) {
      return window.StroybrigadaSettings.themeAssetsBase;
    }

    if (currentScript && currentScript.src) {
      try {
        return new URL('../', currentScript.src).href;
      } catch (error) {
        return '/assets/dist/';
      }
    }

    return '/assets/dist/';
  }

  var assetBase = getAssetBase();

  function normalizeAssetUrl(url) {
    var normalized = (url || '').trim();
    if (!normalized) {
      return '';
    }

    if (normalized.indexOf('/assets/') === 0) {
      return assetBase + normalized.slice('/assets/'.length);
    }

    return normalized;
  }


  function readVideoItems(grid) {
    if (!(grid instanceof HTMLElement)) {
      return [];
    }

    var rawItems = grid.getAttribute('data-video-items');
    if (!rawItems) {
      return [];
    }

    try {
      var parsedItems = JSON.parse(rawItems);
      if (!Array.isArray(parsedItems)) {
        return [];
      }

      return parsedItems.filter(function (item) {
        return item && typeof item.src === 'string' && item.src && typeof item.preview === 'string' && item.preview;
      }).map(function (item) {
        return {
          src: normalizeAssetUrl(item.src),
          preview: normalizeAssetUrl(item.preview),
          title: typeof item.title === 'string' && item.title ? item.title : 'Видео с объекта'
        };
      });
    } catch (error) {
      return [];
    }
  }

  function normalizeVideoItem(item) {
    return {
      src: normalizeAssetUrl(item.src),
      preview: normalizeAssetUrl(item.preview),
      title: typeof item.title === 'string' && item.title ? item.title : 'Видео с объекта'
    };
  }

  function enhanceVideoCard(item) {
    if (!(item instanceof HTMLElement)) {
      return;
    }

    var video = item.querySelector('video');
    var playButton = item.querySelector('[data-video-play]');
    var media = item.querySelector('.video-section__media');

    if (!(video instanceof HTMLVideoElement)) {
      return;
    }

    var preview = video.getAttribute('data-preview');
    if (preview && !video.getAttribute('poster')) {
      video.setAttribute('poster', preview);
    }

    function syncPlayingState() {
      item.classList.toggle('is-playing', !video.paused && !video.ended);
    }

    function startPlayback() {
      if (video.controls) {
        return;
      }

      video.controls = true;
      var playResult = video.play();
      syncPlayingState();

      if (playResult && typeof playResult.catch === 'function') {
        playResult.catch(function () {
          video.controls = false;
          item.classList.remove('is-playing');
        });
      }
    }

    if (playButton instanceof HTMLElement) {
      playButton.addEventListener('click', function () {
        startPlayback();
      });
    }

    if (media instanceof HTMLElement) {
      media.setAttribute('role', 'button');
      media.setAttribute('tabindex', '0');
      media.setAttribute('aria-label', 'Воспроизвести видео');

      media.addEventListener('click', function () {
        startPlayback();
      });

      media.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          startPlayback();
        }
      });
    }

    video.addEventListener('play', syncPlayingState);
    video.addEventListener('pause', syncPlayingState);
    video.addEventListener('ended', syncPlayingState);
  }

  function createVideoCard(data) {
    data = normalizeVideoItem(data);

    var card = document.createElement('div');
    card.className = 'video-section__card';
    card.setAttribute('data-video-item', '');

    var media = document.createElement('div');
    media.className = 'video-section__media';

    var video = document.createElement('video');
    video.setAttribute('playsinline', '');
    video.setAttribute('preload', 'metadata');
    video.setAttribute('controlsList', 'nodownload');
    video.setAttribute('poster', '');
    video.setAttribute('data-preview', data.preview);

    var source = document.createElement('source');
    source.src = data.src;
    source.type = 'video/mp4';
    video.appendChild(source);

    var playButton = document.createElement('button');
    playButton.type = 'button';
    playButton.className = 'video-section__play';
    playButton.setAttribute('data-video-play', '');
    playButton.setAttribute('aria-label', 'Воспроизвести видео');

    var caption = document.createElement('div');
    caption.className = 'video-section__caption';
    caption.textContent = data.title;

    media.appendChild(video);
    media.appendChild(playButton);
    card.appendChild(media);
    card.appendChild(caption);

    enhanceVideoCard(card);
    return card;
  }

  function initVideoSection() {
    var grid = document.querySelector('[data-video-grid]');
    var toggle = document.querySelector('[data-video-toggle]');

    if (!(grid instanceof HTMLElement) || !(toggle instanceof HTMLElement)) {
      return;
    }

    var videoItems = readVideoItems(grid);
    var initialItems = videoItems.slice(0, INITIAL_VIDEO_COUNT);
    var deferredVideoItems = videoItems.slice(INITIAL_VIDEO_COUNT);

    grid.innerHTML = '';

    initialItems.forEach(function (item) {
      grid.appendChild(createVideoCard(item));
    });

    if (!deferredVideoItems.length) {
      toggle.hidden = true;
      return;
    }

    toggle.hidden = false;
    toggle.addEventListener('click', function handleExpand() {
      deferredVideoItems.forEach(function (item) {
        var card = createVideoCard(item);
        grid.appendChild(card);
      });

      toggle.hidden = true;
      toggle.removeEventListener('click', handleExpand);
      deferredVideoItems = [];
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVideoSection);
  } else {
    initVideoSection();
  }
})();
