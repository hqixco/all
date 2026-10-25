import { metrikaLeadGoals } from './components/lead-goals.js';
import { initInstallationBlocks } from './components/installation.js';
import { initCalculators } from './components/calculator.js';
import {firstQuizQuestion, generalQuizQuestions, balconyQuizQuestions} from './components/quiz-data.js';
import "./style.css";
import "./footer.css";

const floatingVideo = document.querySelector(".floating-video");
const floatingVideoDismiss = floatingVideo?.querySelector(
  ".floating-video__dismiss",
);

floatingVideoDismiss?.addEventListener("click", () => {
  floatingVideo.classList.add("is-dismissed");
  floatingVideo.querySelector("video")?.pause();
  window.setTimeout(() => {
    floatingVideo.hidden = true;
  }, 320);
});

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
  const _tmr = window._tmr || (window._tmr = []);
  _tmr.push({ type: "reachGoal", id: 3804663, goal: "okna_lead" });
  if (window.location.pathname.replace(/\/+$/, "") === "/okna-v-chastnyj-dom") {
    _tmr.push({ type: "reachGoal", id: 3804663, goal: "okna_house_lead" });
  }
  if (typeof window.ym === "function") {
    const isBalconyPage = document.documentElement.classList.contains("page-balcony");
    const goals = metrikaLeadGoals(window.location.pathname, activeCity, isBalconyPage);
    goals.forEach(goal => window.ym(111323394, "reachGoal", goal));
  }
};

