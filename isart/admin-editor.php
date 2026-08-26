<?php
if (!defined('ABSPATH')) {
    exit;
}

function isart_get_layout_settings(): array
{
    $defaults = [
        'header' => [
            'descriptor' => 'Профессиональная разработка сайтов и мобильных приложений',
            'menu_1_label' => 'Битрикс разработка',
            'menu_1_link' => '#services',
            'menu_2_label' => 'Создание приложений',
            'menu_2_link' => '#projects',
            'menu_3_label' => 'Самописные сайты',
            'menu_3_link' => '#process',
            'button_text' => 'Написать в MAX',
            'button_url' => 'https://max.ru/',
        ],
        'footer' => [
            'descriptor' => 'Профессиональная разработка сайтов и мобильных приложений',
            'privacy_text' => 'Политика конфиденциальности',
            'privacy_url' => '#',
            'agreement_text' => 'Пользовательское соглашение',
            'agreement_url' => '#',
            'requisites_text' => 'Реквизиты',
            'requisites_url' => '#',
            'email' => 'studio@is-art.ru',
            'cta_text' => 'Обсудить проект →',
            'cta_url' => '#contact',
        ],
    ];

    $stored = get_option('isart_layout_settings', []);
    if (!is_array($stored)) {
        $stored = [];
    }

    return array_replace_recursive($defaults, $stored);
}

function isart_sanitize_layout_settings(array $data): array
{
    $defaults = isart_get_layout_settings();

    return [
        'header' => [
            'descriptor' => sanitize_text_field((string) ($data['header']['descriptor'] ?? $defaults['header']['descriptor'])),
            'menu_1_label' => sanitize_text_field((string) ($data['header']['menu_1_label'] ?? $defaults['header']['menu_1_label'])),
            'menu_1_link' => esc_url_raw((string) ($data['header']['menu_1_link'] ?? $defaults['header']['menu_1_link'])),
            'menu_2_label' => sanitize_text_field((string) ($data['header']['menu_2_label'] ?? $defaults['header']['menu_2_label'])),
            'menu_2_link' => esc_url_raw((string) ($data['header']['menu_2_link'] ?? $defaults['header']['menu_2_link'])),
            'menu_3_label' => sanitize_text_field((string) ($data['header']['menu_3_label'] ?? $defaults['header']['menu_3_label'])),
            'menu_3_link' => esc_url_raw((string) ($data['header']['menu_3_link'] ?? $defaults['header']['menu_3_link'])),
            'button_text' => sanitize_text_field((string) ($data['header']['button_text'] ?? $defaults['header']['button_text'])),
            'button_url' => esc_url_raw((string) ($data['header']['button_url'] ?? $defaults['header']['button_url'])),
        ],
        'footer' => [
            'descriptor' => sanitize_text_field((string) ($data['footer']['descriptor'] ?? $defaults['footer']['descriptor'])),
            'privacy_text' => sanitize_text_field((string) ($data['footer']['privacy_text'] ?? $defaults['footer']['privacy_text'])),
            'privacy_url' => esc_url_raw((string) ($data['footer']['privacy_url'] ?? $defaults['footer']['privacy_url'])),
            'agreement_text' => sanitize_text_field((string) ($data['footer']['agreement_text'] ?? $defaults['footer']['agreement_text'])),
            'agreement_url' => esc_url_raw((string) ($data['footer']['agreement_url'] ?? $defaults['footer']['agreement_url'])),
            'requisites_text' => sanitize_text_field((string) ($data['footer']['requisites_text'] ?? $defaults['footer']['requisites_text'])),
            'requisites_url' => esc_url_raw((string) ($data['footer']['requisites_url'] ?? $defaults['footer']['requisites_url'])),
            'email' => sanitize_email((string) ($data['footer']['email'] ?? $defaults['footer']['email'])),
            'cta_text' => sanitize_text_field((string) ($data['footer']['cta_text'] ?? $defaults['footer']['cta_text'])),
            'cta_url' => esc_url_raw((string) ($data['footer']['cta_url'] ?? $defaults['footer']['cta_url'])),
        ],
    ];
}

