const quizPosition = document.querySelector("#quiz-position");
const calculatorSection = document.querySelector(".calculator");

const PHONE_PATTERN = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/;

const getPhoneDigits = (value) => {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("7") || digits.startsWith("8")) digits = digits.slice(1);
  return digits.slice(0, 10);
};

const formatPhone = (digits) => {
  if (!digits) return "";
  let value = `+7 (${digits.slice(0, 3)}`;
  if (digits.length >= 3) value += `) ${digits.slice(3, 6)}`;
  if (digits.length >= 6) value += `-${digits.slice(6, 8)}`;
  if (digits.length >= 8) value += `-${digits.slice(8, 10)}`;
  return value;
};

const preparePhoneInput = (input) => {
  input.placeholder = "+7 (___) ___-__-__";
  input.inputMode = "numeric";
  input.autocomplete = "tel";
  input.maxLength = 18;
  input.pattern = "\\+7 \\(\\d{3}\\) \\d{3}-\\d{2}-\\d{2}";
};

document.querySelectorAll('input[type="tel"]').forEach(preparePhoneInput);

document.addEventListener("focusin", (event) => {
  if (!event.target.matches('input[type="tel"]')) return;
  preparePhoneInput(event.target);
  if (!event.target.value) event.target.value = "+7 (";
  event.target.setSelectionRange(event.target.value.length, event.target.value.length);
});

document.addEventListener("input", (event) => {
  if (!event.target.matches('input[type="tel"]')) return;
  const input = event.target;
  const digits = getPhoneDigits(input.value);
  input.value = digits ? formatPhone(digits) : "+7 (";
  input.setCustomValidity(
    digits.length === 0 || PHONE_PATTERN.test(input.value)
      ? ""
      : "Введите номер полностью: +7 (___) ___-__-__",
  );
  input.setSelectionRange(input.value.length, input.value.length);
});

document.addEventListener("blur", (event) => {
  if (!event.target.matches('input[type="tel"]')) return;
  const input = event.target;
  const digits = getPhoneDigits(input.value);
  if (!digits) input.value = "";
  input.setCustomValidity(
    digits.length === 0 || PHONE_PATTERN.test(input.value)
      ? ""
      : "Введите номер полностью: +7 (___) ___-__-__",
  );
}, true);

const isLocalSubmissionMode = () =>
  location.protocol === "file:" ||
  ["localhost", "127.0.0.1", "0.0.0.0"].includes(location.hostname) ||
  ["5173", "4173"].includes(location.port);

const trackFormSubmitGoal = () => {
  if (typeof window.ym === "function") {
    window.ym(111908462, "reachGoal", "roofing_form_submit");
  }
};

const sendLeadForm = async (form, extraFields = {}) => {
  const data = new FormData(form);
  Object.entries(extraFields).forEach(([key, value]) => data.set(key, value));
  data.set("form_name", form.dataset.formName || "Заявка с сайта");
  data.set("page_url", location.href);

  if (isLocalSubmissionMode()) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { success: true };
  }

  const response = await fetch("/mail.php", { method: "POST", body: data });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.success) {
    throw new Error(result.message || "Не удалось отправить заявку. Попробуйте ещё раз.");
  }
  return result;
};

const submitLeadForm = async (form, extraFields = {}) => {
  if (form.dataset.submitting === "true") return false;
  const button = form.querySelector('[type="submit"]');
  let status = form.querySelector(".form-status");
  if (!status) {
    status = document.createElement("div");
    status.className = "form-status";
    status.setAttribute("role", "status");
    form.append(status);
  }
  form.dataset.submitting = "true";
  form.classList.remove("is-submit-error", "is-submitted");
  status.textContent = "Отправляем заявку…";
  if (button) button.disabled = true;
  try {
    await sendLeadForm(form, extraFields);
    trackFormSubmitGoal();
    form.classList.add("is-submitted");
    status.textContent = "Заявка отправлена. Скоро свяжемся с вами.";
    return true;
  } catch (error) {
    form.classList.add("is-submit-error");
    status.textContent = error.message;
    return false;
  } finally {
    form.dataset.submitting = "false";
    if (button) button.disabled = false;
  }
};

