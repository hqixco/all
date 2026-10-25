const selectAll = (selector, scope = document) => [
  ...scope.querySelectorAll(selector),
];

const caseImageUrls = import.meta.glob("./images/public-project-*-new-*.webp", {
  eager: true,
  query: "?url",
  import: "default",
});

function createOverlay() {
  const overlay = document.createElement("div");
  overlay.className = "modern-overlay";
  overlay.hidden = true;
  overlay.innerHTML =
    '<div class="modern-dialog" role="dialog" aria-modal="true"><button class="modern-dialog-close" type="button" aria-label="Закрыть">×</button><div class="modern-dialog-content"></div></div>';
  document.body.append(overlay);
  const dialog = overlay.querySelector(".modern-dialog");
  const content = overlay.querySelector(".modern-dialog-content");
  let restore = null;
  let closeTimer = 0;

  const finishClose = () => {
    if (restore) restore();
    restore = null;
    content.replaceChildren();
    dialog.classList.remove("modern-dialog--image");
    overlay.classList.remove("modern-overlay--open", "modern-overlay--closing");
    overlay.hidden = true;
    document.body.classList.remove("modern-modal-open");
  };

  const close = () => {
    if (overlay.hidden || overlay.classList.contains("modern-overlay--closing"))
      return;
    overlay.classList.remove("modern-overlay--open");
    overlay.classList.add("modern-overlay--closing");
    window.clearTimeout(closeTimer);
    closeTimer = window.setTimeout(finishClose, 220);
  };

  overlay.addEventListener("click", (event) => {
    if (
      event.target === overlay ||
      event.target.closest(".modern-dialog-close")
    )
      close();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !overlay.hidden) close();
  });

  return {
    open(node, options = {}) {
      window.clearTimeout(closeTimer);
      restore = options.restore ?? null;
      dialog.classList.toggle("modern-dialog--image", Boolean(options.image));
      content.replaceChildren(node);
      overlay.classList.remove("modern-overlay--closing");
      overlay.hidden = false;
      document.body.classList.add("modern-modal-open");
      window.requestAnimationFrame(() => {
        overlay.classList.add("modern-overlay--open");
        overlay.querySelector(".modern-dialog-close").focus();
      });
    },
    close,
  };
}

function initPopups(overlay) {
  selectAll(".btn_popup[href^='#']").forEach((trigger) => {
    if (
      trigger.closest(".roofing-page__main-quiz") ||
      trigger.matches(
        ".btn_popup.brd_btn.arrow.roofing-page__btn-popup[href='#calculator']",
      )
    ) {
      return;
    }
    trigger.removeAttribute("onclick");
    trigger.addEventListener("click", (event) => {
      const source = document.querySelector(trigger.getAttribute("href"));
      if (!source) return;
      event.preventDefault();
      const marker = document.createComment("popup-position");
      source.before(marker);
      source.classList.add("modern-popup-source");
      source.hidden = false;
      overlay.open(source, {
        restore: () => {
          source.classList.remove("modern-popup-source");
          marker.replaceWith(source);
        },
      });
    });
  });
}

function initInlineCalculator() {
  const host = document.querySelector(".roofing-page__main-quiz");
  const calculator = document.querySelector("#calculator");
  if (!host || !calculator) return;

  const activate = (optionIndex = null) => {
    let shouldSkipFirstQuestion = false;
    if (Number.isInteger(optionIndex)) {
      const firstPanel = calculator.querySelector(".survey__panel");
      const choices = selectAll(
        'input[type="radio"], input[type="checkbox"]',
        firstPanel,
      );
      if (choices[optionIndex]) {
        choices[optionIndex].checked = true;
        calculator
          .querySelector("form.survey")
          ?.setAttribute("data-skip-first-question", "true");
        shouldSkipFirstQuestion = true;
      }
    }

    if (!host.contains(calculator)) {
      host.replaceChildren(calculator);
      host.classList.add("roofing-page__main-quiz--active");
      calculator.classList.add("modern-popup-source", "landing-quiz--inline");
      calculator.hidden = false;
    }

    if (shouldSkipFirstQuestion) {
      calculator.querySelector('[name="next"]')?.click();
    }

    host.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  selectAll(".roofing-page__main-quiz .wrap > .block").forEach(
    (option, optionIndex) => {
      option.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        activate(optionIndex);
      });
    },
  );

  selectAll(
    ".btn_popup.brd_btn.arrow.roofing-page__btn-popup[href='#calculator']",
  ).forEach((trigger) => {
    trigger.removeAttribute("onclick");
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      activate();
    });
  });
}

