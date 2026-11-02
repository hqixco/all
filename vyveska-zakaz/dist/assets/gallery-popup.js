document.addEventListener('DOMContentLoaded', () => {
  let active = null;
  let opener = null;
  let closeTimer;
  const close = () => {
    if (!active) return;
    const gallery = active;
    active = null;
    gallery.classList.remove('is-open');
    gallery.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('page--gallery-open');
    closeTimer = window.setTimeout(() => { gallery.hidden = true; }, 220);
    if (opener) opener.focus({ preventScroll: true });
    opener = null;
  };
  document.querySelectorAll('.works-lightbox').forEach(gallery => {
    gallery.querySelectorAll('[data-gallery-close]').forEach(button => button.addEventListener('click', close));
  });
  document.querySelectorAll('[data-fancybox][data-src^="#"]').forEach(trigger => {
    const gallery = document.querySelector(trigger.dataset.src);
    if (!gallery || !gallery.classList.contains('works-lightbox')) return;
    trigger.addEventListener('click', event => {
      event.preventDefault();
      window.clearTimeout(closeTimer);
      if (active && active !== gallery) { active.hidden = true; active.classList.remove('is-open'); active.setAttribute('aria-hidden', 'true'); }
      active = gallery;
      opener = trigger;
      gallery.hidden = false;
      gallery.setAttribute('aria-hidden', 'false');
      gallery.getBoundingClientRect();
      gallery.classList.add('is-open');
      document.body.classList.add('page--gallery-open');
      gallery.querySelector('.works-lightbox__close').focus({ preventScroll: true });
    });
  });
  document.addEventListener('keydown', event => {
    if (!active) return;
    if (event.key === 'Escape') { event.preventDefault(); close(); }
    if (event.key === 'Tab') {
      const buttons = Array.from(active.querySelectorAll('button')).filter(button => !button.hidden && !button.classList.contains('works-lightbox__backdrop'));
      const first = buttons[0], last = buttons[buttons.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
});
