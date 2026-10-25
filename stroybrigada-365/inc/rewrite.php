<?php
/**
 * Service rewrites without /service/ prefix.
 *
 * @package Stroybrigada
 */

declare(strict_types=1);

if (! defined('ABSPATH')) {
	exit;
}

function stroybrigada_get_service_slugs(): array {
	$posts = get_posts(
		[
			'post_type'      => 'service',
			'post_status'    => 'publish',
			'fields'         => 'ids',
			'posts_per_page' => -1,
			'no_found_rows'  => true,
		]
	);

	$slugs = [];
	foreach ($posts as $post_id) {
		$post = get_post($post_id);
		if ($post instanceof WP_Post && '' !== $post->post_name) {
			$slugs[] = $post->post_name;
		}
	}

	return array_values(array_unique($slugs));
}

function stroybrigada_register_service_rewrites(): void {
	foreach (stroybrigada_get_service_slugs() as $slug) {
		add_rewrite_rule('^' . preg_quote($slug, '#') . '/?$', 'index.php?service=' . $slug, 'top');
	}
}
add_action('init', 'stroybrigada_register_service_rewrites', 20);

function stroybrigada_service_permalink(string $permalink, WP_Post $post): string {
	if ('service' !== $post->post_type || 'publish' !== $post->post_status) {
		return $permalink;
	}

	return home_url('/' . $post->post_name . '/');
}
add_filter('post_type_link', 'stroybrigada_service_permalink', 10, 2);

function stroybrigada_validate_service_slug(array $data, array $postarr): array {
	if (($data['post_type'] ?? '') !== 'service') {
		return $data;
	}

	$slug = sanitize_title($data['post_name'] ?: $data['post_title']);
	if ('' === $slug) {
		return $data;
	}

	$conflicting = get_page_by_path($slug, OBJECT, ['page', 'post', 'project']);
	if ($conflicting instanceof WP_Post && (int) $conflicting->ID !== (int) ($postarr['ID'] ?? 0)) {
		$data['post_name'] = $slug . '-service';
	}

	return $data;
}
add_filter('wp_insert_post_data', 'stroybrigada_validate_service_slug', 10, 2);

function stroybrigada_redirect_legacy_privacy_url(): void {
	$request_path = (string) wp_parse_url((string) ($_SERVER['REQUEST_URI'] ?? ''), PHP_URL_PATH);
	if ('/policy' !== untrailingslashit($request_path)) {
		return;
	}

	wp_safe_redirect(home_url('/politika-konfidentsialnosti/'), 301, 'Stroybrigada');
	exit;
}
add_action('template_redirect', 'stroybrigada_redirect_legacy_privacy_url', 1);

function stroybrigada_flush_service_rewrites_on_change(int $post_id, WP_Post $post, bool $update): void {
	if ('service' !== $post->post_type || wp_is_post_revision($post_id)) {
		return;
	}

	flush_rewrite_rules(false);
}
add_action('save_post_service', 'stroybrigada_flush_service_rewrites_on_change', 10, 3);

function stroybrigada_flush_rewrites_on_theme_switch(): void {
	stroybrigada_register_content_types();
	stroybrigada_register_service_rewrites();
	flush_rewrite_rules(false);
}
add_action('after_switch_theme', 'stroybrigada_flush_rewrites_on_theme_switch');
