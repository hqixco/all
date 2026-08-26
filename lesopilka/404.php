<?php
if (!defined('ABSPATH')) {
  exit;
}

get_header();
?>
<main class="site-main">
  <div class="site-container">
    <section class="no-results">
      <h1><?php esc_html_e('Page not found', 'lesopilka'); ?></h1>
      <p><?php esc_html_e('The page you are looking for does not exist or has been moved.', 'lesopilka'); ?></p>
      <?php get_search_form(); ?>
    </section>
  </div>
</main>
<?php
get_footer();
