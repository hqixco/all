import './style.css';

(function () {
  const relList = document.createElement('link').relList;
  if (relList && relList.supports && relList.supports('modulepreload')) return;

  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processLink(link);
  }

  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== 'childList') continue;
      for (const node of mutation.addedNodes) {
        if (node.tagName === 'LINK' && node.rel === 'modulepreload') {
          processLink(node);
        }
      }
    }
  }).observe(document, { childList: true, subtree: true });

  function getFetchOptions(link) {
    const options = {};
    if (link.integrity) options.integrity = link.integrity;
    if (link.referrerPolicy) options.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === 'use-credentials') {
      options.credentials = 'include';
    } else if (link.crossOrigin === 'anonymous') {
      options.credentials = 'omit';
    } else {
      options.credentials = 'same-origin';
    }
    return options;
  }

  function processLink(link) {
    if (link.ep) return;
    link.ep = true;
    fetch(link.href, getFetchOptions(link));
  }
})();

const quizSteps = [
  {
    title: 'Какой сайт вам нужен?',
    description: 'Выберите один вариант. Это поможет понять тип проекта и предложить подходящую структуру.',
    multiple: false,
    options: [
      {
        label: 'Лендинг для одной услуги или продукта',
        icon: '/assets/media/landing-page.png',
        subtitle: 'одна цель',
      },
      {
        label: 'Сайт для локального бизнеса',
        icon: '/assets/media/local-business.png',
        subtitle: 'заявки из города',
      },
      {
        label: 'Сайт-каталог',
        icon: '/assets/media/catalog-site.png',
        subtitle: 'удобный подбор',
      },
      {
        label: 'Интернет-магазин',
        icon: '/assets/media/online-store.png',
        subtitle: 'заказы онлайн',
      },
      {
        label: 'Веб-сервис / личный кабинет',
        icon: '/assets/media/web-service.png',
        subtitle: 'сложная логика',
      },
      {
        label: 'Не знаю, нужна консультация',
        icon: '/assets/media/consultation.png',
        subtitle: 'помогу выбрать формат',
      },
    ],
  },
  {
    title: 'Что уже есть для сайта?',
    description: 'Выберите то, что уже подготовлено для проекта.',
    multiple: true,
    options: [
      {
        label: 'Есть тексты',
        icon: '/assets/media/texts-icon.png',
        subtitle: 'контент готов',
      },
      {
        label: 'Есть фото / видео',
        icon: '/assets/media/photos-video.png',
        subtitle: 'есть визуал',
      },
      {
        label: 'Есть логотип',
        icon: '/assets/media/logo-icon.png',
        subtitle: 'фирменный знак',
      },
      {
        label: 'Есть структура',
        icon: '/assets/media/structure-icon.png',
        subtitle: 'есть каркас',
      },
      {
        label: 'Есть примеры сайтов',
        icon: '/assets/media/examples-icon.png',
        subtitle: 'есть ориентиры',
      },
      {
        label: 'Ничего нет, нужна помощь',
        icon: '/assets/media/help-needed-icon.png',
        subtitle: 'сделаем с нуля',
      },
    ],
  },
  {
    title: 'В какие сроки нужен сайт?',
    description: 'Выберите желаемый срок запуска.',
    multiple: false,
    options: [
      {
        label: 'Как можно быстрее',
        icon: '/assets/media/fastest-icon.png',
        subtitle: 'горят сроки',
      },
      {
        label: 'В течение 1 рабочего дня',
        icon: '/assets/media/one-workday-icon.png',
        subtitle: 'Популярно',
      },
      {
        label: 'В течение 2–3 дней',
        icon: '/assets/media/two-three-days-icon.png',
        subtitle: 'без спешки',
      },
      {
        label: 'В течение 1 недели',
        icon: '/assets/media/one-week-icon.png',
        subtitle: 'стандартный темп',
      },
      {
        label: 'Сроки не критичны',
        icon: '/assets/media/no-rush-icon.png',
        subtitle: 'можно спокойно',
      },
      {
        label: 'Сначала хочу понять объём',
        icon: '/assets/media/understand-scope-icon.png',
        subtitle: 'нужна оценка',
      },
    ],
  },
  {
    title: 'Оставьте контакты',
    description: 'Имя и телефон, чтобы отправить оценку и связаться с вами.',
    formStep: true,
  },
];

const stepLabels = ['Тип сайта', 'Контент', 'Сроки', 'Контакты'];

const stepIcons = [
  {
    default: '<img src="/assets/media/web-design.svg" alt="" aria-hidden="true" />',
    active: '<img src="/assets/media/web-design-active.svg" alt="" aria-hidden="true" />',
  },
  {
    default: '<img src="/assets/media/script.svg" alt="" aria-hidden="true" />',
    active: '<img src="/assets/media/script-active.svg" alt="" aria-hidden="true" />',
  },
  {
    default: '<img src="/assets/media/calendar-clock.svg" alt="" aria-hidden="true" />',
    active: '<img src="/assets/media/calendar-clock-active.svg" alt="" aria-hidden="true" />',
  },
  {
    default: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="8.2" r="3.2" stroke="currentColor" stroke-width="1.8"/><path d="M5.5 18.2c.9-2.9 3.3-4.6 6.5-4.6s5.6 1.7 6.5 4.6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    active: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="8.2" r="3.2" stroke="currentColor" stroke-width="1.8"/><path d="M5.5 18.2c.9-2.9 3.3-4.6 6.5-4.6s5.6 1.7 6.5 4.6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  },
  {
    default: '<img src="/assets/media/user.svg" alt="" aria-hidden="true" />',
    active: '<img src="/assets/media/user.svg" alt="" aria-hidden="true" />',
  },
];

const quizState = {
  index: 0,
  answers: quizSteps.map(() => new Set()),
};

const stepsRoot = document.querySelector('[data-quiz-steps]');
const infoNode = document.querySelector('[data-quiz-info]');
const titleNode = document.querySelector('[data-quiz-title]');
const descriptionNode = document.querySelector('[data-quiz-description]');
const optionsNode = document.querySelector('[data-quiz-options]');
const quizCardMain = document.querySelector('.quiz-card__main');
const finalForm = document.querySelector('[data-quiz-final-form]');
const backButton = document.querySelector('[data-quiz-back]');
const nextButton = document.querySelector('[data-quiz-next]');

