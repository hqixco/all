(function () {
  const menu = document.getElementById('site-mobile-menu');
  const burger = document.querySelector('.site-header__burger');
  const form = document.querySelector('.project-form');

  const closeMenu = () => {
    if (!menu || !burger) {
      return;
    }

    menu.classList.remove('is-open');
    menu.hidden = true;
    burger.setAttribute('aria-expanded', 'false');
  };

  const openMenu = () => {
    if (!menu || !burger) {
      return;
    }

    menu.hidden = false;
    menu.classList.add('is-open');
    burger.setAttribute('aria-expanded', 'true');
  };

  if (burger && menu) {
    burger.addEventListener('click', () => {
      if (menu.hidden) {
        openMenu();
      } else {
        closeMenu();
      }
    });

    menu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeMenu);
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
        closeMenu();
      }
    });
  }

  if (form) {
    const status = form.querySelector('.project-form__status');
    const submit = form.querySelector('.project-form__submit');
    const successMessage = form.dataset.successMessage || 'Спасибо! Мы свяжемся с вами';

    form.addEventListener('submit', (event) => {
      event.preventDefault();

      if (status) {
        status.textContent = successMessage;
      }

      if (submit) {
        submit.blur();
      }

      form.reset();
    });
  }
})();
