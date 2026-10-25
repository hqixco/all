import { apartmentQuizQuestions } from '../src/apartment-quiz.js';
import { scopeSections } from './page-sections.mjs';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { pages } from '../seo-pages/data.js';
import { headerMarkup, photoModalMarkup, syncFooterMenus } from './sync-header.mjs';
const origin = 'https://okna-vertical.ru';
const home = fs.readFileSync('index.html','utf8');
const escape = value => String(value).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const section = (title, body, id='') => `<section class="seo-section"${id ? ` id="${id}"` : ''}><div class="home-wrap"><h2>${title}</h2>${body}</div></section>`;
const cards = items => `<div class="seo-grid">${items.map(([title,text])=>`<article class="seo-card"><h3>${title}</h3><p>${text}</p></article>`).join('')}</div>`;
const label = slug => slug==='balkony' ? 'Балконы и лоджии' : pages.find(p=>p.slug===slug)?.name;
const links = slugs => `<div class="seo-links">${slugs.map(s=>`<a href="/${s}/">${label(s)}</a>`).join('')}</div>`;
let header = headerMarkup();
let footer = home.match(/<footer class="site-footer home-site-footer">[\s\S]*?<\/footer>/)[0];
const rewrite = html => html.replace(/href="#(calculator|reviews|company|faq|windows|works|compare|installation|top)"/g,(_,id)=> `href="${({company:'/o-kompanii/',works:'/portfolio/',installation:'/montazh-okon/',top:'/',calculator:'#calculator'}[id]) || '/#'+id}"`);
header = rewrite(header);

