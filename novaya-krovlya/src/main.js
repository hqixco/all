import './styles.css';
import './roofing-sections.js';

const isExtensionsPage = document.body.dataset.service === 'extensions';
const isRecoveryPage = document.body.dataset.service === 'recovery';
const isRoofReplacementPage = window.location.pathname.startsWith('/zamena-krovli');

const reachRoofReplacementGoal = () => {
  if (!isRoofReplacementPage) return;
  window._tmr = window._tmr || [];
  window._tmr.push({ type: 'reachGoal', id: 3806453, goal: 'zamena_krovli' });
};

if (isRoofReplacementPage) {
  document.addEventListener('click', (event) => {
    const contactLink = event.target.closest?.('a[href^="tel:"], a.header-messenger');
    if (contactLink) reachRoofReplacementGoal();
  });
}

const addFormFieldTitles = (root = document) => {
  root.querySelectorAll('input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]):not([type="file"]), select, textarea').forEach((field) => {
    if (field.closest('.form-field')) return;
    const title = field.dataset.fieldTitle || field.placeholder || field.querySelector('option')?.textContent?.trim() || field.name;
    if (!title) return;
    const wrapper = document.createElement('label');
    wrapper.className = 'form-field';
    const caption = document.createElement('span');
    caption.className = 'form-field__title';
    caption.textContent = title;
    field.before(wrapper);
    wrapper.append(caption, field);
  });
};

window.addFormFieldTitles = addFormFieldTitles;

const headerMenuToggle = document.querySelector('.header-menu-toggle');
const siteNavigation = document.querySelector('#site-navigation');

if (headerMenuToggle && siteNavigation) {
  headerMenuToggle.addEventListener('click', () => {
    const isOpen = headerMenuToggle.getAttribute('aria-expanded') === 'true';
    headerMenuToggle.setAttribute('aria-expanded', String(!isOpen));
    document.querySelector('.site-header')?.classList.toggle('menu-open', !isOpen);
  });

  siteNavigation.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      headerMenuToggle.setAttribute('aria-expanded', 'false');
      document.querySelector('.site-header')?.classList.remove('menu-open');
    });
  });
}

document.querySelectorAll('.nav-dropdown').forEach((dropdown) => {
  const toggle = dropdown.querySelector('.nav-dropdown__toggle');
  if (!toggle) return;

  const close = () => {
    dropdown.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  };

  toggle.addEventListener('click', (event) => {
    event.stopPropagation();
    const isOpen = dropdown.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  dropdown.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      close();
      toggle.focus();
    }
  });

  document.addEventListener('click', (event) => {
    if (!dropdown.contains(event.target)) close();
  });
});

const materialCards = document.querySelectorAll('.hero-materials article');

