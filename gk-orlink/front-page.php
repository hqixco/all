<?php
if (!defined('ABSPATH')) {
    exit;
}

get_header();

$editor_settings = function_exists('gk_orlink_get_editor_settings') ? gk_orlink_get_editor_settings() : [];
$editor_hero = $editor_settings['hero'] ?? [];
$editor_process = $editor_settings['process'] ?? [];
$editor_services = $editor_settings['services'] ?? [];
$editor_projects = $editor_settings['projects'] ?? [];
$editor_quiz = $editor_settings['quiz'] ?? [];
$editor_guarantees = $editor_settings['guarantees'] ?? [];
$editor_contacts = $editor_settings['contacts'] ?? [];
$editor_cases = $editor_settings['cases'] ?? [];
$editor_benefits = $editor_settings['benefits'] ?? [];

$hero_image = get_template_directory_uri() . '/assets/img/hero-building.jpg';

$process_slides = [
    [
        'image_url' => get_template_directory_uri() . '/assets/img/process-video-slide.jpg',
        'alt' => 'Строительство и готовый спортивный объект из металлоконструкций',
        'time' => '02:45',
    ],
    [
        'image_url' => get_template_directory_uri() . '/assets/img/project-social-main.jpg',
        'alt' => 'Социальный объект из металлоконструкций',
        'time' => '03:12',
    ],
    [
        'image_url' => get_template_directory_uri() . '/assets/img/project-warehouse-main.jpg',
        'alt' => 'Складской комплекс из металлоконструкций',
        'time' => '02:08',
    ],
    [
        'image_url' => get_template_directory_uri() . '/assets/img/hero-building.jpg',
        'alt' => 'Промышленное здание из металлоконструкций',
        'time' => '03:36',
    ],
];

$service_cards = [
    [
        'title' => 'Ангары',
        'image_url' => get_template_directory_uri() . '/assets/img/angar.png',
        'icon_image_url' => get_template_directory_uri() . '/assets/img/service-warehouse-icon.svg',
        'icon' => 'hangar',
        'callback_title' => 'Узнайте стоимость строительства ангара',
    ],
    [
        'title' => 'Склады',
        'image_url' => get_template_directory_uri() . '/assets/img/sklad.png',
        'icon_image_url' => get_template_directory_uri() . '/assets/img/service-hangar-icon.svg',
        'icon' => 'warehouse-alt',
        'callback_title' => 'Узнайте стоимость строительства склада',
    ],
    [
        'title' => 'Производственно-складские комплексы',
        'image_url' => get_template_directory_uri() . '/assets/img/skladskoj-kompleks.png',
        'icon_image_url' => get_template_directory_uri() . '/assets/img/service-production-complex.svg',
        'icon' => 'factory',
        'callback_title' => 'Узнайте стоимость строительства производственно-складского комплекса',
    ],
    [
        'title' => 'Торговые комплексы',
        'image_url' => get_template_directory_uri() . '/assets/img/torgovyj-kompleks.png',
        'icon_image_url' => get_template_directory_uri() . '/assets/img/service-store-icon.svg',
        'icon' => 'cart',
        'callback_title' => 'Узнайте стоимость строительства торгового комплекса',
    ],
    [
        'title' => 'Здания и таунхаусы',
        'image_url' => get_template_directory_uri() . '/assets/img/zdaniya.png',
        'icon_image_url' => get_template_directory_uri() . '/assets/img/service-complex-icon.svg',
        'icon' => 'office',
        'callback_title' => 'Узнайте стоимость строительства здания',
    ],
    [
        'title' => 'Автосервис / автомойка',
        'image_url' => get_template_directory_uri() . '/assets/img/avtosevis.png',
        'icon_image_url' => get_template_directory_uri() . '/assets/img/service-hangar-icon.svg',
        'icon' => 'grid',
        'callback_title' => 'Узнайте стоимость строительства автосервиса',
    ],
];

