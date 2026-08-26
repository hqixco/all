const menuBtn = document.querySelector(".header__menu-btn");
const nav = document.querySelector(".nav");
const fadeInItems = document.querySelectorAll(".fade-in");
const yearNodes = document.querySelectorAll("[data-year]");
const accordionItems = document.querySelectorAll(".faq__item");
const quizSteps = document.querySelector("[data-quiz-steps]");
const quizInfo = document.querySelector("[data-quiz-info]");
const quizTitle = document.querySelector("[data-quiz-title]");
const quizDescription = document.querySelector("[data-quiz-description]");
const quizOptions = document.querySelector("[data-quiz-options]");
const quizFinalForm = document.querySelector("[data-quiz-final-form]");
const quizBackButton = document.querySelector("[data-quiz-back]");
const quizNextButton = document.querySelector("[data-quiz-next]");
const contactForm = document.querySelector(".contact__form");
const projectCards = document.querySelectorAll(".project-card");
const projectGrid = document.querySelector("[data-project-grid]");
const projectPrevButton = document.querySelector("[data-project-prev]");
const projectNextButton = document.querySelector("[data-project-next]");
const projectPagerDots = document.querySelectorAll("[data-project-pager-dot]");
const projectLightbox = document.querySelector("[data-case-lightbox]");

