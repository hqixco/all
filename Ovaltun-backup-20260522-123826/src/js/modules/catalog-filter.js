export function initCatalogFilter() {
  const panel = document.querySelector('[data-filter-panel]');
  if (!panel) return;

  const filter = panel.querySelector('[data-filter]');
  const openButton = document.querySelector('[data-filter-open]');
  const closeButtons = panel.querySelectorAll('[data-filter-close]');

  const setOpen = (isOpen) => {
    panel.classList.toggle('is-open', isOpen);
    document.documentElement.classList.toggle('is-scroll-locked', isOpen);
  };

  openButton?.addEventListener('click', () => setOpen(true));
  closeButtons.forEach((button) => button.addEventListener('click', () => setOpen(false)));

  panel.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    if (target.matches('[data-filter-close]')) {
      setOpen(false);
      return;
    }

    const applyButton = target.closest('[data-filter-apply]');
    const resetButton = target.closest('[data-filter-reset]');

    if (applyButton) {
      event.preventDefault();
      setOpen(false);
      return;
    }

    if (resetButton && filter) {
      event.preventDefault();
      filter.querySelectorAll('input[type="checkbox"], input[type="radio"]').forEach((input) => {
        if (input instanceof HTMLInputElement) input.checked = false;
      });
    }
  });
}
