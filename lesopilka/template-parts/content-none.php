<?php
if (!defined('ABSPATH')) {
  exit;
}
?>
<section class="no-results">
  <h1><?php esc_html_e('Nothing found', 'lesopilka'); ?></h1>
  <p><?php esc_html_e('The requested content is not available yet.', 'lesopilka'); ?></p>
  <?php get_search_form(); ?>
</section>