const projectCards = document.querySelectorAll('.project-card');
const projectGrid = document.querySelector('[data-project-grid]');
const projectViewport = document.querySelector('[data-project-viewport]');
const projectPrev = document.querySelector('[data-project-prev]');
const projectNext = document.querySelector('[data-project-next]');
const projectDots = document.querySelectorAll('[data-project-pager-dot]');
const projectResultModal = document.querySelector('[data-project-result-modal]');
const projectResultClose = document.querySelector('[data-project-result-close]');
const projectResultShots = document.querySelectorAll(
  '[data-project-result-shot]:not([data-project-result-image-open])'
);
const projectResultImageOpeners = document.querySelectorAll('[data-project-result-image-open]');
const projectResultImageModal = document.querySelector('[data-project-result-image-modal]');
const projectResultImageClose = document.querySelector('[data-project-result-image-close]');
const projectPreviewOpeners = document.querySelectorAll('[data-project-preview-open]');
const projectPreviewModal = document.querySelector('[data-project-preview-modal]');
const projectPreviewClose = document.querySelector('[data-project-preview-close]');
const caseSliders = document.querySelectorAll('[data-case-slider]');
const stroykaLightbox = document.querySelector('[data-stroyka-lightbox]');
const projectContactModal = document.querySelector('[data-project-contact-modal]');
const projectContactPreview = document.querySelector('[data-project-contact-preview]');
const projectContactPreviewWrap = document.querySelector('[data-project-contact-preview-wrap]');
const projectContactTitle = projectContactModal?.querySelector('[data-project-contact-title]');
const projectContactForm = document.querySelector('[data-project-contact-form]');
const projectContactClose = document.querySelector('[data-project-contact-close]');
const projectContactOpeners = document.querySelectorAll('[data-project-contact-open]');
const projectContactGenericOpeners = document.querySelectorAll('[data-project-contact-generic]');
const bioCertificateOpeners = document.querySelectorAll('[data-bio-certificate-open]');
const bioCertificateModal = document.querySelector('[data-bio-certificate-modal]');
const bioCertificateClose = document.querySelector('[data-bio-certificate-close]');
const processDayVideoCard = document.querySelector('.process-day__video-card');
const processDayVideoToast = document.querySelector('[data-process-day-video-toast]');
const consultWidget = document.querySelector('[data-consult-widget]');
const consultWidgetOpeners = document.querySelectorAll('[data-consult-widget-open]');
const consultWidgetCloser = document.querySelector('[data-consult-widget-close]');
const consultWidgetPhotoButton = document.querySelector('.consult-widget__photo-button');
const consultWidgetBodyButton = document.querySelector('.consult-widget__body--closed');
const consultWidgetForm = document.querySelector('[data-consult-widget-form]');
const consultWidgetInput = consultWidgetForm?.querySelector('input[name="phone"]');
const consultWidgetPrivacy = consultWidgetForm?.querySelector('input[name="privacy"]');
const consultWidgetSubmit = consultWidgetForm?.querySelector('.consult-widget__submit');
const consultWidgetSuccess = document.querySelector('[data-consult-widget-success]');
const consultWidgetMethod = document.querySelector('[data-consult-widget-method]');
const consultWidgetMethodTrigger = document.querySelector('[data-consult-widget-method-trigger]');
const consultWidgetMethodIcon = document.querySelector('[data-consult-widget-method-icon]');
const consultWidgetMethodMenu = document.querySelector('[data-consult-widget-method-menu]');
const consultWidgetMethodValue = document.querySelector('[data-consult-widget-method-value]');
const consultWidgetMethodChoices = document.querySelectorAll('[data-consult-widget-method-choice]');
const topbarBurger = document.querySelector('[data-topbar-burger]');
const topbarMenu = document.querySelector('[data-topbar-menu]');
const topbarMenuWrap = document.querySelector('.topbar__menu-wrap');
let autoAdvanceTimer = null;
let currentProjectCard = null;
let processDayVideoToastTimer = null;
let processDayVideoToastHideTimer = null;

function initCompactHeader() {
  const topbar = document.querySelector('.topbar');
  if (!topbar) return;

  let rafId = null;
  let isCompact = false;

  const syncHeader = () => {
    rafId = null;
    const nextCompact = isCompact ? window.scrollY > 10 : window.scrollY > 36;
    if (nextCompact === isCompact) return;
    isCompact = nextCompact;
    topbar.classList.toggle('topbar--compact', isCompact);
  };

  const scheduleSync = () => {
    if (rafId !== null) return;
    rafId = window.requestAnimationFrame(syncHeader);
  };

  syncHeader();
  window.addEventListener('scroll', scheduleSync, { passive: true });
}

function initTopbarMenu() {
  if (!topbarBurger || !topbarMenu) return;

  const topbar = document.querySelector('.topbar');
  const menuLinks = topbarMenu.querySelectorAll('a');
  const wideViewport = window.matchMedia('(min-width: 1501px)');

  const setOpen = (open) => {
    topbarMenu.hidden = !open;
    topbarBurger.setAttribute('aria-expanded', open ? 'true' : 'false');
    topbar?.classList.toggle('topbar--menu-open', open);
  };

  const closeMenu = () => setOpen(false);

  topbarBurger.addEventListener('click', (event) => {
    event.preventDefault();
    setOpen(topbarMenu.hidden);
  });

  menuLinks.forEach((link) => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });

  document.addEventListener('click', (event) => {
    if (topbarMenu.hidden) return;
    if (event.target instanceof Node && topbarMenuWrap?.contains(event.target)) return;
    closeMenu();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !topbarMenu.hidden) {
      closeMenu();
    }
  });

  wideViewport.addEventListener('change', (event) => {
    if (event.matches) {
      closeMenu();
    }
  });
}

