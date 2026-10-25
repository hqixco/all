<?php
/**
 * Admin helpers.
 *
 * @package Stroybrigada
 */

declare(strict_types=1);

if (! defined('ABSPATH')) {
	exit;
}

function stroybrigada_register_theme_page(): void {
	add_theme_page(
		__('Stroybrigada', 'stroybrigada'),
		__('Stroybrigada', 'stroybrigada'),
		'manage_options',
		'stroybrigada-theme',
		'stroybrigada_render_theme_page'
	);
}
add_action('admin_menu', 'stroybrigada_register_theme_page');

/**
 * Adds a duplicate action to page rows in the WordPress admin.
 *
 * @param array<string,string> $actions Existing row actions.
 * @param WP_Post              $post    Current post.
 * @return array<string,string>
 */
function stroybrigada_add_duplicate_page_action(array $actions, WP_Post $post): array {
	if ('page' !== $post->post_type || ! current_user_can('edit_page', $post->ID)) {
		return $actions;
	}

	$url = wp_nonce_url(
		admin_url('admin.php?action=stroybrigada_duplicate_page&post=' . $post->ID),
		'stroybrigada_duplicate_page_' . $post->ID
	);
	$actions['stroybrigada_duplicate'] = '<a href="' . esc_url($url) . '">' . esc_html__('Дублировать', 'stroybrigada') . '</a>';

	return $actions;
}
add_filter('page_row_actions', 'stroybrigada_add_duplicate_page_action', 10, 2);

/**
 * Creates a draft copy of a page, including its metadata and taxonomy terms.
 */
function stroybrigada_duplicate_page(): void {
	$post_id = isset($_GET['post']) ? absint($_GET['post']) : 0;
	check_admin_referer('stroybrigada_duplicate_page_' . $post_id);

	$source = get_post($post_id);
	if (! $source instanceof WP_Post || 'page' !== $source->post_type || ! current_user_can('edit_page', $post_id)) {
		wp_die(esc_html__('Не удалось дублировать страницу.', 'stroybrigada'));
	}

	$copy_id = wp_insert_post(
		wp_slash([
			'post_type'      => 'page',
			'post_status'    => 'draft',
			'post_title'     => $source->post_title . ' — ' . __('копия', 'stroybrigada'),
			'post_content'   => $source->post_content,
			'post_excerpt'   => $source->post_excerpt,
			'post_author'    => get_current_user_id(),
			'post_parent'    => $source->post_parent,
			'menu_order'     => $source->menu_order,
			'comment_status' => $source->comment_status,
			'ping_status'    => $source->ping_status,
		]),
		true
	);

	if (is_wp_error($copy_id)) {
		wp_die(esc_html($copy_id->get_error_message()));
	}

	$excluded_meta = ['_edit_lock', '_edit_last', '_wp_old_slug'];
	foreach (get_post_meta($post_id) as $meta_key => $values) {
		if (in_array($meta_key, $excluded_meta, true)) {
			continue;
		}
		if ($meta_key === stroybrigada_sections_meta_key($post_id)) {
			$meta_key = stroybrigada_sections_meta_key($copy_id);
		}
		foreach ($values as $value) {
			add_post_meta($copy_id, $meta_key, maybe_unserialize($value));
		}
	}

	foreach (get_object_taxonomies('page') as $taxonomy) {
		$term_ids = wp_get_object_terms($post_id, $taxonomy, ['fields' => 'ids']);
		if (! is_wp_error($term_ids)) {
			wp_set_object_terms($copy_id, $term_ids, $taxonomy);
		}
	}

	wp_safe_redirect(admin_url('post.php?action=edit&post=' . $copy_id));
	exit;
}
add_action('admin_action_stroybrigada_duplicate_page', 'stroybrigada_duplicate_page');

function stroybrigada_global_partial_option_name(string $partial): string {
	return 'stroybrigada_global_' . sanitize_key($partial) . '_html';
}

function stroybrigada_global_partial_file_path(string $partial): string {
	$file = 'footer' === $partial ? 'site-footer.html' : 'site-header.html';
	return STROYBRIGADA_ASSETS_PATH . 'dist/partials/' . $file;
}

function stroybrigada_get_global_partial_default_html(string $partial): string {
	$partial_path = stroybrigada_global_partial_file_path($partial);
	if (! is_readable($partial_path)) {
		return '';
	}

	$html = file_get_contents($partial_path);
	return is_string($html) ? $html : '';
}

function stroybrigada_get_global_partial_html(string $partial): string {
	if (function_exists('stroybrigada_render_global_partial_from_layout')) {
		$rendered = stroybrigada_render_global_partial_from_layout($partial);
		if ('' !== $rendered) {
			return $rendered;
		}
	}

	$stored = get_option(stroybrigada_global_partial_option_name($partial), null);
	if (is_string($stored) && '' !== $stored) {
		return $stored;
	}

	return stroybrigada_get_global_partial_default_html($partial);
}

function stroybrigada_sanitize_global_partial_html(string $html): string {
	$html = wp_unslash($html);
	return current_user_can('unfiltered_html') ? $html : wp_kses_post($html);
}

function stroybrigada_header_footer_defaults(): array {
	return [
		'header'   => [
			'logo_url'      => '/assets/uploads/2023/04/logo-main.webp',
			'logo_link'     => '/',
			'logo_alt'      => '',
			'descriptor'    => 'Частная строительная бригада в МО. Работаем с 2011 года',
			'status'        => 'звоните/пишите, мы онлайн',
			'phone_label'   => '+7 (977) 779-87-77',
			'phone_url'     => 'tel:+79777798777',
			'button_text'   => 'Заказать звонок',
			'button_url'    => '#callback',
			'socials'       => [
				['label' => 'MAX', 'url' => 'https://max.ru/u/f9LHodD0cOKjZKEEXVFVw9E7T6GNV4MyI1f6EKBpJHRw5wVgzj_aFlyBX7A', 'icon' => '/assets/uploads/2026/06/max-header.svg'],
				['label' => 'Telegram', 'url' => 'https://t.me/Stroitel_Mikhail', 'icon' => '/assets/uploads/2026/06/telegram-header.svg'],
			],
			'menu'          => [
				['label' => 'Главная', 'url' => '/', 'children' => []],
				[
					'label'    => 'Наши услуги',
					'url'      => '#',
					'children' => [
						['label' => 'Кровельные работы', 'url' => '/montazh-krovli-i-stropil/'],
						['label' => 'Строительство фундамента', 'url' => '/ustroystvo-fundamentov-otmostok-parkovok/'],
						['label' => 'Утепление дома', 'url' => '/otdelochnye-raboty-ustroystvo-styazhek-i-polov/'],
						['label' => 'Укладка брусчатки и отмостки', 'url' => '/otmostki/'],
						['label' => 'Беседки, веранды, пристройки', 'url' => '/stroitelstvo-pristroek/'],
						['label' => 'Восстановление старых домов и дач', 'url' => '/stroitelstvo-sten-derevyannyh-karkasnyh-kamennyh/'],
						['label' => 'Фасадные работы, сайдинг', 'url' => '/stroitelstvo-zdaniy-i-otdelka/'],
					],
				],
				['label' => 'Калькулятор', 'url' => '#quiz-section', 'children' => []],
				['label' => 'Цены', 'url' => '#price', 'children' => []],
				['label' => 'Наши работы', 'url' => '#works', 'children' => []],
				['label' => 'Отзывы', 'url' => '#reviews', 'children' => []],
				['label' => 'Видео', 'url' => '#video', 'children' => []],
				['label' => 'Контакты', 'url' => '#contacts', 'children' => []],
			],
		],
		'footer'   => [
			'info_title'       => 'ИНФОРМАЦИЯ',
			'info_text'        => '© stroybrigada-365.ru | Загородное строительство, ремонт и отделка под ключ в Москве и Подмосковье',
			'notice_text'      => "Вся информация, размещённая на сайте, носит ознакомительный характер и может отличаться от действительности.\n\nОбращаем ваше внимание на то, что данный интернет-сайт носит исключительно информационный характер и ни при каких условиях не является публичной офертой, определяемой положениями Статьи 437 Гражданского кодекса Российской Федерации.",
			'cookie_text'      => 'Для улучшения работы сайта мы используем файлы cookie. Вы всегда можете отключить файлы cookie в настройках браузера.',
			'services_title'   => 'НАШИ УСЛУГИ',
			'nav_title'        => 'НАВИГАЦИЯ',
			'contacts_title'   => 'КОНТАКТЫ',
			'address'          => 'Силикатная ул., 35, Мытищи',
			'schedule'         => 'Принимаем заявки 24/7',
			'phone_label'      => '+7 (977) 779-87-77',
			'phone_url'        => 'tel:+79777798777',
			'email'            => 'stroybrigada365@mail.ru',
			'copyright'        => 'Copyright 2018 — 2026. Все права защищены.',
			'credit_text'      => 'Сайты и реклама',
			'credit_url'       => 'https://max.ru/u/f9LHodD0cOKO5otbFEi77cpANa3VvsBp-sG0rK6kZxy91xCTM6WCx1YjthU',
			'city_popup_title' => 'Ваш регион доставки',
			'city_list_title'  => 'Выберите из списка:',
			'city_empty_title' => 'Не нашли Ваш город?',
			'city_empty_text'  => 'Мы доставляем по всему миру',
			'city_continue'    => 'Продолжить без города',
			'legal_links'      => [
				['label' => 'Политика конфиденциальности', 'url' => '/politika-konfidentsialnosti/'],
				['label' => 'Политика использования cookie', 'url' => '/politika-cookie/'],
				['label' => 'Согласие на обработку персональных данных', 'url' => '/soglasie-na-obrabotku-personalnyh-dannyh/'],
				['label' => 'Карта сайта', 'url' => '/sitemap/'],
			],
			'socials'          => [
				['label' => 'MAX', 'url' => 'https://max.ru/u/f9LHodD0cOKjZKEEXVFVw9E7T6GNV4MyI1f6EKBpJHRw5wVgzj_aFlyBX7A', 'icon' => '/assets/uploads/2026/06/max-header.svg'],
				['label' => 'Telegram', 'url' => 'https://t.me/Stroitel_Mikhail', 'icon' => '/assets/uploads/2026/06/telegram-header.svg'],
			],
			'floating_buttons' => [
				['label' => 'Рассчитать <br>стоимость', 'url' => '#quiz-section', 'color' => '#549168'],
				['label' => 'Заказать <br>звонок', 'url' => '#callback', 'color' => '#888888'],
			],
		],
	];
}

function stroybrigada_get_header_footer_settings(): array {
	$stored = get_option('stroybrigada_header_footer_settings', []);
	if (! is_array($stored)) {
		$stored = [];
	}

	$settings = array_replace_recursive(stroybrigada_header_footer_defaults(), $stored);

	// Keep one canonical public phone even when an older value remains in the
	// saved header/footer settings from a previous theme version.
	foreach (['header', 'footer'] as $section) {
		$settings[$section]['phone_label'] = '+7 (977) 779-87-77';
		$settings[$section]['phone_url']   = 'tel:+79777798777';
	}

	// Numeric arrays are complete user-managed lists. array_replace_recursive()
	// keeps default entries whose indexes are absent from a shorter saved list,
	// causing deleted menu/footer items to reappear after the page reloads.
	$list_paths = [
		['header', 'socials'],
		['header', 'menu'],
		['footer', 'legal_links'],
		['footer', 'socials'],
		['footer', 'floating_buttons'],
	];
	foreach ($list_paths as [$section, $key]) {
		if (isset($stored[$section]) && is_array($stored[$section]) && array_key_exists($key, $stored[$section])) {
			$settings[$section][$key] = is_array($stored[$section][$key]) ? $stored[$section][$key] : [];
		}
	}

	// Migrate the legacy cookie link without overwriting other user-managed
	// footer links.
	foreach ($settings['footer']['legal_links'] as &$legal_link) {
		if (is_array($legal_link) && false !== stripos((string) ($legal_link['label'] ?? ''), 'cookie')) {
			$legal_link['label'] = 'Политика использования cookie';
			$legal_link['url']   = '/politika-cookie/';
		}
	}
	unset($legal_link);

	$settings['footer']['services_links'] = $settings['header']['menu'][1]['children'] ?? [];
	$settings['footer']['nav_links']      = array_values(array_filter($settings['header']['menu'], static function ($item): bool {
		return is_array($item) && empty($item['children']) && '/' !== (string) ($item['url'] ?? '');
	}));

	return $settings;
}

