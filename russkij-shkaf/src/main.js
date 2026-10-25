import { calculateWardrobePrice } from './calculator-price.js';

const LEAD_ENDPOINT = '/mail.php';

const installmentForm = document.querySelector('#installment-form');
installmentForm.elements.phone.addEventListener('input', event => event.target.setCustomValidity(''));
installmentForm.addEventListener('submit', async event => {
  event.preventDefault();
  const phone = installmentForm.elements.phone;
  const digits = phone.value.replace(/\D/g, '');
  phone.setCustomValidity(digits.length >= 10 && digits.length <= 15 ? '' : 'Введите корректный номер телефона.');
  if (!installmentForm.reportValidity()) return;
  const button = installmentForm.querySelector('button[type="submit"]');
  if (button.disabled) return;
  const status = installmentForm.querySelector('.installment-banner__status');
  const data = new FormData(installmentForm);
  addLeadMetadata(data, 'Заявка на рассрочку');
  data.set('form_type', 'Заявка на рассрочку');
  button.disabled = true;
  installmentForm.setAttribute('aria-busy', 'true');
  status.textContent = 'Отправляем заявку…';
  try {
    const response = await fetch(LEAD_ENDPOINT, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error('Installment submission failed');
    trackFormSubmission('installment-form');
    status.textContent = 'Заявка отправлена. Менеджер свяжется с вами и расскажет об условиях рассрочки.';
    installmentForm.reset();
  } catch {
    status.textContent = 'Не удалось отправить заявку. Попробуйте ещё раз или позвоните: +7 (962) 718-11-80.';
  } finally {
    button.disabled = false;
    installmentForm.removeAttribute('aria-busy');
  }
});

function addLeadMetadata(data, formName) {
  data.set('form_name', formName);
  data.set('page_url', window.location.href);
}

function trackFormSubmission(formId) {
  if (typeof window.ym === 'function') window.ym(113173662, 'reachGoal', 'form_submit', { form_id: formId });
}

function showSubmittedState(form) {
  const container = form.closest('.modal-panel, .quiz-card, .wardrobe-calculator__result, .compare-action');
  if (!container) return;
  const confirmation = container.querySelector('.popup-confirmation, .quiz-confirmation, .wardrobe-calculator__confirmation');
  if (!confirmation) return;
  container.classList.add('submitted');
  confirmation.hidden = false;
}

function showPopup(popup) {
  const panel = popup.querySelector('.modal-panel');
  if (panel) {
    panel.classList.remove('submitted');
    const confirmation = panel.querySelector('.popup-confirmation');
    if (confirmation) confirmation.hidden = true;
    const form = panel.querySelector('form.submitted');
    if (form) form.classList.remove('submitted');
  }
  popup.hidden = false;
  requestAnimationFrame(() => popup.classList.add('is-visible'));
}

function hidePopup(popup) {
  popup.classList.remove('is-visible');
  window.setTimeout(() => {
    if (!popup.classList.contains('is-visible')) popup.hidden = true;
  }, 240);
}

function formatRussianPhone(value) {
  let digits = value.replace(/\D/g, '');
  if (digits.startsWith('7') || digits.startsWith('8')) digits = digits.slice(1);
  digits = digits.slice(0, 10);
  if (!digits) return '';
  let formatted = `+7 (${digits.slice(0, 3)}`;
  if (digits.length >= 3) formatted += ')';
  if (digits.length > 3) formatted += ` ${digits.slice(3, 6)}`;
  if (digits.length > 6) formatted += `-${digits.slice(6, 8)}`;
  if (digits.length > 8) formatted += `-${digits.slice(8, 10)}`;
  return formatted;
}

document.querySelectorAll('input[type="tel"]').forEach(input => {
  input.placeholder = '+7 (___) ___-__-__';
  input.addEventListener('input', () => {
    const formatted = formatRussianPhone(input.value);
    if (input.value !== formatted) input.value = formatted;
  });
});

const quizVideoBlock = document.querySelector('.quiz-video');
const quizVideo = quizVideoBlock.querySelector('video');
const quizVideoToggle = quizVideoBlock.querySelector('.quiz-video-toggle');
quizVideo.controls = false;
quizVideoToggle.hidden = false;
function syncQuizVideo() {
  const playing = !quizVideo.paused && !quizVideo.ended;
  quizVideoBlock.classList.toggle('is-playing', playing);
  quizVideoToggle.setAttribute('aria-label', playing ? 'Поставить видео на паузу' : 'Воспроизвести видео');
  quizVideoToggle.setAttribute('aria-pressed', String(playing));
}
function toggleQuizVideo() {
  if (quizVideo.paused || quizVideo.ended) {
    quizVideo.muted = false;
    quizVideo.play().catch(() => {
      syncQuizVideo();
      quizVideo.controls = true;
      quizVideoToggle.hidden = true;
    });
  } else {
    quizVideo.pause();
  }
}
quizVideoToggle.addEventListener('click', toggleQuizVideo);
quizVideo.addEventListener('click', toggleQuizVideo);
['play', 'pause', 'ended'].forEach(event => quizVideo.addEventListener(event, syncQuizVideo));

const quizForm = document.querySelector('#quiz-form');
const quizPhoto = quizForm.elements.photo;
const quizUploadName = quizForm.querySelector('[data-upload-name]');
quizPhoto.addEventListener('change', () => {
  const file = quizPhoto.files && quizPhoto.files[0];
  quizUploadName.textContent = file ? file.name : 'Фото не выбрано';
});
const steps = Array.from(quizForm.querySelectorAll('.quiz-step'));
const nextButton = quizForm.querySelector('.next-button');
const backButton = quizForm.querySelector('.back-button');
const quizFooter = quizForm.querySelector('.quiz-footer');
const quizResult = quizForm.querySelector('.quiz-result');
const quizError = quizForm.querySelector('.quiz-error');
const quizProgress = document.querySelector('.quiz-progress');
const quizMeta = document.querySelector('.question-meta');
let quizStep = 0;
let quizAdvanceTimer;
function cancelQuizAdvance() {
  clearTimeout(quizAdvanceTimer);
}
function scheduleQuizAdvance(input) {
  if (!input.matches('input[type="radio"]') || !input.checked || !steps[quizStep].contains(input) || steps[quizStep].hidden) return;
  cancelQuizAdvance();
  const selectedStep = quizStep;
  quizAdvanceTimer = setTimeout(() => {
    if (quizStep === selectedStep && !steps[selectedStep].hidden) nextButton.click();
  }, 200);
}
function updateSelections() {
  quizForm.querySelectorAll('.quiz-option').forEach(option => {
    option.classList.toggle('selected', option.querySelector('input').checked);
  });
}
updateSelections();
quizForm.addEventListener('change', event => {
  updateSelections();
  quizError.textContent = '';
  scheduleQuizAdvance(event.target);
});
quizForm.addEventListener('click', event => {
  if (event.target.matches('input[type="radio"]')) scheduleQuizAdvance(event.target);
});
function showStep(index) {
  cancelQuizAdvance();
  quizStep = index;
  steps.forEach((step, position) => { step.hidden = position !== index; });
  quizResult.hidden = true;
  quizForm.elements.phone.disabled = true;
  quizForm.elements.consent.disabled = true;
  quizFooter.hidden = false;
  quizError.textContent = '';
  backButton.disabled = index === 0;
  quizMeta.textContent = `Вопрос ${index + 1} из 4`;
  quizProgress.setAttribute('aria-valuenow', String(index + 1));
  quizProgress.querySelector('span').style.width = `${(index + 1) * 25}%`;
  nextButton.querySelector('.next-label').textContent = index === 3 ? 'Получить расчёт' : 'Следующий вопрос';
  const radio = steps[index].querySelector('input:checked') || steps[index].querySelector('input');
  radio.focus({ preventScroll: true });
}
nextButton.addEventListener('click', () => {
  cancelQuizAdvance();
  if (!steps[quizStep].querySelector('input:checked')) { quizError.textContent = 'Выберите вариант, чтобы продолжить.'; return; }
  if (quizStep < 3) { showStep(quizStep + 1); return; }
  const answers = new FormData(quizForm);
  quizForm.querySelectorAll('[data-answer]').forEach(field => { field.textContent = answers.get(field.dataset.answer); });
  steps.forEach(step => { step.hidden = true; });
  quizFooter.hidden = true;
  quizResult.hidden = false;
  quizForm.elements.phone.disabled = false;
  quizForm.elements.consent.disabled = false;
  quizMeta.textContent = 'Все 4 вопроса пройдены';
  quizResult.querySelector('input').focus({ preventScroll: true });
});
backButton.addEventListener('click', () => { if (quizStep > 0) showStep(quizStep - 1); });
quizForm.querySelector('.quiz-edit').addEventListener('click', () => showStep(3));
quizForm.addEventListener('submit', async event => {
  event.preventDefault();
  if (quizResult.hidden) { nextButton.click(); return; }
  const phone = quizForm.elements.phone;
  const digits = phone.value.replace(/\D/g, '');
  phone.setCustomValidity(digits.length >= 10 && digits.length <= 15 ? '' : 'Введите корректный номер телефона.');
  if (!quizForm.reportValidity()) return;
  const submitButton = quizForm.querySelector('.submit-quiz');
  if (submitButton.disabled) return;
  const status = quizForm.querySelector('.brief-status');
  const data = new FormData(quizForm);
  addLeadMetadata(data, 'Квиз расчёта шкафа');
  submitButton.disabled = true;
  quizForm.setAttribute('aria-busy', 'true');
  status.textContent = 'Отправляем заявку…';
  try {
    const response = await fetch(LEAD_ENDPOINT, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error('Quiz submission failed');
    trackFormSubmission('quiz-form');
    showSubmittedState(quizForm);
    status.textContent = 'Заявка отправлена. Специалист свяжется с вами для расчёта шкафа.';
  } catch {
    status.textContent = 'Не удалось отправить заявку. Попробуйте ещё раз или позвоните: +7 (962) 718-11-80.';
  } finally {
    submitButton.disabled = false;
    quizForm.removeAttribute('aria-busy');
  }
});
quizForm.elements.phone.addEventListener('input', event => event.target.setCustomValidity(''));

const wardrobeCalculator = document.querySelector('#wardrobe-calculator-form');
const wardrobeCalculatorPrice = document.querySelector('#wardrobe-calculator-price');
const wardrobeCalculatorInstallment = document.querySelector('#wardrobe-calculator-installment');
const wardrobePriceFormatter = new Intl.NumberFormat('ru-RU');
const wardrobeExtras = [
  { name: 'delivery', label: 'доставка', price: 1750 },
  { name: 'assembly', label: 'сборка', price: 3150 },
  { name: 'mirror', label: 'зеркало', price: 4500 },
  { name: 'drawers', label: 'дополнительные ящики', price: 3500 },
];
function updateWardrobeCalculator() {
  const width = Number(wardrobeCalculator.elements.width.value);
  const height = Number(wardrobeCalculator.elements.height.value);
  const type = wardrobeCalculator.elements.wardrobe_type.value;
  const packageName = wardrobeCalculator.elements.package.value;
  wardrobeCalculator.querySelector('#wardrobe-width-value').textContent = `${width} мм`;
  wardrobeCalculator.querySelector('#wardrobe-height-value').textContent = `${height} мм`;
  wardrobeCalculator.querySelectorAll('input[type="range"]').forEach(input => {
    const progress = (Number(input.value) - Number(input.min)) / (Number(input.max) - Number(input.min)) * 100;
    input.style.setProperty('--range-progress', `${progress}%`);
  });
  const extrasPrice = wardrobeExtras.reduce((sum, extra) => sum + (wardrobeCalculator.elements[extra.name].value === 'yes' ? extra.price : 0), 0);
  const price = calculateWardrobePrice(width, height, type, packageName, extrasPrice);
  wardrobeCalculatorPrice.textContent = `от ${wardrobePriceFormatter.format(price)} ₽`;
  wardrobeCalculatorInstallment.textContent = `от ${wardrobePriceFormatter.format(Math.ceil(price / 6))} ₽`;
}
wardrobeCalculator.addEventListener('input', updateWardrobeCalculator);
updateWardrobeCalculator();
wardrobeCalculator.querySelector('.wardrobe-calculator__result .button').addEventListener('click', event => {
  if (event.target.closest('.wardrobe-calculator__lead')) return;
  const width = Number(wardrobeCalculator.elements.width.value);
  const height = Number(wardrobeCalculator.elements.height.value);
  const type = wardrobeCalculator.elements.wardrobe_type.value;
  const packageName = wardrobeCalculator.elements.package.value;
  const wardrobeType = { hinged: 'Распашной шкаф', sliding: 'Шкаф-купе', 'built-in': 'Встроенный шкаф' }[type];
  const size = width < 1500 ? 'До 1,5 метра' : width < 2000 ? '1,5–2 метра' : '2–3 метра';
  Array.from(quizForm.elements.wardrobe).find(input => input.value === wardrobeType).checked = true;
  Array.from(quizForm.elements.size).find(input => input.value === size).checked = true;
  quizForm.elements.package.value = { practical: 'Практичный', optimal: 'Оптимальный', designer: 'Дизайнерский' }[packageName];
  quizForm.elements.calculator_dimensions.value = `${width} × ${height} × 600 мм`;
  quizForm.elements.calculator_price.value = wardrobeCalculatorPrice.textContent;
  const selectedExtras = wardrobeExtras.filter(extra => wardrobeCalculator.elements[extra.name].value === 'yes').map(extra => extra.label);
  quizForm.elements.calculator_options.value = selectedExtras.length ? selectedExtras.join(', ') : 'Без дополнительных опций';
  const comment = quizForm.elements.comment;
  if (!comment.value) comment.value = `Калькулятор: ${width} × ${height} × 600 мм, ${wardrobeType.toLowerCase()}, ${quizForm.elements.package.value.toLowerCase()} комплектация, ${quizForm.elements.calculator_options.value.toLowerCase()}, ${wardrobeCalculatorPrice.textContent}.`;
  updateSelections();
  if (!quizResult.hidden) showStep(0);
});
const wardrobeCalculatorPhone = wardrobeCalculator.elements.phone;
wardrobeCalculatorPhone.addEventListener('input', () => wardrobeCalculatorPhone.setCustomValidity(''));
wardrobeCalculator.addEventListener('submit', async event => {
  event.preventDefault();
  const digits = wardrobeCalculatorPhone.value.replace(/\D/g, '');
  wardrobeCalculatorPhone.setCustomValidity(digits.length >= 10 && digits.length <= 15 ? '' : 'Введите корректный номер телефона.');
  if (!wardrobeCalculator.reportValidity()) return;
  const submitButton = wardrobeCalculator.querySelector('.wardrobe-calculator__lead .button');
  if (submitButton.disabled) return;
  const status = wardrobeCalculator.querySelector('.wardrobe-calculator__status');
  const width = Number(wardrobeCalculator.elements.width.value);
  const height = Number(wardrobeCalculator.elements.height.value);
  const selectedExtras = wardrobeExtras.filter(extra => wardrobeCalculator.elements[extra.name].value === 'yes').map(extra => extra.label);
  const data = new FormData(wardrobeCalculator);
  addLeadMetadata(data, 'Калькулятор шкафа');
  data.set('form_type', 'Калькулятор шкафа');
  data.set('calculator_dimensions', `${width} × ${height} × 600 мм`);
  data.set('calculator_price', wardrobeCalculatorPrice.textContent);
  data.set('calculator_options', selectedExtras.length ? selectedExtras.join(', ') : 'Без дополнительных опций');
  submitButton.disabled = true;
  wardrobeCalculator.setAttribute('aria-busy', 'true');
  status.textContent = 'Отправляем заявку…';
  try {
    const response = await fetch(LEAD_ENDPOINT, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error('Wardrobe calculator submission failed');
    trackFormSubmission('wardrobe-calculator-form');
    showSubmittedState(wardrobeCalculator);
    status.textContent = 'Заявка отправлена. Специалист свяжется с вами для расчёта шкафа.';
  } catch {
    status.textContent = 'Не удалось отправить заявку. Попробуйте ещё раз или позвоните: +7 (962) 718-11-80.';
  } finally {
    submitButton.disabled = false;
    wardrobeCalculator.removeAttribute('aria-busy');
  }
});

const factorTabs = Array.from(document.querySelectorAll('.price-factors-tab'));
const factorPanels = Array.from(document.querySelectorAll('.price-factor-panel'));
function selectFactorTab(tab, focus = false) {
  factorTabs.forEach(item => {
    const selected = item === tab;
    item.setAttribute('aria-selected', String(selected));
    item.tabIndex = selected ? 0 : -1;
  });
  factorPanels.forEach(panel => { panel.hidden = panel.id !== tab.getAttribute('aria-controls'); });
  if (focus) tab.focus();
}
factorTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectFactorTab(tab));
  tab.addEventListener('keydown', event => {
    let next = index;
    if (event.key === 'ArrowRight') next = (index + 1) % factorTabs.length;
    else if (event.key === 'ArrowLeft') next = (index - 1 + factorTabs.length) % factorTabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = factorTabs.length - 1;
    else return;
    event.preventDefault();
    selectFactorTab(factorTabs[next], true);
  });
});
const compareForm = document.querySelector('#compare-form');
const compareFile = compareForm.elements.estimate;
const compareFileName = compareForm.querySelector('[data-compare-file-name]');
const compareStatus = compareForm.querySelector('.compare-status');
compareFile.addEventListener('change', () => {
  compareFileName.textContent = compareFile.files && compareFile.files[0] ? compareFile.files[0].name : 'Файл не выбран';
  compareStatus.textContent = '';
});
compareForm.elements.phone.addEventListener('input', event => event.target.setCustomValidity(''));
compareForm.addEventListener('submit', async event => {
  event.preventDefault();
  const phone = compareForm.elements.phone;
  const digits = phone.value.replace(/\D/g, '');
  phone.setCustomValidity(digits.length >= 10 && digits.length <= 15 ? '' : 'Введите корректный номер телефона.');
  if (!compareForm.reportValidity()) return;
  const button = compareForm.querySelector('.compare-submit');
  const data = new FormData(compareForm);
  addLeadMetadata(data, 'Сравнение смет');
  data.append('request_type', 'Проверка расчёта другой компании');
  button.disabled = true;
  compareForm.setAttribute('aria-busy', 'true');
  compareStatus.textContent = 'Загружаем расчёт…';
  try {
    const response = await fetch(LEAD_ENDPOINT, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error('Estimate submission failed');
    trackFormSubmission('compare-form');
    showSubmittedState(compareForm);
    compareStatus.textContent = 'Расчёт отправлен. Мы проверим комплектацию и свяжемся с вами.';
  } catch {
    compareStatus.textContent = 'Не удалось загрузить расчёт. Попробуйте ещё раз или позвоните: +7 (962) 718-11-80.';
  } finally {
    button.disabled = false;
    compareForm.removeAttribute('aria-busy');
  }
});


document.querySelectorAll('.case-photo-switch button').forEach(button => {
  button.addEventListener('click', () => {
    const gallery = button.closest('.case-gallery');
    gallery.querySelectorAll('.case-photo').forEach(photo => {
      photo.hidden = photo.id !== button.getAttribute('aria-controls');
    });
    gallery.querySelectorAll('.case-photo-switch button').forEach(control => {
      control.setAttribute('aria-pressed', String(control === button));
    });
  });
});

const caseLightbox = document.querySelector('#case-lightbox');
const caseLightboxFigures = Array.from(caseLightbox.querySelectorAll('figure'));
const caseLightboxPrev = caseLightbox.querySelector('.case-lightbox-prev');
const caseLightboxNext = caseLightbox.querySelector('.case-lightbox-next');
const caseLightboxClose = caseLightbox.querySelector('.case-lightbox-close');
const caseLightboxCounter = caseLightbox.querySelector('.case-lightbox-counter');
let caseLightboxGroup = [];
let caseLightboxIndex = 0;
let caseLightboxTrigger;

function showCasePhoto(index) {
  caseLightboxIndex = (index + caseLightboxGroup.length) % caseLightboxGroup.length;
  caseLightboxFigures.forEach(figure => { figure.hidden = figure !== caseLightboxGroup[caseLightboxIndex]; });
  const multiple = caseLightboxGroup.length > 1;
  caseLightboxPrev.hidden = !multiple;
  caseLightboxNext.hidden = !multiple;
  caseLightboxCounter.textContent = `${caseLightboxIndex + 1} из ${caseLightboxGroup.length}`;
}

document.querySelectorAll('[data-case-photo]').forEach(button => {
  button.addEventListener('click', () => {
    caseLightboxTrigger = button;
    const selected = caseLightboxFigures[Number(button.dataset.casePhoto)];
    caseLightboxGroup = selected.dataset.caseGroup === '0'
      ? caseLightboxFigures.filter(figure => figure.dataset.caseGroup === '0')
      : [selected];
    showCasePhoto(caseLightboxGroup.indexOf(selected));
    showPopup(caseLightbox);
    document.body.classList.add('modal-open');
    caseLightboxClose.focus();
  });
});

function closeCaseLightbox() {
  hidePopup(caseLightbox);
  document.body.classList.remove('modal-open');
  if (caseLightboxTrigger) caseLightboxTrigger.focus();
}

caseLightbox.querySelectorAll('[data-case-close]').forEach(button => button.addEventListener('click', closeCaseLightbox));
caseLightboxPrev.addEventListener('click', () => showCasePhoto(caseLightboxIndex - 1));
caseLightboxNext.addEventListener('click', () => showCasePhoto(caseLightboxIndex + 1));
document.addEventListener('keydown', event => {
  if (caseLightbox.hidden) return;
  if (event.key === 'Escape') closeCaseLightbox();
  if (event.key === 'ArrowLeft') showCasePhoto(caseLightboxIndex - 1);
  if (event.key === 'ArrowRight') showCasePhoto(caseLightboxIndex + 1);
  if (event.key === 'Tab') {
    const controls = [caseLightboxClose, caseLightboxPrev, caseLightboxNext].filter(button => !button.hidden);
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});

document.querySelectorAll('[data-case-wardrobe]:not(.case-button)').forEach(button => {
  button.addEventListener('click', () => {
    quizForm.elements.package.value = button.dataset.solutionPackage || '';
    const radio = Array.from(document.querySelectorAll('input[name="wardrobe"]')).find(input => input.value === button.dataset.caseWardrobe);
    if (radio) {
      radio.checked = true;
      radio.dispatchEvent(new Event('change', { bubbles: true }));
    }
    showStep(0);
  });
});


const gallery = document.querySelector('#production-gallery');
const slides = Array.from(gallery.querySelectorAll('figure'));
const galleryCounter = gallery.querySelector('.production-gallery-counter');
const closeButton = gallery.querySelector('.production-gallery-close');
let slideIndex = 0;
let galleryPreviousFocus;
function showSlide(index) {
  slideIndex = (index + slides.length) % slides.length;
  slides.forEach((slide, i) => { slide.hidden = i !== slideIndex; });
  galleryCounter.textContent = `${slideIndex + 1} / ${slides.length}`;
}
document.querySelectorAll('[data-production-photo]').forEach(button => {
  button.addEventListener('click', () => {
    galleryPreviousFocus = button;
    showSlide(Number(button.dataset.productionPhoto));
    showPopup(gallery);
    document.body.classList.add('modal-open');
    closeButton.focus();
  });
});
function closeGallery() {
  hidePopup(gallery);
  document.body.classList.remove('modal-open');
  if (galleryPreviousFocus) galleryPreviousFocus.focus();
}
gallery.querySelectorAll('[data-gallery-close]').forEach(button => button.addEventListener('click',closeGallery));
gallery.querySelector('.production-gallery-prev').addEventListener('click',()=>showSlide(slideIndex-1));
gallery.querySelector('.production-gallery-next').addEventListener('click',()=>showSlide(slideIndex+1));
document.addEventListener('keydown',event=>{
  if (gallery.hidden) return;
  if (event.key === 'Escape') closeGallery();
  if (event.key === 'ArrowLeft') showSlide(slideIndex-1);
  if (event.key === 'ArrowRight') showSlide(slideIndex+1);
  if (event.key === 'Tab') {
    const first = closeButton;
    const last = gallery.querySelector('.production-gallery-next');
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});



const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.navigation');
const modal = document.querySelector('#contact-modal');
const modalTitle = document.querySelector('#modal-title');
const photoEstimateModal = document.querySelector('#photo-estimate-modal');
const photoEstimateForm = document.querySelector('#photo-estimate-form');
const photoEstimateTitle = photoEstimateModal.querySelector('#photo-estimate-title');
const photoEstimateDescription = photoEstimateModal.querySelector('.modal-description');
const photoEstimateProject = photoEstimateForm.elements.project_name;
const solutionEstimatePhoto = photoEstimateModal.querySelector('[data-solution-estimate-photo]');
const photoEstimateFile = photoEstimateForm.elements.photo;
const photoEstimateFileName = photoEstimateForm.querySelector('[data-photo-estimate-file-name]');
const photoEstimateStatus = photoEstimateForm.querySelector('.photo-estimate-status');
const measureModal = document.querySelector('#measure-modal');
const measureForm = document.querySelector('#measure-form');
const measureStatus = measureForm.querySelector('.photo-estimate-status');
const caseEstimateModal = document.querySelector('#case-estimate-modal');
const caseEstimateForm = document.querySelector('#case-estimate-form');
const caseEstimatePhoto = caseEstimateModal.querySelector('[data-case-estimate-photo]');
const caseEstimateTitle = caseEstimateModal.querySelector('#case-estimate-title');
const caseEstimateStatus = caseEstimateForm.querySelector('.photo-estimate-status');
const footerCallbackModal = document.querySelector('#footer-callback-modal');
const footerCallbackForm = document.querySelector('#footer-callback-form');
const footerCallbackStatus = footerCallbackForm.querySelector('.photo-estimate-status');
const deliveryModal = document.querySelector('#delivery-modal');
const deliveryForm = document.querySelector('#showroom-delivery-form');
let previousFocus;
let photoEstimateTrigger;
let photoEstimateFormType = 'Расчёт шкафа по фото';
let measureTrigger;
let caseEstimateTrigger;
let footerCallbackTrigger;
let deliveryTrigger;

function closeMenu() {
  navigation.classList.remove('is-open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Открыть меню');
}
menuToggle.addEventListener('click', () => {
  const open = navigation.classList.toggle('is-open');
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('click', event => {
  if (navigation.classList.contains('is-open') && !navigation.contains(event.target) && !menuToggle.contains(event.target)) closeMenu();
});
window.addEventListener('resize', () => {
  if (window.innerWidth > 1380) closeMenu();
});

document.querySelectorAll('[data-dialog]:not([data-dialog="measure"]):not([data-dialog="footer-callback"]):not([data-dialog="delivery"])').forEach(button => {
  button.addEventListener('click', () => {
    previousFocus = button;
    const titles = { calculate: 'Рассчитать шкаф', callback: 'Заказать звонок', contacts: 'Свяжитесь с нами', measure: 'Вызвать замерщика', delivery: 'Уточнить зону доставки' };
    modalTitle.textContent = titles[button.dataset.dialog];
    showPopup(modal);
    document.body.classList.add('modal-open');
    closeMenu();
    modal.querySelector('.modal-close').focus();
  });
});
document.querySelectorAll('[data-dialog="delivery"]').forEach(trigger => {
  trigger.addEventListener('click', () => {
    deliveryTrigger = trigger;
    showPopup(deliveryModal);
    document.body.classList.add('modal-open');
    closeMenu();
    deliveryForm.elements.name.focus();
  });
});
function closeDeliveryModal(restoreFocus = true) {
  hidePopup(deliveryModal);
  document.body.classList.remove('modal-open');
  if (restoreFocus && deliveryTrigger) deliveryTrigger.focus();
  deliveryTrigger = null;
}
deliveryModal.querySelectorAll('[data-delivery-close]').forEach(control => {
  control.addEventListener('click', () => closeDeliveryModal());
});
const deliveryPhone = deliveryForm.elements.phone;
const deliveryStatus = deliveryForm.querySelector('.photo-estimate-status');
deliveryPhone.addEventListener('input', () => deliveryPhone.setCustomValidity(''));
deliveryForm.addEventListener('submit', async event => {
  event.preventDefault();
  const digits = deliveryPhone.value.replace(/\D/g, '');
  deliveryPhone.setCustomValidity(digits.length >= 10 && digits.length <= 15 ? '' : 'Введите корректный номер телефона.');
  if (!deliveryForm.reportValidity()) return;
  const button = deliveryForm.querySelector('.photo-estimate-submit');
  if (button.disabled) return;
  const data = new FormData(deliveryForm);
  addLeadMetadata(data, 'Уточнение зоны доставки');
  button.disabled = true;
  deliveryForm.setAttribute('aria-busy', 'true');
  deliveryStatus.textContent = 'Отправляем заявку…';
  try {
    const response = await fetch(LEAD_ENDPOINT, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error('Delivery request submission failed');
    trackFormSubmission('showroom-delivery-form');
    showSubmittedState(deliveryForm);
    deliveryStatus.textContent = 'Заявка отправлена. Специалист свяжется с вами по условиям доставки.';
    deliveryForm.reset();
  } catch {
    deliveryStatus.textContent = 'Не удалось отправить заявку. Попробуйте ещё раз или позвоните: +7 (962) 718-11-80.';
  } finally {
    button.disabled = false;
    deliveryForm.removeAttribute('aria-busy');
  }
});
document.querySelectorAll('[data-dialog="footer-callback"]').forEach(trigger => {
  trigger.addEventListener('click', () => {
    footerCallbackTrigger = trigger;
    footerCallbackStatus.textContent = '';
    showPopup(footerCallbackModal);
    document.body.classList.add('modal-open');
    footerCallbackForm.elements.name.focus();
  });
});
function closeFooterCallbackModal(restoreFocus = true) {
  hidePopup(footerCallbackModal);
  document.body.classList.remove('modal-open');
  if (restoreFocus && footerCallbackTrigger) footerCallbackTrigger.focus();
  footerCallbackTrigger = null;
}
footerCallbackModal.querySelectorAll('[data-footer-callback-close]').forEach(control => {
  control.addEventListener('click', () => closeFooterCallbackModal());
});
footerCallbackForm.elements.phone.addEventListener('input', event => event.target.setCustomValidity(''));
footerCallbackForm.addEventListener('submit', async event => {
  event.preventDefault();
  const phone = footerCallbackForm.elements.phone;
  const digits = phone.value.replace(/\D/g, '');
  phone.setCustomValidity(digits.length >= 10 && digits.length <= 15 ? '' : 'Введите корректный номер телефона.');
  if (!footerCallbackForm.reportValidity()) return;
  const submitButton = footerCallbackForm.querySelector('.photo-estimate-submit');
  if (submitButton.disabled) return;
  const data = new FormData(footerCallbackForm);
  addLeadMetadata(data, 'Заказ обратного звонка');
  data.set('form_type', 'Заказ обратного звонка');
  submitButton.disabled = true;
  footerCallbackForm.setAttribute('aria-busy', 'true');
  footerCallbackStatus.textContent = 'Отправляем заявку…';
  try {
    const response = await fetch(LEAD_ENDPOINT, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error('Callback request submission failed');
    trackFormSubmission('footer-callback-form');
    showSubmittedState(footerCallbackForm);
    footerCallbackStatus.textContent = 'Заявка отправлена. Мы скоро вам перезвоним.';
    footerCallbackForm.reset();
  } catch {
    footerCallbackStatus.textContent = 'Не удалось отправить заявку. Попробуйте ещё раз или позвоните: +7 (962) 718-11-80.';
  } finally {
    submitButton.disabled = false;
    footerCallbackForm.removeAttribute('aria-busy');
  }
});
document.querySelectorAll('[data-dialog="measure"]').forEach(trigger => {
  trigger.addEventListener('click', () => {
    measureTrigger = trigger;
    showPopup(measureModal);
    document.body.classList.add('modal-open');
    closeMenu();
    measureForm.elements.name.focus();
  });
});
function closeMeasureModal(restoreFocus = true) {
  hidePopup(measureModal);
  document.body.classList.remove('modal-open');
  if (restoreFocus && measureTrigger) measureTrigger.focus();
  measureTrigger = null;
}
measureModal.querySelectorAll('[data-measure-close]').forEach(control => {
  control.addEventListener('click', () => closeMeasureModal());
});
measureForm.elements.phone.addEventListener('input', event => event.target.setCustomValidity(''));
measureForm.addEventListener('submit', async event => {
  event.preventDefault();
  const phone = measureForm.elements.phone;
  const digits = phone.value.replace(/\D/g, '');
  phone.setCustomValidity(digits.length >= 10 && digits.length <= 15 ? '' : 'Введите корректный номер телефона.');
  if (!measureForm.reportValidity()) return;
  const submitButton = measureForm.querySelector('.photo-estimate-submit');
  if (submitButton.disabled) return;
  const data = new FormData(measureForm);
  addLeadMetadata(data, 'Вызов замерщика');
  data.set('form_type', 'Вызов замерщика');
  submitButton.disabled = true;
  measureForm.setAttribute('aria-busy', 'true');
  measureStatus.textContent = 'Отправляем заявку…';
  try {
    const response = await fetch(LEAD_ENDPOINT, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error('Measure request submission failed');
    trackFormSubmission('measure-form');
    showSubmittedState(measureForm);
    measureStatus.textContent = 'Заявка отправлена. Мы свяжемся с вами, чтобы согласовать время замера.';
    measureForm.reset();
  } catch {
    measureStatus.textContent = 'Не удалось отправить заявку. Попробуйте ещё раз или позвоните: +7 (962) 718-11-80.';
  } finally {
    submitButton.disabled = false;
    measureForm.removeAttribute('aria-busy');
  }
});
const casesGrid = document.querySelector('.cases-grid');
const casesShowMore = document.querySelector('.cases-show-more');
let casesExpanded = false;
function updateCasesDisclosure() {
  const hasMoreCases = casesGrid.querySelectorAll('.case-card').length > 4;
  const isCompactViewport = window.matchMedia('(max-width: 480px)').matches;
  casesGrid.classList.toggle('is-collapsed', hasMoreCases && isCompactViewport && !casesExpanded);
  casesShowMore.hidden = !hasMoreCases || !isCompactViewport || casesExpanded;
}
casesShowMore.addEventListener('click', () => {
  casesExpanded = true;
  updateCasesDisclosure();
  casesShowMore.setAttribute('aria-expanded', 'true');
});
window.addEventListener('resize', updateCasesDisclosure);
updateCasesDisclosure();

const reviewsGrid = document.querySelector('.review-grid');
const reviewsShowMore = document.querySelector('.reviews-show-more');
let reviewsExpanded = false;
function updateReviewsDisclosure() {
  const hasMoreReviews = reviewsGrid.querySelectorAll('.review-card').length > 4;
  const isCompactViewport = window.matchMedia('(max-width: 480px)').matches;
  reviewsGrid.classList.toggle('is-collapsed', hasMoreReviews && isCompactViewport && !reviewsExpanded);
  reviewsShowMore.hidden = !hasMoreReviews || !isCompactViewport || reviewsExpanded;
}
reviewsShowMore.addEventListener('click', () => {
  reviewsExpanded = true;
  updateReviewsDisclosure();
  reviewsShowMore.setAttribute('aria-expanded', 'true');
});
window.addEventListener('resize', updateReviewsDisclosure);
updateReviewsDisclosure();

document.querySelectorAll('.case-button').forEach(trigger => {
  trigger.addEventListener('click', event => {
    event.preventDefault();
    const card = trigger.closest('.case-card');
    const photo = card.querySelector('.case-photo:not([hidden]) img');
    const projectName = card.querySelector('h3').textContent.trim();
    caseEstimateTrigger = trigger;
    caseEstimatePhoto.src = photo.src;
    caseEstimatePhoto.alt = photo.alt;
    caseEstimateTitle.textContent = `Рассчитать такой же проект, как «${projectName}»`;
    caseEstimateForm.elements.project_name.value = projectName;
    caseEstimateForm.elements.wardrobe_type.value = trigger.dataset.caseWardrobe;
    caseEstimateStatus.textContent = '';
    showPopup(caseEstimateModal);
    document.body.classList.add('modal-open');
    caseEstimateForm.elements.name.focus();
  });
});
function closeCaseEstimateModal(restoreFocus = true) {
  hidePopup(caseEstimateModal);
  document.body.classList.remove('modal-open');
  if (restoreFocus && caseEstimateTrigger) caseEstimateTrigger.focus();
  caseEstimateTrigger = null;
}
caseEstimateModal.querySelectorAll('[data-case-estimate-close]').forEach(control => {
  control.addEventListener('click', () => closeCaseEstimateModal());
});
caseEstimateForm.elements.phone.addEventListener('input', event => event.target.setCustomValidity(''));
caseEstimateForm.addEventListener('submit', async event => {
  event.preventDefault();
  const phone = caseEstimateForm.elements.phone;
  const digits = phone.value.replace(/\D/g, '');
  phone.setCustomValidity(digits.length >= 10 && digits.length <= 15 ? '' : 'Введите корректный номер телефона.');
  if (!caseEstimateForm.reportValidity()) return;
  const submitButton = caseEstimateForm.querySelector('.photo-estimate-submit');
  if (submitButton.disabled) return;
  const data = new FormData(caseEstimateForm);
  addLeadMetadata(data, 'Расчёт похожего проекта из кейса');
  data.set('form_type', 'Расчёт похожего проекта из кейса');
  submitButton.disabled = true;
  caseEstimateForm.setAttribute('aria-busy', 'true');
  caseEstimateStatus.textContent = 'Отправляем заявку…';
  try {
    const response = await fetch(LEAD_ENDPOINT, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error('Case estimate submission failed');
    trackFormSubmission('case-estimate-form');
    showSubmittedState(caseEstimateForm);
    caseEstimateStatus.textContent = 'Заявка отправлена. Специалист свяжется с вами для расчёта проекта.';
    caseEstimateForm.reset();
  } catch {
    caseEstimateStatus.textContent = 'Не удалось отправить заявку. Попробуйте ещё раз или позвоните: +7 (962) 718-11-80.';
  } finally {
    submitButton.disabled = false;
    caseEstimateForm.removeAttribute('aria-busy');
  }
});
document.querySelectorAll('.header-photo-calculate, .hero-photo-calculate, .footer-calculate, .mobile-actions__link--photo').forEach(trigger => {
  trigger.addEventListener('click', event => {
    event.preventDefault();
    photoEstimateTrigger = trigger;
    photoEstimateTitle.textContent = 'Рассчитать шкаф по фото';
    photoEstimateDescription.textContent = 'Прикрепите фото или эскиз — обсудим ваш проект и подготовим расчёт.';
    photoEstimateProject.value = '';
    photoEstimateFormType = 'Расчёт шкафа по фото';
    solutionEstimatePhoto.hidden = true;
    showPopup(photoEstimateModal);
    document.body.classList.add('modal-open');
    closeMenu();
    photoEstimateForm.elements.name.focus();
  });
});
document.querySelectorAll('.solution-calculate').forEach(trigger => {
  trigger.addEventListener('click', () => {
    const projectName = trigger.closest('.solution-card').querySelector('h3').textContent.trim();
    const photo = trigger.closest('.solution-card').querySelector('.solution-photo');
    photoEstimateTrigger = trigger;
    solutionEstimatePhoto.src = photo.src;
    solutionEstimatePhoto.alt = photo.alt;
    solutionEstimatePhoto.hidden = false;
    photoEstimateTitle.textContent = `Рассчитать «${projectName}» по фото`;
    photoEstimateDescription.textContent = 'Прикрепите фото или эскиз и оставьте телефон — рассчитаем решение под ваши размеры.';
    photoEstimateProject.value = projectName;
    photoEstimateFormType = `Расчёт по фото: ${projectName}`;
    showPopup(photoEstimateModal);
    document.body.classList.add('modal-open');
    photoEstimateForm.elements.name.focus();
  });
});
function closePhotoEstimateModal(restoreFocus = true) {
  hidePopup(photoEstimateModal);
  document.body.classList.remove('modal-open');
  if (restoreFocus && photoEstimateTrigger) photoEstimateTrigger.focus();
  photoEstimateTrigger = null;
}
photoEstimateModal.querySelectorAll('[data-photo-estimate-close]').forEach(control => {
  control.addEventListener('click', () => closePhotoEstimateModal());
});
photoEstimateFile.addEventListener('change', () => {
  photoEstimateFileName.textContent = photoEstimateFile.files[0]?.name || 'Файл не выбран';
});
photoEstimateForm.elements.phone.addEventListener('input', event => event.target.setCustomValidity(''));
photoEstimateForm.addEventListener('submit', async event => {
  event.preventDefault();
  const phone = photoEstimateForm.elements.phone;
  const digits = phone.value.replace(/\D/g, '');
  phone.setCustomValidity(digits.length >= 10 && digits.length <= 15 ? '' : 'Введите корректный номер телефона.');
  if (!photoEstimateForm.reportValidity()) return;
  const submitButton = photoEstimateForm.querySelector('.photo-estimate-submit');
  if (submitButton.disabled) return;
  const data = new FormData(photoEstimateForm);
  addLeadMetadata(data, photoEstimateFormType);
  data.set('form_type', photoEstimateFormType);
  submitButton.disabled = true;
  photoEstimateForm.setAttribute('aria-busy', 'true');
  photoEstimateStatus.textContent = 'Отправляем заявку…';
  try {
    const response = await fetch(LEAD_ENDPOINT, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error('Photo estimate submission failed');
    trackFormSubmission('photo-estimate-form');
    showSubmittedState(photoEstimateForm);
    photoEstimateStatus.textContent = 'Заявка отправлена. Специалист свяжется с вами для обсуждения проекта.';
    photoEstimateForm.reset();
    photoEstimateFileName.textContent = 'Файл не выбран';
  } catch {
    photoEstimateStatus.textContent = 'Не удалось отправить заявку. Попробуйте ещё раз или позвоните: +7 (962) 718-11-80.';
  } finally {
    submitButton.disabled = false;
    photoEstimateForm.removeAttribute('aria-busy');
  }
});
function closeModal() {
  hidePopup(modal);
  document.body.classList.remove('modal-open');
  if (previousFocus) previousFocus.focus();
}
modal.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', closeModal));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    if (!deliveryModal.hidden) closeDeliveryModal();
    if (!footerCallbackModal.hidden) closeFooterCallbackModal();
    if (!caseEstimateModal.hidden) closeCaseEstimateModal();
    if (!measureModal.hidden) closeMeasureModal();
    if (!photoEstimateModal.hidden) closePhotoEstimateModal();
    if (!modal.hidden) closeModal();
    closeMenu();
  }
  if (event.key === 'Tab' && !deliveryModal.hidden) {
    const elements = deliveryModal.querySelectorAll('button:not(:disabled), input:not([type="hidden"]):not(:disabled), textarea:not(:disabled), a[href]');
    const first = elements[0];
    const last = elements[elements.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
  if (event.key === 'Tab' && !footerCallbackModal.hidden) {
    const elements = footerCallbackModal.querySelectorAll('button:not(:disabled), input:not([type="hidden"]):not(:disabled), textarea:not(:disabled), a[href]');
    const first = elements[0];
    const last = elements[elements.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
  if (event.key === 'Tab' && !caseEstimateModal.hidden) {
    const elements = caseEstimateModal.querySelectorAll('button:not(:disabled), input:not([type="hidden"]):not(:disabled), textarea:not(:disabled), a[href]');
    const first = elements[0];
    const last = elements[elements.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
  if (event.key === 'Tab' && !measureModal.hidden) {
    const elements = measureModal.querySelectorAll('button:not(:disabled), input:not(:disabled), textarea:not(:disabled), a[href]');
    const first = elements[0];
    const last = elements[elements.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
  if (event.key === 'Tab' && !photoEstimateModal.hidden) {
    const elements = photoEstimateModal.querySelectorAll('button:not(:disabled), input:not(:disabled), textarea:not(:disabled), a[href]');
    const first = elements[0];
    const last = elements[elements.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
  if (event.key === 'Tab' && !modal.hidden) {
    const elements = modal.querySelectorAll('button, a[href]');
    const first = elements[0];
    const last = elements[elements.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});

let activeSolutionModal = null;
let solutionModalTrigger = null;

function closeSolutionModal(restoreFocus = true) {
  if (!activeSolutionModal) return;
  hidePopup(activeSolutionModal);
  activeSolutionModal = null;
  document.body.classList.remove('modal-open');
  if (restoreFocus && solutionModalTrigger) solutionModalTrigger.focus();
  solutionModalTrigger = null;
}

document.querySelectorAll('[data-solution-open]:not(.solution-calculate)').forEach(button => {
  button.addEventListener('click', () => {
    const target = document.getElementById(button.dataset.solutionOpen);
    if (!target) return;
    solutionModalTrigger = button;
    activeSolutionModal = target;
    showPopup(target);
    document.body.classList.add('modal-open');
    target.querySelector('.solution-modal__close').focus();
  });
});

document.querySelectorAll('.solution-modal').forEach(dialog => {
  dialog.querySelectorAll('[data-solution-close]').forEach(control => {
    control.addEventListener('click', () => closeSolutionModal());
  });
  dialog.querySelector('[data-solution-quiz]').addEventListener('click', () => {
    closeSolutionModal(false);
    document.getElementById('calculator').focus();
  });
});

document.addEventListener('keydown', event => {
  if (!activeSolutionModal) return;
  if (event.key === 'Escape') {
    event.preventDefault();
    closeSolutionModal();
  }
  if (event.key === 'Tab') {
    const controls = activeSolutionModal.querySelectorAll('.solution-modal__close, a[href]');
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});
