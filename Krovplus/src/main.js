import './styles.css';

const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
const quizModal = document.querySelector('#quizModal');
const quickPhoneModal = document.querySelector('#quickPhoneModal');
const galleryModal = document.querySelector('#galleryModal');
const galleryModalContent = galleryModal?.querySelector('.modal-content');
const quizForm = document.querySelector('.quiz-form');
const quizSteps = Array.from(document.querySelectorAll('.quiz-step'));
const quizPrev = document.querySelector('[data-quiz-prev]');
const quizNext = document.querySelector('[data-quiz-next]');
const quizProgress = document.querySelector('[data-quiz-progress]');
const quizTopicLabel = document.querySelector('[data-quiz-topic-label]');
const quizTitle = document.querySelector('[data-quiz-title]');
const quizFileLabel = document.querySelector('[data-quiz-file-label]');
const quizFileTitle = document.querySelector('[data-quiz-file-title]');
const quizFileHint = document.querySelector('[data-quiz-file-hint]');
const estimatorQuiz = document.querySelector('.estimator-quiz');
const estimatorStepLabel = estimatorQuiz?.querySelector('.estimator-quiz__step');
const estimatorTitle = estimatorQuiz?.querySelector('h2');
const estimatorOptions = estimatorQuiz?.querySelector('.estimator-options');
const estimatorProgress = estimatorQuiz?.querySelector('.estimator-progress span');
const estimatorNext = estimatorQuiz?.querySelector('.estimator-quiz__next');
const estimatorPrev = estimatorQuiz?.querySelector('.estimator-quiz__prev');
const phoneTemplate = '+7 (___) ___-__-__';
const mobileCaseWorkMedia = window.matchMedia('(max-width: 480px)');
const mobileReviewMedia = window.matchMedia('(max-width: 480px)');
const modalCloseDelay = 160;
const defaultMetrikaFormGoalId = 'krovlya';

let currentStep = 1;
let estimatorAutoNextTimer;
let estimatorCurrentStep = 0;
let estimatorIsFinalStep = false;
const submittingLeadForms = new WeakSet();