const header = document.querySelector(".site-header");
const headerBurger = document.querySelector(".header-burger");
const mainNavigation = document.querySelector(".main-nav");

if (header && headerBurger && mainNavigation) {
  const closeHeaderMenu = () => {
    headerBurger.classList.remove("is-open");
    mainNavigation.classList.remove("is-open");
    headerBurger.setAttribute("aria-expanded", "false");
    headerBurger.setAttribute("aria-label", "Открыть меню");
  };

  headerBurger.addEventListener("click", () => {
    const willOpen = !mainNavigation.classList.contains("is-open");
    headerBurger.classList.toggle("is-open", willOpen);
    mainNavigation.classList.toggle("is-open", willOpen);
    headerBurger.setAttribute("aria-expanded", String(willOpen));
    headerBurger.setAttribute(
      "aria-label",
      willOpen ? "Закрыть меню" : "Открыть меню",
    );
  });

  mainNavigation.querySelectorAll("a").forEach((link) =>
    link.addEventListener("click", closeHeaderMenu),
  );
  document.addEventListener("click", (event) => {
    if (!header.contains(event.target)) closeHeaderMenu();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeHeaderMenu();
  });
}

if (quizPosition && calculatorSection)
  quizPosition.replaceWith(calculatorSection);

const calculator = document.querySelector(".calculator-grid");

