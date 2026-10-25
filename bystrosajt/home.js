import { initPhoneMasks } from "./phone-mask.js";

initPhoneMasks();

document.querySelectorAll(".stroyka-case").forEach((card) => {
  const button = document.createElement("button");
  const caseTitle = card.querySelector("h3")?.textContent?.trim();
  button.type = "button";
  button.className = "stroyka-case__project-button";
  button.dataset.modalTitle = "Обсудим ваш проект";
  button.dataset.modalTopic = caseTitle
    ? `Проект по мотивам кейса: ${caseTitle}`
    : "Обсуждение проекта";
  button.textContent = "Обсудить мой проект";
  card.append(button);
});

const modal = document.querySelector("#project-modal");
const title = document.querySelector("#project-modal-title");
const topic = document.querySelector("#project-modal-topic");
const modalTestOffer = document.querySelector("[data-modal-test-offer]");
const modalTriggers = document.querySelectorAll("[data-modal-title]");
let previousFocus;

function closeModal() {
  modal.classList.remove("modal--open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  previousFocus?.focus();
}

function openModal(card) {
  previousFocus = document.activeElement;
  title.textContent = card.dataset.modalTitle;
  const modalTopic = card.dataset.modalTopic || "";
  topic.value = modalTopic;
  if (modalTestOffer instanceof HTMLElement) {
    modalTestOffer.hidden = !modalTopic.toLowerCase().includes("тест");
  }
  modal.classList.add("modal--open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  modal.querySelector('input[name="name"]').focus();
}

modalTriggers.forEach((trigger) => {
  trigger.addEventListener("click", () => openModal(trigger));
  if (!trigger.classList.contains("hero-card")) return;
  trigger.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openModal(trigger);
    }
  });
});

modal
  .querySelectorAll("[data-modal-close]")
  .forEach((element) => element.addEventListener("click", closeModal));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal.classList.contains("modal--open"))
    closeModal();
});

document.querySelectorAll("[data-case-slider]").forEach((slider) => {
  const track = slider.querySelector("[data-case-slider-track]");
  const slides = Array.from(
    slider.querySelectorAll(".stroyka-case-slider__slide"),
  );
  const dots = Array.from(slider.querySelectorAll("[data-case-slider-dot]"));
  const previous = slider.querySelector('[data-case-slider-nav="prev"]');
  const next = slider.querySelector('[data-case-slider-nav="next"]');
  if (!(track instanceof HTMLElement) || slides.length < 2) return;

  let currentIndex = 0;
  const update = (index) => {
    currentIndex = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === currentIndex);
      dot.setAttribute(
        "aria-current",
        dotIndex === currentIndex ? "true" : "false",
      );
    });
  };

  previous?.addEventListener("click", () => update(currentIndex - 1));
  next?.addEventListener("click", () => update(currentIndex + 1));
  dots.forEach((dot, index) =>
    dot.addEventListener("click", () => update(index)),
  );
  update(0);
});

document.querySelectorAll(".stroyka-case__copy").forEach((copy) => {
  const items = Array.from(copy.querySelectorAll("p"));
  if (items.length <= 1) return;

  const secondItem = items[1];
  if (!(secondItem instanceof HTMLElement)) return;

  const previewHeight = secondItem.offsetTop + secondItem.offsetHeight / 2;
  copy.style.setProperty(
    "--stroyka-case-full-height",
    `${copy.scrollHeight}px`,
  );
  copy.style.setProperty("--stroyka-case-preview-height", `${previewHeight}px`);
  copy.classList.add("is-collapsed");

  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "stroyka-case__toggle";
  toggle.textContent = "Развернуть";
  toggle.setAttribute("aria-expanded", "false");

  toggle.addEventListener("click", () => {
    const isExpanded = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!isExpanded));
    toggle.textContent = isExpanded ? "Развернуть" : "Свернуть";
    copy.classList.toggle("is-collapsed", isExpanded);
  });

  copy.insertAdjacentElement("afterend", toggle);
});
