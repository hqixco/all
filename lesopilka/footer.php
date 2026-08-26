<?php
if (!defined('ABSPATH')) {
  exit;
}
?>
<footer class="site-footer" id="site-footer">
  <div class="site-container">
    <p class="site-footer__lead">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt. aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
    </p>

    <div class="site-footer__grid">
      <div class="site-footer__brand">
        <div class="site-footer__wordmark">lesopilka</div>
      </div>

      <div class="site-footer__col">
        <h2>Меню</h2>
        <a href="<?php echo esc_url(home_url('/')); ?>">Главная</a>
        <a href="<?php echo esc_url(home_url('/#philosophy')); ?>">О нас</a>
        <a href="<?php echo esc_url(home_url('/#products')); ?>">Наш подкаст</a>
      </div>

      <div class="site-footer__col">
        <h2>Меню</h2>
        <a href="<?php echo esc_url(home_url('/#products')); ?>">Продукты</a>
        <a href="<?php echo esc_url(home_url('/#cases')); ?>">Кейсы</a>
        <a href="<?php echo esc_url(home_url('/#publications')); ?>">Публикации</a>
      </div>

      <div class="site-footer__col">
        <h2>Меню</h2>
        <a href="<?php echo esc_url(home_url('/#contact-project')); ?>">Контакты</a>
        <a href="<?php echo esc_url(home_url('/#contact-project')); ?>">Бриф</a>
        <a href="<?php echo esc_url(home_url('/#team')); ?>">Команда</a>
      </div>

      <div class="site-footer__col">
        <h2>Меню</h2>
        <a href="<?php echo esc_url(home_url('/#testimonials')); ?>">Отзывы</a>
        <a href="<?php echo esc_url(home_url('/#history')); ?>">История</a>
        <a href="<?php echo esc_url(home_url('/#hero')); ?>">Вверх</a>
      </div>

      <div class="site-footer__contacts">
        <h2>Контакты</h2>
        <p>8888888888888888</p>
        <p>Hey@.com</p>
        <p>Москва</p>
      </div>
    </div>

    <div class="site-footer__bottom">
      <span>© Lesopilka</span>
    </div>
  </div>
</footer>
</div>
<?php wp_footer(); ?>
</body>
</html>
