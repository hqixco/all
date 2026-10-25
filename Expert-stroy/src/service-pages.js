const serviceType = document.body.dataset.service;

const offers = {
  insulation: {
    title: 'Утепление домов в Екатеринбурге и области',
    description: 'Утепление стен, фасада, пола, перекрытий и кровли частных домов. Осмотр, теплотехническое решение и монтаж под ключ.',
    eyebrow: 'Утепление домов · Екатеринбург и область',
    hero: 'Утеплим дом без сырости,<br>продувания и мостиков холода <em>под ключ</em>',
    lead: 'Найдём причины теплопотерь, подберём толщину и тип утеплителя, защитим конструкцию от влаги и выполним наружную отделку.',
    action: 'Рассчитать утепление',
    quizTitle: 'Рассчитайте утепление<br>вашего дома',
    quizText: 'Ответьте на несколько вопросов — определим подходящую конструкцию и предварительный бюджет.',
    questions: [
      ['Что нужно утеплить?', ['Стены и фасад', 'Пол и перекрытие', 'Кровлю или мансарду', 'Фундамент и цоколь', 'Дом комплексно', 'Нужна диагностика']],
      ['Из чего построен дом?', ['Брус или бревно', 'Каркас', 'Кирпич', 'Газобетон', 'Смешанный материал', 'Не знаю']],
      ['Примерная площадь?', ['До 50 м²', '50–100 м²', '100–150 м²', 'Более 150 м²', 'Не знаю']],
    ],
    casesTitle: 'Дома, которые<br>стали теплее',
    cases: [
      ['Утепление деревянного дома', '14 дней', '96 м²', 'Полевской', 'Минеральная вата, ветрозащита, вентзазор и новый фасад.', 'recovery-plan-complex-structural-repair.webp'],
      ['Тёплая мансарда без конденсата', '8 дней', '74 м²', 'Сысерть', 'Исправили пароизоляцию, утеплили скаты и устранили мостики холода.', 'roof-insulation.webp'],
      ['Утепление пола и цоколя', '10 дней', '82 м²', 'Берёзовский', 'Утеплили перекрытие, закрыли продувание и защитили цоколь от влаги.', 'recovery-check-floors.webp'],
    ],
    plansTitle: 'Утепляем весь контур дома',
    plans: [
      ['Стены и фасад', 'от 1 600 ₽/м²', 'Утеплитель, мембраны, вентзазор и фасадная отделка с правильным отводом влаги.'],
      ['Кровля и мансарда', 'от 1 400 ₽/м²', 'Утепление скатов или перекрытия, пароизоляция и устранение продуваемых узлов.'],
      ['Пол и цоколь', 'от 1 300 ₽/м²', 'Утепление перекрытия и основания, защита от влаги и холодного подполья.'],
    ],
    process: ['Осматриваем дом', 'Находим источники теплопотерь', 'Подбираем конструкцию', 'Фиксируем смету и этапы', 'Монтируем утепление и защиту', 'Проверяем узлы и сдаём работу'],
    faq: [
      ['Можно утеплять деревянный дом снаружи?', 'Да. Важно подобрать паропроницаемую систему, правильно установить ветрозащиту и оставить вентиляционный зазор.'],
      ['Какую толщину утеплителя выбрать?', 'Толщина зависит от материала стен, существующей конструкции и режима использования дома. Её определяем после осмотра.'],
      ['Почему после утепления появляется сырость?', 'Обычно причина в ошибках пароизоляции, вентиляции или расположении слоёв. Мы проверяем весь узел, а не только толщину утеплителя.'],
      ['Можно утеплить только одну холодную комнату?', 'Да, если источник холода локальный. Сначала проверим стены, пол, перекрытие, окна и примыкания.'],
    ],
    photoLabel: 'Фотографии дома и холодных участков',
  },
};

const offer = offers[serviceType];

