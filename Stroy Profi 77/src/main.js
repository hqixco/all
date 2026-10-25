import './styles.css';

const isExtensionsPage = document.body.dataset.service === 'extensions';
const isRecoveryPage = document.body.dataset.service === 'recovery';
const isFloorInsulationPage = document.body.dataset.service === 'floor-insulation';
const isFoundationRepairPage = document.body.dataset.service === 'foundation-repair';
const serviceEstimateTitle = isFloorInsulationPage
  ? 'Оценим утепление пола'
  : isFoundationRepairPage
    ? 'Оценим ремонт фундамента'
    : 'Оценим ремонт кровли';

const addFormFieldTitles = (root = document) => {
  root.querySelectorAll('input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]):not([type="file"]), select, textarea').forEach((field) => {
    if (field.closest('.form-field')) return;
    const title = field.dataset.fieldTitle || field.placeholder || field.querySelector('option')?.textContent?.trim() || field.name;
    if (!title) return;
    const wrapper = document.createElement('label');
    wrapper.className = 'form-field';
    const caption = document.createElement('span');
    caption.className = 'form-field__title';
    caption.textContent = title;
    field.before(wrapper);
    wrapper.append(caption, field);
  });
};

window.addFormFieldTitles = addFormFieldTitles;
addFormFieldTitles();

const uiIcon = (name, className = 'ui-icon') => {
  const paths = {
    arrowUpRight: '<path d="M7 17 17 7M9 7h8v8"/>',
    arrowUp: '<path d="M12 19V5M6.5 10.5 12 5l5.5 5.5"/>',
    arrowDown: '<path d="M12 5v14M6.5 13.5 12 19l5.5-5.5"/>',
    chevronLeft: '<path d="m15 18-6-6 6-6"/>',
    chevronRight: '<path d="m9 18 6-6-6-6"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    star: '<path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z"/>',
  };
  return `<svg class="${className}" viewBox="0 0 24 24" aria-hidden="true">${paths[name]}</svg>`;
};

const replaceTrailingIcon = (element, symbol, iconName) => {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);
  const textNode = textNodes.reverse().find((node) => node.textContent.includes(symbol));
  if (!textNode) return;
  textNode.textContent = textNode.textContent.replace(symbol, '').trimEnd() + ' ';
  textNode.parentElement?.insertAdjacentHTML('beforeend', uiIcon(iconName));
};

document.querySelectorAll('a, button').forEach((element) => {
  replaceTrailingIcon(element, '↗', 'arrowUpRight');
  replaceTrailingIcon(element, '↑', 'arrowUp');
});

document.querySelectorAll('.steps-line > i').forEach((element) => {
  element.innerHTML = uiIcon('arrowDown');
});

document.querySelectorAll('.stars, .review-card > strong').forEach((element) => {
  element.innerHTML = Array.from({ length: 5 }, () => uiIcon('star')).join('');
  element.classList.add('stars');
});

