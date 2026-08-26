<?php
if (!defined('ABSPATH')) {
    exit;
}

get_header();

$hero_image = get_template_directory_uri() . '/assets/img/hero-building.jpg';

$benefits = [
    [
        'image_url' => get_template_directory_uri() . '/assets/img/process-shield-icon.svg',
        'text' => 'Допуск СРО — все гарантии, смета и сроки закреплены в договоре',
    ],
    [
        'image_url' => get_template_directory_uri() . '/assets/img/process-briefcase-icon.svg',
        'text' => 'Только квалифицированные мастера с опытом работы от 7 лет (граждане РФ)',
    ],
    [
        'image_url' => get_template_directory_uri() . '/assets/img/process-time-icon.svg',
        'text' => 'Минимальные сроки изготовления металлоконструкций',
    ],
    [
        'image_url' => get_template_directory_uri() . '/assets/img/process-factory2-icon.svg',
        'text' => 'Собственное производство металлоконструкций для объектов',
    ],
];

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

$quiz_steps = [
    [
        'question' => 'Что планируете построить?',
        'subtitle' => 'Выберите наиболее подходящий вариант. Это поможет нам предложить оптимальное решение и точный расчёт.',
        'type' => 'cards',
        'options' => [
            ['label' => 'Ангар', 'image_url' => get_template_directory_uri() . '/assets/img/angar.png', 'icon' => 'hangar'],
            ['label' => 'Склад', 'image_url' => get_template_directory_uri() . '/assets/img/sklad.png', 'icon' => 'warehouse-alt'],
            ['label' => 'Производственно-складской комплекс', 'image_url' => get_template_directory_uri() . '/assets/img/skladskoj-kompleks.png', 'icon' => 'factory'],
            ['label' => 'Торговый комплекс / ТЦ', 'image_url' => get_template_directory_uri() . '/assets/img/torgovyj-kompleks.png', 'icon' => 'cart'],
            ['label' => 'Здания и таунхаусы', 'image_url' => get_template_directory_uri() . '/assets/img/zdaniya.png', 'icon' => 'office'],
            ['label' => 'Автосервис / автомойка', 'image_url' => get_template_directory_uri() . '/assets/img/avtosevis.png', 'icon' => 'grid'],
        ],
    ],
    [
        'question' => 'Теплое или холодное здание?',
        'subtitle' => 'Выберите тип здания, чтобы мы сразу предложили подходящее решение.',
        'type' => 'chips',
        'options' => [
            ['label' => 'Теплое помещение'],
            ['label' => 'Холодное помещение'],
        ],
    ],
    [
        'question' => 'Укажите примерную площадь будущего здания (в м²).',
        'subtitle' => 'Выберите ориентировочную площадь с помощью ползунка.',
        'type' => 'range',
        'min' => 500,
        'max' => 10000,
        'step' => 10,
        'default_value' => 500,
        'unit' => 'м²',
    ],
    [
        'question' => 'Сколько этажей планируете?',
        'subtitle' => 'Выберите количество этажей или запросите консультацию специалиста.',
        'type' => 'chips',
        'options' => [
            ['label' => '1 этаж'],
            ['label' => '2 этажа'],
            ['label' => '3 этажа'],
            ['label' => 'Нужна консультация'],
        ],
    ],
    [
        'question' => 'У вас уже есть земельный участок?',
        'subtitle' => 'Это поможет понять, на каком этапе находится проект и какие решения предложить.',
        'type' => 'chips',
        'options' => [
            ['label' => 'Да'],
            ['label' => 'В процессе покупки'],
            ['label' => 'Нет'],
        ],
    ],
    [
        'question' => 'Есть ли проект строительства здания или эскиз?',
        'subtitle' => 'Это поможет оценить, на каком этапе подготовки вы находитесь.',
        'type' => 'chips',
        'options' => [
            ['label' => 'Есть готовый проект'],
            ['label' => 'Нет проекта'],
            ['label' => 'Есть эскиз'],
            ['label' => 'Есть картинка из интернета'],
            ['label' => 'Хочу заказать проект'],
            ['label' => 'Нет, нужна консультация'],
        ],
    ],
    [
        'question' => 'Когда планируете начать строительство?',
        'subtitle' => 'Сроки влияют на подбор решения, производство и монтаж.',
        'type' => 'chips',
        'options' => [
            ['label' => 'Как можно быстрее'],
            ['label' => 'В ближайшее время'],
            ['label' => 'В ближайшие 2-3 месяца'],
            ['label' => 'В ближайшие 6-12 месяцев'],
            ['label' => 'Точных сроков пока нет'],
        ],
    ],
    [
        'question' => 'Как с вами связаться?',
        'subtitle' => 'Выберите удобный способ связи для дальнейшего общения.',
        'type' => 'chips',
        'options' => [
            ['label' => 'В MAX'],
            ['label' => 'В Телеграм'],
            ['label' => 'Позвонить на телефон'],
        ],
    ],
    [
        'question' => 'Отлично, остался последний шаг!',
        'subtitle' => 'Напишите телефон для получения расчета стоимости.',
        'type' => 'form',
    ],
];
?>
<section class="hero" style="background-image: url('<?php echo esc_url($hero_image); ?>');">
    <div class="hero__stage container">
        <div class="hero__content">
            <h1 class="hero__title">
                <?php esc_html_e('СТРОИТЕЛЬСТВО', 'gk-orlink'); ?><br>
                <?php esc_html_e('БЫСТРОВОЗВОДИМЫХ ЗДАНИЙ', 'gk-orlink'); ?>
            </h1>
            <p class="hero__subtitle"><?php esc_html_e('из металлоконструкций под ключ.', 'gk-orlink'); ?></p>

            <div class="hero__accent">
                <span class="hero__accent-bar" aria-hidden="true"></span>
                <span class="hero__accent-text"><?php esc_html_e('ПОД КЛЮЧ ОТ 500 М²', 'gk-orlink'); ?></span>
            </div>

            <ul class="hero__points">
                <li>
                    <img class="hero__bullet-icon" src="<?php echo esc_url(get_template_directory_uri() . '/assets/img/check-bullet.svg'); ?>" alt="" aria-hidden="true" width="28" height="28">
                    <span><?php esc_html_e('Рассчитайте стоимость Вашего объекта.', 'gk-orlink'); ?></span>
                </li>
                <li>
                    <img class="hero__bullet-icon" src="<?php echo esc_url(get_template_directory_uri() . '/assets/img/check-bullet.svg'); ?>" alt="" aria-hidden="true" width="28" height="28">
                    <span><?php esc_html_e('Посмотрите объекты, которые мы уже построили.', 'gk-orlink'); ?></span>
                </li>
            </ul>

            <div class="hero__actions">
                <a class="hero__cta" href="#quiz">
                    <img class="hero__cta-icon hero__cta-icon--image" src="<?php echo esc_url(get_template_directory_uri() . '/assets/img/calc-icon.svg'); ?>" alt="" aria-hidden="true" width="24" height="24">
                    <span><?php esc_html_e('РАССЧИТАТЬ СТОИМОСТЬ ОБЪЕКТА', 'gk-orlink'); ?></span>
                </a>

                <div class="hero__quiz">
                    <img class="hero__quiz-icon hero__quiz-icon--image" src="<?php echo esc_url(get_template_directory_uri() . '/assets/img/quiz-list-icon.svg'); ?>" alt="" aria-hidden="true" width="58" height="58">
                    <div class="hero__quiz-copy">
                        <p class="hero__quiz-title"><?php esc_html_e('Ответьте на 9 вопросов', 'gk-orlink'); ?></p>
                        <p class="hero__quiz-text"><?php esc_html_e('и получите расчёт стоимости здания из металлоконструкций', 'gk-orlink'); ?></p>
                    </div>
                </div>
            </div>
        </div>

    </div>
