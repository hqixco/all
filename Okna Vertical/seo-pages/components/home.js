import { reviewsForPage } from './reviews.js';
import { compareData } from './compare.js';
import { companyData } from './company.js';
import {firstQuizQuestion, generalQuizQuestions} from '../../src/components/quiz-data.js';

// Page content only. Layouts live in components/*.html.
export const homeComponents = {
  "sections": {
    "company": {component:'company',data:companyData},
    "compare": {component:'compare',data:{...compareData,formId:'home-compare-form'}},
    "solutions": {
      "component": "products",
      "data": {
        "id": "windows",
        "titleHtml": "Готовые решения оконных конструкций под ключ",
        "leadHtml": "\n            Показываем понятный ориентир по комплектации и цене. Точный расчёт\n            подготовим по размерам проёмов и выбранным работам.\n          ",
        "items": [
          {
            "imageSrc": "/assets/home-product-apartment.webp",
            "imageWidth": 592,
            "imageHeight": 444,
            "imageAlt": "Пластиковое окно для квартиры",
            "kickerHtml": "Готовое решение",
            "titleHtml": "Стандартное окно в квартиру с монтажом",
            "descriptionHtml": "\n                  Двухстворчатое ПВХ-окно стандартного размера с доставкой и\n                  профессиональной установкой.\n                ",
            "priceHtml": "<small>готовая цена</small> от 13 950 ₽",
            "features": [
              {
                "labelHtml": "Размер",
                "valueHtml": "1300 × 1400 мм"
              },
              {
                "labelHtml": "Включено",
                "valueHtml": "окно + монтаж"
              },
              {
                "labelHtml": "Подходит для:",
                "valueHtml": "для спальни, для кухни, для детской, для гостиной"
              }
            ],
            "modalTitle": "окон для квартиры",
            "modalHeading": "Рассчитать окна для квартиры",
            "modalDescription": "Уточним количество и размеры проёмов, этаж и пожелания по шумоизоляции. Рассчитаем окна с подходящей комплектацией и монтажом.",
            "modalImage": "/assets/plastic-windows-card.jpg",
            "modalSubmit": "Получить расчёт окон для квартиры",
            "buttonLabelHtml": "\n                  Рассчитать для&nbsp;квартиры <svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\" fill=\"none\" stroke=\"currentColor\" aria-hidden=\"true\"><path d=\"M5 12h14m-5-5 5 5-5 5\"/></svg>\n                "
          },
          {
            "imageSrc": "/assets/home-product-balcony-block.webp",
            "imageWidth": 592,
            "imageHeight": 444,
            "imageAlt": "Балконный блок с монтажом",
            "kickerHtml": "Готовое решение",
            "titleHtml": "Балконный блок с монтажом",
            "descriptionHtml": "\n                  Окно с балконной дверью, подоконником, отливом, доставкой и\n                  установкой.\n                ",
            "priceHtml": "<small>готовая цена</small> от 26 550 ₽",
            "features": [
              {
                "labelHtml": "Размер",
                "valueHtml": "2000 × 2100 мм"
              },
              {
                "labelHtml": "Включено",
                "valueHtml": "блок + монтаж"
              },
              {
                "labelHtml": "Подходит для:",
                "valueHtml": "для кухни или гостиной с выходом на балкон"
              }
            ],
            "modalTitle": "балконного блока",
            "modalHeading": "Рассчитать балконный блок",
            "modalDescription": "Уточним размеры проёма и комплектацию. Рассчитаем балконный блок с доставкой и монтажом.",
            "modalImage": "/assets/balcony-block-window.jpg",
            "modalSubmit": "Получить расчёт балконного блока",
            "buttonLabelHtml": "\n                  Рассчитать блок <svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\" fill=\"none\" stroke=\"currentColor\" aria-hidden=\"true\"><path d=\"M5 12h14m-5-5 5 5-5 5\"/></svg>\n                "
          },
          {
            "imageSrc": "/assets/home-product-loggia.webp",
            "imageWidth": 592,
            "imageHeight": 444,
            "imageAlt": "Лоджия длиной три метра под ключ",
            "kickerHtml": "Готовое решение",
            "titleHtml": "Лоджия 3 м под ключ",
            "descriptionHtml": "\n                  Остекление лоджии с отливом, козырьком, подоконником,\n                  доставкой и монтажом.\n                ",
            "priceHtml": "<small>готовая цена</small> от 34 950 ₽",
            "features": [
              {
                "labelHtml": "Длина",
                "valueHtml": "3 метра"
              },
              {
                "labelHtml": "Исполнение",
                "valueHtml": "под ключ"
              },
              {
                "labelHtml": "Подходит для:",
                "valueHtml": "для балкона или лоджии"
              }
            ],
            "modalTitle": "лоджии под ключ",
            "modalHeading": "Рассчитать лоджию под ключ",
            "modalDescription": "Уточним конфигурацию, количество створок и состояние парапета. Подготовим расчёт остекления лоджии под ключ.",
            "modalImage": "/assets/loggia-glazing-card.jpg",
            "modalSubmit": "Получить расчёт лоджии",
            "buttonLabelHtml": "\n                  Рассчитать лоджию <svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\" fill=\"none\" stroke=\"currentColor\" aria-hidden=\"true\"><path d=\"M5 12h14m-5-5 5 5-5 5\"/></svg>\n                "
          },
          {
            "imageSrc": "/assets/home-product-house.webp",
            "imageWidth": 600,
            "imageHeight": 338,
            "imageAlt": "Комплект окон для загородного дома",
            "kickerHtml": "Комплект из 5 окон",
            "titleHtml": "Окна в загородный дом",
            "descriptionHtml": "\n                  Пять ПВХ-окон для дома или дачи с доставкой и монтажом готовым\n                  комплектом.\n                ",
            "priceHtml": "<small>за 5 окон</small> от 55 950 ₽",
            "features": [
              {
                "labelHtml": "Количество",
                "valueHtml": "5 окон"
              },
              {
                "labelHtml": "Включено",
                "valueHtml": "доставка + монтаж"
              },
              {
                "labelHtml": "Подходит для:",
                "valueHtml": "для спальни, для кухни, для детской, для гостиной в доме или на даче"
              }
            ],
            "modalTitle": "окон для загородного дома",
            "modalHeading": "Рассчитать 5 окон для дома",
            "modalDescription": "Уточним размеры проёмов и назначение дома. Подготовим расчёт комплекта из пяти окон с доставкой и монтажом.",
            "modalImage": "/assets/country-house-windows-card.jpg",
            "modalSubmit": "Получить расчёт окон для дома",
            "buttonLabelHtml": "\n                  Рассчитать 5 окон <svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\" fill=\"none\" stroke=\"currentColor\" aria-hidden=\"true\"><path d=\"M5 12h14m-5-5 5 5-5 5\"/></svg>\n                "
          }
        ]
      }
    },
    "price": {
      "component": "included",
      "data": {
        "id": "",
        "imageSrc": "/assets/window-installation-estimate.jpg",
        "imageWidth": "",
        "imageHeight": "",
        "imageAlt": "Пример подробной сметы на остекление с перечнем работ и материалов",
        "titleHtml": "Что входит в стоимость",
        "kickerHtml": "ПРОЗРАЧНАЯ СМЕТА",
        "leadHtml": "\n                  Базовая цена включает изделие и основные работы под ключ.\n                  Дополнительные опции согласовываем отдельно и фиксируем в\n                  смете до начала работ.\n                ",
        "promiseTitleHtml": "Честная смета без скрытых доплат",
        "promiseTextHtml": "Всё фиксируем до начала работ",
        "items": [
          {
            "labelHtml": "Окно",
            "conditionHtml": "<i aria-hidden=\"true\"><svg viewBox=\"0 0 24 24\">\n                      <path d=\"m6 12 4 4 8-9\"></path></svg></i>Включено в базовую цену",
            "conditionClass": "home-table__included"
          },
          {
            "labelHtml": "Замер",
            "conditionHtml": "<i aria-hidden=\"true\"><svg viewBox=\"0 0 24 24\">\n                      <path d=\"m6 12 4 4 8-9\"></path></svg></i>Включено в базовую цену",
            "conditionClass": "home-table__included"
          },
          {
            "labelHtml": "Доставка в пределах Рыбинска",
            "conditionHtml": "<i aria-hidden=\"true\"><svg viewBox=\"0 0 24 24\">\n                      <path d=\"m6 12 4 4 8-9\"></path></svg></i>Включено в базовую цену",
            "conditionClass": "home-table__included"
          },
          {
            "labelHtml": "Демонтаж",
            "conditionHtml": "<i aria-hidden=\"true\"><svg viewBox=\"0 0 24 24\">\n                      <path d=\"m6 12 4 4 8-9\"></path></svg></i>Включено в базовую цену",
            "conditionClass": "home-table__included"
          },
          {
            "labelHtml": "Монтаж",
            "conditionHtml": "<i aria-hidden=\"true\"><svg viewBox=\"0 0 24 24\">\n                      <path d=\"m6 12 4 4 8-9\"></path></svg></i>Включено в базовую цену",
            "conditionClass": "home-table__included"
          },
          {
            "labelHtml": "Подоконник, отлив, откосы",
            "conditionHtml": "<i aria-hidden=\"true\"><svg viewBox=\"0 0 24 24\">\n                      <path d=\"m6 12 4 4 8-9\"></path></svg></i>Включено в базовую цену",
            "conditionClass": "home-table__included"
          },
          {
            "labelHtml": "Москитная сетка",
            "conditionHtml": "<i aria-hidden=\"true\"><svg viewBox=\"0 0 24 24\">\n                      <path d=\"M7 3h8l4 4v14H7zM15 3v5h4M10 12h6M10 16h6\"></path>\n                    </svg></i>Дополнительно по желанию",
            "conditionClass": "home-table__optional"
          },
          {
            "labelHtml": "Вывоз и утилизация старых конструкций",
            "conditionHtml": "<i aria-hidden=\"true\"><svg viewBox=\"0 0 24 24\">\n                      <path d=\"M7 3h8l4 4v14H7zM15 3v5h4M10 12h6M10 16h6\"></path>\n                    </svg></i>Дополнительно по необходимости",
            "conditionClass": "home-table__optional"
          }
        ]
      }
    },
    "process": {
      "component": "installation",
      "data": {
        "id": "installation",
        "kickerHtml": "ТЕХНОЛОГИЯ МОНТАЖА",
        "titleHtml": "Подбираем монтажный узел под материал стен",
        "leadHtml": "\n                  Каждый материал стен требует своего подхода к установке.\n                  Правильный монтажный узел сохраняет тепло, защищает от влаги и\n                  продлевает срок службы окна.\n                ",
        "noteTitleHtml": "Хорошее окно можно испортить неправильной\n                    установкой.",
        "noteHtml": "До изготовления проверяем проёмы, стены, фасад и будущую\n                    отделку. Подбираем решение, которое будет работать\n                    десятилетиями.",
        "imageSrc": "/assets/installation-aerated.webp",
        "imageWidth": "720",
        "imageHeight": "586",
        "imageAlt": "Схема монтажного узла окна в газобетонной стене",
        "walls": [
          {
            "key": "aerated",
            "imageSrc": "/assets/installation-aerated.webp",
            "className": "wall-tab is-active",
            "titleHtml": "Газобетон и пеноблок"
          },
          {
            "key": "frame",
            "imageSrc": "/assets/installation-frame.webp",
            "className": "wall-tab",
            "titleHtml": "Каркасный дом"
          },
          {
            "key": "brick",
            "imageSrc": "/assets/installation-brick.webp",
            "className": "wall-tab",
            "titleHtml": "Кирпичный дом"
          },
          {
            "key": "wood",
            "imageSrc": "/assets/installation-wood.webp",
            "className": "wall-tab",
            "titleHtml": "Деревянный дом"
          }
        ],
        "details": [
          {
            "titleHtml": "Правильное положение рамы",
            "descriptionHtml": "Рама устанавливается в тепловой контур, ближе к наружной\n                    плоскости стены."
          },
          {
            "titleHtml": "Способ крепления",
            "descriptionHtml": "Крепление на анкерные пластины или рамные дюбели к несущей\n                    части стены."
          },
          {
            "titleHtml": "Устройство монтажного шва",
            "descriptionHtml": "Пароизоляция внутри, утепление по центру и паропроницаемая\n                    лента снаружи."
          },
          {
            "titleHtml": "Внешняя защита от влаги",
            "descriptionHtml": "ПСУЛ или диффузионная лента защищает шов от осадков и\n                    ветра."
          },
          {
            "titleHtml": "Утепление и опорные элементы",
            "descriptionHtml": "Заполняем шов пеной и устанавливаем опорные колодки под\n                    рамой."
          },
          {
            "titleHtml": "Риски неправильного монтажа",
            "descriptionHtml": "Промерзание, плесень, продувание, разрушение шва и\n                    сквозняки."
          }
        ],
        "points": [
          {
            "textHtml": "Крепление на анкерные пластины"
          },
          {
            "textHtml": "ПСУЛ или диффузионная лента"
          },
          {
            "textHtml": "Монтажная пена"
          },
          {
            "textHtml": "Пароизоляционная лента"
          },
          {
            "textHtml": "Опорная колодка"
          },
          {
            "textHtml": "Подоконник"
          },
          {
            "textHtml": "Отлив с капельником"
          },
          {
            "textHtml": "Наружная отделка фасада"
          }
        ],
        "benefits": [
          {
            "imageSrc": "/assets/search.svg",
            "textHtml": "Проверяем проёмы и геометрию"
          },
          {
            "imageSrc": "/assets/block-brick.svg",
            "textHtml": "Учитываем материал стен и отделку"
          },
          {
            "imageSrc": "/assets/puzzle-piece.svg",
            "textHtml": "Подбираем оптимальный монтажный узел"
          },
          {
            "imageSrc": "/assets/file-signature.svg",
            "textHtml": "Фиксируем решение в договоре"
          }
        ]
      }
    },
    "warranty": {
      "component": "warranty",
      "data": {
        "id": "warranty",
        "titleHtml": "\n                Гарантийные условия без противоречий и мелкого шрифта\n              ",
        "leadHtml": "\n                Мы даём гарантию на продукцию и монтажные работы. Все условия чётко\n                зафиксированы в договоре.\n              ",
        "footnoteHtml": "Гарантия действует при соблюдении правил эксплуатации и ухода\n                  за конструкциями.",
        "items": [
          {
            "iconHtml": "\n                    <rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"1\"></rect>\n                    <path d=\"M12 3v18M7 7v10M17 7v10\"></path>",
            "titleHtml": "Оконные конструкции (ПВХ и алюминий)",
            "termHtml": "5 лет",
            "descriptionHtml": "Профиль, сварные швы, геометрия, изменение цвета\n                    профиля"
          },
          {
            "iconHtml": "\n                    <rect x=\"4\" y=\"4\" width=\"16\" height=\"16\" rx=\"1\"></rect>\n                    <path d=\"M12 4v16M7 15l3-3M17 9l-3 3\"></path>",
            "titleHtml": "Стеклопакеты",
            "termHtml": "5 лет",
            "descriptionHtml": "Герметичность, отсутствие запотевания внутри\n                    стеклопакета"
          },
          {
            "iconHtml": "\n                    <path d=\"M12 3.5a2 2 0 0 1 2 2v.3a6.7 6.7 0 0 1 1.8 1l.3-.2a2 2 0 1 1 2 3.5l-.3.2a6.8 6.8 0 0 1 0 2.1l.3.2a2 2 0 1 1-2 3.5l-.3-.2a6.7 6.7 0 0 1-1.8 1v.3a2 2 0 1 1-4 0v-.3a6.7 6.7 0 0 1-1.8-1l-.3.2a2 2 0 1 1-2-3.5l.3-.2a6.8 6.8 0 0 1 0-2.1l-.3-.2a2 2 0 1 1 2-3.5l.3.2a6.7 6.7 0 0 1 1.8-1v-.3a2 2 0 0 1 2-2Z\"></path>\n                    <circle cx=\"12\" cy=\"11.3\" r=\"2.7\"></circle>",
            "titleHtml": "Фурнитура",
            "termHtml": "2 года",
            "descriptionHtml": "Работоспособность механизмов при правильной\n                    эксплуатации"
          },
          {
            "iconHtml": "\n                    <path d=\"m4 18 10-10 3 3L7 21H4z\"></path>\n                    <path d=\"m13 5 3-3 6 6-3 3\"></path>\n                    <path d=\"m8 14 2 2\"></path>",
            "titleHtml": "Монтаж",
            "termHtml": "5 лет",
            "descriptionHtml": "Герметичность монтажного шва, надёжность креплений,\n                    отсутствие продуваний и протечек"
          },
          {
            "iconHtml": "\n                    <path d=\"M4 6h16M4 12h16M4 18h16\"></path>\n                    <circle cx=\"9\" cy=\"6\" r=\"2\"></circle>\n                    <circle cx=\"15\" cy=\"12\" r=\"2\"></circle>\n                    <circle cx=\"11\" cy=\"18\" r=\"2\"></circle>",
            "titleHtml": "Регулировка",
            "termHtml": "1 год",
            "descriptionHtml": "Бесплатная регулировка створок и фурнитуры"
          },
          {
            "iconHtml": "\n                    <path d=\"M4 13a8 8 0 0 1 16 0v3a2 2 0 0 1-2 2h-1v-6h3M4 18H3a2 2 0 0 1-2-2v-3h3v5Z\"></path>\n                    <path d=\"m10 18 2 2 4-4\"></path>",
            "titleHtml": "Сервисное обслуживание",
            "termHtml": "5 лет",
            "descriptionHtml": "Консультации, диагностика, устранение неисправностей по\n                    гарантии"
          }
        ],
        "information": [
          {
            "iconHtml": "\n                  <path d=\"M6 3h4l2 5-3 2a16 16 0 0 0 5 5l2-3 5 2v4c0 1-1 2-2 2C10 20 4 14 4 5c0-1 1-2 2-2Z\"></path>\n                ",
            "contentHtml": "\n                  <strong>Куда обратиться</strong>\n                  <p>\n                    Позвоните по телефону 8 (4855) 20-55-86 или напишите в\n                    мессенджер/на почту info@vertical-rybinsk.ru.\n                  </p>\n                "
          },
          {
            "iconHtml": "\n                  <circle cx=\"12\" cy=\"7\" r=\"3\"></circle>\n                  <path d=\"M5 20a7 7 0 0 1 14 0\"></path>\n                ",
            "contentHtml": "\n                  <strong>Кто принимает заявку</strong>\n                  <p>Сервис-менеджер компании «Вертикаль».</p>\n                "
          },
          {
            "iconHtml": "\n                  <rect x=\"5\" y=\"4\" width=\"14\" height=\"17\" rx=\"1\"></rect>\n                  <path d=\"M9 2v4M15 2v4M8 10h8M8 14h5M8 17h3\"></path>\n                ",
            "contentHtml": "\n                  <strong>Как подтверждается гарантийный случай</strong>\n                  <p>\n                    Выезд специалиста, диагностика и фиксация проблемы. При\n                    необходимости запрашиваем фото или видео. По результату\n                    составляем акт.\n                  </p>\n                "
          },
          {
            "iconHtml": "\n                  <circle cx=\"12\" cy=\"12\" r=\"8\"></circle>\n                  <path d=\"M12 7v5l3 2\"></path>\n                ",
            "contentHtml": "\n                  <strong>В какой срок компания отвечает</strong>\n                  <p>\n                    Отвечаем на заявку в течение 1 рабочего дня. Согласовываем\n                    выезд специалиста в удобное время.\n                  </p>\n                "
          },
          {
            "iconHtml": "\n                  <circle cx=\"12\" cy=\"12\" r=\"8\"></circle>\n                  <path d=\"m8 12 3 3 5-6\"></path>\n                ",
            "contentHtml": "\n                  <strong>Что входит в бесплатное устранение</strong>\n                  <p>\n                    Работы и материалы для устранения дефектов, возникших по\n                    нашей вине. Повторный выезд не оплачивается.\n                  </p>\n                "
          },
          {
            "iconHtml": "\n                  <circle cx=\"12\" cy=\"12\" r=\"8\"></circle>\n                  <path d=\"m9 9 6 6M15 9l-6 6\"></path>\n                ",
            "contentHtml": "\n                  <strong>Какие случаи не являются гарантийными</strong>\n                  <ul>\n                    <li>Механические повреждения и ударные нагрузки.</li>\n                    <li>Неправильная эксплуатация и уход.</li>\n                    <li>Самостоятельный ремонт или регулировка.</li>\n                    <li>\n                      Изменение конструкции проёма, фасада, отделки без\n                      согласования.\n                    </li>\n                    <li>Естественный износ расходных материалов.</li>\n                  </ul>\n                "
          }
        ]
      }
    },
    "reviews": {
      "component": "reviews",
      "data": {
        "id": "reviews",
        "titleHtml": "Что говорят заказчики после установки окон",
        "items": reviewsForPage('home'),
        "extraClass": "home-reviews"
      }
    },
    "faq": {
      "component": "faq",
      "data": {
        "id": "faq",
        "titleHtml": "Частые вопросы",
        "items": [
          {
            "questionHtml": "Сколько времени занимает изготовление окон?",
            "answerHtml": "\n              Срок зависит от комплектации и сезона. Точный срок укажем в\n              договоре после замера.\n            "
          },
          {
            "questionHtml": "Можно ли заказать окна с монтажом?",
            "answerHtml": "\n              Да. Замерщик рассчитает монтаж, демонтаж и отделку откосов\n              отдельно, если они нужны.\n            "
          },
          {
            "questionHtml": "Как понять точную цену?",
            "answerHtml": "\n              Пришлите размеры или фотографию проёма — подготовим\n              предварительный расчёт, затем уточним его после замера.\n            "
          },
          {
            "questionHtml": "Выезд замерщика платный?",
            "answerHtml": "\n              Замер в Рыбинске входит в базовую стоимость. Для удалённых\n              объектов заранее согласуем условия и стоимость выезда.\n            "
          },
          {
            "questionHtml": "Можно ли заменить окна зимой?",
            "answerHtml": "\n              Да. Проём остаётся открытым недолго, а монтаж выполняем поэтапно.\n              Возможность работ зависит от температуры и используемых монтажных\n              материалов.\n            "
          },
          {
            "questionHtml": "Какой профиль выбрать: 60, 70 или 80 мм?",
            "answerHtml": "\n              Для сезонной дачи обычно достаточно 60 мм, для квартиры чаще\n              выбирают 70 мм, а для энергоэффективного частного дома — 80 мм.\n              Точный вариант зависит от проёма и условий эксплуатации.\n            "
          },
          {
            "questionHtml": "Чем отличаются одно- и двухкамерные стеклопакеты?",
            "answerHtml": "\n              Двухкамерный стеклопакет лучше сохраняет тепло и снижает уличный\n              шум. Однокамерный подходит для сезонных и неотапливаемых\n              помещений.\n            "
          },
          {
            "questionHtml": "Делаете ли вы демонтаж старых окон?",
            "answerHtml": "\n              Да. Демонтаж рассчитывается отдельно по необходимости. Перед\n              началом работ уточняем объём, состояние проёма и способ выноса\n              старых конструкций.\n            "
          },
          {
            "questionHtml": "Можно ли заказать вывоз строительного мусора?",
            "answerHtml": "\n              Да. Добавим вывоз демонтированных рам и строительного мусора в\n              смету отдельной строкой, если услуга потребуется.\n            "
          },
          {
            "questionHtml": "Входят ли подоконники, отливы и откосы в цену?",
            "answerHtml": "\n              Эти элементы рассчитываются отдельно, поскольку размеры, материалы\n              и объём отделки на каждом объекте отличаются.\n            "
          },
          {
            "questionHtml": "Сколько времени занимает монтаж?",
            "answerHtml": "\n              Одно стандартное окно обычно устанавливаем за несколько часов.\n              Срок всего объекта зависит от количества конструкций, демонтажа и\n              отделочных работ.\n            "
          },
          {
            "questionHtml": "Какая гарантия действует на окна и монтаж?",
            "answerHtml": "\n              Сроки гарантии фиксируем в договоре отдельно для конструкций,\n              фурнитуры и монтажных работ. При обращении организуем диагностику\n              и сервис.\n            "
          },
          {
            "questionHtml": "Можно ли установить окна в деревянном доме?",
            "answerHtml": "\n              Да. Учитываем усадку стен и состояние обсады. Окно крепим к\n              обсадной коробке, чтобы подвижки древесины не деформировали раму.\n            "
          },
          {
            "questionHtml": "\n              Работаете ли вы с панорамными и нестандартными окнами?\n            ",
            "answerHtml": "\n              Да. Проверяем размеры и нагрузки, подбираем профиль,\n              энергосберегающий или безопасный стеклопакет и подходящий\n              монтажный узел.\n            "
          },
          {
            "questionHtml": "Что нужно для предварительного расчёта?",
            "answerHtml": "\n              Достаточно примерных размеров, количества окон и фотографии\n              проёма. Для панорамных конструкций можно приложить план или\n              проектную ведомость.\n            "
          }
        ]
      }
    },
    "calculator": {
      "component": "calculator",
      "data": {
        "id": "calculator",
        "imageSrc": "/assets/window-calculator-visual.jpg",
        "imageWidth": 1178,
        "imageHeight": 918,
        "imageAlt": "Окно, рулетка и калькулятор для расчёта стоимости остекления",
        "titleHtml": "Узнайте ориентировочную стоимость окон",
        "leadHtml": "\n                Ответьте на несколько вопросов — получите расчёт стоимости окон\n                с учётом монтажа и доставки.\n              ",
        "sourceName": "Калькулятор: главная",
        "installationPlace": "",
        "places": [
          {
            "value": "apartment",
            "labelHtml": "Квартира",
            "checked": true
          },
          {
            "value": "house",
            "labelHtml": "Частный дом",
            "checked": false
          },
          {
            "value": "cottage",
            "labelHtml": "Дача / коттедж",
            "checked": false
          },
          {
            "value": "other",
            "labelHtml": "Другое",
            "checked": false
          }
        ]
      }
    },
    "cases": {
      "component": "cases",
      "data": {
        "id": "works",
        "titleHtml": "Показываем установленные окна на реальных объектах",
        "category": "balconies",
        "navigation": {
          "items": [
            {
              "category": "balconies",
              "labelHtml": "<svg viewBox=\"0 0 32 32\" aria-hidden=\"true\"><path d=\"M5 3h22a2 2 0 0 1 2 2v15a2 2 0 0 1-2 2h-1v7h-3v-7H9v7H6v-7H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm2 4v11h7V7H7Zm11 0v11h7V7h-7Zm-7 13v9h3v-9h-3Zm7 0v9h3v-9h-3Z\"></path></svg><span>Балконы, лоджии</span>",
              "className": "cases-menu__button is-active"
            },
            {
              "category": "houses",
              "labelHtml": "<svg viewBox=\"0 0 32 32\" aria-hidden=\"true\"><path d=\"M16 2 2 14h4v15h8v-9h4v9h8V14h4L16 2Zm-5 12h4v4h-4v-4Zm6 0h4v4h-4v-4Z\"></path></svg><span>Загородные дома</span>",
              "className": "cases-menu__button"
            },
            {
              "category": "apartments",
              "labelHtml": "<svg viewBox=\"0 0 32 32\" aria-hidden=\"true\"><path d=\"M5 3h22a2 2 0 0 1 2 2v22a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm2 4v7h7V7H7Zm11 0v7h7V7h-7ZM7 18v7h7v-7H7Zm11 0v7h7v-7h-7Z\"></path></svg><span>Окна в квартиру</span>",
              "className": "cases-menu__button"
            }
          ]
        },
        "items": [
          {
            "titleHtml": "Окна в квартиру с установкой",
            "photos": [
              {
                "src": "/assets/apartment-window-1.webp",
                "alt": "Окно в квартире после установки"
              }
            ],
            "details": [
              {
                "labelHtml": "Срок",
                "valueHtml": "От 1 дня"
              },
              {
                "labelHtml": "Стоимость",
                "valueHtml": "От 13 250 ₽"
              },
              {
                "labelHtml": "Объект",
                "valueHtml": "Квартира в Рыбинске · оконный проём"
              },
              {
                "labelHtml": "Что сделали",
                "valueHtml": "Подобрали оконную конструкцию по проёму, выполнили монтаж, герметизацию и регулировку створки."
              }
            ]
          },
          {
            "titleHtml": "Остекление квартиры с заменой окна",
            "photos": [
              {
                "src": "/assets/apartment-window-2.webp",
                "alt": "Окно в квартире после замены"
              }
            ],
            "details": [
              {
                "labelHtml": "Срок",
                "valueHtml": "От 1 дня"
              },
              {
                "labelHtml": "Стоимость",
                "valueHtml": "От 16 050 ₽"
              },
              {
                "labelHtml": "Объект",
                "valueHtml": "Квартира в Рыбинске · оконный проём"
              },
              {
                "labelHtml": "Что сделали",
                "valueHtml": "Изготовили окно по размеру проёма, выполнили тёплый монтаж, герметизацию и регулировку."
              }
            ]
          },
          {
            "titleHtml": "Установка окна в квартире",
            "photos": [
              {
                "src": "/assets/apartment-window-3.webp",
                "alt": "Новое окно в квартире"
              }
            ],
            "details": [
              {
                "labelHtml": "Срок",
                "valueHtml": "От 1 дня"
              },
              {
                "labelHtml": "Стоимость",
                "valueHtml": "От 13 950 ₽"
              },
              {
                "labelHtml": "Объект",
                "valueHtml": "Квартира в Рыбинске · оконный проём"
              },
              {
                "labelHtml": "Что сделали",
                "valueHtml": "Сняли старую конструкцию, установили новое окно, выполнили герметизацию и регулировку фурнитуры."
              }
            ]
          },
          {
            "titleHtml": "Замена окна в квартире с тёплым монтажом",
            "photos": [
              {
                "src": "/assets/apartment-window-4-1.webp",
                "alt": "Окно в квартире после монтажа"
              },
              {
                "src": "/assets/apartment-window-4-2.webp",
                "alt": "Деталь установленного окна в квартире"
              }
            ],
            "details": [
              {
                "labelHtml": "Срок",
                "valueHtml": "От 1 дня"
              },
              {
                "labelHtml": "Стоимость",
                "valueHtml": "От 17 450 ₽"
              },
              {
                "labelHtml": "Объект",
                "valueHtml": "Квартира в Рыбинске · оконный проём"
              },
              {
                "labelHtml": "Что сделали",
                "valueHtml": "Демонтировали старое окно, установили новую конструкцию, утеплили монтажный шов и настроили створки."
              }
            ]
          },
          {
            "titleHtml": "Пластиковое окно для квартиры",
            "photos": [
              {
                "src": "/assets/apartment-window-5.webp",
                "alt": "Окно в квартире после установки"
              }
            ],
            "details": [
              {
                "labelHtml": "Срок",
                "valueHtml": "От 1 дня"
              },
              {
                "labelHtml": "Стоимость",
                "valueHtml": "От 12 550 ₽"
              },
              {
                "labelHtml": "Объект",
                "valueHtml": "Квартира в Рыбинске · оконный проём"
              },
              {
                "labelHtml": "Что сделали",
                "valueHtml": "Выполнили замер, изготовили окно, установили конструкцию и аккуратно заделали монтажный шов."
              }
            ]
          },
          {
            "titleHtml": "Оконный блок для квартиры",
            "photos": [
              {
                "src": "/assets/apartment-window-6-1.webp",
                "alt": "Окно в квартире до и после монтажа"
              },
              {
                "src": "/assets/apartment-window-6-2.webp",
                "alt": "Монтаж окна в квартире"
              }
            ],
            "details": [
              {
                "labelHtml": "Срок",
                "valueHtml": "От 1 дня"
              },
              {
                "labelHtml": "Стоимость",
                "valueHtml": "От 18 850 ₽"
              },
              {
                "labelHtml": "Объект",
                "valueHtml": "Квартира в Рыбинске · оконный проём"
              },
              {
                "labelHtml": "Что сделали",
                "valueHtml": "Заменили оконный блок, утеплили откосы, выполнили герметизацию и отрегулировали фурнитуру."
              }
            ]
          },
          {
            "titleHtml": "Окно в квартиру с аккуратной отделкой",
            "photos": [
              {
                "src": "/assets/apartment-window-7.webp",
                "alt": "Установленное окно в квартире"
              }
            ],
            "details": [
              {
                "labelHtml": "Срок",
                "valueHtml": "От 1 дня"
              },
              {
                "labelHtml": "Стоимость",
                "valueHtml": "От 14 650 ₽"
              },
              {
                "labelHtml": "Объект",
                "valueHtml": "Квартира в Рыбинске · оконный проём"
              },
              {
                "labelHtml": "Что сделали",
                "valueHtml": "Установили новое окно, подготовили откосы, выполнили герметизацию и финальную регулировку."
              }
            ]
          },
          {
            "titleHtml": "Белые окна со шпросами для кирпичного коттеджа",
            "photos": [
              {
                "src": "/assets/case-one-1.jpg",
                "alt": "Белые окна со шпросами в кирпичном коттедже"
              },
              {
                "src": "/assets/case-one-2.jpg",
                "alt": "Фасад коттеджа с белыми окнами"
              },
              {
                "src": "/assets/case-one-3.jpg",
                "alt": "Окна со декоративной раскладкой"
              },
              {
                "src": "/assets/case-one-4.jpg",
                "alt": "Готовое остекление кирпичного коттеджа"
              }
            ],
            "details": [
              {
                "labelHtml": "Срок",
                "valueHtml": "10 дней"
              },
              {
                "labelHtml": "Стоимость",
                "valueHtml": "147 000 ₽"
              },
              {
                "labelHtml": "Объект",
                "valueHtml": "Коттедж, пос. Каменники · 2 этажа"
              }
            ]
          },
          {
            "titleHtml": "Тёплое остекление балкона с тёмной ламинацией",
            "photos": [
              {
                "src": "/assets/balcony-dark-1.webp",
                "alt": "Панорамное остекление балкона с тёмной ламинацией"
              },
              {
                "src": "/assets/balcony-dark-2.webp",
                "alt": "Тёмные оконные конструкции на балконе"
              },
              {
                "src": "/assets/balcony-dark-3.webp",
                "alt": "Готовое остекление балкона снаружи"
              }
            ],
            "details": [
              {
                "labelHtml": "Срок",
                "valueHtml": "2 дня"
              },
              {
                "labelHtml": "Стоимость",
                "valueHtml": "19 100 ₽"
              },
              {
                "labelHtml": "Объект",
                "valueHtml": "Квартира, ул. Герцена · балкон 3 м"
              }
            ]
          },
          {
            "titleHtml": "Окна с тёмной ламинацией для кирпичного дома",
            "photos": [
              {
                "src": "/assets/case-two-1.jpg",
                "alt": "Ламинированные окна в кирпичном доме"
              },
              {
                "src": "/assets/case-two-2.jpg",
                "alt": "Тёмное окно с ламинацией"
              },
              {
                "src": "/assets/case-two-3.jpg",
                "alt": "Ламинированные окна на кирпичном фасаде"
              },
              {
                "src": "/assets/case-two-4.jpg",
                "alt": "Готовые окна в частном доме"
              }
            ],
            "details": [
              {
                "labelHtml": "Срок",
                "valueHtml": "7 дней"
              },
              {
                "labelHtml": "Стоимость",
                "valueHtml": "99 750 ₽"
              },
              {
                "labelHtml": "Объект",
                "valueHtml": "Частный дом, пос. Судоверфь · 12 окон"
              }
            ]
          },
          {
            "titleHtml": "Холодное остекление садовой веранды",
            "photos": [
              {
                "src": "/assets/case-four-1.jpg",
                "alt": "Алюминиевое остекление садовой веранды"
              },
              {
                "src": "/assets/case-four-2.jpg",
                "alt": "Каркас остекления веранды"
              },
              {
                "src": "/assets/case-four-3.jpg",
                "alt": "Алюминиевые створки садовой веранды"
              },
              {
                "src": "/assets/case-four-4.jpg",
                "alt": "Готовое холодное остекление веранды"
              }
            ],
            "details": [
              {
                "labelHtml": "Срок",
                "valueHtml": "5 дней"
              },
              {
                "labelHtml": "Стоимость",
                "valueHtml": "51 100 ₽"
              },
              {
                "labelHtml": "Объект",
                "valueHtml": "Дача, СНТ «Волга» · веранда 24 м²"
              }
            ]
          },
          {
            "titleHtml": "Остекление и внутренняя отделка лоджии",
            "photos": [
              {
                "src": "/assets/loggia-finish-1.webp",
                "alt": "Остекление лоджии до внутренней отделки"
              },
              {
                "src": "/assets/loggia-finish-2.webp",
                "alt": "Монтаж остекления лоджии"
              },
              {
                "src": "/assets/loggia-finish-3.webp",
                "alt": "Отделка стен лоджии"
              },
              {
                "src": "/assets/loggia-finish-4.webp",
                "alt": "Внутренняя отделка лоджии"
              },
              {
                "src": "/assets/loggia-finish-5.webp",
                "alt": "Окна готовой лоджии"
              },
              {
                "src": "/assets/loggia-finish-6.webp",
                "alt": "Готовая тёплая лоджия"
              },
              {
                "src": "/assets/loggia-finish-7.webp",
                "alt": "Результат остекления и отделки лоджии"
              }
            ],
            "details": [
              {
                "labelHtml": "Срок",
                "valueHtml": "5 дней"
              },
              {
                "labelHtml": "Стоимость",
                "valueHtml": "40 200 ₽"
              },
              {
                "labelHtml": "Объект",
                "valueHtml": "Квартира, пр-т Ленина · лоджия 6 м"
              }
            ]
          },
          {
            "titleHtml": "Остекление входной веранды частного дома",
            "photos": [
              {
                "src": "/assets/case-five-1.jpg",
                "alt": "Остеклённая входная веранда частного дома"
              },
              {
                "src": "/assets/case-five-2.jpg",
                "alt": "Остекление веранды с дверью"
              },
              {
                "src": "/assets/case-five-3.jpg",
                "alt": "Готовая входная веранда частного дома"
              }
            ],
            "details": [
              {
                "labelHtml": "Срок",
                "valueHtml": "4 дня"
              },
              {
                "labelHtml": "Стоимость",
                "valueHtml": "66 150 ₽"
              },
              {
                "labelHtml": "Объект",
                "valueHtml": "Частный дом, д. Ермаково · входная группа"
              }
            ]
          },
          {
            "titleHtml": "Панорамное остекление террасы дома из бруса",
            "photos": [
              {
                "src": "/assets/case-three-1.jpg",
                "alt": "Панорамное остекление террасы дома из бруса"
              },
              {
                "src": "/assets/case-three-2.jpg",
                "alt": "Алюминиевое остекление террасы"
              }
            ],
            "details": [
              {
                "labelHtml": "Срок",
                "valueHtml": "8 дней"
              },
              {
                "labelHtml": "Стоимость",
                "valueHtml": "101 500 ₽"
              },
              {
                "labelHtml": "Объект",
                "valueHtml": "Дом из бруса, пос. Глебово · терраса 48 м²"
              }
            ]
          },
          {
            "titleHtml": "Панорамное остекление балкона от пола",
            "photos": [
              {
                "src": "/assets/balcony-panoramic-1.webp",
                "alt": "Панорамное остекление балкона от пола изнутри"
              },
              {
                "src": "/assets/balcony-panoramic-2.webp",
                "alt": "Монтаж панорамного остекления балкона"
              },
              {
                "src": "/assets/balcony-panoramic-3.webp",
                "alt": "Готовое панорамное остекление балкона"
              }
            ],
            "details": [
              {
                "labelHtml": "Срок",
                "valueHtml": "3 дня"
              },
              {
                "labelHtml": "Стоимость",
                "valueHtml": "27 450 ₽"
              },
              {
                "labelHtml": "Объект",
                "valueHtml": "Квартира, ул. Гагарина · балкон 5 м"
              }
            ]
          },
          {
            "titleHtml": "Белые окна со шпросами для каркасного дома",
            "photos": [
              {
                "src": "/assets/case-six-1.jpg",
                "alt": "Белые окна со шпросами в каркасном доме"
              },
              {
                "src": "/assets/case-six-2.jpg",
                "alt": "Окна каркасного дома"
              },
              {
                "src": "/assets/case-six-3.jpg",
                "alt": "Белые окна с декоративной раскладкой"
              },
              {
                "src": "/assets/case-six-4.jpg",
                "alt": "Готовое остекление каркасного дома"
              }
            ],
            "details": [
              {
                "labelHtml": "Срок",
                "valueHtml": "8 дней"
              },
              {
                "labelHtml": "Стоимость",
                "valueHtml": "112 000 ₽"
              },
              {
                "labelHtml": "Объект",
                "valueHtml": "Каркасный дом, СНТ «Мелиоратор» · 11 окон"
              }
            ]
          },
          {
            "titleHtml": "Панорамное остекление современного дома",
            "photos": [
              {
                "src": "/assets/case-seven-1.jpg",
                "alt": "Панорамное остекление современного дома"
              }
            ],
            "details": [
              {
                "labelHtml": "Срок",
                "valueHtml": "9 дней"
              },
              {
                "labelHtml": "Стоимость",
                "valueHtml": "124 250 ₽"
              },
              {
                "labelHtml": "Объект",
                "valueHtml": "Пос. Тихменево · дом 128 м²"
              }
            ]
          },
          {
            "titleHtml": "Тёплая лоджия с освещением и отделкой",
            "photos": [
              {
                "src": "/assets/loggia-warm-1.webp",
                "alt": "Тёплая лоджия до внутренней отделки"
              },
              {
                "src": "/assets/loggia-warm-2.webp",
                "alt": "Монтаж утепления лоджии"
              },
              {
                "src": "/assets/loggia-warm-3.webp",
                "alt": "Отделка стен тёплой лоджии"
              },
              {
                "src": "/assets/loggia-warm-4.webp",
                "alt": "Монтаж освещения на лоджии"
              },
              {
                "src": "/assets/loggia-warm-5.webp",
                "alt": "Чистовая отделка лоджии"
              },
              {
                "src": "/assets/loggia-warm-6.webp",
                "alt": "Готовая тёплая лоджия с освещением"
              }
            ],
            "details": [
              {
                "labelHtml": "Срок",
                "valueHtml": "6 дней"
              },
              {
                "labelHtml": "Стоимость",
                "valueHtml": "48 500 ₽"
              },
              {
                "labelHtml": "Объект",
                "valueHtml": "Квартира, ул. Приборостроителей · лоджия 6 м"
              }
            ]
          },
          {
            "titleHtml": "Современное остекление балкона",
            "photos": [
              {
                "src": "/assets/balcony-modern-1.webp",
                "alt": "Современное остекление балкона"
              },
              {
                "src": "/assets/balcony-modern-2.webp",
                "alt": "Панорамные окна балкона"
              },
              {
                "src": "/assets/balcony-modern-3.webp",
                "alt": "Готовый балкон с новым остеклением"
              }
            ],
            "details": [
              {
                "labelHtml": "Срок",
                "valueHtml": "По договору"
              },
              {
                "labelHtml": "Стоимость",
                "valueHtml": "от 30 050 ₽"
              },
              {
                "labelHtml": "Объект",
                "valueHtml": "Балкон в многоквартирном доме"
              },
              {
                "labelHtml": "Что сделали",
                "valueHtml": "Подобрали оконные конструкции, выполнили монтаж по уровню и герметично оформили все примыкания."
              }
            ]
          },
          {
            "titleHtml": "Остекление балкона с отделкой",
            "photos": [
              {
                "src": "/assets/balcony-complete-1.webp",
                "alt": "Балкон после остекления и отделки"
              },
              {
                "src": "/assets/balcony-complete-2.webp",
                "alt": "Остекление балкона снаружи"
              }
            ],
            "details": [
              {
                "labelHtml": "Срок",
                "valueHtml": "По договору"
              },
              {
                "labelHtml": "Стоимость",
                "valueHtml": "от 31 450 ₽"
              },
              {
                "labelHtml": "Объект",
                "valueHtml": "Балкон в многоквартирном доме"
              },
              {
                "labelHtml": "Что сделали",
                "valueHtml": "Установили новые оконные конструкции, выполнили внутреннюю отделку и аккуратно оформили примыкания."
              }
            ]
          },
          {
            "titleHtml": "Остекление балкона с заменой оконных блоков",
            "photos": [
              {
                "src": "/assets/balcony-final-1.webp",
                "alt": "Готовое остекление балкона"
              },
              {
                "src": "/assets/balcony-final-2.webp",
                "alt": "Остекление балкона снаружи"
              }
            ],
            "details": [
              {
                "labelHtml": "Срок",
                "valueHtml": "По договору"
              },
              {
                "labelHtml": "Стоимость",
                "valueHtml": "от 27 950 ₽"
              },
              {
                "labelHtml": "Объект",
                "valueHtml": "Балкон в многоквартирном доме"
              },
              {
                "labelHtml": "Что сделали",
                "valueHtml": "Демонтировали старые рамы, установили новые оконные блоки и герметично оформили примыкания."
              }
            ]
          },
          {
            "titleHtml": "Остекление балкона с внутренней обшивкой",
            "photos": [
              {
                "src": "/assets/balcony-panel-1.webp",
                "alt": "Балкон с внутренней обшивкой"
              },
              {
                "src": "/assets/balcony-panel-2.webp",
                "alt": "Остекление балкона снаружи"
              }
            ],
            "details": [
              {
                "labelHtml": "Срок",
                "valueHtml": "По договору"
              },
              {
                "labelHtml": "Стоимость",
                "valueHtml": "от 20 950 ₽"
              },
              {
                "labelHtml": "Объект",
                "valueHtml": "Балкон в многоквартирном доме"
              },
              {
                "labelHtml": "Что сделали",
                "valueHtml": "Установили новые оконные конструкции, закрыли нижнюю часть балкона панелями и выполнили герметизацию."
              }
            ]
          },
          {
            "titleHtml": "Остекление балкона с внутренней отделкой",
            "photos": [
              {
                "src": "/assets/balcony-shelves-1.webp",
                "alt": "Балкон с остеклением и полками"
              },
              {
                "src": "/assets/balcony-shelves-2.webp",
                "alt": "Новое остекление балкона снаружи"
              }
            ],
            "details": [
              {
                "labelHtml": "Срок",
                "valueHtml": "По договору"
              },
              {
                "labelHtml": "Стоимость",
                "valueHtml": "от 39 950 ₽"
              },
              {
                "labelHtml": "Объект",
                "valueHtml": "Балкон в многоквартирном доме"
              },
              {
                "labelHtml": "Что сделали",
                "valueHtml": "Заменили наружное остекление, выполнили внутреннюю отделку и установили функциональные полки."
              }
            ]
          },
          {
            "titleHtml": "Тёплое остекление и отделка длинной лоджии",
            "photos": [
              {
                "src": "/assets/balcony-long-1.webp",
                "alt": "Длинная лоджия после отделки"
              },
              {
                "src": "/assets/balcony-long-2.webp",
                "alt": "Остекление длинной лоджии"
              },
              {
                "src": "/assets/balcony-long-3.webp",
                "alt": "Белые оконные конструкции лоджии"
              },
              {
                "src": "/assets/balcony-long-4.webp",
                "alt": "Отделка длинной лоджии"
              },
              {
                "src": "/assets/balcony-long-5.webp",
                "alt": "Готовая лоджия с деревянным полом"
              }
            ],
            "details": [
              {
                "labelHtml": "Срок",
                "valueHtml": "По договору"
              },
              {
                "labelHtml": "Стоимость",
                "valueHtml": "от 74 950 ₽"
              },
              {
                "labelHtml": "Объект",
                "valueHtml": "Длинная лоджия в квартире"
              },
              {
                "labelHtml": "Что сделали",
                "valueHtml": "Установили тёплое остекление, выполнили утепление и отделку стен, потолка и пола лоджии."
              }
            ]
          },
          {
            "titleHtml": "Замена остекления и ремонт балкона",
            "photos": [
              {
                "src": "/assets/balcony-renovation-1.webp",
                "alt": "Новое остекление балкона"
              },
              {
                "src": "/assets/balcony-renovation-2.webp",
                "alt": "Тёмные оконные конструкции балкона"
              },
              {
                "src": "/assets/balcony-renovation-3.webp",
                "alt": "Монтаж окон на балконе"
              },
              {
                "src": "/assets/balcony-renovation-4.webp",
                "alt": "Остекление балкона с тёмным профилем"
              },
              {
                "src": "/assets/balcony-renovation-5.webp",
                "alt": "Балкон до ремонта"
              },
              {
                "src": "/assets/balcony-renovation-6-small.webp",
                "alt": "Балкон с новым остеклением снаружи"
              }
            ],
            "details": [
              {
                "labelHtml": "Срок",
                "valueHtml": "По договору"
              },
              {
                "labelHtml": "Стоимость",
                "valueHtml": "от 44 950 ₽"
              },
              {
                "labelHtml": "Объект",
                "valueHtml": "Балкон в многоквартирном доме"
              },
              {
                "labelHtml": "Что сделали",
                "valueHtml": "Демонтировали старые конструкции, установили новое остекление и подготовили балкон к дальнейшей отделке."
              }
            ]
          },
          {
            "titleHtml": "Остекление и отделка балкона под ключ",
            "photos": [
              {
                "src": "/assets/balcony-turnkey-1.webp",
                "alt": "Балкон после остекления и отделки"
              },
              {
                "src": "/assets/balcony-turnkey-2.webp",
                "alt": "Процесс внутренней отделки балкона"
              },
              {
                "src": "/assets/balcony-turnkey-3.webp",
                "alt": "Оконные створки на остеклённом балконе"
              },
              {
                "src": "/assets/balcony-turnkey-4.webp",
                "alt": "Остекление балкона изнутри"
              },
              {
                "src": "/assets/balcony-turnkey-5.webp",
                "alt": "Монтаж оконных конструкций на балконе"
              },
              {
                "src": "/assets/balcony-turnkey-6.webp",
                "alt": "Готовое остекление балкона"
              }
            ],
            "details": [
              {
                "labelHtml": "Срок",
                "valueHtml": "По договору"
              },
              {
                "labelHtml": "Стоимость",
                "valueHtml": "от 64 950 ₽"
              },
              {
                "labelHtml": "Объект",
                "valueHtml": "Балкон в квартире"
              },
              {
                "labelHtml": "Что сделали",
                "valueHtml": "Установили оконные конструкции, смонтировали подоконники и выполнили внутреннюю отделку балкона."
              }
            ]
          },
          {
            "titleHtml": "Окна и входная группа для дома из бревна",
            "photos": [
              {
                "src": "/assets/case-eight-1.jpg",
                "alt": "Окна дома из бревна"
              },
              {
                "src": "/assets/case-eight-2.jpg",
                "alt": "Монтаж окон в деревянном доме"
              }
            ],
            "details": [
              {
                "labelHtml": "Срок",
                "valueHtml": "8 дней"
              },
              {
                "labelHtml": "Стоимость",
                "valueHtml": "80 500 ₽"
              },
              {
                "labelHtml": "Объект",
                "valueHtml": "Пос. Песочное · дом 112 м²"
              }
            ]
          }
        ]
      }
    },
    "choice": {
      "component": "quiz",
      "data": {
        "id": "quiz",
        "titleHtml": "Получить предварительный расчет",
        "leadHtml": "\n            Ответьте на несколько вопросов — получите предварительный расчёт \n            и отправьте проект на проверку.\n          ",
        "resultTitleHtml": "Куда отправить расчет остекления?",
        "resultLeadHtml": "\n                  Расчитаем точную стоимость остекления и зафиксируем ее до\n                  начала работ\n                ",
        "commentPlaceholder": "Расскажите о задаче",
        "sourceName": "Квиз: главная",
        "successHtml": "Специалист свяжется с вами и уточнит детали заказа."
      }
    }
  },
  "footer": {
    "descriptionHtml": "\n              Окна, двери и панорамные конструкции с монтажом в Рыбинске и\n              Ярославской области.\n            ",
    "ctaTitleHtml": "Нужны окна для квартиры, дачи или дома?",
    "modalTitle": "расчёта окон",
    "modalHeading": "Расчёт окон по фото и размерам",
    "modalDescription": "",
    "modalImage": "",
    "modalSubmit": "Получить расчёт окон"
  }
};
homeComponents.sections.choice.data.questions = [firstQuizQuestion, ...generalQuizQuestions];
