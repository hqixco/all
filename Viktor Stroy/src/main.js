import { isFacadePage, isFloorPage } from "./facade-page.js";

const menuButton = document.querySelector(".menu-button");
const nav = document.querySelector(".main-nav");
const servicesMenu = document.querySelector(".services-menu");
const mobileServicesMenu = window.matchMedia("(max-width: 950px)");
const phoneTemplate = "+7 (___) ___-__-__";
const phonePattern = "\\+7 \\(\\d{3}\\) \\d{3}-\\d{2}-\\d{2}";

const casesGrid = document.querySelector(".works__cases");
if (casesGrid) {
  [...casesGrid.querySelectorAll(".case-card")]
    .sort((firstCase, secondCase) => {
      const getCaseArea = (caseCard) =>
        Number(
          caseCard.querySelector(".case-card__breakdown div:nth-child(3) strong")
            ?.textContent.match(/\d+/)?.[0] || 0,
        );

      return getCaseArea(secondCase) - getCaseArea(firstCase);
    })
    .forEach((caseCard) => casesGrid.append(caseCard));
}

function getPhoneDigits(value) {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("7") || digits.startsWith("8")) {
    digits = digits.slice(1);
  }
  return digits.slice(0, 10);
}

function formatPhoneMask(value) {
  const digits = getPhoneDigits(value).padEnd(10, "_");
  return `+7 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 8)}-${digits.slice(8, 10)}`;
}

function preparePhoneInput(input) {
  input.placeholder = phoneTemplate;
  input.inputMode = "numeric";
  input.maxLength = 18;
  input.pattern = phonePattern;
  input.title = "Введите телефон полностью: +7 (999) 999-99-99";
}

function movePhoneCursorToEnd(input) {
  window.requestAnimationFrame(() => {
    const end = input.value.length;
    input.setSelectionRange(end, end);
  });
}

document.querySelectorAll('input[type="tel"]').forEach(preparePhoneInput);

document.addEventListener("focusin", (event) => {
  const input = event.target;
  if (!(input instanceof HTMLInputElement) || input.type !== "tel") return;
  preparePhoneInput(input);
  input.value = formatPhoneMask(input.value);
  movePhoneCursorToEnd(input);
});

document.addEventListener("input", (event) => {
  const input = event.target;
  if (!(input instanceof HTMLInputElement) || input.type !== "tel") return;
  input.value = formatPhoneMask(input.value);
  movePhoneCursorToEnd(input);
});

document.addEventListener("keydown", (event) => {
  const input = event.target;
  if (!(input instanceof HTMLInputElement) || input.type !== "tel") return;

  if (/^\d$/.test(event.key) && !event.ctrlKey && !event.metaKey) {
    event.preventDefault();
    const digits = getPhoneDigits(input.value);
    if (digits.length < 10) {
      input.value = formatPhoneMask(`+7${digits}${event.key}`);
      movePhoneCursorToEnd(input);
    }
    return;
  }

  if (!["Backspace", "Delete"].includes(event.key)) return;

  event.preventDefault();
  const digits = getPhoneDigits(input.value).slice(0, -1);
  input.value = formatPhoneMask(`+7${digits}`);
  input.dispatchEvent(new Event("input", { bubbles: true }));
});

menuButton?.addEventListener("click", () => {
  nav?.classList.toggle("is-open");
  menuButton.classList.toggle("is-active");
});

servicesMenu?.addEventListener("mouseenter", () => {
  if (!mobileServicesMenu.matches) servicesMenu.open = true;
});

servicesMenu?.addEventListener("mouseleave", () => {
  if (!mobileServicesMenu.matches) servicesMenu.open = false;
});

servicesMenu?.addEventListener("focusin", () => {
  if (!mobileServicesMenu.matches) servicesMenu.open = true;
});

servicesMenu?.addEventListener("focusout", (event) => {
  if (
    !mobileServicesMenu.matches &&
    !servicesMenu.contains(event.relatedTarget)
  ) {
    servicesMenu.open = false;
  }
});

servicesMenu?.querySelector("summary")?.addEventListener("click", (event) => {
  if (!mobileServicesMenu.matches) event.preventDefault();
});