</section>

<section class="hero-benefits">
    <div class="container hero-benefits__grid">
        <?php foreach ($benefits as $benefit) : ?>
            <article class="hero-benefits__card">
                <span class="hero-benefits__icon" aria-hidden="true">
                    <?php if (!empty($benefit['image_url'])) : ?>
                        <img src="<?php echo esc_url($benefit['image_url']); ?>" alt="" width="30" height="30">
                    <?php else : ?>
                        <?php echo gk_orlink_svg_icon($benefit['icon']); ?>
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
            <h2 class="process-section__title"><?php esc_html_e('Как мы строим и исполняем обязательства?', 'gk-orlink'); ?></h2>
        </header>

        <div class="process-section__content">
            <div class="process-media">
                <div class="process-media__video">
                    <iframe
                        class="process-media__iframe"
                        src="https://rutube.ru/play/embed/da7e54976e3e284581ee4bf13e83b7c3/?r=wd"
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
                    <h3><?php esc_html_e('Спортивные объекты ГК Орлинк.', 'gk-orlink'); ?></h3>
                </div>
                <p class="process-info__text"><?php esc_html_e('В этом ролике мы покажем, как наша команда построила спортивную арену для керлинга «под ключ» от разработки проекта до сдачи в эксплуатацию, а так же другие, значимые, спортивные объекты.', 'gk-orlink'); ?></p>

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

<section class="services-section" aria-labelledby="services-title">
    <div class="container services-section__inner">
        <header class="services-section__header">
            <h2 class="services-section__title" id="services-title"><?php esc_html_e('Потому что работаем без посредников', 'gk-orlink'); ?></h2>
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

