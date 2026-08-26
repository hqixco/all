const quizSection = document.querySelector('.quiz');
const casesSection = document.querySelector('.cases');
const reviewsSection = document.querySelector('.reviews');
const isExtensionsPage = document.body.dataset.service === 'extensions';
const isRecoveryPage = document.body.dataset.service === 'recovery';

const quizQuestions = isExtensionsPage ? [
  ['Какую пристройку хотите?', ['Жилая комната', 'Кухня или столовая', 'Тёплая веранда', 'Терраса или навес', 'Тамбур или крыльцо', 'Пока не знаю'], ['extension-type-living-room.webp', 'extension-type-kitchen.webp', 'extension-type-warm-veranda.webp', 'extension-type-terrace.webp', 'extension-entrance-porch-02.webp', 'quiz-not-sure.webp']],
  ['Из чего построен основной дом?', ['Брус или бревно', 'Кирпич', 'Газобетон', 'Каркасный дом', 'Смешанный материал', 'Нужно смотреть на месте'], ['extension-living-room-01.webp', 'extension-two-storey-01.webp', 'extension-glazed-veranda-02.webp', 'extension-warm-veranda-01.webp', 'extension-covered-terrace-01.webp', 'quiz-not-sure.webp']],
  ['Какая примерная площадь?', ['До 15 м²', '15–25 м²', '25–40 м²', '40–60 м²', 'Больше 60 м²', 'Пока не знаю'], []],
  ['Какой результат нужен?', ['Тёплый контур', 'Под ключ с отделкой', 'Каркас без отделки', 'Терраса или навес', 'Нужна консультация'], []],
  ['Когда хотите начать работы?', ['Срочно', 'В течение недели', 'В этом месяце', 'Через 1–2 месяца', 'Планирую заранее', 'После консультации'], []],
] : [
  ['Что необходимо сделать?', ['Полная замена кровли', 'Замена покрытия', 'Ремонт кровли', 'Водостоки и доборы', 'Утепление и основание', 'Пока не знаю'], ['quiz-full-roof-replacement.webp', 'quiz-cover-replacement.webp', 'task-pipe-window-leak.webp', 'quiz-gutters-flashing.webp', 'quiz-insulation-base.webp', 'quiz-not-sure.webp']],
  ['Какое покрытие рассматриваете?', ['Металлочерепица', 'Профнастил', 'Гибкая черепица', 'Фальцевая кровля', 'Нужна консультация', 'Материал уже куплен'], ['quiz-metal-tile.webp', 'quiz-profiled-sheet.webp', 'quiz-flexible-shingles.webp', 'quiz-standing-seam.webp', 'quiz-not-sure.webp', 'quiz-material-purchased.webp']],
  ['Какая примерная площадь кровли?', ['До 80 м²', '80–140 м²', '140–220 м²', '220–350 м²', 'Больше 350 м²', 'Не знаю площадь'], []],
  ['Какая крыша у дома?', ['Холодный чердак', 'Утеплённая мансарда', 'Жилой этаж под крышей', 'Нужна консультация'], []],
  ['Когда хотите начать работы?', ['Срочно', 'В течение недели', 'В этом месяце', 'Через 1–2 месяца', 'Планирую заранее', 'После консультации'], []],
];

const inlineIcon = (name) => {
  const path = name === 'left' ? 'm15 18-6-6 6-6' : name === 'right' ? 'm9 18 6-6-6-6' : 'M7 17 17 7M9 7h8v8';
  return `<svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg>`;
};