const costModal = document.querySelector(".cost-modal");
const costModalTitle = costModal?.querySelector("#cost-modal-title");
const costModalWork = costModal?.querySelector(".cost-modal__work");

function openAnimatedModal(modal) {
  if (!modal) return;
  modal.classList.remove("is-closing");
  if (!modal.open) modal.showModal();
  requestAnimationFrame(() => {
    requestAnimationFrame(() => modal.classList.add("is-visible"));
  });
}

function closeAnimatedModal(modal) {
  if (!modal?.open || modal.classList.contains("is-closing")) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    modal.close();
    modal.classList.remove("is-visible", "is-closing");
    return;
  }
  modal.classList.remove("is-visible");
  modal.classList.add("is-closing");
  window.setTimeout(() => {
    modal.close();
    modal.classList.remove("is-closing");
  }, 220);
}

document.querySelectorAll("[data-cost-popup]").forEach((button) => {
  if (button.getAttribute("role") === "button") {
    button.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      button.click();
    });
  }

  button.addEventListener("click", () => {
    const workType = button.dataset.costPopup;
    const caseCard = button.closest(".case-card");
    const popupTitle = caseCard
      ? `Рассчитать такой же объект, как «${workType}»`
      : workType;

    costModalTitle.textContent = popupTitle;
    costModalWork.value = popupTitle;

    openAnimatedModal(costModal);
  });
});

costModal
  ?.querySelector(".cost-modal__close")
  ?.addEventListener("click", () => {
    closeAnimatedModal(costModal);
  });

costModal?.addEventListener("click", (event) => {
  if (event.target === costModal) closeAnimatedModal(costModal);
});

costModal?.addEventListener("cancel", (event) => {
  event.preventDefault();
  closeAnimatedModal(costModal);
});

const submittingLeadForms = new WeakSet();

function isLocalSubmissionMode() {
  const { hostname, protocol, port } = window.location;
  return (
    ["localhost", "127.0.0.1", ""].includes(hostname) ||
    hostname.endsWith(".local") ||
    /^192\.168\.|^10\.|^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname) ||
    protocol === "file:" ||
    ["5173", "4173"].includes(port)
  );
}

async function sendLeadForm(form) {
  if (isLocalSubmissionMode()) {
    await new Promise((resolve) => window.setTimeout(resolve, 400));
    return true;
  }

  const formData = new FormData(form);
  formData.set(
    "form_name",
    form.dataset.formName || "Заявка с сайта «Виктор Строй»",
  );
  formData.set("page_url", window.location.href);

  const response = await fetch("/mail.php", {
    method: "POST",
    body: formData,
  });
  const result = await response.json().catch(() => null);

  if (!response.ok || !result?.success) {
    throw new Error(result?.message || "Не удалось отправить заявку");
  }

  return false;
}

function trackLeadFormGoal() {
  if (typeof window.ym !== "function") return;

  const pathname = window.location.pathname;
  const goalId = pathname.startsWith("/uteplenie-polov")
    ? "uteplenie_polov_lead"
    : pathname.startsWith("/uteplenie-fasada")
      ? "uteplenie_fasada_lead"
      : "lead_form_submit";

  window.ym(112304363, "reachGoal", goalId);
}

function bindLeadForm(form) {
  let status = form.querySelector(".form-status");
  if (!status) {
    status = document.createElement("div");
    status.className = "form-status";
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    form.append(status);
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (submittingLeadForms.has(form)) return;

    const button = form.querySelector('button[type="submit"]');
    const initialText = button?.textContent || "Отправить";
    submittingLeadForms.add(form);
    form.classList.remove("is-submitted", "is-submit-error");
    form.classList.add("is-submitting");
    status.textContent = "Отправляем заявку...";
    if (button) {
      button.disabled = true;
      button.textContent = "Отправляем...";
    }

    try {
      const localSubmit = await sendLeadForm(form);
      if (!localSubmit) trackLeadFormGoal();
      form.classList.remove("is-submitting", "is-submit-error");
      form.classList.add("is-submitted");
      status.textContent = localSubmit
        ? "Локальная проверка: заявка не отправлена."
        : "Заявка отправлена. Мы свяжемся с вами в ближайшее время.";
      if (!localSubmit) form.reset();
      if (button) button.textContent = localSubmit ? initialText : "Отправлено";
      if (!localSubmit && form === costModal?.querySelector("form")) {
        window.setTimeout(() => closeAnimatedModal(costModal), 900);
      }
    } catch (error) {
      form.classList.remove("is-submitting", "is-submitted");
      form.classList.add("is-submit-error");
      status.textContent =
        error instanceof Error ? error.message : "Ошибка отправки заявки";
      if (button) button.textContent = initialText;
    } finally {
      if (button) button.disabled = false;
      submittingLeadForms.delete(form);
    }
  });
}

