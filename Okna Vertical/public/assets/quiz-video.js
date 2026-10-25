(function () {
  function syncPlaybackState(video) {
    var block = video.closest(".quiz-video");
    if (!block) return;

    var toggle = block.querySelector(".quiz-video__toggle");
    var isPlaying = !video.paused && !video.ended;
    block.classList.toggle("is-playing", isPlaying);
    if (isPlaying) block.classList.add("has-played");
    if (toggle) {
      toggle.setAttribute(
        "aria-label",
        isPlaying ? "Поставить видео на паузу" : "Воспроизвести видео"
      );
    }
  }

  function togglePlayback(video) {
    if (video.paused || video.ended) {
      video.muted = false;
      video.volume = 1;
      var playback = video.play();
      if (playback && typeof playback.catch === "function") {
        playback.catch(function () {
          syncPlaybackState(video);
        });
      }
    } else {
      video.pause();
    }
  }

  document.addEventListener("click", function (event) {
    var target = event.target;
    var toggle = target.closest(".quiz-video__toggle");
    var block = toggle ? toggle.closest(".quiz-video") : target.closest(".quiz-video");
    if (!block || (!toggle && target.tagName !== "VIDEO")) return;

    var video = block.querySelector("video");
    if (video) togglePlayback(video);
  });

  ["play", "pause", "ended"].forEach(function (eventName) {
    document.addEventListener(
      eventName,
      function (event) {
        if (event.target.matches(".quiz-video video")) {
          syncPlaybackState(event.target);
        }
      },
      true
    );
  });
})();