document.querySelectorAll('.quiz').forEach((quiz) => {
  const originalHeadingHtml = quiz.querySelector('.section-heading')?.outerHTML || '';
  const originalSteps = [...quiz.querySelectorAll('.quiz-form > fieldset')];
  const originalFinalStep = originalSteps.at(-1)?.cloneNode(true);
  originalFinalStep?.querySelector('legend')?.remove();
  const originalFinalContent = originalFinalStep?.innerHTML || '';
  const originalQuestions = originalSteps.slice(0, -1).map((step) => [
    step.querySelector('legend')?.textContent.replace(/^\s*\d+\s*/, '').trim() || '',
    [...step.querySelectorAll('input[type="radio"] + span')].map((option) => option.textContent.trim()),
    [...step.querySelectorAll('input[type="radio"] + span')].map((option) => {
      const image = option.querySelector('img');
      return image?.getAttribute('src')?.replace(/^\/assets\//, '') || '';
    }),
  ]);
  const questions = originalQuestions;
  if (!questions.length) return;

  quiz.innerHTML = `<div class="container">${originalHeadingHtml}<div class="quiz-layout"><aside class="quiz-manager"><div class="portrait"><span>А</span></div><p class="label">На связи</p><h3>Александр,<br>прораб</h3><p>Посмотрит фотографии и подскажет оптимальный объём работ.</p><div class="manager-reply">Ответим<br><strong>за 10 минут</strong></div></aside><form class="quiz-form"><div class="quiz-progress"><span></span></div><p class="quiz-step">Выберите подходящий вариант</p><h3 class="quiz-question"></h3><div class="quiz-options"></div><div class="quiz-controls"><button class="button button-ghost quiz-prev" type="button" disabled>Назад</button><button class="button button-accent quiz-next" type="button">Следующий вопрос ${uiIcon('arrowUpRight')}</button></div><div class="quiz-status" role="status" aria-live="polite"></div></form></div></div>`;

  const form = quiz.querySelector('.quiz-form');
  const options = form.querySelector('.quiz-options');
  const previousButton = form.querySelector('.quiz-prev');
  const nextButton = form.querySelector('.quiz-next');
  const answers = [];
  let step = 0;
  let isLeadStep = false;
  let autoAdvanceTimer;

  const renderQuiz = () => {
    const [question, labels, images] = questions[step];
    form.querySelector('.quiz-question').textContent = question;
    form.querySelector('.quiz-progress span').style.width = `${((step + 1) / questions.length) * 100}%`;
    options.innerHTML = labels.map((label, index) => `<label class="quiz-option"><input type="radio" name="quiz-answer-${step}" value="${label}" ${answers[step] === label ? 'checked' : ''}><span>${images[index] ? `<img src="/assets/${images[index]}" alt="" aria-hidden="true">` : ''}<b>${label}</b></span></label>`).join('');
    previousButton.disabled = step === 0;
    nextButton.innerHTML = `${step === questions.length - 1 ? 'Перейти к заявке' : 'Следующий вопрос'} ${uiIcon('arrowUpRight')}`;
  };

  const showLeadStep = () => {
    isLeadStep = true;
    options.innerHTML = `<div class="quiz-final-fields">${originalFinalContent}</div>`;
    answers.forEach((answer, index) => form.insertAdjacentHTML('beforeend', `<input type="hidden" name="quiz_answer_${index + 1}" value="${answer}">`));
    form.dataset.formName = `Квиз — ${serviceEstimateTitle.toLocaleLowerCase('ru-RU')}`;
    form.querySelector('.quiz-question').textContent = 'Куда отправить предварительный расчёт?';
    form.querySelector('.quiz-step').textContent = 'Контактные данные';
    const controls = form.querySelector('.quiz-controls');
    controls.hidden = true;
    controls.style.display = 'none';
    window.addFormFieldTitles?.(options);
  };

  form.addEventListener('change', (event) => {
    if (!event.target.matches('input[type="radio"]')) return;
    answers[step] = event.target.value;
    clearTimeout(autoAdvanceTimer);
    autoAdvanceTimer = setTimeout(() => {
      if (step < questions.length - 1) {
        step += 1;
        renderQuiz();
      } else {
        showLeadStep();
      }
    }, 200);
  });
  previousButton.addEventListener('click', () => {
    if (!step || isLeadStep) return;
    step -= 1;
    renderQuiz();
  });
  nextButton.addEventListener('click', (event) => {
    if (isLeadStep) return;
    event.preventDefault();
    if (!answers[step]) return;
    if (step < questions.length - 1) {
      step += 1;
      renderQuiz();
    } else {
      showLeadStep();
    }
  });
  renderQuiz();
});

const guaranteeGrid = document.querySelector('.guarantee .split-section');

if (guaranteeGrid && !isRecoveryPage) {
  guaranteeGrid.insertAdjacentHTML(
    'afterbegin',
    '<figure class="guarantee-document"><img src="/assets/roofing-contract-document.webp" alt="Пример договора подряда"></figure>',
  );
}

const priceLayout = document.querySelector('.price-layout');

if (priceLayout && !priceLayout.querySelector('.price-photo')) {
  const pricePhoto = document.createElement('div');
  pricePhoto.className = 'price-photo';
  pricePhoto.setAttribute('aria-hidden', 'true');
  priceLayout.querySelector('.price-form')?.before(pricePhoto);
}

const headerContact = document.querySelector('.header-contact');

if (headerContact) {
  headerContact.className = 'header-contact header-contact-group';
  headerContact.innerHTML = `
    <div class="header-messengers" aria-label="Мессенджеры">
      <a class="header-messenger header-messenger--max" href="https://max.ru/u/f9LHodD0cOLwnF7CmlG-7vdX7wOfb0qYgdaMsltadfjaD2HI5t77q3ca_z8" target="_blank" rel="noopener noreferrer" aria-label="Написать в MAX"><img src="/assets/max-icon.svg" alt=""><span>MAX</span></a>
      <a class="header-messenger header-messenger--telegram" href="#estimate" aria-label="Написать в Telegram">
        <img src="/assets/telegram-icon.svg" alt=""><span>Telegram</span>
      </a>
    </div>
    <div class="phone-stack">
      <div class="phone-line"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.25 3.25 4.8 4.4c-.78.36-1.18 1.24-.95 2.06 1.62 5.9 6.22 10.5 12.12 12.12.82.23 1.7-.17 2.06-.95l1.15-2.45-3.22-2.02-1.7 1.38c-3.03-1.5-5.42-3.89-6.92-6.92l1.38-1.7-2.02-3.22Z"/></svg><a href="tel:+79152925564">+7 (915) 292-55-64</a></div>
      <span>Звоните в любое время</span>
    </div>`;
}

const headerMenuToggle = document.querySelector('.header-menu-toggle');
const siteNavigation = document.querySelector('#site-navigation');

if (headerMenuToggle && siteNavigation) {
  headerMenuToggle.addEventListener('click', () => {
    const isOpen = headerMenuToggle.getAttribute('aria-expanded') === 'true';
    headerMenuToggle.setAttribute('aria-expanded', String(!isOpen));
    document.querySelector('.site-header')?.classList.toggle('menu-open', !isOpen);
  });

  siteNavigation.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      headerMenuToggle.setAttribute('aria-expanded', 'false');
      document.querySelector('.site-header')?.classList.remove('menu-open');
    });
  });
}

