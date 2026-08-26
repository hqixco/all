import './styles.css';

const caseAssetUrls = import.meta.glob('/src/assets/*.{webp,png,jpg,jpeg}', {
  eager: true,
  import: 'default',
  query: '?url',
});

const formatRub = new Intl.NumberFormat('ru-RU').format;

const areaInput = document.querySelector('#area');
const materialInput = document.querySelector('#material');
const baseInput = document.querySelector('#base');
const result = document.querySelector('#calc-result');
const meterResult = document.querySelector('#calc-meter');
const breakdown = document.querySelector('#calc-breakdown');
const forms = document.querySelectorAll('.lead-form, .estimator-quiz');
const YANDEX_METRIKA_ID = 111317038;
const YANDEX_METRIKA_FORM_GOAL = 'form_submit';
const submittingLeadForms = new WeakSet();
const siteHeader = document.querySelector('.site-header');
const nav = document.querySelector('.nav');
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelectorAll('a[href^="#"]:not([data-popup-open])');
const leadPopup = document.querySelector('#lead-popup');
const leadPopupOpeners = document.querySelectorAll('[data-popup-open]');
const leadPopupClosers = document.querySelectorAll('[data-popup-close]');
const leadPopupCloseDelay = 160;
const leadPopupTitle = document.querySelector('#lead-popup-title');
const leadPopupText = document.querySelector('#lead-popup-text');
const leadPopupSubmit = document.querySelector('#lead-popup-submit');
const defaultLeadPopupContent = {
  title: leadPopupTitle?.textContent || 'Получите расчет кровли',
  text: leadPopupText?.textContent || 'Оставьте телефон и коротко опишите задачу. Фото можно приложить сразу или отправить после звонка.',
  button: leadPopupSubmit?.textContent || 'Получить расчет кровли',
};
let leadPopupCloseTimer;
const estimatorQuiz = document.querySelector('.estimator-quiz');
const estimatorStepLabel = estimatorQuiz?.querySelector('.estimator-quiz__step');
const estimatorTitle = estimatorQuiz?.querySelector('h2');
const estimatorOptions = estimatorQuiz?.querySelector('.estimator-options');
const estimatorProgress = estimatorQuiz?.querySelector('.estimator-progress span');
const estimatorPrev = estimatorQuiz?.querySelector('.estimator-quiz__prev');
const estimatorNext = estimatorQuiz?.querySelector('.estimator-quiz__next');
const quizSummary = document.querySelector('#quiz-summary');
const crew = document.querySelector('.crew');
const crewCopy = document.querySelector('.crew__copy');
const crewPhoto = document.querySelector('.crew__photo');
const mobileReviewMedia = window.matchMedia('(max-width: 480px)');
const mobileCaseMedia = window.matchMedia('(max-width: 480px)');
let estimatorCurrentStep = 0;
let estimatorAutoNextTimer;
let estimatorIsFinalStep = false;

function closeNavMenu() {
  if (!siteHeader || !navToggle) return;
  siteHeader.classList.remove('is-nav-open');
  navToggle.setAttribute('aria-expanded', 'false');
  navToggle.setAttribute('aria-label', 'Открыть меню');
}

function openNavMenu() {
  if (!siteHeader || !navToggle) return;
  siteHeader.classList.add('is-nav-open');
  navToggle.setAttribute('aria-expanded', 'true');
  navToggle.setAttribute('aria-label', 'Закрыть меню');
}

function syncNavMenu() {
  if (window.innerWidth > 900) {
    closeNavMenu();
  }
}