function initGallery(overlay) {
  const links = selectAll("[data-gallery-item]");
  let activeIndex = 0;

  const show = (index) => {
    activeIndex = (index + links.length) % links.length;
    const image = document.createElement("img");
    image.src = links[activeIndex].href;
    image.alt = links[activeIndex].querySelector("img")?.alt || "Фото объекта";
    const frame = document.createElement("div");
    frame.append(image);
    if (links.length > 1) {
      frame.insertAdjacentHTML(
        "beforeend",
        '<button class="modern-gallery-nav modern-gallery-prev" type="button" aria-label="Предыдущее фото">‹</button><button class="modern-gallery-nav modern-gallery-next" type="button" aria-label="Следующее фото">›</button>',
      );
      frame.querySelector(".modern-gallery-prev").onclick = () =>
        show(activeIndex - 1);
      frame.querySelector(".modern-gallery-next").onclick = () =>
        show(activeIndex + 1);
    }
    overlay.open(frame, { image: true });
  };

  links.forEach((link, index) =>
    link.addEventListener("click", (event) => {
      event.preventDefault();
      show(index);
    }),
  );
}

function initCarousels() {
  selectAll(
    ".portfolio_main:not(.roofing-gallery), .portfolio_main_dom",
  ).forEach((carousel) => {
    if (carousel.children.length < 2) return;
    carousel.classList.add("modern-carousel");
    const controls = document.createElement("div");
    controls.className = "modern-carousel-controls";
    controls.innerHTML =
      '<button class="modern-carousel-button" type="button" aria-label="Назад">‹</button><button class="modern-carousel-button" type="button" aria-label="Вперёд">›</button>';
    const scroll = (direction) =>
      carousel.scrollBy({
        left: direction * carousel.clientWidth * 0.85,
        behavior: "smooth",
      });
    controls.firstElementChild.onclick = () => scroll(-1);
    controls.lastElementChild.onclick = () => scroll(1);
    carousel.after(controls);
  });
}