document.querySelectorAll('.nav-dropdown').forEach((dropdown) => {
  const toggle = dropdown.querySelector('.nav-dropdown__toggle');
  if (!toggle) return;

  const close = () => {
    dropdown.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  };

  toggle.addEventListener('click', (event) => {
    event.stopPropagation();
    const isOpen = dropdown.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  dropdown.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      close();
      toggle.focus();
    }
  });

  document.addEventListener('click', (event) => {
    if (!dropdown.contains(event.target)) close();
  });
});

const weatherCopy = document.querySelector('.weather .split-section > div:first-child');

if (weatherCopy && !weatherCopy.querySelector('.weather-media')) {
  const weatherNote = weatherCopy.querySelector('.large-note');
  if (weatherNote) {
    const weatherMedia = document.createElement('div');
    weatherMedia.className = 'weather-media';
    weatherNote.before(weatherMedia);
    weatherMedia.insertAdjacentHTML(
      'afterbegin',
      isExtensionsPage
        ? '<img class="weather-media-image" src="/assets/extension-house-junction.webp" alt="Готовое примыкание пристройки к деревянному дому">'
        : '<img class="weather-media-image" src="/assets/roof-temporary-protection.webp" alt="Временная защита крыши">',
    );
    weatherMedia.append(weatherNote);
  }
}

const weatherSection = document.querySelector('.weather');
const weatherList = weatherSection?.querySelector('.numbered-list');
const weatherMedia = weatherSection?.querySelector('.weather-media');

if (weatherCopy && weatherList && weatherMedia) {
  const moveWeatherMedia = () => {
    if (window.matchMedia('(max-width: 1200px)').matches) {
      weatherList.prepend(weatherMedia);
    } else {
      weatherCopy.append(weatherMedia);
    }
  };

  moveWeatherMedia();
  window.matchMedia('(max-width: 1200px)').addEventListener('change', moveWeatherMedia);
}

