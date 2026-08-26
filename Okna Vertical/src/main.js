import "./style.css";

const cityOffers = {
  rybinsk: " в\u00a0Рыбинске и\u00a0Рыбинском районе",
  yaroslavl: " в\u00a0Ярославле и\u00a0Ярославской области",
  oblast: " по\u00a0Ярославской области",
};

const cityOfferElement = document.querySelector(".hero-city-offer");
const requestedCity = new URLSearchParams(window.location.search)
  .get("city")
  ?.trim()
  .toLowerCase();
const activeCity = cityOffers[requestedCity] ? requestedCity : null;
const cityOffer = activeCity ? cityOffers[activeCity] : null;

if (cityOfferElement && cityOffers[requestedCity])
  cityOfferElement.textContent = cityOffer;

const reachLeadFormGoal = () => {
  if (typeof window.ym === "function") {
    const goalId = activeCity
      ? `lead_form_submit_${activeCity}`
      : "lead_form_submit";
    window.ym(111323394, "reachGoal", goalId);
  }
};

const submitLeadForm = async (form, formName) => {
  const formData = new FormData(form);
  formData.append("form_name", formName);
  formData.append("page_url", window.location.href);
  const response = await fetch("/mail.php", {
    method: "POST",
    body: formData,
  });
  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }
  if (!response.ok || !payload?.success) {
    throw new Error(payload?.message || "Заявка не отправлена");
  }
  reachLeadFormGoal();
};

const siteHeader = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const mainNavigation = document.querySelector(".main-nav");

const closeMenu = () => {
  if (!siteHeader || !menuToggle) return;
  siteHeader.classList.remove("is-menu-open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Открыть меню");
};

menuToggle?.addEventListener("click", () => {
  const isOpen = siteHeader?.classList.toggle("is-menu-open") ?? false;
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute(
    "aria-label",
    isOpen ? "Закрыть меню" : "Открыть меню",
  );
});

mainNavigation?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

const casesGrid = document.querySelector(".cases-grid");
const casesShowMore = document.querySelector(".cases-show-more");
const mobileReviewMedia = window.matchMedia("(max-width: 480px)");

const homeReviewsSlot = document.querySelector("#home-reviews-slot");
const reviewsSection = document.querySelector(".legacy-page .okna-reviews");
if (homeReviewsSlot && reviewsSection) {
  reviewsSection.classList.add("home-reviews");
  const reviewGrid = reviewsSection.querySelector(".review-grid");
  const reviewCards = reviewGrid
    ? Array.from(reviewGrid.querySelectorAll(".review-card"))
    : [];
  const shuffledReviewOrder = [6, 1, 8, 3, 9, 0, 5, 2, 7, 4];
  shuffledReviewOrder.forEach((index) => {
    if (reviewCards[index]) reviewGrid.append(reviewCards[index]);
  });
  homeReviewsSlot.replaceWith(reviewsSection);
}

casesShowMore?.addEventListener("click", () => {
  casesGrid?.classList.add("is-expanded");
  casesShowMore.hidden = true;
});

const setReviewTextDisclosureState = (card, isOpen) => {
  card.classList.toggle("is-review-open", isOpen);
  card
    .querySelector(".review-card__toggle")
    ?.setAttribute("aria-expanded", String(isOpen));
};

