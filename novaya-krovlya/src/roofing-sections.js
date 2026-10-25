const quizSection = document.querySelector('.quiz');
const casesSection = document.querySelector('.cases');
const reviewsSection = document.querySelector('.reviews');
const isFrameHousesPage = document.body.dataset.page === 'frame-houses';
const isExtensionsPage = document.body.dataset.service === 'extensions' && !isFrameHousesPage;
const isRecoveryPage = document.body.dataset.service === 'recovery';
const isFacadePage = document.body.dataset.service === 'facade';
const isFloorsPage = document.body.dataset.service === 'floors';

const frameHouseQuizQuestions = [
  ['Какой дом хотите построить?', ['Одноэтажный', 'С мансардой', 'Двухэтажный', 'Дачный дом', 'Для постоянного проживания', 'Пока не знаю'], ['extension-type-living-room.webp', 'extension-two-storey-01.webp', 'extension-two-storey-03.webp', 'extension-type-terrace.webp', 'extension-warm-veranda-01.webp', 'quiz-not-sure.webp']],
  ['Какая примерная площадь?', ['До 60 м²', '60–90 м²', '90–120 м²', '120–160 м²', 'Больше 160 м²', 'Пока не знаю'], []],
  ['Какая комплектация нужна?', ['Силовой каркас', 'Тёплый контур', 'Под ключ с отделкой', 'Нужна консультация'], ['extension-process-frame.webp', 'extension-process-warm-contour.webp', 'extension-living-room-03.webp', 'quiz-not-sure.webp']],
  ['Есть ли проект?', ['Есть готовый проект', 'Есть планировка или эскиз', 'Нужно подобрать проект', 'Нужно спроектировать дом'], []],
  ['Когда хотите начать?', ['Срочно', 'В течение месяца', 'Через 1–2 месяца', 'В этом сезоне', 'Планирую заранее', 'После консультации'], []],
];

const facadeQuizQuestions = [
  ['Что нужно сделать?', ['Утеплить и оштукатурить', 'Утеплить под сайдинг', 'Смонтировать термопанели', 'Обновить отделку', 'Устранить промерзание', 'Нужна консультация'], []],
  ['Из чего сделаны стены?', ['Кирпич', 'Газобетон', 'Дерево', 'Каркас', 'Смешанный материал', 'Не знаю'], []],
  ['Какая примерная площадь фасада?', ['До 80 м²', '80–140 м²', '140–220 м²', '220–350 м²', 'Больше 350 м²', 'Не знаю площадь'], []],
  ['Какую отделку рассматриваете?', ['Штукатурный фасад', 'Сайдинг', 'Фасадные панели', 'Термопанели', 'Материал уже куплен', 'Нужна консультация'], []],
  ['Когда хотите начать работы?', ['Срочно', 'В течение недели', 'В этом месяце', 'Через 1–2 месяца', 'В этом сезоне', 'После консультации'], []],
];

const floorsQuizQuestions = [
  ['Что нужно сделать?', ['Заменить старый пол', 'Заменить лаги', 'Утеплить перекрытие', 'Устранить скрип и прогиб', 'Подготовить под покрытие', 'Нужна консультация'], []],
  ['Какой пол сейчас?', ['Деревянная доска', 'Фанера или ОСП', 'Ламинат или линолеум', 'Пол по грунту', 'Смешанная конструкция', 'Не знаю'], []],
  ['Какая примерная площадь?', ['До 30 м²', '30–60 м²', '60–100 м²', '100–150 м²', 'Больше 150 м²', 'Не знаю площадь'], []],
  ['Какой результат нужен?', ['Новая доска пола', 'Основание под ламинат', 'Утеплённый черновой пол', 'Полный ремонт перекрытия', 'Материал уже куплен', 'Нужна консультация'], []],
  ['Когда хотите начать работы?', ['Срочно', 'В течение недели', 'В этом месяце', 'Через 1–2 месяца', 'Планирую заранее', 'После консультации'], []],
];