document
  .querySelectorAll(
    ".estimate-form, .hero-form, .cost-modal__form, .estimator-quiz",
  )
  .forEach(bindLeadForm);

document
  .querySelector("[data-cases-show-all]")
  ?.addEventListener("click", (event) => {
    event.currentTarget
      .closest(".cases-section")
      ?.classList.add("is-cases-expanded");
    event.currentTarget.hidden = true;
  });

function setupReviewTextDisclosures() {
  document.querySelectorAll(".reviews-section .review-card").forEach((card) => {
    const text = card.querySelector("p");
    if (!text) return;

    let toggle = card.querySelector(".review-card__toggle");
    if (!toggle) {
      toggle = document.createElement("button");
      toggle.className = "review-card__toggle";
      toggle.type = "button";
      toggle.setAttribute("aria-label", "Показать отзыв полностью");
      text.insertAdjacentElement("afterend", toggle);
      toggle.addEventListener("click", () => {
        const isOpen = card.classList.toggle("is-review-open");
        toggle.setAttribute("aria-expanded", String(isOpen));
        toggle.setAttribute(
          "aria-label",
          isOpen ? "Свернуть отзыв" : "Показать отзыв полностью",
        );
      });
    }

    const wasOpen = card.classList.contains("is-review-open");
    card.classList.remove("has-review-toggle");
    const shouldCollapse = text.scrollHeight > 82;
    card.classList.toggle("has-review-toggle", shouldCollapse);
    card.classList.toggle("is-review-open", shouldCollapse && wasOpen);
    toggle.hidden = !shouldCollapse;
    toggle.setAttribute("aria-expanded", String(shouldCollapse && wasOpen));
  });
}

setupReviewTextDisclosures();
window.addEventListener("resize", setupReviewTextDisclosures);

const mobileCaseMedia = window.matchMedia("(max-width: 480px)");

function setupCaseDescriptions() {
  document.querySelectorAll(".cases-section .case-card").forEach((card) => {
    const description = card.querySelector(
      ".case-card__breakdown div:nth-child(4) strong",
    );
    if (!description) return;

    let toggle = card.querySelector(".case-card__breakdown-toggle");
    if (!toggle) {
      toggle = document.createElement("button");
      toggle.className = "case-card__breakdown-toggle";
      toggle.type = "button";
      toggle.setAttribute("aria-label", "Показать описание работ полностью");
      description.insertAdjacentElement("afterend", toggle);
      toggle.addEventListener("click", () => {
        const isOpen = card.classList.toggle("is-case-breakdown-open");
        toggle.setAttribute("aria-expanded", String(isOpen));
        toggle.setAttribute(
          "aria-label",
          isOpen
            ? "Свернуть описание работ"
            : "Показать описание работ полностью",
        );
      });
    }

    if (mobileCaseMedia.matches) {
      card.classList.remove("is-case-breakdown-open");
      const shouldCollapse = description.scrollHeight > 58;
      card.classList.toggle("has-case-breakdown-toggle", shouldCollapse);
      toggle.hidden = !shouldCollapse;
      toggle.setAttribute("aria-expanded", "false");
    } else {
      card.classList.remove(
        "has-case-breakdown-toggle",
        "is-case-breakdown-open",
      );
      toggle.hidden = true;
    }
  });
}

setupCaseDescriptions();
mobileCaseMedia.addEventListener("change", setupCaseDescriptions);

