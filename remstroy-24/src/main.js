const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
const servicesDropdown = document.querySelector('.nav-services');
const servicesButton = servicesDropdown?.querySelector('.nav-services__button');
const photoModal = document.querySelector('#photoModal');
const modalCloseDelay = 160;

function closeModalAnimated(dialog) {
  if (!dialog?.open || dialog.classList.contains('is-closing')) return;
  dialog.classList.add('is-closing');
  setTimeout(() => {
    dialog.close();
    dialog.classList.remove('is-closing');
  }, modalCloseDelay);
}

menuToggle?.addEventListener('click', () => {
  const opened = nav.classList.toggle('is-open');
  menuToggle.setAttribute('aria-expanded', String(opened));
});

function normalizePath(path) {
  return path.replace(/\/index\.html$/, '/').replace(/\/?$/, '/');
}

const currentPath = normalizePath(window.location.pathname);

document.querySelectorAll('[data-service-link]').forEach((link) => {
  const linkPath = normalizePath(new URL(link.href, window.location.origin).pathname);
  if (linkPath !== currentPath) return;

  link.classList.add('is-active');
  link.setAttribute('aria-current', 'page');
});

servicesButton?.addEventListener('click', () => {
  const opened = servicesDropdown.classList.toggle('is-open');
  servicesButton.setAttribute('aria-expanded', String(opened));
});

document.querySelectorAll('.nav a').forEach((link) => {
  link.addEventListener('click', () => {
    nav.classList.remove('is-open');
    servicesDropdown?.classList.remove('is-open');
    servicesButton?.setAttribute('aria-expanded', 'false');
    menuToggle?.setAttribute('aria-expanded', 'false');
  });
});

const mobileCaseWorkMedia = window.matchMedia('(max-width: 480px)');

function setCaseWorkDisclosureState(work, isOpen) {
  work.classList.toggle('is-open', isOpen);
  work.querySelector('.case-card__subtitle')?.setAttribute('aria-expanded', String(isOpen));
}

function syncCaseWorkDisclosures() {
  document.querySelectorAll('.case-card__work').forEach((work) => {
    const subtitle = work.querySelector('.case-card__subtitle');
    if (!subtitle) return;

    subtitle.setAttribute('role', 'button');
    subtitle.setAttribute('tabindex', '0');

    if (mobileCaseWorkMedia.matches) {
      setCaseWorkDisclosureState(work, false);
    } else {
      work.classList.remove('is-open');
      subtitle.removeAttribute('aria-expanded');
    }
  });
}

document.querySelectorAll('.case-card__subtitle').forEach((subtitle) => {
  subtitle.addEventListener('click', () => {
    if (!mobileCaseWorkMedia.matches) return;
    const work = subtitle.closest('.case-card__work');
    if (!work) return;
    setCaseWorkDisclosureState(work, !work.classList.contains('is-open'));
  });

  subtitle.addEventListener('keydown', (event) => {
    if (!mobileCaseWorkMedia.matches || (event.key !== 'Enter' && event.key !== ' ')) return;
    event.preventDefault();
    subtitle.click();
  });
});

syncCaseWorkDisclosures();
mobileCaseWorkMedia.addEventListener('change', syncCaseWorkDisclosures);

const mobileReviewMedia = window.matchMedia('(max-width: 480px)');

function setReviewTextDisclosureState(item, isOpen) {
  item.classList.toggle('is-review-open', isOpen);
  item.querySelector('.reviews__toggle')?.setAttribute('aria-expanded', String(isOpen));
}