if (quizSection && !isRecoveryPage) {
  quizSection.className = 'quiz section-paper';
  quizSection.innerHTML = `<div class="container"><div class="section-heading"><p class="eyebrow">Предварительный расчёт</p><h2>${isExtensionsPage ? 'Рассчитайте пристройку<br>к вашему дому' : 'Получите расчёт<br>замены кровли'}</h2><p>${isExtensionsPage ? 'Ответьте на 5 вопросов — прораб определит конструкцию, комплектацию и ориентировочный бюджет.' : 'Ответьте на 5 вопросов — прораб определит объём работ и вариант новой кровли.'}</p></div><div class="quiz-layout"><aside class="quiz-manager"><div class="portrait"><span>Д</span></div><p class="label">На связи</p><h3>Денис,<br>прораб</h3><p>${isExtensionsPage ? 'Посмотрит фотографии дома и предложит подходящий вариант фундамента, каркаса и примыкания.' : 'Посмотрит фотографии и скажет, что менять, а что можно сохранить.'}</p><div class="manager-reply">Ответим<br><strong>за 10 минут</strong></div></aside><form class="quiz-form"><div class="quiz-progress"><span></span></div><p class="quiz-step">Вопрос 1 из 5</p><h3 class="quiz-question"></h3><div class="quiz-options"></div><div class="quiz-controls"><button class="button button-ghost quiz-prev" type="button" disabled>Назад</button><button class="button button-accent quiz-next" type="button">Следующий вопрос ${inlineIcon('up-right')}</button></div><div class="quiz-status"></div></form></div></div>`;
  const form = quizSection.querySelector('form'); const options = form.querySelector('.quiz-options'); let step = 0; let autoAdvance; let isLeadStep = false; const answers = [];
  const renderQuiz = () => { const [title, labels, images] = quizQuestions[step]; form.querySelector('.quiz-step').textContent = 'Выберите подходящий вариант'; form.querySelector('.quiz-question').textContent = title; form.querySelector('.quiz-progress span').style.width = `${((step + 1) / quizQuestions.length) * 100}%`; options.innerHTML = labels.map((label, i) => `<label class="quiz-option"><input type="radio" name="quiz-answer-${step}" value="${label}" ${answers[step] === label ? 'checked' : ''}><span>${images[i] ? `<img src="/assets/${images[i]}" alt="">` : ''}<b>${label}</b></span></label>`).join(''); form.querySelector('.quiz-prev').disabled = step === 0; form.querySelector('.quiz-next').innerHTML = `${step === quizQuestions.length - 1 ? 'Перейти к заявке' : 'Следующий вопрос'} ${inlineIcon('up-right')}`; };
  form.addEventListener('change', (e) => {
    if (!e.target.matches('input[type=radio]')) return;
    answers[step] = e.target.value;
    clearTimeout(autoAdvance);
    autoAdvance = setTimeout(() => {
      if (step < quizQuestions.length - 1) {
        step += 1;
        renderQuiz();
      } else {
        form.querySelector('.quiz-next').click();
      }
    }, 200);
  });
  form.querySelector('.quiz-prev').addEventListener('click', () => { if (step) { step -= 1; renderQuiz(); } });
  form.querySelector('.quiz-next').addEventListener('click', () => { if (isLeadStep || !answers[step]) return; if (step < quizQuestions.length - 1) { step += 1; renderQuiz(); return; } isLeadStep = true; form.querySelector('.quiz-options').innerHTML = `<div class="quiz-final-fields"><input name="name" required autocomplete="name" placeholder="Ваше имя"><input name="phone" required type="tel" placeholder="Телефон"><label class="upload">${isExtensionsPage ? 'Прикрепить фотографии дома' : 'Прикрепить фотографии крыши'} <input name="photos[]" type="file" multiple accept="image/*"></label><label class="consent"><input name="policy" required type="checkbox" value="Согласие получено"><span>Соглашаюсь с <a href="/privacy.html">политикой конфиденциальности</a></span></label></div>`; window.addFormFieldTitles?.(form.querySelector('.quiz-final-fields')); answers.forEach((answer, index) => { const hidden = document.createElement('input'); hidden.type = 'hidden'; hidden.name = `quiz_answer_${index + 1}`; hidden.value = answer; form.append(hidden); }); form.dataset.formName = isExtensionsPage ? 'Квиз — расчёт пристройки' : 'Квиз — предварительный расчёт кровли'; form.querySelector('.quiz-question').textContent = 'Куда отправить предварительный расчёт?'; form.querySelector('.quiz-next').innerHTML = `Получить расчёт ${inlineIcon('up-right')}`; form.querySelector('.quiz-next').onclick = async () => { const button = form.querySelector('.quiz-next'); const status = form.querySelector('.quiz-status'); if (typeof window.sendGarantLeadForm === 'function') await window.sendGarantLeadForm(form, button, status); }; });
  renderQuiz();
}

