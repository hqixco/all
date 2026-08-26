export function initMenu() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const burger = header.querySelector('[data-menu-open]');
  const closeButton = header.querySelector('[data-menu-close]');

  const setOpen = (isOpen) => {
    header.classList.toggle('site-header--menu-open', isOpen);
    document.documentElement.classList.toggle('is-scroll-locked', isOpen);
  };

  burger?.addEventListener('click', () => setOpen(!header.classList.contains('site-header--menu-open')));
  closeButton?.addEventListener('click', () => setOpen(false));

  header.addEventListener('click', (event) => {
    const target = event.target;
    if (target instanceof HTMLElement && target.matches('[data-menu-link]')) {
      setOpen(false);
    }
  });
}

export function initCatalogCategorySort() {
  const dropdown = document.querySelector('[data-sort-dropdown]');
  if (!dropdown) return;

  const toggle = dropdown.querySelector('[data-sort-toggle]');
  const menu = dropdown.querySelector('[data-sort-menu]');
  const options = Array.from(dropdown.querySelectorAll('[data-sort-option]'));

  if (!(toggle instanceof HTMLButtonElement) || !(menu instanceof HTMLElement)) return;

  const close = () => {
    toggle.setAttribute('aria-expanded', 'false');
    menu.hidden = true;
  };

  const open = () => {
    toggle.setAttribute('aria-expanded', 'true');
    menu.hidden = false;
  };

  const setSelected = (selectedButton) => {
    options.forEach((option) => {
      const isSelected = option === selectedButton;
      option.setAttribute('aria-selected', String(isSelected));
    });
    toggle.textContent = selectedButton.textContent?.trim() ?? toggle.textContent ?? '';
  };

  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    if (isOpen) {
      close();
    } else {
      open();
    }
  });

  options.forEach((option) => {
    option.addEventListener('click', () => {
      if (!(option instanceof HTMLButtonElement)) return;
      setSelected(option);
      close();
    });
  });

  document.addEventListener('click', (event) => {
    if (event.target instanceof Node && !dropdown.contains(event.target)) {
      close();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      close();
    }
  });
}