const galleryModal = document.querySelector("#gallery-modal");
const galleryContent = galleryModal?.querySelector(".gallery-modal__content");
const galleryState = { images: [], title: "", index: 0 };

function parseCaseImages(slider) {
  try {
    return JSON.parse(slider.dataset.caseSliderImages || "[]");
  } catch {
    return [];
  }
}

function updateCaseSlider(slider, index) {
  const images = parseCaseImages(slider);
  if (!images.length) return;
  const safeIndex = ((index % images.length) + images.length) % images.length;
  slider.dataset.caseSliderIndex = String(safeIndex);
  slider.style.setProperty("--case-card-image", images[safeIndex].image);
  slider
    .closest(".case-card")
    ?.querySelectorAll("[data-case-slider-thumb]")
    .forEach((thumb, thumbIndex) => {
      thumb.classList.toggle("is-active", thumbIndex === safeIndex);
    });
}

function renderGallery() {
  const image = galleryState.images[galleryState.index];
  if (!galleryContent || !image) return;
  const formatImage = (value) => String(value || "").replaceAll('"', "'");
  const hasMultiple = galleryState.images.length > 1;

  galleryContent.innerHTML = `
    <div class="gallery-lightbox">
      <h2 class="gallery-lightbox__title">${galleryState.title}</h2>
      <div class="gallery-lightbox__stage">
        <div class="gallery-lightbox__image" style="background-image:${formatImage(image.image)}" role="img" aria-label="${image.title || galleryState.title}"></div>
        ${hasMultiple ? '<button class="gallery-lightbox__nav gallery-lightbox__nav--prev" type="button" data-gallery-nav="prev" aria-label="Предыдущее фото"></button><button class="gallery-lightbox__nav gallery-lightbox__nav--next" type="button" data-gallery-nav="next" aria-label="Следующее фото"></button>' : ""}
      </div>
      ${
        hasMultiple
          ? `<div class="gallery-lightbox__thumbs">${galleryState.images
              .map(
                (item, index) =>
                  `<button class="gallery-lightbox__thumb${index === galleryState.index ? " is-active" : ""}" type="button" data-gallery-thumb="${index}" aria-label="Открыть фото ${index + 1}"><span style="background-image:${formatImage(item.image)}"></span></button>`,
              )
              .join("")}</div>`
          : ""
      }
    </div>`;
}

document.querySelectorAll("[data-case-slider]").forEach((slider) => {
  updateCaseSlider(slider, Number(slider.dataset.caseSliderIndex || 0));

  slider.querySelectorAll("[data-case-slider-nav]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const current = Number(slider.dataset.caseSliderIndex || 0);
      updateCaseSlider(
        slider,
        button.dataset.caseSliderNav === "prev" ? current - 1 : current + 1,
      );
    });
  });

  slider
    .closest(".case-card")
    ?.querySelectorAll("[data-case-slider-thumb]")
    .forEach((thumb) => {
      thumb.addEventListener("click", () => {
        updateCaseSlider(slider, Number(thumb.dataset.caseSliderThumb));
      });
    });

  slider
    .querySelector("[data-case-slider-open]")
    ?.addEventListener("click", () => {
      galleryState.images = parseCaseImages(slider);
      galleryState.title =
        slider
          .closest(".case-card")
          ?.querySelector(".case-card__title")
          ?.textContent.trim() || "Фотографии объекта";
      galleryState.index = Number(slider.dataset.caseSliderIndex || 0);
      renderGallery();
      openAnimatedModal(galleryModal);
    });
});

galleryContent?.addEventListener("click", (event) => {
  const nav = event.target.closest("[data-gallery-nav]");
  const thumb = event.target.closest("[data-gallery-thumb]");
  if (nav) {
    const step = nav.dataset.galleryNav === "prev" ? -1 : 1;
    galleryState.index =
      (galleryState.index + step + galleryState.images.length) %
      galleryState.images.length;
    renderGallery();
  } else if (thumb) {
    galleryState.index = Number(thumb.dataset.galleryThumb);
    renderGallery();
  }
});