$quiz_steps = (array) ($editor_quiz['steps'] ?? (function_exists('gk_orlink_get_default_quiz_steps') ? gk_orlink_get_default_quiz_steps() : []));
?>
<section class="hero" style="background-image: url('<?php echo esc_url(!empty($editor_hero['bg_image']) ? $editor_hero['bg_image'] : $hero_image); ?>');">
    <div class="hero__stage container">
        <div class="hero__content">
            <h1 class="hero__title">
                <?php echo esc_html($editor_hero['title_line_1'] ?? 'СТРОИТЕЛЬСТВО'); ?><br>
                <?php echo esc_html($editor_hero['title_line_2'] ?? 'БЫСТРОВОЗВОДИМЫХ ЗДАНИЙ'); ?>
            </h1>
            <p class="hero__subtitle"><?php echo esc_html($editor_hero['subtitle'] ?? 'из металлоконструкций под ключ.'); ?></p>

            <div class="hero__accent">
                <span class="hero__accent-bar" aria-hidden="true"></span>
                <span class="hero__accent-text"><?php echo esc_html($editor_hero['accent'] ?? 'ПОД КЛЮЧ ОТ 500 М²'); ?></span>
            </div>

            <ul class="hero__points">
                <li>
                    <img class="hero__bullet-icon" src="<?php echo esc_url(get_template_directory_uri() . '/assets/img/check-bullet.svg'); ?>" alt="" aria-hidden="true" width="28" height="28">
                    <span><?php echo esc_html($editor_hero['points'][0] ?? 'Рассчитайте стоимость Вашего объекта.'); ?></span>
                </li>
                <li>
                    <img class="hero__bullet-icon" src="<?php echo esc_url(get_template_directory_uri() . '/assets/img/check-bullet.svg'); ?>" alt="" aria-hidden="true" width="28" height="28">
                    <span><?php echo esc_html($editor_hero['points'][1] ?? 'Посмотрите объекты, которые мы уже построили.'); ?></span>
                </li>
            </ul>

            <div class="hero__actions">
                <a class="hero__cta" href="#quiz">
                    <img class="hero__cta-icon hero__cta-icon--image" src="<?php echo esc_url(get_template_directory_uri() . '/assets/img/calc-icon.svg'); ?>" alt="" aria-hidden="true" width="24" height="24">
                    <span><?php echo esc_html($editor_hero['cta_text'] ?? 'РАССЧИТАТЬ СТОИМОСТЬ ОБЪЕКТА'); ?></span>
                </a>

                <div class="hero__quiz">
                    <img class="hero__quiz-icon hero__quiz-icon--image" src="<?php echo esc_url(get_template_directory_uri() . '/assets/img/quiz-list-icon.svg'); ?>" alt="" aria-hidden="true" width="58" height="58">
                    <div class="hero__quiz-copy">
                        <p class="hero__quiz-title"><?php echo esc_html($editor_hero['quiz_title'] ?? 'Ответьте на 9 вопросов'); ?></p>
                        <p class="hero__quiz-text"><?php echo esc_html($editor_hero['quiz_text'] ?? 'и получите расчёт стоимости здания из металлоконструкций'); ?></p>
                    </div>
                </div>
            </div>
        </div>

    </div>
</section>

<section class="hero-benefits">
    <div class="container hero-benefits__grid">
        <?php foreach ($editor_benefits as $benefit) : ?>
            <article class="hero-benefits__card">
                <span class="hero-benefits__icon" aria-hidden="true">
                    <?php if (!empty($benefit['icon'])) : ?>
                        <img src="<?php echo esc_url($benefit['icon']); ?>" alt="" width="30" height="30">
                    <?php else : ?>
                        <?php echo gk_orlink_svg_icon('check-circle'); ?>
                    <?php endif; ?>
                </span>
                <p class="hero-benefits__text"><?php echo esc_html($benefit['text']); ?></p>
            </article>
        <?php endforeach; ?>
    </div>
</section>