function initProcessDayAnimation() {
  const section = document.querySelector('.process-day');
  if (!section) return;

  const progressItems = Array.from(section.querySelectorAll('.process-day__progress'));
  if (progressItems.length === 0) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const items = progressItems
    .map((progress) => {
      const fill = progress.querySelector('.process-day__progress-fill');
      const percent = progress.querySelector('.process-day__percent');
      if (!fill || !percent) return null;

      const fillTarget = Number.parseFloat(fill.style.width) || 0;
      const percentTarget = Number.parseInt(percent.textContent ?? '0', 10) || 0;

      return { fill, percent, target: Math.max(fillTarget, percentTarget) };
    })
    .filter(Boolean);

  if (items.length === 0) return;

  const renderFrame = (item, value) => {
    const clamped = Math.max(0, Math.min(item.target, value));
    item.fill.style.width = `${clamped}%`;
    item.percent.textContent = `${Math.round(clamped)}%`;
  };

  if (reduceMotion) {
    items.forEach((item) => renderFrame(item, item.target));
    return;
  }

  items.forEach((item) => renderFrame(item, 0));

  let hasAnimated = false;

  const startAnimation = () => {
    if (hasAnimated) return;
    hasAnimated = true;

    const startedAt = performance.now();
    const duration = 1200;
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const tick = (now) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = easeOutCubic(progress);

      items.forEach((item) => renderFrame(item, item.target * eased));

      if (progress < 1) {
        window.requestAnimationFrame(tick);
      }
    };

    window.requestAnimationFrame(tick);
  };

  if (!('IntersectionObserver' in window)) {
    startAnimation();
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        startAnimation();
        observer.disconnect();
      });
    },
    {
      threshold: 0.35,
      rootMargin: '0px 0px -8% 0px',
    },
  );

  observer.observe(section);
}

function initProcessDayVideoCardFeedback() {
  if (!processDayVideoCard || !processDayVideoToast) return;

  const showToast = () => {
    if (processDayVideoToastTimer !== null) {
      window.clearTimeout(processDayVideoToastTimer);
      processDayVideoToastTimer = null;
    }

    if (processDayVideoToastHideTimer !== null) {
      window.clearTimeout(processDayVideoToastHideTimer);
      processDayVideoToastHideTimer = null;
    }

    processDayVideoCard.classList.remove('process-day__video-card--error');
    void processDayVideoCard.offsetWidth;
    processDayVideoCard.classList.add('process-day__video-card--error');

    processDayVideoToast.hidden = false;
    processDayVideoToast.classList.remove('is-visible');
    void processDayVideoToast.offsetWidth;
    processDayVideoToast.classList.add('is-visible');

    processDayVideoToastTimer = window.setTimeout(() => {
      processDayVideoToast.classList.remove('is-visible');
      processDayVideoCard.classList.remove('process-day__video-card--error');
      processDayVideoToastTimer = null;

      processDayVideoToastHideTimer = window.setTimeout(() => {
        processDayVideoToast.hidden = true;
        processDayVideoToastHideTimer = null;
      }, 240);
    }, 5000);
  };

  processDayVideoCard.addEventListener('click', (event) => {
    event.preventDefault();
    showToast();
  });
}

function extractPhoneDigits(value) {
  const raw = String(value ?? '');
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';

  const hasMaskChars = /[+()\-\s]/.test(raw);
  const shouldDropCountryCode = (hasMaskChars || digits.length > 10) && (digits.startsWith('7') || digits.startsWith('8'));
  const normalized = shouldDropCountryCode ? digits.slice(1) : digits;

  return normalized.slice(0, 10);
}

function formatPhoneValue(value) {
  const digits = extractPhoneDigits(value);
  if (!digits) return '';

  let formatted = '+7 (';
  formatted += digits.slice(0, 3);

  if (digits.length >= 3) {
    formatted += ')';
  }

  if (digits.length > 3) {
    formatted += ' ';
    formatted += digits.slice(3, 6);
  }

  if (digits.length > 6) {
    formatted += '-';
    formatted += digits.slice(6, 8);
  }

  if (digits.length > 8) {
    formatted += '-';
    formatted += digits.slice(8, 10);
  }

  return formatted;
}

function initPhoneMask(input) {
  if (!input) return;

  input.setAttribute('inputmode', 'tel');
  input.setAttribute('autocomplete', 'tel');

  const syncValue = () => {
    const digits = extractPhoneDigits(input.value);
    input.value = digits ? formatPhoneValue(digits) : '';
  };

  input.addEventListener('input', syncValue);
  input.addEventListener('blur', syncValue);

  input.addEventListener('keydown', (event) => {
    if ((event.key !== '7' && event.key !== '8') || input.selectionStart === null) return;

    const isPrefixArea = input.selectionStart <= 2 && input.value.startsWith('+7');
    if (isPrefixArea) {
      event.preventDefault();
    }
  });

  syncValue();
}

function initPhoneMasks() {
  document.querySelectorAll('input[type="tel"]').forEach((input) => {
    if (input.closest('.stroyka-form')) return;
    initPhoneMask(input);
  });
}

function clearAutoAdvanceTimer() {
  if (autoAdvanceTimer !== null) {
    window.clearTimeout(autoAdvanceTimer);
    autoAdvanceTimer = null;
  }
}

function goToNextQuizStep() {
  if (quizState.index < quizSteps.length - 1) {
    quizState.index += 1;
    renderQuiz();
  }
}

function goToQuizStep(index) {
  const nextIndex = Math.max(0, Math.min(quizSteps.length - 1, index));
  clearAutoAdvanceTimer();
  quizState.index = nextIndex;
  renderQuiz();
}

function scheduleAutoAdvance() {
  clearAutoAdvanceTimer();
  autoAdvanceTimer = window.setTimeout(() => {
    autoAdvanceTimer = null;
    goToNextQuizStep();
  }, 300);
}

function renderSteps() {
  if (!stepsRoot) return;

  const stepButtons = stepsRoot.querySelectorAll('.quiz-step');
  stepButtons.forEach((button, index) => {
    const isCurrent = index === quizState.index;
    const isActive = index <= quizState.index;
    const isComplete = index < quizState.index || quizState.answers[index].size > 0;
    button.classList.toggle('quiz-step--active', isActive);
    button.classList.toggle('quiz-step--complete', isComplete);
    button.setAttribute('aria-current', isCurrent ? 'step' : 'false');
  });
}

