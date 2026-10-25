(function (window, document, $) {
    'use strict';

    var FORM_SELECTOR = '#testForm[data-quiz-mode="house-reconstruction"]';
    var ATTRIBUTION_STORAGE_KEY = 'stroybrigada365_attribution';
    var METRICS_CONFIG = (window.StroybrigadaSettings && window.StroybrigadaSettings.metrics) || {};
    var METRIKA_COUNTER_ID = Number(METRICS_CONFIG.counterId) || 108767903;
    var QUIZ_ID = 'house_reconstruction';
    var STEP_COUNT = 5;
    var PHOTO_LIMIT = 10;
    var PHOTO_MAX_SIZE = 15 * 1024 * 1024;
    var PHOTO_ACCEPT = '.jpg,.jpeg,.png,.webp,.heic,image/jpeg,image/png,image/webp,image/heic,image/heif';
    var PHOTO_ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif'];
    var STYLE_ID = 'house-reconstruction-quiz-styles';
    var PHOTO_INPUT_ID = 'house-reconstruction-photos-input';

    var problemPriority = [
        'foundation',
        'house_skew',
        'walls_or_crowns',
        'floors',
        'roof',
        'full_reconstruction',
        'diagnostics'
    ];

    var quizConfig = {
        steps: ['problem', 'house_material', 'house_area', 'photos', 'contacts'],
        problems: [
            { value: 'foundation', label: 'Фундамент просел или разрушается', image: '/assets/uploads/2026/06/vostanovlenie-fundament-quiz.jpg' },
            { value: 'walls_or_crowns', label: 'Сгнили венцы или стены', image: '/assets/uploads/2026/06/vostanovlenie-steny-vency-korobka-quiz.jpg' },
            { value: 'roof', label: 'Протекает или повреждена кровля', image: '/assets/uploads/2026/06/krovelnye-raboty-quiz-zamena-staroy-krovli.jpg' },
            { value: 'house_skew', label: 'Дом перекосило', image: '/assets/uploads/2026/06/vostanovlenie-treshchiny-quiz.jpg' },
            { value: 'full_reconstruction', label: 'Нужна комплексная реконструкция', image: '/assets/uploads/2026/06/vostanovlenie-fasad-uteplenie-quiz.jpg' },
            { value: 'diagnostics', label: 'Не знаю, нужна диагностика', image: '/assets/uploads/2023/02/no-answer-drugoe.png' }
        ],
        houseMaterialOptions: [
            { value: 'log', label: 'Бревно' },
            { value: 'timber', label: 'Брус' },
            { value: 'frame', label: 'Каркас' },
            { value: 'brick_or_block', label: 'Кирпич или блок' },
            { value: 'mixed', label: 'Смешанная конструкция' },
            { value: 'unknown', label: 'Не знаю' }
        ],
        areaRangeOptions: [
            { value: 'lt_50', label: 'До 50 м²' },
            { value: '50_100', label: '50–100 м²' },
            { value: '100_150', label: '100–150 м²' },
            { value: 'gt_150', label: 'Более 150 м²' },
            { value: 'unknown', label: 'Не знаю' }
        ],
        detailQuestions: {
            foundation: {
                title: 'Как проявляется проблема?',
                options: [
                    { value: 'corner_sagged', label: 'Просел угол' },
                    { value: 'whole_house_sagged', label: 'Просел весь дом' },
                    { value: 'cracks', label: 'Есть трещины' },
                    { value: 'foundation_destroyed', label: 'Фундамент разрушается' },
                    { value: 'unknown', label: 'Не знаю' }
                ]
            },
            walls_or_crowns: {
                title: 'Что заметно сейчас?',
                options: [
                    { value: 'visible_rot', label: 'Видна гниль' },
                    { value: 'drafts', label: 'Продуваются стены' },
                    { value: 'fungus_or_moisture', label: 'Появился грибок или сырость' },
                    { value: 'damaged_corners', label: 'Повреждены углы' },
                    { value: 'unknown', label: 'Не знаю' }
                ]
            },
            floors: {
                title: 'Что происходит?',
                options: [
                    { value: 'floor_sagging', label: 'Пол прогибается' },
                    { value: 'floor_uneven', label: 'Пол стал неровным' },
                    { value: 'rot_or_moisture', label: 'Есть гниль или сырость' },
                    { value: 'damaged_beams', label: 'Повреждены балки' },
                    { value: 'unknown', label: 'Не знаю' }
                ]
            },
            roof: {
                title: 'Что требуется?',
                options: [
                    { value: 'fix_leak', label: 'Устранить протечку' },
                    { value: 'replace_covering', label: 'Заменить покрытие' },
                    { value: 'repair_rafters', label: 'Отремонтировать стропила' },
                    { value: 'redo_roof', label: 'Переделать крышу полностью' },
                    { value: 'unknown', label: 'Не знаю' }
                ]
            },
            house_skew: {
                title: 'Как проявляется перекос?',
                options: [
                    { value: 'corner_sagged', label: 'Просел угол' },
                    { value: 'doors_windows_stuck', label: 'Не закрываются двери или окна' },
                    { value: 'uneven_floors', label: 'Полы стали неровными' },
                    { value: 'cracks', label: 'Появились трещины' },
                    { value: 'unknown', label: 'Не знаю' }
                ]
            },
            full_reconstruction: {
                title: 'Какой результат нужен?',
                options: [
                    { value: 'fix_main_problems', label: 'Устранить основные проблемы' },
                    { value: 'permanent_living', label: 'Подготовить дом для постоянного проживания' },
                    { value: 'full_renewal', label: 'Полностью обновить дом' },
                    { value: 'consultation', label: 'Нужна консультация' }
                ]
            }
        },
        contactOptions: {
            call: { label: 'Позвонить', icon: 'icon-phone' },
            whatsapp: { label: 'WhatsApp', icon: 'icon-whatsapp' },
            telegram: { label: 'Telegram', icon: 'icon-paper-plane' }
        }
    };

    function normalizeValue(value) {
        return String(value == null ? '' : value).replace(/\s+/g, ' ').trim();
    }

    function getAssetBase() {
        if (window.StroybrigadaSettings && window.StroybrigadaSettings.themeAssetsBase) {
            return String(window.StroybrigadaSettings.themeAssetsBase).replace(/\/?$/, '/');
        }

        return '/assets/dist/';
    }

    function normalizeAssetUrl(value) {
        var url = normalizeValue(value);

        if (!url || /^(?:https?:)?\/\//i.test(url) || /^data:/i.test(url) || /^blob:/i.test(url)) {
            return url;
        }

        if (url.indexOf('/assets/dist/') === 0) {
            return getAssetBase() + url.slice('/assets/dist/'.length);
        }

        if (url.indexOf('/assets/') === 0) {
            return getAssetBase() + url.slice('/assets/'.length);
        }

        if (url.indexOf('assets/dist/') === 0) {
            return getAssetBase() + url.slice('assets/dist/'.length);
        }

        if (url.indexOf('assets/') === 0) {
            return getAssetBase() + url.slice('assets/'.length);
        }

        return url;
    }

    function getStorage() {
        try {
            return window.localStorage;
        } catch (error) {
            try {
                return window.sessionStorage;
            } catch (nestedError) {
                return null;
            }
        }
    }

    function readStoredAttribution() {
        var storage = getStorage();
        if (!storage) {
            return {};
        }

        try {
            return JSON.parse(storage.getItem(ATTRIBUTION_STORAGE_KEY) || '{}') || {};
        } catch (error) {
            return {};
        }
    }

    function getAttribution() {
        var stored = readStoredAttribution();
        var url = new URL(window.location.href);

        ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'yclid', 'gclid'].forEach(function (key) {
            var value = normalizeValue(url.searchParams.get(key));
            if (value) {
                stored[key] = value;
            }
        });

        return stored;
    }

    function emitAnalyticsEvent(eventName, params) {
        var payload = $.extend({ quiz_id: QUIZ_ID }, params || {});

        if (typeof window.ym === 'function') {
            window.ym(METRIKA_COUNTER_ID, 'reachGoal', eventName, payload);
        }

        if (Array.isArray(window.dataLayer)) {
            window.dataLayer.push($.extend({ event: eventName }, payload));
        }

        if (typeof window.gtag === 'function') {
            window.gtag('event', eventName, payload);
        }
    }

    function ensureStyles() {
        if (document.getElementById(STYLE_ID)) {
            return;
        }

        var style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = '' +
            '.quiz--dynamic .step-slide{display:block!important;}' +
            '.quiz--dynamic .quiz__progress-meta{margin-bottom:12px;font-size:14px;color:#6d6d6d;}' +
            '.quiz--dynamic .quiz__step-description{margin:0 0 18px;color:#4f5a5b;line-height:1.5;}' +
            '.quiz--dynamic .pick-item{position:relative;display:block;}' +
            '.quiz--dynamic .pick-item.is-selected .pick-item__img,.quiz--dynamic .pick-item.is-selected .pick-item__label_checkbox,.quiz--dynamic .pick-item.is-selected .pick-item__label_img{box-shadow:0 0 0 2px #007dc8 inset;border-color:#007dc8;}' +
            '.quiz--dynamic .quiz-step-error,.quiz--dynamic .quiz-field-error{margin-top:10px;color:#e53935;font-size:14px;}' +
            '.quiz--dynamic .quiz-inline-field{width:100%;max-width:460px;padding-left:15px;padding-right:15px;}' +
            '.quiz--dynamic .quiz-label{display:block;font-weight:600;margin-bottom:8px;}' +
            '.quiz--dynamic .quiz-photo-trigger{display:block;width:100%;max-width:none;cursor:pointer;}' +
            '.quiz--dynamic .quiz-photo-trigger .quiz__file{max-width:none;}' +
            '.quiz--dynamic .quiz-file-helper{margin-top:10px;font-size:13px;color:#6d6d6d;}' +
            '.quiz--dynamic .quiz-photo-preview-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin-top:18px;}' +
            '@media (max-width:767px){.quiz--dynamic .quiz-photo-preview-list{grid-template-columns:1fr;}}' +
            '.quiz--dynamic .quiz-photo-card{position:relative;border:1px solid #e2e2e2;border-radius:12px;overflow:hidden;background:#fff;}' +
            '.quiz--dynamic .quiz-photo-card img{display:block;width:100%;height:180px;object-fit:cover;background:#f4f4f4;}' +
            '.quiz--dynamic .quiz-photo-card-body{padding:12px 14px;}' +
            '.quiz--dynamic .quiz-photo-card-name{font-weight:600;word-break:break-word;}' +
            '.quiz--dynamic .quiz-photo-card-meta{margin-top:4px;font-size:13px;color:#6d6d6d;}' +
            '.quiz--dynamic .quiz-photo-remove{position:absolute;top:10px;right:10px;border:0;border-radius:999px;background:rgba(0,0,0,.7);color:#fff;width:34px;height:34px;line-height:1;font-size:18px;cursor:pointer;}' +
            '.quiz--dynamic .quiz-option-hint{display:flex;align-items:center;gap:10px;color:#4f5a5b;font-size:14px;max-width:360px;}' +
            '.quiz--dynamic .quiz-option-hint img{width:20px;height:20px;}' +
            '.quiz--dynamic .quiz-info-stack,.quiz--dynamic .quiz-contact-grid{display:grid;gap:16px;}' +
            '.quiz--dynamic .quiz-contact-row{display:flex;flex-wrap:wrap;margin:0 -15px;}' +
            '.quiz--dynamic .quiz-contact-row > div{width:50%;padding:0 15px;}' +
            '@media (max-width:767px){.quiz--dynamic .quiz-contact-row > div{width:100%;}}' +
            '.quiz--dynamic .tab-control{margin-bottom:0;max-width:460px;}' +
            '.quiz--dynamic .site-form-consent{margin-top:6px;}' +
            '.quiz--dynamic .quiz-is-invalid{border-color:#e53935!important;box-shadow:0 0 0 1px #e53935 inset;}' +
            '.quiz--dynamic .quiz-contact-grid .btn-back{width:100%;max-width:460px;margin-bottom:10px;}' +
            '.quiz--dynamic .quiz-hidden-input{display:none!important;}';
        document.head.appendChild(style);
    }

    function buildOptionMap() {
        var map = {
            preferred_contact: {}
        };

        quizConfig.problems.forEach(function (option) {
            map.problem_types = map.problem_types || {};
            map.problem_types[option.value] = option.label;
        });

        quizConfig.houseMaterialOptions.forEach(function (option) {
            map.house_material = map.house_material || {};
            map.house_material[option.value] = option.label;
        });

        quizConfig.areaRangeOptions.forEach(function (option) {
            map.house_area_range = map.house_area_range || {};
            map.house_area_range[option.value] = option.label;
        });

        Object.keys(quizConfig.detailQuestions).forEach(function (key) {
            map.problem_detail = map.problem_detail || {};
            quizConfig.detailQuestions[key].options.forEach(function (option) {
                map.problem_detail[option.value] = option.label;
            });
        });

        Object.keys(quizConfig.contactOptions).forEach(function (key) {
            map.preferred_contact[key] = quizConfig.contactOptions[key].label;
        });

        return map;
    }

    var optionMap = buildOptionMap();

    function formatBytes(size) {
        if (!size) {
            return '0 МБ';
        }

        return (size / (1024 * 1024)).toFixed(size > 1024 * 1024 ? 1 : 2).replace('.0', '') + ' МБ';
    }

    function initHouseReconstructionQuiz() {
        var $form = $(FORM_SELECTOR).first();
        if (!$form.length) {
            return;
        }

        var form = $form[0];
        var $slider = $form.find('.test-slider').first();
        if (!$slider.length) {
            return;
        }

        ensureStyles();
        $form.addClass('quiz--dynamic');

        var persistentPhotoInput = document.createElement('input');
        persistentPhotoInput.type = 'file';
        persistentPhotoInput.id = PHOTO_INPUT_ID;
        persistentPhotoInput.name = 'photos';
        persistentPhotoInput.className = 'quiz-hidden-input';
        persistentPhotoInput.multiple = true;
        persistentPhotoInput.accept = PHOTO_ACCEPT;
        form.appendChild(persistentPhotoInput);

        var state = {
            currentStepIndex: 0,
            opened: false,
            started: false,
            contactStepOpened: false,
            errors: {},
            fileError: '',
            problem_types: [],
            house_material: '',
            house_area_range: '',
            comment: '',
            photos: [],
            contact: {
                phone: '',
                name: '',
                preferred_contact: 'call',
                privacy_agreement: false
            }
        };

        function getCurrentStepKey() {
            return quizConfig.steps[state.currentStepIndex];
        }

        function getProgressText() {
            return 'Шаг ' + (state.currentStepIndex + 1) + ' из ' + STEP_COUNT;
        }

        function getOptionLabel(group, value) {
            if (!optionMap[group]) {
                return value;
            }

            return optionMap[group][value] || value;
        }

        function getProblemLabels() {
            return state.problem_types.map(function (value) {
                return getOptionLabel('problem_types', value);
            });
        }

        function buildReadableAnswers() {
            var readable = [];

            if (state.problem_types.length) {
                readable.push({
                    label: 'Что требуется восстановить',
                    value: getProblemLabels()
                });
            }

            if (state.house_material) {
                readable.push({
                    label: 'Материал дома',
                    value: getOptionLabel('house_material', state.house_material)
                });
            }

            if (state.house_area_range) {
                readable.push({
                    label: 'Площадь дома',
                    value: getOptionLabel('house_area_range', state.house_area_range)
                });
            }

            if (state.photos.length) {
                readable.push({
                    label: 'Фотографии',
                    value: state.photos.map(function (photo) {
                        return photo.name;
                    })
                });
            }

            if (normalizeValue(state.comment)) {
                readable.push({
                    label: 'Комментарий',
                    value: state.comment
                });
            }

            readable.push({
                label: 'Способ связи',
                value: getOptionLabel('preferred_contact', state.contact.preferred_contact)
            });

            return readable;
        }

        function buildQuizAnswers() {
            var answers = [];

            if (state.problem_types.length) {
                answers.push({
                    question: 'Что требуется восстановить?',
                    answer: getProblemLabels()
                });
            }

            if (state.house_material) {
                answers.push({
                    question: 'Материал дома',
                    answer: getOptionLabel('house_material', state.house_material)
                });
            }

            if (state.house_area_range) {
                answers.push({
                    question: 'Площадь дома',
                    answer: getOptionLabel('house_area_range', state.house_area_range)
                });
            }

            if (normalizeValue(state.comment)) {
                answers.push({
                    question: 'Комментарий',
                    answer: state.comment
                });
            }

            return answers;
        }

        function buildQuizPayload() {
            var attribution = getAttribution();

            return {
                problem_types: state.problem_types.slice(),
                other_problem: '',
                house_material: normalizeValue(state.house_material),
                house_area_range: normalizeValue(state.house_area_range),
                location: '',
                problem_detail: '',
                photos: state.photos.map(function (photo) {
                    return {
                        name: photo.name,
                        size: photo.size,
                        type: photo.type
                    };
                }),
                comment: normalizeValue(state.comment),
                contact: {
                    name: normalizeValue(state.contact.name),
                    phone: normalizeValue(state.contact.phone),
                    preferred_contact: normalizeValue(state.contact.preferred_contact)
                },
                page_url: window.location.href,
                utm_source: normalizeValue(attribution.utm_source),
                utm_medium: normalizeValue(attribution.utm_medium),
                utm_campaign: normalizeValue(attribution.utm_campaign),
                utm_content: normalizeValue(attribution.utm_content),
                utm_term: normalizeValue(attribution.utm_term),
                yclid: normalizeValue(attribution.yclid),
                gclid: normalizeValue(attribution.gclid),
                quiz_id: QUIZ_ID,
                readable_answers: buildReadableAnswers()
            };
        }

        function updatePersistentPhotoInput() {
            try {
                var transfer = new DataTransfer();
                state.photos.forEach(function (photo) {
                    transfer.items.add(photo.file);
                });
                persistentPhotoInput.files = transfer.files;
            } catch (error) {
                persistentPhotoInput.value = '';
            }
        }

        function revokePhotoUrls() {
            state.photos.forEach(function (photo) {
                if (photo.previewUrl) {
                    URL.revokeObjectURL(photo.previewUrl);
                }
            });
        }

        function setFieldError(key, message) {
            if (message) {
                state.errors[key] = message;
            } else {
                delete state.errors[key];
            }
        }

        function scrollToElement(element) {
            if (!element || typeof element.getBoundingClientRect !== 'function') {
                return;
            }

            var top = element.getBoundingClientRect().top + window.pageYOffset - 24;
            window.scrollTo({
                top: Math.max(top, 0),
                behavior: 'smooth'
            });
        }

        function validateCurrentStep() {
            var stepKey = getCurrentStepKey();

            if (stepKey === 'problem') {
                if (!state.problem_types.length) {
                    setFieldError('problem_types', 'Выберите хотя бы одну проблему.');
                    return false;
                }

                setFieldError('problem_types', '');
                return true;
            }

            if (stepKey === 'house_material') {
                if (!state.house_material) {
                    setFieldError('house_material', 'Выберите материал дома.');
                    return false;
                }

                setFieldError('house_material', '');
                return true;
            }

            if (stepKey === 'house_area') {
                if (!state.house_area_range) {
                    setFieldError('house_area_range', 'Выберите площадь дома.');
                    return false;
                }

                setFieldError('house_area_range', '');
                return true;
            }

            if (stepKey === 'photos') {
                setFieldError('photos', '');
                return true;
            }

            if (stepKey === 'contacts') {
                var digits = normalizeValue(state.contact.phone).replace(/\D/g, '');

                if (!normalizeValue(state.contact.phone) || digits.length < 11) {
                    setFieldError('phone', 'Укажите корректный телефон.');
                    return false;
                }

                setFieldError('phone', '');

                if (!state.contact.preferred_contact) {
                    setFieldError('preferred_contact', 'Выберите способ связи.');
                    return false;
                }

                setFieldError('preferred_contact', '');

                if (!state.contact.privacy_agreement) {
                    setFieldError('privacy_agreement', 'Нужно согласие на обработку персональных данных.');
                    return false;
                }

                setFieldError('privacy_agreement', '');
                return true;
            }

            return true;
        }

        function renderProblemOption(option) {
            var selected = state.problem_types.indexOf(option.value) !== -1;
            var imageUrl = normalizeAssetUrl(option.image);

            return '' +
                '<label class="pick-item quiz-option ' + (selected ? 'is-selected' : '') + '">' +
                    '<div class="pick-item__img ' + (selected ? 'active' : '') + '"><img src="' + imageUrl + '" alt="' + option.label + '"></div>' +
                    '<input class="pick-item__input" type="checkbox" name="problem_types" value="' + option.value + '"' + (selected ? ' checked' : '') + '>' +
                    '<div class="pick-item__label pick-item__label_img">' + option.label + '</div>' +
                '</label>';
        }

        function renderCompactOptions(name, options, selectedValue) {
            return '' +
                '<div class="step-slide__grid no_img two_in_line scroll-xh">' +
                    options.map(function (option) {
                        return '' +
                            '<label class="pick-item quiz-option ' + (selectedValue === option.value ? 'is-selected' : '') + '">' +
                                '<input class="pick-item__input quiz-option__input" type="radio" name="' + name + '" value="' + option.value + '"' + (selectedValue === option.value ? ' checked' : '') + '>' +
                                '<div class="pick-item__label_checkbox">' + option.label + '</div>' +
                            '</label>';
                    }).join('') +
                '</div>';
        }

        function renderProblemStep() {
            return '' +
                '<div class="step-slide quiz__step" data-step-key="problem">' +
                    '<div class="quiz__progress-meta">' + getProgressText() + '</div>' +
                    '<div class="quiz__question__progress quiz__question-progress"><div class="mlg"><h3 class="step-slide__title ">Что требуется восстановить?</h3></div></div>' +
                    '<div class="step-slide__grid three-in-line scroll-xh">' +
                        quizConfig.problems.map(renderProblemOption).join('') +
                    '</div>' +
                    (state.errors.problem_types ? '<div class="quiz-step-error" data-error-for="problem_types">' + state.errors.problem_types + '</div>' : '') +
                    '<div class="step-slide__grid three-in-line">' +
                        '<div class="d-flex align-items-center justify-content-between plr15 mt_sm w100">' +
                            '<div class="quiz-option-hint"><img src="' + normalizeAssetUrl('/assets/img/quiz-click.svg') + '" alt=""><span>Можно выбрать несколько вариантов.</span></div>' +
                            '<button type="button" class="btn-next btn-next_active btn-shine" data-quiz-next><span>Следующий вопрос</span></button>' +
                        '</div>' +
                    '</div>' +
                '</div>';
        }

        function renderHouseMaterialStep() {
            return '' +
                '<div class="step-slide quiz__step" data-step-key="house_material">' +
                    '<div class="quiz__progress-meta">' + getProgressText() + '</div>' +
                    '<div class="quiz__question__progress quiz__question-progress"><div class="mlg"><h3 class="step-slide__title ">Материал дома</h3></div></div>' +
                    '<div class="quiz-info-stack">' +
                        '<div data-error-for="house_material">' +
                            renderCompactOptions('house_material', quizConfig.houseMaterialOptions, state.house_material) +
                            (state.errors.house_material ? '<div class="quiz-field-error">' + state.errors.house_material + '</div>' : '') +
                        '</div>' +
                    '</div>' +
                    '<div class="step-slide__grid three-in-line">' +
                        '<div class="d-flex align-items-center justify-content-between plr15 mt_sm w100">' +
                            '<button type="button" class="btn-back" data-quiz-back><span>Предыдущий вопрос</span></button>' +
                            '<button type="button" class="btn-next btn-next_active btn-shine" data-quiz-next><span>Следующий вопрос</span></button>' +
                        '</div>' +
                    '</div>' +
                '</div>';
        }

        function renderHouseAreaStep() {
            return '' +
                '<div class="step-slide quiz__step" data-step-key="house_area">' +
                    '<div class="quiz__progress-meta">' + getProgressText() + '</div>' +
                    '<div class="quiz__question__progress quiz__question-progress"><div class="mlg"><h3 class="step-slide__title ">Площадь дома</h3></div></div>' +
                    '<div class="quiz-info-stack">' +
                        '<div data-error-for="house_area_range">' +
                            renderCompactOptions('house_area_range', quizConfig.areaRangeOptions, state.house_area_range) +
                            (state.errors.house_area_range ? '<div class="quiz-field-error">' + state.errors.house_area_range + '</div>' : '') +
                        '</div>' +
                    '</div>' +
                    '<div class="step-slide__grid three-in-line">' +
                        '<div class="d-flex align-items-center justify-content-between plr15 mt_sm w100">' +
                            '<button type="button" class="btn-back" data-quiz-back><span>Предыдущий вопрос</span></button>' +
                            '<button type="button" class="btn-next btn-next_active btn-shine" data-quiz-next><span>Следующий вопрос</span></button>' +
                        '</div>' +
                    '</div>' +
                '</div>';
        }

        function renderPhotosStep() {
            var previews = state.photos.map(function (photo, index) {
                return '' +
                    '<div class="quiz-photo-card">' +
                        '<button type="button" class="quiz-photo-remove" data-photo-remove="' + index + '" aria-label="Удалить файл">&times;</button>' +
                        '<img src="' + photo.previewUrl + '" alt="' + photo.name + '">' +
                        '<div class="quiz-photo-card-body">' +
                            '<div class="quiz-photo-card-name">' + photo.name + '</div>' +
                            '<div class="quiz-photo-card-meta">' + formatBytes(photo.size) + '</div>' +
                        '</div>' +
                    '</div>';
            }).join('');

            return '' +
                '<div class="step-slide quiz__step" data-step-key="photos">' +
                    '<div class="quiz__progress-meta">' + getProgressText() + '</div>' +
                    '<div class="quiz__question__progress quiz__question-progress"><div class="mlg"><h3 class="step-slide__title ">Покажите состояние дома</h3></div></div>' +
                    '<p class="quiz__step-description">Прикрепите общий вид дома и проблемные участки. По фотографиям специалист сможет лучше подготовиться к разговору.</p>' +
                    '<label class="quiz__file-label quiz-photo-trigger" for="' + PHOTO_INPUT_ID + '">' +
                        '<div class="quiz__file quiz__attachment">' +
                            '<p class="quiz__file__text quiz__attachment-text">' + (state.photos.length ? 'Выбрано файлов: ' + state.photos.length : 'Файл не выбран') + '</p>' +
                            '<div class="quiz__file__upl quiz__attachment-button">Добавить</div>' +
                        '</div>' +
                    '</label>' +
                    '<div class="quiz-file-helper">До 10 фотографий, JPG/JPEG/PNG/WEBP/HEIC, до 15 МБ на файл.</div>' +
                    (state.fileError ? '<div class="quiz-step-error" data-error-for="photos">' + state.fileError + '</div>' : '') +
                    (previews ? '<div class="quiz-photo-preview-list">' + previews + '</div>' : '') +
                    '<div class="quiz-inline-field" data-error-for="comment" style="margin-top:18px;">' +
                        '<div class="quiz-label">Комментарий</div>' +
                        '<textarea class="last-step-form__input3" name="comment" placeholder="Коротко опишите, что произошло и когда заметили проблему">' + (state.comment || '') + '</textarea>' +
                    '</div>' +
                    '<div class="step-slide__grid three-in-line">' +
                        '<div class="d-flex align-items-center justify-content-between plr15 mt_sm w100">' +
                            '<button type="button" class="btn-back" data-quiz-back><span>Предыдущий вопрос</span></button>' +
                            '<button type="button" class="btn-next btn-next_active btn-shine" data-quiz-next><span>Следующий вопрос</span></button>' +
                        '</div>' +
                    '</div>' +
                '</div>';
        }

        function renderContactsStep() {
            return '' +
                '<div class="step-slide quiz__step" data-step-key="contacts">' +
                    '<div class="quiz__progress-meta">' + getProgressText() + '</div>' +
                    '<div class="quiz__question__progress quiz__question-progress"><div class="mlg"><h3 class="step-slide__title ">Куда отправить предварительную оценку?</h3></div></div>' +
                    '<div class="last-step-form quiz-contact-grid">' +
                        '<div>' +
                            '<div class="quiz-label">Способ связи</div>' +
                            '<ul class="tab-control">' +
                                Object.keys(quizConfig.contactOptions).map(function (key) {
                                    var option = quizConfig.contactOptions[key];
                                    return '<li class="' + (state.contact.preferred_contact === key ? 'active' : '') + '"><a href="#" data-contact-method="' + key + '" title="' + option.label + '"><i class="icon ' + option.icon + '"></i>' + option.label + '</a></li>';
                                }).join('') +
                            '</ul>' +
                            (state.errors.preferred_contact ? '<div class="quiz-field-error" data-error-for="preferred_contact">' + state.errors.preferred_contact + '</div>' : '') +
                        '</div>' +
                        '<div class="quiz-contact-row">' +
                            '<div data-error-for="phone"><div class="quiz-label">Телефон</div><input class="last-step-form__input' + (state.errors.phone ? ' quiz-is-invalid' : '') + '" type="tel" name="phone" inputmode="tel" value="' + (state.contact.phone || '') + '" placeholder="+7 (999) 123-45-67">' + (state.errors.phone ? '<div class="quiz-field-error">' + state.errors.phone + '</div>' : '') + '</div>' +
                            '<div data-error-for="name"><div class="quiz-label">Имя</div><input class="last-step-form__input2" type="text" name="name" value="' + (state.contact.name || '') + '" placeholder="Как к вам обращаться"></div>' +
                        '</div>' +
                        '<div class="site-form-consent">' +
                            '<label class="site-form-consent__label">' +
                                '<input class="site-form-consent__checkbox' + (state.errors.privacy_agreement ? ' quiz-is-invalid' : '') + '" type="checkbox" name="privacy_agreement" value="1"' + (state.contact.privacy_agreement ? ' checked' : '') + '>' +
								'<span class="site-form-consent__text">Я принимаю <a href="/politika-konfidentsialnosti/" target="_blank" rel="noopener">Положение и Согласие</a> на обработку персональных данных.</span>' +
                            '</label>' +
                            (state.errors.privacy_agreement ? '<div class="quiz-field-error" data-error-for="privacy_agreement">' + state.errors.privacy_agreement + '</div>' : '') +
                        '</div>' +
                        '<button type="submit" name="submit" class="last-step-form__button btn-shine">' +
                            '<svg class="btn__load" xmlns="http://www.w3.org/2000/svg" style="display:none;shape-rendering:auto;" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid"><circle cx="50" cy="50" fill="none" stroke="#ffffff" stroke-width="10" r="35" stroke-dasharray="164.93361431346415 56.97787143782138"><animateTransform attributeName="transform" type="rotate" repeatCount="indefinite" dur="1s" values="0 50 50;360 50 50" keyTimes="0;1"></animateTransform></circle></svg>' +
                            '<span class="quiz__final__btn__text quiz__submit-text">Получить предварительную оценку</span>' +
                        '</button>' +
                        '<button type="button" class="btn-back" data-quiz-back><span>Предыдущий вопрос</span></button>' +
                    '</div>' +
                '</div>';
        }

        function render() {
            var stepKey = getCurrentStepKey();
            var html = '';

            if (stepKey === 'problem') {
                html = renderProblemStep();
            } else if (stepKey === 'house_material') {
                html = renderHouseMaterialStep();
            } else if (stepKey === 'house_area') {
                html = renderHouseAreaStep();
            } else if (stepKey === 'photos') {
                html = renderPhotosStep();
            } else {
                html = renderContactsStep();
            }

            $slider.html(html);
            $form.find('.quiz-form__progress-fill').css('width', (((state.currentStepIndex + 1) / STEP_COUNT) * 100) + '%');

            if (stepKey === 'contacts' && !state.contactStepOpened) {
                state.contactStepOpened = true;
                emitAnalyticsEvent('quiz_contact_step_opened', {
                    problem_types: state.problem_types.slice()
                });
            }

            if ($.fn.mask) {
                $slider.find('input[type="tel"]').mask('+7 (000) 000-00-00');
            }

            if (!state.opened) {
                state.opened = true;
                emitAnalyticsEvent('quiz_open');
            }
        }

        function goNext() {
            if (!validateCurrentStep()) {
                render();
                var firstErrorKey = Object.keys(state.errors)[0];
                var firstErrorNode = firstErrorKey ? $slider[0].querySelector('[data-error-for="' + firstErrorKey + '"]') || $slider[0].querySelector('[name="' + firstErrorKey + '"]') : null;
                scrollToElement(firstErrorNode || $slider[0]);
                return;
            }

            if (state.currentStepIndex < STEP_COUNT - 1) {
                state.currentStepIndex += 1;
                render();
            }
        }

        function goBack() {
            if (state.currentStepIndex === 0) {
                return;
            }

            state.currentStepIndex -= 1;
            render();
        }

        function handleFileSelection(fileList) {
            state.fileError = '';
            var files = Array.prototype.slice.call(fileList || []);

            if (!files.length) {
                render();
                return;
            }

            if (state.photos.length + files.length > PHOTO_LIMIT) {
                state.fileError = 'Можно загрузить не более 10 файлов.';
                render();
                return;
            }

            for (var index = 0; index < files.length; index += 1) {
                var file = files[index];
                var extension = normalizeValue(file.name.split('.').pop()).toLowerCase();

                if (PHOTO_ALLOWED_EXTENSIONS.indexOf(extension) === -1) {
                    state.fileError = 'Допустимы только JPG, JPEG, PNG, WEBP и HEIC.';
                    break;
                }

                if (file.size > PHOTO_MAX_SIZE) {
                    state.fileError = 'Размер одного файла не должен превышать 15 МБ.';
                    break;
                }

                state.photos.push({
                    file: file,
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    previewUrl: URL.createObjectURL(file)
                });
            }

            updatePersistentPhotoInput();
            persistentPhotoInput.value = '';

            if (!state.fileError) {
                emitAnalyticsEvent('quiz_photo_uploaded', {
                    problem_types: state.problem_types.slice(),
                    photos_count: state.photos.length
                });
            }

            render();
        }

        function removePhoto(index) {
            var removed = state.photos.splice(index, 1)[0];
            if (removed && removed.previewUrl) {
                URL.revokeObjectURL(removed.previewUrl);
            }

            state.fileError = '';
            updatePersistentPhotoInput();
            render();
        }

        function updateContactState() {
            var $current = $slider.find('.step-slide');
            state.contact.phone = normalizeValue($current.find('input[name="phone"]').val());
            state.contact.name = normalizeValue($current.find('input[name="name"]').val());
            state.contact.privacy_agreement = $current.find('input[name="privacy_agreement"]').is(':checked');
        }

        function enrichPayload(formElement, payload) {
            if (formElement !== form) {
                return payload;
            }

            var quizPayload = buildQuizPayload();
            var problemLabels = getProblemLabels();

            payload.name = normalizeValue(state.contact.name);
            payload.phone = normalizeValue(state.contact.phone);
            payload.comment = normalizeValue(state.comment);
            payload.contact = normalizeValue(state.contact.preferred_contact);
            payload.contact_method = getOptionLabel('preferred_contact', state.contact.preferred_contact);
            payload.location = normalizeValue(state.location);
            payload.form_name = problemLabels.length ? 'Квиз реконструкции: ' + problemLabels.join(', ').toLowerCase() : 'Квиз реконструкции';
            payload.service = problemLabels.join(', ') || payload.service;
            payload.quiz_answers = buildQuizAnswers();
            payload.quiz_payload = quizPayload;
            payload.attachment_name = state.photos.map(function (photo) {
                return photo.name;
            }).join(', ');

            return payload;
        }

        window.StroybrigadaQuizHooks = $.extend({}, window.StroybrigadaQuizHooks, {
            validateForm: function (formElement) {
                if (formElement !== form) {
                    return true;
                }

                updateContactState();

                if (!validateCurrentStep()) {
                    render();
                    var firstError = Object.keys(state.errors)[0];
                    var firstErrorNode = firstError ? $slider[0].querySelector('[data-error-for="' + firstError + '"]') || $slider[0].querySelector('[name="' + firstError + '"]') : null;
                    scrollToElement(firstErrorNode || $slider[0]);
                    return false;
                }

                emitAnalyticsEvent('quiz_submit', {
                    problem_types: state.problem_types.slice(),
                    photos_count: state.photos.length
                });

                return true;
            },
            enrichPayload: enrichPayload,
            onSubmitStart: function (formElement) {
                if (formElement === form) {
                    updateContactState();
                }
            },
            onSubmitSuccess: function (formElement) {
                if (formElement !== form) {
                    return;
                }

                revokePhotoUrls();
            },
            onSubmitError: function (formElement) {
                if (formElement !== form) {
                    return;
                }

                emitAnalyticsEvent('quiz_submit_error', {
                    problem_types: state.problem_types.slice(),
                    photos_count: state.photos.length
                });
            },
            getSuccessState: function (formElement) {
                if (formElement !== form) {
                    return null;
                }

                return {
                    title: 'Заявка отправлена',
                    text: 'Специалист изучит ответы и фотографии и свяжется с вами выбранным способом.'
                };
            }
        });

        $slider.on('change', 'input[name="problem_types"]', function () {
            if (!state.started) {
                state.started = true;
                emitAnalyticsEvent('quiz_start');
            }

            var value = this.value;
            if ($(this).is(':checked')) {
                if (state.problem_types.indexOf(value) === -1) {
                    state.problem_types.push(value);
                }
            } else {
            state.problem_types = state.problem_types.filter(function (entry) {
                return entry !== value;
            });
        }

            setFieldError('problem_types', '');
            emitAnalyticsEvent('quiz_problem_selected', {
                problem_types: state.problem_types.slice()
            });
            render();
        });

        $slider.on('change', 'input[name="house_material"]', function () {
            state.house_material = this.value;
            setFieldError('house_material', '');
            render();
        });

        $slider.on('change', 'input[name="house_area_range"]', function () {
            state.house_area_range = this.value;
            setFieldError('house_area_range', '');
            render();
        });

        $slider.on('input', 'textarea[name="comment"]', function () {
            state.comment = normalizeValue(this.value);
        });

        $slider.on('input', 'input[name="phone"], input[name="name"]', function () {
            updateContactState();
            setFieldError(this.name, '');
        });

        $slider.on('change', 'input[name="privacy_agreement"]', function () {
            state.contact.privacy_agreement = $(this).is(':checked');
            setFieldError('privacy_agreement', '');
        });

        $slider.on('click', '[data-contact-method]', function (event) {
            event.preventDefault();
            state.contact.preferred_contact = this.getAttribute('data-contact-method');
            setFieldError('preferred_contact', '');
            render();
        });

        $slider.on('click', '[data-quiz-next]', function () {
            goNext();
        });

        $slider.on('click', '[data-quiz-back]', function () {
            goBack();
        });

        $slider.on('click', '[data-photo-remove]', function () {
            removePhoto(Number(this.getAttribute('data-photo-remove')));
        });

        persistentPhotoInput.addEventListener('change', function () {
            handleFileSelection(this.files);
        });

        render();
    }

    $(initHouseReconstructionQuiz);
})(window, document, window.jQuery);
