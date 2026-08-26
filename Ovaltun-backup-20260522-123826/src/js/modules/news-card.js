function initCardTitles({ cardSelector, titleSelector, overlayClass, overflowClass }) {
  const cards = Array.from(document.querySelectorAll(cardSelector));
  if (!cards.length) return;

  const updateCard = (card) => {
    const title = card.querySelector(titleSelector);
    let overlay = card.querySelector(`.${overlayClass}`);

    if (!(title instanceof HTMLElement)) return;

    if (!(overlay instanceof HTMLElement)) {
      overlay = document.createElement('span');
      overlay.className = overlayClass;
      overlay.setAttribute('aria-hidden', 'true');
      title.insertAdjacentElement('afterend', overlay);
    }

    overlay.textContent = title.textContent?.trim() ?? '';
    card.classList.toggle(overflowClass, title.scrollWidth > title.clientWidth);
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

function initCardNavigation({ cardSelector, dataAttr }) {
  const cards = Array.from(document.querySelectorAll(cardSelector));
  if (!cards.length) return;

  const isInteractiveElement = (target) =>
    target instanceof Element &&
    Boolean(target.closest('button, a, input, select, textarea, label'));

  const openCard = (card) => {
    const link = card.getAttribute(dataAttr);
    if (!link) return;
    window.location.href = link;
  };

  cards.forEach((card) => {
    if (!card.hasAttribute('tabindex')) {
      card.tabIndex = 0;
    }

    if (!card.hasAttribute('role')) {
      card.setAttribute('role', 'link');
    }

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

export function initNewsCardTitles() {
  initCardTitles({
    cardSelector: '.news-card',
    titleSelector: '.news-card__title',
    overlayClass: 'news-card__title-overlay',
    overflowClass: 'news-card--title-overflow',
  });
}

export function initNewsCardNavigation() {
  initCardNavigation({
    cardSelector: '[data-news-card-link]',
    dataAttr: 'data-news-card-link',
  });
}

export function initPromotionsCardTitles() {
  initCardTitles({
    cardSelector: '.promotions-card',
    titleSelector: '.promotions-card__title',
    overlayClass: 'promotions-card__title-overlay',
    overflowClass: 'promotions-card--title-overflow',
  });
}
