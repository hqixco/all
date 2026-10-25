<?php
/**
 * Plugin Name: Stroybrigada Image Optimizer
 * Description: Optimizes Stroybrigada case photos into lightweight WebP copies.
 * Version: 1.0.0
 * Author: Stroybrigada
 * Text Domain: stroybrigada-image-optimizer
 */

if (! defined('ABSPATH')) {
	exit;
}

const SBIO_OPTION_LOG = 'stroybrigada_image_optimizer_log';
const SBIO_OPTION_SETTINGS = 'stroybrigada_image_optimizer_settings';
const SBIO_NAME_BACKUP_CRON_HOOK = 'sbio_cleanup_name_backup';

function sbio_default_settings(): array {
	return [
		'quality'       => 82,
		'max_dimension' => 1920,
	];
}

function sbio_get_settings(): array {
	$settings = get_option(SBIO_OPTION_SETTINGS, []);
	$settings = is_array($settings) ? $settings : [];

	return array_merge(sbio_default_settings(), [
		'quality'       => max(45, min(95, (int) ($settings['quality'] ?? 82))),
		'max_dimension' => max(900, min(3200, (int) ($settings['max_dimension'] ?? 1920))),
	]);
}

function sbio_register_admin_menu(): void {
	add_menu_page(
		__('Оптимизация фото', 'stroybrigada-image-optimizer'),
		__('Оптимизация фото', 'stroybrigada-image-optimizer'),
		'manage_options',
		'stroybrigada-image-optimizer',
		'sbio_render_admin_page',
		'dashicons-images-alt2',
		32
	);
}
add_action('admin_menu', 'sbio_register_admin_menu');

function sbio_delete_dir_recursive(string $dir): void {
	$dir = wp_normalize_path($dir);
	$uploads = wp_get_upload_dir();
	$backup_root = wp_normalize_path(trailingslashit((string) ($uploads['basedir'] ?? '')) . 'stroybrigada-name-backups');
	if ('' === $dir || '' === $backup_root || ! str_starts_with($dir, $backup_root) || ! is_dir($dir)) {
		return;
	}

	$items = scandir($dir);
	if (! is_array($items)) {
		return;
	}

	foreach ($items as $item) {
		if ('.' === $item || '..' === $item) {
			continue;
		}

		$path = $dir . '/' . $item;
		if (is_dir($path)) {
			sbio_delete_dir_recursive($path);
		} elseif (is_file($path)) {
			@unlink($path);
		}
	}

	@rmdir($dir);
}

function sbio_cleanup_name_backup(string $backup_dir): void {
	sbio_delete_dir_recursive($backup_dir);
}
add_action(SBIO_NAME_BACKUP_CRON_HOOK, 'sbio_cleanup_name_backup');

function sbio_name_backup_root(): string {
	$uploads = wp_get_upload_dir();
	$uploads_dir = (string) ($uploads['basedir'] ?? '');
	return '' !== $uploads_dir ? trailingslashit($uploads_dir) . 'stroybrigada-name-backups' : '';
}

function sbio_latest_name_backup(): array {
	$root = sbio_name_backup_root();
	if ('' === $root || ! is_dir($root)) {
		return [];
	}

	$items = scandir($root);
	if (! is_array($items)) {
		return [];
	}

	$backups = [];
	foreach ($items as $item) {
		if ('.' === $item || '..' === $item) {
			continue;
		}

		$dir = trailingslashit($root) . $item;
		$manifest_path = trailingslashit($dir) . 'manifest.json';
		if (! is_dir($dir) || ! is_readable($manifest_path)) {
			continue;
		}

		$manifest = json_decode((string) file_get_contents($manifest_path), true);
		if (! is_array($manifest) || empty($manifest['files']) || ! is_array($manifest['files'])) {
			continue;
		}

		$backups[] = [
			'dir' => $dir,
			'name' => $item,
			'created_at' => (string) ($manifest['created_at'] ?? ''),
			'count' => count($manifest['files']),
			'manifest' => $manifest,
		];
	}

	usort(
		$backups,
		static fn(array $a, array $b): int => strcmp((string) $b['name'], (string) $a['name'])
	);

	return $backups[0] ?? [];
}

function sbio_is_video_preview_reference(string $value): bool {
	$value = strtolower(str_replace('\\', '/', $value));
	return str_contains($value, '/videos/previews/');
}

function sbio_case_posts(): array {
	$post_ids = get_posts(
		[
			'post_type'      => 'project',
			'post_status'    => ['publish', 'draft', 'private'],
			'posts_per_page' => -1,
			'fields'         => 'ids',
		]
	);

	if (! empty($post_ids)) {
		return array_values(array_map('absint', $post_ids));
	}

	$meta_posts = get_posts(
		[
			'post_type'      => 'any',
			'post_status'    => ['publish', 'draft', 'private'],
			'posts_per_page' => -1,
			'fields'         => 'ids',
			'meta_query'     => [
				'relation' => 'OR',
				[
					'key'     => '_stroybrigada_case_main_image',
					'compare' => 'EXISTS',
				],
				[
					'key'     => '_stroybrigada_case_gallery',
					'compare' => 'EXISTS',
				],
			],
		]
	);

	return array_values(array_map('absint', $meta_posts));
}

function sbio_case_images_for_post(int $post_id): array {
	$images = [];
	$main = (string) get_post_meta($post_id, '_stroybrigada_case_main_image', true);
	if ('' !== $main) {
		$images[] = $main;
	}

	$gallery = get_post_meta($post_id, '_stroybrigada_case_gallery', true);
	if (is_array($gallery)) {
		foreach ($gallery as $image) {
			if (is_string($image) && '' !== trim($image)) {
				$images[] = trim($image);
			}
		}
	}

	return array_values(array_unique($images));
}

function sbio_all_case_images(): array {
	$images = [];
	foreach (sbio_case_posts() as $post_id) {
		foreach (sbio_case_images_for_post((int) $post_id) as $image) {
			$images[] = $image;
		}
	}

	return array_values(array_unique($images));
}

function sbio_case_image_contexts(): array {
	$contexts = [];
	foreach (sbio_case_posts() as $post_id) {
		$post_id = (int) $post_id;
		$title = trim((string) get_the_title($post_id));
		foreach (sbio_case_images_for_post($post_id) as $index => $image) {
			$image = (string) $image;
			if ('' === $image) {
				continue;
			}

			if (! isset($contexts[$image])) {
				$contexts[$image] = [
					'title' => '' !== $title ? $title : __('Кейс', 'stroybrigada-image-optimizer'),
					'index' => ((int) $index) + 1,
					'source' => 'case',
				];
			}
		}
	}

	return $contexts;
}

function sbio_normalize_found_image_url(string $url): string {
	$url = html_entity_decode(trim($url), ENT_QUOTES | ENT_HTML5, 'UTF-8');
	$url = preg_replace('/[?#].*$/', '', $url) ?? $url;

	return rtrim($url, " \t\n\r\0\x0B\"'");
}

function sbio_extract_image_urls_from_value($value): array {
	$urls = [];
	if (is_string($value)) {
		if (preg_match_all('#(?:https?://[^\s"\'<>]+|/(?:wp-content/uploads|assets/uploads)/[^\s"\'<>]+)\.(?:jpe?g|png|webp)(?:[?#][^\s"\'<>]*)?#i', $value, $matches)) {
			foreach ($matches[0] as $match) {
				$url = sbio_normalize_found_image_url((string) $match);
				if ('' !== $url) {
					$urls[] = $url;
				}
			}
		}
	} elseif (is_array($value)) {
		foreach ($value as $item) {
			$urls = array_merge($urls, sbio_extract_image_urls_from_value($item));
		}
	}

	return array_values(array_unique($urls));
}

function sbio_referenced_image_contexts(): array {
	$contexts = sbio_case_image_contexts();
	$posts = get_posts(
		[
			'post_type'      => 'any',
			'post_status'    => 'any',
			'posts_per_page' => -1,
			'fields'         => 'ids',
		]
	);

	foreach ($posts as $post_id) {
		$post_id = (int) $post_id;
		$post = get_post($post_id);
		if (! $post instanceof WP_Post) {
			continue;
		}

		$title = trim((string) get_the_title($post_id));
		if ('' === $title) {
			$title = 'stroybrigada-page-' . $post_id;
		}

		$urls = [];
		foreach (['post_content', 'post_excerpt', 'guid'] as $field) {
			$urls = array_merge($urls, sbio_extract_image_urls_from_value((string) $post->{$field}));
		}

		foreach (get_post_meta($post_id) as $meta_key => $unused_values) {
			$urls = array_merge($urls, sbio_extract_image_urls_from_value(get_post_meta($post_id, (string) $meta_key, true)));
		}

		$urls = array_values(array_unique($urls));
		foreach ($urls as $index => $url) {
			if (! isset($contexts[$url])) {
				$contexts[$url] = [
					'title' => $title,
					'index' => ((int) $index) + 1,
					'source' => 'content',
				];
			}
		}
	}

	return $contexts;
}

function sbio_add_filesystem_image_contexts(array $contexts): array {
	$roots = [
		[
			'dir' => trailingslashit(get_template_directory()) . 'assets/dist/uploads',
			'type' => 'assets',
		],
		[
			'dir' => (string) (wp_get_upload_dir()['basedir'] ?? ''),
			'type' => 'uploads',
		],
	];

	foreach ($roots as $root) {
		$dir = (string) ($root['dir'] ?? '');
		if ('' === $dir || ! is_dir($dir)) {
			continue;
		}

		$iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($dir, FilesystemIterator::SKIP_DOTS));
		foreach ($iterator as $file) {
			if (! $file instanceof SplFileInfo || ! $file->isFile()) {
				continue;
			}

			$path = wp_normalize_path($file->getPathname());
			if (str_contains($path, '/stroybrigada-name-backups/')) {
				continue;
			}

			$ext = strtolower($file->getExtension());
			if (! in_array($ext, ['jpg', 'jpeg', 'png', 'webp'], true)) {
				continue;
			}

			$url = sbio_path_to_known_url($path, 'assets' === (string) $root['type'] ? '/assets/uploads/' : '/wp-content/uploads/');
			if ('' === $url || isset($contexts[$url])) {
				continue;
			}

			$contexts[$url] = [
				'title' => sbio_slugify_filename_part(basename(dirname($path))) . '-image',
				'index' => count($contexts) + 1,
				'source' => (string) $root['type'],
			];
		}
	}

	return $contexts;
}