function isart_render_editor_text_field(string $label, string $name, string $value, string $type = 'text'): void
{
    ?>
    <tr>
        <th scope="row"><label><?php echo esc_html($label); ?></label></th>
        <td><input class="large-text" type="<?php echo esc_attr($type); ?>" name="<?php echo esc_attr($name); ?>" value="<?php echo esc_attr($value); ?>"></td>
    </tr>
    <?php
}

function isart_render_editor_textarea_field(string $label, string $name, string $value, int $rows = 3): void
{
    ?>
    <tr>
        <th scope="row"><label><?php echo esc_html($label); ?></label></th>
        <td><textarea class="large-text" name="<?php echo esc_attr($name); ?>" rows="<?php echo esc_attr((string) $rows); ?>"><?php echo esc_textarea($value); ?></textarea></td>
    </tr>
    <?php
}

function isart_render_editor_media_field(string $label, string $name, string $value, string $button_label = 'Выбрать файл'): void
{
    ?>
    <div class="isart-media-field">
        <label class="isart-media-field__label"><?php echo esc_html($label); ?></label>
        <div class="isart-media-field__row">
            <input class="regular-text isart-media-field__input" type="url" name="<?php echo esc_attr($name); ?>" value="<?php echo esc_attr($value); ?>" placeholder="https://...">
            <button class="button isart-media-field__button" type="button"><?php echo esc_html($button_label); ?></button>
        </div>
        <?php if ($value !== '') : ?>
            <div class="isart-media-field__preview">
                <img src="<?php echo esc_url($value); ?>" alt="" />
            </div>
        <?php endif; ?>
    </div>
    <?php
}

function isart_register_restructured_editor_pages(): void
{
    remove_menu_page('isart-editor');

    add_menu_page(
        __('Редактор сайта', 'isart'),
        __('Редактор сайта', 'isart'),
        'manage_options',
        'isart-editor',
        'isart_render_main_editor_page',
        'dashicons-edit-page',
        58
    );

    add_menu_page(
        __('Квиз', 'isart'),
        __('Квиз', 'isart'),
        'manage_options',
        'isart-quiz-editor',
        'isart_render_quiz_editor_page',
        'dashicons-feedback',
        59
    );

    add_menu_page(
        __('Кейсы', 'isart'),
        __('Кейсы', 'isart'),
        'manage_options',
        'isart-cases-editor',
        'isart_render_cases_editor_page',
        'dashicons-portfolio',
        60
    );
}
add_action('admin_menu', 'isart_register_restructured_editor_pages', 20);