function stroybrigada_sanitize_header_footer_link_list($links, bool $allow_children = false): array {
	if (! is_array($links)) {
		return [];
	}

	$clean = [];
	foreach (array_values($links) as $link) {
		if (! is_array($link)) {
			continue;
		}

		$item = [
			'label' => sanitize_text_field((string) ($link['label'] ?? '')),
			'url'   => esc_url_raw((string) ($link['url'] ?? '')),
		];

		if ('' === $item['label'] && '' === $item['url']) {
			continue;
		}

		if ($allow_children) {
			$item['children'] = stroybrigada_sanitize_header_footer_link_list($link['children'] ?? [], false);
		}

		$clean[] = $item;
	}

	return $clean;
}

function stroybrigada_sanitize_header_footer_socials($socials): array {
	if (! is_array($socials)) {
		return [];
	}

	$clean = [];
	foreach (array_values($socials) as $social) {
		if (! is_array($social)) {
			continue;
		}

		$item = [
			'label' => sanitize_text_field((string) ($social['label'] ?? '')),
			'url'   => esc_url_raw((string) ($social['url'] ?? '')),
			'icon'  => esc_url_raw((string) ($social['icon'] ?? '')),
		];

		if ('' === $item['label'] && '' === $item['url'] && '' === $item['icon']) {
			continue;
		}

		$clean[] = $item;
	}

	return $clean;
}

function stroybrigada_sanitize_header_footer_settings(array $data): array {
	$defaults = stroybrigada_header_footer_defaults();

	return [
		'header' => [
			'logo_url'    => esc_url_raw((string) ($data['header']['logo_url'] ?? $defaults['header']['logo_url'])),
			'logo_link'   => esc_url_raw((string) ($data['header']['logo_link'] ?? $defaults['header']['logo_link'])),
			'logo_alt'    => sanitize_text_field((string) ($data['header']['logo_alt'] ?? $defaults['header']['logo_alt'])),
			'descriptor'  => sanitize_text_field((string) ($data['header']['descriptor'] ?? $defaults['header']['descriptor'])),
			'status'      => sanitize_text_field((string) ($data['header']['status'] ?? $defaults['header']['status'])),
			'phone_label' => sanitize_text_field((string) ($data['header']['phone_label'] ?? $defaults['header']['phone_label'])),
			'phone_url'   => esc_url_raw((string) ($data['header']['phone_url'] ?? $defaults['header']['phone_url'])),
			'button_text' => sanitize_text_field((string) ($data['header']['button_text'] ?? $defaults['header']['button_text'])),
			'button_url'  => esc_url_raw((string) ($data['header']['button_url'] ?? $defaults['header']['button_url'])),
			'socials'     => stroybrigada_sanitize_header_footer_socials($data['header']['socials'] ?? []),
			'menu'        => stroybrigada_sanitize_header_footer_link_list($data['header']['menu'] ?? [], true),
		],
		'footer' => [
			'info_title'       => sanitize_text_field((string) ($data['footer']['info_title'] ?? $defaults['footer']['info_title'])),
			'info_text'        => sanitize_textarea_field((string) ($data['footer']['info_text'] ?? $defaults['footer']['info_text'])),
			'notice_text'      => sanitize_textarea_field((string) ($data['footer']['notice_text'] ?? $defaults['footer']['notice_text'])),
			'cookie_text'      => sanitize_textarea_field((string) ($data['footer']['cookie_text'] ?? $defaults['footer']['cookie_text'])),
			'services_title'   => sanitize_text_field((string) ($data['footer']['services_title'] ?? $defaults['footer']['services_title'])),
			'nav_title'        => sanitize_text_field((string) ($data['footer']['nav_title'] ?? $defaults['footer']['nav_title'])),
			'contacts_title'   => sanitize_text_field((string) ($data['footer']['contacts_title'] ?? $defaults['footer']['contacts_title'])),
			'address'          => sanitize_text_field((string) ($data['footer']['address'] ?? $defaults['footer']['address'])),
			'schedule'         => sanitize_text_field((string) ($data['footer']['schedule'] ?? $defaults['footer']['schedule'])),
			'phone_label'      => sanitize_text_field((string) ($data['footer']['phone_label'] ?? $defaults['footer']['phone_label'])),
			'phone_url'        => esc_url_raw((string) ($data['footer']['phone_url'] ?? $defaults['footer']['phone_url'])),
			'email'            => sanitize_email((string) ($data['footer']['email'] ?? $defaults['footer']['email'])),
			'copyright'        => sanitize_text_field((string) ($data['footer']['copyright'] ?? $defaults['footer']['copyright'])),
			'credit_text'      => sanitize_text_field((string) ($data['footer']['credit_text'] ?? $defaults['footer']['credit_text'])),
			'credit_url'       => esc_url_raw((string) ($data['footer']['credit_url'] ?? $defaults['footer']['credit_url'])),
			'city_popup_title' => sanitize_text_field((string) ($data['footer']['city_popup_title'] ?? $defaults['footer']['city_popup_title'])),
			'city_list_title'  => sanitize_text_field((string) ($data['footer']['city_list_title'] ?? $defaults['footer']['city_list_title'])),
			'city_empty_title' => sanitize_text_field((string) ($data['footer']['city_empty_title'] ?? $defaults['footer']['city_empty_title'])),
			'city_empty_text'  => sanitize_text_field((string) ($data['footer']['city_empty_text'] ?? $defaults['footer']['city_empty_text'])),
			'city_continue'    => sanitize_text_field((string) ($data['footer']['city_continue'] ?? $defaults['footer']['city_continue'])),
			'legal_links'      => stroybrigada_sanitize_header_footer_link_list($data['footer']['legal_links'] ?? [], false),
			'socials'          => stroybrigada_sanitize_header_footer_socials($data['footer']['socials'] ?? []),
			'floating_buttons' => array_map(static function (array $button): array {
				return [
					'label' => wp_kses((string) ($button['label'] ?? ''), ['br' => []]),
					'url'   => esc_url_raw((string) ($button['url'] ?? '')),
					'color' => sanitize_hex_color((string) ($button['color'] ?? '')) ?: '#549168',
				];
			}, is_array($data['footer']['floating_buttons'] ?? null) ? $data['footer']['floating_buttons'] : []),
		],
	];
}

function stroybrigada_render_header_footer_socials(array $socials, string $extra_class = ''): string {
	if (empty($socials)) {
		return '';
	}

	$html = '<div class="site-header__socials site-header__socials--secondary ' . esc_attr($extra_class) . '">';
	foreach ($socials as $social) {
		$url   = stroybrigada_secure_internal_url((string) ($social['url'] ?? ''));
		$icon  = stroybrigada_secure_internal_url((string) ($social['icon'] ?? ''));
		$label = (string) ($social['label'] ?? '');
		if ('' === $url && '' === $icon) {
			continue;
		}
		$html .= '<a href="' . esc_url($url) . '" aria-label="' . esc_attr($label) . '" target="_blank" rel="noopener noreferrer">';
		if ('' !== $icon) {
			$html .= '<img src="' . esc_url($icon) . '" alt="">';
		} else {
			$html .= esc_html($label);
		}
		$html .= '</a>';
	}
	$html .= '</div>';

	return $html;
}

function stroybrigada_layout_current_page_url(string $url): string {
	$url = trim($url);
	if (str_starts_with($url, '/#')) {
		return '#' . substr($url, 2);
	}

	$home_url = untrailingslashit(home_url());
	if (str_starts_with($url, $home_url . '/#')) {
		return '#' . substr($url, strlen($home_url) + 2);
	}

	return $url;
}

function stroybrigada_render_global_header_from_layout(array $settings): string {
	$header = $settings['header'];

	ob_start();
	?>
<header class="site-header">
	<div class="site-header__shell">
		<div class="container">
			<div class="site-header__inner">
				<div class="site-header__left">
					<div class="site-header__logo">
						<a href="<?php echo esc_url(stroybrigada_secure_internal_url((string) $header['logo_link'])); ?>"><img src="<?php echo esc_url(stroybrigada_secure_internal_url((string) $header['logo_url'])); ?>" alt="<?php echo esc_attr((string) $header['logo_alt']); ?>"></a>
					</div>
					<div class="site-header__descriptor"><?php echo esc_html((string) $header['descriptor']); ?></div>
				</div>
				<div class="site-header__right">
					<?php echo stroybrigada_render_header_footer_socials((array) $header['socials'], 'd-flex align-items-center'); ?>
					<div class="site-header__contact-text ml30 site-header__phone-block">
						<div class="site-header__status" id="status" style="display: block;"><?php echo esc_html((string) $header['status']); ?></div>
						<div class="site-header__phone-value"><a href="<?php echo esc_url((string) $header['phone_url']); ?>"><?php echo esc_html((string) $header['phone_label']); ?></a></div>
					</div>
					<div class="site-header__actions ml30">
						<a href="<?php echo esc_url((string) $header['button_url']); ?>" class="btn btn-st0 uppercase"><?php echo esc_html((string) $header['button_text']); ?></a>
					</div>
					<div class="site-header__burger">
						<div class="site-header__burger-line"></div>
						<div class="site-header__burger-line"></div>
						<div class="site-header__burger-line"></div>
					</div>
				</div>
			</div>
		</div>
		<div class="site-header__menu">
			<div class="container">
				<div class="site-header__menu-top">
					<div class="site-header__menu-close">
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" class="svg-icon" viewBox="0 0 413.348 413.348"><path d="m413.348 24.354-24.354-24.354-182.32 182.32-182.32-182.32-24.354 24.354 182.32 182.32-182.32 182.32 24.354 24.354 182.32-182.32 182.32 182.32 24.354-24.354-182.32-182.32z"></path></svg>
					</div>
				</div>
				<div class="site-header__menu-bottom">
					<ul id="menu-glavnoe-menju" class="site-header__menu-list">
						<?php foreach ((array) $header['menu'] as $item) : ?>
							<?php $children = isset($item['children']) && is_array($item['children']) ? $item['children'] : []; ?>
							<li class="site-header__menu-item<?php echo ! empty($children) ? ' site-header__menu-item--has-sub' : ''; ?>">
								<a href="<?php echo esc_url(stroybrigada_layout_current_page_url((string) ($item['url'] ?? '#'))); ?>" class="site-header__menu-link<?php echo ! empty($children) ? ' site-header__menu-toggle' : ''; ?> site-header__menu-text"><?php echo esc_html((string) ($item['label'] ?? '')); ?><?php if (! empty($children)) : ?>
									<i class="fas fa-chevron-right visible-mobile"><svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><path d="M121.373 457.373 322.745 256 121.373 54.627a32 32 0 0 1 45.254-45.254l224 224a32 32 0 0 1 0 45.254l-224 224a32 32 0 0 1-45.254-45.254z" fill="#ffffff"></path></svg></i>
								<?php endif; ?></a>
								<?php if (! empty($children)) : ?>
									<ul class="site-header__submenu site-header__submenu--level-0 hidden">
										<?php foreach ($children as $child) : ?>
											<li class="site-header__menu-item site-header__submenu-item"><a href="<?php echo esc_url(stroybrigada_layout_current_page_url((string) ($child['url'] ?? '#'))); ?>" class="site-header__submenu-link site-header__submenu-link--level-1"><?php echo esc_html((string) ($child['label'] ?? '')); ?></a></li>
										<?php endforeach; ?>
									</ul>
								<?php endif; ?>
							</li>
						<?php endforeach; ?>
					</ul>
				</div>
			</div>
		</div>
	</div>
</header>
	<?php
	return (string) ob_get_clean();
}