const submitLeadForm = async (form, formName) => {
  const isLocalEnvironment = ["localhost", "127.0.0.1", "0.0.0.0"].includes(
    window.location.hostname,
  );
  if (isLocalEnvironment) {
    await new Promise((resolve) => window.setTimeout(resolve, 650));
    reachLeadFormGoal();
    return;
  }

  const formData = new FormData(form);
  if (window.location.pathname.replace(/\/+$/, "") === "/zhalyuzi") {
    formData.set("source_name", "Страница «Жалюзи»");
    formData.set("lead_category", "zhalyuzi");
    if (form.classList.contains("package-modal__form")) {
      formData.set("request_title", document.querySelector("#package-modal-title")?.textContent.trim() || "Жалюзи");
    }
  }
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
const navDropdown = document.querySelector(".nav-dropdown");
const navDropdownToggle = document.querySelector(".nav-dropdown__toggle");

const normalizePathname = (pathname) =>
  pathname === "/" ? pathname : pathname.replace(/\/+$/, "");
const currentPathname = normalizePathname(window.location.pathname);
const isBalconyPage =
  currentPathname === "/balkony" ||
  document.documentElement.classList.contains("page-balcony");
navDropdown?.querySelectorAll("a").forEach((link) => {
  const linkPathname = normalizePathname(new URL(link.href, window.location.href).pathname);
  if (linkPathname === currentPathname) {
    link.setAttribute("aria-current", "page");
  } else {
    link.removeAttribute("aria-current");
  }
});

const closeMenu = () => {
  if (!siteHeader || !menuToggle) return;
  siteHeader.classList.remove("is-menu-open");
  navDropdown?.classList.remove("is-open");
  navDropdownToggle?.setAttribute("aria-expanded", "false");
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

navDropdownToggle?.addEventListener("click", () => {
  if (!window.matchMedia("(max-width: 1300px)").matches) return;
  const isOpen = navDropdown?.classList.toggle("is-open") ?? false;
  navDropdownToggle.setAttribute("aria-expanded", String(isOpen));
});

document.querySelectorAll(".cases-section").forEach((section) => {
  const menuButtons = [...section.querySelectorAll(".cases-menu__button")];
  const caseCards = [...section.querySelectorAll(".case-card")];
  const showMoreButton = section.querySelector(".cases-show-more");
  const casesGridInSection = section.querySelector(".cases-grid");
  // Component cards carry their category in static HTML.
  caseCards.forEach(card => {
    if (card.dataset.caseCategories) return;
    const title=card.querySelector('h3')?.textContent||'';
    card.dataset.caseCategories=/балкон|лоджи/i.test(title)?'balconies':/квартир/i.test(title)?'apartments':'houses';
  });

  const selectCategory = (category) => {
    casesGridInSection?.classList.add("is-filtered");
    casesGridInSection?.classList.remove("is-category-expanded");
    menuButtons.forEach((button) => {
      const isActive = button.dataset.caseCategory === category;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
    const visibleCards = caseCards.filter((card) => {
      const categories = card.dataset.caseCategories.split(" ");
      return category === 'all' || categories.includes(category);
    });
    caseCards.forEach((card) => {
      const isVisible = visibleCards.includes(card);
      card.classList.toggle("is-category-hidden", !isVisible);
      card.classList.toggle(
        "is-mobile-hidden",
        isVisible && visibleCards.indexOf(card) >= 4,
      );
    });
    if (showMoreButton) showMoreButton.hidden = visibleCards.length <= 4;
  };

  menuButtons.forEach((button) => {
    button.addEventListener("click", () => selectCategory(button.dataset.caseCategory));
  });
  showMoreButton?.addEventListener("click", () => {
    casesGridInSection?.classList.add("is-category-expanded");
    caseCards.forEach((card) => card.classList.remove("is-mobile-hidden"));
    showMoreButton.hidden = true;
  });
  selectCategory(section.dataset.caseCategory || "balconies");
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
    }
    if (!toggle.dataset.reviewToggleReady) {
      toggle.dataset.reviewToggleReady = "true";
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
if (typeof mobileReviewMedia.addEventListener === 'function') {
  mobileReviewMedia.addEventListener('change', setupReviewTextDisclosures);
} else {
  mobileReviewMedia.addListener(setupReviewTextDisclosures);
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});

const homePage = document.querySelector(".home-page");
const legacyQuizSection = document.querySelector(".legacy-page .quiz-section");
const quizSuccessTemplate = homePage?.querySelector(".quiz-success");
if (
  legacyQuizSection &&
  !legacyQuizSection.querySelector(".quiz-success") &&
  quizSuccessTemplate
) {
  legacyQuizSection
    .querySelector(".quiz-result")
    ?.append(quizSuccessTemplate.cloneNode(true));
}
if (homePage && legacyQuizSection && !homePage.querySelector("[data-static-quiz]")) {
  const homeQuizSection = legacyQuizSection.cloneNode(true);
  homePage.querySelector(".home-hero")?.after(homeQuizSection);
  const homeCasesSection = homePage.querySelector(".cases-section");
  if (homeCasesSection) homeQuizSection.after(homeCasesSection);
}

const legacyCasesSection = document.querySelector(".legacy-page .cases-section");
if (legacyQuizSection && legacyCasesSection) {
  legacyQuizSection.after(legacyCasesSection);
}

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
const phonePattern = "\\+7 \\(\\d{3}\\) \\d{3}-\\d{2}-\\d{2}";
document.querySelectorAll('input[type="tel"], input[name="phone"]').forEach((input) => {
  input.maxLength = 18;
  input.inputMode = "tel";
  input.pattern = phonePattern;
  input.required = true;
  input.title = "Введите номер в формате +7 (___) ___-__-__";
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
    input.setCustomValidity("");
  });
  input.addEventListener("blur", () => {
    input.setCustomValidity(
      input.value && !new RegExp(`^${phonePattern}$`).test(input.value)
        ? "Введите полный номер в формате +7 (___) ___-__-__"
        : "",
    );
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

const componentQuizSection = document.documentElement.classList.contains("page-house") ? null : document.querySelector("[data-static-quiz]");
const configuredQuizQuestions = componentQuizSection ? JSON.parse(componentQuizSection.querySelector("[data-quiz-questions]").textContent) : null;
const isConfiguredQuiz = Boolean(configuredQuizQuestions);
const activeQuizSection = componentQuizSection || (document.documentElement.classList.contains("page-house")
  ? legacyQuizSection
  : homePage?.querySelector(".quiz-section"));
const quizCard = activeQuizSection?.querySelector(".quiz-card");
const quizOptions = [...(activeQuizSection?.querySelectorAll(".quiz-option") || [])];
const quizProgress = activeQuizSection?.querySelector(".progress span");
const quizMeta = activeQuizSection?.querySelector(".question-meta");
const quizTitle = activeQuizSection?.querySelector(".quiz-card h3");
const quizDescription = activeQuizSection?.querySelector(".quiz-card > p");
const quizBack = activeQuizSection?.querySelector(".back-button");
const quizNext = activeQuizSection?.querySelector(".next-button");
let quizQuestions = isConfiguredQuiz ? configuredQuizQuestions : isBalconyPage
  ? balconyQuizQuestions
  : [firstQuizQuestion, ...generalQuizQuestions];
let quizStep = 0;
const quizAnswers = [];
let quizAdvanceTimer;
let quizPriceAnimationFrame;
const quizResult = activeQuizSection?.querySelector(".quiz-result");
const quizSuccess = activeQuizSection?.querySelector(".quiz-success");
const quizResultFormSide = activeQuizSection?.querySelector(
  ".quiz-result__form-side",
);
const quizResultForm = activeQuizSection?.querySelector(".quiz-result__form");
const quizResultStatus = activeQuizSection?.querySelector(".quiz-result__status");
let balconyQuizSummary = null;
if (isBalconyPage && !isConfiguredQuiz && quizResultForm) {
  quizResultForm.classList.add("balcony-quiz-form");
  const resultSide = quizResultForm.closest(".quiz-result__form-side");
  const resultTitle = resultSide?.querySelector("h3");
  const resultLead = resultSide?.querySelector(".quiz-result__lead");
  const commentLabel = quizResultForm.querySelector('textarea[name="comment"]')?.closest("label");
  const resultSubmit = quizResultForm.querySelector('button[type="submit"]');
  if (resultTitle) resultTitle.textContent = "Получите расчёт вашего балкона";
  if (resultLead)
    resultLead.textContent =
      "Подберём подходящий вариант и посчитаем изделие отдельно и стоимость под ключ.";
  commentLabel?.remove();
  if (resultSubmit)
    resultSubmit.innerHTML = "Получить расчёт стоимости <span><svg aria-hidden='true' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M5 12h14m-6-6 6 6-6 6'/></svg></span>";
  balconyQuizSummary = document.createElement("p");
  balconyQuizSummary.className = "balcony-quiz-summary";
  resultLead?.after(balconyQuizSummary);
  const uploadLabel = document.createElement("label");
  uploadLabel.className = "quiz-result__upload balcony-quiz-upload";
  uploadLabel.innerHTML =
    '<span>Прикрепить фото балкона <small>Необязательно</small></span><input type="file" name="balcony-photo" accept="image/*" /><b>Выбрать фотографию</b>';
  const phoneLabel = quizResultForm.querySelector('input[name="phone"]')?.closest("label");
  phoneLabel?.after(uploadLabel);
  const uploadInput = uploadLabel.querySelector('input[type="file"]');
  uploadInput?.addEventListener("change", () => {
    const fileName = uploadInput.files?.[0]?.name;
    const uploadCaption = uploadLabel.querySelector("b");
    if (fileName && uploadCaption) uploadCaption.textContent = fileName;
  });
}
const quizAnswersField = quizResultForm?.querySelector('input[name="quiz_answers"]') || (quizResultForm
  ? Object.assign(document.createElement("input"), {
      type: "hidden",
      name: "quiz_answers",
    })
  : null);
quizAnswersField && !quizResultForm.contains(quizAnswersField) && quizResultForm.append(quizAnswersField);

const renderQuiz = () => {
  if (!quizCard || !quizMeta || !quizTitle || !quizDescription) return;
  const question = quizQuestions[quizStep];
  quizMeta.textContent = `Вопрос ${quizStep + 1} из ${quizQuestions.length}`;
  quizTitle.textContent = question.title;
  quizDescription.textContent = question.description;
  quizCard.classList.toggle(
    "quiz-no-images",
    ["Срок готовности объекта", "Когда нужен монтаж?"].includes(question.title),
  );
  quizCard.classList.toggle("quiz-no-images", !question.images);
  quizCard.classList.toggle("quiz-multiple", Boolean(question.multiple));
  quizProgress.style.width = `${((quizStep + 1) / quizQuestions.length) * 100}%`;
  quizOptions.forEach((option, index) => {
    const optionData = question.options[index];
    const optionLabel =
      typeof optionData === "string" ? optionData : optionData?.label;
    const optionNote =
      question.notes?.[index] ||
      (typeof optionData === "object" ? optionData?.note : "");
    const currentAnswer = quizAnswers[quizStep];
    const isSelected = Array.isArray(currentAnswer)
      ? currentAnswer.includes(index)
      : currentAnswer === index;
    option.hidden = !optionData;
    option.classList.toggle("selected", isSelected);
    option.querySelector(".quiz-img").style.backgroundImage = question.images?.[
      index
    ]
      ? `url("${question.images[index]}")`
      : "";
    if (optionData) {
      const optionText = option.querySelector("b");
      const marker = document.createElement("em");
      const copy = document.createElement("span");
      copy.className = "quiz-option__copy";
      const label = document.createElement("span");
      label.textContent = `${index + 1}. ${optionLabel}`;
      copy.append(label);
      if (optionNote) {
        const note = document.createElement("small");
        note.textContent = optionNote;
        copy.append(note);
      }
      optionText.replaceChildren(marker, copy);
    }
  });
  quizBack.disabled = quizStep === 0;
  quizBack.classList.toggle("is-active", quizStep > 0);
  const nextLabel=quizNext.querySelector('.quiz-next-label');
  if(nextLabel)nextLabel.textContent=quizStep===quizQuestions.length-1?'Получить расчёт':'Следующий вопрос';
};

const showQuizResult = () => {
  activeQuizSection.querySelector(".progress").hidden = true;
  quizMeta.hidden = true;
  quizTitle.hidden = true;
  quizDescription.hidden = true;
  activeQuizSection.querySelector(".quiz-options").hidden = true;
  activeQuizSection.querySelector(".quiz-footer").hidden = true;
  quizResult.hidden = false;
  if (isBalconyPage && balconyQuizSummary) {
    const answerLabel = (questionIndex) => {
      const answer = quizAnswers[questionIndex];
      const option = quizQuestions[questionIndex]?.options?.[answer];
      return typeof option === "string" ? option : option?.label || "";
    };
    const glazing = {
      "Холодное раздвижное": "холодное раздвижное остекление",
      "Тёплое ПВХ": "тёплое ПВХ-остекление",
      "Панорамное / от пола": "панорамное остекление от пола",
      "Не знаю, помогите выбрать": "подходящий вариант остекления",
    }[answerLabel(1)];
    const shape = {
      "Прямая лоджия": "прямой лоджии",
      "П-образный балкон": "П-образного балкона",
      "Г-образный балкон": "Г-образного балкона",
      "Балкон сложной формы": "балкона сложной формы",
      "Не знаю / пришлю фото": "по фотографии балкона",
    }[answerLabel(2)];
    const extraIndexes = Array.isArray(quizAnswers[3]) ? quizAnswers[3] : [];
    const extrasMap = {
      "Демонтаж старого остекления": "демонтажом старого остекления",
      "Внутренняя отделка": "внутренней отделкой",
      "Утепление пола и стен": "утеплением пола и стен",
      "Подоконники и откосы": "подоконниками и откосами",
      "Москитные сетки": "москитными сетками",
      "Шкафы / системы хранения": "шкафами и системами хранения",
    };
    const extras = extraIndexes
      .map((index) => balconyQuizQuestions[3].options[index])
      .filter((label) => label !== "Только остекление")
      .map((label) => extrasMap[label]);
    balconyQuizSummary.textContent = `Предварительно подбираем: ${glazing} ${shape}${
      extras.length ? ` с ${extras.join(" и ")}` : ""
    }.`;
  }
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
  window.clearTimeout(quizAdvanceTimer);
  quizStep = Math.max(0, Math.min(step, quizQuestions.length - 1));
  renderQuiz();
};

quizOptions.forEach((option, index) =>
  option.addEventListener("click", () => {
    const question = quizQuestions[quizStep];
    if (question.multiple) {
      const selected = new Set(
        Array.isArray(quizAnswers[quizStep]) ? quizAnswers[quizStep] : [],
      );
      const onlyGlazingIndex = question.options.length - 1;
      if (index === onlyGlazingIndex) {
        selected.clear();
        selected.add(index);
      } else {
        selected.delete(onlyGlazingIndex);
        selected.has(index) ? selected.delete(index) : selected.add(index);
      }
      quizAnswers[quizStep] = [...selected];
      renderQuiz();
      return;
    }
    quizAnswers[quizStep] = index;
    if (quizStep === 0 && !isBalconyPage && !isConfiguredQuiz) {
      quizQuestions = [firstQuizQuestion, ...generalQuizQuestions];
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
  window.clearTimeout(quizAdvanceTimer);
  const currentAnswer = quizAnswers[quizStep];
  if (
    currentAnswer === undefined ||
    (Array.isArray(currentAnswer) && currentAnswer.length === 0)
  ) {
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
    if (quizResultFormSide) quizResultFormSide.hidden = false;
    if (quizSuccess) quizSuccess.hidden = true;
    activeQuizSection.querySelector(".progress").hidden = false;
    quizMeta.hidden = false;
    quizTitle.hidden = false;
    quizDescription.hidden = false;
    activeQuizSection.querySelector(".quiz-options").hidden = false;
    activeQuizSection.querySelector(".quiz-footer").hidden = false;
  }
  goToQuizStep(quizStep - 1);
});
quizResultForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (quizAnswersField) {
    quizAnswersField.value = quizQuestions
      .map((question, index) => {
        const answer = quizAnswers[index];
        const answerIndexes = Array.isArray(answer) ? answer : [answer];
        const answerText = answerIndexes
          .map((answerIndex) => {
            const option = question.options[answerIndex];
            return typeof option === "string" ? option : option?.label;
          })
          .filter(Boolean)
          .join(", ");
        return (
          index +
          1 +
          ". " +
          question.title +
          ": " +
          (answerText || "не выбрано")
        );
      })
      .join(" | ");
  }
  const submitButton = quizResultForm.querySelector('button[type="submit"]');
  const submitButtonLabel = submitButton?.innerHTML;
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.innerHTML = "Отправляем…";
  }
  try {
    await submitLeadForm(quizResultForm, "quiz-result-form");
    quizResultForm.reset();
    if (quizResultFormSide) quizResultFormSide.hidden = true;
    quizResult.hidden = false;
    if (quizSuccess) quizSuccess.hidden = false;
  } catch (error) {
    quizResultStatus.textContent =
      error.message || "Не удалось отправить заявку.";
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.innerHTML = submitButtonLabel;
    }
  }
});
if (!isConfiguredQuiz) renderQuiz();

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
      } catch (error) {
        status.textContent = error.message || "Не удалось отправить заявку.";
      }
    }),
  );

initInstallationBlocks();

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
const packageModalVisual = packageModal?.querySelector(
  ".package-modal__visual",
);
const packageModalForm = packageModal?.querySelector(".package-modal__form");
const packageModalStatus = packageModal?.querySelector(
  ".package-modal__status",
);
const packagePhotoInput = packageModalForm?.querySelector('.package-modal__upload input');
packagePhotoInput?.addEventListener('change', () => {
 const caption = packageModalForm.querySelector('.package-upload__name');
 if (caption) caption.textContent = packagePhotoInput.files?.[0]?.name || 'Выбрать фотографию';
});
const packageModalDescription = packageModal?.querySelector(".package-modal__description");
const packageModalSubmit = packageModal?.querySelector(
  ".package-modal__form .button",
);
const packageModalContent = packageModal?.querySelector(
  ".package-modal__content",
);
const packageModalSuccess = packageModal?.querySelector(
  ".package-modal__success",
);
const packageModalSuccessText = packageModalSuccess?.querySelector("p");
const resetPackageModalSuccess = () => {
  packageModal?.classList.remove("is-success");
  if (packageModalSuccess) packageModalSuccess.hidden = true;
  if (packageModalSuccessText) packageModalSuccessText.textContent = "";
  if (packageModalVisual) packageModalVisual.hidden = false;
  if (packageModalContent) packageModalContent.hidden = false;
};
const showPackageModalSuccess = () => {
  packageModal?.classList.add("is-success");
  if (packageModalVisual) packageModalVisual.hidden = true;
  if (packageModalContent) packageModalContent.hidden = true;
  if (packageModalSuccessText)
    packageModalSuccessText.textContent =
      "\u0417\u0430\u044f\u0432\u043a\u0430 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u043e\u0442\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u0430. \u0421\u043f\u0435\u0446\u0438\u0430\u043b\u0438\u0441\u0442 \u0441\u0432\u044f\u0436\u0435\u0442\u0441\u044f \u0441 \u0432\u0430\u043c\u0438.";
  if (packageModalSuccess) packageModalSuccess.hidden = false;
};
const closePackageModal = () => {
  packageModal?.classList.remove("is-open");
  packageModal?.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
};
document
  .querySelectorAll(
    "[data-package-title], .global-header__photo, .package-footer button, .home-product-card__button, .home-hero-card, .home-hero__actions > .home-button, .home-hero__measure, .site-header > .button, .mobile-actions .button, .hero-actions .button:last-child, .services-cta .button, .case-button, .developer-actions .button, .footer-cta .button, .faq-ask .button, .coverage-actions .button, .hero-product, .hero .review-link",
  )
  .forEach((button) =>
    button.addEventListener("click", (event) => {
      if (!packageModal) return;
      if (button.classList.contains('home-hero-card') && !button.dataset.packageTitle) return;
      event.preventDefault();
      const isSimple = button.dataset.packageSimple === "true";
      const isCase = button.classList.contains("case-button");
      const isHomeHeroCard = button.classList.contains("home-hero-card");
      const isPackage = button.closest(".package-footer");
      const noImage = button.dataset.packageNoImage === "true";
      packageModal.classList.toggle("package-modal--simple", isSimple);
      packageModal.classList.toggle("package-modal--no-image", noImage);
      packageModal.classList.toggle("package-modal--hero-card", isHomeHeroCard);
      packageModalTitle.textContent = isSimple
        ? "Консультация по выбору комплектации"
        : isCase
          ? "Рассчитать стоимость остекления"
          : button.dataset.packageModalTitle ||
            (isPackage
              ? `Расчёт комплектации ${button.dataset.packageTitle || "остекления"}`
              : button.dataset.packageTitle || "Заявка на расчёт");
      packageModalImage.src = isHomeHeroCard
        ? button.querySelector('img')?.getAttribute('src') || button.dataset.packageImage || '/assets/hero-product-window.jpg'
        : isCase
        ? button.closest(".case-card")?.querySelector("img")?.src ||
          "/assets/case-one-1.jpg"
        : button.dataset.packageImage || "/assets/hero-product-window.jpg";
      packageModalImage.alt =
        button.dataset.packageTitle || "Комплектация остекления";
      packageModalDescription.textContent = isSimple
        ? "Оставьте контакты — специалист поможет выбрать подходящую комплектацию."
        : button.dataset.packageDescription ||
          "Оставьте контакты — уточним размеры, предложим подходящую комплектацию и подготовим расчёт.";

      packageModalSubmit.innerHTML = isSimple
        ? "Получить бесплатную консультацию <span><svg aria-hidden='true' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M5 12h14m-6-6 6 6-6 6'/></svg></span>"
        : isCase
          ? "Получить расчет стоимости <span><svg aria-hidden='true' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M5 12h14m-6-6 6 6-6 6'/></svg></span>"
          : `${button.dataset.packageSubmit || "Получить расчёт"} <span><svg aria-hidden='true' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M5 12h14m-6-6 6 6-6 6'/></svg></span>`;
      packageModalStatus.textContent = "";
      resetPackageModalSuccess();
      packageModalForm.reset();
      const photoUpload = packageModalForm.querySelector(".package-modal__upload");
      if (photoUpload) {
        photoUpload.hidden = !button.dataset.packageUpload || button.dataset.packageNoUpload === "true";
        const uploadType = button.dataset.packageUpload;
        photoUpload.querySelector(".package-upload__title").textContent = uploadType === "estimate" ? "Прикрепить смету" : uploadType === "project" ? "Прикрепить проект" : "Прикрепить фото для расчёта";
        photoUpload.querySelector("input").accept = uploadType === "estimate" ? ".pdf,.xls,.xlsx,.jpg,.jpeg,.png,.webp" : uploadType === "project" ? ".pdf,.jpg,.jpeg,.png,.webp" : "image/*";
        photoUpload.querySelector(".package-upload__name").textContent = "Выбрать файл";
        photoUpload.querySelector("input").disabled = photoUpload.hidden;
      }
      packageModal.classList.add("is-open");
      packageModal.setAttribute("aria-hidden", "false");
      document.body.classList.add("modal-open");
      if (!isHomeHeroCard) packageModal.querySelector("input")?.focus();
    }),
  );
document.querySelectorAll(".service-link").forEach((button) =>
  button.addEventListener("click", () => {
    if (!packageModal) return;
    packageModal.classList.remove("package-modal--simple");
    packageModal.classList.remove("package-modal--no-image");
    packageModal.classList.remove("package-modal--hero-card");
    packageModalTitle.textContent =
      button.dataset.serviceTitle || "Заявка на услугу остекления";
    packageModalImage.src =
      button.dataset.serviceImage || "/assets/service-windows.jpg";
    packageModalImage.alt = button.dataset.serviceTitle || "Услуга остекления";
    packageModalDescription.textContent =
      "Оставьте контакты — уточним размеры, предложим подходящую комплектацию и подготовим расчёт.";
    packageModalSubmit.innerHTML = "Получить расчёт <span><svg aria-hidden='true' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M5 12h14m-6-6 6 6-6 6'/></svg></span>";
    packageModalStatus.textContent = "";
    resetPackageModalSuccess();
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
    showPackageModalSuccess();
  } catch (error) {
    packageModalStatus.textContent =
      error.message || "Не удалось отправить заявку.";
  }
});
const galleryModal = document.querySelector(".gallery-modal");
if (galleryModal) document.body.append(galleryModal);
const galleryImage = galleryModal?.querySelector(".gallery-modal__figure img");
const galleryCaption = galleryModal?.querySelector("figcaption");
const galleryCounter = galleryModal?.querySelector(".gallery-modal__counter");
const galleryPrev = galleryModal?.querySelector(".gallery-modal__prev");
const galleryNext = galleryModal?.querySelector(".gallery-modal__next");
document.querySelectorAll(".case-photo--gallery").forEach((gallery) => {
  const images = [...gallery.querySelectorAll("img")];
  if (!images.length) return;

  if (gallery.hasAttribute('data-static-gallery')) {
    let selected = 0;
    const thumbs = [...(gallery.nextElementSibling?.classList.contains('case-slider__thumbs') ? gallery.nextElementSibling.querySelectorAll('button') : [])];
    const select = index => {
      selected = (index + images.length) % images.length;
      images.forEach((image,i)=>image.classList.toggle('is-active',i===selected));
      thumbs.forEach((thumb,i)=>{thumb.classList.toggle('is-active',i===selected);thumb.setAttribute('aria-pressed',String(i===selected));});
    };
    thumbs.forEach((thumb,i)=>thumb.addEventListener('click',()=>select(i)));
    gallery.querySelector('.case-slider__nav--prev')?.addEventListener('click',()=>select(selected-1));
    gallery.querySelector('.case-slider__nav--next')?.addEventListener('click',()=>select(selected+1));
    return;
  }
  let activeIndex = 0;
  gallery.classList.add("is-case-slider");

  const thumbs = document.createElement("div");
  thumbs.className = "case-slider__thumbs";
  thumbs.setAttribute("aria-label", "Миниатюры кейса");

  const renderSlide = (index) => {
    activeIndex = (index + images.length) % images.length;
    images.forEach((image, imageIndex) => {
      image.classList.toggle("is-active", imageIndex === activeIndex);
    });
    thumbs.querySelectorAll(".case-slider__thumb").forEach((thumb, thumbIndex) => {
      thumb.classList.toggle("is-active", thumbIndex === activeIndex);
      thumb.setAttribute("aria-pressed", String(thumbIndex === activeIndex));
    });
  };

  images.forEach((image, index) => {
    const thumb = document.createElement("button");
    thumb.className = "case-slider__thumb";
    thumb.type = "button";
    thumb.style.backgroundImage = `url("${image.currentSrc || image.src}")`;
    thumb.setAttribute("aria-label", `Показать фото ${index + 1}`);
    thumb.addEventListener("click", () => renderSlide(index));
    thumbs.append(thumb);
  });

  if (images.length > 1) {
    [
      ["prev", "Предыдущее фото", -1],
      ["next", "Следующее фото", 1],
    ].forEach(([direction, label, step]) => {
      const button = document.createElement("button");
      button.className = `case-slider__nav case-slider__nav--${direction}`;
      button.type = "button";
      button.setAttribute("aria-label", label);
      button.addEventListener("click", () => renderSlide(activeIndex + step));
      gallery.append(button);
    });
    gallery.after(thumbs);
  }

  renderSlide(0);
});

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

initCalculators(submitLeadForm);
const homePriceForm = document.querySelector("#price-form");
const homePriceStatus = homePriceForm?.querySelector(".home-price__status");

const installmentForm = document.querySelector("#installment-form");
const installmentStatus = installmentForm?.querySelector(
  ".installment-banner__status",
);
installmentForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!installmentForm.reportValidity()) return;
  const submitButton = installmentForm.querySelector('button[type="submit"]');
  const submitButtonContent = submitButton?.innerHTML;
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = "Отправляем…";
  }
  try {
    await submitLeadForm(installmentForm, "balcony-installment");
    installmentStatus.textContent =
      "Спасибо! Менеджер свяжется с вами и расскажет об условиях рассрочки.";
    installmentForm.reset();
  } catch (error) {
    installmentStatus.textContent =
      error.message || "Не удалось отправить заявку. Позвоните нам.";
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.innerHTML = submitButtonContent;
    }
  }
});

homePriceForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!homePriceForm.reportValidity()) return;
  const submitButton = homePriceForm.querySelector('button[type="submit"]');
  const submitButtonContent = submitButton?.innerHTML;
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = "Отправляем…";
  }
  try {
    await submitLeadForm(homePriceForm, "home-window-price");
    homePriceStatus.textContent =
      "Спасибо! Отправим прайс и уточним детали вашего объекта.";
    homePriceForm.reset();
  } catch (error) {
    homePriceStatus.textContent =
      error.message || "Не удалось отправить заявку. Позвоните нам.";
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.innerHTML = submitButtonContent;
    }
  }
});