const estimatorQuestions = [
  {
    title: 'Что необходимо сделать?',
    name: 'replacement_scope',
    summary: {
      'Полная замена кровли': 'Проверю покрытие, основание и стропила, чтобы разделить обязательные работы и то, что можно сохранить.',
      'Замена покрытия': 'Если основание исправно, считаем замену покрытия без лишней реконструкции.',
      'Ремонт кровли': 'По фото определю, достаточно ли локального ремонта или есть риск скрытых повреждений.',
      'Водостоки и доборы': 'Посмотрю примыкания, планки и водоотвод, чтобы понять объем точечных работ.',
      'Утепление и основание': 'Оценю, нужно ли менять пирог кровли, мембраны и обрешетку.',
      'Пока не знаю': 'По фотографиям подскажу ближайший вариант: ремонт, покрытие или полная замена.'
    },
    options: [
      ['Полная замена кровли', '/quiz-assets/quiz-full-roof-replacement.webp'],
      ['Замена покрытия', '/quiz-assets/quiz-cover-replacement.webp'],
      ['Ремонт кровли', '/quiz-assets/task-pipe-window-leak.webp'],
      ['Водостоки и доборы', '/quiz-assets/quiz-gutters-flashing.webp'],
      ['Утепление и основание', '/quiz-assets/quiz-insulation-base.webp'],
      ['Пока не знаю', '/quiz-assets/quiz-not-sure.webp']
    ]
  },
  {
    title: 'Какое покрытие рассматриваете?',
    name: 'roof_material',
    options: [
      ['Металлочерепица', '/quiz-assets/quiz-metal-tile.webp'],
      ['Шифер', '/quiz-assets/quiz-material-shifer.webp'],
      ['Профнастил', '/quiz-assets/quiz-profiled-sheet.webp'],
      ['Гибкая черепица', '/quiz-assets/quiz-flexible-shingles.webp'],
      ['Фальцевая кровля', '/quiz-assets/quiz-standing-seam.webp'],
      ['Нужна консультация', '/quiz-assets/quiz-not-sure.webp'],
      ['Материал уже куплен', '/quiz-assets/quiz-material-purchased.webp']
    ]
  },
  {
    title: 'Какая примерная площадь кровли?',
    name: 'roof_area',
    options: [
      ['До 80 м²', '/quiz-assets/quiz-area-up-to-80.webp'],
      ['80-140 м²', '/quiz-assets/quiz-area-80-140.webp'],
      ['140-220 м²', '/quiz-assets/quiz-area-140-220.webp'],
      ['220-350 м²', '/quiz-assets/quiz-area-220-350.webp'],
      ['Больше 350 м²', '/quiz-assets/quiz-area-over-350.webp'],
      ['Не знаю площадь', '/quiz-assets/quiz-area-unknown.webp']
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
];
const estimatorTotalSteps = estimatorQuestions.length + 1;

navToggle?.addEventListener('click', () => {
  if (siteHeader?.classList.contains('is-nav-open')) {
    closeNavMenu();
    return;
  }

  openNavMenu();
});

const materialRates = {
  shifer: { label: 'Шифер', material: 620, install: 680, extras: 280 },
  profnastil: { label: 'Профнастил', material: 800, install: 760, extras: 340 },
  metal: { label: 'Металлочерепица', material: 1050, install: 860, extras: 420 },
  soft: { label: 'Мягкая кровля', material: 1250, install: 1100, extras: 560 },
  falz: { label: 'Фальц', material: 1700, install: 1450, extras: 680 },
};

const baseRates = {
  cover: { base: 240, factor: 0.98, trash: 14000, gutter: 28000 },
  batten: { base: 650, factor: 1.03, trash: 18000, gutter: 32000 },
  rebuild: { base: 1900, factor: 1.1, trash: 32000, gutter: 48000 },
};

const groupMeta = {
  works: { title: 'Работы', note: 'Демонтаж, подготовка, монтаж' },
  materials: { title: 'Материалы', note: 'Покрытие, мембраны, доборы' },
  extras: { title: 'Дополнительно', note: 'Опции и услуги' },
};

const calcSelections = {
  works: {
    dismantling: true,
    basePrep: true,
    install: true,
  },
  materials: {
    covering: true,
    membranes: true,
    flashings: true,
  },
  extras: {
    gutter: false,
    trash: false,
    insulation: false,
    snow: false,
  },
};

function range(value, spread = 0.11, step = 10000) {
  const min = Math.max(step, Math.round((value * (1 - spread)) / step) * step);
  const max = Math.max(min + step, Math.round((value * (1 + spread)) / step) * step);
  return `${formatRub(min)}-${formatRub(max)} ₽`;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function updateEstimate() {
  if (!areaInput || !materialInput || !baseInput || !result || !meterResult || !breakdown) {
    return;
  }

  const area = clamp(Number(areaInput.value) || Number(areaInput.min) || 40, 40, 600);
  const material = materialRates[materialInput.value] || materialRates.metal;
  const base = baseRates[baseInput.value] || baseRates.batten;

  const groups = {
    works: [
      ['dismantling', 'Демонтаж', area * 300],
      ['basePrep', 'Подготовка основания', area * base.base],
      ['install', 'Монтаж покрытия', area * material.install],
    ],
    materials: [
      ['covering', 'Кровельное покрытие', area * material.material],
      ['membranes', 'Мембраны и пиломатериал', area * 340],
      ['flashings', 'Доборные элементы', area * material.extras],
    ],
    extras: [
      ['gutter', 'Нужен новый водосток', base.gutter],
      ['trash', 'Вывезти старое покрытие', base.trash],
      ['insulation', 'Требуется утепление', baseInput.value === 'rebuild' ? area * 520 : 0],
      ['snow', 'Нужны снегозадержатели', area > 120 ? 12000 : 0],
    ],
  };

  const estimateRows = [
    ...groups.works.filter(([id]) => calcSelections.works[id]),
    ...groups.materials.filter(([id]) => calcSelections.materials[id]),
    ...groups.extras
      .filter(([id, , value]) => value > 0 && calcSelections.extras[id]),
  ];

  const total = estimateRows.reduce((sum, row) => sum + row.at(-1), 0) * base.factor;
  const meter = total / area;

  result.textContent = range(total);
  meterResult.textContent = `≈ ${range(meter, 0.08, 100).replace(' ₽', '')} ₽/м2 с работой и материалами`;
  breakdown.innerHTML = Object.entries(groups)
    .map(([key, rows]) => {
      const visibleRows = rows.filter((row) => row.at(-1) > 0);
      const subtotal = visibleRows.reduce((sum, row) => {
        const id = row[0];
        const value = row.at(-1);
        return sum + (calcSelections[key][id] ? value : 0);
      }, 0) * base.factor;
      const meta = groupMeta[key];
      const lines = visibleRows
        .map((row) => {
          const id = row[0];
          const label = row[1];
          const value = row.at(-1);
          const checked = calcSelections[key][id];
          const price = range(value * base.factor, 0.08, 1000).replace('-', '-<wbr>');
          return `<label class="calc-group__row${!checked ? ' is-muted' : ''}"><input class="calc-check" type="checkbox" data-group="${key}" data-item="${id}"${checked ? ' checked' : ''} /><span>${label}</span><em></em><strong>${price}</strong></label>`;
        })
        .join('');

      return `<section class="calc-group calc-group--${key}">
        <header><span class="calc-group__icon calc-group__icon--${key}" aria-hidden="true"></span><div><h3>${meta.title}</h3><p>${meta.note}</p></div></header>
        <div class="calc-group__lines">${lines}</div>
        <footer><span>Итого ${key === 'works' ? 'за работы' : key === 'materials' ? 'за материалы' : 'дополнительно'}</span><strong>${range(subtotal)}</strong></footer>
      </section>`;
    })
    .join('');
}

[areaInput, materialInput, baseInput].filter(Boolean).forEach((control) => {
  control.addEventListener('input', updateEstimate);
  control.addEventListener('change', updateEstimate);
});

breakdown?.addEventListener('change', (event) => {
  const input = event.target;
  if (!(input instanceof HTMLInputElement) || input.type !== 'checkbox' || !input.dataset.group || !input.dataset.item) {
    return;
  }

  const groupSelections = calcSelections[input.dataset.group];
  if (!groupSelections || !(input.dataset.item in groupSelections)) {
    return;
  }

  groupSelections[input.dataset.item] = input.checked;
  updateEstimate();
});

navLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    const href = link.getAttribute('href');
    if (!href || href === '#') return;

    const target = document.querySelector(href);

    if (!target) {
      return;
    }

    event.preventDefault();
    closeNavMenu();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

nav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    closeNavMenu();
  });
});