<section class="process-section">
    <div class="container process-section__card">
        <header class="process-section__header">
            <h2 class="process-section__title"><?php echo esc_html($editor_process['title'] ?? 'Как мы строим и исполняем обязательства?'); ?></h2>
        </header>

        <div class="process-section__content">
            <div class="process-media">
                <div class="process-media__video">
                    <iframe
                        class="process-media__iframe"
                        src="<?php echo esc_url($editor_process['iframe'] ?? 'https://rutube.ru/play/embed/da7e54976e3e284581ee4bf13e83b7c3/?r=wd'); ?>"
                        title="<?php echo esc_attr__('Спортивные объекты ОРЛИНК', 'gk-orlink'); ?>"
                        loading="lazy"
                        allow="clipboard-write; autoplay; encrypted-media; fullscreen; picture-in-picture"
                        allowfullscreen
                    ></iframe>
                </div>
            </div>

            <div class="process-info">
                <div class="process-info__heading">
                    <span class="process-info__accent" aria-hidden="true"></span>
                    <h3><?php echo esc_html($editor_process['heading'] ?? 'Спортивные объекты ГК Орлинк.'); ?></h3>
                </div>
                <p class="process-info__text"><?php echo esc_html($editor_process['text'] ?? 'В этом ролике мы покажем, как наша команда построила спортивную арену для керлинга «под ключ» от разработки проекта до сдачи в эксплуатацию, а так же другие, значимые, спортивные объекты.'); ?></p>

                <div class="process-info__list">
                <div class="process-info__item">
                        <span class="process-info__icon" aria-hidden="true">
                            <img src="<?php echo esc_url(get_template_directory_uri() . '/assets/img/process-search-icon.svg'); ?>" alt="" width="26" height="26">
                        </span>
                        <p>Прозрачный процесс на каждом этапе</p>
                    </div>
                    <div class="process-info__item">
                        <span class="process-info__icon" aria-hidden="true">
                            <img src="<?php echo esc_url(get_template_directory_uri() . '/assets/img/process-factory-icon.svg'); ?>" alt="" width="26" height="26">
                        </span>
                        <p>Собственные производственные мощности</p>
                    </div>
                    <div class="process-info__item">
                        <span class="process-info__icon" aria-hidden="true">
                            <img src="<?php echo esc_url(get_template_directory_uri() . '/assets/img/process-calendar-icon.svg'); ?>" alt="" width="26" height="26">
                        </span>
                        <p>Соблюдаем сроки и бюджет</p>
                    </div>
                    <div class="process-info__item">
                        <span class="process-info__icon" aria-hidden="true">
                            <img src="<?php echo esc_url(get_template_directory_uri() . '/assets/img/process-shield-icon.svg'); ?>" alt="" width="26" height="26">
                        </span>
                        <p>Гарантируем качество и надежность</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>

