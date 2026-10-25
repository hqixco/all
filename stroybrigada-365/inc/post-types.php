<?php
/**
 * Custom post types and taxonomies.
 *
 * @package Stroybrigada
 */

declare(strict_types=1);

if (! defined('ABSPATH')) {
	exit;
}

function stroybrigada_register_content_types(): void {
	register_post_type(
		'service',
		[
			'labels'              => [
				'name'          => __('Услуги', 'stroybrigada'),
				'singular_name' => __('Услуга', 'stroybrigada'),
			],
			'public'              => true,
			'publicly_queryable'  => true,
			'show_ui'             => true,
			'show_in_menu'        => false,
			'show_in_rest'        => true,
			'has_archive'         => false,
			'rewrite'             => false,
			'menu_position'       => 21,
			'menu_icon'           => 'dashicons-admin-tools',
			'supports'            => ['title', 'editor', 'thumbnail', 'excerpt', 'revisions', 'page-attributes'],
			'capability_type'     => 'post',
		]
	);

	register_post_type(
		'project',
		[
			'labels'              => [
				'name'          => __('Кейсы', 'stroybrigada'),
				'singular_name' => __('Кейс', 'stroybrigada'),
				'add_new_item'  => __('Добавить кейс', 'stroybrigada'),
				'edit_item'     => __('Редактировать кейс', 'stroybrigada'),
			],
			'public'              => false,
			'publicly_queryable'  => false,
			'show_ui'             => true,
			'show_in_menu'        => false,
			'show_in_rest'        => true,
			'has_archive'         => false,
			'rewrite'             => false,
			'menu_position'       => 22,
			'menu_icon'           => 'dashicons-format-gallery',
			'supports'            => ['title', 'editor', 'thumbnail', 'excerpt', 'revisions'],
		]
	);

	register_post_type(
		'review',
		[
			'labels'              => [
				'name'          => __('Отзывы', 'stroybrigada'),
				'singular_name' => __('Отзыв', 'stroybrigada'),
			],
			'public'              => false,
			'publicly_queryable'  => false,
			'show_ui'             => true,
			'show_in_menu'        => false,
			'show_in_rest'        => true,
			'has_archive'         => false,
			'rewrite'             => false,
			'menu_position'       => 23,
			'menu_icon'           => 'dashicons-star-filled',
			'supports'            => ['title', 'thumbnail', 'revisions'],
		]
	);

	register_post_type(
		'stroybrigada_video',
		[
			'labels'              => [
				'name'          => __('Видео', 'stroybrigada'),
				'singular_name' => __('Видео', 'stroybrigada'),
				'add_new_item'  => __('Добавить видео', 'stroybrigada'),
				'edit_item'     => __('Редактировать видео', 'stroybrigada'),
			],
			'public'              => false,
			'publicly_queryable'  => false,
			'show_ui'             => true,
			'show_in_menu'        => false,
			'show_in_rest'        => true,
			'has_archive'         => false,
			'rewrite'             => false,
			'menu_position'       => 23,
			'menu_icon'           => 'dashicons-video-alt3',
			'supports'            => ['title', 'revisions', 'page-attributes'],
		]
	);

	register_post_type(
		'faq',
		[
			'labels'              => [
				'name'          => __('FAQ', 'stroybrigada'),
				'singular_name' => __('Вопрос FAQ', 'stroybrigada'),
			],
			'public'              => false,
			'publicly_queryable'  => false,
			'show_ui'             => true,
			'show_in_menu'        => false,
			'show_in_rest'        => true,
			'has_archive'         => false,
			'rewrite'             => false,
			'menu_position'       => 24,
			'menu_icon'           => 'dashicons-editor-help',
			'supports'            => ['title', 'revisions', 'page-attributes'],
		]
	);

	register_post_type(
		'price_list',
		[
			'labels'              => [
				'name'          => __('Таблицы цен', 'stroybrigada'),
				'singular_name' => __('Таблица цен', 'stroybrigada'),
			],
			'public'              => false,
			'publicly_queryable'  => false,
			'show_ui'             => true,
			'show_in_menu'        => false,
			'show_in_rest'        => true,
			'has_archive'         => false,
			'rewrite'             => false,
			'menu_position'       => 25,
			'menu_icon'           => 'dashicons-table-col-after',
			'supports'            => ['title', 'revisions'],
		]
	);

	register_taxonomy(
		'service_category',
		['service', 'project', 'review', 'faq', 'price_list'],
		[
			'labels'            => [
				'name'          => __('Направления услуг', 'stroybrigada'),
				'singular_name' => __('Направление услуги', 'stroybrigada'),
			],
			'public'            => false,
			'publicly_queryable'=> false,
			'hierarchical'      => true,
			'show_ui'           => true,
			'show_admin_column' => true,
			'show_in_rest'      => true,
			'rewrite'           => false,
		]
	);
}
add_action('init', 'stroybrigada_register_content_types');

function stroybrigada_hide_page_managed_admin_menus(): void {
	foreach (['service', 'project', 'stroybrigada_video', 'review', 'faq', 'price_list'] as $post_type) {
		remove_menu_page('edit.php?post_type=' . $post_type);
	}
}
add_action('admin_menu', 'stroybrigada_hide_page_managed_admin_menus', 999);

function stroybrigada_case_meta_defaults(): array {
	return [
		'_stroybrigada_case_pages'       => [],
		'_stroybrigada_case_main_image'  => '',
		'_stroybrigada_case_preview'     => '',
		'_stroybrigada_case_gallery'     => [],
		'_stroybrigada_case_description' => '',
		'_stroybrigada_case_chips'       => [],
	];
}

function stroybrigada_case_get_pages(int $post_id): array {
	$value = get_post_meta($post_id, '_stroybrigada_case_pages', true);
	if (! is_array($value)) {
		return [];
	}

	return array_values(array_filter(array_map('absint', $value)));
}

function stroybrigada_review_get_pages(int $post_id): array {
	$value = get_post_meta($post_id, '_stroybrigada_review_pages', true);
	if (! is_array($value)) {
		return [];
	}

	return array_values(array_filter(array_map('absint', $value)));
}

function stroybrigada_reviews_admin_url(int $review_id = 0, int $review_page_id = 0): string {
	$url = admin_url('admin.php?page=stroybrigada-reviews');
	if ($review_page_id > 0) {
		$url = add_query_arg('review_page', $review_page_id, $url);
	}

	return $review_id > 0 ? $url . '#review-' . $review_id : $url;
}

function stroybrigada_cases_admin_url(int $case_id = 0, int $case_page_id = 0): string {
	$url = admin_url('admin.php?page=stroybrigada-cases');
	if ($case_page_id > 0) {
		$url = add_query_arg('case_page', $case_page_id, $url);
	}

	return $case_id > 0 ? $url . '#case-' . $case_id : $url;
}

function stroybrigada_case_is_selectable_page(WP_Post $page): bool {
	$slug = trim((string) $page->post_name);
	$title = trim((string) get_the_title($page));
	$title_lc = function_exists('mb_strtolower') ? mb_strtolower($title) : strtolower($title);
	$technical_slugs = [
		'404',
		'cookie',
		'karta-saita',
		'karta-sajta',
		'personal',
		'policy',
		'politika-konfidentsialnosti',
		'sitemap',
		'soglasie-na-obrabotku-personalnyh-dannyh',
	];

	return ! in_array($slug, $technical_slugs, true)
		&& ! str_contains($title_lc, 'карта сайта')
		&& ! str_contains($title_lc, 'политик')
		&& ! str_contains($title_lc, 'согласи')
		&& ! str_contains($title_lc, 'cookie');
}

function stroybrigada_case_selectable_pages(): array {
	return array_values(
		array_filter(
			get_pages(['sort_column' => 'menu_order,post_title', 'sort_order' => 'ASC']),
			static fn($page): bool => $page instanceof WP_Post && stroybrigada_case_is_selectable_page($page)
		)
	);
}

function stroybrigada_register_cases_page(): void {
	add_menu_page(
		__('Кейсы', 'stroybrigada'),
		__('Кейсы', 'stroybrigada'),
		'edit_posts',
		'stroybrigada-cases',
		'stroybrigada_render_cases_page',
		'dashicons-format-gallery',
		22
	);
}
add_action('admin_menu', 'stroybrigada_register_cases_page');

function stroybrigada_case_sanitize_images($value): array {
	if (! is_array($value)) {
		return [];
	}

	return array_values(
		array_filter(
			array_map(
				static fn($image): string => str_replace(['"', "'"], '', sanitize_text_field((string) $image)),
				wp_unslash($value)
			)
		)
	);
}

function stroybrigada_case_sanitize_chips($value): array {
	if (! is_array($value)) {
		return [];
	}

	return array_values(
		array_filter(
			array_map(
				static fn($chip): string => sanitize_text_field((string) $chip),
				wp_unslash($value)
			),
			static fn(string $chip): bool => '' !== trim($chip)
		)
	);
}

function stroybrigada_case_save_values(int $post_id, array $data): void {
	$title = isset($data['title']) ? sanitize_text_field(wp_unslash((string) $data['title'])) : __('Новый кейс', 'stroybrigada');
	$description = isset($data['description']) ? sanitize_textarea_field(wp_unslash((string) $data['description'])) : '';
	$status = isset($data['enabled']) ? 'publish' : 'draft';

	wp_update_post(
		[
			'ID'           => $post_id,
			'post_title'   => '' !== $title ? $title : __('Новый кейс', 'stroybrigada'),
			'post_excerpt' => $description,
			'post_status'  => $status,
		]
	);

	$pages = isset($data['pages']) && is_array($data['pages'])
		? array_values(array_unique(array_filter(array_map('absint', wp_unslash($data['pages'])))))
		: [];
	update_post_meta($post_id, '_stroybrigada_case_pages', $pages);

	$photos = stroybrigada_case_sanitize_images($data['photos'] ?? []);
	if (! $photos) {
		$legacy_main = isset($data['main_image']) ? [wp_unslash((string) $data['main_image'])] : [];
		$photos = array_merge($legacy_main, stroybrigada_case_sanitize_images($data['gallery'] ?? []));
		$photos = array_values(array_filter(array_map(static fn($image): string => str_replace(['"', "'"], '', sanitize_text_field((string) $image)), $photos)));
	}

	$main_image = (string) ($photos[0] ?? '');
	update_post_meta($post_id, '_stroybrigada_case_main_image', $main_image);
	update_post_meta($post_id, '_stroybrigada_case_preview', $main_image);

	update_post_meta($post_id, '_stroybrigada_case_description', $description);
	update_post_meta($post_id, '_stroybrigada_case_gallery', array_values(array_slice($photos, 1)));
	update_post_meta($post_id, '_stroybrigada_case_chips', stroybrigada_case_sanitize_chips($data['chips'] ?? []));
}

function stroybrigada_handle_cases_page_actions(): void {
	if (! is_admin() || ! current_user_can('edit_posts') || empty($_POST['stroybrigada_cases_action'])) {
		return;
	}

	$action = sanitize_key((string) wp_unslash($_POST['stroybrigada_cases_action']));
	$case_page_id = absint($_POST['case_page'] ?? 0);
	if (! isset($_POST['stroybrigada_cases_nonce']) || ! wp_verify_nonce(sanitize_text_field(wp_unslash((string) $_POST['stroybrigada_cases_nonce'])), 'stroybrigada_cases_action')) {
		wp_safe_redirect(add_query_arg('case_notice', 'failed', stroybrigada_cases_admin_url(0, $case_page_id)));
		exit;
	}

	if ('create' === $action) {
		$post_id = wp_insert_post(
			[
				'post_type'   => 'project',
				'post_status' => isset($_POST['case']['enabled']) ? 'publish' : 'draft',
				'post_title'  => __('Новый кейс', 'stroybrigada'),
			],
			true
		);
		if (! is_wp_error($post_id) && (int) $post_id > 0) {
			stroybrigada_case_save_values((int) $post_id, is_array($_POST['case'] ?? null) ? (array) $_POST['case'] : []);
			wp_safe_redirect(add_query_arg('case_notice', 'created', stroybrigada_cases_admin_url((int) $post_id, $case_page_id)));
			exit;
		}
	} elseif ('save' === $action) {
		$post_id = absint($_POST['case_id'] ?? 0);
		if ($post_id > 0 && current_user_can('edit_post', $post_id)) {
			stroybrigada_case_save_values($post_id, is_array($_POST['case'] ?? null) ? (array) $_POST['case'] : []);
			wp_safe_redirect(add_query_arg('case_notice', 'saved', stroybrigada_cases_admin_url($post_id, $case_page_id)));
			exit;
		}
	} elseif ('delete' === $action) {
		$post_id = absint($_POST['case_id'] ?? 0);
		if ($post_id > 0 && current_user_can('delete_post', $post_id)) {
			wp_delete_post($post_id, true);
			wp_safe_redirect(add_query_arg('case_notice', 'deleted', stroybrigada_cases_admin_url(0, $case_page_id)));
			exit;
		}
	}

	wp_safe_redirect(add_query_arg('case_notice', 'failed', stroybrigada_cases_admin_url(0, $case_page_id)));
	exit;
}
add_action('admin_init', 'stroybrigada_handle_cases_page_actions');