if (offer) {
  document.title = `${offer.title} — Эксперт Строй`;
  document.querySelector('meta[name="description"]')?.setAttribute('content', offer.description);
  const icon = '<svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8"/></svg>';
  const options = (question, index) => `<fieldset><legend><span>0${index + 1}</span>${question[0]}</legend><div class="option-grid">${question[1].map((item) => `<label><input type="radio" name="answer_${index + 1}" value="${item}" required><span>${item}</span></label>`).join('')}</div></fieldset>`;
  const caseCards = offer.cases.map((item) => `<article class="case-card"><div class="case-photo"><img src="/assets/${item[5]}" alt="${item[0]}" loading="lazy"></div><h3>${item[0]}</h3><div class="case-info"><span>Срок <b>${item[1]}</b></span><span>Объём <b>${item[2]}</b></span><small>Объект · ${item[3]}</small><p>${item[4]}</p></div><a class="button button-accent" href="#estimate">Рассчитать мой объект ${icon}</a></article>`).join('');
  const planCards = offer.plans.map((item, index) => `<article class="plan-card ${index === 1 ? 'plan-featured' : ''}"><span class="plan-number">0${index + 1}</span><h3>${item[0]}</h3><strong>${item[1]}</strong><p>${item[2]}</p><a class="text-link" href="#estimate">Получить расчёт ${icon}</a></article>`).join('');
  const faq = offer.faq.map((item, index) => `<details ${index === 0 ? 'open' : ''}><summary>${item[0]}</summary><p>${item[1]}</p></details>`).join('');

  const main = document.querySelector('main');
  main.innerHTML = `
    <section class="hero"><div class="container hero-grid"><div class="hero-copy"><p class="eyebrow">${offer.eyebrow}</p><h1>${offer.hero}</h1><p class="lead">${offer.lead}</p><div class="hero-actions"><a class="button button-accent" href="#estimate">${offer.action} ${icon}</a><a class="button button-ghost" href="tel:+79324030126">Позвонить прорабу</a></div><p class="microcopy">Пришлите фотографии и населённый пункт — предварительно оценим объём и диапазон стоимости до выезда.</p></div><div class="hero-visual"><div class="hero-materials">${offer.plans.map((item, index) => `<article><img src="/assets/${offer.cases[index][5]}" alt="${item[0]}"><div><b>${item[0]}</b><span>${item[2]}</span><strong>${item[1]}</strong><em aria-hidden="true">${icon}</em></div></article>`).join('')}<article class="hero-materials__cta"><div><b>${offer.action}</b><span>Предварительная оценка по фото</span><strong>Бесплатно</strong><em aria-hidden="true">${icon}</em></div></article></div></div></div><div class="container benefits"><article><b>01</b><h3>Смета до начала работ</h3><p>Отдельно показываем работы, материалы и доставку.</p></article><article><b>02</b><h3>Договор и гарантия</h3><p>Фиксируем объём, сроки и стоимость.</p></article><article><b>03</b><h3>Оплата по этапам</h3><p>Не требуем полной оплаты до начала монтажа.</p></article></div></section>
    <section class="promo-strip" aria-label="Специальная скидка"><div class="container promo-strip__inner"><span class="promo-strip__text">Скидка <strong>до 15%</strong> ветеранам СВО и пенсионерам</span><a class="promo-strip__button" href="#estimate">Зафиксировать скидку</a></div></section>
    <section class="service-quiz section-paper" id="estimate"><div class="container"><div class="section-heading"><p class="eyebrow">Предварительный расчёт</p><h2>${offer.quizTitle}</h2><p>${offer.quizText}</p></div><div class="service-quiz__layout"><aside class="quiz-manager"><p class="label">На связи</p><h3>Сергей,<br>прораб</h3><p>Посмотрит фотографии, уточнит детали и предложит подходящий вариант.</p><div class="manager-reply">Ответим<br><strong>за 10 минут</strong></div></aside><form class="service-quiz__form" data-form-name="Квиз — ${offer.action}">${offer.questions.map(options).join('')}<div class="quiz-final-fields"><input name="place" required placeholder="Населённый пункт"><input name="phone" required type="tel" placeholder="Телефон"><label class="upload">${offer.photoLabel} <input name="photos[]" type="file" multiple accept="image/*"></label><label class="consent"><input name="policy" required type="checkbox" value="Согласие получено"><span>Соглашаюсь с <a href="/privacy-policy/">политикой конфиденциальности</a></span></label><button class="button button-accent" type="submit">Получить расчёт ${icon}</button><div class="quiz-status"></div></div></form></div></div></section>
    <section class="service-cases section-paper"><div class="container"><div class="section-heading heading-row"><div><p class="eyebrow">Реальные объекты</p><h2>${offer.casesTitle}</h2></div><p>Показываем выполненные работы, срок, объём и состав решения.</p></div><div class="cases-grid">${caseCards}</div></div></section>
    <section class="plans section-cream" id="replacement"><div class="container"><div class="section-heading"><p class="eyebrow">Варианты работ</p><h2>${offer.plansTitle}</h2></div><div class="plan-grid">${planCards}</div><p class="section-footnote">Точную стоимость фиксируем после осмотра и замера объекта.</p></div></section>
    <section class="process section-paper" id="process"><div class="container"><div class="section-heading"><p class="eyebrow">Понятный процесс</p><h2>От осмотра до готового результата</h2></div><div class="process-grid">${offer.process.map((item, index) => `<article><b>${String(index + 1).padStart(2, '0')}</b><h3>${item}</h3><p>Согласуем результат этапа до продолжения работ.</p></article>`).join('')}</div></div></section>
    <section class="guarantee section-cream" id="guarantee"><div class="container split-section"><div><p class="eyebrow">Договор и гарантия</p><h2>Все обязательства<br>фиксируем заранее</h2></div><div><p class="lead">До выхода бригады согласуем состав работ, материалы, сроки и порядок оплаты.</p><ul class="contract-list"><li>понятная смета без скрытых позиций</li><li>гарантия на выполненные работы</li><li>доплаты только после согласования</li><li>уборка участка после монтажа</li></ul></div></div></section>
    <section class="faq section-paper" id="faq"><div class="container split-section"><div class="section-heading"><p class="eyebrow">Отвечаем заранее</p><h2>Частые вопросы</h2></div><div class="faq-list">${faq}</div></div></section>
    <section class="final-cta section-orange"><div class="container final-layout"><div><p class="eyebrow">Первый шаг — фотографии</p><h2>Получите предварительный расчёт до выезда прораба</h2><p class="lead">Отправьте фотографии объекта и коротко опишите задачу.</p></div><form data-form-name="${offer.action} по фото"><input name="phone" type="tel" placeholder="Телефон" required><input name="place" type="text" placeholder="Населённый пункт" required><label class="upload upload-light">${offer.photoLabel} <input name="photos[]" type="file" multiple accept="image/*"></label><label class="consent consent-light"><input name="policy" type="checkbox" required><span>Соглашаюсь с <a href="/privacy-policy/">политикой конфиденциальности</a></span></label><button class="button button-dark" type="submit">Получить оценку ${icon}</button></form></div></section>
    <section class="geo section-paper"><div class="container geo-inner"><div><p class="eyebrow">Выезжаем к вам</p><h2>Екатеринбург<br>и Свердловская область</h2><small>Стоимость логистики заранее включаем в расчёт.</small></div><img class="geo-map" src="/assets/geo-map.png" alt="Карта выездов по Екатеринбургу и Свердловской области" loading="lazy"><a class="button button-accent" href="#estimate">Уточнить выезд ${icon}</a></div></section>`;

  const brandText = document.querySelector('.brand-copy small');
  if (brandText) brandText.innerHTML = 'Утепление домов<br>Екатеринбург и область';
  document.querySelectorAll('.site-header .button, .footer-action .button').forEach((button) => { button.textContent = offer.action; });
  const serviceMenu = document.querySelector('.nav-dropdown__menu');
  if (serviceMenu && !serviceMenu.querySelector('a[href="/uteplenie-doma/"]')) serviceMenu.insertAdjacentHTML('beforeend', '<a href="/uteplenie-doma/">Утепление домов</a>');
}