<section class="projects-section">
    <div class="container projects-section__inner">
        <header class="projects-section__header">
            <h2 class="projects-section__title"><?php esc_html_e('С 2014 года построили более 210 зданий из металлоконструкций', 'gk-orlink'); ?></h2>
            <p class="projects-section__subtitle"><?php esc_html_e('Посмотрите примеры некоторых из них', 'gk-orlink'); ?></p>
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
                        <article class="projects-case-card">
                            <div class="projects-case-card__gallery" data-case-gallery>
                                <div class="projects-case-card__stage">
                                    <button class="projects-case-card__nav projects-case-card__nav--prev" type="button" data-case-prev aria-label="<?php echo esc_attr__('Предыдущее фото', 'gk-orlink'); ?>">
                                        <span aria-hidden="true"><?php echo gk_orlink_svg_icon('chevron-left'); ?></span>
                                    </button>
                                    <button class="projects-case-card__nav projects-case-card__nav--next" type="button" data-case-next aria-label="<?php echo esc_attr__('Следующее фото', 'gk-orlink'); ?>">
                                        <span aria-hidden="true"><?php echo gk_orlink_svg_icon('chevron-right'); ?></span>
                                    </button>
                                    <button class="projects-case-card__zoom" type="button" data-case-zoom aria-label="<?php echo esc_attr__('Увеличить фото', 'gk-orlink'); ?>">
                                        <img data-case-main src="<?php echo esc_url(get_template_directory_uri() . '/assets/img/cases/1/case-1-1.webp'); ?>" alt="<?php echo esc_attr__('Пункт взимания платы (ПВП) М4-Дон', 'gk-orlink'); ?>" loading="lazy" decoding="async">
                                    </button>
                                </div>
                                <div class="projects-case-card__thumbs" data-case-thumbs>
                                    <button class="projects-case-card__thumb is-active" type="button" data-case-thumb>
                                        <img src="<?php echo esc_url(get_template_directory_uri() . '/assets/img/cases/1/case-1-1.webp'); ?>" alt="<?php echo esc_attr__('Пункт взимания платы (ПВП) М4-Дон, фото 1', 'gk-orlink'); ?>" loading="lazy" decoding="async">
                                    </button>
                                    <button class="projects-case-card__thumb" type="button" data-case-thumb>
                                        <img src="<?php echo esc_url(get_template_directory_uri() . '/assets/img/cases/1/case-1-2.webp'); ?>" alt="<?php echo esc_attr__('Пункт взимания платы (ПВП) М4-Дон, фото 2', 'gk-orlink'); ?>" loading="lazy" decoding="async">
                                    </button>
                                </div>
                            </div>
                            <div class="projects-case-card__content">
                                <h4 class="projects-case-card__title"><?php esc_html_e('Пункт взимания платы (ПВП) М4-Дон', 'gk-orlink'); ?></h4>
                                <p class="projects-case-card__text"><?php esc_html_e('Изготовление и монтаж металлоконструкций.', 'gk-orlink'); ?></p>
                                <ul class="projects-case-card__meta">
                                    <li>
                                        <span class="projects-case-card__meta-icon" aria-hidden="true"><?php echo gk_orlink_svg_icon('check-circle'); ?></span>
                                        <span><?php esc_html_e('Объём: 329 тонн', 'gk-orlink'); ?></span>
                                    </li>
                                    <li>
                                        <span class="projects-case-card__meta-icon" aria-hidden="true"><?php echo gk_orlink_svg_icon('check-circle'); ?></span>
                                        <span><?php esc_html_e('2018 г.', 'gk-orlink'); ?></span>
                                    </li>
                                </ul>
                            </div>
                        </article>

                        <article class="projects-case-card">
                            <div class="projects-case-card__gallery" data-case-gallery>
                                <div class="projects-case-card__stage">
                                    <button class="projects-case-card__nav projects-case-card__nav--prev" type="button" data-case-prev aria-label="<?php echo esc_attr__('Предыдущее фото', 'gk-orlink'); ?>"><span aria-hidden="true"><?php echo gk_orlink_svg_icon('chevron-left'); ?></span></button>
                                    <button class="projects-case-card__nav projects-case-card__nav--next" type="button" data-case-next aria-label="<?php echo esc_attr__('Следующее фото', 'gk-orlink'); ?>"><span aria-hidden="true"><?php echo gk_orlink_svg_icon('chevron-right'); ?></span></button>
                                    <button class="projects-case-card__zoom" type="button" data-case-zoom aria-label="<?php echo esc_attr__('Увеличить фото', 'gk-orlink'); ?>"><img data-case-main src="<?php echo esc_url(get_template_directory_uri() . '/assets/img/cases/2/case-2-1.webp'); ?>" alt="<?php echo esc_attr__('Сокольническая линия метрополитена', 'gk-orlink'); ?>" loading="lazy" decoding="async"></button>
                                </div>
                                <div class="projects-case-card__thumbs" data-case-thumbs>
                                    <button class="projects-case-card__thumb is-active" type="button" data-case-thumb data-case-type="image"><img src="<?php echo esc_url(get_template_directory_uri() . '/assets/img/cases/2/case-2-1.webp'); ?>" alt="<?php echo esc_attr__('Сокольническая линия метрополитена, фото 1', 'gk-orlink'); ?>" loading="lazy" decoding="async"></button>
                                    <button class="projects-case-card__thumb" type="button" data-case-thumb data-case-type="image"><img src="<?php echo esc_url(get_template_directory_uri() . '/assets/img/cases/2/case-2-2.webp'); ?>" alt="<?php echo esc_attr__('Сокольническая линия метрополитена, фото 2', 'gk-orlink'); ?>" loading="lazy" decoding="async"></button>
                                    <button class="projects-case-card__thumb" type="button" data-case-thumb data-case-type="image"><img src="<?php echo esc_url(get_template_directory_uri() . '/assets/img/cases/2/case-2-3.webp'); ?>" alt="<?php echo esc_attr__('Сокольническая линия метрополитена, фото 3', 'gk-orlink'); ?>" loading="lazy" decoding="async"></button>
                                </div>
                            </div>
                            <div class="projects-case-card__content">
                                <h4 class="projects-case-card__title"><?php esc_html_e('Сокольническая линия метрополитена', 'gk-orlink'); ?></h4>
                                <p class="projects-case-card__text"><?php esc_html_e('Изготовление металлоконструкций.', 'gk-orlink'); ?></p>
                                <ul class="projects-case-card__meta"><li><span class="projects-case-card__meta-icon" aria-hidden="true"><?php echo gk_orlink_svg_icon('check-circle'); ?></span><span><?php esc_html_e('Объём: 285 тонн', 'gk-orlink'); ?></span></li><li><span class="projects-case-card__meta-icon" aria-hidden="true"><?php echo gk_orlink_svg_icon('check-circle'); ?></span><span><?php esc_html_e('2018 г.', 'gk-orlink'); ?></span></li></ul>
                            </div>
                        </article>
                        <article class="projects-case-card">
                            <div class="projects-case-card__gallery" data-case-gallery>
                                <div class="projects-case-card__stage">
                                    <button class="projects-case-card__nav projects-case-card__nav--prev" type="button" data-case-prev aria-label="<?php echo esc_attr__('Предыдущее фото', 'gk-orlink'); ?>"><span aria-hidden="true"><?php echo gk_orlink_svg_icon('chevron-left'); ?></span></button>
                                    <button class="projects-case-card__nav projects-case-card__nav--next" type="button" data-case-next aria-label="<?php echo esc_attr__('Следующее фото', 'gk-orlink'); ?>"><span aria-hidden="true"><?php echo gk_orlink_svg_icon('chevron-right'); ?></span></button>
                                    <button class="projects-case-card__zoom" type="button" data-case-zoom aria-label="<?php echo esc_attr__('Увеличить фото', 'gk-orlink'); ?>"><img data-case-main src="<?php echo esc_url(get_template_directory_uri() . '/assets/img/cases/3/case-3-1.jpg'); ?>" alt="<?php echo esc_attr__('Коровники Нижегородская область', 'gk-orlink'); ?>" loading="lazy" decoding="async"></button>
                                </div>
                                <div class="projects-case-card__thumbs" data-case-thumbs>
                                    <button class="projects-case-card__thumb is-active" type="button" data-case-thumb><img src="<?php echo esc_url(get_template_directory_uri() . '/assets/img/cases/3/case-3-1.jpg'); ?>" alt="<?php echo esc_attr__('Коровники Нижегородская область, фото 1', 'gk-orlink'); ?>" loading="lazy" decoding="async"></button>
                                    <button class="projects-case-card__thumb" type="button" data-case-thumb><img src="<?php echo esc_url(get_template_directory_uri() . '/assets/img/cases/3/case-3-2.jpg'); ?>" alt="<?php echo esc_attr__('Коровники Нижегородская область, фото 2', 'gk-orlink'); ?>" loading="lazy" decoding="async"></button>
                                    <button class="projects-case-card__thumb" type="button" data-case-thumb><img src="<?php echo esc_url(get_template_directory_uri() . '/assets/img/cases/3/case-3-3.jpg'); ?>" alt="<?php echo esc_attr__('Коровники Нижегородская область, фото 3', 'gk-orlink'); ?>" loading="lazy" decoding="async"></button>
                                </div>
                            </div>
                            <div class="projects-case-card__content">
                                <h4 class="projects-case-card__title"><?php esc_html_e('Коровники Нижегородская область', 'gk-orlink'); ?></h4>
                                <p class="projects-case-card__text"><?php esc_html_e('Изготовление и монтаж металлоконструкций.', 'gk-orlink'); ?></p>
                                <ul class="projects-case-card__meta"><li><span class="projects-case-card__meta-icon" aria-hidden="true"><?php echo gk_orlink_svg_icon('check-circle'); ?></span><span><?php esc_html_e('Объём: 627 тонн', 'gk-orlink'); ?></span></li><li><span class="projects-case-card__meta-icon" aria-hidden="true"><?php echo gk_orlink_svg_icon('check-circle'); ?></span><span><?php esc_html_e('2020 г.', 'gk-orlink'); ?></span></li></ul>
                            </div>
                        </article>
                        <article class="projects-case-card">
                            <div class="projects-case-card__gallery" data-case-gallery>
                                <div class="projects-case-card__stage">
                                    <button class="projects-case-card__nav projects-case-card__nav--prev" type="button" data-case-prev aria-label="<?php echo esc_attr__('Предыдущее фото', 'gk-orlink'); ?>"><span aria-hidden="true"><?php echo gk_orlink_svg_icon('chevron-left'); ?></span></button>
                                    <button class="projects-case-card__nav projects-case-card__nav--next" type="button" data-case-next aria-label="<?php echo esc_attr__('Следующее фото', 'gk-orlink'); ?>"><span aria-hidden="true"><?php echo gk_orlink_svg_icon('chevron-right'); ?></span></button>
                                    <button class="projects-case-card__zoom" type="button" data-case-zoom aria-label="<?php echo esc_attr__('Увеличить фото', 'gk-orlink'); ?>"><img data-case-main src="<?php echo esc_url(get_template_directory_uri() . '/assets/img/cases/4/case-4-1.webp'); ?>" alt="<?php echo esc_attr__('Станция метро Филатов луг', 'gk-orlink'); ?>" loading="lazy" decoding="async"></button>
                                </div>
                                <div class="projects-case-card__thumbs" data-case-thumbs>
                                    <button class="projects-case-card__thumb is-active" type="button" data-case-thumb><img src="<?php echo esc_url(get_template_directory_uri() . '/assets/img/cases/4/case-4-1.webp'); ?>" alt="<?php echo esc_attr__('Станция метро Филатов луг, фото 1', 'gk-orlink'); ?>" loading="lazy" decoding="async"></button>
                                    <button class="projects-case-card__thumb" type="button" data-case-thumb><img src="<?php echo esc_url(get_template_directory_uri() . '/assets/img/cases/4/case-4-2.webp'); ?>" alt="<?php echo esc_attr__('Станция метро Филатов луг, фото 2', 'gk-orlink'); ?>" loading="lazy" decoding="async"></button>
                                    <button class="projects-case-card__thumb" type="button" data-case-thumb><img src="<?php echo esc_url(get_template_directory_uri() . '/assets/img/cases/4/case-4-3.webp'); ?>" alt="<?php echo esc_attr__('Станция метро Филатов луг, фото 3', 'gk-orlink'); ?>" loading="lazy" decoding="async"></button>
                                    <button class="projects-case-card__thumb" type="button" data-case-thumb><img src="<?php echo esc_url(get_template_directory_uri() . '/assets/img/cases/4/case-4-4.jpg'); ?>" alt="<?php echo esc_attr__('Станция метро Филатов луг, фото 4', 'gk-orlink'); ?>" loading="lazy" decoding="async"></button>
                                </div>
                            </div>
                            <div class="projects-case-card__content">
                                <h4 class="projects-case-card__title"><?php esc_html_e('Станция метро Филатов луг', 'gk-orlink'); ?></h4>
                                <p class="projects-case-card__text"><?php esc_html_e('Изготовление и поставка металлоконструкций основного каркаса здания станции метрополитена. Изготовление металлоконструкций пешеходных мостов и выходов из метро.', 'gk-orlink'); ?></p>
                                <ul class="projects-case-card__meta"><li><span class="projects-case-card__meta-icon" aria-hidden="true"><?php echo gk_orlink_svg_icon('check-circle'); ?></span><span><?php esc_html_e('Общий объём: более 1200 тонн', 'gk-orlink'); ?></span></li><li><span class="projects-case-card__meta-icon" aria-hidden="true"><?php echo gk_orlink_svg_icon('check-circle'); ?></span><span><?php esc_html_e('2020 год', 'gk-orlink'); ?></span></li></ul>
                            </div>
                        </article>
                        <article class="projects-case-card">
                            <div class="projects-case-card__gallery" data-case-gallery>
                                <div class="projects-case-card__stage">
                                    <button class="projects-case-card__nav projects-case-card__nav--prev" type="button" data-case-prev aria-label="<?php echo esc_attr__('Предыдущее фото', 'gk-orlink'); ?>"><span aria-hidden="true"><?php echo gk_orlink_svg_icon('chevron-left'); ?></span></button>
                                    <button class="projects-case-card__nav projects-case-card__nav--next" type="button" data-case-next aria-label="<?php echo esc_attr__('Следующее фото', 'gk-orlink'); ?>"><span aria-hidden="true"><?php echo gk_orlink_svg_icon('chevron-right'); ?></span></button>
                                    <button class="projects-case-card__zoom" type="button" data-case-zoom aria-label="<?php echo esc_attr__('Увеличить фото', 'gk-orlink'); ?>"><img data-case-main src="<?php echo esc_url(get_template_directory_uri() . '/assets/img/cases/5/case-5-1.webp'); ?>" alt="<?php echo esc_attr__('Южное (Братеево-2) Замоскворецкой линии', 'gk-orlink'); ?>" loading="lazy" decoding="async"></button>
                                    <button class="projects-case-card__play" type="button" data-case-play aria-label="<?php echo esc_attr__('Воспроизвести видео', 'gk-orlink'); ?>" hidden><span aria-hidden="true"><?php echo gk_orlink_svg_icon('play'); ?></span></button>
                                </div>
                                <div class="projects-case-card__thumbs projects-case-card__thumbs--wide" data-case-thumbs>
                                    <button class="projects-case-card__thumb is-active" type="button" data-case-thumb data-case-type="image"><img src="<?php echo esc_url(get_template_directory_uri() . '/assets/img/cases/5/case-5-1.webp'); ?>" alt="<?php echo esc_attr__('Южное (Братеево-2), фото 1', 'gk-orlink'); ?>" loading="lazy" decoding="async"></button>
                                    <button class="projects-case-card__thumb" type="button" data-case-thumb data-case-type="image"><img src="<?php echo esc_url(get_template_directory_uri() . '/assets/img/cases/5/case-5-2.webp'); ?>" alt="<?php echo esc_attr__('Южное (Братеево-2), фото 2', 'gk-orlink'); ?>" loading="lazy" decoding="async"></button>
                                    <button class="projects-case-card__thumb" type="button" data-case-thumb data-case-type="image"><img src="<?php echo esc_url(get_template_directory_uri() . '/assets/img/cases/5/case-5-3.webp'); ?>" alt="<?php echo esc_attr__('Южное (Братеево-2), фото 3', 'gk-orlink'); ?>" loading="lazy" decoding="async"></button>
                                    <button class="projects-case-card__thumb projects-case-card__thumb--video" type="button" data-case-thumb data-case-type="video" data-case-video="<?php echo esc_url(get_template_directory_uri() . '/assets/img/cases/5/case-5-video.mp4'); ?>" data-case-poster="<?php echo esc_url(get_template_directory_uri() . '/assets/img/cases/5/case-5-poster.jpg'); ?>"><img src="<?php echo esc_url(get_template_directory_uri() . '/assets/img/cases/5/case-5-poster.jpg'); ?>" alt="<?php echo esc_attr__('Южное (Братеево-2), видео', 'gk-orlink'); ?>" loading="lazy" decoding="async"><span class="projects-case-card__thumb-play" aria-hidden="true"><?php echo gk_orlink_svg_icon('play'); ?></span></button>
                                </div>
                            </div>
                            <div class="projects-case-card__content">
                                <h4 class="projects-case-card__title"><?php esc_html_e('Южное («Братеево-2») Замоскворецкой линии', 'gk-orlink'); ?></h4>
                                <p class="projects-case-card__text"><?php esc_html_e('Монтаж металлоконструкций.', 'gk-orlink'); ?></p>
                                <ul class="projects-case-card__meta"><li><span class="projects-case-card__meta-icon" aria-hidden="true"><?php echo gk_orlink_svg_icon('check-circle'); ?></span><span><?php esc_html_e('Объём выполнения работ: более 1 000 тонн', 'gk-orlink'); ?></span></li><li><span class="projects-case-card__meta-icon" aria-hidden="true"><?php echo gk_orlink_svg_icon('check-circle'); ?></span><span><?php esc_html_e('2021 г.', 'gk-orlink'); ?></span></li></ul>
                            </div>
                        </article>
                        <article class="projects-case-card">
                            <div class="projects-case-card__gallery" data-case-gallery>
                                <div class="projects-case-card__stage">
                                    <button class="projects-case-card__nav projects-case-card__nav--prev" type="button" data-case-prev aria-label="<?php echo esc_attr__('Предыдущее фото', 'gk-orlink'); ?>"><span aria-hidden="true"><?php echo gk_orlink_svg_icon('chevron-left'); ?></span></button>
                                    <button class="projects-case-card__nav projects-case-card__nav--next" type="button" data-case-next aria-label="<?php echo esc_attr__('Следующее фото', 'gk-orlink'); ?>"><span aria-hidden="true"><?php echo gk_orlink_svg_icon('chevron-right'); ?></span></button>
                                    <button class="projects-case-card__zoom" type="button" data-case-zoom aria-label="<?php echo esc_attr__('Увеличить фото', 'gk-orlink'); ?>"><img data-case-main src="<?php echo esc_url(get_template_directory_uri() . '/assets/img/cases/6/case-6-1.jpg'); ?>" alt="<?php echo esc_attr__('Логистический склад Домодедово', 'gk-orlink'); ?>" loading="lazy" decoding="async"></button>
                                    <button class="projects-case-card__play" type="button" data-case-play aria-label="<?php echo esc_attr__('Воспроизвести видео', 'gk-orlink'); ?>" hidden><span aria-hidden="true"><?php echo gk_orlink_svg_icon('play'); ?></span></button>
                                </div>
                                <div class="projects-case-card__thumbs projects-case-card__thumbs--wide" data-case-thumbs>
                                    <button class="projects-case-card__thumb is-active" type="button" data-case-thumb data-case-type="image"><img src="<?php echo esc_url(get_template_directory_uri() . '/assets/img/cases/6/case-6-1.jpg'); ?>" alt="<?php echo esc_attr__('Логистический склад Домодедово, фото 1', 'gk-orlink'); ?>" loading="lazy" decoding="async"></button>
                                    <button class="projects-case-card__thumb" type="button" data-case-thumb data-case-type="image"><img src="<?php echo esc_url(get_template_directory_uri() . '/assets/img/cases/6/case-6-2.jpg'); ?>" alt="<?php echo esc_attr__('Логистический склад Домодедово, фото 2', 'gk-orlink'); ?>" loading="lazy" decoding="async"></button>
                                    <button class="projects-case-card__thumb" type="button" data-case-thumb data-case-type="image"><img src="<?php echo esc_url(get_template_directory_uri() . '/assets/img/cases/6/case-6-3.webp'); ?>" alt="<?php echo esc_attr__('Логистический склад Домодедово, фото 3', 'gk-orlink'); ?>" loading="lazy" decoding="async"></button>
                                    <button class="projects-case-card__thumb projects-case-card__thumb--video" type="button" data-case-thumb data-case-type="video" data-case-video="<?php echo esc_url(get_template_directory_uri() . '/assets/img/cases/6/case-6-video.mp4'); ?>" data-case-poster="<?php echo esc_url(get_template_directory_uri() . '/assets/img/cases/6/case-6-poster.webp'); ?>"><img src="<?php echo esc_url(get_template_directory_uri() . '/assets/img/cases/6/case-6-poster.webp'); ?>" alt="<?php echo esc_attr__('Логистический склад Домодедово, видео', 'gk-orlink'); ?>" loading="lazy" decoding="async"><span class="projects-case-card__thumb-play" aria-hidden="true"><?php echo gk_orlink_svg_icon('play'); ?></span></button>
                                </div>
                            </div>
                            <div class="projects-case-card__content">
                                <h4 class="projects-case-card__title"><?php esc_html_e('Логистический склад Домодедово', 'gk-orlink'); ?></h4>
                                <p class="projects-case-card__text"><?php esc_html_e('Изготовление и монтаж металлоконструкций.', 'gk-orlink'); ?></p>
                                <ul class="projects-case-card__meta"><li><span class="projects-case-card__meta-icon" aria-hidden="true"><?php echo gk_orlink_svg_icon('check-circle'); ?></span><span><?php esc_html_e('Объём работ: 750 тонн', 'gk-orlink'); ?></span></li><li><span class="projects-case-card__meta-icon" aria-hidden="true"><?php echo gk_orlink_svg_icon('check-circle'); ?></span><span><?php esc_html_e('2021 г.', 'gk-orlink'); ?></span></li></ul>
                            </div>
                        </article>
                        <article class="projects-case-card">
                            <div class="projects-case-card__gallery" data-case-gallery>
                                <div class="projects-case-card__stage">
                                    <button class="projects-case-card__nav projects-case-card__nav--prev" type="button" data-case-prev aria-label="<?php echo esc_attr__('Предыдущее фото', 'gk-orlink'); ?>"><span aria-hidden="true"><?php echo gk_orlink_svg_icon('chevron-left'); ?></span></button>
                                    <button class="projects-case-card__nav projects-case-card__nav--next" type="button" data-case-next aria-label="<?php echo esc_attr__('Следующее фото', 'gk-orlink'); ?>"><span aria-hidden="true"><?php echo gk_orlink_svg_icon('chevron-right'); ?></span></button>
                                    <button class="projects-case-card__zoom" type="button" data-case-zoom aria-label="<?php echo esc_attr__('Увеличить фото', 'gk-orlink'); ?>"><img data-case-main src="<?php echo esc_url(get_template_directory_uri() . '/assets/img/cases/7/case-7-1.png'); ?>" alt="<?php echo esc_attr__('Школа № 21 г. Коломна', 'gk-orlink'); ?>" loading="lazy" decoding="async"></button>
                                </div>
                                <div class="projects-case-card__thumbs projects-case-card__thumbs--wide" data-case-thumbs>
                                    <button class="projects-case-card__thumb is-active" type="button" data-case-thumb><img src="<?php echo esc_url(get_template_directory_uri() . '/assets/img/cases/7/case-7-1.png'); ?>" alt="<?php echo esc_attr__('Школа № 21 г. Коломна, фото 1', 'gk-orlink'); ?>" loading="lazy" decoding="async"></button>
                                    <button class="projects-case-card__thumb" type="button" data-case-thumb><img src="<?php echo esc_url(get_template_directory_uri() . '/assets/img/cases/7/case-7-2.jpg'); ?>" alt="<?php echo esc_attr__('Школа № 21 г. Коломна, фото 2', 'gk-orlink'); ?>" loading="lazy" decoding="async"></button>
                                    <button class="projects-case-card__thumb" type="button" data-case-thumb><img src="<?php echo esc_url(get_template_directory_uri() . '/assets/img/cases/7/case-7-3.png'); ?>" alt="<?php echo esc_attr__('Школа № 21 г. Коломна, фото 3', 'gk-orlink'); ?>" loading="lazy" decoding="async"></button>
                                    <button class="projects-case-card__thumb" type="button" data-case-thumb><img src="<?php echo esc_url(get_template_directory_uri() . '/assets/img/cases/7/case-7-4.png'); ?>" alt="<?php echo esc_attr__('Школа № 21 г. Коломна, фото 4', 'gk-orlink'); ?>" loading="lazy" decoding="async"></button>
                                </div>
                            </div>
                            <div class="projects-case-card__content">
                                <h4 class="projects-case-card__title"><?php esc_html_e('Школа № 21 г. Коломна', 'gk-orlink'); ?></h4>
                                <p class="projects-case-card__text"><?php esc_html_e('Изготовление и монтаж металлоконструкций, работы по монтажу кровли и основных конструкций.', 'gk-orlink'); ?></p>
                                <ul class="projects-case-card__meta"><li><span class="projects-case-card__meta-icon" aria-hidden="true"><?php echo gk_orlink_svg_icon('check-circle'); ?></span><span><?php esc_html_e('2022 г.', 'gk-orlink'); ?></span></li></ul>
                            </div>
                        </article>
                        <article class="projects-case-card">
                            <div class="projects-case-card__gallery" data-case-gallery>
                                <div class="projects-case-card__stage">
                                    <button class="projects-case-card__nav projects-case-card__nav--prev" type="button" data-case-prev aria-label="<?php echo esc_attr__('Предыдущее фото', 'gk-orlink'); ?>"><span aria-hidden="true"><?php echo gk_orlink_svg_icon('chevron-left'); ?></span></button>
                                    <button class="projects-case-card__nav projects-case-card__nav--next" type="button" data-case-next aria-label="<?php echo esc_attr__('Следующее фото', 'gk-orlink'); ?>"><span aria-hidden="true"><?php echo gk_orlink_svg_icon('chevron-right'); ?></span></button>
                                    <button class="projects-case-card__zoom" type="button" data-case-zoom aria-label="<?php echo esc_attr__('Увеличить фото', 'gk-orlink'); ?>"><img data-case-main src="<?php echo esc_url(get_template_directory_uri() . '/assets/img/cases/8/case-8-1.webp'); ?>" alt="<?php echo esc_attr__('Автовокзал, автостанция Бронницы', 'gk-orlink'); ?>" loading="lazy" decoding="async"></button>
                                    <button class="projects-case-card__play" type="button" data-case-play aria-label="<?php echo esc_attr__('Воспроизвести видео', 'gk-orlink'); ?>" hidden><span aria-hidden="true"><?php echo gk_orlink_svg_icon('play'); ?></span></button>
                                </div>
                                <div class="projects-case-card__thumbs projects-case-card__thumbs--wide" data-case-thumbs>
                                    <button class="projects-case-card__thumb is-active" type="button" data-case-thumb data-case-type="image"><img src="<?php echo esc_url(get_template_directory_uri() . '/assets/img/cases/8/case-8-1.webp'); ?>" alt="<?php echo esc_attr__('Автовокзал Бронницы, фото 1', 'gk-orlink'); ?>" loading="lazy" decoding="async"></button>
                                    <button class="projects-case-card__thumb" type="button" data-case-thumb data-case-type="image"><img src="<?php echo esc_url(get_template_directory_uri() . '/assets/img/cases/8/case-8-2.webp'); ?>" alt="<?php echo esc_attr__('Автовокзал Бронницы, фото 2', 'gk-orlink'); ?>" loading="lazy" decoding="async"></button>
                                    <button class="projects-case-card__thumb" type="button" data-case-thumb data-case-type="image"><img src="<?php echo esc_url(get_template_directory_uri() . '/assets/img/cases/8/case-8-3.webp'); ?>" alt="<?php echo esc_attr__('Автовокзал Бронницы, фото 3', 'gk-orlink'); ?>" loading="lazy" decoding="async"></button>
                                    <button class="projects-case-card__thumb" type="button" data-case-thumb data-case-type="image"><img src="<?php echo esc_url(get_template_directory_uri() . '/assets/img/cases/8/case-8-4.webp'); ?>" alt="<?php echo esc_attr__('Автовокзал Бронницы, фото 4', 'gk-orlink'); ?>" loading="lazy" decoding="async"></button>
                                    <button class="projects-case-card__thumb projects-case-card__thumb--video" type="button" data-case-thumb data-case-type="video" data-case-video="<?php echo esc_url(get_template_directory_uri() . '/assets/img/cases/8/case-8-video.mp4'); ?>" data-case-poster="<?php echo esc_url(get_template_directory_uri() . '/assets/img/cases/8/case-8-5.webp'); ?>"><img src="<?php echo esc_url(get_template_directory_uri() . '/assets/img/cases/8/case-8-5.webp'); ?>" alt="<?php echo esc_attr__('Автовокзал Бронницы, видео', 'gk-orlink'); ?>" loading="lazy" decoding="async"><span class="projects-case-card__thumb-play" aria-hidden="true"><?php echo gk_orlink_svg_icon('play'); ?></span></button>
                                </div>
                            </div>
                            <div class="projects-case-card__content">
                                <h4 class="projects-case-card__title"><?php esc_html_e('Автовокзал, автостанция Бронницы', 'gk-orlink'); ?></h4>
                                <p class="projects-case-card__text"><?php esc_html_e('Изготовление и монтаж основных металлоконструкций и металлоконструкций кровли.', 'gk-orlink'); ?></p>
                                <ul class="projects-case-card__meta"><li><span class="projects-case-card__meta-icon" aria-hidden="true"><?php echo gk_orlink_svg_icon('check-circle'); ?></span><span><?php esc_html_e('Объём работ: более 350 тонн', 'gk-orlink'); ?></span></li><li><span class="projects-case-card__meta-icon" aria-hidden="true"><?php echo gk_orlink_svg_icon('check-circle'); ?></span><span><?php esc_html_e('2023 г.', 'gk-orlink'); ?></span></li></ul>
                            </div>
                        </article>
                        <article class="projects-case-card">
                            <div class="projects-case-card__gallery" data-case-gallery>
                                <div class="projects-case-card__stage">
                                    <button class="projects-case-card__nav projects-case-card__nav--prev" type="button" data-case-prev aria-label="<?php echo esc_attr__('Предыдущее фото', 'gk-orlink'); ?>"><span aria-hidden="true"><?php echo gk_orlink_svg_icon('chevron-left'); ?></span></button>
                                    <button class="projects-case-card__nav projects-case-card__nav--next" type="button" data-case-next aria-label="<?php echo esc_attr__('Следующее фото', 'gk-orlink'); ?>"><span aria-hidden="true"><?php echo gk_orlink_svg_icon('chevron-right'); ?></span></button>
                                    <button class="projects-case-card__zoom" type="button" data-case-zoom aria-label="<?php echo esc_attr__('Увеличить фото', 'gk-orlink'); ?>"><img data-case-main src="<?php echo esc_url(get_template_directory_uri() . '/assets/img/cases/9/case-9-1.webp'); ?>" alt="<?php echo esc_attr__('Складской комплекс. Чеховский район', 'gk-orlink'); ?>" loading="lazy" decoding="async"></button>
                                </div>
                                <div class="projects-case-card__thumbs projects-case-card__thumbs--wide" data-case-thumbs>
                                    <button class="projects-case-card__thumb is-active" type="button" data-case-thumb><img src="<?php echo esc_url(get_template_directory_uri() . '/assets/img/cases/9/case-9-1.webp'); ?>" alt="<?php echo esc_attr__('Складской комплекс. Чеховский район, фото 1', 'gk-orlink'); ?>" loading="lazy" decoding="async"></button>
                                    <button class="projects-case-card__thumb" type="button" data-case-thumb><img src="<?php echo esc_url(get_template_directory_uri() . '/assets/img/cases/9/case-9-2.webp'); ?>" alt="<?php echo esc_attr__('Складской комплекс. Чеховский район, фото 2', 'gk-orlink'); ?>" loading="lazy" decoding="async"></button>
                                    <button class="projects-case-card__thumb" type="button" data-case-thumb><img src="<?php echo esc_url(get_template_directory_uri() . '/assets/img/cases/9/case-9-3.webp'); ?>" alt="<?php echo esc_attr__('Складской комплекс. Чеховский район, фото 3', 'gk-orlink'); ?>" loading="lazy" decoding="async"></button>
                                    <button class="projects-case-card__thumb" type="button" data-case-thumb><img src="<?php echo esc_url(get_template_directory_uri() . '/assets/img/cases/9/case-9-4.webp'); ?>" alt="<?php echo esc_attr__('Складской комплекс. Чеховский район, фото 4', 'gk-orlink'); ?>" loading="lazy" decoding="async"></button>
                                </div>
                            </div>
                            <div class="projects-case-card__content">
                                <h4 class="projects-case-card__title"><?php esc_html_e('Складской комплекс. Чеховский район', 'gk-orlink'); ?></h4>
                                <p class="projects-case-card__text"><?php esc_html_e('Комплекс работ по изготовлению и выполнению работ по монтажу металлоконструкций для складского комплекса.', 'gk-orlink'); ?></p>
                                <ul class="projects-case-card__meta"><li><span class="projects-case-card__meta-icon" aria-hidden="true"><?php echo gk_orlink_svg_icon('check-circle'); ?></span><span><?php esc_html_e('Объём: более 450 тонн', 'gk-orlink'); ?></span></li><li><span class="projects-case-card__meta-icon" aria-hidden="true"><?php echo gk_orlink_svg_icon('check-circle'); ?></span><span><?php esc_html_e('2024 г.', 'gk-orlink'); ?></span></li></ul>
                            </div>
                        </article>
                        <article class="projects-case-card">
                            <div class="projects-case-card__gallery" data-case-gallery>
                                <div class="projects-case-card__stage">
                                    <button class="projects-case-card__nav projects-case-card__nav--prev" type="button" data-case-prev aria-label="<?php echo esc_attr__('Предыдущее фото', 'gk-orlink'); ?>"><span aria-hidden="true"><?php echo gk_orlink_svg_icon('chevron-left'); ?></span></button>
                                    <button class="projects-case-card__nav projects-case-card__nav--next" type="button" data-case-next aria-label="<?php echo esc_attr__('Следующее фото', 'gk-orlink'); ?>"><span aria-hidden="true"><?php echo gk_orlink_svg_icon('chevron-right'); ?></span></button>
                                    <button class="projects-case-card__zoom" type="button" data-case-zoom aria-label="<?php echo esc_attr__('Увеличить фото', 'gk-orlink'); ?>"><img data-case-main src="<?php echo esc_url(get_template_directory_uri() . '/assets/img/cases/10/case-10-1.webp'); ?>" alt="<?php echo esc_attr__('Складской комплекс Конаково Тверская область', 'gk-orlink'); ?>" loading="lazy" decoding="async"></button>
                                </div>
                                <div class="projects-case-card__thumbs" data-case-thumbs>
                                    <button class="projects-case-card__thumb is-active" type="button" data-case-thumb><img src="<?php echo esc_url(get_template_directory_uri() . '/assets/img/cases/10/case-10-1.webp'); ?>" alt="<?php echo esc_attr__('Складской комплекс Конаково Тверская область, фото 1', 'gk-orlink'); ?>" loading="lazy" decoding="async"></button>
                                    <button class="projects-case-card__thumb" type="button" data-case-thumb><img src="<?php echo esc_url(get_template_directory_uri() . '/assets/img/cases/10/case-10-2.webp'); ?>" alt="<?php echo esc_attr__('Складской комплекс Конаково Тверская область, фото 2', 'gk-orlink'); ?>" loading="lazy" decoding="async"></button>
                                </div>
                            </div>
                            <div class="projects-case-card__content">
                                <h4 class="projects-case-card__title"><?php esc_html_e('Складской комплекс Конаково Тверская область', 'gk-orlink'); ?></h4>
                                <p class="projects-case-card__text"><?php esc_html_e('Комплекс работ по изготовлению и выполнению работ по монтажу металлоконструкций для складского комплекса.', 'gk-orlink'); ?></p>
                                <ul class="projects-case-card__meta"><li><span class="projects-case-card__meta-icon" aria-hidden="true"><?php echo gk_orlink_svg_icon('check-circle'); ?></span><span><?php esc_html_e('Объём: более 1450 тонн', 'gk-orlink'); ?></span></li><li><span class="projects-case-card__meta-icon" aria-hidden="true"><?php echo gk_orlink_svg_icon('check-circle'); ?></span><span><?php esc_html_e('2025 г.', 'gk-orlink'); ?></span></li></ul>
                            </div>
                        </article>
                    </div>
                </div>

                <button class="projects-cases__nav projects-cases__nav--next" type="button" data-projects-cases-next aria-label="<?php echo esc_attr__('Следующие кейсы', 'gk-orlink'); ?>"><span aria-hidden="true"><?php echo gk_orlink_svg_icon('chevron-right'); ?></span></button>
                <div class="projects-cases__pagination" data-projects-cases-pagination aria-label="<?php echo esc_attr__('Навигация по кейсам', 'gk-orlink'); ?>"></div>
            </div>
        </section>

    </div>
