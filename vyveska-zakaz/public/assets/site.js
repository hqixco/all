import './phone-mask.js';
document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('page--interactive');
  const backToTop = document.getElementById('btn_up');
  if (backToTop) {
    backToTop.addEventListener('click', (event) => {
      event.preventDefault();
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, left: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
    });
  }
  const menuButton = document.querySelector('.root__head .hamburger');
  const menu = document.querySelector('.root__head .site-nav');
  if (menuButton && menu) {
    const setMenu = (open, restoreFocus = false) => {
      menu.classList.toggle('site-nav--open', open);
      menuButton.classList.toggle('hamburger--open', open);
      document.body.classList.toggle('page--menu-open', open);
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
      if (restoreFocus) menuButton.focus({ preventScroll: true });
    };
    menuButton.addEventListener('click', () => setMenu(!menu.classList.contains('site-nav--open'), true));
    document.addEventListener('keydown', (event) => {
      if (!menu.classList.contains('site-nav--open')) return;
      if (event.key === 'Escape') { event.preventDefault(); setMenu(false, true); }
      if (event.key === 'Tab') {
        const fields = [menuButton, ...menu.querySelectorAll('a, summary, button')].filter(node => node.getClientRects().length);
        const first = fields[0], last = fields[fields.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    });
    menu.addEventListener('click', (event) => { if (event.target.closest('a')) setMenu(false); });
    window.addEventListener('resize', () => { if (window.innerWidth > 1000) setMenu(false); });
  }

  const hoverNavigation = window.matchMedia('(hover: hover) and (pointer: fine)');
  document.querySelectorAll('.site-nav__group').forEach(group => {
    const canHover = () => window.innerWidth > 1000 && hoverNavigation.matches;
    group.querySelector('summary').addEventListener('click', () => {
      if (window.innerWidth > 1000 || group.open) return;
      document.querySelectorAll('.site-nav__group').forEach(other => {
        if (other !== group) other.open = false;
      });
    });
    group.addEventListener('mouseenter', () => {
      if (!canHover()) return;
      document.querySelectorAll('.site-nav__group').forEach(other => { if (other !== group) other.open = false; });
      group.open = true;
    });
    group.addEventListener('mouseleave', () => {
      if (canHover() && !group.contains(document.activeElement)) group.open = false;
    });
    group.addEventListener('focusout', event => {
      if (canHover() && !group.contains(event.relatedTarget) && !group.matches(':hover')) group.open = false;
    });
  });

  // Animate page anchors explicitly for Safari 13, which lacks native smooth scrolling.
  let anchorAnimation = 0;
  const scrollToAnchor = (target) => {
    window.cancelAnimationFrame(anchorAnimation);
    const header = document.querySelector('.root__head');
    const fixed = header && ['fixed', 'sticky'].includes(window.getComputedStyle(header).position);
    const offset = fixed ? header.getBoundingClientRect().height + 16 : 16;
    const start = window.pageYOffset;
    const end = Math.max(0, Math.min(start + target.getBoundingClientRect().top - offset, document.documentElement.scrollHeight - window.innerHeight));
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) { window.scrollTo(0, end); return; }
    const began = window.performance.now();
    const step = now => {
      const progress = Math.min(1, (now - began) / 480);
      const eased = progress < .5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      window.scrollTo(0, start + (end - start) * eased);
      if (progress < 1) anchorAnimation = window.requestAnimationFrame(step);
    };
    anchorAnimation = window.requestAnimationFrame(step);
  };
  ['wheel', 'touchstart'].forEach(type => window.addEventListener(type, () => window.cancelAnimationFrame(anchorAnimation), { passive: true }));
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href*="#"]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.hasAttribute('data-fancybox') || link.hasAttribute('download') || link.target === '_blank') return;
    const url = new URL(link.href, window.location.href);
    if (url.origin !== window.location.origin || url.pathname !== window.location.pathname || url.search !== window.location.search || !url.hash) return;
    let id;
    try { id = decodeURIComponent(url.hash.slice(1)); } catch { return; }
    const target = document.getElementById(id);
    if (!target || target.hidden || target.closest('.modal__content, .works-lightbox')) return;
    event.preventDefault();
    if (window.location.hash !== url.hash) window.history.pushState(null, '', url.hash);
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
    scrollToAnchor(target);
  });

  let activeModal = null;
  let modalTrigger = null;
  let modalCloseTimer = null;
  const finishClose = (modal) => {
    modal.classList.remove('modal__content--open', 'modal__content--mounted');
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    modal.removeAttribute('aria-modal');
  };
  const closeModal = () => {
    if (!activeModal || !activeModal.classList.contains('modal__content--open')) return;
    const modal = activeModal;
    modal.classList.remove('modal__content--open');
    document.body.classList.remove('page--modal-open');
    const finish = () => {
      finishClose(modal);
      activeModal = null;
      if (modalTrigger) modalTrigger.focus({ preventScroll: true });
      modalTrigger = null;
    };
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) finish();
    else modalCloseTimer = window.setTimeout(finish, 220);
  };
  document.querySelectorAll('[data-fancybox][data-src^="#"]').forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      const target = document.querySelector(trigger.dataset.src);
      if (!target || target.classList.contains('works-lightbox')) return;
      event.preventDefault();
      window.clearTimeout(modalCloseTimer);
      if (activeModal && activeModal !== target) finishClose(activeModal);
      if (trigger.dataset.requestTitle) {
        const title = target.querySelector('.modal__title');
        const form = target.querySelector('form');
        const comment = target.querySelector('textarea');
        const submit = target.querySelector('[type="submit"]');
        if (title) title.textContent = trigger.dataset.requestTitle;
        if (comment) comment.placeholder = trigger.dataset.requestPlaceholder;
        if (submit) {
          if (submit.tagName === 'INPUT') submit.value = trigger.dataset.requestSubmit;
          else submit.textContent = trigger.dataset.requestSubmit;
        }
        const context = form && form.querySelector('[name="request-context"]');
        if (context) context.value = trigger.dataset.requestContext;
      }
      activeModal = target;
      modalTrigger = trigger;
      target.hidden = false;
      target.setAttribute('aria-hidden', 'false');
      target.classList.add('modal__content--mounted');
      target.setAttribute('role', 'dialog');
      target.setAttribute('aria-modal', 'true');
      // Commit the initial state before starting the opening transition.
      target.getBoundingClientRect();
      target.classList.add('modal__content--open');
      document.body.classList.add('page--modal-open');
      const field = target.querySelector('input:not([type="hidden"]), textarea') || target.querySelector('button');
      if (field) field.focus({ preventScroll: true });
    });
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeModal();
  });
  document.addEventListener('click', (event) => {
    if (activeModal && (event.target === document.body || (event.target.closest('[data-modal-close]') && activeModal.contains(event.target)))) closeModal();
  });

  document.querySelectorAll('[data-static-form]').forEach((form) => {
    const endpoint = '/mail.php';
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      form.action = endpoint;
      form.method = 'post';
      if (!form.reportValidity()) return;
      const photo = form.querySelector('input[name="facade-photo"]');
      const file = photo && photo.files[0];
      if (file && (file.size > 5 * 1024 * 1024 || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type))) {
        const status = form.querySelector('[data-form-status]');
        if (status) { status.hidden = false; status.textContent = 'Прикрепите фото JPG, PNG или WebP размером до 5 МБ.'; }
        photo.focus();
        return;
      }
      const data = new FormData(form);
      const formType = form.closest('#formReviews') ? 'review' : form.closest('#formOrderCall') ? 'callback' : form.classList.contains('light-signs__form') ? 'calculation' : 'order';
      data.set('form-type', formType);
      data.set('page-url', window.location.pathname);
      const status = form.querySelector('[data-form-status]');
      const submit = form.querySelector('[type="submit"]');
      if (status) { status.hidden = false; status.textContent = 'Отправляем заявку…'; }
      if (submit && submit.disabled) return;
      if (submit) submit.disabled = true;
      fetch(endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
        .then(async (response) => {
          let result;
          try { result = await response.json(); }
          catch { throw new Error('Не удалось получить подтверждение отправки.'); }
          if (!response.ok || result.success !== true) {
            if (status) status.textContent = result.message || 'Не удалось отправить заявку.';
            return;
          }
          if (status) status.textContent = result.message || 'Заявка отправлена. Мы скоро свяжемся с вами.';
          form.reset();
        })
        .catch(() => {
          if (status) status.textContent = 'Не удалось подтвердить отправку заявки. Повторите попытку или позвоните нам.';
        })
        .finally(() => { if (submit) submit.disabled = false; });
    });
  });

  const search = new URLSearchParams(window.location.search).get('s');
  const searchResults = document.querySelector('[data-search-results]');
  if (searchResults) {
    const query = (search || '').trim().toLocaleLowerCase('ru');
    const searchInput = document.querySelector('input[name="s"]');
    if (searchInput) searchInput.value = search || '';
    const links = [...searchResults.querySelectorAll('[data-search-text]')];
    let count = 0;
    links.forEach((link) => {
      const match = query && link.dataset.searchText.includes(query);
      link.hidden = !match;
      if (match) count++;
    });
    const status = document.querySelector('[data-search-status]');
    if (status) status.textContent = query ? `Найдено страниц: ${count}` : 'Все страницы сайта. Введите запрос, чтобы отфильтровать результаты.';
  }

  document.querySelectorAll('.spoiler__button').forEach((button) => {
    button.addEventListener('click', () => {
      const text = button.previousElementSibling;
      if (!text) return;
      const expanded = button.getAttribute('aria-expanded') === 'true';
      text.hidden = expanded;
      button.setAttribute('aria-expanded', String(!expanded));
      button.textContent = expanded ? button.dataset.open : button.dataset.close;
    });
  });

  document.querySelectorAll('.partners__carousel').forEach((carousel) => {
    const list = carousel.querySelector('.partners__list');
    const move = (direction) => {
      const maximum = list.scrollWidth - list.clientWidth;
      let left = list.scrollLeft + direction * list.clientWidth;
      if (direction > 0 && list.scrollLeft >= maximum - 2) left = 0;
      if (direction < 0 && list.scrollLeft <= 2) left = maximum;
      list.scrollTo({ left: Math.max(0, Math.min(maximum, left)), behavior: 'smooth' });
    };
    carousel.querySelector('.partners__arrow--prev').addEventListener('click', () => move(-1));
    carousel.querySelector('.partners__arrow--next').addEventListener('click', () => move(1));
    let paused = false;
    let dragging = false;
    let startX = 0;
    let startScroll = 0;
    let moved = false;
    list.addEventListener('dragstart', (event) => event.preventDefault());
    list.addEventListener('mousedown', (event) => {
      if (event.button !== 0) return;
      dragging = true;
      moved = false;
      startX = event.clientX;
      startScroll = list.scrollLeft;
    });
    document.addEventListener('mousemove', (event) => {
      if (!dragging) return;
      const distance = event.clientX - startX;
      if (Math.abs(distance) > 4) {
        moved = true;
        list.classList.add('partners__list--dragging');
        event.preventDefault();
      }
      if (moved) list.scrollLeft = startScroll - distance;
    });
    const finish = () => {
      if (!dragging) return;
      dragging = false;
      list.classList.remove('partners__list--dragging');
      if (moved) {
        const slide = list.querySelector('.partners__slide');
        const width = slide.getBoundingClientRect().width;
        if (width) list.scrollTo({ left: Math.round(list.scrollLeft / width) * width, behavior: 'smooth' });
        window.setTimeout(() => { moved = false; }, 0);
      }
    };
    document.addEventListener('mouseup', finish);
    window.addEventListener('blur', finish);
    list.addEventListener('click', (event) => {
      if (!moved) return;
      event.preventDefault();
      event.stopPropagation();
    }, true);
    carousel.addEventListener('mouseenter', () => { paused = true; });
    carousel.addEventListener('mouseleave', () => { paused = false; });
    carousel.addEventListener('focusin', () => { paused = true; });
    carousel.addEventListener('focusout', () => { paused = false; });
    window.setInterval(() => { if (!paused && !dragging) move(1); }, 3000);
  });

  document.querySelectorAll('.root__main .b__block .carousel__track').forEach((slider) => {
    const slides = [...slider.querySelectorAll(':scope > .carousel__slide')];
    if (slides.length < 2) return;

    let pointerStart = 0;
    let scrollStart = 0;
    let pressed = false;
    let dragged = false;
    let dragDistance = 0;
    let snapTimer = null;
    const restoreSnap = () => {
      window.clearTimeout(snapTimer);
      snapTimer = window.setTimeout(() => {
        if (!pressed) slider.classList.remove('carousel__track--dragging');
      }, 180);
    };
    const count = Number(slider.dataset.carouselCount) || slides.length;
    const cycleWidth = () => count * slider.clientWidth;
    slider.scrollLeft = cycleWidth();
    slider.addEventListener('scroll', () => {
      if (!pressed && slider.classList.contains('carousel__track--dragging')) restoreSnap();
      const cycle = cycleWidth();
      if (!cycle || !slider.dataset.carouselCount) return;
      const shift = slider.scrollLeft < cycle / 2 ? cycle : slider.scrollLeft > cycle * 2.5 ? -cycle : 0;
      if (shift) {
        slider.scrollLeft += shift;
        if (pressed) scrollStart += shift;
      }
    });
    window.addEventListener('resize', () => { slider.scrollLeft = cycleWidth(); });
    const activeIndex = () => Math.round(slider.scrollLeft / slider.clientWidth);
    const finishDrag = () => {
      if (!pressed) return;
      pressed = false;
      if (dragged) {
        const width = slider.clientWidth;
        const threshold = Math.min(80, width * 0.12);
        const steps = Math.abs(dragDistance) >= threshold ? Math.max(1, Math.round(Math.abs(dragDistance) / width)) * (dragDistance > 0 ? -1 : 1) : 0;
        const target = (Math.round(scrollStart / width) + steps) * width;
        slider.scrollTo({ left: target, behavior: 'smooth' });
        restoreSnap();
        window.setTimeout(() => { dragged = false; }, 0);
      } else {
        slider.classList.remove('carousel__track--dragging');
      }
    };

    slider.addEventListener('dragstart', (event) => event.preventDefault());
    slider.addEventListener('mousedown', (event) => {
      if (event.button !== 0) return;
      pressed = true;
      dragged = false;
      dragDistance = 0;
      window.clearTimeout(snapTimer);
      slider.classList.add('carousel__track--dragging');
      pointerStart = event.clientX;
      scrollStart = slider.scrollLeft;
      slider.scrollTo({ left: scrollStart, behavior: 'auto' });
    });
    document.addEventListener('mousemove', (event) => {
      if (!pressed) return;
      const distance = event.clientX - pointerStart;
      dragDistance = distance;
      if (Math.abs(distance) > 4) {
        dragged = true;
        slider.classList.add('carousel__track--dragging');
        event.preventDefault();
      }
      if (dragged) slider.scrollLeft = scrollStart - distance;
    });
    document.addEventListener('mouseup', finishDrag);
    window.addEventListener('blur', finishDrag);
    slider.addEventListener('click', (event) => {
      if (!dragged) return;
      event.preventDefault();
      event.stopPropagation();
      dragged = false;
    }, true);
    window.setInterval(() => {
      if (pressed || slider.classList.contains('carousel__track--dragging')) return;
      const next = activeIndex() + 1;
      slider.scrollTo({ left: next * slider.clientWidth, behavior: 'smooth' });
    }, 5000);
  });
});