const quizQuestions = isFacadePage ? facadeQuizQuestions : isFloorsPage ? floorsQuizQuestions : isFrameHousesPage ? frameHouseQuizQuestions : isExtensionsPage ? [
  ['Какую пристройку хотите?', ['Жилая комната', 'Кухня или столовая', 'Тёплая веранда', 'Терраса или навес', 'Тамбур или крыльцо', 'Пока не знаю'], ['quiz-extension-living-room.webp', 'quiz-extension-kitchen.webp', 'quiz-extension-warm-veranda.webp', 'quiz-extension-terrace.webp', 'quiz-extension-entrance.webp', 'quiz-extension-not-sure.webp']],
  ['Из чего построен основной дом?', ['Брус или бревно', 'Кирпич', 'Газобетон', 'Каркасный дом', 'Смешанный материал', 'Нужно смотреть на месте'], ['quiz-house-timber.webp', 'quiz-house-brick.webp', 'quiz-house-aerated-concrete.webp', 'quiz-house-frame.webp', 'quiz-house-mixed.webp', 'quiz-house-inspection.webp']],
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
  form.querySelector('.quiz-next').addEventListener('click', () => { if (isLeadStep) return; if (step < quizQuestions.length - 1) { step += 1; renderQuiz(); return; } isLeadStep = true; form.querySelector('.quiz-options').innerHTML = `<div class="quiz-final-fields"><input name="name" required autocomplete="name" placeholder="Ваше имя"><input name="phone" required type="tel" placeholder="Телефон"><label class="upload">${isFacadePage ? 'Прикрепить фотографии фасада' : isFloorsPage ? 'Прикрепить фотографии пола' : isFrameHousesPage ? 'Прикрепить план или пример дома' : isExtensionsPage ? 'Прикрепить фотографии дома' : 'Прикрепить фотографии крыши'} <input name="photos[]" type="file" multiple accept="image/*"></label><label class="consent"><input name="policy" required type="checkbox" value="Согласие получено"><span>Соглашаюсь с <a href="/privacy.html">политикой конфиденциальности</a></span></label></div>`; window.addFormFieldTitles?.(form.querySelector('.quiz-final-fields')); answers.forEach((answer, index) => { const hidden = document.createElement('input'); hidden.type = 'hidden'; hidden.name = `quiz_answer_${index + 1}`; hidden.value = answer; form.append(hidden); }); form.dataset.formName = isFacadePage ? 'Квиз — расчёт утепления фасада' : isFloorsPage ? 'Квиз — расчёт замены полов' : isFrameHousesPage ? 'Квиз — расчёт каркасного дома' : isExtensionsPage ? 'Квиз — расчёт пристройки' : 'Квиз — предварительный расчёт кровли'; form.querySelector('.quiz-question').textContent = 'Куда отправить предварительный расчёт?'; form.querySelector('.quiz-next').innerHTML = `Получить расчёт ${inlineIcon('up-right')}`; form.querySelector('.quiz-next').onclick = async () => { const button = form.querySelector('.quiz-next'); const status = form.querySelector('.quiz-status'); if (typeof window.sendNovayaKrovlyaLeadForm === 'function') await window.sendNovayaKrovlyaLeadForm(form, button, status); }; });
  
}