const setupReviewTextDisclosures = () => {
  document.querySelectorAll(".okna-reviews .review-card").forEach((card) => {
    const text = card.querySelector("p");
    if (!text) return;

    let toggle = card.querySelector(".review-card__toggle");
    if (!toggle) {
      toggle = document.createElement("button");
      toggle.className = "review-card__toggle";
      toggle.type = "button";
      toggle.setAttribute("aria-label", "Показать отзыв полностью");
      toggle.setAttribute("aria-expanded", "false");
      text.insertAdjacentElement("afterend", toggle);

      toggle.addEventListener("click", () => {
        if (!card.classList.contains("has-review-toggle")) return;
        const isOpen = card.classList.contains("is-review-open");
        setReviewTextDisclosureState(card, !isOpen);
        toggle.setAttribute(
          "aria-label",
          isOpen ? "Показать отзыв полностью" : "Свернуть отзыв",
        );
      });
    }

    if (!text.dataset.reviewDisclosureReady) {
      text.dataset.reviewDisclosureReady = "true";
      text.addEventListener("click", () => {
        if (!card.classList.contains("has-review-toggle")) return;
        const isOpen = card.classList.contains("is-review-open");
        setReviewTextDisclosureState(card, !isOpen);
        toggle.setAttribute(
          "aria-label",
          isOpen ? "Показать отзыв полностью" : "Свернуть отзыв",
        );
      });
    }

    if (!mobileReviewMedia.matches) {
      card.classList.remove("has-review-toggle", "is-review-open");
      toggle.hidden = true;
      return;
    }

    const wasOpen = card.classList.contains("is-review-open");
    card.classList.remove("has-review-toggle");
    const shouldCollapse = text.scrollHeight > 82;
    card.classList.toggle("has-review-toggle", shouldCollapse);
    setReviewTextDisclosureState(card, shouldCollapse && wasOpen);
    toggle.hidden = !shouldCollapse;
    toggle.setAttribute(
      "aria-label",
      shouldCollapse && wasOpen ? "Свернуть отзыв" : "Показать отзыв полностью",
    );
  });
};

setupReviewTextDisclosures();
window.addEventListener("resize", setupReviewTextDisclosures);
mobileReviewMedia.addEventListener("change", setupReviewTextDisclosures);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});

const formatPhone = (value) => {
  let digits = value.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("8")) digits = `7${digits.slice(1)}`;
  if (!digits.startsWith("7")) digits = `7${digits}`;
  digits = digits.slice(0, 11);
  let result = "+7";
  if (digits.length > 1) result += ` (${digits.slice(1, 4)}`;
  if (digits.length >= 4) result += ")";
  if (digits.length > 4) result += ` ${digits.slice(4, 7)}`;
  if (digits.length > 7) result += `-${digits.slice(7, 9)}`;
  if (digits.length > 9) result += `-${digits.slice(9, 11)}`;
  return result;
};
document.querySelectorAll('input[type="tel"]').forEach((input) => {
  input.maxLength = 18;
  input.inputMode = "tel";
  input.addEventListener("keydown", (event) => {
    if (
      event.key !== "Backspace" ||
      input.selectionStart !== input.value.length ||
      !input.value.endsWith(")")
    )
      return;
    event.preventDefault();
    const digits = input.value.replace(/\D/g, "").slice(0, -1);
    input.value = formatPhone(digits);
    input.setSelectionRange(input.value.length, input.value.length);
  });
  input.addEventListener("input", () => {
    input.value = formatPhone(input.value);
  });
});

const dropzoneInput = document.querySelector(".dropzone input");
if (dropzoneInput) {
  dropzoneInput.addEventListener("change", (event) => {
    const file = event.target.files?.[0];
    if (file)
      event.target
        .closest(".dropzone")
        .querySelector("span:nth-of-type(2)").textContent = file.name;
  });
}

