<?php
/**
 * Initial content importer.
 *
 * @package Stroybrigada
 */

declare(strict_types=1);

if (! defined('ABSPATH')) {
	exit;
}

function stroybrigada_import_data_path(): string {
	return STROYBRIGADA_THEME_PATH . 'data/content.json';
}

function stroybrigada_read_import_data(): array {
	$path = stroybrigada_import_data_path();
	if (! is_readable($path)) {
		return [];
	}

	$json = file_get_contents($path);
	if (! is_string($json) || '' === $json) {
		return [];
	}

	$data = json_decode($json, true);
	return is_array($data) ? $data : [];
}

function stroybrigada_import_find_post(string $source_id, string $post_type): int {
	return stroybrigada_import_find_post_in_types($source_id, [$post_type]);
}

function stroybrigada_import_find_post_in_types(string $source_id, array $post_types): int {
	$posts = get_posts(
		[
			'post_type'      => $post_types,
			'post_status'    => 'any',
			'posts_per_page' => 1,
			'fields'         => 'ids',
			'meta_key'       => '_stroybrigada_source_id',
			'meta_value'     => $source_id,
			'no_found_rows'  => true,
		]
	);

	return $posts ? (int) $posts[0] : 0;
}

function stroybrigada_import_admin_page_title(string $source_id, string $fallback): string {
	$titles = [
		'home'                                                          => __('Главная', 'stroybrigada'),
		'service_stroitelstvo_chastnyh_domov_kottedzhey_ban'            => __('Строительство/реконструкция домов', 'stroybrigada'),
		'service_montazh_krovli_i_stropil'                              => __('Кровельные работы', 'stroybrigada'),
		'service_ustroystvo_fundamentov_otmostok_parkovok'              => __('Строительство фундамента', 'stroybrigada'),
		'service_otdelochnye_raboty_ustroystvo_styazhek_i_polov'        => __('Утепление дома', 'stroybrigada'),
		'service_otmostki'                                              => __('Укладка брусчатки и отмостки', 'stroybrigada'),
		'service_stroitelstvo_pristroek'                                => __('Беседки, веранды, пристройки', 'stroybrigada'),
		'service_stroitelstvo_sten_derevyannyh_karkasnyh_kamennyh'      => __('Восстановление старых домов и дач', 'stroybrigada'),
		'service_stroitelstvo_zdaniy_i_otdelka'                         => __('Фасадные работы, сайдинг', 'stroybrigada'),
	];

	return (string) ($titles[$source_id] ?? $fallback);
}

function stroybrigada_import_upsert_post(array $item, string $post_type, array &$report): int {
	$source_id = sanitize_key((string) ($item['sourceId'] ?? ''));
	if ('' === $source_id) {
		$report['errors'][] = 'Empty source id for ' . $post_type;
		return 0;
	}

	$post_id = stroybrigada_import_find_post($source_id, $post_type);
	if (! $post_id && 'page' === $post_type) {
		$post_id = stroybrigada_import_find_post($source_id, 'service');
	}
	$title   = sanitize_text_field(stroybrigada_import_admin_page_title($source_id, (string) ($item['title'] ?? $source_id)));
	$args    = [
		'post_type'    => $post_type,
		'post_status'  => 'publish',
		'post_title'   => $title,
		'post_name'    => sanitize_title((string) ($item['slug'] ?? $source_id)),
		'post_excerpt' => sanitize_textarea_field((string) ($item['excerpt'] ?? $item['intro'] ?? '')),
		'post_content' => '',
		'menu_order'   => (int) ($item['order'] ?? 0),
	];

	if ($post_id) {
		$args['ID'] = $post_id;
		$result     = wp_update_post(wp_slash($args), true);
		$report['updated']++;
	} else {
		$result = wp_insert_post(wp_slash($args), true);
		$report['created']++;
	}

	if (is_wp_error($result)) {
		$report['errors'][] = $result->get_error_message();
		return 0;
	}

	$post_id = (int) $result;
	update_post_meta($post_id, '_stroybrigada_source_id', $source_id);
	return $post_id;
}

