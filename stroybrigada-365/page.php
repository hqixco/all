<?php
/**
 * Page template.
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
		?>
		<section class="site-section site-section--content">
			<div class="container">
				<article <?php post_class(); ?>>
					<h1><?php the_title(); ?></h1>
					<?php the_content(); ?>
				</article>
			</div>
		</section>
		<?php
	}
endwhile;

get_footer();
