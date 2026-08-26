# Ovaltun HTML Starter

Стартовый проект для ручной верстки по Figma на `Vite + HTML + SCSS + Vanilla JS`.

## Запуск

```bash
npm install
npm run dev
```

После запуска откройте `/src/pages/index.html`.

Сборка:

```bash
npm run build
```

Локальный просмотр production-сборки:

```bash
npm run preview
```

## Структура

- `src/pages/` - отдельные HTML-страницы проекта
- `src/partials/` - переиспользуемые HTML-фрагменты
- `src/scss/` - стили проекта
- `src/js/` - общая логика и JS-модули
- `src/images/` - графика и ассеты
- `src/fonts/` - локальные шрифты, если понадобятся

## Как добавить страницу

1. Создайте новый HTML-файл в `src/pages/`.
2. Подключите `main.js`:

```html
<script type="module" src="/src/js/main.js"></script>
```

3. Добавьте на страницу нужные partials через `data-include`.

Vite соберет все HTML-файлы из `src/pages/` автоматически.

## Как работать с partials

Partial-файлы лежат в `src/partials/` и на сборке копируются в `dist/partials/`.

Пример подключения:

```html
<div data-include="/partials/header.html"></div>
```

JS подставляет содержимое partial в этот контейнер.

## Как работать со SCSS

- Точка входа - `src/scss/main.scss`
- Общие переменные и миксины - в `abstracts/`
- Базовые стили - в `base/`
- Сетка и layout - в `layout/`
- Переиспользуемые блоки - в `components/`
- Стили страниц - в `pages/`

Проект сделан mobile-friendly, но подход здесь `desktop-first`, как в макете Figma.

## Для CMS

Этот каркас предназначен для дальнейшей ручной натяжки на CMS:

- можно переносить HTML-блоки по секциям;
- partials удобно заменять серверными шаблонами;
- SCSS и JS уже разнесены по зонам ответственности;
- структура классов построена по БЭМ.
