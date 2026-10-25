<?php
/**
 * Helper functions.
 *
 * @package Stroybrigada
 */

declare(strict_types=1);

if (! defined('ABSPATH')) {
	exit;
}

function stroybrigada_default_metric_goal_for_post(int $post_id): string {
	if ($post_id > 0 && (int) get_option('page_on_front') === $post_id) {
		return 'form_submit_main';
	}

	$slug = $post_id > 0 ? (string) get_post_field('post_name', $post_id) : '';
	$goals = [
		'home'                                               => 'form_submit_main',
		'stroitelstvo-chastnyh-domov-kottedzhey-ban'        => 'form_submit_stroitelstvo',
		'stroitelstvo-rekonstrukciya-domov'                 => 'form_submit_stroitelstvo',
		'montazh-krovli-i-stropil'                          => 'form_submit_krovlya',
		'krovelnye-raboty'                                  => 'form_submit_krovlya',
		'ustroystvo-fundamentov-otmostok-parkovok'          => 'form_submit_fundament',
		'stroitelstvo-fundamenta'                           => 'form_submit_fundament',
		'otdelochnye-raboty-ustroystvo-styazhek-i-polov'    => 'form_submit_uteplenie',
		'uteplenie-doma'                                    => 'form_submit_uteplenie',
		'otmostki'                                          => 'form_submit_otmostki',
		'ustrojstvo-otmostki-vokrug-doma'                   => 'form_submit_otmostki',
		'ukladka-bruschatki'                                => 'form_submit_otmostki',
		'stroitelstvo-pristroek'                            => 'form_submit_pristroyki',
		'pristroyki'                                        => 'form_submit_pristroyki',
		'stroitelstvo-sten-derevyannyh-karkasnyh-kamennyh' => 'form_submit_vosstanovlenie',
		'vostanovlenie-staryh-domov-i-dach'                 => 'form_submit_vosstanovlenie',
		'stroitelstvo-zdaniy-i-otdelka'                     => 'form_submit_otdelka',
		'fasadnye-raboty'                                   => 'form_submit_otdelka',
	];

	return (string) ($goals[$slug] ?? 'form_submit');
}

function stroybrigada_metric_goal_for_post(int $post_id): string {
	$goal = $post_id > 0 ? (string) get_post_meta($post_id, '_stroybrigada_metric_goal', true) : '';
	return '' !== $goal ? $goal : stroybrigada_default_metric_goal_for_post($post_id);
}

function stroybrigada_array_get(array $data, string $key, $default = null) {
	return array_key_exists($key, $data) ? $data[ $key ] : $default;
}

function stroybrigada_secure_internal_url(string $url): string {
	$url = trim($url);
	$site_host = (string) wp_parse_url(home_url('/'), PHP_URL_HOST);
	$url_host = (string) wp_parse_url($url, PHP_URL_HOST);
	if (str_starts_with(strtolower($url), 'http://') && '' !== $site_host && 0 === strcasecmp($site_host, $url_host)) {
		return set_url_scheme($url, 'https');
	}
	return $url;
}

function stroybrigada_has_acf(): bool {
	return function_exists('get_field');
}

function stroybrigada_get_field(string $field_name, $post_id = false, $default = null) {
	if (! stroybrigada_has_acf()) {
		$target_id = false === $post_id ? get_the_ID() : $post_id;
		$value     = 'option' === $target_id ? get_option('options_' . $field_name, null) : get_post_meta((int) $target_id, $field_name, true);
		return null === $value || '' === $value ? $default : $value;
	}

	$value = get_field($field_name, $post_id);

	return null === $value || '' === $value ? $default : $value;
}

function stroybrigada_get_option_field(string $field_name, $default = null) {
	return stroybrigada_get_field($field_name, 'option', $default);
}

function stroybrigada_update_field(string $field_name, $value, $post_id = false): bool {
	if (function_exists('update_field')) {
		return (bool) update_field($field_name, $value, $post_id);
	}

	$target_id = false === $post_id ? get_the_ID() : $post_id;
	if ('option' === $target_id) {
		return (bool) update_option('options_' . $field_name, $value);
	}

	return (bool) update_post_meta((int) $target_id, $field_name, $value);
}

function stroybrigada_sections_meta_key(int $post_id): string {
	return '_stroybrigada_sections_page_' . $post_id;
}

function stroybrigada_section_identity(array $section): string {
	$key = trim((string) ($section['key'] ?? ''));
	if ('' !== $key) {
		return 'key:' . $key;
	}

	$label = trim((string) ($section['label'] ?? ''));
	if ('' !== $label) {
		return 'label:' . $label;
	}

	return '';
}

function stroybrigada_section_merge_kind(array $section): string {
	$key   = strtolower((string) ($section['key'] ?? ''));
	$label = strtolower((string) ($section['label'] ?? ''));
	$html  = strtolower((string) ($section['html'] ?? ''));
	$name  = trim($key . ' ' . $label);

	if (preg_match('/\b(hero|form__bottom|form_bottom|form-callback__form_h)\b/i', $name) || str_contains($html, 'site-section--hero') || str_contains($html, 'hero-section')) {
		return 'hero';
	}

	if (preg_match('/\b(video|video-section)\b/i', $name) || str_contains($html, 'data-video-grid') || str_contains($html, 'video-section') || str_contains($html, '<video')) {
		return 'video';
	}

	if (preg_match('/\b(quiz|quiz-section|testform)\b/i', $name) || str_contains($html, 'step-slide') || str_contains($html, 'data-quiz')) {
		return 'quiz';
	}

	if (preg_match('/\b(faq|accordion)\b/i', $name) || str_contains($html, 'faq-section') || str_contains($html, 'accordion')) {
		return 'faq';
	}

	if (preg_match('/\b(prices?|price-list|cost)\b/i', $name) || str_contains($html, 'id="price"') || str_contains($html, "id='price'") || str_contains($html, 'prices__') || str_contains($html, 'price-section')) {
		return 'price';
	}

	if (preg_match('/\b(reviews?|testimonials?)\b/i', $name) || preg_match('/\b(class|id)\s*=\s*(["\'])(?=[^"\']*\b(testimonials-section|review-card|reviews-slider)\b)[^"\']*\2/i', $html)) {
		return 'reviews';
	}

	if (preg_match('/\b(services?|uslugi)\b/i', $name) || str_contains($html, 'site-section--services') || str_contains($html, 'services__item_link')) {
		return 'services';
	}

	if (preg_match('/\b(cases?|gallery|works|projects?|portfolio)\b/i', $name) || str_contains($html, 'works-section') || str_contains($html, 'data-cases') || str_contains($html, 'data-gallery')) {
		return 'cases';
	}

	return 'content';
}

function stroybrigada_service_page_id_from_url(string $url): int {
	$path = (string) wp_parse_url($url, PHP_URL_PATH);
	if ('' === $path) {
		return 0;
	}
	$post_id = url_to_postid(home_url('/' . ltrim($path, '/')));
	if ($post_id > 0) {
		return $post_id;
	}
	$page = get_page_by_path(trim($path, '/'), OBJECT, ['service', 'page']);
	return $page instanceof WP_Post ? (int) $page->ID : 0;
}

function stroybrigada_normalize_service_image_url(string $url): string {
	$url = trim($url, " \t\n\r\0\x0B\"'");
	if (str_starts_with($url, '../uploads/')) {
		return '/assets/uploads/' . ltrim(substr($url, 11), '/');
	}
	if (str_starts_with($url, 'uploads/')) {
		return '/assets/' . ltrim($url, '/');
	}
	return $url;
}