const extractBackgroundImageUrl = (element) => {
  const rawValue = element.style.backgroundImage || window.getComputedStyle(element).backgroundImage || "";
  const match = rawValue.match(/url\(["']?(.*?)["']?\)/);
  return match ? match[1] : "";
};

const projectLightboxState = {
  items: [],
  index: 0,
  lastFocus: null,
  closeTimer: null,
};

const projectLightboxElements = projectLightbox instanceof HTMLElement
  ? {
      image: projectLightbox.querySelector("[data-case-lightbox-image]"),
      prev: projectLightbox.querySelector("[data-case-lightbox-prev]"),
      next: projectLightbox.querySelector("[data-case-lightbox-next]"),
      thumbs: projectLightbox.querySelector("[data-case-lightbox-thumbs]"),
      closeButtons: Array.from(projectLightbox.querySelectorAll("[data-case-lightbox-close]")),
  }
  : null;

const themeAssetBase = window.ISART_ASSET_BASE || "";
const normalizeAssetPath = (path) => {
  if (typeof path !== "string" || path === "") {
    return path;
  }

  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("/")) {
    return path;
  }

  return `${themeAssetBase}${path.replace(/^\.\//, "")}`;
};

const updateProjectLightbox = () => {
  if (!(projectLightbox instanceof HTMLElement) || !projectLightboxElements?.image) {
    return;
  }

  const item = projectLightboxState.items[projectLightboxState.index];
  if (!item) {
    return;
  }

  projectLightboxElements.image.src = item.src;
  projectLightboxElements.image.alt = item.alt || "";

  if (projectLightboxElements.thumbs instanceof HTMLElement) {
    projectLightboxElements.thumbs.innerHTML = "";

    projectLightboxState.items.forEach((thumbItem, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `case-lightbox__thumb${index === projectLightboxState.index ? " is-active" : ""}`;
      button.setAttribute("aria-label", `Изображение ${index + 1}`);

      const image = document.createElement("img");
      image.src = thumbItem.src;
      image.alt = thumbItem.alt || "";
      image.loading = "lazy";
      image.decoding = "async";
      button.appendChild(image);

      button.addEventListener("click", () => {
        projectLightboxState.index = index;
        updateProjectLightbox();
      });

      projectLightboxElements.thumbs.appendChild(button);
    });
  }

  if (projectLightboxElements.prev instanceof HTMLButtonElement) {
    projectLightboxElements.prev.hidden = projectLightboxState.items.length < 2;
  }

  if (projectLightboxElements.next instanceof HTMLButtonElement) {
    projectLightboxElements.next.hidden = projectLightboxState.items.length < 2;
  }
};

const openProjectLightbox = (items, startIndex = 0) => {
  if (!(projectLightbox instanceof HTMLElement) || !projectLightboxElements?.image) {
    return;
  }

  const nextItems = Array.isArray(items) ? items.filter((item) => item && item.src) : [];
  if (!nextItems.length) {
    return;
  }

  projectLightboxState.items = nextItems;
  projectLightboxState.index = Math.max(0, Math.min(startIndex, nextItems.length - 1));
  projectLightboxState.lastFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;

  if (projectLightboxState.closeTimer) {
    window.clearTimeout(projectLightboxState.closeTimer);
    projectLightboxState.closeTimer = null;
  }

  updateProjectLightbox();

  projectLightbox.hidden = false;
  window.requestAnimationFrame(() => {
    projectLightbox.classList.add("is-open");
    document.body.classList.add("is-modal-open");
    projectLightboxElements?.closeButtons[0]?.focus();
  });
};

const closeProjectLightbox = () => {
  if (!(projectLightbox instanceof HTMLElement)) {
    return;
  }

  projectLightbox.classList.remove("is-open");
  document.body.classList.remove("is-modal-open");

  if (projectLightboxState.closeTimer) {
    window.clearTimeout(projectLightboxState.closeTimer);
  }

  projectLightboxState.closeTimer = window.setTimeout(() => {
    projectLightbox.hidden = true;
    projectLightboxState.closeTimer = null;
  }, 220);

  if (projectLightboxState.lastFocus instanceof HTMLElement) {
    window.setTimeout(() => {
      projectLightboxState.lastFocus?.focus();
    }, 0);
  }
};

const setProjectLightboxIndex = (index) => {
  const total = projectLightboxState.items.length;
  if (!total) {
    return;
  }

  projectLightboxState.index = (index + total) % total;
  updateProjectLightbox();
};

projectLightboxElements?.prev?.addEventListener("click", () => {
  setProjectLightboxIndex(projectLightboxState.index - 1);
});

projectLightboxElements?.next?.addEventListener("click", () => {
  setProjectLightboxIndex(projectLightboxState.index + 1);
});

projectLightboxElements?.closeButtons.forEach((button) => {
  button.addEventListener("click", closeProjectLightbox);
});

document.addEventListener("keydown", (event) => {
  if (!(projectLightbox instanceof HTMLElement) || projectLightbox.hidden) {
    return;
  }

  if (event.key === "Escape") {
    closeProjectLightbox();
    return;
  }

  if (event.key === "ArrowLeft") {
    event.preventDefault();
    setProjectLightboxIndex(projectLightboxState.index - 1);
    return;
  }

  if (event.key === "ArrowRight") {
    event.preventDefault();
    setProjectLightboxIndex(projectLightboxState.index + 1);
  }
});

const quizQuestions = [
  {
    title: "Какой сайт вам нужен?",
    description: "Выберите один вариант. Это поможет нам понять тип проекта и предложить подходящую структуру.",
    multiple: false,
    optionImages: [
      "./img/quiz-landing.png",
      "./img/quiz-corporate.png",
      "./img/quiz-catalog.png",
      "./img/quiz-internet-store.png",
      "./img/quiz-personal-account.png",
      "./img/quiz-consultation.png",
    ],
    options: [
      "Лендинг для одной услуги или продукта",
      "Корпоративный сайт компании",
      "Сайт-каталог",
      "Интернет-магазин",
      "Веб-сервис / личный кабинет",
      "Не знаю, нужна консультация",
    ],
  },
  {
    title: "На каком этапе сейчас проект?",
    description: "Выберите вариант, который лучше всего описывает текущую готовность проекта.",
    multiple: false,
    optionImages: [
      "./img/quiz-idea.png",
      "./img/quiz-structure.jpg",
      "./img/quiz-specs.png",
      "./img/quiz-design-mockup.png",
      "./img/quiz-redesign.png",
      "./img/quiz-from-scratch.png",
    ],
    options: [
      "Есть только идея",
      "Есть примерное понимание структуры",
      "Есть готовое техническое задание",
      "Есть дизайн-макет",
      "Уже есть сайт, нужно переделать",
      "Нужна разработка полностью с нуля",
    ],
  },
  {
    title: "Что должно быть на сайте?",
    description: "Можно выбрать несколько вариантов, если на сайте будет несколько ключевых разделов.",
    multiple: true,
    optionImages: [
      "./img/page-home.png",
      "./img/page-services.png",
      "./img/page-portfolio.png",
      "./img/page-catalog.png",
      "./img/page-blog.png",
      "./img/page-account.png",
      "./img/page-forms.png",
      "./img/page-quiz.png",
      "./img/page-payment.png",
      "./img/page-other.png",
    ],
    options: [
      "Главная страница",
      "Страницы услуг",
      "Портфолио / кейсы",
      "Каталог товаров или услуг",
      "Блог / статьи",
      "Личный кабинет",
      "Формы заявок",
      "Квиз",
      "Онлайн-оплата",
      "Другое",
    ],
  },
  {
    title: "Нужны ли интеграции с внешними сервисами?",
    description: "Можно выбрать несколько интеграций, если они должны работать одновременно.",
    multiple: true,
    optionImages: [
      "./img/integration-crm.jpg",
      "./img/integration-messages.png",
      "./img/integration-payment.png",
      "./img/integration-warehouse.png",
      "./img/integration-email.png",
      "./img/integration-analytics.png",
      "./img/integration-api.png",
      "./img/integration-unknown.png",
    ],
    options: [
      "CRM",
      "Telegram / WhatsApp-уведомления",
      "Онлайн-оплата",
      "Склад / учётная система",
      "Email-рассылки",
      "Аналитика и цели",
      "API других сервисов",
      "Пока не знаю",
    ],
  },
  {
    title: "Есть ли у вас готовые материалы для сайта?",
    description: "Можно выбрать все подходящие материалы и исходники, которые уже есть в наличии.",
    multiple: true,
    optionImages: [
      "./img/material-texts.png",
      "./img/material-photo-video.png",
      "./img/material-branding.png",
      "./img/material-structure.jpg",
      "./img/material-examples.png",
      "./img/material-start-from-scratch.png",
    ],
    options: [
      "Есть тексты",
      "Есть фото / видео",
      "Есть логотип и фирменный стиль",
      "Есть структура сайта",
      "Есть примеры сайтов, которые нравятся",
      "Ничего нет, нужна помощь с нуля",
    ],
  },
  {
    title: "Какой уровень дизайна вам нужен?",
    description: "Выберите стиль, который ближе к ожиданиям по визуалу и подаче.",
    multiple: false,
    optionImages: [
      "./img/design-minimal.png",
      "./img/design-corporate.png",
      "./img/design-premium.png",
      "./img/design-creative.png",
      "./img/design-animated.png",
      "./img/design-consultation.png",
      null,
    ],
    options: [
      "Минимальный и аккуратный",
      "Современный корпоративный",
      "Премиальный и дорогой",
      "Яркий креативный",
      "Сложный дизайн с анимациями",
      "Нужна консультация по стилю",
    ],
  },
  {
    title: "В какие сроки хотите запустить сайт?",
    description: "Выберите желаемый горизонт запуска или вариант без жёсткого дедлайна.",
    multiple: false,
    optionImages: [
      null,
      null,
      null,
      null,
      null,
      null,
    ],
    options: [
      "Как можно быстрее",
      "В течение 2–3 недель",
      "В течение 1 месяца",
      "В течение 2–3 месяцев",
      "Сроки не критичны",
      "Нужно сначала оценить объём работ",
    ],
  },
  {
    title: "Оставьте контакты",
    description: "Имя и телефон, чтобы отправить оценку и связаться с вами.",
    multiple: false,
    formStep: true,
  },
];

quizQuestions.forEach((question) => {
  if (Array.isArray(question.optionImages)) {
    question.optionImages = question.optionImages.map((path) => normalizeAssetPath(path));
  }
});

const quizState = {
  index: 0,
  furthestVisitedIndex: 0,
  answers: quizQuestions.map(() => new Set()),
};

const syncQuizSteps = () => {
  if (!quizSteps) {
    return;
  }

  const visualIndex = quizState.index;
  const canAdvanceOneMore = quizState.index < quizState.furthestVisitedIndex;

  quizSteps.querySelectorAll(".quiz-step").forEach((quizStep, index) => {
    const hasAnswer = quizState.answers[index].size > 0;
    const isActive = index === visualIndex;
    const isComplete = index <= visualIndex;
    const isAnsweredRight =
      index > visualIndex &&
      (hasAnswer || (canAdvanceOneMore && index === quizState.index + 1));
    const isDisabled =
      index > quizState.index &&
      !hasAnswer &&
      !(canAdvanceOneMore && index === quizState.index + 1);

    quizStep.classList.toggle("quiz-step--complete", isComplete);
    quizStep.classList.toggle("quiz-step--active", isActive);
    quizStep.classList.toggle("quiz-step--answered-right", isAnsweredRight);
    quizStep.classList.toggle("quiz-step--disabled", isDisabled);
    quizStep.setAttribute("aria-current", isActive ? "step" : "false");
    quizStep.setAttribute("aria-disabled", String(isDisabled));
    quizStep.disabled = isDisabled;
  });
};

const renderQuiz = () => {
  const question = quizQuestions[quizState.index];
  const selectedAnswers = quizState.answers[quizState.index];
  const isFinalStep = Boolean(question.formStep);

  quizInfo.textContent = `${isFinalStep ? "Шаг" : "Вопрос"} ${quizState.index + 1} из ${quizQuestions.length}`;
  quizTitle.textContent = question.title;
  quizDescription.textContent = question.description;

  syncQuizSteps();

  if (quizOptions) {
    const isDeadlineStep = quizState.index === 6;
    quizOptions.classList.toggle("quiz-options--hidden", isFinalStep);
    quizOptions.classList.toggle("quiz-options--deadline", isDeadlineStep);
    if (!isFinalStep) {
      const hasOptionImages = Array.isArray(question.optionImages) && !isDeadlineStep;
      quizOptions.innerHTML = question.options
        .map((option, index) => {
          const isSelected = selectedAnswers.has(option);
          const optionImage = question.optionImages?.[index];
          const imageMarkup = hasOptionImages
            ? optionImage
              ? `<span class="quiz-option__image"><img src="${optionImage}" alt="" aria-hidden="true" /></span>`
              : `<span class="quiz-option__image" aria-hidden="true"></span>`
            : "";
          const optionClass = hasOptionImages ? "quiz-option--text" : "quiz-option--plain";
          return `
            <button class="quiz-option ${optionClass}${isSelected ? " quiz-option--selected" : ""}" type="button" data-option-index="${index}" aria-pressed="${isSelected}">
              ${imageMarkup}
              <span class="quiz-option__title">${option}</span>
            </button>
          `;
        })
        .join("");
    } else {
      quizOptions.innerHTML = "";
    }
  }

  if (quizFinalForm) {
    quizFinalForm.classList.toggle("quiz-final-form--hidden", !isFinalStep);
  }

  if (quizBackButton) {
    quizBackButton.disabled = quizState.index === 0;
  }

  if (quizNextButton) {
    quizNextButton.textContent = isFinalStep ? "Отправить заявку →" : "Следующий вопрос →";
  }
};

const goToNextQuizStep = () => {
  if (quizState.index < quizQuestions.length - 1) {
    quizState.index += 1;
    quizState.furthestVisitedIndex = Math.max(quizState.furthestVisitedIndex, quizState.index);
    renderQuiz();
    return;
  }

  quizFinalForm?.requestSubmit();
};

const initProjectSliders = () => {
  projectCards.forEach((card) => {
    const slider = card.querySelector(".project-card__slider");
    const media = card.querySelector(".project-card__media");
    const slides = Array.from(card.querySelectorAll(".project-card__slide"));
    const pagerDots = Array.from(card.querySelectorAll(".project-card__pager-dot"));
    const prevButton = card.querySelector(".project-card__arrow--prev");
    const nextButton = card.querySelector(".project-card__arrow--next");
    const cardTitle = card.querySelector(".project-card__body h3")?.textContent?.trim() || "Проект";

    if (!slider || slides.length === 0) {
      return;
    }

    let currentIndex = 0;
    const lightboxItems = slides
      .map((slide, index) => {
        const src = extractBackgroundImageUrl(slide);
        return {
          src,
          alt: `${cardTitle} - изображение ${index + 1}`,
        };
      })
      .filter((item) => item.src);

    const syncSlider = (animate = true) => {
      slider.style.scrollBehavior = animate ? "smooth" : "auto";
      slider.scrollTo({
        left: currentIndex * slider.clientWidth,
        behavior: animate ? "smooth" : "auto",
      });
      pagerDots.forEach((dot, index) => {
        dot.classList.toggle("project-card__pager-dot--active", index === currentIndex);
      });
    };

    slides.forEach((slide, index) => {
      slide.tabIndex = 0;
      slide.setAttribute("role", "button");
      slide.setAttribute("aria-label", `${cardTitle}, изображение ${index + 1}`);
      slide.addEventListener("click", () => {
        openProjectLightbox(lightboxItems, index);
      });
      slide.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openProjectLightbox(lightboxItems, index);
        }
      });
    });

    prevButton?.addEventListener("click", () => {
      currentIndex = (currentIndex - 1 + slides.length) % slides.length;
      syncSlider(true);
    });

    nextButton?.addEventListener("click", () => {
      currentIndex = (currentIndex + 1) % slides.length;
      syncSlider(true);
    });

    pagerDots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        currentIndex = index;
        syncSlider(true);
      });
    });

    slider.addEventListener("scroll", () => {
      const width = slider.clientWidth || 1;
      const nextIndex = Math.round(slider.scrollLeft / width);
      if (nextIndex !== currentIndex && nextIndex >= 0 && nextIndex < slides.length) {
        currentIndex = nextIndex;
        pagerDots.forEach((dot, index) => {
          dot.classList.toggle("project-card__pager-dot--active", index === currentIndex);
        });
      }
    });

    syncSlider(true);
  });
};

