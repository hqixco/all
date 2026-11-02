const floatingVideo = document.querySelector('.floating-video');
const floatingVideoDismiss = floatingVideo && floatingVideo.querySelector('.floating-video__dismiss');

if (floatingVideoDismiss) floatingVideoDismiss.addEventListener('click', () => {
  floatingVideo.classList.add('is-dismissed');
  const video = floatingVideo.querySelector('video');
  if (video) video.pause();
  window.setTimeout(() => {
    floatingVideo.hidden = true;
  }, 320);
});
