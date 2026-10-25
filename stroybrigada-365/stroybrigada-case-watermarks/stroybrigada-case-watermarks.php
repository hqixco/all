<?php
/**
 * Plugin Name: Stroybrigada Case Watermarks
 * Description: Adds diagonal repeated logo watermarks to Stroybrigada case photos.
 * Version: 1.0.0
 * Author: Stroybrigada
 * Text Domain: stroybrigada-watermarks
 */

declare(strict_types=1);

if (! defined('ABSPATH')) {
	exit;
}

const SBWM_OPTION_SETTINGS = 'sbwm_settings';
const SBWM_OPTION_LOG      = 'sbwm_log';

function sbwm_default_settings(): array {
	return [
		'logo_url' => '',
		'opacity'  => 15,
		'columns'  => 5,
		'scale'    => 70,
		'angle'    => -25,
	];
}

function sbwm_get_settings(): array {
	$stored = get_option(SBWM_OPTION_SETTINGS, []);
	return array_replace(sbwm_default_settings(), is_array($stored) ? $stored : []);
}

function sbwm_sanitize_settings(array $data): array {
	$defaults = sbwm_default_settings();

	return [
		'logo_url' => esc_url_raw((string) ($data['logo_url'] ?? $defaults['logo_url'])),
		'opacity'  => max(1, min(70, absint($data['opacity'] ?? $defaults['opacity']))),
		'columns'  => max(1, min(12, absint($data['columns'] ?? $defaults['columns']))),
		'scale'    => max(20, min(140, absint($data['scale'] ?? $defaults['scale']))),
		'angle'    => max(-60, min(60, (int) ($data['angle'] ?? $defaults['angle']))),
	];
}

function sbwm_admin_menu(): void {
	add_menu_page(
		__('Ватермарки', 'stroybrigada-watermarks'),
		__('Ватермарки', 'stroybrigada-watermarks'),
		'manage_options',
		'stroybrigada-watermarks',
		'sbwm_render_admin_page',
		'dashicons-format-image',
		24
	);
}
add_action('admin_menu', 'sbwm_admin_menu');

function sbwm_admin_assets(string $hook_suffix): void {
	if ('toplevel_page_stroybrigada-watermarks' !== $hook_suffix) {
		return;
	}

	wp_enqueue_media();
}
add_action('admin_enqueue_scripts', 'sbwm_admin_assets');

function sbwm_case_posts(): array {
	return get_posts(
		[
			'post_type'      => 'project',
			'post_status'    => ['publish', 'draft', 'private'],
			'posts_per_page' => -1,
			'fields'         => 'ids',
		]
	);
}

function sbwm_case_images_for_post(int $post_id): array {
	$images = [];
	$main   = (string) get_post_meta($post_id, '_stroybrigada_case_main_image', true);
	if ('' !== $main) {
		$images[] = $main;
	}

	$gallery = get_post_meta($post_id, '_stroybrigada_case_gallery', true);
	if (is_array($gallery)) {
		foreach ($gallery as $image) {
			if (is_string($image) && '' !== $image) {
				$images[] = $image;
			}
		}
	}

	return array_values(array_unique($images));
}

function sbwm_all_case_images(): array {
	$images = [];
	foreach (sbwm_case_posts() as $post_id) {
		foreach (sbwm_case_images_for_post((int) $post_id) as $image) {
			$images[] = $image;
		}
	}

	return array_values(array_unique($images));
}

function sbwm_is_watermarked_url(string $url): bool {
	return str_contains($url, '/stroybrigada-watermarked/');
}

function sbwm_url_to_path(string $url): string {
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
		$url  = is_string($path) ? $path : $url;
	}

	$theme_url = trailingslashit(get_template_directory_uri()) . 'assets/dist/';
	if (str_starts_with($url, $theme_url)) {
		return trailingslashit(get_template_directory()) . 'assets/dist/' . str_replace('/', DIRECTORY_SEPARATOR, substr($url, strlen($theme_url)));
	}

	if (str_starts_with($url, '/wp-content/uploads/') && '' !== $basedir) {
		return $basedir . str_replace('/', DIRECTORY_SEPARATOR, substr($url, strlen('/wp-content/uploads')));
	}

	if (str_starts_with($url, '/wp-content/themes/')) {
		$relative = ltrim($url, '/');
		return trailingslashit(ABSPATH) . str_replace('/', DIRECTORY_SEPARATOR, $relative);
	}

	if (str_starts_with($url, '/assets/')) {
		$theme_dir = trailingslashit(get_template_directory()) . 'assets/dist/';
		return $theme_dir . str_replace('/', DIRECTORY_SEPARATOR, substr($url, strlen('/assets/')));
	}

	return '';
}