function setupReviewTextDisclosures() {
  document.querySelectorAll('.reviews__item').forEach((item) => {
    const text = item.querySelector('.reviews__item-text');
    if (!text) return;

    let toggle = item.querySelector('.reviews__toggle');
    if (!toggle) {
      toggle = document.createElement('button');
      toggle.className = 'reviews__toggle';
      toggle.type = 'button';
      toggle.setAttribute('aria-label', 'Показать отзыв полностью');
      toggle.setAttribute('aria-expanded', 'false');
      text.insertAdjacentElement('afterend', toggle);

      toggle.addEventListener('click', () => {
        if (!mobileReviewMedia.matches) return;
        const isOpen = item.classList.contains('is-review-open');
        setReviewTextDisclosureState(item, !isOpen);
        toggle.setAttribute('aria-label', isOpen ? 'Показать отзыв полностью' : 'Свернуть отзыв');
      });
    }

    if (!text.dataset.reviewDisclosureReady) {
      text.dataset.reviewDisclosureReady = 'true';
      text.addEventListener('click', () => {
        if (!mobileReviewMedia.matches || !item.classList.contains('has-review-toggle')) return;
        const isOpen = item.classList.contains('is-review-open');
        setReviewTextDisclosureState(item, !isOpen);
        toggle.setAttribute('aria-label', isOpen ? 'Показать отзыв полностью' : 'Свернуть отзыв');
      });
    }

    if (mobileReviewMedia.matches) {
      const shouldCollapse = text.scrollHeight > 100;
      item.classList.toggle('has-review-toggle', shouldCollapse);
      setReviewTextDisclosureState(item, false);
      toggle.hidden = !shouldCollapse;
    } else {
      item.classList.remove('has-review-toggle', 'is-review-open');
      toggle.hidden = true;
      toggle.removeAttribute('aria-expanded');
    }
  });
}

setupReviewTextDisclosures();
mobileReviewMedia.addEventListener('change', setupReviewTextDisclosures);
window.addEventListener('load', setupReviewTextDisclosures);

document.querySelectorAll('.faq__list').forEach((faqList) => {
  faqList.querySelectorAll('.faq-list__item').forEach((item) => {
    item.addEventListener('toggle', () => {
      if (!item.open) return;

      faqList.querySelectorAll('.faq-list__item[open]').forEach((openedItem) => {
        if (openedItem === item) return;
        openedItem.open = false;
      });
    });
  });
});

const phoneMaskTemplate = '+7 (___) ___-__-__';
const phonePrefix = '+7 ';

function getPhoneDigits(value) {
  let digits = value.replace(/\D/g, '');
  if (digits.startsWith('7') || digits.startsWith('8')) {
    digits = digits.slice(1);
  }
  return digits.slice(0, 10);
}

function formatPhoneValue(value) {
  const digits = getPhoneDigits(value);
  if (!digits) return '';

  let result = '+7 ';
  if (digits.length > 0) result += `(${digits.slice(0, 3)}`;
  if (digits.length >= 3) result += ')';
  if (digits.length > 3) result += ` ${digits.slice(3, 6)}`;
  if (digits.length > 6) result += `-${digits.slice(6, 8)}`;
  if (digits.length > 8) result += `-${digits.slice(8, 10)}`;

  return result;
}

function getMaskedPhoneDigitCount(value) {
  return getPhoneDigits(value).length;
}

document.querySelectorAll('input[type="tel"]').forEach((input) => {
  input.placeholder = phoneMaskTemplate;
  input.inputMode = 'tel';
  input.maxLength = phoneMaskTemplate.length;

  input.addEventListener('focus', () => {
    if (!input.value) {
      input.value = phonePrefix;
      input.setSelectionRange(input.value.length, input.value.length);
    }
  });

  input.addEventListener('input', () => {
    input.value = formatPhoneValue(input.value) || phonePrefix;
    input.setSelectionRange(input.value.length, input.value.length);
  });

  input.addEventListener('blur', () => {
    if (!getMaskedPhoneDigitCount(input.value)) {
      input.value = '';
    }
  });
});

document.querySelectorAll('.file-field input').forEach((input) => {
  const defaultLabel = input.closest('.file-field')?.querySelector('.file-field__text');
  if (defaultLabel) defaultLabel.dataset.defaultText = defaultLabel.textContent;

  input.addEventListener('change', () => {
    const field = input.closest('.file-field');
    const label = field?.querySelector('.file-field__text');
    let counter = field?.querySelector('.file-field__count');
    const previews = field?.querySelector('.form__file-previews, .photo-modal__previews');
    if (!label) return;
    if (!counter && field) {
      counter = document.createElement('span');
      counter.className = 'file-field__count';
      counter.hidden = true;
      field.append(counter);
    }
    const fileCount = input.files?.length || 0;
    label.textContent = label.dataset.defaultText || 'Прикрепить фотографии';

    if (counter) {
      counter.textContent = fileCount ? `Прикреплено файлов: ${fileCount}` : '';
      counter.hidden = !fileCount;
    }

    if (!previews) return;
    previews.querySelectorAll('img').forEach((image) => {
      URL.revokeObjectURL(image.src);
    });
    previews.replaceChildren();

    Array.from(input.files || [])
      .filter((file) => file.type.startsWith('image/'))
      .slice(0, 6)
      .forEach((file) => {
        const image = document.createElement('img');
        image.className = 'form__file-preview photo-modal__preview';
        image.src = URL.createObjectURL(file);
        image.alt = '';
        previews.append(image);
      });
  });
});

