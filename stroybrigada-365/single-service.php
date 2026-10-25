<?php
/**
 * Service single template.
 *
 * @package Stroybrigada
 */

declare(strict_types=1);

get_header();

while (have_posts()) :
	the_post();
	if (stroybrigada_get_page_sections(get_the_ID())) {
		stroybrigada_render_imported_sections(get_the_ID());
	} else {
		stroybrigada_render_section('hero', ['context' => 'service', 'post_id' => get_the_ID()]);
		stroybrigada_render_section('seo-content', ['context' => 'service', 'post_id' => get_the_ID()]);
		stroybrigada_render_section('final-form', ['context' => 'service', 'post_id' => get_the_ID()]);
	}
endwhile;

get_footer();