const materialCards = document.querySelectorAll('.hero-materials article');

if (materialCards.length) {
  document.body.insertAdjacentHTML('beforeend', `
    <div class="estimate-modal" aria-hidden="true">
      <div class="estimate-modal__overlay" data-modal-close></div>
      <section class="estimate-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="material-modal-title">
        <button class="estimate-modal__close" type="button" aria-label="Закрыть" data-modal-close>${uiIcon('close')}</button>
        <p class="eyebrow">Предварительный расчёт</p>
        <h2 id="material-modal-title">${isExtensionsPage ? 'Рассчитаем пристройку' : serviceEstimateTitle}</h2>
        <p class="estimate-modal__intro">Пришлите фотографии дома — прораб назовёт ориентировочный бюджет и объём работ.</p>
        <form class="estimate-modal__form">
          <input name="material" type="hidden">
          <input name="phone" type="tel" placeholder="Телефон" required>
          <input name="location" type="text" placeholder="Населённый пункт / район" required>
          <label class="upload">Добавить фотографии <input type="file" multiple accept="image/*"></label>
          <label class="consent"><input type="checkbox" required><span>Соглашаюсь с <a href="/privacy.html">политикой конфиденциальности</a></span></label>
          <button class="button button-accent" type="submit"><svg class="button-camera" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7.5h3l1.35-2h7.3l1.35 2h3a1.5 1.5 0 0 1 1.5 1.5V18a1.5 1.5 0 0 1-1.5 1.5H4A1.5 1.5 0 0 1 2.5 18V9A1.5 1.5 0 0 1 4 7.5Z"/><circle cx="12" cy="13.5" r="3.5"/></svg>Получить расчёт</button>
        </form>
      </section>
    </div>`,
  );

  const estimateModal = document.querySelector('.estimate-modal');
  addFormFieldTitles(estimateModal);
  const modalTitle = estimateModal?.querySelector('#material-modal-title');
  const modalMaterial = estimateModal?.querySelector('input[name="material"]');
  const modalPhone = estimateModal?.querySelector('input[name="phone"]');
  const materialPopupTitles = {
    'Металлочерепица': 'Получить расчёт металлочерепицы',
    'Профнастил': 'Получить расчёт кровли из профнастила',
    'Мягкая кровля': 'Получить расчёт мягкой кровли',
    'Фальцевая кровля': 'Получить расчёт фальцевой кровли',
    'Локальный ремонт': 'Оценить локальный ремонт кровли',
    'Ремонт примыканий': 'Оценить ремонт примыканий',
    'Ремонт основания': 'Оценить ремонт стропил и обрешётки',
    'Жилая пристройка': 'Рассчитать жилую пристройку',
    'Кухня или столовая': 'Рассчитать пристройку кухни',
    'Тёплая веранда': 'Рассчитать тёплую веранду',
  };
  const closeModal = () => {
    estimateModal?.classList.remove('is-open');
    estimateModal?.setAttribute('aria-hidden', 'true');
  };

  materialCards.forEach((card) => {
    const materialName = card.querySelector('b')?.textContent?.trim() || (isExtensionsPage ? 'выбранную пристройку' : 'выбранную кровлю');
    const requestTitle = card.dataset.requestTitle?.trim();
    const materialPopupTitle = requestTitle || materialPopupTitles[materialName] || (isExtensionsPage ? 'Получить расчёт пристройки' : serviceEstimateTitle);
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', materialPopupTitle);
    const openModal = () => {
      if (!estimateModal || !modalTitle || !modalMaterial) return;
      modalTitle.textContent = materialPopupTitle;
      modalMaterial.value = requestTitle ? `Тема заявки: ${requestTitle}` : `Выбранный материал: ${materialName}`;
      estimateModal.classList.add('is-open');
      estimateModal.setAttribute('aria-hidden', 'false');
      setTimeout(() => modalPhone?.focus(), 180);
    };
    card.addEventListener('click', openModal);
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openModal();
      }
    });
  });

  estimateModal?.querySelectorAll('[data-modal-close]').forEach((element) => {
    element.addEventListener('click', closeModal);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && estimateModal?.classList.contains('is-open')) closeModal();
  });

  const modalIntro = estimateModal?.querySelector('.estimate-modal__intro');
  const popupButtons = document.querySelectorAll(
    'a.button[href="#estimate"], a.text-link[href="#estimate"]',
  );

  const popupContent = (label) => {
    const text = label.toLocaleLowerCase('ru-RU');
    if (isRecoveryPage) return ['Оценить состояние дома', 'Пришлите фотографии дома и проблемных мест. Прораб подскажет, с чего начать восстановление и какой объём ремонта рассматривать.'];
    if (isFloorInsulationPage) return ['Рассчитать утепление полов', 'Пришлите фотографии пола, подполья или подвала. Оценим состояние перекрытия, способ утепления и предварительный бюджет.'];
    if (isFoundationRepairPage) return ['Оценить ремонт фундамента', 'Пришлите фотографии фундамента, углов и трещин. Оценим причину повреждения и предварительный объём усиления.'];
    if (text.includes('осмотр') || text.includes('прораб')) return ['Вызвать прораба на осмотр', 'Оставьте телефон и населённый пункт. Александр уточнит детали и согласует удобное время осмотра.'];
    if (isExtensionsPage && (text.includes('фото') || text.includes('фотограф'))) return ['Получить расчёт пристройки по фото', 'Добавьте фотографии дома и места будущей пристройки. Оценим конструкцию и диапазон стоимости.'];
    if (isExtensionsPage) return ['Рассчитать пристройку', 'Оставьте телефон, населённый пункт и фотографии дома. Подготовим предварительную оценку строительства.'];
    if (text.includes('реконструк')) return ['Оценить капитальный ремонт крыши', 'Приложите фотографии повреждений. Оценим состояние конструкции и предварительный объём ремонта.'];
    if (text.includes('перекрыш')) return ['Оценить ремонт покрытия', 'Пришлите фотографии существующей кровли. Оценим повреждение покрытия, основания и доборных элементов.'];
    if (text.includes('выезд') || text.includes('объект')) return ['Уточнить выезд на объект', 'Укажите населённый пункт. Сразу обозначим условия выезда, логистики и доставки материалов.'];
    if (text.includes('смет')) return ['Получить предварительную смету', 'Опишите задачу и приложите фотографии. Разделим работы и материалы и обозначим предварительный бюджет.'];
    if (text.includes('фото') || text.includes('фотограф')) return ['Получить расчёт ремонта по фото', 'Добавьте 3–5 фотографий дома и крыши. Александр оценит объём работ и диапазон стоимости.'];
    return ['Рассчитать ремонт кровли', 'Оставьте телефон, населённый пункт и фотографии. Подготовим предварительную оценку именно вашего дома.'];
  };

  popupButtons.forEach((button) => {
    const label = button.textContent.replace(/↗/g, '').trim();
    const cardTitle = button.closest('.plan-card, .case-card')?.querySelector('h3')?.textContent?.trim();
    const topic = cardTitle ? `${label}: ${cardTitle}` : label;
    const [title, intro] = popupContent(`${label} ${cardTitle || ''}`);

    button.removeAttribute('href');
    button.setAttribute('role', 'button');
    button.setAttribute('tabindex', '0');
    button.setAttribute('aria-haspopup', 'dialog');

    const openPopup = () => {
      if (!estimateModal || !modalTitle || !modalMaterial) return;
      modalTitle.textContent = title;
      modalMaterial.value = `Тема заявки: ${topic}`;
      if (modalIntro) modalIntro.textContent = intro;
      estimateModal.classList.add('is-open');
      estimateModal.setAttribute('aria-hidden', 'false');
      setTimeout(() => modalPhone?.focus(), 180);
    };

    button.addEventListener('click', openPopup);
    button.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openPopup();
      }
    });
  });
}

