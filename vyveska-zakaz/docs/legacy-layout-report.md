# Второй этап legacy reskin — композиция

Перестроен статический layout 85 страниц: главная, 58 commercial, 3 hub и 23 portfolio/case. Ещё 33 HTML unchanged по SHA256 относительно начала второго этапа. Цветовая система и весь исходный CSS первого reskin сохранены как неизменный префикс legacy-theme.css; новый слой отвечает за композицию.

## OLD / NEW

[Финальный contact sheet](../tmp/legacy-layout-comparison.png): OLD слева, NEW справа — home 1440, vyveski 1440, vyveski-portfolio 1440, home 390, vyveski 390. Высота сравниваемого viewport нормализована до 900 px.

[Portfolio 1440 / 390](../tmp/legacy-layout-case-comparison.png).

[BEFORE SECOND PASS](../tmp/legacy-before-second-pass.png) сохранён отдельно; исходный contact sheet первого этапа не перезаписан.

Дополнительные NEW screenshots:

| Страница | Desktop | Mobile |
|---|---|---|
| Services | [1440](../tmp/legacy-layout-services-1440.png) | [390](../tmp/legacy-layout-services-390.png) |
| Объёмные буквы | [1440](../tmp/legacy-layout-obemnye-bukvy-1440.png) | [390](../tmp/legacy-layout-obemnye-bukvy-390.png) |
| Печать | [1440](../tmp/legacy-layout-pechat-1440.png) | [390](../tmp/legacy-layout-pechat-390.png) |
| Portfolio hub | [1440](../tmp/legacy-layout-portfolio-1440.png) | [390](../tmp/legacy-layout-portfolio-390.png) |

Для всех семи visual samples сохранены также `tmp/legacy-layout-{slug}-{width}-full.png`. Reference — те же локальные production snapshots и оригинальный CSS из Desktop/РПК Ресурс OLD; дополнительно отрендерен old portfolio на 390. WP bundles не подключались. Старый portfolio snapshot без галерейного плагина используется как reference крупного первого кадра, а не как спецификация JS-сетки. Порядок новой принятой галереи не возвращался к старому snapshot.

## Главная

Шапка → широкий слайдер непосредственно под ней → compact utility strip → графические направления → сохранённые H1 и корпоративный intro → следующие принятые блоки. Белой document-секции над слайдером больше нет.

Utility strip использует существующий заголовок карусели и город; не добавлены фиктивный поиск или новая форма. В графической зоне шесть существующих направлений: без абзацев внутри, с крупными круглыми изображениями/старой графикой на фирменном фоне. Их пояснения перенесены к корпоративному блоку. Desktop — одна горизонтальная зона; mobile — элементы по одному. Высота мобильного баннера 450 px соответствует измеренному OLD (top 90 px).

## Вывески как эталон

Breadcrumb → неизменный H1 → четыре реальные visual cards: фасадные вывески, объёмные буквы, световые короба, неон → графическая полоса → прежний intro и пояснения → остальные виды и блоки. Использованы существующие figure/img/caption и ссылки. На mobile одна карточка в строке. Большая фотография больше не стоит справа от текстового hero.

Новых текстов преимуществ не добавлено: на этой странице принятого блока с таким заголовком не было. Старую графическую подачу получил существующий блок «Как выбрать тип вывески», сохранив свой текст. Это позволяет повторить крупную визуальную полосу OLD без возвращения рекламных обещаний.

## Commercial и hubs

Существующие варианты, материалы, решения или реальные работы перенесены перед длинным пояснением. Сетки адаптируются к реальному содержимому: 2, 3 или 4 колонки, mobile — одна. Каталоги services / naruzhnaya-reklama / pechat / portfolio начинают показывать категории и фотографии сразу после H1. Основной текст, дополнительные виды, процессы, стоимость, FAQ и заявки сохранены.

Фотографии на CSS-карточках взяты из соответствующего существующего child source; реестр — `tmp/legacy-layout-changes.json`. Это иллюстрации категорий, без новых утверждений о материале или технологии. Декоративные картинки преимуществ исключены из выбора рабочих фото. Для печати отдельно использованы существующие /banner/ и /karty/ изображения как примеры печатных материалов; они не доказывают dpi или режим печати. Для фрезеровки без подтверждённых фото использована нейтральная графическая подача листов, без выдуманного станка.