function stroybrigada_import_local_attachment(string $asset_path, array &$report): int {
	$asset_path = ltrim($asset_path, '/');
	$source_id  = 'asset_' . md5($asset_path);
	$existing   = stroybrigada_import_find_post($source_id, 'attachment');
	if ($existing) {
		return $existing;
	}

	$local = STROYBRIGADA_ASSETS_PATH . 'dist/' . preg_replace('#^assets/#', '', $asset_path);
	if (! is_readable($local)) {
		$report['skipped']++;
		return 0;
	}

	require_once ABSPATH . 'wp-admin/includes/file.php';
	require_once ABSPATH . 'wp-admin/includes/image.php';

	$uploads = wp_upload_dir();
	if (! empty($uploads['error'])) {
		$report['errors'][] = (string) $uploads['error'];
		return 0;
	}

	$filename = wp_unique_filename($uploads['path'], basename($local));
	$target   = trailingslashit($uploads['path']) . $filename;
	if (! copy($local, $target)) {
		$report['errors'][] = 'Cannot copy asset: ' . $asset_path;
		return 0;
	}

	$filetype = wp_check_filetype($filename);
	$attachment_id = wp_insert_attachment(
		[
			'post_mime_type' => $filetype['type'] ?: 'application/octet-stream',
			'post_title'     => sanitize_file_name(pathinfo($filename, PATHINFO_FILENAME)),
			'post_status'    => 'inherit',
		],
		$target
	);

	if (is_wp_error($attachment_id) || ! $attachment_id) {
		$report['errors'][] = 'Cannot insert attachment: ' . $asset_path;
		return 0;
	}

	$metadata = wp_generate_attachment_metadata((int) $attachment_id, $target);
	if ($metadata) {
		wp_update_attachment_metadata((int) $attachment_id, $metadata);
	}

	update_post_meta((int) $attachment_id, '_stroybrigada_source_id', $source_id);
	$report['created']++;
	return (int) $attachment_id;
}

function stroybrigada_extract_asset_paths_from_html(string $html): array {
	preg_match_all('#(?:src|href)=["\']/(assets/[^"\']+)["\']#i', $html, $matches);
	$paths = $matches[1] ?? [];
	preg_match_all('#url\(/(assets/[^)]+)\)#i', $html, $css_matches);
	$paths = array_merge($paths, $css_matches[1] ?? []);

	return array_values(array_unique(array_filter($paths)));
}

function stroybrigada_import_page_assets(array $page, int $post_id, array &$report): void {
	$html = (string) ($page['inlineStyles'] ?? '') . "\n" . (string) ($page['modalsHtml'] ?? '');
	foreach ((array) ($page['sections'] ?? []) as $section) {
		$html .= "\n" . (string) ($section['html'] ?? '');
	}

	$attachment_ids = [];
	foreach (stroybrigada_extract_asset_paths_from_html($html) as $asset_path) {
		$attachment_id = stroybrigada_import_local_attachment($asset_path, $report);
		if ($attachment_id) {
			$attachment_ids[] = $attachment_id;
		}
	}

	stroybrigada_update_field('stroybrigada_imported_attachments', array_values(array_unique($attachment_ids)), $post_id);
	if ($attachment_ids && ! has_post_thumbnail($post_id)) {
		set_post_thumbnail($post_id, $attachment_ids[0]);
	}
}

function stroybrigada_import_options(array $options): void {
	foreach ($options as $key => $value) {
		stroybrigada_update_field((string) $key, $value, 'option');
	}
}

function stroybrigada_import_terms(array $categories): array {
	$term_ids = [];
	foreach ($categories as $category) {
		$slug = sanitize_title((string) ($category['slug'] ?? ''));
		if ('' === $slug) {
			continue;
		}

		$term = term_exists($slug, 'service_category');
		if (! $term) {
			$term = wp_insert_term(
				sanitize_text_field((string) ($category['name'] ?? $slug)),
				'service_category',
				['slug' => $slug]
			);
		}

		if (! is_wp_error($term)) {
			$term_ids[ (string) ($category['sourceId'] ?? $slug) ] = (int) (is_array($term) ? $term['term_id'] : $term);
		}
	}

	return $term_ids;
}

