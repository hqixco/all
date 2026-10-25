import { apartmentPage } from './apartment.js';
import { homeComponents } from './home.js';
import { catalog, productContent } from './catalog.js';
import { pages } from '../data.js';
import { defaultWallDetails } from '../../src/components/installation.js';
import { installationFaq } from './installation-faq.js';
import { relatedItem as sharedRelatedItem } from './related.js';

const clone = value => JSON.parse(JSON.stringify(value));
// Supplied photos used only by matching hero cards.
const heroProductImages = {
  "warm": "related-warm-glazing.webp",
  "loggia": "related-warm-glazing.webp",
  "finish": "related-balcony-finishing.webp",
  "insulation": "related-warm-glazing.webp",
  "storage": "related-balcony-finishing.webp",
  "cold": "related-cold-glazing.webp",
  "cold-loggia": "related-cold-glazing.webp",
  "house": "home-product-house.webp",
  "panoramic": "related-panoramic-windows.webp",
  "terrace": "related-terrace-glazing.webp",
  "laminated": "related-laminated-windows.webp",
  "wood-color": "related-laminated-windows.webp",
  "two-color": "related-laminated-windows.webp"
};
const amount = price => new Intl.NumberFormat('ru-RU').format(price);
export function estimateItems(labels) {
  return labels.map(labelHtml=>({...clone(apartmentPage.sections.price.data.items[0]),labelHtml}));
}
const extras = [
  {slug:'balkony',title:'Остекление балконов и лоджий в Рыбинске',name:'Балконы и лоджии',h1:'Окна для балконов и лоджий в Рыбинске напрямую по цене производителя с замером, доставкой и монтажом от 1 дня',lead:'Тёплое и холодное остекление, отделка, утепление и аккуратный монтаж под квартиры, лоджии и балконы.',image:'balcony-hero-evening.webp',choice:'Перед заказом проверяем плиту, парапет и примыкания. Тёплый балкон требует подходящего утепления и отопления.',faq:['Нужно остеклить балкон или заменить балконный блок?','Остекление закрывает наружный контур балкона. Балконный блок — окно и дверь между комнатой и балконом; это отдельная конструкция.'],related:['holodnoe-osteklenie-balkonov','teploe-osteklenie-balkonov','otdelka-balkonov','balkonnye-bloki']},
];
export const serviceMetadata = [...pages.filter(p=>catalog[p.slug]), ...extras];

function product(key) {
  const [title,description,image,price,unit,suitable] = productContent[key];
  if (!Number.isFinite(price) || price <= 0) throw new Error(`Missing product price: ${key}`);
  return {...clone(apartmentPage.sections.solutions.data.items[0]),
    imageSrc:'/assets/'+image,imageAlt:title,imageWidth:570,imageHeight:428,
    kickerHtml:'Подбор по вашему проёму',titleHtml:title,descriptionHtml:description,
    priceHtml:`<small>${unit}</small>от ${amount(price)} ₽`,
    features:[{labelHtml:'Комплектация',valueHtml:'По размерам и задаче'},{labelHtml:'Работы',valueHtml:'По согласованной смете'},{labelHtml:'Подходит для:',valueHtml:suitable}],
    modalTitle:title,modalHeading:'Рассчитать: '+title.toLowerCase(),modalDescription:description,modalImage:'/assets/'+image,
  };
}