Пять старых material-page шаблонов букв, уже имевших native legacy композицию, не переставлялись. Статьи, trust и технические страницы также не получили унифицированный product template.

## Portfolio

Breadcrumb → компактный H1 и intro → фотографии; CTA перенесены под галерею. Малые галереи используют крупные кадры; большие — плотную сетку. /vyveski-portfolio/ выделяет первый кадр на ширину галереи, остальные сохраняет в сетке. Первый img сохраняет исходный preview src и атрибуты; static picture выбирает уже существующий full href на desktop и исходный preview на mobile. Файл фотографии не изменён, обрезки нет.

Все 23 case inventories проверены по порядку figure, preview img, full href и caption. Галереи остаются обычным серверным HTML и ссылками.

## Что изменено

- 85 целевых HTML: порядок, grouping, wrappers и layout classes; список ниже.
- public/assets/legacy-theme.css: layout слой после сохранённого первого skin, без новых root tokens.
- scripts/legacy-layout-sync.mjs: одноразовый инструмент статической перестановки из `tmp/legacy-layout-before`; требует явного `--from-layout-baseline`, в обычном запуске HTML не меняет. Не является runtime renderer или частью build.
- scripts/legacy-visual-audit.mjs: fingerprint допускает перемещение, но требует точного набора текстовых узлов с учётом повторов, H1 wording, metadata, JSON-LD, форм, href и img inventories; отдельно проверяет порядок case кадров и неизменность header/footer.
- docs/current-component-inventory.md: ссылка на этот layout этап.

site.js, site.css, mail.php, все config и vite.config.js unchanged. Фото, preview/full пути, сами изображения и видео unchanged. Runtime CSS/JS WordPress, новые URL, redirects и новые коммерческие утверждения не добавлены.

## QA

Вначале выполнен visual review OLD/NEW и дополнительных шаблонов; затем технический аудит. По результатам сравнений уточнены высота mobile hero и крупный первый case кадр. После последних изменений повторён полный прогон.

| Проверка | Результат |
|---|---|
| HTML | 118 |
| Indexable / noindex / sitemap | 104 / 14 / 104 |
| H1 wording, основной текст с учётом повторов | 118/118 unchanged |
| Metadata, Schema, forms, href, img attributes | 118/118 unchanged |
| Case preview/full/captions/order | 23/23 unchanged |
| Исходные image/video assets SHA256 | 1455/1455 unchanged |
| Header / footer HTML, первый CSS skin | unchanged |
| Viewports 1440 / 390 / 320 | 354/354 PASS |
| Overflow / console / page errors | 0 / 0 / 0 |
| Canonical / broken links / orphan / duplicate metadata / H1 / Schema errors | 0 |
| Mobile close, Escape, focus return, scroll lock | PASS 390 / 320 |
| Form profiles: JS + native local POST | 10/10 PASS, 5 profiles |
| No-JS samples / gallery full links | PASS 16 samples |
| FAQ, carousel, partners, modal | local PASS |
| npm run build | PASS |
| npm run check | PASS |
| node scripts/final-site-audit.mjs | PASS |
| node scripts/legacy-visual-audit.mjs | PASS |

Safari 13 — классические max-width media, без !important, без min-width media и overflow masking; новый layout использует совместимые grid/flex/picture. На реальном Safari не запускалось, это CSS/syntax sanity плюс Chrome runtime.

Подробные результаты: `tmp/final-site-smoke-results.json`, `tmp/legacy-visual-audit-results.json`, `tmp/final-site-results.json`, `tmp/final-site-form-results.json`, `tmp/final-site-nojs-results.json`, `tmp/legacy-interactive-results.json`. 354 проверки покрывают load/HTTP/overflow/H1/header/footer/Breadcrumb/errors; функциональные компоненты проверены отдельно. Сотни писем не отправлялись. Production mailbox delivery остаётся NOT CONFIRMED; шесть новых landing остаются noindex.

## SHA256 regression