function sbwm_display_url(string $url): string {
	if (str_starts_with($url, '/assets/')) {
		return trailingslashit(get_template_directory_uri()) . 'assets/dist/' . ltrim(substr($url, strlen('/assets/')), '/');
	}

	return $url;
}

function sbwm_path_to_upload_url(string $path): string {
	$uploads = wp_get_upload_dir();
	$basedir = wp_normalize_path((string) ($uploads['basedir'] ?? ''));
	$baseurl = (string) ($uploads['baseurl'] ?? '');
	$path    = wp_normalize_path($path);

	if ('' === $basedir || '' === $baseurl || ! str_starts_with($path, $basedir)) {
		return '';
	}

	return $baseurl . str_replace($basedir, '', $path);
}

function sbwm_load_gd_image(string $path) {
	$mime = wp_check_filetype($path)['type'] ?? '';

	if ('image/jpeg' === $mime) {
		return imagecreatefromjpeg($path);
	}

	if ('image/png' === $mime) {
		return imagecreatefrompng($path);
	}

	if ('image/webp' === $mime && function_exists('imagecreatefromwebp')) {
		return imagecreatefromwebp($path);
	}

	return false;
}

function sbwm_save_gd_image($image, string $path, string $source_path): bool {
	$mime = wp_check_filetype($source_path)['type'] ?? '';

	if ('image/png' === $mime) {
		imagesavealpha($image, true);
		return imagepng($image, $path, 6);
	}

	if ('image/webp' === $mime && function_exists('imagewebp')) {
		return imagewebp($image, $path, 82);
	}

	return imagejpeg($image, $path, 86);
}

function sbwm_logo_canvas(string $logo_path, int $target_width, int $opacity, int $angle) {
	$logo = sbwm_load_gd_image($logo_path);
	if (! $logo) {
		return false;
	}

	imagealphablending($logo, true);
	imagesavealpha($logo, true);

	$logo_width  = imagesx($logo);
	$logo_height = imagesy($logo);
	if ($logo_width <= 0 || $logo_height <= 0) {
		imagedestroy($logo);
		return false;
	}

	$target_height = max(1, (int) round($target_width * ($logo_height / $logo_width)));
	$scaled = imagecreatetruecolor($target_width, $target_height);
	imagealphablending($scaled, false);
	imagesavealpha($scaled, true);
	imagefilledrectangle($scaled, 0, 0, $target_width, $target_height, imagecolorallocatealpha($scaled, 255, 255, 255, 127));
	imagecopyresampled($scaled, $logo, 0, 0, 0, 0, $target_width, $target_height, $logo_width, $logo_height);
	imagedestroy($logo);

	for ($x = 0; $x < $target_width; $x++) {
		for ($y = 0; $y < $target_height; $y++) {
			$rgba  = imagecolorat($scaled, $x, $y);
			$alpha = ($rgba & 0x7F000000) >> 24;
			if ($alpha >= 127) {
				continue;
			}

			$new_alpha = 127 - (int) round((127 - $alpha) * ($opacity / 100));
			$color = imagecolorsforindex($scaled, $rgba);
			imagesetpixel($scaled, $x, $y, imagecolorallocatealpha($scaled, $color['red'], $color['green'], $color['blue'], $new_alpha));
		}
	}

	$transparent = imagecolorallocatealpha($scaled, 255, 255, 255, 127);
	$rotated = imagerotate($scaled, $angle, $transparent);
	imagesavealpha($rotated, true);
	imagedestroy($scaled);

	return $rotated;
}

