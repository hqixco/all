# Вывеска-заказ.рф

Статический MPA на собственных HTML-исходниках и Vite. Все существующие адреса сохранены.

- `npm run dev` — локальная разработка; URL страниц совпадают с production.
- `npm run build` — сборка в `dist`, без WP-импорта и изменения исходников.
- `npm run check` — существующие проверки production HTML, SEO, ссылок и ассетов.
- `npm run navigation:update` — явное обновление меню, хлебных крошек и тематических ссылок в исходниках после изменения реестра.

HTML редактируется в `index.html`, `pages/<url>/index.html`, `search/index.html`. Ассеты находятся в `public`. Реестр URL — `config/site-pages.json`, меню — `config/site-navigation.json`. Sitemap генерируется в `dist` из реестра; robots хранится в `config/robots.txt`.

Подробное дерево файлов, страницы первой и второй очереди, правила индексации и текущий статус: [docs/source-architecture.md](docs/source-architecture.md).

Архивный WP-импортёр в `scripts/archive` не участвует в разработке или сборке и может перезаписать собственные исходники при намеренном запуске восстановления.