function installation(meta,settings) {
  const data = clone(apartmentPage.sections.process.data);
  data.titleHtml = settings.walls==='balcony'?'Монтаж с проверкой основания балкона':`Монтаж: ${settings.subject}`;
  data.leadHtml = settings.walls==='balcony'?'Проверяем плиту, ограждение, верхнее примыкание и допустимую нагрузку. Состав подготовки и крепление определяем после осмотра.':meta.choice;
  data.noteHtml = settings.walls==='balcony'?'Не устанавливаем конструкции на непрочное основание. До изготовления согласуем подготовку парапета, крепление и защиту примыканий.':'До изготовления проверяем геометрию и состояние проёмов. Согласуем подготовку основания, крепление, защиту шва и отделку.';
  if (settings.walls==='house') {
    data.walls = [
      {key:'aerated',imageSrc:'/assets/installation-aerated.webp',className:'wall-tab is-active',titleHtml:'Газобетон и пеноблок'},
      {key:'brick',imageSrc:'/assets/installation-brick.webp',className:'wall-tab',titleHtml:'Кирпичный дом'},
      {key:'wood',imageSrc:'/assets/installation-wood.webp',className:'wall-tab',titleHtml:'Деревянный дом'},
    ];
    data.wallDetails = clone(defaultWallDetails);
    // The source calls this material "block"; use the same data with the public tab key.
    data.wallDetails.aerated = clone(defaultWallDetails.aerated || defaultWallDetails.block || Object.values(defaultWallDetails)[0]);
  }
  if(settings.walls==='balcony') {
    data.walls = [{key:'balcony',imageSrc:'/assets/installation-panel.webp',className:'wall-tab is-active',titleHtml:'Балкон'},{key:'loggia',imageSrc:'/assets/installation-monolith.webp',className:'wall-tab',titleHtml:'Лоджия'}];
    const titles=['Основание','Крепление','Примыкания','Защита от осадков','Опоры','Проверка перед заказом'];
    const texts=['Оцениваем плиту и ограждение; подготовку или усиление согласуем до заказа.','Крепление подбираем по прочному основанию и расчёту конструкции.','Утепляем и герметизируем стыки в соответствии с выбранной системой.','Подбираем отливы и защиту верхнего примыкания по состоянию фасада.','Передаём нагрузку через опорные элементы без перекоса рамы.','Проверяем размеры, доступ для монтажа и возможность безопасного обслуживания створок.'];
    data.wallDetails = {balcony:titles.map((t,i)=>[t,texts[i]]),loggia:titles.map((t,i)=>[t,texts[i]])};
  }
  if(settings.installation)Object.assign(data,clone(settings.installation));
  if(settings.wallImages)data.walls.forEach((wall,index)=>{wall.imageSrc='/assets/'+settings.wallImages[index];});
  if(settings.wallPoints){data.wallPoints=clone(settings.wallPoints);data.points=data.wallPoints[data.walls[0].key].map(textHtml=>({textHtml}));}
  if(meta.slug==='dveri-pvh'){
    data.titleHtml='Монтаж дверей ПВХ с учётом материала проёма';
    data.leadHtml='Проверяем дверной проём, основание под порогом и материал стен. Согласуем крепление, герметизацию, направление открывания и подготовку проёма.';
    data.noteTitleHtml='Надёжность двери зависит от правильного монтажа';
    data.noteHtml='До изготовления проверяем размеры проёма и опору под порогом. Согласуем крепление, защиту нижнего примыкания, отделку и, для деревянных стен, подготовку обсады.';
    for(const details of Object.values(data.wallDetails))for(const pair of details)pair[1]=pair[1].replace(/окно/g,'дверь').replace(/окна/g,'двери').replace(/под рамой/g,'под порогом');
  }
  const first=data.walls[0];
  data.imageSrc=first.imageSrc;data.imageAlt='Схема монтажного узла';
  data.details=data.wallDetails[first.key].map(([titleHtml,descriptionHtml])=>({titleHtml,descriptionHtml}));
  return data;
}