const estimatorQuestionPresets = {
  roof: {
    leadTitle: 'Предварительный расчёт замены кровли',
    leadHeading: 'Получите предварительный расчёт',
    fileLabel: 'Фото крыши',
    fileTitle: 'Прикрепите фото крыши',
    fileHint: 'Можно загрузить общий вид дома, старую кровлю или проблемные места',
    submitText: 'Получить расчет',
    questions: [
      {
        title: 'Что необходимо сделать?',
        name: 'replacement_scope',
        options: [
          ['Полная замена кровли', '/assets/quiz-full-roof-replacement.webp'],
          ['Замена покрытия', '/assets/quiz-cover-replacement.webp'],
          ['Ремонт кровли', '/assets/task-pipe-window-leak.webp'],
          ['Водостоки и доборы', '/assets/quiz-gutters-flashing.webp'],
          ['Утепление и основание', '/assets/quiz-insulation-base.webp'],
          ['Пока не знаю', '/assets/quiz-not-sure.webp']
        ]
      },
      {
        title: 'Какое покрытие рассматриваете?',
        name: 'roof_material',
        options: [
          ['Металлочерепица', '/assets/quiz-metal-tile.webp'],
          ['Профнастил', '/assets/quiz-profiled-sheet.webp'],
          ['Гибкая черепица', '/assets/quiz-flexible-shingles.webp'],
          ['Фальцевая кровля', '/assets/quiz-standing-seam.webp'],
          ['Нужна консультация', '/assets/photo-estimate-collage-center.webp'],
          ['Материал уже куплен', '/assets/quiz-material-purchased.webp']
        ]
      },
      {
        title: 'Какая примерная площадь кровли?',
        name: 'roof_area',
        options: [
          ['До 80 м²', '/assets/quiz-area-up-to-80.webp'],
          ['80-140 м²', '/assets/quiz-area-80-140.webp'],
          ['140-220 м²', '/assets/quiz-area-140-220.webp'],
          ['220-350 м²', '/assets/quiz-area-220-350.webp'],
          ['Больше 350 м²', '/assets/quiz-area-over-350.webp'],
          ['Не знаю площадь', '/assets/quiz-area-unknown.webp']
        ]
      },
      {
        title: 'Когда хотите начать работы?',
        name: 'start_time',
        options: [
          ['Срочно'],
          ['В течение недели'],
          ['В этом месяце'],
          ['Через 1-2 месяца'],
          ['Планирую заранее'],
          ['После консультации']
        ]
      }
    ]
  },
  extensions: {
    leadTitle: 'Предварительный расчёт пристройки',
    leadHeading: 'Получите предварительный расчёт пристройки',
    fileLabel: 'Фото дома',
    fileTitle: 'Прикрепите фото дома и места пристройки',
    fileHint: 'Можно загрузить общий вид дома, место пристройки, эскиз или пример',
    submitText: 'Получить расчет пристройки',
    questions: [
      {
        title: 'Какую пристройку нужно построить?',
        name: 'extension_type',
        options: [
          ['Веранда', '/assets/quiz-extension-veranda.webp'],
          ['Терраса', '/assets/quiz-extension-terrace.webp'],
          ['Тамбур', '/assets/quiz-extension-tambour.webp'],
          ['Жилая пристройка', '/assets/quiz-extension-living.webp'],
          ['Навес или хозблок', '/assets/quiz-extension-utility.webp'],
          ['Пока не знаю', '/assets/quiz-extension-not-sure.webp']
        ]
      },
      {
        title: 'Как будет использоваться пристройка?',
        name: 'extension_use',
        options: [
          ['Летняя зона отдыха', '/assets/quiz-extension-summer-zone.webp'],
          ['Закрытая веранда', '/assets/quiz-extension-closed-veranda.webp'],
          ['Тёплое помещение', '/assets/quiz-extension-warm-room.webp'],
          ['Входная группа', '/assets/quiz-extension-entry.webp'],
          ['Хозяйственное помещение', '/assets/quiz-extension-storage.webp'],
          ['Нужна консультация', '/assets/quiz-extension-consultation.webp']
        ]
      },
      {
        title: 'Какой примерный размер?',
        name: 'extension_size',
        options: [
          ['До 10 м²', '/assets/quiz-extension-area-10.webp'],
          ['10-20 м²', '/assets/quiz-extension-area-10-20.webp'],
          ['20-35 м²', '/assets/quiz-extension-area-20-35.webp'],
          ['Больше 35 м²', '/assets/quiz-extension-area-over-35.webp'],
          ['Есть только примерные размеры', '/assets/quiz-extension-area-estimate.webp'],
          ['Не знаю размер', '/assets/quiz-extension-area-unknown.webp']
        ]
      },
      {
        title: 'Когда хотите начать строительство?',
        name: 'start_time',
        options: [
          ['Срочно'],
          ['В течение недели'],
          ['В этом месяце'],
          ['Через 1-2 месяца'],
          ['Планирую заранее'],
          ['После консультации']
        ]
      }
    ]
  },
  crowns: {
    leadTitle: 'Предварительный расчёт замены венцов',
    leadHeading: 'Получите предварительный расчёт замены венцов',
    fileLabel: 'Фото венцов',
    fileTitle: 'Прикрепите фото венцов и фундамента',
    fileHint: 'Можно загрузить нижний ряд, углы, фундамент и общий вид дома',
    submitText: 'Получить расчет венцов',
    questions: [
      {
        title: 'Что нужно заменить?',
        name: 'crown_scope',
        options: [
          ['Нижний венец', '/assets/price-crown-lower.webp'],
          ['Угол дома', '/assets/price-crown-corner.webp'],
          ['Часть стены', '/assets/price-crown-wall.webp'],
          ['Обвязка', '/assets/price-crown-strapping.webp'],
          ['Нужен осмотр', '/assets/quiz-crown-inspection.webp'],
          ['Пока не знаю', '/assets/quiz-crown-not-sure.webp']
        ]
      },
      {
        title: 'Из чего дом?',
        name: 'house_material',
        options: [
          ['Брус', '/assets/quiz-crown-timber.webp'],
          ['Бревно', '/assets/quiz-crown-log.webp'],
          ['Баня', '/assets/quiz-crown-bathhouse.webp'],
          ['Каркас с обвязкой', '/assets/price-crown-strapping.webp'],
          ['Смешанная конструкция', '/assets/quiz-crown-mixed.webp'],
          ['Не знаем', '/assets/quiz-crown-not-sure.webp']
        ]
      },
      {
        title: 'Какой объём повреждений видите?',
        name: 'damage_scope',
        options: [
          ['Один угол', '/assets/scenario-crown-corner.webp'],
          ['Одна стена', '/assets/price-crown-wall.webp'],
          ['По периметру', '/assets/scenario-crown-lower.webp'],
          ['Гниль ушла выше', '/assets/scenario-crown-multiple.webp'],
          ['Нужно вскрывать', '/assets/contact-crown-collage-center.webp'],
          ['Не знаем', '/assets/quiz-crown-not-sure.webp']
        ]
      },
      {
        title: 'Когда хотите начать работы?',
        name: 'start_time',
        options: [
          ['Срочно'],
          ['В течение недели'],
          ['В этом месяце'],
          ['Через 1-2 месяца'],
          ['Планирую заранее'],
          ['После консультации']
        ]
      }
    ]
  }
};
const estimatorPageKey = location.pathname.includes('/pristroyki/')
  ? 'extensions'
  : location.pathname.includes('/zamena-vencov/')
    ? 'crowns'
    : 'roof';