const initProjectGrid = () => {
  if (!projectGrid) {
    return;
  }

  const cards = Array.from(projectCards);
  if (cards.length === 0) {
    return;
  }

  let activeIndex = 0;
  const projectGap = 22;

  const clampIndex = (index) => Math.max(0, Math.min(cards.length - 1, index));

  const updateButtons = () => {
    projectPrevButton && (projectPrevButton.disabled = activeIndex === 0);
    projectNextButton && (projectNextButton.disabled = activeIndex === cards.length - 1);
  };

  const updatePager = () => {
    projectPagerDots.forEach((dot, index) => {
      dot.classList.toggle("project-card__pager-dot--active", index === activeIndex);
    });
  };

  const scrollToIndex = (index, behavior = "smooth") => {
    activeIndex = clampIndex(index);
    const slideStep = projectGrid.clientWidth + projectGap;
    projectGrid.style.transition = behavior === "smooth" ? "transform 320ms ease" : "none";
    projectGrid.style.transform = `translateX(-${activeIndex * slideStep}px)`;

    updateButtons();
    updatePager();
  };

  projectPrevButton?.addEventListener("click", () => {
    scrollToIndex(activeIndex - 1);
  });

  projectNextButton?.addEventListener("click", () => {
    scrollToIndex(activeIndex + 1);
  });

  projectPagerDots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      scrollToIndex(index);
    });
  });

  const syncOnResize = () => {
    scrollToIndex(activeIndex, "auto");
  };

  window.addEventListener("resize", syncOnResize, { passive: true });

  updateButtons();
  updatePager();
  scrollToIndex(0, "auto");
};