const forms = document.querySelectorAll('form');
const formSubmitGoalId = document.body.dataset.service === 'roof-repair'
  ? 'remont_krovli_form_submit'
  : 'lead_form_submit';

const reachFormSubmitGoal = () => {
  if (typeof window.ym === 'function') {
    window.ym(112914733, 'reachGoal', formSubmitGoalId);
  }
};

const prepareLeadForm = (form) => {
  const namesByPlaceholder = [
    ['телефон', 'phone'],
    ['насел', 'place'],
    ['район', 'place'],
    ['площад', 'roof_area'],
    ['материал', 'roof_material'],
  ];

  form.querySelectorAll('input, select, textarea').forEach((field, index) => {
    if (field.name) return;
    const hint = `${field.placeholder || ''} ${field.options?.[0]?.text || ''}`.toLocaleLowerCase('ru-RU');
    const matchedName = namesByPlaceholder.find(([fragment]) => hint.includes(fragment))?.[1];
    if (matchedName) field.name = matchedName;
    else if (field.type === 'file') field.name = 'photos[]';
    else if (field.type === 'checkbox') field.name = 'policy';
    else field.name = `field_${index + 1}`;
  });

  const phone = form.querySelector('input[type="tel"]');
  if (phone) {
    phone.name = 'phone';
    phone.required = true;
  }
};