function bindFileFieldInput(input) {
  const defaultLabel = input.closest('.file-field')?.querySelector('.file-field__text');
  if (defaultLabel && !defaultLabel.dataset.defaultText) {
    defaultLabel.dataset.defaultText = defaultLabel.textContent;
  }

  input.addEventListener('change', () => {
    const field = input.closest('.file-field');
    const label = field?.querySelector('.file-field__text');
    let counter = field?.querySelector('.file-field__count');
    const previews = field?.querySelector('.form__file-previews, .photo-modal__previews');
    if (!label) return;
    if (!counter && field) {
      counter = document.createElement('span');
      counter.className = 'file-field__count';
      counter.hidden = true;
      field.append(counter);
    }
    const fileCount = input.files?.length || 0;
    label.textContent = label.dataset.defaultText || 'Прикрепить фотографии';

    if (counter) {
      counter.textContent = fileCount ? `Прикреплено файлов: ${fileCount}` : '';
      counter.hidden = !fileCount;
    }

    if (!previews) return;
    previews.querySelectorAll('img').forEach((image) => {
      URL.revokeObjectURL(image.src);
    });
    previews.replaceChildren();

    Array.from(input.files || [])
      .filter((file) => file.type.startsWith('image/'))
      .slice(0, 6)
      .forEach((file) => {
        const image = document.createElement('img');
        image.className = 'form__file-preview photo-modal__preview';
        image.src = URL.createObjectURL(file);
        image.alt = '';
        previews.append(image);
      });
  });
}

function bindEstimatorPhoneInput(input) {
  input.placeholder = phoneMaskTemplate;
  input.inputMode = 'tel';
  input.maxLength = phoneMaskTemplate.length;

  input.addEventListener('focus', () => {
    if (!input.value) {
      input.value = phonePrefix;
      input.setSelectionRange(input.value.length, input.value.length);
    }
  });

  input.addEventListener('input', () => {
    input.value = formatPhoneValue(input.value) || phonePrefix;
    input.setSelectionRange(input.value.length, input.value.length);
  });

  input.addEventListener('blur', () => {
    if (!getMaskedPhoneDigitCount(input.value)) {
      input.value = '';
    }
  });
}

function formatEstimatorOptionLabel(label) {
  return label.replace('Металлочерепица', 'Металло&shy;черепица');
}