function stroybrigada_case_image_preview(string $src): string {
	if (function_exists('stroybrigada_page_editor_image_preview_url')) {
		return stroybrigada_page_editor_image_preview_url($src);
	}

	if (str_starts_with($src, '/assets/')) {
		return STROYBRIGADA_ASSETS_URL . 'dist/' . ltrim(substr($src, 8), '/');
	}

	return $src;
}

function stroybrigada_render_cases_page_notice(): void {
	$notice = isset($_GET['case_notice']) ? sanitize_key((string) wp_unslash($_GET['case_notice'])) : '';
	$messages = [
		'created' => __('Кейс добавлен.', 'stroybrigada'),
		'saved'   => __('Кейс сохранен.', 'stroybrigada'),
		'deleted' => __('Кейс удален.', 'stroybrigada'),
		'failed'  => __('Не удалось выполнить действие.', 'stroybrigada'),
	];
	if (! isset($messages[$notice])) {
		return;
	}

	$class = 'failed' === $notice ? 'notice-error' : 'notice-success';
	printf('<div class="notice %s is-dismissible"><p>%s</p></div>', esc_attr($class), esc_html($messages[$notice]));
}

function stroybrigada_render_case_card_admin(?WP_Post $case, array $pages, int $active_page_id = 0): void {
	$is_new = ! $case;
	$post_id = $case ? (int) $case->ID : 0;
	$title = $case ? get_the_title($case) : '';
	$selected_pages = $case ? stroybrigada_case_get_pages($post_id) : ($active_page_id > 0 ? [$active_page_id] : []);
	$main_image = $case ? (string) get_post_meta($post_id, '_stroybrigada_case_main_image', true) : '';
	$description = $case ? (string) get_post_meta($post_id, '_stroybrigada_case_description', true) : '';
	$gallery = $case ? get_post_meta($post_id, '_stroybrigada_case_gallery', true) : [];
	$gallery = is_array($gallery) ? array_values(array_filter(array_map('strval', $gallery))) : [];
	$photos = array_values(array_filter(array_merge('' !== $main_image ? [$main_image] : [], $gallery)));
	$chips = $case ? get_post_meta($post_id, '_stroybrigada_case_chips', true) : [];
	$chips = is_array($chips) ? array_values(array_filter(array_map('strval', $chips))) : [];
	if ($active_page_id > 0) {
		usort(
			$pages,
			static function ($left, $right) use ($active_page_id): int {
				$left_is_active = $left instanceof WP_Post && (int) $left->ID === $active_page_id;
				$right_is_active = $right instanceof WP_Post && (int) $right->ID === $active_page_id;

				return $left_is_active === $right_is_active ? 0 : ($left_is_active ? -1 : 1);
			}
		);
	}
	?>
	<form id="<?php echo esc_attr($is_new ? 'case-new' : 'case-' . $post_id); ?>" class="stroybrigada-cases-card<?php echo $is_new ? ' stroybrigada-cases-card--new' : ''; ?>" method="post">
		<?php wp_nonce_field('stroybrigada_cases_action', 'stroybrigada_cases_nonce'); ?>
		<input type="hidden" name="stroybrigada_cases_action" value="<?php echo esc_attr($is_new ? 'create' : 'save'); ?>">
		<input type="hidden" name="case_page" value="<?php echo esc_attr((string) $active_page_id); ?>">
		<?php if (! $is_new) : ?>
			<input type="hidden" name="case_id" value="<?php echo esc_attr((string) $post_id); ?>">
		<?php endif; ?>
		<header class="stroybrigada-cases-card__header">
			<div>
				<label><?php esc_html_e('Заголовок', 'stroybrigada'); ?></label>
				<input type="text" name="case[title]" value="<?php echo esc_attr($title); ?>" placeholder="<?php echo esc_attr__('Название кейса', 'stroybrigada'); ?>">
			</div>
			<label class="stroybrigada-cases-card__toggle">
				<input type="checkbox" name="case[enabled]" value="1" <?php checked($is_new || ($case && 'publish' === $case->post_status)); ?>>
				<span><?php esc_html_e('Показывать', 'stroybrigada'); ?></span>
			</label>
		</header>
		<label class="stroybrigada-cases-card__field">
			<span><?php esc_html_e('Описание', 'stroybrigada'); ?></span>
			<textarea name="case[description]" rows="3"><?php echo esc_textarea($description); ?></textarea>
		</label>
		<div class="stroybrigada-cases-card__field">
			<div class="stroybrigada-cases-card__label-row">
				<strong><?php esc_html_e('Чипы на карточке', 'stroybrigada'); ?></strong>
				<button type="button" class="button stroybrigada-cases-chip-add"><?php esc_html_e('Добавить чип', 'stroybrigada'); ?></button>
			</div>
			<div class="stroybrigada-cases-chips" data-case-chips>
				<?php foreach ($chips as $chip) : ?>
					<div class="stroybrigada-cases-chips__row">
						<input type="text" name="case[chips][]" value="<?php echo esc_attr($chip); ?>" placeholder="<?php echo esc_attr__('Например: 21 м2', 'stroybrigada'); ?>">
						<button type="button" class="button stroybrigada-cases-chip-remove"><?php esc_html_e('Удалить', 'stroybrigada'); ?></button>
					</div>
				<?php endforeach; ?>
			</div>
			<p class="description"><?php esc_html_e('Если не добавить ни одного чипа, на сайте блок чипов у этого кейса не выводится.', 'stroybrigada'); ?></p>
		</div>
		<div class="stroybrigada-cases-card__field">
			<div class="stroybrigada-cases-card__label-row">
				<strong><?php esc_html_e('Фото кейса', 'stroybrigada'); ?></strong>
				<button type="button" class="button stroybrigada-cases-gallery-add"><?php esc_html_e('Добавить фото', 'stroybrigada'); ?></button>
			</div>
			<div class="stroybrigada-cases-gallery" data-case-gallery>
				<?php foreach ($photos as $image) : ?>
					<div class="stroybrigada-cases-gallery__tile" draggable="true" data-case-gallery-tile>
						<button type="button" class="stroybrigada-cases-gallery__remove stroybrigada-cases-gallery-remove" aria-label="<?php echo esc_attr__('Удалить фото', 'stroybrigada'); ?>">×</button>
						<img src="<?php echo esc_url(stroybrigada_case_image_preview($image)); ?>" alt="">
						<input type="hidden" name="case[photos][]" value="<?php echo esc_attr($image); ?>">
						<span class="stroybrigada-cases-gallery__main-badge"><?php esc_html_e('Главная', 'stroybrigada'); ?></span>
					</div>
				<?php endforeach; ?>
			</div>
			<p class="description"><?php esc_html_e('Первая фотка автоматически используется как главное фото. Перетащите фото мышью, чтобы изменить порядок.', 'stroybrigada'); ?></p>
		</div>
		<div class="stroybrigada-cases-card__field">
			<strong><?php esc_html_e('Показывать на страницах', 'stroybrigada'); ?></strong>
			<div class="stroybrigada-cases-pages">
				<?php foreach ($pages as $page) : ?>
					<label>
						<input type="checkbox" name="case[pages][]" value="<?php echo esc_attr((string) $page->ID); ?>" <?php checked(in_array((int) $page->ID, $selected_pages, true)); ?>>
						<span><?php echo esc_html(get_the_title($page)); ?></span>
					</label>
				<?php endforeach; ?>
			</div>
		</div>
		<footer class="stroybrigada-cases-card__footer">
			<button type="submit" class="button button-primary"><?php echo esc_html($is_new ? __('Добавить кейс', 'stroybrigada') : __('Сохранить кейс', 'stroybrigada')); ?></button>
			<?php if (! $is_new) : ?>
				<button type="submit" class="button stroybrigada-cases-card__delete" name="stroybrigada_cases_action" value="delete" onclick="return confirm('<?php echo esc_js(__('Удалить кейс?', 'stroybrigada')); ?>');"><?php esc_html_e('Удалить кейс', 'stroybrigada'); ?></button>
			<?php endif; ?>
		</footer>
	</form>
	<?php
}

