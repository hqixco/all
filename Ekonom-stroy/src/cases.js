const caseImages = [
  ['case-01-01.webp', 'case-01-02.webp', 'case-01-03.webp'],
  ['case-02-01.webp', 'case-02-02.webp', 'case-02-03.webp', 'case-02-04.webp'],
  ['case-03-01.webp', 'case-03-02.webp', 'case-03-03.webp'],
  ['case-04-01.webp', 'case-04-02.webp', 'case-04-03.webp'],
  ['case-05-01.webp', 'case-05-02.webp', 'case-05-03.webp'],
  ['case-06-01.webp', 'case-06-02.webp', 'case-06-03.webp'],
  ['case-07-01.webp', 'case-07-02.webp', 'case-07-03.webp'],
  ['case-08-01.webp', 'case-08-02.webp', 'case-08-03.webp'],
  ['case-09-01.webp', 'case-09-02.webp', 'case-09-03.webp'],
  ['public-project-06-process.webp', 'public-project-06-after.webp'],
];

const modal = document.querySelector('#galleryModal');
const content = modal?.querySelector('.modal-content');
const url = (name) => `/assets/${name}`;

const openGallery = (card, images) => {
  if (!modal || !content) return;
  let index = 0;
  const title = card.querySelector('h3')?.textContent?.trim() || 'Фотографии объекта';
  const render = () => {
    const current = images[index];
    content.innerHTML = `<div class="gallery-lightbox"><div class="gallery-lightbox__stage"><div class="gallery-lightbox__image" style="background-image:url('${url(current)}')" role="img" aria-label="${title}"></div><button class="gallery-lightbox__nav gallery-lightbox__nav--prev" type="button" data-case-prev aria-label="Предыдущее фото"></button><button class="gallery-lightbox__nav gallery-lightbox__nav--next" type="button" data-case-next aria-label="Следующее фото"></button></div><div class="gallery-lightbox__thumbs">${images.map((image, i) => `<button class="gallery-lightbox__thumb${i === index ? ' is-active' : ''}" type="button" data-case-index="${i}" aria-label="Фото ${i + 1}"><span style="background-image:url('${url(image)}')"></span></button>`).join('')}</div></div>`;
  };
  content.onclick = (event) => {
    const target = event.target.closest('[data-case-prev], [data-case-next], [data-case-index]');
    if (!target) return;
    if (target.hasAttribute('data-case-prev')) index -= 1;
    if (target.hasAttribute('data-case-next')) index += 1;
    if (target.hasAttribute('data-case-index')) index = Number(target.dataset.caseIndex);
    index = (index + images.length) % images.length;
    render();
  };
  render();
  modal.showModal();
};

document.querySelectorAll('.case-gallery-card').forEach((card, index) => {
  const image = card.querySelector('.case-gallery-card__image');
  if (!image || !caseImages[index]) return;
  image.addEventListener('click', (event) => {
    if (event.target.closest('button')) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    openGallery(card, caseImages[index]);
  }, true);
});