function renderQuiz() {
  clearAutoAdvanceTimer();

  const step = quizSteps[quizState.index];
  const isFormStep = Boolean(step.formStep);
  const selectedAnswers = quizState.answers[quizState.index];

  renderSteps();

  if (infoNode) {
    infoNode.textContent = `${isFormStep ? 'Шаг' : 'Вопрос'} ${quizState.index + 1} из ${quizSteps.length}`;
  }

  if (titleNode) titleNode.textContent = step.title;
  if (descriptionNode) descriptionNode.textContent = step.description;

  if (optionsNode) {
    optionsNode.classList.toggle('quiz-options--hidden', isFormStep);
    optionsNode.innerHTML = isFormStep
      ? ''
      : step.options
          .map((option, optionIndex) => {
            const optionLabel = typeof option === 'string' ? option : option.label;
            const optionIcon = typeof option === 'string' ? '' : option.icon || '';
            const optionSubtitle = typeof option === 'string' ? '' : option.subtitle || '';
            const isSelected = selectedAnswers.has(optionLabel);
            const stepClass = `${quizState.index + 1}-${optionIndex + 1}`;
            const iconMarkup = optionIcon
              ? `<span class="quiz-option__icon" aria-hidden="true"><img src="${encodeURI(optionIcon)}" alt="" /></span>`
              : '<span class="quiz-option__icon quiz-option__icon--placeholder" aria-hidden="true"></span>';
            const subtitleMarkup = optionSubtitle
              ? `<span class="quiz-option__subtitle">${optionSubtitle}</span>`
              : '<span class="quiz-option__subtitle quiz-option__subtitle--placeholder" aria-hidden="true"></span>';
            return `
              <button class="quiz-option quiz-option--media quiz-option--${stepClass}${isSelected ? ' quiz-option--selected' : ''}" type="button" data-option-index="${optionIndex}" aria-pressed="${isSelected}">
                ${iconMarkup}
                <span class="quiz-option__title">${optionLabel}</span>
                ${subtitleMarkup}
              </button>
            `;
          })
          .join('');
  }

  if (quizCardMain) {
    quizCardMain.classList.toggle('quiz-card__main--final', isFormStep);
  }

  if (finalForm) {
    finalForm.classList.toggle('quiz-final-form--hidden', !isFormStep);
  }

  if (backButton) {
    backButton.disabled = quizState.index === 0;
  }

  if (nextButton) {
    nextButton.innerHTML = isFormStep
      ? 'Отправить заявку <span aria-hidden="true">→</span>'
      : 'Следующий вопрос <span aria-hidden="true">→</span>';
  }
}

function initProjectScroller() {
  if (!projectGrid || !projectViewport) return;

  const cards = Array.from(projectCards);
  if (cards.length === 0) return;

  let activeIndex = 0;
  let dragState = null;
  let suppressProjectClick = false;
  let dragFrame = null;
  let pendingDragOffset = null;
  const edgeResistance = 0.32;

  const clamp = (value) => Math.max(0, Math.min(cards.length - 1, value));

  const getGap = () => {
    const styles = window.getComputedStyle(projectGrid);
    return Number.parseFloat(styles.columnGap || styles.gap || '0') || 0;
  };

  const getStep = () => projectViewport.clientWidth + getGap();

  const syncControls = () => {
    if (projectPrev) projectPrev.disabled = activeIndex === 0;
    if (projectNext) projectNext.disabled = activeIndex === cards.length - 1;
  };

  const syncDots = () => {
    projectDots.forEach((dot, index) => {
      dot.classList.toggle('project-card__pager-dot--active', index === activeIndex);
    });
  };

  const goTo = (index, behavior = 'smooth') => {
    activeIndex = clamp(index);
    const step = getStep();
    projectGrid.style.transition = behavior === 'smooth' ? 'transform 280ms cubic-bezier(0.22, 1, 0.36, 1)' : 'none';
    projectGrid.style.transform = `translate3d(-${activeIndex * step}px, 0, 0)`;
    syncControls();
    syncDots();
  };

  const setDragging = (isDragging) => {
    projectViewport.classList.toggle('projects-shell__viewport--dragging', isDragging);
  };

  const setProjectOffset = (offset) => {
    pendingDragOffset = offset;

    if (dragFrame !== null) return;

    dragFrame = window.requestAnimationFrame(() => {
      dragFrame = null;
      if (pendingDragOffset === null) return;
      projectGrid.style.transform = `translate3d(-${pendingDragOffset}px, 0, 0)`;
      pendingDragOffset = null;
    });
  };

  const cancelPendingDragFrame = () => {
    if (dragFrame !== null) {
      window.cancelAnimationFrame(dragFrame);
      dragFrame = null;
    }
    pendingDragOffset = null;
  };

  const finishDrag = (event) => {
    if (!dragState) return;

    const step = getStep();
    const deltaX = event.clientX - dragState.startX;
    const projectedOffset = dragState.startOffset - deltaX;
    const snappedIndex = clamp(Math.round(projectedOffset / step));
    const movedEnough = Math.abs(deltaX) > Math.min(80, step * 0.14);

    if (dragState.pointerId !== null) {
      try {
        projectViewport.releasePointerCapture(dragState.pointerId);
      } catch {
        // Pointer capture may already be released in some browsers.
      }
    }

    cancelPendingDragFrame();
    setDragging(false);
    suppressProjectClick = dragState.dragging;
    dragState = null;

    if (movedEnough) {
      goTo(snappedIndex);
      return;
    }

    goTo(activeIndex);
  };

  projectViewport.addEventListener('pointerdown', (event) => {
    if (event.button !== 0 || event.isPrimary === false) return;
    if (event.target instanceof Element) {
      const interactive = event.target.closest(
        'button, a, input, textarea, select, label, [data-project-contact-open], [data-project-preview-open], [data-project-result-shot], [data-project-result-image-open]',
      );
      if (interactive) return;
    }

    dragState = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startOffset: activeIndex * getStep(),
      dragging: false,
      axis: null,
    };
  });

  projectViewport.addEventListener('pointermove', (event) => {
    if (!dragState || dragState.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - dragState.startX;
    const deltaY = event.clientY - dragState.startY;

    if (!dragState.axis && Math.max(Math.abs(deltaX), Math.abs(deltaY)) > 5) {
      dragState.axis = Math.abs(deltaX) > Math.abs(deltaY) ? 'x' : 'y';

      if (dragState.axis === 'y') {
        dragState = null;
        return;
      }
    }

    if (dragState.axis !== 'x') {
      return;
    }

    if (!dragState.dragging) {
      dragState.dragging = true;
      projectGrid.style.transition = 'none';
      setDragging(true);
      projectViewport.setPointerCapture(event.pointerId);
    }

    if (event.cancelable) event.preventDefault();

    const minOffset = 0;
    const maxOffset = (cards.length - 1) * getStep();
    const rawOffset = dragState.startOffset - deltaX;
    let nextOffset = rawOffset;

    if (rawOffset < minOffset) {
      nextOffset = minOffset + (rawOffset - minOffset) * edgeResistance;
    } else if (rawOffset > maxOffset) {
      nextOffset = maxOffset + (rawOffset - maxOffset) * edgeResistance;
    }

    setProjectOffset(nextOffset);
  });

  projectViewport.addEventListener('pointerup', (event) => {
    if (!dragState || dragState.pointerId !== event.pointerId) return;
    finishDrag(event);
  });

  projectViewport.addEventListener('pointercancel', (event) => {
    if (!dragState || dragState.pointerId !== event.pointerId) return;

    if (dragState.pointerId !== null) {
      try {
        projectViewport.releasePointerCapture(dragState.pointerId);
      } catch {
        // Ignore release failures during cancel.
      }
    }

    setDragging(false);
    cancelPendingDragFrame();
    suppressProjectClick = dragState.dragging;
    dragState = null;
    goTo(activeIndex);
  });

  projectViewport.addEventListener(
    'click',
    (event) => {
      if (!suppressProjectClick) return;
      event.preventDefault();
      event.stopPropagation();
      suppressProjectClick = false;
    },
    true,
  );

  projectPrev?.addEventListener('click', () => goTo(activeIndex - 1));
  projectNext?.addEventListener('click', () => goTo(activeIndex + 1));

  projectDots.forEach((dot, index) => {
    dot.addEventListener('click', () => goTo(index));
  });

  window.addEventListener('resize', () => {
    goTo(activeIndex, 'auto');
  }, { passive: true });

  syncControls();
  syncDots();
  goTo(0, 'auto');
}

