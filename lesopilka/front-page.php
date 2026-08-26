<?php
if (!defined('ABSPATH')) {
  exit;
}

$theme_uri = get_template_directory_uri();

$partners = array('media', 'podcast', 'design', 'analytics', 'events', 'studio', 'media', 'podcast', 'design', 'analytics', 'events', 'studio');

$products = array(
  array(
    'title' => 'PR и коммуникации',
    'desc' => 'Lorem ipsum dolor sit amet',
    'image' => $theme_uri . '/assets/img/product-pr.jpg',
  ),
  array(
    'title' => 'Подкасты',
    'desc' => 'Lorem ipsum dolor sit amet',
    'image' => $theme_uri . '/assets/img/product-podcast.jpg',
  ),
  array(
    'title' => 'Аналитика',
    'desc' => 'Lorem ipsum dolor sit amet',
    'image' => $theme_uri . '/assets/img/product-analytics.jpg',
  ),
  array(
    'title' => 'Мероприятия',
    'desc' => 'Lorem ipsum dolor sit amet',
    'image' => $theme_uri . '/assets/img/product-events.jpg',
  ),
  array(
    'title' => 'Дизайн и креатив',
    'desc' => 'Lorem ipsum dolor sit amet',
    'image' => $theme_uri . '/assets/img/product-design.jpg',
  ),
  array(
    'title' => 'Индивидуальное решение',
    'desc' => 'Lorem ipsum dolor sit amet',
    'image' => $theme_uri . '/assets/img/product-custom.jpg',
  ),
);

$team = array(
  array(
    'name' => 'Наталья Абустина',
    'desc' => 'Lorem ipsum dolor sit amet',
    'image' => $theme_uri . '/assets/img/team-natalia.jpg',
  ),
  array(
    'name' => 'Имя Фамилия',
    'desc' => 'Lorem ipsum dolor sit amet',
    'image' => $theme_uri . '/assets/img/team-2.jpg',
  ),
  array(
    'name' => 'Имя Фамилия',
    'desc' => 'Lorem ipsum dolor sit amet',
    'image' => $theme_uri . '/assets/img/team-3.jpg',
  ),
  array(
    'name' => 'Имя Фамилия',
    'desc' => 'Lorem ipsum dolor sit amet',
    'image' => $theme_uri . '/assets/img/team-4.jpg',
  ),
);

$publications = array(
  array(
    'title' => 'Заголовок',
    'subtitle' => 'Подзаголовок',
    'image' => $theme_uri . '/assets/img/publication-1.jpg',
  ),
  array(
    'title' => 'Заголовок',
    'subtitle' => 'Подзаголовок',
    'image' => $theme_uri . '/assets/img/publication-2.jpg',
  ),
  array(
    'title' => 'Заголовок',
    'subtitle' => 'Подзаголовок',
    'image' => $theme_uri . '/assets/img/publication-3.jpg',
  ),
);

$ticker_items = array(
  'публикация / кейс / lesopilka',
  'публикация / кейс / lesopilka',
  'публикация / кейс / lesopilka',
  'публикация / кейс / lesopilka',
  'публикация / кейс / lesopilka',
  'публикация / кейс / lesopilka',
);