document.addEventListener('click', (event) => {
  if (
    window.innerWidth <= 900 &&
    siteHeader?.classList.contains('is-nav-open') &&
    event.target instanceof Node &&
    !siteHeader.contains(event.target)
  ) {
    closeNavMenu();
  }
});

function setLeadPopupContent(opener) {
  const title = opener?.dataset.popupTitle || defaultLeadPopupContent.title;
  const text = opener?.dataset.popupText || defaultLeadPopupContent.text;
  const button = opener?.dataset.popupButton || defaultLeadPopupContent.button;

  if (leadPopupTitle) {
    leadPopupTitle.textContent = title;
  }

  if (leadPopupText) {
    leadPopupText.textContent = text;
  }

  if (leadPopupSubmit) {
    leadPopupSubmit.textContent = button;
  }
}

function openLeadPopup(opener) {
  if (!leadPopup) return;

  setLeadPopupContent(opener);
  window.clearTimeout(leadPopupCloseTimer);
  leadPopup.classList.remove('is-closing');
  leadPopup.hidden = false;
  document.body.classList.add('is-popup-open');
  leadPopup.querySelector('input, textarea, button')?.focus({ preventScroll: true });
}

function closeLeadPopup() {
  if (!leadPopup || leadPopup.hidden || leadPopup.classList.contains('is-closing')) return;

  leadPopup.classList.add('is-closing');
  leadPopupCloseTimer = window.setTimeout(() => {
    leadPopup.hidden = true;
    leadPopup.classList.remove('is-closing');
    document.body.classList.remove('is-popup-open');
  }, leadPopupCloseDelay);
}

