<?php
/**
 * Editable 404 page support.
 *
 * @package Stroybrigada
 */

declare(strict_types=1);

if (! defined('ABSPATH')) {
	exit;
}

function stroybrigada_404_source_id(): string {
	return 'stroybrigada_404';
}

function stroybrigada_404_default_sections(): array {
	return [
		[
			'key'     => 'not-found-hero',
			'label'   => __('404 ошибка', 'stroybrigada'),
			'visible' => true,
			'html'    => '<section class="site-section site-section--not-found stroybrigada-404">
	<div class="container">
		<div class="stroybrigada-404__inner">
			<div class="stroybrigada-404__content">
				<div class="stroybrigada-404__code cifre404">404</div>
				<h1 class="stroybrigada-404__title title-lg section-title section-title--lg fw700 mb2">Страница не найдена</h1>
				<p class="stroybrigada-404__text title fw400 mlg">Возможно, страница была удалена, адрес введен с ошибкой или раздел временно недоступен.</p>
				<div class="stroybrigada-404__actions">
					<a class="btn btn-st0 uppercase" href="/">Вернуться на главную</a>
					<a class="stroybrigada-404__link" href="/#quiz-section">Рассчитать стоимость</a>
				</div>
			</div>
			<div class="stroybrigada-404__panel">
				<div class="stroybrigada-404__panel-title">Поможем найти нужную услугу</div>
				<ul class="stroybrigada-404__list">
					<li><a href="/montazh-krovli-i-stropil/">Кровельные работы</a></li>
					<li><a href="/ustroystvo-fundamentov-otmostok-parkovok/">Строительство фундамента</a></li>
					<li><a href="/otmostki/">Укладка брусчатки и отмостки</a></li>
					<li><a href="/#contacts">Контакты</a></li>
				</ul>
			</div>
		</div>
	</div>
</section>',
		],
	];
}

function stroybrigada_get_404_page_id(): int {
	$page_id = (int) get_option('stroybrigada_404_page_id', 0);
	if ($page_id > 0 && 'page' === get_post_type($page_id)) {
		return $page_id;
	}

	$posts = get_posts(
		[
			'post_type'      => 'page',
			'post_status'    => ['publish', 'draft', 'private'],
			'posts_per_page' => 1,
			'fields'         => 'ids',
			'meta_key'       => '_stroybrigada_source_id',
			'meta_value'     => stroybrigada_404_source_id(),
			'no_found_rows'  => true,
		]
	);

	if ($posts) {
		$page_id = (int) $posts[0];
		update_option('stroybrigada_404_page_id', $page_id, false);
		return $page_id;
	}

	$page = get_page_by_path('404-error', OBJECT, 'page');
	if ($page instanceof WP_Post) {
		update_post_meta((int) $page->ID, '_stroybrigada_source_id', stroybrigada_404_source_id());
		update_option('stroybrigada_404_page_id', (int) $page->ID, false);
		return (int) $page->ID;
	}

	return 0;
}

function stroybrigada_ensure_404_page(): void {
	if (wp_doing_ajax() || wp_doing_cron()) {
		return;
	}

	$page_id = stroybrigada_get_404_page_id();
	if (! $page_id) {
		$result = wp_insert_post(
			wp_slash(
				[
					'post_type'    => 'page',
					'post_status'  => 'private',
					'post_title'   => __('404 ошибка', 'stroybrigada'),
					'post_name'    => '404-error',
					'post_content' => '',
					'menu_order'   => 999,
				]
			),
			true
		);

		if (is_wp_error($result) || ! $result) {
			return;
		}

		$page_id = (int) $result;
		update_post_meta($page_id, '_stroybrigada_source_id', stroybrigada_404_source_id());
		update_option('stroybrigada_404_page_id', $page_id, false);
	}

	// This page stores editable content for the real 404 template and must not
	// be exposed as a standalone public page or included in XML sitemaps.
	if ('private' !== get_post_status($page_id)) {
		wp_update_post(
			[
				'ID'          => $page_id,
				'post_status' => 'private',
			]
		);
	}

	if (! stroybrigada_page_sections_were_edited($page_id) && ! metadata_exists('post', $page_id, stroybrigada_sections_meta_key($page_id))) {
		stroybrigada_update_page_sections($page_id, stroybrigada_404_default_sections());
	}
}
add_action('init', 'stroybrigada_ensure_404_page', 30);