if (calculator) {
  const questions = [
    {
      title: "Что необходимо сделать?",
      name: "replacement_scope",
      options: [
        ["Полная замена кровли", "quiz-scope-full-replacement.webp"],
        ["Замена покрытия", "quiz-scope-cover-replacement.webp"],
        ["Ремонт кровли", "quiz-scope-roof-repair.webp"],
        ["Водостоки и доборы", "quiz-scope-gutters-flashing.webp"],
        ["Утепление и основание", "quiz-scope-insulation-base.webp"],
        ["Пока не знаю", "quiz-scope-consultation.webp"],
      ],
    },
    {
      title: "Какое покрытие рассматриваете?",
      name: "roof_material",
      options: [
        ["Металлочерепица", "quiz-material-metal-tile-roof.webp"],
        ["Профнастил", "quiz-material-profiled-sheet-roof.webp"],
        ["Гибкая черепица", "quiz-material-flexible-shingles-roof.webp"],
        ["Фальцевая кровля", "quiz-material-standing-seam-roof.webp"],
        ["Нужна консультация", "quiz-material-consultation-roof.webp"],
        ["Материал уже куплен", "quiz-material-purchased-stock.webp"],
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
  const answers = new Map();
  const totalSteps = questions.length + 1;
  let currentStep = 0;
  let isFinalStep = false;
  let autoNextTimer;

  calculator.innerHTML = `<div class="estimator-shell">
    <aside class="estimator-manager" aria-label="Прораб">
      <div class="estimator-manager__photo"><img src="/assets/quiz/roof-estimator-foreman-phone.webp" alt="Прораб Строй Будущее отвечает на звонок на объекте по замене кровли"><span>Сейчас онлайн</span></div>
      <div class="estimator-manager__person"><strong class="estimator-manager__name">Александр</strong><span class="estimator-manager__role">Прораб</span></div>
      <ul class="estimator-manager__features"><li>Расчёт стоимости<span>Посчитает материалы, работу и доставку под вашу крышу</span></li><li>Подбор решения<span>Подскажет покрытие и порядок работ без лишних затрат</span></li></ul>
      <div class="estimator-manager__reply">Ответим за 10 минут</div>
    </aside>
    <form class="estimator-quiz" data-form-name="Расчёт стоимости кровли">
      <div class="estimator-progress"><span></span></div><span class="estimator-quiz__step"></span><h2></h2><div class="estimator-options"></div>
      <div class="estimator-quiz__bottom"><button class="button estimator-quiz__prev" type="button" disabled>Назад</button><button class="button button--primary estimator-quiz__next" type="button">Следующий вопрос</button></div>
    </form>
  </div>`;

  const form = calculator.querySelector(".estimator-quiz");
  const stepLabel = calculator.querySelector(".estimator-quiz__step");
  const title = calculator.querySelector(".estimator-quiz h2");
  const options = calculator.querySelector(".estimator-options");
  const progress = calculator.querySelector(".estimator-progress span");
  const next = calculator.querySelector(".estimator-quiz__next");
  const previous = calculator.querySelector(".estimator-quiz__prev");

  function renderQuestion() {
    isFinalStep = false;
    const question = questions[currentStep];
    stepLabel.textContent = `Вопрос ${currentStep + 1} из ${totalSteps}`;
    title.textContent = question.title;
    progress.style.width = `${((currentStep + 1) / totalSteps) * 100}%`;
    previous.disabled = currentStep === 0;
    next.type = "button";
    next.textContent =
      currentStep === questions.length - 1
        ? "Перейти к заявке"
        : "Следующий вопрос";
    options.innerHTML = question.options
      .map(
        ([label, image], index) =>
          `<label class="estimator-option${image ? "" : " estimator-option--text"}"><input type="radio" name="${question.name}" value="${label}" ${answers.get(question.name) === label || (!answers.has(question.name) && currentStep === 0 && index === 0) ? "checked" : ""}>${image ? `<img src="/assets/quiz/${image}" alt="">` : ""}<span>${label}</span></label>`,
      )
      .join("");
    const selected = options.querySelector("input:checked");
    if (selected) answers.set(question.name, selected.value);
  }

  function renderLead() {
    isFinalStep = true;
    stepLabel.textContent = `Вопрос ${totalSteps} из ${totalSteps}`;
    title.textContent = "Получите предварительный расчёт";
    progress.style.width = "100%";
    previous.disabled = false;
    next.type = "submit";
    next.textContent = "Получить расчёт";
    options.innerHTML = `<div class="estimator-lead"><label><span>Имя</span><input name="name" type="text" placeholder="Как к вам обращаться"></label><label><span>Телефон</span><input name="phone" type="tel" placeholder="+7 (___) ___-__-__" required></label><label class="file-field"><span>Фото крыши</span><span class="file-field__box"><strong>Прикрепите фото крыши</strong><small>Общий вид дома, старая кровля или проблемные места</small><em>Выбрать файлы</em></span><input name="photos[]" type="file" accept="image/*" multiple></label><label class="policy-check"><input type="checkbox" required><span>Согласен на обработку персональных данных и принимаю <a href="#privacy">политику конфиденциальности</a>.</span></label></div>`;
    const policyInput = options.querySelector('.policy-check input[type="checkbox"]');
    policyInput.name = "policy";
    policyInput.value = "Да";
  }

  function goNext() {
    clearTimeout(autoNextTimer);
    if (isFinalStep) return;
    const question = questions[currentStep];
    const checked = options.querySelector('input[type="radio"]:checked');
    if (!checked) return;
    answers.set(question.name, checked.value);
    if (currentStep < questions.length - 1) {
      currentStep += 1;
      renderQuestion();
    } else {
      renderLead();
    }
  }

  options.addEventListener("change", (event) => {
    if (event.target.matches('input[type="radio"]')) {
      answers.set(questions[currentStep].name, event.target.value);
      clearTimeout(autoNextTimer);
      autoNextTimer = setTimeout(goNext, 300);
    }
  });
  next.addEventListener("click", () => {
    if (!isFinalStep) goNext();
  });
  previous.addEventListener("click", () => {
    clearTimeout(autoNextTimer);
    if (isFinalStep) {
      renderQuestion();
      return;
    }
    if (currentStep > 0) {
      currentStep -= 1;
      renderQuestion();
    }
  });
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const sent = await submitLeadForm(form, Object.fromEntries(answers));
    if (!sent) return;
    form.innerHTML =
      '<div class="estimator-success"><span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6" /></svg></span><h2>Спасибо, заявка принята</h2><p>Свяжемся с вами и подготовим предварительный расчёт.</p></div>';
  });
  renderQuestion();
}

const roofCalculationModal = document.querySelector(".roof-calculation-modal");

if (roofCalculationModal) {
  const modalTitle = roofCalculationModal.querySelector("h2");
  const modalImage = roofCalculationModal.querySelector(
    ".roof-calculation-modal__image",
  );
  const modalDescription = roofCalculationModal.querySelector(
    ".roof-calculation-modal__description",
  );
  const modalForm = roofCalculationModal.querySelector("form");
  const modalSubmit = roofCalculationModal.querySelector(
    ".roof-calculation-modal__submit",
  );
  const roofTypeInput = roofCalculationModal.querySelector(
    '[name="old_roof_type"]',
  );
  const phoneInput = roofCalculationModal.querySelector('[name="phone"]');
  const closeButtons = roofCalculationModal.querySelectorAll(
    ".roof-calculation-modal__close, .roof-calculation-modal__backdrop",
  );
  let closeTimer;

  const openRoofModal = (
    roofType,
    heading = `Рассчитать стоимость замены ${roofType}`,
    options = {},
  ) => {
    clearTimeout(closeTimer);
    modalTitle.textContent = heading;
    modalForm.dataset.formName = heading;
    modalDescription.textContent =
      options.description ||
      "Оставьте телефон. Уточним площадь и состояние крыши, после чего назовём ориентировочную стоимость работ.";
    modalSubmit.textContent = options.submitLabel || "Получить расчёт";
    modalImage.src =
      options.image || "/assets/images/diagnostic-cover-replacement.webp";
    modalImage.alt = options.imageAlt || heading;
    roofCalculationModal.classList.toggle(
      "is-photo-request",
      Boolean(options.photoRequest),
    );
    roofCalculationModal.classList.toggle("is-no-image", Boolean(options.noImage));
    roofTypeInput.value = roofType;
    roofCalculationModal.setAttribute("aria-hidden", "false");
    roofCalculationModal.classList.add("is-open");
    document.body.style.overflow = "hidden";
    setTimeout(() => phoneInput.focus(), 240);
  };

  const closeRoofModal = () => {
    roofCalculationModal.classList.remove("is-open");
    document.body.style.overflow = "";
    closeTimer = setTimeout(
      () => roofCalculationModal.setAttribute("aria-hidden", "true"),
      240,
    );
  };

  document.querySelectorAll(".old-roof-card__button").forEach((button) => {
    button.addEventListener("click", () =>
      openRoofModal(button.dataset.roofType, undefined, {
        image: button.closest(".old-roof-card").querySelector("img").src,
      }),
    );
  });
  const budgetModalHeadings = {
    Профнастил: "Рассчитать стоимость кровли из профнастила",
    Металлочерепица: "Рассчитать стоимость кровли из металлочерепицы",
    "Мягкая кровля": "Рассчитать стоимость мягкой кровли",
  };
  document.querySelectorAll(".budget-card__button").forEach((button) => {
    button.addEventListener("click", () => {
      const material = button
        .closest(".budget-card")
        .querySelector("h3")
        .textContent.trim();
      openRoofModal(
        `Материал: ${material}`,
        budgetModalHeadings[material] ||
          `Рассчитать стоимость кровли: ${material}`,
        {
          image: button.closest(".budget-card").querySelector("img").src,
        },
      );
    });
  });
  document.querySelectorAll(".case-gallery-card > button").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const caseTitle = button
        .closest(".case-gallery-card")
        .querySelector("h3")
        .textContent.trim();
      openRoofModal(
        `Кейс: ${caseTitle}`,
        `Узнать стоимость такой же кровли как «${caseTitle}»`,
        {
          image: button
            .closest(".case-gallery-card")
            .querySelector(".case-gallery-card__image img").src,
        },
      );
    });
  });
  document
    .querySelectorAll(
      ".foreman-photo-button, .footer-photo-button, .price-photo-button",
    )
    .forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        openRoofModal(
          "Расчёт по фотографиям кровли",
          "Рассчитать стоимость по фото",
          {
            photoRequest: true,
            noImage: true,
            description:
              "Прикрепите 3–5 фотографий дома и кровли. Александр посмотрит состояние, предложит вариант работ и назовёт ориентировочный бюджет.",
            submitLabel: "Отправить фото кровли",
          },
        );
      });
    });
  document.querySelectorAll(".budget-bottom__button").forEach((button) => {
    button.addEventListener("click", () =>
      openRoofModal("Выезд мастера на осмотр", "Вызвать мастера на осмотр", {
        description:
          "Оставьте телефон. Согласуем удобное время бесплатного выезда, осмотрим кровлю и подготовим точную смету.",
        submitLabel: "Вызвать мастера",
        noImage: true,
      }),
    );
  });
  document.querySelectorAll(".geography-request-button").forEach((button) => {
    button.addEventListener("click", () =>
      openRoofModal("Выезд по Владимиру и Владимирской области", "Уточнить выезд бригады", {
        description:
          "Оставьте телефон и назовите населённый пункт. Проверим маршрут, согласуем удобное время и расскажем об условиях выезда на осмотр.",
        submitLabel: "Уточнить возможность выезда",
        image: "/assets/images/roof-discovery-replacement-house.webp",
      }),
    );
  });
  document.querySelectorAll(".header-callback-button").forEach((button) => {
    button.addEventListener("click", () =>
      openRoofModal("Обратный звонок", "Заказать обратный звонок", {
        description:
          "Оставьте телефон. Прораб перезвонит, ответит на вопросы и подскажет, как предварительно оценить вашу кровлю.",
        submitLabel: "Заказать звонок",
        noImage: true,
      }),
    );
  });
  closeButtons.forEach((button) =>
    button.addEventListener("click", closeRoofModal),
  );
  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      roofCalculationModal.classList.contains("is-open")
    )
      closeRoofModal();
  });
  modalForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const sent = await submitLeadForm(modalForm);
    if (!sent) return;
    modalForm.innerHTML =
      '<div class="roof-calculation-modal__success"><strong>Заявка принята</strong><span>Перезвоним, уточним параметры крыши и подготовим ориентировочный расчёт.</span></div>';
  });
}