leadPopupOpeners.forEach((opener) => {
  opener.addEventListener('click', (event) => {
    event.preventDefault();
    openLeadPopup(opener);
  });
});

if (window.location.hash === '#lead-popup') {
  openLeadPopup();
}

leadPopupClosers.forEach((closer) => {
  closer.addEventListener('click', closeLeadPopup);
});

leadPopup?.addEventListener('click', (event) => {
  if (event.target === leadPopup) {
    closeLeadPopup();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && siteHeader?.classList.contains('is-nav-open')) {
    closeNavMenu();
  }

  if (event.key === 'Escape' && leadPopup && !leadPopup.hidden) {
    closeLeadPopup();
  }
});

function syncCrewPhotoHeight() {
  if (!crew || !crewCopy || !crewPhoto) return;

  const isTwoColumn = getComputedStyle(crew).gridTemplateColumns.split(' ').length > 1;
  if (!isTwoColumn) {
    crew.style.removeProperty('--crew-copy-height');
    return;
  }

  crew.style.setProperty('--crew-copy-height', `${Math.ceil(crewCopy.scrollHeight)}px`);
}

function isLocalSubmissionMode() {
  const { hostname, protocol, port } = window.location;
  return ['localhost', '127.0.0.1', ''].includes(hostname)
    || hostname.endsWith('.local')
    || /^192\.168\.|^10\.|^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)
    || protocol === 'file:'
    || ['5173', '4173'].includes(port);
}

function getPhoneDigits(value) {
  let digits = value.replace(/\D/g, '');
  if (digits.startsWith('8')) digits = digits.slice(1);
  if (digits.startsWith('7')) digits = digits.slice(1);
  return digits.slice(0, 10);
}

function formatPhoneValue(value) {
  const digits = getPhoneDigits(value);
  const parts = [
    digits.slice(0, 3),
    digits.slice(3, 6),
    digits.slice(6, 8),
    digits.slice(8, 10)
  ];

  if (!digits) return '';
  if (digits.length <= 3) return `+7 (${parts[0]}`;
  if (digits.length <= 6) return `+7 (${parts[0]}) ${parts[1]}`;
  if (digits.length <= 8) return `+7 (${parts[0]}) ${parts[1]}-${parts[2]}`;
  return `+7 (${parts[0]}) ${parts[1]}-${parts[2]}-${parts[3]}`;
}

function bindPhoneMask(input) {
  if (!(input instanceof HTMLInputElement) || input.dataset.phoneMaskReady) return;

  input.dataset.phoneMaskReady = 'true';
  input.placeholder = '+7 (___) ___-__-__';
  input.inputMode = 'tel';
  input.maxLength = 18;
  input.pattern = '\\+7 \\([0-9]{3}\\) [0-9]{3}-[0-9]{2}-[0-9]{2}';

  input.addEventListener('focus', () => {
    if (!input.value) input.value = '+7 (';
  });

  input.addEventListener('input', () => {
    input.value = formatPhoneValue(input.value);
  });

  input.addEventListener('blur', () => {
    if (!getPhoneDigits(input.value)) input.value = '';
  });
}

function bindPhoneMasks(scope = document) {
  scope.querySelectorAll('input[type="tel"]').forEach(bindPhoneMask);
}

async function sendForm(form) {
  if (isLocalSubmissionMode()) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return;
  }

  const formData = new FormData(form);
  formData.append('form_name', form.dataset.formName || 'Форма расчета кровли');
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

