// Shared customer stories. Categories describe only work mentioned in the review.
const reviews = [
  {
    "mediaStyle": "\n                  background-image: url(\"/assets/review-user-07.jpg\");\n                ",
    "titleHtml": "Алексей · Ярославская область",
    "textHtml": "\n                Остекляли новый дом из газобетона ещё до наружной отделки. На\n                фасаде предусмотрены большие окна, панорамные конструкции и\n                остекление под скатом крыши, поэтому особенно переживали за\n                точность размеров. Специалист несколько раз всё проверил,\n                согласовал открывания и предложил тёмные рамы под будущий фасад.\n                Конструкции получились именно такими, как планировали по\n                проекту. Монтаж выполнили аккуратно, несмотря на большой объём\n                работы.\n              ",
    "sourceClass": "review-card__source review-card__source--yandex",
    "sourceHtml": "Источник:",
    "topic": "Окна в загородный дом",
    "categories": [
      "house",
      "panoramic",
      "laminated",
      "installation"
    ]
  },
  {
    "mediaStyle": "\n                  background-image: url(\"/assets/review-maria-balcony.webp\");\n                ",
    "titleHtml": "Мария · Рыбинск",
    "textHtml": "\n                Заказывала остекление лоджии в квартире. Хотелось сохранить как\n                можно больше света и сделать пространство аккуратным и удобным.\n                На замере подсказали, как лучше расположить открывающиеся\n                створки, и подобрали подходящую комплектацию. Окна установили\n                ровно, все примыкания сделали аккуратно. На лоджии стало уютнее,\n                теплее и значительно меньше слышно улицу.\n              ",
    "sourceClass": "review-card__source review-card__source--avito",
    "sourceHtml": "Источник:",
    "topic": "Остекление лоджии",
    "categories": [
      "balcony",
      "installation"
    ]
  },
  {
    "mediaStyle": "\n                  background-image: url(\"/assets/review-user-09.jpg\");\n                ",
    "titleHtml": "Сергей и Наталья · Рыбинский район",
    "textHtml": "\n                Остекляли входную веранду с большими окнами и дверью. Хотелось\n                сохранить хороший обзор участка, но при этом закрыть помещение\n                от дождя, ветра и холода. Все проёмы измеряли непосредственно на\n                месте, потому что размеры отличались и готового проекта не было.\n                Выбрали коричневые конструкции, которые хорошо сочетаются с\n                кровлей и отделкой дома. После установки веранда стала\n                полноценной частью дома, а не просто открытым крыльцом.\n              ",
    "sourceClass": "review-card__source review-card__source--yandex",
    "sourceHtml": "Источник:",
    "topic": "Остекление веранды",
    "categories": [
      "terrace",
      "laminated",
      "door",
      "installation"
    ]
  },
  {
    "mediaStyle": "\n                  background-image: url(\"/assets/review-andrey-installation.webp\");\n                ",
    "titleHtml": "Андрей · Рыбинский район",
    "textHtml": "\n                Заказывал замену окна в квартире во время ремонта. Старый проём\n                оказался неровным, поэтому на замере всё тщательно проверили и\n                подобрали конструкцию точно по размеру. Монтажники аккуратно\n                установили раму, запенили примыкания и проверили работу створок.\n                Окно стоит ровно и закрывается плотно. После завершения откосов\n                проём будет выглядеть полностью обновлённым.\n              ",
    "sourceClass": "review-card__source review-card__source--avito",
    "sourceHtml": "Источник:",
    "topic": "Окна в квартиру",
    "categories": [
      "apartment",
      "installation"
    ]
  },
  {
    "mediaStyle": "\n                  background-image: url(\"/assets/review-user-10.jpg\");\n                ",
    "titleHtml": "Виктор · Ярославская область",
    "textHtml": "\n                Заказывал окна для нового двухэтажного дома после завершения\n                наружной отделки. Нужно было изготовить конструкции разных\n                размеров для обоих этажей и сохранить одинаковый внешний вид по\n                всему фасаду. Предложили белые рамы, которые хорошо выделяются\n                на фоне тёмной облицовки и делают дом аккуратнее. Все окна\n                установили ровно, створки открываются мягко, нигде не продувает.\n                По срокам и качеству монтажа замечаний не осталось.\n              ",
    "sourceClass": "review-card__source review-card__source--avito",
    "sourceHtml": "Источник:",
    "topic": "Окна в загородный дом",
    "categories": [
      "house",
      "installation"
    ]
  },
  {
    "mediaStyle": "\n                  background-image: url(\"/assets/review-alexander-apartment.webp\");\n                ",
    "titleHtml": "Александр · Рыбинский район",
    "textHtml": "\n                Заказывал замену окна и балконной двери в квартире. На замере\n                учли размеры проёма, расположение радиатора и широкий подоконник.\n                Новую конструкцию изготовили в срок, установили ровно и аккуратно\n                оформили откосы. Створки и дверь открываются легко, нигде не\n                продувает. В комнате стало заметно теплее и тише.\n              ",
    "sourceClass": "review-card__source review-card__source--yandex",
    "sourceHtml": "Источник:",
    "topic": "Балконный блок",
    "categories": [
      "apartment",
      "balcony-block",
      "installation"
    ]
  },
  {
    "mediaStyle": "\n                  background-image: url(\"/assets/review-user-06.jpg\");\n                ",
    "titleHtml": "Александр и Галина · Рыбинский район",
    "textHtml": "\n                Заказывали окна для нового загородного дома перед окончательной\n                отделкой фасада. Важно было правильно установить конструкции,\n                чтобы потом без проблем выполнить утепление и обшивку стен. На\n                замере проверили каждый проём, помогли выбрать открывающиеся\n                створки и подходящую комплектацию. Окна изготовили в срок,\n                установили ровно и аккуратно. После монтажа ничего поправлять\n                или переделывать не пришлось.\n              ",
    "sourceClass": "review-card__source review-card__source--yandex",
    "sourceHtml": "Источник:",
    "topic": "Окна в загородный дом",
    "categories": [
      "house",
      "installation"
    ]
  },
  {
    "mediaStyle": "\n                  background-image: url(\"/assets/review-couple-balcony.webp\");\n                ",
    "titleHtml": "Валентина и Николай · Рыбинский район",
    "textHtml": "\n                Меняли окно с балконной дверью в квартире и приводили в порядок\n                сам балкон. На замере внимательно проверили проём и помогли\n                выбрать удобное открывание створок. Конструкцию установили\n                аккуратно, подоконник и откосы получились ровными, внутренняя\n                отделка не пострадала. Теперь балконный блок закрывается плотно,\n                а в комнате стало теплее и светлее.\n              ",
    "sourceClass": "review-card__source review-card__source--yandex",
    "sourceHtml": "Источник:",
    "topic": "Балконный блок",
    "categories": [
      "apartment",
      "balcony-block",
      "finishing",
      "installation"
    ]
  },
  {
    "mediaStyle": "\n                  background-image: url(\"/assets/review-user-08.jpg\");\n                ",
    "titleHtml": "Светлана · Рыбинск",
    "textHtml": "\n                Заказывала окна для небольшой пристройки к дому. Нужно было\n                закрыть несколько широких проёмов, сохранить естественный свет и\n                подобрать конструкции под уже готовую светлую отделку. На замере\n                предложили удобное расположение створок и обычные белые рамы,\n                которые хорошо подошли к фасаду. Установили всё аккуратно, без\n                повреждения обшивки. Теперь в пристройке заметно теплее и можно\n                спокойно проветривать помещение.\n              ",
    "sourceClass": "review-card__source review-card__source--avito",
    "sourceHtml": "Источник:",
    "topic": "Окна в пристройку",
    "categories": [
      "house",
      "installation"
    ]
  },
  {
    "mediaStyle": "\n                  background-image: url(\"/assets/review-victoria-window.webp\");\n                ",
    "titleHtml": "Виктория · Ярославская область",
    "textHtml": "\n                Заказывала замену окна в квартире. Хотелось, чтобы новое окно\n                хорошо сохраняло тепло, защищало от уличного шума и при этом\n                удобно открывалось для проветривания. На замере подобрали\n                подходящую комплектацию, установили всё аккуратно и сделали\n                ровный широкий подоконник. Створки работают легко, из окна не\n                дует, а в комнате стало заметно тише.\n              ",
    "sourceClass": "review-card__source review-card__source--yandex",
    "sourceHtml": "Источник:",
    "topic": "Окна в квартиру",
    "categories": [
      "apartment",
      "installation"
    ]
  }
];

const pageCategories = {
  'okna-v-kvartiru':'apartment',
  'okna-v-chastnyj-dom':'house',
  'okna-na-dachu':'house',
  'osteklenie-verand-terras':'terrace',
  'balkony':'balcony',
  'otdelka-balkonov':'finishing',
  'balkonnye-bloki':'balcony-block',
  'panoramnye-okna':'panoramic',
  'laminirovannye-okna':'laminated',
  'dveri-pvh':'door',
  'montazh-okon':'installation',
};

export function reviewsForPage(slug) {
 const category=pageCategories[slug];
 const selected=['home','portfolio','o-kompanii'].includes(slug)?reviews:reviews.filter(review=>category&&review.categories.includes(category));
 return selected.map(review=>({...review,categories:[...review.categories]}));
}