function stroybrigada_remove_default_wordpress_post(): void {
	$post = get_page_by_path('привет-мир', OBJECT, 'post');
	if (! $post instanceof WP_Post || 'publish' !== $post->post_status || 'Привет, мир!' !== $post->post_title) {
		return;
	}

	wp_trash_post((int) $post->ID);
}
add_action('init', 'stroybrigada_remove_default_wordpress_post', 29);

function stroybrigada_public_sitemap_post_types(array $post_types): array {
	unset($post_types['post']);
	return $post_types;
}
add_filter('wp_sitemaps_post_types', 'stroybrigada_public_sitemap_post_types');

function stroybrigada_public_sitemap_provider($provider, string $name) {
	if (in_array($name, ['taxonomies', 'users'], true)) {
		return false;
	}

	return $provider;
}
add_filter('wp_sitemaps_add_provider', 'stroybrigada_public_sitemap_provider', 10, 2);

function stroybrigada_archive_robots(array $robots): array {
	if (is_author() || is_category() || is_tag() || is_date()) {
		$robots['noindex'] = true;
		$robots['follow']  = true;
	}

	return $robots;
}
add_filter('wp_robots', 'stroybrigada_archive_robots');

function stroybrigada_technical_page_defaults(): array {
	return [
		[
			'source_id' => 'stroybrigada_privacy_policy',
			'slug'      => 'politika-konfidentsialnosti',
			'title'     => __('Политика конфиденциальности', 'stroybrigada'),
			'html'      => '<section class="site-section site-section--content stroybrigada-technical-content"><div class="bg_grey pt_lg pb_lg2"><div class="container"><div class="content-block-text"><h1>Политика в отношении обработки персональных данных</h1><p><strong>Редакция от 26 июня 2026 года</strong></p><p>Настоящая Политика в отношении обработки персональных данных действует в отношении всей информации, которую сайт <strong>https://stroybrigada-365.ru/</strong> может получить о пользователе во время использования сайта, заполнения форм обратной связи, заказа звонка, запроса расчёта стоимости, а также при обращении по телефону, электронной почте или через мессенджеры.</p><h2>1. Общие положения</h2><p>1.1. Оператором персональных данных является:</p><p><strong>Иванов Михаил Ристович</strong><br>Адрес: <strong>Силикатная ул., 35, Мытищи</strong><br>ИНН: <strong>371122307989</strong><br>Электронная почта: <strong>stroybrigada365@mail.ru</strong><br>Телефон: <strong>+7 (977) 779-87-77</strong></p><p>Далее по тексту — «Оператор».</p><p>1.2. Настоящая Политика разработана в соответствии с Конституцией Российской Федерации, Федеральным законом от 27.07.2006 № 152-ФЗ «О персональных данных» и иными нормативными правовыми актами Российской Федерации в области обработки и защиты персональных данных.</p><p>1.3. Политика применяется ко всем персональным данным, которые Оператор получает от посетителей сайта https://stroybrigada-365.ru/.</p><p>1.4. Использование сайта без заполнения форм обратной связи возможно без предоставления пользователем имени, номера телефона или адреса электронной почты. При этом сайт может автоматически получать технические сведения, необходимые для его работы и анализа посещаемости.</p><p>1.5. Оператор не осуществляет обработку специальных категорий персональных данных, касающихся национальной принадлежности, политических взглядов, религиозных или философских убеждений, состояния здоровья и интимной жизни.</p><p>1.6. Оператор не осуществляет обработку биометрических персональных данных с целью установления личности пользователя.</p><h2>2. Основные понятия</h2><p>2.1. Персональные данные — любая информация, относящаяся прямо или косвенно к определённому либо определяемому физическому лицу.</p><p>2.2. Обработка персональных данных — любое действие или совокупность действий, совершаемых с персональными данными с использованием средств автоматизации или без их использования.</p><p>2.3. Пользователь — физическое лицо, посещающее сайт https://stroybrigada-365.ru/ и использующее его функциональные возможности.</p><p>2.4. Сайт — совокупность информации, текстов, изображений, программного кода и иных материалов, доступных по адресу https://stroybrigada-365.ru/.</p><p>2.5. Файлы cookie — небольшие фрагменты данных, сохраняемые браузером пользователя и используемые для работы сайта, анализа посещаемости и сохранения пользовательских настроек.</p><h2>3. Персональные данные, которые может обрабатывать Оператор</h2><p>3.1. Пользователь может добровольно предоставить следующие данные:</p><ul><li>имя;</li><li>номер телефона;</li><li>адрес электронной почты;</li><li>сведения об объекте строительства или ремонта;</li><li>адрес или район расположения объекта, если пользователь сообщает его самостоятельно;</li><li>желаемый вид работ;</li><li>предполагаемый бюджет;</li><li>содержание комментария или сообщения;</li><li>предпочтительный способ связи;</li><li>иные сведения, добровольно указанные пользователем при обращении.</li></ul><p>3.2. При посещении сайта автоматически могут обрабатываться технические данные:</p><ul><li>IP-адрес;</li><li>сведения о браузере и операционной системе;</li><li>тип устройства;</li><li>дата и время посещения;</li><li>адрес посещённой страницы;</li><li>источник перехода на сайт;</li><li>действия пользователя на страницах;</li><li>файлы cookie;</li><li>технические идентификаторы;</li><li>сведения, собираемые сервисами интернет-статистики.</li></ul><p>3.3. Оператор не запрашивает через формы сайта паспортные данные, сведения о банковских картах, СНИЛС и иные данные, не требующиеся для консультации и подготовки расчёта.</p><h2>4. Цели обработки персональных данных</h2><p>Оператор обрабатывает персональные данные в следующих целях:</p><ul><li>обработка заявок и обращений пользователей;</li><li>обратная связь с пользователем;</li><li>предоставление консультации;</li><li>уточнение параметров объекта и необходимых работ;</li><li>подготовка предварительного расчёта или сметы;</li><li>согласование выезда специалиста;</li><li>подготовка, заключение и исполнение договора;</li><li>оказание строительных, ремонтных, отделочных и сопутствующих услуг;</li><li>информирование пользователя о ходе обработки его обращения;</li><li>улучшение качества сайта и предоставляемых услуг;</li><li>анализ посещаемости и поведения пользователей;</li><li>оценка эффективности рекламы;</li><li>обеспечение безопасности и стабильной работы сайта;</li><li>предотвращение злоупотреблений и технических нарушений.</li></ul><p>Персональные данные не используются в целях, несовместимых с целями, для которых они были получены.</p><h2>5. Правовые основания обработки</h2><p>Правовыми основаниями обработки персональных данных являются:</p><ul><li>Федеральный закон от 27.07.2006 № 152-ФЗ «О персональных данных»;</li><li>согласие пользователя на обработку персональных данных;</li><li>действия, необходимые для заключения договора по инициативе пользователя;</li><li>договор, стороной или выгодоприобретателем по которому является пользователь;</li><li>законные интересы Оператора при условии, что при этом не нарушаются права и свободы пользователя;</li><li>иные основания, предусмотренные законодательством Российской Федерации.</li></ul><h2>6. Порядок и способы обработки персональных данных</h2><p>6.1. Обработка персональных данных может осуществляться автоматизированным, неавтоматизированным или смешанным способом.</p><p>6.2. Оператор может совершать следующие действия с персональными данными:</p><ul><li>сбор;</li><li>получение;</li><li>запись;</li><li>систематизация;</li><li>накопление;</li><li>хранение;</li><li>уточнение и обновление;</li><li>извлечение;</li><li>использование;</li><li>предоставление доступа уполномоченным лицам;</li><li>передача лицам, участвующим в обработке обращения или исполнении договора;</li><li>обезличивание;</li><li>блокирование;</li><li>удаление;</li><li>уничтожение.</li></ul><p>6.3. Оператор обрабатывает только те данные, которые необходимы для достижения заявленных целей.</p><p>6.4. Доступ к персональным данным предоставляется только лицам, которым он необходим для обработки заявки, подготовки расчёта, исполнения договора, поддержки сайта или выполнения требований законодательства.</p><p>6.5. Оператор принимает необходимые правовые, организационные и технические меры для защиты персональных данных от неправомерного или случайного доступа, изменения, копирования, распространения, уничтожения и иных неправомерных действий.</p><h2>7. Передача персональных данных третьим лицам</h2><p>7.1. Оператор не продаёт и не передаёт персональные данные пользователей третьим лицам для самостоятельного использования в рекламных целях.</p><p>7.2. Передача данных допускается:</p><ul><li>с согласия пользователя;</li><li>для обработки заявки и связи с пользователем;</li><li>для подготовки и исполнения договора;</li><li>поставщикам хостинга и технической поддержки сайта;</li><li>поставщикам услуг электронной почты;</li><li>сервисам телефонии и мессенджерам, если пользователь выбрал соответствующий способ связи;</li><li>сервисам веб-аналитики;</li><li>подрядчикам Оператора в объёме, необходимом для исполнения договора;</li><li>государственным органам в случаях, предусмотренных законодательством Российской Федерации.</li></ul><p>7.3. При привлечении третьих лиц Оператор требует соблюдения конфиденциальности и принятия мер по защите персональных данных.</p><p>7.4. При переходе пользователя по ссылкам на WhatsApp, Telegram, MAX, социальные сети или другие внешние ресурсы обработка данных может осуществляться владельцами соответствующих сервисов по их собственным правилам и политикам.</p><h2>8. Использование Яндекс Метрики и файлов cookie</h2><p>8.1. На сайте может использоваться сервис веб-аналитики «Яндекс Метрика», предоставляемый ООО «ЯНДЕКС».</p><p>8.2. Сервис может получать техническую информацию об использовании сайта, включая сведения об устройстве, браузере, посещённых страницах, источнике перехода, продолжительности посещения и действиях пользователя.</p><p>8.3. Полученные данные используются для:</p><ul><li>анализа посещаемости;</li><li>оценки удобства сайта;</li><li>выявления технических ошибок;</li><li>оценки эффективности рекламных кампаний;</li><li>улучшения структуры, содержания и функциональности сайта.</li></ul><p>8.4. Сайт может использовать файлы cookie, необходимые для корректной работы, аналитики и сохранения пользовательских настроек.</p><p>8.5. Пользователь может ограничить или запретить использование cookie в настройках браузера. В таком случае отдельные функции сайта могут работать некорректно.</p><p>8.6. При первом посещении сайта пользователю может быть показано уведомление об использовании cookie и сервисов веб-аналитики.</p><h2>9. Сроки обработки и хранения</h2><p>9.1. Персональные данные обрабатываются до достижения целей обработки, отзыва согласия пользователем либо возникновения иных законных оснований для прекращения обработки.</p><p>9.2. Данные, необходимые для исполнения договора, бухгалтерского, налогового или иного обязательного учёта, могут храниться в течение сроков, установленных законодательством Российской Федерации.</p><p>9.3. После достижения целей обработки либо отзыва согласия персональные данные подлежат удалению или уничтожению, если их дальнейшее хранение не требуется по закону или договору.</p><h2>10. Права пользователя</h2><p>Пользователь вправе:</p><ul><li>получать информацию об обработке его персональных данных;</li><li>требовать уточнения, обновления или исправления данных;</li><li>требовать блокирования или уничтожения данных, если они являются неполными, устаревшими, неточными или обрабатываются незаконно;</li><li>отозвать согласие на обработку персональных данных;</li><li>возражать против обработки данных в целях прямого продвижения услуг;</li><li>обжаловать действия или бездействие Оператора в Роскомнадзор или в судебном порядке;</li><li>осуществлять иные права, предусмотренные законодательством Российской Федерации.</li></ul><h2>11. Отзыв согласия и обращения пользователя</h2><p>11.1. Пользователь может отозвать согласие на обработку персональных данных или направить запрос относительно своих данных:</p><ul><li>по электронной почте: <strong>[email оператора]</strong>;</li><li>по почтовому адресу: <strong>[адрес оператора]</strong>.</li></ul><p>11.2. В обращении рекомендуется указать:</p><ul><li>фамилию и имя;</li><li>контактные данные;</li><li>содержание требования;</li><li>сведения, позволяющие подтвердить факт обращения через сайт.</li></ul><p>11.3. После получения отзыва Оператор прекращает обработку и уничтожает персональные данные, если отсутствуют иные законные основания для продолжения обработки.</p><h2>12. Защита персональных данных</h2><p>12.1. Оператор принимает меры, необходимые для защиты персональных данных, в том числе:</p><ul><li>ограничивает круг лиц, имеющих доступ к данным;</li><li>использует пароли и разграничение прав доступа;</li><li>применяет защищённое соединение HTTPS;</li><li>выполняет резервное копирование при необходимости;</li><li>контролирует работу сайта и форм;</li><li>принимает меры для предотвращения несанкционированного доступа;</li><li>удаляет данные после утраты необходимости в их обработке;</li><li>информирует лиц, допущенных к обработке, о необходимости соблюдения конфиденциальности.</li></ul><p>12.2. Оператор не может гарантировать абсолютную защищённость информации при её передаче через интернет, однако принимает разумные и необходимые меры для снижения соответствующих рисков.</p><h2>13. Актуализация Политики</h2><p>13.1. Оператор вправе вносить изменения в настоящую Политику при изменении законодательства, порядка обработки данных, используемых сервисов или функциональности сайта.</p><p>13.2. Новая редакция вступает в силу с момента её публикации на сайте.</p><p>13.3. Актуальная версия Политики постоянно доступна по адресу:</p><p><strong>https://stroybrigada-365.ru/politika-konfidentsialnosti/</strong></p><h2>14. Контактные данные Оператора</h2><p><strong>Оператор:</strong> Иванов Михаил Ристович<br><strong>Адрес:</strong> Силикатная ул., 35, Мытищи<br><strong>ИНН:</strong> 371122307989<br><strong>Электронная почта:</strong> stroybrigada365@mail.ru<br><strong>Телефон:</strong> +7 (977) 779-87-77<br><strong>Сайт:</strong> https://stroybrigada-365.ru/</p></div></div></div></section>',
		],
		[
			'source_id' => 'stroybrigada_personal_data_consent',
			'slug'      => 'soglasie-na-obrabotku-personalnyh-dannyh',
			'title'     => __('Согласие на обработку персональных данных', 'stroybrigada'),
			'html'      => '<section class="site-section site-section--content stroybrigada-technical-content"><div class="bg_grey pt_lg pb_lg2"><div class="container"><div class="content-block-text"><h1>Согласие на обработку персональных данных</h1><div class="consent-text"><p>Вы соглашаетесь в соответствии с Федеральным законом от 27.07.2006 № 152-ФЗ «О персональных данных» на обработку на сайте <strong>stroybrigada365.ru</strong> на условиях, изложенных в политике на обработку персональных данных, включающих:</p><ul><li>ФИО;</li><li>контактные данные (телефон, e-mail);</li><li>иные данные, необходимые для оказания услуг.</li></ul><p><strong>Цели обработки:</strong></p><ul><li>Оказание услуг;</li><li>Запись на встречу и обратная связь;</li><li>Соблюдение требований законодательства.</li></ul><p><strong>Способы обработки:</strong> автоматизированные и неавтоматизированные, включая сбор, запись, хранение, уточнение, передачу (в т.ч. третьим лицам, если это необходимо для оказания услуг).</p><p>Срок действия согласия: <strong>до отзыва</strong>, который может быть осуществлен путем направления письменного уведомления по адресу оператора.</p><p>Подтверждено, ознакомление с <strong>Политикой обработки персональных данных</strong> на сайте <strong>stroybrigada365.ru</strong>.</p></div></div></div></div></section>',
		],
		[
			'source_id' => 'stroybrigada_sitemap',
			'slug'      => 'sitemap',
			'title'     => __('Карта сайта', 'stroybrigada'),
			'html'      => '<section class="site-section site-section--content stroybrigada-technical-content"><div class="bg_grey pt_lg pb_lg2"><div class="container"><div class="content-block-text"><h1>Карта сайта</h1><ul><li><a href="/">Главная</a></li><li><a href="/stroitelstvo-chastnyh-domov-kottedzhey-ban/">Строительство / реконструкция домов</a></li><li><a href="/montazh-krovli-i-stropil/">Кровельные работы</a></li><li><a href="/ustroystvo-fundamentov-otmostok-parkovok/">Строительство фундамента</a></li><li><a href="/otdelochnye-raboty-ustroystvo-styazhek-i-polov/">Утепление дома</a></li><li><a href="/otmostki/">Укладка брусчатки и отмостки</a></li><li><a href="/stroitelstvo-pristroek/">Беседки, веранды, пристройки</a></li><li><a href="/stroitelstvo-sten-derevyannyh-karkasnyh-kamennyh/">Восстановление старых домов и дач</a></li><li><a href="/stroitelstvo-zdaniy-i-otdelka/">Фасадные работы, сайдинг</a></li><li><a href="/politika-konfidentsialnosti/">Политика конфиденциальности</a></li><li><a href="/soglasie-na-obrabotku-personalnyh-dannyh/">Согласие на обработку персональных данных</a></li></ul></div></div></div></section>',
		],
		[
			'source_id' => 'stroybrigada_cookie_policy',
			'slug'      => 'politika-cookie',
			'title'     => __('Политика использования файлов cookie', 'stroybrigada'),
			'html'      => '<section class="site-section site-section--content stroybrigada-technical-content"><div class="bg_grey pt_lg pb_lg2"><div class="container"><div class="content-block-text"><h1>Политика использования файлов cookie</h1><p><strong>Редакция от 16 сентября 2026 года</strong></p><p>Настоящая Политика описывает использование файлов cookie на сайте <strong>https://stroybrigada-365.ru/</strong>.</p><h2>1. Что такое cookie</h2><p>Cookie — небольшие текстовые файлы, которые сайт сохраняет на устройстве пользователя. Они помогают обеспечивать работу сайта, запоминать настройки и получать обезличенную статистику посещений.</p><h2>2. Какие cookie используются</h2><ul><li><strong>Необходимые</strong> — обеспечивают работу форм, навигации, безопасности и основных функций сайта.</li><li><strong>Функциональные</strong> — помогают сохранять выбранные пользователем настройки.</li><li><strong>Аналитические</strong> — позволяют оценивать посещаемость и улучшать страницы сайта.</li></ul><h2>3. Сервисы аналитики</h2><p>На сайте может использоваться сервис «Яндекс Метрика». Он может обрабатывать технические сведения об устройстве, браузере, посещённых страницах, источнике перехода и действиях пользователя. Обработка данных такими сервисами осуществляется также в соответствии с документами их владельцев.</p><h2>4. Управление cookie</h2><p>Пользователь может ограничить или запретить cookie в настройках браузера, а также удалить ранее сохранённые файлы. Отключение необходимых cookie может привести к некорректной работе отдельных функций сайта.</p><h2>5. Срок хранения</h2><p>Срок хранения зависит от назначения конкретного cookie. Сессионные cookie удаляются после закрытия браузера, постоянные хранятся до истечения установленного срока или до их удаления пользователем.</p><h2>6. Изменение Политики</h2><p>Политика может обновляться при изменении используемых сервисов, функциональности сайта или требований законодательства. Актуальная версия размещается на этой странице.</p><h2>7. Контактные данные</h2><p><strong>Оператор:</strong> Иванов Михаил Ристович<br><strong>Адрес:</strong> Силикатная ул., 35, Мытищи<br><strong>ИНН:</strong> 371122307989<br><strong>Электронная почта:</strong> Stroybrigada-365@mail.ru<br><strong>Телефон:</strong> +7 (977) 779-87-77</p><p>Дополнительная информация об обработке данных приведена в <a href="/politika-konfidentsialnosti/">Политике конфиденциальности</a>.</p></div></div></div></section>',
		],
	];
}

