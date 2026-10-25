import './styles.css';
import './roof-replacement.css';

document.querySelectorAll('.nav-dropdown').forEach(dropdown => {
  const toggle = dropdown.querySelector('.nav-dropdown__toggle');
  const close = () => {
    dropdown.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  };
  toggle.addEventListener('click', event => {
    event.stopPropagation();
    const open = dropdown.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  dropdown.addEventListener('keydown', event => {
    if (event.key === 'Escape') { close(); toggle.focus(); }
  });
  document.addEventListener('click', event => {
    if (!dropdown.contains(event.target)) close();
  });
});

const menu = document.querySelector('.header-menu-toggle');
menu.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  document.querySelector('.site-header').classList.toggle('menu-open', open);
});
document.querySelectorAll('#site-navigation a').forEach(link => link.addEventListener('click', () => {
  menu.setAttribute('aria-expanded', 'false');
  document.querySelector('.site-header').classList.remove('menu-open');
}));

const quiz = document.querySelector('.quiz-form');
const steps = Array.from(quiz.querySelectorAll('.quiz-panel'));
const controls = quiz.querySelector('.quiz-controls');
const previous = quiz.querySelector('.quiz-prev');
const next = quiz.querySelector('.quiz-next');
let step = 0;
let autoAdvanceTimer;
const showStep = () => {
  clearTimeout(autoAdvanceTimer);
  steps.forEach((panel, index) => { panel.hidden = index !== step; });
  quiz.querySelector('.quiz-step').textContent = step === steps.length - 1 ? 'Контактные данные' : `Вопрос ${step + 1} из ${steps.length - 1}`;
  quiz.querySelector('.quiz-progress').setAttribute('aria-valuenow', String(step + 1));
  quiz.querySelector('.quiz-progress span').style.width = `${(step + 1) / steps.length * 100}%`;
  controls.hidden = step === steps.length - 1;
  previous.disabled = step === 0;
  next.disabled = !steps[step].querySelector('input:checked');
};
quiz.addEventListener('change', event => {
  if (event.target.type !== 'radio') return;
  next.disabled = false;
  clearTimeout(autoAdvanceTimer);
  const selectedStep = step;
  autoAdvanceTimer = setTimeout(() => {
    if (step !== selectedStep || step === steps.length - 1) return;
    step += 1;
    showStep();
  }, 200);
});
next.addEventListener('click', () => {
  if (!steps[step].querySelector('input:checked')) return;
  step = Math.min(step + 1, steps.length - 1);
  showStep();
});
previous.addEventListener('click', () => { step = Math.max(0, step - 1); showStep(); });
showStep();