function sbwm_watermark_image(string $source_url, array $settings): array {
	if (sbwm_is_watermarked_url($source_url)) {
		return ['url' => $source_url, 'status' => 'skip', 'message' => 'already watermarked'];
	}

	$source_path = sbwm_url_to_path($source_url);
	$logo_path   = sbwm_url_to_path((string) $settings['logo_url']);
	if ('' === $source_path || ! is_readable($source_path)) {
		return ['url' => $source_url, 'status' => 'error', 'message' => 'source not readable'];
	}
	if ('' === $logo_path || ! is_readable($logo_path)) {
		return ['url' => $source_url, 'status' => 'error', 'message' => 'logo not readable'];
	}

	$source = sbwm_load_gd_image($source_path);
	if (! $source) {
		return ['url' => $source_url, 'status' => 'error', 'message' => 'unsupported source format'];
	}

	$width  = imagesx($source);
	$height = imagesy($source);
	$columns = max(1, (int) $settings['columns']);
	$scale = max(20, min(140, (int) ($settings['scale'] ?? 70))) / 100;
	$logo_width = max(40, (int) floor($width / $columns * $scale));
	$logo = sbwm_logo_canvas($logo_path, $logo_width, (int) $settings['opacity'], (int) $settings['angle']);
	if (! $logo) {
		imagedestroy($source);
		return ['url' => $source_url, 'status' => 'error', 'message' => 'unsupported logo format'];
	}

	imagealphablending($source, true);
	$logo_w = imagesx($logo);
	$logo_h = imagesy($logo);
	$gap_x  = max(20, (int) floor($width / $columns));
	$gap_y  = max(20, (int) floor($logo_h * 1.55));

	for ($y = -$logo_h; $y < $height + $logo_h; $y += $gap_y) {
		$row_offset = ((int) floor($y / $gap_y) % 2) * (int) floor($gap_x / 2);
		for ($x = -$logo_w; $x < $width + $logo_w; $x += $gap_x) {
			imagecopy($source, $logo, $x + $row_offset, $y, 0, 0, $logo_w, $logo_h);
		}
	}
	imagedestroy($logo);

	$uploads = wp_get_upload_dir();
	$out_dir = trailingslashit((string) $uploads['basedir']) . 'stroybrigada-watermarked';
	if (! wp_mkdir_p($out_dir)) {
		imagedestroy($source);
		return ['url' => $source_url, 'status' => 'error', 'message' => 'cannot create output dir'];
	}

	$file = wp_check_filetype($source_path);
	$ext  = strtolower((string) ($file['ext'] ?? 'jpg'));
	if (! in_array($ext, ['jpg', 'jpeg', 'png', 'webp'], true)) {
		$ext = 'jpg';
	}

	$name = sanitize_file_name(pathinfo($source_path, PATHINFO_FILENAME));
	$hash = substr(sha1($source_url . '|' . filemtime($source_path) . '|' . wp_json_encode($settings)), 0, 10);
	$out_path = trailingslashit($out_dir) . $name . '-wm-' . $hash . '.' . $ext;

	if (! sbwm_save_gd_image($source, $out_path, $source_path)) {
		imagedestroy($source);
		return ['url' => $source_url, 'status' => 'error', 'message' => 'cannot save output'];
	}
	imagedestroy($source);

	$out_url = sbwm_path_to_upload_url($out_path);
	return ['url' => $out_url, 'status' => 'ok', 'message' => 'watermarked'];
}