const estimatorPreset = estimatorQuestionPresets[estimatorPageKey];
const estimatorQuestions = estimatorPreset.questions;
const estimatorTotalSteps = estimatorQuestions.length + 1;

function isManagedLeadForm(form) {
  return form instanceof HTMLFormElement
    && (form.classList.contains('lead-form') || form.classList.contains('quiz-form') || form.classList.contains('estimator-quiz'));
}

document.addEventListener(
  'submit',
  (event) => {
    if (isManagedLeadForm(event.target)) event.preventDefault();
  },
  true
);

const galleryState = {
  images: [],
  title: '',
  imageIndex: 0
};

menuToggle?.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('is-open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
});

document.querySelectorAll('.nav a').forEach((link) => {
  link.addEventListener('click', () => {
    nav.classList.remove('is-open');
    menuToggle?.setAttribute('aria-expanded', 'false');
    menuToggle?.setAttribute('aria-label', 'Открыть меню');
  });
});

document.querySelectorAll('[data-roof-price]').forEach((block) => {
  const toggle = block.querySelector('[data-roof-price-toggle]');
  const toggleText = toggle?.querySelector('span');
  if (!toggle || !toggleText) return;

  toggle.addEventListener('click', () => {
    const isExpanded = block.classList.toggle('is-expanded');
    toggle.setAttribute('aria-expanded', String(isExpanded));
    toggleText.textContent = 'Развернуть';
  });
});

document.querySelector('[data-cases-show-all]')?.addEventListener('click', (event) => {
  const button = event.currentTarget;
  if (!(button instanceof HTMLButtonElement)) return;

  const section = button.closest('.cases-section');
  section?.classList.add('is-cases-expanded');
  button.hidden = true;
});

document.querySelectorAll('.faq-list').forEach((list) => {
  list.querySelectorAll('.faq-item').forEach((item) => {
    item.addEventListener('toggle', () => {
      if (!item.open) return;
      list.querySelectorAll('.faq-item[open]').forEach((openItem) => {
        if (openItem !== item) openItem.open = false;
      });
    });
  });
});

function onlyPhoneDigits(value) {
  let digits = value.replace(/\D/g, '');
  if (digits.startsWith('7') || digits.startsWith('8')) digits = digits.slice(1);
  return digits.slice(0, 10);
}

function formatPhone(value) {
  const digits = onlyPhoneDigits(value);
  if (!digits) return '';
  let formatted = '+7 ';
  if (digits.length) formatted += `(${digits.slice(0, 3)}`;
  if (digits.length >= 3) formatted += ')';
  if (digits.length > 3) formatted += ` ${digits.slice(3, 6)}`;
  if (digits.length > 6) formatted += `-${digits.slice(6, 8)}`;
  if (digits.length > 8) formatted += `-${digits.slice(8, 10)}`;
  return formatted;
}

function bindPhoneInput(input) {
  input.placeholder = phoneTemplate;
  input.addEventListener('input', () => {
    input.value = formatPhone(input.value);
  });
  input.addEventListener('blur', () => {
    if (!onlyPhoneDigits(input.value)) input.value = '';
  });
}

document.querySelectorAll('input[type="tel"]').forEach(bindPhoneInput);

function updateQuizStep() {
  quizSteps.forEach((step, index) => {
    step.classList.toggle('is-active', index + 1 === currentStep);
  });

  if (!quizPrev || !quizNext || !quizProgress || !quizForm) return;
  quizPrev.disabled = currentStep === 1;
  quizNext.disabled = currentStep >= 4 || !quizForm.elements[`quiz_step_${currentStep}`]?.value;
  quizNext.hidden = currentStep === 4;
  quizPrev.hidden = currentStep === 4;
  quizProgress.textContent = `${currentStep} / 4`;
}

function closeModalAnimated(dialog) {
  if (!dialog?.open || dialog.classList.contains('is-closing')) return;
  dialog.classList.add('is-closing');
  setTimeout(() => {
    dialog.close();
    dialog.classList.remove('is-closing');
  }, modalCloseDelay);
}

function resetFormSubmitState(form) {
  form?.classList.remove('is-submitting', 'is-submitted', 'is-submit-error');
  const status = form?.querySelector('.form-status');
  if (status) status.textContent = '';
  const submit = form?.querySelector('button[type="submit"]');
  if (submit instanceof HTMLButtonElement) {
    submit.disabled = false;
    submit.textContent = submit.dataset.initialText || submit.textContent;
  }
}

function getFileUploadBox(input) {
  return input.closest('.photo-estimate-upload')?.querySelector('.photo-estimate-upload__box')
    || input.closest('.file-field')?.querySelector('.file-field__box');
}