document.querySelectorAll(".offer-form").forEach((form) => {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const sent = await submitLeadForm(form);
    if (sent && !isLocalSubmissionMode()) form.reset();
  });
});

document.querySelectorAll(".reviews-section .review-card").forEach((card) => {
  const text = card.querySelector("p");
  if (!text || text.scrollHeight <= 82) return;
  const toggle = document.createElement("button");
  toggle.className = "review-card__toggle";
  toggle.type = "button";
  toggle.setAttribute("aria-label", "Показать отзыв полностью");
  toggle.setAttribute("aria-expanded", "false");
  card.classList.add("has-review-toggle");
  text.insertAdjacentElement("afterend", toggle);
  const changeState = () => {
    const isOpen = card.classList.toggle("is-review-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute(
      "aria-label",
      isOpen ? "Свернуть отзыв" : "Показать отзыв полностью",
    );
  };
  toggle.addEventListener("click", changeState);
  text.addEventListener("click", changeState);
});

const caseCards = Array.from(document.querySelectorAll(".case-gallery-card"));
const galleryModal = document.querySelector("#galleryModal");
const galleryModalContent = galleryModal?.querySelector(".modal-content");

if (caseCards.length && galleryModal && galleryModalContent) {
  let activeCard = null;
  let activeIndex = 0;
  let closeTimer = null;

  const getImages = (card) => {
    const image = card.querySelector(".case-gallery-card__image img");
    const customImages = image.dataset.galleryImages
      ?.split("|")
      .filter(Boolean);
    if (customImages?.length) return customImages;
    const firstImage = image.dataset.firstImage;
    return [firstImage, firstImage.replace(".webp", "-detail.webp")];
  };

  const showCardImage = (card, index) => {
    const images = getImages(card);
    const safeIndex = (index + images.length) % images.length;
    card.dataset.slide = String(safeIndex);
    card.querySelector(".case-gallery-card__image img").src = images[safeIndex];
  };

  const renderGalleryModal = () => {
    const images = getImages(activeCard);
    activeIndex = (activeIndex + images.length) % images.length;
    const title = activeCard.querySelector("h3").textContent.trim();
    const image = images[activeIndex];

    galleryModalContent.innerHTML = `
      <div class="gallery-lightbox">
        <h2 class="gallery-lightbox__title">${title}</h2>
        <div class="gallery-lightbox__stage">
          <div class="gallery-lightbox__image" style="background-image: url('${image}')" aria-label="${title}" role="img"></div>
          <button class="gallery-lightbox__nav gallery-lightbox__nav--prev" type="button" data-gallery-modal-nav="prev" aria-label="Предыдущее фото"></button>
          <button class="gallery-lightbox__nav gallery-lightbox__nav--next" type="button" data-gallery-modal-nav="next" aria-label="Следующее фото"></button>
        </div>
        <div class="gallery-lightbox__thumbs" aria-label="Фотографии кейса">
          ${images
            .map(
              (item, index) => `
                <button class="gallery-lightbox__thumb${index === activeIndex ? " is-active" : ""}" type="button" data-gallery-modal-thumb="${index}" aria-label="Открыть фото ${index + 1}">
                  <span style="background-image: url('${item}')"></span>
                </button>`,
            )
            .join("")}
        </div>
      </div>`;
  };

  const openGalleryModal = (card) => {
    activeCard = card;
    activeIndex = Number(card.dataset.slide || 0);
    renderGalleryModal();
    galleryModal.classList.remove("is-closing");
    galleryModal.showModal();
  };

  const closeGalleryModal = () => {
    if (!galleryModal.open || galleryModal.classList.contains("is-closing")) return;
    galleryModal.classList.add("is-closing");
    window.clearTimeout(closeTimer);
    closeTimer = window.setTimeout(() => {
      galleryModal.close();
      galleryModal.classList.remove("is-closing");
      galleryModalContent.innerHTML = "";
      activeCard = null;
    }, 180);
  };

  caseCards.forEach((card) => {
    const imageWrap = card.querySelector(".case-gallery-card__image");
    const image = imageWrap.querySelector("img");
    const costButton = card.querySelector(":scope > button");
    const cardCopy = card.querySelector(".case-gallery-card__copy");
    if (costButton && cardCopy) cardCopy.append(costButton);
    image.dataset.firstImage = image.getAttribute("src");
    const previous = document.createElement("button");
    const next = document.createElement("button");
    previous.type = next.type = "button";
    previous.className = "case-gallery-card__nav case-gallery-card__nav--prev";
    next.className = "case-gallery-card__nav case-gallery-card__nav--next";
    previous.setAttribute("aria-label", "Предыдущее фото");
    next.setAttribute("aria-label", "Следующее фото");
    imageWrap.append(previous, next);
    previous.addEventListener("click", (event) => {
      event.stopPropagation();
      showCardImage(card, Number(card.dataset.slide || 0) - 1);
    });
    next.addEventListener("click", (event) => {
      event.stopPropagation();
      showCardImage(card, Number(card.dataset.slide || 0) + 1);
    });
    imageWrap.addEventListener("click", () => openGalleryModal(card));
  });

  galleryModalContent.addEventListener("click", (event) => {
    const navButton = event.target.closest("[data-gallery-modal-nav]");
    if (navButton) {
      activeIndex += navButton.dataset.galleryModalNav === "prev" ? -1 : 1;
      renderGalleryModal();
      return;
    }

    const thumb = event.target.closest("[data-gallery-modal-thumb]");
    if (thumb) {
      activeIndex = Number(thumb.dataset.galleryModalThumb);
      renderGalleryModal();
    }
  });

  galleryModal
    .querySelector(".gallery-modal__close")
    .addEventListener("click", closeGalleryModal);
  galleryModal.addEventListener("click", (event) => {
    if (event.target === galleryModal) closeGalleryModal();
  });
  galleryModal.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeGalleryModal();
  });
  document.addEventListener("keydown", (event) => {
    if (!galleryModal.open) return;
    if (event.key === "ArrowLeft") {
      activeIndex -= 1;
      renderGalleryModal();
    }
    if (event.key === "ArrowRight") {
      activeIndex += 1;
      renderGalleryModal();
    }
  });
}