function trackLeadFormSubmission() {
  if (typeof window.ym === 'function') {
    window.ym(YANDEX_METRIKA_ID, 'reachGoal', YANDEX_METRIKA_FORM_GOAL);
  }
}

function bindLeadForm(form) {
  let status = form.querySelector('.form-message');
  const submit = form.querySelector('button[type="submit"]');
  if (submit instanceof HTMLButtonElement && !submit.dataset.initialText) {
    submit.dataset.initialText = submit.textContent || '';
  }

  if (!status) {
    status = document.createElement('p');
    status.className = 'form-message';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    form.append(status);
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (submittingLeadForms.has(form)) return;

    const activeSubmit = form.querySelector('button[type="submit"]');
    if (activeSubmit instanceof HTMLButtonElement && !activeSubmit.dataset.initialText) {
      activeSubmit.dataset.initialText = activeSubmit.textContent || '';
    }

    submittingLeadForms.add(form);
    const initialText = activeSubmit?.dataset.initialText || activeSubmit?.textContent || '';
    form.classList.remove('is-submitted', 'is-submit-error');
    form.classList.add('is-submitting');
    status.textContent = 'Отправляем заявку...';

    if (activeSubmit) {
      activeSubmit.disabled = true;
      activeSubmit.textContent = 'Отправляем...';
    }

    try {
      const isLocalSubmit = isLocalSubmissionMode();
      await sendForm(form);
      trackLeadFormSubmission();
      if (!isLocalSubmit) {
        form.reset();
      }
      form.classList.remove('is-submitting', 'is-submit-error');
      form.classList.add('is-submitted');
      status.textContent = isLocalSubmit
        ? 'Локальная проверка: форма готова к отправке на сервере с PHP.'
        : 'Заявка отправлена. Мы свяжемся с вами в ближайшее время.';
      if (activeSubmit) activeSubmit.textContent = 'Отправлено';

      if (!isLocalSubmit && form.closest('#lead-popup')) {
        setTimeout(closeLeadPopup, 900);
      }
    } catch (error) {
      form.classList.remove('is-submitting', 'is-submitted');
      form.classList.add('is-submit-error');
      status.textContent = error instanceof Error ? error.message : 'Ошибка отправки';
      if (activeSubmit) {
        activeSubmit.disabled = false;
        activeSubmit.textContent = error instanceof Error ? error.message : 'Ошибка отправки';
      }
      setTimeout(() => {
        if (activeSubmit) activeSubmit.textContent = initialText;
      }, 2400);
    } finally {
      submittingLeadForms.delete(form);
    }
  });
}

const crewResizeObserver = new ResizeObserver(syncCrewPhotoHeight);
if (crewCopy) {
  crewResizeObserver.observe(crewCopy);
}

window.addEventListener('resize', syncCrewPhotoHeight);
window.addEventListener('resize', syncNavMenu);
document.fonts?.ready.then(syncCrewPhotoHeight);
syncNavMenu();

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

function updateEstimatorSummary() {
  if (!quizSummary || !estimatorQuiz) return;
  const scope = estimatorQuiz.querySelector('input[name="replacement_scope"]')?.value || '';
  const material = estimatorQuiz.querySelector('input[name="roof_material"]')?.value || '';
  const area = estimatorQuiz.querySelector('input[name="roof_area"]')?.value || '';
  const start = estimatorQuiz.querySelector('input[name="start_time"]')?.value || '';
  const firstQuestion = estimatorQuestions[0];

  if (estimatorCurrentStep === 0 && firstQuestion.summary?.[scope]) {
    quizSummary.textContent = firstQuestion.summary[scope];
    return;
  }

  const parts = [
    scope && `задача: ${scope}`,
    material && `материал: ${material}`,
    area && `площадь: ${area}`,
    start && `старт: ${start}`
  ].filter(Boolean);

  quizSummary.textContent = parts.length
    ? `${parts.join(', ')}. По этим данным скажу вероятный вариант замены и диапазон цены.`
    : 'По ответам и фотографиям скажу, какой вариант замены вероятнее всего подойдет вашему дому.';
}