function stroybrigada_import_menus(array $pages_by_source, array $services_by_source): void {
	$locations = get_theme_mod('nav_menu_locations', []);
	$menu_id   = wp_get_nav_menu_object('Основное меню');
	if (! $menu_id) {
		$menu_id = wp_create_nav_menu('Основное меню');
	}

	$menu_id = is_object($menu_id) ? (int) $menu_id->term_id : (int) $menu_id;
	$existing = wp_get_nav_menu_items($menu_id);
	if (empty($existing)) {
		if (! empty($pages_by_source['home'])) {
			wp_update_nav_menu_item($menu_id, 0, ['menu-item-title' => 'Главная', 'menu-item-object-id' => $pages_by_source['home'], 'menu-item-object' => 'page', 'menu-item-type' => 'post_type', 'menu-item-status' => 'publish']);
		}

		foreach ($pages_by_source as $source_id => $post_id) {
			if ('home' === $source_id) {
				continue;
			}

			wp_update_nav_menu_item($menu_id, 0, ['menu-item-title' => get_the_title($post_id), 'menu-item-object-id' => $post_id, 'menu-item-object' => 'page', 'menu-item-type' => 'post_type', 'menu-item-status' => 'publish']);
		}

		foreach ($services_by_source as $post_id) {
			wp_update_nav_menu_item($menu_id, 0, ['menu-item-title' => get_the_title($post_id), 'menu-item-object-id' => $post_id, 'menu-item-object' => 'service', 'menu-item-type' => 'post_type', 'menu-item-status' => 'publish']);
		}
	}

	$locations['primary'] = $menu_id;
	$locations['mobile']  = $menu_id;
	$locations['footer']  = $menu_id;
	set_theme_mod('nav_menu_locations', $locations);
}

function stroybrigada_import_required_page_source_ids(): array {
	return [
		'home',
		'service_stroitelstvo_chastnyh_domov_kottedzhey_ban',
		'service_montazh_krovli_i_stropil',
		'service_ustroystvo_fundamentov_otmostok_parkovok',
		'service_otdelochnye_raboty_ustroystvo_styazhek_i_polov',
		'service_otmostki',
		'service_stroitelstvo_pristroek',
		'service_stroitelstvo_sten_derevyannyh_karkasnyh_kamennyh',
		'service_stroitelstvo_zdaniy_i_otdelka',
	];
}

function stroybrigada_import_add_missing_video_items(array $sections, array $defaults): array {
	$default_attribute = '';
	foreach ($defaults as $section) {
		$html = (string) ($section['html'] ?? '');
		if (preg_match('/data-video-items\s*=\s*(["\'])(.*?)\1/is', $html, $match)) {
			$default_attribute = (string) $match[0];
			break;
		}
	}

	if ('' === $default_attribute) {
		return $sections;
	}

	foreach ($sections as &$section) {
		$html = (string) ($section['html'] ?? '');
		if (str_contains($html, 'data-video-grid') && ! str_contains($html, 'data-video-items=')) {
			$section['html'] = preg_replace('/data-video-grid\b/', 'data-video-grid ' . $default_attribute, $html, 1) ?? $html;
		}
	}
	unset($section);

	return $sections;
}

function stroybrigada_import_find_default_section(array $defaults, string $label, string $html_marker): ?array {
	foreach ($defaults as $section) {
		$html = (string) ($section['html'] ?? '');
		if ($label === (string) ($section['label'] ?? '') || str_contains($html, $html_marker)) {
			return $section;
		}
	}

	return null;
}

function stroybrigada_import_foundation_reviews_are_generic(string $html): bool {
	$generic_markers = [
		'Заказывали реконструкцию старого дома',
		'Нужна была новая кровля',
		'Делали пристройку и террасу',
		'Заказывали фасад и утепление',
		'Недавно закончили ремонт кровли',
	];

	foreach ($generic_markers as $marker) {
		if (str_contains($html, $marker)) {
			return true;
		}
	}

	return false;
}

function stroybrigada_import_fix_foundation_reviews(array $sections, array $defaults): array {
	$default_review = stroybrigada_import_find_default_section($defaults, 'reviews', 'testimonials-section');
	if (! is_array($default_review)) {
		return $sections;
	}

	$review_index = null;
	foreach ($sections as $index => $section) {
		$html = (string) ($section['html'] ?? '');
		if ('reviews' === (string) ($section['label'] ?? '') || str_contains($html, 'testimonials-section') || str_contains($html, 'id="reviews"')) {
			$review_index = (int) $index;
			break;
		}
	}

	if (null === $review_index) {
		$video_index = null;
		foreach ($sections as $index => $section) {
			if ('video' === (string) ($section['label'] ?? '')) {
				$video_index = (int) $index;
				break;
			}
		}

		array_splice($sections, null === $video_index ? count($sections) : $video_index + 1, 0, [$default_review]);
		return $sections;
	}

	$current_html = (string) ($sections[$review_index]['html'] ?? '');
	if (str_contains($current_html, 'Делали ленточный фундамент')) {
		return $sections;
	}

	if (stroybrigada_import_foundation_reviews_are_generic($current_html)) {
		$sections[$review_index] = $default_review;
	}

	return $sections;
}