function stroybrigada_render_global_footer_from_layout(array $settings): string {
	$footer = $settings['footer'];
	$services_links = (array) ($footer['services_links'] ?? []);
	$nav_links      = (array) ($footer['nav_links'] ?? []);

	ob_start();
	?>
<div class="offcanvas-overlay"></div>
<footer class="site-footer-shell">
	<div id="contacts" class="footer">
		<div class="container">
			<div class="footer__inner">
				<div class="footer__top">
					<div class="footer__col">
						<div class="title-sm section-title section-title--sm fw700 white mb2"><?php echo esc_html((string) $footer['info_title']); ?></div>
						<div class="footer__text"><?php echo esc_html((string) $footer['info_text']); ?></div>
						<div class="footer__text"><?php echo wpautop(esc_html((string) $footer['notice_text'])); ?></div>
						<div class="footer__text">
							<?php foreach ((array) $footer['legal_links'] as $link) : ?>
								<p><a href="<?php echo esc_url((string) ($link['url'] ?? '#')); ?>"><?php echo esc_html((string) ($link['label'] ?? '')); ?></a></p>
							<?php endforeach; ?>
							<p><?php echo esc_html((string) $footer['cookie_text']); ?></p>
						</div>
						<div><div class="geolocation footer__geo">
							<a class="geolocation__link " href="#">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0z"/></svg> <span class="geolocation__value footer__geo-value">Определение...</span>
							</a>
						</div></div>
						<div id="cityChange" class="popup-window popup-window-with-titlebar pop-up city-change" style="display:none;">
							<div class="popup-window-titlebar footer__popup-title" id="popup-window-titlebar-cityChange">
								<span><?php echo esc_html((string) $footer['city_popup_title']); ?></span>
							</div>
							<div id="popup-window-content-cityChange" class="popup-window-content footer__popup-content">
								<div class="bx-sls">
									<div class="bx-ui-sls-quick-locations quick-locations" style="overflow-x: scroll;height: 300px;">
										<div class="quick-locations__title footer__location-title"><?php echo esc_html((string) $footer['city_list_title']); ?></div>
										<div class="quick-locations__values__container footer__location-list"></div>
										<div style="clear:both;"></div>
									</div>
								</div>
								<div class="block-info footer__popup-info">
									<div class="block-info__title footer__popup-info-title"><?php echo esc_html((string) $footer['city_empty_title']); ?></div>
									<div class="block-info__text footer__popup-info-text"><?php echo esc_html((string) $footer['city_empty_text']); ?></div>
									<div style="margin-top: 7px;">
										<a style="color: #2cb7ff;border-bottom: 1px dashed #2cb7ff;" class="continue-without-geo footer__popup-link" href="#"><?php echo esc_html((string) $footer['city_continue']); ?></a>
									</div>
								</div>
							</div>
							<span class="popup-window-close-icon popup-window-titlebar-close-icon" style="right: -10px; top: -10px;"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 352 512"><path d="M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z"/></svg></span>
						</div>
					</div>
					<div class="footer__col">
						<div class="title-sm section-title section-title--sm fw700 white mb2"><?php echo esc_html((string) $footer['services_title']); ?></div>
						<div class="footer__text"><ul><?php foreach ($services_links as $link) : ?><li><a href="<?php echo esc_url(stroybrigada_layout_current_page_url((string) ($link['url'] ?? '#'))); ?>"><?php echo esc_html((string) ($link['label'] ?? '')); ?></a></li><?php endforeach; ?></ul></div>
					</div>
					<div class="footer__col">
						<div class="title-sm section-title section-title--sm fw700 white mb2"><?php echo esc_html((string) $footer['nav_title']); ?></div>
						<div class="footer__text"><ul><?php foreach ($nav_links as $link) : ?><li><a href="<?php echo esc_url(stroybrigada_layout_current_page_url((string) ($link['url'] ?? '#'))); ?>"><?php echo esc_html((string) ($link['label'] ?? '')); ?></a></li><?php endforeach; ?></ul></div>
					</div>
					<div class="footer__col">
						<div class="title-sm section-title section-title--sm fw700 white mb2"><?php echo esc_html((string) $footer['contacts_title']); ?></div>
						<div class="footer__text">
							<div><?php echo esc_html((string) $footer['address']); ?></div>
							<div class="mb2"><?php echo esc_html((string) $footer['schedule']); ?></div>
							<div class="title-sm section-title section-title--sm fw700"><a href="<?php echo esc_url((string) $footer['phone_url']); ?>"><?php echo esc_html((string) $footer['phone_label']); ?></a></div>
							<div class="title-sm section-title section-title--sm fw700"><a href="mailto:<?php echo esc_attr((string) $footer['email']); ?>"><?php echo esc_html((string) $footer['email']); ?></a></div>
						</div>
						<?php echo stroybrigada_render_header_footer_socials((array) $footer['socials'], 'footer__socials'); ?>
					</div>
				</div>
				<div class="footer__bottom">
					<div class="logo-block">
						<div class="footer__text"><p><?php echo esc_html((string) $footer['copyright']); ?></p></div>
						<?php if ('' !== trim((string) $footer['credit_url']) && '' !== trim((string) $footer['credit_text'])) : ?>
							<a class="site-footer-credit" href="<?php echo esc_url((string) $footer['credit_url']); ?>" target="_blank" rel="noopener noreferrer"><?php echo esc_html((string) $footer['credit_text']); ?></a>
						<?php endif; ?>
					</div>
				</div>
			</div>
		</div>
	</div>
</footer>
<?php stroybrigada_render_floating_widget_from_layout($footer); ?>
	<?php
	return (string) ob_get_clean();
}

function stroybrigada_render_floating_widget_from_layout(array $footer): void {
	$buttons = (array) ($footer['floating_buttons'] ?? []);
	?>
<div class="widget__bottom floating-widget">
	<div class="bottom_contacts floating-widget__contacts">
		<?php foreach ($buttons as $button_index => $button) : ?>
			<a href="<?php echo esc_url((string) ($button['url'] ?? '#')); ?>" class="contact-btn floating-widget__button" style="background-color:<?php echo esc_attr((string) ($button['color'] ?? '#549168')); ?>; color: white!important;"><span class="iconsmall floating-widget__icon"><?php echo stroybrigada_floating_widget_icon((int) $button_index); ?></span><?php echo wp_kses((string) ($button['label'] ?? ''), ['br' => []]); ?></a>
		<?php endforeach; ?>
		<div class="bottom__phone mobile">
			<a href="<?php echo esc_url((string) $footer['phone_url']); ?>" style="color: white;"><span class="iconsmall floating-widget__icon"><?php echo stroybrigada_floating_widget_icon(2); ?></span>Позвонить</a>
		</div>
	</div>
</div>
	<?php
}

function stroybrigada_floating_widget_icon(int $index): string {
	if (0 === $index) {
		return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path d="M38.9 0H9.1C7 0 5.3 1.7 5.3 3.7v40.5C5.3 46.3 7 48 9.1 48h29.8c2.1 0 3.7-1.7 3.7-3.7V3.7c.1-2-1.6-3.7-3.7-3.7zm1.8 44.3c0 1-.8 1.7-1.7 1.7H9.1c-1 0-1.7-.8-1.7-1.7V3.7c0-1 .8-1.7 1.7-1.7h29.8c1 0 1.7.8 1.7 1.7v40.6zM16.7 36.8h-6.4c-.6 0-1 .4-1 1V43c0 .6.4 1 1 1h6.4c.6 0 1-.4 1-1v-5.3c0-.5-.4-.9-1-.9zm20.8-9.3h-6.4c-.6 0-1 .4-1 1V43c0 .6.4 1 1 1h6.4c.6 0 1-.4 1-1V28.5c0-.6-.5-1-1-1zM37.7 4H10.3c-.6 0-1 .4-1 1v10.3c0 .6.4 1 1 1h27.3c.6 0 1-.4 1-1V5c.1-.6-.4-1-.9-1z" fill="#fff"/></svg>';
	}

	if (1 === $index) {
		return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 26.4"><path d="M21.5 23.7c-.2 0-.4-.1-.5-.2l-6-4.2-3.2 2.4c-.3.2-.6.2-.9.1-.3-.1-.5-.4-.6-.7l-1.6-6.3-5.8-2.3c-.4-.2-.6-.5-.6-.9 0-.4.2-.8.6-.9l22.1-9c.1 0 .2-.1.3-.1h.1c.2 0 .4.1.6.3.1.2.2.4.2.6v.3l-3.7 20c-.1.3-.3.6-.6.7-.2.1-.3.2-.4.2zM15.4 17.3l5.4 3.7 2.9-15.6-10.5 10.4 2.2 1.5zM5.7 11.6l4 1.6c.3.1.5.4.6.7l.5 2c0-.2.1-.4.3-.6l10-9.9-15.4 6.2z" fill="#fff"/></svg>';
	}

	return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 201.629 201.629"><path d="M139.321 201.629c-1.457 0-2.925-.14-4.387-.426-.04-.006-.08-.012-.12-.019-2.116-.364-52.265-9.341-89.971-47.047C14.447 123.742 4.194 84.726 1.17 69.123c-.564-1.856-.888-3.791-.962-5.757-.023-.219-.029-.438-.018-.656-.054-6.129 2.288-11.87 6.615-16.197l12.818-12.818c1.563-1.563 4.094-1.563 5.656 0l41.479 41.48c1.563 1.562 1.563 4.095 0 5.656L53.942 93.649c-5.987 5.316-7.148 14.626-2.694 21.65 4.279 6.747 9.12 12.838 14.387 18.105 6.239 6.238 13.642 11.89 22.001 16.795 6.837 4.012 15.627 2.726 21.379-3.127l12.957-12.957c1.563-1.563 4.094-1.563 5.656 0l41.479 41.479c1.563 1.562 1.563 4.095 0 5.656l-12.817 12.818c-4.292 4.293-10.036 6.626-15.977 6.626z" fill="#fff"/></svg>';
}

function stroybrigada_render_global_partial_from_layout(string $partial): string {
	$settings = stroybrigada_get_header_footer_settings();

	if ('header' === $partial) {
		return stroybrigada_render_global_header_from_layout($settings);
	}

	if ('footer' === $partial) {
		return stroybrigada_render_global_footer_from_layout($settings);
	}

	return '';
}


function stroybrigada_widget_option_name(string $position): string {
	return 'stroybrigada_global_widget_' . sanitize_key($position);
}

function stroybrigada_get_widget_code(string $position): string {
	$stored = get_option(stroybrigada_widget_option_name($position), '');
	return is_string($stored) ? $stored : '';
}

function stroybrigada_sanitize_widget_code(string $code): string {
	$code = wp_unslash($code);
	return current_user_can('unfiltered_html') ? $code : wp_kses_post($code);
}

function stroybrigada_print_widget_code(string $position): void {
	if (is_admin()) {
		return;
	}

	$code = trim(stroybrigada_get_widget_code($position));
	if ('' === $code) {
		return;
	}

	echo "\n" . $code . "\n";
}

function stroybrigada_print_head_widgets(): void {
	stroybrigada_print_widget_code('head');
}
add_action('wp_head', 'stroybrigada_print_head_widgets', 100);

function stroybrigada_print_body_widgets(): void {
	stroybrigada_print_widget_code('body');
}
add_action('wp_body_open', 'stroybrigada_print_body_widgets', 20);