function stroybrigada_service_hero_data(int $post_id): array {
	$hero_html = '';
	foreach (stroybrigada_get_page_sections($post_id) as $section) {
		if (is_array($section) && 'hero' === stroybrigada_section_merge_kind($section)) {
			$hero_html = (string) ($section['html'] ?? '');
			break;
		}
	}
	if ('' === $hero_html) {
		return ['description' => '', 'image' => ''];
	}

	$image = '';
	$class_match = [];
	if (preg_match('/<[^>]+class=(["\'])([^"\']*\bhero-section\b[^"\']*)\1[^>]*>/i', $hero_html, $hero_tag_match)) {
		preg_match('/\bclass=(["\'])([^"\']*)\1/i', (string) $hero_tag_match[0], $class_match);
		if (preg_match('/\bstyle=(["\'])(.*?)\1/is', (string) $hero_tag_match[0], $style_match) && preg_match_all('/url\(\s*(["\']?)(.*?)\1\s*\)/i', (string) $style_match[2], $inline_urls) && ! empty($inline_urls[2])) {
			$image = stroybrigada_normalize_service_image_url(html_entity_decode(trim((string) end($inline_urls[2])), ENT_QUOTES | ENT_HTML5, 'UTF-8'));
		}
	}
	if ('' === $image && ! empty($class_match[2])) {
		$css_path = get_theme_file_path('/assets/dist/css/main.css');
		$css = is_readable($css_path) ? (string) file_get_contents($css_path) : '';
		$classes = preg_split('/\s+/', trim((string) $class_match[2])) ?: [];
		$specific_classes = array_values(array_filter($classes, static fn(string $class_name): bool => str_starts_with($class_name, 'hero-section--') && 'hero-section--banner' !== $class_name));
		foreach (array_merge($specific_classes, ['hero-section']) as $class_name) {
			if ('' !== $class_name && preg_match('/\.' . preg_quote($class_name, '/') . '\b[^\{]*\{[^\}]*background(?:-image)?\s*:\s*(.*?);/is', $css, $css_match) && preg_match_all('/url\(\s*(["\']?)(.*?)\1\s*\)/i', (string) $css_match[1], $css_urls) && ! empty($css_urls[2])) {
				$image = stroybrigada_normalize_service_image_url(html_entity_decode(trim((string) end($css_urls[2])), ENT_QUOTES | ENT_HTML5, 'UTF-8'));
				break;
			}
		}
	}

	$description = '';
	$after_h1 = preg_split('/<\/h1\s*>/i', $hero_html, 2);
	$descriptor_html = (string) ($after_h1[1] ?? '');
	$patterns = [
		'/<([a-z0-9]+)\b[^>]*class=(["\'])(?=[^"\']*\b(?:hero[^"\']*(?:subtitle|descriptor|description|text)|subtitle|descriptor)\b)[^"\']*\2[^>]*>(.*?)<\/\1>/is',
		'/<(?:p|div)\b[^>]*>(.*?)<\/(?:p|div)>/is',
	];
	foreach ($patterns as $pattern) {
		if (preg_match($pattern, $descriptor_html, $description_match)) {
			$candidate = trim(preg_replace('/\s+/u', ' ', wp_strip_all_tags((string) end($description_match))) ?? '');
			if ('' !== $candidate) {
				$description = $candidate;
				break;
			}
		}
	}
	return ['description' => $description, 'image' => $image];
}

function stroybrigada_get_menu_service_cards(): array {
	if (! function_exists('stroybrigada_get_header_footer_settings')) {
		return [];
	}
	$settings = stroybrigada_get_header_footer_settings();
	$items = (array) ($settings['header']['menu'][1]['children'] ?? []);
	$cards = [];
	foreach ($items as $item) {
		$title = trim((string) ($item['label'] ?? ''));
		$url = trim((string) ($item['url'] ?? ''));
		if ('' === $title || '' === $url) {
			continue;
		}
		$post_id = stroybrigada_service_page_id_from_url($url);
		$hero = $post_id > 0 ? stroybrigada_service_hero_data($post_id) : ['description' => '', 'image' => ''];
		$cards[] = ['title' => $title, 'url' => $url, 'description' => (string) $hero['description'], 'image' => (string) $hero['image'], 'post_id' => $post_id];
	}
	return $cards;
}

function stroybrigada_find_balanced_div(string $html, int $offset, string $open_tag): string {
	$depth = 1;
	if (! preg_match_all('/<div\b[^>]*>|<\/div>/i', $html, $tags, PREG_OFFSET_CAPTURE, $offset + strlen($open_tag))) {
		return '';
	}
	foreach ($tags[0] as $tag) {
		$depth += str_starts_with(strtolower((string) $tag[0]), '</div') ? -1 : 1;
		if (0 === $depth) {
			return substr($html, $offset, ((int) $tag[1] + strlen((string) $tag[0])) - $offset);
		}
	}
	return '';
}

function stroybrigada_service_card_blocks(string $html): array {
	$blocks = [];
	if (! preg_match_all('/<div\b[^>]*class=(["\'])(?=[^"\']*\bcol-(?:sm|md|lg|xl)-)[^"\']*\1[^>]*>/i', $html, $matches, PREG_OFFSET_CAPTURE)) {
		return [];
	}
	foreach ($matches[0] as $match) {
		$block = stroybrigada_find_balanced_div($html, (int) $match[1], (string) $match[0]);
		if (str_contains($block, 'services__item_link')) {
			$blocks[] = $block;
		}
	}
	return array_values(array_unique($blocks));
}

function stroybrigada_replace_services_section_html(string $html): string {
	$existing = stroybrigada_service_card_blocks($html);
	if (! $existing) {
		return $html;
	}
	$cards_html = [];
	foreach (stroybrigada_get_menu_service_cards() as $card) {
		$cards_html[] = sprintf(
			'<div class="col-lg-3 col-md-4 col-sm-6 mb2"><a class="services__item_link" href="%1$s"><div class="services__item"><div class="services__image"><img class="lazyload" src="data:image/gif;base64,R0lGODlhAQABAID/AP///wAAACwAAAAAAQABAAACAkQBADs=" data-src="%2$s" alt="%3$s"></div><div class="services__content"><div class="services__top"><div class="services__title tac"><span>%3$s</span></div><div class="services__desc tac"><span>%4$s</span></div></div></div></div></a></div>',
			esc_url((string) $card['url']), esc_url((string) $card['image']), esc_html((string) $card['title']), esc_html((string) $card['description'])
		);
	}
	$first_pos = strpos($html, $existing[0]);
	$last = $existing[count($existing) - 1];
	$last_pos = strrpos($html, $last);
	if (false === $first_pos || false === $last_pos) {
		return $html;
	}
	return substr_replace($html, implode("\n", $cards_html), $first_pos, ($last_pos + strlen($last)) - $first_pos);
}

function stroybrigada_replace_home_service_seo_html(string $html): string {
	$cards = array_values(array_filter(
		stroybrigada_get_menu_service_cards(),
		static fn(array $card): bool => (int) ($card['post_id'] ?? 0) > 0
	));
	if (! $cards) {
		return $html;
	}

	$blocks = [];
	foreach ($cards as $card) {
		$title       = trim((string) ($card['title'] ?? ''));
		$url         = trim((string) ($card['url'] ?? ''));
		$description = trim((string) ($card['description'] ?? ''));
		if ('' === $title || '' === $url) {
			continue;
		}

		$block = '<div class="stroybrigada-home-service-seo__item">';
		$block .= '<h2><a href="' . esc_url($url) . '">' . esc_html($title) . '</a></h2>';
		if ('' !== $description) {
			$block .= '<p>' . esc_html($description) . '</p>';
		}
		$block .= '</div>';
		$blocks[] = $block;
	}

	if (! $blocks) {
		return $html;
	}

	$pattern = '/<h2\b[^>]*>\s*Строительство домов под ключ\s*<\/h2>.*?(?=<h2\b[^>]*>\s*Контроль работ прорабом\s*<\/h2>)/isu';
	if (! preg_match($pattern, $html)) {
		return $html;
	}

	return preg_replace(
		$pattern,
		'<div class="stroybrigada-home-service-seo">' . implode("\n", $blocks) . '</div>',
		$html,
		1
	) ?? $html;
}

function stroybrigada_is_sitemap_page(int $post_id): bool {
	if ($post_id <= 0 || 'page' !== get_post_type($post_id)) {
		return false;
	}

	$source_id = (string) get_post_meta($post_id, '_stroybrigada_source_id', true);
	$slug = (string) get_post_field('post_name', $post_id);
	return 'stroybrigada_sitemap' === $source_id || 'sitemap' === $slug;
}

