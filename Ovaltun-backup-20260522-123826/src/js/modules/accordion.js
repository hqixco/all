export function initAccordion() {
  document.querySelectorAll('[data-accordion]').forEach((root) => {
    root.querySelectorAll('[data-accordion-item]').forEach((item) => {
      const trigger = item.querySelector('[data-accordion-trigger]');
      if (trigger instanceof HTMLButtonElement) {
        trigger.setAttribute('aria-expanded', String(item.classList.contains('is-open')));
      }
    });

    root.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;

      const trigger = target.closest('[data-accordion-trigger]');
      if (!trigger) return;

      const item = trigger.closest('[data-accordion-item]');
      if (!item) return;

      item.classList.toggle('is-open');
      if (trigger instanceof HTMLButtonElement) {
        trigger.setAttribute('aria-expanded', String(item.classList.contains('is-open')));
      }
    });
  });
}
