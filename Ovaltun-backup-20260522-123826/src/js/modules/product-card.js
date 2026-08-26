export function initProductCardTitles() {
  const cards = Array.from(document.querySelectorAll('.product-card'));
  if (!cards.length) return;

  const updateCard = (card) => {
    const title = card.querySelector('.product-card__title');
    const overlay = card.querySelector('.product-card__title-overlay');

    if (!(title instanceof HTMLElement) || !(overlay instanceof HTMLElement)) return;

    overlay.textContent = title.textContent?.trim() ?? '';
    card.classList.toggle('product-card--title-overflow', title.scrollWidth > title.clientWidth);
  };

  const updateAll = () => {
    cards.forEach(updateCard);
  };

  updateAll();

  if ('ResizeObserver' in window) {
    const resizeObserver = new ResizeObserver(() => {
      updateAll();
    });

    cards.forEach((card) => resizeObserver.observe(card));
    window.addEventListener('resize', updateAll);
  } else {
    window.addEventListener('resize', updateAll);
  }
}

export function initProductCardNavigation() {
  const cards = Array.from(document.querySelectorAll('[data-product-card-link]'));
  if (!cards.length) return;

  const isInteractiveElement = (target) =>
    target instanceof Element &&
    Boolean(target.closest('button, a, input, select, textarea, label, [data-favorite]'));

  const openCard = (card) => {
    const link = card.getAttribute('data-product-card-link');
    if (!link) return;
    window.location.href = link;
  };

  cards.forEach((card) => {
    card.addEventListener('click', (event) => {
      if (isInteractiveElement(event.target)) return;
      openCard(card);
    });

    card.addEventListener('keydown', (event) => {
      if (isInteractiveElement(event.target)) return;
      if (event.key !== 'Enter' && event.key !== ' ') return;

      event.preventDefault();
      openCard(card);
    });
  });
}
