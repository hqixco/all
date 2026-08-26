import './styles.css';

const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
const quizModal = document.querySelector('#quizModal');
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
const quizPreview = document.querySelector('[data-quiz-preview]');
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
const desktopNavDropdownMedia = window.matchMedia('(min-width: 921px)');
const modalCloseDelay = 160;
const pageType = document.body.dataset.page || 'roof-repair';
const isRoofReplacementPage = pageType === 'roof-replacement';
const metrikaFormGoalIdMap = {
  'roof-replacement': 'zamena_krovli',
  otmostki: 'otmostki',
  pristroyki: 'pristroyki'
};
const metrikaFormGoalId = metrikaFormGoalIdMap[pageType] || 'krovlya';

let currentStep = 1;
let estimatorAutoNextTimer;
let estimatorCurrentStep = 0;
let estimatorIsFinalStep = false;

const repairEstimatorQuestions = [
  {
    title: 'Что нужно сделать с кровлей?',
    name: 'roof_task',
    options: [
      ['Устранить протечку', '/assets/task-roof-leak.webp'],
      ['Заменить повреждённый участок', '/assets/task-damaged-roof.webp'],
      ['Починить примыкание', '/assets/task-pipe-window-leak.webp'],
      ['Проверить всю кровлю', '/assets/task-diagnostics.webp'],
      ['Заменить покрытие', '/assets/quiz-cover-replacement.webp'],
      ['Пока не знаю', '/assets/quiz-not-sure.webp']
    ]
  },
  {
    title: 'Какое покрытие сейчас на крыше?',
    name: 'roof_material',
    options: [
      ['Металлочерепица', '/assets/quiz-metal-tile.webp'],
      ['Профнастил', '/assets/quiz-profiled-sheet.webp'],
      ['Гибкая черепица', '/assets/quiz-flexible-shingles.webp'],
      ['Фальцевая кровля', '/assets/quiz-standing-seam.webp'],
      ['Другое покрытие', '/assets/photo-estimate-collage-center.webp'],
      ['Не знаю материал', '/assets/quiz-not-sure.webp']
    ]
  },
  {
    title: 'Какая примерная площадь кровли?',
    name: 'roof_area',
    options: [
      ['До 80 м²'],
      ['80-140 м²'],
      ['140-220 м²'],
      ['220-350 м²'],
      ['Больше 350 м²'],
      ['Не знаю площадь']
    ]
  },
  {
    title: 'Когда нужно начать работы?',
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
];
const replacementEstimatorQuestions = [
  {
    title: 'Что требуется сделать?',
    name: 'roof_project_type',
    options: [
      ['Полностью заменить старую кровлю', '/assets/quiz-full-roof-replacement.webp'],
      ['Заменить покрытие', '/assets/quiz-cover-replacement.webp'],
      ['Реконструировать крышу / изменить конструкцию', '/assets/quiz-insulation-base.webp'],
      ['Сделать новую крышу со стропилами', '/assets/quiz-pristroyki-roof.webp'],
      ['Пока не знаю, нужен осмотр', '/assets/quiz-not-sure.webp']
    ]
  },
  {
    title: 'Какой материал планируете?',
    name: 'roof_material',
    options: [
      ['Металлочерепица', '/assets/quiz-metal-tile.webp'],
      ['Профнастил', '/assets/quiz-profiled-sheet.webp'],
      ['Гибкая черепица', '/assets/quiz-flexible-shingles.webp'],
      ['Фальцевая кровля', '/assets/quiz-standing-seam.webp'],
      ['Другое покрытие', '/assets/photo-estimate-collage-center.webp'],
      ['Не знаю материал', '/assets/quiz-not-sure.webp']
    ]
  },
  {
    title: 'Какая примерная площадь кровли?',
    name: 'roof_area',
    options: [
      ['До 80 м²'],
      ['80–140 м²'],
      ['140–220 м²'],
      ['220+ м²'],
      ['Не знаю площадь']
    ]
  },
  {
    title: 'В каком состоянии основание и стропила?',
    name: 'roof_structure_condition',
    options: [
      ['В хорошем состоянии, меняем покрытие'],
      ['Нужна частичная замена обрешётки или мембран'],
      ['Нужно усиление или замена стропил'],
      ['Не знаю, нужен осмотр']
    ]
  },
  {
    title: 'Когда планируете начать работы?',
    name: 'start_time',
    options: [
      ['В ближайший месяц'],
      ['Через 1–2 месяца'],
      ['В этом сезоне'],
      ['Планирую заранее'],
      ['Пока не определился']
    ]
  }
];
const otmostkiEstimatorQuestions = [
  {
    title: 'Какая отмостка вам нужна?',
    name: 'blind_area_task',
    options: [
      ['Новая бетонная отмостка', '/assets/quiz-otmostki-beton.webp'],
      ['Утеплённая отмостка', '/assets/quiz-otmostki-insulated.webp'],
      ['Ремонт старой отмостки', '/assets/quiz-otmostki-repair.webp'],
      ['Отмостка с водоотводом', '/assets/quiz-otmostki-drainage.webp'],
      ['Пока не знаю', '/assets/quiz-otmostki-unsure.webp']
    ]
  },
  {
    title: 'Что сейчас вокруг дома?',
    name: 'blind_area_condition',
    options: [
      ['Грунт без отмостки', '/assets/quiz-otmostki-ground.webp'],
      ['Старая бетонная отмостка', '/assets/quiz-otmostki-old-concrete.webp'],
      ['Плитка или брусчатка', '/assets/quiz-otmostki-pavers.webp'],
      ['Есть трещины и просадки', '/assets/quiz-otmostki-cracks.webp'],
      ['Проблемы с водой', '/assets/quiz-otmostki-water.webp'],
      ['Покажу на фото', '/assets/quiz-otmostki-photo.webp']
    ]
  },
  {
    title: 'Какой примерный периметр?',
    name: 'blind_area_length',
    options: [
      ['До 25 пог. м'],
      ['25-40 пог. м'],
      ['40-60 пог. м'],
      ['60-90 пог. м'],
      ['Больше 90 пог. м'],
      ['Не знаю периметр']
    ]
  },
  {
    title: 'Когда нужно начать работы?',
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
];
const pristroykiEstimatorQuestions = [
  {
    title: 'Какая пристройка вам нужна?',
    name: 'extension_task',
    options: [
      ['Каркасная пристройка', '/assets/quiz-pristroyki-frame.webp'],
      ['Веранда или терраса', '/assets/quiz-pristroyki-veranda.webp'],
      ['Тёплая пристройка', '/assets/quiz-pristroyki-warm.webp'],
      ['Кровля пристройки', '/assets/quiz-pristroyki-roof.webp'],
      ['Пока не знаю', '/assets/quiz-pristroyki-unsure.webp']
    ]
  },
  {
    title: 'Для чего нужна пристройка?',
    name: 'extension_purpose',
    options: [
      ['Жилая комната', '/assets/quiz-pristroyki-purpose-living.webp'],
      ['Тамбур или входная группа', '/assets/quiz-pristroyki-purpose-entry.webp'],
      ['Веранда для отдыха', '/assets/quiz-pristroyki-purpose-veranda.webp'],
      ['Хозяйственное помещение', '/assets/quiz-pristroyki-purpose-utility.webp'],
      ['Мастерская', '/assets/quiz-pristroyki-purpose-workshop.webp'],
      ['Пока обсуждаю варианты', '/assets/quiz-pristroyki-purpose-unsure.webp']
    ]
  },
  {
    title: 'Какая примерная площадь?',
    name: 'extension_area',
    options: [
      ['До 10 м²', '/assets/quiz-pristroyki-area-10.webp'],
      ['10-18 м²', '/assets/quiz-pristroyki-area-10-18.webp'],
      ['18-30 м²', '/assets/quiz-pristroyki-area-18-30.webp'],
      ['30-50 м²', '/assets/quiz-pristroyki-area-30-50.webp'],
      ['Больше 50 м²', '/assets/quiz-pristroyki-area-over-50.webp'],
      ['Не знаю площадь', '/assets/quiz-pristroyki-area-unknown.webp']
    ]
  },
  {
    title: 'Что важно предусмотреть?',
    name: 'extension_scope',
    options: [
      ['Фундамент', '/assets/quiz-pristroyki-scope-foundation.webp'],
      ['Утепление', '/assets/quiz-pristroyki-scope-insulation.webp'],
      ['Окна и двери', '/assets/quiz-pristroyki-scope-windows.webp'],
      ['Кровля и водосток', '/assets/quiz-pristroyki-scope-roof-drain.webp'],
      ['Наружная отделка', '/assets/quiz-pristroyki-scope-exterior.webp'],
      ['Нужна консультация', '/assets/quiz-pristroyki-scope-consultation.webp']
    ]
  },
  {
    title: 'Когда нужно начать работы?',
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
];
const estimatorQuestionSets = {
  'roof-replacement': replacementEstimatorQuestions,
  otmostki: otmostkiEstimatorQuestions,
  pristroyki: pristroykiEstimatorQuestions
};
const estimatorQuestions = estimatorQuestionSets[pageType] || repairEstimatorQuestions;
const estimatorTotalSteps = estimatorQuestions.length + 1;

if (isRoofReplacementPage || pageType === 'otmostki' || pageType === 'pristroyki') {
  const estimatorSection = document.querySelector('#quiz');
  const casesSection = document.querySelector('#cases');
  if (estimatorSection && casesSection) estimatorSection.after(casesSection);
}

const heroSection = document.querySelector('.hero');
const heroTrust = heroSection?.querySelector('.hero__trust');
if (heroSection && heroTrust) heroSection.after(heroTrust);

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
});

document.querySelectorAll('.nav a').forEach((link) => {
  link.addEventListener('click', () => {
    nav.classList.remove('is-open');
    menuToggle?.setAttribute('aria-expanded', 'false');
  });
});

document.querySelectorAll('.nav-dropdown').forEach((dropdown) => {
  if (!(dropdown instanceof HTMLDetailsElement)) return;

  dropdown.addEventListener('mouseenter', () => {
    if (desktopNavDropdownMedia.matches) dropdown.open = true;
  });

  dropdown.addEventListener('mouseleave', () => {
    if (desktopNavDropdownMedia.matches) dropdown.open = false;
  });
});

document.addEventListener('click', (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;

  document.querySelectorAll('.nav-dropdown[open]').forEach((dropdown) => {
    if (!(dropdown instanceof HTMLDetailsElement) || dropdown.contains(target)) return;
    dropdown.open = false;
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

function bindVideoPreviewPlayback() {
  const stages = Array.from(document.querySelectorAll('.video-preview-card__stage'));
  if (!stages.length) return;

  const pauseOtherVideos = (activeVideo) => {
    document.querySelectorAll('.video-preview-card__image').forEach((media) => {
      if (!(media instanceof HTMLVideoElement) || media === activeVideo) return;

      media.pause();
      media.controls = false;
      media.closest('.video-preview-card__stage')?.classList.remove('is-playing');
    });
  };

  stages.forEach((stage) => {
    const video = stage.querySelector('.video-preview-card__image');
    const playButton = stage.querySelector('.video-preview-card__play');

    if (!(video instanceof HTMLVideoElement) || !(playButton instanceof HTMLButtonElement)) return;

    playButton.addEventListener('click', async (event) => {
      event.preventDefault();
      pauseOtherVideos(video);
      video.controls = true;
      video.muted = true;
      video.playsInline = true;

      try {
        await video.play();
        stage.classList.add('is-playing');
      } catch {
        video.controls = false;
        stage.classList.remove('is-playing');
      }
    });

    video.addEventListener('pause', () => {
      video.controls = false;
      stage.classList.remove('is-playing');
    });

    video.addEventListener('ended', () => {
      video.controls = false;
      stage.classList.remove('is-playing');
    });
  });
}

bindVideoPreviewPlayback();

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
  const taskImage = trigger?.closest('.task-card')?.querySelector('.task-card__image');
  if (quizPreview && taskImage instanceof HTMLImageElement) {
    quizPreview.src = taskImage.currentSrc || taskImage.src;
    quizPreview.alt = taskImage.alt || topic;
    quizPreview.hidden = false;
  } else if (quizPreview) {
    quizPreview.hidden = true;
    quizPreview.removeAttribute('src');
    quizPreview.alt = '';
  }
  const normalizedTopic = topic.toLowerCase();
  let target = 'кровли';
  if (pageType === 'otmostki') {
    target = normalizedTopic.includes('водоотвод')
      ? 'водоотвода и уклонов'
      : normalizedTopic.includes('ремонт')
        ? 'старой отмостки'
        : 'участка вокруг дома';
  } else if (pageType === 'pristroyki') {
    target = normalizedTopic.includes('кровл')
      ? 'кровли и примыкания пристройки'
      : normalizedTopic.includes('веранд') || normalizedTopic.includes('террас')
        ? 'места под веранду или террасу'
        : 'дома и места пристройки';
  } else if (isRoofReplacementPage) {
    target = normalizedTopic.includes('основан')
      ? 'основания кровли'
      : normalizedTopic.includes('покрыт')
        ? 'старого покрытия'
        : normalizedTopic.includes('водост')
          ? 'доборных элементов и водостока'
          : 'старой кровли';
  } else {
    target = normalizedTopic.includes('места протечки')
      ? 'места протечки'
      : normalizedTopic.includes('примыкания')
        ? 'примыкания'
        : normalizedTopic.includes('покрытия')
          ? 'повреждённого покрытия'
          : normalizedTopic.includes('ендов')
            ? 'ендовы'
            : 'кровли';
  }

  if (quizTitle) quizTitle.textContent = topic;
  if (quizFileLabel) quizFileLabel.textContent = `Фото или видео ${target}`;
  if (quizFileTitle) quizFileTitle.textContent = `Прикрепите фото ${target}`;
  if (quizFileHint) quizFileHint.textContent = 'Можно загрузить несколько файлов: JPG, PNG, MP4';
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

function getEstimatorLeadCopy() {
  if (pageType === 'roof-replacement') {
    return {
      title: 'Получите расчёт замены кровли',
      request: 'Квиз расчёта замены кровли',
      fileLabel: 'Фото старой кровли',
      fileTitle: 'Прикрепите фото старой кровли',
      fileHint: 'Можно загрузить общий вид, покрытие, примыкания и основание'
    };
  }

  if (pageType === 'otmostki') {
    return {
      title: 'Получите расчёт отмостки',
      request: 'Квиз расчёта отмостки',
      fileLabel: 'Фото участка вокруг дома',
      fileTitle: 'Прикрепите фото участка и цоколя',
      fileHint: 'Можно загрузить общий вид дома, старую отмостку, грунт и водоотвод'
    };
  }

  if (pageType === 'pristroyki') {
    return {
      title: 'Получите расчёт пристройки',
      request: 'Квиз расчёта пристройки',
      fileLabel: 'Фото дома и места пристройки',
      fileTitle: 'Прикрепите фото дома и участка',
      fileHint: 'Можно загрузить фасад, место примыкания, участок и желаемые размеры'
    };
  }

  return {
    title: 'Получите предварительный расчёт',
    request: 'Квиз расчёта ремонта кровли',
    fileLabel: 'Фото кровли',
    fileTitle: 'Прикрепите фото кровли',
    fileHint: 'Можно загрузить общий вид крыши, протечку или проблемный узел'
  };
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
  if (estimatorPrev) {
    estimatorPrev.disabled = estimatorCurrentStep === 0;
    estimatorPrev.hidden = false;
  }
  estimatorNext.type = 'button';
  estimatorNext.classList.remove('estimator-quiz__submit', 'btn--photo');
  estimatorNext.textContent = estimatorCurrentStep === estimatorQuestions.length - 1 ? 'Перейти к расчету' : 'Следующий вопрос';

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
  const leadCopy = getEstimatorLeadCopy();
  estimatorStepLabel.textContent = `Вопрос ${estimatorTotalSteps} из ${estimatorTotalSteps}`;
  estimatorTitle.textContent = leadCopy.title;
  if (estimatorProgress) estimatorProgress.style.width = '100%';
  if (estimatorPrev) {
    estimatorPrev.disabled = false;
    estimatorPrev.hidden = false;
  }

  estimatorOptions.innerHTML = `
    <div class="estimator-lead">
      <input type="hidden" name="request_title" value="${leadCopy.request}" />
      <label>
        <span>Имя</span>
        <input name="name" type="text" placeholder="Как к вам обращаться" autocomplete="name" />
      </label>
      <label>
        <span>Телефон</span>
        <input name="phone" type="tel" placeholder="+7 (___) ___-__-__" autocomplete="tel" required />
      </label>
      <label class="file-field">
        <span>${leadCopy.fileLabel}</span>
        <span class="file-field__box">
          <span class="file-field__body">
            <strong>${leadCopy.fileTitle}</strong>
            <small>${leadCopy.fileHint}</small>
            <em>Выбрать файлы</em>
          </span>
        </span>
        <input name="photos[]" type="file" accept="image/*,video/mp4" multiple />
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
  estimatorNext.textContent = 'Получить расчёт';
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
        if (!mobileReviewMedia.matches) return;
        const isOpen = card.classList.contains('is-review-open');
        setReviewTextDisclosureState(card, !isOpen);
        toggle.setAttribute('aria-label', isOpen ? 'Показать отзыв полностью' : 'Свернуть отзыв');
      });
    }

    if (!text.dataset.reviewDisclosureReady) {
      text.dataset.reviewDisclosureReady = 'true';
      text.addEventListener('click', () => {
        if (!mobileReviewMedia.matches || !card.classList.contains('has-review-toggle')) return;
        const isOpen = card.classList.contains('is-review-open');
        setReviewTextDisclosureState(card, !isOpen);
        toggle.setAttribute('aria-label', isOpen ? 'Показать отзыв полностью' : 'Свернуть отзыв');
      });
    }

    if (mobileReviewMedia.matches) {
      const shouldCollapse = text.scrollHeight > 82;
      card.classList.toggle('has-review-toggle', shouldCollapse);
      setReviewTextDisclosureState(card, false);
      toggle.hidden = !shouldCollapse;
    } else {
      card.classList.remove('has-review-toggle', 'is-review-open');
      toggle.hidden = true;
      toggle.removeAttribute('aria-expanded');
    }
  });
}

setupReviewTextDisclosures();
mobileReviewMedia.addEventListener('change', setupReviewTextDisclosures);

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
  if (pageType === 'pristroyki' && slider.dataset.caseSliderImages?.includes('case-pristroyki-frame-01')) {
    const items = parseCaseSliderItems(slider);
    if (items.length > 1) {
      slider.dataset.caseSliderImages = JSON.stringify([items[1], items[0], ...items.slice(2)]);
      const thumbs = Array.from(slider.closest('.case-card')?.querySelectorAll('[data-case-slider-thumb]') || []);
      if (thumbs.length > 1) {
        const firstThumb = thumbs[0];
        const secondThumb = thumbs[1];
        secondThumb.setAttribute('data-case-slider-thumb', '0');
        firstThumb.setAttribute('data-case-slider-thumb', '1');
        secondThumb.parentElement?.prepend(secondThumb);
      }
    }
    slider.dataset.caseSliderIndex = '0';
  }
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

document.querySelectorAll('.case-card__photo:not([data-case-slider])').forEach((photo) => {
  const card = photo.closest('.case-card');
  const image = getComputedStyle(photo).backgroundImage;
  if (!card || !image || image === 'none') return;

  photo.setAttribute('role', 'button');
  photo.setAttribute('tabindex', '0');
  const openPhoto = () => {
    const title = card.querySelector('.case-card__title')?.textContent?.trim() || 'Фотография объекта';
    openGalleryModal([{ title, image }], title);
  };

  photo.addEventListener('click', openPhoto);
  photo.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    openPhoto();
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
  window.ym(111036091, 'reachGoal', form.dataset.metrikaGoal || metrikaFormGoalId);
}

function isLocalSubmissionMode() {
  return ['localhost', '127.0.0.1', ''].includes(window.location.hostname) || window.location.protocol === 'file:';
}

function bindLeadForm(form) {
  let status = form.querySelector('.form-status');
  if (!status) {
    status = document.createElement('div');
    status.className = 'form-status';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    form.append(status);
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
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
      await sendForm(form);
      trackFormSubmitGoal(form);
      form.reset();
      form.querySelectorAll('input[type="file"]').forEach(clearFilePreview);
      form.classList.remove('is-submitting', 'is-submit-error');
      form.classList.add('is-submitted');
      status.textContent = 'Заявка отправлена. Мы свяжемся с вами в ближайшее время.';
      if (submit) submit.textContent = 'Отправлено';
      setTimeout(() => {
        if (submit) {
          submit.disabled = false;
          submit.textContent = 'Отправлено';
        }
      }, 1800);

      if (form === quizForm && !isLocalSubmissionMode()) {
        setTimeout(closeQuiz, 900);
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
    }
  });
}

document.querySelectorAll('.lead-form, .quiz-form, .estimator-quiz').forEach(bindLeadForm);
updateQuizStep();
renderEstimatorStep();