const roofingCaseData = [
  {
    title: 'Замена старого шифера на металлочерепицу',
    area: 132,
    location: 'город Грязи, Липецкая область',
    days: 7,
    price: '380 тыс. ₽',
    description: 'Демонтировали старое покрытие, восстановили обрешётку, уложили гидроизоляцию и смонтировали новую металлочерепицу.',
    images: ['slate-to-metal-roof-01.webp', 'slate-to-metal-roof-02.webp', 'slate-to-metal-roof-03.webp', 'slate-to-metal-roof-04.webp'],
  },
  {
    title: 'Монтаж металлочерепицы на жилом доме',
    area: 96,
    location: 'село Доброе, Липецкая область',
    days: 3,
    price: 'от 90 тыс. ₽',
    description: 'Подготовили основание, смонтировали контробрешётку и обрешётку, уложили металлочерепицу, установили конёк и торцевые планки.',
    images: ['residential-metal-roof-01.webp', 'residential-metal-roof-02.webp', 'residential-metal-roof-03.webp', 'residential-metal-roof-04.webp', 'residential-metal-roof-05.webp'],
  },
  {
    title: 'Новая кровля на кирпичном доме',
    area: 118,
    location: 'город Лебедянь, Липецкая область',
    days: 5,
    price: 'от 145 тыс. ₽',
    description: 'Собрали кровельное основание, уложили гидроизоляцию и синюю металлочерепицу, оформили конёк, карнизы и примыкания.',
    images: ['brick-house-new-roof-01.webp', 'brick-house-new-roof-02.webp', 'brick-house-new-roof-03.webp'],
  },
  {
    title: 'Монтаж кровли на деревянном доме',
    area: 145,
    location: 'город Задонск, Липецкая область',
    days: 7,
    price: 'от 210 тыс. ₽',
    description: 'Смонтировали стропильную систему, гидроизоляцию и обрешётку, уложили металлочерепицу и закрыли доборными элементами все узлы кровли.',
    images: ['timber-house-roof-01.webp', 'timber-house-roof-02.webp', 'timber-house-roof-03.webp'],
  },
  {
    title: 'Монтаж металлочерепицы на частном доме',
    area: 128,
    location: 'село Хлевное, Липецкая область',
    days: 6,
    price: 'от 165 тыс. ₽',
    description: 'Уложили гидроизоляцию, смонтировали контробрешётку и обрешётку, установили металлочерепицу и доборные элементы.',
    images: ['private-house-metal-roof-01.webp', 'private-house-metal-roof-02.webp', 'private-house-metal-roof-03.webp'],
  },
  {
    title: 'Монтаж кровли на деревянном доме',
    area: 104,
    location: 'город Усмань, Липецкая область',
    days: 5,
    price: 'от 135 тыс. ₽',
    description: 'Подготовили кровельное основание, уложили мембрану, смонтировали обрешётку и покрыли крышу профнастилом.',
    images: ['wooden-house-profiled-roof-01.webp', 'wooden-house-profiled-roof-02.webp', 'wooden-house-profiled-roof-03.webp', 'wooden-house-profiled-roof-04.webp'],
  },
  {
    title: 'Кровля на доме из бревна',
    area: 136,
    location: 'город Чаплыгин, Липецкая область',
    days: 7,
    price: 'от 185 тыс. ₽',
    description: 'Собрали стропильную систему, выполнили гидроизоляцию и обрешётку, смонтировали металлочерепицу и коньковые элементы.',
    images: ['log-house-roof-01.webp', 'log-house-roof-02.webp', 'log-house-roof-03.webp'],
  },
  {
    title: 'Монтаж кровли на каркасном доме',
    area: 168,
    location: 'город Данков, Липецкая область',
    days: 8,
    price: 'от 230 тыс. ₽',
    description: 'Смонтировали стропила, кровельную мембрану и обрешётку, уложили металлочерепицу и оформили карнизы и фронтоны.',
    images: ['frame-house-roof-01.webp', 'frame-house-roof-02.webp', 'frame-house-roof-03.webp'],
  },
  {
    title: 'Замена кровли на доме сложной формы',
    area: 205,
    location: 'город Елец, Липецкая область',
    days: 12,
    price: 'от 340 тыс. ₽',
    description: 'Демонтировали старое покрытие, восстановили основание, уложили гидроизоляцию и смонтировали металлочерепицу на всех скатах и пристройках.',
    images: ['complex-house-roof-replacement-01.webp', 'complex-house-roof-replacement-02.webp', 'complex-house-roof-replacement-03.webp', 'complex-house-roof-replacement-04.webp'],
  },
  {
    title: 'Реконструкция кровли на доме с пристройкой',
    area: 142,
    location: 'село Тербуны, Липецкая область',
    days: 8,
    price: 'от 175 тыс. ₽',
    description: 'Усилили стропильную систему, подготовили обрешётку, смонтировали зелёный профнастил и оформили карнизы, фронтоны и примыкания.',
    images: ['house-extension-roof-reconstruction-01.webp', 'house-extension-roof-reconstruction-02.webp', 'house-extension-roof-reconstruction-03.webp'],
  },
];

