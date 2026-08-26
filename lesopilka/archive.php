<?php
if (!defined('ABSPATH')) {
  exit;
}

get_header();
?>
<main class="site-main">
  <div class="site-container">
    <header class="page-header">
      <?php the_archive_title('<h1 class="page-title">', '</h1>'); ?>
      <?php the_archive_description('<div class="archive-description">', '</div>'); ?>
    </header>

    <?php if (have_posts()) : ?>
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
