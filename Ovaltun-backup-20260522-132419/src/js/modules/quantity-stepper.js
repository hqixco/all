export function initQuantitySteppers() {
  document.querySelectorAll('[data-quantity-stepper], [data-quantity]').forEach((stepper) => {
    const input = stepper.querySelector('[data-quantity-input], .quantity-stepper__input');
    const minus = stepper.querySelector('[data-quantity-minus]');
    const plus = stepper.querySelector('[data-quantity-plus]');

    if (!(input instanceof HTMLInputElement)) return;

    const min = Number(input.min || 1);
    const max = Number(input.max || 999);

    const update = (value) => {
      const next = Math.min(max, Math.max(min, value));
      input.value = String(next);
      input.dispatchEvent(new Event('change', { bubbles: true }));
    };

    minus?.addEventListener('click', () => update(Number(input.value || min) - 1));
    plus?.addEventListener('click', () => update(Number(input.value || min) + 1));

    input.addEventListener('change', () => update(Number(input.value || min)));
  });
}