const extensionCaseData = [
  { title: 'Утеплённая веранда с внутренней отделкой', area: 16, location: 'город Лебедянь', days: 8, price: 'от 198 тыс. ₽', description: 'Подготовили основание, собрали и утеплили деревянный каркас, смонтировали кровлю, окна, дверь и отделку.', images: ['case-warm-veranda-facade.webp', 'case-warm-veranda-base.webp', 'case-warm-veranda-porch.webp'] },
  { title: 'Надстройка мансардного этажа', area: 58, location: 'город Грязи', days: 18, price: 'от 549 тыс. ₽', description: 'Подготовили основание, собрали силовой каркас мансарды, установили окна, утеплили стены и смонтировали новую кровлю.', images: ['case-room-finished.webp', 'case-room-roof-frame.webp', 'case-room-gable.webp', 'case-room-before.webp'] },
  { title: 'Терраса с навесом и ограждением', area: 20, location: 'город Чаплыгин', days: 6, price: 'от 149 тыс. ₽', description: 'Сделали свайное основание, каркас и настил, смонтировали навес, лестницу и деревянное ограждение.', images: ['case-terrace-finished.webp', 'case-terrace-build.webp', 'case-terrace-ready.webp'] },
  { title: 'Входная пристройка с крыльцом', area: 8, location: 'село Доброе', days: 5, price: 'от 119 тыс. ₽', description: 'Собрали утеплённый каркас, односкатную кровлю, установили окно и дверь, сделали отделку и крыльцо.', images: ['case-extension-detail.webp', 'case-extension-main.webp'] },
  { title: 'Утеплённая веранда с остеклением', area: 20, location: 'город Задонск', days: 9, price: 'от 219 тыс. ₽', description: 'Смонтировали свайное основание, тёплый каркас, панорамные окна, входную дверь и наружную отделку.', images: ['case-extension-2-detail.webp', 'case-extension-2-main.webp'] },
  { title: 'Каркасная пристройка под жилую комнату', area: 18, location: 'город Усмань', days: 10, price: 'от 239 тыс. ₽', description: 'Построили утеплённую жилую пристройку, смонтировали кровлю и водосток, установили окна и дверь.', images: ['case-extension-3-main.webp', 'case-extension-3-build.webp', 'case-extension-3-detail.webp'] },
  { title: 'Двухэтажная пристройка к дачному дому', area: 40, location: 'город Елец', days: 18, price: 'от 449 тыс. ₽', description: 'Собрали силовой каркас двух уровней, межэтажное перекрытие, утеплённую кровлю, окна и фасад.', images: ['case-extension-4-main.webp', 'case-extension-4-build.webp', 'case-extension-4-detail.webp'] },
];