function stroybrigada_render_cases_page(): void {
	if (! current_user_can('edit_posts')) {
		wp_die(esc_html__('Недостаточно прав.', 'stroybrigada'));
	}

	$active_page_id = isset($_GET['case_page']) ? absint($_GET['case_page']) : 0;
	$cases = get_posts(
		[
			'post_type'      => 'project',
			'post_status'    => ['publish', 'draft'],
			'posts_per_page' => -1,
			'orderby'        => ['menu_order' => 'ASC', 'date' => 'DESC'],
		]
	);
	$pages = stroybrigada_case_selectable_pages();
	$all_cases_count = count($cases);
	$page_ids = array_map(static fn(WP_Post $page): int => (int) $page->ID, $pages);
	if ($active_page_id > 0 && ! in_array($active_page_id, $page_ids, true)) {
		$active_page_id = 0;
	}
	$case_counts = array_fill_keys($page_ids, 0);
	foreach ($cases as $case) {
		if (! $case instanceof WP_Post) {
			continue;
		}
		foreach (stroybrigada_case_get_pages((int) $case->ID) as $case_page_id) {
			if (isset($case_counts[$case_page_id])) {
				$case_counts[$case_page_id]++;
			}
		}
	}
	if ($active_page_id > 0) {
		$cases = array_values(
			array_filter(
				$cases,
				static fn($case): bool => $case instanceof WP_Post && in_array($active_page_id, stroybrigada_case_get_pages((int) $case->ID), true)
			)
		);
	}
	$base_url = admin_url('admin.php?page=stroybrigada-cases');
	?>
	<div class="wrap stroybrigada-cases-admin">
		<style>
			.stroybrigada-cases-menu{display:flex;flex-wrap:wrap;gap:8px;margin:14px 0 18px}
			.stroybrigada-cases-topbar{display:flex;justify-content:flex-start;gap:10px;margin:0 0 14px}
			.stroybrigada-cases-menu .button{display:inline-flex;align-items:center;gap:6px;border-radius:999px}
			.stroybrigada-cases-menu__count{display:inline-flex;align-items:center;justify-content:center;min-width:20px;height:20px;padding:0 6px;border-radius:999px;background:#f0f0f1;color:#50575e;font-size:11px;line-height:1}
			.stroybrigada-cases-menu .button-primary .stroybrigada-cases-menu__count{background:rgba(255,255,255,.2);color:#fff}
			.stroybrigada-cases-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:18px;align-items:start}
			.stroybrigada-cases-card{display:grid;gap:14px;padding:16px;border:1px solid #dcdcde;border-radius:12px;background:#fff;box-shadow:0 8px 24px rgba(15,23,42,.05)}
			.stroybrigada-cases-card--new{border-style:dashed;background:#f8fafc}
			.stroybrigada-cases-card__header{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;align-items:end}
			.stroybrigada-cases-card label,.stroybrigada-cases-card__field{display:grid;gap:6px}
			.stroybrigada-cases-card input[type=text],.stroybrigada-cases-card textarea{width:100%;box-sizing:border-box}
			.stroybrigada-cases-card__toggle{display:flex!important;gap:8px;align-items:center;padding:8px 10px;border:1px solid #dcdcde;border-radius:8px;background:#f8fafc}
			.stroybrigada-cases-card__label-row{display:flex;justify-content:space-between;gap:10px;align-items:center}
			.stroybrigada-cases-gallery{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
			.stroybrigada-cases-gallery__tile{position:relative;aspect-ratio:1/1;border:1px solid #dcdcde;border-radius:10px;background:#f6f7f7;overflow:hidden;cursor:grab;box-sizing:border-box}
			.stroybrigada-cases-gallery__tile:active{cursor:grabbing}
			.stroybrigada-cases-gallery__tile:first-child{border:3px solid #549168;box-shadow:0 0 0 2px rgba(84,145,104,.18)}
			.stroybrigada-cases-gallery__tile.is-dragging{opacity:.55}
			.stroybrigada-cases-gallery__tile img{display:block;width:100%;height:100%;object-fit:cover}
			.stroybrigada-cases-gallery__remove{position:absolute;top:6px;right:6px;z-index:3;display:grid;place-items:center;width:26px;height:26px;border:0;border-radius:999px;background:#ef4444;color:#fff;font-size:18px;line-height:1;font-weight:700;cursor:pointer;box-shadow:0 6px 14px rgba(0,0,0,.22)}
			.stroybrigada-cases-gallery__main-badge{position:absolute;left:6px;bottom:6px;z-index:2;display:none;padding:4px 7px;border-radius:999px;background:#549168;color:#fff;font-size:10px;line-height:1;font-weight:800;text-transform:uppercase}
			.stroybrigada-cases-gallery__tile:first-child .stroybrigada-cases-gallery__main-badge{display:inline-flex}
			.stroybrigada-cases-chips{display:grid;gap:8px}
			.stroybrigada-cases-chips__row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:6px;align-items:center}
			.stroybrigada-cases-pages{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;max-height:190px;overflow:auto;padding:10px;border:1px solid #dcdcde;border-radius:8px;background:#f8fafc}
			.stroybrigada-cases-pages label{display:flex;gap:8px;align-items:flex-start}
			.stroybrigada-cases-card__footer{display:flex;justify-content:space-between;gap:10px;align-items:center;padding-top:4px}
			.stroybrigada-cases-card__delete{color:#b91c1c!important;border-color:rgba(185,28,28,.35)!important}
			@media(max-width:1600px){.stroybrigada-cases-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
			@media(max-width:1280px){.stroybrigada-cases-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
			@media(max-width:960px){.stroybrigada-cases-grid{grid-template-columns:1fr}}
			@media(max-width:782px){.stroybrigada-cases-card__header,.stroybrigada-cases-pages,.stroybrigada-cases-chips__row{grid-template-columns:1fr}.stroybrigada-cases-gallery{grid-template-columns:repeat(3,minmax(0,1fr))}}
		</style>
		<h1><?php esc_html_e('Кейсы', 'stroybrigada'); ?></h1>
		<?php stroybrigada_render_cases_page_notice(); ?>
		<p><?php esc_html_e('Карточки здесь общие для сайта. В каждой карточке выберите страницы, на которых она должна выводиться в блоке кейсов.', 'stroybrigada'); ?></p>
		<div class="stroybrigada-cases-topbar">
			<button type="button" class="button button-primary" data-stroybrigada-cases-save-all><?php esc_html_e('Сохранить все', 'stroybrigada'); ?></button>
		</div>
		<div class="stroybrigada-cases-menu" aria-label="<?php echo esc_attr__('Фильтр кейсов по страницам', 'stroybrigada'); ?>">
			<a class="button<?php echo 0 === $active_page_id ? ' button-primary' : ''; ?>" href="<?php echo esc_url($base_url); ?>">
				<span><?php esc_html_e('Все', 'stroybrigada'); ?></span>
				<span class="stroybrigada-cases-menu__count"><?php echo esc_html((string) $all_cases_count); ?></span>
			</a>
			<?php foreach ($pages as $page) : ?>
				<?php $page_id = (int) $page->ID; ?>
				<a class="button<?php echo $active_page_id === $page_id ? ' button-primary' : ''; ?>" href="<?php echo esc_url(add_query_arg('case_page', $page_id, $base_url)); ?>">
					<span><?php echo esc_html(get_the_title($page)); ?></span>
					<span class="stroybrigada-cases-menu__count"><?php echo esc_html((string) ($case_counts[$page_id] ?? 0)); ?></span>
				</a>
			<?php endforeach; ?>
		</div>
		<div class="stroybrigada-cases-grid">
			<?php stroybrigada_render_case_card_admin(null, $pages, $active_page_id); ?>
			<?php foreach ($cases as $case) : ?>
				<?php if ($case instanceof WP_Post) : ?>
					<?php stroybrigada_render_case_card_admin($case, $pages, $active_page_id); ?>
				<?php endif; ?>
			<?php endforeach; ?>
		</div>
	</div>
	<?php
}

function stroybrigada_register_case_metaboxes(): void {
	add_meta_box(
		'stroybrigada_case_card',
		__('Карточка кейса', 'stroybrigada'),
		'stroybrigada_render_case_metabox',
		'project',
		'normal',
		'high'
	);
}
add_action('add_meta_boxes_project', 'stroybrigada_register_case_metaboxes');

function stroybrigada_render_case_metabox(WP_Post $post): void {
	wp_nonce_field('stroybrigada_save_case_meta', 'stroybrigada_case_meta_nonce');

	$selected_pages = stroybrigada_case_get_pages((int) $post->ID);
	$main_image     = (string) get_post_meta((int) $post->ID, '_stroybrigada_case_main_image', true);
	$description    = (string) get_post_meta((int) $post->ID, '_stroybrigada_case_description', true);
	$gallery        = get_post_meta((int) $post->ID, '_stroybrigada_case_gallery', true);
	$gallery        = is_array($gallery) ? array_values(array_filter(array_map('strval', $gallery))) : [];
	$chips          = get_post_meta((int) $post->ID, '_stroybrigada_case_chips', true);
	$chips          = is_array($chips) ? array_values(array_filter(array_map('strval', $chips))) : [];
	$pages          = stroybrigada_case_selectable_pages();
	?>
	<style>
		.stroybrigada-case-editor { display: grid; gap: 18px; }
		.stroybrigada-case-editor__grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
		.stroybrigada-case-editor__grid--single { grid-template-columns: minmax(0, 1fr); }
		.stroybrigada-case-editor__field label { display: block; margin: 0 0 7px; font-weight: 700; }
		.stroybrigada-case-editor__field input[type="text"],
		.stroybrigada-case-editor__field textarea { width: 100%; max-width: 100%; box-sizing: border-box; }
		.stroybrigada-case-editor__media { display: grid; grid-template-columns: 120px minmax(0, 1fr); gap: 12px; align-items: start; }
		.stroybrigada-case-editor__media img { width: 120px; height: 82px; object-fit: cover; border: 1px solid #dcdcde; border-radius: 8px; background: #f6f7f7; }
		.stroybrigada-case-editor__pages { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px 14px; max-height: 260px; overflow: auto; padding: 12px; border: 1px solid #dcdcde; background: #fff; }
		.stroybrigada-case-editor__pages label { display: flex; gap: 8px; align-items: flex-start; margin: 0; }
		.stroybrigada-case-editor__gallery { display: grid; gap: 8px; }
		.stroybrigada-case-editor__gallery-row { display: grid; grid-template-columns: minmax(0, 1fr) auto auto; gap: 8px; align-items: center; }
		.stroybrigada-case-editor__chips { display: grid; gap: 8px; }
		.stroybrigada-case-editor__chip-row { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 8px; align-items: center; }
		@media (max-width: 960px) {
			.stroybrigada-case-editor__grid,
			.stroybrigada-case-editor__pages { grid-template-columns: 1fr; }
		}
	</style>
	<div class="stroybrigada-case-editor">
		<div class="stroybrigada-case-editor__field">
			<label for="stroybrigada_case_description"><?php esc_html_e('Описание на карточке', 'stroybrigada'); ?></label>
			<textarea id="stroybrigada_case_description" rows="3" name="stroybrigada_case_description"><?php echo esc_textarea($description ?: $post->post_excerpt); ?></textarea>
		</div>
		<div class="stroybrigada-case-editor__field">
			<label><?php esc_html_e('Чипы на карточке', 'stroybrigada'); ?></label>
			<div class="stroybrigada-case-editor__chips" data-case-chips>
				<?php foreach ($chips as $chip) : ?>
					<div class="stroybrigada-case-editor__chip-row">
						<input type="text" name="stroybrigada_case_chips[]" value="<?php echo esc_attr($chip); ?>" placeholder="<?php echo esc_attr__('Например: 21 м2', 'stroybrigada'); ?>">
						<button type="button" class="button stroybrigada-case-editor__remove-chip"><?php esc_html_e('Удалить', 'stroybrigada'); ?></button>
					</div>
				<?php endforeach; ?>
			</div>
			<button type="button" class="button stroybrigada-case-editor__add-chip"><?php esc_html_e('Добавить чип', 'stroybrigada'); ?></button>
			<p class="description"><?php esc_html_e('Если список пустой, чипы у кейса не выводятся.', 'stroybrigada'); ?></p>
		</div>
		<div class="stroybrigada-case-editor__grid stroybrigada-case-editor__grid--single">
			<div class="stroybrigada-case-editor__field">
				<label><?php esc_html_e('Главное фото для попапа', 'stroybrigada'); ?></label>
				<div class="stroybrigada-case-editor__media">
					<img src="<?php echo esc_url(stroybrigada_page_editor_image_preview_url($main_image)); ?>" alt="">
					<div>
						<input type="text" name="stroybrigada_case_main_image" value="<?php echo esc_attr($main_image); ?>">
						<button type="button" class="button stroybrigada-case-editor__media-button"><?php esc_html_e('Выбрать фото', 'stroybrigada'); ?></button>
					</div>
				</div>
			</div>
		</div>
		<div class="stroybrigada-case-editor__field">
			<label><?php esc_html_e('Дополнительные фото в попапе', 'stroybrigada'); ?></label>
			<div class="stroybrigada-case-editor__gallery" data-case-gallery>
				<?php foreach ($gallery as $image) : ?>
					<div class="stroybrigada-case-editor__gallery-row">
						<input type="text" name="stroybrigada_case_gallery[]" value="<?php echo esc_attr($image); ?>">
						<button type="button" class="button stroybrigada-case-editor__media-button"><?php esc_html_e('Выбрать', 'stroybrigada'); ?></button>
						<button type="button" class="button stroybrigada-case-editor__remove-gallery"><?php esc_html_e('Удалить', 'stroybrigada'); ?></button>
					</div>
				<?php endforeach; ?>
			</div>
			<button type="button" class="button stroybrigada-case-editor__add-gallery"><?php esc_html_e('Добавить фото', 'stroybrigada'); ?></button>
		</div>
		<div class="stroybrigada-case-editor__field">
			<label><?php esc_html_e('Показывать на страницах', 'stroybrigada'); ?></label>
			<div class="stroybrigada-case-editor__pages">
				<?php foreach ($pages as $page) : ?>
					<label>
						<input type="checkbox" name="stroybrigada_case_pages[]" value="<?php echo esc_attr((string) $page->ID); ?>" <?php checked(in_array((int) $page->ID, $selected_pages, true)); ?>>
						<span><?php echo esc_html(get_the_title($page)); ?></span>
					</label>
				<?php endforeach; ?>
			</div>
		</div>
	</div>
	<?php
}

function stroybrigada_save_case_meta(int $post_id, WP_Post $post): void {
	if ('project' !== $post->post_type || wp_is_post_revision($post_id) || wp_is_post_autosave($post_id)) {
		return;
	}

	if (! isset($_POST['stroybrigada_case_meta_nonce']) || ! wp_verify_nonce(sanitize_text_field(wp_unslash((string) $_POST['stroybrigada_case_meta_nonce'])), 'stroybrigada_save_case_meta')) {
		return;
	}

	if (! current_user_can('edit_post', $post_id)) {
		return;
	}

	$pages = isset($_POST['stroybrigada_case_pages']) && is_array($_POST['stroybrigada_case_pages'])
		? array_values(array_unique(array_filter(array_map('absint', wp_unslash($_POST['stroybrigada_case_pages'])))))
		: [];
	update_post_meta($post_id, '_stroybrigada_case_pages', $pages);

	$main_image = isset($_POST['stroybrigada_case_main_image']) ? str_replace(['"', "'"], '', sanitize_text_field(wp_unslash((string) $_POST['stroybrigada_case_main_image']))) : '';
	update_post_meta($post_id, '_stroybrigada_case_main_image', $main_image);
	update_post_meta($post_id, '_stroybrigada_case_preview', $main_image);

	$description = isset($_POST['stroybrigada_case_description']) ? sanitize_textarea_field(wp_unslash((string) $_POST['stroybrigada_case_description'])) : '';
	update_post_meta($post_id, '_stroybrigada_case_description', $description);

	$gallery = isset($_POST['stroybrigada_case_gallery']) && is_array($_POST['stroybrigada_case_gallery'])
		? array_values(array_filter(array_map(static fn($image): string => str_replace(['"', "'"], '', sanitize_text_field((string) $image)), wp_unslash($_POST['stroybrigada_case_gallery']))))
		: [];
	update_post_meta($post_id, '_stroybrigada_case_gallery', $gallery);

	update_post_meta($post_id, '_stroybrigada_case_chips', stroybrigada_case_sanitize_chips($_POST['stroybrigada_case_chips'] ?? []));
}
add_action('save_post_project', 'stroybrigada_save_case_meta', 10, 2);

function stroybrigada_case_admin_assets(string $hook_suffix): void {
	if (! in_array($hook_suffix, ['post.php', 'post-new.php', 'toplevel_page_stroybrigada-cases'], true)) {
		return;
	}

	$screen = get_current_screen();
	if ('toplevel_page_stroybrigada-cases' !== $hook_suffix && (! $screen || 'project' !== $screen->post_type)) {
		return;
	}

	wp_enqueue_media();
	wp_add_inline_script(
		'media-editor',
		"document.addEventListener('click',function(event){var addCards=event.target.closest('.stroybrigada-cases-gallery-add');if(addCards){event.preventDefault();var root=addCards.closest('form')||document;var list=root.querySelector('[data-case-gallery]');if(!list||!window.wp||!wp.media){return;}var frame=wp.media({title:'Выберите фото',button:{text:'Добавить фото'},multiple:true,library:{type:'image'}});frame.on('select',function(){frame.state().get('selection').each(function(attachment){var data=attachment.toJSON();if(!data||!data.url){return;}var tile=document.createElement('div');tile.className='stroybrigada-cases-gallery__tile';tile.draggable=true;tile.setAttribute('data-case-gallery-tile','');tile.innerHTML='<button type=\"button\" class=\"stroybrigada-cases-gallery__remove stroybrigada-cases-gallery-remove\" aria-label=\"Удалить фото\">×</button><img src=\"'+data.url.replace(/\"/g,'&quot;')+'\" alt=\"\"><input type=\"hidden\" name=\"case[photos][]\" value=\"'+data.url.replace(/\"/g,'&quot;')+'\"><span class=\"stroybrigada-cases-gallery__main-badge\">Главная</span>';list.appendChild(tile);});});frame.open();return;}var add=event.target.closest('.stroybrigada-case-editor__add-gallery');if(add){event.preventDefault();var root=add.closest('form')||document;var list=root.querySelector('[data-case-gallery]');if(!list){return;}var row=document.createElement('div');row.className='stroybrigada-case-editor__gallery-row';row.innerHTML='<input type=\"text\" name=\"stroybrigada_case_gallery[]\" value=\"\"><button type=\"button\" class=\"button stroybrigada-case-editor__media-button\">Выбрать</button><button type=\"button\" class=\"button stroybrigada-case-editor__remove-gallery\">Удалить</button>';list.appendChild(row);return;}var remove=event.target.closest('.stroybrigada-case-editor__remove-gallery,.stroybrigada-cases-gallery-remove');if(remove){event.preventDefault();var removeRow=remove.closest('.stroybrigada-case-editor__gallery-row,.stroybrigada-cases-gallery__tile');if(removeRow){removeRow.remove();}return;}var button=event.target.closest('.stroybrigada-case-editor__media-button');if(!button){return;}event.preventDefault();var wrap=button.closest('.stroybrigada-case-editor__media,.stroybrigada-case-editor__gallery-row');var input=wrap?wrap.querySelector('input[type=\"text\"]'):null;var preview=wrap?wrap.querySelector('img'):null;if(!input||!window.wp||!wp.media){return;}var frame=wp.media({title:'Выберите фото',button:{text:'Использовать'},multiple:false,library:{type:'image'}});frame.on('select',function(){var attachment=frame.state().get('selection').first().toJSON();if(!attachment||!attachment.url){return;}input.value=attachment.url;if(preview){preview.src=attachment.url;}});frame.open();});document.addEventListener('dragstart',function(event){var tile=event.target.closest('.stroybrigada-cases-gallery__tile');if(!tile){return;}tile.classList.add('is-dragging');event.dataTransfer.effectAllowed='move';});document.addEventListener('dragend',function(event){var tile=event.target.closest('.stroybrigada-cases-gallery__tile');if(tile){tile.classList.remove('is-dragging');}});document.addEventListener('dragover',function(event){var list=event.target.closest('.stroybrigada-cases-gallery');if(!list){return;}var dragging=list.querySelector('.is-dragging');if(!dragging){return;}event.preventDefault();var after=Array.from(list.querySelectorAll('.stroybrigada-cases-gallery__tile:not(.is-dragging)')).find(function(tile){var box=tile.getBoundingClientRect();return event.clientY<box.top+box.height/2&&event.clientX<box.left+box.width;});if(after){list.insertBefore(dragging,after);}else{list.appendChild(dragging);}});"
	);
	wp_add_inline_script(
		'media-editor',
		"document.addEventListener('click',function(event){var add=event.target.closest('.stroybrigada-cases-chip-add,.stroybrigada-case-editor__add-chip');if(add){event.preventDefault();var root=add.closest('form')||document;var list=root.querySelector('[data-case-chips]');if(!list){return;}var isCards=add.classList.contains('stroybrigada-cases-chip-add');var row=document.createElement('div');row.className=isCards?'stroybrigada-cases-chips__row':'stroybrigada-case-editor__chip-row';row.innerHTML=isCards?'<input type=\"text\" name=\"case[chips][]\" value=\"\" placeholder=\"Например: 21 м2\"><button type=\"button\" class=\"button stroybrigada-cases-chip-remove\">Удалить</button>':'<input type=\"text\" name=\"stroybrigada_case_chips[]\" value=\"\" placeholder=\"Например: 21 м2\"><button type=\"button\" class=\"button stroybrigada-case-editor__remove-chip\">Удалить</button>';list.appendChild(row);var input=row.querySelector('input');if(input){input.focus();}return;}var remove=event.target.closest('.stroybrigada-cases-chip-remove,.stroybrigada-case-editor__remove-chip');if(remove){event.preventDefault();var row=remove.closest('.stroybrigada-cases-chips__row,.stroybrigada-case-editor__chip-row');if(row){row.remove();}}});"
	);
	wp_add_inline_script(
		'media-editor',
		"document.addEventListener('click',async function(event){var button=event.target.closest('[data-stroybrigada-cases-save-all]');if(!button){return;}event.preventDefault();var forms=Array.from(document.querySelectorAll('.stroybrigada-cases-card'));forms=forms.filter(function(form){if(!form.classList.contains('stroybrigada-cases-card--new')){return true;}var title=form.querySelector('[name=\"case[title]\"]');var description=form.querySelector('[name=\"case[description]\"]');var photos=form.querySelectorAll('[name=\"case[photos][]\"]');var chips=Array.from(form.querySelectorAll('[name=\"case[chips][]\"]')).some(function(input){return input.value.trim();});return Boolean((title&&title.value.trim())||(description&&description.value.trim())||photos.length||chips);});if(!forms.length){return;}button.disabled=true;var original=button.textContent;button.textContent='Сохранение...';try{for(var i=0;i<forms.length;i++){var response=await fetch(window.location.href,{method:'POST',body:new FormData(forms[i]),credentials:'same-origin',redirect:'follow'});if(!response.ok){throw new Error('save failed');}}var url=new URL(window.location.href);url.searchParams.set('case_notice','saved');window.location.href=url.toString();}catch(error){button.disabled=false;button.textContent=original;window.alert('Не удалось сохранить все кейсы.');}});"
	);
}
add_action('admin_enqueue_scripts', 'stroybrigada_case_admin_assets');

function stroybrigada_register_reviews_page(): void {
	add_menu_page(
		__('Отзывы', 'stroybrigada'),
		__('Отзывы', 'stroybrigada'),
		'edit_posts',
		'stroybrigada-reviews',
		'stroybrigada_render_reviews_page',
		'dashicons-star-filled',
		24
	);
}
add_action('admin_menu', 'stroybrigada_register_reviews_page');

function stroybrigada_review_sanitize_chips($value): array {
	return stroybrigada_case_sanitize_chips($value);
}

function stroybrigada_review_sanitize_url($value): string {
	return str_replace(['"', "'"], '', sanitize_text_field(wp_unslash((string) $value)));
}

function stroybrigada_review_save_values(int $post_id, array $data): void {
	$title = isset($data['title']) ? sanitize_text_field(wp_unslash((string) $data['title'])) : __('Новый отзыв', 'stroybrigada');
	$text = isset($data['text']) ? sanitize_textarea_field(wp_unslash((string) $data['text'])) : '';
	$status = isset($data['enabled']) ? 'publish' : 'draft';

	wp_update_post(
		[
			'ID' => $post_id,
			'post_title' => '' !== $title ? $title : __('Новый отзыв', 'stroybrigada'),
			'post_excerpt' => $text,
			'post_status' => $status,
			'menu_order' => isset($data['order']) ? (int) $data['order'] : 0,
		]
	);

	$pages = isset($data['pages']) && is_array($data['pages'])
		? array_values(array_unique(array_filter(array_map('absint', wp_unslash($data['pages'])))))
		: [];

	update_post_meta($post_id, '_stroybrigada_review_pages', $pages);
	update_post_meta($post_id, '_stroybrigada_review_image', stroybrigada_review_sanitize_url($data['image'] ?? ''));
	update_post_meta($post_id, '_stroybrigada_review_chips', stroybrigada_review_sanitize_chips($data['chips'] ?? []));
	update_post_meta($post_id, '_stroybrigada_review_text', $text);
	update_post_meta($post_id, '_stroybrigada_review_source', sanitize_text_field(wp_unslash((string) ($data['source'] ?? ''))));
}

function stroybrigada_handle_reviews_page_actions(): void {
	if (! is_admin() || ! current_user_can('edit_posts') || empty($_POST['stroybrigada_reviews_action'])) {
		return;
	}

	$action = sanitize_key((string) wp_unslash($_POST['stroybrigada_reviews_action']));
	$review_page_id = absint($_POST['review_page'] ?? 0);
	if (! isset($_POST['stroybrigada_reviews_nonce']) || ! wp_verify_nonce(sanitize_text_field(wp_unslash((string) $_POST['stroybrigada_reviews_nonce'])), 'stroybrigada_reviews_action')) {
		wp_safe_redirect(add_query_arg('review_notice', 'failed', stroybrigada_reviews_admin_url(0, $review_page_id)));
		exit;
	}

	if ('create' === $action) {
		$post_id = wp_insert_post(
			[
				'post_type' => 'review',
				'post_status' => isset($_POST['review']['enabled']) ? 'publish' : 'draft',
				'post_title' => __('Новый отзыв', 'stroybrigada'),
			],
			true
		);
		if (! is_wp_error($post_id) && (int) $post_id > 0) {
			stroybrigada_review_save_values((int) $post_id, is_array($_POST['review'] ?? null) ? (array) $_POST['review'] : []);
			wp_safe_redirect(add_query_arg('review_notice', 'created', stroybrigada_reviews_admin_url((int) $post_id, $review_page_id)));
			exit;
		}
	} elseif ('save' === $action) {
		$post_id = absint($_POST['review_id'] ?? 0);
		if ($post_id > 0 && current_user_can('edit_post', $post_id)) {
			stroybrigada_review_save_values($post_id, is_array($_POST['review'] ?? null) ? (array) $_POST['review'] : []);
			wp_safe_redirect(add_query_arg('review_notice', 'saved', stroybrigada_reviews_admin_url($post_id, $review_page_id)));
			exit;
		}
	} elseif ('delete' === $action) {
		$post_id = absint($_POST['review_id'] ?? 0);
		if ($post_id > 0 && current_user_can('delete_post', $post_id)) {
			wp_delete_post($post_id, true);
			wp_safe_redirect(add_query_arg('review_notice', 'deleted', stroybrigada_reviews_admin_url(0, $review_page_id)));
			exit;
		}
	}

	wp_safe_redirect(add_query_arg('review_notice', 'failed', stroybrigada_reviews_admin_url(0, $review_page_id)));
	exit;
}
add_action('admin_init', 'stroybrigada_handle_reviews_page_actions');

function stroybrigada_render_reviews_page_notice(): void {
	$notice = isset($_GET['review_notice']) ? sanitize_key((string) wp_unslash($_GET['review_notice'])) : '';
	$messages = [
		'created' => __('Отзыв добавлен.', 'stroybrigada'),
		'saved' => __('Отзыв сохранен.', 'stroybrigada'),
		'deleted' => __('Отзыв удален.', 'stroybrigada'),
		'failed' => __('Не удалось выполнить действие.', 'stroybrigada'),
	];
	if (! isset($messages[$notice])) {
		return;
	}

	$class = 'failed' === $notice ? 'notice-error' : 'notice-success';
	printf('<div class="notice %s is-dismissible"><p>%s</p></div>', esc_attr($class), esc_html($messages[$notice]));
}

function stroybrigada_render_review_card_admin(?WP_Post $review, array $pages, int $active_page_id = 0): void {
	$is_new = ! $review;
	$post_id = $review ? (int) $review->ID : 0;
	$title = $review ? get_the_title($review) : '';
	$selected_pages = $review ? stroybrigada_review_get_pages($post_id) : ($active_page_id > 0 ? [$active_page_id] : []);
	$image = $review ? (string) get_post_meta($post_id, '_stroybrigada_review_image', true) : '';
	$text = $review ? (string) get_post_meta($post_id, '_stroybrigada_review_text', true) : '';
	$source = $review ? (string) get_post_meta($post_id, '_stroybrigada_review_source', true) : '';
	$chips = $review ? get_post_meta($post_id, '_stroybrigada_review_chips', true) : [];
	$chips = is_array($chips) ? array_values(array_filter(array_map('strval', $chips))) : [];
	$order = $review ? (int) $review->menu_order : 0;
	?>
	<form id="<?php echo esc_attr($is_new ? 'review-new' : 'review-' . $post_id); ?>" class="stroybrigada-reviews-card<?php echo $is_new ? ' stroybrigada-reviews-card--new' : ''; ?>" method="post">
		<?php wp_nonce_field('stroybrigada_reviews_action', 'stroybrigada_reviews_nonce'); ?>
		<input type="hidden" name="stroybrigada_reviews_action" value="<?php echo esc_attr($is_new ? 'create' : 'save'); ?>">
		<input type="hidden" name="review_page" value="<?php echo esc_attr((string) $active_page_id); ?>">
		<?php if (! $is_new) : ?>
			<input type="hidden" name="review_id" value="<?php echo esc_attr((string) $post_id); ?>">
		<?php endif; ?>
		<header class="stroybrigada-reviews-card__header">
			<label>
				<span><?php esc_html_e('Заголовок / имя', 'stroybrigada'); ?></span>
				<input type="text" name="review[title]" value="<?php echo esc_attr($title); ?>" placeholder="<?php echo esc_attr__('Например: Анна, реконструкция дома', 'stroybrigada'); ?>">
			</label>
			<label class="stroybrigada-reviews-card__toggle">
				<input type="checkbox" name="review[enabled]" value="1" <?php checked($is_new || ($review && 'publish' === $review->post_status)); ?>>
				<span><?php esc_html_e('Показывать', 'stroybrigada'); ?></span>
			</label>
		</header>
		<label class="stroybrigada-reviews-card__field">
			<span><?php esc_html_e('Порядок', 'stroybrigada'); ?></span>
			<input type="number" name="review[order]" value="<?php echo esc_attr((string) $order); ?>">
		</label>
		<div class="stroybrigada-reviews-card__field">
			<strong><?php esc_html_e('Фото', 'stroybrigada'); ?></strong>
			<div class="stroybrigada-reviews-media">
				<div class="stroybrigada-reviews-media__preview">
					<?php if ('' !== $image) : ?>
						<img src="<?php echo esc_url(stroybrigada_case_image_preview($image)); ?>" alt="">
					<?php else : ?>
						<span><?php esc_html_e('Фото', 'stroybrigada'); ?></span>
					<?php endif; ?>
				</div>
				<div>
					<input type="text" name="review[image]" value="<?php echo esc_attr($image); ?>" data-review-image-input>
					<button type="button" class="button stroybrigada-reviews-media-button"><?php esc_html_e('Выбрать фото', 'stroybrigada'); ?></button>
				</div>
			</div>
		</div>
		<div class="stroybrigada-reviews-card__field">
			<div class="stroybrigada-reviews-card__label-row">
				<strong><?php esc_html_e('Чипы', 'stroybrigada'); ?></strong>
				<button type="button" class="button stroybrigada-reviews-chip-add"><?php esc_html_e('Добавить чип', 'stroybrigada'); ?></button>
			</div>
			<div class="stroybrigada-reviews-chips" data-review-chips>
				<?php foreach ($chips as $chip) : ?>
					<div class="stroybrigada-reviews-chips__row">
						<input type="text" name="review[chips][]" value="<?php echo esc_attr($chip); ?>" placeholder="<?php echo esc_attr__('Например: веранда', 'stroybrigada'); ?>">
						<button type="button" class="button stroybrigada-reviews-chip-remove"><?php esc_html_e('Удалить', 'stroybrigada'); ?></button>
					</div>
				<?php endforeach; ?>
			</div>
		</div>
		<label class="stroybrigada-reviews-card__field">
			<span><?php esc_html_e('Текст отзыва', 'stroybrigada'); ?></span>
			<textarea name="review[text]" rows="5"><?php echo esc_textarea($text); ?></textarea>
		</label>
		<label class="stroybrigada-reviews-card__field">
			<span><?php esc_html_e('Источник', 'stroybrigada'); ?></span>
			<input type="text" name="review[source]" value="<?php echo esc_attr($source); ?>" placeholder="<?php echo esc_attr__('Например: Яндекс Карты', 'stroybrigada'); ?>">
		</label>
		<div class="stroybrigada-reviews-card__field">
			<strong><?php esc_html_e('Показывать на страницах', 'stroybrigada'); ?></strong>
			<div class="stroybrigada-reviews-pages">
				<?php foreach ($pages as $page) : ?>
					<label>
						<input type="checkbox" name="review[pages][]" value="<?php echo esc_attr((string) $page->ID); ?>" <?php checked(in_array((int) $page->ID, $selected_pages, true)); ?>>
						<span><?php echo esc_html(get_the_title($page)); ?></span>
					</label>
				<?php endforeach; ?>
			</div>
		</div>
		<footer class="stroybrigada-reviews-card__footer">
			<button type="submit" class="button button-primary"><?php echo esc_html($is_new ? __('Добавить отзыв', 'stroybrigada') : __('Сохранить отзыв', 'stroybrigada')); ?></button>
			<?php if (! $is_new) : ?>
				<button type="submit" class="button stroybrigada-reviews-card__delete" name="stroybrigada_reviews_action" value="delete" onclick="return confirm('<?php echo esc_js(__('Удалить отзыв?', 'stroybrigada')); ?>');"><?php esc_html_e('Удалить', 'stroybrigada'); ?></button>
			<?php endif; ?>
		</footer>
	</form>
	<?php
}

function stroybrigada_render_reviews_page(): void {
	if (! current_user_can('edit_posts')) {
		wp_die(esc_html__('Недостаточно прав.', 'stroybrigada'));
	}

	$active_page_id = isset($_GET['review_page']) ? absint($_GET['review_page']) : 0;
	$reviews = get_posts(
		[
			'post_type' => 'review',
			'post_status' => ['publish', 'draft'],
			'posts_per_page' => -1,
			'orderby' => ['menu_order' => 'ASC', 'date' => 'DESC'],
		]
	);
	$pages = stroybrigada_case_selectable_pages();
	$all_reviews_count = count($reviews);
	$page_ids = array_map(static fn(WP_Post $page): int => (int) $page->ID, $pages);
	if ($active_page_id > 0 && ! in_array($active_page_id, $page_ids, true)) {
		$active_page_id = 0;
	}
	$counts = array_fill_keys($page_ids, 0);
	foreach ($reviews as $review) {
		if (! $review instanceof WP_Post) {
			continue;
		}
		foreach (stroybrigada_review_get_pages((int) $review->ID) as $page_id) {
			if (isset($counts[$page_id])) {
				$counts[$page_id]++;
			}
		}
	}
	if ($active_page_id > 0) {
		$reviews = array_values(array_filter($reviews, static fn($review): bool => $review instanceof WP_Post && in_array($active_page_id, stroybrigada_review_get_pages((int) $review->ID), true)));
	}
	$base_url = admin_url('admin.php?page=stroybrigada-reviews');
	?>
	<div class="wrap stroybrigada-reviews-admin">
		<style>
			.stroybrigada-reviews-menu{display:flex;flex-wrap:wrap;gap:8px;margin:14px 0 18px}
			.stroybrigada-reviews-topbar{display:flex;justify-content:flex-start;gap:10px;margin:0 0 14px}
			.stroybrigada-reviews-menu .button{display:inline-flex;align-items:center;gap:6px;border-radius:999px}
			.stroybrigada-reviews-menu__count{display:inline-flex;align-items:center;justify-content:center;min-width:20px;height:20px;padding:0 6px;border-radius:999px;background:#f0f0f1;color:#50575e;font-size:11px;line-height:1}
			.stroybrigada-reviews-menu .button-primary .stroybrigada-reviews-menu__count{background:rgba(255,255,255,.2);color:#fff}
			.stroybrigada-reviews-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:18px;align-items:start}
			.stroybrigada-reviews-card{display:grid;gap:14px;padding:16px;border:1px solid #dcdcde;border-radius:12px;background:#fff;box-shadow:0 8px 24px rgba(15,23,42,.05)}
			.stroybrigada-reviews-card--new{border-style:dashed;background:#f8fafc}
			.stroybrigada-reviews-card__header{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;align-items:end}
			.stroybrigada-reviews-card label,.stroybrigada-reviews-card__field{display:grid;gap:6px}
			.stroybrigada-reviews-card input[type=text],.stroybrigada-reviews-card input[type=number],.stroybrigada-reviews-card textarea{width:100%;box-sizing:border-box}
			.stroybrigada-reviews-card__toggle{display:flex!important;gap:8px;align-items:center;padding:8px 10px;border:1px solid #dcdcde;border-radius:8px;background:#f8fafc}
			.stroybrigada-reviews-card__label-row{display:flex;justify-content:space-between;gap:10px;align-items:center}
			.stroybrigada-reviews-media{display:grid;grid-template-columns:104px minmax(0,1fr);gap:10px;align-items:start}
			.stroybrigada-reviews-media__preview{width:104px;aspect-ratio:1/1;border:1px solid #dcdcde;border-radius:10px;background:#f6f7f7;display:grid;place-items:center;overflow:hidden;color:#64748b;font-weight:700}
			.stroybrigada-reviews-media__preview img{display:block;width:100%;height:100%;object-fit:cover}
			.stroybrigada-reviews-chips{display:grid;gap:8px}
			.stroybrigada-reviews-chips__row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;align-items:center}
			.stroybrigada-reviews-pages{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;max-height:190px;overflow:auto;padding:10px;border:1px solid #dcdcde;border-radius:8px;background:#f8fafc}
			.stroybrigada-reviews-pages label{display:flex;gap:8px;align-items:flex-start}
			.stroybrigada-reviews-card__footer{display:flex;justify-content:space-between;gap:10px;align-items:center}
			.stroybrigada-reviews-card__delete{color:#b91c1c!important;border-color:rgba(185,28,28,.35)!important}
			@media(max-width:1600px){.stroybrigada-reviews-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
			@media(max-width:1280px){.stroybrigada-reviews-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
			@media(max-width:960px){.stroybrigada-reviews-grid{grid-template-columns:1fr}}
			@media(max-width:782px){.stroybrigada-reviews-card__header,.stroybrigada-reviews-pages,.stroybrigada-reviews-chips__row{grid-template-columns:1fr}}
		</style>
		<h1><?php esc_html_e('Отзывы', 'stroybrigada'); ?></h1>
		<?php stroybrigada_render_reviews_page_notice(); ?>
		<p><?php esc_html_e('Отзывы общие для сайта. В каждой карточке выберите страницы, на которых отзыв должен выводиться.', 'stroybrigada'); ?></p>
		<div class="stroybrigada-reviews-topbar">
			<button type="button" class="button button-primary" data-stroybrigada-reviews-save-all><?php esc_html_e('Сохранить все', 'stroybrigada'); ?></button>
		</div>
		<div class="stroybrigada-reviews-menu">
			<a class="button<?php echo 0 === $active_page_id ? ' button-primary' : ''; ?>" href="<?php echo esc_url($base_url); ?>"><span><?php esc_html_e('Все', 'stroybrigada'); ?></span><span class="stroybrigada-reviews-menu__count"><?php echo esc_html((string) $all_reviews_count); ?></span></a>
			<?php foreach ($pages as $page) : ?>
				<?php $page_id = (int) $page->ID; ?>
				<a class="button<?php echo $active_page_id === $page_id ? ' button-primary' : ''; ?>" href="<?php echo esc_url(add_query_arg('review_page', $page_id, $base_url)); ?>"><span><?php echo esc_html(get_the_title($page)); ?></span><span class="stroybrigada-reviews-menu__count"><?php echo esc_html((string) ($counts[$page_id] ?? 0)); ?></span></a>
			<?php endforeach; ?>
		</div>
		<div class="stroybrigada-reviews-grid">
			<?php stroybrigada_render_review_card_admin(null, $pages, $active_page_id); ?>
			<?php foreach ($reviews as $review) : ?>
				<?php if ($review instanceof WP_Post) : ?>
					<?php stroybrigada_render_review_card_admin($review, $pages, $active_page_id); ?>
				<?php endif; ?>
			<?php endforeach; ?>
		</div>
	</div>
	<?php
}

function stroybrigada_review_admin_assets(string $hook_suffix): void {
	if ('toplevel_page_stroybrigada-reviews' !== $hook_suffix) {
		return;
	}

	wp_enqueue_media();
	wp_add_inline_script(
		'media-editor',
		"var stroybrigadaReviewAssetBase=" . wp_json_encode(STROYBRIGADA_ASSETS_URL . 'dist/') . ";function stroybrigadaReviewAdminUrl(url){url=String(url||'');return url.indexOf('/assets/')===0?stroybrigadaReviewAssetBase+url.slice(8):url;}document.addEventListener('click',function(event){var media=event.target.closest('.stroybrigada-reviews-media-button');if(media){event.preventDefault();if(!window.wp||!wp.media){return;}var wrap=media.closest('.stroybrigada-reviews-media');var input=wrap?wrap.querySelector('[data-review-image-input]'):null;var preview=wrap?wrap.querySelector('.stroybrigada-reviews-media__preview'):null;var frame=wp.media({title:'Выберите фото',button:{text:'Использовать'},multiple:false,library:{type:'image'}});frame.on('select',function(){var attachment=frame.state().get('selection').first().toJSON();if(!attachment||!attachment.url||!input){return;}input.value=attachment.url;if(preview){preview.innerHTML='<img src=\"'+stroybrigadaReviewAdminUrl(attachment.url).replace(/\"/g,'&quot;')+'\" alt=\"\">';}});frame.open();return;}var add=event.target.closest('.stroybrigada-reviews-chip-add');if(add){event.preventDefault();var root=add.closest('form')||document;var list=root.querySelector('[data-review-chips]');if(!list){return;}var row=document.createElement('div');row.className='stroybrigada-reviews-chips__row';row.innerHTML='<input type=\"text\" name=\"review[chips][]\" value=\"\" placeholder=\"Например: веранда\"><button type=\"button\" class=\"button stroybrigada-reviews-chip-remove\">Удалить</button>';list.appendChild(row);var input=row.querySelector('input');if(input){input.focus();}return;}var remove=event.target.closest('.stroybrigada-reviews-chip-remove');if(remove){event.preventDefault();var row=remove.closest('.stroybrigada-reviews-chips__row');if(row){row.remove();}}});"
	);
	wp_add_inline_script(
		'media-editor',
		"document.addEventListener('click',async function(event){var button=event.target.closest('[data-stroybrigada-reviews-save-all]');if(!button){return;}event.preventDefault();var forms=Array.from(document.querySelectorAll('.stroybrigada-reviews-card'));forms=forms.filter(function(form){if(!form.classList.contains('stroybrigada-reviews-card--new')){return true;}var title=form.querySelector('[name=\"review[title]\"]');var image=form.querySelector('[name=\"review[image]\"]');var text=form.querySelector('[name=\"review[text]\"]');var source=form.querySelector('[name=\"review[source]\"]');var chips=Array.from(form.querySelectorAll('[name=\"review[chips][]\"]')).some(function(input){return input.value.trim();});return Boolean((title&&title.value.trim())||(image&&image.value.trim())||(text&&text.value.trim())||(source&&source.value.trim())||chips);});if(!forms.length){return;}button.disabled=true;var original=button.textContent;button.textContent='Сохранение...';try{for(var i=0;i<forms.length;i++){var response=await fetch(window.location.href,{method:'POST',body:new FormData(forms[i]),credentials:'same-origin',redirect:'follow'});if(!response.ok){throw new Error('save failed');}}var url=new URL(window.location.href);url.searchParams.set('review_notice','saved');window.location.href=url.toString();}catch(error){button.disabled=false;button.textContent=original;window.alert('Не удалось сохранить все отзывы.');}});"
	);
}
add_action('admin_enqueue_scripts', 'stroybrigada_review_admin_assets');

function stroybrigada_case_page_id_by_import_slug(string $slug): int {
	if ('home' === $slug) {
		return (int) get_option('page_on_front');
	}

	$page = get_page_by_path($slug);
	return $page instanceof WP_Post ? (int) $page->ID : 0;
}

function stroybrigada_import_default_case_cards(): void {
	$version = '20260723_project_cases_chips';
	$current_version = get_option('stroybrigada_case_cards_import_version');
	if ($version === $current_version) {
		return;
	}

	$data_path = STROYBRIGADA_THEME_PATH . 'data/content.json';
	if (! is_readable($data_path)) {
		return;
	}

	$data = json_decode((string) file_get_contents($data_path), true);
	if (! is_array($data) || empty($data['pages']) || ! is_array($data['pages'])) {
		return;
	}

	$cases = [];
	foreach ($data['pages'] as $page) {
		if (! is_array($page) || empty($page['slug']) || empty($page['sections']) || ! is_array($page['sections'])) {
			continue;
		}

		$page_id = stroybrigada_case_page_id_by_import_slug((string) $page['slug']);
		if ($page_id <= 0) {
			continue;
		}

		foreach ($page['sections'] as $section) {
			if (! is_array($section) || empty($section['html']) || 'cases' !== stroybrigada_section_merge_kind($section)) {
				continue;
			}

			$html = (string) $section['html'];
			if (! preg_match('/\bid\s*=\s*(["\'])works\1/i', $html)) {
				continue;
			}

			foreach (stroybrigada_extract_balanced_div_blocks_by_class($html, 'works-section__gallery-item') as $card_html) {
				$card = stroybrigada_extract_case_card_data_from_html($card_html);
				if (! $card || empty($card['main'])) {
					continue;
				}

				$key = sha1((string) $card['main'] . '|' . (string) ($card['title'] ?? ''));
				if (! isset($cases[$key])) {
					$cases[$key] = $card + ['pages' => []];
				}
				$cases[$key]['pages'][] = $page_id;
			}
		}
	}

	foreach ($cases as $source_key => $case) {
		$pages = array_values(array_unique(array_filter(array_map('absint', (array) ($case['pages'] ?? [])))));
		if (! $pages) {
			continue;
		}

		$existing = get_posts(
			[
				'post_type'      => 'project',
				'post_status'    => 'any',
				'posts_per_page' => 1,
				'fields'         => 'ids',
				'meta_key'       => '_stroybrigada_case_source_key',
				'meta_value'     => $source_key,
			]
		);

		$post_id = ! empty($existing[0]) ? (int) $existing[0] : 0;
		if ($post_id <= 0) {
			$post_id = wp_insert_post(
				[
					'post_type'    => 'project',
					'post_status'  => 'publish',
					'post_title'   => '' !== (string) ($case['title'] ?? '') ? (string) $case['title'] : __('Кейс', 'stroybrigada'),
					'post_excerpt' => (string) ($case['description'] ?? ''),
				],
				true
			);

			if (is_wp_error($post_id) || (int) $post_id <= 0) {
				continue;
			}
			$post_id = (int) $post_id;
			update_post_meta($post_id, '_stroybrigada_case_source_key', $source_key);

			$current_pages = stroybrigada_case_get_pages($post_id);
			update_post_meta($post_id, '_stroybrigada_case_pages', array_values(array_unique(array_merge($current_pages, $pages))));
			update_post_meta($post_id, '_stroybrigada_case_main_image', (string) ($case['main'] ?? ''));
			update_post_meta($post_id, '_stroybrigada_case_preview', (string) ($case['main'] ?? ''));
			update_post_meta($post_id, '_stroybrigada_case_description', (string) ($case['description'] ?? ''));
			update_post_meta($post_id, '_stroybrigada_case_gallery', is_array($case['gallery'] ?? null) ? array_values($case['gallery']) : []);
			update_post_meta($post_id, '_stroybrigada_case_chips', is_array($case['chips'] ?? null) ? array_values($case['chips']) : []);
			continue;
		}

		if (! metadata_exists('post', $post_id, '_stroybrigada_case_chips')) {
			update_post_meta($post_id, '_stroybrigada_case_chips', is_array($case['chips'] ?? null) ? array_values($case['chips']) : []);
		}
	}

	update_option('stroybrigada_case_cards_import_version', $version, false);
}
add_action('admin_init', 'stroybrigada_import_default_case_cards');

function stroybrigada_import_default_review_cards(): void {
	$version = '20260728_review_cards_by_page';
	if ($version === get_option('stroybrigada_review_import_version')) {
		return;
	}

	if (! function_exists('stroybrigada_get_page_sections') || ! function_exists('stroybrigada_review_items_from_html')) {
		return;
	}

	$reviews = [];
	foreach (get_pages(['sort_column' => 'menu_order,post_title', 'sort_order' => 'ASC']) as $page) {
		if (! $page instanceof WP_Post || ! stroybrigada_case_is_selectable_page($page)) {
			continue;
		}

		$sections = stroybrigada_get_page_sections((int) $page->ID);
		if (! is_array($sections)) {
			continue;
		}

		foreach ($sections as $section) {
			if (! is_array($section) || empty($section['html']) || 'reviews' !== stroybrigada_section_merge_kind($section)) {
				continue;
			}

			foreach (stroybrigada_review_items_from_html((string) $section['html']) as $item) {
				if (! is_array($item)) {
					continue;
				}

				$key = sha1(trim((string) ($item['name'] ?? '')) . '|' . trim((string) ($item['text'] ?? '')));
				if (! isset($reviews[$key])) {
					$reviews[$key] = $item + ['pages' => []];
				}
				$reviews[$key]['pages'][] = (int) $page->ID;
			}
		}
	}

	foreach ($reviews as $source_key => $review) {
		$title = trim((string) ($review['name'] ?? ''));
		$text = trim((string) ($review['text'] ?? ''));
		$pages = array_values(array_unique(array_filter(array_map('absint', (array) ($review['pages'] ?? [])))));
		if ('' === $title && '' === $text) {
			continue;
		}

		$existing = get_posts(
			[
				'post_type' => 'review',
				'post_status' => 'any',
				'posts_per_page' => 1,
				'fields' => 'ids',
				'meta_key' => '_stroybrigada_review_source_key',
				'meta_value' => $source_key,
			]
		);
		if (! empty($existing[0])) {
			continue;
		}

		$post_id = wp_insert_post(
			[
				'post_type' => 'review',
				'post_status' => 'publish',
				'post_title' => '' !== $title ? $title : __('Отзыв клиента', 'stroybrigada'),
				'post_excerpt' => $text,
			],
			true
		);
		if (is_wp_error($post_id) || (int) $post_id <= 0) {
			continue;
		}

		$post_id = (int) $post_id;
		update_post_meta($post_id, '_stroybrigada_review_source_key', $source_key);
		update_post_meta($post_id, '_stroybrigada_review_pages', $pages);
		update_post_meta($post_id, '_stroybrigada_review_image', (string) ($review['image'] ?? ''));
		update_post_meta($post_id, '_stroybrigada_review_chips', stroybrigada_review_sanitize_chips((array) ($review['tags'] ?? [])));
		update_post_meta($post_id, '_stroybrigada_review_text', $text);
		update_post_meta($post_id, '_stroybrigada_review_source', (string) ($review['source'] ?? ''));
	}

	update_option('stroybrigada_review_import_version', $version, false);
}
add_action('admin_init', 'stroybrigada_import_default_review_cards');

function stroybrigada_register_videos_page(): void {
	add_menu_page(
		__('Видео', 'stroybrigada'),
		__('Видео', 'stroybrigada'),
		'edit_posts',
		'stroybrigada-videos',
		'stroybrigada_render_videos_page',
		'dashicons-video-alt3',
		23
	);
}
add_action('admin_menu', 'stroybrigada_register_videos_page');

function stroybrigada_videos_admin_url(int $video_id = 0, int $page_id = 0): string {
	$url = admin_url('admin.php?page=stroybrigada-videos');
	if ($page_id > 0) {
		$url = add_query_arg('video_page', $page_id, $url);
	}

	return $video_id > 0 ? $url . '#video-' . $video_id : $url;
}

function stroybrigada_video_get_pages(int $post_id): array {
	$value = get_post_meta($post_id, '_stroybrigada_video_pages', true);
	return is_array($value) ? array_values(array_filter(array_map('absint', $value))) : [];
}

function stroybrigada_video_sanitize_url($value): string {
	return str_replace(['"', "'"], '', sanitize_text_field(wp_unslash((string) $value)));
}

function stroybrigada_video_save_values(int $post_id, array $data): void {
	$title = isset($data['title']) ? sanitize_text_field(wp_unslash((string) $data['title'])) : __('Новое видео', 'stroybrigada');
	$status = isset($data['enabled']) ? 'publish' : 'draft';

	wp_update_post(
		[
			'ID'          => $post_id,
			'post_title'  => '' !== $title ? $title : __('Новое видео', 'stroybrigada'),
			'post_status' => $status,
			'menu_order'  => isset($data['order']) ? (int) $data['order'] : 0,
		]
	);

	$pages = isset($data['pages']) && is_array($data['pages'])
		? array_values(array_unique(array_filter(array_map('absint', wp_unslash($data['pages'])))))
		: [];

	update_post_meta($post_id, '_stroybrigada_video_pages', $pages);
	update_post_meta($post_id, '_stroybrigada_video_src', stroybrigada_video_sanitize_url($data['src'] ?? ''));
	update_post_meta($post_id, '_stroybrigada_video_preview', stroybrigada_video_sanitize_url($data['preview'] ?? ''));
}

function stroybrigada_handle_videos_page_actions(): void {
	if (! is_admin() || ! current_user_can('edit_posts') || empty($_POST['stroybrigada_videos_action'])) {
		return;
	}

	$action = sanitize_key((string) wp_unslash($_POST['stroybrigada_videos_action']));
	$page_id = absint($_POST['video_page'] ?? 0);
	if (! isset($_POST['stroybrigada_videos_nonce']) || ! wp_verify_nonce(sanitize_text_field(wp_unslash((string) $_POST['stroybrigada_videos_nonce'])), 'stroybrigada_videos_action')) {
		wp_safe_redirect(add_query_arg('video_notice', 'failed', stroybrigada_videos_admin_url(0, $page_id)));
		exit;
	}

	if ('create' === $action) {
		$post_id = wp_insert_post(
			[
				'post_type'   => 'stroybrigada_video',
				'post_status' => isset($_POST['video']['enabled']) ? 'publish' : 'draft',
				'post_title'  => __('Новое видео', 'stroybrigada'),
			],
			true
		);
		if (! is_wp_error($post_id) && (int) $post_id > 0) {
			stroybrigada_video_save_values((int) $post_id, is_array($_POST['video'] ?? null) ? (array) $_POST['video'] : []);
			wp_safe_redirect(add_query_arg('video_notice', 'created', stroybrigada_videos_admin_url((int) $post_id, $page_id)));
			exit;
		}
	} elseif ('save' === $action) {
		$post_id = absint($_POST['video_id'] ?? 0);
		if ($post_id > 0 && current_user_can('edit_post', $post_id)) {
			stroybrigada_video_save_values($post_id, is_array($_POST['video'] ?? null) ? (array) $_POST['video'] : []);
			wp_safe_redirect(add_query_arg('video_notice', 'saved', stroybrigada_videos_admin_url($post_id, $page_id)));
			exit;
		}
	} elseif ('delete' === $action) {
		$post_id = absint($_POST['video_id'] ?? 0);
		if ($post_id > 0 && current_user_can('delete_post', $post_id)) {
			wp_delete_post($post_id, true);
			wp_safe_redirect(add_query_arg('video_notice', 'deleted', stroybrigada_videos_admin_url(0, $page_id)));
			exit;
		}
	}

	wp_safe_redirect(add_query_arg('video_notice', 'failed', stroybrigada_videos_admin_url(0, $page_id)));
	exit;
}
add_action('admin_init', 'stroybrigada_handle_videos_page_actions');

function stroybrigada_video_posts_for_page(int $post_id): array {
	if ($post_id <= 0 || ! post_type_exists('stroybrigada_video')) {
		return [];
	}

	$videos = get_posts(
		[
			'post_type'      => 'stroybrigada_video',
			'post_status'    => 'publish',
			'posts_per_page' => -1,
			'orderby'        => ['menu_order' => 'ASC', 'date' => 'DESC'],
			'meta_query'     => [
				'relation' => 'OR',
				[
					'key'     => '_stroybrigada_video_pages',
					'value'   => '"' . $post_id . '"',
					'compare' => 'LIKE',
				],
				[
					'key'     => '_stroybrigada_video_pages',
					'value'   => 'i:' . $post_id . ';',
					'compare' => 'LIKE',
				],
			],
		]
	);
	return array_values(array_filter($videos, static fn($video): bool => $video instanceof WP_Post && in_array($post_id, stroybrigada_video_get_pages((int) $video->ID), true)));
}

function stroybrigada_video_items_for_page(int $post_id): array {
	$items = [];
	foreach (stroybrigada_video_posts_for_page($post_id) as $video) {
		if (! $video instanceof WP_Post) {
			continue;
		}

		$src = (string) get_post_meta((int) $video->ID, '_stroybrigada_video_src', true);
		$preview = (string) get_post_meta((int) $video->ID, '_stroybrigada_video_preview', true);
		if ('' === $src || '' === $preview) {
			continue;
		}

		$items[] = [
			'src'     => $src,
			'preview' => $preview,
			'title'   => get_the_title($video),
		];
	}

	return $items;
}

function stroybrigada_review_posts_for_page(int $post_id): array {
	if ($post_id <= 0 || ! post_type_exists('review')) {
		return [];
	}

	return get_posts(
		[
			'post_type' => 'review',
			'post_status' => 'publish',
			'posts_per_page' => -1,
			'orderby' => function_exists('stroybrigada_should_randomize_front_page_cards') && stroybrigada_should_randomize_front_page_cards($post_id) ? 'rand' : ['menu_order' => 'ASC', 'date' => 'DESC'],
			'meta_query' => [
				'relation' => 'OR',
				[
					'key' => '_stroybrigada_review_pages',
					'value' => '"' . $post_id . '"',
					'compare' => 'LIKE',
				],
				[
					'key' => '_stroybrigada_review_pages',
					'value' => 'i:' . $post_id . ';',
					'compare' => 'LIKE',
				],
			],
		]
	);
}

function stroybrigada_review_items_for_page(int $post_id): array {
	$items = [];
	foreach (stroybrigada_review_posts_for_page($post_id) as $review) {
		if (! $review instanceof WP_Post) {
			continue;
		}

		$review_id = (int) $review->ID;
		$chips = get_post_meta($review_id, '_stroybrigada_review_chips', true);
		$chips = is_array($chips) ? array_values(array_filter(array_map('strval', $chips))) : [];
		$items[] = [
			'image' => (string) get_post_meta($review_id, '_stroybrigada_review_image', true),
			'name' => get_the_title($review),
			'tags' => $chips,
			'text' => (string) get_post_meta($review_id, '_stroybrigada_review_text', true),
			'source' => (string) get_post_meta($review_id, '_stroybrigada_review_source', true),
			'stars' => '★★★★★',
		];
	}

	return $items;
}

function stroybrigada_video_image_preview(string $src): string {
	return function_exists('stroybrigada_case_image_preview') ? stroybrigada_case_image_preview($src) : $src;
}

function stroybrigada_video_file_preview(string $src): string {
	if (str_starts_with($src, '/assets/')) {
		return STROYBRIGADA_ASSETS_URL . 'dist/' . ltrim(substr($src, strlen('/assets/')), '/');
	}

	return $src;
}

function stroybrigada_video_render_notice(): void {
	$notice = isset($_GET['video_notice']) ? sanitize_key((string) wp_unslash($_GET['video_notice'])) : '';
	$messages = [
		'created' => __('Видео добавлено.', 'stroybrigada'),
		'saved'   => __('Видео сохранено.', 'stroybrigada'),
		'deleted' => __('Видео удалено.', 'stroybrigada'),
		'failed'  => __('Не удалось выполнить действие.', 'stroybrigada'),
	];
	if (! isset($messages[$notice])) {
		return;
	}

	$class = 'failed' === $notice ? 'notice-error' : 'notice-success';
	printf('<div class="notice %s is-dismissible"><p>%s</p></div>', esc_attr($class), esc_html($messages[$notice]));
}

function stroybrigada_render_video_card_admin(?WP_Post $video, array $pages, int $active_page_id = 0): void {
	$is_new = ! $video;
	$post_id = $video ? (int) $video->ID : 0;
	$title = $video ? get_the_title($video) : '';
	$selected_pages = $video ? stroybrigada_video_get_pages($post_id) : ($active_page_id > 0 ? [$active_page_id] : []);
	$src = $video ? (string) get_post_meta($post_id, '_stroybrigada_video_src', true) : '';
	$preview = $video ? (string) get_post_meta($post_id, '_stroybrigada_video_preview', true) : '';
	$order = $video ? (int) $video->menu_order : 0;
	?>
	<form id="<?php echo esc_attr($is_new ? 'video-new' : 'video-' . $post_id); ?>" class="stroybrigada-videos-card<?php echo $is_new ? ' stroybrigada-videos-card--new' : ''; ?>" method="post">
		<?php wp_nonce_field('stroybrigada_videos_action', 'stroybrigada_videos_nonce'); ?>
		<input type="hidden" name="stroybrigada_videos_action" value="<?php echo esc_attr($is_new ? 'create' : 'save'); ?>">
		<input type="hidden" name="video_page" value="<?php echo esc_attr((string) $active_page_id); ?>">
		<?php if (! $is_new) : ?>
			<input type="hidden" name="video_id" value="<?php echo esc_attr((string) $post_id); ?>">
		<?php endif; ?>
		<header class="stroybrigada-videos-card__header">
			<label>
				<span><?php esc_html_e('Название', 'stroybrigada'); ?></span>
				<input type="text" name="video[title]" value="<?php echo esc_attr($title); ?>" placeholder="<?php echo esc_attr__('Название видео', 'stroybrigada'); ?>">
			</label>
			<label class="stroybrigada-videos-card__toggle">
				<input type="checkbox" name="video[enabled]" value="1" <?php checked($is_new || ($video && 'publish' === $video->post_status)); ?>>
				<span><?php esc_html_e('Показывать', 'stroybrigada'); ?></span>
			</label>
		</header>
		<label class="stroybrigada-videos-card__field">
			<span><?php esc_html_e('Порядок', 'stroybrigada'); ?></span>
			<input type="number" name="video[order]" value="<?php echo esc_attr((string) $order); ?>">
		</label>
		<div class="stroybrigada-videos-card__media">
			<div class="stroybrigada-videos-card__media-row stroybrigada-videos-card__media-row--video" data-video-media-row data-media-kind="video">
				<div class="stroybrigada-videos-card__preview stroybrigada-videos-card__preview--video" data-video-media-preview>
					<?php if ('' !== $src) : ?>
						<video src="<?php echo esc_url(stroybrigada_video_file_preview($src)); ?>" <?php echo '' !== $preview ? 'poster="' . esc_url(stroybrigada_video_image_preview($preview)) . '"' : ''; ?> playsinline preload="metadata"></video>
						<button type="button" class="stroybrigada-videos-card__play" data-video-mini-play aria-label="<?php echo esc_attr__('Воспроизвести видео', 'stroybrigada'); ?>"></button>
					<?php else : ?>
						<span><?php esc_html_e('Видео', 'stroybrigada'); ?></span>
					<?php endif; ?>
				</div>
				<label>
					<span><?php esc_html_e('Файл видео', 'stroybrigada'); ?></span>
					<input type="text" name="video[src]" value="<?php echo esc_attr($src); ?>" data-video-src-input>
				</label>
				<button type="button" class="button stroybrigada-videos-media-button" data-media-kind="video"><?php esc_html_e('Загрузить видео', 'stroybrigada'); ?></button>
			</div>
			<div class="stroybrigada-videos-card__media-row" data-video-media-row data-media-kind="image">
				<div class="stroybrigada-videos-card__preview" data-video-media-preview>
					<?php if ('' !== $preview) : ?>
						<img src="<?php echo esc_url(stroybrigada_video_image_preview($preview)); ?>" alt="">
					<?php else : ?>
						<span><?php esc_html_e('Превью', 'stroybrigada'); ?></span>
					<?php endif; ?>
				</div>
				<label>
					<span><?php esc_html_e('Превью видео', 'stroybrigada'); ?></span>
					<input type="text" name="video[preview]" value="<?php echo esc_attr($preview); ?>" data-video-preview-input>
				</label>
				<button type="button" class="button stroybrigada-videos-media-button" data-media-kind="image"><?php esc_html_e('Загрузить превью', 'stroybrigada'); ?></button>
			</div>
		</div>
		<div class="stroybrigada-videos-card__field">
			<strong><?php esc_html_e('Показывать на страницах', 'stroybrigada'); ?></strong>
			<div class="stroybrigada-videos-pages">
				<?php foreach ($pages as $page) : ?>
					<label>
						<input type="checkbox" name="video[pages][]" value="<?php echo esc_attr((string) $page->ID); ?>" <?php checked(in_array((int) $page->ID, $selected_pages, true)); ?>>
						<span><?php echo esc_html(get_the_title($page)); ?></span>
					</label>
				<?php endforeach; ?>
			</div>
		</div>
		<footer class="stroybrigada-videos-card__footer">
			<button type="submit" class="button button-primary"><?php echo esc_html($is_new ? __('Добавить видео', 'stroybrigada') : __('Сохранить видео', 'stroybrigada')); ?></button>
			<?php if (! $is_new) : ?>
				<button type="submit" class="button stroybrigada-videos-card__delete" name="stroybrigada_videos_action" value="delete" onclick="return confirm('<?php echo esc_js(__('Удалить видео?', 'stroybrigada')); ?>');"><?php esc_html_e('Удалить', 'stroybrigada'); ?></button>
			<?php endif; ?>
		</footer>
	</form>
	<?php
}

function stroybrigada_render_videos_page(): void {
	if (! current_user_can('edit_posts')) {
		wp_die(esc_html__('Недостаточно прав.', 'stroybrigada'));
	}

	$active_page_id = isset($_GET['video_page']) ? absint($_GET['video_page']) : 0;
	$videos = get_posts(
		[
			'post_type'      => 'stroybrigada_video',
			'post_status'    => ['publish', 'draft'],
			'posts_per_page' => -1,
			'orderby'        => ['menu_order' => 'ASC', 'date' => 'DESC'],
		]
	);
	$pages = stroybrigada_case_selectable_pages();
	$all_videos_count = count($videos);
	$page_ids = array_map(static fn(WP_Post $page): int => (int) $page->ID, $pages);
	if ($active_page_id > 0 && ! in_array($active_page_id, $page_ids, true)) {
		$active_page_id = 0;
	}
	$counts = array_fill_keys($page_ids, 0);
	foreach ($videos as $video) {
		if (! $video instanceof WP_Post) {
			continue;
		}
		foreach (stroybrigada_video_get_pages((int) $video->ID) as $page_id) {
			if (isset($counts[$page_id])) {
				$counts[$page_id]++;
			}
		}
	}
	if ($active_page_id > 0) {
		$videos = array_values(array_filter($videos, static fn($video): bool => $video instanceof WP_Post && in_array($active_page_id, stroybrigada_video_get_pages((int) $video->ID), true)));
	}
	$base_url = admin_url('admin.php?page=stroybrigada-videos');
	?>
	<div class="wrap stroybrigada-videos-admin">
		<style>
			.stroybrigada-videos-menu{display:flex;flex-wrap:wrap;gap:8px;margin:14px 0 18px}
			.stroybrigada-videos-menu .button{display:inline-flex;align-items:center;gap:6px;border-radius:999px}
			.stroybrigada-videos-topbar{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:12px 0}
			.stroybrigada-videos-menu__count{display:inline-flex;align-items:center;justify-content:center;min-width:20px;height:20px;padding:0 6px;border-radius:999px;background:#f0f0f1;color:#50575e;font-size:11px;line-height:1}
			.stroybrigada-videos-menu .button-primary .stroybrigada-videos-menu__count{background:rgba(255,255,255,.2);color:#fff}
			.stroybrigada-videos-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:18px;align-items:start}
			.stroybrigada-videos-card{display:grid;gap:14px;padding:16px;border:1px solid #dcdcde;border-radius:12px;background:#fff;box-shadow:0 8px 24px rgba(15,23,42,.05)}
			.stroybrigada-videos-card--new{border-style:dashed;background:#f8fafc}
			.stroybrigada-videos-card__header{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;align-items:end}
			.stroybrigada-videos-card label,.stroybrigada-videos-card__field{display:grid;gap:6px}
			.stroybrigada-videos-card input[type=text],.stroybrigada-videos-card input[type=number]{width:100%;box-sizing:border-box}
			.stroybrigada-videos-card__toggle{display:flex!important;gap:8px;align-items:center;padding:8px 10px;border:1px solid #dcdcde;border-radius:8px;background:#f8fafc}
			.stroybrigada-videos-card__media{display:grid;gap:10px}
			.stroybrigada-videos-card__media-row{display:grid;grid-template-columns:104px minmax(0,1fr) auto;gap:8px;align-items:end}
			.stroybrigada-videos-card__preview{width:104px;aspect-ratio:16/10;display:grid;place-items:center;border:1px solid #dcdcde;border-radius:10px;background:#f6f7f7;overflow:hidden;color:#64748b;font-weight:700;font-size:12px}
			.stroybrigada-videos-card__preview--video{position:relative;background:#0f172a;color:#fff}
			.stroybrigada-videos-card__preview img,.stroybrigada-videos-card__preview video{width:100%;height:100%;object-fit:cover;display:block}
			.stroybrigada-videos-card__preview video{background:#0f172a}
			.stroybrigada-videos-card__play{position:absolute;left:50%;top:50%;z-index:3;width:34px;height:34px;transform:translate(-50%,-50%);border:0;border-radius:999px;background:rgba(15,23,42,.78);box-shadow:0 8px 18px rgba(0,0,0,.28);cursor:pointer}
			.stroybrigada-videos-card__play:before{content:"";position:absolute;left:13px;top:9px;border-style:solid;border-width:8px 0 8px 12px;border-color:transparent transparent transparent #fff}
			.stroybrigada-videos-card__preview--video.is-playing .stroybrigada-videos-card__play{opacity:1}
			.stroybrigada-videos-card__preview--video.is-playing .stroybrigada-videos-card__play:before{left:11px;top:10px;width:4px;height:14px;border-width:0 4px;border-color:#fff;background:transparent}
			.stroybrigada-videos-pages{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;max-height:190px;overflow:auto;padding:10px;border:1px solid #dcdcde;border-radius:8px;background:#f8fafc}
			.stroybrigada-videos-pages label{display:flex;gap:8px;align-items:flex-start}
			.stroybrigada-videos-card__footer{display:flex;justify-content:space-between;gap:10px;align-items:center}
			.stroybrigada-videos-card__delete{color:#b91c1c!important;border-color:rgba(185,28,28,.35)!important}
			@media(max-width:1600px){.stroybrigada-videos-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
			@media(max-width:1280px){.stroybrigada-videos-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
			@media(max-width:960px){.stroybrigada-videos-grid{grid-template-columns:1fr}}
			@media(max-width:782px){.stroybrigada-videos-card__media-row{grid-template-columns:92px minmax(0,1fr)}.stroybrigada-videos-card__media-row .button{grid-column:2}.stroybrigada-videos-card__preview{width:92px}}
		</style>
		<h1><?php esc_html_e('Видео', 'stroybrigada'); ?></h1>
		<?php stroybrigada_video_render_notice(); ?>
		<p><?php esc_html_e('Видео общие для сайта. В каждой карточке выберите страницы, на которых оно должно выводиться в блоке видео.', 'stroybrigada'); ?></p>
		<div class="stroybrigada-videos-topbar">
			<button type="button" class="button button-primary" data-stroybrigada-videos-save-all><?php esc_html_e('Сохранить все', 'stroybrigada'); ?></button>
		</div>
		<div class="stroybrigada-videos-menu">
			<a class="button<?php echo 0 === $active_page_id ? ' button-primary' : ''; ?>" href="<?php echo esc_url($base_url); ?>"><span><?php esc_html_e('Все', 'stroybrigada'); ?></span><span class="stroybrigada-videos-menu__count"><?php echo esc_html((string) $all_videos_count); ?></span></a>
			<?php foreach ($pages as $page) : ?>
				<?php $page_id = (int) $page->ID; ?>
				<a class="button<?php echo $active_page_id === $page_id ? ' button-primary' : ''; ?>" href="<?php echo esc_url(add_query_arg('video_page', $page_id, $base_url)); ?>"><span><?php echo esc_html(get_the_title($page)); ?></span><span class="stroybrigada-videos-menu__count"><?php echo esc_html((string) ($counts[$page_id] ?? 0)); ?></span></a>
			<?php endforeach; ?>
		</div>
		<div class="stroybrigada-videos-grid">
			<?php stroybrigada_render_video_card_admin(null, $pages, $active_page_id); ?>
			<?php foreach ($videos as $video) : ?>
				<?php if ($video instanceof WP_Post) : ?>
					<?php stroybrigada_render_video_card_admin($video, $pages, $active_page_id); ?>
				<?php endif; ?>
			<?php endforeach; ?>
		</div>
	</div>
	<?php
}

function stroybrigada_video_admin_assets(string $hook_suffix): void {
	if ('toplevel_page_stroybrigada-videos' !== $hook_suffix) {
		return;
	}

	wp_enqueue_media();
	wp_add_inline_script(
		'media-editor',
		"var stroybrigadaVideoAssetBase=" . wp_json_encode(STROYBRIGADA_ASSETS_URL . 'dist/') . ";function stroybrigadaVideoAdminUrl(url){url=String(url||'');return url.indexOf('/assets/')===0?stroybrigadaVideoAssetBase+url.slice(8):url;}function stroybrigadaVideoCardPoster(card){var input=card?card.querySelector('[data-video-preview-input]'):null;return input&&input.value?stroybrigadaVideoAdminUrl(input.value):'';}function stroybrigadaVideoPreviewHtml(url,isVideo,poster){var safe=String(isVideo?stroybrigadaVideoAdminUrl(url):stroybrigadaVideoAdminUrl(url||'')).replace(/\"/g,'&quot;');var safePoster=String(poster||'').replace(/\"/g,'&quot;');return isVideo?'<video src=\"'+safe+'\" '+(safePoster?'poster=\"'+safePoster+'\" ':'')+'playsinline preload=\"metadata\"></video><button type=\"button\" class=\"stroybrigada-videos-card__play\" data-video-mini-play aria-label=\"Воспроизвести видео\"></button>':'<img src=\"'+safe+'\" alt=\"\">';}function stroybrigadaRefreshVideoPoster(card){if(!card){return;}var video=card.querySelector('.stroybrigada-videos-card__preview--video video');var poster=stroybrigadaVideoCardPoster(card);if(video&&poster){video.setAttribute('poster',poster);}}document.addEventListener('click',function(event){var play=event.target.closest('[data-video-mini-play]');if(play){event.preventDefault();var preview=play.closest('[data-video-media-preview]');var video=preview?preview.querySelector('video'):null;if(!video){return;}if(video.paused){video.play().then(function(){preview.classList.add('is-playing');}).catch(function(){preview.classList.remove('is-playing');});}else{video.pause();preview.classList.remove('is-playing');}return;}var button=event.target.closest('.stroybrigada-videos-media-button');if(!button||!window.wp||!wp.media){return;}event.preventDefault();var kind=button.getAttribute('data-media-kind')||'image';var isVideo=kind==='video';var row=button.closest('[data-video-media-row]');var card=button.closest('.stroybrigada-videos-card');var input=row?row.querySelector('input[type=\"text\"]'):null;var preview=row?row.querySelector('[data-video-media-preview]'):null;var frame=wp.media({title:isVideo?'Выберите видео':'Выберите превью',button:{text:'Использовать'},multiple:false,library:isVideo?{type:'video'}:{type:'image'}});frame.on('select',function(){var attachment=frame.state().get('selection').first().toJSON();if(!attachment||!attachment.url||!input){return;}input.value=attachment.url;if(preview){preview.innerHTML=stroybrigadaVideoPreviewHtml(attachment.url,isVideo,stroybrigadaVideoCardPoster(card));preview.classList.remove('is-playing');}if(!isVideo){stroybrigadaRefreshVideoPoster(card);}});frame.open();});document.addEventListener('change',function(event){var input=event.target.closest('[data-video-src-input],[data-video-preview-input]');if(!input){return;}var row=input.closest('[data-video-media-row]');var card=input.closest('.stroybrigada-videos-card');var preview=row?row.querySelector('[data-video-media-preview]'):null;if(!preview){return;}var isVideo=input.hasAttribute('data-video-src-input');preview.innerHTML=input.value?stroybrigadaVideoPreviewHtml(input.value,isVideo,stroybrigadaVideoCardPoster(card)):(isVideo?'<span>Видео</span>':'<span>Превью</span>');preview.classList.remove('is-playing');if(!isVideo){stroybrigadaRefreshVideoPoster(card);}});"
	);
	wp_add_inline_script(
		'media-editor',
		"document.addEventListener('click',async function(event){var button=event.target.closest('[data-stroybrigada-videos-save-all]');if(!button){return;}event.preventDefault();var forms=Array.from(document.querySelectorAll('.stroybrigada-videos-card'));forms=forms.filter(function(form){if(!form.classList.contains('stroybrigada-videos-card--new')){return true;}var title=form.querySelector('[name=\"video[title]\"]');var src=form.querySelector('[name=\"video[src]\"]');var preview=form.querySelector('[name=\"video[preview]\"]');return Boolean((title&&title.value.trim())||(src&&src.value.trim())||(preview&&preview.value.trim()));});if(!forms.length){return;}button.disabled=true;var original=button.textContent;button.textContent='Сохранение...';try{for(var i=0;i<forms.length;i++){var response=await fetch(window.location.href,{method:'POST',body:new FormData(forms[i]),credentials:'same-origin',redirect:'follow'});if(!response.ok){throw new Error('save failed');}}var url=new URL(window.location.href);url.searchParams.set('video_notice','saved');window.location.href=url.toString();}catch(error){button.disabled=false;button.textContent=original;window.alert('Не удалось сохранить все видео.');}});"
	);
}
add_action('admin_enqueue_scripts', 'stroybrigada_video_admin_assets');

function stroybrigada_extract_video_items_from_html(string $html): array {
	if (! preg_match('/data-video-items\s*=\s*(["\'])(.*?)\1/is', $html, $match)) {
		return [];
	}

	$decoded = html_entity_decode((string) $match[2], ENT_QUOTES | ENT_HTML5, 'UTF-8');
	$items = json_decode($decoded, true);
	if (! is_array($items)) {
		return [];
	}

	return array_values(array_filter($items, static fn($item): bool => is_array($item) && ! empty($item['src']) && ! empty($item['preview'])));
}

function stroybrigada_import_default_videos(): void {
	$version = '20260723_videos_by_page';
	if ($version === get_option('stroybrigada_video_import_version')) {
		return;
	}

	$data_path = STROYBRIGADA_THEME_PATH . 'data/content.json';
	if (! is_readable($data_path)) {
		return;
	}

	$data = json_decode((string) file_get_contents($data_path), true);
	if (! is_array($data) || empty($data['pages']) || ! is_array($data['pages'])) {
		return;
	}

	$videos = [];
	$video_page_ids = [];
	foreach ($data['pages'] as $page) {
		if (! is_array($page) || empty($page['slug']) || empty($page['sections']) || ! is_array($page['sections'])) {
			continue;
		}
		$page_id = stroybrigada_case_page_id_by_import_slug((string) $page['slug']);
		if ($page_id <= 0) {
			continue;
		}
		foreach ($page['sections'] as $section) {
			if (! is_array($section) || empty($section['html']) || 'video' !== stroybrigada_section_merge_kind($section)) {
				continue;
			}
			$video_page_ids[] = $page_id;
			foreach (stroybrigada_extract_video_items_from_html((string) $section['html']) as $item) {
				$key = sha1((string) $item['src']);
				if (! isset($videos[$key])) {
					$videos[$key] = $item + ['pages' => []];
				}
				$videos[$key]['pages'][] = $page_id;
			}
		}
	}

	if (! $videos && $video_page_ids) {
		$script_path = STROYBRIGADA_ASSETS_PATH . 'dist/js/site-video.js';
		if (is_readable($script_path)) {
			$script = (string) file_get_contents($script_path);
			if (preg_match_all("/\\{\\s*src:\\s*'([^']+)'\\s*,\\s*preview:\\s*'([^']+)'\\s*,\\s*title:\\s*'([^']+)'\\s*\\}/", $script, $matches, PREG_SET_ORDER)) {
				foreach ($matches as $match) {
					$item = [
						'src'     => (string) $match[1],
						'preview' => (string) $match[2],
						'title'   => (string) $match[3],
					];
					$videos[sha1($item['src'])] = $item + ['pages' => array_values(array_unique(array_filter(array_map('absint', $video_page_ids))))];
				}
			}
		}
	}

	$order = 0;
	foreach ($videos as $source_key => $video) {
		$pages = array_values(array_unique(array_filter(array_map('absint', (array) ($video['pages'] ?? [])))));
		if (! $pages) {
			continue;
		}
		$existing = get_posts(
			[
				'post_type'      => 'stroybrigada_video',
				'post_status'    => 'any',
				'posts_per_page' => 1,
				'fields'         => 'ids',
				'meta_key'       => '_stroybrigada_video_source_key',
				'meta_value'     => $source_key,
			]
		);
		$post_id = ! empty($existing[0]) ? (int) $existing[0] : 0;
		if ($post_id <= 0) {
			$post_id = wp_insert_post(
				[
					'post_type'   => 'stroybrigada_video',
					'post_status' => 'publish',
					'post_title'  => (string) ($video['title'] ?? __('Видео с объекта', 'stroybrigada')),
					'menu_order'  => $order,
				],
				true
			);
			if (is_wp_error($post_id) || (int) $post_id <= 0) {
				continue;
			}
			$post_id = (int) $post_id;
			update_post_meta($post_id, '_stroybrigada_video_source_key', $source_key);
			update_post_meta($post_id, '_stroybrigada_video_src', (string) ($video['src'] ?? ''));
			update_post_meta($post_id, '_stroybrigada_video_preview', (string) ($video['preview'] ?? ''));
		}

		$current_pages = stroybrigada_video_get_pages($post_id);
		update_post_meta($post_id, '_stroybrigada_video_pages', array_values(array_unique(array_merge($current_pages, $pages))));
		$order++;
	}

	update_option('stroybrigada_video_import_version', $version, false);
}
add_action('admin_init', 'stroybrigada_import_default_videos');