function stroybrigada_print_footer_widgets(): void {
	stroybrigada_print_widget_code('footer');
}
add_action('wp_footer', 'stroybrigada_print_footer_widgets', 100);

function stroybrigada_register_header_footer_page(): void {
	add_menu_page(
		__('Шапка и подвал', 'stroybrigada'),
		__('Шапка и подвал', 'stroybrigada'),
		'manage_options',
		'stroybrigada-header-footer',
		'stroybrigada_render_header_footer_page',
		'dashicons-editor-table',
		23
	);
}
add_action('admin_menu', 'stroybrigada_register_header_footer_page');

function stroybrigada_register_widgets_page(): void {
	add_menu_page(
		__('Виджеты', 'stroybrigada'),
		__('Виджеты', 'stroybrigada'),
		'manage_options',
		'stroybrigada-widgets',
		'stroybrigada_render_widgets_page',
		'dashicons-editor-code',
		24
	);
}
add_action('admin_menu', 'stroybrigada_register_widgets_page');

function stroybrigada_header_footer_admin_assets(string $hook_suffix): void {
	if ('toplevel_page_stroybrigada-header-footer' !== $hook_suffix) {
		return;
	}

	wp_enqueue_media();
}
add_action('admin_enqueue_scripts', 'stroybrigada_header_footer_admin_assets');