function stroybrigada_dynamic_sitemap_list_html(): string {
	$excluded_ids = [];
	if (function_exists('stroybrigada_get_404_page_id')) {
		$not_found_page_id = stroybrigada_get_404_page_id();
		if ($not_found_page_id > 0) {
			$excluded_ids[] = $not_found_page_id;
		}
	}

	$list_items = wp_list_pages(
		[
			'echo'        => 0,
			'title_li'    => '',
			'sort_column' => 'menu_order,post_title',
			'sort_order'  => 'ASC',
			'post_status' => 'publish',
			'exclude'     => implode(',', $excluded_ids),
		]
	);

	return '<ul class="stroybrigada-sitemap-list">' . (string) $list_items . '</ul>';
}

function stroybrigada_replace_sitemap_list_html(string $html): string {
	$dynamic_list = stroybrigada_dynamic_sitemap_list_html();
	if (preg_match('/<ul\b[^>]*>.*?<\/ul>/is', $html)) {
		return preg_replace('/<ul\b[^>]*>.*?<\/ul>/is', $dynamic_list, $html, 1) ?? $html;
	}

	if (preg_match('/<\/h1\s*>/i', $html)) {
		return preg_replace('/<\/h1\s*>/i', '$0' . $dynamic_list, $html, 1) ?? $html;
	}

	return $html . $dynamic_list;
}

function stroybrigada_section_html_has_foreign_sections(array $section, array $default_section): bool {
	$html = (string) ($section['html'] ?? '');
	if ('' === $html) {
		return false;
	}

	$kind = stroybrigada_section_merge_kind($default_section);
	if ('quiz' === $kind) {
		return preg_match('/<section\b[^>]*\bid\s*=\s*(["\'])(services|price|works|video|reviews|faq|cities)\1/i', $html) === 1;
	}

	return false;
}

function stroybrigada_trim_quiz_html_before_foreign_sections(string $html): string {
	if ('' === $html || ! preg_match('/<section\b[^>]*\bid\s*=\s*(["\'])quiz-section\1/i', $html)) {
		return $html;
	}

	if (! preg_match('/<section\b[^>]*\bid\s*=\s*(["\'])(services|price|works|video|reviews|faq|cities)\1[^>]*>/i', $html, $match, PREG_OFFSET_CAPTURE)) {
		return $html;
	}

	$position = (int) $match[0][1];
	if ($position <= 0) {
		return $html;
	}

	return stroybrigada_balance_imported_section_fragment(substr($html, 0, $position));
}

function stroybrigada_normalize_page_section(array $section): array {
	$html = (string) ($section['html'] ?? '');
	$html = str_replace(
		[
			'http://stroybrigada-365.store/wp-content/uploads/2026/07/07-image-1191.jpg',
			'https://stroybrigada-365.store/wp-content/uploads/2026/07/07-image-1191.jpg',
			'stroybrigada365.ru',
			'[email оператора]',
			'[адрес оператора]',
		],
		[
			'/assets/uploads/2026/07/07-image-1191.jpg',
			'/assets/uploads/2026/07/07-image-1191.jpg',
			'stroybrigada-365.ru',
			'Stroybrigada-365@mail.ru',
			'Силикатная ул., 35, Мытищи',
		],
		$html
	);
	if ('' !== $html && 'quiz' === stroybrigada_section_merge_kind($section)) {
		$section['html'] = stroybrigada_balance_imported_section_fragment(stroybrigada_trim_quiz_html_before_foreign_sections($html));
	} elseif ('' !== $html && 'faq' === stroybrigada_section_merge_kind($section)) {
		$section['html'] = stroybrigada_normalize_imported_faq_html($html);
	} elseif ('' !== $html) {
		$section['html'] = stroybrigada_normalize_imported_callback_html($html);
	}

	return $section;
}

function stroybrigada_normalize_page_sections(array $sections): array {
	foreach ($sections as $section_index => $section) {
		if (is_array($section)) {
			$sections[$section_index] = stroybrigada_normalize_page_section($section);
		}
	}

	return $sections;
}

function stroybrigada_merge_page_sections_with_defaults(array $sections, array $defaults): array {
	if (! $defaults) {
		return stroybrigada_normalize_page_sections($sections);
	}

	$sections_by_identity = [];
	foreach ($sections as $section_index => $section) {
		if (! is_array($section)) {
			continue;
		}

		$identity = stroybrigada_section_identity($section);
		if ('' !== $identity) {
			$sections_by_identity[$identity][] = [
				'index'   => (int) $section_index,
				'kind'    => stroybrigada_section_merge_kind($section),
				'section' => $section,
			];
		}
	}

	$merged = [];
	$used_section_indexes = [];
	$default_identities = [];
	foreach ($defaults as $default_section) {
		if (! is_array($default_section)) {
			continue;
		}

		$identity = stroybrigada_section_identity($default_section);
		if ('' !== $identity) {
			$default_identities[$identity] = true;
		}

		if ('' !== $identity && isset($sections_by_identity[$identity])) {
			$default_kind = stroybrigada_section_merge_kind($default_section);
			foreach ($sections_by_identity[$identity] as $saved) {
				if (isset($used_section_indexes[(int) $saved['index']]) || $default_kind !== (string) $saved['kind']) {
					continue;
				}

				$section = $saved['section'];
				if (is_array($section) && ! array_key_exists('visible', $section) && array_key_exists('visible', $default_section)) {
					$section['visible'] = $default_section['visible'];
				}
				if (is_array($section) && stroybrigada_section_is_visible($default_section) && ! stroybrigada_section_is_visible($section)) {
					$section['visible'] = true;
				}
				$merged[] = stroybrigada_normalize_page_section($section);
				$used_section_indexes[(int) $saved['index']] = true;
				continue 2;
			}
		}

		$merged[] = stroybrigada_normalize_page_section($default_section);
	}

	foreach ($sections as $section_index => $section) {
		if (! is_array($section)) {
			continue;
		}

		$identity = stroybrigada_section_identity($section);
		if (isset($used_section_indexes[(int) $section_index])) {
			continue;
		}

		if ('' === $identity || ! isset($default_identities[$identity])) {
			$merged[] = stroybrigada_normalize_page_section($section);
		}
	}

	return $merged;
}

function stroybrigada_get_import_default_sections_for_post(int $post_id): array {
	static $pages_by_slug = null;

	if ($post_id <= 0) {
		return [];
	}

	if (null === $pages_by_slug) {
		$pages_by_slug = [];
		$data_path = STROYBRIGADA_THEME_PATH . 'data/content.json';
		if (is_readable($data_path)) {
			$data = json_decode((string) file_get_contents($data_path), true);
			foreach ((array) ($data['pages'] ?? []) as $page) {
				if (! is_array($page) || empty($page['slug']) || empty($page['sections']) || ! is_array($page['sections'])) {
					continue;
				}

				$pages_by_slug[(string) $page['slug']] = (array) $page['sections'];
			}
		}
	}

	$slug = (string) get_post_field('post_name', $post_id);
	if ((int) get_option('page_on_front') === $post_id && isset($pages_by_slug['home'])) {
		$slug = 'home';
	}

	return (array) ($pages_by_slug[$slug] ?? []);
}

function stroybrigada_section_is_visible(array $section): bool {
	if (! array_key_exists('visible', $section)) {
		return true;
	}

	$visible = $section['visible'];
	if (is_bool($visible)) {
		return $visible;
	}

	if (is_numeric($visible)) {
		return (int) $visible !== 0;
	}

	$value = strtolower(trim((string) $visible));
	return ! in_array($value, ['', '0', 'false', 'no', 'off'], true);
}

function stroybrigada_get_page_sections(int $post_id, array $default = []): array {
	if ($post_id <= 0) {
		return $default;
	}

	$legacy = stroybrigada_get_field('stroybrigada_sections', $post_id, $default);
	$legacy = is_array($legacy) ? $legacy : $default;
	$import_defaults = stroybrigada_get_import_default_sections_for_post($post_id);
	$fallback = stroybrigada_merge_page_sections_with_defaults($legacy, $import_defaults);

	$meta_key = stroybrigada_sections_meta_key($post_id);
	if (metadata_exists('post', $post_id, $meta_key)) {
		$sections = get_post_meta($post_id, $meta_key, true);
		return is_array($sections) ? stroybrigada_merge_page_sections_with_defaults($sections, $fallback) : stroybrigada_normalize_page_sections($fallback);
	}

	// Older duplicates may contain the source page's ID-based sections key.
	// Recover those sections and migrate them to the correct key for this page.
	foreach (get_post_meta($post_id) as $stored_key => $values) {
		if ($stored_key === $meta_key || ! preg_match('/^_stroybrigada_sections_page_\d+$/', (string) $stored_key)) {
			continue;
		}

		$sections = isset($values[0]) ? maybe_unserialize($values[0]) : [];
		if (! is_array($sections) || empty($sections)) {
			continue;
		}

		$sections = stroybrigada_merge_page_sections_with_defaults($sections, $fallback);
		update_post_meta($post_id, $meta_key, $sections);
		return $sections;
	}

	return stroybrigada_normalize_page_sections($fallback);
}