<section class="projects-section">
    <div class="container projects-section__inner">
        <header class="projects-section__header">
            <h2 class="projects-section__title"><?php echo esc_html($editor_projects['title'] ?? 'С 2014 года построили более 210 зданий из металлоконструкций'); ?></h2>
            <p class="projects-section__subtitle"><?php echo esc_html($editor_projects['subtitle'] ?? 'Посмотрите примеры некоторых из них'); ?></p>
        </header>

        <div class="projects-section__list">
            <article class="project-card" data-project-card>
                <div class="project-card__media project-card__media--video">
                    <iframe
                        class="project-card__iframe"
                        src="https://rutube.ru/play/embed/8ec0c037de70cbdb767a88c8fe6bf08a/?r=wd"
                        title="<?php echo esc_attr__('Социальные объекты ГК ОРЛИНК', 'gk-orlink'); ?>"
                        loading="lazy"
                        allow="clipboard-write; autoplay; encrypted-media; fullscreen; picture-in-picture"
                        allowfullscreen
                    ></iframe>
                </div>

                <div class="project-card__content">
                    <h3 class="project-card__title"><?php esc_html_e('Социальные объекты ГК ОРЛИНК', 'gk-orlink'); ?></h3>
                    <p class="project-card__text"><?php esc_html_e('Обзорное видео по реализованным объектам:', 'gk-orlink'); ?></p>
                    <ul class="project-card__list">
                        <li>
                            <span class="project-card__check" aria-hidden="true"><?php echo gk_orlink_svg_icon('check-circle'); ?></span>
                            <span><?php esc_html_e('Строительство несущих колонн для крыши актового и спортивного зала школы в Химках', 'gk-orlink'); ?></span>
                        </li>
                        <li>
                            <span class="project-card__check" aria-hidden="true"><?php echo gk_orlink_svg_icon('check-circle'); ?></span>
                            <span><?php esc_html_e('Строительство медицинского центра', 'gk-orlink'); ?></span>
                        </li>
                        <li>
                            <span class="project-card__check" aria-hidden="true"><?php echo gk_orlink_svg_icon('check-circle'); ?></span>
                            <span><?php esc_html_e('Строительство учебного корпуса на 950 мест', 'gk-orlink'); ?></span>
                        </li>
                    </ul>
                    <a class="project-card__button" href="#quiz">
                        <span class="project-card__button-icon project-card__button-icon--image" aria-hidden="true">
                            <img src="<?php echo esc_url(get_template_directory_uri() . '/assets/img/calc-icon.svg'); ?>" alt="" width="18" height="18">
                        </span>
                        <span><?php esc_html_e('Получить расчёт стоимости вашего объекта', 'gk-orlink'); ?></span>
                    </a>
                </div>
            </article>

            <article class="project-card" data-project-card>
                <div class="project-card__media project-card__media--video">
                    <iframe
                        class="project-card__iframe"
                        src="https://rutube.ru/play/embed/a1310130ef35e2f8620c130f96041b6a/?r=wd"
                        title="<?php echo esc_attr__('Ангары и склады ГК ОРЛИНК', 'gk-orlink'); ?>"
                        loading="lazy"
                        allow="clipboard-write; autoplay; encrypted-media; fullscreen; picture-in-picture"
                        allowfullscreen
                    ></iframe>
                </div>

                <div class="project-card__content">
                    <h3 class="project-card__title"><?php esc_html_e('Ангары и склады ГК ОРЛИНК', 'gk-orlink'); ?></h3>
                    <p class="project-card__text"><?php esc_html_e('Обзорное видео по реализованным складским объектам.', 'gk-orlink'); ?></p>
                    <p class="project-card__text"><?php esc_html_e('Видео демонстрирует процесс возведения современных складских комплексов, акцентируя внимание на ключевых этапах строительства.', 'gk-orlink'); ?></p>
                    <a class="project-card__button" href="#quiz">
                        <span class="project-card__button-icon project-card__button-icon--image" aria-hidden="true">
                            <img src="<?php echo esc_url(get_template_directory_uri() . '/assets/img/calc-icon.svg'); ?>" alt="" width="18" height="18">
                        </span>
                        <span><?php esc_html_e('Получить расчёт стоимости вашего объекта', 'gk-orlink'); ?></span>
                    </a>
                </div>
            </article>
        </div>

        <section class="projects-cases" aria-labelledby="projects-cases-title">
            <header class="projects-cases__header">
                <h3 class="projects-cases__title" id="projects-cases-title"><?php esc_html_e('Ещё более 200 проектов завершили за последние 10 лет', 'gk-orlink'); ?></h3>
            </header>

            <div class="projects-cases__slider" data-projects-cases-slider>
                <button class="projects-cases__nav projects-cases__nav--prev" type="button" data-projects-cases-prev aria-label="<?php echo esc_attr__('Предыдущие кейсы', 'gk-orlink'); ?>">
                    <span aria-hidden="true"><?php echo gk_orlink_svg_icon('chevron-left'); ?></span>
                </button>

                <div class="projects-cases__viewport" data-projects-cases-viewport>
                    <div class="projects-cases__track">
                        <?php foreach ($editor_cases as $case_index => $case) : ?>
                            <?php gk_orlink_render_case_card((array) $case, (int) $case_index); ?>
                        <?php endforeach; ?>
                    </div>
                </div>

                <button class="projects-cases__nav projects-cases__nav--next" type="button" data-projects-cases-next aria-label="<?php echo esc_attr__('Следующие кейсы', 'gk-orlink'); ?>"><span aria-hidden="true"><?php echo gk_orlink_svg_icon('chevron-right'); ?></span></button>
                <div class="projects-cases__pagination" data-projects-cases-pagination aria-label="<?php echo esc_attr__('Навигация по кейсам', 'gk-orlink'); ?>"></div>
            </div>
        </section>

        <section class="services-section" aria-labelledby="services-title">
            <div class="container services-section__inner">
                <header class="services-section__header">
                    <h2 class="services-section__title" id="services-title"><?php echo esc_html($editor_services['title'] ?? 'Предлагаем лучшую цену потому что работаем без посредников'); ?></h2>
                </header>

                <div class="services-section__grid">
                    <?php foreach ($service_cards as $service_card) : ?>
                        <article class="service-card">
                            <img class="service-card__image" src="<?php echo esc_url($service_card['image_url']); ?>" alt="<?php echo esc_attr($service_card['title']); ?>" loading="lazy" decoding="async">
                            <div class="service-card__content">
                                <span class="service-card__icon" aria-hidden="true">
                                    <?php if (!empty($service_card['icon_image_url'])) : ?>
                                        <img src="<?php echo esc_url($service_card['icon_image_url']); ?>" alt="" width="60" height="60">
                                    <?php else : ?>
                                        <?php echo gk_orlink_svg_icon($service_card['icon']); ?>
                                    <?php endif; ?>
                                </span>
                                <h3 class="service-card__title"><?php echo esc_html($service_card['title']); ?></h3>
                                <button
                                    class="service-card__button"
                                    type="button"
                                    data-callback-open
                                    data-callback-title="<?php echo esc_attr($service_card['callback_title']); ?>"
                                    data-callback-image="<?php echo esc_url($service_card['image_url']); ?>"
                                    data-callback-image-alt="<?php echo esc_attr($service_card['title']); ?>"
                                >
                                    <?php esc_html_e('Узнать стоимость', 'gk-orlink'); ?>
                                </button>
                            </div>
                        </article>
                    <?php endforeach; ?>
                </div>
            </div>
        </section>

    </div>