function initProjectResultModal() {
  if (!projectResultModal) return;
  const modalImage = projectResultModal.querySelector('.project-result-modal__image img');
  const modalCaption = projectResultModal.querySelector('.project-result-modal__caption');

  const openModal = () => {
    if (typeof projectResultModal.showModal === 'function') {
      projectResultModal.showModal();
      return;
    }
    projectResultModal.setAttribute('open', '');
  };

  const closeModal = () => {
    if (typeof projectResultModal.close === 'function' && projectResultModal.open) {
      projectResultModal.close();
      return;
    }
    projectResultModal.removeAttribute('open');
  };

  projectResultShots.forEach((shot) => {
    shot.addEventListener('click', () => {
      const projectCard = shot.closest('.project-card');
      const image = projectCard?.querySelector('.project-card__result-shot-image');
      const caption = shot.querySelector('.project-card__result-shot-caption');
      const title = projectCard?.querySelector('.project-card__body h3')?.textContent?.trim() || 'этого кейса';

      if (modalImage && image) {
        modalImage.src = image.getAttribute('src') || modalImage.getAttribute('src') || '/assets/media/stats-repair-178-conversions.jpg';
        modalImage.alt = `Скрин статистики кейса: ${title}`;
      }

      if (modalCaption && caption) {
        modalCaption.innerHTML = caption.innerHTML;
      }

      openModal();
    });
  });

  projectResultClose?.addEventListener('click', closeModal);

  projectResultModal.addEventListener('click', (event) => {
    if (event.target === projectResultModal) {
      closeModal();
    }
  });
}

function initProjectResultImageModal() {
  if (!projectResultImageModal || !projectResultImageOpeners.length) return;
  const modalImage = projectResultImageModal.querySelector('img');

  const openModal = (src, alt) => {
    if (modalImage) {
      modalImage.src = src || modalImage.getAttribute('src') || '/assets/media/stats-repair-178-conversions.jpg';
      modalImage.alt = alt || 'Скрин статистики кейса';
    }

    projectResultImageModal.hidden = false;
    projectResultImageModal.classList.remove('project-result-image-modal--visible');
    window.requestAnimationFrame(() => {
      projectResultImageModal.classList.add('project-result-image-modal--visible');
    });
  };

  const closeModal = () => {
    projectResultImageModal.classList.remove('project-result-image-modal--visible');
    projectResultImageModal.hidden = true;
  };

  projectResultImageOpeners.forEach((opener) => {
    opener.addEventListener('click', () => {
      const projectCard = opener.closest('.project-card');
      const image = projectCard?.querySelector('.project-card__result-shot-image');
      const src = image?.getAttribute('src') || '/assets/media/stats-repair-178-conversions.jpg';
      const title = projectCard?.querySelector('.project-card__body h3')?.textContent?.trim() || 'этого кейса';
      openModal(src, `Скрин статистики кейса: ${title}`);
    });
  });

  projectResultImageClose?.addEventListener('click', closeModal);

  projectResultImageModal.addEventListener('click', (event) => {
    if (event.target === projectResultImageModal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !projectResultImageModal.hidden) {
      closeModal();
    }
  });
}

function initProjectPreviewModal() {
  if (!projectPreviewModal || !projectPreviewOpeners.length) return;
  const previewImage = projectPreviewModal.querySelector('.project-preview-modal__image img');

  const openModal = (src, alt) => {
    if (previewImage) {
      previewImage.src = src || previewImage.getAttribute('src') || '/assets/media/document-preview.png';
      previewImage.alt = alt || 'Картинка кейса';
    }

    projectPreviewModal.hidden = false;
    projectPreviewModal.classList.remove('project-preview-modal--visible');
    window.requestAnimationFrame(() => {
      projectPreviewModal.classList.add('project-preview-modal--visible');
    });
  };

  const closeModal = () => {
    projectPreviewModal.classList.remove('project-preview-modal--visible');
    projectPreviewModal.hidden = true;
  };

  projectPreviewOpeners.forEach((opener) => {
    opener.addEventListener('click', () => {
      const projectCard = opener.closest('.project-card');
      const image = projectCard?.querySelector('.project-card__media img, .project-card__result-shot-image');
      const src = image?.getAttribute('data-project-preview-src') || image?.getAttribute('src') || '/assets/media/document-preview.png';
      const title = projectCard?.querySelector('.project-card__body h3')?.textContent?.trim() || 'Картинка кейса';
      openModal(src, `Картинка кейса: ${title}`);
    });
  });
  projectPreviewClose?.addEventListener('click', closeModal);

  projectPreviewModal.addEventListener('click', (event) => {
    if (event.target === projectPreviewModal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !projectPreviewModal.hidden) {
      closeModal();
    }
  });
}

