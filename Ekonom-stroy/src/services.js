import './service-layout.js';

const quizPosition = document.querySelector("#quiz-position");
const calculatorSection = document.querySelector(".calculator");
const isExtensionPage = document.body.classList.contains("page-pristroyki");
const isFloorPage = document.body.classList.contains("page-floor");

if (isExtensionPage) {
  const technologyImages = [
    ["extension-gallery-frame-wide.webp", "Рабочая зона вокруг пристройки"],
    ["extension-gallery-frame-close.webp", "Поэтапный демонтаж и монтаж каркаса"],
    ["extension-gallery-materials.webp", "Материалы защищены на участке"],
    ["extension-gallery-insulation.webp", "Укрытая и утеплённая конструкция"],
    ["extension-gallery-frame-side.webp", "Надёжный фундамент пристройки"],
    ["extension-gallery-glazing.webp", "Герметичное примыкание и остекление"],
    ["extension-gallery-finished-room.webp", "Утеплённый контур пристройки"],
    ["extension-gallery-finished-veranda.webp", "Готовая пристройка после монтажа"],
  ];
  document
    .querySelectorAll(".technology .safety-grid img, .technology .technology-grid img")
    .forEach((image, index) => {
      const [file, alt] = technologyImages[index];
      if (!file) return;
      image.src = `/assets/images/${file}`;
      image.alt = alt;
    });
}

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
    const goalId = isExtensionPage
      ? "pristroyki_form_submit"
      : isFloorPage
        ? "zamena_polov_form_submit"
        : "roofing_form_submit";
    window.ym(111898114, "reachGoal", goalId);
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
  const dropdownItem = mainNavigation.querySelector(".main-nav__item--dropdown");
  const dropdownToggle = mainNavigation.querySelector(".main-nav__dropdown-toggle");

  const closeServicesMenu = () => {
    if (!dropdownItem || !dropdownToggle) return;
    dropdownItem.classList.remove("is-open");
    dropdownToggle.setAttribute("aria-expanded", "false");
  };

  const closeHeaderMenu = () => {
    headerBurger.classList.remove("is-open");
    mainNavigation.classList.remove("is-open");
    headerBurger.setAttribute("aria-expanded", "false");
    headerBurger.setAttribute("aria-label", "Открыть меню");
    closeServicesMenu();
  };

  if (dropdownItem && dropdownToggle) {
    dropdownToggle.addEventListener("click", () => {
      const willOpen = !dropdownItem.classList.contains("is-open");
      dropdownItem.classList.toggle("is-open", willOpen);
      dropdownToggle.setAttribute("aria-expanded", String(willOpen));
    });
  }

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
    if (!dropdownItem?.contains(event.target)) closeServicesMenu();
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
  const roofingQuestions = [
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
  const extensionQuestions = [
    {
      title: "Что хотите пристроить?",
      name: "extension_purpose",
      options: [
        ["Тёплая комната", "quiz-extension-warm-room.webp"],
        ["Кухня или санузел", "quiz-extension-kitchen.webp"],
        ["Веранда или терраса", "quiz-extension-veranda.webp"],
        ["Тамбур или крыльцо", "quiz-extension-porch.webp"],
        ["Котельная или кладовая", "quiz-extension-utility-room.webp"],
        ["Нужна консультация", "quiz-extension-consultation.webp"],
      ],
    },
    {
      title: "Какую технологию рассматриваете?",
      name: "extension_material",
      options: [
        ["Деревянный каркас"],
        ["Газобетон"],
        ["Брус"],
        ["Открытая терраса"],
        ["Нужна консультация"],
        ["Материалы уже куплены"],
      ],
    },
    {
      title: "Какой размер пристройки?",
      name: "extension_area",
      options: [
        ["До 10 м²"],
        ["10–20 м²"],
        ["20–35 м²"],
        ["35–50 м²"],
        ["Больше 50 м²"],
        ["Пока не знаю"],
      ],
    },
    {
      title: "Когда хотите начать строительство?",
      name: "start_time",
      options: [
        ["Как можно скорее"],
        ["В течение месяца"],
        ["Через 1–2 месяца"],
        ["В этом сезоне"],
        ["Планирую заранее"],
        ["После консультации"],
      ],
    },
  ];
  const floorQuestions = [
    {
      title: "Что нужно сделать с полом?",
      name: "floor_scope",
      options: [
        ["Полная замена пола", "quiz-floor-replacement.webp"],
        ["Ремонт пола", "quiz-floor-repair.webp"],
        ["Утепление пола", "quiz-floor-insulation.webp"],
        ["Нужен осмотр", "quiz-floor-inspection.webp"],
      ],
    },
    {
      title: "Какое сейчас основание?",
      name: "floor_base",
      options: [
        ["Деревянные лаги", "quiz-floor-base-joists.webp"],
        ["Бетонное основание", "quiz-floor-base-concrete.webp"],
        ["Пол над подполом", "quiz-floor-base-crawlspace.webp"],
        ["Не знаю", "quiz-floor-base-unknown.webp"],
      ],
    },
    {
      title: "Какое чистовое покрытие планируете?",
      name: "floor_finish",
      options: [
        ["Шпунтованная доска", "quiz-floor-finish-tongue-groove.webp"],
        ["Фанера или OSB", "quiz-floor-finish-plywood.webp"],
        ["Ламинат", "quiz-floor-finish-laminate.webp"],
        ["Линолеум", "quiz-floor-finish-linoleum.webp"],
        ["Нужна консультация", "quiz-floor-finish-consultation.webp"],
      ],
    },
    {
      title: "Какая площадь помещений?",
      name: "floor_area",
      options: [["До 30 м²"], ["30–60 м²"], ["60–100 м²"], ["Больше 100 м²"], ["Не знаю площадь"]],
    },
    {
      title: "Когда хотите начать работы?",
      name: "start_time",
      options: [["Срочно"], ["В течение недели"], ["В этом месяце"], ["Через 1–2 месяца"], ["После консультации"]],
    },
  ];
  const questions = isExtensionPage
    ? extensionQuestions
    : isFloorPage
      ? floorQuestions
      : roofingQuestions;
  const answers = new Map();
  const totalSteps = questions.length + 1;
  let currentStep = 0;
  let isFinalStep = false;
  let autoNextTimer;

  const estimatorCopy = isExtensionPage
    ? {
        formName: "Расчёт стоимости пристройки",
        photoAlt: "Прораб Эконом Строй отвечает на звонок со строительного объекта",
        featureOne: "Посчитает фундамент, каркас, утепление и отделку",
        featureTwo: "Подскажет технологию с учётом дома и грунта",
      }
    : isFloorPage
      ? {
          formName: "Расчёт стоимости замены пола",
          photoAlt: "Прораб Эконом Строй отвечает на звонок на объекте по замене пола",
          featureOne: "Посчитает демонтаж, лаги, утепление и настил",
          featureTwo: "Подскажет состав пола с учётом дома и подпола",
        }
      : {
        formName: "Расчёт стоимости кровли",
        photoAlt: "Прораб Эконом Строй отвечает на звонок на объекте по замене кровли",
        featureOne: "Посчитает материалы, работу и доставку под вашу крышу",
        featureTwo: "Подскажет покрытие и порядок работ без лишних затрат",
      };

  calculator.innerHTML = `<div class="estimator-shell">
    <aside class="estimator-manager" aria-label="Прораб">
      <div class="estimator-manager__photo"><img src="/assets/images/foreman-stanislav-roof-site.webp" alt="${estimatorCopy.photoAlt}"><span>Сейчас онлайн</span></div>
      <div class="estimator-manager__person"><strong class="estimator-manager__name">Станислав</strong><span class="estimator-manager__role">Прораб</span></div>
      <ul class="estimator-manager__features"><li>Расчёт стоимости<span>${estimatorCopy.featureOne}</span></li><li>Подбор решения<span>${estimatorCopy.featureTwo}</span></li></ul>
      <div class="estimator-manager__reply">Ответим за 10 минут</div>
    </aside>
    <form class="estimator-quiz" data-form-name="${estimatorCopy.formName}">
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
    options.querySelectorAll('.estimator-option').forEach(option => {
      option.classList.toggle('is-selected', Boolean(option.querySelector('input:checked')));
    });
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
    const photoCopy = isExtensionPage
      ? ["Фото дома и участка", "Прикрепите фото дома и участка", "Стена дома, место будущей пристройки и подъезд к участку"]
      : isFloorPage
        ? ["Фото пола", "Прикрепите фото пола", "Общий вид комнаты, повреждения и доступ в подпол"]
        : ["Фото крыши", "Прикрепите фото крыши", "Общий вид дома, старая кровля или проблемные места"];
    options.innerHTML = `<div class="estimator-lead"><label><span>Имя</span><input name="name" type="text" placeholder="Как к вам обращаться"></label><label><span>Телефон</span><input name="phone" type="tel" placeholder="+7 (___) ___-__-__" required></label><label class="file-field"><span>${photoCopy[0]}</span><span class="file-field__box"><strong>${photoCopy[1]}</strong><small>${photoCopy[2]}</small><em>Выбрать файлы</em></span><input name="photos[]" type="file" accept="image/*" multiple></label><label class="policy-check"><input type="checkbox" required><span>Согласен на обработку персональных данных и принимаю <a href="/privacy.html">политику конфиденциальности</a>.</span></label></div>`;
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
      options.querySelectorAll('.estimator-option').forEach(option => {
        option.classList.toggle('is-selected', Boolean(option.querySelector('input:checked')));
      });
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
    '[name="old_roof_type"], [name="extension_type"], [name="floor_type"]',
  );
  const phoneInput = roofCalculationModal.querySelector('[name="phone"]');
  const closeButtons = roofCalculationModal.querySelectorAll(
    ".roof-calculation-modal__close, .roof-calculation-modal__backdrop",
  );
  let closeTimer;

  const openRoofModal = (
    roofType,
    heading = isExtensionPage
      ? `Рассчитать стоимость: ${roofType}`
      : isFloorPage
        ? `Рассчитать стоимость: ${roofType}`
        : `Рассчитать стоимость замены ${roofType}`,
    options = {},
  ) => {
    clearTimeout(closeTimer);
    modalTitle.textContent = heading;
    modalForm.dataset.formName = heading;
    modalDescription.textContent =
      options.description ||
      (isExtensionPage
        ? "Оставьте телефон. Уточним назначение, размер и материал пристройки, после чего назовём ориентировочную стоимость."
        : isFloorPage
          ? "Оставьте телефон. Уточним площадь, состояние лаг и желаемое покрытие, после чего назовём ориентировочную стоимость."
          : "Оставьте телефон. Уточним площадь и состояние крыши, после чего назовём ориентировочную стоимость работ.");
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
    Каркасная: "Рассчитать стоимость каркасной пристройки",
    Газобетон: "Рассчитать стоимость пристройки из газобетона",
    Веранда: "Рассчитать стоимость веранды",
  };
  document.querySelectorAll(".budget-card__button").forEach((button) => {
    button.addEventListener("click", () => {
      const material = button
        .closest(".budget-card")
        .querySelector("h3")
        .textContent.trim();
      openRoofModal(
        `${isExtensionPage ? "Вариант" : isFloorPage ? "Тип пола" : "Материал"}: ${material}`,
        budgetModalHeadings[material] ||
          `Рассчитать стоимость ${isExtensionPage ? "пристройки" : isFloorPage ? "пола" : "кровли"}: ${material}`,
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
        `Узнать стоимость ${isExtensionPage ? "такой пристройки" : isFloorPage ? "такого пола" : "такой же кровли"} как «${caseTitle}»`,
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
        const photoRequestCopy = isExtensionPage
          ? {
              type: "Расчёт пристройки по фотографиям",
              description: "Прикрепите 3–5 фотографий дома и участка. Станислав оценит место примыкания, предложит состав работ и назовёт ориентировочный бюджет.",
              submit: "Отправить фото дома",
            }
          : isFloorPage
          ? {
              type: "Расчёт по фотографиям пола",
              description: "Прикрепите 3–5 фотографий комнат, пола и подпола. Станислав оценит состояние, предложит состав работ и назовёт ориентировочный бюджет.",
              submit: "Отправить фото пола",
            }
          : {
              type: "Расчёт по фотографиям кровли",
              description: "Прикрепите 3–5 фотографий дома и кровли. Станислав посмотрит состояние, предложит вариант работ и назовёт ориентировочный бюджет.",
              submit: "Отправить фото кровли",
            };
        openRoofModal(
          photoRequestCopy.type,
          "Рассчитать стоимость по фото",
          {
            photoRequest: true,
            noImage: true,
            description: photoRequestCopy.description,
            submitLabel: photoRequestCopy.submit,
          },
        );
      });
    });
  document.querySelectorAll(".budget-bottom__button").forEach((button) => {
    button.addEventListener("click", () =>
      openRoofModal("Выезд мастера на осмотр", "Вызвать мастера на осмотр", {
        description:
          isExtensionPage
            ? "Оставьте телефон. Согласуем удобное время выезда, осмотрим дом и место будущей пристройки, затем подготовим точную смету."
            : isFloorPage
            ? "Оставьте телефон. Согласуем удобное время бесплатного выезда, осмотрим пол и подпол, затем подготовим точную смету."
            : "Оставьте телефон. Согласуем удобное время бесплатного выезда, осмотрим кровлю и подготовим точную смету.",
        submitLabel: "Вызвать мастера",
        noImage: true,
      }),
    );
  });
  document.querySelectorAll(".geography-request-button").forEach((button) => {
    button.addEventListener("click", () =>
      openRoofModal("Выезд по Санкт-Петербургу и Ленинградской области", "Уточнить выезд бригады", {
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
          isExtensionPage
            ? "Оставьте телефон. Прораб перезвонит, ответит на вопросы и подскажет, как предварительно оценить будущую пристройку."
            : isFloorPage
            ? "Оставьте телефон. Прораб перезвонит, ответит на вопросы и подскажет, как предварительно оценить состояние пола."
            : "Оставьте телефон. Прораб перезвонит, ответит на вопросы и подскажет, как предварительно оценить вашу кровлю.",
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
    modalForm.reset();
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

document.querySelectorAll(".video-preview-card__stage").forEach((stage) => {
  const video = stage.querySelector(".video-preview-card__image");
  const playButton = stage.querySelector(".video-preview-card__play");
  if (!(video instanceof HTMLVideoElement) || !(playButton instanceof HTMLButtonElement)) return;

  const controls = document.createElement("div");
  controls.className = "video-preview-card__controls";
  controls.innerHTML =
    '<input class="video-preview-card__progress" type="range" min="0" max="100" value="0" step="0.1" aria-label="Позиция видео" />' +
    '<button class="video-preview-card__fullscreen" type="button" aria-label="Открыть видео на весь экран">⛶</button>';
  stage.append(controls);
  const progress = controls.querySelector(".video-preview-card__progress");
  const fullscreen = controls.querySelector(".video-preview-card__fullscreen");
  video.controls = false;

  playButton.addEventListener("click", async () => {
    document.querySelectorAll(".video-preview-card__image").forEach((otherVideo) => {
      if (otherVideo !== video && otherVideo instanceof HTMLVideoElement) {
        otherVideo.pause();
        otherVideo.closest(".video-preview-card__stage")?.classList.remove("is-playing");
      }
    });

    video.muted = true;
    video.playsInline = true;
    video.controls = true;
    try {
      await video.play();
      stage.classList.add("is-playing");
    } catch {
      video.controls = false;
      stage.classList.remove("is-playing");
    }
  });

  video.addEventListener("timeupdate", () => {
    if (Number.isFinite(video.duration) && progress instanceof HTMLInputElement) {
      progress.value = String((video.currentTime / video.duration) * 100);
    }
  });

  progress?.addEventListener("input", () => {
    if (Number.isFinite(video.duration)) {
      video.currentTime = (Number(progress.value) / 100) * video.duration;
    }
  });

  fullscreen?.addEventListener("click", async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await (video.requestFullscreen?.() || stage.requestFullscreen());
    } catch {
      // Fullscreen can be blocked by browser policy.
    }
  });

  video.addEventListener("pause", () => {
    video.controls = false;
    stage.classList.remove("is-playing");
  });
});

if (caseCards.length && galleryModal && galleryModalContent) {
  let activeCard = null;
  let activeIndex = 0;
  let closeTimer = null;
  const preloadedGalleryImages = new Map();

  const getImages = (card) => {
    const image = card.querySelector(".case-gallery-card__image img");
    const customImages = image.dataset.galleryImages
      ?.split("|")
      .filter(Boolean);
    if (customImages?.length) return customImages;
    const firstImage = image.dataset.firstImage;
    return [firstImage, firstImage.replace(".webp", "-detail.webp")];
  };

  const preloadImage = (source) => {
    if (!preloadedGalleryImages.has(source)) {
      const preload = new Image();
      preload.decoding = "async";
      preload.src = source;
      preloadedGalleryImages.set(source, preload);
    }
    return preloadedGalleryImages.get(source);
  };

  const preloadCardImages = (card) => {
    getImages(card).forEach(preloadImage);
  };

  const updateGalleryViewportHeight = () => {
    const viewportHeight = window.visualViewport?.height || window.innerHeight;
    galleryModal.style.setProperty("--gallery-viewport-height", `${viewportHeight}px`);
  };

  const showCardImage = (card, index) => {
    const images = getImages(card);
    const safeIndex = (index + images.length) % images.length;
    card.dataset.slide = String(safeIndex);
    const cardImage = card.querySelector(".case-gallery-card__image img");
    const nextImage = preloadImage(images[safeIndex]);
    cardImage.src = nextImage.src;
    preloadImage(images[(safeIndex + 1) % images.length]);
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
          <img class="gallery-lightbox__image" src="${image}" alt="${title}" />
          <button class="gallery-lightbox__nav gallery-lightbox__nav--prev" type="button" data-gallery-modal-nav="prev" aria-label="Предыдущее фото"><svg class="service-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m15 5-7 7 7 7"/></svg></button>
          <button class="gallery-lightbox__nav gallery-lightbox__nav--next" type="button" data-gallery-modal-nav="next" aria-label="Следующее фото"><svg class="service-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg></button>
        </div>
        <div class="gallery-lightbox__thumbs" aria-label="Фотографии кейса">
          ${images
            .map(
              (item, index) => `
                <button class="gallery-lightbox__thumb${index === activeIndex ? " is-active" : ""}" type="button" data-gallery-modal-thumb="${index}" aria-label="Открыть фото ${index + 1}">
                  <img src="${item}" alt="" loading="eager" />
                </button>`,
            )
            .join("")}
        </div>
      </div>`;
  };

  const openGalleryModal = (card) => {
    activeCard = card;
    activeIndex = Number(card.dataset.slide || 0);
    preloadCardImages(card);
    updateGalleryViewportHeight();
    renderGalleryModal();
    galleryModal.classList.remove("is-closing");
    if (typeof galleryModal.showModal === "function") galleryModal.showModal();
    else { galleryModal.setAttribute("open", ""); galleryModal.classList.add("is-fallback-open"); }
  };

  const closeGalleryModal = () => {
    if (!galleryModal.hasAttribute('open') || galleryModal.classList.contains("is-closing")) return;
    galleryModal.classList.add("is-closing");
    window.clearTimeout(closeTimer);
    closeTimer = window.setTimeout(() => {
      if (typeof galleryModal.close === "function") galleryModal.close();
      else { galleryModal.removeAttribute("open"); galleryModal.classList.remove("is-fallback-open"); }
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
    const initialSlide = getImages(card).indexOf(image.getAttribute("src"));
    card.dataset.slide = String(initialSlide >= 0 ? initialSlide : 0);
    const previous = document.createElement("button");
    const next = document.createElement("button");
    previous.type = next.type = "button";
    previous.className = "case-gallery-card__nav case-gallery-card__nav--prev";
    next.className = "case-gallery-card__nav case-gallery-card__nav--next";
    previous.setAttribute("aria-label", "Предыдущее фото");
    next.setAttribute("aria-label", "Следующее фото");
    previous.innerHTML = '<svg class="service-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m15 5-7 7 7 7"/></svg>';
    next.innerHTML = '<svg class="service-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg>';
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
    imageWrap.addEventListener("pointerenter", () => preloadCardImages(card), {
      once: true,
    });
  });

  if ("IntersectionObserver" in window) {
    const galleryPreloader = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          preloadCardImages(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "300px 0px" },
    );
    caseCards.forEach((card) => galleryPreloader.observe(card));
  }

  window.addEventListener("resize", updateGalleryViewportHeight);
  window.visualViewport?.addEventListener("resize", updateGalleryViewportHeight);

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
    if (!galleryModal.hasAttribute('open')) return;
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
