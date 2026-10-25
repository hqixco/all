import { apartmentPage } from './apartment.js';
import { relatedCards, relatedItem } from './related.js';
import { pages } from '../data.js';

const block = (id, title, lead, items) => ({ component: 'content', data: {
 id, kicker: 'ЖАЛЮЗИ И РУЛОННЫЕ ШТОРЫ', title, lead,
 items: items.map(([title, textHtml]) => ({ title, textHtml })), afterHtml: '',
} });
// Product photos supplied by the user; dealer and case data remain unverified.
const productImages = ["/assets/blinds-roller-card.webp","/assets/blinds-day-night-card.webp","/assets/blinds-horizontal-card.webp","/assets/blinds-vertical-card.webp"];
const startingPrices = ['990 ₽/м²', '2 575 ₽/м²', '1 350 ₽', '1 215 ₽'];
const systems = [
 ['Рулонные шторы', 'Цельное полотно сворачивается в рулон. Светопропускание зависит от выбранной ткани.', 'Защита от солнца; для затемнения спальни — ткань blackout с учётом зазоров'],
 ['День-Ночь', 'Чередующиеся прозрачные и плотные полосы позволяют менять освещённость без полного подъёма полотна.', 'Регулировка света и приватность; вечером важны плотность ткани и положение полос'],
 ['Горизонтальные жалюзи', 'Поворот ламелей помогает направлять свет. При подъёме жалюзи освобождают стекло.', 'Направление солнечного света и свободный подоконник при установке на створку'],
 ['Вертикальные жалюзи', 'Вертикальные ламели поворачиваются и сдвигаются в сторону. Для установки проверяем место для карниза.', 'Регулировка освещения и приватность в широких проёмах и кабинетах'],
];
export const blindsPage = {
 prefix: 'blinds', heroImage: 'blinds-hero.webp', installments: false,
 order: ['hero', 'request', 'cases', 'solutions', 'mounting', 'price', 'faq', 'related'],
 navigation: [{section:'solutions',label:'Системы'},{section:'price',label:'Стоимость'},{section:'faq',label:'Вопросы и ответы'},{section:'request',label:'Заявка'}],
 sections: {
  hero: {component:'hero',data:{...apartmentPage.sections.hero.data,
   titleHtml:'Жалюзи и рулонные шторы в Рыбинске',
   leadHtml:'Подберём систему под ваше окно, освещение и привычки. Согласуем ткань, крепления, замер и установку.',
   showFacts:false,products:systems.map(([title,description],index)=>({
    imageSrc:productImages[index],imageWidth:660,imageHeight:495,imageAlt:title+' на окне',
    titleHtml:title,captionHtml:'от '+startingPrices[index],
    modalTitle:title,modalHeading:'Рассчитать: '+title,modalDescription:description,
   })),productsLabel:'Системы для окон',
   benefits:apartmentPage.sections.hero.data.benefits.map((item,index)=>({...item,
    titleHtml:['Подбор под вашу задачу','Крепление по месту','Понятный состав расчёта'][index],
    descriptionHtml:['Сравним светопропускание, приватность и удобство управления','Проверим ручку, открывание створки и глубину проёма','Отдельно укажем изделия и согласованные работы'][index]})),
   actions:{primaryHref:'#request',primaryLabel:'Подобрать жалюзи',secondaryHref:'/portfolio/#works',secondaryLabel:'Смотреть примеры работ'},
  }},
  cases:{component:'cases',data:{id:'blinds-cases',titleHtml:'Примеры установки жалюзи и рулонных штор',category:'all',navigation:false,leadHtml:'Фотографии установленных систем. Подберём похожее решение по размерам вашего окна.',items:[{
   titleHtml:'Горизонтальные жалюзи на окне',category:'all',
   details:[{labelHtml:'Система',valueHtml:'Горизонтальные жалюзи'},{labelHtml:'Что сделали',valueHtml:'Установили горизонтальные жалюзи с регулировкой положения ламелей и высоты подъёма.'}],
   photos:[{src:'/assets/blinds-case-one.webp',alt:'Установленные светлые горизонтальные жалюзи на окне',width:640,height:960}],
  },{
   titleHtml:'Серые горизонтальные жалюзи на кухне',category:'all',
   details:[{labelHtml:'Система',valueHtml:'Горизонтальные жалюзи'},{labelHtml:'Что сделали',valueHtml:'Установили серые горизонтальные жалюзи, перекрывающие оконный проём на кухне.'}],
   photos:[{src:'/assets/blinds-case-two.webp',alt:'Серые горизонтальные жалюзи на кухонном окне',width:640,height:853}],
  },{
  "titleHtml": "Тканевые шторы на окнах в офисе",
  "category": "all",
  "details": [
    {
      "labelHtml": "Объект",
      "valueHtml": "Офис"
    },
    {
      "labelHtml": "Что сделали",
      "valueHtml": "Установили тканевые солнцезащитные шторы на офисные окна."
    }
  ],
  "photos": [
    {
      "src": "/assets/blinds-case-three-main.webp",
      "alt": "Тканевые шторы на окнах в офисе",
      "width": 640,
      "height": 853
    },
    {
      "src": "/assets/blinds-case-three-detail.webp",
      "alt": "Тканевая штора на офисном окне крупным планом",
      "width": 640,
      "height": 820
    }
  ]
},{
  "titleHtml": "Горизонтальные жалюзи на окне и двери",
  "category": "all",
  "details": [
    {
      "labelHtml": "Система",
      "valueHtml": "Горизонтальные жалюзи"
    },
    {
      "labelHtml": "Что сделали",
      "valueHtml": "Установили тёмные горизонтальные жалюзи на оконные створки и остеклённую дверь в деревянном доме."
    }
  ],
  "photos": [
    {
      "src": "/assets/blinds-case-four-door.webp",
      "alt": "Тёмные горизонтальные жалюзи на остеклённой двери",
      "width": 640,
      "height": 853
    },
    {
      "src": "/assets/blinds-case-four-window.webp",
      "alt": "Тёмные горизонтальные жалюзи на окне в деревянном доме",
      "width": 640,
      "height": 853
    }
  ]
},{
  "titleHtml": "Бирюзовые горизонтальные жалюзи на створках",
  "category": "all",
  "details": [
    {
      "labelHtml": "Система",
      "valueHtml": "Горизонтальные жалюзи"
    },
    {
      "labelHtml": "Что сделали",
      "valueHtml": "Установили бирюзовые горизонтальные жалюзи отдельно на каждую створку окна."
    }
  ],
  "photos": [
    {
      "src": "/assets/blinds-case-five.webp",
      "alt": "Бирюзовые горизонтальные жалюзи на двух створках пластикового окна",
      "width": 640,
      "height": 733
    }
  ]
},{
  "titleHtml": "Белые горизонтальные жалюзи на трёхстворчатом окне",
  "category": "all",
  "details": [
    {
      "labelHtml": "Система",
      "valueHtml": "Горизонтальные жалюзи"
    },
    {
      "labelHtml": "Что сделали",
      "valueHtml": "Установили белые горизонтальные жалюзи на три части оконного проёма с отдельной регулировкой."
    }
  ],
  "photos": [
    {
      "src": "/assets/blinds-case-six.webp",
      "alt": "Белые горизонтальные жалюзи на трёх частях окна",
      "width": 640,
      "height": 565
    }
  ]
},{
  "titleHtml": "Светлые горизонтальные жалюзи на окне и двери",
  "category": "all",
  "details": [
    {
      "labelHtml": "Система",
      "valueHtml": "Горизонтальные жалюзи"
    },
    {
      "labelHtml": "Что сделали",
      "valueHtml": "Установили светлые горизонтальные жалюзи на окно и остеклённую дверь с отдельным управлением."
    }
  ],
  "photos": [
    {
      "src": "/assets/blinds-case-seven.webp",
      "alt": "Светлые горизонтальные жалюзи на окне и остеклённой двери",
      "width": 640,
      "height": 597
    }
  ]
},{
  "titleHtml": "Кассетные шторы День-Ночь на створках",
  "category": "all",
  "details": [
    {
      "labelHtml": "Система",
      "valueHtml": "Рулонные шторы День-Ночь"
    },
    {
      "labelHtml": "Что сделали",
      "valueHtml": "Установили кассетные шторы День-Ночь с направляющими отдельно на две створки окна."
    }
  ],
  "photos": [
    {
      "src": "/assets/blinds-case-eight.webp",
      "alt": "Кассетные шторы День-Ночь в двух положениях на створках окна",
      "width": 640,
      "height": 854
    }
  ]
},{
  "titleHtml": "Горизонтальные жалюзи для окна и остеклённой двери",
  "category": "all",
  "details": [
    {
      "labelHtml": "Система",
      "valueHtml": "Горизонтальные жалюзи"
    },
    {
      "labelHtml": "Что сделали",
      "valueHtml": "Установили горизонтальные жалюзи на остеклённую дверь и отдельно на каждую створку окна."
    }
  ],
  "photos": [
    {
      "src": "/assets/blinds-case-nine-door.webp",
      "alt": "Светлые горизонтальные жалюзи на остеклённой двери",
      "width": 640,
      "height": 854
    },
    {
      "src": "/assets/blinds-case-nine-window.webp",
      "alt": "Горизонтальные жалюзи на двух створках окна",
      "width": 640,
      "height": 480
    }
  ]
},{
  "titleHtml": "Тканевые шторы на окнах и двери веранды",
  "category": "all",
  "details": [
    {
      "labelHtml": "Объект",
      "valueHtml": "Веранда"
    },
    {
      "labelHtml": "Что сделали",
      "valueHtml": "Установили тканевые шторы на окна и остеклённую дверь: цветочные, красные и светлое полотно."
    }
  ],
  "photos": [
    {
      "src": "/assets/blinds-case-ten-main.webp",
      "alt": "Тканевые шторы с цветочным рисунком и красными полотнами на веранде",
      "width": 640,
      "height": 339
    },
    {
      "src": "/assets/blinds-case-ten-before.webp",
      "alt": "Окна веранды до установки штор",
      "width": 640,
      "height": 414
    },
    {
      "src": "/assets/blinds-case-ten-panorama.webp",
      "alt": "Общий вид штор на окнах и двери веранды",
      "width": 640,
      "height": 204
    },
    {
      "src": "/assets/blinds-case-ten-detail.webp",
      "alt": "Красные и цветочные шторы на окнах веранды крупным планом",
      "width": 640,
      "height": 761
    }
  ]
},{
  "titleHtml": "Светлые шторы День-Ночь и рулонная штора",
  "category": "all",
  "details": [
    {
      "labelHtml": "Системы",
      "valueHtml": "День-Ночь и рулонные шторы"
    },
    {
      "labelHtml": "Что сделали",
      "valueHtml": "Установили светлые кассетные шторы День-Ночь на двухстворчатое окно и рулонную штору на отдельное окно."
    }
  ],
  "photos": [
    {
      "src": "/assets/blinds-case-eleven-closed.webp",
      "alt": "Светлые шторы День-Ночь в закрытом положении",
      "width": 640,
      "height": 746
    },
    {
      "src": "/assets/blinds-case-eleven-open.webp",
      "alt": "Шторы День-Ночь с открытыми прозрачными полосами",
      "width": 640,
      "height": 809
    },
    {
      "src": "/assets/blinds-case-eleven-roller.webp",
      "alt": "Светлая рулонная штора на отдельном окне",
      "width": 640,
      "height": 890
    }
  ]
},{
  "titleHtml": "Светлые рулонные шторы на оконных створках",
  "category": "all",
  "details": [
    {
      "labelHtml": "Система",
      "valueHtml": "Рулонные шторы"
    },
    {
      "labelHtml": "Что сделали",
      "valueHtml": "Установили светлые рулонные шторы на оконные створки с отдельным управлением полотнами."
    }
  ],
  "photos": [
    {
      "src": "/assets/blinds-case-eleven-roller.webp",
      "alt": "Светлая рулонная штора на отдельном окне",
      "width": 640,
      "height": 890
    },
    {
      "src": "/assets/blinds-case-twelve-partial.webp",
      "alt": "Светлые рулонные шторы на двух створках с частично поднятым полотном",
      "width": 640,
      "height": 845
    },
    {
      "src": "/assets/blinds-case-twelve-closed.webp",
      "alt": "Светлые рулонные шторы в полностью опущенном положении",
      "width": 640,
      "height": 853
    }
  ]
},{
  "titleHtml": "Бежевые и узорчатые рулонные шторы на створках",
  "category": "all",
  "details": [
    {
      "labelHtml": "Система",
      "valueHtml": "Рулонные шторы"
    },
    {
      "labelHtml": "Что сделали",
      "valueHtml": "Установили рулонные шторы на оконные створки: бежевые полотна и светлую ткань с узором."
    }
  ],
  "photos": [
    {
      "src": "/assets/blinds-case-thirteen-partial.webp",
      "alt": "Бежевая рулонная штора на одной из двух створок окна",
      "width": 640,
      "height": 853
    },
    {
      "src": "/assets/blinds-case-thirteen-pattern.webp",
      "alt": "Светлые рулонные шторы с узором на трёхстворчатом окне",
      "width": 640,
      "height": 534
    },
    {
      "src": "/assets/blinds-case-thirteen-pair.webp",
      "alt": "Бежевые рулонные шторы на двух створках окна",
      "width": 640,
      "height": 798
    },
    {
      "src": "/assets/blinds-case-thirteen-open.webp",
      "alt": "Бежевые рулонные шторы при открытой створке",
      "width": 640,
      "height": 845
    }
  ]
}]}},
  solutions:{component:'products',data:{id:'blinds-systems',titleHtml:'Четыре системы для ваших окон',leadHtml:'Выберите подходящую систему. Стоимость заказа зависит от размеров, материала и крепления.',items:systems.map(([title,description,suitable],index)=>({
   showImage:true,showBrand:false,photoUpload:true,noImage:false,
   imageSrc:productImages[index],imageWidth:660,imageHeight:495,imageAlt:title+' на окне',modalImage:productImages[index],
   kickerHtml:'По индивидуальным размерам',titleHtml:title,descriptionHtml:description,
   priceHtml:'от '+startingPrices[index],features:[{labelHtml:'Задачи',valueHtml:suitable},{labelHtml:'Крепление',valueHtml:'После проверки окна'}],
   modalTitle:title,modalHeading:'Рассчитать: '+title,modalDescription:description,
   modalSubmit:'Получить расчёт',buttonLabelHtml:'Рассчитать стоимость',
  }))}},
  mounting:block('blinds-mounting','Варианты установки','Крепление выбираем по системе, размерам и устройству окна. До изготовления проверяем совместимость.',[
   ['На створку','Компактная установка рядом со стеклом. Возможность крепления без сверления зависит от выбранной системы, массы изделия и формы створки.'],
   ['На стену или потолок','Для перекрытия проёма целиком. Учитываем выступ подоконника, радиатор, основание под крепёж и место для подъёма или сдвига полотна.'],
   ['Кассетная система','Короб закрывает вал рулонной шторы. Возможность установки направляющих и их совместимость со штапиком проверяем по конкретному окну.'],
  ]),
  price:block('blinds-price','От чего зависит цена','Для расчёта вашего заказа сообщите систему, количество окон и примерные размеры.',[
   ['Размеры и количество','Ширина, высота и количество изделий определяют расход материала и нагрузку на механизм. Для изготовления нужны проверенные размеры.'],
   ['Материал и система','На стоимость влияют ткань, светопропускание, материал ламелей, тип управления, кассета и направляющие. Сравнивайте одинаковую комплектацию.'],
   ['Что включаем в расчёт','Указываем изделия, крепления, замер, доставку и установку отдельными согласованными позициями. Дополнительные работы обсуждаем до заказа.'],
  ]),
  faq:{component:'faq',data:{id:'blinds-faq',titleHtml:'Вопросы о жалюзи и рулонных шторах',items:[
   ['Чем День-Ночь отличается от обычной рулонной шторы?','У обычной шторы цельное полотно, у День-Ночь — чередующиеся полосы. Смещение полос меняет освещённость; степень приватности зависит от положения и плотности ткани.'],
   ['Будет ли blackout полностью затемнять спальню?','Ткань blackout не пропускает свет через полотно, но свет может проходить по краям. Для спальни отдельно обсуждаем перекрытие проёма, направляющие и допустимые зазоры.'],
   ['Можно установить без сверления рамы?','Для некоторых систем и створок доступны соответствующие крепления. Применимость проверяем по размерам, весу и форме окна; обещать такой монтаж для любого изделия нельзя.'],
   ['Будет ли окно открываться после установки?','Проверяем положение ручки, откосов и корпуса системы. На поворотно-откидной створке также оцениваем удержание полотна при проветривании.'],
   ['Как ухаживать за жалюзи?','Способ ухода зависит от материала. Обычно начинают с мягкого сухого удаления пыли. Возможность влажной чистки уточняйте в инструкции выбранной системы; ткань нельзя стирать без разрешения изготовителя.'],
   ['Можно заказать только на одно окно?','Обсудим отдельное изделие для существующего окна. Для расчёта сообщите его примерные размеры, нужную систему и способ установки.'],
   ['Можно ли прислать фото окна?','Да, приложите его в форме выбранной системы или в форме расчёта внизу страницы. Желательно показать окно целиком, ручку, откосы и подоконник.'],
  ].map(([questionHtml,answerHtml])=>({questionHtml,answerHtml}))}},
  request:{component:'quiz',data:{...apartmentPage.sections.choice.data,
   id:'blinds-request',sourceName:'Страница «Жалюзи»',
   titleHtml:'Подберите жалюзи для ваших окон',
   leadHtml:'Ответьте на четыре вопроса — уточним систему, размеры и способ установки для расчёта.',
   resultTitleHtml:'Куда отправить расчёт жалюзи?',
   resultLeadHtml:'Обсудим выбранную систему и подготовим расчёт по вашим размерам.',
   commentPlaceholder:'Примерные размеры окон и пожелания к жалюзи',
   successHtml:'Спасибо! Свяжемся с вами, уточним размеры и подготовим расчёт жалюзи.',
   questions:[
    {title:'Какая система вам нужна?',description:'Выберите вариант или попросите помочь с подбором.',options:systems.map(item=>item[0]),images:productImages},
    {title:'Для какой задачи подбираете жалюзи?',description:'Учтём освещение и назначение комнаты.',options:['Защита от солнца','Затемнение спальни','Приватность','Свободный подоконник','Несколько задач']},
    {title:'Сколько окон нужно оформить?',description:'Размеры каждого окна уточним перед изготовлением.',options:['Одно','Два','Три','Четыре и больше','Пока не знаю']},
    {title:'Как планируете установить систему?',description:'Проверим совместимость выбранного крепления с вашим окном.',options:['На створку','На стену или потолок','Кассетная система','Нужен совет специалиста']},
   ],
  }},
  related:{component:'related',data:{...apartmentPage.sections.related.data,titleHtml:'Похожие услуги',items:[relatedItem('okna-v-kvartiru',pages),relatedCards['moskitnye-setki'],relatedCards['montazh-okon']]}},
 },
 footer:{...apartmentPage.footer,descriptionHtml:'Жалюзи, рулонные шторы и оконные системы в Рыбинске.',ctaHref:'#blinds-request',ctaTitleHtml:'Подберём жалюзи под ваши окна',modalTitle:'Жалюзи',modalHeading:'Рассчитать жалюзи и рулонные шторы',modalDescription:'Приложите фото окна и оставьте телефон — уточним систему и размеры.',modalSubmit:'Получить расчёт'},
};

