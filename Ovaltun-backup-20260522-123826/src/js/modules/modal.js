export function initModal() {
  const modal = document.querySelector('#site-modal');
  const modalImage = modal?.querySelector('[data-modal-image]');
  const modalVideo = modal?.querySelector('[data-modal-video]');

  const openModal = (trigger) => {
    if (!(modal instanceof HTMLElement)) return;

    modal.classList.remove('modal--image', 'modal--video');

    const videoSrc = trigger.getAttribute('data-modal-video-src');
    const videoPoster = trigger.getAttribute('data-modal-video-poster') || '';
    const embeddedImage = trigger.querySelector('img');
    const imageSrc =
      (embeddedImage instanceof HTMLImageElement && (embeddedImage.currentSrc || embeddedImage.src)) ||
      trigger.getAttribute('data-modal-image-src');
    const imageAlt =
      (embeddedImage instanceof HTMLImageElement && embeddedImage.alt) ||
      trigger.getAttribute('data-modal-image-alt') ||
      '';

    if (videoSrc && modalVideo instanceof HTMLVideoElement) {
      modal.classList.add('modal--video');

      if (modalImage instanceof HTMLImageElement) {
        modalImage.src = '';
        modalImage.alt = '';
        modalImage.hidden = true;
      }

      modalVideo.hidden = false;
      modalVideo.poster = videoPoster;
      modalVideo.src = videoSrc;
      modalVideo.load();
      modalVideo.currentTime = 0;
      modalVideo.play().catch(() => {});
    } else if (modalImage instanceof HTMLImageElement && imageSrc) {
      modal.classList.add('modal--image');

      if (modalVideo instanceof HTMLVideoElement) {
        modalVideo.pause();
        modalVideo.removeAttribute('src');
        modalVideo.removeAttribute('poster');
        modalVideo.load();
        modalVideo.hidden = true;
      }

      modalImage.hidden = false;
      modalImage.src = imageSrc;
      modalImage.alt = imageAlt;
    }

    modal.classList.add('is-open');
    document.documentElement.classList.add('is-scroll-locked');
  };

  const closeModal = () => {
    if (!(modal instanceof HTMLElement)) return;

    modal.classList.remove('is-open');
    document.documentElement.classList.remove('is-scroll-locked');

    if (modalVideo instanceof HTMLVideoElement) {
      modalVideo.pause();
    }

    if (modalImage instanceof HTMLImageElement) {
      window.setTimeout(() => {
        if (!modal.classList.contains('is-open')) {
          modalImage.src = '';
          modalImage.alt = '';
          modalImage.hidden = true;
        }
      }, 220);
    }

    if (modalVideo instanceof HTMLVideoElement) {
      window.setTimeout(() => {
        if (!modal.classList.contains('is-open')) {
          modalVideo.removeAttribute('src');
          modalVideo.removeAttribute('poster');
          modalVideo.load();
          modalVideo.hidden = true;
        }
      }, 220);
    }

    modal.classList.remove('modal--image', 'modal--video');
  };

  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const openButton = target.closest('[data-modal-open]');
    const closeButton = target.closest('[data-modal-close]');

    if (openButton instanceof HTMLElement) {
      event.preventDefault();
      openModal(openButton);
      return;
    }

    if (closeButton instanceof HTMLElement) {
      closeModal();
      return;
    }

    if (target.classList.contains('modal__overlay')) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (!(modal instanceof HTMLElement)) return;
    if (!modal.classList.contains('is-open')) return;

    closeModal();
  });
}
