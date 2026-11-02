const quizVideoBlock = document.querySelector('[data-quiz-video]');

if (quizVideoBlock) {
  const video = quizVideoBlock.querySelector('video');
  const toggle = quizVideoBlock.querySelector('.quiz-panel__video-toggle');

  const syncPlaybackState = () => {
    const isPlaying = !video.paused && !video.ended;
    quizVideoBlock.classList.toggle('is-playing', isPlaying);
    toggle.setAttribute('aria-label', isPlaying ? 'Поставить видео на паузу' : 'Воспроизвести видео');
  };

  const togglePlayback = () => {
    if (video.paused || video.ended) {
      video.muted = false;
      video.volume = 1;
      const playback = video.play();
      if (playback && typeof playback.catch === 'function') {
        playback.catch(syncPlaybackState);
      }
    } else {
      video.pause();
    }
  };

  toggle.addEventListener('click', togglePlayback);
  video.addEventListener('click', togglePlayback);
  video.addEventListener('play', syncPlaybackState);
  video.addEventListener('pause', syncPlaybackState);
  video.addEventListener('ended', syncPlaybackState);
}