function stroybrigada_import_update_page_fields(array $page, int $post_id): void {
	stroybrigada_update_field('stroybrigada_h1', (string) ($page['h1'] ?? get_the_title($post_id)), $post_id);
	stroybrigada_update_field('stroybrigada_inline_styles', (string) ($page['inlineStyles'] ?? ''), $post_id);
	if (stroybrigada_page_sections_were_edited($post_id)) {
		$meta_key = stroybrigada_sections_meta_key($post_id);
		if (! metadata_exists('post', $post_id, $meta_key)) {
			$snapshot = get_post_meta($post_id, '_stroybrigada_page_editor_sections_snapshot', true);
			$sections = is_array($snapshot) ? $snapshot : stroybrigada_get_page_sections($post_id);
		}

		$sections = isset($sections) ? $sections : stroybrigada_get_page_sections($post_id);
		$sections = stroybrigada_import_add_missing_video_items($sections, (array) ($page['sections'] ?? []));
		if ('service_ustroystvo_fundamentov_otmostok_parkovok' === (string) ($page['sourceId'] ?? '')) {
			$sections = stroybrigada_import_fix_foundation_reviews($sections, (array) ($page['sections'] ?? []));
		}
		stroybrigada_update_page_sections($post_id, $sections, true);
	} else {
		stroybrigada_update_page_sections($post_id, (array) ($page['sections'] ?? []));
	}
	stroybrigada_update_field('stroybrigada_modals_html', (string) ($page['modalsHtml'] ?? ''), $post_id);
	stroybrigada_update_field('stroybrigada_section_visibility', (array) ($page['sectionVisibility'] ?? []), $post_id);
}

function stroybrigada_sync_required_pages(): array {
	$data = stroybrigada_read_import_data();
	$report = ['created' => 0, 'updated' => 0, 'skipped' => 0, 'errors' => []];
	if (! $data) {
		$report['errors'][] = __('Файл данных импорта не найден или повреждён.', 'stroybrigada');
		return $report;
	}

	$required_source_ids = array_flip(stroybrigada_import_required_page_source_ids());
	$pages_by_source     = [];

	foreach ((array) ($data['pages'] ?? []) as $page) {
		$source_id = (string) ($page['sourceId'] ?? '');
		if (! isset($required_source_ids[$source_id])) {
			continue;
		}

		$post_id = stroybrigada_import_upsert_post($page, 'page', $report);
		if (! $post_id) {
			continue;
		}

		$pages_by_source[$source_id] = $post_id;
		stroybrigada_import_update_page_fields($page, $post_id);
	}

	if (! empty($pages_by_source['home'])) {
		update_option('show_on_front', 'page');
		update_option('page_on_front', $pages_by_source['home']);
	}

	flush_rewrite_rules(false);

	return $report;
}

function stroybrigada_sync_required_pages_once(): void {
	if (wp_doing_ajax() || wp_doing_cron()) {
		return;
	}

	$sync_version = '20260721_foundation_reviews_isolated_by_post_id';
	if ($sync_version === get_option('stroybrigada_required_pages_sync_version')) {
		return;
	}

	$report = stroybrigada_sync_required_pages();
	if (empty($report['errors'])) {
		update_option('stroybrigada_required_pages_sync_version', $sync_version, false);
	}
}
add_action('init', 'stroybrigada_sync_required_pages_once', 20);