const roofingCaseData = [
  {
    title: 'Замена старого шифера на металлочерепицу',
    area: 132,
    location: 'посёлок Токсово, Ленинградская область',
    days: 7,
    price: '380 тыс. ₽',
    description: 'Демонтировали старое покрытие, восстановили обрешётку, уложили гидроизоляцию и смонтировали новую металлочерепицу.',
    images: ['slate-to-metal-roof-01.webp', 'slate-to-metal-roof-02.webp', 'slate-to-metal-roof-03.webp', 'slate-to-metal-roof-04.webp'],
  },
  {
    title: 'Монтаж металлочерепицы на жилом доме',
    area: 96,
    location: 'деревня Агалатово, Ленинградская область',
    days: 3,
    price: 'от 90 тыс. ₽',
    description: 'Подготовили основание, смонтировали контробрешётку и обрешётку, уложили металлочерепицу, установили конёк и торцевые планки.',
    images: ['residential-metal-roof-01.webp', 'residential-metal-roof-02.webp', 'residential-metal-roof-03.webp', 'residential-metal-roof-04.webp', 'residential-metal-roof-05.webp'],
  },
  {
    title: 'Новая кровля на кирпичном доме',
    area: 118,
    location: 'посёлок Рощино, Ленинградская область',
    days: 5,
    price: 'от 145 тыс. ₽',
    description: 'Собрали кровельное основание, уложили гидроизоляцию и синюю металлочерепицу, оформили конёк, карнизы и примыкания.',
    images: ['brick-house-new-roof-01.webp', 'brick-house-new-roof-02.webp', 'brick-house-new-roof-03.webp'],
  },
  {
    title: 'Монтаж кровли на деревянном доме',
    area: 145,
    location: 'посёлок Сиверский, Ленинградская область',
    days: 7,
    price: 'от 210 тыс. ₽',
    description: 'Смонтировали стропильную систему, гидроизоляцию и обрешётку, уложили металлочерепицу и закрыли доборными элементами все узлы кровли.',
    images: ['timber-house-roof-01.webp', 'timber-house-roof-02.webp', 'timber-house-roof-03.webp'],
  },
  {
    title: 'Монтаж металлочерепицы на частном доме',
    area: 128,
    location: 'деревня Кипень, Ленинградская область',
    days: 6,
    price: 'от 165 тыс. ₽',
    description: 'Уложили гидроизоляцию, смонтировали контробрешётку и обрешётку, установили металлочерепицу и доборные элементы.',
    images: ['private-house-metal-roof-01.webp', 'private-house-metal-roof-02.webp', 'private-house-metal-roof-03.webp'],
  },
  {
    title: 'Монтаж кровли на деревянном доме',
    area: 104,
    location: 'посёлок Ульяновка, Ленинградская область',
    days: 5,
    price: 'от 135 тыс. ₽',
    description: 'Подготовили кровельное основание, уложили мембрану, смонтировали обрешётку и покрыли крышу профнастилом.',
    images: ['wooden-house-profiled-roof-01.webp', 'wooden-house-profiled-roof-02.webp', 'wooden-house-profiled-roof-03.webp', 'wooden-house-profiled-roof-04.webp'],
  },
  {
    title: 'Кровля на доме из бревна',
    area: 136,
    location: 'посёлок Сосново, Ленинградская область',
    days: 7,
    price: 'от 185 тыс. ₽',
    description: 'Собрали стропильную систему, выполнили гидроизоляцию и обрешётку, смонтировали металлочерепицу и коньковые элементы.',
    images: ['log-house-roof-01.webp', 'log-house-roof-02.webp', 'log-house-roof-03.webp'],
  },
  {
    title: 'Монтаж кровли на каркасном доме',
    area: 168,
    location: 'посёлок имени Морозова, Ленинградская область',
    days: 8,
    price: 'от 230 тыс. ₽',
    description: 'Смонтировали стропила, кровельную мембрану и обрешётку, уложили металлочерепицу и оформили карнизы и фронтоны.',
    images: ['frame-house-roof-01.webp', 'frame-house-roof-02.webp', 'frame-house-roof-03.webp'],
  },
  {
    title: 'Замена кровли на доме сложной формы',
    area: 205,
    location: 'посёлок Лебяжье, Ленинградская область',
    days: 12,
    price: 'от 340 тыс. ₽',
    description: 'Демонтировали старое покрытие, восстановили основание, уложили гидроизоляцию и смонтировали металлочерепицу на всех скатах и пристройках.',
    images: ['complex-house-roof-replacement-01.webp', 'complex-house-roof-replacement-02.webp', 'complex-house-roof-replacement-03.webp', 'complex-house-roof-replacement-04.webp'],
  },
  {
    title: 'Реконструкция кровли на доме с пристройкой',
    area: 142,
    location: 'деревня Разметелево, Ленинградская область',
    days: 8,
    price: 'от 175 тыс. ₽',
    description: 'Усилили стропильную систему, подготовили обрешётку, смонтировали зелёный профнастил и оформили карнизы, фронтоны и примыкания.',
    images: ['house-extension-roof-reconstruction-01.webp', 'house-extension-roof-reconstruction-02.webp', 'house-extension-roof-reconstruction-03.webp'],
  },
];