function sbwm_replace_case_image_urls(array $replacements): void {
	foreach (sbwm_case_posts() as $post_id) {
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

function sbwm_logged_watermarked_url(string $source_url, array $log): string {
	if (! isset($log[$source_url]) || ! is_array($log[$source_url])) {
		return '';
	}

	$watermarked_url = (string) ($log[$source_url]['watermarked'] ?? '');
	if ('' === $watermarked_url) {
		return '';
	}

	$watermarked_path = sbwm_url_to_path($watermarked_url);
	if ('' === $watermarked_path || ! is_readable($watermarked_path)) {
		return '';
	}

	return $watermarked_url;
}

function sbwm_original_url_for_watermarked(string $watermarked_url, array $log): string {
	foreach ($log as $original_url => $entry) {
		if (! is_array($entry)) {
			continue;
		}

		if ((string) ($entry['watermarked'] ?? '') === $watermarked_url) {
			return (string) $original_url;
		}
	}

	return '';
}

function sbwm_process_single(string $image_url): array {
	$settings = sbwm_get_settings();
	$log = get_option(SBWM_OPTION_LOG, []);
	$log = is_array($log) ? $log : [];

	if (sbwm_is_watermarked_url($image_url)) {
		return ['status' => 'skip', 'message' => __('На этой фотографии уже есть ватермарк.', 'stroybrigada-watermarks')];
	}

	$logged_watermarked_url = sbwm_logged_watermarked_url($image_url, $log);
	if ('' !== $logged_watermarked_url) {
		sbwm_replace_case_image_urls([$image_url => $logged_watermarked_url]);
		return ['status' => 'skip', 'message' => __('Готовая копия уже была создана, ссылка обновлена.', 'stroybrigada-watermarks')];
	}

	$result = sbwm_watermark_image($image_url, $settings);
	if ('ok' === (string) ($result['status'] ?? '') && ! empty($result['url'])) {
		$watermarked_url = (string) $result['url'];
		sbwm_replace_case_image_urls([$image_url => $watermarked_url]);
		$log[$image_url] = [
			'watermarked' => $watermarked_url,
			'time'        => current_time('mysql'),
		];
		update_option(SBWM_OPTION_LOG, $log, false);
	}

	return $result;
}

function sbwm_reset_single(string $image_url): array {
	$log = get_option(SBWM_OPTION_LOG, []);
	$log = is_array($log) ? $log : [];

	$original_url = sbwm_original_url_for_watermarked($image_url, $log);
	if ('' === $original_url) {
		$logged_watermarked_url = sbwm_logged_watermarked_url($image_url, $log);
		if ('' !== $logged_watermarked_url) {
			$original_url = $image_url;
			$image_url = $logged_watermarked_url;
		}
	}

	if ('' === $original_url) {
		return ['status' => 'skip', 'message' => __('Для этой фотографии не найден оригинал в логе.', 'stroybrigada-watermarks')];
	}

	sbwm_replace_case_image_urls([$image_url => $original_url]);
	return ['status' => 'ok', 'message' => __('Ватермарк сброшен, ссылка возвращена на оригинал.', 'stroybrigada-watermarks')];
}

function sbwm_reset_all(): array {
	$log = get_option(SBWM_OPTION_LOG, []);
	$log = is_array($log) ? $log : [];
	$replacements = [];

	foreach ($log as $original_url => $entry) {
		if (! is_array($entry)) {
			continue;
		}

		$watermarked_url = (string) ($entry['watermarked'] ?? '');
		if ('' === $watermarked_url) {
			continue;
		}

		$replacements[$watermarked_url] = (string) $original_url;
	}

	if ($replacements) {
		sbwm_replace_case_image_urls($replacements);
	}

	return [
		'status'  => 'ok',
		'message' => sprintf(
			/* translators: %d: reset image count. */
			_n('Сброшена %d ссылка на оригинал.', 'Сброшено %d ссылок на оригиналы.', count($replacements), 'stroybrigada-watermarks'),
			count($replacements)
		),
	];
}

function sbwm_process_all(): array {
	$settings = sbwm_get_settings();
	$log = get_option(SBWM_OPTION_LOG, []);
	$log = is_array($log) ? $log : [];
	$results = [
		'ok'      => 0,
		'skip'    => 0,
		'error'   => 0,
		'messages' => [],
	];
	$replacements = [];

	foreach (sbwm_all_case_images() as $image_url) {
		if (sbwm_is_watermarked_url($image_url)) {
			$results['skip']++;
			continue;
		}

		$logged_watermarked_url = sbwm_logged_watermarked_url($image_url, $log);
		if ('' !== $logged_watermarked_url) {
			$replacements[$image_url] = $logged_watermarked_url;
			$results['skip']++;
			continue;
		}

		$result = sbwm_watermark_image($image_url, $settings);
		$status = (string) ($result['status'] ?? 'error');
		$results[$status] = ((int) ($results[$status] ?? 0)) + 1;

		if ('ok' === $status && ! empty($result['url'])) {
			$replacements[$image_url] = (string) $result['url'];
			$log[$image_url] = [
				'watermarked' => (string) $result['url'],
				'time'        => current_time('mysql'),
			];
		} elseif ('error' === $status) {
			$results['messages'][] = $image_url . ': ' . (string) ($result['message'] ?? 'error');
		}
	}

	if ($replacements) {
		sbwm_replace_case_image_urls($replacements);
	}

	if ($replacements) {
		update_option(SBWM_OPTION_LOG, $log, false);
	}

	return $results;
}

function sbwm_render_admin_page(): void {
	if (! current_user_can('manage_options')) {
		wp_die(esc_html__('Недостаточно прав.', 'stroybrigada-watermarks'));
	}

	$notice = '';
	$results = null;
	$single_result = null;
	if ('POST' === ($_SERVER['REQUEST_METHOD'] ?? '') && isset($_POST['sbwm_nonce'])) {
		check_admin_referer('sbwm_action', 'sbwm_nonce');
		$action = sanitize_key((string) ($_POST['sbwm_action'] ?? ''));
		$image_url = isset($_POST['sbwm_image_url']) ? esc_url_raw(wp_unslash((string) $_POST['sbwm_image_url'])) : '';

		if ('save' === $action) {
			$raw = isset($_POST['sbwm_settings']) && is_array($_POST['sbwm_settings']) ? (array) wp_unslash($_POST['sbwm_settings']) : [];
			update_option(SBWM_OPTION_SETTINGS, sbwm_sanitize_settings($raw), false);
			$notice = 'saved';
		} elseif ('process' === $action) {
			$raw = isset($_POST['sbwm_settings']) && is_array($_POST['sbwm_settings']) ? (array) wp_unslash($_POST['sbwm_settings']) : [];
			update_option(SBWM_OPTION_SETTINGS, sbwm_sanitize_settings($raw), false);
			$results = sbwm_process_all();
			$notice = 'processed';
		} elseif ('clear_log' === $action) {
			delete_option(SBWM_OPTION_LOG);
			$notice = 'cleared';
		} elseif ('reset_all' === $action) {
			$single_result = sbwm_reset_all();
			$notice = 'single';
		} elseif ('process_single' === $action && '' !== $image_url) {
			$single_result = sbwm_process_single($image_url);
			$notice = 'single';
		} elseif ('reset_single' === $action && '' !== $image_url) {
			$single_result = sbwm_reset_single($image_url);
			$notice = 'single';
		}
	}

	$settings = sbwm_get_settings();
	$images = sbwm_all_case_images();
	$log = get_option(SBWM_OPTION_LOG, []);
	$log = is_array($log) ? $log : [];
	?>
	<div class="wrap sbwm-admin">
		<style>
			.sbwm-admin{max-width:1180px}
			.sbwm-panel{margin:18px 0;padding:18px 22px;border:1px solid #dcdcde;border-radius:14px;background:#fff}
			.sbwm-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
			.sbwm-field{display:grid;gap:6px}
			.sbwm-field input{width:100%;box-sizing:border-box}
			.sbwm-media{display:flex;gap:10px;align-items:center}
			.sbwm-media img{width:80px;height:80px;object-fit:contain;border:1px solid #dcdcde;border-radius:10px;background:#f8fafc}
			.sbwm-actions{display:flex;flex-wrap:wrap;gap:10px;align-items:center}
			.sbwm-stats{display:flex;flex-wrap:wrap;gap:10px;margin:12px 0}
			.sbwm-stat{padding:10px 12px;border:1px solid #dcdcde;border-radius:10px;background:#f8fafc;font-weight:700}
			.sbwm-list{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px}
			.sbwm-thumb{position:relative;aspect-ratio:1/1;border-radius:10px;overflow:hidden;background:#f1f5f9;border:1px solid #dcdcde}
			.sbwm-thumb img{display:block;width:100%;height:100%;object-fit:cover}
			.sbwm-thumb span{position:absolute;left:6px;right:6px;bottom:6px;padding:5px 7px;border-radius:8px;background:rgba(15,23,42,.78);color:#fff;font-size:11px;line-height:1.25;word-break:break-word}
			.sbwm-thumb__actions{position:absolute;left:6px;right:6px;top:6px;z-index:2;display:grid;gap:6px}
			.sbwm-thumb__actions form{margin:0}
			.sbwm-thumb__actions .button{width:100%;min-height:28px;padding:0 8px;border-radius:8px;font-size:11px;font-weight:700;line-height:1.1;white-space:normal}
			.sbwm-thumb__actions .button-primary{background:#549168;border-color:#549168}
			@media(max-width:1200px){.sbwm-list{grid-template-columns:repeat(4,minmax(0,1fr))}}
			@media(max-width:782px){.sbwm-grid,.sbwm-list{grid-template-columns:1fr}}
		</style>
		<h1><?php esc_html_e('Ватермарки кейсов', 'stroybrigada-watermarks'); ?></h1>
		<?php if ('saved' === $notice) : ?>
			<div class="notice notice-success is-dismissible"><p><?php esc_html_e('Настройки сохранены.', 'stroybrigada-watermarks'); ?></p></div>
		<?php elseif ('processed' === $notice && is_array($results)) : ?>
			<div class="notice notice-success is-dismissible"><p><?php echo esc_html(sprintf('Готово: %d, пропущено: %d, ошибок: %d.', (int) $results['ok'], (int) $results['skip'], (int) $results['error'])); ?></p></div>
		<?php elseif ('cleared' === $notice) : ?>
			<div class="notice notice-success is-dismissible"><p><?php esc_html_e('Лог очищен.', 'stroybrigada-watermarks'); ?></p></div>
		<?php elseif ('single' === $notice && is_array($single_result)) : ?>
			<?php $single_status = (string) ($single_result['status'] ?? 'error'); ?>
			<div class="notice <?php echo 'error' === $single_status ? 'notice-error' : 'notice-success'; ?> is-dismissible"><p><?php echo esc_html((string) ($single_result['message'] ?? __('Готово.', 'stroybrigada-watermarks'))); ?></p></div>
		<?php endif; ?>

		<form method="post">
			<?php wp_nonce_field('sbwm_action', 'sbwm_nonce'); ?>
			<section class="sbwm-panel">
				<h2><?php esc_html_e('Настройки паттерна', 'stroybrigada-watermarks'); ?></h2>
				<div class="sbwm-grid">
					<label class="sbwm-field">
						<span><?php esc_html_e('Лого для ватермарка', 'stroybrigada-watermarks'); ?></span>
						<div class="sbwm-media">
							<img src="<?php echo esc_url($settings['logo_url']); ?>" alt="" data-sbwm-logo-preview>
							<input type="url" name="sbwm_settings[logo_url]" value="<?php echo esc_attr((string) $settings['logo_url']); ?>" data-sbwm-logo-input>
							<button type="button" class="button" data-sbwm-logo-button><?php esc_html_e('Выбрать', 'stroybrigada-watermarks'); ?></button>
						</div>
						<small><?php esc_html_e('Лучше PNG/WebP/JPG. SVG без Imagick не обрабатывается.', 'stroybrigada-watermarks'); ?></small>
					</label>
					<label class="sbwm-field">
						<span><?php esc_html_e('Непрозрачность, %', 'stroybrigada-watermarks'); ?></span>
						<input type="number" min="1" max="70" name="sbwm_settings[opacity]" value="<?php echo esc_attr((string) $settings['opacity']); ?>">
					</label>
					<label class="sbwm-field">
						<span><?php esc_html_e('Лого в ряд', 'stroybrigada-watermarks'); ?></span>
						<input type="number" min="1" max="12" name="sbwm_settings[columns]" value="<?php echo esc_attr((string) $settings['columns']); ?>">
					</label>
					<label class="sbwm-field">
						<span><?php esc_html_e('Размер паттерна, %', 'stroybrigada-watermarks'); ?></span>
						<input type="number" min="20" max="140" name="sbwm_settings[scale]" value="<?php echo esc_attr((string) $settings['scale']); ?>">
						<small><?php esc_html_e('100% = логотип занимает ширину своей колонки. По умолчанию 70%.', 'stroybrigada-watermarks'); ?></small>
					</label>
					<label class="sbwm-field">
						<span><?php esc_html_e('Угол', 'stroybrigada-watermarks'); ?></span>
						<input type="number" min="-60" max="60" name="sbwm_settings[angle]" value="<?php echo esc_attr((string) $settings['angle']); ?>">
					</label>
				</div>
			</section>

			<section class="sbwm-panel">
				<h2><?php esc_html_e('Фото кейсов', 'stroybrigada-watermarks'); ?></h2>
				<div class="sbwm-stats">
					<div class="sbwm-stat"><?php echo esc_html(sprintf('Найдено фото: %d', count($images))); ?></div>
					<div class="sbwm-stat"><?php echo esc_html(sprintf('В логе обработано: %d', count($log))); ?></div>
				</div>
				<p><?php esc_html_e('Плагин создает копии с водяным знаком и заменяет ссылки в кейсах. Оригиналы не удаляются.', 'stroybrigada-watermarks'); ?></p>
				<p class="sbwm-actions">
					<button type="submit" class="button button-secondary" name="sbwm_action" value="save"><?php esc_html_e('Сохранить настройки', 'stroybrigada-watermarks'); ?></button>
					<button type="submit" class="button button-primary" name="sbwm_action" value="process" onclick="return confirm('<?php echo esc_js(__('Наложить ватермарки на все фото кейсов?', 'stroybrigada-watermarks')); ?>');"><?php esc_html_e('Наложить ватермарки на фото кейсов', 'stroybrigada-watermarks'); ?></button>
					<button type="submit" class="button" name="sbwm_action" value="reset_all" onclick="return confirm('<?php echo esc_js(__('Сбросить все ватермарки и вернуть ссылки кейсов на оригиналы?', 'stroybrigada-watermarks')); ?>');"><?php esc_html_e('Сбросить все ватермарки', 'stroybrigada-watermarks'); ?></button>
					<button type="submit" class="button" name="sbwm_action" value="clear_log"><?php esc_html_e('Очистить лог', 'stroybrigada-watermarks'); ?></button>
				</p>
			</section>
		</form>

		<section class="sbwm-panel">
			<h2><?php esc_html_e('Превью найденных фото', 'stroybrigada-watermarks'); ?></h2>
			<div class="sbwm-list">
				<?php foreach (array_slice($images, 0, 100) as $image_url) : ?>
					<?php $path = sbwm_url_to_path($image_url); ?>
					<div class="sbwm-thumb">
						<img src="<?php echo esc_url(sbwm_display_url($image_url)); ?>" alt="">
						<div class="sbwm-thumb__actions">
							<form method="post">
								<?php wp_nonce_field('sbwm_action', 'sbwm_nonce'); ?>
								<input type="hidden" name="sbwm_action" value="process_single">
								<input type="hidden" name="sbwm_image_url" value="<?php echo esc_attr($image_url); ?>">
								<button type="submit" class="button button-primary"><?php esc_html_e('Наложить ватермарки', 'stroybrigada-watermarks'); ?></button>
							</form>
							<form method="post">
								<?php wp_nonce_field('sbwm_action', 'sbwm_nonce'); ?>
								<input type="hidden" name="sbwm_action" value="reset_single">
								<input type="hidden" name="sbwm_image_url" value="<?php echo esc_attr($image_url); ?>">
								<button type="submit" class="button"><?php esc_html_e('Сбросить ватермарки', 'stroybrigada-watermarks'); ?></button>
							</form>
						</div>
						<span><?php echo esc_html(basename($path ?: $image_url)); ?></span>
					</div>
				<?php endforeach; ?>
			</div>
		</section>
		<script>
		document.addEventListener('click', function(event) {
			var button = event.target.closest('[data-sbwm-logo-button]');
			if (!button || !window.wp || !wp.media) {
				return;
			}

			event.preventDefault();
			var row = button.closest('.sbwm-media');
			var input = row ? row.querySelector('[data-sbwm-logo-input]') : null;
			var preview = row ? row.querySelector('[data-sbwm-logo-preview]') : null;
			var frame = wp.media({title: 'Выберите лого', button: {text: 'Использовать'}, multiple: false, library: {type: 'image'}});
			frame.on('select', function() {
				var attachment = frame.state().get('selection').first().toJSON();
				if (!attachment || !attachment.url || !input) {
					return;
				}
				input.value = attachment.url;
				if (preview) {
					preview.src = attachment.url;
				}
			});
			frame.open();
		});
		</script>
	</div>
	<?php
}
