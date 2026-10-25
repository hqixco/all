import fs from 'node:fs';
const file='scripts/generate-seo.mjs';let s=fs.readFileSync(file,'utf8');
const block=`const apartmentSolutions = () => {
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
`;
s=s.replace('const apartmentHero =',block+'const apartmentHero =').replace("solutions:p=>section('Варианты для вашего объекта',cards(p.solutions),'examples'),", "solutions:p=>p.slug === 'okna-v-kvartiru' ? apartmentSolutions() : section('Варианты для вашего объекта',cards(p.solutions),'examples'),");fs.writeFileSync(file,s);
