# Legacy reskin — итоговый отчёт

Всем 118 страницам добавлен общий визуальный слой старого РПК «Ресурс». Контентная архитектура и Vite сохранены. Это изменение оформления, без восстановления WordPress.

## Источник и измерения

Использованы локальные snapshots `tmp/live-pages`, архив миграции (только прочитан), сохранённые assets, Desktop/РПК Ресурс OLD и `docs/current-slides.md`. Значения извлечены из исходных CSS и computed styles офлайн-рендера. Подробности: [legacy-visual-reference.md](legacy-visual-reference.md).

| Token | Общая тема |
|---|---|
| Container | 1200 px, padding 20 px, полезная ширина 1160 px |
| Header | 175 px desktop / 90 px mobile; original head-ground |
| Logo | исходный logo-head.svg, desktop 264 px; mobile 120–135 px |
| Palette | #41309b / #2d2572 / #2d2288, белый и #f6f6f6 |
| Body | Roboto 16 px, line-height 1.42857, #333 |
| Headings | 32 / 24 / 18 px; mobile H1 24 px |
| Cards | рамка, radius 5 px, умеренная тень, компактный padding |
| CTA | фирменный градиент, radius 4 px, min-height 42 px |
| Galleries | 3 / 2 / 1 колонки; фото contain, без обрезки |
| Slider | широкая полоса 450 px, безопасные текущие фото |

Старый pill-radius кнопок 20 px адаптирован до 4 px согласно заданию. Телефоны desktop 16 px вместо старых 14 px. Меню адаптировано под принятые современные разделы, тексты пунктов не менялись.

## Сравнение

[Old → new contact sheet](../tmp/legacy-comparison.png). Слева оригинальный offline snapshot, справа новый Vite.

[17 desktop templates](../tmp/legacy-samples-1440.png), [17 mobile templates](../tmp/legacy-samples-390.png). Исходные reference shots: `tmp/legacy-old-{home,vyveski,vyveski-portfolio}-1440.png`, `tmp/legacy-old-{home,vyveski}-390.png`. Новые: `tmp/final-smoke-{config-index}-{width}.png`. Старый portfolio snapshot без WP-плагина показывает исходный flow; его сетка не объявлена измеренным JS-эталоном.

## Компоненты и реализация

[Реестр компонентов](current-component-inventory.md). Цвет, типографика, заголовки, CTA, карточки, FAQ, формы, таблицы, галереи, header/footer — в `public/assets/legacy-theme.css`. Семейные CSS оставляют структуру и специальные раскладки. Не добавлены !important, inline styling, WP bundles, jQuery или внешние theme CSS. CSS использует классические max-width media; новый inset заменён совместимыми позиционными свойствами. Safari 13 проверен по синтаксису и fallbacks; запуск на реальном Safari не выполнялся.

Header использует исходный logo-head.svg и фон; footer — logo-foot.svg и фирменную нижнюю полосу. Исправленная логика mobile menu не менялась: close виден и кликабелен на 390/320, Escape закрывает, фокус возвращается, scroll lock снимается. Глобальные формы сохранены, визуально унифицированы. FAQ остаётся компактным списком, таблицы получили фирменный header. Фото галерей не обрезаются; исходные full href сохранены. Главная использует текущие безопасные слайды, исходные фото и фон формы. Отзывы и логотипы партнёров не заменены.

## Изменённые файлы

- Все 118 HTML: только статические component classes и один stylesheet последним после family CSS. Полный перечень и SHA256 до правок — `tmp/legacy-reskin-baseline.json`; сопоставление с config — скрипт audit.
- `public/assets/legacy-theme.css`: единый skin.
- `scripts/sync-navigation.mjs`: отдельный режим `--legacy-skin`, использующий `scripts/legacy-skin-sync.mjs`; стандартная синхронизация не запускалась.
- `scripts/legacy-visual-audit.mjs`: проверка темы, сохранности контента и viewport результатов.
- 44 локальных CSS: удалены конфликтующие визуальные свойства, structural rules сохранены. Полный список:

- `public/assets/home.css` (123 визуальных деклараций вынесено)
- `public/assets/plates-family.css` (39 визуальных деклараций вынесено)
- `public/assets/portfolio-core.css` (47 визуальных деклараций вынесено)
- `public/assets/final-tail.css` (41 визуальных деклараций вынесено)
- `public/assets/brandmauer-panels.css` (52 визуальных деклараций вынесено)
- `public/assets/vehicle-branding.css` (41 визуальных деклараций вынесено)
- `public/assets/prices.css` (96 визуальных деклараций вынесено)
- `public/assets/design.css` (41 визуальных деклараций вынесено)
- `public/assets/facade-signs.css` (45 визуальных деклараций вынесено)
- `public/assets/milling-family.css` (39 визуальных деклараций вынесено)
- `public/assets/friezes-brackets.css` (46 визуальных деклараций вынесено)
- `public/assets/stands-family.css` (52 визуальных деклараций вынесено)
- `public/assets/printing-core.css` (39 визуальных деклараций вынесено)
- `public/assets/interior-signs.css` (46 визуальных деклараций вынесено)
- `public/assets/roof-installations-family.css` (64 визуальных деклараций вынесено)
- `public/assets/installation-approval.css` (41 визуальных деклараций вынесено)
- `public/assets/outdoor-hub.css` (131 визуальных деклараций вынесено)
- `public/assets/neon-family.css` (63 визуальных деклараций вынесено)
- `public/assets/company.css` (109 визуальных деклараций вынесено)
- `public/assets/illuminated-children.css` (125 визуальных деклараций вынесено)
- `public/assets/halo-letters.css` (123 визуальных деклараций вынесено)
- `public/assets/volumetric-letters.css` (113 визуальных деклараций вынесено)
- `public/assets/non-illuminated-letters.css` (113 визуальных деклараций вынесено)
- `public/assets/illuminated-letters.css` (113 визуальных деклараций вынесено)
- `public/assets/reviews.css` (0 визуальных деклараций вынесено)
- `public/assets/printing-materials.css` (41 визуальных деклараций вынесено)
- `public/assets/plotter-cutting.css` (41 визуальных деклараций вынесено)
- `public/assets/advertising-structures.css` (46 визуальных деклараций вынесено)
- `public/assets/services.css` (94 визуальных деклараций вынесено)
- `public/assets/steles-pylons-family.css` (65 визуальных деклараций вынесено)
- `public/assets/reception-desk.css` (39 визуальных деклараций вынесено)
- `public/assets/lightbox-portfolio.css` (45 визуальных деклараций вынесено)
- `public/assets/lightbox.css` (106 визуальных деклараций вынесено)
- `public/assets/light-portals-family.css` (64 визуальных деклараций вынесено)
- `public/assets/entrance-groups-family.css` (64 визуальных деклараций вынесено)
- `public/assets/sequin-signs-family.css` (64 визуальных деклараций вынесено)
- `public/assets/signs-hub.css` (127 визуальных деклараций вынесено)
- `public/assets/agency-b2b.css` (104 визуальных деклараций вынесено)
- `public/assets/light-signs.css` (113 визуальных деклараций вынесено)
- `public/assets/repair.css` (129 визуальных деклараций вынесено)
- `public/assets/facade.css` (149 визуальных деклараций вынесено)
- `public/assets/wayfinding.css` (129 визуальных деклараций вынесено)
- `public/assets/shop-signs.css` (129 визуальных деклараций вынесено)
- `public/assets/store-network.css` (142 визуальных деклараций вынесено)

Исходные CSS перед очисткой сохранены в `tmp/legacy-css-baseline/`. site.js, site.css, mail.php, config/site-pages.json, config/site-navigation.json, config/robots.txt и vite.config.js побайтово unchanged.

## Regression QA

| Проверка | Результат |
|---|---|
| HTML | 118 |
| Indexable / noindex / sitemap | 104 / 14 / 104 |
| Основной текст, metadata, Schema, ссылки, атрибуты img, поля форм | 118/118 unchanged |
| Исходные image/video ассеты | 1455/1455 SHA256 unchanged; сохранённые portfolio frames не затронуты |
| Canonical / broken links / orphan / duplicate metadata / H1 / Schema | 0 ошибок |
| Viewport 1440 / 390 / 320 | 354/354 PASS |
| Horizontal overflow / console / page errors | 0 / 0 / 0 |
| Menu 390 / 320 / desktop | PASS |
| 5 form profiles, JS + native POST | 10/10 PASS локально |
| PHP GET / invalid POST | 405 / 422 |
| No-JS content, gallery/full href | 16 образцов PASS |
| FAQ / carousel / partners / modal | локальный интерактивный PASS |
| npm run build | PASS |
| npm run check | PASS |
| node scripts/final-site-audit.mjs | PASS |
| node scripts/legacy-visual-audit.mjs | PASS |

Подробные результаты: `tmp/final-site-smoke-results.json`, `tmp/final-site-form-results.json`, `tmp/final-site-nojs-results.json`, `tmp/legacy-interactive-results.json`, `tmp/legacy-visual-audit-results.json`. В native тестах hidden modal containers раскрываются тестовым harness, чтобы проверить обычный POST; постоянная разметка присутствует в HTML. Все формы проверены статически (423 mail, 1 search); внешней массовой отправки не было. Production inbox delivery — NOT CONFIRMED. Шесть новых landing остаются noindex.

Ручной visual QA по 17 заданным URLs выполнен на desktop/mobile через screenshots. Автоматические 354 проверки относятся к load/status/H1/header/footer/Breadcrumb/overflow/errors; отдельные функциональные тесты покрывают общие интерактивные компоненты, а не отправку каждой формы на каждой странице.

## Что специально НЕ возвращено со старого сайта

Старые цены и акции, Orajiet promo, 360/720 dpi как текущая спецификация, от 3 дней, бесплатные услуги, конфликтующие SPAR counts, гарантии согласования, юридическая инструкция и неподтверждённые технические/рекламные обещания. Ассеты с встроенными 200/950 руб. отмечены STALE в visual-reference и не используются как текущие слайды. Старые плагины и WordPress не возвращены.