function clearFilePreview(input) {
  const box = getFileUploadBox(input);
  const preview = box?.querySelector('.upload-preview');
  if (!preview) return;

  preview.querySelectorAll('[data-preview-url]').forEach((item) => {
    URL.revokeObjectURL(item.getAttribute('data-preview-url'));
  });
  preview.remove();
}

function updateFilePreview(input) {
  clearFilePreview(input);

  const files = Array.from(input.files || []);
  const box = getFileUploadBox(input);
  if (!box || !files.length) return;

  const preview = document.createElement('span');
  preview.className = 'upload-preview';
  preview.innerHTML = `<strong class="upload-preview__status">Загружено: ${files.length}</strong>`;

  const list = document.createElement('span');
  list.className = 'upload-preview__list';

  files.slice(0, 6).forEach((file) => {
    const item = document.createElement('span');
    item.className = 'upload-preview__item';

    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      item.dataset.previewUrl = url;
      item.style.backgroundImage = `url("${url}")`;
    } else {
      item.classList.add('upload-preview__item--file');
      item.textContent = file.name.split('.').pop()?.slice(0, 4).toUpperCase() || 'FILE';
    }

    list.append(item);
  });

  if (files.length > 6) {
    const more = document.createElement('span');
    more.className = 'upload-preview__item upload-preview__item--more';
    more.textContent = `+${files.length - 6}`;
    list.append(more);
  }

  preview.append(list);
  box.append(preview);
}

function bindFileInput(input) {
  input.addEventListener('change', () => updateFilePreview(input));
}

function openQuiz(topic, trigger) {
  quizModal.showModal();
  quizForm.reset();
  quizForm.querySelectorAll('input[type="file"]').forEach(clearFilePreview);
  resetFormSubmitState(quizForm);
  quizForm.request_title.value = topic;
  if (quizTopicLabel) quizTopicLabel.textContent = `Тема: ${topic}`;
  const normalizedTopic = topic.toLowerCase();
  const target = normalizedTopic.includes('материал')
    ? 'крыши и желаемого покрытия'
    : normalizedTopic.includes('замер')
      ? 'дома и текущей кровли'
      : normalizedTopic.includes('обследование')
        ? 'крыши, чердака и старого покрытия'
        : 'крыши';

  if (quizTitle) quizTitle.textContent = trigger?.dataset.quizTitle || (normalizedTopic.includes('фото') ? 'Получить расчёт по фото' : 'Получить расчёт кровли');
  if (quizFileLabel) quizFileLabel.textContent = `Фото ${target}`;
  if (quizFileTitle) quizFileTitle.textContent = `Прикрепите фото ${target}`;
  if (quizFileHint) quizFileHint.textContent = 'Можно загрузить несколько файлов: JPG или PNG';
}

function setEstimatorAnswer(name, value) {
  if (!estimatorQuiz) return;
  let input = estimatorQuiz.querySelector(`input[type="hidden"][name="${name}"]`);
  if (!input) {
    input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    estimatorQuiz.append(input);
  }
  input.value = value;
}

function formatEstimatorOptionLabel(label) {
  return label.replace('Металлочерепица', 'Металло&shy;черепица');
}

function renderEstimatorStep() {
  if (!estimatorQuiz || !estimatorOptions || !estimatorStepLabel || !estimatorTitle || !estimatorNext) return;

  estimatorIsFinalStep = false;
  const question = estimatorQuestions[estimatorCurrentStep];
  const stepNumber = estimatorCurrentStep + 1;
  const savedValue = estimatorQuiz.querySelector(`input[type="hidden"][name="${question.name}"]`)?.value;

  estimatorStepLabel.textContent = `Вопрос ${stepNumber} из ${estimatorTotalSteps}`;
  estimatorTitle.textContent = question.title;
  if (estimatorProgress) estimatorProgress.style.width = `${(stepNumber / estimatorTotalSteps) * 100}%`;
  if (estimatorPrev) estimatorPrev.disabled = estimatorCurrentStep === 0;
  estimatorPrev.hidden = false;
  estimatorNext.type = 'button';
  estimatorNext.classList.remove('estimator-quiz__submit', 'btn--photo');
  estimatorNext.textContent = estimatorCurrentStep === estimatorQuestions.length - 1 ? 'Перейти к заявке' : 'Следующий вопрос';

  estimatorOptions.innerHTML = question.options.map(([label, image], index) => {
    const checked = savedValue ? savedValue === label : index === 0 && estimatorCurrentStep === 0;
    const displayLabel = formatEstimatorOptionLabel(label);
    return `
      <label class="estimator-option${image ? '' : ' estimator-option--text'}">
        <input type="radio" name="${question.name}_choice" value="${label}"${checked ? ' checked' : ''} />
        ${image ? `<img src="${image}" alt="" />` : ''}
        <span>${displayLabel}</span>
      </label>
    `;
  }).join('');

  const checkedInput = estimatorOptions.querySelector('input[type="radio"]:checked');
  if (checkedInput) setEstimatorAnswer(question.name, checkedInput.value);
}