yearNodes.forEach((node) => {
  node.textContent = new Date().getFullYear();
});

menuBtn?.addEventListener("click", () => {
  const expanded = menuBtn.getAttribute("aria-expanded") === "true";
  menuBtn.setAttribute("aria-expanded", String(!expanded));
  nav?.classList.toggle("nav--open");
});

nav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    if (window.matchMedia("(max-width: 860px)").matches) {
      menuBtn?.setAttribute("aria-expanded", "false");
      nav.classList.remove("nav--open");
    }
  });
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("fade-in--visible");
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.15,
  }
);

fadeInItems.forEach((item) => observer.observe(item));

accordionItems.forEach((item) => {
  const trigger = item.querySelector(".faq__trigger");
  const panel = item.querySelector(".faq__panel");

  if (panel) {
    panel.hidden = true;
    panel.style.maxHeight = "0px";
  }

  trigger?.addEventListener("click", () => {
    const isOpen = item.classList.toggle("faq__item--open");
    trigger.setAttribute("aria-expanded", String(isOpen));
    if (panel) {
      if (isOpen) {
        panel.hidden = false;
        panel.style.maxHeight = `${panel.scrollHeight}px`;
      } else {
        panel.style.maxHeight = "0px";
      }
    }
  });

  panel?.addEventListener("transitionend", () => {
    if (!item.classList.contains("faq__item--open")) {
      panel.hidden = true;
    }
  });
});

