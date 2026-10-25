import './service-menu.css';

const item = document.querySelector('.main-nav__item--dropdown');
const toggle = item?.querySelector('.main-nav__dropdown-toggle');
if (item && toggle) {
  const close = () => {
    item.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  };
  toggle.addEventListener('click', () => {
    const open = !item.classList.contains('is-open');
    item.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  });
  item.querySelectorAll('a').forEach(link => link.addEventListener('click', close));
  document.addEventListener('click', event => {
    if (!item.contains(event.target)) close();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') close();
  });
}