galleryModal
  ?.querySelector(".gallery-modal__close")
  ?.addEventListener("click", () => closeAnimatedModal(galleryModal));

galleryModal?.addEventListener("click", (event) => {
  if (event.target === galleryModal) closeAnimatedModal(galleryModal);
});

galleryModal?.addEventListener("cancel", (event) => {
  event.preventDefault();
  closeAnimatedModal(galleryModal);
});

const estimatorQuiz = document.querySelector(".estimator-quiz");
const estimatorOptions = estimatorQuiz?.querySelector(".estimator-options");
const estimatorStepLabel = estimatorQuiz?.querySelector(
  ".estimator-quiz__step",
);
const estimatorTitle = estimatorQuiz?.querySelector("h2");
const estimatorProgress = estimatorQuiz?.querySelector(
  ".estimator-progress span",
);
const estimatorNext = estimatorQuiz?.querySelector(".estimator-quiz__next");
const estimatorPrev = estimatorQuiz?.querySelector(".estimator-quiz__prev");

const floorQuestions = [
  {
    title: "Какой пол нужно утеплить?",
    name: "floor_scope",
    options: [
      ["Весь первый этаж", "/assets/quiz-floor-entire-first-floor.webp"],
      ["Одна или две комнаты", "/assets/quiz-floor-one-two-rooms.webp"],
      ["Пол на даче", "/assets/quiz-floor-country-house.webp"],
      ["Пол над подвалом", "/assets/quiz-floor-above-basement.webp"],
      ["Пол на веранде", "/assets/quiz-floor-veranda.webp"],
      ["Пока не знаю", "/assets/quiz-floor-unsure.webp"],
    ],
  },
  {
    title: "Что сейчас не устраивает в полу?",
    name: "floor_condition",
    options: [
      ["Пол холодный", "/assets/quiz-floor-condition-cold.webp"],
      ["Скрипит или прогибается", "/assets/quiz-floor-condition-squeaking.webp"],
      ["Есть сырость или запах", "/assets/quiz-floor-condition-damp.webp"],
      ["Повреждены лаги или настил", "/assets/quiz-floor-condition-damaged-joists.webp"],
      ["Нужен полный разбор пола", "/assets/quiz-floor-condition-full-removal.webp"],
      ["Не знаю — нужна диагностика", "/assets/quiz-floor-condition-inspection.webp"],
    ],
  },
  {
    title: "Какова примерная площадь утепления?",
    name: "floor_area",
    options: [["До 30 м²"], ["30–60 м²"], ["60–100 м²"], ["100–150 м²"], ["Больше 150 м²"], ["Не знаю площадь"]],
  },
  {
    title: "Когда планируете утепление пола?",
    name: "start_time",
    options: [["Срочно"], ["В течение недели"], ["В этом месяце"], ["Через 1–2 месяца"], ["Планирую заранее"], ["После консультации"]],
  },
];