function renderEstimatorLeadStep() {
  if (!estimatorQuiz || !estimatorOptions || !estimatorStepLabel || !estimatorTitle || !estimatorNext) return;

  estimatorIsFinalStep = true;
  estimatorStepLabel.textContent = `Вопрос ${estimatorTotalSteps} из ${estimatorTotalSteps}`;
  estimatorTitle.textContent = 'Оставьте контакты для расчета';
  if (estimatorProgress) estimatorProgress.style.width = '100%';
  if (estimatorPrev) estimatorPrev.disabled = false;
  if (quizSummary) {
    quizSummary.textContent = 'Прикрепите фото кровли, если они есть. По ответам подготовим предварительный расчет и скажем, что можно не менять.';
  }

  estimatorOptions.innerHTML = `
    <div class="estimator-lead">
      <input type="hidden" name="request_title" value="Предварительный расчет замены кровли" />
      <label>
        <span>Имя</span>
        <input name="name" type="text" placeholder="Как к вам обращаться" autocomplete="name" />
      </label>
      <label>
        <span>Телефон</span>
        <input name="phone" type="tel" placeholder="+7 (___) ___-__-__" autocomplete="tel" required />
      </label>
      <label class="estimator-lead__file">
        <span>Фото кровли</span>
        <input name="photos[]" type="file" accept="image/*" multiple />
      </label>
      <label class="estimator-lead__policy">
        <input type="checkbox" name="policy" required />
        <span>Согласен на обработку персональных данных и принимаю <a href="/politika-konfidentsialnosti/">политику конфиденциальности</a>.</span>
      </label>
    </div>
  `;

  bindPhoneMasks(estimatorOptions);
  estimatorNext.type = 'submit';
  estimatorNext.classList.add('estimator-quiz__submit');
  estimatorNext.textContent = 'Получить расчет';
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
  estimatorNext.type = 'button';
  estimatorNext.classList.remove('estimator-quiz__submit');
  estimatorNext.textContent = estimatorCurrentStep === estimatorQuestions.length - 1 ? 'Перейти к заявке' : 'Следующий вопрос';

  estimatorOptions.innerHTML = question.options.map(([label, image], index) => {
    const checked = savedValue ? savedValue === label : index === 0;
    const displayLabel = formatEstimatorOptionLabel(label);
    return `
      <label class="estimator-option${image ? '' : ' estimator-option--text'}${label === 'Пока не знаю' ? ' estimator-option--unknown' : ''}">
        <input type="radio" name="${question.name}_choice" value="${label}"${checked ? ' checked' : ''} />
        ${image ? `<img src="${image}" alt="" />` : ''}
        <span>${displayLabel}</span>
      </label>
    `;
  }).join('');

  const checkedInput = estimatorOptions.querySelector('input[type="radio"]:checked');
  if (checkedInput) setEstimatorAnswer(question.name, checkedInput.value);
  updateEstimatorSummary();
}

estimatorPrev?.addEventListener('click', () => {
  window.clearTimeout(estimatorAutoNextTimer);
  if (estimatorIsFinalStep) {
    estimatorCurrentStep = estimatorQuestions.length - 1;
    renderEstimatorStep();
    return;
  }

  estimatorCurrentStep = Math.max(estimatorCurrentStep - 1, 0);
  renderEstimatorStep();
});

estimatorNext?.addEventListener('click', () => {
  window.clearTimeout(estimatorAutoNextTimer);
  if (estimatorIsFinalStep) return;

  if (estimatorCurrentStep === estimatorQuestions.length - 1) {
    renderEstimatorLeadStep();
    return;
  }

  estimatorCurrentStep += 1;
  renderEstimatorStep();
});

estimatorOptions?.addEventListener('change', (event) => {
  const input = event.target;
  if (!(input instanceof HTMLInputElement) || input.type !== 'radio') return;
  const question = estimatorQuestions[estimatorCurrentStep];
  setEstimatorAnswer(question.name, input.value);
  updateEstimatorSummary();

  window.clearTimeout(estimatorAutoNextTimer);

  estimatorAutoNextTimer = window.setTimeout(() => {
    if (estimatorCurrentStep >= estimatorQuestions.length - 1) {
      renderEstimatorLeadStep();
      return;
    }

    estimatorCurrentStep += 1;
    renderEstimatorStep();
  }, 200);
});

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

function setCaseTextDisclosureState(card, isOpen) {
  card.classList.toggle('is-case-open', isOpen);
  card.querySelector('.case-card__toggle')?.setAttribute('aria-expanded', String(isOpen));
}