function getEstimatorOptionImageSrc(image) {
  if (!image) return '';
  if (/^(?:https?:)?\/\//.test(image) || image.startsWith('/')) return image;
  return `/assets/${image}`;
}

function setupEstimatorQuiz(form) {
  const configNode = form.querySelector('[data-estimator-config]');
  const title = form.querySelector('.estimator-quiz__title');
  const stepLabel = form.querySelector('.estimator-quiz__step');
  const progress = form.querySelector('.estimator-progress span');
  const options = form.querySelector('.estimator-options');
  const next = form.querySelector('.estimator-quiz__next');
  const prev = form.querySelector('.estimator-quiz__prev');
  if (!configNode || !title || !stepLabel || !options || !next || !prev) return;

  let config;
  try {
    config = JSON.parse(configNode.textContent || '{}');
  } catch {
    return;
  }

  const questions = Array.isArray(config.questions) ? config.questions : [];
  if (!questions.length) return;

  const totalSteps = questions.length + 1;
  let currentStepIndex = 0;
  let isFinalStep = false;
  let autoNextTimer;

  function setAnswer(name, value) {
    let input = form.querySelector(`input[type="hidden"][name="${name}"]`);
    if (!input) {
      input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      form.append(input);
    }
    input.value = value;
  }

  function renderQuestion() {
    isFinalStep = false;
    const question = questions[currentStepIndex];
    const stepNumber = currentStepIndex + 1;
    const savedValue = form.querySelector(`input[type="hidden"][name="${question.name}"]`)?.value;

    stepLabel.textContent = `Вопрос ${stepNumber} из ${totalSteps}`;
    title.textContent = question.title;
    if (progress) progress.style.width = `${(stepNumber / totalSteps) * 100}%`;
    prev.disabled = currentStepIndex === 0;
    prev.hidden = false;
    next.type = 'button';
    next.textContent = currentStepIndex === questions.length - 1 ? 'Перейти к заявке' : 'Следующий вопрос';

    options.innerHTML = question.options.map(([label, image], index) => {
      const checked = savedValue ? savedValue === label : index === 0 && currentStepIndex === 0;
      const imageSrc = getEstimatorOptionImageSrc(image);
      return `
        <label class="estimator-option${image ? '' : ' estimator-option--text'}">
          <input type="radio" name="${question.name}_choice" value="${label}"${checked ? ' checked' : ''} />
          ${imageSrc ? `<img src="${imageSrc}" alt="" />` : ''}
          <span>${formatEstimatorOptionLabel(label)}</span>
        </label>
      `;
    }).join('');

    const checkedInput = options.querySelector('input[type="radio"]:checked');
    if (checkedInput) setAnswer(question.name, checkedInput.value);
  }

  function renderLeadStep() {
    isFinalStep = true;
    stepLabel.textContent = `Вопрос ${totalSteps} из ${totalSteps}`;
    title.textContent = 'Получите предварительный расчёт';
    if (progress) progress.style.width = '100%';
    prev.disabled = false;
    prev.hidden = false;

    options.innerHTML = `
      <div class="estimator-lead">
        <label class="form__field estimator-lead__field">
          <span class="form__field-label">Имя</span>
          <input class="form__input" name="name" type="text" placeholder="Как к вам обращаться" autocomplete="name" />
        </label>
        <label class="form__field estimator-lead__field">
          <span class="form__field-label">Телефон</span>
          <input class="form__input" name="phone" type="tel" autocomplete="tel" required />
        </label>
        <label class="file-field form__file-field form__file-field--preview estimator-lead__file">
          <span class="file-field__text">${config.photoLabel || 'Фото объекта'}</span>
          <span class="file-field__hint">${config.photoHint || 'Можно загрузить несколько фото'}</span>
          <span class="form__file-previews"></span>
          <input name="photos[]" type="file" accept="image/*" multiple />
        </label>
        <label class="policy-check estimator-lead__policy">
          <input type="checkbox" name="policy" required />
          <span>Согласен на обработку персональных данных и принимаю <a href="/politika-konfidentsialnosti/">политику конфиденциальности</a>.</span>
        </label>
      </div>
    `;

    options.querySelectorAll('input[type="tel"]').forEach(bindEstimatorPhoneInput);
    options.querySelectorAll('.file-field input').forEach(bindFileFieldInput);
    next.type = 'submit';
    next.textContent = config.submit || 'Получить расчет';
  }

  function goNext() {
    window.clearTimeout(autoNextTimer);
    if (isFinalStep) return;

    const question = questions[currentStepIndex];
    const checkedInput = options.querySelector('input[type="radio"]:checked');
    if (checkedInput) setAnswer(question.name, checkedInput.value);

    if (currentStepIndex < questions.length - 1) {
      currentStepIndex += 1;
      renderQuestion();
      return;
    }

    renderLeadStep();
  }

  options.addEventListener('change', (event) => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement) || input.type !== 'radio') return;

    const question = questions[currentStepIndex];
    setAnswer(question.name, input.value);
    window.clearTimeout(autoNextTimer);
    autoNextTimer = window.setTimeout(goNext, 260);
  });

  next.addEventListener('click', () => {
    if (next.type !== 'submit') goNext();
  });

  prev.addEventListener('click', () => {
    window.clearTimeout(autoNextTimer);
    if (isFinalStep) {
      renderQuestion();
      return;
    }
    if (currentStepIndex <= 0) return;
    currentStepIndex -= 1;
    renderQuestion();
  });

  form.addEventListener('reset', () => {
    window.setTimeout(() => {
      currentStepIndex = 0;
      renderQuestion();
    }, 0);
  });

  renderQuestion();
}

document.querySelectorAll('.estimator-quiz').forEach(setupEstimatorQuiz);

const formEndpoint = '/mail.php';
const metrikaCounterId = 110986002;
const defaultMetrikaFormGoal = 'form_pristroyka';

