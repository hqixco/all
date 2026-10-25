import './seo.css';
// Permanent content stays in HTML. Only user-triggered filtering and navigation.
const filter = document.querySelector('#project-filter');
if (filter) {
  filter.closest('label').hidden = false;
  filter.addEventListener('change', () => {
    document.querySelectorAll('[data-project-type]').forEach(card => {
      card.hidden = filter.value !== 'all' && card.dataset.projectType !== filter.value;
    });
  });
}
