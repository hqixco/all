<?php
/**
 * Theme setup.
 *
 * @package Stroybrigada
 */

declare(strict_types=1);

if (! defined('ABSPATH')) {
	exit;
}

// The site does not use desktop publishing clients, so the RSD discovery
// endpoint should not be advertised to crawlers in the document head.
remove_action('wp_head', 'rsd_link');

function stroybrigada_theme_setup(): void {
	load_theme_textdomain('stroybrigada', STROYBRIGADA_THEME_PATH . 'languages');

	add_theme_support('title-tag');
	add_theme_support('post-thumbnails');
	add_theme_support('menus');
	add_theme_support('html5', ['search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script']);
	add_theme_support('editor-styles');
	add_theme_support('align-wide');
	add_theme_support('custom-spacing');
	add_theme_support('responsive-embeds');

	register_nav_menus(
		[
			'primary'       => __('Основное меню', 'stroybrigada'),
			'mobile'        => __('Мобильное меню', 'stroybrigada'),
			'footer'        => __('Меню в подвале', 'stroybrigada'),
			'services_menu' => __('Дополнительное меню услуг', 'stroybrigada'),
		]
	);

	add_image_size('stroybrigada-service-thumb', 640, 420, true);
	add_image_size('stroybrigada-project-thumb', 760, 520, true);
	add_image_size('stroybrigada-square', 480, 480, true);
}
add_action('after_setup_theme', 'stroybrigada_theme_setup');

function stroybrigada_register_side_effects(): void {
	update_option('thumbnail_size_w', 480);
	update_option('thumbnail_size_h', 320);
	update_option('thumbnail_crop', 1);
}
add_action('after_switch_theme', 'stroybrigada_register_side_effects');

