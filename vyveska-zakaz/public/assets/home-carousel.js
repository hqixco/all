(() => {
  const carousel = document.querySelector('.home__carousel');
  if (!carousel) return;
  const track = carousel.querySelector('.home__track');
  const slides = Array.from(track.children);
  const dots = Array.from(carousel.querySelectorAll('[data-home-dot]'));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let index = 0;
  let gesture = null;
  let suppressUntil = 0;
  let scrollTimer;
  const sync = () => {
    slides.forEach((slide, i) => {
      slide.setAttribute('aria-hidden', i === index ? 'false' : 'true');
      slide.querySelectorAll('a').forEach(link => { link.tabIndex = i === index ? 0 : -1; });
    });
    dots.forEach((dot, i) => { if (i === index) dot.setAttribute('aria-current', 'true'); else dot.removeAttribute('aria-current'); });
    carousel.querySelector('.home__slide-status').textContent = `Слайд ${index + 1} из ${slides.length}`;
    carousel.dataset.activeSlide = String(index);
  };
  const move = (target, smooth = true) => {
    const wrapped = target < 0 || target >= slides.length;
    index = (target + slides.length) % slides.length;
    track.scrollTo({left: index * track.clientWidth, behavior: smooth && !wrapped && !reduced.matches ? 'smooth' : 'auto'});
    sync();
  };
  carousel.classList.add('home__carousel--ready');
  carousel.querySelector('.home__controls').hidden = false;
  sync();
  carousel.querySelector('[data-home-prev]').addEventListener('click', () => move(index - 1));
  carousel.querySelector('[data-home-next]').addEventListener('click', () => move(index + 1));
  dots.forEach((dot, i) => dot.addEventListener('click', () => move(i)));
  track.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const hadLinkFocus = event.target.tagName === 'A';
    move(index + (event.key === 'ArrowRight' ? 1 : -1));
    if (hadLinkFocus) slides[index].querySelector('a').focus({preventScroll:true});
  });
  track.addEventListener('dragstart', event => event.preventDefault());
  track.addEventListener('pointerdown', event => {
    if (event.button !== 0 || !event.isPrimary) return;
    gesture = {id:event.pointerId, x:event.clientX, y:event.clientY, start:Math.round(track.scrollLeft / track.clientWidth), moved:false, vertical:false, dx:0};
  });
  track.addEventListener('pointermove', event => {
    if (!gesture || gesture.id !== event.pointerId || gesture.vertical) return;
    const dx = event.clientX - gesture.x, dy = event.clientY - gesture.y;
    if (!gesture.moved && Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 8) { gesture.vertical = true; return; }
    if (!gesture.moved && Math.abs(dx) <= 6) return;
    gesture.moved = true; gesture.dx = dx;
    track.classList.add('home__track--dragging');
    if (!track.hasPointerCapture(event.pointerId)) track.setPointerCapture(event.pointerId);
    event.preventDefault();
    track.scrollLeft = gesture.start * track.clientWidth - dx;
  });
  const finish = event => {
    if (!gesture || gesture.id !== event.pointerId) return;
    const current = gesture; gesture = null;
    track.classList.remove('home__track--dragging');
    if (track.hasPointerCapture(event.pointerId)) track.releasePointerCapture(event.pointerId);
    if (!current.moved) return;
    suppressUntil = performance.now() + 500;
    const step = Math.abs(current.dx) >= Math.min(70, track.clientWidth * .12) ? (current.dx < 0 ? 1 : -1) : 0;
    move(current.start + step);
  };
  document.addEventListener('pointerup', finish);
  document.addEventListener('pointercancel', finish);
  track.addEventListener('click', event => {
    if (event.detail === 0 || performance.now() > suppressUntil) return;
    event.preventDefault(); event.stopPropagation();
  }, true);
  track.addEventListener('scroll', () => {
    window.clearTimeout(scrollTimer);
    scrollTimer = window.setTimeout(() => {
      if (gesture) return;
      index = Math.max(0, Math.min(slides.length - 1, Math.round(track.scrollLeft / track.clientWidth)));
      sync();
    }, 140);
  });
  window.addEventListener('resize', () => move(index, false));
})();
