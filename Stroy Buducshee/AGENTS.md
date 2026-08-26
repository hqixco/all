# Project Rules

## PHP email headers

- Never put a non-ASCII sender name directly into the `From` header.
- Encode a Russian or other Unicode sender name as an RFC 2047 encoded word, for example: `=?UTF-8?B?<base64>?=`.
- Keep the sender email address ASCII and use the same domain as the website when possible.
- Set the envelope sender through the `mail()` `-f` parameter; do not manually add a `Return-Path` header.
- For a UTF-8 plain-text body, include both `Content-Type: text/plain; charset=UTF-8` and `Content-Transfer-Encoding: 8bit`.
- When changing the mail handler, verify the generated `From` header does not appear as `EMPTY FROM` in the receiving mailbox.

## Popup close buttons on iPhone

- Popup and modal close buttons must remain square on iPhone and Safari; never allow them to be compressed by a flex or grid layout.
- Give close buttons explicit equal `width`, `height`, `min-width`, and `min-height` values in pixels.
- Add `flex: 0 0 auto`, `padding: 0`, and `aspect-ratio: 1 / 1` where appropriate.
- Test that the close icon remains centered and the button does not become oval, narrow, or flattened on iOS.

## Responsive breakpoints

- Use the standard project breakpoints: `480px`, `767px`, `900px`, and `1200px`.
- For desktop-first CSS, use `@media (max-width: 1199px)`, `@media (max-width: 899px)`, `@media (max-width: 766px)`, and `@media (max-width: 479px)` so adjacent ranges do not overlap.
- The desktop header navigation must switch to the burger/mobile navigation below `1200px`.
- Add responsive rules only when adaptive work is explicitly requested; keep the initial build desktop-only.
