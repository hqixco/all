const reviewsSection = document.querySelector('.reviews');

if (reviewsSection && document.body.dataset.service === 'roof-repair') {
  reviewsSection.querySelectorAll('.review-card').forEach((card) => {
    const button = card.querySelector('.review-toggle');

    if (!button) return;

    button.addEventListener('click', () => {
      const isOpen = card.classList.toggle('is-open');
      button.setAttribute('aria-expanded', String(isOpen));
      button.setAttribute(
        'aria-label',
        isOpen ? 'Свернуть отзыв' : 'Показать отзыв полностью',
      );
    });
  });
}
