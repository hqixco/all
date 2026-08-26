export function initTabs() {
  document.querySelectorAll('[data-tabs]').forEach((tabs) => {
    const buttons = Array.from(tabs.querySelectorAll('[data-tab-button]'));
    const panels = Array.from(tabs.querySelectorAll('[data-tab-panel]'));

    const setActive = (name) => {
      buttons.forEach((button) => {
        const isActive = button.getAttribute('data-tab-button') === name;
        button.classList.toggle('is-active', isActive);
        button.classList.toggle('product-tabs__button--active', isActive);
      });

      panels.forEach((panel) => {
        const isActive = panel.getAttribute('data-tab-panel') === name;
        panel.classList.toggle('is-active', isActive);
        panel.classList.toggle('product-tabs__panel--active', isActive);
      });
    };

    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        const name = button.getAttribute('data-tab-button');
        if (name) setActive(name);
      });
    });

    if (buttons[0]) {
      setActive(buttons[0].getAttribute('data-tab-button') || '');
    }
  });
}