quizOptions?.addEventListener("click", (event) => {
  const optionButton = event.target.closest(".quiz-option");
  if (!optionButton) {
    return;
  }

  const currentQuestionIndex = quizState.index;
  const question = quizQuestions[currentQuestionIndex];
  const optionIndex = Number(optionButton.dataset.optionIndex);
  const optionValue = question.options[optionIndex];
  const selectedAnswers = quizState.answers[currentQuestionIndex];

  if (question.multiple) {
    if (selectedAnswers.has(optionValue)) {
      selectedAnswers.delete(optionValue);
      optionButton.classList.remove("quiz-option--selected");
      optionButton.setAttribute("aria-pressed", "false");
    } else {
      selectedAnswers.add(optionValue);
      optionButton.classList.add("quiz-option--selected");
      optionButton.setAttribute("aria-pressed", "true");
    }
    return;
  }

  selectedAnswers.clear();
  selectedAnswers.add(optionValue);
  renderQuiz();
});

quizSteps?.addEventListener("click", (event) => {
  const stepButton = event.target.closest(".quiz-step");
  if (!stepButton) {
    return;
  }

  if (stepButton.disabled) {
    return;
  }

  const stepIndex = Number(stepButton.dataset.stepIndex);
  if (Number.isNaN(stepIndex)) {
    return;
  }

  quizState.index = stepIndex;
  quizState.furthestVisitedIndex = Math.max(quizState.furthestVisitedIndex, quizState.index);
  renderQuiz();
});

quizBackButton?.addEventListener("click", () => {
  if (quizState.index === 0) {
    return;
  }

  quizState.index -= 1;
  renderQuiz();
});

quizNextButton?.addEventListener("click", () => {
  goToNextQuizStep();
});

renderQuiz();
initProjectSliders();
initProjectGrid();

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (event) => {
    const targetId = anchor.getAttribute("href");
    if (!targetId || targetId === "#") {
      return;
    }

    const target = document.querySelector(targetId);
    if (!target) {
      return;
    }

    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

contactForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const button = contactForm.querySelector("button");
  const originalText = button.textContent;

  button.disabled = true;
  button.textContent = "Заявка отправлена";

  window.setTimeout(() => {
    button.disabled = false;
    button.textContent = originalText;
    contactForm.reset();
  }, 1400);
});

quizFinalForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const button = quizNextButton;
  if (!button) {
    return;
  }

  const originalText = button.textContent;
  button.disabled = true;
  button.textContent = "Заявка отправлена";
  quizState.answers[quizState.index].add("submitted");

  window.setTimeout(() => {
    button.disabled = false;
    button.textContent = originalText;
    quizFinalForm.reset();
  }, 1400);
});



