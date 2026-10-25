import { reviewsForPage } from './reviews.js';
import { relatedCards } from './related.js';
// Page content only. Layouts live in components/*.html.
const installationTitles = ['Положение рамы','Крепление к основанию','Монтажный шов','Наружная защита','Опоры и утепление','Что проверяем перед монтажом'];
const apartmentWallDetails = Object.fromEntries(Object.entries({
  panel: [
    'Положение рамы согласуем с конструкцией панели, существующим проёмом и расположением утепления.',
    'Крепление подбираем под прочное бетонное основание, учитывая состояние кромок проёма.',
    'Шов утепляем и защищаем от влаги снаружи и от пара со стороны помещения.',
    'Защиту наружного примыкания подбираем по состоянию четверти и фасада.',
    'Передаём нагрузку через опорные колодки и утепляем зоны под подоконником и отливом.',
    'Проверяем состояние бетона, откосов и примыканий, чтобы исключить продувание и промерзание.'
  ],
  brick: [
    'Положение рамы определяем с учётом толщины стены, четверти и утепления проёма.',
    'Крепим конструкцию к прочной кладке; повреждённые участки основания предварительно восстанавливаем.',
    'Шов утепляем и защищаем от влаги снаружи и от пара со стороны помещения.',
    'Учитываем неровности кладки и подбираем защиту наружного примыкания по месту.',
    'Устанавливаем опорные колодки и утепляем примыкания к подоконнику и отливу.',
    'Проверяем состояние кирпича, швов кладки и откосов до изготовления окна.'
  ],
  monolith: [
    'Положение рамы подбираем по конструкции проёма, утеплению фасада и расположению откосов.',
    'Уточняем материал заполнения проёма и подбираем крепление к его несущему основанию.',
    'Утепляем шов и выполняем внутреннюю и наружную защиту примыканий.',
    'Согласуем примыкание к фасаду и защищаем шов от осадков и ветра.',
    'Устанавливаем опорные колодки и утепляем нижнее примыкание без пустот.',
    'Проверяем геометрию проёма и материал стен: в монолитном доме заполнение может отличаться от бетонного каркаса.'
  ]
}).map(([key, descriptions]) => [key, descriptions.map((text, index) => [installationTitles[index], text])]));
export const apartmentPage = {
  "order": [
    "hero",
    "choice",
    "cases",
    "solutions",
    "price",
    "process",
    "warranty",
    "reviews",
    "faq",
    "calculator",
    "related"
  ],
  "sections": {
    "hero": {
      "component": "hero",
      "data": {
        "imageSrc": "/assets/seo-hero-apartment-evening-backdrop.webp",
        "imageWidth": "1916",
        "imageHeight": "821",
        "imageAlt": "",
        "kickerHtml": "РЫБИНСК И РЫБИНСКИЙ РАЙОН",
        "titleHtml": "Пластиковые окна <span>в квартиру</span> в Рыбинске",
        "leadHtml": "Замена окон в жилой квартире: подберём открывание, стеклопакет и отделку проёма с учётом шума за окном и ваших привычек.",
        "breadcrumbHtml": "",
        "benefits": [
          {
            "iconHtml": "<rect x=\"4\" y=\"3\" width=\"24\" height=\"26\" rx=\"2\"></rect><path d=\"M16 3v26M4 16h24M10 8l-2 3M23 21l-2 3\"></path>",
            "titleHtml": "Комплектация под ваш объект",
            "descriptionHtml": "Подберём профиль, стеклопакет и фурнитуру под ваши задачи"
          },
          {
            "iconHtml": "<rect x=\"7\" y=\"2\" width=\"18\" height=\"28\" rx=\"2\"></rect><path d=\"M11 7h10v5H11zM11 18h2M19 18h2M11 24h2M19 24h2\"></path>",
            "titleHtml": "Согласованный состав сметы",
            "descriptionHtml": "Фиксируем все работы и материалы. Без скрытых платежей"
          },
          {
            "iconHtml": "<path d=\"M16 2 28 7v9c0 7-5 11-12 15C9 27 4 23 4 16V7L16 2Z\"></path><path d=\"m10 16 4 4 8-9\"></path>",
            "titleHtml": "Условия заказа в договоре",
            "descriptionHtml": "Сроки, гарантия, монтаж и сервис — всё прописано в договоре"
          }
        ],
        "products": [
          {
            "imageSrc": "/assets/apartment-two-sash-card.webp",
            "imageWidth": "535",
            "imageHeight": "401",
            "imageAlt": "Двухстворчатые окна",
            "href": "#calculator",
            "titleHtml": "Двухстворчатые окна",
            "captionHtml": "от 8 400 ₽"
          },
          {
            "imageSrc": "/assets/apartment-three-sash-card.webp",
            "imageWidth": "535",
            "imageHeight": "401",
            "imageAlt": "Трёхстворчатые окна",
            "href": "#calculator",
            "titleHtml": "Трёхстворчатые окна",
            "captionHtml": "от 12 600 ₽"
          },
          {
            "imageSrc": "/assets/apartment-balcony-block-card.webp",
            "imageWidth": "535",
            "imageHeight": "401",
            "imageAlt": "Балконные блоки",
            "href": "/balkonnye-bloki/",
            "titleHtml": "Балконные блоки",
            "captionHtml": "от 17 500 ₽"
          },
          {
            "imageSrc": "/assets/apartment-quiet-window-card.webp",
            "imageWidth": "535",
            "imageHeight": "401",
            "imageAlt": "Окна с шумоизоляцией",
            "href": "#calculator",
            "titleHtml": "Окна с шумоизоляцией",
            "captionHtml": "от 14 900 ₽"
          }
        ],
        "productsLabel": "Окна для квартиры"
      }
    },
    "solutions": {
      "component": "products",
      "data": {
        "id": "examples",
        "titleHtml": "Варианты окон для квартиры",
        "leadHtml": "Подберём конструкцию для ваших проёмов. Цены на изделия указаны без монтажа; итоговую комплектацию и состав работ согласуем после замера.",
        "items": [
          {
            "imageSrc": "/assets/apartment-two-sash-card.webp",
            "imageWidth": "535",
            "imageHeight": "401",
            "imageAlt": "Двухстворчатые окна",
            "kickerHtml": "Для жилых комнат",
            "titleHtml": "Двухстворчатые окна",
            "descriptionHtml": "Универсальный вариант для спальни или кухни. Подберём открывание и стеклопакет под ваш проём.",
            "priceHtml": "<small>за изделие</small>от 8 400 ₽",
            "features": [
              {
                "labelHtml": "Створки",
                "valueHtml": "Две"
              },
              {
                "labelHtml": "Комплектация",
                "valueHtml": "По размерам проёма"
              },
              {
                "labelHtml": "Подходит для:",
                "valueHtml": "для спальни, для кухни, для детской"
              }
            ],
            "modalTitle": "Двухстворчатые окна",
            "modalHeading": "Рассчитать двухстворчатые окна",
            "modalDescription": "Универсальный вариант для спальни или кухни. Подберём открывание и стеклопакет под ваш проём.",
            "modalImage": "/assets/apartment-two-sash-card.webp",
            "buttonLabelHtml": "Рассчитать стоимость<svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" aria-hidden=\"true\"><path d=\"M5 12h14m-5-5 5 5-5 5\"/></svg>",
            "modalSubmit": "Получить расчёт"
          },
          {
            "imageSrc": "/assets/apartment-three-sash-card.webp",
            "imageWidth": "535",
            "imageHeight": "401",
            "imageAlt": "Трёхстворчатые окна",
            "kickerHtml": "Для широких проёмов",
            "titleHtml": "Трёхстворчатые окна",
            "descriptionHtml": "Остекление широкого проёма в гостиной. Согласуем расположение открывающихся створок.",
            "priceHtml": "<small>за изделие</small>от 12 600 ₽",
            "features": [
              {
                "labelHtml": "Створки",
                "valueHtml": "Три"
              },
              {
                "labelHtml": "Открывание",
                "valueHtml": "На выбор"
              },
              {
                "labelHtml": "Подходит для:",
                "valueHtml": "для гостиной или просторной спальни"
              }
            ],
            "modalTitle": "Трёхстворчатые окна",
            "modalHeading": "Рассчитать трёхстворчатые окна",
            "modalDescription": "Остекление широкого проёма в гостиной. Согласуем расположение открывающихся створок.",
            "modalImage": "/assets/apartment-three-sash-card.webp",
            "buttonLabelHtml": "Рассчитать стоимость<svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" aria-hidden=\"true\"><path d=\"M5 12h14m-5-5 5 5-5 5\"/></svg>",
            "modalSubmit": "Получить расчёт"
          },
          {
            "imageSrc": "/assets/apartment-balcony-block-card.webp",
            "imageWidth": "535",
            "imageHeight": "401",
            "imageAlt": "Балконные блоки",
            "kickerHtml": "Выход на балкон",
            "titleHtml": "Балконные блоки",
            "descriptionHtml": "Окно и балконная дверь в одном блоке. Учтём порог, радиатор и расположение подоконника.",
            "priceHtml": "<small>за изделие</small>от 17 500 ₽",
            "features": [
              {
                "labelHtml": "Конструкция",
                "valueHtml": "Окно + дверь"
              },
              {
                "labelHtml": "Монтаж",
                "valueHtml": "По согласованию"
              },
              {
                "labelHtml": "Подходит для:",
                "valueHtml": "для кухни или гостиной с выходом на балкон"
              }
            ],
            "modalTitle": "Балконные блоки",
            "modalHeading": "Рассчитать балконные блоки",
            "modalDescription": "Окно и балконная дверь в одном блоке. Учтём порог, радиатор и расположение подоконника.",
            "modalImage": "/assets/apartment-balcony-block-card.webp",
            "buttonLabelHtml": "Рассчитать стоимость<svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" aria-hidden=\"true\"><path d=\"M5 12h14m-5-5 5 5-5 5\"/></svg>",
            "modalSubmit": "Получить расчёт"
          },
          {
            "imageSrc": "/assets/apartment-quiet-window-card.webp",
            "imageWidth": "535",
            "imageHeight": "401",
            "imageAlt": "Окна с шумоизоляцией",
            "kickerHtml": "Для шумных улиц",
            "titleHtml": "Окна с шумоизоляцией",
            "descriptionHtml": "Подберём стеклопакет с учётом уличного шума, этажа и расположения квартиры.",
            "priceHtml": "<small>за изделие</small>от 14 900 ₽",
            "features": [
              {
                "labelHtml": "Стеклопакет",
                "valueHtml": "Подбор под задачу"
              },
              {
                "labelHtml": "Стоимость",
                "valueHtml": "от 14 900 ₽"
              },
              {
                "labelHtml": "Подходит для:",
                "valueHtml": "для спальни, для детской, для гостиной рядом с шумной улицей"
              }
            ],
            "modalTitle": "Окна с шумоизоляцией",
            "modalHeading": "Рассчитать окна с шумоизоляцией",
            "modalDescription": "Подберём стеклопакет с учётом уличного шума, этажа и расположения квартиры.",
            "modalImage": "/assets/apartment-quiet-window-card.webp",
            "buttonLabelHtml": "Рассчитать стоимость<svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" aria-hidden=\"true\"><path d=\"M5 12h14m-5-5 5 5-5 5\"/></svg>",
            "modalSubmit": "Получить расчёт"
          }
        ]
      }
    },
    "choice": {
      "component": "quiz",
      "data": {
        "id": "apartment-quiz",
        "titleHtml": "Рассчитайте окна для вашей квартиры",
        "leadHtml": "Ответьте на 5 вопросов — подберём конструкцию, стеклопакет и состав работ для замены окон в квартире.",
        "resultTitleHtml": "Куда отправить расчёт окон для квартиры?",
        "resultLeadHtml": "Уточним размеры и подготовим предварительную смету на окна и выбранные работы.",
        "commentPlaceholder": "Размеры проёмов, этаж и пожелания к окнам",
        "sourceName": "Квиз: окна в квартиру",
        "successHtml": "Специалист свяжется с вами и уточнит размеры окон для квартиры.",
        "questions": [
          {
            "title": "Какие окна нужны в квартиру?",
            "description": "Выберите конструкцию — подберём комплектацию под ваши проёмы.",
            "options": [
              "Двухстворчатые окна",
              "Трёхстворчатые окна",
              "Балконный блок",
              "Окна с шумоизоляцией"
            ],
            "images": [
              "/assets/apartment-two-sash-card.webp",
              "/assets/apartment-three-sash-card.webp",
              "/assets/apartment-balcony-block-card.webp",
              "/assets/apartment-quiet-window-card.webp"
            ]
          },
          {
            "title": "Сколько проёмов нужно заменить?",
            "description": "Укажите примерное количество. Размеры уточним при замере.",
            "options": [
              "Один",
              "Два",
              "Три",
              "Четыре и больше",
              "Пока не знаю"
            ]
          },
          {
            "title": "Что особенно важно для ваших окон?",
            "description": "Выберите основную задачу — учтём её при подборе стеклопакета.",
            "options": [
              "Сохранение тепла",
              "Защита от уличного шума",
              "Безопасность для детей",
              "Удобное проветривание",
              "Нужна консультация"
            ]
          },
          {
            "title": "Какие работы включить в расчёт?",
            "description": "Согласуем полный состав заказа без лишних работ.",
            "options": [
              "Только окна",
              "Окна с доставкой",
              "Замена старых окон с монтажом",
              "Под ключ: демонтаж, монтаж и откосы",
              "Помогите подобрать"
            ]
          },
          {
            "title": "Когда планируете замену окон?",
            "description": "Учтём ваши сроки при согласовании замера и монтажа.",
            "options": [
              "Как можно скорее",
              "В течение месяца",
              "Через 1–3 месяца",
              "Позже",
              "Пока сравниваю цены"
            ]
          }
        ]
      }
    },
    "cases": {
      "component": "cases",
      "data": {
        "id": "apartment-cases",
        "titleHtml": "Примеры установки окон в квартирах",
        "category": "apartments",
        "items": [
          {
            "titleHtml": "Окна в квартиру с установкой",
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
            ],
            "photos": [
              {
                "src": "/assets/apartment-window-1.webp",
                "alt": "Окно в квартире после установки"
              }
            ]
          },
          {
            "titleHtml": "Остекление квартиры с заменой окна",
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
            ],
            "photos": [
              {
                "src": "/assets/apartment-window-2.webp",
                "alt": "Окно в квартире после замены"
              }
            ]
          },
          {
            "titleHtml": "Установка окна в квартире",
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
            ],
            "photos": [
              {
                "src": "/assets/apartment-window-3.webp",
                "alt": "Новое окно в квартире"
              }
            ]
          },
          {
            "titleHtml": "Замена окна в квартире с тёплым монтажом",
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
            ],
            "photos": [
              {
                "src": "/assets/apartment-window-4-1.webp",
                "alt": "Окно в квартире после монтажа"
              },
              {
                "src": "/assets/apartment-window-4-2.webp",
                "alt": "Деталь установленного окна в квартире"
              }
            ]
          },
          {
            "titleHtml": "Пластиковое окно для квартиры",
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
            ],
            "photos": [
              {
                "src": "/assets/apartment-window-5.webp",
                "alt": "Окно в квартире после установки"
              }
            ]
          },
          {
            "titleHtml": "Оконный блок для квартиры",
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
            ],
            "photos": [
              {
                "src": "/assets/apartment-window-6-1.webp",
                "alt": "Окно в квартире до и после монтажа"
              },
              {
                "src": "/assets/apartment-window-6-2.webp",
                "alt": "Монтаж окна в квартире"
              }
            ]
          },
          {
            "titleHtml": "Окно в квартиру с аккуратной отделкой",
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
            ],
            "photos": [
              {
                "src": "/assets/apartment-window-7.webp",
                "alt": "Установленное окно в квартире"
              }
            ]
          }
        ],
        "navigation": false
      }
    },
    "price": {
      "component": "included",
      "data": {
        "id": "prices",
        "imageSrc": "/assets/apartment-estimate.webp",
        "imageWidth": "473",
        "imageHeight": "678",
        "imageAlt": "Пример подробной сметы на остекление с перечнем работ и материалов",
        "titleHtml": "Что входит в стоимость окон в квартиру",
        "kickerHtml": "ПРОЗРАЧНАЯ СМЕТА",
        "leadHtml": "В смете отдельно указываем окна и выбранные работы: доставку, демонтаж, монтаж и отделку проёмов. Комплектацию и итоговую цену согласуем после замера до начала работ.",
        "promiseTitleHtml": "Честная смета без скрытых доплат",
        "promiseTextHtml": "Всё фиксируем до начала работ",
        "items": [
          {
            "labelHtml": "Окно",
            "conditionHtml": "<i aria-hidden=\"true\"><svg viewBox=\"0 0 24 24\">\n                      <path d=\"m6 12 4 4 8-9\"></path></svg></i>В составе согласованной сметы",
            "conditionClass": "home-table__included"
          },
          {
            "labelHtml": "Замер проёмов квартиры",
            "conditionHtml": "<i aria-hidden=\"true\"><svg viewBox=\"0 0 24 24\">\n                      <path d=\"m6 12 4 4 8-9\"></path></svg></i>В составе согласованной сметы",
            "conditionClass": "home-table__included"
          },
          {
            "labelHtml": "Доставка по Рыбинску",
            "conditionHtml": "<i aria-hidden=\"true\"><svg viewBox=\"0 0 24 24\">\n                      <path d=\"m6 12 4 4 8-9\"></path></svg></i>В составе согласованной сметы",
            "conditionClass": "home-table__included"
          },
          {
            "labelHtml": "Демонтаж старых окон",
            "conditionHtml": "<i aria-hidden=\"true\"><svg viewBox=\"0 0 24 24\">\n                      <path d=\"m6 12 4 4 8-9\"></path></svg></i>В составе согласованной сметы",
            "conditionClass": "home-table__included"
          },
          {
            "labelHtml": "Монтаж новых окон",
            "conditionHtml": "<i aria-hidden=\"true\"><svg viewBox=\"0 0 24 24\">\n                      <path d=\"m6 12 4 4 8-9\"></path></svg></i>В составе согласованной сметы",
            "conditionClass": "home-table__included"
          },
          {
            "labelHtml": "Подоконник, отлив, откосы",
            "conditionHtml": "<i aria-hidden=\"true\"><svg viewBox=\"0 0 24 24\">\n                      <path d=\"m6 12 4 4 8-9\"></path></svg></i>В составе согласованной сметы",
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
        "titleHtml": "Монтаж окон в квартире с учётом материала стен",
        "leadHtml": "Перед заменой окон проверяем материал и состояние проёмов, откосы и примыкания. Подбираем крепление и защиту монтажного шва, чтобы сохранить тепло и защитить квартиру от продувания.",
        "noteTitleHtml": "Хорошее окно можно испортить неправильной\n                    установкой.",
        "noteHtml": "До изготовления проверяем проёмы квартиры, состояние основания, подоконники и откосы. Согласуем крепление, монтажные материалы и отделку до начала работ.",
        "imageSrc": "/assets/installation-panel.webp",
        "imageWidth": "644",
        "imageHeight": "429",
        "imageAlt": "Схема монтажа окна в панельном доме",
        "walls": [
          {
            "key": "panel",
            "imageSrc": "/assets/installation-panel.webp",
            "className": "wall-tab is-active",
            "titleHtml": "Панельный дом"
          },
          {
            "key": "brick",
            "imageSrc": "/assets/installation-brick.webp",
            "className": "wall-tab",
            "titleHtml": "Кирпичный дом"
          },
          { "key": "monolith", "imageSrc": "/assets/installation-monolith.webp", "className": "wall-tab", "titleHtml": "Монолитный дом" }
        ],
        "wallDetails": apartmentWallDetails,
        "details": apartmentWallDetails.panel.map(([titleHtml, descriptionHtml]) => ({titleHtml, descriptionHtml})),
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
            "textHtml": "Защита наружного примыкания"
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
        "titleHtml": "Гарантия на окна в квартиру и монтажные работы",
        "leadHtml": "Гарантия распространяется на оконные конструкции, стеклопакеты, фурнитуру и монтаж. Сроки и условия вашего заказа фиксируем в договоре.",
        "footnoteHtml": "Гарантия действует при соблюдении правил эксплуатации и ухода\n                  за конструкциями.",
        "items": [
          {
            "iconHtml": "\n                    <rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"1\"></rect>\n                    <path d=\"M12 3v18M7 7v10M17 7v10\"></path>",
            "titleHtml": "Оконные конструкции (ПВХ)",
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
            "contentHtml": "\n                  <strong>Куда обратиться</strong>\n                  <p>\n                    Позвоните по телефону 8 (4855) 20-55-86 или напишите в\n                    мессенджер/на почту mail@vertyar.ru.\n                  </p>\n                "
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
        "titleHtml": "Отзывы после замены окон в квартире",
        "items": reviewsForPage('okna-v-kvartiru')
      }
    },
    "faq": {
      "component": "faq",
      "data": {
        "id": "faq",
        "titleHtml": "Вопросы об окнах в квартиру",
        "items": [
          {
            "questionHtml": "Можно заменить одно окно?",
            "answerHtml": "Да, можно рассчитать замену одного проёма. Сообщите его примерные размеры и пожелания к открыванию."
          },
          {
            "questionHtml": "Сколько времени занимает изготовление окон?",
            "answerHtml": "Срок зависит от комплектации и сезона. Точный срок укажем в договоре после замера."
          },
          {
            "questionHtml": "Можно ли заказать окна с монтажом?",
            "answerHtml": "Да. Замерщик рассчитает монтаж, демонтаж и отделку откосов отдельно, если они нужны."
          },
          {
            "questionHtml": "Как понять точную цену?",
            "answerHtml": "Пришлите размеры или фотографию проёма — подготовим предварительный расчёт, затем уточним его после замера."
          },
          {
            "questionHtml": "Можно ли заменить окна зимой?",
            "answerHtml": "Да. Проём остаётся открытым недолго, а монтаж выполняем поэтапно. Возможность работ зависит от температуры и используемых монтажных материалов."
          },
          {
            "questionHtml": "Делаете ли вы демонтаж старых окон?",
            "answerHtml": "Да. Демонтаж рассчитывается отдельно по необходимости. Перед началом работ уточняем объём, состояние проёма и способ выноса старых конструкций."
          },
          {
            "questionHtml": "Можно ли заказать вывоз строительного мусора?",
            "answerHtml": "Да. Добавим вывоз демонтированных рам и строительного мусора в смету отдельной строкой, если услуга потребуется."
          },
          {
            "questionHtml": "Входят ли подоконники, отливы и откосы в цену?",
            "answerHtml": "Эти элементы рассчитываются отдельно, поскольку размеры, материалы и объём отделки на каждом объекте отличаются."
          },
          {
            "questionHtml": "Какая гарантия действует на окна и монтаж?",
            "answerHtml": "Сроки гарантии фиксируем в договоре отдельно для конструкций, фурнитуры и монтажных работ. При обращении организуем диагностику и сервис."
          }
        ]
      }
    },
    "calculator": {
      "component": "calculator",
      "data": {
        "id": "calculator",
        "imageSrc": "/assets/window-calculator-visual.jpg",
        "imageWidth": "",
        "imageHeight": "",
        "imageAlt": "Окно, рулетка и калькулятор для расчёта стоимости остекления",
        "titleHtml": "Узнайте стоимость окон в квартиру",
        "leadHtml": "\n                Ответьте на несколько вопросов — получите расчёт стоимости окон\n                с учётом монтажа и доставки.\n              ",
        "sourceName": "Калькулятор: окна в квартиру",
        "installationPlace": "apartment",
        "places": []
      }
    },
    "related": {
      "component": "related",
      "data": {
        "titleHtml": "Также может быть интересно",
        "items": ['balkonnye-bloki','moskitnye-setki','montazh-okon','ceny'].map(slug=>({...relatedCards[slug]}))
      }
    }
  },
  "footer": {
    "descriptionHtml": "Пластиковые окна и балконные блоки для квартир с монтажом в Рыбинске и Ярославской области.",
    "ctaTitleHtml": "Нужны новые окна в квартиру?",
    "modalTitle": "окон в квартиру",
    "modalHeading": "Рассчитать окна в квартиру",
    "modalDescription": "Прикрепите фото или укажите размеры проёмов — подготовим расчёт окон и монтажа для вашей квартиры.",
    "modalImage": ""
  },
  "prefix": "apartment",
  "navigation": [
    {
      "section": "cases",
      "label": "Примеры окон в квартиру"
    },
    {
      "section": "reviews",
      "label": "Отзывы по окнам в квартиру"
    },
    {
      "section": "price",
      "label": "Цены на окна в квартиру"
    }
  ]
};