Baseline: `tmp/legacy-layout-baseline.json`, исходные HTML: `tmp/legacy-layout-before/`, исходный skin: `tmp/legacy-layout-theme-before.css`. Итог: `tmp/legacy-layout-sha256.json` — 85 HTML changed и 33 unchanged. Изменение последовательности main text ожидаемо; сохранность копирайта проверена по точному multiset текстовых узлов, а не по совпадению строки DOM в прежнем порядке. Metadata и JSON-LD сравниваются дословно.

## Изменённые URL

- `/`
- `/adresnye-tablichki/`
- `/akrilajt/`
- `/apteki/`
- `/banner/`
- `/brandmauery-reklamnye-panno-portfolio/`
- `/brandmauery-reklamnye-panno/`
- `/brendirovanie-avtomobilya/`
- `/brendirovanie-transporta/`
- `/dizajn/`
- `/fasadnye-vyveski/`
- `/frezerovka-kompozita/`
- `/frezerovka-monolitnogo-polikarbonata/`
- `/frezerovka-na-plastike/`
- `/frezerovka-orgstekla/`
- `/frezerovka/`
- `/frizy/`
- `/informacionnye-stendy-portfolio/`
- `/informacionnye-stendy/`
- `/interernaya-pechat/`
- `/interernye-vyveski/`
- `/karty/`
- `/kryshnye-ustanovki-portfolio/`
- `/kryshnye-ustanovki/`
- `/malinka/`
- `/montazh-naruzhnoj-reklamy/`
- `/naruzhnaya-reklama/`
- `/neonovye-vyveski-portfolio/`
- `/neonovye-vyveski/`
- `/nestandartnyj-stend-dlya-vystavki-ili-prezentacii-vashego-predpriyatiya/`
- `/obemnye-bukvy-portfolio/`
- `/obemnye-bukvy-s-kombinirovannoj-podsvetkoj/`
- `/obemnye-bukvy-s-kontrazhurnoj-podsvetkoj-portfolio/`
- `/obemnye-bukvy-s-kontrazhurnoj-podsvetkoj/`
- `/obemnye-bukvy-s-lampochkami/`
- `/obemnye-bukvy-s-licevoj-podsvetkoj/`
- `/obemnye-bukvy-s-torcevoj-podsvetkoj/`
- `/obemnye-bukvy-s-vneshnej-podsvetkoj/`
- `/obemnye-bukvy-s-vnutrennej-podsvetkoj/`
- `/obemnye-bukvy/`
- `/obemnye-nesvetovye-bukvy/`
- `/obemnye-svetovye-bukvy/`
- `/ofisnye-tablichki/`
- `/oformlenie-detskix-sadov/`
- `/panel-kronshtejny/`
- `/pechat-na-bannere/`
- `/pechat-na-bumage/`
- `/pechat-na-fotooboyax/`
- `/pechat-na-perforirovannoj-plenke/`
- `/pechat-na-plenke/`
- `/pechat-na-samokleyashhejsya-plenke/`
- `/pechat-na-translyucentnoj-plenke/`
- `/pechat/`
- `/plotternaya-rezka-portfolio/`
- `/plotternaya-rezka/`
- `/portfolio/`
- `/reklamnye-konstrukcii/`
- `/services/`
- `/shirokoformatnaya-pechat/`
- `/soglasovanie-naruzhnoj-reklamy/`
- `/spar/`
- `/stely-i-pilony-portfolio/`
- `/stely-i-pilony/`
- `/stojki-resepshen/`
- `/svetovye-koroba-inkrustaciya/`
- `/svetovye-koroba-portfolio/`
- `/svetovye-koroba/`
- `/svetovye-portaly-portfolio/`
- `/svetovye-portaly/`
- `/tablichki/`
- `/ulichnye-stendy-portfolio/`
- `/ulichnye-stendy/`
- `/vxodnye-gruppy-portfolio/`
- `/vxodnye-gruppy/`
- `/vystavochnye-stendy/`
- `/vyveski-portfolio/`
- `/vyveski-s-pajetkami-portfolio/`
- `/vyveski-s-pajetkami/`
- `/vyveski/`
- `/svetovye-vyveski/`
- `/remont-vyvesok/`
- `/oformlenie-fasadov/`
- `/navigaciya-i-ukazateli/`
- `/vyveski-dlya-magazina/`
- `/oformlenie-seti-magazinov/`