function sbio_dedupe_image_contexts_by_path(array $contexts): array {
	$deduped = [];
	$path_keys = [];

	foreach ($contexts as $image_url => $context) {
		$image_url = sbio_normalize_found_image_url((string) $image_url);
		if ('' === $image_url) {
			continue;
		}

		$context = is_array($context) ? $context : [];
		$path = sbio_url_to_path($image_url);
		if (sbio_is_video_preview_reference($image_url) || ('' !== $path && sbio_is_video_preview_reference($path))) {
			continue;
		}

		$path_key = '' !== $path ? strtolower(wp_normalize_path($path)) : '';
		$canonical_url = '' !== $path ? sbio_path_to_known_url($path, $image_url) : '';
		if ('' === $canonical_url) {
			$canonical_url = $image_url;
		}

		$key = '' !== $path_key ? $path_key : strtolower($canonical_url);
		if (isset($path_keys[$key])) {
			$existing_url = $path_keys[$key];
			$aliases = isset($deduped[$existing_url]['aliases']) && is_array($deduped[$existing_url]['aliases'])
				? $deduped[$existing_url]['aliases']
				: [$existing_url];
			$aliases[] = $image_url;
			$aliases[] = $canonical_url;
			$deduped[$existing_url]['aliases'] = array_values(array_unique(array_filter($aliases)));
			if (empty($deduped[$existing_url]['source']) && ! empty($context['source'])) {
				$deduped[$existing_url]['source'] = (string) $context['source'];
			}
			continue;
		}

		$context['aliases'] = array_values(array_unique(array_filter([$image_url, $canonical_url])));
		$deduped[$canonical_url] = $context;
		$path_keys[$key] = $canonical_url;
	}

	return $deduped;
}

function sbio_project_image_contexts(): array {
	return sbio_dedupe_image_contexts_by_path(sbio_add_filesystem_image_contexts(sbio_referenced_image_contexts()));
}

function sbio_case_name_contexts(): array {
	return sbio_dedupe_image_contexts_by_path(sbio_case_image_contexts());
}

function sbio_name_contexts_for_scope(string $scope): array {
	return 'project' === $scope ? sbio_project_image_contexts() : sbio_case_name_contexts();
}

function sbio_is_optimized_url(string $url): bool {
	return str_contains($url, '/stroybrigada-optimized/');
}

function sbio_url_to_path(string $url): string {
	$url = trim($url);
	if ('' === $url) {
		return '';
	}

	$uploads = wp_get_upload_dir();
	$baseurl = (string) ($uploads['baseurl'] ?? '');
	$basedir = (string) ($uploads['basedir'] ?? '');

	if ('' !== $baseurl && str_starts_with($url, $baseurl)) {
		return $basedir . str_replace('/', DIRECTORY_SEPARATOR, substr($url, strlen($baseurl)));
	}

	if (preg_match('#^https?://#i', $url)) {
		$path = wp_parse_url($url, PHP_URL_PATH);
		$url = is_string($path) ? $path : $url;
	}

	$theme_url = trailingslashit(get_template_directory_uri()) . 'assets/dist/';
	if (str_starts_with($url, $theme_url)) {
		return trailingslashit(get_template_directory()) . 'assets/dist/' . str_replace('/', DIRECTORY_SEPARATOR, substr($url, strlen($theme_url)));
	}

	if (str_starts_with($url, '/wp-content/uploads/') && '' !== $basedir) {
		return $basedir . str_replace('/', DIRECTORY_SEPARATOR, substr($url, strlen('/wp-content/uploads')));
	}

	if (str_starts_with($url, '/wp-content/themes/')) {
		return trailingslashit(ABSPATH) . str_replace('/', DIRECTORY_SEPARATOR, ltrim($url, '/'));
	}

	if (str_starts_with($url, '/assets/')) {
		return trailingslashit(get_template_directory()) . 'assets/dist/' . str_replace('/', DIRECTORY_SEPARATOR, substr($url, strlen('/assets/')));
	}

	return '';
}

function sbio_display_url(string $url): string {
	if (str_starts_with($url, '/assets/')) {
		return trailingslashit(get_template_directory_uri()) . 'assets/dist/' . ltrim(substr($url, strlen('/assets/')), '/');
	}

	return $url;
}

function sbio_path_to_upload_url(string $path): string {
	$uploads = wp_get_upload_dir();
	$basedir = wp_normalize_path((string) ($uploads['basedir'] ?? ''));
	$baseurl = (string) ($uploads['baseurl'] ?? '');
	$path = wp_normalize_path($path);

	if ('' === $basedir || '' === $baseurl || ! str_starts_with($path, $basedir)) {
		return '';
	}

	return $baseurl . str_replace($basedir, '', $path);
}

function sbio_format_bytes(int $bytes): string {
	if ($bytes >= 1048576) {
		return rtrim(rtrim(number_format($bytes / 1048576, 2, '.', ''), '0'), '.') . ' MB';
	}

	return rtrim(rtrim(number_format($bytes / 1024, 1, '.', ''), '0'), '.') . ' KB';
}

function sbio_slugify_filename_part(string $value): string {
	$value = trim($value);
	if ('' === $value) {
		return 'stroybrigada-photo';
	}

	$map = [
		'а' => 'a', 'б' => 'b', 'в' => 'v', 'г' => 'g', 'д' => 'd', 'е' => 'e', 'ё' => 'e',
		'ж' => 'zh', 'з' => 'z', 'и' => 'i', 'й' => 'j', 'к' => 'k', 'л' => 'l', 'м' => 'm',
		'н' => 'n', 'о' => 'o', 'п' => 'p', 'р' => 'r', 'с' => 's', 'т' => 't', 'у' => 'u',
		'ф' => 'f', 'х' => 'h', 'ц' => 'c', 'ч' => 'ch', 'ш' => 'sh', 'щ' => 'shh', 'ъ' => '',
		'ы' => 'y', 'ь' => '', 'э' => 'e', 'ю' => 'yu', 'я' => 'ya',
	];
	$lower = function_exists('mb_strtolower') ? mb_strtolower($value, 'UTF-8') : strtolower($value);
	$slug = strtr($lower, $map);
	$slug = preg_replace('/[^a-z0-9]+/', '-', $slug) ?? '';
	$slug = trim($slug, '-');

	return '' !== $slug ? $slug : 'stroybrigada-photo';
}

function sbio_filename_needs_rename(string $filename): bool {
	$raw_name = (string) pathinfo($filename, PATHINFO_FILENAME);
	$name = strtolower($raw_name);
	$base = preg_replace('/(?:-\d+x\d+|-scaled|-\d+)$/', '', $name) ?? $name;
	if (preg_match('/-opt-[a-f0-9]{8,}$/', $base)) {
		return true;
	}

	if (preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/', $base)) {
		return true;
	}

	if (preg_match('/^[0-9a-f]{20,}$/', $base)) {
		return true;
	}

	if (preg_match('/^[0-9a-z]{24,}$/', $base) && ! preg_match('/[aeiouy]{2,}/', $base)) {
		return true;
	}

	if (preg_match('/^[A-Za-z0-9]{18,}$/', $raw_name) && preg_match('/[A-Z]/', $raw_name) && preg_match('/[a-z]/', $raw_name) && preg_match('/\d/', $raw_name)) {
		return true;
	}

	if (preg_match('/^[a-f0-9-]{24,}$/', $base) && substr_count($base, '-') >= 3) {
		return true;
	}

	if (preg_match('/^\d+$/', $base)) {
		return true;
	}

	if (preg_match('/^(dsc|dscn|pict|screenshot|screen|whatsapp-image|telegram-cloud-photo)[-_]?\d*/', $base)) {
		return true;
	}

	if (strlen($base) <= 3) {
		return true;
	}

	if (! str_contains($base, '-') && strlen($base) <= 6 && preg_match('/\d/', $base)) {
		return true;
	}

	return false;
}

function sbio_path_to_known_url(string $path, string $old_url): string {
	$path = wp_normalize_path($path);
	$theme_dist = wp_normalize_path(trailingslashit(get_template_directory()) . 'assets/dist/');
	if (str_starts_with($path, $theme_dist)) {
		return '/assets/' . ltrim(str_replace($theme_dist, '', $path), '/');
	}

	$upload_url = sbio_path_to_upload_url($path);
	if ('' !== $upload_url) {
		if (str_starts_with($old_url, '/wp-content/uploads/')) {
			$uploads = wp_get_upload_dir();
			$baseurl_path = (string) wp_parse_url((string) ($uploads['baseurl'] ?? ''), PHP_URL_PATH);
			$new_path = (string) wp_parse_url($upload_url, PHP_URL_PATH);
			return '' !== $baseurl_path && str_starts_with($new_path, $baseurl_path)
				? '/wp-content/uploads' . substr($new_path, strlen($baseurl_path))
				: $new_path;
		}

		return $upload_url;
	}

	return '';
}

function sbio_replace_value_recursive($value, array $replacements) {
	if (is_string($value)) {
		return str_replace(array_keys($replacements), array_values($replacements), $value);
	}

	if (is_array($value)) {
		foreach ($value as $key => $item) {
			$value[$key] = sbio_replace_value_recursive($item, $replacements);
		}
	}

	return $value;
}

function sbio_replacement_url_for_alias(string $alias, string $new_url): string {
	$alias_path = (string) wp_parse_url($alias, PHP_URL_PATH);
	$theme_path = '/wp-content/themes/' . basename(get_template_directory()) . '/assets/dist/';

	if (str_starts_with($new_url, '/assets/')) {
		$relative = ltrim(substr($new_url, strlen('/assets/')), '/');
		if (str_starts_with($alias_path, $theme_path)) {
			return $theme_path . $relative;
		}
	}

	if (str_starts_with($new_url, '/wp-content/uploads/')) {
		$uploads = wp_get_upload_dir();
		$baseurl_path = (string) wp_parse_url((string) ($uploads['baseurl'] ?? ''), PHP_URL_PATH);
		if ('' !== $baseurl_path && str_starts_with($alias_path, $baseurl_path)) {
			return '/wp-content/uploads' . substr($new_url, strlen('/wp-content/uploads'));
		}
	}

	return $new_url;
}