function initProjectContactModal() {
  if (!projectContactModal || (!projectContactOpeners.length && !projectContactGenericOpeners.length)) return;

  const openModal = ({ title, projectTitle, showPreview, highlightProjectTitle = false }) => {
    if (projectContactPreviewWrap) {
      projectContactPreviewWrap.hidden = !showPreview;
    }

    if (projectContactPreview && showPreview) {
      const previewImage = currentProjectCard?.querySelector('.project-card__media img, .project-card__result-shot-image');
      const previewSrc = previewImage?.getAttribute('src') || '/assets/media/document-preview.png';
      const previewAlt = projectTitle ? `Превью кейса: ${projectTitle}` : 'Превью кейса';
      projectContactPreview.src = previewSrc;
      projectContactPreview.alt = previewAlt;
    }

    if (projectContactTitle) {
      projectContactTitle.textContent = '';
      if (highlightProjectTitle && projectTitle) {
        projectContactTitle.append(
          document.createTextNode(title),
          Object.assign(document.createElement('span'), {
            className: 'project-contact-modal__title-accent',
            textContent: projectTitle,
          }),
        );
      } else {
        projectContactTitle.textContent = title;
      }
    }

    projectContactModal.hidden = false;
    projectContactModal.classList.remove('project-contact-modal--visible');
    window.requestAnimationFrame(() => {
      projectContactModal.classList.add('project-contact-modal--visible');
    });

    const firstInput = projectContactForm?.querySelector('input[name="name"]');
    window.setTimeout(() => firstInput?.focus(), 0);
  };

  const closeModal = () => {
    projectContactModal.classList.remove('project-contact-modal--visible');
    projectContactModal.hidden = true;
  };

  const openFromOpener = (opener) => {
    currentProjectCard = opener.closest('.project-card');
    const projectTitle = currentProjectCard?.querySelector('.project-card__body h3')?.textContent?.trim() || 'этого кейса';
    openModal({
      title: 'Давайте обсудим быстрое создание такого же сайта как ',
      projectTitle,
      showPreview: true,
      highlightProjectTitle: true,
    });
  };

  const openGeneric = (opener) => {
    currentProjectCard = null;
    openModal({
      title: opener.getAttribute('data-project-contact-generic-title') || 'Давайте обсудим Ваш проект',
      projectTitle: null,
      showPreview: false,
    });
  };

  projectContactClose?.addEventListener('click', closeModal);

  projectContactModal.addEventListener('click', (event) => {
    if (event.target === projectContactModal) {
      closeModal();
    }
  });

  projectContactForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    event.stopPropagation();
    closeModal();
  });

  document.addEventListener(
    'click',
    (event) => {
      const genericOpener = event.target instanceof Element ? event.target.closest('[data-project-contact-generic]') : null;
      if (genericOpener) {
        openGeneric(genericOpener);
        return;
      }

      const opener = event.target instanceof Element ? event.target.closest('[data-project-contact-open]') : null;
      if (!opener) return;

      openFromOpener(opener);
    },
    true,
  );

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !projectContactModal.hidden) {
      closeModal();
    }
  });
}

function initBioCertificateModal() {
  if (!bioCertificateModal || !bioCertificateOpeners.length) return;

  const openModal = () => {
    bioCertificateModal.hidden = false;
    bioCertificateModal.classList.remove('bio-certificate-modal--visible');
    window.requestAnimationFrame(() => {
      bioCertificateModal.classList.add('bio-certificate-modal--visible');
    });
  };

  const closeModal = () => {
    bioCertificateModal.classList.remove('bio-certificate-modal--visible');
    bioCertificateModal.hidden = true;
  };

  bioCertificateOpeners.forEach((opener) => {
    opener.addEventListener('click', (event) => {
      event.preventDefault();
      openModal();
    });
  });

  bioCertificateClose?.addEventListener('click', closeModal);

  bioCertificateModal.addEventListener('click', (event) => {
    if (event.target === bioCertificateModal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !bioCertificateModal.hidden) {
      closeModal();
    }
  });
}

function initConsultWidget() {
  if (!consultWidget || !consultWidgetForm || !consultWidgetInput) return;

  const methodIcons = {
    max: '<img class="consult-widget__method-trigger-icon-image consult-widget__method-trigger-icon-image--max" src="/assets/media/max.svg" alt="" />',
    telegram: '<img class="consult-widget__method-trigger-icon-image consult-widget__method-trigger-icon-image--telegram" src="/assets/media/telegram.svg" alt="" />',
    phone: '<img class="consult-widget__method-trigger-icon-image consult-widget__method-trigger-icon-image--phone" src="/assets/media/phone.svg" alt="" />',
  };
  const methodTriggerIconClasses = {
    max: 'consult-widget__method-trigger-icon consult-widget__method-trigger-icon--max',
    telegram: 'consult-widget__method-trigger-icon consult-widget__method-trigger-icon--telegram',
    phone: 'consult-widget__method-trigger-icon consult-widget__method-trigger-icon--phone',
  };

  const closeMethodMenu = () => {
    if (!consultWidgetMethodMenu || !consultWidgetMethodTrigger) return;
    consultWidgetMethodMenu.hidden = true;
    consultWidgetMethodTrigger.setAttribute('aria-expanded', 'false');
  };

  const openMethodMenu = () => {
    if (!consultWidgetMethodMenu || !consultWidgetMethodTrigger) return;
    consultWidgetMethodMenu.hidden = false;
    consultWidgetMethodTrigger.setAttribute('aria-expanded', 'true');
  };

  const setMethod = (method) => {
    const nextMethod = methodIcons[method] ? method : 'max';
    if (consultWidgetMethodValue) {
      consultWidgetMethodValue.value = nextMethod;
    }
    if (consultWidgetMethod) {
      consultWidgetMethod.dataset.method = nextMethod;
    }
    if (consultWidgetMethodIcon) {
      consultWidgetMethodIcon.className = methodTriggerIconClasses[nextMethod] || methodTriggerIconClasses.max;
      consultWidgetMethodIcon.innerHTML = methodIcons[nextMethod];
    }
    if (consultWidgetMethodTrigger) {
      const label = nextMethod === 'max' ? 'MAX' : nextMethod === 'telegram' ? 'Telegram' : 'Phone';
      consultWidgetMethodTrigger.setAttribute('aria-label', `Способ связи: ${label}`);
    }
    consultWidgetMethodChoices.forEach((choice) => {
      choice.setAttribute('aria-selected', choice.dataset.method === nextMethod ? 'true' : 'false');
    });
  };

  const showSuccessState = () => {
    consultWidget.classList.add('consult-widget--success');
    if (consultWidgetPhotoButton) {
      consultWidgetPhotoButton.hidden = true;
    }
    if (consultWidgetBodyButton) {
      consultWidgetBodyButton.hidden = true;
    }
    if (consultWidgetForm) {
      consultWidgetForm.hidden = true;
    }
    if (consultWidgetSuccess) {
      consultWidgetSuccess.hidden = false;
    }
  };

  setMethod(consultWidgetMethodValue?.value || 'phone');

  const setOpen = (open) => {
    consultWidget.classList.toggle('consult-widget--open', open);
    if (open) {
      consultWidget.classList.remove('consult-widget--animating');
      window.requestAnimationFrame(() => {
        consultWidget.classList.add('consult-widget--animating');
      });
    } else {
      consultWidget.classList.remove('consult-widget--animating');
    }
    consultWidgetOpeners.forEach((button) => {
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    if (!open) {
      closeMethodMenu();
    }
    if (open && !consultWidget.classList.contains('consult-widget--success')) {
      window.setTimeout(() => consultWidgetInput.focus(), 0);
    }
  };

  consultWidgetOpeners.forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      setOpen(true);
    });
  });

  consultWidgetCloser?.addEventListener('click', (event) => {
    event.preventDefault();
    setOpen(false);
  });

  consultWidgetMethodTrigger?.addEventListener('click', (event) => {
    event.preventDefault();
    if (!consultWidgetMethodMenu) return;
    if (consultWidgetMethodMenu.hidden) {
      openMethodMenu();
    } else {
      closeMethodMenu();
    }
  });

  consultWidgetMethodChoices.forEach((choice) => {
    choice.addEventListener('click', () => {
      const method = choice.dataset.method || 'max';
      setMethod(method);
      closeMethodMenu();
    });
  });

  document.addEventListener('click', (event) => {
    if (!consultWidgetMethod || !consultWidgetMethodMenu || consultWidgetMethodMenu.hidden) return;
    if (event.target instanceof Node && consultWidgetMethod.contains(event.target)) return;
    closeMethodMenu();
  });

  consultWidgetSubmit?.addEventListener('click', () => {
    showSuccessState();
  });

  consultWidgetForm.addEventListener('submit', (event) => {
    event.preventDefault();
    event.stopPropagation();
    showSuccessState();
  });

  document.addEventListener('click', (event) => {
    if (!consultWidget.classList.contains('consult-widget--open')) return;
    if (event.target instanceof Node && consultWidget.contains(event.target)) return;
    setOpen(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && consultWidget.classList.contains('consult-widget--open')) {
      setOpen(false);
    }
  });
}

