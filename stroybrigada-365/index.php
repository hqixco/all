<?php
/**
 * Fallback index.
 *
 * @package Stroybrigada
 */

declare(strict_types=1);

get_header();
?>
<section class="site-section site-section--content">
	<div class="container">
		<?php if (have_posts()) : ?>
			<?php while (have_posts()) : the_post(); ?>
				<article <?php post_class(); ?>>
					<h1><?php the_title(); ?></h1>
					<?php the_content(); ?>
				</article>
			<?php endwhile; ?>
		<?php endif; ?>
	</div>
</section>
<?php
get_footer();