function sbio_expand_replacements(array $replacements): array {
	$expanded = [];
	$theme_uri = trailingslashit(get_template_directory_uri()) . 'assets/dist/';
	$theme_path = '/wp-content/themes/' . basename(get_template_directory()) . '/assets/dist/';

	foreach ($replacements as $old_url => $new_url) {
		$old_url = sbio_normalize_found_image_url((string) $old_url);
		$new_url = sbio_normalize_found_image_url((string) $new_url);
		if ('' === $old_url || '' === $new_url) {
			continue;
		}

		$expanded[$old_url] = sbio_replacement_url_for_alias($old_url, $new_url);
		if (str_starts_with($old_url, '/assets/') && str_starts_with($new_url, '/assets/')) {
			$old_relative = ltrim(substr($old_url, strlen('/assets/')), '/');
			$new_relative = ltrim(substr($new_url, strlen('/assets/')), '/');
			$expanded[$theme_path . $old_relative] = $theme_path . $new_relative;
			$expanded[$theme_uri . $old_relative] = $theme_uri . $new_relative;
		}
	}

	return $expanded;
}

function sbio_upload_relative_from_url(string $url): string {
	$uploads = wp_get_upload_dir();
	$baseurl = (string) ($uploads['baseurl'] ?? '');
	if ('' !== $baseurl && str_starts_with($url, $baseurl)) {
		return ltrim(str_replace('\\', '/', substr($url, strlen($baseurl))), '/');
	}

	if (str_starts_with($url, '/wp-content/uploads/')) {
		return ltrim(substr($url, strlen('/wp-content/uploads/')), '/');
	}

	return '';
}

function sbio_absolute_upload_url_from_relative(string $relative): string {
	$uploads = wp_get_upload_dir();
	$baseurl = (string) ($uploads['baseurl'] ?? '');
	return '' !== $baseurl && '' !== $relative ? trailingslashit($baseurl) . ltrim($relative, '/') : '';
}

function sbio_update_attachment_file_reference(string $old_url, string $new_url): void {
	$old_relative = sbio_upload_relative_from_url($old_url);
	$new_relative = sbio_upload_relative_from_url($new_url);
	if ('' === $old_relative || '' === $new_relative) {
		return;
	}

	$attachments = get_posts(
		[
			'post_type'      => 'attachment',
			'post_status'    => 'any',
			'posts_per_page' => -1,
			'fields'         => 'ids',
			'meta_key'       => '_wp_attached_file',
			'meta_value'     => $old_relative,
		]
	);

	foreach ($attachments as $attachment_id) {
		$attachment_id = (int) $attachment_id;
		update_post_meta($attachment_id, '_wp_attached_file', $new_relative);

		$metadata = wp_get_attachment_metadata($attachment_id);
		if (is_array($metadata) && isset($metadata['file']) && (string) $metadata['file'] === $old_relative) {
			$metadata['file'] = $new_relative;
			wp_update_attachment_metadata($attachment_id, $metadata);
		}

		$new_filename = basename($new_relative);
		$new_title = preg_replace('/[-_]+/', ' ', (string) pathinfo($new_filename, PATHINFO_FILENAME)) ?? '';
		$new_title = trim($new_title);
		$new_absolute_url = sbio_absolute_upload_url_from_relative($new_relative);
		$attachment = get_post($attachment_id);
		$guid = $attachment instanceof WP_Post ? (string) $attachment->guid : '';
		$updated_guid = '' !== $new_absolute_url ? $new_absolute_url : (string) str_replace($old_url, $new_url, $guid);

		wp_update_post(
			wp_slash(
				[
					'ID' => $attachment_id,
					'post_title' => '' !== $new_title ? $new_title : $new_filename,
					'post_name' => sanitize_title((string) pathinfo($new_filename, PATHINFO_FILENAME)),
					'guid' => '' !== $updated_guid ? $updated_guid : $guid,
				]
			)
		);
	}
}

function sbio_refresh_attachment_display_names(): array {
	$results = ['updated' => 0, 'skip' => 0, 'error' => 0];
	$attachments = get_posts(
		[
			'post_type' => 'attachment',
			'post_status' => 'any',
			'posts_per_page' => -1,
			'fields' => 'ids',
			'post_mime_type' => 'image',
		]
	);

	foreach ($attachments as $attachment_id) {
		$attachment_id = (int) $attachment_id;
		$relative = (string) get_post_meta($attachment_id, '_wp_attached_file', true);
		if ('' === $relative) {
			$results['skip']++;
			continue;
		}

		$filename = basename($relative);
		$title = preg_replace('/[-_]+/', ' ', (string) pathinfo($filename, PATHINFO_FILENAME)) ?? '';
		$title = trim($title);
		$guid = sbio_absolute_upload_url_from_relative($relative);
		$updated = wp_update_post(
			wp_slash(
				[
					'ID' => $attachment_id,
					'post_title' => '' !== $title ? $title : $filename,
					'post_name' => sanitize_title((string) pathinfo($filename, PATHINFO_FILENAME)),
					'guid' => $guid,
				]
			),
			true
		);

		if (is_wp_error($updated)) {
			$results['error']++;
			continue;
		}

		clean_post_cache($attachment_id);
		$results['updated']++;
	}

	return $results;
}

function sbio_replace_theme_file_references(array $replacements): int {
	if (! $replacements) {
		return 0;
	}

	$root = wp_normalize_path(get_template_directory());
	if ('' === $root || ! is_dir($root)) {
		return 0;
	}

	$changed = 0;
	$iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($root, FilesystemIterator::SKIP_DOTS));
	foreach ($iterator as $file) {
		if (! $file instanceof SplFileInfo || ! $file->isFile()) {
			continue;
		}

		$path = wp_normalize_path($file->getPathname());
		if (
			str_contains($path, '/.git/') ||
			str_contains($path, '/.backups/') ||
			str_contains($path, '/node_modules/') ||
			str_contains($path, '/vendor/') ||
			str_contains($path, '/stroybrigada-name-backups/')
		) {
			continue;
		}

		$ext = strtolower($file->getExtension());
		if (! in_array($ext, ['php', 'html', 'css', 'js', 'json', 'txt'], true)) {
			continue;
		}

		$current = @file_get_contents($path);
		if (! is_string($current) || '' === $current) {
			continue;
		}

		$updated = str_replace(array_keys($replacements), array_values($replacements), $current);
		if ($updated !== $current && false !== @file_put_contents($path, $updated)) {
			$changed++;
		}
	}

	return $changed;
}