function stroybrigada_update_page_sections(int $post_id, array $sections, bool $edited = false): bool {
	if ($post_id <= 0) {
		return false;
	}

	$result = false !== update_post_meta($post_id, stroybrigada_sections_meta_key($post_id), stroybrigada_normalize_page_sections($sections));
	if ($edited) {
		update_post_meta($post_id, '_stroybrigada_sections_edited', 1);
	}

	return $result;
}

function stroybrigada_page_sections_were_edited(int $post_id): bool {
	return metadata_exists('post', $post_id, '_stroybrigada_sections_edited')
		|| metadata_exists('post', $post_id, '_stroybrigada_page_editor_sections_snapshot');
}

function stroybrigada_is_admin_request(): bool {
	return is_admin() || wp_doing_ajax() || wp_doing_cron();
}

function stroybrigada_manifest_path(): string {
	return STROYBRIGADA_ASSETS_PATH . 'dist/manifest.json';
}

function stroybrigada_get_asset_manifest(): array {
	static $manifest = null;

	if (null !== $manifest) {
		return $manifest;
	}

	$manifest = [];
	$path     = stroybrigada_manifest_path();

	if (! is_readable($path)) {
		return $manifest;
	}

	$contents = file_get_contents($path);
	if (! is_string($contents) || '' === $contents) {
		return $manifest;
	}

	$decoded = json_decode($contents, true);
	if (is_array($decoded)) {
		$manifest = $decoded;
	}

	return $manifest;
}

function stroybrigada_get_asset_url(string $entry, string $fallback = ''): string {
	$manifest = stroybrigada_get_asset_manifest();

	if (isset($manifest[ $entry ]['file']) && is_string($manifest[ $entry ]['file'])) {
		return STROYBRIGADA_ASSETS_URL . 'dist/' . ltrim($manifest[ $entry ]['file'], '/');
	}

	if ('' !== $fallback) {
		return STROYBRIGADA_ASSETS_URL . ltrim($fallback, '/');
	}

	return '';
}

function stroybrigada_get_asset_dependencies(string $entry, string $type = 'css'): array {
	$manifest = stroybrigada_get_asset_manifest();
	$files    = [];

	if ('css' === $type && ! empty($manifest[ $entry ]['css']) && is_array($manifest[ $entry ]['css'])) {
		foreach ($manifest[ $entry ]['css'] as $file) {
			if (is_string($file) && '' !== $file) {
				$files[] = STROYBRIGADA_ASSETS_URL . 'dist/' . ltrim($file, '/');
			}
		}
	}

	return $files;
}

function stroybrigada_render_section(string $slug, array $args = []): void {
	$template = STROYBRIGADA_THEME_PATH . 'template-parts/sections/' . $slug . '.php';

	if (is_readable($template)) {
		get_template_part('template-parts/sections/' . $slug, null, $args);
	}
}

function stroybrigada_render_global(string $slug, array $args = []): void {
	$template = STROYBRIGADA_THEME_PATH . 'template-parts/global/' . $slug . '.php';

	if (is_readable($template)) {
		get_template_part('template-parts/global/' . $slug, null, $args);
	}
}

function stroybrigada_prepare_imported_html(string $html): string {
	$asset_base = esc_url(STROYBRIGADA_ASSETS_URL . 'dist/');
	$home_base  = esc_url(home_url('/'));

	$html = stroybrigada_normalize_imported_faq_html($html);
	$html = stroybrigada_normalize_imported_callback_html($html);
	$html = preg_replace_callback(
		'/<div\b[^>]*class=(["\'])(?=[^"\']*\bcity_item\b)[^"\']*\1[^>]*>.*?<\/div>/is',
		static function (array $match): string {
			return preg_replace('/<a\b[^>]*>(.*?)<\/a>/is', '<span>$1</span>', (string) $match[0]) ?? (string) $match[0];
		},
		$html
	) ?? $html;
	$html = preg_replace(
		'/href\s*=\s*(["\'])(?:#politica-confidence|\/?policy\/?)\1/i',
		'href=$1/politika-konfidentsialnosti/$1',
		$html
	) ?? $html;
	$html = preg_replace(
		'/<li\b[^>]*>\s*<a\b[^>]*href=(["\'])(?:https?:\/\/[^\/]+)?\/stroitelstvo-chastnyh-domov-kottedzhey-ban\/\1[^>]*>.*?<\/a>\s*<\/li>/is',
		'',
		$html
	) ?? $html;
	$html = preg_replace('#<script\b[^>]*>[\s\S]*?</script>#i', '', $html) ?? $html;
	$http_home = set_url_scheme(home_url('/'), 'http');
	if ($http_home !== $home_base) {
		$html = str_replace($http_home, $home_base, $html);
	}
	$html = str_replace(
		[
			'src="/assets/',
			"src='/assets/",
			'href="/assets/',
			"href='/assets/",
			'url(/assets/',
			'url("/assets/',
			"url('/assets/",
		],
		[
			'src="' . $asset_base,
			"src='" . $asset_base,
			'href="' . $asset_base,
			"href='" . $asset_base,
			'url(' . $asset_base,
			'url("' . $asset_base,
			"url('" . $asset_base,
		],
		$html
	);

	$html = str_replace(['href="/', "href='/"], ['href="' . $home_base, "href='" . $home_base], $html);

	return $html;
}

function stroybrigada_html_tag_with_classes(string $tag, array $classes): string {
	$classes = array_values(array_unique(array_filter(array_map('trim', $classes))));
	if (! $classes) {
		return $tag;
	}

	if (preg_match('/\bclass\s*=\s*(["\'])(.*?)\1/i', $tag, $match)) {
		$current = preg_split('/\s+/', trim((string) $match[2])) ?: [];
		$merged  = array_values(array_unique(array_filter(array_merge($current, $classes))));
		return preg_replace('/\bclass\s*=\s*(["\'])(.*?)\1/i', 'class="' . esc_attr(implode(' ', $merged)) . '"', $tag, 1) ?? $tag;
	}

	return preg_replace('/>$/', ' class="' . esc_attr(implode(' ', $classes)) . '">', $tag, 1) ?? $tag;
}

function stroybrigada_html_tag_with_id(string $tag, string $id): string {
	$id = sanitize_html_class($id);
	if ('' === $id) {
		return $tag;
	}

	if (preg_match('/\bid\s*=\s*(["\'])(.*?)\1/i', $tag)) {
		return preg_replace('/\bid\s*=\s*(["\'])(.*?)\1/i', 'id="' . esc_attr($id) . '"', $tag, 1) ?? $tag;
	}

	return preg_replace('/>$/', ' id="' . esc_attr($id) . '">', $tag, 1) ?? $tag;
}

function stroybrigada_section_anchor_id(array $section, string $html): string {
	$kind = stroybrigada_section_merge_kind($section);
	if ('quiz' === $kind) {
		return 'quiz-section';
	}
	if ('price' === $kind) {
		return 'price';
	}
	if ('cases' === $kind) {
		return 'works';
	}
	if ('reviews' === $kind) {
		return 'reviews';
	}
	if ('video' === $kind) {
		return 'video';
	}
	if ('faq' === $kind) {
		return 'faq';
	}

	if (str_contains($html, 'city_item') || str_contains($html, 'id="cities"') || str_contains($html, "id='cities'")) {
		return 'cities';
	}

	return '';
}