const quizCard = document.querySelector(".quiz-card");
const quizOptions = [...document.querySelectorAll(".quiz-option")];
const quizProgress = document.querySelector(".progress span");
const quizMeta = document.querySelector(".question-meta");
const quizAudienceChip = document.querySelector(".quiz-audience-chip");
const quizTitle = document.querySelector(".quiz-card h3");
const quizDescription = document.querySelector(".quiz-card > p");
const quizBack = document.querySelector(".back-button");
const quizNext = document.querySelector(".next-button");
const firstQuizQuestion = {
  title: "Что требуется остеклить?",
  description:
    "Выберите тип задачи — дальше покажем подходящие варианты комплектации.",
  options: [
    "Новый частный дом",
    "Готовый жилой дом",
    "Панорамные окна и портал",
    "Входная группа",
    "Объект строительной компании",
    "Пока не знаю",
  ],
};
const ownerQuizQuestions = [
  {
    title: "Дом строится или уже жилой?",
    description:
      "Это поможет учесть этап работ и особенности подготовки проёмов.",
    options: [
      "Дом строится",
      "Уже жилой дом",
      "Реконструкция",
      "Пока не определились",
    ],
    images: [
      "/assets/quiz-owner-q2-01.jpg",
      "/assets/quiz-owner-q2-02.jpg",
      "/assets/quiz-owner-q2-03.jpg",
      "/assets/quiz-owner-q2-04.jpg",
    ],
  },
  {
    title: "Из чего построены стены?",
    description: "Подберём правильные крепления и монтажный узел.",
    options: ["Каркас", "Кирпич", "Дерево", "Газобетон или блоки"],
    images: [
      "/assets/quiz-owner-q3-01.jpg",
      "/assets/quiz-owner-q3-02.jpg",
      "/assets/quiz-owner-q3-03.jpg",
      "/assets/quiz-owner-q3-04.jpg",
    ],
  },
  {
    title: "Сколько примерно окон требуется?",
    description:
      "Можно указать примерное количество оконных и дверных проёмов.",
    options: ["До 5", "6–10", "11–20", "Больше 20"],
    images: [
      "/assets/quiz-owner-q4-01.jpg",
      "/assets/quiz-owner-q4-02.jpg",
      "/assets/quiz-owner-q4-03.jpg",
      "/assets/quiz-owner-q4-04.jpg",
    ],
  },
  {
    title: "Когда нужен монтаж?",
    description:
      "Зафиксируем желаемые сроки и заранее проверим доступность бригады.",
    options: [
      "В ближайший месяц",
      "Через 1–3 месяца",
      "Позже",
      "Нужно обсудить",
    ],
  },
];
const contractorQuizQuestions = [
  {
    title: "Сколько объектов требуется остеклить?",
    description: "Укажите примерный объём, чтобы подготовить условия поставки.",
    options: ["1 объект", "2–5 объектов", "6–10 объектов", "Больше 10"],
    images: [
      "/assets/quiz-contractor-q2-01.jpg",
      "/assets/quiz-contractor-q2-02.jpg",
      "/assets/quiz-contractor-q2-03.jpg",
      "/assets/quiz-contractor-q2-04.jpg",
    ],
  },
  {
    title: "Нужна поставка или поставка с монтажом?",
    description:
      "Подберём удобный формат работы для вашей строительной компании.",
    options: [
      "Только поставка",
      "Поставка с монтажом",
      "Нужны оба варианта",
      "Пока не определились",
    ],
    images: [
      "/assets/quiz-contractor-q3-01.jpg",
      "/assets/quiz-contractor-q3-02.jpg",
      "/assets/quiz-contractor-q3-03.jpg",
      "/assets/quiz-contractor-q3-04.jpg",
    ],
  },
  {
    title: "Материал стен",
    description:
      "Это поможет заранее учесть особенности крепления конструкций.",
    options: ["Каркас", "Кирпич", "Дерево", "Газобетон или блоки"],
    images: [
      "/assets/quiz-owner-q3-01.jpg",
      "/assets/quiz-owner-q3-02.jpg",
      "/assets/quiz-owner-q3-03.jpg",
      "/assets/quiz-owner-q3-04.jpg",
    ],
  },
  {
    title: "Срок готовности объекта",
    description:
      "Согласуем производство и поставку под календарный план объекта.",
    options: ["До 1 месяца", "1–3 месяца", "3–6 месяцев", "Срок уточняется"],
  },
];
let quizQuestions = [firstQuizQuestion, ...ownerQuizQuestions];
let quizStep = 0;
const quizAnswers = [];
let quizAdvanceTimer;
let quizPriceAnimationFrame;
const quizResult = document.querySelector(".quiz-result");
const quizResultPrice = document.querySelector(".quiz-result__price");
const quizResultForm = document.querySelector(".quiz-result__form");
const quizResultStatus = document.querySelector(".quiz-result__status");