const frameHouseCaseData = [
  { title: 'Одноэтажный дом для постоянного проживания', area: 96, location: 'Липецк', days: 78, price: 'от 2,9 млн ₽', description: 'Выполнили фундамент, силовой каркас, утепление, кровлю, фасад, окна и внутреннюю отделку.', images: ['extension-living-room-01.webp', 'extension-living-room-02.webp', 'extension-living-room-03.webp'] },
  { title: 'Каркасный дом с мансардой', area: 118, location: 'город Грязи, Липецкая область', days: 92, price: 'от 3,6 млн ₽', description: 'Собрали дом с жилой мансардой, утеплили контур, смонтировали кровлю, окна, фасад и коммуникации.', images: ['extension-two-storey-01.webp', 'extension-two-storey-02.webp', 'extension-two-storey-03.webp'] },
  { title: 'Компактный загородный дом', area: 64, location: 'город Задонск, Липецкая область', days: 61, price: 'от 2,1 млн ₽', description: 'Построили тёплый дом с кухней-гостиной, двумя спальнями и готовой наружной отделкой.', images: ['extension-warm-veranda-01.webp', 'extension-warm-veranda-02.webp', 'extension-warm-veranda-03.webp'] },
  { title: 'Дом с панорамным остеклением', area: 104, location: 'город Елец, Липецкая область', days: 86, price: 'от 3,4 млн ₽', description: 'Реализовали открытую планировку, большие окна, утеплённый контур и чистовую отделку.', images: ['extension-glazed-veranda-01.webp', 'extension-glazed-veranda-02.webp'] },
  { title: 'Дачный каркасный дом', area: 48, location: 'город Лебедянь, Липецкая область', days: 49, price: 'от 1,6 млн ₽', description: 'Собрали сезонный дом с кровлей, фасадом, окнами и внутренней отделкой.', images: ['extension-covered-terrace-01.webp', 'extension-covered-terrace-02.webp', 'extension-covered-terrace-03.webp'] },
  { title: 'Двухэтажный семейный дом', area: 146, location: 'город Данков, Липецкая область', days: 112, price: 'от 4,7 млн ₽', description: 'Построили двухэтажный каркас, тёплый контур, кровлю и подготовили дом к заселению.', images: ['extension-two-storey-03.webp', 'extension-two-storey-02.webp', 'extension-two-storey-01.webp'] },
  { title: 'Мансардный этаж на дачном доме', area: 78, location: 'объект из портфолио', days: 24, price: '1,18 млн ₽', description: 'Проверили стены и перекрытие, собрали каркас мансарды, смонтировали кровлю и утеплили контур.', images: ['dostroit-second-floor-case-01.webp'] },
  { title: 'Полноценный каркасный второй этаж', area: 96, location: 'объект из портфолио', days: 38, price: '1,92 млн ₽', description: 'Усилили опирание перекрытий, собрали стены второго этажа и закрыли дом кровлей и мембранами.', images: ['dostroit-second-floor-case-02.webp'] },
  { title: 'Каркасная надстройка над блочным домом', area: 84, location: 'объект из портфолио', days: 31, price: '1,54 млн ₽', description: 'Оценили основание, подготовили силовую обвязку, собрали лёгкий каркас, оконные проёмы и кровельный пирог.', images: ['dostroit-second-floor-case-03.webp'] },
  { title: 'Второй этаж с новой кровлей', area: 88, location: 'объект из портфолио', days: 34, price: '1,76 млн ₽', description: 'Усилили слабые участки, собрали каркас этажа, смонтировали стропила, покрытие и водостоки.', images: ['dostroit-second-floor-case-04.webp'] },
];
const facadeCaseData = roofingCaseData.map((item, index) => ({
  ...item,
  title: ['Утепление кирпичного дома минеральной ватой', 'Штукатурный фасад частного дома', 'Утепление фасада дома из газобетона', 'Вентилируемый фасад деревянного дома', 'Отделка фасадными панелями', 'Утепление дома под сайдинг', 'Тёплый фасад загородного дома'][index % 7],
  description: ['Подготовили стены, закрепили минеральную вату, выполнили армирующий слой и декоративную штукатурку.', 'Выровняли основание, смонтировали систему утепления и нанесли финишное декоративное покрытие.', 'Закрепили утеплитель, усилили углы и проёмы, выполнили базовый и финишный слои.', 'Собрали подсистему, установили утеплитель и ветрозащиту, смонтировали наружную облицовку.', 'Подготовили стены, утеплили фасад и установили панели с оформлением углов и откосов.', 'Смонтировали обрешётку, утеплитель, защитную мембрану и сайдинг с доборными элементами.', 'Утеплили наружные стены и оформили фасад, откосы, цоколь и примыкания.'][index % 7],
}));
const floorsCaseData = roofingCaseData.map((item, index) => ({
  ...item,
  title: ['Замена старого деревянного пола', 'Новый пол по деревянным лагам', 'Утепление пола первого этажа', 'Ремонт балок и лаг перекрытия', 'Основание под ламинат', 'Замена пола в деревянном доме', 'Полный ремонт перекрытия'][index % 7],
  description: ['Демонтировали старые доски, проверили и усилили лаги, уложили утеплитель и новый пол.', 'Выровняли лаги, устроили черновое основание и подготовили ровную поверхность под покрытие.', 'Открыли перекрытие, заменили повреждённые элементы, смонтировали мембраны и утеплитель.', 'Усилили балки, заменили слабые лаги и собрали новое надёжное основание пола.', 'Собрали ровное жёсткое основание из листового материала под чистовое покрытие.', 'Поэтапно разобрали старый пол, восстановили конструкцию и уложили новые доски.', 'Заменили повреждённую конструкцию, утеплили перекрытие и подготовили пол к отделке.'][index % 7],
}));
const caseData = isFacadePage ? facadeCaseData : isFloorsPage ? floorsCaseData : isFrameHousesPage ? frameHouseCaseData : isExtensionsPage ? extensionCaseData : roofingCaseData;

