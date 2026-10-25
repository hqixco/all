const PHONE_TEMPLATE = "+7 (___) ___-__-__";
const PHONE_PATTERN = "^\\+7 \\(\\d{3}\\) \\d{3}-\\d{2}-\\d{2}$";

function extractPhoneDigits(value) {
  const rawValue = String(value ?? "");
  const digits = rawValue.replace(/\D/g, "");
  if (!digits) return "";

  const hasCountryPrefix =
    (rawValue.includes("+") || rawValue.includes("(")) &&
    digits.startsWith("7");
  const normalized =
    (hasCountryPrefix || digits.length > 10) &&
    (digits.startsWith("7") || digits.startsWith("8"))
      ? digits.slice(1)
      : digits;

  return normalized.slice(0, 10);
}

function formatPhoneMask(digits) {
  let digitIndex = 0;

  return PHONE_TEMPLATE.replace(/_/g, () => digits[digitIndex++] || "_");
}

function moveCaretToNextSlot(input) {
  const nextSlot = input.value.indexOf("_");
  const caretPosition = nextSlot === -1 ? input.value.length : nextSlot;
  input.setSelectionRange(caretPosition, caretPosition);
}

function initPhoneMask(input) {
  if (!(input instanceof HTMLInputElement) || input.dataset.phoneMaskReady)
    return;

  input.dataset.phoneMaskReady = "true";
  input.type = "tel";
  input.inputMode = "numeric";
  input.autocomplete = "tel";
  input.placeholder = PHONE_TEMPLATE;
  input.maxLength = PHONE_TEMPLATE.length;
  input.pattern = PHONE_PATTERN;
  input.title = "Введите телефон в формате +7 (999) 999-99-99";

  const syncValue = () => {
    const digits = extractPhoneDigits(input.value);
    input.value =
      digits || document.activeElement === input ? formatPhoneMask(digits) : "";
    moveCaretToNextSlot(input);
  };

  input.addEventListener("focus", syncValue);
  input.addEventListener("input", syncValue);
  input.addEventListener("click", moveCaretToNextSlot.bind(null, input));
  input.addEventListener("blur", () => {
    const digits = extractPhoneDigits(input.value);
    input.value = digits ? formatPhoneMask(digits) : "";
  });

  syncValue();
}

export function initPhoneMasks(root = document) {
  root
    .querySelectorAll(
      'input[type="tel"], input[name="phone"], input[name="contact"], input[name="contact_2"]',
    )
    .forEach(initPhoneMask);
}