const renderQuiz = () => {
  const question = quizQuestions[quizStep];
  quizMeta.textContent = `Вопрос ${quizStep + 1} из ${quizQuestions.length}`;
  quizAudienceChip.hidden = quizStep === 0;
  quizAudienceChip.textContent =
    quizAnswers[0] === 4 ? "Для строителей" : "Для собственника";
  quizTitle.textContent = question.title;
  quizDescription.textContent = question.description;
  quizCard.classList.toggle(
    "quiz-no-images",
    ["Срок готовности объекта", "Когда нужен монтаж?"].includes(question.title),
  );
  quizProgress.style.width = `${((quizStep + 1) / quizQuestions.length) * 100}%`;
  quizOptions.forEach((option, index) => {
    option.hidden = !question.options[index];
    option.classList.toggle("selected", quizAnswers[quizStep] === index);
    option.querySelector(".quiz-img").style.backgroundImage = question.images?.[
      index
    ]
      ? `url("${question.images[index]}")`
      : "";
    if (question.options[index])
      option.querySelector("b").lastChild.textContent =
        `${index + 1}. ${question.options[index]}`;
  });
  quizBack.disabled = quizStep === 0;
  quizBack.classList.toggle("is-active", quizStep > 0);
  quizNext.innerHTML =
    quizStep === quizQuestions.length - 1
      ? "Получить расчёт <span>→</span>"
      : "Следующий вопрос <span>→</span>";
};

const showQuizResult = () => {
  document.querySelector(".progress").hidden = true;
  quizMeta.hidden = true;
  quizTitle.hidden = true;
  quizDescription.hidden = true;
  document.querySelector(".quiz-options").hidden = true;
  document.querySelector(".quiz-footer").hidden = true;
  quizResult.hidden = false;
  if (quizAnswers[0] === 4) animateQuizPrice(140000, 705000);
  else animateQuizPrice(70000, 290000);
};

const animateQuizPrice = (minimum, maximum) => {
  window.cancelAnimationFrame(quizPriceAnimationFrame);
  const startedAt = performance.now();
  const duration = 900;
  const formatPrice = (value) =>
    new Intl.NumberFormat("ru-RU")
      .format(Math.round(value))
      .replace(/\u00a0/g, " ");
  const tick = (now) => {
    const progress = Math.min(1, (now - startedAt) / duration);
    const eased = 1 - (1 - progress) ** 3;
    quizResultPrice.textContent = `от ${formatPrice(minimum * eased)} до ${formatPrice(maximum * eased)} ₽`;
    if (progress < 1)
      quizPriceAnimationFrame = window.requestAnimationFrame(tick);
  };
  quizPriceAnimationFrame = window.requestAnimationFrame(tick);
};

const goToQuizStep = (step) => {
  quizStep = Math.max(0, Math.min(step, quizQuestions.length - 1));
  renderQuiz();
};

quizOptions.forEach((option, index) =>
  option.addEventListener("click", () => {
    quizAnswers[quizStep] = index;
    if (quizStep === 0) {
      quizQuestions =
        index === 4
          ? [firstQuizQuestion, ...contractorQuizQuestions]
          : [firstQuizQuestion, ...ownerQuizQuestions];
      quizAnswers.splice(1);
    }
    renderQuiz();
    window.clearTimeout(quizAdvanceTimer);
    if (quizStep < quizQuestions.length - 1) {
      quizAdvanceTimer = window.setTimeout(
        () => goToQuizStep(quizStep + 1),
        200,
      );
    } else showQuizResult();
  }),
);
quizNext?.addEventListener("click", () => {
  if (quizAnswers[quizStep] === undefined) {
    quizCard?.classList.add("quiz-attention");
    window.setTimeout(() => quizCard?.classList.remove("quiz-attention"), 350);
    return;
  }
  if (quizStep < quizQuestions.length - 1) goToQuizStep(quizStep + 1);
  else showQuizResult();
});
quizBack?.addEventListener("click", () => {
  if (quizResult && !quizResult.hidden) {
    quizResult.hidden = true;
    document.querySelector(".progress").hidden = false;
    quizMeta.hidden = false;
    quizTitle.hidden = false;
    quizDescription.hidden = false;
    document.querySelector(".quiz-options").hidden = false;
    document.querySelector(".quiz-footer").hidden = false;
  }
  goToQuizStep(quizStep - 1);
});
quizResultForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    await submitLeadForm(quizResultForm, "quiz-result-form");
    quizResultStatus.textContent =
      "Спасибо! Специалист свяжется с вами для уточнения проекта.";
    quizResultForm.reset();
  } catch {
    quizResultStatus.textContent =
      "Не удалось отправить заявку. Попробуйте ещё раз.";
  }
});
quizResultForm
  ?.querySelector('input[type="file"]')
  ?.addEventListener("change", (event) => {
    const file = event.currentTarget.files?.[0];
    const label = event.currentTarget
      .closest(".quiz-result__upload")
      ?.querySelector("b");
    if (label) label.textContent = file?.name || "Прикрепить план или фото";
  });
