export function initCustomersPage() {
  document.querySelectorAll('[data-customers-page]').forEach((page) => {
    const titleNode = document.querySelector('[data-customers-title]');
    const breadcrumbNode = document.querySelector('[data-customers-breadcrumb]');
    const links = Array.from(page.querySelectorAll('[data-customers-target]'));
    const panels = Array.from(page.querySelectorAll('[data-customers-panel]'));

    if (!links.length || !panels.length || !titleNode || !breadcrumbNode) return;

    const states = new Map();

    links.forEach((link) => {
      const target = link.getAttribute('data-customers-target');
      const title = link.getAttribute('data-customers-title') || link.textContent.trim();
      if (target) {
        states.set(target, { title, link });
      }
    });

    const setActive = (target, updateHash = false) => {
      const state = states.get(target) || states.get('delivery-return');
      if (!state) return;

      links.forEach((link) => {
        const isActive = link === state.link;
        link.classList.toggle('side-nav__link--active', isActive);
        link.setAttribute('aria-current', isActive ? 'page' : 'false');
      });

      panels.forEach((panel) => {
        const isActive = panel.getAttribute('data-customers-panel') === target;
        panel.classList.toggle('customers-page__panel--active', isActive);
      });

      titleNode.textContent = state.title;
      breadcrumbNode.textContent = state.title;
      document.title = `ОВАЛТУН - ${state.title}`;

      if (updateHash) {
        const nextHash = `#${target}`;
        if (window.location.hash !== nextHash) {
          history.replaceState(null, '', nextHash);
        }
      }
    };

    links.forEach((link) => {
      link.addEventListener('click', (event) => {
        const target = link.getAttribute('data-customers-target');
        if (!target) return;
        event.preventDefault();
        setActive(target, true);
      });
    });

    const initialTarget = window.location.hash.replace('#', '') || 'delivery-return';
    setActive(states.has(initialTarget) ? initialTarget : 'delivery-return', false);

    window.addEventListener('hashchange', () => {
      const target = window.location.hash.replace('#', '') || 'delivery-return';
      if (states.has(target)) {
        setActive(target, false);
      }
    });
  });
}