const extensionCaseData = [
  { title: 'Утеплённая веранда с отделкой', area: 28, location: 'посёлок Рощино, Ленинградская область', days: 24, price: 'от 520 тыс. ₽', description: 'Подготовили основание, собрали утеплённый каркас, установили окна и двери, выполнили наружную и внутреннюю отделку.', images: ['extension-warm-veranda-01.webp', 'extension-warm-veranda-02.webp', 'extension-warm-veranda-03.webp'] },
  { title: 'Терраса с навесом и ограждением', area: 32, location: 'посёлок Токсово, Ленинградская область', days: 16, price: 'от 340 тыс. ₽', description: 'Смонтировали свайное основание, настил, стойки и навес, установили лестницу и деревянное ограждение.', images: ['extension-covered-terrace-01.webp', 'extension-covered-terrace-02.webp', 'extension-covered-terrace-03.webp'] },
  { title: 'Входная пристройка с крыльцом', area: 14, location: 'посёлок Сосново, Ленинградская область', days: 14, price: 'от 280 тыс. ₽', description: 'Построили входную группу, связали её с фасадом и кровлей дома, смонтировали крыльцо и отделку.', images: ['extension-entrance-porch-01.webp', 'extension-entrance-porch-02.webp'] },
  { title: 'Тёплая веранда с остеклением', area: 24, location: 'деревня Агалатово, Ленинградская область', days: 21, price: 'от 460 тыс. ₽', description: 'Собрали тёплый каркас, утеплили пол, стены и кровлю, установили остекление и подготовили помещение под чистовую отделку.', images: ['extension-glazed-veranda-01.webp', 'extension-glazed-veranda-02.webp'] },
  { title: 'Каркасная пристройка под жилую комнату', area: 36, location: 'посёлок Сиверский, Ленинградская область', days: 30, price: 'от 690 тыс. ₽', description: 'Выполнили фундамент, силовой каркас и тёплый контур, устроили примыкание к дому и наружную отделку.', images: ['extension-living-room-01.webp', 'extension-living-room-02.webp', 'extension-living-room-03.webp'] },
  { title: 'Двухэтажная пристройка к дачному дому', area: 58, location: 'посёлок Вырица, Ленинградская область', days: 45, price: 'от 1,15 млн ₽', description: 'Построили двухэтажный каркас, объединили этажи с существующим домом, смонтировали кровлю, окна и фасад.', images: ['extension-two-storey-01.webp', 'extension-two-storey-02.webp', 'extension-two-storey-03.webp'] },
];

const caseData = isExtensionsPage ? extensionCaseData : roofingCaseData;