function sbio_create_name_backup(array $items): array {
	$uploads = wp_get_upload_dir();
	$uploads_dir = (string) ($uploads['basedir'] ?? '');
	if ('' === $uploads_dir) {
		return ['ok' => false, 'message' => __('Не удалось определить папку uploads для бекапа.', 'stroybrigada-image-optimizer')];
	}

	$backup_root = trailingslashit($uploads_dir) . 'stroybrigada-name-backups';
	if (! wp_mkdir_p($backup_root)) {
		return ['ok' => false, 'message' => __('Не удалось создать папку бекапов.', 'stroybrigada-image-optimizer')];
	}

	$backup_dir = trailingslashit($backup_root) . gmdate('Ymd-His') . '-' . wp_generate_password(6, false, false);
	if (! wp_mkdir_p($backup_dir)) {
		return ['ok' => false, 'message' => __('Не удалось создать папку текущего бекапа.', 'stroybrigada-image-optimizer')];
	}

	$manifest = [
		'created_at' => current_time('mysql'),
		'delete_after_seconds' => HOUR_IN_SECONDS,
		'files' => [],
	];
	$copied = 0;
	foreach ($items as $item) {
		if (! is_array($item)) {
			continue;
		}

		$source = (string) ($item['old_path'] ?? '');
		if ('' === $source || ! is_readable($source)) {
			continue;
		}

		$relative = ltrim(str_replace(':', '', wp_normalize_path($source)), '/');
		$backup_path = trailingslashit($backup_dir) . $relative;
		if (! wp_mkdir_p(dirname($backup_path)) || ! @copy($source, $backup_path)) {
			continue;
		}

		$manifest['files'][] = [
			'old_url' => (string) ($item['old_url'] ?? ''),
			'new_url' => (string) ($item['new_url'] ?? ''),
			'old_path' => $source,
			'new_path' => (string) ($item['new_path'] ?? ''),
			'backup_path' => $backup_path,
		];
		$copied++;
	}

	if ($copied <= 0) {
		sbio_delete_dir_recursive($backup_dir);
		return ['ok' => false, 'message' => __('Не удалось скопировать файлы в бекап.', 'stroybrigada-image-optimizer')];
	}

	file_put_contents(trailingslashit($backup_dir) . 'manifest.json', wp_json_encode($manifest, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
	wp_schedule_single_event(time() + HOUR_IN_SECONDS, SBIO_NAME_BACKUP_CRON_HOOK, [$backup_dir]);

	return [
		'ok' => true,
		'dir' => $backup_dir,
		'count' => $copied,
	];
}

function sbio_restore_latest_name_backup(): array {
	$backup = sbio_latest_name_backup();
	if (! $backup) {
		return ['status' => 'error', 'message' => __('Бекап для отката не найден.', 'stroybrigada-image-optimizer'), 'restored' => 0, 'errors' => 0];
	}

	$manifest = is_array($backup['manifest'] ?? null) ? $backup['manifest'] : [];
	$files = is_array($manifest['files'] ?? null) ? $manifest['files'] : [];
	$replacements = [];
	$restored = 0;
	$errors = 0;

	foreach ($files as $item) {
		if (! is_array($item)) {
			continue;
		}

		$backup_path = (string) ($item['backup_path'] ?? '');
		$old_path = (string) ($item['old_path'] ?? '');
		$new_path = (string) ($item['new_path'] ?? '');
		$old_url = (string) ($item['old_url'] ?? '');
		$new_url = (string) ($item['new_url'] ?? '');

		if ('' === $backup_path || '' === $old_path || ! is_readable($backup_path)) {
			$errors++;
			continue;
		}

		if (! wp_mkdir_p(dirname($old_path)) || ! @copy($backup_path, $old_path)) {
			$errors++;
			continue;
		}

		if ('' !== $new_path && wp_normalize_path($new_path) !== wp_normalize_path($old_path) && is_file($new_path)) {
			@unlink($new_path);
		}

		if ('' !== $old_url && '' !== $new_url) {
			$replacements[$new_url] = $old_url;
		}

		$restored++;
	}

	if ($replacements) {
		sbio_replace_image_urls_everywhere($replacements);
	}

	if ($restored > 0) {
		wp_clear_scheduled_hook(SBIO_NAME_BACKUP_CRON_HOOK, [(string) $backup['dir']]);
		sbio_delete_dir_recursive((string) $backup['dir']);
	}

	return [
		'status' => $errors > 0 ? 'warning' : 'ok',
		'message' => sprintf(__('Откат выполнен: восстановлено файлов %d, ошибок %d.', 'stroybrigada-image-optimizer'), $restored, $errors),
		'restored' => $restored,
		'errors' => $errors,
	];
}

function sbio_restore_latest_video_preview_backup(): array {
	$backup = sbio_latest_name_backup();
	if (! $backup) {
		return ['status' => 'error', 'message' => __('Бекап для отката не найден.', 'stroybrigada-image-optimizer'), 'restored' => 0, 'errors' => 0];
	}

	$manifest = is_array($backup['manifest'] ?? null) ? $backup['manifest'] : [];
	$files = is_array($manifest['files'] ?? null) ? $manifest['files'] : [];
	$replacements = [];
	$restored = 0;
	$errors = 0;

	foreach ($files as $item) {
		if (! is_array($item)) {
			continue;
		}

		$backup_path = (string) ($item['backup_path'] ?? '');
		$old_path = (string) ($item['old_path'] ?? '');
		$new_path = (string) ($item['new_path'] ?? '');
		$old_url = (string) ($item['old_url'] ?? '');
		$new_url = (string) ($item['new_url'] ?? '');

		if (
			! sbio_is_video_preview_reference($backup_path) &&
			! sbio_is_video_preview_reference($old_path) &&
			! sbio_is_video_preview_reference($new_path) &&
			! sbio_is_video_preview_reference($old_url) &&
			! sbio_is_video_preview_reference($new_url)
		) {
			continue;
		}

		if ('' === $backup_path || '' === $old_path || ! is_readable($backup_path)) {
			$errors++;
			continue;
		}

		if (! wp_mkdir_p(dirname($old_path)) || ! @copy($backup_path, $old_path)) {
			$errors++;
			continue;
		}

		if ('' !== $new_path && wp_normalize_path($new_path) !== wp_normalize_path($old_path) && is_file($new_path)) {
			@unlink($new_path);
		}

		if ('' !== $old_url && '' !== $new_url) {
			$replacements[$new_url] = $old_url;
		}

		$restored++;
	}

	if ($replacements) {
		sbio_replace_image_urls_everywhere($replacements);
	}

	return [
		'status' => $errors > 0 ? 'warning' : 'ok',
		'message' => sprintf(__('Превью видео восстановлены: файлов %d, ошибок %d.', 'stroybrigada-image-optimizer'), $restored, $errors),
		'restored' => $restored,
		'errors' => $errors,
	];
}

function sbio_replace_image_urls_everywhere(array $replacements): void {
	if (! $replacements) {
		return;
	}

	$replacements = sbio_expand_replacements($replacements);
	sbio_replace_case_image_urls($replacements);
	foreach ($replacements as $old_url => $new_url) {
		sbio_update_attachment_file_reference((string) $old_url, (string) $new_url);
	}

	$posts = get_posts(
		[
			'post_type'      => 'any',
			'post_status'    => 'any',
			'posts_per_page' => -1,
			'fields'         => 'ids',
		]
	);

	foreach ($posts as $post_id) {
		$post_id = (int) $post_id;
		$post = get_post($post_id);
		if ($post instanceof WP_Post) {
			$post_update = ['ID' => $post_id];
			$changed = false;
			foreach (['post_content', 'post_excerpt', 'guid'] as $field) {
				$current = (string) $post->{$field};
				$updated = str_replace(array_keys($replacements), array_values($replacements), $current);
				if ($updated !== $current) {
					$post_update[$field] = $updated;
					$changed = true;
				}
			}
			if ($changed) {
				wp_update_post(wp_slash($post_update));
			}
		}

		foreach (get_post_meta($post_id) as $meta_key => $unused_values) {
			$values = get_post_meta($post_id, (string) $meta_key, false);
			if (count($values) <= 1) {
				$single = $values[0] ?? '';
				$updated = sbio_replace_value_recursive($single, $replacements);
				if ($updated !== $single) {
					update_post_meta($post_id, (string) $meta_key, $updated);
				}
				continue;
			}

			$updated_values = [];
			$changed = false;
			foreach ($values as $value) {
				$updated = sbio_replace_value_recursive($value, $replacements);
				$updated_values[] = $updated;
				$changed = $changed || $updated !== $value;
			}

			if ($changed) {
				delete_post_meta($post_id, (string) $meta_key);
				foreach ($updated_values as $updated) {
					add_post_meta($post_id, (string) $meta_key, $updated);
				}
			}
		}
	}

	$log = get_option(SBIO_OPTION_LOG, []);
	if (is_array($log)) {
		$updated_log = [];
		foreach ($log as $source_url => $entry) {
			$new_source = (string) str_replace(array_keys($replacements), array_values($replacements), (string) $source_url);
			$updated_log[$new_source] = sbio_replace_value_recursive($entry, $replacements);
		}
		update_option(SBIO_OPTION_LOG, $updated_log, false);
	}

	sbio_replace_theme_file_references($replacements);
}

function sbio_image_meta(string $url): array {
	$path = sbio_url_to_path($url);
	$size = ('' !== $path && is_readable($path)) ? (int) filesize($path) : 0;
	$dimensions = ('' !== $path && is_readable($path)) ? @getimagesize($path) : false;
	$type = ('' !== $path) ? (string) (wp_check_filetype($path)['ext'] ?? '') : '';

	return [
		'path'   => $path,
		'name'   => '' !== $path ? basename($path) : basename((string) wp_parse_url($url, PHP_URL_PATH)),
		'size'   => $size,
		'type'   => strtoupper($type),
		'width'  => is_array($dimensions) ? (int) ($dimensions[0] ?? 0) : 0,
		'height' => is_array($dimensions) ? (int) ($dimensions[1] ?? 0) : 0,
	];
}

function sbio_load_gd_image(string $path, string $mime) {
	if ('image/jpeg' === $mime && function_exists('imagecreatefromjpeg')) {
		return imagecreatefromjpeg($path);
	}

	if ('image/png' === $mime && function_exists('imagecreatefrompng')) {
		return imagecreatefrompng($path);
	}

	if ('image/webp' === $mime && function_exists('imagecreatefromwebp')) {
		return imagecreatefromwebp($path);
	}

	return false;
}

function sbio_save_gd_webp(string $source_path, string $source_url, array $settings, string $out_path): array {
	if (! function_exists('imagewebp')) {
		return ['status' => 'error', 'message' => __('На сервере нет поддержки сохранения WebP в GD.', 'stroybrigada-image-optimizer')];
	}

	$mime = (string) (wp_check_filetype($source_path)['type'] ?? '');
	$source = sbio_load_gd_image($source_path, $mime);
	if (! $source) {
		return ['status' => 'error', 'message' => __('Не удалось открыть изображение через GD.', 'stroybrigada-image-optimizer')];
	}

	$width = imagesx($source);
	$height = imagesy($source);
	$max_dimension = (int) $settings['max_dimension'];
	$target = $source;

	if ($width > $max_dimension || $height > $max_dimension) {
		$ratio = min($max_dimension / $width, $max_dimension / $height);
		$new_width = max(1, (int) floor($width * $ratio));
		$new_height = max(1, (int) floor($height * $ratio));
		$resized = imagecreatetruecolor($new_width, $new_height);
		imagealphablending($resized, false);
		imagesavealpha($resized, true);
		imagecopyresampled($resized, $source, 0, 0, 0, 0, $new_width, $new_height, $width, $height);
		$target = $resized;
	}

	$result = imagewebp($target, $out_path, (int) $settings['quality']);
	if ($target !== $source) {
		imagedestroy($target);
	}
	imagedestroy($source);

	if (! $result || ! is_readable($out_path)) {
		return ['status' => 'error', 'message' => __('GD не смог сохранить WebP.', 'stroybrigada-image-optimizer')];
	}

	$out_url = sbio_path_to_upload_url($out_path);
	if ('' === $out_url) {
		return ['status' => 'error', 'message' => __('Не удалось получить URL оптимизированного файла.', 'stroybrigada-image-optimizer')];
	}

	return [
		'status'          => 'ok',
		'message'         => __('Фото сжато через GD.', 'stroybrigada-image-optimizer'),
		'url'             => $out_url,
		'original_bytes'  => (int) filesize($source_path),
		'optimized_bytes' => (int) filesize($out_path),
	];
}

function sbio_replace_case_image_urls(array $replacements): void {
	foreach (sbio_case_posts() as $post_id) {
		$post_id = (int) $post_id;
		$main = (string) get_post_meta($post_id, '_stroybrigada_case_main_image', true);
		if (isset($replacements[$main])) {
			update_post_meta($post_id, '_stroybrigada_case_main_image', $replacements[$main]);
			update_post_meta($post_id, '_stroybrigada_case_preview', $replacements[$main]);
		}

		$gallery = get_post_meta($post_id, '_stroybrigada_case_gallery', true);
		if (! is_array($gallery)) {
			continue;
		}

		$changed = false;
		foreach ($gallery as $index => $image) {
			if (is_string($image) && isset($replacements[$image])) {
				$gallery[$index] = $replacements[$image];
				$changed = true;
			}
		}

		if ($changed) {
			update_post_meta($post_id, '_stroybrigada_case_gallery', array_values($gallery));
		}
	}
}

function sbio_logged_optimized_url(string $source_url, array $log): string {
	if (! isset($log[$source_url]) || ! is_array($log[$source_url])) {
		return '';
	}

	$optimized_url = (string) ($log[$source_url]['optimized'] ?? '');
	$optimized_path = sbio_url_to_path($optimized_url);
	if ('' === $optimized_url || '' === $optimized_path || ! is_readable($optimized_path)) {
		return '';
	}

	return $optimized_url;
}

function sbio_original_url_for_optimized(string $optimized_url, array $log): string {
	foreach ($log as $original_url => $entry) {
		if (is_array($entry) && (string) ($entry['optimized'] ?? '') === $optimized_url) {
			return (string) $original_url;
		}
	}

	return '';
}

function sbio_optimize_image(string $source_url, array $settings): array {
	$source_path = sbio_url_to_path($source_url);
	if ('' === $source_path || ! is_readable($source_path)) {
		return ['status' => 'error', 'message' => __('Исходный файл не найден.', 'stroybrigada-image-optimizer')];
	}

	$filetype = wp_check_filetype($source_path);
	$mime = (string) ($filetype['type'] ?? '');
	if (! in_array($mime, ['image/jpeg', 'image/png', 'image/webp'], true)) {
		return ['status' => 'skip', 'message' => __('Формат не поддерживается. Нужны JPG, PNG или WebP.', 'stroybrigada-image-optimizer')];
	}

	$uploads = wp_get_upload_dir();
	$out_dir = trailingslashit((string) ($uploads['basedir'] ?? '')) . 'stroybrigada-optimized';
	if (! wp_mkdir_p($out_dir)) {
		return ['status' => 'error', 'message' => __('Не удалось создать папку optimized.', 'stroybrigada-image-optimizer')];
	}

	$name = sanitize_file_name(pathinfo($source_path, PATHINFO_FILENAME));
	$hash = substr(sha1($source_url . '|' . filemtime($source_path) . '|' . wp_json_encode($settings)), 0, 10);
	$out_path = trailingslashit($out_dir) . $name . '-opt-' . $hash . '.webp';
	if (is_readable($out_path)) {
		$out_url = sbio_path_to_upload_url($out_path);
		if ('' !== $out_url) {
			return [
				'status'          => 'ok',
				'message'         => __('Использована готовая оптимизированная копия.', 'stroybrigada-image-optimizer'),
				'url'             => $out_url,
				'original_bytes'  => (int) filesize($source_path),
				'optimized_bytes' => (int) filesize($out_path),
			];
		}
	}

	if (! function_exists('wp_get_image_editor')) {
		require_once ABSPATH . 'wp-admin/includes/image.php';
	}

	$editor = wp_get_image_editor($source_path);
	if (is_wp_error($editor)) {
		return sbio_save_gd_webp($source_path, $source_url, $settings, $out_path);
	}

	$size = $editor->get_size();
	$width = (int) ($size['width'] ?? 0);
	$height = (int) ($size['height'] ?? 0);
	$max_dimension = (int) $settings['max_dimension'];
	if ($width > $max_dimension || $height > $max_dimension) {
		$resize_result = $editor->resize($max_dimension, $max_dimension, false);
		if (is_wp_error($resize_result)) {
			return sbio_save_gd_webp($source_path, $source_url, $settings, $out_path);
		}
	}

	$editor->set_quality((int) $settings['quality']);
	$saved = $editor->save($out_path, 'image/webp');
	if (is_wp_error($saved) || ! is_readable($out_path)) {
		return sbio_save_gd_webp($source_path, $source_url, $settings, $out_path);
	}

	$out_url = sbio_path_to_upload_url($out_path);
	if ('' === $out_url) {
		return ['status' => 'error', 'message' => __('Не удалось получить URL оптимизированного файла.', 'stroybrigada-image-optimizer')];
	}

	return [
		'status'         => 'ok',
		'message'        => __('Фото сжато.', 'stroybrigada-image-optimizer'),
		'url'            => $out_url,
		'original_bytes' => (int) filesize($source_path),
		'optimized_bytes'=> (int) filesize($out_path),
	];
}

/**
 * Replaces local raster images in rendered HTML with cached, right-sized WebP
 * copies. Originals and values stored in the database remain untouched.
 */
function sbio_optimize_rendered_html(string $html, int $max_dimension = 1920): string {
	if ('' === $html) {
		return $html;
	}

	$settings = sbio_get_settings();
	$settings['max_dimension'] = max(320, min((int) $settings['max_dimension'], $max_dimension));
	$replacements = [];
	$image_urls = sbio_extract_image_urls_from_value($html);
	if (! $image_urls) {
		return $html;
	}

	foreach ($image_urls as $image_url) {
		$image_url = sbio_normalize_found_image_url((string) $image_url);
		if ('' === $image_url || sbio_is_optimized_url($image_url) || '' === sbio_url_to_path($image_url)) {
			continue;
		}

		$result = sbio_optimize_image($image_url, $settings);
		if ('ok' === (string) ($result['status'] ?? '') && ! empty($result['url'])) {
			$replacements[$image_url] = (string) $result['url'];
		}
	}

	return $replacements
		? str_replace(array_keys($replacements), array_values($replacements), $html)
		: $html;
}

/**
 * Optimizes raster images in the complete frontend response, including images
 * printed by the header, footer, native templates and third-party shortcodes.
 * More specific section limits (for example 640px for quizzes) are applied
 * before this fallback and their generated URLs are intentionally skipped.
 */
function sbio_optimize_frontend_response(string $html): string {
	if ('' === $html || false === stripos($html, '<html')) {
		return $html;
	}

	return sbio_optimize_rendered_html($html, 1440);
}

function sbio_start_frontend_image_optimization(): void {
	if (
		is_admin()
		|| wp_doing_ajax()
		|| wp_doing_cron()
		|| is_feed()
		|| is_robots()
		|| (defined('REST_REQUEST') && REST_REQUEST)
		|| 'GET' !== strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? 'GET'))
	) {
		return;
	}

	ob_start('sbio_optimize_frontend_response');
}
add_action('template_redirect', 'sbio_start_frontend_image_optimization', 0);