if (materialCards.length) {
  

  const estimateModal = document.querySelector('.estimate-modal');
  addFormFieldTitles(estimateModal);
  const modalTitle = estimateModal?.querySelector('#material-modal-title');
  const modalMaterial = estimateModal?.querySelector('input[name="material"]');
  const modalPhone = estimateModal?.querySelector('input[name="phone"]');
  const materialPopupTitles = {
    'Металлочерепица': 'Получить расчёт металлочерепицы',
    'Профнастил': 'Получить расчёт кровли из профнастила',
    'Мягкая кровля': 'Получить расчёт мягкой кровли',
    'Фальцевая кровля': 'Получить расчёт фальцевой кровли',
    'Жилая пристройка': 'Рассчитать жилую пристройку',
    'Кухня или столовая': 'Рассчитать пристройку кухни',
    'Тёплая веранда': 'Рассчитать тёплую веранду',
  };
  const closeModal = () => {
    estimateModal?.classList.remove('is-open');
    estimateModal?.setAttribute('aria-hidden', 'true');
  };

  materialCards.forEach((card) => {
    const materialName = card.querySelector('b')?.textContent?.trim() || (isExtensionsPage ? 'выбранную пристройку' : 'выбранную кровлю');
    const requestTitle = card.dataset.requestTitle?.trim();
    const materialPopupTitle = requestTitle || materialPopupTitles[materialName] || (isExtensionsPage ? 'Получить расчёт пристройки' : 'Получить расчёт кровли');
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', materialPopupTitle);
    const openModal = () => {
      if (!estimateModal || !modalTitle || !modalMaterial) return;
      modalTitle.textContent = materialPopupTitle;
      modalMaterial.value = requestTitle ? `Тема заявки: ${requestTitle}` : `Выбранный материал: ${materialName}`;
      estimateModal.classList.add('is-open');
      estimateModal.setAttribute('aria-hidden', 'false');
      setTimeout(() => modalPhone?.focus(), 180);
    };
    card.addEventListener('click', openModal);
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openModal();
      }
    });
  });

  estimateModal?.querySelectorAll('[data-modal-close]').forEach((element) => {
    element.addEventListener('click', closeModal);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && estimateModal?.classList.contains('is-open')) closeModal();
  });

  const modalIntro = estimateModal?.querySelector('.estimate-modal__intro');
  const popupButtons = document.querySelectorAll(
    'a.button[href="#estimate"], a.text-link[href="#estimate"]',
  );

  const popupContent = (label) => {
    const text = label.toLocaleLowerCase('ru-RU');
    if (isRecoveryPage) return ['Оценить состояние дома', 'Пришлите фотографии дома и проблемных мест. Прораб подскажет, с чего начать восстановление и какой объём ремонта рассматривать.'];
    if (text.includes('осмотр') || text.includes('прораб')) return ['Вызвать прораба на осмотр', 'Оставьте телефон и населённый пункт. Александр уточнит детали и согласует удобное время осмотра.'];
    if (isExtensionsPage && (text.includes('фото') || text.includes('фотограф'))) return ['Получить расчёт пристройки по фото', 'Добавьте фотографии дома и места будущей пристройки. Оценим конструкцию и диапазон стоимости.'];
    if (isExtensionsPage) return ['Рассчитать пристройку', 'Оставьте телефон, населённый пункт и фотографии дома. Подготовим предварительную оценку строительства.'];
    if (text.includes('реконструк')) return ['Оценить реконструкцию крыши', 'Приложите фотографии повреждений. Оценим состояние конструкции и предварительный объём восстановления.'];
    if (text.includes('перекрыт')) return ['Рассчитать перекрытие дома', 'Пришлите фотографии существующей кровли. Рассчитаем демонтаж, новое покрытие и доборные элементы.'];
    if (text.includes('выезд') || text.includes('объект')) return ['Уточнить выезд на объект', 'Укажите населённый пункт. Сразу обозначим условия выезда, логистики и доставки материалов.'];
    if (text.includes('смет')) return ['Получить предварительную смету', 'Опишите задачу и приложите фотографии. Разделим работы и материалы и обозначим предварительный бюджет.'];
    if (text.includes('фото') || text.includes('фотограф')) return ['Получить расчёт кровли по фото', 'Добавьте 3–5 фотографий дома и крыши. Александр оценит объём работ и диапазон стоимости.'];
    return ['Рассчитать замену кровли', 'Оставьте телефон, населённый пункт и фотографии. Подготовим предварительную оценку именно вашего дома.'];
  };

  popupButtons.forEach((button) => {
    const label = button.textContent.replace(/↗/g, '').trim();
    const cardTitle = button.closest('.plan-card, .case-card')?.querySelector('h3')?.textContent?.trim();
    const topic = cardTitle ? `${label}: ${cardTitle}` : label;
    const [title, intro] = popupContent(`${label} ${cardTitle || ''}`);

    button.removeAttribute('href');
    button.setAttribute('role', 'button');
    button.setAttribute('tabindex', '0');
    button.setAttribute('aria-haspopup', 'dialog');

    const openPopup = () => {
      if (!estimateModal || !modalTitle || !modalMaterial) return;
      modalTitle.textContent = title;
      modalMaterial.value = `Тема заявки: ${topic}`;
      if (modalIntro) modalIntro.textContent = intro;
      estimateModal.classList.add('is-open');
      estimateModal.setAttribute('aria-hidden', 'false');
      setTimeout(() => modalPhone?.focus(), 180);
    };

    button.addEventListener('click', openPopup);
    button.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openPopup();
      }
    });
  });
}

const forms = document.querySelectorAll('form');
const formSubmitGoalId = isExtensionsPage
  ? 'pristroyki_form_submit'
  : isRecoveryPage
    ? 'vosstanovlenie_form_submit'
  : 'zamena_krovli_form_submit';

const reachFormSubmitGoal = () => {
  reachRoofReplacementGoal();
  if (typeof window.ym === 'function') {
    window.ym(isRoofReplacementPage ? 113757988 : 111540408, 'reachGoal', formSubmitGoalId);
  }
};

const prepareLeadForm = (form) => {
  const namesByPlaceholder = [
    ['телефон', 'phone'],
    ['насел', 'place'],
    ['район', 'place'],
    ['площад', 'roof_area'],
    ['материал', 'roof_material'],
  ];

  form.querySelectorAll('input, select, textarea').forEach((field, index) => {
    if (field.name) return;
    const hint = `${field.placeholder || ''} ${field.options?.[0]?.text || ''}`.toLocaleLowerCase('ru-RU');
    const matchedName = namesByPlaceholder.find(([fragment]) => hint.includes(fragment))?.[1];
    if (matchedName) field.name = matchedName;
    else if (field.type === 'file') field.name = 'photos[]';
    else if (field.type === 'checkbox') field.name = 'policy';
    else field.name = `field_${index + 1}`;
  });

  const phone = form.querySelector('input[type="tel"]');
  if (phone) {
    phone.name = 'phone';
    phone.required = true;
  }
};

