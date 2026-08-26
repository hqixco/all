<?php
if (!defined('ABSPATH')) {
    exit;
}
?>
</main>
<?php $privacy_policy_url = function_exists('gk_orlink_get_privacy_policy_url') ? gk_orlink_get_privacy_policy_url() : ''; ?>
<footer class="site-footer-bottom">
    <div class="site-footer-bottom__inner">
        <a class="site-footer-bottom__brand" href="<?php echo esc_url(home_url('/')); ?>" aria-label="<?php echo esc_attr(get_bloginfo('name')); ?>">
            <img class="site-footer-bottom__logo" src="<?php echo esc_url(get_template_directory_uri() . '/assets/img/logo.svg'); ?>" alt="<?php echo esc_attr(get_bloginfo('name')); ?>" width="42" height="42">
            <span class="site-footer-bottom__brand-text">Строительство из<br>металлоконструкций<br>в Москве и МО</span>
        </a>
        <a class="site-footer-bottom__privacy" href="<?php echo esc_url($privacy_policy_url ?: '#'); ?>">
            <?php esc_html_e('Политика конфиденциальности', 'gk-orlink'); ?>
        </a>
        <div class="site-footer-bottom__actions">
            <a class="site-header__messenger-link site-header__messenger-link--telegram" href="#contacts">
                <img class="header-button__icon header-button__icon--image" src="<?php echo esc_url(get_template_directory_uri() . '/assets/img/telegram-logo-svgrepo-com.svg'); ?>" alt="" aria-hidden="true" width="20" height="20">
                <span><?php esc_html_e('Написать в Telegram', 'gk-orlink'); ?></span>
            </a>
            <a class="site-header__messenger-link site-header__messenger-link--max" href="#contacts">
                <img class="header-button__icon header-button__icon--image" src="<?php echo esc_url(get_template_directory_uri() . '/assets/img/max-icon.svg'); ?>" alt="" aria-hidden="true" width="20" height="20">
                <span><?php esc_html_e('Написать в MAX', 'gk-orlink'); ?></span>
            </a>
        </div>
    </div>