function initCaseSliders() {
  if (!caseSliders.length) return;

  const lightboxMedia = stroykaLightbox?.querySelector('[data-stroyka-lightbox-media]');
  const lightboxPrev = stroykaLightbox?.querySelector('[data-stroyka-lightbox-prev]');
  const lightboxNext = stroykaLightbox?.querySelector('[data-stroyka-lightbox-next]');
  const lightboxCloseButtons = Array.from(stroykaLightbox?.querySelectorAll('[data-stroyka-lightbox-close]') || []);
  let activeLightboxItems = [];
  let activeLightboxIndex = 0;
  let lightboxLastFocus = null;

  const renderLightbox = () => {
    if (!(lightboxMedia instanceof HTMLElement) || !activeLightboxItems.length) return;
    const item = activeLightboxItems[activeLightboxIndex];
    lightboxMedia.style.backgroundImage = `url("${item.src}")`;
    lightboxMedia.setAttribute('aria-label', item.alt || 'Просмотр изображения');

    if (lightboxPrev instanceof HTMLButtonElement) {
      lightboxPrev.hidden = activeLightboxItems.length < 2;
    }

    if (lightboxNext instanceof HTMLButtonElement) {
      lightboxNext.hidden = activeLightboxItems.length < 2;
    }
  };

  const closeLightbox = () => {
    if (!(stroykaLightbox instanceof HTMLElement)) return;
    stroykaLightbox.classList.remove('is-open');
    document.body.classList.remove('is-modal-open');
    window.setTimeout(() => {
      stroykaLightbox.hidden = true;
    }, 220);
    if (lightboxLastFocus instanceof HTMLElement) {
      lightboxLastFocus.focus({ preventScroll: true });
    }
  };

  const openLightbox = (items, index = 0) => {
    if (!(stroykaLightbox instanceof HTMLElement) || !items.length) return;
    activeLightboxItems = items;
    activeLightboxIndex = Math.max(0, Math.min(index, items.length - 1));
    lightboxLastFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    renderLightbox();
    stroykaLightbox.hidden = false;
    requestAnimationFrame(() => {
      stroykaLightbox.classList.add('is-open');
      document.body.classList.add('is-modal-open');
      const firstClose = lightboxCloseButtons[0];
      if (firstClose instanceof HTMLButtonElement) {
        firstClose.focus({ preventScroll: true });
      }
    });
  };

  const stepLightbox = (direction) => {
    if (!activeLightboxItems.length) return;
    activeLightboxIndex = ((activeLightboxIndex + direction) % activeLightboxItems.length + activeLightboxItems.length) % activeLightboxItems.length;
    renderLightbox();
  };

  lightboxPrev?.addEventListener('click', () => stepLightbox(-1));
  lightboxNext?.addEventListener('click', () => stepLightbox(1));
  lightboxCloseButtons.forEach((button) => {
    button.addEventListener('click', closeLightbox);
  });

  document.addEventListener('keydown', (event) => {
    if (!(stroykaLightbox instanceof HTMLElement) || stroykaLightbox.hidden) return;
    if (event.key === 'Escape') {
      closeLightbox();
    } else if (event.key === 'ArrowLeft') {
      stepLightbox(-1);
    } else if (event.key === 'ArrowRight') {
      stepLightbox(1);
    }
  });

  caseSliders.forEach((slider) => {
    const track = slider.querySelector('[data-case-slider-track]');
    const slides = Array.from(slider.querySelectorAll('.stroyka-case-slider__slide'));
    const dots = Array.from(slider.querySelectorAll('[data-case-slider-dot]'));
    const prevButton = slider.querySelector('[data-case-slider-nav="prev"]');
    const nextButton = slider.querySelector('[data-case-slider-nav="next"]');

    if (!(track instanceof HTMLElement) || slides.length === 0) return;

    let currentIndex = 0;

    const updateSlider = (index) => {
      currentIndex = ((index % slides.length) + slides.length) % slides.length;
      track.style.transform = `translateX(-${currentIndex * 100}%)`;

      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle('is-active', dotIndex === currentIndex);
        dot.setAttribute('aria-current', dotIndex === currentIndex ? 'true' : 'false');
      });
    };

    prevButton?.addEventListener('click', (event) => {
      event.preventDefault();
      updateSlider(currentIndex - 1);
    });

    nextButton?.addEventListener('click', (event) => {
      event.preventDefault();
      updateSlider(currentIndex + 1);
    });

    dots.forEach((dot, dotIndex) => {
      dot.addEventListener('click', (event) => {
        event.preventDefault();
        updateSlider(dotIndex);
      });
    });

    slides.forEach((slide, slideIndex) => {
      slide.addEventListener('click', () => {
        const items = slides
          .map((item) => {
            const image = item.querySelector('img');
            if (!(image instanceof HTMLImageElement)) return null;
            return {
              src: image.currentSrc || image.src,
              alt: image.alt,
            };
          })
          .filter(Boolean);

        openLightbox(items, slideIndex);
      });
    });

    updateSlider(0);
  });

  document.querySelectorAll('.stroyka-case__copy').forEach((copy) => {
    const items = Array.from(copy.querySelectorAll('p'));
    if (items.length <= 3) return;

    const thirdItem = items[2];
    if (!(thirdItem instanceof HTMLElement)) return;

    const previewHeight = thirdItem.offsetTop + thirdItem.offsetHeight;
    copy.style.setProperty('--stroyka-case-preview-height', `${previewHeight}px`);
    copy.classList.add('is-collapsed');

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'stroyka-case__toggle';
    toggle.textContent = 'Развернуть';
    toggle.setAttribute('aria-expanded', 'false');

    toggle.addEventListener('click', () => {
      const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!isExpanded));
      toggle.textContent = isExpanded ? 'Развернуть' : 'Свернуть';
      copy.classList.toggle('is-collapsed', isExpanded);
    });

    copy.insertAdjacentElement('afterend', toggle);
  });
}

