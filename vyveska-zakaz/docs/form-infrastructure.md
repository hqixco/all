# Инфраструктура форм

## Найденные обработчики

- Текущий проект: `public/mail.php`, автоматически копируется Vite без преобразований в `dist/mail.php`. Получатель в коде: `resurs_mi@mail.ru`. Используется PHP `mail()`, фиксированные тема и From, проверенный пользовательский email допускается только в Reply-To.
- Архив: `C:/Users/User/Desktop/РПК Ресурс OLD/wp-content/plugins/contact-form-7/includes/mail.php`. Это внутренняя реализация Contact Form 7, вызывающая `wp_mail()`, а не самостоятельный HTTP endpoint. POST обслуживает `includes/rest-api.php`: `/wp-json/contact-form-7/v1/contact-forms/{id}/feedback`. Архивные формы: 9 (звонок), 52 (заказ), 71 (отзыв), поля `your-name`, `your-phone`, `your-company`, `your-email`, `message`, `acceptance-962`, служебные `_wpcf7*`. Ответ CF7 содержит `status`, `message`, `invalid_fields`, идентификатор формы; состояния включают `mail_sent`, `mail_failed`, `validation_failed`.
- Получатель CF7 хранится в свойствах формы в базе WordPress (`get_post_meta` в `includes/contact-form.php`). Дампа БД в архиве нет, поэтому фактического получателя архивных форм подтвердить нельзя. Адрес `resurs_mi@mail.ru` присутствует в архивной странице контактов и текущем самостоятельном обработчике; он сохранён.
- `wp-content/plugins/better-wp-security/core/modules/site-scanner/mail.php` относится к уведомлениям сканера безопасности. Корневой `wp-mail.php` обрабатывает входящую почту WordPress. Они не являются обработчиками заявок.

## Единый транспорт

405 форм заявок на 115 страницах используют `public/assets/site.js`, POST `/mail.php`, `FormData`, Accept application/json. Старые WP endpoints не используются для отправки. Три формы поиска остаются GET `/search/` с полем `s`.

| Вариант | Количество | Поля |
|---|---:|---|
| Заказ в контенте | 59 | website, your-name*, your-company, your-phone*, your-email, message, acceptance-962* |
| Звонок #formOrderCall | 115 | website, your-name*, your-phone*, acceptance-962* |
| Отзыв #formReviews | 115 | website, your-name*, message*, acceptance-962* |
| Заказ #formModalOrder | 115 | website, your-name*, your-company, your-phone*, your-email, message, acceptance-962* |
| Расчёт световой вывески | 1 | website, your-company (hidden), your-name*, your-phone*, message, acceptance-962* |

Звёздочка означает обязательное поле. У отзыва нет телефона; текст отзыва обязателен в HTML и PHP, пустой текст и пробелы отклоняются. Все формы дополнительно имеют одно скрытое поле form-type. JS дополнительно передаёт `form-type` (order/callback/review/calculation) и `page-url`.

Полный список всех форм с URL, номером, полями, исходными action/method и обработчиком: [form-inventory.json](form-inventory.json). Список страниц и экземпляров: [form-inventory.md](form-inventory.md).

На /otzyvy/ добавлена видимая кнопка «Оставить отзыв», открывающая существующую #formReviews. Новая форма не создавалась.

Модальное окно проверено визуально на desktop и mobile (390 px); форма помещается по ширине. На самой странице /otzyvy/ обнаружен существующий горизонтальный выход некоторых карточек отзывов с изображениями за ширину mobile. Эти карточки не изменялись в инфраструктурном патче; проблема не связана с новой кнопкой или формой.

Для 404 форм добавлены action="/mail.php" и method="post"; у формы расчёта они уже были. Во всех 405 формах один hidden form-type; общий JS использует FormData.set(), без дублирования. Нативный POST без JS работает и возвращает JSON с результатом. Открытие модальных окон требует JS; inline-формы доступны без JS. При отсутствии page-url сервер использует только ограниченный нормализованный путь из недоверенного HTTP_REFERER как дополнительный контекст, не для заголовков или маршрутизации.

## Минимальные изменения существующей реализации

Сохранены PHP mail(), получатель, фиксированный отправитель и тема. Добавлены обязательный телефон для заявок/звонка/расчёта, точное согласие `1`, проверка email/телефона/типа формы, ограничения длины и объёма запроса, запрет массивов и загрузки файлов, honeypot. Непроверенный ввод не используется в заголовках. JS больше не переключает отправку на mailto при ошибке, сохраняет введённые данные и показывает ошибку; сбрасывает форму только после явного success=true.

Ответ всегда JSON `{success, message, code}`: 200 mail_accepted; 405 method_not_allowed (Allow: POST); 413 request_too_large; 415 unsupported_media_type; 422 ошибки полей; 503 mail_failed. GET/HEAD/PUT не вызывают mail(). Успех означает принятие письма почтовой системой, а не доказательство доставки в ящик.

## Deployment / staging

Готовый артефакт — содержимое `dist/`, включая `dist/mail.php`. Разместить его в document root PHP-хостинга; `/mail.php` должен исполняться PHP, а не отдаваться текстом или заменяться HTML. Сохранить MPA маршруты к соответствующим каталогам/index.html. Не оставлять старое правило WordPress, перехватывающее существующий mail.php. Не применять SPA fallback ко всем запросам. Для Apache/Beget достаточно рабочего PHP-обработчика хостинга и существующих каталогов страниц; отдельный Vite-сервер на production не нужен.

Перед выкладкой: `npm run build`, `npm run check`, `node scripts/forms-audit.mjs --report`. Последняя команда проверяет совпадение PHP в public/dist, общий транспорт и сохранение noindex световой страницы.

Локальная интеграционная проверка выполняется PHP 8.4.26, HTTP-сервером PHP и SMTP-перехватчиком только на localhost (не Vite Preview). Проверяется настоящий mail(), JSON, серверная валидация, ошибки SMTP и браузерная отправка. Внешние письма не отправляются. Локальная проверка не подтверждает настройки почты production-хостинга.

Результат финального патча: PHP integration tests и браузерная отправка пяти вариантов прошли; дополнительно проверен нативный POST с отключённым JavaScript на главной и /svetovye-vyveski/. Пустой/пробельный отзыв возвращает 422. Перехвачено 11 писем локально, внешних писем 0. Результаты: tmp/php-form-results.json. Production build/check прошли. Title, description, H1, canonical и robots всех 118 страниц совпали с исходным снимком.

После выкладки обязательно проверить: GET /mail.php → 405 JSON; невалидный POST → 422; одну тестовую заявку → 200 и фактическое поступление в resurs_mi@mail.ru с полями/URL; ответ на письмо через Reply-To; отсутствие PHP/SMTP ошибок в логах. Настроить исходящую почту PHP и разрешённый From noreply@домен сайта, DNS-проверки отправителя по требованиям хостинга. Если письмо не приходит, проверять SMTP/MTA, спам и логи, а не принимать HTTP 200 за доказательство доставки.

HTML изменён только для атрибутов/полей форм, обязательности отзывов и кнопки открытия отзыва; SEO-контент сохранён. /svetovye-vyveski/ остаётся indexable:false, noindex, follow и вне sitemap. Sitemap: 107 URL.