function resetFormFileState(form) {
  form.querySelectorAll('.file-field__text').forEach((span) => {
    span.textContent = span.dataset.defaultText || 'Прикрепить фотографии';
  });
  form.querySelectorAll('.file-field__count').forEach((counter) => {
    counter.textContent = '';
    counter.hidden = true;
  });
  form.querySelectorAll('.form__file-previews, .photo-modal__previews').forEach((previews) => {
    previews.querySelectorAll('img').forEach((image) => {
      URL.revokeObjectURL(image.src);
    });
    previews.replaceChildren();
  });
}

async function submitLeadForm(form) {
  const formData = new FormData(form);
  formData.append('form_name', form.dataset.formName || 'Заявка');
  formData.append('page_url', window.location.href);

  const response = await fetch(formEndpoint, {
    method: 'POST',
    body: formData
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok || !payload?.success) {
    throw new Error(payload?.message || 'Заявка не отправлена. Попробуйте ещё раз');
  }

  return payload;
}

function removeFormSuccessMessage(form) {
  form.querySelector('.form-success')?.remove();
  form.classList.remove('is-sent');
}

function showFormSuccessMessage(form, text = 'Заявка успешно отправлена. Мы свяжемся с вами в ближайшее время.') {
  form.querySelector('.form-success')?.remove();

  const message = document.createElement('div');
  message.className = 'form-success';
  message.setAttribute('role', 'status');
  message.setAttribute('aria-live', 'polite');
  message.innerHTML = `
    <span class="form-success__icon" aria-hidden="true">✓</span>
    <span class="form-success__body">
      <strong class="form-success__title">Успешно отправлено</strong>
      <span class="form-success__text">${text}</span>
    </span>
  `;

  form.classList.add('is-sent');
  form.append(message);
}

function getFormMetrikaGoal(form) {
  return form.dataset.metrikaGoal || defaultMetrikaFormGoal;
}

function reachFormSubmitGoal(goal) {
  if (typeof window.ym !== 'function') return;
  window.ym(metrikaCounterId, 'reachGoal', goal);
}

function reachFormSubmitEvent(form) {
  const goal = getFormMetrikaGoal(form);
  reachFormSubmitGoal(goal);
  if (typeof window.dataLayer === 'undefined') {
    window.dataLayer = [];
  }
  window.dataLayer.push({
    event: goal,
    form_name: form.dataset.formName || 'Заявка',
  });
}

document.querySelectorAll('form').forEach((form) => {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    removeFormSuccessMessage(form);
    const button = form.querySelector('button[type="submit"]');
    const previousText = button?.textContent || '';

    if (button) {
      button.disabled = true;
      button.textContent = 'Отправляем заявку...';
    }

    try {
      const payload = await submitLeadForm(form);
      form.reset();
      resetFormFileState(form);
      reachFormSubmitEvent(form);
      showFormSuccessMessage(form, payload?.message || 'Заявка успешно отправлена. Мы свяжемся с вами в ближайшее время.');

      setTimeout(() => {
        removeFormSuccessMessage(form);
        if (button) {
          button.disabled = false;
          button.textContent = previousText;
        }
      }, 2400);
    } catch (error) {
      if (button) {
        button.disabled = false;
        button.textContent = error instanceof Error ? error.message : 'Ошибка отправки';
      }

      setTimeout(() => {
        if (button) {
          button.textContent = previousText;
        }
      }, 3200);
    }
  });
});

const defaultPhotoModalTitle = photoModal?.querySelector('.photo-modal__title')?.textContent || 'Получить расчёт по фото';
const defaultPhotoModalSubmitText = photoModal?.querySelector('.photo-modal__submit')?.textContent || 'Получить расчет по фото';
const typeSubmitTextByTitle = {
  'Жилая пристройка': 'Получить расчет жилой пристройки',
  'Кухня или столовая': 'Получить расчет пристройки кухни',
  'Тёплая веранда или тамбур': 'Получить расчет тёплой веранды',
  'Терраса или летняя веранда': 'Получить расчет террасы'
};