function initQuizzes() {
  selectAll("form.survey, form.survey_marquiz").forEach((form) => {
    const panels = selectAll(".survey__panel", form);
    const steps = selectAll(".progressbar__step", form);
    const previous = form.querySelector('[name="prev"]');
    const next = form.querySelector('[name="next"]');
    const submit = form.querySelector('[type="submit"]');
    let autoAdvanceTimer = 0;
    let index = Math.max(
      0,
      panels.findIndex((panel) =>
        panel.classList.contains("survey__panel--current"),
      ),
    );
    const minimumIndex = () =>
      form.dataset.skipFirstQuestion === "true" ? 1 : 0;

    const render = () => {
      panels.forEach((panel, panelIndex) => {
        const current = panelIndex === index;
        panel.classList.toggle("survey__panel--current", current);
        panel.setAttribute("aria-hidden", String(!current));
      });
      steps.forEach((step, stepIndex) =>
        step.classList.toggle("active", stepIndex <= index),
      );
      if (previous) previous.disabled = index <= minimumIndex();
      const isFinalStep = index === panels.length - 1;
      if (next) {
        next.hidden = isFinalStep;
        next.setAttribute("aria-hidden", String(isFinalStep));
      }
      if (submit) {
        submit.hidden = !isFinalStep;
        submit.disabled = !isFinalStep;
        submit.setAttribute("aria-hidden", String(!isFinalStep));
      }
      form
        .querySelector(".progressbar")
        ?.setAttribute("aria-valuenow", String(index + 1));
    };

    next?.addEventListener("click", () => {
      const panel = panels[index];
      const requiredChoices = selectAll(
        'input[type="radio"], input[type="checkbox"]',
        panel,
      );
      const error = panel.querySelector(".error-message");
      if (
        requiredChoices.length &&
        !requiredChoices.some((input) => input.checked)
      ) {
        if (error)
          error.textContent =
            panel.dataset.requirement || "Выберите один из вариантов";
        return;
      }
      if (error) error.textContent = "";
      index = Math.min(index + 1, panels.length - 1);
      render();
    });

    selectAll(
      '.form-group.roof-quiz__form-group input[type="radio"]',
      form,
    ).forEach((input) => {
      input.addEventListener("change", () => {
        if (!input.checked) return;
        const selectedPanel = input.closest(".survey__panel");
        window.clearTimeout(autoAdvanceTimer);
        autoAdvanceTimer = window.setTimeout(() => {
          if (
            selectedPanel?.classList.contains("survey__panel--current") &&
            next &&
            !next.hidden
          ) {
            next.click();
          }
        }, 200);
      });
    });

    previous?.addEventListener("click", () => {
      index = Math.max(index - 1, minimumIndex());
      render();
    });
    render();
  });
}