function stroybrigada_find_page_by_source_or_slug(string $source_id, string $slug): int {
	$posts = get_posts(
		[
			'post_type'      => 'page',
			'post_status'    => ['publish', 'draft', 'private'],
			'posts_per_page' => 1,
			'fields'         => 'ids',
			'meta_key'       => '_stroybrigada_source_id',
			'meta_value'     => $source_id,
			'no_found_rows'  => true,
		]
	);

	if ($posts) {
		return (int) $posts[0];
	}

	$page = get_page_by_path($slug, OBJECT, 'page');
	return $page instanceof WP_Post ? (int) $page->ID : 0;
}

function stroybrigada_ensure_technical_pages(): void {
	if (wp_doing_ajax() || wp_doing_cron()) {
		return;
	}

	foreach (stroybrigada_technical_page_defaults() as $page) {
		$source_id = (string) $page['source_id'];
		$slug      = (string) $page['slug'];
		$page_id   = stroybrigada_find_page_by_source_or_slug($source_id, $slug);

		if ($page_id) {
			update_post_meta($page_id, '_stroybrigada_source_id', $source_id);
			if (! stroybrigada_page_sections_were_edited($page_id)) {
				stroybrigada_update_page_sections(
					$page_id,
					[
						[
							'key'     => $slug,
							'label'   => (string) $page['title'],
							'visible' => true,
							'html'    => (string) $page['html'],
						],
					]
				);
				wp_update_post(
					wp_slash(
						[
							'ID'           => $page_id,
							'post_content' => '',
						]
					)
				);
			}
			continue;
		}

		$result = wp_insert_post(
			wp_slash(
				[
					'post_type'    => 'page',
					'post_status'  => 'publish',
					'post_title'   => (string) $page['title'],
					'post_name'    => $slug,
					'post_content' => '',
					'menu_order'   => 998,
				]
			),
			true
		);

		if (! is_wp_error($result) && $result) {
			$new_page_id = (int) $result;
			update_post_meta($new_page_id, '_stroybrigada_source_id', $source_id);
			stroybrigada_update_page_sections(
				$new_page_id,
				[
					[
						'key'     => $slug,
						'label'   => (string) $page['title'],
						'visible' => true,
						'html'    => (string) $page['html'],
					],
				]
			);
		}
	}
}
add_action('init', 'stroybrigada_ensure_technical_pages', 31);

function stroybrigada_technical_page_body_class(array $classes): array {
	$technical_slugs = [
		'404-error',
		'politika-konfidentsialnosti',
		'soglasie-na-obrabotku-personalnyh-dannyh',
		'politika-cookie',
		'sitemap',
	];

	$post_id = (int) get_queried_object_id();
	$slug = $post_id > 0 ? (string) get_post_field('post_name', $post_id) : '';

	if (is_404() || in_array($slug, $technical_slugs, true) || ($post_id > 0 && $post_id === stroybrigada_get_404_page_id())) {
		$classes[] = 'stroybrigada-technical-page';
	}

	return array_values(array_unique($classes));
}
add_filter('body_class', 'stroybrigada_technical_page_body_class');
