export function initFavorites() {
  const syncFavoriteIcon = (button, isActive) => {
    const path = button.querySelector(
      '.product-card__favorite-icon path, .product-info__favorite-icon path, .product-related-card__favorite-icon path',
    );
    if (!(path instanceof SVGPathElement)) return;

    if (isActive) {
      path.setAttribute('fill', '#f04438');
      path.setAttribute('stroke', '#f04438');
    } else {
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', 'currentColor');
    }
  };

  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const button = target.closest('[data-favorite]');
    if (!(button instanceof HTMLElement)) return;

    const isActive = !button.classList.contains('is-active');
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
    syncFavoriteIcon(button, isActive);
  });
}