function isart_render_main_editor_page(): void
{
    if (!current_user_can('manage_options')) {
        wp_die(esc_html__('Недостаточно прав.', 'isart'));
    }

    $settings = isart_get_editor_settings();
    $layout = isart_get_layout_settings();

    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['isart_editor_nonce'])) {
        check_admin_referer('isart_main_editor_settings', 'isart_editor_nonce');

        $raw = isset($_POST['isart_editor']) && is_array($_POST['isart_editor']) ? (array) wp_unslash($_POST['isart_editor']) : [];
        $layout_raw = isset($_POST['isart_layout']) && is_array($_POST['isart_layout']) ? (array) wp_unslash($_POST['isart_layout']) : [];

        update_option('isart_editor_settings', isart_sanitize_editor_settings($raw), false);
        update_option('isart_layout_settings', isart_sanitize_layout_settings($layout_raw), false);

        $settings = isart_get_editor_settings();
        $layout = isart_get_layout_settings();

        echo '<div class="notice notice-success is-dismissible"><p>' . esc_html__('Настройки сохранены.', 'isart') . '</p></div>';
    }
    ?>
    <div class="wrap isart-editor-wrap">
        <h1>Редактор сайта</h1>
        <p>Основные блоки страницы. Квиз и кейсы вынесены в отдельные пункты меню.</p>

        <form method="post">
            <?php wp_nonce_field('isart_main_editor_settings', 'isart_editor_nonce'); ?>

            <input type="hidden" name="isart_editor[sections][quiz]" value="<?php echo esc_attr((string) $settings['sections']['quiz']); ?>">
            <input type="hidden" name="isart_editor[sections][projects]" value="<?php echo esc_attr((string) $settings['sections']['projects']); ?>">

            <fieldset class="isart-editor-panel">
                <legend>1. Сайт</legend>
                <table class="form-table" role="presentation">
                    <?php
                    isart_render_editor_text_field('Title', 'isart_editor[site][title]', (string) $settings['site']['title']);
                    isart_render_editor_text_field('Favicon', 'isart_editor[site][favicon]', (string) $settings['site']['favicon']);
                    ?>
                </table>
            </fieldset>

            <fieldset class="isart-editor-panel">
                <legend>2. Шапка</legend>
                <table class="form-table" role="presentation">
                    <?php
                    isart_render_editor_text_field('Описание бренда', 'isart_layout[header][descriptor]', (string) $layout['header']['descriptor']);
                    isart_render_editor_text_field('Пункт меню 1', 'isart_layout[header][menu_1_label]', (string) $layout['header']['menu_1_label']);
                    isart_render_editor_text_field('Ссылка меню 1', 'isart_layout[header][menu_1_link]', (string) $layout['header']['menu_1_link']);
                    isart_render_editor_text_field('Пункт меню 2', 'isart_layout[header][menu_2_label]', (string) $layout['header']['menu_2_label']);
                    isart_render_editor_text_field('Ссылка меню 2', 'isart_layout[header][menu_2_link]', (string) $layout['header']['menu_2_link']);
                    isart_render_editor_text_field('Пункт меню 3', 'isart_layout[header][menu_3_label]', (string) $layout['header']['menu_3_label']);
                    isart_render_editor_text_field('Ссылка меню 3', 'isart_layout[header][menu_3_link]', (string) $layout['header']['menu_3_link']);
                    isart_render_editor_text_field('Логотип', 'isart_editor[header][logo]', (string) $settings['header']['logo']);
                    isart_render_editor_text_field('Телефон', 'isart_editor[header][phone]', (string) $settings['header']['phone']);
                    isart_render_editor_text_field('Почта', 'isart_editor[header][email]', (string) $settings['header']['email'], 'email');
                    isart_render_editor_text_field('Адрес', 'isart_editor[header][address]', (string) $settings['header']['address']);
                    isart_render_editor_text_field('Текст кнопки', 'isart_layout[header][button_text]', (string) $layout['header']['button_text']);
                    isart_render_editor_text_field('Ссылка кнопки', 'isart_layout[header][button_url]', (string) $layout['header']['button_url'], 'url');
                    ?>
                </table>
            </fieldset>

            <fieldset class="isart-editor-panel">
                <legend>3. Главный экран</legend>
                <table class="form-table" role="presentation">
                    <?php
                    isart_render_editor_text_field('Заголовок 1', 'isart_editor[hero][title_line_1]', (string) $settings['hero']['title_line_1']);
                    isart_render_editor_text_field('Заголовок 2', 'isart_editor[hero][title_line_2]', (string) $settings['hero']['title_line_2']);
                    isart_render_editor_text_field('Заголовок 3', 'isart_editor[hero][title_line_3]', (string) $settings['hero']['title_line_3']);
                    isart_render_editor_textarea_field('Подзаголовок', 'isart_editor[hero][lead]', (string) $settings['hero']['lead'], 3);
                    isart_render_editor_text_field('Пункт 1', 'isart_editor[hero][list_1]', (string) $settings['hero']['list_1']);
                    isart_render_editor_text_field('Пункт 2', 'isart_editor[hero][list_2]', (string) $settings['hero']['list_2']);
                    isart_render_editor_text_field('Пункт 3', 'isart_editor[hero][list_3]', (string) $settings['hero']['list_3']);
                    isart_render_editor_text_field('Пункт 4', 'isart_editor[hero][list_4]', (string) $settings['hero']['list_4']);
                    isart_render_editor_text_field('Основная кнопка', 'isart_editor[hero][primary_cta]', (string) $settings['hero']['primary_cta']);
                    isart_render_editor_text_field('Вторичная кнопка', 'isart_editor[hero][secondary_cta]', (string) $settings['hero']['secondary_cta']);
                    ?>
                </table>
            </fieldset>

            <fieldset class="isart-editor-panel">
                <legend>4. Гарантии и обязательства</legend>
                <table class="form-table" role="presentation">
                    <?php
                    isart_render_editor_text_field('Заголовок', 'isart_editor[sections][guarantees]', (string) $settings['sections']['guarantees']);
                    isart_render_editor_media_field('Пикча слева', 'isart_editor[assets][guarantees_image]', (string) $settings['assets']['guarantees_image'], 'Выбрать изображение');
                    ?>
                </table>
            </fieldset>

            <fieldset class="isart-editor-panel">
                <legend>5. Как проходит разработка</legend>
                <table class="form-table" role="presentation">
                    <?php isart_render_editor_text_field('Заголовок', 'isart_editor[sections][process]', (string) $settings['sections']['process']); ?>
                </table>
            </fieldset>

            <fieldset class="isart-editor-panel">
                <legend>6. Стоимость</legend>
                <table class="form-table" role="presentation">
                    <?php
                    isart_render_editor_text_field('Заголовок', 'isart_editor[sections][pricing]', (string) $settings['sections']['pricing']);
                    ?>
                </table>
            </fieldset>

            <fieldset class="isart-editor-panel">
                <legend>7. Частые вопросы</legend>
                <table class="form-table" role="presentation">
                    <?php
                    isart_render_editor_text_field('Заголовок', 'isart_editor[sections][faq]', (string) $settings['sections']['faq']);
                    isart_render_editor_media_field('Пикча справа', 'isart_editor[assets][faq_image]', (string) $settings['assets']['faq_image'], 'Выбрать изображение');
                    ?>
                </table>
            </fieldset>

            <fieldset class="isart-editor-panel">
                <legend>8. Контакты</legend>
                <table class="form-table" role="presentation">
                    <?php
                    isart_render_editor_text_field('Заголовок', 'isart_editor[sections][contact]', (string) $settings['sections']['contact']);
                    isart_render_editor_textarea_field('Текст', 'isart_editor[sections][contact_text]', (string) $settings['sections']['contact_text'], 3);
                    isart_render_editor_text_field('Карта iframe', 'isart_editor[assets][contact_map_iframe]', (string) $settings['assets']['contact_map_iframe'], 'url');
                    ?>
                </table>
            </fieldset>

            <fieldset class="isart-editor-panel">
                <legend>9. Футер</legend>
                <table class="form-table" role="presentation">
                    <?php
                    isart_render_editor_text_field('Описание бренда', 'isart_layout[footer][descriptor]', (string) $layout['footer']['descriptor']);
                    isart_render_editor_text_field('Ссылка 1', 'isart_layout[footer][privacy_text]', (string) $layout['footer']['privacy_text']);
                    isart_render_editor_text_field('URL 1', 'isart_layout[footer][privacy_url]', (string) $layout['footer']['privacy_url'], 'url');
                    isart_render_editor_text_field('Ссылка 2', 'isart_layout[footer][agreement_text]', (string) $layout['footer']['agreement_text']);
                    isart_render_editor_text_field('URL 2', 'isart_layout[footer][agreement_url]', (string) $layout['footer']['agreement_url'], 'url');
                    isart_render_editor_text_field('Ссылка 3', 'isart_layout[footer][requisites_text]', (string) $layout['footer']['requisites_text']);
                    isart_render_editor_text_field('URL 3', 'isart_layout[footer][requisites_url]', (string) $layout['footer']['requisites_url'], 'url');
                    isart_render_editor_text_field('Email', 'isart_layout[footer][email]', (string) $layout['footer']['email'], 'email');
                    isart_render_editor_text_field('Кнопка', 'isart_layout[footer][cta_text]', (string) $layout['footer']['cta_text']);
                    isart_render_editor_text_field('Ссылка кнопки', 'isart_layout[footer][cta_url]', (string) $layout['footer']['cta_url'], 'url');
                    ?>
                </table>
            </fieldset>

            <?php submit_button(__('Сохранить настройки', 'isart')); ?>
        </form>
    </div>

    <style>
        .isart-editor-wrap .isart-editor-panel {
            background: #fff;
            border: 1px solid #dcdcde;
            border-radius: 16px;
            padding: 20px 24px 8px;
            margin: 20px 0;
        }
        .isart-editor-wrap .isart-editor-panel legend {
            font-size: 16px;
            font-weight: 700;
            padding: 0 10px;
        }
        .isart-media-field { margin: 16px 0 24px; }
        .isart-media-field__label { display: block; font-weight: 600; margin: 0 0 8px; }
        .isart-media-field__row { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
        .isart-media-field__input { width: min(100%, 560px); }
        .isart-media-field__preview { margin-top: 10px; max-width: 240px; }
        .isart-media-field__preview img { display: block; width: 100%; height: auto; border-radius: 10px; }
    </style>

    <script>
    (function() {
        const buttons = document.querySelectorAll('.isart-media-field__button');
        if (!buttons.length || !window.wp || !wp.media) {
            return;
        }

        buttons.forEach((button) => {
            button.addEventListener('click', () => {
                const field = button.closest('.isart-media-field');
                const input = field?.querySelector('.isart-media-field__input');
                if (!field || !input) {
                    return;
                }

                const frame = wp.media({
                    title: button.textContent || 'Выбрать файл',
                    button: { text: 'Использовать файл' },
                    multiple: false,
                });

                frame.on('select', () => {
                    const attachment = frame.state().get('selection').first().toJSON();
                    if (attachment?.url) {
                        input.value = attachment.url;
                        const preview = field.querySelector('.isart-media-field__preview');
                        if (preview) {
                            preview.innerHTML = '<img src="' + attachment.url + '" alt="">';
                        }
                    }
                });

                frame.open();
            });
        });
    })();
    </script>
    <?php
}