const estimatorQuestions = isFloorPage
  ? floorQuestions
  : isFacadePage
  ? [
      {
        title: "Какой фасад нужно утеплить?",
        name: "facade_scope",
        options: [
          ["Весь дом", "/assets/quiz-facade-whole-house.webp"],
          ["Одна или две стены", "/assets/quiz-facade-partial-walls.webp"],
          ["Фасад нового дома", "/assets/quiz-facade-new-house.webp"],
          ["Старый фасад", "/assets/quiz-facade-old-house.webp"],
          ["Цоколь и фасад", "/assets/quiz-facade-plinth.webp"],
          ["Пока не знаю", "/assets/quiz-facade-consultation.webp"],
        ],
      },
      {
        title: "Какой вариант утепления рассматриваете?",
        name: "facade_material",
        options: [
          ["Минеральная вата", "/assets/quiz-facade-mineral-wool.webp"],
          ["Пенополистирол", "/assets/quiz-facade-polystyrene.webp"],
          ["Мокрый фасад", "/assets/quiz-facade-plaster-system.webp"],
          ["Вентилируемый фасад", "/assets/quiz-facade-ventilated.webp"],
          ["Материал уже куплен", "/assets/quiz-facade-material-purchased.webp"],
          ["Нужна консультация", "/assets/quiz-facade-consultation.webp"],
        ],
      },
      {
        title: "Какая примерная площадь фасада?",
        name: "facade_area",
        options: [["До 100 м²"], ["100–180 м²"], ["180–280 м²"], ["280–400 м²"], ["Больше 400 м²"], ["Не знаю площадь"]],
      },
      {
        title: "Когда хотите начать работы?",
        name: "start_time",
        options: [["Срочно"], ["В течение недели"], ["В этом месяце"], ["Через 1–2 месяца"], ["Планирую заранее"], ["После консультации"]],
      },
    ]
  : [
  {
    title: "Что необходимо сделать?",
    name: "replacement_scope",
    options: [
      ["Полная замена кровли", "/assets/quiz-full-roof-replacement.webp"],
      ["Замена покрытия", "/assets/quiz-cover-replacement.webp"],
      ["Ремонт кровли", "/assets/task-pipe-window-leak.webp"],
      ["Водостоки и доборы", "/assets/quiz-gutters-flashing.webp"],
      ["Утепление и основание", "/assets/quiz-insulation-base.webp"],
      ["Пока не знаю", "/assets/quiz-not-sure.webp"],
    ],
  },
  {
    title: "Какое покрытие рассматриваете?",
    name: "roof_material",
    options: [
      ["Металлочерепица", "/assets/quiz-metal-tile.webp"],
      ["Профнастил", "/assets/quiz-profiled-sheet.webp"],
      ["Гибкая черепица", "/assets/quiz-flexible-shingles.webp"],
      ["Фальцевая кровля", "/assets/quiz-standing-seam.webp"],
      ["Нужна консультация", "/assets/photo-estimate-collage-center.webp"],
      ["Материал уже куплен", "/assets/quiz-material-purchased.webp"],
    ],
  },
  {
    title: "Какая примерная площадь кровли?",
    name: "roof_area",
    options: [
      ["До 80 м²"],
      ["80–140 м²"],
      ["140–220 м²"],
      ["220–350 м²"],
      ["Больше 350 м²"],
      ["Не знаю площадь"],
    ],
  },
  {
    title: "Когда хотите начать работы?",
    name: "start_time",
    options: [
      ["Срочно"],
      ["В течение недели"],
      ["В этом месяце"],
      ["Через 1–2 месяца"],
      ["Планирую заранее"],
      ["После консультации"],
    ],
  },
    ];

let estimatorCurrentStep = 0;
let estimatorIsFinalStep = false;
let estimatorAutoNextTimer;
const estimatorTotalSteps = estimatorQuestions.length + 1;

function setEstimatorAnswer(name, value) {
  if (!estimatorQuiz) return;
  let input = estimatorQuiz.querySelector(
    `input[type="hidden"][name="${name}"]`,
  );
  if (!input) {
    input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    estimatorQuiz.append(input);
  }
  input.value = value;
}

function renderEstimatorStep() {
  if (
    !estimatorQuiz ||
    !estimatorOptions ||
    !estimatorStepLabel ||
    !estimatorTitle ||
    !estimatorNext
  )
    return;

  estimatorIsFinalStep = false;
  const question = estimatorQuestions[estimatorCurrentStep];
  const stepNumber = estimatorCurrentStep + 1;
  const savedValue = estimatorQuiz.querySelector(
    `input[type="hidden"][name="${question.name}"]`,
  )?.value;

  estimatorStepLabel.textContent = `Вопрос ${stepNumber} из ${estimatorTotalSteps}`;
  estimatorTitle.textContent = question.title;
  estimatorProgress.style.width = `${(stepNumber / estimatorTotalSteps) * 100}%`;
  estimatorPrev.disabled = estimatorCurrentStep === 0;
  estimatorNext.type = "button";
  estimatorNext.classList.remove("estimator-quiz__submit");
  estimatorNext.textContent =
    estimatorCurrentStep === estimatorQuestions.length - 1
      ? isFloorPage
        ? "Перейти к расчёту"
        : "Перейти к заявке"
      : "Следующий вопрос";

  estimatorOptions.innerHTML = question.options
    .map(([label, image], index) => {
      const checked = savedValue ? savedValue === label : index === 0;
      const visibleLabel =
        image === "/assets/quiz-metal-tile.webp"
          ? "Металло&shy;черепица"
          : label;
      return `
        <label class="estimator-option${image ? "" : " estimator-option--text"}">
          <input type="radio" name="${question.name}_choice" value="${label}"${checked ? " checked" : ""} />
          ${image ? `<img src="${image}" alt="" />` : ""}
          <span>${visibleLabel}</span>
        </label>`;
    })
    .join("");

  const checkedInput = estimatorOptions.querySelector(
    'input[type="radio"]:checked',
  );
  if (checkedInput) setEstimatorAnswer(question.name, checkedInput.value);
}

