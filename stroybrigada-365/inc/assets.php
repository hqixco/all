<?php
/**
 * Assets loading.
 *
 * @package Stroybrigada
 */

declare(strict_types=1);

if (! defined('ABSPATH')) {
	exit;
}

function stroybrigada_enqueue_vendor_assets(): void {
	$base = STROYBRIGADA_ASSETS_URL . 'dist/libs/';

	wp_enqueue_style('stroybrigada-bootstrap', $base . 'bootstrap.min.css', [], STROYBRIGADA_THEME_VERSION);
	wp_enqueue_style('stroybrigada-fancybox', $base . 'fancybox.css', [], STROYBRIGADA_THEME_VERSION);
	wp_enqueue_style('stroybrigada-swiper', $base . 'swiper-bundle.min.css', [], STROYBRIGADA_THEME_VERSION);
	wp_enqueue_style('stroybrigada-animate', $base . 'animate.min.css', [], STROYBRIGADA_THEME_VERSION);
	wp_enqueue_style('stroybrigada-remodal', $base . 'remodal.css', [], STROYBRIGADA_THEME_VERSION);

	wp_enqueue_script('jquery');
	wp_add_inline_script('jquery', 'window.$ = window.jQuery;', 'after');
	wp_enqueue_script('stroybrigada-bootstrap', $base . 'bootstrap.bundle.min.js', ['jquery'], STROYBRIGADA_THEME_VERSION, true);
	wp_enqueue_script('stroybrigada-swiper', $base . 'swiper-bundle.min.js', [], STROYBRIGADA_THEME_VERSION, true);
	wp_enqueue_script('stroybrigada-fancybox', $base . 'fancybox.umd.js', [], STROYBRIGADA_THEME_VERSION, true);
	wp_enqueue_script('stroybrigada-remodal', $base . 'remodal.min.js', ['jquery'], STROYBRIGADA_THEME_VERSION, true);
	wp_enqueue_script('stroybrigada-mask', $base . 'jquery.mask.min.js', ['jquery'], STROYBRIGADA_THEME_VERSION, true);
	wp_enqueue_script('stroybrigada-validate', $base . 'jquery.validate.js', ['jquery'], STROYBRIGADA_THEME_VERSION, true);
	wp_enqueue_script('stroybrigada-form', $base . 'jquery.form.js', ['jquery'], STROYBRIGADA_THEME_VERSION, true);
	wp_enqueue_script('stroybrigada-lazy', $base . 'lazy.js', ['jquery'], STROYBRIGADA_THEME_VERSION, true);
	wp_enqueue_script('stroybrigada-mobile', $base . 'is.mobile.js', [], STROYBRIGADA_THEME_VERSION, true);
	wp_enqueue_script('stroybrigada-bxslider', $base . 'jquery.bxslider.min.js', ['jquery'], STROYBRIGADA_THEME_VERSION, true);
}

