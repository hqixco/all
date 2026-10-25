<?php
/**
 * Services section.
 *
 * @package Stroybrigada
 */

declare(strict_types=1);

$services = get_posts(
	[
		'post_type'      => 'service',
		'post_status'    => 'publish',
		'posts_per_page' => 8,
		'orderby'        => 'menu_order title',
		'order'          => 'ASC',
	]
);

if (! $services) {
	return;
}
?>
<section id="services" class="site-section site-section--services services-section">
	<div class="container">
		<div class="row">
			<?php foreach ($services as $service) : ?>
				<div class="col-lg-4 col-md-6 col-sm-12">
					<article class="service-card">
						<h3><a href="<?php echo esc_url(get_permalink($service)); ?>"><?php echo esc_html(get_the_title($service)); ?></a></h3>
						<p><?php echo esc_html(get_the_excerpt($service)); ?></p>
					</article>
				</div>
			<?php endforeach; ?>
		</div>
	</div>
</section>