</footer>
<div class="callback-modal" data-callback-modal hidden>
    <div class="callback-modal__backdrop" data-callback-close></div>
    <div class="callback-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="callback-modal-title">
        <div class="callback-modal__close" role="button" tabindex="0" aria-label="<?php echo esc_attr__('Закрыть окно', 'gk-orlink'); ?>" data-callback-close>
            &times;
        </div>
        <div class="callback-modal__visual" data-callback-visual hidden>
            <img class="callback-modal__image" data-callback-image src="" alt="" loading="lazy" decoding="async">
        </div>
        <div class="callback-modal__content">
            <h2 class="callback-modal__title" id="callback-modal-title" data-callback-title><?php esc_html_e('Заказать обратный звонок', 'gk-orlink'); ?></h2>
            <p class="callback-modal__subtitle"><?php esc_html_e('Оставьте контакты, и мы перезвоним в удобном для вас канале связи.', 'gk-orlink'); ?></p>

            <form class="callback-modal__form" data-callback-form novalidate>
                <div class="callback-modal__grid">
                    <label class="callback-modal__field">
                        <span class="callback-modal__label"><?php esc_html_e('Как обращаться?', 'gk-orlink'); ?></span>
                        <input class="callback-modal__input" type="text" name="callback_name" placeholder="<?php echo esc_attr__('Как обращаться?', 'gk-orlink'); ?>" data-callback-name autocomplete="name">
                    </label>

                    <label class="callback-modal__field">
                        <span class="callback-modal__label"><?php esc_html_e('Телефон', 'gk-orlink'); ?></span>
                        <input class="callback-modal__input" type="tel" name="callback_phone" placeholder="+7 (___) ___-__-__" data-callback-phone autocomplete="tel" required>
                    </label>
                </div>

                <fieldset class="callback-modal__field callback-modal__field--full callback-modal__field--channels">
                    <legend class="callback-modal__label"><?php esc_html_e('Тип связи', 'gk-orlink'); ?></legend>
                    <div class="callback-modal__channels" data-callback-channel-group>
                        <label class="callback-modal__channel">
                            <input class="callback-modal__channel-input" type="radio" name="callback_channel" value="max" data-callback-channel required>
                            <span class="callback-modal__channel-card">
                                <img class="callback-modal__channel-icon" src="<?php echo esc_url(get_template_directory_uri() . '/assets/img/max-icon.svg'); ?>" alt="" aria-hidden="true" width="24" height="24">
                                <span class="callback-modal__channel-text"><?php esc_html_e('В MAX', 'gk-orlink'); ?></span>
                            </span>
                        </label>
                        <label class="callback-modal__channel">
                            <input class="callback-modal__channel-input" type="radio" name="callback_channel" value="telegram" data-callback-channel required>
                            <span class="callback-modal__channel-card">
                                <img class="callback-modal__channel-icon" src="<?php echo esc_url(get_template_directory_uri() . '/assets/img/telegram-logo-svgrepo-com.svg'); ?>" alt="" aria-hidden="true" width="24" height="24">
                                <span class="callback-modal__channel-text"><?php esc_html_e('Telegram', 'gk-orlink'); ?></span>
                            </span>
                        </label>
                        <label class="callback-modal__channel">
                            <input class="callback-modal__channel-input" type="radio" name="callback_channel" value="phone" data-callback-channel required>
                            <span class="callback-modal__channel-card">
                                <img class="callback-modal__channel-icon" src="<?php echo esc_url(get_template_directory_uri() . '/assets/img/phone-icon.svg'); ?>" alt="" aria-hidden="true" width="24" height="24">
                                <span class="callback-modal__channel-text"><?php esc_html_e('По телефону', 'gk-orlink'); ?></span>
                            </span>
                        </label>
                    </div>
                </fieldset>

                <button class="callback-modal__submit" type="submit"><?php esc_html_e('Отправить заявку', 'gk-orlink'); ?></button>
                <p class="form-privacy-note form-privacy-note--light">
                    <span class="form-privacy-note__icon" aria-hidden="true"><?php echo gk_orlink_svg_icon('check-circle'); ?></span>
                    <span><?php esc_html_e('Нажимая кнопку, вы соглашаетесь с', 'gk-orlink'); ?> <a href="<?php echo esc_url($privacy_policy_url ?: '#'); ?>"><?php esc_html_e('политикой конфиденциальности', 'gk-orlink'); ?></a></span>
                </p>
            </form>

            <div class="callback-modal__success" data-callback-success hidden>
                <span class="callback-modal__success-icon" aria-hidden="true">
                    <img src="<?php echo esc_url(get_template_directory_uri() . '/assets/img/quiz-success-check.svg'); ?>" alt="" width="70" height="70">
                </span>
                <h2 class="callback-modal__success-title"><?php esc_html_e('Заявка успешно отправлена', 'gk-orlink'); ?></h2>
                <p class="callback-modal__success-text"><?php esc_html_e('Спасибо, в ближайшее время менеджер свяжется с Вами', 'gk-orlink'); ?></p>
                <button class="callback-modal__submit" type="button" data-callback-close><?php esc_html_e('Закрыть', 'gk-orlink'); ?></button>
            </div>
</div>
</div>
</div>
<div class="case-lightbox" data-case-lightbox hidden>
    <button class="case-lightbox__backdrop" type="button" data-case-lightbox-close aria-label="<?php echo esc_attr__('Закрыть просмотр', 'gk-orlink'); ?>"></button>
    <button class="case-lightbox__close" type="button" data-case-lightbox-close aria-label="<?php echo esc_attr__('Закрыть просмотр', 'gk-orlink'); ?>">&times;</button>
    <button class="case-lightbox__nav case-lightbox__nav--prev" type="button" data-case-lightbox-prev aria-label="<?php echo esc_attr__('Предыдущее медиа', 'gk-orlink'); ?>">
        <span aria-hidden="true"><?php echo gk_orlink_svg_icon('chevron-left'); ?></span>
    </button>
    <button class="case-lightbox__nav case-lightbox__nav--next" type="button" data-case-lightbox-next aria-label="<?php echo esc_attr__('Следующее медиа', 'gk-orlink'); ?>">
        <span aria-hidden="true"><?php echo gk_orlink_svg_icon('chevron-right'); ?></span>
    </button>
    <div class="case-lightbox__dialog" role="dialog" aria-modal="true" aria-label="<?php echo esc_attr__('Просмотр медиа', 'gk-orlink'); ?>">
        <div class="case-lightbox__stage">
            <div class="case-lightbox__media">
                <img class="case-lightbox__image" data-case-lightbox-image src="" alt="" loading="lazy" decoding="async">
                <video class="case-lightbox__video" data-case-lightbox-video hidden controls playsinline preload="metadata"></video>
            </div>
        </div>
        <div class="case-lightbox__thumbs" data-case-lightbox-thumbs></div>
    </div>
</div>
<?php wp_footer(); ?>
</body>
</html>
