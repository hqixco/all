const template = '+7 (___) ___-__-__';
const slots = Array.from(template, (char, index) => char === '_' ? index : -1).filter(index => index >= 0);
const normalize = value => {
  let digits = value.replace(/\D/g, '');
  if (digits.length > 10 && /^[78]/.test(digits)) digits = digits.slice(1);
  return digits.slice(0, 10);
};

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('input[type="tel"], input[name="phone"], input[name="your-phone"]').forEach(input => {
    let digits = normalize(input.value);
    const render = (position, focused = true) => {
      let index = 0;
      input.value = digits || focused ? template.replace(/_/g, () => digits[index++] || '_') : '';
      input.setCustomValidity(digits.length && digits.length !== 10 ? 'Введите телефон полностью: +7 (___) ___-__-__' : '');
      if (focused) input.setSelectionRange(slots[Math.min(position, 9)] + (position === 10 ? 1 : 0), slots[Math.min(position, 9)] + (position === 10 ? 1 : 0));
    };
    const edit = (text, direction) => {
      let start = slots.filter(slot => slot < input.selectionStart).length;
      let end = slots.filter(slot => slot < input.selectionEnd).length;
      if (direction && start === end) {
        if (direction === 'backward') start = Math.max(0, start - 1);
        else end = Math.min(10, end + 1);
      }
      const inserted = text.replace(/\D/g, '');
      digits = (digits.slice(0, start) + inserted + digits.slice(end)).slice(0, 10);
      render(Math.min(start + inserted.length, digits.length));
      input.dispatchEvent(new Event('input', { bubbles: true }));
    };
    input.addEventListener('focus', () => render(digits.length));
    input.addEventListener('blur', () => render(digits.length, false));
    input.addEventListener('beforeinput', event => {
      if (!event.cancelable) return;
      if (event.inputType === 'deleteContentBackward' || event.inputType === 'deleteContentForward') {
        event.preventDefault();
        edit('', event.inputType === 'deleteContentBackward' ? 'backward' : 'forward');
      } else if (event.inputType === 'insertText' && event.data !== null) {
        event.preventDefault();
        edit(event.data);
      }
    });
    input.addEventListener('keydown', event => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (event.key === 'Backspace' || event.key === 'Delete') {
        event.preventDefault();
        edit('', event.key === 'Backspace' ? 'backward' : 'forward');
      } else if (event.key.length === 1) {
        event.preventDefault();
        if (/\d/.test(event.key)) edit(event.key);
      }
    });
    input.addEventListener('paste', event => {
      event.preventDefault();
      const text = event.clipboardData.getData('text');
      edit(normalize(text));
    });
    input.addEventListener('input', () => {
      if (input.value === template.replace(/_/g, (() => { let i = 0; return () => digits[i++] || '_'; })())) return;
      const value = input.value;
      digits = normalize(value.replace(/^\+7/, ''));
      render(digits.length, document.activeElement === input);
    });
    input.form && input.form.addEventListener('reset', () => {
      window.setTimeout(() => { digits = normalize(input.value); render(digits.length, false); }, 0);
    });
    render(digits.length, false);
  });
});
