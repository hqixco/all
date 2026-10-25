document.addEventListener('DOMContentLoaded', () => {
  const section = document.querySelector('.works-showcase-panel');
  const modal = document.getElementById('sparGallery');
  if (!section || !modal) return;
  const photos = Array.from(section.querySelectorAll('.works-showcase__photo'));
  const thumbs = Array.from(section.querySelectorAll('[data-spar-thumb]'));
  const strip = section.querySelector('.works-showcase__thumbs');
  let index = 0;
  const show = (next, scrollThumb = true) => {
    index = (next + photos.length) % photos.length;
    photos.forEach((photo, i) => { photo.hidden = i !== index; });
    thumbs.forEach((thumb, i) => { thumb.setAttribute('aria-pressed', String(i === index)); });
    if (scrollThumb) strip.scrollTo({left: thumbs[index].offsetLeft - strip.offsetLeft, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
    const image = modal.querySelector('.works-lightbox__image');
    image.src = photos[index].getAttribute('src');
    image.alt = photos[index].alt;
    modal.querySelector('[data-spar-gallery-count]').textContent = (index + 1) + ' из ' + photos.length;
    modal.querySelectorAll('.works-lightbox__nav').forEach(button => { button.hidden = photos.length < 2; });
  };
  section.querySelector('[data-spar-prev]').addEventListener('click', () => show(index - 1));
  section.querySelector('[data-spar-next]').addEventListener('click', () => show(index + 1));
  thumbs.forEach((thumb, i) => thumb.addEventListener('click', () => { if (!dragged) show(i); }));
  section.querySelector('.works-showcase__open').addEventListener('click', () => show(index, false));
  modal.querySelector('[data-spar-gallery-prev]').addEventListener('click', () => show(index - 1));
  modal.querySelector('[data-spar-gallery-next]').addEventListener('click', () => show(index + 1));
  document.addEventListener('keydown', event => {
    if (modal.hidden) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      show(index + (event.key === 'ArrowLeft' ? -1 : 1));
    }
  });
  const order = section.querySelector('[data-src="#formModalOrder"]');
  order.addEventListener('click', () => {
    const form = document.getElementById('formModalOrder');
    form.querySelector('.modal__title').textContent = 'Расчёт оформления магазина';
      form.querySelector('[type="submit"]').value = 'Получить расчёт';
    form.querySelector('textarea').value = 'Интересует оформление объекта по примеру магазинов SPAR.';
  });
  let pressed = false, dragged = false, startX = 0, startScroll = 0;
  strip.addEventListener('dragstart', event => event.preventDefault());
  strip.addEventListener('mousedown', event => {
    if (event.button !== 0) return;
    pressed = true; dragged = false; startX = event.clientX; startScroll = strip.scrollLeft;
  });
  document.addEventListener('mousemove', event => {
    if (!pressed) return;
    const distance = event.clientX - startX;
    if (Math.abs(distance) > 5) dragged = true;
    if (dragged) { event.preventDefault(); strip.scrollLeft = startScroll - distance; }
  });
  document.addEventListener('mouseup', () => {
    pressed = false;
    window.setTimeout(() => { dragged = false; }, 0);
  });
});
