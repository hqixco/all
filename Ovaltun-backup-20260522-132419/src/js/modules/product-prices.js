export function initProductPrices() {
  document.querySelectorAll('[data-product-price-tabs]').forEach((tabs) => {
    const buttons = Array.from(tabs.querySelectorAll('[data-product-price-tab]'));
    const priceValue = document.querySelector('[data-product-price-value]');
    const priceCurrency = document.querySelector('[data-product-price-currency]');

    if (!buttons.length || !(priceValue instanceof HTMLElement) || !(priceCurrency instanceof HTMLElement)) return;

    const updateState = (activeButton) => {
      buttons.forEach((button) => {
        const isActive = button === activeButton;
        button.classList.toggle('is-active', isActive);
        button.classList.toggle('product-info__price-tab--active', isActive);
      });

      const value = activeButton.getAttribute('data-price-value');
      const currency = activeButton.getAttribute('data-price-currency');

      if (value) {
        priceValue.textContent = value;
      }

      if (currency) {
        priceCurrency.textContent = currency;
      }
    };

    buttons.forEach((button) => {
      button.addEventListener('click', () => updateState(button));
    });

    const activeButton = buttons.find((button) => button.classList.contains('is-active') || button.classList.contains('product-info__price-tab--active')) || buttons[0];
    updateState(activeButton);
  });
}