const sendLeadForm = async (form, button, statusElement) => {
  prepareLeadForm(form);
  if (!form.checkValidity()) {
    form.reportValidity();
    return false;
  }

  const original = button?.innerHTML || '';
  if (button) {
    button.disabled = true;
    button.textContent = 'Отправляем...';
  }
  if (statusElement) statusElement.textContent = 'Отправляем заявку...';

  try {
    const formData = new FormData(form);
    formData.set('form_name', form.dataset.formName || form.querySelector('h3')?.textContent?.trim() || 'Заявка с сайта «Строй Профи 77»');
    formData.set('page_url', window.location.href);
    const response = await fetch('/mail.php', { method: 'POST', body: formData });
    const result = await response.json().catch(() => null);
    if (!response.ok || !result?.success) throw new Error(result?.message || 'Не удалось отправить заявку');

    reachFormSubmitGoal();
    form.reset();
    if (statusElement) statusElement.textContent = 'Спасибо! Заявка отправлена, прораб свяжется с вами в ближайшее время.';
    if (button) button.textContent = 'Заявка отправлена';
    return true;
  } catch (error) {
    if (statusElement) statusElement.textContent = error instanceof Error ? error.message : 'Ошибка отправки. Попробуйте ещё раз.';
    if (button) {
      button.disabled = false;
      button.innerHTML = original;
    }
    return false;
  }
};

window.sendStroyProfi77LeadForm = sendLeadForm;

const photoEstimateButtons = document.querySelectorAll(
  '.hero-actions .button-accent, .final-cta button, .site-footer > .container > .button',
);

photoEstimateButtons.forEach((button) => {
  if (button.querySelector('.button-camera')) return;
  button.insertAdjacentHTML(
    'afterbegin',
    '<svg class="button-camera" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7.5h3l1.35-2h7.3l1.35 2h3a1.5 1.5 0 0 1 1.5 1.5V18a1.5 1.5 0 0 1-1.5 1.5H4A1.5 1.5 0 0 1 2.5 18V9A1.5 1.5 0 0 1 4 7.5Z"/><circle cx="12" cy="13.5" r="3.5"/></svg>',
  );
});

forms.forEach((form) => {
  prepareLeadForm(form);
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = form.querySelector('button[type="submit"]');
    if (!button) return;
    let status = form.querySelector('.form-status');
    if (!status) {
      status = document.createElement('div');
      status.className = 'form-status';
      status.setAttribute('role', 'status');
      status.setAttribute('aria-live', 'polite');
      form.append(status);
    }
    await sendLeadForm(form, button, status);
  });
});

document.querySelectorAll('input[type="file"]').forEach((input) => {
  input.addEventListener('change', () => {
    const label = input.closest('.upload');
    if (label && input.files.length) label.childNodes[0].textContent = `Выбрано файлов: ${input.files.length} `;
  });
});

const finalCtaCopy = document.querySelector(
  '.final-cta .final-layout > div:first-child',
);