get_header();
?>
<main class="site-main landing-page">
  <section class="hero-section" id="hero">
    <div class="site-container">
      <p class="hero-section__logo">lesopilka</p>

      <div class="hero-section__visual media-frame" style="--media-image: url('<?php echo esc_url($theme_uri . '/assets/img/hero-main.jpg'); ?>');" aria-hidden="true"></div>

      <p class="hero-section__caption">текст текст текст</p>
    </div>
  </section>

  <section class="partners-strip" aria-label="Partners strip">
    <div class="partners-strip__track">
      <?php foreach ($partners as $partner) : ?>
        <span class="partners-strip__item"><?php echo esc_html($partner); ?></span>
      <?php endforeach; ?>
    </div>
  </section>

  <section class="philosophy-section" id="philosophy">
    <div class="site-container site-container--narrow">
      <p class="section-kicker">философия</p>
      <p class="section-display section-display--center">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
      </p>
    </div>
  </section>

  <section class="products-section" id="products">
    <div class="site-container">
      <h2 class="section-title">Продукты и решения</h2>
      <div class="products-grid">
        <?php foreach ($products as $product) : ?>
          <article class="product-card">
            <div class="product-card__content">
              <h3 class="product-card__title"><?php echo esc_html($product['title']); ?></h3>
              <p class="product-card__desc"><?php echo esc_html($product['desc']); ?></p>
              <a class="product-card__link" href="#contact-project">подробнее</a>
            </div>
            <div class="product-card__media media-frame" style="--media-image: url('<?php echo esc_url($product['image']); ?>');" aria-hidden="true"></div>
          </article>
        <?php endforeach; ?>
      </div>
    </div>
  </section>

  <section class="history-section" id="history">
    <div class="site-container site-container--narrow">
      <p class="section-kicker">история</p>
      <p class="section-display section-display--center">
        КОРОТКАЯ ИСТОРИЯ Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
      </p>
    </div>
  </section>

  <section class="team-section" id="team">
    <div class="site-container">
      <h2 class="section-title">Команда</h2>
      <div class="team-grid">
        <?php foreach ($team as $member) : ?>
          <article class="team-card">
            <div class="team-card__photo media-frame" style="--media-image: url('<?php echo esc_url($member['image']); ?>');" aria-hidden="true"></div>
            <h3 class="team-card__name"><?php echo esc_html($member['name']); ?></h3>
            <p class="team-card__desc"><?php echo esc_html($member['desc']); ?></p>
          </article>
        <?php endforeach; ?>
      </div>
    </div>
  </section>

  <section class="publications-section" id="publications">
    <div class="site-container">
      <h2 class="section-title">Публикации</h2>
      <div class="publications-grid">
        <?php foreach ($publications as $publication) : ?>
          <article class="publication-card">
            <div class="publication-card__content">
              <div>
                <h3 class="publication-card__title"><?php echo esc_html($publication['title']); ?></h3>
                <p class="publication-card__subtitle"><?php echo esc_html($publication['subtitle']); ?></p>
              </div>
              <a class="publication-card__link" href="#contact-project">подробнее</a>
            </div>
            <div class="publication-card__media media-frame" style="--media-image: url('<?php echo esc_url($publication['image']); ?>');" aria-hidden="true"></div>
          </article>
        <?php endforeach; ?>
      </div>

      <a class="section-more-link" href="#contact-project">перейти</a>
    </div>
  </section>

  <section class="ticker-section" id="cases" aria-label="Ticker strip">
    <div class="ticker-section__track">
      <?php foreach ($ticker_items as $item) : ?>
        <div class="ticker-pill">
          <span class="ticker-pill__accent"></span>
          <span><?php echo esc_html($item); ?></span>
        </div>
      <?php endforeach; ?>
      <?php foreach ($ticker_items as $item) : ?>
        <div class="ticker-pill" aria-hidden="true">
          <span class="ticker-pill__accent"></span>
          <span><?php echo esc_html($item); ?></span>
        </div>
      <?php endforeach; ?>
    </div>
  </section>

  <section class="testimonials-section" id="testimonials">
    <div class="site-container testimonials-section__grid">
      <div class="testimonials-section__content">
        <h2 class="section-title">Клиенты о нас</h2>
        <p class="testimonial-quote">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt. aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
        </p>
        <p class="testimonial-author">Иван Иванов</p>
        <p class="testimonial-org">Название организации</p>

        <div class="testimonial-meta">
          <span class="testimonial-counter">01/05</span>
          <div class="testimonial-controls" aria-hidden="true">
            <span></span>
            <span class="is-active"></span>
            <span></span>
          </div>
        </div>
      </div>

      <div class="testimonials-section__visual media-frame" style="--media-image: url('<?php echo esc_url($theme_uri . '/assets/img/testimonial-object.jpg'); ?>');" aria-hidden="true"></div>
    </div>
  </section>

  <section class="contact-project-section" id="contact-project">
    <div class="site-container contact-project-section__grid">
      <div class="contact-project-section__intro">
        <h2 class="section-title section-title--split">
          <span>Начать</span>
          <span>совместный</span>
          <span>проект</span>
        </h2>

        <div class="contact-project-section__character media-frame" style="--media-image: url('<?php echo esc_url($theme_uri . '/assets/img/contact-character.jpg'); ?>');" aria-hidden="true"></div>
      </div>

      <div class="contact-project-section__form-wrap">
        <a class="contact-project-section__brief-link" href="#contact-project">скачать бриф или заполнить форму</a>

        <form class="project-form" action="#" method="post" data-success-message="Спасибо! Мы свяжемся с вами">
          <label class="screen-reader-text" for="project-name">Имя</label>
          <input id="project-name" name="name" type="text" placeholder="Имя" required>

          <label class="screen-reader-text" for="project-phone">Телефон</label>
          <input id="project-phone" name="phone" type="tel" placeholder="Телефон" required>

          <label class="screen-reader-text" for="project-email">Email</label>
          <input id="project-email" name="email" type="email" placeholder="Email" required>

          <label class="screen-reader-text" for="project-message">Расскажите, какой у вас запрос</label>
          <textarea id="project-message" name="message" placeholder="Расскажите, какой у вас запрос" required></textarea>

          <button class="project-form__submit" type="submit">Отправить</button>

          <p class="project-form__consent">
            Нажимая на кнопку, я соглашаюсь передать персональные данные для обработки ИП Абустина Н.С
          </p>

          <p class="project-form__status" role="status" aria-live="polite"></p>
        </form>
      </div>
    </div>
  </section>
</main>
<?php
get_footer();
