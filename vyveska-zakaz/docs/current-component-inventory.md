# Единая система компонентов РПК «Ресурс»

Постоянная разметка остаётся в HTML. Общий визуальный слой — `/assets/legacy-theme.css`, последний stylesheet всех 118 страниц. Семейные CSS сохраняют сетки, расположение и специальные пропорции; цвет, типографика и оформление вынесены в общую тему.

| Компонент | Единый класс / оформление |
|---|---|
| Hero | legacy__hero: компактный H1, lead, релевантное фото |
| Intro | legacy__eyebrow / legacy__lead: обычная плотная типографика |
| Карточки услуг и материалов | legacy__cards / legacy__card: рамка, небольшая тень, радиус 5 px |
| Этапы | legacy__process: компактная сетка/список |
| Преимущества и факты | legacy__advantages / legacy__advantage: светлая полоса, фирменные акценты |
| Сравнение | существующая структурная сетка + единая таблица/карточка |
| Proof / gallery / portfolio | legacy__gallery / legacy__gallery-item: рамка, contain, 3/2/1 колонки |
| CTA | legacy__button: фирменный градиент, радиус 4 px, высота от 42 px |
| FAQ | legacy__faq / legacy__faq-item: компактная bordered list |
| Form | legacy__form / legacy__field / legacy__consent: панель, обычные поля |
| Related | legacy__links: компактные обычные ссылки |
| Article | legacy-page--article: центральный читаемый текст |
| Reviews | существующие review cards + единые рамки/типографика |
| Partners | исходные логотипы contain в плотной белой полосе |
| Tables | фиолетовый header, тонкие границы, компактные строки |
| Breadcrumb | legacy__breadcrumbs: обычная строка над H1 |

## Типы страниц

A — home: широкая карусель и фирменные полосы; B — commercial: компактный hero и прикладные блоки; C — hub: плотный каталог; D — portfolio: фотографии сразу под intro; E — article: читаемая колонка; F — trust: контакты, факты и реальные материалы; G — technical/noindex: тот же header/footer и простой контент.

## Фактические привязки

Полный исходный реестр классов и URL: `tmp/legacy-component-source.json`. Число статических привязок после синхронизации:

```json
{
  "legacy__hero": 98,
  "legacy__section": 853,
  "legacy__eyebrow": 90,
  "legacy__lead": 52,
  "legacy__cards": 87,
  "legacy__gallery": 58,
  "legacy__split": 70,
  "legacy__process": 34,
  "legacy__faq": 24,
  "legacy__faq-item": 700,
  "legacy__card": 525,
  "legacy__gallery-item": 438,
  "legacy__button": 827,
  "legacy__form": 423,
  "legacy__field": 103,
  "legacy__consent": 423,
  "legacy__links": 134,
  "legacy__breadcrumbs": 117,
  "legacy__advantages": 9,
  "legacy__advantage": 30
}
```

## Второй layout pass

Визуальные компоненты первого этапа сохранены. Композиции home, product-first commercial/hub и case gallery перестроены статически, с отдельными вариантами сетки 2/3/4 колонки. Подробности и сравнения: [legacy-layout-report.md](legacy-layout-report.md).
