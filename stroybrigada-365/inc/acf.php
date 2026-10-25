<?php
/**
 * ACF integration.
 *
 * @package Stroybrigada
 */

declare(strict_types=1);

if (! defined('ABSPATH')) {
	exit;
}

function stroybrigada_register_acf_json_path(array $paths): array {
	$paths[] = STROYBRIGADA_THEME_PATH . 'acf-json';
	return array_unique($paths);
}
add_filter('acf/settings/load_json', 'stroybrigada_register_acf_json_path');

function stroybrigada_register_acf_save_json_path(string $path): string {
	return STROYBRIGADA_THEME_PATH . 'acf-json';
}
add_filter('acf/settings/save_json', 'stroybrigada_register_acf_save_json_path');

add_filter('acf/settings/rest_api_enabled', '__return_false');

function stroybrigada_register_options_page(): void {
	if (! function_exists('acf_add_options_page')) {
		return;
	}

	acf_add_options_page(
		[
			'page_title' => __('Настройки сайта', 'stroybrigada'),
			'menu_title' => __('Настройки сайта', 'stroybrigada'),
			'menu_slug'  => 'stroybrigada-settings',
			'capability' => 'manage_options',
			'redirect'   => false,
			'position'   => 59,
		]
	);
}
add_action('acf/init', 'stroybrigada_register_options_page');

function stroybrigada_acf_missing_notice(): void {
	if (function_exists('get_field') || ! current_user_can('activate_plugins')) {
		return;
	}

	printf(
		'<div class="notice notice-warning"><p>%s</p></div>',
		wp_kses_post(__('Тема Stroybrigada требует <strong>ACF Pro</strong>. Установите и активируйте плагин, после чего импортируйте стартовые данные.', 'stroybrigada'))
	);
}
add_action('admin_notices', 'stroybrigada_acf_missing_notice');