function stroybrigada_render_header_footer_page(): void {
	if (! current_user_can('manage_options')) {
		wp_die(esc_html__('Недостаточно прав.', 'stroybrigada'));
	}

	$notice = '';
	if ('POST' === ($_SERVER['REQUEST_METHOD'] ?? '') && isset($_POST['stroybrigada_header_footer_nonce'])) {
		check_admin_referer('stroybrigada_header_footer', 'stroybrigada_header_footer_nonce');

		if (isset($_POST['stroybrigada_header_footer_reset'])) {
			delete_option('stroybrigada_header_footer_settings');
			delete_option(stroybrigada_global_partial_option_name('header'));
			delete_option(stroybrigada_global_partial_option_name('footer'));
			$notice = 'reset';
		} else {
			$raw = isset($_POST['stroybrigada_header_footer']) && is_array($_POST['stroybrigada_header_footer'])
				? (array) wp_unslash($_POST['stroybrigada_header_footer'])
				: [];
			update_option('stroybrigada_header_footer_settings', stroybrigada_sanitize_header_footer_settings($raw), false);
			delete_option(stroybrigada_global_partial_option_name('header'));
			delete_option(stroybrigada_global_partial_option_name('footer'));
			$notice = 'saved';
		}
	}

	$settings = stroybrigada_get_header_footer_settings();
	?>
	<div class="wrap stroybrigada-layout-admin">
		<style>
			.stroybrigada-layout-admin{max-width:1280px}
			.stroybrigada-layout-admin__nav{display:flex;flex-wrap:wrap;gap:10px;margin:12px 0 24px}
			.stroybrigada-layout-admin__nav a{display:inline-flex;align-items:center;gap:8px;padding:10px 14px;border:1px solid rgba(148,163,184,.35);border-radius:999px;background:#fff;color:#0f172a;text-decoration:none;box-shadow:0 8px 24px rgba(15,23,42,.06);font-weight:700}
			.stroybrigada-layout-panel{margin:20px 0;padding:20px 24px 24px;border:1px solid #dcdcde;border-radius:16px;background:#fff;box-shadow:0 8px 24px rgba(15,23,42,.05)}
			.stroybrigada-layout-panel legend{padding:0 10px;font-size:16px;font-weight:700}
			.stroybrigada-layout-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px 18px}
			.stroybrigada-layout-field{display:grid;gap:7px;min-width:0}
			.stroybrigada-layout-field--wide{grid-column:1/-1}
			.stroybrigada-layout-field span{font-size:13px;font-weight:700;color:#334155}
			.stroybrigada-layout-field input,.stroybrigada-layout-field textarea{width:100%;max-width:100%;box-sizing:border-box;border-radius:10px;border:1px solid #cbd5e1;padding:9px 12px;color:#0f172a}
			.stroybrigada-layout-field textarea{min-height:96px;resize:vertical}
			.stroybrigada-layout-repeat{display:grid;gap:12px}
			.stroybrigada-layout-repeat__grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
			.stroybrigada-layout-item{position:relative;display:grid;gap:12px;padding:16px;border:1px solid #e2e8f0;border-radius:16px;background:#f8fafc;box-sizing:border-box}
			.stroybrigada-layout-item__title{font-size:12px;font-weight:800;text-transform:uppercase;color:#475569}
			.stroybrigada-layout-item__remove{position:absolute;top:10px;right:10px;width:28px;height:28px;border:0;border-radius:999px;background:#ef4444;color:#fff;font-size:18px;font-weight:700;line-height:1;cursor:pointer}
			.stroybrigada-layout-add{min-height:96px;border:1px dashed #94a3b8;border-radius:16px;background:#fff;cursor:pointer;font-weight:800;color:#0f172a}
			.stroybrigada-layout-media{display:flex;gap:10px;align-items:center}
			.stroybrigada-layout-media input{flex:1 1 auto}
			.stroybrigada-layout-media img{width:44px;height:44px;object-fit:contain;border:1px solid #dcdcde;border-radius:8px;background:#fff}
			.stroybrigada-layout-actions{display:flex;flex-wrap:wrap;gap:10px;align-items:center}
			@media (max-width:1100px){.stroybrigada-layout-grid,.stroybrigada-layout-repeat__grid{grid-template-columns:1fr}}
		</style>
		<h1><?php esc_html_e('Шапка и подвал', 'stroybrigada'); ?></h1>
		<?php if ('saved' === $notice) : ?>
			<div class="notice notice-success is-dismissible"><p><?php esc_html_e('Шапка и подвал сохранены. Изменения применяются на всех страницах.', 'stroybrigada'); ?></p></div>
		<?php elseif ('reset' === $notice) : ?>
			<div class="notice notice-success is-dismissible"><p><?php esc_html_e('Шапка и подвал сброшены к дефолтам темы.', 'stroybrigada'); ?></p></div>
		<?php endif; ?>
		<div class="stroybrigada-layout-admin__nav">
			<a href="#stroybrigada-layout-header">Шапка</a>
			<a href="#stroybrigada-layout-menu">Меню</a>
			<a href="#stroybrigada-layout-footer">Подвал</a>
			<a href="#stroybrigada-layout-floating">Нижние кнопки</a>
		</div>

		<form method="post">
			<?php wp_nonce_field('stroybrigada_header_footer', 'stroybrigada_header_footer_nonce'); ?>
			<?php stroybrigada_render_header_footer_editor($settings); ?>
			<p class="submit stroybrigada-layout-actions">
				<button type="submit" class="button button-primary"><?php esc_html_e('Сохранить шапку и подвал', 'stroybrigada'); ?></button>
				<button type="submit" class="button" name="stroybrigada_header_footer_reset" value="1" onclick="return confirm('<?php echo esc_js(__('Сбросить шапку и подвал к дефолтам?', 'stroybrigada')); ?>');"><?php esc_html_e('Сбросить', 'stroybrigada'); ?></button>
			</p>
		</form>
	</div>
	<?php
}

function stroybrigada_layout_field(string $label, string $name, string $value, string $type = 'text', bool $wide = false): void {
	?>
	<label class="stroybrigada-layout-field<?php echo $wide ? ' stroybrigada-layout-field--wide' : ''; ?>">
		<span><?php echo esc_html($label); ?></span>
		<input type="<?php echo esc_attr($type); ?>" name="<?php echo esc_attr($name); ?>" value="<?php echo esc_attr($value); ?>">
	</label>
	<?php
}

function stroybrigada_layout_textarea(string $label, string $name, string $value, bool $wide = true): void {
	?>
	<label class="stroybrigada-layout-field<?php echo $wide ? ' stroybrigada-layout-field--wide' : ''; ?>">
		<span><?php echo esc_html($label); ?></span>
		<textarea name="<?php echo esc_attr($name); ?>"><?php echo esc_textarea($value); ?></textarea>
	</label>
	<?php
}

function stroybrigada_layout_media_preview_url(string $value): string {
	$value = trim($value);
	if ('' === $value) {
		return '';
	}

	if (str_starts_with($value, '/assets/')) {
		return STROYBRIGADA_ASSETS_URL . 'dist/' . ltrim(substr($value, strlen('/assets/')), '/');
	}

	return $value;
}

function stroybrigada_layout_media_field(string $label, string $name, string $value): void {
	$preview_url = stroybrigada_layout_media_preview_url($value);
	?>
	<label class="stroybrigada-layout-field stroybrigada-layout-field--wide">
		<span><?php echo esc_html($label); ?></span>
		<div class="stroybrigada-layout-media">
			<img src="<?php echo esc_url($preview_url); ?>" alt="" data-stroybrigada-layout-preview>
			<input type="url" name="<?php echo esc_attr($name); ?>" value="<?php echo esc_attr($value); ?>" data-stroybrigada-layout-media-input>
			<button type="button" class="button" data-stroybrigada-layout-media-button><?php esc_html_e('Выбрать файл', 'stroybrigada'); ?></button>
		</div>
	</label>
	<?php
}

function stroybrigada_layout_link_card(string $base_name, int $index, array $item, string $title, bool $with_icon = false, bool $with_color = false): void {
	?>
	<section class="stroybrigada-layout-item" data-stroybrigada-layout-item>
		<button type="button" class="stroybrigada-layout-item__remove" data-stroybrigada-layout-remove aria-label="<?php echo esc_attr__('Удалить', 'stroybrigada'); ?>">×</button>
		<div class="stroybrigada-layout-item__title"><?php echo esc_html($title . ' ' . ($index + 1)); ?></div>
		<?php stroybrigada_layout_field(__('Текст', 'stroybrigada'), $base_name . '[' . $index . '][label]', (string) ($item['label'] ?? ''), 'text', true); ?>
		<?php stroybrigada_layout_field(__('Ссылка', 'stroybrigada'), $base_name . '[' . $index . '][url]', (string) ($item['url'] ?? ''), 'text', true); ?>
		<?php if ($with_icon) : ?>
			<?php stroybrigada_layout_media_field(__('Иконка', 'stroybrigada'), $base_name . '[' . $index . '][icon]', (string) ($item['icon'] ?? '')); ?>
		<?php endif; ?>
		<?php if ($with_color) : ?>
			<?php stroybrigada_layout_field(__('Цвет кнопки', 'stroybrigada'), $base_name . '[' . $index . '][color]', (string) ($item['color'] ?? '#549168'), 'text', true); ?>
		<?php endif; ?>
	</section>
	<?php
}

function stroybrigada_layout_repeat(string $title, string $base_name, array $items, string $item_title, bool $with_icon = false, bool $with_color = false): void {
	?>
	<div class="stroybrigada-layout-repeat" data-stroybrigada-layout-repeat data-base-name="<?php echo esc_attr($base_name); ?>" data-item-title="<?php echo esc_attr($item_title); ?>" data-with-icon="<?php echo $with_icon ? '1' : '0'; ?>" data-with-color="<?php echo $with_color ? '1' : '0'; ?>">
		<h3><?php echo esc_html($title); ?></h3>
		<div class="stroybrigada-layout-repeat__grid" data-stroybrigada-layout-list>
			<?php foreach (array_values($items) as $index => $item) : ?>
				<?php stroybrigada_layout_link_card($base_name, (int) $index, is_array($item) ? $item : [], $item_title, $with_icon, $with_color); ?>
			<?php endforeach; ?>
			<button type="button" class="stroybrigada-layout-add" data-stroybrigada-layout-add>+ <?php echo esc_html($item_title); ?></button>
		</div>
	</div>
	<?php
}

function stroybrigada_render_header_footer_editor(array $settings): void {
	$header = (array) $settings['header'];
	$footer = (array) $settings['footer'];
	?>
	<fieldset class="stroybrigada-layout-panel" id="stroybrigada-layout-header">
		<legend><?php esc_html_e('Шапка', 'stroybrigada'); ?></legend>
		<div class="stroybrigada-layout-grid">
			<?php stroybrigada_layout_media_field(__('Логотип', 'stroybrigada'), 'stroybrigada_header_footer[header][logo_url]', (string) $header['logo_url']); ?>
			<?php stroybrigada_layout_field(__('Ссылка логотипа', 'stroybrigada'), 'stroybrigada_header_footer[header][logo_link]', (string) $header['logo_link']); ?>
			<?php stroybrigada_layout_field(__('Alt логотипа', 'stroybrigada'), 'stroybrigada_header_footer[header][logo_alt]', (string) $header['logo_alt']); ?>
			<?php stroybrigada_layout_field(__('Дескриптор', 'stroybrigada'), 'stroybrigada_header_footer[header][descriptor]', (string) $header['descriptor'], 'text', true); ?>
			<?php stroybrigada_layout_field(__('Статус над телефоном', 'stroybrigada'), 'stroybrigada_header_footer[header][status]', (string) $header['status']); ?>
			<?php stroybrigada_layout_field(__('Телефон текстом', 'stroybrigada'), 'stroybrigada_header_footer[header][phone_label]', (string) $header['phone_label']); ?>
			<?php stroybrigada_layout_field(__('Телефон ссылка', 'stroybrigada'), 'stroybrigada_header_footer[header][phone_url]', (string) $header['phone_url']); ?>
			<?php stroybrigada_layout_field(__('Текст кнопки', 'stroybrigada'), 'stroybrigada_header_footer[header][button_text]', (string) $header['button_text']); ?>
			<?php stroybrigada_layout_field(__('Ссылка кнопки', 'stroybrigada'), 'stroybrigada_header_footer[header][button_url]', (string) $header['button_url']); ?>
		</div>
		<?php stroybrigada_layout_repeat(__('Соцсети в шапке', 'stroybrigada'), 'stroybrigada_header_footer[header][socials]', (array) $header['socials'], __('Соцсеть', 'stroybrigada'), true); ?>
	</fieldset>

	<fieldset class="stroybrigada-layout-panel" id="stroybrigada-layout-menu">
		<legend><?php esc_html_e('Меню', 'stroybrigada'); ?></legend>
		<?php stroybrigada_layout_repeat(__('Верхнее меню', 'stroybrigada'), 'stroybrigada_header_footer[header][menu]', (array) $header['menu'], __('Пункт меню', 'stroybrigada')); ?>
		<p class="description"><?php esc_html_e('Подменю услуг ниже выводится внутри пункта "Наши услуги" и в колонке услуг подвала.', 'stroybrigada'); ?></p>
		<?php stroybrigada_layout_repeat(__('Подменю услуг', 'stroybrigada'), 'stroybrigada_header_footer[header][menu][1][children]', (array) ($header['menu'][1]['children'] ?? []), __('Услуга', 'stroybrigada')); ?>
	</fieldset>

	<fieldset class="stroybrigada-layout-panel" id="stroybrigada-layout-footer">
		<legend><?php esc_html_e('Подвал', 'stroybrigada'); ?></legend>
		<div class="stroybrigada-layout-grid">
			<?php stroybrigada_layout_field(__('Заголовок информации', 'stroybrigada'), 'stroybrigada_header_footer[footer][info_title]', (string) $footer['info_title']); ?>
			<?php stroybrigada_layout_field(__('Заголовок услуг', 'stroybrigada'), 'stroybrigada_header_footer[footer][services_title]', (string) $footer['services_title']); ?>
			<?php stroybrigada_layout_field(__('Заголовок навигации', 'stroybrigada'), 'stroybrigada_header_footer[footer][nav_title]', (string) $footer['nav_title']); ?>
			<?php stroybrigada_layout_field(__('Заголовок контактов', 'stroybrigada'), 'stroybrigada_header_footer[footer][contacts_title]', (string) $footer['contacts_title']); ?>
			<?php stroybrigada_layout_textarea(__('Текст информации', 'stroybrigada'), 'stroybrigada_header_footer[footer][info_text]', (string) $footer['info_text']); ?>
			<?php stroybrigada_layout_textarea(__('Юридическое описание', 'stroybrigada'), 'stroybrigada_header_footer[footer][notice_text]', (string) $footer['notice_text']); ?>
			<?php stroybrigada_layout_textarea(__('Текст про cookies', 'stroybrigada'), 'stroybrigada_header_footer[footer][cookie_text]', (string) $footer['cookie_text']); ?>
			<?php stroybrigada_layout_field(__('Адрес', 'stroybrigada'), 'stroybrigada_header_footer[footer][address]', (string) $footer['address']); ?>
			<?php stroybrigada_layout_field(__('Режим работы', 'stroybrigada'), 'stroybrigada_header_footer[footer][schedule]', (string) $footer['schedule']); ?>
			<?php stroybrigada_layout_field(__('Телефон текстом', 'stroybrigada'), 'stroybrigada_header_footer[footer][phone_label]', (string) $footer['phone_label']); ?>
			<?php stroybrigada_layout_field(__('Телефон ссылка', 'stroybrigada'), 'stroybrigada_header_footer[footer][phone_url]', (string) $footer['phone_url']); ?>
			<?php stroybrigada_layout_field(__('Email', 'stroybrigada'), 'stroybrigada_header_footer[footer][email]', (string) $footer['email'], 'email'); ?>
			<?php stroybrigada_layout_field(__('Копирайт', 'stroybrigada'), 'stroybrigada_header_footer[footer][copyright]', (string) $footer['copyright']); ?>
			<?php stroybrigada_layout_field(__('Credit текст', 'stroybrigada'), 'stroybrigada_header_footer[footer][credit_text]', (string) $footer['credit_text']); ?>
			<?php stroybrigada_layout_field(__('Credit ссылка', 'stroybrigada'), 'stroybrigada_header_footer[footer][credit_url]', (string) $footer['credit_url']); ?>
			<?php stroybrigada_layout_field(__('Popup города: заголовок', 'stroybrigada'), 'stroybrigada_header_footer[footer][city_popup_title]', (string) $footer['city_popup_title']); ?>
			<?php stroybrigada_layout_field(__('Popup города: заголовок списка', 'stroybrigada'), 'stroybrigada_header_footer[footer][city_list_title]', (string) $footer['city_list_title']); ?>
			<?php stroybrigada_layout_field(__('Popup города: заголовок если города нет', 'stroybrigada'), 'stroybrigada_header_footer[footer][city_empty_title]', (string) $footer['city_empty_title']); ?>
			<?php stroybrigada_layout_field(__('Popup города: текст если города нет', 'stroybrigada'), 'stroybrigada_header_footer[footer][city_empty_text]', (string) $footer['city_empty_text']); ?>
			<?php stroybrigada_layout_field(__('Popup города: ссылка продолжения', 'stroybrigada'), 'stroybrigada_header_footer[footer][city_continue]', (string) $footer['city_continue']); ?>
		</div>
		<?php stroybrigada_layout_repeat(__('Юридические ссылки', 'stroybrigada'), 'stroybrigada_header_footer[footer][legal_links]', (array) $footer['legal_links'], __('Ссылка', 'stroybrigada')); ?>
		<?php stroybrigada_layout_repeat(__('Соцсети в подвале', 'stroybrigada'), 'stroybrigada_header_footer[footer][socials]', (array) $footer['socials'], __('Соцсеть', 'stroybrigada'), true); ?>
	</fieldset>

	<fieldset class="stroybrigada-layout-panel" id="stroybrigada-layout-floating">
		<legend><?php esc_html_e('Нижние кнопки', 'stroybrigada'); ?></legend>
		<?php stroybrigada_layout_repeat(__('Плавающие кнопки', 'stroybrigada'), 'stroybrigada_header_footer[footer][floating_buttons]', (array) $footer['floating_buttons'], __('Кнопка', 'stroybrigada'), false, true); ?>
	</fieldset>
	<script>
	(function(){
		var assetBase=<?php echo wp_json_encode(STROYBRIGADA_ASSETS_URL . 'dist/'); ?>;
		function previewUrl(value){
			value=String(value||'').trim();
			if(value.indexOf('/assets/')===0){return assetBase+value.slice('/assets/'.length);}
			return value;
		}
		function replaceIndex(name,index){return String(name).replace(/\[\d+\](?!.*\[\d+\])/, '[' + index + ']');}
		function syncRepeat(repeat){
			var cards=Array.from(repeat.querySelectorAll('[data-stroybrigada-layout-item]'));
			cards.forEach(function(card,index){
				var title=card.querySelector('.stroybrigada-layout-item__title');
				if(title){title.textContent=(repeat.dataset.itemTitle||'Элемент')+' '+(index+1);}
				card.querySelectorAll('input[name],textarea[name]').forEach(function(input){input.name=replaceIndex(input.name,index);});
			});
			var add=repeat.querySelector('[data-stroybrigada-layout-add]');
			if(add){repeat.querySelector('[data-stroybrigada-layout-list]').appendChild(add);}
		}
		function cardHtml(repeat,index){
			var base=repeat.dataset.baseName||'';
			var title=repeat.dataset.itemTitle||'Элемент';
			var withIcon=repeat.dataset.withIcon==='1';
			var withColor=repeat.dataset.withColor==='1';
			return '<section class="stroybrigada-layout-item" data-stroybrigada-layout-item><button type="button" class="stroybrigada-layout-item__remove" data-stroybrigada-layout-remove aria-label="Удалить">×</button><div class="stroybrigada-layout-item__title">'+title+' '+(index+1)+'</div><label class="stroybrigada-layout-field stroybrigada-layout-field--wide"><span>Текст</span><input type="text" name="'+base+'['+index+'][label]" value=""></label><label class="stroybrigada-layout-field stroybrigada-layout-field--wide"><span>Ссылка</span><input type="text" name="'+base+'['+index+'][url]" value=""></label>'+(withIcon?'<label class="stroybrigada-layout-field stroybrigada-layout-field--wide"><span>Иконка</span><div class="stroybrigada-layout-media"><img src="" alt="" data-stroybrigada-layout-preview><input type="url" name="'+base+'['+index+'][icon]" value="" data-stroybrigada-layout-media-input><button type="button" class="button" data-stroybrigada-layout-media-button>Выбрать файл</button></div></label>':'')+(withColor?'<label class="stroybrigada-layout-field stroybrigada-layout-field--wide"><span>Цвет кнопки</span><input type="text" name="'+base+'['+index+'][color]" value="#549168"></label>':'')+'</section>';
		}
		document.addEventListener('click',function(event){
			var add=event.target.closest('[data-stroybrigada-layout-add]');
			if(add){
				event.preventDefault();
				var repeat=add.closest('[data-stroybrigada-layout-repeat]');
				var list=repeat&&repeat.querySelector('[data-stroybrigada-layout-list]');
				if(!repeat||!list){return;}
				var index=repeat.querySelectorAll('[data-stroybrigada-layout-item]').length;
				var wrap=document.createElement('div');
				wrap.innerHTML=cardHtml(repeat,index);
				list.insertBefore(wrap.firstElementChild,add);
				syncRepeat(repeat);
				return;
			}
			var remove=event.target.closest('[data-stroybrigada-layout-remove]');
			if(remove){
				event.preventDefault();
				var repeat=remove.closest('[data-stroybrigada-layout-repeat]');
				remove.closest('[data-stroybrigada-layout-item]').remove();
				if(repeat){syncRepeat(repeat);}
				return;
			}
			var media=event.target.closest('[data-stroybrigada-layout-media-button]');
			if(media && window.wp && wp.media){
				event.preventDefault();
				var row=media.closest('.stroybrigada-layout-media');
				var input=row&&row.querySelector('[data-stroybrigada-layout-media-input]');
				var preview=row&&row.querySelector('[data-stroybrigada-layout-preview]');
				var frame=wp.media({title:'Выберите файл',button:{text:'Использовать'},multiple:false});
				frame.on('select',function(){
					var attachment=frame.state().get('selection').first().toJSON();
					if(!attachment||!attachment.url||!input){return;}
					input.value=attachment.url;
					if(preview){preview.src=attachment.url;}
				});
				frame.open();
			}
		});
		document.addEventListener('input',function(event){
			var input=event.target.closest('[data-stroybrigada-layout-media-input]');
			if(!input){return;}
			var preview=input.closest('.stroybrigada-layout-media').querySelector('[data-stroybrigada-layout-preview]');
			if(preview){preview.src=previewUrl(input.value);}
		});
	})();
	</script>
	<?php
}

function stroybrigada_render_widgets_page(): void {
	if (! current_user_can('manage_options')) {
		wp_die(esc_html__('Недостаточно прав.', 'stroybrigada'));
	}

	$positions = [
		'head'   => [
			'title'       => __('Код в head', 'stroybrigada'),
			'description' => __('Метрика, пиксели, верификации и другой код, который должен быть внутри <head>.', 'stroybrigada'),
		],
		'body'   => [
			'title'       => __('Код после открытия body', 'stroybrigada'),
			'description' => __('Код, который должен стоять сразу после открытия <body>, например noscript-часть счетчиков.', 'stroybrigada'),
		],
		'footer' => [
			'title'       => __('Код перед закрытием body', 'stroybrigada'),
			'description' => __('Коллтрекинг, чаты, виджеты и скрипты, которые можно подключать внизу страницы.', 'stroybrigada'),
		],
	];

	$notice = '';
	if ('POST' === ($_SERVER['REQUEST_METHOD'] ?? '') && isset($_POST['stroybrigada_widgets_nonce'])) {
		check_admin_referer('stroybrigada_widgets', 'stroybrigada_widgets_nonce');

		if (isset($_POST['stroybrigada_widgets_reset'])) {
			foreach (array_keys($positions) as $position) {
				delete_option(stroybrigada_widget_option_name($position));
			}
			$notice = 'reset';
		} else {
			foreach (array_keys($positions) as $position) {
				$field = 'stroybrigada_widget_' . $position;
				$code  = isset($_POST[$field]) ? stroybrigada_sanitize_widget_code((string) $_POST[$field]) : '';
				update_option(stroybrigada_widget_option_name($position), $code, false);
			}
			$notice = 'saved';
		}
	}

	?>
	<div class="wrap stroybrigada-widgets-admin">
		<style>
			.stroybrigada-widgets-admin__grid{display:grid;grid-template-columns:1fr;gap:22px;max-width:1280px}
			.stroybrigada-widgets-admin__card{padding:18px;border:1px solid #dcdcde;border-radius:12px;background:#fff;box-shadow:0 8px 24px rgba(15,23,42,.05)}
			.stroybrigada-widgets-admin__card h2{margin:0 0 12px}
			.stroybrigada-widgets-admin textarea{width:100%;min-height:260px;box-sizing:border-box;font-family:Consolas,Monaco,monospace;font-size:13px;line-height:1.45}
			.stroybrigada-widgets-admin__actions{display:flex;flex-wrap:wrap;gap:10px;align-items:center}
		</style>
		<h1><?php esc_html_e('Виджеты', 'stroybrigada'); ?></h1>
		<?php if ('saved' === $notice) : ?>
			<div class="notice notice-success is-dismissible"><p><?php esc_html_e('Код виджетов сохранен. Изменения применяются на всех страницах.', 'stroybrigada'); ?></p></div>
		<?php elseif ('reset' === $notice) : ?>
			<div class="notice notice-success is-dismissible"><p><?php esc_html_e('Код виджетов очищен.', 'stroybrigada'); ?></p></div>
		<?php endif; ?>
		<p><?php esc_html_e('Здесь добавляется общий код метрики, коллтрекинга, чатов и других внешних виджетов для всего сайта.', 'stroybrigada'); ?></p>

		<form method="post">
			<?php wp_nonce_field('stroybrigada_widgets', 'stroybrigada_widgets_nonce'); ?>
			<div class="stroybrigada-widgets-admin__grid">
				<?php foreach ($positions as $position => $position_data) : ?>
					<section class="stroybrigada-widgets-admin__card">
						<h2><?php echo esc_html($position_data['title']); ?></h2>
						<textarea name="<?php echo esc_attr('stroybrigada_widget_' . $position); ?>" spellcheck="false"><?php echo esc_textarea(stroybrigada_get_widget_code($position)); ?></textarea>
						<p class="description"><?php echo esc_html($position_data['description']); ?></p>
					</section>
				<?php endforeach; ?>
			</div>
			<p class="submit stroybrigada-widgets-admin__actions">
				<button type="submit" class="button button-primary"><?php esc_html_e('Сохранить виджеты', 'stroybrigada'); ?></button>
				<button type="submit" class="button" name="stroybrigada_widgets_reset" value="1" onclick="return confirm('<?php echo esc_js(__('Очистить весь код виджетов?', 'stroybrigada')); ?>');"><?php esc_html_e('Очистить', 'stroybrigada'); ?></button>
			</p>
		</form>
	</div>
	<?php
}

function stroybrigada_register_leads_page(): void {
	add_menu_page(
		__('Заявки', 'stroybrigada'),
		__('Заявки', 'stroybrigada'),
		'manage_options',
		'stroybrigada-leads',
		'stroybrigada_render_leads_page',
		'dashicons-email-alt2',
		26
	);

	add_submenu_page(
		'stroybrigada-leads',
		__('Настройки заявок', 'stroybrigada'),
		__('Настройки', 'stroybrigada'),
		'manage_options',
		'stroybrigada-lead-settings',
		'stroybrigada_render_lead_settings_page'
	);
}
add_action('admin_menu', 'stroybrigada_register_leads_page');

function stroybrigada_render_theme_page(): void {
	?>
	<div class="wrap">
		<h1><?php esc_html_e('Stroybrigada: установка и импорт', 'stroybrigada'); ?></h1>
		<p><?php esc_html_e('Тема активирована. Следующие шаги: установить ACF Pro, заполнить настройки сайта, запустить импорт стартовых данных и проверить формы.', 'stroybrigada'); ?></p>
		<p><code>README-INSTALL.md</code></p>
	</div>
	<?php
}

function stroybrigada_lead_source_groups(): array {
	return [
		'home'           => __('Главная', 'stroybrigada'),
		'vosstanovlenie' => __('Восстановление домов', 'stroybrigada'),
		'otmostki'       => __('Отмостки', 'stroybrigada'),
		'fundament'      => __('Фундамент', 'stroybrigada'),
		'krovlya'        => __('Кровля', 'stroybrigada'),
		'stroitelstvo'   => __('Строительство домов', 'stroybrigada'),
		'pristroyki'     => __('Пристройки', 'stroybrigada'),
		'uteplenie'      => __('Утепление', 'stroybrigada'),
		'fasad'          => __('Фасад', 'stroybrigada'),
		'other'          => __('Другое', 'stroybrigada'),
	];
}

function stroybrigada_detect_lead_source_group($lead): string {
	$page_url   = (string) ($lead->page_url ?? '');
	$page_title = (string) ($lead->page_title ?? '');
	$source_id  = (string) ($lead->source_id ?? '');
	$service    = (string) ($lead->service ?? '');
	$form_id    = (string) ($lead->form_id ?? '');
	$haystack   = trim($page_url . ' ' . $page_title . ' ' . $source_id . ' ' . $service . ' ' . $form_id);
	$haystack   = function_exists('mb_strtolower') ? mb_strtolower($haystack) : strtolower($haystack);
	$path       = (string) wp_parse_url($page_url, PHP_URL_PATH);

	if ('' === trim($path, '/') || '/' === $path) {
		return 'home';
	}

	if (str_contains($haystack, 'vostanovlenie') || str_contains($haystack, 'vosstanovlenie') || str_contains($haystack, 'stroitelstvo-sten-derevyannyh') || str_contains($haystack, 'восстанов')) {
		return 'vosstanovlenie';
	}
	if (str_contains($haystack, 'otmost') || str_contains($haystack, 'отмост') || str_contains($haystack, 'bruschat')) {
		return 'otmostki';
	}
	if (str_contains($haystack, 'fundament') || str_contains($haystack, 'фундамент')) {
		return 'fundament';
	}
	if (str_contains($haystack, 'krovl') || str_contains($haystack, 'кров')) {
		return 'krovlya';
	}
	if (str_contains($haystack, 'stroitelstvo-chastnyh') || str_contains($haystack, 'строительств')) {
		return 'stroitelstvo';
	}
	if (str_contains($haystack, 'pristro') || str_contains($haystack, 'пристрой') || str_contains($haystack, 'веранд') || str_contains($haystack, 'бесед')) {
		return 'pristroyki';
	}
	if (str_contains($haystack, 'utepl') || str_contains($haystack, 'утепл')) {
		return 'uteplenie';
	}
	if (str_contains($haystack, 'fasad') || str_contains($haystack, 'фасад') || str_contains($haystack, 'otdelka') || str_contains($haystack, 'отдел')) {
		return 'fasad';
	}

	return 'other';
}

function stroybrigada_detect_lead_type($lead): string {
	$form_id   = function_exists('mb_strtolower') ? mb_strtolower((string) ($lead->form_id ?? '')) : strtolower((string) ($lead->form_id ?? ''));
	$quiz_data = trim((string) ($lead->quiz_data ?? ''));

	return str_contains($form_id, 'квиз') || str_contains($form_id, 'quiz') || ('' !== $quiz_data && '[]' !== $quiz_data) ? 'quiz' : 'contact';
}

function stroybrigada_decode_lead_json($value): array {
	if (is_array($value)) {
		return $value;
	}

	$decoded = json_decode((string) $value, true);
	return is_array($decoded) ? $decoded : [];
}

function stroybrigada_render_lead_quiz_answers(array $answers): void {
	if (! $answers) {
		return;
	}
	?>
	<details class="stroybrigada-leads-crm__block">
		<summary><span class="stroybrigada-leads-crm__summary-arrow" aria-hidden="true">▸</span><span><?php esc_html_e('Ответы квиза', 'stroybrigada'); ?></span></summary>
		<ul class="stroybrigada-leads-crm__answers">
			<?php foreach ($answers as $answer) : ?>
				<?php
				$question = (string) ($answer['question'] ?? $answer['title'] ?? '');
				$value    = $answer['answer'] ?? $answer['answers'] ?? '';
				$value    = is_array($value) ? implode(', ', array_map('strval', $value)) : (string) $value;
				?>
				<?php if ('' !== trim($question . $value)) : ?>
					<li><strong><?php echo esc_html($question); ?>:</strong> <?php echo esc_html($value); ?></li>
				<?php endif; ?>
			<?php endforeach; ?>
		</ul>
	</details>
	<?php
}

function stroybrigada_handle_lead_delete_action(): void {
	if (! is_admin() || ! current_user_can('manage_options')) {
		return;
	}

	if (($_GET['page'] ?? '') !== 'stroybrigada-leads' || ! isset($_GET['delete_lead'], $_GET['_wpnonce'])) {
		return;
	}

	$delete_id = absint($_GET['delete_lead']);
	if (! $delete_id || ! wp_verify_nonce(sanitize_text_field(wp_unslash((string) $_GET['_wpnonce'])), 'stroybrigada_delete_lead_' . $delete_id)) {
		wp_safe_redirect(add_query_arg('lead_notice', 'delete_failed', admin_url('admin.php?page=stroybrigada-leads')));
		exit;
	}

	global $wpdb;
	$wpdb->delete(stroybrigada_leads_table_name(), ['id' => $delete_id], ['%d']);

	$redirect_url = wp_get_referer();
	if (! is_string($redirect_url) || '' === $redirect_url) {
		$redirect_url = admin_url('admin.php?page=stroybrigada-leads');
	}

	$redirect_url = remove_query_arg(['delete_lead', '_wpnonce'], $redirect_url);
	$redirect_url = add_query_arg('lead_notice', 'deleted', $redirect_url);
	wp_safe_redirect($redirect_url);
	exit;
}
add_action('admin_init', 'stroybrigada_handle_lead_delete_action');

function stroybrigada_render_leads_page(): void {
	if (! current_user_can('manage_options')) {
		wp_die(esc_html__('Недостаточно прав.', 'stroybrigada'));
	}

	global $wpdb;
	$table = stroybrigada_leads_table_name();

	$lead_type = isset($_GET['lead_type']) ? sanitize_key((string) wp_unslash($_GET['lead_type'])) : '';
	if (! in_array($lead_type, ['', 'quiz', 'contact'], true)) {
		$lead_type = '';
	}

	$items = $wpdb->get_results("SELECT id, created_at, name, phone, email, message, form_id, source_id, service, page_id, page_title, page_url, quiz_data, file_url, utm_data, status, email_status, telegram_status, max_status FROM {$table} ORDER BY id DESC LIMIT 200"); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
	$items = is_array($items) ? $items : [];
	$columns = array_fill_keys(array_keys(stroybrigada_lead_source_groups()), []);

	foreach ($items as $item) {
		$type = stroybrigada_detect_lead_type($item);
		if ('' !== $lead_type && $lead_type !== $type) {
			continue;
		}

		$group = stroybrigada_detect_lead_source_group($item);
		if (! isset($columns[$group])) {
			$group = 'other';
		}
		$columns[$group][] = $item;
	}

	$shown_count = array_sum(array_map('count', $columns));
	$all_count = count($items);
	$base_url = admin_url('admin.php?page=stroybrigada-leads');
	?>
	<div class="wrap stroybrigada-leads-crm">
		<h1><?php esc_html_e('Заявки', 'stroybrigada'); ?></h1>
		<?php if (isset($_GET['lead_notice']) && 'deleted' === sanitize_key((string) wp_unslash($_GET['lead_notice']))) : ?>
			<div class="notice notice-success is-dismissible"><p><?php esc_html_e('Заявка удалена.', 'stroybrigada'); ?></p></div>
		<?php elseif (isset($_GET['lead_notice']) && 'delete_failed' === sanitize_key((string) wp_unslash($_GET['lead_notice']))) : ?>
			<div class="notice notice-error is-dismissible"><p><?php esc_html_e('Не удалось удалить заявку. Обновите страницу и попробуйте еще раз.', 'stroybrigada'); ?></p></div>
		<?php endif; ?>
		<p><?php esc_html_e('Карточки заявок разложены по страницам и направлениям.', 'stroybrigada'); ?></p>

		<div class="stroybrigada-leads-crm__toolbar">
			<div class="stroybrigada-leads-crm__filters">
				<a class="button<?php echo '' === $lead_type ? ' button-primary' : ''; ?>" href="<?php echo esc_url($base_url); ?>"><?php echo esc_html(sprintf(__('Все %d', 'stroybrigada'), $all_count)); ?></a>
				<a class="button<?php echo 'quiz' === $lead_type ? ' button-primary' : ''; ?>" href="<?php echo esc_url(add_query_arg('lead_type', 'quiz', $base_url)); ?>"><?php esc_html_e('Квиз', 'stroybrigada'); ?></a>
				<a class="button<?php echo 'contact' === $lead_type ? ' button-primary' : ''; ?>" href="<?php echo esc_url(add_query_arg('lead_type', 'contact', $base_url)); ?>"><?php esc_html_e('Контактные', 'stroybrigada'); ?></a>
			</div>
			<span class="description"><?php echo esc_html(sprintf(__('Показано %1$d из последних %2$d', 'stroybrigada'), $shown_count, $all_count)); ?></span>
		</div>

		<?php if ($shown_count > 0) : ?>
			<div class="stroybrigada-leads-crm__board">
				<?php foreach (stroybrigada_lead_source_groups() as $group => $label) : ?>
					<?php $group_items = $columns[$group] ?? []; ?>
					<section class="stroybrigada-leads-crm__lane">
						<header class="stroybrigada-leads-crm__lane-header">
							<h2><?php echo esc_html($label); ?></h2>
							<span><?php echo esc_html((string) count($group_items)); ?></span>
						</header>
						<div class="stroybrigada-leads-crm__lane-cards">
							<?php foreach ($group_items as $item) : ?>
								<?php
								$type = stroybrigada_detect_lead_type($item);
								$type_label = 'quiz' === $type ? __('Квиз', 'stroybrigada') : __('Контактная', 'stroybrigada');
								$page_title = trim((string) ($item->page_title ?? ''));
								$page_url = trim((string) ($item->page_url ?? ''));
								$quiz_answers = stroybrigada_decode_lead_json($item->quiz_data ?? '');
								$utm = stroybrigada_decode_lead_json($item->utm_data ?? '');
								$delete_url = wp_nonce_url(add_query_arg('delete_lead', (int) $item->id, $base_url), 'stroybrigada_delete_lead_' . (int) $item->id);
								?>
								<article class="stroybrigada-leads-crm__card">
									<header class="stroybrigada-leads-crm__card-header">
										<div>
											<span class="stroybrigada-leads-crm__badge"><?php echo esc_html($type_label); ?></span>
											<h3><?php echo esc_html((string) ($item->form_id ?: __('Заявка с сайта', 'stroybrigada'))); ?></h3>
										</div>
										<time><?php echo esc_html(mysql2date('d.m.Y H:i', (string) $item->created_at)); ?></time>
									</header>
									<div class="stroybrigada-leads-crm__facts">
										<div><strong><?php esc_html_e('Имя', 'stroybrigada'); ?></strong><span><?php echo esc_html((string) ($item->name ?: '—')); ?></span></div>
										<div><strong><?php esc_html_e('Телефон', 'stroybrigada'); ?></strong><span><?php echo esc_html((string) ($item->phone ?: '—')); ?></span></div>
										<?php if ('' !== (string) ($item->email ?? '')) : ?>
											<div><strong>Email</strong><span><?php echo esc_html((string) $item->email); ?></span></div>
										<?php endif; ?>
										<div>
											<strong><?php esc_html_e('Страница', 'stroybrigada'); ?></strong>
											<span>
												<?php if ('' !== $page_url) : ?>
													<a href="<?php echo esc_url($page_url); ?>" target="_blank" rel="noopener noreferrer"><?php echo esc_html($page_title ?: wp_trim_words($page_url, 7)); ?></a>
												<?php else : ?>
													<?php echo esc_html($page_title ?: '—'); ?>
												<?php endif; ?>
											</span>
										</div>
									</div>

									<?php if ('' !== trim((string) ($item->message ?? ''))) : ?>
										<div class="stroybrigada-leads-crm__message"><?php echo esc_html(wp_trim_words(wp_strip_all_tags((string) $item->message), 26)); ?></div>
									<?php endif; ?>

									<?php stroybrigada_render_lead_quiz_answers($quiz_answers); ?>

									<?php if ($utm || '' !== (string) ($item->file_url ?? '')) : ?>
										<details class="stroybrigada-leads-crm__block">
											<summary><span class="stroybrigada-leads-crm__summary-arrow" aria-hidden="true">▸</span><span><?php esc_html_e('Дополнительно', 'stroybrigada'); ?></span></summary>
											<pre><?php echo esc_html(wp_json_encode(['utm' => $utm, 'file' => (string) ($item->file_url ?? ''), 'source_id' => (string) ($item->source_id ?? ''), 'service' => (string) ($item->service ?? ''), 'status' => (string) ($item->status ?? ''), 'email' => (string) ($item->email_status ?? ''), 'telegram' => (string) ($item->telegram_status ?? ''), 'max' => (string) ($item->max_status ?? '')], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT)); ?></pre>
										</details>
									<?php endif; ?>

									<footer class="stroybrigada-leads-crm__card-footer">
										<a class="stroybrigada-leads-crm__action stroybrigada-leads-crm__action--danger" href="<?php echo esc_url($delete_url); ?>" onclick="return confirm('Удалить заявку?');"><?php esc_html_e('Удалить', 'stroybrigada'); ?></a>
									</footer>
								</article>
							<?php endforeach; ?>
						</div>
					</section>
				<?php endforeach; ?>
			</div>
		<?php else : ?>
			<div class="notice notice-info inline"><p><?php esc_html_e('Заявок пока нет.', 'stroybrigada'); ?></p></div>
		<?php endif; ?>

		<style>
			.stroybrigada-leads-crm__toolbar{display:flex;justify-content:space-between;gap:16px;align-items:center;margin:18px 0 20px}
			.stroybrigada-leads-crm__filters{display:flex;flex-wrap:wrap;gap:8px}
			.stroybrigada-leads-crm__board{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:16px;align-items:start}
			.stroybrigada-leads-crm__lane{min-width:0;padding:12px;border:1px solid #dcdcde;border-radius:14px;background:#f8fafc}
			.stroybrigada-leads-crm__lane-header{display:flex;justify-content:space-between;align-items:center;gap:10px;margin:0 0 12px}
			.stroybrigada-leads-crm__lane-header h2{margin:0;font-size:15px;line-height:1.25}
			.stroybrigada-leads-crm__lane-header span{display:inline-grid;place-items:center;min-width:26px;height:26px;padding:0 8px;border-radius:999px;background:#0f172a;color:#fff;font-size:12px;font-weight:700}
			.stroybrigada-leads-crm__lane-cards{display:grid;gap:12px}
			.stroybrigada-leads-crm__card{display:grid;gap:12px;padding:14px;border:1px solid #e2e8f0;border-radius:12px;background:#fff;box-shadow:0 8px 24px rgba(15,23,42,.05)}
			.stroybrigada-leads-crm__card-header{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}
			.stroybrigada-leads-crm__card-header h3{margin:7px 0 0;font-size:14px;line-height:1.25}
			.stroybrigada-leads-crm__card-header time{color:#64748b;font-size:11px;white-space:nowrap}
			.stroybrigada-leads-crm__badge{display:inline-flex;padding:4px 8px;border-radius:999px;background:#e0f2fe;color:#075985;font-size:11px;font-weight:700}
			.stroybrigada-leads-crm__facts{display:grid;gap:8px}
			.stroybrigada-leads-crm__facts div{display:grid;gap:3px;padding:9px 10px;border-radius:8px;background:#f8fafc}
			.stroybrigada-leads-crm__facts strong{color:#64748b;font-size:11px;text-transform:uppercase}
			.stroybrigada-leads-crm__facts span{color:#0f172a;font-size:13px;font-weight:600;word-break:break-word}
			.stroybrigada-leads-crm__message{padding-top:10px;border-top:1px solid #e2e8f0;color:#334155}
			.stroybrigada-leads-crm__block{padding-top:10px;border-top:1px solid #e2e8f0}
			.stroybrigada-leads-crm__block summary{display:flex;gap:8px;align-items:center;cursor:pointer;font-weight:700}
			.stroybrigada-leads-crm__block[open] .stroybrigada-leads-crm__summary-arrow{transform:rotate(90deg)}
			.stroybrigada-leads-crm__answers{margin:10px 0 0;padding-left:18px;display:grid;gap:6px}
			.stroybrigada-leads-crm__block pre{margin:10px 0 0;padding:10px;border-radius:8px;background:#0f172a;color:#e2e8f0;white-space:pre-wrap;word-break:break-word;font-size:12px}
			.stroybrigada-leads-crm__card-footer{display:flex;justify-content:flex-end}
			.stroybrigada-leads-crm__action{display:inline-flex;align-items:center;min-height:30px;padding:0 10px;border:1px solid #cbd5e1;border-radius:999px;background:#fff;text-decoration:none;font-size:12px;font-weight:700}
			.stroybrigada-leads-crm__action--danger{color:#b91c1c;border-color:rgba(185,28,28,.24)}
			@media(max-width:782px){.stroybrigada-leads-crm__toolbar{align-items:flex-start;flex-direction:column}.stroybrigada-leads-crm__board{grid-template-columns:1fr}}
		</style>
	</div>
	<?php
}

function stroybrigada_render_lead_settings_page(): void {
	if (! current_user_can('manage_options')) {
		wp_die(esc_html__('Недостаточно прав.', 'stroybrigada'));
	}

	$settings = stroybrigada_get_lead_delivery_settings();

	if ('POST' === ($_SERVER['REQUEST_METHOD'] ?? '') && isset($_POST['stroybrigada_lead_settings_nonce'])) {
		check_admin_referer('stroybrigada_lead_settings', 'stroybrigada_lead_settings_nonce');

		$raw = isset($_POST['stroybrigada_lead_settings']) && is_array($_POST['stroybrigada_lead_settings'])
			? (array) wp_unslash($_POST['stroybrigada_lead_settings'])
			: [];

		update_option('stroybrigada_lead_delivery_settings', stroybrigada_sanitize_lead_delivery_settings($raw), false);
		$settings = stroybrigada_get_lead_delivery_settings();

		echo '<div class="notice notice-success is-dismissible"><p>' . esc_html__('Настройки заявок сохранены.', 'stroybrigada') . '</p></div>';
	}
	if (! empty($settings['max_enabled']) && ! stroybrigada_is_lead_max_enabled()) {
		echo '<div class="notice notice-warning"><p>Отправка в MAX включена, но для неё нужны токен бота и числовой Chat ID. Пока они не заданы, заявки в MAX не отправляются.</p></div>';
	}
	?>
	<div class="wrap">
		<h1><?php esc_html_e('Настройки заявок', 'stroybrigada'); ?></h1>
		<p><?php esc_html_e('Здесь настраиваются email, SMTP и Telegram для заявок с сайта.', 'stroybrigada'); ?></p>

		<form method="post">
			<?php wp_nonce_field('stroybrigada_lead_settings', 'stroybrigada_lead_settings_nonce'); ?>

			<h2><?php esc_html_e('Получатели', 'stroybrigada'); ?></h2>
			<table class="form-table" role="presentation">
				<tr>
					<th scope="row"><label for="stroybrigada-lead-emails"><?php esc_html_e('Email-адреса', 'stroybrigada'); ?></label></th>
					<td>
						<textarea class="large-text code" id="stroybrigada-lead-emails" name="stroybrigada_lead_settings[emails]" rows="6" spellcheck="false" placeholder="lead1@example.com&#10;lead2@example.com"><?php echo esc_textarea((string) $settings['emails']); ?></textarea>
						<p class="description"><?php esc_html_e('Можно указывать по одному адресу в строке, через запятую или точку с запятой. Если пусто, используется email из настроек сайта, затем admin_email.', 'stroybrigada'); ?></p>
					</td>
				</tr>
			</table>

			<h2><?php esc_html_e('Отправитель', 'stroybrigada'); ?></h2>
			<table class="form-table" role="presentation">
				<tr>
					<th scope="row"><label for="stroybrigada-lead-from-email"><?php esc_html_e('Email отправителя', 'stroybrigada'); ?></label></th>
					<td><input class="regular-text" type="email" id="stroybrigada-lead-from-email" name="stroybrigada_lead_settings[from_email]" value="<?php echo esc_attr((string) $settings['from_email']); ?>" placeholder="noreply@example.com"></td>
				</tr>
				<tr>
					<th scope="row"><label for="stroybrigada-lead-from-name"><?php esc_html_e('Имя отправителя', 'stroybrigada'); ?></label></th>
					<td><input class="regular-text" type="text" id="stroybrigada-lead-from-name" name="stroybrigada_lead_settings[from_name]" value="<?php echo esc_attr((string) $settings['from_name']); ?>" placeholder="<?php echo esc_attr(get_bloginfo('name')); ?>"></td>
				</tr>
				<tr>
					<th scope="row"><label for="stroybrigada-lead-reply-to"><?php esc_html_e('Reply-To', 'stroybrigada'); ?></label></th>
					<td><input class="regular-text" type="email" id="stroybrigada-lead-reply-to" name="stroybrigada_lead_settings[reply_to]" value="<?php echo esc_attr((string) $settings['reply_to']); ?>" placeholder="sales@example.com"></td>
				</tr>
			</table>

			<h2><?php esc_html_e('SMTP', 'stroybrigada'); ?></h2>
			<table class="form-table" role="presentation">
				<tr>
					<th scope="row"><?php esc_html_e('Использовать SMTP', 'stroybrigada'); ?></th>
					<td>
						<label>
							<input type="checkbox" name="stroybrigada_lead_settings[smtp_enabled]" value="1" <?php checked(! empty($settings['smtp_enabled'])); ?>>
							<?php esc_html_e('Отправлять заявки через SMTP', 'stroybrigada'); ?>
						</label>
					</td>
				</tr>
				<tr>
					<th scope="row"><label for="stroybrigada-lead-smtp-host"><?php esc_html_e('SMTP host', 'stroybrigada'); ?></label></th>
					<td><input class="regular-text" type="text" id="stroybrigada-lead-smtp-host" name="stroybrigada_lead_settings[smtp_host]" value="<?php echo esc_attr((string) $settings['smtp_host']); ?>" placeholder="smtp.example.com"></td>
				</tr>
				<tr>
					<th scope="row"><label for="stroybrigada-lead-smtp-port"><?php esc_html_e('SMTP port', 'stroybrigada'); ?></label></th>
					<td><input class="small-text" type="number" min="1" max="65535" id="stroybrigada-lead-smtp-port" name="stroybrigada_lead_settings[smtp_port]" value="<?php echo esc_attr((string) $settings['smtp_port']); ?>" placeholder="587"></td>
				</tr>
				<tr>
					<th scope="row"><label for="stroybrigada-lead-smtp-encryption"><?php esc_html_e('Шифрование', 'stroybrigada'); ?></label></th>
					<td>
						<select id="stroybrigada-lead-smtp-encryption" name="stroybrigada_lead_settings[smtp_encryption]">
							<option value="" <?php selected((string) $settings['smtp_encryption'], ''); ?>><?php esc_html_e('Без шифрования', 'stroybrigada'); ?></option>
							<option value="tls" <?php selected((string) $settings['smtp_encryption'], 'tls'); ?>>TLS</option>
							<option value="ssl" <?php selected((string) $settings['smtp_encryption'], 'ssl'); ?>>SSL</option>
						</select>
					</td>
				</tr>
				<tr>
					<th scope="row"><label for="stroybrigada-lead-smtp-username"><?php esc_html_e('SMTP login', 'stroybrigada'); ?></label></th>
					<td><input class="regular-text" type="text" id="stroybrigada-lead-smtp-username" name="stroybrigada_lead_settings[smtp_username]" value="<?php echo esc_attr((string) $settings['smtp_username']); ?>" placeholder="info@example.com"></td>
				</tr>
				<tr>
					<th scope="row"><label for="stroybrigada-lead-smtp-password"><?php esc_html_e('SMTP password', 'stroybrigada'); ?></label></th>
					<td>
						<input class="regular-text" type="password" id="stroybrigada-lead-smtp-password" name="stroybrigada_lead_settings[smtp_password]" value="<?php echo esc_attr((string) $settings['smtp_password']); ?>" autocomplete="new-password">
						<p class="description"><?php esc_html_e('Пароль сохраняется в базе WordPress. Для production безопаснее вынести его в wp-config.php отдельной доработкой.', 'stroybrigada'); ?></p>
					</td>
				</tr>
			</table>

			<h2><?php esc_html_e('Telegram', 'stroybrigada'); ?></h2>
			<table class="form-table" role="presentation">
				<tr>
					<th scope="row"><?php esc_html_e('Включить Telegram', 'stroybrigada'); ?></th>
					<td>
						<label>
							<input type="checkbox" name="stroybrigada_lead_settings[telegram_enabled]" value="1" <?php checked(! empty($settings['telegram_enabled'])); ?>>
							<?php esc_html_e('Отправлять заявки в Telegram', 'stroybrigada'); ?>
						</label>
					</td>
				</tr>
				<tr>
					<th scope="row"><label for="stroybrigada-telegram-token"><?php esc_html_e('Bot token', 'stroybrigada'); ?></label></th>
					<td><input class="regular-text" type="password" id="stroybrigada-telegram-token" name="stroybrigada_lead_settings[telegram_bot_token]" value="<?php echo esc_attr((string) $settings['telegram_bot_token']); ?>" autocomplete="new-password"></td>
				</tr>
				<tr>
					<th scope="row"><label for="stroybrigada-telegram-chat"><?php esc_html_e('Chat ID', 'stroybrigada'); ?></label></th>
					<td><input class="regular-text" type="text" id="stroybrigada-telegram-chat" name="stroybrigada_lead_settings[telegram_chat_id]" value="<?php echo esc_attr((string) $settings['telegram_chat_id']); ?>" placeholder="-1001234567890"></td>
				</tr>
				<tr>
					<th scope="row"><label for="stroybrigada-telegram-parse-mode"><?php esc_html_e('Parse mode', 'stroybrigada'); ?></label></th>
					<td>
						<select id="stroybrigada-telegram-parse-mode" name="stroybrigada_lead_settings[telegram_parse_mode]">
							<option value="" <?php selected((string) $settings['telegram_parse_mode'], ''); ?>><?php esc_html_e('Обычный текст', 'stroybrigada'); ?></option>
							<option value="HTML" <?php selected((string) $settings['telegram_parse_mode'], 'HTML'); ?>>HTML</option>
							<option value="MarkdownV2" <?php selected((string) $settings['telegram_parse_mode'], 'MarkdownV2'); ?>>MarkdownV2</option>
						</select>
					</td>
				</tr>
			</table>

			<h2>MAX</h2>
			<table class="form-table" role="presentation">
				<tr>
					<th scope="row">Включить MAX</th>
					<td><label><input type="checkbox" name="stroybrigada_lead_settings[max_enabled]" value="1" <?php checked(! empty($settings['max_enabled'])); ?>> Отправлять заявки в MAX</label></td>
				</tr>
				<tr>
					<th scope="row"><label for="stroybrigada-max-token">Токен бота</label></th>
					<td>
						<input class="regular-text" type="password" id="stroybrigada-max-token" name="stroybrigada_lead_settings[max_bot_token]" value="" autocomplete="new-password" placeholder="<?php echo esc_attr('' !== (string) $settings['max_bot_token'] ? 'Токен сохранён' : 'Введите токен'); ?>">
						<p class="description">Оставьте поле пустым, чтобы сохранить текущий токен. Можно задать STROYBRIGADA_MAX_BOT_TOKEN в wp-config.php.</p>
					</td>
				</tr>
				<tr>
					<th scope="row"><label for="stroybrigada-max-chat">Chat ID</label></th>
					<td><input class="regular-text" type="text" inputmode="numeric" id="stroybrigada-max-chat" name="stroybrigada_lead_settings[max_chat_id]" value="<?php echo esc_attr((string) $settings['max_chat_id']); ?>" placeholder="Числовой ID чата"><p class="description">Бот должен быть добавлен в чат «Заявки Стройбригада 365». Можно задать STROYBRIGADA_MAX_CHAT_ID в wp-config.php.</p></td>
				</tr>
			</table>

			<?php submit_button(__('Сохранить настройки заявок', 'stroybrigada')); ?>
		</form>
	</div>
	<?php
}