const modal = document.querySelector('.estimate-modal');
const gallery = document.querySelector('.replacement-gallery');
let galleryMove;
let galleryTrigger;
const closeGallery = () => {
  gallery.classList.remove('is-open');
  gallery.setAttribute('aria-hidden', 'true');
  if (galleryTrigger) galleryTrigger.focus();
};
gallery.querySelectorAll('[data-gallery-close]').forEach(button => button.addEventListener('click', closeGallery));
gallery.querySelector('[data-gallery-prev]').addEventListener('click', () => galleryMove(-1));
gallery.querySelector('[data-gallery-next]').addEventListener('click', () => galleryMove(1));
let trigger;
const closeModal = () => {
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  if (trigger) trigger.focus();
};
document.querySelectorAll('a.button[href="#estimate"], a.text-link[href="#estimate"], .hero-card-link').forEach(link => {
  link.setAttribute('aria-haspopup', 'dialog');
  link.addEventListener('click', event => {
    event.preventDefault();
    trigger = link;
    modal.querySelector('input[name="material"]').value = link.getAttribute('aria-label') || link.textContent.trim();
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    modal.querySelector('input[type="tel"]').focus();
  });
});
modal.querySelectorAll('[data-modal-close]').forEach(button => button.addEventListener('click', closeModal));
document.addEventListener('keydown', event => {
  const activeModal = gallery.classList.contains('is-open') ? gallery : modal.classList.contains('is-open') ? modal : null;
  if (!activeModal) return;
  if (event.key === 'Escape') activeModal === gallery ? closeGallery() : closeModal();
  if (activeModal === gallery && event.key === 'ArrowLeft') galleryMove(-1);
  if (activeModal === gallery && event.key === 'ArrowRight') galleryMove(1);
  if (event.key === 'Tab') {
    const fields = Array.from(activeModal.querySelectorAll('button, input:not([type="hidden"]), a'));
    const first = fields[0], last = fields[fields.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});

document.querySelectorAll('.case-card').forEach(card => {
  const image = card.querySelector('.case-photo img');
  const thumbs = Array.from(card.querySelectorAll('[data-image]'));
  let index = 0;
  const select = nextIndex => {
    index = (nextIndex + thumbs.length) % thumbs.length;
    image.src = thumbs[index].style.backgroundImage.replace(/^url\(["']?|["']?\)$/g, '');
    image.alt = `${card.querySelector('h3').textContent}, фото ${index + 1}`;
    thumbs.forEach((thumb, n) => thumb.setAttribute('aria-pressed', String(n === index)));
    if (gallery.classList.contains('is-open')) {
      gallery.querySelector('img').src = image.src;
      gallery.querySelector('img').alt = image.alt;
      gallery.querySelector('[role="status"]').textContent = `${index + 1} / ${thumbs.length}`;
    }
  };
  thumbs.forEach((thumb, n) => thumb.addEventListener('click', () => select(n)));
  card.querySelector('[data-dir="prev"]').addEventListener('click', () => select(index - 1));
  card.querySelector('[data-dir="next"]').addEventListener('click', () => select(index + 1));
  card.querySelector('[data-gallery-open]').addEventListener('click', event => {
    galleryTrigger = event.currentTarget;
    galleryMove = direction => select(index + direction);
    gallery.querySelector('h2').textContent = card.querySelector('h3').textContent;
    gallery.classList.add('is-open');
    gallery.setAttribute('aria-hidden', 'false');
    select(index);
    gallery.querySelector('[data-gallery-close]').focus();
  });
});
document.querySelectorAll('.review-toggle').forEach(button => button.addEventListener('click', () => {
  const open = button.closest('.review-card').classList.toggle('is-open');
  button.setAttribute('aria-expanded', String(open));
  button.setAttribute('aria-label', open ? 'Свернуть отзыв' : 'Показать отзыв полностью');
}));

const digits = value => {
  const number = value.replace(/\D/g, '');
  return /^[78]/.test(number) ? number.slice(1, 11) : number.slice(0, 10);
};
document.querySelectorAll('form').forEach(form => {
  form.querySelectorAll('input, select').forEach((field, index) => {
    if (!field.name) {
      field.name = field.type === 'file' ? 'photos[]' : field.type === 'checkbox' ? 'policy' : field.type === 'tel' ? 'phone' : `field_${index + 1}`;
    }
    if (field.type === 'tel') {
      field.required = true;
      field.autocomplete = 'tel';
      field.inputMode = 'tel';
      field.addEventListener('input', () => field.setCustomValidity(digits(field.value).length === 10 ? '' : 'Введите номер полностью'));
    }
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const phone = form.querySelector('input[type="tel"]');
    phone.setCustomValidity(digits(phone.value).length === 10 ? '' : 'Введите номер полностью');
    if (!form.reportValidity()) return;
    const button = form.querySelector('button[type="submit"]');
    const status = form.querySelector('.form-status');
    button.disabled = true;
    status.textContent = 'Отправляем заявку…';
    const body = new FormData(form);
    body.set('form_name', 'Замена кровли — ' + (form.className || 'расчёт'));
    body.set('page_url', window.location.href);
    try {
      const response = await fetch('/mail.php', {method: 'POST', body});
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'Не удалось отправить заявку');
      status.textContent = 'Спасибо! Заявка отправлена. Прораб свяжется с вами.';
      if (typeof window.ym === 'function') window.ym(112914733, 'reachGoal', 'zamena_krovli_form_submit');
      form.reset();
      if (form === quiz) { step = 0; showStep(); }
    } catch (error) {
      status.textContent = error.message || 'Ошибка отправки. Попробуйте ещё раз.';
    } finally { button.disabled = false; }
  });
});