const galleryModal = document.querySelector('.gallery-modal');

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
  if (typeof galleryModal.showModal === 'function') galleryModal.showModal();
  else {
    galleryModal.setAttribute('open', '');
    galleryModal.setAttribute('aria-modal', 'true');
    galleryModal.setAttribute('role', 'dialog');
  }
}

function closeGalleryModal() {
  if (!galleryModal.hasAttribute('open') || galleryModal.classList.contains('is-closing')) return;
  galleryModal.classList.add('is-closing');
  clearTimeout(galleryCloseTimer);
  galleryCloseTimer = setTimeout(() => {
    if (typeof galleryModal.close === 'function') galleryModal.close();
    else galleryModal.removeAttribute('open');
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
  if (!galleryModal.hasAttribute('open')) return;
  if (event.key === 'Escape') closeGalleryModal();
  if (event.key === 'ArrowLeft') moveGalleryModal(-1);
  if (event.key === 'ArrowRight') moveGalleryModal(1);
});

if (casesSection && !isRecoveryPage) {     casesSection.querySelectorAll('.case-card').forEach((card) => { const item = caseData[[...casesSection.querySelectorAll('.case-card')].indexOf(card)]; const photo = card.querySelector('.case-photo img'); const set = (n) => { const index = (n + item.images.length) % item.images.length; photo.src = `/assets/${item.images[index]}`; photo.alt = `${item.title}, фото ${index + 1}`; card.dataset.index = index; }; card.querySelector('[data-dir=prev]').onclick = () => set(Number(card.dataset.index || 0) - 1); card.querySelector('[data-dir=next]').onclick = () => set(Number(card.dataset.index || 0) + 1); card.querySelector(`[data-gallery-open]`).onclick = () => openGalleryModal(item, Number(card.dataset.index || 0)); }); }

if (reviewsSection && !isRecoveryPage) {
  
  
  
  reviewsSection.querySelectorAll('.review-card').forEach((card) => { const button = card.querySelector('.review-toggle'); button.onclick = () => { const isOpen = card.classList.toggle('is-open'); button.setAttribute('aria-expanded', String(isOpen)); button.setAttribute('aria-label', isOpen ? 'Свернуть отзыв' : 'Показать отзыв полностью'); }; });
}