function sbio_process_single(string $image_url): array {
	$image_url = trim($image_url);
	if ('' === $image_url) {
		return ['status' => 'error', 'message' => __('Фото не выбрано.', 'stroybrigada-image-optimizer')];
	}

	if (sbio_is_optimized_url($image_url)) {
		return ['status' => 'skip', 'message' => __('Это фото уже является оптимизированной копией.', 'stroybrigada-image-optimizer')];
	}

	$log = get_option(SBIO_OPTION_LOG, []);
	$log = is_array($log) ? $log : [];
	$logged_optimized_url = sbio_logged_optimized_url($image_url, $log);
	if ('' !== $logged_optimized_url) {
		sbio_replace_case_image_urls([$image_url => $logged_optimized_url]);
		return ['status' => 'skip', 'message' => __('Готовая WebP-копия уже была создана, ссылка обновлена.', 'stroybrigada-image-optimizer')];
	}

	$settings = sbio_get_settings();
	$result = sbio_optimize_image($image_url, $settings);
	if ('ok' === (string) ($result['status'] ?? '') && ! empty($result['url'])) {
		$optimized_url = (string) $result['url'];
		sbio_replace_case_image_urls([$image_url => $optimized_url]);
		$log[$image_url] = [
			'optimized'       => $optimized_url,
			'original_bytes'  => (int) ($result['original_bytes'] ?? 0),
			'optimized_bytes' => (int) ($result['optimized_bytes'] ?? 0),
			'settings'        => $settings,
			'time'            => current_time('mysql'),
		];
		update_option(SBIO_OPTION_LOG, $log, false);
	}

	return $result;
}

function sbio_reset_single(string $image_url): array {
	$log = get_option(SBIO_OPTION_LOG, []);
	$log = is_array($log) ? $log : [];

	$original_url = sbio_original_url_for_optimized($image_url, $log);
	if ('' === $original_url) {
		$logged_optimized_url = sbio_logged_optimized_url($image_url, $log);
		if ('' !== $logged_optimized_url) {
			$original_url = $image_url;
			$image_url = $logged_optimized_url;
		}
	}

	if ('' === $original_url) {
		return ['status' => 'skip', 'message' => __('Оригинал для этой фотографии не найден в логе.', 'stroybrigada-image-optimizer')];
	}

	sbio_replace_case_image_urls([$image_url => $original_url]);
	return ['status' => 'ok', 'message' => __('Ссылка возвращена на оригинал.', 'stroybrigada-image-optimizer')];
}

function sbio_process_all(): array {
	$results = ['ok' => 0, 'skip' => 0, 'error' => 0, 'messages' => []];
	foreach (sbio_all_case_images() as $image_url) {
		$result = sbio_process_single((string) $image_url);
		$status = (string) ($result['status'] ?? 'error');
		$results[isset($results[$status]) ? $status : 'error']++;
		if ('error' === $status && count($results['messages']) < 8) {
			$meta = sbio_image_meta((string) $image_url);
			$results['messages'][] = trim((string) $meta['name'] . ': ' . (string) ($result['message'] ?? __('Ошибка без описания.', 'stroybrigada-image-optimizer')));
		}
	}

	return $results;
}

function sbio_reset_all(): array {
	$log = get_option(SBIO_OPTION_LOG, []);
	$log = is_array($log) ? $log : [];
	$replacements = [];

	foreach ($log as $original_url => $entry) {
		if (is_array($entry) && '' !== (string) ($entry['optimized'] ?? '')) {
			$replacements[(string) $entry['optimized']] = (string) $original_url;
		}
	}

	if ($replacements) {
		sbio_replace_case_image_urls($replacements);
	}

	return [
		'status'  => 'ok',
		'message' => sprintf(
			_n('Сброшена %d оптимизированная ссылка.', 'Сброшено %d оптимизированных ссылок.', count($replacements), 'stroybrigada-image-optimizer'),
			count($replacements)
		),
	];
}