renderQuiz();

document
  .querySelectorAll("#home-compare-form, #compare-form")
  .forEach((compareForm) =>
    compareForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const status = form.querySelector(".compare-form-status");
      try {
        await submitLeadForm(form, "compare-form");
        status.textContent =
          "Спасибо! Передадим расчёт специалисту на проверку.";
        form.reset();
      } catch {
        status.textContent = "Не удалось отправить заявку. Попробуйте ещё раз.";
      }
    }),
  );

const wallDetails = {
  aerated: [
    [
      "Правильное положение рамы",
      "Рама устанавливается в тепловой контур, ближе к наружной плоскости стены.",
    ],
    [
      "Способ крепления",
      "Крепление на анкерные пластины или рамные дюбели к несущей части стены.",
    ],
    [
      "Устройство монтажного шва",
      "Трёхслойный монтажный шов: пароизоляция внутри, утепление по центру, паропроницаемая лента снаружи.",
    ],
    [
      "Внешняя защита от влаги",
      "ПСУЛ или диффузионная лента защищает шов от осадков и ветра.",
    ],
    [
      "Утепление и опорные элементы",
      "Заполняем шов пеной и устанавливаем опорные колодки под рамой.",
    ],
    [
      "Риски неправильного монтажа",
      "Промерзание, плесень, продувание, разрушение шва и сквозняки.",
    ],
  ],
  frame: [
    [
      "Положение рамы",
      "Рама устанавливается в плоскости утеплённого контура каркасной стены.",
    ],
    [
      "Способ крепления",
      "Используем усиленные монтажные пластины и крепим раму к стойкам каркаса.",
    ],
    [
      "Монтажный шов",
      "Шов защищаем изнутри и снаружи, пустоты заполняем эластичной пеной.",
    ],
    [
      "Защита от влаги",
      "Стыки закрываем лентами, чтобы влага не попадала в утеплитель стены.",
    ],
    [
      "Опорные элементы",
      "Нагрузка передаётся на усиленную нижнюю перемычку и опорные колодки.",
    ],
    [
      "Риски ошибки",
      "Продувание, промерзание откосов и деформация рамы при подвижках каркаса.",
    ],
  ],
  brick: [
    [
      "Положение рамы",
      "Раму ставим с учётом четверти и будущего утепления наружной стены.",
    ],
    [
      "Способ крепления",
      "Используем рамные дюбели с креплением в прочную часть кирпичной кладки.",
    ],
    [
      "Монтажный шов",
      "Формируем трёхслойный шов с утеплением и защитными лентами по периметру.",
    ],
    [
      "Защита от влаги",
      "Наружный слой выпускаем в зону фасада и защищаем от осадков.",
    ],
    [
      "Опорные элементы",
      "Под рамой устанавливаем колодки с распределением нагрузки на кладку.",
    ],
    [
      "Риски ошибки",
      "Трещины в кладке, продувание, промерзание и разрушение пены от влаги.",
    ],
  ],
  wood: [
    [
      "Положение рамы",
      "Оставляем монтажный зазор на усадку и устанавливаем обсадную коробку.",
    ],
    [
      "Способ крепления",
      "Крепим окно к обсаде, не связывая его жёстко с подвижной стеной.",
    ],
    [
      "Монтажный шов",
      "Используем эластичные материалы, которые компенсируют сезонные движения древесины.",
    ],
    [
      "Защита от влаги",
      "Закрываем шов лентами и защищаем примыкание от косого дождя.",
    ],
    [
      "Опорные элементы",
      "Нагрузка передаётся через обсаду и опорные колодки без перекоса рамы.",
    ],
    [
      "Риски ошибки",
      "Заклинивание створок, продувание и повреждение окна при усадке дома.",
    ],
  ],
};