const galleryModal = document.createElement('dialog');
galleryModal.className = 'gallery-modal';
galleryModal.innerHTML = '<button class="gallery-modal__close modal-close" type="button" aria-label="Закрыть"></button><div class="modal-content"></div>';
document.body.append(galleryModal);

const galleryModalContent = galleryModal.querySelector('.modal-content');
const galleryState = { images: [], title: '', imageIndex: 0 };
let galleryCloseTimer;

function renderGalleryModal() {
  const image = galleryState.images[galleryState.imageIndex];
  if (!image) return;
  const hasMultipleImages = galleryState.images.length > 1;

  galleryModalContent.innerHTML = `
    <div class="gallery-lightbox">
      <h2 class="gallery-lightbox__title">${galleryState.title}</h2>
      <div class="gallery-lightbox__stage">
        <div class="gallery-lightbox__image" style="background-image:url('/assets/${image}')" aria-label="${galleryState.title}, фото ${galleryState.imageIndex + 1}" role="img"></div>
        ${hasMultipleImages ? '<button class="gallery-lightbox__nav gallery-lightbox__nav--prev" type="button" data-gallery-modal-nav="prev" aria-label="Предыдущее фото"></button><button class="gallery-lightbox__nav gallery-lightbox__nav--next" type="button" data-gallery-modal-nav="next" aria-label="Следующее фото"></button>' : ''}
      </div>
      ${hasMultipleImages ? `<div class="gallery-lightbox__thumbs" aria-label="Фотографии кейса">${galleryState.images.map((item, index) => `<button class="gallery-lightbox__thumb${index === galleryState.imageIndex ? ' is-active' : ''}" type="button" data-gallery-modal-thumb="${index}" aria-label="Открыть фото ${index + 1}"><span style="background-image:url('/assets/${item}')"></span></button>`).join('')}</div>` : ''}
    </div>`;
}

function moveGalleryModal(direction) {
  const count = galleryState.images.length;
  if (count < 2) return;
  galleryState.imageIndex = (galleryState.imageIndex + direction + count) % count;
  renderGalleryModal();
}

function openGalleryModal(item, imageIndex = 0) {
  galleryState.images = item.images;
  galleryState.title = item.title;
  galleryState.imageIndex = Math.max(0, Math.min(imageIndex, item.images.length - 1));
  renderGalleryModal();
  galleryModal.showModal();
}

function closeGalleryModal() {
  if (!galleryModal.open || galleryModal.classList.contains('is-closing')) return;
  galleryModal.classList.add('is-closing');
  clearTimeout(galleryCloseTimer);
  galleryCloseTimer = setTimeout(() => {
    galleryModal.close();
    galleryModal.classList.remove('is-closing');
  }, 160);
}

galleryModalContent.addEventListener('click', (event) => {
  const nav = event.target.closest('[data-gallery-modal-nav]');
  if (nav) {
    moveGalleryModal(nav.dataset.galleryModalNav === 'prev' ? -1 : 1);
    return;
  }

  const thumb = event.target.closest('[data-gallery-modal-thumb]');
  if (thumb) {
    galleryState.imageIndex = Number(thumb.dataset.galleryModalThumb);
    renderGalleryModal();
  }
});

galleryModal.querySelector('.modal-close').addEventListener('click', closeGalleryModal);
galleryModal.addEventListener('click', (event) => {
  if (event.target === galleryModal) closeGalleryModal();
});
galleryModal.addEventListener('cancel', (event) => {
  event.preventDefault();
  closeGalleryModal();
});
galleryModal.addEventListener('close', () => {
  galleryState.images = [];
  galleryState.title = '';
  galleryState.imageIndex = 0;
  galleryModalContent.innerHTML = '';
});
document.addEventListener('keydown', (event) => {
  if (!galleryModal.open) return;
  if (event.key === 'ArrowLeft') moveGalleryModal(-1);
  if (event.key === 'ArrowRight') moveGalleryModal(1);
});