function sbio_name_plan_for_context(string $image_url, array $context, bool $only_bad_names = true): array {
	$path = sbio_url_to_path($image_url);
	if ('' === $path || ! is_readable($path)) {
		return ['status' => 'error', 'message' => sprintf(__('Файл не найден: %s', 'stroybrigada-image-optimizer'), $image_url)];
	}

	$filename = basename($path);
	if ($only_bad_names && ! sbio_filename_needs_rename($filename)) {
		return ['status' => 'skip', 'message' => __('Имя не похоже на мусорное.', 'stroybrigada-image-optimizer')];
	}

	$ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
	if (! in_array($ext, ['jpg', 'jpeg', 'png', 'webp'], true)) {
		return ['status' => 'skip', 'message' => __('Формат не поддерживается.', 'stroybrigada-image-optimizer')];
	}

	$dir = dirname($path);
	$base = sbio_slugify_filename_part((string) ($context['title'] ?? ''));
	$index = max(1, (int) ($context['index'] ?? 1));
	$target_name = sprintf('%s-%02d.%s', $base, $index, $ext);
	$target_path = trailingslashit($dir) . $target_name;
	$attempt = 2;
	while (file_exists($target_path) && wp_normalize_path($target_path) !== wp_normalize_path($path)) {
		$target_name = sprintf('%s-%02d-%02d.%s', $base, $index, $attempt, $ext);
		$target_path = trailingslashit($dir) . $target_name;
		$attempt++;
	}

	if (wp_normalize_path($target_path) === wp_normalize_path($path)) {
		return ['status' => 'skip', 'message' => __('Новое имя совпадает с текущим.', 'stroybrigada-image-optimizer')];
	}

	$new_url = sbio_path_to_known_url($target_path, $image_url);
	if ('' === $new_url) {
		return ['status' => 'error', 'message' => sprintf(__('URL не определен: %s', 'stroybrigada-image-optimizer'), $target_name)];
	}

	return [
		'status' => 'planned',
		'old_url' => $image_url,
		'new_url' => $new_url,
		'old_path' => $path,
		'new_path' => $target_path,
		'old_name' => $filename,
		'new_name' => $target_name,
		'aliases' => isset($context['aliases']) && is_array($context['aliases']) ? $context['aliases'] : [$image_url],
	];
}

function sbio_run_name_rename(array $contexts, bool $only_bad_names = true): array {
	$results = ['renamed' => 0, 'skip' => 0, 'error' => 0, 'checked' => count($contexts), 'planned' => 0, 'backup' => 0, 'backup_dir' => '', 'messages' => []];
	$replacements = [];
	$planned = [];

	foreach ($contexts as $image_url => $context) {
		$plan = sbio_name_plan_for_context((string) $image_url, is_array($context) ? $context : [], $only_bad_names);
		$status = (string) ($plan['status'] ?? 'error');
		if ('planned' !== $status) {
			$results['error' === $status ? 'error' : 'skip']++;
			if ('error' === $status && count($results['messages']) < 8) {
				$results['messages'][] = (string) ($plan['message'] ?? __('Ошибка без описания.', 'stroybrigada-image-optimizer'));
			}
			continue;
		}

		$planned[] = $plan;
	}

	if (! $planned) {
		return $results;
	}
	$results['planned'] = count($planned);

	$backup = sbio_create_name_backup($planned);
	if (empty($backup['ok'])) {
		$results['error']++;
		$results['messages'][] = (string) ($backup['message'] ?? __('Бекап не создан, переименование отменено.', 'stroybrigada-image-optimizer'));
		return $results;
	}

	$results['backup'] = (int) ($backup['count'] ?? 0);
	$results['backup_dir'] = (string) ($backup['dir'] ?? '');

	foreach ($planned as $item) {
		$path = (string) $item['old_path'];
		$target_path = (string) $item['new_path'];
		if (! @rename($path, $target_path)) {
			$results['error']++;
			if (count($results['messages']) < 8) {
				$results['messages'][] = sprintf(__('Не удалось переименовать: %s', 'stroybrigada-image-optimizer'), (string) $item['old_name']);
			}
			continue;
		}

		$aliases = isset($item['aliases']) && is_array($item['aliases']) ? $item['aliases'] : [(string) $item['old_url']];
		foreach ($aliases as $alias) {
			$alias = sbio_normalize_found_image_url((string) $alias);
			if ('' !== $alias) {
				$replacements[$alias] = (string) $item['new_url'];
			}
		}
		$replacements[(string) $item['old_url']] = (string) $item['new_url'];
		$results['renamed']++;
	}

	if ($replacements) {
		sbio_replace_image_urls_everywhere($replacements);
	}

	return $results;
}

function sbio_optimize_names(): array {
	return sbio_run_name_rename(sbio_dedupe_image_contexts_by_path(sbio_referenced_image_contexts()), true);
}

function sbio_optimize_case_names(): array {
	return sbio_run_name_rename(sbio_case_name_contexts(), true);
}

function sbio_optimize_selected_names(array $urls): array {
	$all_contexts = sbio_project_image_contexts();
	$selected = [];
	foreach ($urls as $url) {
		$url = sbio_normalize_found_image_url((string) wp_unslash($url));
		if (isset($all_contexts[$url])) {
			$selected[$url] = $all_contexts[$url];
		}
	}

	return sbio_run_name_rename($selected, false);
}