const wallTabs = document.querySelectorAll(".wall-tab");
const wallDetailsElement = document.querySelector(".installation-details");
wallTabs.forEach((tab) =>
  tab.addEventListener("click", () => {
    wallTabs.forEach((item) => item.classList.remove("is-active"));
    tab.classList.add("is-active");
    document.querySelector(".installation-diagram img").src =
      tab.dataset.wallImage;
    wallDetailsElement.innerHTML = wallDetails[tab.dataset.wallKey]
      .map(
        ([title, text]) =>
          `<div><strong>${title}</strong><span>${text}</span></div>`,
      )
      .join("");
  }),
);

document.querySelectorAll(".faq-item button").forEach((button) =>
  button.addEventListener("click", () => {
    button.closest(".faq-item")?.classList.toggle("is-open");
  }),
);

const packageModal = document.querySelector(".package-modal");
if (packageModal) document.body.append(packageModal);
const packageModalTitle = packageModal?.querySelector("#package-modal-title");
const packageModalImage = packageModal?.querySelector(
  ".package-modal__visual img",
);
const packageModalForm = packageModal?.querySelector(".package-modal__form");
const packageModalStatus = packageModal?.querySelector(
  ".package-modal__status",
);
const packageModalDescription = packageModal?.querySelector(
  ".package-modal__content > p",
);
const packageModalUpload = packageModal?.querySelector(".package-upload");
const packageModalUploadTitle = packageModal?.querySelector(
  ".package-upload__title",
);
const packageModalUploadName = packageModal?.querySelector(
  ".package-upload__name",
);
const packageModalSubmit = packageModal?.querySelector(
  ".package-modal__form .button",
);
const closePackageModal = () => {
  packageModal?.classList.remove("is-open");
  packageModal?.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
};
document
  .querySelectorAll(
    ".package-footer button, .home-product-card__button, .home-hero-card, .home-hero__actions > .home-button, .home-hero__measure, .site-header > .button, .mobile-actions .button, .hero-actions .button:last-child, .services-cta .button, .case-button, .warranty-cta .button, .developer-actions .button, .footer-cta .button, .faq-ask .button, .coverage-actions .button, .hero-product, .hero .review-link",
  )
  .forEach((button) =>
    button.addEventListener("click", (event) => {
      if (!packageModal) return;
      event.preventDefault();
      const isSimple = button.dataset.packageSimple === "true";
      const isCase = button.classList.contains("case-button");
      const isPackage = button.closest(".package-footer");
      const noImage = button.dataset.packageNoImage === "true";
      const noUpload = button.dataset.packageNoUpload === "true";
      const isProjectUpload = button.dataset.packageUpload === "project";
      packageModal.classList.toggle("package-modal--simple", isSimple);
      packageModal.classList.toggle("package-modal--no-image", noImage);
      packageModal.classList.toggle(
        "package-modal--project-upload",
        isProjectUpload,
      );
      packageModalTitle.textContent = isSimple
        ? "Консультация по выбору комплектации"
        : isCase
          ? "Рассчитать стоимость остекления"
          : button.dataset.packageModalTitle ||
            (isPackage
              ? `Расчёт комплектации ${button.dataset.packageTitle || "остекления"}`
              : button.dataset.packageTitle || "Заявка на расчёт");
      packageModalImage.src = isCase
        ? button.closest(".case-card")?.querySelector("img")?.src ||
          "/assets/case-one-1.jpg"
        : button.dataset.packageImage || "/assets/seasonal-home.jpg";
      packageModalImage.alt =
        button.dataset.packageTitle || "Комплектация остекления";
      packageModalDescription.textContent = isSimple
        ? "Оставьте контакты — специалист поможет выбрать подходящую комплектацию."
        : button.dataset.packageDescription ||
          "Оставьте контакты — уточним размеры, предложим подходящую комплектацию и подготовим расчёт.";
      packageModalUpload.hidden = isSimple || noUpload;
      packageModalUpload.style.display = isSimple || noUpload ? "none" : "";
      packageModalUploadTitle.textContent = isProjectUpload
        ? "Ведомость проекта"
        : "Фото дома";
      packageModalUploadName.textContent = isProjectUpload
        ? "Прикрепить файл ведомости"
        : "Прикрепить фото дома";
      const uploadInput = packageModalUpload.querySelector("input");
      uploadInput.name = isProjectUpload ? "project-file" : "house-photo";
      uploadInput.accept = isProjectUpload
        ? ".pdf,.xls,.xlsx,.doc,.docx,.jpg,.jpeg,.png"
        : "image/*";
      packageModalSubmit.innerHTML = isSimple
        ? "Получить бесплатную консультацию <span>→</span>"
        : isCase
          ? "Получить расчет стоимости <span>→</span>"
          : `${button.dataset.packageSubmit || "Получить расчёт"} <span>→</span>`;
      packageModalStatus.textContent = "";
      packageModalForm.reset();
      packageModal.classList.add("is-open");
      packageModal.setAttribute("aria-hidden", "false");
      document.body.classList.add("modal-open");
      packageModal.querySelector("input")?.focus();
    }),
  );