footer = rewrite(footer).replace('<strong>Клиентам</strong>',`<strong>Клиентам</strong>${links(['ceny','rassrochka','garantiya','kontakty'])}`).replace('<span>→</span>','').replace('Вернуться наверх ↑','На главную');
const directFormLinks = html => html.replace(/\sdata-package-[a-z-]+="[^"]*"/g,'').replace(/<button\s+class="button button--small button--red"\s+type="button"\s*>/,'<a class="button button--small button--red" href="#calculator">').replace(/(<span>Рассчитать по фото<\/span>\s*)<\/button>/,'$1</a>');
header = directFormLinks(header);
footer = directFormLinks(footer);
const metrika = home.match(/<!-- Yandex.Metrika counter -->[\s\S]*?<!-- \/Yandex.Metrika counter -->/)[0];
const business = JSON.parse(home.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
const jsonLd = data => `<script type="application/ld+json">${JSON.stringify(data).replaceAll('<','\\u003c')}</script>`;
const form = p => section('Получить расчёт и консультацию',`<p>Оставьте телефон — уточним размеры, комплектацию и состав работ.</p><form class="home-lead-form seo-form" action="/mail.php" method="post"><input type="hidden" name="source_name" value="${escape(p.name)}"><label>Телефон<input name="phone" type="tel" autocomplete="tel" placeholder="+7 (___) ___-__-__" required></label><label>Что нужно рассчитать?<textarea name="comment" rows="3" placeholder="Размеры, количество проёмов, адрес объекта"></textarea></label><label class="seo-consent"><input type="checkbox" name="policy" required><span>Согласен с <a href="/politika-konfidentsialnosti/">политикой конфиденциальности</a></span></label><button class="button button--red" type="submit">Получить расчёт</button><p class="home-form-status" aria-live="polite"></p></form>`,'calculator');
const pricing = () => section('Стоимость и состав заказа', `<p>Ориентиры из прайса сайта. Итог зависит от размеров и комплектации; позиции сметы согласуем после замера.</p>${cards([['Изделие','Одностворчатое окно — от 7 000 ₽; двухстворчатое — от 8 400 ₽; трёхстворчатое — от 12 600 ₽.'],['С монтажом','Изделие рассчитывается отдельно. Монтаж окна — от 3 150 ₽ за штуку; итог заказа подтверждаем в смете.'],['Дополнительные работы','Демонтаж — от 1 100 ₽ за окно; монтаж откосов — от 1 750 ₽ за проём; доставка по Рыбинску — от 1 750 ₽ за выезд.'],['Дополнительные опции','Подоконник — от 850 ₽ за погонный метр; москитная сетка — от 1 050 ₽ за штуку. Цвет, стеклопакет и фурнитуру рассчитываем отдельно.']])}<a href="#calculator">Запросить смету под свой объект</a>`);
const warranty = () => section('Гарантия на изделия и монтаж',cards([['Изделия','Условия на профиль, стеклопакеты и фурнитуру проверяйте в документах к заказу.'],['Монтаж','Гарантия на монтажные работы указывается отдельно в договоре.'],['Обращение','Сообщите номер договора, опишите проблему и приложите фото. Позвоните в офис: 8 (4855) 20-55-86.']])+'<a href="/garantiya/">Подробнее о гарантии и обращении</a>');
const process = () => section('Как проходит работа',cards([['1. Обсуждаем задачу','Принимаем размеры и фото, уточняем требования.'],['2. Проверяем проёмы','Согласуем замер, комплектацию и смету.'],['3. Оформляем заказ','Фиксируем состав, стоимость и сроки в договоре.'],['4. Передаём результат','Выполняем согласованные работы и объясняем правила ухода.']]));
const localReviews = p => {
 const articles = [...home.matchAll(/<article class="review-card">([\s\S]*?)<\/article>/g)].filter(m => p.slug !== 'okna-v-kvartiru' || /квартир/i.test(m[1])).slice(0,3).map(m => '<article class="seo-card">' + m[1].replace(/<div[\s\S]*?<\/div>/,'').replace(/<strong>[\s\S]*?<\/strong>/,'') + '</article>').join('');
 return section('Отзывы клиентов', '<div class="seo-grid">' + articles + '</div>', 'reviews');
};
const sourceCases = [...home.matchAll(/<article class="case-card">([\s\S]*?)<\/article>/g)].map(m=>m[0]);
const selectedCases = sourceCases.filter((_,i)=>[0,7,8].includes(i));
async function photo(file, role='hero') {
 const width = role==='backdrop' ? 2112 : role==='hero' ? 775 : 520;
 const name = `seo-${file.replace(/\.[^.]+$/,'')}-${role}.webp`;
 const output = `public/assets/${name}`;
 const buffer = await sharp(`public/assets/${file}`).resize({width,withoutEnlargement:true}).webp({quality:82}).toBuffer();
 fs.writeFileSync(output,buffer);
 const meta = await sharp(buffer).metadata();
 return {src:'/assets/'+name,width:meta.width,height:meta.height};
}
const image = (img,alt,lazy=true) => `<img src="${img.src}" width="${img.width}" height="${img.height}" alt="${escape(alt)}" ${lazy?'loading="lazy"':'fetchpriority="high"'}>`;
const heroBenefits = () => `<div class="seo-hero-benefits" aria-label="Преимущества заказа">
 <div class="seo-hero-benefit"><svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><rect x="5" y="4" width="22" height="24" rx="2"/><path d="M16 4v24M5 16h22M12 10h1M20 21h1"/></svg><span>Комплектация  под ваш объект</span></div>
 <div class="seo-hero-benefit"><svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><rect x="7" y="3" width="18" height="26" rx="3"/><path d="M11 8h10v5H11zM11 18h2M19 18h2M11 23h2M19 23h2"/></svg><span>Согласованный  состав сметы</span></div>
 <div class="seo-hero-benefit"><svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M19 3H7a2 2 0 0 0-2 2v22a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V11L19 3Z"/><path d="M19 3v8h8M11 16h10M11 21h5M19 24l2 2 5-5"/></svg><span>Условия заказа  в договоре</span></div>
</div>`;
async function cases() {
 let result = '';
 for (const [i,card] of selectedCases.entries()) {
  const file = card.match(/src="\/assets\/([^"]+)"/)[1];
  const title = card.match(/<h3>([\s\S]*?)<\/h3>/)[1];
  const body = card.match(/<div class="case-breakdown">([\s\S]*?)<\/div>\s*<button/)[1];
  const img = await photo(file,'case');
  const type = /квартир/i.test(title)?'apartments':/балкон|лоджи/i.test(title)?'balconies':'houses';
  result += `<article class="seo-card" data-project-type="${type}" data-project-slug="${['apartment-window','brick-house','warm-balcony'][i]}">${image(img,title)}<h3>${title}</h3><div class="case-breakdown">${body}</div><a href="#calculator">Рассчитать похожий проект</a></article>`;
 }
 return section('Проекты из портфолио',`<label class="seo-filter" hidden>Тип объекта<select id="project-filter"><option value="all">Все работы</option><option value="apartments">Квартиры</option><option value="houses">Дома</option><option value="balconies">Балконы</option></select></label><div class="seo-grid">${result}</div><p>Указанные суммы и сроки относятся к показанным проектам. Новый заказ рассчитывается отдельно.</p>`);
}
const portfolio = await cases();
const apartmentIcon = (path) => `<svg viewBox="0 0 32 32" fill="none" aria-hidden="true">${path}</svg>`;
const apartmentTiles = await Promise.all([
 ['apartment-two-sash-card.webp', 'Двухстворчатые окна', 'от 8 400 ₽', '#calculator'],
 ['apartment-three-sash-card.webp', 'Трёхстворчатые окна', 'от 12 600 ₽', '#calculator'],
 ['apartment-balcony-block-card.webp', 'Балконные блоки', 'от 17 500 ₽', '/balkonnye-bloki/'],
 ['apartment-quiet-window-card.webp', 'Окна с шумоизоляцией', 'Подбор стеклопакета', '#calculator'],
].map(async ([file,title,caption,href]) => {
 const {width,height} = await sharp(`public/assets/${file}`).metadata();
 return {img:{src:`/assets/${file}`,width,height},title,caption,href};
}));
const apartmentSolutions = () => {
 const details = [
  ['Для жилых комнат', 'Универсальный вариант для спальни или кухни. Подберём открывание и стеклопакет под ваш проём.', 'Створки', 'Две', 'Комплектация', 'По размерам проёма'],
  ['Для широких проёмов', 'Остекление широкого проёма в гостиной. Согласуем расположение открывающихся створок.', 'Створки', 'Три', 'Открывание', 'На выбор'],
  ['Выход на балкон', 'Окно и балконная дверь в одном блоке. Учтём порог, радиатор и расположение подоконника.', 'Конструкция', 'Окно + дверь', 'Монтаж', 'По согласованию'],
  ['Для шумных улиц', 'Подберём стеклопакет с учётом уличного шума, этажа и расположения квартиры.', 'Стеклопакет', 'Подбор под задачу', 'Стоимость', 'Индивидуальный расчёт']
 ];
 return '<section class="home-products home-page" id="examples"><div class="home-wrap"><h2>Варианты окон для квартиры</h2><p class="home-section-lead">Подберём конструкцию для ваших проёмов. Цены на изделия указаны без монтажа; итоговую комплектацию и состав работ согласуем после замера.</p><div class="home-product-grid">' + apartmentTiles.map((tile,i) => {
  const d = details[i];
  return '<article class="home-product-card"><div class="home-product-card__visual">' + image(tile.img,tile.title) + '<img class="home-product-card__veka" src="/assets/veka-logo.png" alt="VEKA"></div><div class="home-product-card__content"><span>' + d[0] + '</span><h3>' + tile.title + '</h3><p>' + d[1] + '</p><dl><div><dt>' + d[2] + '</dt><dd>' + d[3] + '</dd></div><div><dt>' + d[4] + '</dt><dd>' + d[5] + '</dd></div></dl><strong><small>' + (i === 3 ? 'под вашу задачу' : 'за изделие') + '</small>' + (i === 3 ? 'По расчёту' : tile.caption) + '</strong><button class="home-product-card__button" type="button" data-package-title="' + escape(tile.title) + '" data-package-modal-title="' + escape('Рассчитать ' + tile.title.toLowerCase()) + '" data-package-description="' + escape(d[1]) + '" data-package-image="' + tile.img.src + '">Рассчитать стоимость<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5"/></svg></button></div></article>';
 }).join('') + '</div></div></section>';
};
const apartmentHero = (img, breadcrumb) => {
 const icons = [apartmentIcon('<rect x="4" y="3" width="24" height="26" rx="2"/><path d="M16 3v26M4 16h24M10 8l-2 3M23 21l-2 3"/>'), apartmentIcon('<rect x="7" y="2" width="18" height="28" rx="2"/><path d="M11 7h10v5H11zM11 18h2M19 18h2M11 24h2M19 24h2"/>'), apartmentIcon('<path d="M16 2 28 7v9c0 7-5 11-12 15C9 27 4 23 4 16V7L16 2Z"/><path d="m10 16 4 4 8-9"/>')];
 const calendar = apartmentIcon('<rect x="4" y="6" width="24" height="23" rx="3"/><path d="M10 2v8M22 2v8M4 14h24M10 20h2M20 20h2M10 25h2"/>');
 const clock = apartmentIcon('<circle cx="16" cy="16" r="13"/><path d="M16 8v9l6 4"/>');
 return `<section class="apartment-hero"><img class="apartment-hero__backdrop" src="${img.src}" width="${img.width}" height="${img.height}" alt="" aria-hidden="true" fetchpriority="high">${breadcrumb}<div class="home-wrap apartment-hero__content"><div class="apartment-hero__copy"><p class="apartment-hero__kicker hero-kicker">РЫБИНСК И РЫБИНСКИЙ РАЙОН</p><h1>Пластиковые окна <span>в квартиру</span> в Рыбинске</h1><p class="apartment-hero__lead">Замена окон в жилой квартире: подберём открывание, стеклопакет и отделку проёма с учётом шума за окном и ваших привычек.</p><div class="apartment-hero__cards">${['Комплектация под ваш объект','Согласованный состав сметы','Условия заказа в договоре'].map((title,i)=>`<article><div>${icons[i]}<strong>${title}</strong></div><p>${['Подберём профиль, стеклопакет и фурнитуру под ваши задачи','Фиксируем все работы и материалы. Без скрытых платежей','Сроки, гарантия, монтаж и сервис — всё прописано в договоре'][i]}</p></article>`).join('')}</div><div class="apartment-hero__actions"><a class="button button--red" href="#calculator">${icons[1]}Рассчитать стоимость${apartmentIcon('<path d="m12 6 10 10-10 10"/>')}</a><a class="apartment-hero__measure" href="#calculator">${calendar}Согласовать замер</a><span class="apartment-hero__free">${clock}<span>Бесплатный замер в удобное время</span></span></div></div><div class="home-page home-hero__products apartment-hero__products" aria-label="Окна для квартиры">${apartmentTiles.map(tile=>`<a class="home-hero-card" href="${tile.href}">${image(tile.img,tile.title,false)}<span>${tile.title}</span><b>${tile.caption}</b><i aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12h14M14 7l5 5-5 5"/></svg></i></a>`).join('')}</div></div></section>${home.match(/<div class="home-facts home-wrap"[\s\S]*?<\/div>\s*<\/section>/)[0].replace(/\s*<\/section>$/, "")}`;
};
const apartmentQuiz = () => {
 const question = apartmentQuizQuestions[0];
 let quiz = home.match(/<section class="quiz-section"[^>]*>[\s\S]*?<\/section>/)[0];
 quiz = quiz.replace('id="quiz"','id="apartment-quiz"').replace('<h2>Получить предварительный расчет</h2>','<h2>Рассчитайте окна для вашей квартиры</h2>');
 quiz = quiz.replace(/(<div class="quiz-heading">[\s\S]*?<p>)[\s\S]*?(<\/p>)/,'$1Ответьте на 5 вопросов — подберём конструкцию, стеклопакет и состав работ для замены окон в квартире.$2');
 quiz = quiz.replace(/<div class="question-meta">[^<]*<\/div>/,'<div class="question-meta">Вопрос 1 из 5</div>').replace('<div class="progress"><span></span></div>','<div class="progress"><span style="width:20%"></span></div>');
 quiz = quiz.replace(/(<div class="quiz-card">[\s\S]*?<h3>)[\s\S]*?<\/h3>\s*<p>[\s\S]*?<\/p>/,'$1'+question.title+'</h3><p>'+question.description+'</p>');
 quiz = quiz.replace(/<div class="quiz-options">[\s\S]*?<\/div>/,'<div class="quiz-options">'+Array.from({length:5},(_,i)=>'<button class="quiz-option" type="button"'+(i>=question.options.length?' hidden':'')+'><i class="quiz-img"'+(question.images[i]?' style="background-image:url('+question.images[i]+')"':'')+' aria-hidden="true"></i><b><em></em><span class="quiz-option__copy"><span>'+ (question.options[i] ? (i+1)+'. '+question.options[i] : '') +'</span></span></b></button>').join('')+'</div>');
 quiz = quiz.replace('Куда отправить расчет остекления?','Куда отправить расчёт окон для квартиры?').replace(/(<p class="quiz-result__lead">)[\s\S]*?<\/p>/,'$1Уточним размеры и подготовим предварительную смету на окна и выбранные работы.</p>').replace('Расскажите о задаче','Размеры проёмов, этаж и пожелания к окнам');
 quiz = quiz.replace('<form class="quiz-result__form">','<form class="quiz-result__form"><input type="hidden" name="quiz_answers"><input type="hidden" name="source_name" value="Квиз: окна в квартиру">');
 quiz = quiz.replaceAll('<span>→</span>','<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5"/></svg>');
 quiz = quiz.replace(/<\/form>\s*<\/div>/,'</form>\n              </div><div class="quiz-success" hidden><h3>Заявка отправлена</h3><p>Специалист свяжется с вами и уточнит размеры окон для квартиры.</p></div>');
 return quiz;
};
const apartmentIncluded = () => {
 let content = home.match(/<section class="home-included">[\s\S]*?<\/section>/)[0];
 content = content.replace('class="home-included"','class="home-included home-page" id="prices"');
 content = content.replace(/src="\/assets\/window-installation-estimate.jpg"/,'src="/assets/apartment-estimate.webp" width="473" height="678" loading="lazy"');
 content = content.replace('Что входит в стоимость','Что входит в стоимость окон в квартиру');
 content = content.replace(/(<p class="home-included__lead">)[\s\S]*?<\/p>/,'$1В смете отдельно указываем окна и выбранные работы: доставку, демонтаж, монтаж и отделку проёмов. Комплектацию и итоговую цену согласуем после замера до начала работ.</p>');
 content = content.replaceAll('Включено в базовую цену','В составе согласованной сметы').replace('Доставка в пределах Рыбинска','Доставка по Рыбинску').replace('<b>Замер</b','<b>Замер проёмов квартиры</b').replace('<b>Демонтаж</b','<b>Демонтаж старых окон</b').replace('<b>Монтаж</b','<b>Монтаж новых окон</b');
 content = content.replace(/<div class="quiz-success"[\s\S]*?<h3>Заявка отправлена<\/h3>[\s\S]*?<\/div>/,'');
 return content;
};
const apartmentInstallation = () => {
 let content = home.match(/<section class="installation-section"[^>]*>[\s\S]*?<\/section>/)[0];
 content = content.replace('class="installation-section"','class="installation-section"');
 content = content.replace('Подбираем монтажный узел под материал стен','Монтаж окон в квартире с учётом материала стен');
 content = content.replace(/(<div class="installation-heading">[\s\S]*?<p>)[\s\S]*?<\/p>/,'$1Перед заменой окон проверяем материал и состояние проёмов, откосы и примыкания. Подбираем крепление и защиту монтажного шва, чтобы сохранить тепло и защитить квартиру от продувания.</p>');
 content = content.replace(/<button\b[^>]*class="wall-tab[^" ]*(?: is-active)?"[^>]*>[\s\S]*?<\/button>/g, tab => /data-wall-key="(?:frame|wood)"/.test(tab) ? '' : tab);
 content = content.replace('Кирпичный дом','Кирпичные стены');
 content = content.replace(/>До изготовления проверяем проёмы, стены, фасад и будущую\s+отделку. Подбираем решение, которое будет работать\s+десятилетиями./,'>До изготовления проверяем проёмы квартиры, состояние кладки, подоконники и откосы. Согласуем крепление, монтажные материалы и отделку до начала работ.');
 content = content.replace('Наружная отделка фасада','Защита наружного примыкания');
 content = content.replace('src="/assets/installation-aerated.webp" width', 'loading="lazy" src="/assets/installation-aerated.webp" width');
 return content;
};
const apartmentCases = () => {
 let content = home.match(/<section class="cases-section"[^>]*>[\s\S]*?<\/section>/)[0];
 content = content.replace('id="works"','id="apartment-cases"').replace('class="cases-section"','class="cases-section" data-case-category="apartments"');
 content = content.replace('Показываем установленные окна на реальных объектах','Примеры установки окон в квартирах');
 content = content.replace(/<nav class="cases-menu"[\s\S]*?<\/nav>/,'');
 content = content.replace(/<article class="case-card">[\s\S]*?<\/article>/g,card => /src="\/assets\/apartment-window-/.test(card) ? card : '');
 content = content.replace(/<img([^>]*src="\/assets\/apartment-window-[^>]*?)\s*\/?>/g,'<img$1 loading="lazy">');
 content = content.replace(/<div(\s+class="case-photo[^" ]*(?: [^"]*)?case-photo--gallery[^"]*"[^>]*)>([\s\S]*?)<\/div>/g, (whole,attrs,body) => {
  const photos = [...body.matchAll(/<img[^>]*src="([^"]+)"[^>]*>/g)];
  let photoIndex = 0;
  body = body.replace(/<img\b/g, () => '<img class="' + (photoIndex++ === 0 ? 'is-active' : '') + '"');
  const controls = photos.length > 1 ? '<button class="case-slider__nav case-slider__nav--prev" type="button" aria-label="Предыдущее фото"></button><button class="case-slider__nav case-slider__nav--next" type="button" aria-label="Следующее фото"></button>' : '';
  const thumbs = photos.length > 1 ? '<div class="case-slider__thumbs" aria-label="Миниатюры кейса">' + photos.map((m,i)=>'<button class="case-slider__thumb'+(i===0?' is-active':'')+'" type="button" aria-label="Показать фото '+(i+1)+'" aria-pressed="'+(i===0)+'" style="background-image:url('+m[1]+')"></button>').join('') + '</div>' : '';
  return '<div'+attrs.replace(/class="([^"]+)"/,'class="$1 is-case-slider"')+'>'+body+controls+'</div>'+thumbs;
 });
 content = content.replaceAll('<span>→</span>','<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5"/></svg>');
 return content;
};
const galleryMarkup = home.match(/<div class="gallery-modal"[\s\S]*?<div class="gallery-modal__counter"><\/div>\s*<\/div>\s*<\/div>/)[0];
const apartmentWarranty = () => {
 let content = home.match(/<section class="warranty-section"[^>]*>[\s\S]*?<\/section>/)[0];
 content = content.replace(/(<div class="warranty-table-wrap">\s*<h2>)[\s\S]*?<\/h2>/,'$1Гарантия на окна в квартиру и монтажные работы</h2>');
 content = content.replace(/(<p class="warranty-lead">)[\s\S]*?<\/p>/,'$1Гарантия распространяется на оконные конструкции, стеклопакеты, фурнитуру и монтаж. Сроки и условия вашего заказа фиксируем в договоре.</p>');
 content = content.replace('Оконные конструкции (ПВХ и алюминий)','Оконные конструкции (ПВХ)').replace('info@vertical-rybinsk.ru','mail@vertyar.ru');
 content = content.replaceAll('/assets/warranty-cta.jpg','/assets/apartment-two-sash-card.webp').replace('alt="Загородный дом с панорамным остеклением"','width="535" height="401" loading="lazy" alt="Пластиковое окно в квартире"');
 content = content.replace('href="#compare"','href="#calculator"').replace('data-package-title="гарантии и сервису"','data-package-title="гарантии на окна в квартире"').replace('data-package-modal-title="Гарантия и сервисное обслуживание"','data-package-modal-title="Сервисная заявка по окнам в квартире" data-package-description="Укажите телефон — уточним номер договора, проблему с окном и согласуем дальнейшие действия."');
 content = content.replaceAll('<span>→</span>','<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5"/></svg>');
 content = content.replace(/<div class="warranty-cta">[\s\S]*?<\/div>\s*<\/div>\s*<\/section>/, '</div></section>');
 return content;
};
const apartmentReviews = () => {
 let content = home.match(/<section class="reviews-section okna-reviews"[^>]*>[\s\S]*?<\/section>/)[0];
 content = content.replace('Что говорят заказчики после установки окон','Отзывы после замены окон в квартире');
 content = content.replace(/<article class="review-card">[\s\S]*?<\/article>/g, card => {
  if (!/квартир/i.test(card) || /остекление\s+лоджии/i.test(card)) return '';
  const stars = '<strong aria-label="Оценка: 5 из 5"><svg viewBox="0 0 120 24" width="100" height="20" fill="currentColor" aria-hidden="true">' + Array.from({length:5},(_,i)=>'<path transform="translate('+i*24+' 0)" d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8-6.2-3.2L5.8 21 7 14.2 2 9.3l6.9-1L12 2Z"/>').join('') + '</svg></strong>';
  return card.replace(/<strong>★+<\/strong>/,stars).replace(/<\/p>/,'</p><button class="review-card__toggle" type="button" aria-label="Показать отзыв полностью" aria-expanded="false" hidden></button>');
 });
 content = content.replaceAll('<b aria-hidden="true">→</b>','<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5"/></svg>');
 return content;
};
const apartmentFaqEntries = [
 ['Можно заменить одно окно?', 'Да, можно рассчитать замену одного проёма. Сообщите его примерные размеры и пожелания к открыванию.'],
 ...[...home.match(/<section class="home-faq"[^>]*>[\s\S]*?<\/section>/)[0].matchAll(/<details>\s*<summary>([\s\S]*?)<\/summary>\s*<p>([\s\S]*?)<\/p>\s*<\/details>/g)]
  .map(m => [m[1].replace(/\s+/g,' ').trim(),m[2].replace(/\s+/g,' ').trim()])
  .filter(([question]) => ['Сколько времени занимает изготовление окон?','Можно ли заказать окна с монтажом?','Как понять точную цену?','Можно ли заменить окна зимой?','Делаете ли вы демонтаж старых окон?','Можно ли заказать вывоз строительного мусора?','Входят ли подоконники, отливы и откосы в цену?','Какая гарантия действует на окна и монтаж?'].includes(question))
];
const apartmentFaq = () => '<section class="home-faq home-page" id="faq"><div class="home-wrap"><p class="home-kicker">FAQ</p><h2>Вопросы об окнах в квартиру</h2>' + apartmentFaqEntries.map(([question,answer])=>'<details><summary>'+question+'</summary><p>'+answer+'</p></details>').join('') + '</div></section>';
const apartmentCalculator = () => {
  const template = home.match(/<section class="home-calculator" id="calculator">[\s\S]*?<\/section>/)?.[0];
  if (!template) throw new Error('Homepage calculator template not found');
  return template
    .replace('class="home-calculator"', 'class="home-calculator home-page"')
    .replace('Узнайте ориентировочную стоимость окон', 'Узнайте стоимость окон в квартиру')
    .replace('Ответьте на несколько вопросов — получите расчёт стоимости окон с учётом монтажа и доставки.', 'Укажите количество и размеры окон в квартире, выберите необходимые работы — получите предварительный расчёт.')
    .replace('указываем финальную цену', 'согласуем смету после замера')
    .replace(/<p>Куда устанавливаем\?<\/p>\s*<div class="home-calc-options home-calc-options--place">[\s\S]*?<\/div>/, '<input type="hidden" name="installation_place" value="apartment" />')
    .replace('<form class="home-lead-form home-calculator__form">', '<form class="home-lead-form home-calculator__form" action="/mail.php" method="post"><input type="hidden" name="source_name" value="Калькулятор: окна в квартиру" />');
};
const apartmentFooter = (() => {
 let content = home.match(/<footer class="site-footer home-site-footer">[\s\S]*?<\/footer>/)[0];
 content = content.replace('class="site-footer home-site-footer"','class="site-footer home-site-footer apartment-footer"');
 content = content.replace(/(<div class="footer-brand">[\s\S]*?<p>)[\s\S]*?<\/p>/,'$1Пластиковые окна и балконные блоки для квартир с монтажом в Рыбинске и Ярославской области.</p>');
 content = content.replace('data-package-title="расчёта окон"','data-package-title="окон в квартиру"').replace('data-package-modal-title="Расчёт окон по фото и размерам"','data-package-modal-title="Рассчитать окна в квартиру" data-package-description="Прикрепите фото или укажите размеры проёмов — подготовим расчёт окон и монтажа для вашей квартиры."');
 content = content.replace('Нужны окна для квартиры, дачи или дома?', 'Нужны новые окна в квартиру?');
 content = content.replaceAll('<span>→</span>','<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5"/></svg>').replace('Вернуться наверх ↑','Вернуться наверх');
 content = content.replace('src="/assets/logo.webp"','src="/assets/logo.webp" width="178" height="29"');
 return content;
})();
const apartmentRelated = () => "<section class=\"related-section home-page\"><div class=\"home-wrap\"><h2>Также может быть интересно</h2><div class=\"related-grid\"><a class=\"related-card\" href=\"/balkonnye-bloki/\"><img src=\"/assets/related-balcony-block.webp\" width=\"570\" height=\"428\" loading=\"lazy\" alt=\"Балконные блоки\"><div class=\"related-card__content\"><h3>Балконные блоки</h3><p>Окно и балконная дверь в одном комплекте. Подберём размеры, открывание и отделку проёма.</p><span class=\"related-card__link\">Подробнее<svg viewBox=\"0 0 24 24\" width=\"20\" height=\"20\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" aria-hidden=\"true\"><path d=\"M5 12h14m-5-5 5 5-5 5\"/></svg></span></div></a><a class=\"related-card\" href=\"/moskitnye-setki/\"><img src=\"/assets/related-mosquito-net.webp\" width=\"570\" height=\"428\" loading=\"lazy\" alt=\"Москитные сетки\"><div class=\"related-card__content\"><h3>Москитные сетки</h3><p>Сетки для новых и существующих окон: подходящее полотно, крепления и удобное снятие.</p><span class=\"related-card__link\">Подробнее<svg viewBox=\"0 0 24 24\" width=\"20\" height=\"20\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" aria-hidden=\"true\"><path d=\"M5 12h14m-5-5 5 5-5 5\"/></svg></span></div></a><a class=\"related-card\" href=\"/montazh-okon/\"><img src=\"/assets/related-window-installation.webp\" width=\"570\" height=\"428\" loading=\"lazy\" alt=\"Монтаж окон\"><div class=\"related-card__content\"><h3>Монтаж окон</h3><p>Подготовка проёма, крепление рамы и защита монтажного шва с учётом материала стен.</p><span class=\"related-card__link\">Подробнее<svg viewBox=\"0 0 24 24\" width=\"20\" height=\"20\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" aria-hidden=\"true\"><path d=\"M5 12h14m-5-5 5 5-5 5\"/></svg></span></div></a><a class=\"related-card\" href=\"/ceny/\"><img src=\"/assets/related-window-prices.webp\" width=\"570\" height=\"428\" loading=\"lazy\" alt=\"Цены на окна\"><div class=\"related-card__content\"><h3>Цены на окна</h3><p>Стоимость изделий, монтажа и дополнительных работ — чтобы заранее оценить состав заказа.</p><span class=\"related-card__link\">Подробнее<svg viewBox=\"0 0 24 24\" width=\"20\" height=\"20\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" aria-hidden=\"true\"><path d=\"M5 12h14m-5-5 5 5-5 5\"/></svg></span></div></a></div></div></section>";
const blocks = {
 solutions:p=>p.slug === 'okna-v-kvartiru' ? apartmentSolutions() : section('Варианты для вашего объекта',cards(p.solutions),'examples'),
 choice:p=>p.slug === 'okna-v-kvartiru' ? apartmentQuiz() : section('Что учесть перед заказом',`<p>${p.choice}</p>`),
 price:p=>p.slug==='okna-v-kvartiru'?apartmentIncluded():p.slug==='ceny'?pricing():section('Как рассчитывается стоимость',`<p>${p.slug==='moskitnye-setki'?'Москитная сетка в текущем прайсе — от 1 050 ₽ за штуку. Размеры и крепление уточняем перед заказом.':'Размеры, выбранная конструкция и состав работ определяют итоговую смету. Отдельно согласуем изделие, монтаж, доставку и дополнительные опции.'}</p><a href="/ceny/">Посмотреть прайс и состав заказа</a>`,'prices'),
 apartmentCases,
 process:p=>p.slug === 'okna-v-kvartiru' ? apartmentInstallation() : process(),warranty:p=>p.slug === 'okna-v-kvartiru' ? apartmentWarranty() : warranty(),cases:()=>portfolio,
 estimate:()=>section('Что проверить в смете',cards([['Комплектация','Размеры, створки, профиль, стеклопакет и фурнитура.'],['Работы','Монтаж, демонтаж, откосы, доставка и вывоз — только согласованные позиции.'],['Итог','Окончательная сумма, порядок оплаты и сроки должны быть записаны в договоре.']])),
 installment:()=>section('Варианты оплаты частями',cards([['Без банков','На текущем сайте указана рассрочка до 3 месяцев без банков.'],['Через банк-партнёр','На сайте указана рассрочка до 36 месяцев без процентов. Доступность и условия уточняйте у менеджера.'],['Перед оформлением','Уточните первоначальный взнос, график платежей и необходимые документы. Условия вашего заказа фиксируются в документах.']])),
 claim:()=>section('Как обратиться по гарантии',`<ol><li>Найдите договор и номер заказа.</li><li>Опишите неисправность и сделайте фото.</li><li>Позвоните <a href="tel:+74855205586">8 (4855) 20-55-86</a> или напишите <a href="mailto:mail@vertyar.ru">mail@vertyar.ru</a>.</li><li>Согласуйте с офисом порядок проверки и дальнейшие действия.</li></ol><p>Применимость гарантии определяется условиями договора и результатом проверки. Правила эксплуатации и ухода смотрите в документах к изделиям.</p>`),
 company:()=>section('Команда и офис',cards([['С 2005 года','Год начала работы указан в шапке текущего сайта.'],['Одна команда','От первого обращения и замера до монтажа и гарантийного обслуживания.'],['Личная консультация','Офис: Рыбинск, улица Кирова, 6. Пн–Пт, 9:00–18:00.']])+'<a href="/portfolio/">Посмотреть выполненные работы</a>'),
 contacts:()=>section('Офис в Рыбинске',`<div class="seo-grid"><div class="seo-card"><h3>Адрес и часы работы</h3><p>Центральный микрорайон, улица Кирова, 6</p><p>Пн–Пт: 9:00–18:00</p></div><div class="seo-card"><h3>Телефон и почта</h3><p><a href="tel:+74855205586">8 (4855) 20-55-86</a></p><p><a href="mailto:mail@vertyar.ru">mail@vertyar.ru</a></p><a href="https://vk.com/vertyar" target="_blank" rel="noreferrer">ВКонтакте</a></div></div><p><a href="https://yandex.ru/maps/?text=Рыбинск%20Кирова%206" target="_blank" rel="noreferrer">Открыть адрес на карте</a></p><iframe class="seo-map" title="Офис на карте Рыбинска" src="https://maps.google.com/maps?q=Рыбинск%20Кирова%206&amp;output=embed" loading="lazy"></iframe>`)
};
for (const p of pages) {
 const pageBlocks = p.slug === 'okna-v-kvartiru' ? ['choice','apartmentCases','solutions','price','process','warranty'] : p.blocks;
 const darkHero = true;
 const img = await photo(p.slug === 'okna-v-kvartiru' ? 'hero-apartment-evening.webp' : p.image, darkHero ? 'backdrop' : 'hero');
 const crumbs = [{name:'Главная',url:'/'},...(/^(holodnoe|teploe|otdelka|balkonnye)/.test(p.slug)?[{name:'Балконы и лоджии',url:'/balkony/'}]:[]),{name:p.name,url:`/${p.slug}/`}];
 const breadcrumb = `<nav class="seo-breadcrumbs${darkHero ? ' seo-breadcrumbs--compact' : ''} home-wrap" aria-label="Хлебные крошки"><ol>${crumbs.map((c,i)=>`<li>${i===crumbs.length-1?`<span aria-current="page">${c.name}</span>`:`<a href="${c.url}">${c.name}</a>`}</li>`).join('')}</ol></nav>`;
 let hero = `<section class="seo-hero${darkHero ? ' seo-hero--dark' : ''}">${darkHero ? `<img class="seo-hero-backdrop" src="${img.src}" width="${img.width}" height="${img.height}" alt="" aria-hidden="true" fetchpriority="high">` : ''}${darkHero ? breadcrumb : ""}<div class="home-wrap ${darkHero ? 'seo-hero-content' : 'seo-hero-grid'}"><div${darkHero ? ' class="seo-hero-copy"' : ''}><p class="hero-kicker">РЫБИНСК И РЫБИНСКИЙ РАЙОН</p><h1>${p.h1}</h1><p>${p.lead}</p>${heroBenefits()}<div class="seo-actions"><a class="button button--red" href="#calculator">Рассчитать стоимость</a><a href="/#calculator">Согласовать замер</a></div></div>${darkHero ? '' : image(img,p.h1,false)}</div></section>`;
 if (p.slug === 'okna-v-kvartiru') hero = apartmentHero(img, breadcrumb);
 const faq = p.slug === 'okna-v-kvartiru' ? apartmentFaq() : section('Вопросы и ответы',`<details><summary>${p.faq[0]}</summary><p>${p.faq[1]}</p></details>`,'faq');
 const url = origin+'/'+p.slug+'/';
 const schemas = [business,{'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:crumbs.map((c,i)=>({'@type':'ListItem',position:i+1,name:c.name,item:origin+c.url}))},{'@context':'https://schema.org','@type':'FAQPage',mainEntity:(p.slug === 'okna-v-kvartiru' ? apartmentFaqEntries : [p.faq]).map(([question,answer])=>({'@type':'Question',name:question,acceptedAnswer:{'@type':'Answer',text:answer}}))}];
 const html = `<!doctype html><html lang="ru" class="page-seo"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escape(p.h1)} | Окна Вертикаль</title><meta name="description" content="${escape(p.lead)} Рыбинск и Рыбинский район."><meta name="robots" content="index, follow"><link rel="canonical" href="${url}"><link rel="icon" href="/assets/favicon-vert.png"><meta property="og:type" content="website"><meta property="og:title" content="${escape(p.h1)}"><meta property="og:description" content="${escape(p.lead)}"><meta property="og:url" content="${url}"><meta property="og:image" content="${origin+img.src}">${metrika}${schemas.map(jsonLd).join('')}<link rel="stylesheet" href="/assets/header.css"></head><body class="home-site">${headerMarkup(`/${p.slug}/`)}<main class="seo-page" id="top">${darkHero ? "" : breadcrumb}${hero}${pageBlocks.map(b=>blocks[b](p)).join('')}${p.solutions ? (p.slug === 'okna-v-kvartiru' ? apartmentReviews() : localReviews(p)) : ''}${faq}${p.slug === "okna-v-kvartiru" ? apartmentCalculator() : form(p)}${p.slug === 'okna-v-kvartiru' ? apartmentRelated() : section('Связанные направления',links(p.related))}</main>${p.slug === "okna-v-kvartiru" ? apartmentFooter : footer}${photoModalMarkup}${p.slug === "okna-v-kvartiru" ? galleryMarkup : ""}<script src="/assets/quiz-video.js" defer></script><script type="module" src="/src/main.js"></script><script type="module" src="/src/seo.js"></script><script src="/assets/header.js" defer></script></body></html>`;
 fs.mkdirSync(p.slug,{recursive:true});fs.writeFileSync(path.join(p.slug,'index.html'),scopeSections(syncFooterMenus(html,'/'+p.slug+'/'),p.slug,['hero',...pageBlocks.map(b=>b === 'apartmentCases' ? 'cases' : b),...(p.solutions ? ['reviews'] : []),'faq','calculator','related']));
}
const notFound = `<!doctype html><html lang="ru" class="page-seo"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Страница не найдена | Окна Вертикаль</title><meta name="robots" content="noindex, follow"><link rel="icon" href="/assets/favicon-vert.png"><link rel="stylesheet" href="/assets/header.css"></head><body class="home-site">${headerMarkup("/404.html")}<main class="seo-page"><section class="seo-section seo-not-found seo-hero--dark"><div class="home-wrap"><p class="seo-error-code">404</p><h1>Такой страницы нет</h1><p>Возможно, ссылка устарела или в адресе есть ошибка.</p><div class="seo-actions"><a class="button button--red" href="/">На главную</a><a href="/#calculator">Рассчитать стоимость окон</a></div>${links(['balkony','okna-v-chastnyj-dom','osteklenie-verand-terras','ceny','kontakty'])}</div></section></main>${footer}${photoModalMarkup}<script type="module" src="/src/main.js"></script><script type="module" src="/src/seo.js"></script><script src="/assets/header.js" defer></script></body></html>`;
fs.writeFileSync('404.html',scopeSections(syncFooterMenus(notFound.replaceAll('href="#calculator"','href="/#calculator"'),'/404.html'),'404.html',['hero']));
fs.writeFileSync('public/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${['','balkony','osteklenie-kottedzhey',...pages.map(p=>p.slug)].map(s=>`\n<url><loc>${origin}/${s?s+'/':''}</loc></url>`).join('')}\n</urlset>\n`);
fs.writeFileSync('public/robots.txt',`User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`);
console.log(`Generated ${pages.length} static pages and 404.`);