function isart_render_quiz_editor_page(): void
{
    if (!current_user_can('manage_options')) {
        wp_die(esc_html__('Недостаточно прав.', 'isart'));
    }

    $settings = isart_get_editor_settings();

    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['isart_editor_nonce'])) {
        check_admin_referer('isart_quiz_editor_settings', 'isart_editor_nonce');
        $quiz_title = isset($_POST['isart_editor']['sections']['quiz']) ? sanitize_text_field((string) wp_unslash($_POST['isart_editor']['sections']['quiz'])) : (string) $settings['sections']['quiz'];
        $settings['sections']['quiz'] = $quiz_title;
        update_option('isart_editor_settings', $settings, false);
        echo '<div class="notice notice-success is-dismissible"><p>' . esc_html__('Настройки квиза сохранены.', 'isart') . '</p></div>';
    }
    ?>
    <div class="wrap isart-editor-wrap">
        <h1>Квиз</h1>
        <p>Этот пункт меню вынесен отдельно. Здесь сейчас редактируется заголовок блока квиза.</p>

        <form method="post">
            <?php wp_nonce_field('isart_quiz_editor_settings', 'isart_editor_nonce'); ?>
            <fieldset class="isart-editor-panel">
                <legend>Квиз</legend>
                <table class="form-table" role="presentation">
                    <?php isart_render_editor_text_field('Заголовок блока', 'isart_editor[sections][quiz]', (string) $settings['sections']['quiz']); ?>
                </table>
            </fieldset>
            <?php submit_button(__('Сохранить квиз', 'isart')); ?>
        </form>
    </div>
    <?php
}