</section>

        <section class="quiz-section" id="quiz" aria-labelledby="quiz-title">
            <div class="quiz-section__inner">
                <h2 class="quiz-section__title" id="quiz-title"><?php echo esc_html($editor_quiz['title'] ?? 'Получите расчёт стоимости вашего объекта'); ?></h2>
                <div class="quiz-card">
                    <h3 class="quiz-card__headline"><?php echo wp_kses_post($editor_quiz['headline'] ?? __('Ответьте на <span>9 вопросов</span> и получите предварительный расчёт', 'gk-orlink')); ?></h3>
                    <div class="quiz-progress" data-quiz-progress>
                        <div class="quiz-progress__rail">
                            <div class="quiz-progress__track"><span class="quiz-progress__fill" data-quiz-fill></span></div>
                            <div class="quiz-progress__steps"><?php for ($quiz_step_index = 1; $quiz_step_index <= count($quiz_steps); $quiz_step_index++) : ?><span class="quiz-progress__step<?php echo 1 === $quiz_step_index ? ' is-active' : ''; ?>" data-quiz-step><?php echo esc_html($quiz_step_index); ?></span><?php endfor; ?></div>
                        </div>
                        <div class="quiz-progress__meta" data-quiz-meta><?php printf(esc_html__('Вопрос 1 из %d', 'gk-orlink'), count($quiz_steps)); ?></div>
                    </div>
                    <form data-quiz-form>
                        <div class="quiz-stage" data-quiz-stage>
                            <div class="quiz-question"><h3 class="quiz-question__title" data-quiz-question-title></h3><p class="quiz-question__subtitle" data-quiz-question-subtitle></p></div>
                            <div class="quiz-options" data-quiz-options hidden></div>
                            <div class="quiz-fields" data-quiz-fields hidden></div>
                        </div>
                        <input type="hidden" data-quiz-answers name="quiz_answers" value="">
                        <div class="quiz-controls"><button class="quiz-back" type="button" data-quiz-back><?php esc_html_e('Назад', 'gk-orlink'); ?></button><button class="quiz-next" type="button" data-quiz-next><span data-quiz-next-label><?php esc_html_e('Следующий вопрос', 'gk-orlink'); ?></span><span class="quiz-next__icon" aria-hidden="true"><?php echo gk_orlink_svg_icon('chevron-right'); ?></span></button><button class="quiz-submit" type="submit" data-quiz-submit hidden><span><?php esc_html_e('Получить расчет стоимости', 'gk-orlink'); ?></span></button></div>
                        <div class="form-privacy-note" data-quiz-privacy-note hidden></div>
                        <div class="quiz-success" data-quiz-success hidden>
                            <span class="quiz-success__icon" aria-hidden="true">
                                <img src="<?php echo esc_url(get_template_directory_uri() . '/assets/img/quiz-success-check.svg'); ?>" alt="" width="70" height="70">
                            </span>
                            <h3><?php esc_html_e('Спасибо. Мы уже готовим расчёт.', 'gk-orlink'); ?></h3>
                            <p><?php esc_html_e('Менеджер свяжется с вами в ближайшее время и уточнит детали объекта.', 'gk-orlink'); ?></p>
                            <button class="quiz-success__button" type="button" data-quiz-reset><?php esc_html_e('Пройти ещё раз', 'gk-orlink'); ?></button>
                        </div>
                    </form>
                </div>
            </div>
            <script id="quiz-config" type="application/json"><?php echo wp_json_encode($quiz_steps, JSON_UNESCAPED_UNICODE); ?></script>
        </section>

        <section class="guarantees-section" aria-labelledby="guarantees-title">
            <div class="guarantees-section__inner">
                <div class="guarantees-section__content">
                    <div class="guarantees-section__image">
                        <img src="<?php echo esc_url($editor_guarantees['image'] ?? get_template_directory_uri() . '/assets/img/guarantee-contract-main.jpg'); ?>" alt="<?php echo esc_attr__('Договор и гарантии ГК Орлинк', 'gk-orlink'); ?>" loading="lazy" decoding="async">
                    </div>

                    <div class="guarantees-section__info">
                        <h2 class="guarantees-section__title" id="guarantees-title"><?php echo esc_html($editor_guarantees['title'] ?? 'Гарантии и обязательства'); ?></h2>
                        <div class="guarantees-list">
                            <?php foreach ((array) ($editor_guarantees['cards'] ?? []) as $guarantee_index => $guarantee_card) : ?>
                                <article class="guarantee-card<?php echo 3 === $guarantee_index ? ' guarantee-card--accent' : ''; ?>">
                                    <span class="guarantee-card__icon" aria-hidden="true">
                                        <?php if (!empty($guarantee_card['icon'])) : ?>
                                            <img src="<?php echo esc_url($guarantee_card['icon']); ?>" alt="" width="28" height="28">
                                        <?php endif; ?>
                                    </span>
                                    <div class="guarantee-card__body">
                                        <h3 class="guarantee-card__title"><?php echo esc_html($guarantee_card['title'] ?? ''); ?></h3>
                                    </div>
                                </article>
                            <?php endforeach; ?>
                        </div>
                    </div>
        </div>
    </div>
