<?php
if (!defined('ABSPATH')) {
  exit;
}

get_header();
?>
<main class="site-main">
  <div class="site-container">
    <?php if (have_posts()) : ?>
      <header class="page-header">
        <h1 class="page-title">
          <?php
          printf(
            esc_html__('Search results for: %s', 'lesopilka'),
            '<span>' . esc_html(get_search_query()) . '</span>'
          );
          ?>
        </h1>
      </header>

      <?php while (have_posts()) : the_post(); ?>
        <?php get_template_part('template-parts/content'); ?>
      <?php endwhile; ?>

      <?php the_posts_navigation(); ?>
    <?php else : ?>
      <?php get_template_part('template-parts/content', 'none'); ?>
    <?php endif; ?>
  </div>
</main>
<?php
get_footer();