function renderEstimatorLeadStep() {
  if (!estimatorQuiz || !estimatorOptions || !estimatorStepLabel || !estimatorTitle || !estimatorNext) return;

  estimatorIsFinalStep = true;
  estimatorStepLabel.textContent = `Вопрос ${estimatorTotalSteps} из ${estimatorTotalSteps}`;
  estimatorTitle.textContent = estimatorPreset.leadHeading;
  if (estimatorProgress) estimatorProgress.style.width = '100%';
  if (estimatorPrev) {
    estimatorPrev.disabled = false;
    estimatorPrev.hidden = false;
  }

  estimatorOptions.innerHTML = `
    <div class="estimator-lead">
      <input type="hidden" name="request_title" value="${estimatorPreset.leadTitle}" />
      <label>
        <span>Имя</span>
        <input name="name" type="text" placeholder="Как к вам обращаться" autocomplete="name" />
      </label>
      <label>
        <span>Телефон</span>
        <input name="phone" type="tel" placeholder="+7 (___) ___-__-__" autocomplete="tel" required />
      </label>
      <label class="file-field">
        <span>${estimatorPreset.fileLabel}</span>
        <span class="file-field__box">
          <span class="file-field__body">
            <strong>${estimatorPreset.fileTitle}</strong>
            <small>${estimatorPreset.fileHint}</small>
            <em>Выбрать файлы</em>
          </span>
        </span>
        <input name="photos[]" type="file" accept="image/*" multiple />
      </label>
      <label class="policy-check">
        <input type="checkbox" name="policy" required />
        <span>Согласен на обработку персональных данных и принимаю <a href="/politika-konfidentsialnosti/">политику конфиденциальности</a>.</span>
      </label>
    </div>
  `;

  estimatorOptions.querySelectorAll('input[type="tel"]').forEach(bindPhoneInput);
  estimatorOptions.querySelectorAll('input[type="file"]').forEach(bindFileInput);
  estimatorNext.type = 'submit';
  estimatorNext.classList.add('estimator-quiz__submit', 'btn--photo');
  estimatorNext.textContent = estimatorPreset.submitText;
}

function goToNextEstimatorStep() {
  if (!estimatorQuiz) return;
  window.clearTimeout(estimatorAutoNextTimer);
  if (estimatorIsFinalStep) return;

  const currentQuestion = estimatorQuestions[estimatorCurrentStep];
  const checkedInput = estimatorOptions?.querySelector('input[type="radio"]:checked');
  if (currentQuestion && checkedInput instanceof HTMLInputElement) {
    setEstimatorAnswer(currentQuestion.name, checkedInput.value);
  }

  if (estimatorCurrentStep < estimatorQuestions.length - 1) {
    estimatorCurrentStep += 1;
    renderEstimatorStep();
    return;
  }

  renderEstimatorLeadStep();
}

document.querySelectorAll('[data-quiz-topic]').forEach((button) => {
  button.addEventListener('click', () => openQuiz(button.dataset.quizTopic, button));
});

function openQuickPhoneModal() {
  quickPhoneModal?.showModal();
  const form = quickPhoneModal?.querySelector('form');
  if (form instanceof HTMLFormElement) {
    form.reset();
    resetFormSubmitState(form);
  }
}

function closeQuickPhoneModal() {
  if (quickPhoneModal?.open) closeModalAnimated(quickPhoneModal);
}

document.querySelectorAll('[data-quick-phone-modal]').forEach((button) => {
  button.addEventListener('click', openQuickPhoneModal);
});

quickPhoneModal?.querySelector('.quiz-modal__close')?.addEventListener('click', closeQuickPhoneModal);
quickPhoneModal?.addEventListener('click', (event) => {
  if (event.target === quickPhoneModal) closeQuickPhoneModal();
});
quickPhoneModal?.addEventListener('cancel', (event) => {
  event.preventDefault();
  closeQuickPhoneModal();
});

estimatorOptions?.addEventListener('change', (event) => {
  const input = event.target;
  if (!(input instanceof HTMLInputElement) || input.type !== 'radio') return;

  const question = estimatorQuestions[estimatorCurrentStep];
  setEstimatorAnswer(question.name, input.value);
  window.clearTimeout(estimatorAutoNextTimer);

  estimatorAutoNextTimer = window.setTimeout(goToNextEstimatorStep, 300);
});

estimatorNext?.addEventListener('click', goToNextEstimatorStep);

estimatorPrev?.addEventListener('click', () => {
  window.clearTimeout(estimatorAutoNextTimer);
  if (estimatorIsFinalStep) {
    renderEstimatorStep();
    return;
  }
  if (estimatorCurrentStep <= 0) return;
  estimatorCurrentStep -= 1;
  renderEstimatorStep();
});