function stroybrigada_ensure_section_anchor_html(string $html, string $anchor_id): string {
	if ('' === $html || '' === $anchor_id || ! preg_match('/<section\b[^>]*>/i', $html)) {
		return $html;
	}

	return preg_replace_callback(
		'/<section\b[^>]*>/i',
		static function (array $match) use ($anchor_id): string {
			return stroybrigada_html_tag_with_id((string) $match[0], $anchor_id);
		},
		$html,
		1
	) ?? $html;
}

function stroybrigada_normalize_imported_callback_html(string $html): string {
	if ('' === $html || ! preg_match('/\b(site-section--callback|form__bottom|form_bottom|form-callback__form_h)\b/i', $html)) {
		return $html;
	}

	$html = preg_replace_callback(
		'/<section\b(?=[^>]*(?:\bid\s*=\s*(["\'])(?:form__bottom|form_bottom)\1|\bsite-section--callback\b))[^>]*>/i',
		static function (array $match): string {
			return stroybrigada_html_tag_with_classes((string) $match[0], ['site-section', 'site-section--callback']);
		},
		$html
	) ?? $html;

	$html = preg_replace_callback(
		'/<div\b(?=[^>]*\b(?:callback|callback_block|form__bottom|form_bottom)\b)[^>]*>/i',
		static function (array $match): string {
			return stroybrigada_html_tag_with_classes((string) $match[0], ['callback', 'form__bottom']);
		},
		$html,
		1
	) ?? $html;

	$html = preg_replace_callback(
		'/<input\b(?=[^>]*\btype\s*=\s*(["\'])tel\1)(?=[^>]*\bname\s*=\s*(["\'])phone\2)[^>]*>/i',
		static function (array $match): string {
			return stroybrigada_html_tag_with_classes((string) $match[0], ['white-input']);
		},
		$html
	) ?? $html;

	$html = preg_replace_callback(
		'/<form\b(?=[^>]*\bform-callback__form_h\b|[^>]*\bid\s*=\s*(["\'])form-callback__form_h\1)[^>]*>/i',
		static function (array $match): string {
			return stroybrigada_html_tag_with_classes((string) $match[0], ['form-callback__form_h', 'modal-form_form', 'flex']);
		},
		$html
	) ?? $html;

	$html = preg_replace(
		'/<div\b([^>]*\bsoglasie-form\b[^>]*)>.*?<\/div>/is',
		'<div class="soglasie-form site-form-consent mt0"><label class="site-form-consent__label"><input class="site-form-consent__checkbox" type="checkbox" name="privacy_agreement" value="1" required checked><span class="site-form-consent__text">Соглашаюсь с <a href="/politika-konfidentsialnosti/" target="_blank" rel="noopener noreferrer">политикой конфиденциальности</a> и обработкой персональных данных</span></label></div>',
		$html
	) ?? $html;

	return $html;
}

function stroybrigada_normalize_imported_faq_html(string $html): string {
	if ('' === $html || false === stripos($html, 'accordion')) {
		return $html;
	}

	$html = preg_replace_callback(
		'/<h2\b(?=[^>]*\baccordion-header\b)([^>]*)>(.*?)<\/h2>(\s*)<div\b(?=[^>]*\baccordion-collapse\b)([^>]*)>/is',
		static function (array $match): string {
			$header_attributes   = (string) $match[1];
			$header_content      = trim((string) $match[2]);
			$between            = (string) $match[3];
			$collapse_attributes = (string) $match[4];

			if (false !== stripos($header_content, '<button')) {
				return $match[0];
			}

			$target_id = '';
			if (preg_match('/\bid\s*=\s*(["\'])(.*?)\1/i', $collapse_attributes, $target_match)) {
				$target_id = html_entity_decode((string) $target_match[2], ENT_QUOTES | ENT_HTML5, get_bloginfo('charset'));
			}

			if ('' === $target_id) {
				return $match[0];
			}

			$button_content = $header_content;
			if (false === stripos($button_content, '<img')) {
				$button_content .= '<img src="/assets/img/spoiler.svg" alt="">';
			}

			$button = sprintf(
				'<button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#%1$s" aria-expanded="false" aria-controls="%1$s">%2$s</button>',
				esc_attr($target_id),
				$button_content
			);

			return '<h2' . $header_attributes . '>' . $button . '</h2>' . $between . '<div' . $collapse_attributes . '>';
		},
		$html
	) ?? $html;

	$html = preg_replace('/\s+\bshow2\b/i', '', $html) ?? $html;
	$html = preg_replace('/\bshow2\b/i', '', $html) ?? $html;

	$html = preg_replace_callback(
		'/<button\b(?=[^>]*\baccordion-button\b)([^>]*)>/i',
		static function (array $match): string {
			$attributes = (string) $match[1];

			if (preg_match('/\bclass\s*=\s*(["\'])(.*?)\1/i', $attributes, $class_match)) {
				$classes = preg_split('/\s+/', trim((string) $class_match[2])) ?: [];
				$classes = array_values(array_unique(array_filter($classes)));
				if (! in_array('collapsed', $classes, true)) {
					$classes[] = 'collapsed';
				}
				$attributes = preg_replace('/\bclass\s*=\s*(["\'])(.*?)\1/i', 'class="' . esc_attr(implode(' ', $classes)) . '"', $attributes, 1) ?? $attributes;
			}

			if (preg_match('/\baria-expanded\s*=/i', $attributes)) {
				$attributes = preg_replace('/\baria-expanded\s*=\s*(["\'])(.*?)\1/i', 'aria-expanded="false"', $attributes, 1) ?? $attributes;
			} else {
				$attributes .= ' aria-expanded="false"';
			}

			return '<button' . $attributes . '>';
		},
		$html
	) ?? $html;

	$html = preg_replace_callback(
		'/<div\b(?=[^>]*\baccordion-collapse\b)([^>]*)>/i',
		static function (array $match): string {
			$attributes = (string) $match[1];

			if (preg_match('/\bclass\s*=\s*(["\'])(.*?)\1/i', $attributes, $class_match)) {
				$classes = preg_split('/\s+/', trim((string) $class_match[2])) ?: [];
				$classes = array_values(array_unique(array_filter($classes, static fn(string $class): bool => ! in_array($class, ['show', 'show2', 'collapsing'], true))));
				if (! in_array('collapse', $classes, true)) {
					$classes[] = 'collapse';
				}
				$attributes = preg_replace('/\bclass\s*=\s*(["\'])(.*?)\1/i', 'class="' . esc_attr(implode(' ', $classes)) . '"', $attributes, 1) ?? $attributes;
			}

			return '<div' . $attributes . '>';
		},
		$html
	) ?? $html;

	return $html;
}

function stroybrigada_html_attr(string $tag, string $attr): string {
	if (preg_match('/\s' . preg_quote($attr, '/') . '\s*=\s*(["\'])(.*?)\1/i', $tag, $match)) {
		return html_entity_decode((string) $match[2], ENT_QUOTES | ENT_HTML5, get_bloginfo('charset'));
	}

	return '';
}

function stroybrigada_html_inner_text(string $html, string $class): string {
	if (preg_match('/<[^>]+\bclass=(["\'])(?=[^"\']*\b' . preg_quote($class, '/') . '\b)[^"\']*\1[^>]*>(.*?)<\/[^>]+>/is', $html, $match)) {
		return trim(preg_replace('/\s+/u', ' ', wp_strip_all_tags((string) $match[2])) ?? '');
	}

	return '';
}

function stroybrigada_extract_balanced_div_blocks_by_class(string $html, string $class): array {
	if (! preg_match_all('/<div\b[^>]*class=(["\'])(?=[^"\']*\b' . preg_quote($class, '/') . '\b)[^"\']*\1[^>]*>/i', $html, $matches, PREG_OFFSET_CAPTURE)) {
		return [];
	}

	$blocks = [];
	foreach ($matches[0] as $start_match) {
		$start = (int) $start_match[1];
		if (! preg_match_all('/<\/?div\b[^>]*>/i', substr($html, $start), $div_matches, PREG_OFFSET_CAPTURE)) {
			continue;
		}

		$depth = 0;
		foreach ($div_matches[0] as $div_match) {
			$tag = strtolower((string) $div_match[0]);
			$offset = $start + (int) $div_match[1];
			$depth += str_starts_with($tag, '</div') ? -1 : 1;
			if (0 === $depth) {
				$blocks[] = substr($html, $start, ($offset + strlen($tag)) - $start);
				break;
			}
		}
	}

	return $blocks;
}