document.querySelectorAll('.btn-photo[href="#estimate"], [data-photo-modal-title]').forEach((button) => {
  button.addEventListener('click', (event) => {
    if (!photoModal) return;
    event.preventDefault();
    const title = photoModal.querySelector('.photo-modal__title');
    const submit = photoModal.querySelector('.photo-modal__submit');
    const form = photoModal.querySelector('.photo-modal__form');
    const existingTypeImage = photoModal.querySelector('.photo-modal__type-image');
    const typeCard = button.closest('.type-grid__item');
    const typeTitle = typeCard?.querySelector('.image-card__title')?.textContent?.trim() || '';
    if (title) {
      title.textContent = button.dataset.photoModalTitle || defaultPhotoModalTitle;
    }
    if (submit) {
      submit.textContent = typeSubmitTextByTitle[typeTitle] || defaultPhotoModalSubmitText;
    }
    existingTypeImage?.remove();

    const cardImage = typeCard?.querySelector('.image-card__image');
    if (form && title && cardImage instanceof HTMLImageElement) {
      const image = document.createElement('img');
      image.className = 'photo-modal__type-image';
      image.src = cardImage.currentSrc || cardImage.src;
      image.alt = cardImage.alt || typeCard.querySelector('.image-card__title')?.textContent?.trim() || '';
      title.insertAdjacentElement('beforebegin', image);
    }
    photoModal.showModal();
  });
});

document.querySelectorAll('.filters button').forEach((button) => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    document.querySelectorAll('.filters button').forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    document.querySelectorAll('.gallery img').forEach((image) => {
      image.hidden = filter !== 'all' && !image.dataset.kind.includes(filter);
    });
  });
});

const modal = document.querySelector('#galleryModal');
const modalContent = modal?.querySelector('.modal-content');
const galleryState = {
  images: [],
  title: '',
  imageIndex: 0
};
const caseImages = {
  case1: ['case-warm-veranda-facade.webp', 'case-warm-veranda-base.webp', 'case-warm-veranda-porch.webp'],
  case2: ['case-room-finished.webp', 'case-room-roof-frame.webp', 'case-room-gable.webp', 'case-room-before.webp'],
  case3: ['case-terrace-finished.webp', 'case-terrace-build.webp', 'case-terrace-ready.webp'],
  case4: ['case-extension-detail.webp', 'case-extension-main.webp'],
  case5: ['case-extension-2-detail.webp', 'case-extension-2-main.webp'],
  case6: ['case-extension-3-main.webp', 'case-extension-3-build.webp', 'case-extension-3-detail.webp'],
  case7: ['case-extension-4-main.webp', 'case-extension-4-build.webp', 'case-extension-4-detail.webp'],
  reviews: ['review-istra.webp', 'review-pushkino.webp', 'review-domodedovo.webp']
};

function normalizeGalleryImages(images, title) {
  return images.map((image) => (
    typeof image === 'string'
      ? { image: `/assets/${image}`, title }
      : image
  ));
}

function renderImageModal() {
  if (!modalContent) return;
  const image = galleryState.images[galleryState.imageIndex];
  if (!image) return;

  const hasMultipleImages = galleryState.images.length > 1;

  modalContent.innerHTML = `
    <div class="gallery-lightbox">
      <h2 class="gallery-lightbox__title">${galleryState.title}</h2>
      <div class="gallery-lightbox__stage">
        <img class="gallery-lightbox__image" src="${image.image}" alt="${image.title || galleryState.title}" />
        ${
          hasMultipleImages
            ? '<button class="gallery-lightbox__nav gallery-lightbox__nav--prev" type="button" data-gallery-modal-nav="prev" aria-label="Предыдущее фото"></button><button class="gallery-lightbox__nav gallery-lightbox__nav--next" type="button" data-gallery-modal-nav="next" aria-label="Следующее фото"></button>'
            : ''
        }
      </div>
      ${
        hasMultipleImages
          ? `<div class="gallery-lightbox__thumbs" aria-label="Фотографии кейса">
              ${galleryState.images
                .map((item, index) => `
                  <button
                    class="gallery-lightbox__thumb${index === galleryState.imageIndex ? ' is-active' : ''}"
                    type="button"
                    data-gallery-modal-thumb="${index}"
                    aria-label="Открыть фото ${index + 1}"
                  >
                    <img src="${item.image}" alt="" loading="lazy" />
                  </button>
                `)
                .join('')}
            </div>`
          : ''
      }
    </div>
  `;
}

function moveImageModal(direction) {
  if (galleryState.images.length < 2) return;
  galleryState.imageIndex = (galleryState.imageIndex + direction + galleryState.images.length) % galleryState.images.length;
  renderImageModal();
}