function setupCaseTextDisclosures() {
  document.querySelectorAll('.cases-section .case-card').forEach((card) => {
    const text = card.querySelector('.case-card__breakdown div:nth-child(4)');
    if (!text) return;

    let toggle = card.querySelector('.case-card__toggle');
    if (!toggle) {
      toggle = document.createElement('button');
      toggle.className = 'case-card__toggle';
      toggle.type = 'button';
      toggle.setAttribute('aria-label', 'Показать работы полностью');
      toggle.setAttribute('aria-expanded', 'false');
      text.insertAdjacentElement('afterend', toggle);

      toggle.addEventListener('click', () => {
        if (!card.classList.contains('has-case-toggle')) return;
        const isOpen = card.classList.contains('is-case-open');
        setCaseTextDisclosureState(card, !isOpen);
        toggle.setAttribute('aria-label', isOpen ? 'Показать работы полностью' : 'Свернуть работы');
      });
    }

    if (!text.dataset.caseDisclosureReady) {
      text.dataset.caseDisclosureReady = 'true';
      text.addEventListener('click', () => {
        if (!card.classList.contains('has-case-toggle')) return;
        const isOpen = card.classList.contains('is-case-open');
        setCaseTextDisclosureState(card, !isOpen);
        toggle.setAttribute('aria-label', isOpen ? 'Показать работы полностью' : 'Свернуть работы');
      });
    }

    const wasOpen = card.classList.contains('is-case-open');
    card.classList.remove('has-case-toggle');

    if (!mobileCaseMedia.matches) {
      setCaseTextDisclosureState(card, false);
      toggle.hidden = true;
      return;
    }

    const shouldCollapse = text.scrollHeight > 40;
    card.classList.toggle('has-case-toggle', shouldCollapse);
    setCaseTextDisclosureState(card, shouldCollapse && wasOpen);
    toggle.hidden = !shouldCollapse;
    toggle.setAttribute('aria-label', shouldCollapse && wasOpen ? 'Свернуть работы' : 'Показать работы полностью');
  });
}

function setupCaseSliders() {
  document.querySelectorAll('.case-card__photo--slider').forEach((photo) => {
    if (photo.dataset.sliderReady) return;

    const images = (photo.dataset.caseImages || '')
      .split(',')
      .map((image) => image.trim())
      .filter(Boolean)
      .map((image) => caseAssetUrls[image] || image);
    if (images.length < 2) return;

    let activeIndex = 0;
    const setImage = (index) => {
      activeIndex = (index + images.length) % images.length;
      photo.style.setProperty('--case-card-image', `url("${images[activeIndex]}")`);
      photo.querySelectorAll('.case-card__thumb').forEach((thumb, thumbIndex) => {
        thumb.classList.toggle('is-active', thumbIndex === activeIndex);
      });
    };

    const prev = document.createElement('button');
    prev.className = 'case-card__slider-nav case-card__slider-nav--prev';
    prev.type = 'button';
    prev.setAttribute('aria-label', 'Предыдущее фото');
    prev.addEventListener('click', () => setImage(activeIndex - 1));

    const next = document.createElement('button');
    next.className = 'case-card__slider-nav case-card__slider-nav--next';
    next.type = 'button';
    next.setAttribute('aria-label', 'Следующее фото');
    next.addEventListener('click', () => setImage(activeIndex + 1));

    const thumbs = document.createElement('div');
    thumbs.className = 'case-card__thumbs';
    images.forEach((image, index) => {
      const thumb = document.createElement('button');
      thumb.className = 'case-card__thumb';
      thumb.type = 'button';
      thumb.style.backgroundImage = `url("${image}")`;
      thumb.setAttribute('aria-label', `Фото ${index + 1}`);
      thumb.addEventListener('click', () => setImage(index));
      thumbs.append(thumb);
    });

    photo.append(prev, next);
    photo.parentElement.insertBefore(thumbs, photo.nextElementSibling);
    photo.dataset.sliderReady = 'true';
    setImage(0);
  });
}

window.addEventListener('resize', setupReviewTextDisclosures);
window.addEventListener('resize', setupCaseTextDisclosures);
mobileReviewMedia.addEventListener('change', setupReviewTextDisclosures);
mobileCaseMedia.addEventListener('change', setupCaseTextDisclosures);

forms.forEach(bindLeadForm);
if (estimatorQuiz) bindLeadForm(estimatorQuiz);
bindPhoneMasks();
updateEstimate();
renderEstimatorStep();
setupReviewTextDisclosures();
setupCaseTextDisclosures();
setupCaseSliders();