export function makeServicePage(meta) {
  const settings=catalog[meta.slug];
  const page=clone(apartmentPage);
  page.prefix=settings.prefix;page.heroImage=settings.heroBackdrop||(meta.slug==='balkonnye-bloki'?'balcony-block-hero.webp':settings.image);
  const items=settings.products.map((key,index)=>{
    const item=product(key);
    if(settings.productImages?.[index]) {
      item.imageSrc='/assets/'+settings.productImages[index];
      item.modalImage=item.imageSrc;
      item.imageWidth=570;item.imageHeight=428;
    }
    if(settings.heroImages?.[index]) {
      item.imageSrc='/assets/'+settings.heroImages[index];
      item.modalImage=item.imageSrc;
      item.imageWidth=627;item.imageHeight=314;
    }
    return item;
  });
  page.sections.hero.data={...page.sections.hero.data,titleHtml:meta.h1,leadHtml:meta.lead,productsLabel:meta.name,
    products:items.map((item,i)=>{
      const suppliedImage=settings.heroCardImages?.[i]||heroProductImages[settings.products[i]];
      return {imageSrc:suppliedImage?'/assets/'+suppliedImage:item.imageSrc,imageWidth:suppliedImage?570:item.imageWidth,imageHeight:suppliedImage?428:item.imageHeight,imageAlt:item.imageAlt,modalTitle:item.modalTitle,modalHeading:item.modalHeading,modalDescription:item.modalDescription,titleHtml:item.titleHtml,captionHtml:settings.heroCaptions?.[i]||`от ${amount(productContent[settings.products[i]][3])} ₽`};
    }),
    actions:{primaryHref:'#calculator',primaryLabel:'Вызвать замерщика',secondaryHref:'#'+settings.prefix+'-cases',secondaryLabel:'Смотреть примеры работ'},
  };
  page.sections.solutions.data={...page.sections.solutions.data,titleHtml:'Варианты: '+settings.subject,leadHtml:meta.lead+' Состав заказа и цену фиксируем после замера.',items};
  page.sections.choice.data={...page.sections.choice.data,id:settings.prefix+'-quiz',titleHtml:'Подберите '+settings.subject,leadHtml:meta.choice,
    resultTitleHtml:'Куда отправить ваш расчёт?',resultLeadHtml:'Уточним размеры, комплектацию и выбранные работы.',commentPlaceholder:'Размеры, адрес объекта и пожелания',sourceName:'Квиз: '+meta.name,successHtml:'Спасибо! Свяжемся с вами для уточнения заказа.',
    questions:[
      {title:'Какой вариант вам нужен?',description:meta.lead,options:items.map((item,index)=>settings.quizLabels?.[settings.products[index]]||item.titleHtml),images:items.map((item,index)=>{if(settings.quizImages?.[index])return '/assets/'+settings.quizImages[index];const key=settings.products[index];const photo=key==='house'&&meta.slug==='okna-na-dachu'?'related-dacha-windows.webp':heroProductImages[key];return photo?'/assets/'+photo.replace('related-','quiz-'):item.imageSrc;})},
      {title:'На каком этапе ваш объект?',description:meta.choice,options:['Замена существующей конструкции','Новый подготовленный проём','Нужна подготовка основания','Пока планирую заказ']},
      {title:'Что важно при подборе?',description:'Учтём ваши пожелания при согласовании комплектации.',options:['Удобство использования','Тепло и защита от погоды','Внешний вид','Доступная стоимость','Нужна консультация']},
      {title:'Какие работы включить?',description:'В расчёте отдельно покажем изделия и выбранные работы.',options:['Только изделие','Доставка','Монтаж и доставка','Демонтаж, монтаж и отделка','Помогите определить состав']},
      {title:'Когда планируете заказ?',description:'Сроки уточним при согласовании замера.',options:['Как можно скорее','В течение месяца','Через 1–3 месяца','Пока сравниваю варианты']},
    ],
  };
  const cases=clone(homeComponents.sections.cases.data.items).filter(item=> meta.slug==='dveri-pvh'?/двер|входн|балконн.*блок/i.test(item.titleHtml):(settings.category==='all' || (settings.category==='apartments'?/квартир/.test(item.titleHtml):settings.category==='balconies'?/балкон|лоджи/.test(item.titleHtml):!/квартир|балкон|лоджи/.test(item.titleHtml))));
  if(meta.slug==='panoramnye-okna')cases.sort((a,b)=>Number(/панорам/i.test(b.titleHtml))-Number(/панорам/i.test(a.titleHtml)));
  page.sections.cases.data={...page.sections.cases.data,id:settings.prefix+'-cases',titleHtml:'Примеры выполненных работ',category:settings.category,navigation:false,items:cases};
  let estimateLabels=['Изделия','Замер проёмов','Доставка','Демонтаж старых конструкций','Монтаж','Подоконник, отлив, откосы','Дополнительные опции','Вывоз мусора'];
  if(meta.slug==='moskitnye-setki')estimateLabels=['Москитная сетка','Замер и подбор креплений','Доставка','Установка креплений','Специальное полотно'];
  if(meta.slug==='otdelka-balkonov')estimateLabels=['Материалы для отделки','Осмотр основания','Подготовка поверхностей','Утепление по проекту','Отделка стен, потолка и пола','Доставка материалов','Вывоз мусора'];
  if(meta.slug==='montazh-okon')estimateLabels=['Осмотр проёмов','Монтаж конструкций','Монтажные материалы','Демонтаж старых конструкций','Отделка откосов','Доставка','Вывоз мусора'];
  if(meta.slug==='dveri-pvh')estimateLabels=['Дверь ПВХ и выбранная фурнитура','Замер дверного проёма','Доставка','Демонтаж старой двери','Монтаж двери и опоры под порогом','Герметизация примыканий и отделка откосов','Замок и дополнительные опции','Вывоз мусора'];
  page.sections.price.data={...page.sections.price.data,titleHtml:'Что входит в стоимость заказа',leadHtml:`Рассчитываем ${settings.subject} по размерам и согласованной комплектации. Изделия и работы показываем отдельно; итог зависит от выбранных позиций. ${meta.choice}`,items:estimateItems(estimateLabels)};
  page.sections.warranty.data={...page.sections.warranty.data,titleHtml:'Гарантия на изделия и работы',leadHtml:'Сроки и условия для выбранных изделий и работ фиксируем в договоре. Сохраняйте документы к заказу для обращения в сервис.'};
  if(meta.slug==='dveri-pvh'){
    page.sections.warranty.data.items[0].titleHtml='Дверные конструкции ПВХ';
    page.sections.price.data.imageAlt='Состав сметы на дверь ПВХ и монтаж';
  }
  if(settings.walls)page.sections.process.data=installation(meta,settings);else page.order=page.order.filter(k=>k!=='process');
  if(meta.slug==='otdelka-balkonov')page.order=page.order.filter(k=>k!=='process');
  if(['moskitnye-setki','otdelka-balkonov'].includes(meta.slug)) page.sections.warranty.data.items=page.sections.warranty.data.items.filter(i=>/монтаж|сервис|регулиров/i.test(i.titleHtml)).map(i=>({...i,termHtml:'По договору'}));
  page.sections.reviews.data={...page.sections.reviews.data,titleHtml:'Отзывы клиентов «Окна Вертикаль»',items:reviewsForPage(meta.slug)};
  page.sections.faq.data={id:'faq',titleHtml:'Вопросы и ответы',items:[
    {questionHtml:meta.faq[0],answerHtml:meta.faq[1]},
    {questionHtml:'Что нужно для предварительного расчёта?',answerHtml:meta.choice},
    {questionHtml:'Что входит в стоимость?',answerHtml:'Изделия, доставка, монтаж и дополнительные работы показываются отдельными позициями. Итоговую сумму и состав заказа согласуем после замера.'},
    {questionHtml:'Можно прислать фото и размеры?',answerHtml:'Да. По фото и примерным размерам подготовим предварительный расчёт, а точные размеры и состояние основания проверим на замере.'},
    {questionHtml:'Как узнать сроки заказа?',answerHtml:'Срок зависит от комплектации и текущей загрузки. Дату изготовления и согласованных работ фиксируем в договоре.'},
    {questionHtml:'Как действует гарантия?',answerHtml:'Условия указаны в договоре и документах к изделиям. Для обращения сообщите номер заказа и опишите проблему.'},
  ]};
  if(meta.slug==='okna-v-chastnyj-dom'){
    page.sections.solutions.data.titleHtml='Окна для частных домов и коттеджей';
    page.sections.choice.data.titleHtml='Подберите пластиковые окна в частный дом или коттедж';
    page.sections.process.data.titleHtml='Остекление частного дома и коттеджа: монтаж по материалу стен';
    page.sections.faq.data.items.splice(2,0,
      {questionHtml:'Чем отличаются окна для коттеджа и частного дома?',answerHtml:'Название дома не определяет комплектацию окон. Учитываем отопление, размеры проёмов, материал стен и расположение комнат. Для коттеджа и другого частного дома подбираем конструкции по этим условиям, а не по названию объекта.'},
      {questionHtml:'Можно заказать пластиковые окна для коттеджа в Рыбинске по проекту?',answerHtml:'Да. Пришлите план дома и размеры проёмов — подготовим предварительный расчёт. Согласуем профиль, стеклопакеты, цвет и открывание, а перед изготовлением проверим размеры на замере.'},
      {questionHtml:'Что включает остекление коттеджа целиком?',answerHtml:'В одном заказе можно согласовать обычные и панорамные окна, двери и входную группу. В смете отдельно покажем конструкции, доставку, монтаж и дополнительные работы. Веранду или террасу рассчитаем с учётом того, будут ли они отапливаться.'},
      {questionHtml:'Какие окна в частный дом выбрать для проживания зимой?',answerHtml:'Для отапливаемого дома подбираем профиль и стеклопакет с учётом площади остекления и назначения помещений. Для больших проёмов отдельно проверяем размеры, безопасность стекла и схему открывания. Хороший результат зависит также от монтажа и утепления самого дома.'}
    );
  }
  const calculator=page.sections.calculator.data;
  calculator.titleHtml='Рассчитайте '+settings.subject;calculator.leadHtml='Ориентировочная цена по размерам и выбранным работам. Итоговая смета — после замера.';calculator.installationPlace=settings.place;calculator.places=[];
  calculator.sourceName='Калькулятор: '+meta.name;
  if(meta.slug==='okna-v-chastnyj-dom')calculator.titleHtml='Рассчитайте остекление частного дома или коттеджа';
  if(meta.slug==='moskitnye-setki'){page.installments=false;calculator.installments=false;}
  if(meta.slug==='balkonnye-bloki') {
    calculator.countQuestionHtml='Сколько балконных блоков нужно?';calculator.countOptions=[{value:2,labelHtml:'Один',checked:true},{value:4,labelHtml:'Два',checked:false},{value:7,labelHtml:'Три',checked:false}];
    calculator.widthLabelHtml='Ширина всего блока';calculator.heightLabelHtml='Высота блока';
    calculator.widthRange={min:1000,max:3500,step:50,value:2000};calculator.heightRange={min:1800,max:2600,step:50,value:2100};
    calculator.model={basePrice:17500,baseWidth:2000,baseHeight:2100,countFactors:{2:1,4:2,7:3},serviceCounts:{2:1,4:2,7:3}};
  }
  if(meta.slug!=='balkonnye-bloki') {
    const startingPrice=productContent[settings.products[0]][3];
    calculator.countQuestionHtml='Сколько конструкций нужно?';
    calculator.countOptions=[{value:2,labelHtml:'Одна',checked:true},{value:4,labelHtml:'Две',checked:false},{value:7,labelHtml:'Три',checked:false}];
    calculator.model={basePrice:startingPrice,countFactors:{2:1,4:2,7:3},serviceCounts:{2:1,4:2,7:3},placeFactors:{apartment:1,house:1,cottage:1,other:1}};
    if(settings.category==='balconies') {
      calculator.countQuestionHtml='Сколько балконов или лоджий нужно?';
      calculator.widthLabelHtml='Ширина остекления';calculator.heightLabelHtml='Высота остекления';
      calculator.widthRange={min:1000,max:6000,step:50,value:3000};calculator.heightRange={min:800,max:3000,step:50,value:1500};
      calculator.model.baseWidth=3000;calculator.model.baseHeight=1500;
    }
    if(meta.slug==='otdelka-balkonov') {
      calculator.widthLabelHtml='Длина балкона';calculator.heightLabelHtml='Ширина балкона';
      calculator.heightRange={min:500,max:3000,step:50,value:1000};calculator.model.baseHeight=1000;
    }
    if(meta.slug==='moskitnye-setki')calculator.countQuestionHtml='Сколько москитных сеток нужно?';
    if(meta.slug==='dveri-pvh') {
      calculator.countQuestionHtml='Сколько дверей нужно?';
      calculator.widthLabelHtml='Ширина двери';calculator.heightLabelHtml='Высота двери';
      calculator.widthRange={min:600,max:1800,step:50,value:900};calculator.heightRange={min:1800,max:3000,step:50,value:2100};
      calculator.model.baseWidth=900;calculator.model.baseHeight=2100;
    }
  }
  page.sections.related.data={titleHtml:'Также может быть интересно',items:meta.related.map(relatedItem)};
  if(meta.slug==='montazh-okon'){
    page.sections.faq.data.items=clone(installationFaq);
    const installationBenefits=[
      ['Проверка проёма до монтажа','Оцениваем основание и материал стен, согласуем подготовку и крепление'],
      ['Понятная смета на работы','Отдельно указываем монтаж, материалы, демонтаж и отделку проёма'],
      ['Проверка после установки','Проверяем открывание и примыкания, показываем результат перед приёмкой'],
    ];
    page.sections.hero.data.benefits=page.sections.hero.data.benefits.map((item,index)=>({...item,titleHtml:installationBenefits[index][0],descriptionHtml:installationBenefits[index][1]}));
    calculator.showInstallationOption=false;
    calculator.leadHtml='Ориентировочная стоимость монтажа по размерам и количеству конструкций. Доставка, демонтаж и вывоз мусора учитываются отдельно при выборе. Стоимость самих окон не включена.';
    calculator.countQuestionHtml='Сколько конструкций нужно установить?';
    calculator.model.installation=0;
  }
  page.footer={...page.footer,descriptionHtml:meta.lead,ctaTitleHtml:'Обсудим ваш заказ?',modalTitle:settings.subject,modalHeading:'Получить расчёт: '+settings.subject,modalDescription:meta.choice};
  page.navigation=[{section:'cases',label:'Примеры: '+meta.name.toLowerCase()},{section:'reviews',label:'Отзывы клиентов'},{section:'price',label:'Стоимость: '+meta.name.toLowerCase()}];
  if(meta.slug==='moskitnye-setki')page.sections.choice.data.questions[2].options=['Удобное снятие','Защита от насекомых','Подбор полотна','Доступная стоимость','Нужна консультация'];
  if(meta.slug==='otdelka-balkonov')page.sections.choice.data.questions[2].options=['Отделка стен и потолка','Подготовка пола','Утепление','Места хранения','Нужна консультация'];
  if(!page.sections.reviews.data.items.length){
    page.order=page.order.filter(key=>key!=='reviews');
    page.navigation=page.navigation.filter(item=>item.section!=='reviews');
  }
  page.sections=Object.fromEntries(page.order.map(key=>[key,page.sections[key]]));
  return page;
}

export function relatedItem(slug) {
  return sharedRelatedItem(slug,[...pages,...extras]);
}
export const servicePages=Object.fromEntries(serviceMetadata.map(p=>[p.slug,makeServicePage(p)]));
import { reviewsForPage } from './reviews.js';