renderEstimatorStep();

document.querySelectorAll('.quiz-option').forEach((button) => {
  button.addEventListener('click', () => {
    const { field, value } = button.dataset;
    quizForm.elements[field].value = value;
    button.closest('.quiz-options')?.querySelectorAll('.quiz-option').forEach((item) => item.classList.remove('is-selected'));
    button.classList.add('is-selected');
    if (currentStep < 4) {
      quizNext.disabled = false;
    }
  });
});

quizNext?.addEventListener('click', () => {
  if (currentStep < 4) {
    currentStep += 1;
    updateQuizStep();
  }
});

quizPrev?.addEventListener('click', () => {
  if (currentStep > 1) {
    currentStep -= 1;
    updateQuizStep();
  }
});

function closeQuiz() {
  if (quizModal?.open) closeModalAnimated(quizModal);
}

quizModal?.querySelector('.quiz-modal__close')?.addEventListener('click', closeQuiz);
quizModal?.addEventListener('click', (event) => {
  if (event.target === quizModal) closeQuiz();
});
quizModal?.addEventListener('cancel', (event) => {
  event.preventDefault();
  closeQuiz();
});

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

function setReviewTextDisclosureState(card, isOpen) {
  card.classList.toggle('is-review-open', isOpen);
  card.querySelector('.review-card__toggle')?.setAttribute('aria-expanded', String(isOpen));
}

function setupReviewTextDisclosures() {
  document.querySelectorAll('.reviews-section .review-card').forEach((card) => {
    const text = card.querySelector('p');
    if (!text) return;

    let toggle = card.querySelector('.review-card__toggle');
    if (!toggle) {
      toggle = document.createElement('button');
      toggle.className = 'review-card__toggle';
      toggle.type = 'button';
      toggle.setAttribute('aria-label', 'Показать отзыв полностью');
      toggle.setAttribute('aria-expanded', 'false');
      text.insertAdjacentElement('afterend', toggle);

      toggle.addEventListener('click', () => {
        if (!card.classList.contains('has-review-toggle')) return;
        const isOpen = card.classList.contains('is-review-open');
        setReviewTextDisclosureState(card, !isOpen);
        toggle.setAttribute('aria-label', isOpen ? 'Показать отзыв полностью' : 'Свернуть отзыв');
      });
    }

    if (!text.dataset.reviewDisclosureReady) {
      text.dataset.reviewDisclosureReady = 'true';
      text.addEventListener('click', () => {
        if (!card.classList.contains('has-review-toggle')) return;
        const isOpen = card.classList.contains('is-review-open');
        setReviewTextDisclosureState(card, !isOpen);
        toggle.setAttribute('aria-label', isOpen ? 'Показать отзыв полностью' : 'Свернуть отзыв');
      });
    }

    const wasOpen = card.classList.contains('is-review-open');
    card.classList.remove('has-review-toggle');
    const shouldCollapse = text.scrollHeight > 82;
    card.classList.toggle('has-review-toggle', shouldCollapse);
    setReviewTextDisclosureState(card, shouldCollapse && wasOpen);
    toggle.hidden = !shouldCollapse;
    toggle.setAttribute('aria-label', shouldCollapse && wasOpen ? 'Свернуть отзыв' : 'Показать отзыв полностью');
  });
}

setupReviewTextDisclosures();
window.addEventListener('resize', setupReviewTextDisclosures);
mobileReviewMedia.addEventListener('change', setupReviewTextDisclosures);

function setCaseBreakdownState(card, isOpen) {
  card.classList.toggle('is-case-breakdown-open', isOpen);
  card.querySelector('.case-card__breakdown-toggle')?.setAttribute('aria-expanded', String(isOpen));
}

