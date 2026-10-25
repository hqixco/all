<?php
/**
 * Front page template.
 *
 * @package Stroybrigada
 */

declare(strict_types=1);

get_header();

if (have_posts()) {
	while (have_posts()) {
		the_post();
		stroybrigada_render_imported_sections(get_the_ID());
	}
} else {
	stroybrigada_render_section('hero', ['context' => 'front_page']);
}

get_footer();