function sbio_render_admin_page(): void {
	if (! current_user_can('manage_options')) {
		wp_die(esc_html__('Недостаточно прав.', 'stroybrigada-image-optimizer'));
	}

	$notice = '';
	$results = null;
	$single_result = null;
	$rollback_result = null;
	$media_result = null;

	if ('POST' === ($_SERVER['REQUEST_METHOD'] ?? '') && isset($_POST['sbio_nonce'])) {
		check_admin_referer('sbio_action', 'sbio_nonce');
		$action = sanitize_key((string) wp_unslash($_POST['sbio_action'] ?? ''));
		$name_scope = sanitize_key((string) wp_unslash($_POST['sbio_name_scope'] ?? 'cases'));
		$image_url = isset($_POST['sbio_image_url']) ? esc_url_raw(wp_unslash((string) $_POST['sbio_image_url'])) : '';
		if (! empty($_POST['sbio_rename_single_url'])) {
			$action = 'rename_single_name';
			$image_url = esc_url_raw(wp_unslash((string) $_POST['sbio_rename_single_url']));
		}

		if ('save' === $action) {
			$incoming = is_array($_POST['sbio_settings'] ?? null) ? (array) wp_unslash($_POST['sbio_settings']) : [];
			update_option(
				SBIO_OPTION_SETTINGS,
				[
					'quality'       => max(45, min(95, (int) ($incoming['quality'] ?? 82))),
					'max_dimension' => max(900, min(3200, (int) ($incoming['max_dimension'] ?? 1920))),
				],
				false
			);
			$notice = 'saved';
		} elseif ('process_all' === $action) {
			$results = sbio_process_all();
			$notice = 'processed';
		} elseif ('reset_all' === $action) {
			$single_result = sbio_reset_all();
			$notice = 'single';
		} elseif ('optimize_names' === $action) {
			$results = 'project' === $name_scope ? sbio_optimize_names() : sbio_optimize_case_names();
			$notice = 'names';
		} elseif ('rename_selected_names' === $action) {
			$packed_urls = isset($_POST['sbio_name_urls_packed']) ? json_decode(wp_unslash((string) $_POST['sbio_name_urls_packed']), true) : null;
			$selected_urls = is_array($packed_urls) ? $packed_urls : (is_array($_POST['sbio_name_urls'] ?? null) ? (array) $_POST['sbio_name_urls'] : []);
			$results = sbio_optimize_selected_names($selected_urls);
			$notice = 'names';
		} elseif ('rename_single_name' === $action && '' !== $image_url) {
			$results = sbio_optimize_selected_names([$image_url]);
			$notice = 'names';
		} elseif ('rollback_name_backup' === $action) {
			$rollback_result = sbio_restore_latest_name_backup();
			$notice = 'rollback';
		} elseif ('rollback_video_preview_backup' === $action) {
			$rollback_result = sbio_restore_latest_video_preview_backup();
			$notice = 'rollback';
		} elseif ('refresh_media_names' === $action) {
			$media_result = sbio_refresh_attachment_display_names();
			$notice = 'media';
		} elseif ('clear_log' === $action) {
			update_option(SBIO_OPTION_LOG, [], false);
			$notice = 'cleared';
		} elseif ('process_single' === $action && '' !== $image_url) {
			$single_result = sbio_process_single($image_url);
			$notice = 'single';
		} elseif ('reset_single' === $action && '' !== $image_url) {
			$single_result = sbio_reset_single($image_url);
			$notice = 'single';
		}
	}

	$settings = sbio_get_settings();
	$images = sbio_all_case_images();
	$name_scope = isset($_GET['sbio_name_scope']) ? sanitize_key((string) wp_unslash($_GET['sbio_name_scope'])) : 'cases';
	$name_scope = 'project' === $name_scope ? 'project' : 'cases';
	$name_images = sbio_name_contexts_for_scope($name_scope);
	$case_name_count = count(sbio_case_name_contexts());
	$project_name_count = count(sbio_project_image_contexts());
	$latest_backup = sbio_latest_name_backup();
	$log = get_option(SBIO_OPTION_LOG, []);
	$log = is_array($log) ? $log : [];
	$total_bytes = 0;
	foreach ($images as $image_url) {
		$total_bytes += (int) sbio_image_meta((string) $image_url)['size'];
	}
	?>
	<div class="wrap sbio-admin">
		<style>
			.sbio-admin{max-width:1240px}
			.sbio-panel{margin:18px 0;padding:18px 22px;border:1px solid #dcdcde;border-radius:14px;background:#fff}
			.sbio-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
			.sbio-field{display:grid;gap:6px}
			.sbio-field input{width:100%;box-sizing:border-box}
			.sbio-actions{display:flex;flex-wrap:wrap;gap:10px;align-items:center}
			.sbio-stats{display:flex;flex-wrap:wrap;gap:10px;margin:12px 0}
			.sbio-stat{padding:10px 12px;border:1px solid #dcdcde;border-radius:10px;background:#f8fafc;font-weight:700}
			.sbio-list{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px}
			.sbio-thumb{position:relative;min-width:0;border:1px solid #dcdcde;border-radius:12px;overflow:hidden;background:#fff}
			.sbio-thumb__media{position:relative;aspect-ratio:1/1;background:#f1f5f9}
			.sbio-thumb img{display:block;width:100%;height:100%;object-fit:cover}
			.sbio-thumb__status{position:absolute;left:8px;top:8px;z-index:2;padding:5px 8px;border-radius:999px;background:rgba(15,23,42,.8);color:#fff;font-size:11px;font-weight:800}
			.sbio-thumb__status--ok{background:#549168}
			.sbio-thumb__actions{position:absolute;left:8px;right:8px;bottom:8px;z-index:2;display:grid;grid-template-columns:1fr 1fr;gap:6px}
			.sbio-thumb__actions form{margin:0}
			.sbio-thumb__actions .button{width:100%;min-height:30px;padding:0 8px;border-radius:8px;font-size:11px;font-weight:700;line-height:1.1;white-space:normal}
			.sbio-thumb__actions .button-primary{background:#549168;border-color:#549168}
			.sbio-thumb__body{display:grid;gap:5px;padding:10px 12px}
			.sbio-thumb__name{font-weight:800;word-break:break-word}
			.sbio-thumb__meta{color:#475569;font-size:12px;line-height:1.35}
			.sbio-name-toolbar{display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:space-between;margin:12px 0}
			.sbio-name-toolbar__left,.sbio-name-toolbar__right{display:flex;flex-wrap:wrap;gap:10px;align-items:center}
			.sbio-tabs{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0}
			.sbio-tab{display:inline-flex;align-items:center;padding:7px 12px;border:1px solid #dcdcde;border-radius:999px;background:#fff;text-decoration:none;font-weight:700}
			.sbio-tab.is-active{background:#2271b1;border-color:#2271b1;color:#fff}
			.sbio-check{display:inline-flex;gap:8px;align-items:center;font-weight:700}
			.sbio-table-wrap{overflow:auto;border:1px solid #dcdcde;border-radius:12px;background:#fff}
			.sbio-table{width:100%;border-collapse:collapse;min-width:980px}
			.sbio-table th,.sbio-table td{padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:left;vertical-align:middle}
			.sbio-table th{background:#f8fafc;color:#334155;font-size:12px;text-transform:uppercase}
			.sbio-table tr:last-child td{border-bottom:0}
			.sbio-name-preview{width:64px;height:64px;border-radius:10px;object-fit:cover;background:#f1f5f9}
			.sbio-name-main{display:grid;gap:4px;min-width:180px}
			.sbio-name-current{font-weight:800;word-break:break-word}
			.sbio-name-next{font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:12px;word-break:break-word}
			.sbio-name-source{max-width:280px;color:#475569;font-size:12px;line-height:1.35;word-break:break-word}
			.sbio-pill{display:inline-flex;width:max-content;align-items:center;padding:4px 8px;border-radius:999px;background:#e2e8f0;color:#334155;font-size:11px;font-weight:800}
			.sbio-pill--bad{background:#fee2e2;color:#991b1b}
			.sbio-pill--ok{background:#dcfce7;color:#166534}
			@media(max-width:1200px){.sbio-list{grid-template-columns:repeat(4,minmax(0,1fr))}}
			@media(max-width:900px){.sbio-list{grid-template-columns:repeat(3,minmax(0,1fr))}}
			@media(max-width:782px){.sbio-grid,.sbio-list{grid-template-columns:1fr}}
		</style>
		<h1><?php esc_html_e('Оптимизация фото кейсов', 'stroybrigada-image-optimizer'); ?></h1>
		<?php if ('saved' === $notice) : ?>
			<div class="notice notice-success is-dismissible"><p><?php esc_html_e('Настройки сохранены.', 'stroybrigada-image-optimizer'); ?></p></div>
		<?php elseif ('processed' === $notice && is_array($results)) : ?>
			<div class="notice <?php echo (int) $results['error'] > 0 ? 'notice-warning' : 'notice-success'; ?> is-dismissible">
				<p><?php echo esc_html(sprintf('Готово: %d, пропущено: %d, ошибок: %d.', (int) $results['ok'], (int) $results['skip'], (int) $results['error'])); ?></p>
				<?php if (! empty($results['messages']) && is_array($results['messages'])) : ?>
					<ul>
						<?php foreach ($results['messages'] as $message) : ?>
							<li><?php echo esc_html((string) $message); ?></li>
						<?php endforeach; ?>
					</ul>
				<?php endif; ?>
			</div>
		<?php elseif ('names' === $notice && is_array($results)) : ?>
			<div class="notice <?php echo (int) $results['error'] > 0 ? 'notice-warning' : 'notice-success'; ?> is-dismissible">
				<p><?php echo esc_html(sprintf('Имена оптимизированы: %d, найдено к переименованию: %d, проверено ссылок: %d, пропущено: %d, ошибок: %d.', (int) $results['renamed'], (int) ($results['planned'] ?? 0), (int) ($results['checked'] ?? 0), (int) $results['skip'], (int) $results['error'])); ?></p>
				<?php if (! empty($results['backup'])) : ?>
					<p><?php echo esc_html(sprintf('Бекап файлов создан: %d. Автоудаление запланировано через 1 час.', (int) $results['backup'])); ?></p>
				<?php endif; ?>
				<?php if (! empty($results['messages']) && is_array($results['messages'])) : ?>
					<ul>
						<?php foreach ($results['messages'] as $message) : ?>
							<li><?php echo esc_html((string) $message); ?></li>
						<?php endforeach; ?>
					</ul>
				<?php endif; ?>
			</div>
		<?php elseif ('cleared' === $notice) : ?>
			<div class="notice notice-success is-dismissible"><p><?php esc_html_e('Лог очищен.', 'stroybrigada-image-optimizer'); ?></p></div>
		<?php elseif ('rollback' === $notice && is_array($rollback_result)) : ?>
			<div class="notice <?php echo 'ok' === (string) ($rollback_result['status'] ?? '') ? 'notice-success' : 'notice-warning'; ?> is-dismissible"><p><?php echo esc_html((string) ($rollback_result['message'] ?? __('Откат выполнен.', 'stroybrigada-image-optimizer'))); ?></p></div>
		<?php elseif ('media' === $notice && is_array($media_result)) : ?>
			<div class="notice <?php echo (int) ($media_result['error'] ?? 0) > 0 ? 'notice-warning' : 'notice-success'; ?> is-dismissible"><p><?php echo esc_html(sprintf('Медиатека обновлена: %d, пропущено: %d, ошибок: %d.', (int) ($media_result['updated'] ?? 0), (int) ($media_result['skip'] ?? 0), (int) ($media_result['error'] ?? 0))); ?></p></div>
		<?php elseif ('single' === $notice && is_array($single_result)) : ?>
			<?php $single_status = (string) ($single_result['status'] ?? 'error'); ?>
			<div class="notice <?php echo 'error' === $single_status ? 'notice-error' : 'notice-success'; ?> is-dismissible"><p><?php echo esc_html((string) ($single_result['message'] ?? __('Готово.', 'stroybrigada-image-optimizer'))); ?></p></div>
		<?php endif; ?>

		<form method="post">
			<?php wp_nonce_field('sbio_action', 'sbio_nonce'); ?>
			<input type="hidden" name="sbio_action" value="save">
			<section class="sbio-panel">
				<h2><?php esc_html_e('Настройки сжатия', 'stroybrigada-image-optimizer'); ?></h2>
				<div class="sbio-grid">
					<label class="sbio-field">
						<span><?php esc_html_e('Качество WebP, %', 'stroybrigada-image-optimizer'); ?></span>
						<input type="number" min="45" max="95" name="sbio_settings[quality]" value="<?php echo esc_attr((string) $settings['quality']); ?>">
					</label>
					<label class="sbio-field">
						<span><?php esc_html_e('Максимальная сторона, px', 'stroybrigada-image-optimizer'); ?></span>
						<input type="number" min="900" max="3200" name="sbio_settings[max_dimension]" value="<?php echo esc_attr((string) $settings['max_dimension']); ?>">
					</label>
				</div>
				<p class="sbio-actions">
					<button type="submit" class="button button-secondary"><?php esc_html_e('Сохранить настройки', 'stroybrigada-image-optimizer'); ?></button>
				</p>
			</section>
		</form>

		<section class="sbio-panel">
			<h2><?php esc_html_e('Фото кейсов', 'stroybrigada-image-optimizer'); ?></h2>
			<div class="sbio-stats">
				<div class="sbio-stat"><?php echo esc_html(sprintf('Найдено фото: %d', count($images))); ?></div>
				<div class="sbio-stat"><?php echo esc_html(sprintf('Текущий вес: %s', sbio_format_bytes($total_bytes))); ?></div>
				<div class="sbio-stat"><?php echo esc_html(sprintf('В логе сжато: %d', count($log))); ?></div>
			</div>
			<p><?php esc_html_e('Плагин создает WebP-копии, заменяет ссылки в карточках кейсов и не удаляет оригиналы.', 'stroybrigada-image-optimizer'); ?></p>
			<form method="post" class="sbio-actions">
				<?php wp_nonce_field('sbio_action', 'sbio_nonce'); ?>
				<button type="submit" class="button button-primary" name="sbio_action" value="process_all" onclick="return confirm('<?php echo esc_js(__('Сжать все еще не обработанные фото кейсов?', 'stroybrigada-image-optimizer')); ?>');"><?php esc_html_e('Сжать все', 'stroybrigada-image-optimizer'); ?></button>
				<button type="submit" class="button" name="sbio_action" value="reset_all" onclick="return confirm('<?php echo esc_js(__('Вернуть все ссылки кейсов на оригиналы?', 'stroybrigada-image-optimizer')); ?>');"><?php esc_html_e('Сбросить все', 'stroybrigada-image-optimizer'); ?></button>
				<button type="submit" class="button" name="sbio_action" value="clear_log"><?php esc_html_e('Очистить лог', 'stroybrigada-image-optimizer'); ?></button>
			</form>
		</section>

		<section class="sbio-panel">
			<h2><?php esc_html_e('Оптимизация имен', 'stroybrigada-image-optimizer'); ?></h2>
			<div class="sbio-tabs">
				<a class="sbio-tab <?php echo 'cases' === $name_scope ? 'is-active' : ''; ?>" href="<?php echo esc_url(add_query_arg('sbio_name_scope', 'cases')); ?>"><?php echo esc_html(sprintf('Фото кейсов: %d', $case_name_count)); ?></a>
				<a class="sbio-tab <?php echo 'project' === $name_scope ? 'is-active' : ''; ?>" href="<?php echo esc_url(add_query_arg('sbio_name_scope', 'project')); ?>"><?php echo esc_html(sprintf('Все картинки проекта: %d', $project_name_count)); ?></a>
			</div>
			<div class="sbio-stats">
				<div class="sbio-stat"><?php echo esc_html('project' === $name_scope ? sprintf('Показано картинок проекта: %d', count($name_images)) : sprintf('Показано фото кейсов: %d', count($name_images))); ?></div>
			</div>
			<form method="post">
				<?php wp_nonce_field('sbio_action', 'sbio_nonce'); ?>
				<input type="hidden" name="sbio_name_scope" value="<?php echo esc_attr($name_scope); ?>">
				<input type="hidden" name="sbio_name_urls_packed" id="sbio-name-urls-packed" value="">
				<div class="sbio-name-toolbar">
					<div class="sbio-name-toolbar__left">
						<label class="sbio-check">
							<input type="checkbox" id="sbio-name-select-all">
							<span><?php esc_html_e('Выделить все', 'stroybrigada-image-optimizer'); ?></span>
						</label>
						<button type="submit" class="button button-primary" name="sbio_action" value="rename_selected_names" onclick="return confirm('<?php echo esc_js(__('Переименовать выбранные картинки и обновить все найденные ссылки?', 'stroybrigada-image-optimizer')); ?>');"><?php esc_html_e('Переименовать все', 'stroybrigada-image-optimizer'); ?></button>
					</div>
					<div class="sbio-name-toolbar__right">
						<button type="submit" class="button button-secondary" name="sbio_action" value="optimize_names" onclick="return confirm('<?php echo esc_js(__('Автоматически переименовать только UUID/хэш-подобные файлы из ссылок и обновить пути?', 'stroybrigada-image-optimizer')); ?>');"><?php esc_html_e('Автовыбор плохих имен', 'stroybrigada-image-optimizer'); ?></button>
						<button type="submit" class="button" name="sbio_action" value="refresh_media_names"><?php esc_html_e('Обновить имена медиатеки', 'stroybrigada-image-optimizer'); ?></button>
						<?php if (! empty($latest_backup)) : ?>
							<button type="submit" class="button" name="sbio_action" value="rollback_video_preview_backup" onclick="return confirm('<?php echo esc_js(__('Восстановить только превью видео из последнего бекапа?', 'stroybrigada-image-optimizer')); ?>');"><?php esc_html_e('Откатить превью видео', 'stroybrigada-image-optimizer'); ?></button>
							<button type="submit" class="button button-secondary" name="sbio_action" value="rollback_name_backup" onclick="return confirm('<?php echo esc_js(__('Откатить последнее переименование имен к бекапу? Текущие переименованные файлы будут заменены старыми.', 'stroybrigada-image-optimizer')); ?>');"><?php esc_html_e('Откатить к бекапу', 'stroybrigada-image-optimizer'); ?></button>
							<span class="sbio-name-source"><?php echo esc_html(sprintf('Последний бекап: %s, файлов: %d', (string) ($latest_backup['created_at'] ?? $latest_backup['name'] ?? ''), (int) ($latest_backup['count'] ?? 0))); ?></span>
						<?php endif; ?>
					</div>
				</div>
				<div class="sbio-table-wrap">
					<table class="widefat striped sbio-table">
						<thead>
							<tr>
								<th><?php esc_html_e('Выбор', 'stroybrigada-image-optimizer'); ?></th>
								<th><?php esc_html_e('Фото', 'stroybrigada-image-optimizer'); ?></th>
								<th><?php esc_html_e('Текущее имя', 'stroybrigada-image-optimizer'); ?></th>
								<th><?php esc_html_e('Новое имя', 'stroybrigada-image-optimizer'); ?></th>
								<th><?php esc_html_e('Источник', 'stroybrigada-image-optimizer'); ?></th>
								<th><?php esc_html_e('Размер', 'stroybrigada-image-optimizer'); ?></th>
								<th><?php esc_html_e('Действие', 'stroybrigada-image-optimizer'); ?></th>
							</tr>
						</thead>
						<tbody>
							<?php foreach ($name_images as $image_url => $context) : ?>
								<?php
								$image_url = (string) $image_url;
								$context = is_array($context) ? $context : [];
								$meta = sbio_image_meta($image_url);
								$bad_plan = sbio_name_plan_for_context($image_url, $context, true);
								$manual_plan = sbio_name_plan_for_context($image_url, $context, false);
								$can_rename = 'planned' === (string) ($manual_plan['status'] ?? '');
								$is_recommended = 'planned' === (string) ($bad_plan['status'] ?? '');
								$new_name = $can_rename ? (string) ($manual_plan['new_name'] ?? '') : '';
								$source = (string) ($context['source'] ?? '');
								$title = (string) ($context['title'] ?? '');
								?>
								<tr>
									<td>
										<input type="checkbox" class="sbio-name-checkbox" data-sbio-name-url="<?php echo esc_attr($image_url); ?>" <?php checked($is_recommended); ?> <?php disabled(! $can_rename); ?>>
									</td>
									<td><img class="sbio-name-preview" src="<?php echo esc_url(sbio_display_url($image_url)); ?>" alt=""></td>
									<td>
										<div class="sbio-name-main">
											<div class="sbio-name-current"><?php echo esc_html((string) $meta['name']); ?></div>
											<span class="sbio-pill <?php echo $is_recommended ? 'sbio-pill--bad' : ($can_rename ? '' : 'sbio-pill--ok'); ?>">
												<?php echo esc_html($is_recommended ? __('рекомендуется', 'stroybrigada-image-optimizer') : ($can_rename ? __('можно', 'stroybrigada-image-optimizer') : __('нормально', 'stroybrigada-image-optimizer'))); ?>
											</span>
										</div>
									</td>
									<td>
										<?php if ($can_rename) : ?>
											<div class="sbio-name-next"><?php echo esc_html($new_name); ?></div>
										<?php else : ?>
											<span class="sbio-name-source"><?php echo esc_html((string) ($manual_plan['message'] ?? '—')); ?></span>
										<?php endif; ?>
									</td>
									<td>
										<div class="sbio-name-source">
											<?php echo esc_html('' !== $title ? $title : $source); ?>
											<?php if ('' !== $source && $source !== $title) : ?>
												<br><?php echo esc_html($source); ?>
											<?php endif; ?>
										</div>
									</td>
									<td>
										<div class="sbio-name-source">
											<?php echo esc_html(sprintf('%s · %s', (string) $meta['type'], sbio_format_bytes((int) $meta['size']))); ?>
											<?php if ((int) $meta['width'] > 0 && (int) $meta['height'] > 0) : ?>
												<br><?php echo esc_html(sprintf('%d × %d px', (int) $meta['width'], (int) $meta['height'])); ?>
											<?php endif; ?>
										</div>
									</td>
									<td>
										<button type="submit" class="button button-small" name="sbio_rename_single_url" value="<?php echo esc_attr($image_url); ?>" <?php disabled(! $can_rename); ?> onclick="return confirm('<?php echo esc_js(__('Переименовать эту картинку и обновить ссылки?', 'stroybrigada-image-optimizer')); ?>');"><?php esc_html_e('Переименовать', 'stroybrigada-image-optimizer'); ?></button>
									</td>
								</tr>
							<?php endforeach; ?>
						</tbody>
					</table>
				</div>
			</form>
		</section>

		<section class="sbio-panel">
			<h2><?php esc_html_e('Превью найденных фото', 'stroybrigada-image-optimizer'); ?></h2>
			<div class="sbio-list">
				<?php foreach ($images as $image_url) : ?>
					<?php
					$meta = sbio_image_meta((string) $image_url);
					$is_optimized = sbio_is_optimized_url((string) $image_url);
					?>
					<div class="sbio-thumb">
						<div class="sbio-thumb__media">
							<img src="<?php echo esc_url(sbio_display_url((string) $image_url)); ?>" alt="">
							<span class="sbio-thumb__status <?php echo $is_optimized ? 'sbio-thumb__status--ok' : ''; ?>"><?php echo esc_html($is_optimized ? 'WEBP' : 'ORIGINAL'); ?></span>
							<div class="sbio-thumb__actions">
								<form method="post">
									<?php wp_nonce_field('sbio_action', 'sbio_nonce'); ?>
									<input type="hidden" name="sbio_action" value="process_single">
									<input type="hidden" name="sbio_image_url" value="<?php echo esc_attr((string) $image_url); ?>">
									<button type="submit" class="button button-primary"><?php esc_html_e('Сжать', 'stroybrigada-image-optimizer'); ?></button>
								</form>
								<form method="post">
									<?php wp_nonce_field('sbio_action', 'sbio_nonce'); ?>
									<input type="hidden" name="sbio_action" value="reset_single">
									<input type="hidden" name="sbio_image_url" value="<?php echo esc_attr((string) $image_url); ?>">
									<button type="submit" class="button"><?php esc_html_e('Сбросить', 'stroybrigada-image-optimizer'); ?></button>
								</form>
							</div>
						</div>
						<div class="sbio-thumb__body">
							<div class="sbio-thumb__name"><?php echo esc_html((string) $meta['name']); ?></div>
							<div class="sbio-thumb__meta"><?php echo esc_html(sprintf('%s · %s', (string) $meta['type'], sbio_format_bytes((int) $meta['size']))); ?></div>
							<?php if ((int) $meta['width'] > 0 && (int) $meta['height'] > 0) : ?>
								<div class="sbio-thumb__meta"><?php echo esc_html(sprintf('%d × %d px', (int) $meta['width'], (int) $meta['height'])); ?></div>
							<?php endif; ?>
						</div>
					</div>
				<?php endforeach; ?>
			</div>
		</section>
		<script>
			document.addEventListener('change', function(event) {
				if (!event.target.matches('#sbio-name-select-all')) {
					return;
				}
				document.querySelectorAll('.sbio-name-checkbox:not(:disabled)').forEach(function(input) {
					input.checked = event.target.checked;
				});
			});
			document.addEventListener('submit', function(event) {
				var packed = event.target.querySelector('#sbio-name-urls-packed');
				if (!packed) {
					return;
				}
				var selected = [];
				event.target.querySelectorAll('.sbio-name-checkbox:checked:not(:disabled)').forEach(function(input) {
					if (input.dataset.sbioNameUrl) {
						selected.push(input.dataset.sbioNameUrl);
					}
				});
				packed.value = JSON.stringify(selected);
			});
		</script>
	</div>
	<?php
}