if (casesSection && !isRecoveryPage) { casesSection.className = 'cases section-paper'; casesSection.innerHTML = `<div class="container"><div class="section-heading heading-row"><div><p class="eyebrow">Реальные объекты</p><h2>${isExtensionsPage ? 'Построенные пристройки<br>в Санкт-Петербурге и ЛО' : 'Объекты по замене<br>и реконструкции кровли'}</h2></div><p>${isExtensionsPage ? 'В каждом объекте — площадь, срок, бюджет и состав работ: от фундамента и каркаса до тёплого контура и отделки.' : 'В каждом объекте — площадь, срок, бюджет и полный состав работ: от демонтажа до новой кровли и водостоков.'}</p></div><div class="cases-grid">${caseData.map((item) => `<article class="case-card"><div class="case-gallery"><div class="case-photo" data-index="0"><img src="/assets/${item.images[0]}" alt="${item.title}"><button class="case-photo__open" type="button" data-gallery-open aria-label="Открыть галерею: ${item.title}"></button><button type="button" data-dir="prev" aria-label="Предыдущее фото">${inlineIcon('left')}</button><button type="button" data-dir="next" aria-label="Следующее фото">${inlineIcon('right')}</button></div></div><h3>${item.title}</h3><div class="case-info"><span>Срок <b>${item.days} дней</b></span><span>Работы <b>${item.price}</b></span><small>Объект · ${item.location} · ${item.area} м²</small><p>${item.description}</p></div><a class="button button-accent" href="#estimate">${isExtensionsPage ? 'Рассчитать мою пристройку' : 'Рассчитать мою кровлю'} ${inlineIcon('up-right')}</a></article>`).join('')}</div></div>`; casesSection.querySelectorAll('.case-card').forEach((card) => { const item = caseData[[...casesSection.querySelectorAll('.case-card')].indexOf(card)]; const photo = card.querySelector('.case-photo img'); const set = (n) => { const index = (n + item.images.length) % item.images.length; photo.src = `/assets/${item.images[index]}`; photo.alt = `${item.title}, фото ${index + 1}`; card.dataset.index = index; }; card.querySelector('[data-dir=prev]').onclick = () => set(Number(card.dataset.index || 0) - 1); card.querySelector('[data-dir=next]').onclick = () => set(Number(card.dataset.index || 0) + 1); card.querySelector(`[data-gallery-open]`).onclick = () => openGalleryModal(item, Number(card.dataset.index || 0)); }); }

