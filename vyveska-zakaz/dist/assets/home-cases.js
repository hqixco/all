document.addEventListener('DOMContentLoaded', () => {
  const section = document.querySelector('.works-panel.home-works');
  const gallery = document.getElementById('caseGallery');
  if (!section || !gallery) return;
  const cards = Array.from(section.querySelectorAll('.work-card'));
  const more = section.querySelector('[data-works-panel-more]');
  cards.slice(8).forEach(card => { card.hidden = true; });
  if (more) {
    more.hidden = cards.length <= 8;
    more.addEventListener('click', () => {
      cards.forEach(card => { card.hidden = false; });
      more.hidden = true;
      const next = cards[8] && cards[8].querySelector('[data-case-open]');
      if (next) next.focus({ preventScroll: true });
    });
  }
  let galleryImages = [];
  let galleryIndex = 0;
  const displayGallery = () => {
    const current = galleryImages[galleryIndex];
    if (!current) return;
    const image = gallery.querySelector('.works-lightbox__image');
    image.src = current.dataset.caseFull;
    image.alt = current.alt;
    gallery.querySelector('.works-lightbox__title').textContent = current.closest('.work-card').querySelector('h3').textContent;
    gallery.querySelector('[data-case-gallery-count]').textContent = (galleryIndex + 1) + ' из ' + galleryImages.length;
    gallery.querySelectorAll('.works-lightbox__nav').forEach(button => { button.hidden = galleryImages.length < 2; });
  };
  cards.forEach(card => {
    const images = Array.from(card.querySelectorAll('.work-card__image'));
    let index = 0;
    card.querySelectorAll('[data-case-slide]').forEach(button => {
      button.addEventListener('click', () => {
        index = (index + (button.dataset.caseSlide === 'prev' ? -1 : 1) + images.length) % images.length;
        images.forEach((image, i) => { image.hidden = i !== index; });
      });
    });
    card.querySelector('[data-case-open]').addEventListener('click', () => {
      galleryImages = images;
      galleryIndex = index;
      displayGallery();
    });
    const order = card.querySelector('[data-case-order]');
    if (order) order.addEventListener('click', () => {
      const form = document.getElementById('formModalOrder');
      if (!form) return;
      form.querySelector('.modal__title').textContent = 'Расчёт похожей вывески';
      form.querySelector('[type="submit"]').value = 'Получить расчёт';
      const message = form.querySelector('textarea');
      if (message) message.value = 'Интересует вывеска как в проекте «' + order.dataset.caseOrder + '».';
    });
  });
  const move = direction => {
    if (!galleryImages.length) return;
    galleryIndex = (galleryIndex + direction + galleryImages.length) % galleryImages.length;
    displayGallery();
  };
  gallery.querySelector('[data-case-gallery-prev]').addEventListener('click', () => move(-1));
  gallery.querySelector('[data-case-gallery-next]').addEventListener('click', () => move(1));
  document.addEventListener('keydown', event => {
    if (gallery.hidden) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      move(event.key === 'ArrowLeft' ? -1 : 1);
    }
  });
});