if (finalCtaCopy) {
  finalCtaCopy.insertAdjacentHTML(
    'beforeend',
    `<div class="final-cta-note" aria-hidden="true">
      <span>${isExtensionsPage ? 'Подберём конструкцию<br>и рассчитаем стоимость' : isRecoveryPage ? 'Определим объём<br>восстановления дома' : 'Оценим состояние<br>и предложим решение'}</span>
      <svg viewBox="0 0 130 82" role="presentation">
        <path d="M5 10 C58 4, 95 23, 108 62" />
        <path d="M96 53 L108 66 L116 49" />
      </svg>
    </div>`,
  );
}

const geoCopy = document.querySelector('.geo .geo-inner > div:first-child');

if (geoCopy) {
  const geoText = geoCopy.querySelector('p');
  if (geoText) {
    geoText.hidden = true;
    const geoNote = geoCopy.querySelector('small');
    (geoNote || geoText).insertAdjacentHTML(
      'afterend',
      `<div class="geo-tags">
        ${['Москва', 'Балашиха', 'Химки', 'Подольск', 'Мытищи', 'Одинцово', 'Люберцы', 'Красногорск', 'Королёв', 'Домодедово', 'Щёлково', 'Сергиев Посад', 'Раменское', 'Долгопрудный', 'Реутов', 'Видное', 'Лобня', 'Пушкино', 'Чехов', 'Ногинск', 'Дмитров', 'Клин', 'Истра', 'Коломна', 'Серпухов', 'Воскресенск', 'Электросталь', 'Жуковский', 'Звенигород', 'Можайск', 'Руза'].map((city) => `<span>${city}</span>`).join('')}
      </div>`,
    );
  }
}

const phoneMaskPlaceholder = '+7 (___) ___-__-__';

const getPhoneDigits = (value) => {
  const digits = String(value || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits[0] === '8' || digits[0] === '7') return digits.slice(1, 11);
  return digits.slice(0, 10);
};

const formatPhone = (value) => {
  const digits = getPhoneDigits(value);
  if (!digits) return '';

  let result = '+7';
  if (digits.length) result += ` (${digits.slice(0, 3)}`;
  if (digits.length >= 3) result += ')';
  if (digits.length > 3) result += ` ${digits.slice(3, 6)}`;
  if (digits.length > 6) result += `-${digits.slice(6, 8)}`;
  if (digits.length > 8) result += `-${digits.slice(8, 10)}`;
  return result;
};

const preparePhoneInput = (input) => {
  if (!(input instanceof HTMLInputElement) || input.type !== 'tel') return;
  input.placeholder = phoneMaskPlaceholder;
  input.inputMode = 'numeric';
  input.autocomplete = 'tel';
  input.maxLength = 18;
  input.pattern = '\\+7 \\(\\d{3}\\) \\d{3}-\\d{2}-\\d{2}';
  input.value = formatPhone(input.value);
};

document.querySelectorAll('input[type="tel"]').forEach(preparePhoneInput);

document.addEventListener('focusin', (event) => {
  const input = event.target;
  if (!(input instanceof HTMLInputElement) || input.type !== 'tel') return;
  preparePhoneInput(input);
  if (!input.value) input.value = '+7 (';
});

document.addEventListener('input', (event) => {
  const input = event.target;
  if (!(input instanceof HTMLInputElement) || input.type !== 'tel') return;
  input.value = formatPhone(input.value);
  input.setCustomValidity(getPhoneDigits(input.value).length === 10 ? '' : 'Введите номер полностью');
});

document.addEventListener('focusout', (event) => {
  const input = event.target;
  if (!(input instanceof HTMLInputElement) || input.type !== 'tel') return;
  if (!getPhoneDigits(input.value).length) {
    input.value = '';
    input.setCustomValidity('');
  }
});

document.addEventListener('submit', (event) => {
  const phoneInputs = event.target.querySelectorAll?.('input[type="tel"]') || [];
  phoneInputs.forEach((input) => {
    preparePhoneInput(input);
    input.setCustomValidity(getPhoneDigits(input.value).length === 10 ? '' : 'Введите номер полностью');
  });
}, true);
