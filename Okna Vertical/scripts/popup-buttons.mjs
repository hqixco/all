const escape = value => value.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');

// Build-time normalization keeps action buttons and their popup settings in static HTML.
export function popupButtons(html, pageTitle = 'остекления') {
  const casesSection = html.match(/<section\b[^>]*class="[^"]*\bcases-section\b[^>]*>/)?.[0];
  const casesId = casesSection?.match(/\bid="([^"]+)"/)?.[1];
  const worksHref = casesId ? '#' + casesId : '/portfolio/#works';
  html = html.replace(/<(a|button)\b([^>]*)>([\s\S]*?)<\/\1\s*>/g, (original, tag, attributes, body) => {
    const label = body.replace(/<svg\b[\s\S]*?<\/svg>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (label !== 'Смотреть примеры работ') return original;
    attributes = attributes.replace(/\s*(?:href|type|target|rel|data-package-[\w-]+)="[^"]*"/g, '');
    return `<a${attributes} href="${escape(worksHref)}">${body}</a>`;
  });
  return html.replace(/<a\b([^>]*)>([\s\S]*?)<\/a\s*>/g, (original, attributes, body) => {
    const href = attributes.match(/\bhref="([^"]*)"/)?.[1] || '';
    const classes = attributes.match(/\bclass="([^"]*)"/)?.[1] || '';
    const action = /(?:^|\s)(?:button(?:--\S+)?|home-button(?:--\S+)?|home-hero-card|home-hero__works-button|home-hero__measure|case-button|\S+__button|cross-link-card__primary|cross-link-card__secondary)(?:\s|$)/.test(classes);
    const configured = /\bdata-package-title=/.test(attributes);
    const label = body.replace(/<svg\b[\s\S]*?<\/svg>/g,'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
    if (label === 'Смотреть примеры работ') return original;
    if (!configured && !(action && /#/.test(href))) return original;
    attributes = attributes.replace(/\s*(?:href|target|rel)="[^"]*"/g,'').replace(/\s*data-package-custom="estimate"/g,'');
    if (!configured) {
      const estimate = /смет|провер.*расч[её]т/i.test(label) || /#compare/.test(href);
      const title = estimate ? 'Проверить смету' : /замер/i.test(label) ? 'Записаться на замер' : /home-hero-card/.test(classes) ? 'Рассчитать: '+label : /примеры|работ|проект/i.test(label) ? 'Обсудить похожий проект' : `Обсудить ${pageTitle}`;
      attributes += ` data-package-title="${escape(title)}" data-package-modal-title="${escape(title)}" data-package-description="${escape(estimate ? 'Прикрепите смету и оставьте телефон — сравним комплектацию и перечень работ.' : 'Оставьте телефон — уточним вашу задачу и подготовим подходящий расчёт.')}" data-package-submit="${estimate ? 'Отправить смету' : 'Получить консультацию'}" data-package-no-image="true"`;
      attributes += estimate ? ' data-package-upload="estimate"' : ' data-package-no-upload="true"';
    }
    return `<button type="button"${attributes}>${body}</button>`;
  });
}
