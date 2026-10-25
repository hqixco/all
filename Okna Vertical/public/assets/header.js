(() => {
 const header = document.querySelector('.global-header');
 if (!header) return;
 const toggle = header.querySelector('.global-header__toggle');
 const groups = [...header.querySelectorAll('details')];
 const close = () => {
  header.classList.remove('is-open');
  toggle.setAttribute('aria-expanded','false');
  toggle.setAttribute('aria-label','Открыть меню');
  groups.forEach(group => { group.open = false; });
 };
 toggle.addEventListener('click', () => {
  const open = header.classList.toggle('is-open');
  toggle.setAttribute('aria-expanded',String(open));
  toggle.setAttribute('aria-label',open ? 'Закрыть меню' : 'Открыть меню');
 });
 const hoverMenu = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches && !window.matchMedia('(max-width: 1300px)').matches;
 groups.forEach(group => {
  group.addEventListener('toggle', () => {
   if (group.open) groups.forEach(other => { if (other !== group) other.open = false; });
  });
  group.addEventListener('mouseenter', () => {
   if (!hoverMenu()) return;
   groups.forEach(other => { other.open = other === group; });
  });
  group.addEventListener('mouseleave', () => {
   if (hoverMenu() && !group.contains(document.activeElement)) group.open = false;
  });
  group.querySelector('summary').addEventListener('click', event => {
   if (hoverMenu() && event.detail > 0) {
    event.preventDefault();
    group.open = true;
   }
  });
 });
 header.querySelectorAll('a').forEach(link => link.addEventListener('click',close));
 document.addEventListener('click',event => { if (!header.contains(event.target)) close(); });
 document.addEventListener('keydown',event => { if (event.key === 'Escape') { close(); toggle.focus(); } });
})();

(() => {
 const groups = [...document.querySelectorAll('.footer-navigation details')];
 const mobile = window.matchMedia('(max-width: 600px)');
 const adapt = () => groups.forEach(group => { group.open = !mobile.matches; });
 groups.forEach(group => group.querySelector('summary').addEventListener('click', event => { if (!mobile.matches) event.preventDefault(); }));
 if (mobile.addEventListener) mobile.addEventListener('change', adapt); else mobile.addListener(adapt);
 adapt();
})();