const extensionReviews = [
  { name: 'Ирина · Рощино', work: 'Что строили: тёплая веранда.', image: 'extension-review-warm-veranda.webp', text: 'Хотели сделать дополнительную комнату, которой можно пользоваться круглый год. Бригада подготовила основание, утеплила стены и пол, аккуратно состыковала пристройку с домом. Все расходы согласовывали заранее, итоговая сумма неожиданно не выросла.' },
  { name: 'Николай · Токсово', work: 'Что строили: каркасная пристройка.', image: 'extension-review-frame-room.webp', text: 'Нужна была небольшая утеплённая комната с отдельным входом. Перед началом работ согласовали конструкцию фундамента, кровлю и материалы для отделки. Основные этапы фотографировали, поэтому было понятно, что находится под утеплением и обшивкой.' },
  { name: 'Людмила · Сосново', work: 'Что строили: терраса с навесом.', image: 'extension-review-covered-terrace.webp', text: 'Старая площадка у дома была неудобной и быстро намокала после дождя. Рабочие собрали прочный каркас, сделали настил, ступени и навес. Терраса получилась аккуратной и устойчивой, после завершения работ строительный мусор вывезли.' },
  { name: 'Марина · Агалатово', work: 'Что строили: остеклённая веранда с входной группой.', image: 'extension-review-glazed-veranda.webp', text: 'Хотелось получить светлую веранду, которой можно пользоваться не только летом. Бригада сделала каркас, кровлю и установила большое остекление. Двери закрываются плотно, внутри сухо, а сама пристройка выглядит как часть дома, а не как случайно приделанная коробка.' },
  { name: 'Андрей · Сиверский', work: 'Что строили: терраса с навесом.', image: 'extension-review-wood-terrace.webp', text: 'Нужно было сделать террасу без ощущения временной конструкции. Бригада аккуратно собрала каркас, настил и ограждение. После сдачи участок оставили в порядке, пользоваться террасой начали сразу.' },
  { name: 'Сергей и Наталья · Вырица', work: 'Что строили: тёплая деревянная пристройка к дому.', image: 'extension-review-warm-wood-room.webp', text: 'Пристройку планировали использовать круглый год, поэтому особенно переживали за утепление и соединение со старым домом. Рабочие всё объяснили, собрали конструкцию и аккуратно выполнили наружную отделку деревом. Зимой помещение держит тепло, сырости и продувания нет.' },
  { name: 'Ольга · Репино', work: 'Что строили: панорамная веранда вдоль фасада дома.', image: 'extension-review-panoramic-veranda.webp', text: 'Хотела закрыть старую открытую террасу и получить нормальное помещение для отдыха. Установили большие окна, двери и сделали аккуратную отделку внутри. Веранда получилась светлой, вечером быстро прогревается, а внешний вид дома стал заметно современнее.' },
  { name: 'Виктор · Мельниково', work: 'Что строили: утеплённый тамбур с отдельным входом.', image: 'extension-review-insulated-entrance.webp', text: 'Нужен был небольшой тамбур, чтобы зимой холод сразу не попадал в дом. Бригада сделала фундамент, стены, кровлю, установила дверь и окно, снаружи всё обшили сайдингом под цвет дома. Получилось просто, аккуратно и без лишних затрат.' },
  { name: 'Дмитрий и Анна · Лебяжье', work: 'Что строили: пристройка с крыльцом и навесом.', image: 'extension-review-porch-canopy.webp', text: 'Хотели увеличить входную часть дома и сделать нормальное крытое крыльцо. Работы выполнили поэтапно: основание, каркас, кровля и наружная отделка. Все размеры согласовывали заранее, поэтому переделок не было. Пристройкой пользуемся постоянно, дождь и снег к двери теперь не попадают.' },
];
const roofReviews = [
  { name: 'Ирина · Рощино', work: 'Что делали: локальный ремонт кровли и примыкания.', image: 'roof-review-local-junction-repair.webp', text: 'После сильного дождя начало мокнуть возле трубы. Прораб приехал, осмотрел крышу и показал, откуда затекает вода. Разобрали небольшой участок, восстановили примыкание и заменили повреждённые листы. Полностью перекрывать крышу не навязывали. После ремонта несколько дождей прошло, внутри сухо.' },
  { name: 'Николай · Токсово', work: 'Что делали: замена старого шифера на профнастил.', image: 'roof-review-slate-to-profiled-sheet.webp', text: 'Крыша была старая, шифер местами треснул, а обрешётка уже просела. Бригада сняла покрытие, заменила плохие доски и уложила профнастил. Перед началом согласовали материалы и смету. Работы провели без долгих простоев, старый шифер и строительный мусор вывезли.' },
  { name: 'Людмила · Сосново', work: 'Что делали: ремонт кровли дома и монтаж водостоков.', image: 'roof-review-drainage-repair.webp', text: 'Во время дождя вода переливалась через край и попадала на стену дома. Проверили свесы, поправили покрытие и установили новую водосточную систему. Отдельно укрепили участок возле карниза. После сдачи вместе осмотрели результат, объяснили, как следить за желобами и когда их лучше чистить.' },
  { name: 'Андрей · Вырица', work: 'Что делали: ремонт стропил и повреждённого ската.', image: 'roof-review-rafter-repair.webp', text: 'На одном скате появилась заметная просадка. Бригадир осмотрел крышу и сразу показал слабые места. Частично сняли покрытие, усилили стропила, заменили повреждённую обрешётку и восстановили кровлю. В смету лишнюю полную замену не добавляли, отремонтировали именно проблемный участок.' },
  { name: 'Ольга · Сиверский', work: 'Что делали: замена кровельного покрытия на дачном доме.', image: 'roof-review-metal-tile-replacement.webp', text: 'Старая крыша уже протекала в нескольких местах, поэтому решили не латать её каждый сезон. Бригада демонтировала покрытие, проверила основание и уложила металлочерепицу. Цвет и комплектующие выбрали заранее. Рабочие приезжали вовремя, после завершения собрали обрезки и оставили участок в нормальном состоянии.' },
  { name: 'Сергей · Ульяновка', work: 'Что делали: ремонт протечки и замена повреждённых листов.', image: 'roof-review-extension-leak.webp', text: 'После дождей начало мокнуть возле пристройки. Бригадир осмотрел крышу, нашёл проблемное примыкание и показал, где вода заходила под покрытие. Рабочие разобрали небольшой участок, заменили повреждённые листы и восстановили герметизацию. Полностью перекрывать крышу не стали, сделали только необходимый ремонт. После нескольких ливней внутри сухо.' },
  { name: 'Александр и Наталья · Лебяжье', work: 'Что делали: замена старого покрытия на металлочерепицу.', image: 'roof-review-full-cover-replacement.webp', text: 'Старая кровля уже выработала своё, местами появились трещины и протечки. Бригада сняла покрытие, проверила стропила и заменила слабые участки обрешётки. Затем уложили металлочерепицу, установили конёк и доборные элементы. Стоимость согласовали заранее, серьёзных доплат в процессе не появилось. Старый материал после работ вывезли.' },
  { name: 'Валентина · Мельниково', work: 'Что делали: локальный ремонт шиферной кровли.', image: 'roof-review-slate-local-repair.webp', text: 'На старом доме треснуло несколько листов шифера, а возле трубы стало подтекать. Мастера приехали на осмотр, аккуратно заменили повреждённые участки и поправили примыкание. Заодно проверили конёк и крепления на соседнем скате. Не стали навязывать полную замену крыши.' },
  { name: 'Дмитрий · Агалатово', work: 'Что делали: замена шифера на профнастил и ремонт обрешётки.', image: 'roof-review-profiled-sheet-replacement.webp', text: 'Крыша была старая, шифер местами раскололся, а несколько досок под ним начали прогибаться. Бригада демонтировала покрытие, усилила основание и смонтировала профнастил. Отдельно сделали проход трубы и установили новые планки по краям. Работы закончили в согласованный срок, участок после демонтажа привели в порядок.' },
];
if (reviewsSection && !isRecoveryPage) {
  const reviewItems = isExtensionsPage ? extensionReviews : roofReviews;
  reviewsSection.className = 'reviews section-paper';
  reviewsSection.innerHTML = `<div class="container"><div class="section-heading heading-row"><div><p class="eyebrow">Отзывы клиентов</p><h2>${isExtensionsPage ? 'Что говорят владельцы<br>готовых пристроек' : 'Когда всё понятно<br>с первого звонка'}</h2></div><p>${isExtensionsPage ? 'Отзывы о строительстве пристроек, веранд и террас.' : 'Сохраняем честные отзывы и показываем, как проходит работа на объекте.'}</p></div><div class="reviews-grid">${reviewItems.map((item, i) => { const source = i % 2 === 0 ? 'Яндекс Услуги' : 'Авито'; const sourceFile = i % 2 === 0 ? 'yandex-services-review-source.webp' : 'avito-review-source.webp'; const stars = Array.from({ length: 5 }, () => '<svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z"/></svg>').join(''); return `<article class="review-card"><div class="review-media" style="background-image:url('/assets/${item.image}')"></div><h3>${item.name}</h3><strong class="stars">${stars}</strong>${item.work ? `<b class="review-work">${item.work}</b>` : ''}<p>«${item.text}»</p><button class="review-toggle" type="button" aria-label="Показать отзыв полностью" aria-expanded="false"></button><small class="review-source">Источник: <img src="/assets/${sourceFile}" alt="${source}"></small></article>`; }).join('')}</div></div>`;
  reviewsSection.querySelectorAll('.review-card').forEach((card) => { const button = card.querySelector('.review-toggle'); button.onclick = () => { const isOpen = card.classList.toggle('is-open'); button.setAttribute('aria-expanded', String(isOpen)); button.setAttribute('aria-label', isOpen ? 'Свернуть отзыв' : 'Показать отзыв полностью'); }; });
}