function setupCaseBreakdownDisclosures() {
  document.querySelectorAll('.cases-section .case-card').forEach((card) => {
    const text = card.querySelector('.case-card__breakdown div:nth-child(4) strong');
    if (!text) return;

    let toggle = card.querySelector('.case-card__breakdown-toggle');
    if (!toggle) {
      toggle = document.createElement('button');
      toggle.className = 'case-card__breakdown-toggle';
      toggle.type = 'button';
      toggle.setAttribute('aria-label', 'Показать описание работ полностью');
      toggle.setAttribute('aria-expanded', 'false');
      text.insertAdjacentElement('afterend', toggle);

      toggle.addEventListener('click', () => {
        if (!mobileCaseWorkMedia.matches || !card.classList.contains('has-case-breakdown-toggle')) return;
        const isOpen = card.classList.contains('is-case-breakdown-open');
        setCaseBreakdownState(card, !isOpen);
        toggle.setAttribute('aria-label', isOpen ? 'Показать описание работ полностью' : 'Свернуть описание работ');
      });
    }

    if (!text.dataset.caseBreakdownReady) {
      text.dataset.caseBreakdownReady = 'true';
      text.addEventListener('click', () => {
        if (!mobileCaseWorkMedia.matches || !card.classList.contains('has-case-breakdown-toggle')) return;
        const isOpen = card.classList.contains('is-case-breakdown-open');
        setCaseBreakdownState(card, !isOpen);
        toggle.setAttribute('aria-label', isOpen ? 'Показать описание работ полностью' : 'Свернуть описание работ');
      });
    }

    if (mobileCaseWorkMedia.matches) {
      card.classList.remove('has-case-breakdown-toggle', 'is-case-breakdown-open');
      const shouldCollapse = text.scrollHeight > 58;
      card.classList.toggle('has-case-breakdown-toggle', shouldCollapse);
      setCaseBreakdownState(card, false);
      toggle.hidden = !shouldCollapse;
    } else {
      card.classList.remove('has-case-breakdown-toggle', 'is-case-breakdown-open');
      toggle.hidden = true;
      toggle.removeAttribute('aria-expanded');
    }
  });
}

setupCaseBreakdownDisclosures();
window.addEventListener('resize', setupCaseBreakdownDisclosures);
mobileCaseWorkMedia.addEventListener('change', setupCaseBreakdownDisclosures);

document.querySelectorAll('input[type="file"]').forEach(bindFileInput);

function renderGalleryModal() {
  if (!galleryModalContent) return;
  const image = galleryState.images[galleryState.imageIndex];
  if (!image) return;

  const hasMultipleImages = galleryState.images.length > 1;
  const formatGalleryBackground = (value) => String(value || '').replaceAll('"', "'");

  galleryModalContent.innerHTML = `
    <div class="gallery-lightbox">
      <h2 class="gallery-lightbox__title">${galleryState.title}</h2>
      <div class="gallery-lightbox__stage">
        <div class="gallery-lightbox__image" style="background-image:${formatGalleryBackground(image.image)}" aria-label="${image.title || galleryState.title}" role="img"></div>
        ${
          hasMultipleImages
            ? '<button class="gallery-lightbox__nav gallery-lightbox__nav--prev" type="button" data-gallery-modal-nav="prev" aria-label="Предыдущее фото"></button><button class="gallery-lightbox__nav gallery-lightbox__nav--next" type="button" data-gallery-modal-nav="next" aria-label="Следующее фото"></button>'
            : ''
        }
      </div>
      ${
        hasMultipleImages
          ? `<div class="gallery-lightbox__thumbs" aria-label="Фотографии кейса">
              ${galleryState.images.map((item, index) => `
                <button class="gallery-lightbox__thumb${index === galleryState.imageIndex ? ' is-active' : ''}" type="button" data-gallery-modal-thumb="${index}" aria-label="Открыть фото ${index + 1}">
                  <span style="background-image:${formatGalleryBackground(item.image)}"></span>
                </button>
              `).join('')}
            </div>`
          : ''
      }
    </div>
  `;
}

function moveGalleryModal(direction) {
  if (galleryState.images.length < 2) return;
  galleryState.imageIndex = (galleryState.imageIndex + direction + galleryState.images.length) % galleryState.images.length;
  renderGalleryModal();
}

function openGalleryModal(images, title, imageIndex = 0) {
  if (!galleryModal || !galleryModalContent || !images.length) return;
  galleryState.images = images;
  galleryState.title = title;
  galleryState.imageIndex = Math.max(0, Math.min(imageIndex, images.length - 1));
  renderGalleryModal();
  galleryModal.showModal();
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
  slider.style.setProperty('--case-card-image', item.image);

  const openButton = slider.querySelector('[data-case-slider-open]');
  if (openButton) {
    openButton.setAttribute('aria-label', `Открыть галерею: ${item.title || 'фото объекта'}`);
  }

  slider.closest('.case-card')?.querySelectorAll('[data-case-slider-thumb]').forEach((thumb, thumbIndex) => {
    thumb.classList.toggle('is-active', thumbIndex === safeIndex);
  });
}

document.querySelectorAll('[data-case-slider]').forEach((slider) => {
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
    openGalleryModal(items, title, Number(slider.dataset.caseSliderIndex || 0));
  });

  slider.closest('.case-card')?.querySelectorAll('[data-case-slider-thumb]').forEach((thumb) => {
    thumb.addEventListener('click', (event) => {
      event.preventDefault();
      const nextIndex = Number(thumb.getAttribute('data-case-slider-thumb'));
      if (Number.isFinite(nextIndex)) updateCaseSlider(slider, nextIndex);
    });
  });
});

