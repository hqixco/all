import { apartmentPage } from './apartment.js';
import { homeComponents } from './home.js';
import { pages } from '../data.js';
import { productContent } from './catalog.js';
import { compareData } from './compare.js';
import { relatedItem, estimateItems } from './service-pages.js';
const clone=value=>JSON.parse(JSON.stringify(value));
const block=(id,title,lead,items=[],afterHtml='')=>({component:'content',data:{id,kicker:'ОКНА ВЕРТИКАЛЬ',title,lead,items:items.map(([title,textHtml])=>({title,textHtml})),afterHtml}});
const content={
  'proverka-smety':{
    prefix:'comparison',order:['hero','compare','checklist','faq','related'],
    sections:{
      compare:{component:'compare',data:clone(compareData)},
      checklist:block('checklist','Что проверяем в смете','Сравниваем предложения при одинаковых размерах и комплектации, а не только итоговую сумму.',[
        ['Конструкции и размеры','Количество изделий, размеры проёмов, открывание створок, цвет и дополнительные элементы. Разные конструкции нельзя корректно сравнить по одной цене.'],
        ['Профиль, стекло и фурнитура','Профильную систему, армирование, формулу стеклопакета и механизмы открывания. Если характеристик нет в расчёте, подскажем, что уточнить у исполнителя.'],
        ['Работы и материалы','Включены ли монтаж, крепёж, герметизация шва, демонтаж и подготовка проёма. Отдельно сверим подоконники, отливы и откосы.'],
        ['Итог и дополнительные расходы','Доставку, подъём, вывоз мусора и другие позиции. Покажем, какие работы указаны отдельно и какие ещё нужно согласовать.'],
      ]),
      faq:{component:'faq',data:{id:'faq',titleHtml:'Вопросы о проверке сметы',items:[
        {questionHtml:'Проверка действительно бесплатная?',answerHtml:'Да. Разберём присланный расчёт и объясним состав предложения. Проверка не обязывает оформлять заказ.'},
        {questionHtml:'Можно отправить смету другой компании?',answerHtml:'Да, для этого и нужна проверка. Сравним размеры, характеристики изделий и перечень работ, чтобы различия в цене были понятны.'},
        {questionHtml:'Подойдёт фотография с телефона?',answerHtml:'Да, если текст и цифры читаются. Сфотографируйте все страницы, включая комплектацию и дополнительные работы. Можно отправить PDF или таблицу.'},
        {questionHtml:'Вы обязательно предложите дешевле?',answerHtml:'Сначала проверим, одинаковые ли изделия и работы сравниваются. Итог зависит от комплектации и условий монтажа. Объясним разницу и предложим варианты под вашу задачу.'},
        {questionHtml:'В смете только общая сумма. Её можно проверить?',answerHtml:'Можно начать с неё, но для точного сравнения понадобится расшифровка: размеры, профиль, стеклопакет, фурнитура и работы. Подскажем, какие данные запросить.'},
        {questionHtml:'Можно проверить расчёт на балкон или двери?',answerHtml:'Да. Пришлите предложение на окна, двери ПВХ, балкон, лоджию, веранду или террасу. Уточним конструкцию и объём работ для вашего объекта.'},
      ]}},
    },
  },
  'raschet-stoimosti':{
    prefix:'estimate',order:['hero','calculator','guide','price','faq','related'],
    sections:{
      calculator:{component:'calculator',data:{...clone(apartmentPage.sections.calculator.data),titleHtml:'Рассчитайте стоимость окон',leadHtml:'Выберите количество, укажите размеры одного окна и отметьте нужные работы. Результат предварительный: точную комплектацию и смету согласуем после замера.',sourceName:'Калькулятор: расчёт стоимости',places:[{value:'apartment',labelHtml:'Квартира',checked:true},{value:'house',labelHtml:'Частный дом',checked:false},{value:'cottage',labelHtml:'Дача',checked:false},{value:'other',labelHtml:'Другой объект',checked:false}]}},
      guide:block('estimate-guide','Как получить точную смету','Несколько исходных данных помогут обсудить заказ без лишних уточнений.',[
        ['Количество и размеры','Посчитайте проёмы и укажите примерную ширину и высоту. Если окна разные, пришлите список размеров — рассчитаем каждое отдельно.'],
        ['Фото и пожелания','Покажите проём внутри и снаружи. Сообщите нужное открывание, цвет, требования к стеклу и что хотите сохранить при замене.'],
        ['Состав работ','Отметьте монтаж, доставку, демонтаж и вывоз мусора. Подоконники, откосы и дополнительные опции согласуем отдельными позициями.'],
        ['Расчёт по вашему объекту','Для <a href="/dveri-pvh/#calculator">дверей</a>, <a href="/balkony/#calculator">балконов</a>, <a href="/moskitnye-setki/#calculator">москитных сеток</a> и <a href="/montazh-okon/#calculator">монтажа без покупки окон</a> есть отдельные калькуляторы.'],
      ]),
      faq:{component:'faq',data:{id:'faq',titleHtml:'Вопросы о расчёте стоимости',items:[
        {questionHtml:'Цена в калькуляторе окончательная?',answerHtml:'Нет, это ориентир для выбранных размеров и работ. После замера проверим проёмы, согласуем комплектацию и подготовим смету. Итоговую стоимость фиксируем в документах к заказу.'},
        {questionHtml:'Что делать, если все окна разного размера?',answerHtml:'Пришлите количество и размеры каждого проёма. Калькулятор использует размеры одного окна, поэтому для разных конструкций удобнее подготовить отдельную смету.'},
        {questionHtml:'Как измерить окно для предварительного расчёта?',answerHtml:'Укажите примерную ширину и высоту конструкции в миллиметрах. Если сомневаетесь, приложите фото и поясните, что измерили. Для изготовления нужны размеры после профессионального замера.'},
        {questionHtml:'Монтаж и доставка входят в результат?',answerHtml:'Калькулятор добавляет эти работы, когда вы выбираете их в форме. Демонтаж и вывоз мусора также отмечаются отдельно. Отделку проёма и дополнительные опции уточним при составлении сметы.'},
        {questionHtml:'Можно рассчитать только установку?',answerHtml:'Да. Перейдите в <a href="/montazh-okon/#calculator">калькулятор монтажа</a>: он считает установку и выбранные дополнительные работы без стоимости самого окна.'},
        {questionHtml:'Как получить подробный расчёт?',answerHtml:'Оставьте телефон в форме калькулятора. Обсудим размеры, комплектацию и работы. Если есть фото или список проёмов, подготовьте их к разговору с менеджером.'},
      ]}},
    },
  },
  ceny: {
    prefix:'prices',order:['hero','price','estimate','faq','calculator','related'],
    sections:{estimate:block('estimate','Прайс и состав заказа','Сравнивайте одинаковые размеры и комплектацию. Цены ниже — ориентиры из прайса сайта.',[
      ['Оконные конструкции','Одностворчатое окно — от 7 000 ₽; двухстворчатое — от 8 400 ₽; трёхстворчатое — от 12 600 ₽.'],
      ['Монтаж','Монтаж окна — от 3 150 ₽ за штуку. Изделие, демонтаж и отделку рассчитываем отдельно.'],
      ['Дополнительные работы','Демонтаж — от 1 100 ₽ за окно; монтаж откосов — от 1 750 ₽ за проём; доставка по Рыбинску — от 1 750 ₽ за выезд.'],
      ['Комплектация','Подоконник — от 850 ₽ за погонный метр; москитная сетка — от 1 050 ₽ за штуку. Цвет, стеклопакет и фурнитура влияют на итог.'],
    ])},
  },
  rassrochka:{prefix:'installment',order:['hero','installment','process','faq','calculator','related'],sections:{
    installment:block('installment','Оплата частями','Подберём доступный вариант оформления и объясним график платежей.',[
      ['Без банков','Рассрочка до 3 месяцев. Условия для вашего заказа уточняйте у менеджера.'],
      ['Через банк-партнёр','Рассрочка до 3 лет. Доступность и условия оформления уточняйте в офисе.'],
      ['До оформления','Уточните первоначальный взнос, график платежей и необходимые документы. Условия фиксируются в документах к заказу.'],
    ]),
    process:block('payment-process','Как оформить заказ','Сначала согласуем комплектацию и стоимость.',[['1. Получите смету','Уточним размеры, изделия и необходимые работы.'],['2. Выберите способ оплаты','Менеджер объяснит доступные варианты и график платежей.'],['3. Проверьте документы','Сверьте стоимость, сроки и условия оплаты до подписания.']]),
  }},
  garantiya:{prefix:'warranty',order:['hero','warranty','claim','faq','calculator','related'],sections:{
    faq:clone(homeComponents.sections.faq),
    claim:block('claim','Как обратиться по гарантии','Подготовьте договор и описание проблемы.',[['Номер заказа','Найдите договор и документы на изделия.'],['Описание и фото','Опишите неисправность и приложите фото примыканий или механизма.'],['Обращение в офис','Позвоните <a href="tel:+74855205586">8 (4855) 20-55-86</a> или напишите <a href="mailto:mail@vertyar.ru">mail@vertyar.ru</a>. Согласуем проверку и дальнейшие действия.']]),
  }},
  portfolio:{prefix:'portfolio',order:['hero','cases','reviews','faq','calculator','related'],sections:{cases:clone(homeComponents.sections.cases),faq:clone(homeComponents.sections.faq)}},
  'o-kompanii':{prefix:'company',order:['hero','company','warranty','reviews','faq','related'],sections:{
    company:clone(homeComponents.sections.company),
    faq:{component:'faq',data:{id:'faq',titleHtml:'Что обычно спрашивают о нашей компании',items:[
      {questionHtml:'Давно вы занимаетесь окнами?',answerHtml:'«Вертикаль» работает в Рыбинске с 2005 года. Занимаемся окнами для квартир, частных домов и дач, а также остеклением балконов и лоджий. В офисе можно посмотреть образцы и обсудить свой заказ.'},
      {questionHtml:'Можно приехать к вам и посмотреть окна вживую?',answerHtml:'Да, приезжайте в наш офис: Рыбинск, Центральный микрорайон, ул. Кирова, 6. Работаем с понедельника по пятницу с 9:00 до 18:00. Можно посмотреть образцы, задать вопросы и разобраться, какая комплектация вам подойдёт.'},
      {questionHtml:'Я пока только прицениваюсь. Можно обратиться без готовых размеров?',answerHtml:'Конечно. Расскажите, куда нужны окна и что хотите поменять. Если есть фото проёмов или примерные размеры, пришлите их — будет проще обсудить варианты. Точный расчёт подготовим после уточнения размеров и комплектации.'},
      {questionHtml:'Нужно обязательно ехать в офис, чтобы получить расчёт?',answerHtml:'Начать можно по телефону или через форму на сайте. Пришлите фото, примерные размеры и количество окон. Обсудим задачу и подскажем, какая информация ещё нужна. Время замера согласуем отдельно.'},
      {questionHtml:'Кто будет заниматься моим заказом?',answerHtml:'От первого обращения до монтажа и гарантийного обслуживания с вами работает одна команда. Менеджер помогает с комплектацией и документами, замерщик проверяет проёмы, монтажная бригада устанавливает конструкции. Если по заказу возникнет вопрос, обращайтесь к нам.'},
      {questionHtml:'Поможете выбрать окна, если я не разбираюсь в профилях и стеклопакетах?',answerHtml:'Да. Начнём с того, что для вас важно: тепло, тишина, удобное открывание или бюджет. Объясним, чем отличаются варианты и за что вы платите. Для спальни у шумной дороги и для сезонной дачи могут понадобиться разные решения.'},
      {questionHtml:'Можно заказать одно окно или только остекление балкона?',answerHtml:'Да, можно обратиться с отдельной задачей. Не обязательно менять все окна сразу. Расскажите, что нужно сделать: заменить одно окно, установить балконный блок или остеклить лоджию — обсудим подходящую конструкцию и работы.'},
      {questionHtml:'Что будет в смете? Монтаж и доставку посчитаете сразу?',answerHtml:'До заказа согласуем, какие изделия и работы вам нужны. В смете должны быть понятны комплектация, монтаж, доставка и дополнительные позиции, например подоконники или откосы. Если какая-то строка непонятна, попросите менеджера объяснить её до подписания договора.'},
      {questionHtml:'Когда привезут и установят окна?',answerHtml:'Срок зависит от конструкции, комплектации и загрузки производства. Менеджер уточнит его для вашего заказа, а согласованные сроки укажем в договоре. Дату доставки и монтажа обсудим с вами заранее.'},
      {questionHtml:'Если после установки что-то пойдёт не так, к кому обращаться?',answerHtml:'Обращайтесь в «Вертикаль» по телефону 8 (4855) 20-55-86 или приезжайте в офис. Найдите договор и, если возможно, сделайте фото проблемы — так проще понять, что случилось. Условия гарантии на конструкции и монтаж указаны в документах к заказу.'},
    ]}},
  }},
  kontakty:{prefix:'contacts',order:['hero','contact-details','faq','related'],sections:{
    faq:clone(homeComponents.sections.faq),
    'contact-details':{component:'content',data:{id:'contact-details',sectionClass:'content-section--illustrated content-section--steps',kicker:'КОНТАКТЫ',title:'Приезжайте, звоните или пишите',lead:'Поможем с выбором окон, расчётом заказа и вопросами после установки.',afterHtml:'',items:[
      {title:'Офис в Рыбинске',iconHtml:'<path d="M16 29S5 19 5 12a11 11 0 0 1 22 0c0 7-11 17-11 17Z"/><circle cx="16" cy="12" r="4"/>',textHtml:'Центральный микрорайон, ул. Кирова, 6. Работаем пн.–пт. с 9:00 до 18:00. В офисе можно посмотреть образцы и обсудить заказ.',map:{src:'https://yandex.ru/map-widget/v1/?mode=search&text=Рыбинск%2C%20улица%20Кирова%2C%206&z=16',title:'Офис «Вертикаль» — Рыбинск, улица Кирова, 6 на Яндекс Картах',routeHref:homeComponents.sections.company.data.routeHref}},
      {title:'Телефон и почта',iconHtml:'<path d="m7 4 5 6-3 3c2 4 5 7 9 9l3-3 6 5c-1 4-4 6-8 4C11 24 7 20 4 13 2 9 3 6 7 4Z"/>',contactLinks:{items:[{href:'tel:+74855205586',label:'8 (4855) 20-55-86',icon:{src:'/assets/contact-phone.svg'}},{href:'mailto:mail@vertyar.ru',label:'mail@vertyar.ru',icon:{src:'/assets/contact-email.svg'}}]},textHtml:'Свяжитесь с нами, чтобы согласовать замер или задать вопрос по заказу.'},
      {title:'Соцсети и мессенджеры',iconHtml:'<path d="M4 5h24v17H13l-9 6V5Z"/><path d="M9 11h14M9 16h9"/>',contactLinks:{items:[{href:'https://vk.com/vertyar',label:'ВКонтакте',external:true,icon:{src:'/assets/vk.svg'}},{href:'https://max.ru/u/f9LHodD0cOJIzIfBYSRQDQKUtrfrOWshRwKEDH0M9wgHHV2Mt_pzukT5sSU',label:'MAX',external:true,icon:{src:'/assets/max.svg'}}]},textHtml:'Здесь можно написать нам и прислать фотографии вашего объекта.'},
    ]}},
  }},
};
export const informationPages=Object.fromEntries(Object.entries(content).map(([slug,config])=>{
  const meta=pages.find(p=>p.slug===slug);
  const sections=clone(apartmentPage.sections);
  sections.hero.data={...sections.hero.data,titleHtml:meta.h1,leadHtml:meta.lead,products:[],productsLabel:meta.name,actions:{primaryHref:'#calculator',primaryLabel:'Получить консультацию',secondaryHref:slug==='portfolio'?'#works':'/portfolio/',secondaryLabel:'Смотреть примеры работ'}};
  sections.price.data={...clone(apartmentPage.sections.price.data),id:'prices',titleHtml:'Что входит в стоимость заказа',leadHtml:'Смета зависит от размеров, комплектации и выбранных работ. Изделия, монтаж, доставку и дополнительные позиции согласуем отдельно.',items:estimateItems(['Изделия','Замер проёмов','Доставка','Демонтаж','Монтаж','Подоконник, отлив, откосы','Дополнительные опции','Вывоз мусора'])};
  sections.warranty.data={...sections.warranty.data,titleHtml:'Гарантия на конструкции и монтаж'};
  sections.reviews.data.titleHtml='Отзывы клиентов «Окна Вертикаль»';
  sections.reviews.data.items=reviewsForPage(slug);
  sections.cases.data={...clone(homeComponents.sections.cases.data),id:'works',category:'all',navigation:false,titleHtml:'Выполненные работы'};
  sections.faq.data={id:'faq',titleHtml:'Вопросы и ответы',items:[{questionHtml:meta.faq[0],answerHtml:meta.faq[1]}]};
  sections.calculator=clone(apartmentPage.sections.calculator);
  sections.related.data={titleHtml:'Также может быть интересно',items:meta.related.map(relatedItem)};
  Object.assign(sections,config.sections);
  if(slug==='ceny'){
    sections.estimate.data.sectionClass='content-section--illustrated content-section--price-list';
    sections.estimate.data.kicker='ЦЕНЫ И КОМПЛЕКТАЦИЯ';
    sections.estimate.data.title='Из чего складывается стоимость';
    sections.estimate.data.lead='Стоимость изделий и работ — отдельно и по пунктам. Точную смету подготовим по размерам и комплектации вашего заказа.';
    const groups=[
      {title:'Оконные конструкции',iconHtml:'<rect x="4" y="3" width="24" height="26" rx="2"/><path d="M16 3v26M4 17h24M12 10v3M20 21v3"/>',textHtml:'Стоимость изделия без монтажа.',priceRows:[{label:'Одностворчатое окно',price:'от 7 000 ₽'},{label:'Двухстворчатое окно',price:'от 8 400 ₽'},{label:'Трёхстворчатое окно',price:'от 12 600 ₽'}]},
      {title:'Монтаж',iconHtml:'<path d="M21 3a7 7 0 0 0-8 9L3 23l6 6 11-10a7 7 0 0 0 9-8l-5 5-6-6 3-7Z"/>',textHtml:'Изделие, демонтаж и отделка рассчитываются отдельно.',priceRows:[{label:'Установка одного окна',price:'от 3 150 ₽'}]},
      {title:'Дополнительные работы',iconHtml:'<path d="M4 11h17v14H4zM21 16h5l3 5v4h-8M8 11V6h10v5"/><circle cx="9" cy="26" r="3"/><circle cx="25" cy="26" r="3"/>',textHtml:'Включаем в смету только необходимые работы.',priceRows:[{label:'Демонтаж окна',price:'от 1 100 ₽'},{label:'Монтаж откосов, проём',price:'от 1 750 ₽'},{label:'Доставка по Рыбинску',price:'от 1 750 ₽'}]},
      {title:'Комплектация',iconHtml:'<rect x="5" y="3" width="22" height="22" rx="2"/><path d="M5 10h22M12 3v22M3 29h26M18 15h5M18 20h5"/>',textHtml:'Цвет, стеклопакет и фурнитура влияют на итоговую стоимость.',priceRows:[{label:'Подоконник, пог. м',price:'от 850 ₽'},{label:'Москитная сетка',price:'от 1 050 ₽'}]},
    ];
    sections.estimate.data.items=groups.map((group,index)=>{
      const {iconHtml,...item}=group;
      return {...item,noInstallment:true,photo:true,imageWidth:[750,570,400,600][index],imageHeight:[420,321,400,338][index],imageSrc:'/assets/'+['prices-windows.webp','prices-installation.webp','prices-delivery.webp','prices-equipment.webp'][index],imageAlt:['Пластиковое окно в интерьере','Монтаж пластикового окна','Доставка оконных конструкций','Подоконник и отделка оконного проёма'][index]};
    });
  }
  if(slug==='garantiya'){
    const claimIcons=[
      '<rect x="7" y="3" width="18" height="26" rx="2"/><path d="M11 9h10M11 15h10M11 21h6"/>',
      '<path d="M4 9h6l2-4h8l2 4h6v18H4V9Z"/><circle cx="16" cy="18" r="5"/>',
      '<path d="m7 4 5 6-3 3c2 4 5 7 9 9l3-3 6 5c-1 4-4 6-8 4C11 24 7 20 4 13 2 9 3 6 7 4Z"/>',
    ];
    sections.claim.data.sectionClass='content-section--illustrated content-section--steps';
    sections.claim.data.kicker='ПОМОЖЕМ РАЗОБРАТЬСЯ';
    sections.claim.data.lead='Заметили проблему с окном или монтажом? Соберите информацию и свяжитесь с нами — обсудим, что делать дальше.';
    sections.claim.data.items=sections.claim.data.items.map((item,index)=>({...item,title:(index+1)+'. '+item.title,iconHtml:claimIcons[index],accent:index===2}));
  }
  if(slug==='portfolio'||slug==='kontakty')sections.hero.data.benefits=[];
  if(slug==='kontakty'){
    sections.hero.data.actions=false;
    sections.hero.data.showFacts=false;
  }
  if(slug==='proverka-smety'){
    const checklistIcons=[
      '<rect x="5" y="3" width="22" height="26" rx="2"/><path d="M16 3v26M5 16h22M9 8h3M20 21h3"/>',
      '<path d="M4 8h24v19H4zM8 4h20v19M12 1h19v18"/><path d="m9 16 4 4 10-10"/>',
      '<path d="M21 3a7 7 0 0 0-8 9L3 23l6 6 11-10a7 7 0 0 0 9-8l-5 5-6-6 3-7Z"/>',
      '<rect x="6" y="2" width="20" height="28" rx="2"/><path d="M10 6h12v6H10zM10 17h2M20 17h2M10 23h2M20 23h2M15 17h2M15 23h2"/>',
    ];
    sections.checklist.data.sectionClass='content-section--illustrated';
    sections.checklist.data.items=sections.checklist.data.items.map((item,index)=>({...item,iconHtml:checklistIcons[index],accent:index===3}));
    sections.hero.data.titleHtml='Уже получили расчёт на окна? <span>Проверим,</span> не переплачиваете ли вы';
    sections.hero.data.leadHtml='Пришлите смету другой компании. Сравним цены, профиль, стеклопакет, фурнитуру, монтаж и дополнительные работы. Покажем различия в стоимости и чего не хватает в расчёте.';
    sections.hero.data.preview={};
    sections.hero.data.actions={primaryHref:'#compare',primaryLabel:'Обсудить смету',secondaryHref:'#compare',secondaryLabel:'Отправить смету на проверку'};
    sections.hero.data.benefits=sections.hero.data.benefits.map((item,index)=>({...item,...[
      {titleHtml:'Бесплатно',descriptionHtml:''},
      {titleHtml:'Без обязательств',descriptionHtml:''},
      {titleHtml:'Разбор по пунктам',descriptionHtml:''},
    ][index]}));
  }
  if(slug==='raschet-stoimosti'){
    sections.guide.data.sectionClass='content-section--illustrated';
    const guideIcons=[
      '<path d="m4 23 19-19 5 5L9 28l-5-5Z M18 9l3 3M14 13l2 2M10 17l3 3M6 21l2 2"/>',
      '<path d="M4 9h6l2-4h8l2 4h6v18H4V9Z"/><circle cx="16" cy="18" r="5"/><path d="M24 13h1"/>',
      '<path d="m13 3 6 0 1 4 4 2 4-1 3 5-3 3v4l3 3-3 5-4-1-4 2-1 4h-6l-1-4-4-2-4 1-3-5 3-3v-4l-3-3 3-5 4 1 4-2 1-4Z" transform="translate(1 -2) scale(.9)"/><circle cx="16" cy="16" r="5"/>',
      '<rect x="7" y="3" width="18" height="26" rx="2"/><path d="M11 7h10v5H11zM11 17h2M19 17h2M11 22h2M19 22h2M15 17h1M15 22h1"/>',
    ];
    sections.guide.data.items=sections.guide.data.items.map((item,index)=>({...item,iconHtml:guideIcons[index],accent:index===3}));
    sections.hero.data.products=[
      ['Окна в квартиру','apartment-two-sash-card.webp','/okna-v-kvartiru/#calculator','two'],
      ['Окна в частный дом','home-product-house.webp','/okna-v-chastnyj-dom/#calculator','house'],
      ['Балконы и лоджии','related-balconies.webp','/balkony/#calculator','cold'],
      ['Двери ПВХ','door-glazed-card.webp','/dveri-pvh/#calculator','door'],
    ].map(([titleHtml,image,calculatorHref,productKey])=>({titleHtml,imageSrc:'/assets/'+image,imageAlt:titleHtml,imageWidth:570,imageHeight:428,calculatorHref,captionHtml:`от ${new Intl.NumberFormat('ru-RU').format(productContent[productKey][3])} ₽`}));
    sections.hero.data.actions={primaryHref:'#calculator',primaryLabel:'Обсудить расчёт',secondaryHref:'#calculator',secondaryLabel:'Перейти к калькулятору'};
    sections.hero.data.benefits=sections.hero.data.benefits.map((item,index)=>({...item,...[
      {titleHtml:'Размеры и количество',descriptionHtml:'Предварительная стоимость по вашим проёмам'},
      {titleHtml:'Работы по выбору',descriptionHtml:'Монтаж, доставка и демонтаж учитываются отдельно'},
      {titleHtml:'Смета после замера',descriptionHtml:'Комплектацию и итоговую сумму согласуем до заказа'},
    ][index]}));
  }
  const firstKey=config.order.find(k=>k!=='hero');
  return [slug,{prefix:config.prefix,heroImage:meta.image,order:config.order,sections:Object.fromEntries(config.order.map(k=>[k,sections[k]])),footer:{...clone(apartmentPage.footer),descriptionHtml:meta.lead,ctaTitleHtml:'Остались вопросы?',modalTitle:meta.name,modalHeading:'Получить консультацию',modalDescription:'Оставьте телефон — обсудим ваш вопрос.'},navigation:[{section:firstKey,label:meta.name},{section:'faq',label:'Вопросы и ответы'},...(config.order.includes('calculator')?[{section:'calculator',label:'Калькулятор'}]:config.order.includes('checklist')?[{section:'checklist',label:'Что проверяем'}]:[])]}];
}));
import { reviewsForPage } from './reviews.js';