function openImageModal(images, title, imageIndex = 0) {
  if (!modal || !modalContent) return;
  const normalizedImages = normalizeGalleryImages(images, title);
  if (!normalizedImages.length) return;

  galleryState.images = normalizedImages;
  galleryState.title = title;
  galleryState.imageIndex = Math.max(0, Math.min(imageIndex, normalizedImages.length - 1));

  modal.classList.add('modal--lightbox');
  renderImageModal();
  modal.showModal();
}

function parseCaseSliderItems(slider) {
  try {
    return JSON.parse(slider.dataset.caseSliderImages || '[]');
  } catch {
    return [];
  }
}

function updateCaseSlider(slider, index) {
  const items = parseCaseSliderItems(slider);
  if (!items.length) return;

  const safeIndex = ((index % items.length) + items.length) % items.length;
  const item = items[safeIndex];
  slider.dataset.caseSliderIndex = String(safeIndex);
  slider.style.setProperty('--case-card-image', `url("${item.image}")`);

  const openButton = slider.querySelector('[data-case-slider-open]');
  if (openButton) {
    openButton.setAttribute('aria-label', `Открыть галерею: ${item.title || 'фото объекта'}`);
  }
}

document.querySelectorAll('[data-case-slider]').forEach((slider) => {
  const items = parseCaseSliderItems(slider);
  slider.classList.toggle('has-single-image', items.length < 2);
  updateCaseSlider(slider, Number(slider.dataset.caseSliderIndex || 0));

  slider.querySelectorAll('[data-case-slider-nav]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();

      const direction = button.dataset.caseSliderNav;
      const currentIndex = Number(slider.dataset.caseSliderIndex || 0);
      updateCaseSlider(slider, direction === 'prev' ? currentIndex - 1 : currentIndex + 1);
    });
  });

  slider.querySelector('[data-case-slider-open]')?.addEventListener('click', () => {
    const items = parseCaseSliderItems(slider);
    const title = slider.closest('.case-card')?.querySelector('.case-card__title')?.textContent?.trim() || 'Фотографии объекта';
    openImageModal(items, title, Number(slider.dataset.caseSliderIndex || 0));
  });
});

document.querySelectorAll('[data-gallery-open]').forEach((button) => {
  button.addEventListener('click', () => {
    const id = button.dataset.galleryOpen;
    openImageModal(caseImages[id] || [], button.textContent);
  });
});

modalContent?.addEventListener('click', (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;

  const lightbox = target.closest('.gallery-lightbox');
  if (lightbox) {
    const interactiveTarget = target.closest(
      '.gallery-lightbox__image, .gallery-lightbox__nav, .gallery-lightbox__thumb, .gallery-lightbox__title'
    );

    if (!interactiveTarget) {
      closeModalAnimated(modal);
      return;
    }
  }

  const nav = target.closest('[data-gallery-modal-nav]');
  if (nav) {
    moveImageModal(nav.getAttribute('data-gallery-modal-nav') === 'prev' ? -1 : 1);
    return;
  }

  const thumb = target.closest('[data-gallery-modal-thumb]');
  if (thumb) {
    const index = Number(thumb.getAttribute('data-gallery-modal-thumb'));
    if (Number.isFinite(index)) {
      galleryState.imageIndex = index;
      renderImageModal();
    }
  }
});

document.addEventListener('keydown', (event) => {
  if (!modal?.open || !modalContent?.querySelector('.gallery-lightbox')) return;

  if (event.key === 'ArrowLeft') {
    event.preventDefault();
    moveImageModal(-1);
  }

  if (event.key === 'ArrowRight') {
    event.preventDefault();
    moveImageModal(1);
  }
});

document.querySelector('.modal-close')?.addEventListener('click', () => closeModalAnimated(modal));
modal?.addEventListener('click', (event) => {
  if (event.target === modal) closeModalAnimated(modal);
});
modal?.addEventListener('cancel', (event) => {
  event.preventDefault();
  closeModalAnimated(modal);
});
modal?.addEventListener('close', () => {
  modal.classList.remove('modal--lightbox');
  galleryState.images = [];
  galleryState.title = '';
  galleryState.imageIndex = 0;
  if (modalContent) modalContent.innerHTML = '';
});

photoModal?.querySelector('.modal-close')?.addEventListener('click', () => closeModalAnimated(photoModal));
photoModal?.addEventListener('click', (event) => {
  if (event.target === photoModal) closeModalAnimated(photoModal);
});
photoModal?.addEventListener('cancel', (event) => {
  event.preventDefault();
  closeModalAnimated(photoModal);
});