function stroybrigada_enqueue_theme_assets(): void {
	$is_vite_dev = defined('STROYBRIGADA_VITE_DEV') && STROYBRIGADA_VITE_DEV;

	stroybrigada_enqueue_vendor_assets();

	if ($is_vite_dev) {
		$dev_server = defined('STROYBRIGADA_VITE_DEV_SERVER') ? STROYBRIGADA_VITE_DEV_SERVER : 'http://localhost:5173';
		wp_enqueue_script('stroybrigada-vite-client', $dev_server . '/@vite/client', [], null, true);
		wp_enqueue_script('stroybrigada-app', $dev_server . '/release/stroybrigada/assets/src/main.js', [], null, true);
		return;
	}

	$main_css_fallback = [
		STROYBRIGADA_ASSETS_URL . 'dist/css/reset.css',
		STROYBRIGADA_ASSETS_URL . 'dist/css/header-2.css',
		STROYBRIGADA_ASSETS_URL . 'dist/css/footer-2.css',
		STROYBRIGADA_ASSETS_URL . 'dist/css/general.css',
		STROYBRIGADA_ASSETS_URL . 'dist/css/main.css',
	];

	foreach (stroybrigada_get_asset_dependencies('assets/src/main.js', 'css') as $index => $style_url) {
		wp_enqueue_style('stroybrigada-app-' . $index, $style_url, [], STROYBRIGADA_THEME_VERSION);
	}

	if (empty(stroybrigada_get_asset_dependencies('assets/src/main.js', 'css'))) {
		foreach ($main_css_fallback as $index => $style_url) {
			wp_enqueue_style('stroybrigada-fallback-' . $index, $style_url, [], STROYBRIGADA_THEME_VERSION);
		}
	}

	$app_js = stroybrigada_get_asset_url('assets/src/main.js', 'dist/js/app.js');
	if ('' !== $app_js) {
		wp_enqueue_script(
			'stroybrigada-app',
			$app_js,
			['jquery', 'stroybrigada-bootstrap', 'stroybrigada-swiper', 'stroybrigada-fancybox', 'stroybrigada-remodal', 'stroybrigada-mask', 'stroybrigada-validate', 'stroybrigada-form', 'stroybrigada-lazy', 'stroybrigada-mobile', 'stroybrigada-bxslider'],
			STROYBRIGADA_THEME_VERSION,
			true
		);
	}

	wp_enqueue_script('stroybrigada-gallery', STROYBRIGADA_ASSETS_URL . 'dist/js/site-gallery.js', ['stroybrigada-app'], STROYBRIGADA_THEME_VERSION, true);
	wp_enqueue_script('stroybrigada-video', STROYBRIGADA_ASSETS_URL . 'dist/js/site-video.js', ['stroybrigada-app'], STROYBRIGADA_THEME_VERSION, true);
	wp_enqueue_script('stroybrigada-quiz-reconstruction', STROYBRIGADA_ASSETS_URL . 'dist/js/quiz-house-reconstruction.js', ['stroybrigada-app'], STROYBRIGADA_THEME_VERSION, true);

	$page_metric_goal = stroybrigada_metric_goal_for_post(get_queried_object_id());

	$config = [
		'restUrl'   => esc_url_raw(rest_url('stroybrigada/v1')),
		'nonce'     => wp_create_nonce('wp_rest'),
		'pageId'    => get_queried_object_id(),
		'pageUrl'   => is_singular() ? get_permalink() : home_url(add_query_arg([])),
		'pageTitle' => wp_get_document_title(),
		'themeAssetsBase' => esc_url_raw(STROYBRIGADA_ASSETS_URL . 'dist/'),
		'metrics'   => [
			'enabled'   => (bool) stroybrigada_get_option_field('metrics_enabled', true),
			'counterId' => (int) stroybrigada_get_option_field('yandex_metrika_id', 108767903),
			'leadGoal'  => $page_metric_goal,
		],
		'forms'     => [
			'errorText'   => (string) stroybrigada_get_option_field('forms_error_text', __('Не удалось отправить заявку.', 'stroybrigada')),
			'successText' => (string) stroybrigada_get_option_field('forms_success_text', __('Заявка успешно отправлена.', 'stroybrigada')),
		],
		'uploads'   => [
			'maxFiles'     => 10,
			'maxFileSize'  => 15 * 1024 * 1024,
			'allowedTypes' => ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf'],
		],
	];

	wp_add_inline_script('stroybrigada-app', 'window.StroybrigadaSettings = ' . wp_json_encode($config, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . ';', 'before');
}
add_action('wp_enqueue_scripts', 'stroybrigada_enqueue_theme_assets');

function stroybrigada_render_favicon_fallback(): void {
	if (has_site_icon()) {
		return;
	}

	$favicon_url = STROYBRIGADA_ASSETS_URL . 'dist/favicon.svg';
	printf('<link rel="icon" href="%s" type="image/svg+xml">' . "\n", esc_url($favicon_url));
	printf('<link rel="shortcut icon" href="%s" type="image/svg+xml">' . "\n", esc_url($favicon_url));
}
add_action('wp_head', 'stroybrigada_render_favicon_fallback', 1);

function stroybrigada_admin_asset_notice(): void {
	if (! current_user_can('manage_options') || wp_doing_ajax()) {
		return;
	}

	if (defined('STROYBRIGADA_VITE_DEV') && STROYBRIGADA_VITE_DEV) {
		return;
	}

	$manifest_exists = is_readable(stroybrigada_manifest_path());
	$fallback_exists = is_readable(STROYBRIGADA_ASSETS_PATH . 'dist/css/main.css') && is_readable(STROYBRIGADA_ASSETS_PATH . 'dist/js/app.js');

	if ($manifest_exists || $fallback_exists) {
		return;
	}

	add_action(
		'admin_notices',
		static function (): void {
			printf(
				'<div class="notice notice-warning"><p>%s</p></div>',
				esc_html__('Для темы Stroybrigada не найдены production-ассеты. Запустите сборку или скопируйте готовые файлы в assets/dist/.', 'stroybrigada')
			);
		}
	);
}
add_action('current_screen', 'stroybrigada_admin_asset_notice');