function stroybrigada_extract_case_card_data_from_html(string $card_html): array {
	if (! preg_match('/<a\b[^>]*data-fancybox=(["\'])works-section\1[^>]*>/i', $card_html, $link_match)) {
		if (! preg_match('/<a\b[^>]*>/i', $card_html, $link_match)) {
			return [];
		}
	}

	$link_tag = (string) $link_match[0];
	$main = stroybrigada_html_attr($link_tag, 'href');
	if ('' === $main) {
		return [];
	}

	$preview = '';
	if (preg_match('/<img\b[^>]*class=(["\'])(?=[^"\']*\bpreview\b)[^"\']*\1[^>]*>/i', $card_html, $image_match)) {
		$image_tag = (string) $image_match[0];
		$preview = stroybrigada_html_attr($image_tag, 'data-src');
		if ('' === $preview) {
			$preview = stroybrigada_html_attr($image_tag, 'src');
		}
	}
	if ('' === $preview) {
		$preview = $main;
	}

	$gallery = [];
	$extra = stroybrigada_html_attr($link_tag, 'data-work-card-extra-images');
	$decoded = '' !== $extra ? json_decode($extra, true) : null;
	if (is_array($decoded)) {
		foreach ($decoded as $item) {
			if (is_array($item) && ! empty($item['image'])) {
				$gallery[] = (string) $item['image'];
			}
		}
	}

	return [
		'title'       => stroybrigada_html_inner_text($card_html, 'works-section__gallery-title'),
		'description' => stroybrigada_html_inner_text($card_html, 'works-section__gallery-desc'),
		'chips'       => stroybrigada_html_inner_text_list($card_html, 'works-section__gallery-chip'),
		'main'        => $main,
		'preview'     => $preview,
		'gallery'     => array_values(array_unique(array_filter($gallery))),
	];
}

function stroybrigada_html_inner_text_list(string $html, string $class_name): array {
	if (! preg_match_all('/<[^>]+class=(["\'])(?=[^"\']*\b' . preg_quote($class_name, '/') . '\b)[^"\']*\1[^>]*>(.*?)<\/[^>]+>/is', $html, $matches)) {
		return [];
	}

	return array_values(
		array_filter(
			array_map(
				static fn($value): string => trim(wp_strip_all_tags(html_entity_decode((string) $value, ENT_QUOTES, get_bloginfo('charset')))),
				$matches[2]
			),
			static fn(string $value): bool => '' !== $value
		)
	);
}

function stroybrigada_should_randomize_front_page_cards(int $post_id): bool {
	return ! is_admin() && $post_id > 0 && $post_id === (int) get_option('page_on_front');
}

function stroybrigada_case_posts_for_page(int $post_id): array {
	if ($post_id <= 0 || ! post_type_exists('project')) {
		return [];
	}

	return get_posts(
		[
			'post_type'      => 'project',
			'post_status'    => 'publish',
			'posts_per_page' => -1,
			'orderby'        => stroybrigada_should_randomize_front_page_cards($post_id) ? 'rand' : ['menu_order' => 'ASC', 'date' => 'DESC'],
			'meta_query'     => [
				'relation' => 'OR',
				[
					'key'     => '_stroybrigada_case_pages',
					'value'   => '"' . $post_id . '"',
					'compare' => 'LIKE',
				],
				[
					'key'     => '_stroybrigada_case_pages',
					'value'   => 'i:' . $post_id . ';',
					'compare' => 'LIKE',
				],
			],
		]
	);
}

function stroybrigada_case_image_meta(int $post_id, string $key): string {
	$value = (string) get_post_meta($post_id, $key, true);
	if ('' !== $value) {
		return stroybrigada_secure_internal_url($value);
	}

	$thumbnail = get_the_post_thumbnail_url($post_id, 'large');
	return is_string($thumbnail) ? stroybrigada_secure_internal_url($thumbnail) : '';
}

function stroybrigada_render_case_card(WP_Post $case, int $index, bool $collapsed = false): string {
	$post_id = (int) $case->ID;
	$title = get_the_title($case);
	$description = (string) get_post_meta($post_id, '_stroybrigada_case_description', true);
	if ('' === $description) {
		$description = has_excerpt($case) ? get_the_excerpt($case) : wp_trim_words(wp_strip_all_tags((string) $case->post_content), 24, '');
	}

	$main = stroybrigada_case_image_meta($post_id, '_stroybrigada_case_main_image');
	$preview = $main;
	if ('' === $main) {
		return '';
	}

	$gallery = get_post_meta($post_id, '_stroybrigada_case_gallery', true);
	$gallery = is_array($gallery) ? array_values(array_filter(array_map('strval', $gallery))) : [];
	$chips = get_post_meta($post_id, '_stroybrigada_case_chips', true);
	$chips = is_array($chips) ? array_values(array_filter(array_map('strval', $chips))) : [];
	$extra = [];
	foreach ($gallery as $image) {
		$extra[] = [
			'image'    => $image,
			'position' => '50% 50%',
			'title'    => $title,
		];
	}

	ob_start();
	?>
	<div class="col-sm-6 col-xl-4 col-lg-4 col-md-6 works-section__gallery-item active<?php echo $collapsed ? ' stroybrigada-case--collapsed' : ''; ?>">
		<a data-caption="<?php echo esc_attr('Фото №' . $index . ' '); ?>" data-cat="" data-fancybox="works-section" href="<?php echo esc_url($main); ?>"<?php echo $extra ? ' data-work-card-extra-images=\'' . esc_attr(wp_json_encode($extra, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)) . '\'' : ''; ?>>
			<div class="works-section__gallery-image">
				<img class="preview lazyload" data-src="<?php echo esc_url($preview); ?>" alt="<?php echo esc_attr($title); ?>">
				<span class="works-section__gallery-copy">
					<span class="works-section__gallery-title"><?php echo esc_html($title); ?></span>
					<?php if ('' !== $description) : ?>
						<span class="works-section__gallery-desc"><?php echo esc_html($description); ?></span>
					<?php endif; ?>
					<?php if ($chips) : ?>
						<span class="works-section__gallery-meta">
							<?php foreach ($chips as $chip) : ?>
								<span class="works-section__gallery-chip"><?php echo esc_html($chip); ?></span>
							<?php endforeach; ?>
						</span>
					<?php endif; ?>
				</span>
			</div>
		</a>
		<a href="#" data-remodal-target="price" data-link="<?php echo esc_url($main); ?>" data-number="<?php echo esc_attr('Фото №' . $index); ?>" class="btn-small-cost"><?php esc_html_e('Узнать стоимость', 'stroybrigada'); ?></a>
	</div>
	<?php
	return (string) ob_get_clean();
}

function stroybrigada_render_case_cards_for_page(int $post_id): string {
	$cases = stroybrigada_case_posts_for_page($post_id);
	if (! $cases) {
		return '';
	}

	$html = '';
	$rendered_index = 0;
	$collapse_after_six = stroybrigada_should_randomize_front_page_cards($post_id);
	foreach ($cases as $case) {
		if ($case instanceof WP_Post) {
			$card = stroybrigada_render_case_card($case, $rendered_index + 1, $collapse_after_six && $rendered_index >= 6);
			if ('' !== $card) {
				$html .= $card;
				$rendered_index++;
			}
		}
	}

	return $html;
}

