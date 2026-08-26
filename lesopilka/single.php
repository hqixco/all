<?php
if (!defined('ABSPATH')) {
  exit;
}

get_header();
?>
<main class="site-main">
  <div class="site-container">
    <?php while (have_posts()) : the_post(); ?>
      <?php get_template_part('template-parts/content'); ?>
      <?php if (comments_open() || get_comments_number()) : ?>
        <?php comments_template(); ?>
      <?php endif; ?>
    <?php endwhile; ?>
  </div>
</main>
<?php
get_footer();