function renderEstimatorLeadStep() {
  if (
    !estimatorOptions ||
    !estimatorStepLabel ||
    !estimatorTitle ||
    !estimatorProgress ||
    !estimatorNext
  )
    return;

  estimatorIsFinalStep = true;
  estimatorStepLabel.textContent = `Вопрос ${estimatorTotalSteps} из ${estimatorTotalSteps}`;
  estimatorTitle.textContent = isFloorPage
    ? "Получите расчёт утепления пола"
    : "Получите предварительный расчёт";
  estimatorProgress.style.width = "100%";
  estimatorPrev.disabled = false;
  estimatorOptions.innerHTML = `
    <div class="estimator-lead">
      <label><span>Имя</span><input name="name" type="text" placeholder="Как к вам обращаться" autocomplete="name" /></label>
      <label><span>Телефон</span><input name="phone" type="tel" placeholder="+7 (___) ___-__-__" autocomplete="tel" required /></label>
      <label class="estimator-lead__upload">
        <input name="photos" type="file" accept="image/*" multiple />
        <span><strong>Прикрепите фото ${isFloorPage ? "пола" : isFacadePage ? "фасада" : "крыши"}</strong><small>${isFloorPage ? "Общий вид комнаты, настил и проблемные места" : `Общий вид дома, ${isFacadePage ? "стены, углы и проблемные места" : "кровля или проблемные места"}`}</small></span>
      </label>
      <label class="estimator-lead__policy">
        <input type="checkbox" name="policy" required checked />
        <span>Согласен на обработку персональных данных и принимаю <a href="/politika-konfidentsialnosti/">политику конфиденциальности</a>.</span>
      </label>
    </div>`;
  estimatorNext.type = "submit";
  estimatorNext.classList.add("estimator-quiz__submit");
  estimatorNext.textContent = isFloorPage
    ? "Рассчитать утепление"
    : "Получить расчёт";
}

function goToNextEstimatorStep() {
  window.clearTimeout(estimatorAutoNextTimer);
  if (estimatorIsFinalStep) return;

  const question = estimatorQuestions[estimatorCurrentStep];
  const checkedInput = estimatorOptions?.querySelector(
    'input[type="radio"]:checked',
  );
  if (!checkedInput) return;
  setEstimatorAnswer(question.name, checkedInput.value);

  if (estimatorCurrentStep < estimatorQuestions.length - 1) {
    estimatorCurrentStep += 1;
    renderEstimatorStep();
  } else {
    renderEstimatorLeadStep();
  }
}

estimatorOptions?.addEventListener("change", (event) => {
  const input = event.target;
  if (!(input instanceof HTMLInputElement) || input.type !== "radio") return;
  setEstimatorAnswer(
    estimatorQuestions[estimatorCurrentStep].name,
    input.value,
  );
  window.clearTimeout(estimatorAutoNextTimer);
  estimatorAutoNextTimer = window.setTimeout(goToNextEstimatorStep, 300);
});

estimatorNext?.addEventListener("click", () => {
  if (estimatorNext.type === "button") goToNextEstimatorStep();
});

estimatorPrev?.addEventListener("click", () => {
  window.clearTimeout(estimatorAutoNextTimer);
  if (estimatorIsFinalStep) {
    renderEstimatorStep();
    return;
  }
  if (estimatorCurrentStep === 0) return;
  estimatorCurrentStep -= 1;
  renderEstimatorStep();
});

renderEstimatorStep();