const sendLeadForm = async (form, button, statusElement) => {
  prepareLeadForm(form);
  if (!form.checkValidity()) {
    form.reportValidity();
    return false;
  }

  const original = button?.innerHTML || '';
  if (button) {
    button.disabled = true;
    button.textContent = 'Отправляем...';
  }
  if (statusElement) statusElement.textContent = 'Отправляем заявку...';

  try {
    const formData = new FormData(form);
    formData.set('form_name', form.dataset.formName || form.querySelector('h3')?.textContent?.trim() || 'Заявка с сайта «Новая Кровля»');
    formData.set('page_url', window.location.href);
    const response = await fetch('/mail.php', { method: 'POST', body: formData });
    const result = await response.json().catch(() => null);
    if (!response.ok || !result?.success) throw new Error(result?.message || 'Не удалось отправить заявку');

    reachFormSubmitGoal();
    form.reset();
    if (statusElement) statusElement.textContent = 'Спасибо! Заявка отправлена, прораб свяжется с вами в ближайшее время.';
    if (button) button.textContent = 'Заявка отправлена';
    return true;
  } catch (error) {
    if (statusElement) statusElement.textContent = error instanceof Error ? error.message : 'Ошибка отправки. Попробуйте ещё раз.';
    if (button) {
      button.disabled = false;
      button.innerHTML = original;
    }
    return false;
  }
};

window.sendNovayaKrovlyaLeadForm = sendLeadForm;

forms.forEach((form) => {
  prepareLeadForm(form);
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = form.querySelector('button[type="submit"]');
    if (!button) return;
    let status = form.querySelector('.form-status');
    if (!status) {
      status = document.createElement('div');
      status.className = 'form-status';
      status.setAttribute('role', 'status');
      status.setAttribute('aria-live', 'polite');
      form.append(status);
    }
    await sendLeadForm(form, button, status);
  });
});

document.addEventListener('click', (event) => {
  const policyLink = event.target.closest?.('.consent a');
  if (!policyLink) return;
  event.stopPropagation();
  policyLink.setAttribute('target', '_blank');
  policyLink.setAttribute('rel', 'noopener noreferrer');
});

document.querySelectorAll('input[type="file"]').forEach((input) => {
  input.addEventListener('change', () => {
    const label = input.closest('.upload');
    if (label && input.files.length) label.childNodes[0].textContent = `Выбрано файлов: ${input.files.length} `;
  });
});

const phoneMaskPlaceholder = '+7 (___) ___-__-__';

const getPhoneDigits = (value) => {
  const digits = String(value || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits[0] === '8' || digits[0] === '7') return digits.slice(1, 11);
  return digits.slice(0, 10);
};

const formatPhone = (value) => {
  const digits = getPhoneDigits(value);
  if (!digits) return '';

  let result = '+7';
  if (digits.length) result += ` (${digits.slice(0, 3)}`;
  if (digits.length >= 3) result += ')';
  if (digits.length > 3) result += ` ${digits.slice(3, 6)}`;
  if (digits.length > 6) result += `-${digits.slice(6, 8)}`;
  if (digits.length > 8) result += `-${digits.slice(8, 10)}`;
  return result;
};

const preparePhoneInput = (input) => {
  if (!(input instanceof HTMLInputElement) || input.type !== 'tel') return;
  input.placeholder = phoneMaskPlaceholder;
  input.inputMode = 'numeric';
  input.autocomplete = 'tel';
  input.maxLength = 18;
  input.pattern = '\\+7 \\(\\d{3}\\) \\d{3}-\\d{2}-\\d{2}';
  input.value = formatPhone(input.value);
};

document.querySelectorAll('input[type="tel"]').forEach(preparePhoneInput);

document.addEventListener('focusin', (event) => {
  const input = event.target;
  if (!(input instanceof HTMLInputElement) || input.type !== 'tel') return;
  preparePhoneInput(input);
  if (!input.value) input.value = '+7 (';
});

document.addEventListener('input', (event) => {
  const input = event.target;
  if (!(input instanceof HTMLInputElement) || input.type !== 'tel') return;
  input.value = formatPhone(input.value);
  input.setCustomValidity(getPhoneDigits(input.value).length === 10 ? '' : 'Введите номер полностью');
});

document.addEventListener('focusout', (event) => {
  const input = event.target;
  if (!(input instanceof HTMLInputElement) || input.type !== 'tel') return;
  if (!getPhoneDigits(input.value).length) {
    input.value = '';
    input.setCustomValidity('');
  }
});

document.addEventListener('submit', (event) => {
  const phoneInputs = event.target.querySelectorAll?.('input[type="tel"]') || [];
  phoneInputs.forEach((input) => {
    preparePhoneInput(input);
    input.setCustomValidity(getPhoneDigits(input.value).length === 10 ? '' : 'Введите номер полностью');
  });
}, true);