</section>

        <section class="contacts-map-section" id="contacts" aria-labelledby="contacts-title">
            <div class="contacts-map-section__map">
                <iframe
                    class="contacts-map-section__map-iframe"
                    src="<?php echo esc_url($editor_contacts['map_iframe'] ?? 'https://yandex.ru/map-widget/v1/?text=%D0%A0%D1%8F%D0%B7%D0%B0%D0%BD%D1%8C%20%D1%83%D0%BB.%20%D0%A1%D1%82%D0%B0%D0%BD%D0%BA%D0%BE%D0%B7%D0%B0%D0%B2%D0%BE%D0%B4%D1%81%D0%BA%D0%B0%D1%8F%2C%20%D0%B4%207&z=16'); ?>"
                    title="<?php echo esc_attr__('Карта проезда к производству ГК Орлинк', 'gk-orlink'); ?>"
                    loading="lazy"
                    referrerpolicy="no-referrer-when-downgrade"
                    allowfullscreen>
                </iframe>
                <div class="contacts-map-section__container">
                    <div class="contacts-card">
                        <h2 class="contacts-card__title" id="contacts-title"><?php echo esc_html($editor_contacts['title'] ?? 'Контакты'); ?></h2>
                        <p class="contacts-card__subtitle"><?php echo esc_html($editor_contacts['subtitle'] ?? 'Свяжитесь с нами любым удобным способом.'); ?></p>
                        <button class="contacts-card__button" type="button" data-callback-open data-callback-title="<?php echo esc_attr__('Назначить встречу', 'gk-orlink'); ?>"><?php esc_html_e('Назначить встречу', 'gk-orlink'); ?></button>
                        <ul class="contacts-card__list">
                            <li><span class="contacts-card__icon" aria-hidden="true"><?php echo gk_orlink_svg_icon('location'); ?></span><span><?php echo esc_html($editor_contacts['address'] ?? 'Рязань, ул. Станкозаводская, д. 7'); ?></span></li>
                            <li><span class="contacts-card__icon" aria-hidden="true"><?php echo gk_orlink_svg_icon('phone'); ?></span><a href="tel:<?php echo esc_attr(preg_replace('/\D+/', '', (string) ($editor_contacts['phone'] ?? '+7 (499) 391 90 81'))); ?>"><?php echo esc_html($editor_contacts['phone'] ?? '+7 (499) 391 90 81'); ?></a></li>
                            <li><span class="contacts-card__icon" aria-hidden="true"><?php echo gk_orlink_svg_icon('mail'); ?></span><a href="mailto:<?php echo esc_attr($editor_contacts['email'] ?? 'mt@orlilk.ru'); ?>"><?php echo esc_html($editor_contacts['email'] ?? 'mt@orlilk.ru'); ?></a></li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
<?php get_footer(); ?>