// Three installation options share the existing content cards.
blindsPage.sections.mounting.data.sectionClass = 'content-section--three-columns';
blindsPage.sections.price.data.sectionClass = 'content-section--three-columns';

blindsPage.sections.mounting.data.lead += ' Изображения показывают варианты систем и не являются фотографиями выполненных работ.';
blindsPage.sections.mounting.data.items.forEach((item, index) => {
 const names = ['sash', 'wall', 'cassette'];
 item.action = {
  title: ['Жалюзи: установка на створку', 'Жалюзи: установка на стену или потолок', 'Жалюзи: кассетная система'][index],
  heading: ['Рассчитать жалюзи на створку', 'Рассчитать жалюзи на стену или потолок', 'Рассчитать кассетные рулонные шторы'][index],
  description: ['Пришлите фото створки — проверим ручку, открывание и подходящее крепление, рассчитаем систему по вашим размерам.', 'Пришлите фото проёма — уточним основание, размеры и расположение подоконника, рассчитаем систему и установку.', 'Пришлите фото окна и штапика — подберём кассету и направляющие, рассчитаем систему по размерам.'][index],
  submit: 'Получить расчёт', label: 'Рассчитать стоимость',
 };

 item.photo = {
  imageSrc: '/assets/blinds-mount-' + names[index] + '.webp',
  imageWidth: 880, imageHeight: 587,
  imageAlt: ['Иллюстрация крепления рулонной шторы на створку', 'Иллюстрация крепления рулонной шторы над проёмом', 'Иллюстрация кассетной системы с направляющими'][index],
 };
});

// Planning figures for a similar order, not the historical cost or duration of these works.
const caseEstimates = [
 {price:3500,days:5}, {price:2900,days:5}, {price:4800,days:7},
 {price:4900,days:5}, {price:2200,days:5}, {price:3300,days:5},
 {price:2700,days:5}, {price:4200,days:7}, {price:3100,days:5},
 {price:14900,days:10}, {price:5900,days:7}, {price:3900,days:7},
 {price:4700,days:7},
];
blindsPage.sections.cases.data.leadHtml = 'Фотографии установленных систем. Для похожего заказа указаны предварительный расчёт и плановый срок изготовления после замера. Итоговую стоимость и дату согласуем при оформлении.';
blindsPage.sections.cases.data.items.forEach((item,index) => {
 const estimate = caseEstimates[index];
 item.details.unshift(
  {labelHtml:'Цена',valueHtml:'от '+new Intl.NumberFormat('ru-RU').format(estimate.price)+' ₽'},
  {labelHtml:'Срок',valueHtml:estimate.days+' рабочих дней'},
 );
});

blindsPage.sections.cases.data.items.sort((a, b) => b.photos.length - a.photos.length);
