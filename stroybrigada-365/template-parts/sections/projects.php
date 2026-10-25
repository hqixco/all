<?php
/**
 * Projects section.
 *
 * @package Stroybrigada
 */

declare(strict_types=1);

$projects = get_posts(
	[
		'post_type'      => 'project',
		'post_status'    => 'publish',
		'posts_per_page' => 6,
	]
);

if (! $projects) {
	return;
}
?>
<section id="works" class="site-section site-section--content">
	<div class="container">
		<h2><?php esc_html_e('Наши работы', 'stroybrigada'); ?></h2>
		<div class="row">
			<?php foreach ($projects as $project) : ?>
				<div class="col-lg-4 col-md-6 col-sm-12">
					<article class="project-card">
						<h3><a href="<?php echo esc_url(get_permalink($project)); ?>"><?php echo esc_html(get_the_title($project)); ?></a></h3>
					</article>
				</div>
			<?php endforeach; ?>
		</div>
	</div>
</section>