function stroybrigada_run_import(): array {
	if (! current_user_can('manage_options')) {
		return ['created' => 0, 'updated' => 0, 'skipped' => 0, 'errors' => [__('Недостаточно прав.', 'stroybrigada')]];
	}

	$data = stroybrigada_read_import_data();
	$report = ['created' => 0, 'updated' => 0, 'skipped' => 0, 'errors' => []];
	if (! $data) {
		$report['errors'][] = __('Файл данных импорта не найден или повреждён.', 'stroybrigada');
		return $report;
	}

	stroybrigada_import_options((array) ($data['options'] ?? []));
	$term_ids = stroybrigada_import_terms((array) ($data['categories'] ?? []));

	$pages_by_source = [];
	$services_by_source = [];

	foreach ((array) ($data['pages'] ?? []) as $page) {
		$post_type = 'page';
		$post_id = stroybrigada_import_upsert_post($page, $post_type, $report);
		if (! $post_id) {
			continue;
		}

		$source_id = (string) $page['sourceId'];
		$pages_by_source[$source_id] = $post_id;

		stroybrigada_import_update_page_fields($page, $post_id);
		stroybrigada_import_page_assets($page, $post_id, $report);
	}

	foreach ((array) ($data['priceLists'] ?? []) as $price_list) {
		$post_id = stroybrigada_import_upsert_post($price_list, 'price_list', $report);
		if (! $post_id) {
			continue;
		}

		stroybrigada_update_field('price_actual_date', (string) ($price_list['actual_date'] ?? ''), $post_id);
		stroybrigada_update_field('price_intro', (string) ($price_list['intro'] ?? ''), $post_id);
		stroybrigada_update_field('price_rows', (array) ($price_list['rows'] ?? []), $post_id);
		stroybrigada_update_field('price_note', (string) ($price_list['note'] ?? ''), $post_id);
	}

	foreach ((array) ($data['faqs'] ?? []) as $faq) {
		$post_id = stroybrigada_import_upsert_post($faq, 'faq', $report);
		if ($post_id) {
			stroybrigada_update_field('faq_question', (string) ($faq['question'] ?? get_the_title($post_id)), $post_id);
			stroybrigada_update_field('faq_answer', (string) ($faq['answer'] ?? ''), $post_id);
		}
	}

	foreach ((array) ($data['reviews'] ?? []) as $review) {
		$post_id = stroybrigada_import_upsert_post($review, 'review', $report);
		if ($post_id) {
			stroybrigada_update_field('review_client_name', (string) ($review['client_name'] ?? get_the_title($post_id)), $post_id);
			stroybrigada_update_field('review_rating', (int) ($review['rating'] ?? 5), $post_id);
			stroybrigada_update_field('review_text', (string) ($review['text'] ?? ''), $post_id);
			stroybrigada_update_field('review_source', (string) ($review['source'] ?? ''), $post_id);
		}
	}

	if (! empty($pages_by_source['home'])) {
		update_option('show_on_front', 'page');
		update_option('page_on_front', $pages_by_source['home']);
	}

	stroybrigada_import_menus($pages_by_source, $services_by_source);
	flush_rewrite_rules(false);

	return $report;
}

function stroybrigada_register_import_page(): void {
	add_theme_page(
		__('Импорт Stroybrigada', 'stroybrigada'),
		__('Импорт Stroybrigada', 'stroybrigada'),
		'manage_options',
		'stroybrigada-import',
		'stroybrigada_render_import_page'
	);
}
add_action('admin_menu', 'stroybrigada_register_import_page');

function stroybrigada_render_import_page(): void {
	$report = null;
	if ('POST' === ($_SERVER['REQUEST_METHOD'] ?? '') && check_admin_referer('stroybrigada_import')) {
		$report = stroybrigada_run_import();
	}
	?>
	<div class="wrap">
		<h1><?php esc_html_e('Импорт Stroybrigada', 'stroybrigada'); ?></h1>
		<p><?php esc_html_e('Импорт создаёт или обновляет стартовые страницы, услуги, меню, настройки, прайсы, FAQ и медиафайлы. Повторный запуск не создаёт дубли по source ID.', 'stroybrigada'); ?></p>
		<?php if (is_array($report)) : ?>
			<div class="notice notice-info"><p>
				<?php
				printf(
					esc_html__('Создано: %1$d. Обновлено: %2$d. Пропущено: %3$d. Ошибок: %4$d.', 'stroybrigada'),
					(int) $report['created'],
					(int) $report['updated'],
					(int) $report['skipped'],
					count((array) $report['errors'])
				);
				?>
			</p></div>
			<?php if (! empty($report['errors'])) : ?>
				<ul>
					<?php foreach ($report['errors'] as $error) : ?>
						<li><?php echo esc_html((string) $error); ?></li>
					<?php endforeach; ?>
				</ul>
			<?php endif; ?>
		<?php endif; ?>
		<form method="post">
			<?php wp_nonce_field('stroybrigada_import'); ?>
			<?php submit_button(__('Запустить импорт', 'stroybrigada')); ?>
		</form>
	</div>
	<?php
}