function initCommonInteractions() {
  const burger = document.querySelector(".burger");
  const mobileMenu = document.querySelector(".burger_menu");

  const setMobileMenuState = (isOpen) => {
    mobileMenu?.classList.toggle("mobile", isOpen);
    burger?.classList.toggle("is-open", isOpen);
    burger?.setAttribute("aria-expanded", String(isOpen));
    burger?.setAttribute(
      "aria-label",
      isOpen ? "Закрыть меню" : "Открыть меню",
    );
  };

  burger?.addEventListener("click", (event) => {
    event.stopPropagation();
    setMobileMenuState(!mobileMenu?.classList.contains("mobile"));
  });

  mobileMenu?.addEventListener("click", (event) => {
    if (event.target.closest("a")) setMobileMenuState(false);
  });

  document.addEventListener("click", (event) => {
    if (
      mobileMenu?.classList.contains("mobile") &&
      !mobileMenu.contains(event.target)
    ) {
      setMobileMenuState(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMobileMenuState(false);
  });

  selectAll(".acc .vopros_h3").forEach((heading) =>
    heading.addEventListener("click", () => {
      heading.parentElement.classList.toggle("active");
      const content = heading.nextElementSibling;
      if (content) content.hidden = !content.hidden;
    }),
  );

  selectAll(".messenger-link--max, .callback_kalkulator").forEach((element) =>
    element.addEventListener("click", (event) => {
      event.preventDefault();
      // В проекте-источнике бизнес-ссылка MAX пока не заполнена.
    }),
  );
  selectAll(".messenger-link--telegram").forEach((element) =>
    element.addEventListener("click", (event) => {
      event.preventDefault();
      window.open("https://t.me/stroydacha1ru", "_blank", "noopener");
    }),
  );

  selectAll(".content_toggle").forEach((button) =>
    button.addEventListener("click", (event) => {
      event.preventDefault();
      const blocks = selectAll(".content_block");
      blocks.forEach((block) => block.classList.toggle("hide"));
      button.textContent = blocks.some((block) =>
        block.classList.contains("hide"),
      )
        ? "Подробнее"
        : "Скрыть";
    }),
  );

  selectAll("[data-privacy-target]").forEach((checkbox) => {
    const updatePrivacy = () => {
      const target = document.getElementById(checkbox.dataset.privacyTarget);
      if (target) target.hidden = !checkbox.checked;
    };
    checkbox.addEventListener("change", updatePrivacy);
    updatePrivacy();
  });

  const top = document.createElement("button");
  top.id = "topcontrol";
  top.type = "button";
  top.title = "Вверх";
  top.setAttribute("aria-label", "Наверх");
  top.innerHTML = '<div class="pageup"><span></span></div>';
  top.onclick = () => window.scrollTo({ top: 0, behavior: "smooth" });
  document.body.append(top);
  const updateScroll = () => {
    top.classList.toggle("is-visible", window.scrollY >= 100);
    document
      .querySelector(".logo_block")
      ?.classList.toggle("shadow", window.scrollY > 45);
  };
  window.addEventListener("scroll", updateScroll, { passive: true });
  updateScroll();
}

function syncHeaderSpacer() {
  const header = document.querySelector(".logo_block.site-header");
  const spacer = document.querySelector("#heightTwo.free");
  const navigation = document.querySelector(".menu_top.primary-nav");
  if (!header || !spacer) return;

  const update = () => {
    const headerHeight = header.offsetHeight;
    spacer.style.height = `${headerHeight}px`;
    if (navigation) navigation.style.top = `${headerHeight}px`;
  };

  update();
  new ResizeObserver(update).observe(header);
}

function initPhoneMasks() {
  const completePhonePattern = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/;

  const formatPhone = (rawValue) => {
    let digits = rawValue.replace(/\D/g, "");
    if (digits.startsWith("7") || digits.startsWith("8")) {
      digits = digits.slice(1);
    }
    digits = digits.slice(0, 10);

    let formatted = "+7";
    if (digits.length > 0) formatted += ` (${digits.slice(0, 3)}`;
    if (digits.length >= 3) formatted += ")";
    if (digits.length > 3) formatted += ` ${digits.slice(3, 6)}`;
    if (digits.length > 6) formatted += `-${digits.slice(6, 8)}`;
    if (digits.length > 8) formatted += `-${digits.slice(8, 10)}`;
    return formatted;
  };

  selectAll('input[name="phone"]').forEach((input) => {
    input.type = "tel";
    input.inputMode = "numeric";
    input.autocomplete = "tel";
    input.placeholder = "+7 (___) ___-__-__";
    input.pattern = "\\+7 \\(\\d{3}\\) \\d{3}-\\d{2}-\\d{2}";
    input.title = "Введите телефон в формате +7 (999) 123-45-67";
    input.required = true;

    const updateValidity = () => {
      input.setCustomValidity(
        input.value && !completePhonePattern.test(input.value)
          ? "Введите полный номер телефона"
          : "",
      );
    };

    input.addEventListener("focus", () => {
      if (!input.value) input.value = "+7 (";
      input.setSelectionRange(input.value.length, input.value.length);
    });

    input.addEventListener("input", () => {
      input.value = formatPhone(input.value);
      updateValidity();
      input.setSelectionRange(input.value.length, input.value.length);
    });

    input.addEventListener("blur", () => {
      if (input.value.replace(/\D/g, "") === "7") input.value = "";
      updateValidity();
    });

    updateValidity();
  });
}

function isLocalSubmissionMode() {
  return (
    ["localhost", "127.0.0.1", ""].includes(window.location.hostname) ||
    window.location.protocol === "file:"
  );
}

async function sendForm(form) {
  if (isLocalSubmissionMode()) {
    await new Promise((resolve) => window.setTimeout(resolve, 500));
    return;
  }

  const formData = new FormData(form);
  if (!formData.get("name") && formData.get("namequiz")) {
    formData.append("name", formData.get("namequiz"));
  }
  if (!formData.get("contact_method") && formData.get("messquiz")) {
    formData.append("contact_method", formData.get("messquiz"));
  }
  formData.append(
    "form_name",
    form.dataset.formName || form.dataset.form || "Форма",
  );
  formData.append("page_url", window.location.href);

  const response = await fetch("/mail.php", {
    method: "POST",
    body: formData,
  });
  const result = await response.json().catch(() => null);

  if (!response.ok || !result?.success) {
    throw new Error(result?.message || "Не удалось отправить форму");
  }
}

function initForms() {
  selectAll("form").forEach((form) => {
    selectAll("[data-action]", form).forEach((button) => {
      if (button.type !== "submit") {
        button.addEventListener("click", () => form.requestSubmit());
      }
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const submit = form.querySelector('[type="submit"], [data-action]');
      const initialText = submit?.value || submit?.textContent || "";
      let status = form.querySelector(".modern-form-notice");

      if (!status) {
        status = document.createElement("p");
        status.className = "modern-form-notice page__form-status";
        status.setAttribute("role", "status");
        status.setAttribute("aria-live", "polite");
        form.append(status);
      }

      form.classList.remove("is-submitted", "is-submit-error");
      form.classList.add("is-submitting");
      status.textContent = "Отправляем заявку...";
      if (submit) {
        submit.disabled = true;
        if ("value" in submit) submit.value = "Отправляем...";
        else submit.textContent = "Отправляем...";
      }

      try {
        await sendForm(form);
        if (typeof window.ym === "function") {
          window.ym(111036091, "reachGoal", "zamena_krovli");
        }
        form.reset();
        form.classList.remove("is-submitting", "is-submit-error");
        form.classList.add("is-submitted");
        status.textContent =
          "Заявка отправлена. Мы свяжемся с вами в ближайшее время.";
        if (submit) {
          if ("value" in submit) submit.value = "Отправлено";
          else submit.textContent = "Отправлено";
        }
      } catch (error) {
        form.classList.remove("is-submitting", "is-submitted");
        form.classList.add("is-submit-error");
        status.textContent =
          error instanceof Error ? error.message : "Ошибка отправки";
        if (submit) {
          submit.disabled = false;
          if ("value" in submit) submit.value = initialText;
          else submit.textContent = initialText;
        }
      }
    });
  });
}

function initReviewDisclosures() {
  selectAll(".roofing-reviews__card").forEach((card, index) => {
    const reviewText = card.querySelector(".review-card__text");
    if (!reviewText) return;

    const textId = `roofing-review-text-${index + 1}`;
    const toggle = document.createElement("button");
    reviewText.id = textId;
    reviewText.classList.add("review-card__text--collapsible");
    toggle.type = "button";
    toggle.className = "review-card__toggle";
    toggle.setAttribute("aria-controls", textId);
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Развернуть отзыв");
    reviewText.insertAdjacentElement("afterend", toggle);

    const reviewBody = document.createElement("div");
    reviewBody.className = "review-card__body";
    reviewText.insertAdjacentElement("beforebegin", reviewBody);
    reviewBody.append(reviewText, toggle);

    const setExpanded = (expanded) => {
      card.classList.toggle("review-card--expanded", expanded);
      toggle.setAttribute("aria-expanded", String(expanded));
      toggle.setAttribute(
        "aria-label",
        expanded ? "Свернуть отзыв" : "Развернуть отзыв",
      );
      reviewText.style.setProperty(
        "--review-text-height",
        `${reviewText.scrollHeight}px`,
      );
    };

    const toggleReview = () => {
      setExpanded(!card.classList.contains("review-card--expanded"));
    };

    toggle.addEventListener("click", toggleReview);
    reviewText.addEventListener("click", toggleReview);
    setExpanded(false);
  });
}

function initCaseCardSliders() {
  const imageCounts = [4, 5, 3, 3, 3, 4, 3, 3, 4, 3];

  selectAll(".roofing-case-card").forEach((card, caseIndex) => {
    const image = card.querySelector(".roofing-case-card__image");
    const count = imageCounts[caseIndex];
    if (!image || !count) return;

    const title =
      card.querySelector(".roofing-case-card__title")?.textContent?.trim() ||
      "Кровельный объект";
    const projectNumber = String(caseIndex + 1).padStart(2, "0");
    const images = Array.from({ length: count }, (_, imageIndex) => {
      const filename = `public-project-${projectNumber}-new-${String(imageIndex + 1).padStart(2, "0")}.webp`;
      return {
        src: caseImageUrls[`./images/${filename}`] || `images/${filename}`,
        alt: `${title}, фото ${imageIndex + 1}`,
      };
    });
    let activeIndex = 0;

    const stage = document.createElement("div");
    stage.className =
      "case-card__photo case-card__photo--slider roofing-case-card__stage";
    image.before(stage);
    stage.append(image);

    const previous = document.createElement("button");
    previous.type = "button";
    previous.className =
      "case-card__slider-nav case-card__slider-nav--prev roofing-case-card__nav roofing-case-card__nav--prev";
    previous.setAttribute("aria-label", "Предыдущее фото");

    const next = document.createElement("button");
    next.type = "button";
    next.className =
      "case-card__slider-nav case-card__slider-nav--next roofing-case-card__nav roofing-case-card__nav--next";
    next.setAttribute("aria-label", "Следующее фото");
    stage.append(previous, next);

    const thumbs = document.createElement("div");
    thumbs.className = "case-card__thumbs roofing-case-card__thumbs";
    thumbs.setAttribute("aria-label", "Миниатюры кейса");

    const thumbButtons = images.map((item, imageIndex) => {
      const thumb = document.createElement("button");
      thumb.type = "button";
      thumb.className = "case-card__thumb roofing-case-card__thumb";
      thumb.style.backgroundImage = `url("${item.src}")`;
      thumb.setAttribute("aria-label", `Показать фото ${imageIndex + 1}`);
      thumb.addEventListener("click", () => show(imageIndex));
      thumbs.append(thumb);
      return thumb;
    });
    stage.after(thumbs);

    const show = (index) => {
      activeIndex = (index + images.length) % images.length;
      image.src = images[activeIndex].src;
      image.alt = images[activeIndex].alt;
      thumbButtons.forEach((thumb, thumbIndex) => {
        const active = thumbIndex === activeIndex;
        thumb.classList.toggle("is-active", active);
        thumb.setAttribute("aria-pressed", String(active));
      });
    };

    previous.addEventListener("click", () => show(activeIndex - 1));
    next.addEventListener("click", () => show(activeIndex + 1));
    show(0);
  });
}

function initMobileCasesDisclosure() {
  selectAll(".roofing-cases").forEach((section) => {
    const grid = section.querySelector(".roofing-cases__grid");
    const cards = selectAll(".roofing-cases__card", grid || section);
    if (!grid || cards.length <= 4) return;

    section.classList.add("roofing-cases--collapsible");

    const button = document.createElement("button");
    button.type = "button";
    button.className = "roofing-cases__show-all";
    button.textContent = "Показать все";
    button.setAttribute("aria-expanded", "false");
    button.addEventListener("click", () => {
      section.classList.add("roofing-cases--expanded");
      button.setAttribute("aria-expanded", "true");
      button.remove();
    });

    grid.insertAdjacentElement("afterend", button);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  selectAll("[data-service-title]").forEach((element) => {
    element.addEventListener("click", () => {
      const linkInput = document.querySelector("#inputid_dom_link");
      const titleInput = document.querySelector("#inputid_dom");
      if (linkInput) linkInput.value = element.dataset.serviceLink || "";
      if (titleInput) titleInput.value = element.dataset.serviceTitle || "";
    });
  });
  const overlay = createOverlay();
  initInlineCalculator();
  initPopups(overlay);
  initQuizzes();
  syncHeaderSpacer();
  initCommonInteractions();
  initPhoneMasks();
  initForms();
  initMobileCasesDisclosure();

  const initNonCriticalInteractions = () => {
    initGallery(overlay);
    initCarousels();
    initReviewDisclosures();
    initCaseCardSliders();
  };

  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(initNonCriticalInteractions, { timeout: 1200 });
  } else {
    window.setTimeout(initNonCriticalInteractions, 250);
  }
});