galleryModalContent?.addEventListener('click', (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;

  const navButton = target.closest('[data-gallery-modal-nav]');
  if (navButton) {
    moveGalleryModal(navButton.getAttribute('data-gallery-modal-nav') === 'prev' ? -1 : 1);
    return;
  }

  const thumb = target.closest('[data-gallery-modal-thumb]');
  if (thumb) {
    const index = Number(thumb.getAttribute('data-gallery-modal-thumb'));
    if (Number.isFinite(index)) {
      galleryState.imageIndex = index;
      renderGalleryModal();
    }
  }
});

galleryModal?.querySelector('.modal-close')?.addEventListener('click', () => closeModalAnimated(galleryModal));
galleryModal?.addEventListener('click', (event) => {
  if (event.target === galleryModal) closeModalAnimated(galleryModal);
});
galleryModal?.addEventListener('cancel', (event) => {
  event.preventDefault();
  closeModalAnimated(galleryModal);
});
galleryModal?.addEventListener('close', () => {
  galleryState.images = [];
  galleryState.title = '';
  galleryState.imageIndex = 0;
  if (galleryModalContent) galleryModalContent.innerHTML = '';
});

document.addEventListener('keydown', (event) => {
  if (!galleryModal?.open) return;
  if (event.key === 'ArrowLeft') {
    event.preventDefault();
    moveGalleryModal(-1);
  }
  if (event.key === 'ArrowRight') {
    event.preventDefault();
    moveGalleryModal(1);
  }
});

async function sendForm(form) {
  if (isLocalSubmissionMode()) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return;
  }

  const formData = new FormData(form);
  formData.append('form_name', form.dataset.formName || 'Форма');
  formData.append('page_url', window.location.href);

  const response = await fetch('/mail.php', {
    method: 'POST',
    body: formData
  });

  const result = await response.json().catch(() => null);

  if (!response.ok || !result?.success) {
    throw new Error(result?.message || 'Не удалось отправить форму');
  }
}

function trackFormSubmitGoal(form) {
  if (typeof window.ym !== 'function') return;
  const goalId = form?.dataset.metrikaGoal || document.body?.dataset.metrikaFormGoal || defaultMetrikaFormGoalId;
  window.ym(111121162, 'reachGoal', goalId);
}

function isLocalSubmissionMode() {
  const { hostname, protocol, port } = window.location;
  return ['localhost', '127.0.0.1', ''].includes(hostname)
    || hostname.endsWith('.local')
    || /^192\.168\.|^10\.|^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)
    || protocol === 'file:'
    || ['5173', '4173'].includes(port);
}

function bindLeadForm(form) {
  let status = form.querySelector('.form-status');
  const submit = form.querySelector('button[type="submit"]');
  if (submit instanceof HTMLButtonElement && !submit.dataset.initialText) {
    submit.dataset.initialText = submit.textContent || '';
  }

  if (!status) {
    status = document.createElement('div');
    status.className = 'form-status';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    form.append(status);
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (submittingLeadForms.has(form)) return;

    submittingLeadForms.add(form);
    const submit = form.querySelector('button[type="submit"]');
    const initialText = submit?.textContent || '';
    form.classList.remove('is-submitted', 'is-submit-error');
    form.classList.add('is-submitting');
    status.textContent = 'Отправляем заявку...';

    if (submit) {
      submit.disabled = true;
      submit.textContent = 'Отправляем...';
    }

    try {
      const isLocalSubmit = isLocalSubmissionMode();
      await sendForm(form);
      trackFormSubmitGoal(form);
      if (!isLocalSubmit) {
        form.reset();
        form.querySelectorAll('input[type="file"]').forEach(clearFilePreview);
      }
      form.classList.remove('is-submitting', 'is-submit-error');
      form.classList.add('is-submitted');
      status.textContent = isLocalSubmit
        ? 'Локальная псевдо-отправка: success-состояние включено.'
        : 'Заявка отправлена. Мы свяжемся с вами в ближайшее время.';
      if (submit) submit.textContent = 'Отправлено';

      if (!isLocalSubmit) {
        if (form === quizForm) setTimeout(closeQuiz, 900);
        if (form.closest('#quickPhoneModal')) setTimeout(closeQuickPhoneModal, 900);
      }
    } catch (error) {
      form.classList.remove('is-submitting', 'is-submitted');
      form.classList.add('is-submit-error');
      status.textContent = error instanceof Error ? error.message : 'Ошибка отправки';
      if (submit) {
        submit.disabled = false;
        submit.textContent = error instanceof Error ? error.message : 'Ошибка отправки';
      }
      setTimeout(() => {
        if (submit) submit.textContent = initialText;
      }, 2400);
    } finally {
      submittingLeadForms.delete(form);
    }
  });
}

document.querySelectorAll('.lead-form, .quiz-form, .estimator-quiz').forEach(bindLeadForm);
updateQuizStep();