document.querySelectorAll(".service-link").forEach((button) =>
  button.addEventListener("click", () => {
    if (!packageModal) return;
    packageModal.classList.remove("package-modal--simple");
    packageModal.classList.remove("package-modal--no-image");
    packageModalTitle.textContent =
      button.dataset.serviceTitle || "Заявка на услугу остекления";
    packageModalImage.src =
      button.dataset.serviceImage || "/assets/service-windows.jpg";
    packageModalImage.alt = button.dataset.serviceTitle || "Услуга остекления";
    packageModalDescription.textContent =
      "Оставьте контакты — уточним размеры, предложим подходящую комплектацию и подготовим расчёт.";
    packageModalUpload.hidden = false;
    packageModalUpload.style.display = "";
    packageModalSubmit.innerHTML = "Получить расчёт <span>→</span>";
    packageModalStatus.textContent = "";
    packageModalForm.reset();
    packageModal.classList.add("is-open");
    packageModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    packageModal.querySelector("input")?.focus();
  }),
);
packageModal
  ?.querySelectorAll("[data-package-close]")
  .forEach((element) => element.addEventListener("click", closePackageModal));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && packageModal?.classList.contains("is-open"))
    closePackageModal();
});
packageModalForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    await submitLeadForm(packageModalForm, "package-modal-form");
    packageModalStatus.textContent =
      "Спасибо! Специалист свяжется с вами для уточнения деталей.";
    packageModalForm.reset();
  } catch {
    packageModalStatus.textContent =
      "Не удалось отправить заявку. Попробуйте ещё раз.";
  }
});
packageModal
  ?.querySelector('input[type="file"]')
  ?.addEventListener("change", (event) => {
    const input = event.currentTarget;
    const label = input
      .closest(".package-upload")
      ?.querySelector(".package-upload__name");
    if (label)
      label.textContent =
        input.files?.[0]?.name ||
        (input.name === "project-file"
          ? "Прикрепить файл ведомости"
          : "Прикрепить фото дома");
  });