function stroybrigada_replace_video_section_html(string $html, int $post_id): string {
	if ('' === $html || ! str_contains($html, 'data-video-grid') || ! function_exists('stroybrigada_video_items_for_page')) {
		return $html;
	}

	$items = stroybrigada_video_items_for_page($post_id);
	if (! $items) {
		return '';
	}

	$json = wp_json_encode($items, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
	if (! is_string($json) || '' === $json) {
		return '';
	}

	if (preg_match('/data-video-items\s*=\s*(["\'])(.*?)\1/is', $html)) {
		return preg_replace('/data-video-items\s*=\s*(["\'])(.*?)\1/is', "data-video-items='" . esc_attr($json) . "'", $html, 1) ?? $html;
	}

	return preg_replace('/data-video-grid\b/', 'data-video-grid data-video-items=\'' . esc_attr($json) . '\'', $html, 1) ?? $html;
}

function stroybrigada_replace_cases_section_html(string $html, int $post_id): string {
	if ('' === $html || ! preg_match('/\bid\s*=\s*(["\'])works\1/i', $html) || ! str_contains($html, 'works-section__gallery')) {
		return $html;
	}

	$cards = stroybrigada_render_case_cards_for_page($post_id);
	if ('' === trim($cards)) {
		// Never fall back to cards embedded in a shared/static template. They may
		// belong to another service (for example roofing cards on the floors page).
		return '';
	}

	if (! preg_match('/<div\b[^>]*class=(["\'])(?=[^"\']*\bworks-section__gallery\b)[^"\']*\1[^>]*>/i', $html, $match, PREG_OFFSET_CAPTURE)) {
		return $html;
	}

	$start = (int) $match[0][1];
	if (! preg_match_all('/<\/?div\b[^>]*>/i', substr($html, $start), $div_matches, PREG_OFFSET_CAPTURE)) {
		return $html;
	}

	$depth = 0;
	foreach ($div_matches[0] as $div_match) {
		$tag = strtolower((string) $div_match[0]);
		$offset = $start + (int) $div_match[1];
		$depth += str_starts_with($tag, '</div') ? -1 : 1;
		if (0 === $depth) {
			$open_tag = (string) $match[0][0];
			$show_all = '';
			if (str_contains($cards, 'stroybrigada-case--collapsed')) {
				$show_all = "\n<div class=\"video-section__actions\"><button type=\"button\" class=\"btn btn-st0 uppercase video-section__toggle\" data-cases-show-all>" . esc_html__('Показать еще', 'stroybrigada') . '</button></div>';
			}
			$replacement = $open_tag . "\n" . $cards . "\n</div>" . $show_all;
			return substr_replace($html, $replacement, $start, ($offset + strlen($tag)) - $start);
		}
	}

	return $html;
}

function stroybrigada_extract_html_attr_value(string $html, string $attr): string {
	if (preg_match('/\b' . preg_quote($attr, '/') . '\s*=\s*(["\'])(.*?)\1/is', $html, $match)) {
		return html_entity_decode((string) $match[2], ENT_QUOTES | ENT_HTML5, 'UTF-8');
	}

	return '';
}

function stroybrigada_extract_first_class_html(string $html, string $class_name, string $tag = '[a-z0-9]+'): string {
	if (preg_match('/<' . $tag . '\b[^>]*class=(["\'])(?=[^"\']*\b' . preg_quote($class_name, '/') . '\b)[^"\']*\1[^>]*>(.*?)<\/' . $tag . '>/is', $html, $match)) {
		return (string) $match[2];
	}

	return '';
}

function stroybrigada_extract_first_class_text(string $html, string $class_name, string $tag = '[a-z0-9]+'): string {
	return trim(wp_strip_all_tags(stroybrigada_extract_first_class_html($html, $class_name, $tag)));
}

function stroybrigada_extract_first_class_image_src(string $html, string $class_name): string {
	if (preg_match('/<img\b[^>]*class=(["\'])(?=[^"\']*\b' . preg_quote($class_name, '/') . '\b)[^"\']*\1[^>]*>/is', $html, $match)) {
		$tag = (string) $match[0];
		$src = stroybrigada_extract_html_attr_value($tag, 'src');
		return '' !== $src ? $src : stroybrigada_extract_html_attr_value($tag, 'data-src');
	}

	return '';
}

function stroybrigada_extract_div_blocks_by_class(string $html, string $class_name): array {
	if (! preg_match_all('/<div\b[^>]*class=(["\'])(?=[^"\']*\b' . preg_quote($class_name, '/') . '\b)[^"\']*\1[^>]*>/i', $html, $matches, PREG_OFFSET_CAPTURE)) {
		return [];
	}

	$blocks = [];
	foreach ($matches[0] as $match) {
		$start = (int) $match[1];
		if (! preg_match_all('/<\/?div\b[^>]*>/i', substr($html, $start), $div_matches, PREG_OFFSET_CAPTURE)) {
			continue;
		}

		$depth = 0;
		foreach ($div_matches[0] as $div_match) {
			$tag = strtolower((string) $div_match[0]);
			$offset = $start + (int) $div_match[1];
			$depth += str_starts_with($tag, '</div') ? -1 : 1;
			if (0 === $depth) {
				$blocks[] = substr($html, $start, ($offset + strlen($tag)) - $start);
				break;
			}
		}
	}

	return $blocks;
}

function stroybrigada_review_items_from_html(string $html): array {
	$items = [];
	foreach (stroybrigada_extract_div_blocks_by_class($html, 'testimonials-section__item') as $block) {
		$title = stroybrigada_extract_first_class_text($block, 'review-card__title', 'h[1-6]');
		if ('' === $title) {
			$title = stroybrigada_extract_first_class_text($block, 'testimonial-name');
		}

		$text = stroybrigada_extract_first_class_text($block, 'review-card__text', 'p');
		if ('' === $text) {
			$text = stroybrigada_extract_first_class_text($block, 'reviews-thumbs__text');
		}

		if ('' === $title && '' === $text) {
			continue;
		}

		$tags_html = stroybrigada_extract_first_class_html($block, 'review-card__tags');
		$tags = [];
		if (preg_match_all('/<span\b[^>]*>(.*?)<\/span>/is', $tags_html, $tag_matches)) {
			$tags = array_values(array_filter(array_map(static fn($tag): string => trim(wp_strip_all_tags((string) $tag)), $tag_matches[1])));
		}

		$items[] = [
			'image'  => stroybrigada_extract_first_class_image_src($block, 'review-card__image'),
			'name'   => $title,
			'tags'   => $tags,
			'text'   => $text,
			'source' => stroybrigada_extract_first_class_text($block, 'review-card__source', 'p'),
			'date'   => stroybrigada_extract_first_class_text($block, 'testimonial-date'),
			'stars'  => stroybrigada_extract_first_class_text($block, 'review-card__stars'),
		];
	}

	return $items;
}

function stroybrigada_review_fallback_image(int $index): string {
	$images = [
		'/assets/uploads/2025/12/case-08-preview.jpg',
		'/assets/uploads/2025/12/case-11-preview.jpg',
		'/assets/uploads/2025/12/case-09-preview.jpg',
		'/assets/uploads/2025/12/case-04-preview.jpg',
		'/assets/uploads/2025/12/case-05-preview.jpg',
		'/assets/uploads/2025/12/case-06-preview.jpg',
		'/assets/uploads/2025/12/case-07-preview.jpg',
		'/assets/uploads/2025/12/case-01-preview.jpg',
	];

	return $images[$index % count($images)];
}

function stroybrigada_render_review_slide(array $item, int $index): string {
	$image = trim((string) ($item['image'] ?? ''));
	if ('' === $image) {
		$image = stroybrigada_review_fallback_image($index);
	}

	$name = trim((string) ($item['name'] ?? ''));
	$text = trim((string) ($item['text'] ?? ''));
	$source = trim((string) ($item['source'] ?? ''));
	$tags = array_values(array_filter(array_map('trim', array_map('strval', (array) ($item['tags'] ?? [])))));
	$stars = trim((string) ($item['stars'] ?? '★★★★★'));
	if ('' === $stars) {
		$stars = '★★★★★';
	}

	ob_start();
	?>
	<div class="testimonials-section__item testimonials-section__item--review-card swiper-slide">
		<article class="review-card">
			<img class="review-card__image" src="<?php echo esc_url($image); ?>" alt="<?php echo esc_attr($name); ?>" loading="lazy" width="640" height="250">
			<div class="review-card__stars" aria-label="<?php echo esc_attr__('5 из 5', 'stroybrigada'); ?>"><?php echo esc_html($stars); ?></div>
			<?php if ('' !== $name) : ?>
				<h3 class="review-card__title"><?php echo esc_html($name); ?></h3>
			<?php endif; ?>
			<?php if ($tags) : ?>
				<div class="review-card__tags">
					<?php foreach ($tags as $tag) : ?>
						<span><?php echo esc_html($tag); ?></span>
					<?php endforeach; ?>
				</div>
			<?php endif; ?>
			<?php if ('' !== $text) : ?>
				<p class="review-card__text"><?php echo esc_html($text); ?></p>
			<?php endif; ?>
			<?php if ('' !== $source) : ?>
				<p class="review-card__source"><?php echo esc_html($source); ?></p>
			<?php endif; ?>
		</article>
	</div>
	<?php
	return (string) ob_get_clean();
}

function stroybrigada_render_review_slides(array $items): string {
	$html = '';
	foreach (array_values($items) as $index => $item) {
		if (is_array($item)) {
			$html .= stroybrigada_render_review_slide($item, $index);
		}
	}

	return $html;
}

function stroybrigada_replace_reviews_section_html(string $html, int $post_id = 0): string {
	if ('' === $html || ! str_contains($html, 'testimonials-section') || ! str_contains($html, 'swiper-wrapper')) {
		return $html;
	}

	$items = function_exists('stroybrigada_review_items_for_page') && $post_id > 0 ? stroybrigada_review_items_for_page($post_id) : [];
	if (! $items) {
		$items = stroybrigada_review_items_from_html($html);
	}
	if (! $items) {
		return $html;
	}

	if (! preg_match('/<div\b[^>]*class=(["\'])(?=[^"\']*\bswiper-wrapper\b)[^"\']*\1[^>]*>/i', $html, $match, PREG_OFFSET_CAPTURE)) {
		return $html;
	}

	$start = (int) $match[0][1];
	if (! preg_match_all('/<\/?div\b[^>]*>/i', substr($html, $start), $div_matches, PREG_OFFSET_CAPTURE)) {
		return $html;
	}

	$depth = 0;
	foreach ($div_matches[0] as $div_match) {
		$tag = strtolower((string) $div_match[0]);
		$offset = $start + (int) $div_match[1];
		$depth += str_starts_with($tag, '</div') ? -1 : 1;
		if (0 === $depth) {
			$open_tag = (string) $match[0][0];
			$replacement = $open_tag . "\n" . stroybrigada_render_review_slides($items) . "\n</div>";
			return substr_replace($html, $replacement, $start, ($offset + strlen($tag)) - $start);
		}
	}

	return $html;
}

function stroybrigada_imported_html_section_id(string $html): string {
	if (preg_match('/<section\b[^>]*\bid\s*=\s*(["\'])([^"\']+)\1/i', $html, $match)) {
		return sanitize_key((string) $match[2]);
	}

	return '';
}

function stroybrigada_balance_imported_section_fragment(string $html): string {
	$open_forms = preg_match_all('/<form\b(?![^>]*\/>)[^>]*>/i', $html);
	$close_forms = preg_match_all('/<\/form>/i', $html);
	$missing_forms = max(0, (int) $open_forms - (int) $close_forms);
	if ($missing_forms > 0) {
		$html .= str_repeat('</form>', $missing_forms);
	}

	$open_divs = preg_match_all('/<div\b(?![^>]*\/>)[^>]*>/i', $html);
	$close_divs = preg_match_all('/<\/div>/i', $html);
	$missing_divs = max(0, (int) $open_divs - (int) $close_divs);
	if ($missing_divs > 0) {
		$html .= str_repeat('</div>', $missing_divs);
	}

	$open_sections = preg_match_all('/<section\b(?![^>]*\/>)[^>]*>/i', $html);
	$close_sections = preg_match_all('/<\/section>/i', $html);
	$missing_sections = max(0, (int) $open_sections - (int) $close_sections);
	if ($missing_sections > 0) {
		$html .= str_repeat('</section>', $missing_sections);
	}

	return $html;
}

function stroybrigada_split_corrupted_imported_section_html(string $html): array {
	if (! preg_match_all('/<section\b[^>]*\bid\s*=\s*(["\'])(services|quiz-section|price|works|video|reviews|faq|cities)\1[^>]*>/i', $html, $matches, PREG_OFFSET_CAPTURE)) {
		return [$html];
	}

	$positions = array_values(array_unique(array_map(static fn(array $match): int => (int) $match[1], $matches[0])));
	if (! $positions || 0 === $positions[0]) {
		return [$html];
	}

	$parts = [stroybrigada_balance_imported_section_fragment(substr($html, 0, $positions[0]))];
	foreach ($positions as $position_index => $position) {
		$next_position = $positions[$position_index + 1] ?? strlen($html);
		$part = substr($html, $position, $next_position - $position);
		if ('' !== trim($part)) {
			$parts[] = $part;
		}
	}

	return array_values(array_filter($parts, static fn(string $part): bool => '' !== trim($part)));
}

function stroybrigada_render_imported_sections(int $post_id): void {
	$inline_styles = (string) stroybrigada_get_field('stroybrigada_inline_styles', $post_id, '');
	if ('' !== $inline_styles) {
		printf("<style id=\"stroybrigada-page-inline-css\">\n%s\n</style>\n", wp_strip_all_tags($inline_styles));
	}

	$sections = stroybrigada_get_page_sections($post_id);
	if (! is_array($sections)) {
		return;
	}

	$rendered_section_ids = [];
	foreach ($sections as $section) {
		if (! is_array($section) || ! stroybrigada_section_is_visible($section) || empty($section['html'])) {
			continue;
		}

		$section_html = (string) $section['html'];
		$section_kind = stroybrigada_section_merge_kind($section);
		$section_html = stroybrigada_ensure_section_anchor_html($section_html, stroybrigada_section_anchor_id($section, $section_html));
		if (stroybrigada_is_sitemap_page($post_id)) {
			$section_html = stroybrigada_replace_sitemap_list_html($section_html);
		}
		if ('quiz' === $section_kind) {
			$section_html = stroybrigada_balance_imported_section_fragment(stroybrigada_trim_quiz_html_before_foreign_sections($section_html));
		} elseif ('cases' === $section_kind) {
			$section_html = stroybrigada_replace_cases_section_html($section_html, $post_id);
		} elseif ('video' === $section_kind) {
			$section_html = stroybrigada_replace_video_section_html($section_html, $post_id);
		} elseif ('reviews' === $section_kind) {
			$section_html = stroybrigada_replace_reviews_section_html($section_html, $post_id);
		} elseif ('services' === $section_kind) {
			$section_html = stroybrigada_replace_services_section_html($section_html);
		}
		if ((int) get_option('page_on_front') === $post_id && 'content' === (string) ($section['label'] ?? '')) {
			$section_html = stroybrigada_replace_home_service_seo_html($section_html);
		}

		if (function_exists('sbio_optimize_rendered_html')) {
			// Limits include enough reserve for high-density screens without
			// serving the camera-sized source files to small cards.
			$section_max_dimension = match ($section_kind) {
				'quiz'              => 640,
				'reviews', 'services' => 960,
				'video'             => 1280,
				'cases'             => 1600,
				default             => 1440,
			};
			$section_html = sbio_optimize_rendered_html($section_html, $section_max_dimension);
		}

		foreach (stroybrigada_split_corrupted_imported_section_html($section_html) as $section_html) {
			$section_id = stroybrigada_imported_html_section_id($section_html);
			if ('' !== $section_id && isset($rendered_section_ids[$section_id])) {
				continue;
			}

			if ('' !== $section_id) {
				$rendered_section_ids[$section_id] = true;
			}

			echo stroybrigada_prepare_imported_html($section_html); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		}
	}

	$modals = (string) stroybrigada_get_field('stroybrigada_modals_html', $post_id, '');
	if ('' !== $modals) {
		echo stroybrigada_prepare_imported_html($modals); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	}
}

function stroybrigada_get_contact_data(): array {
	return [
		'company_name' => (string) stroybrigada_get_option_field('company_name', get_bloginfo('name')),
		'phone'        => (string) stroybrigada_get_option_field('primary_phone', ''),
		'phone_link'   => (string) stroybrigada_get_option_field('primary_phone_link', ''),
		'email'        => (string) stroybrigada_get_option_field('email', ''),
		'address'      => (string) stroybrigada_get_option_field('address', ''),
		'work_hours'   => (string) stroybrigada_get_option_field('work_hours', ''),
		'telegram'     => (string) stroybrigada_get_option_field('telegram_url', ''),
		'whatsapp'     => (string) stroybrigada_get_option_field('whatsapp_url', ''),
		'max'          => (string) stroybrigada_get_option_field('max_url', ''),
	];
}
