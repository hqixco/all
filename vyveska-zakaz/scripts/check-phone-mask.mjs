import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const listeners = {};
const field = {
  value: '', selectionStart: 0, selectionEnd: 0,
  addEventListener(name, fn) { listeners[name] = fn; },
  setSelectionRange(start, end) { this.selectionStart = start; this.selectionEnd = end; },
  setCustomValidity(message) { this.error = message; },
  dispatchEvent(event) { listeners[event.type]?.(event); },
};
const document = { activeElement: field, querySelectorAll: () => [field], addEventListener: (_, fn) => fn() };
vm.runInNewContext(fs.readFileSync('public/assets/phone-mask.js', 'utf8'), { document, Event });
const key = key => listeners.keydown({ key, preventDefault() {} });
const paste = text => listeners.paste({ preventDefault() {}, clipboardData: { getData: () => text } });
listeners.focus();
assert.equal(field.value, '+7 (___) ___-__-__');
for (const digit of '9123456789') key(digit);
assert.equal(field.value, '+7 (912) 345-67-89');
key('0');
assert.equal(field.value, '+7 (912) 345-67-89');
key('Backspace');
assert.equal(field.value, '+7 (912) 345-67-8_');
assert.ok(field.error);
field.setSelectionRange(0, 18);
paste('8 (999) 123-45-67');
assert.equal(field.value, '+7 (999) 123-45-67');
assert.equal(field.error, '');
field.setSelectionRange(0, 18);
paste('+7 911 222 33 44');
assert.equal(field.value, '+7 (911) 222-33-44');
field.setSelectionRange(0, 18);
key('Backspace');
listeners.blur();
assert.equal(field.value, '');
listeners.focus();
listeners.beforeinput({ cancelable: true, inputType: 'insertText', data: '9', preventDefault() {} });
assert.equal(field.value, '+7 (9__) ___-__-__');
listeners.beforeinput({ cancelable: true, inputType: 'deleteContentBackward', preventDefault() {} });
assert.equal(field.value, '+7 (___) ___-__-__');
console.log('Phone mask: typing, length limit, deletion, paste, mobile input and empty state passed');
