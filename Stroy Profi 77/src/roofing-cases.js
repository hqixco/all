const casesSection = document.querySelector('.cases');

if (casesSection && document.body.dataset.service === 'roof-repair') {
  const quizSection = document.querySelector('.quiz');
  if (quizSection) quizSection.insertAdjacentElement('afterend', casesSection);

  const icon = (direction) => `<svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="${direction === 'left' ? 'm15 18-6-6 6-6' : 'm9 18 6-6-6-6'}"/></svg>`;
  const cards = Array.from(casesSection.querySelectorAll('.case-card'));
  const casesGrid = casesSection.querySelector('.cases-grid');

  if (cards.length > 4 && casesGrid) {
    cards.slice(4).forEach((card) => card.classList.add('case-card--mobile-hidden'));

    const showAllButton = document.createElement('button');
    showAllButton.className = 'cases-show-all';
    showAllButton.type = 'button';
    showAllButton.textContent = 'Показать все';
    showAllButton.setAttribute('aria-expanded', 'false');
    casesGrid.insertAdjacentElement('afterend', showAllButton);

    showAllButton.addEventListener('click', () => {
      cards.forEach((card) => card.classList.remove('case-card--mobile-hidden'));
      showAllButton.remove();
    });
  }

  const dialog = document.createElement('dialog');
  dialog.className = 'gallery-modal';
  dialog.innerHTML = '<button class="gallery-modal__close modal-close" type="button" aria-label="Закрыть"></button><div class="modal-content"></div>';
  document.body.append(dialog);

  const content = dialog.querySelector('.modal-content');
  const state = { title: '', images: [], index: 0 };
  let closeTimer;

  const renderDialog = () => {
    const multiple = state.images.length > 1;
    content.innerHTML = `<div class="gallery-lightbox"><h2 class="gallery-lightbox__title">${state.title}</h2><div class="gallery-lightbox__stage"><div class="gallery-lightbox__image" style="background-image:url('${state.images[state.index]}')" aria-label="${state.title}, фото ${state.index + 1}" role="img"></div>${multiple ? '<button class="gallery-lightbox__nav gallery-lightbox__nav--prev" type="button" data-gallery-modal-nav="prev" aria-label="Предыдущее фото"></button><button class="gallery-lightbox__nav gallery-lightbox__nav--next" type="button" data-gallery-modal-nav="next" aria-label="Следующее фото"></button>' : ''}</div>${multiple ? `<div class="gallery-lightbox__thumbs" aria-label="Фотографии кейса">${state.images.map((image, index) => `<button class="gallery-lightbox__thumb${index === state.index ? ' is-active' : ''}" type="button" data-gallery-modal-thumb="${index}" aria-label="Открыть фото ${index + 1}"><span style="background-image:url('${image}')"></span></button>`).join('')}</div>` : ''}</div>`;
  };

  const moveDialog = (direction) => {
    state.index = (state.index + direction + state.images.length) % state.images.length;
    renderDialog();
  };

  const closeDialog = () => {
    if (!dialog.open || dialog.classList.contains('is-closing')) return;
    dialog.classList.add('is-closing');
    clearTimeout(closeTimer);
    closeTimer = setTimeout(() => {
      dialog.close();
      dialog.classList.remove('is-closing');
    }, 160);
  };

  cards.forEach((card) => {
    const title = card.querySelector('h3').textContent.trim();
    const image = card.querySelector('.case-photo img');
    const thumbnails = Array.from(card.querySelectorAll('[data-image]'));
    const images = thumbnails.map((button) => button.style.backgroundImage.slice(5, -2));
    const previousButton = card.querySelector('[data-dir="prev"]');
    const nextButton = card.querySelector('[data-dir="next"]');

    previousButton.innerHTML = icon('left');
    nextButton.innerHTML = icon('right');

    const setImage = (index) => {
      const nextIndex = (index + images.length) % images.length;
      card.dataset.index = nextIndex;
      image.src = images[nextIndex];
      image.alt = `${title}, фото ${nextIndex + 1}`;
    };

    previousButton.addEventListener('click', () => setImage(Number(card.dataset.index || 0) - 1));
    nextButton.addEventListener('click', () => setImage(Number(card.dataset.index || 0) + 1));
    card.querySelector('[data-gallery-open]').addEventListener('click', () => {
      state.title = title;
      state.images = images;
      state.index = Number(card.dataset.index || 0);
      renderDialog();
      dialog.showModal();
    });
    thumbnails.forEach((button) => button.addEventListener('click', () => setImage(Number(button.dataset.image))));
  });

  content.addEventListener('click', (event) => {
    const navigation = event.target.closest('[data-gallery-modal-nav]');
    if (navigation) return moveDialog(navigation.dataset.galleryModalNav === 'prev' ? -1 : 1);
    const thumbnail = event.target.closest('[data-gallery-modal-thumb]');
    if (thumbnail) {
      state.index = Number(thumbnail.dataset.galleryModalThumb);
      renderDialog();
    }
  });
  dialog.querySelector('.modal-close').addEventListener('click', closeDialog);
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) closeDialog();
  });
  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    closeDialog();
  });
  document.addEventListener('keydown', (event) => {
    if (!dialog.open) return;
    if (event.key === 'ArrowLeft') moveDialog(-1);
    if (event.key === 'ArrowRight') moveDialog(1);
  });
}
