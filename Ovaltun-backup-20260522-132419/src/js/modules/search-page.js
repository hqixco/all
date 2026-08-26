export function initSearchPage() {
  const queryElement = document.querySelector('[data-search-query]');
  if (!(queryElement instanceof HTMLElement)) return;

  const params = new URLSearchParams(window.location.search);
  const query = (params.get('q') || '').trim();

  queryElement.textContent = query ? `«${query}»` : 'ничего не введено';
}