const galleryModal = document.querySelector(".gallery-modal");
if (galleryModal) document.body.append(galleryModal);
const galleryImage = galleryModal?.querySelector(".gallery-modal__figure img");
const galleryCaption = galleryModal?.querySelector("figcaption");
const galleryCounter = galleryModal?.querySelector(".gallery-modal__counter");
const galleryPrev = galleryModal?.querySelector(".gallery-modal__prev");
const galleryNext = galleryModal?.querySelector(".gallery-modal__next");
let galleryItems = [];
let galleryIndex = 0;
const closeGallery = () => {
  galleryModal?.classList.remove("is-open");
  galleryModal?.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
};
const renderGallery = () => {
  const item = galleryItems[galleryIndex];
  if (!item) return;
  galleryImage.src = item.src;
  galleryImage.alt = item.alt;
  galleryCaption.textContent = item.alt;
  galleryCounter.textContent = `${galleryIndex + 1} / ${galleryItems.length}`;
  const multiple = galleryItems.length > 1;
  galleryPrev.hidden = !multiple;
  galleryNext.hidden = !multiple;
};
const openGallery = (image) => {
  const gallery = image.closest(".case-photo--gallery");
  galleryItems = [...gallery.querySelectorAll("img")].map((item) => ({
    src: item.currentSrc || item.src,
    alt: item.alt,
  }));
  galleryIndex = [...gallery.querySelectorAll("img")].indexOf(image);
  renderGallery();
  galleryModal.classList.add("is-open");
  galleryModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
};
document
  .querySelectorAll(".case-photo--gallery img")
  .forEach((image) =>
    image.addEventListener("click", () => openGallery(image)),
  );
galleryPrev?.addEventListener("click", () => {
  galleryIndex = (galleryIndex - 1 + galleryItems.length) % galleryItems.length;
  renderGallery();
});
galleryNext?.addEventListener("click", () => {
  galleryIndex = (galleryIndex + 1) % galleryItems.length;
  renderGallery();
});
galleryModal
  ?.querySelectorAll("[data-gallery-close]")
  .forEach((element) => element.addEventListener("click", closeGallery));
document.addEventListener("keydown", (event) => {
  if (!galleryModal?.classList.contains("is-open")) return;
  if (event.key === "Escape") closeGallery();
  if (event.key === "ArrowLeft") galleryPrev?.click();
  if (event.key === "ArrowRight") galleryNext?.click();
});

const homeLeadForm = document.querySelector(".home-lead-form");
const homeLeadStatus = homeLeadForm?.querySelector(".home-form-status");
const homeCalculatorPrice = homeLeadForm?.querySelector(
  ".home-calculator__price",
);
const updateHomeCalculatorPrice = () => {
  if (!homeLeadForm || !homeCalculatorPrice) return;
  homeLeadForm
    .querySelectorAll('.home-calc-sizes input[type="range"]')
    .forEach((range) => {
      const progress =
        ((Number(range.value) - Number(range.min)) /
          (Number(range.max) - Number(range.min))) *
        100;
      range.style.setProperty("--range-progress", `${progress}%`);
      const valueOutput = range.closest("label")?.querySelector("output");
      if (valueOutput) valueOutput.textContent = `${range.value} мм`;
    });
  const data = new FormData(homeLeadForm);
  const count = Number(data.get("windows_count")) || 1;
  const width = Number(data.get("window_width")) || 1300;
  const height = Number(data.get("window_height")) || 1400;
  const areaFactor = Math.max(0.65, (width * height) / (1300 * 1400));
  const placeFactor =
    { apartment: 1, house: 1.1, cottage: 0.95, other: 1.08 }[
      data.get("installation_place")
    ] || 1;
  let price = 13450 * count * areaFactor * placeFactor;
  if (data.get("installation") === "yes") price += 2250 * count;
  if (data.get("delivery") === "yes") price += 1250;
  if (data.get("dismantling") === "yes") price += 900 * count;
  if (data.get("waste_removal") === "yes") price += 600;
  homeCalculatorPrice.textContent = `от ${new Intl.NumberFormat("ru-RU").format(Math.round(price / 100) * 100)} ₽`;
};
homeLeadForm?.addEventListener("input", updateHomeCalculatorPrice);
updateHomeCalculatorPrice();
homeLeadForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!homeLeadForm.reportValidity()) return;
  try {
    await submitLeadForm(homeLeadForm, "home-window-calculator");
    homeLeadStatus.textContent =
      "Спасибо! Мы перезвоним и уточним размеры для расчёта.";
    homeLeadForm.reset();
    window.setTimeout(updateHomeCalculatorPrice, 0);
  } catch {
    homeLeadStatus.textContent =
      "Не удалось отправить заявку. Попробуйте ещё раз или позвоните нам.";
  }
});
