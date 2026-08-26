export function initForms() {
  document.querySelectorAll('form').forEach((form) => {
    form.addEventListener('submit', (event) => {
      if (form.hasAttribute('data-no-js-submit')) {
        event.preventDefault();
      }
    });
  });
}