optionsNode?.addEventListener('click', (event) => {
  if (!(event.target instanceof Element)) return;
  const optionButton = event.target.closest('.quiz-option');
  if (!optionButton) return;

  const step = quizSteps[quizState.index];
  const optionIndex = Number(optionButton.dataset.optionIndex);
  const option = step.options[optionIndex];
  const optionLabel = typeof option === 'string' ? option : option.label;
  const selected = quizState.answers[quizState.index];

  if (step.multiple) {
    if (selected.has(optionLabel)) {
      selected.delete(optionLabel);
      optionButton.classList.remove('quiz-option--selected');
      optionButton.setAttribute('aria-pressed', 'false');
    } else {
      selected.add(optionLabel);
      optionButton.classList.add('quiz-option--selected');
      optionButton.setAttribute('aria-pressed', 'true');
    }
    return;
  }

  selected.clear();
  selected.add(optionLabel);
  renderQuiz();
  scheduleAutoAdvance();
});

stepsRoot?.querySelectorAll('.quiz-step').forEach((stepButton) => {
  stepButton.addEventListener('click', () => {
    const index = Number(stepButton.dataset.stepIndex);
    if (Number.isNaN(index)) return;
    goToQuizStep(index);
  });
});

backButton?.addEventListener('click', () => {
  if (quizState.index === 0) return;
  goToQuizStep(quizState.index - 1);
});

nextButton?.addEventListener('click', () => {
  const currentStep = quizSteps[quizState.index];
  if (currentStep?.formStep) {
    finalForm?.requestSubmit();
    return;
  }

  goToNextQuizStep();
});

renderQuiz();
initCompactHeader();
initTopbarMenu();
initProcessDayAnimation();
initProcessDayVideoCardFeedback();
initPhoneMasks();
initProjectScroller();
initProjectResultModal();
initProjectResultImageModal();
initProjectPreviewModal();
initProjectContactModal();
initBioCertificateModal();
initConsultWidget();
initCaseSliders();

const faqItems = Array.from(document.querySelectorAll('.faq-item'));
const faqCloseTimers = new WeakMap();
const faqList = document.querySelector('.faq-list');

function syncFaqHeight() {
  if (!faqList) return;

  const items = Array.from(faqList.querySelectorAll('.faq-item'));
  if (items.length === 0) return;

  const gap = 12;
  let totalHeight = 0;

  items.forEach((item, index) => {
    const summary = item.querySelector('summary');
    const body = item.querySelector('.faq-item__body');

    if (!summary || !body) return;

    totalHeight += summary.offsetHeight;
    if (item.classList.contains('is-open') || item.classList.contains('is-closing')) {
      totalHeight += body.scrollHeight;
    }

    if (index < items.length - 1) {
      totalHeight += gap;
    }
  });

  faqList.style.setProperty('--faq-list-height', `${Math.ceil(totalHeight)}px`);
}

function closeFaqItem(item) {
  const state = item.dataset.faqState;
  if (state === 'closing' || !item.open) return;

  const existingTimer = faqCloseTimers.get(item);
  if (existingTimer) {
    window.clearTimeout(existingTimer);
  }

  item.dataset.faqState = 'closing';
  item.classList.remove('is-open');
  item.classList.add('is-closing');

  const timer = window.setTimeout(() => {
    item.open = false;
    item.classList.remove('is-closing');
    delete item.dataset.faqState;
    faqCloseTimers.delete(item);
    syncFaqHeight();
  }, 280);

  faqCloseTimers.set(item, timer);
}

function openFaqItem(item) {
  if (item.open && item.classList.contains('is-open')) return;

  const existingTimer = faqCloseTimers.get(item);
  if (existingTimer) {
    window.clearTimeout(existingTimer);
    faqCloseTimers.delete(item);
  }

  faqItems.forEach((otherItem) => {
    if (otherItem !== item) closeFaqItem(otherItem);
  });

  if (!item.open) item.open = true;
  item.classList.remove('is-closing');
  delete item.dataset.faqState;
  requestAnimationFrame(() => {
    item.classList.add('is-open');
    syncFaqHeight();
  });
}

faqItems.forEach((item) => {
  const summary = item.querySelector('summary');
  summary?.addEventListener('click', (event) => {
    event.preventDefault();
    if (item.open && item.classList.contains('is-open')) {
      closeFaqItem(item);
      return;
    }

    openFaqItem(item);
  });
});

window.addEventListener('load', syncFaqHeight);
window.addEventListener('resize', syncFaqHeight);
requestAnimationFrame(syncFaqHeight);

document.addEventListener('submit', (event) => {
  if (!(event.target instanceof HTMLFormElement)) return;
  event.preventDefault();
  alert('Заявка не подключена. Добавьте отправку в Telegram, WhatsApp или на почту.');
});