function isart_render_cases_editor_page(): void
{
    if (!current_user_can('manage_options')) {
        wp_die(esc_html__('Недостаточно прав.', 'isart'));
    }

    $settings = isart_get_editor_settings();

    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['isart_editor_nonce'])) {
        check_admin_referer('isart_cases_editor_settings', 'isart_editor_nonce');
        $cases_title = isset($_POST['isart_editor']['sections']['projects']) ? sanitize_text_field((string) wp_unslash($_POST['isart_editor']['sections']['projects'])) : (string) $settings['sections']['projects'];
        $settings['sections']['projects'] = $cases_title;
        update_option('isart_editor_settings', $settings, false);
        echo '<div class="notice notice-success is-dismissible"><p>' . esc_html__('Настройки кейсов сохранены.', 'isart') . '</p></div>';
    }
    ?>
    <div class="wrap isart-editor-wrap">
        <h1>Кейсы</h1>
        <p>Этот пункт меню вынесен отдельно. Здесь сейчас редактируется заголовок блока кейсов.</p>

        <form method="post">
            <?php wp_nonce_field('isart_cases_editor_settings', 'isart_editor_nonce'); ?>
            <fieldset class="isart-editor-panel">
                <legend>Кейсы</legend>
                <table class="form-table" role="presentation">
                    <?php isart_render_editor_text_field('Заголовок блока', 'isart_editor[sections][projects]', (string) $settings['sections']['projects']); ?>
                </table>
            </fieldset>
            <?php submit_button(__('Сохранить кейсы', 'isart')); ?>
        </form>
    </div>
    <?php
}

