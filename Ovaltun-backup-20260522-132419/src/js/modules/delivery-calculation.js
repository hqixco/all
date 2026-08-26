export function initDeliveryCalculation() {
  document.querySelectorAll('[data-delivery-calc]').forEach((calc) => {
    const buttons = Array.from(calc.querySelectorAll('.delivery-calc__vehicle'));
    const priceNode = calc.querySelector('[data-delivery-price]');
    const selectWrap = calc.querySelector('[data-delivery-select]');

    if (!buttons.length || !priceNode) return;

    const setActive = (button) => {
      buttons.forEach((item) => {
        item.classList.toggle('delivery-calc__vehicle--active', item === button);
      });

      const price = button.getAttribute('data-price');
      if (price) {
        priceNode.textContent = `${price} ₽`;
      }
    };

    buttons.forEach((button) => {
      button.addEventListener('click', () => setActive(button));
    });

    if (selectWrap instanceof HTMLElement) {
      const trigger = selectWrap.querySelector('[data-delivery-select-trigger]');
      const panel = selectWrap.querySelector('[data-delivery-select-panel]');
      const search = selectWrap.querySelector('[data-delivery-select-search]');
      const valueNode = selectWrap.querySelector('[data-delivery-select-value]');
      const input = selectWrap.querySelector('[data-delivery-select-input]');
      const optionButtons = Array.from(selectWrap.querySelectorAll('[data-delivery-select-option]'));

      if (
        !(trigger instanceof HTMLButtonElement) ||
        !(panel instanceof HTMLElement) ||
        !(search instanceof HTMLInputElement) ||
        !(valueNode instanceof HTMLElement) ||
        !(input instanceof HTMLInputElement) ||
        !optionButtons.length
      ) {
        return;
      }

      const normalize = (value) =>
        value
          .toLowerCase()
          .replaceAll('ё', 'е')
          .trim();

      const setOpen = (isOpen) => {
        panel.hidden = !isOpen;
        trigger.setAttribute('aria-expanded', String(isOpen));

        if (!isOpen) {
          search.value = '';
          optionButtons.forEach((option) => {
            option.hidden = false;
          });
        } else {
          window.requestAnimationFrame(() => {
            search.focus();
          });
        }
      };

      const filterOptions = () => {
        const query = normalize(search.value);

        optionButtons.forEach((option) => {
          const label = normalize(option.textContent || '');
          option.hidden = Boolean(query) && !label.includes(query);
        });
      };

      const setValue = (button) => {
        const label = button.textContent?.trim() || 'Населённый пункт';
        const optionValue = button.getAttribute('data-value') || '';

        valueNode.textContent = label;
        input.value = optionValue;

        optionButtons.forEach((option) => {
          const isActive = option === button;
          option.classList.toggle('is-active', isActive);
          option.setAttribute('aria-selected', String(isActive));
        });

        setOpen(false);
      };

      trigger.addEventListener('click', () => {
        setOpen(panel.hidden);
      });

      search.addEventListener('input', filterOptions);

      optionButtons.forEach((option) => {
        option.addEventListener('click', () => setValue(option));
      });

      document.addEventListener('click', (event) => {
        if (!(event.target instanceof Node)) return;
        if (!selectWrap.contains(event.target) && !panel.hidden) {
          setOpen(false);
        }
      });

      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !panel.hidden) {
          setOpen(false);
          trigger.focus();
        }
      });

      const defaultOption = optionButtons[0];
      if (defaultOption instanceof HTMLButtonElement) {
        defaultOption.classList.add('is-active');
        defaultOption.setAttribute('aria-selected', 'true');
      }
    }
  });
}