</section>

        <section class="quiz-section" id="quiz" aria-labelledby="quiz-title">
            <div class="quiz-section__inner">
                <h2 class="quiz-section__title" id="quiz-title"><?php esc_html_e('Получите расчёт стоимости вашего объекта', 'gk-orlink'); ?></h2>
                <div class="quiz-card">
                    <h3 class="quiz-card__headline"><?php echo wp_kses_post(__('Ответьте на <span>9 вопросов</span> и получите предварительный расчёт', 'gk-orlink')); ?></h3>
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
                        <img src="<?php echo esc_url(get_template_directory_uri() . '/assets/img/guarantee-contract-main.jpg'); ?>" alt="<?php echo esc_attr__('Договор и гарантии ГК Орлинк', 'gk-orlink'); ?>" loading="lazy" decoding="async">
                    </div>

                    <div class="guarantees-section__info">
                        <h2 class="guarantees-section__title" id="guarantees-title"><?php esc_html_e('Гарантии и обязательства', 'gk-orlink'); ?></h2>
                        <div class="guarantees-list">
                        <article class="guarantee-card">
                            <span class="guarantee-card__icon" aria-hidden="true">
                                <img src="<?php echo esc_url(get_template_directory_uri() . '/assets/img/process-calendar-icon.svg'); ?>" alt="" width="28" height="28">
                            </span>
                            <div class="guarantee-card__body">
                                <h3 class="guarantee-card__title"><?php esc_html_e('Сдаем работы точно в срок. За каждый день просрочки выплатим неустойку, зафиксированную в договоре', 'gk-orlink'); ?></h3>
                            </div>
                        </article>

                        <article class="guarantee-card">
                            <span class="guarantee-card__icon" aria-hidden="true">
                                <img src="<?php echo esc_url(get_template_directory_uri() . '/assets/img/guarantee-shield-check.svg'); ?>" alt="" width="28" height="28">
                            </span>
                            <div class="guarantee-card__body">
                                <h3 class="guarantee-card__title"><?php esc_html_e('Предоставляем 5 лет гарантии на все наши объекты из металлоконструкций', 'gk-orlink'); ?></h3>
                            </div>
                        </article>

                        <article class="guarantee-card">
                            <span class="guarantee-card__icon" aria-hidden="true">
                                <img src="<?php echo esc_url(get_template_directory_uri() . '/assets/img/guarantee-car-side.svg'); ?>" alt="" width="28" height="28">
                            </span>
                            <div class="guarantee-card__body">
                                <h3 class="guarantee-card__title"><?php esc_html_e('При гарантийном случае мы приедем к вам по первому звонку и в течение 7 дней устраним неисправность', 'gk-orlink'); ?></h3>
                            </div>
                        </article>

                        <article class="guarantee-card guarantee-card--accent">
                            <span class="guarantee-card__icon" aria-hidden="true">
                                <img src="<?php echo esc_url(get_template_directory_uri() . '/assets/img/process-briefcase-icon.svg'); ?>" alt="" width="28" height="28">
                            </span>
                            <div class="guarantee-card__body">
                                <h3 class="guarantee-card__title"><?php esc_html_e('Работаем только с юр лицами', 'gk-orlink'); ?></h3>
                            </div>
                        </article>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section class="contacts-map-section" id="contacts" aria-labelledby="contacts-title">
            <div class="contacts-map-section__map">
                <iframe
                    class="contacts-map-section__map-iframe"
                    src="https://yandex.ru/map-widget/v1/?text=%D0%A0%D1%8F%D0%B7%D0%B0%D0%BD%D1%8C%20%D1%83%D0%BB.%20%D0%A1%D1%82%D0%B0%D0%BD%D0%BA%D0%BE%D0%B7%D0%B0%D0%B2%D0%BE%D0%B4%D1%81%D0%BA%D0%B0%D1%8F%2C%20%D0%B4%207&z=16"
                    title="<?php echo esc_attr__('Карта проезда к производству ГК Орлинк', 'gk-orlink'); ?>"
                    loading="lazy"
                    referrerpolicy="no-referrer-when-downgrade"
                    allowfullscreen>
                </iframe>
                <div class="contacts-map-section__container">
                    <div class="contacts-card">
                        <h2 class="contacts-card__title" id="contacts-title"><?php esc_html_e('Контакты', 'gk-orlink'); ?></h2>
                        <p class="contacts-card__subtitle"><?php esc_html_e('Свяжитесь с нами любым удобным способом.', 'gk-orlink'); ?></p>
                        <button class="contacts-card__button" type="button" data-callback-open data-callback-title="<?php echo esc_attr__('Назначить встречу', 'gk-orlink'); ?>"><?php esc_html_e('Назначить встречу', 'gk-orlink'); ?></button>
                        <ul class="contacts-card__list">
                            <li><span class="contacts-card__icon" aria-hidden="true"><?php echo gk_orlink_svg_icon('location'); ?></span><span><?php esc_html_e('Рязань, ул. Станкозаводская, д. 7', 'gk-orlink'); ?></span></li>
                            <li><span class="contacts-card__icon" aria-hidden="true"><?php echo gk_orlink_svg_icon('phone'); ?></span><a href="tel:+74993919081">+7 (499) 391 90 81</a></li>
                            <li><span class="contacts-card__icon" aria-hidden="true"><?php echo gk_orlink_svg_icon('mail'); ?></span><a href="mailto:mt@orlilk.ru">mt@orlilk.ru</a></li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
<?php get_footer(); ?>
