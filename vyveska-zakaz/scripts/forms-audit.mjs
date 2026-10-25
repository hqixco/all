import fs from 'node:fs';
import assert from 'node:assert/strict';
import { load } from 'cheerio';

const pages = JSON.parse(fs.readFileSync('config/site-pages.json', 'utf8'));
const forms = [];
for (const page of pages) {
  const $ = load(fs.readFileSync(page.source, 'utf8'));
  $('form').each((index, node) => {
    const form = $(node);
    const mail = form.is('[data-static-form]');
    const modal = form.closest('.modal__content').attr('id') || null;
    const profile = modal === 'formReviews' ? 'review' : modal === 'formOrderCall' ? 'callback' : form.hasClass('light-signs__form') ? 'calculation' : 'order';
    forms.push({ url: page.url, source: page.source, number: index + 1, modal,
      action: form.attr('action') || null, method: form.attr('method') || null,
      endpoint: mail ? '/mail.php' : form.attr('action'), transport: mail ? 'POST fetch / public/assets/site.js' : 'GET search',
      profile: mail ? profile : null,
      fields: form.find('input[name],textarea[name],select[name]').toArray().map(field => ({ name: $(field).attr('name'), type: $(field).attr('type') || field.tagName, required: $(field).is('[required]') })) });
    if (!mail) { assert.equal(form.attr('action'), '/search/'); assert.equal(form.attr('method')?.toLowerCase(), 'get'); }
    if (mail) {
      assert($('script[src="/assets/site.js"]').length, `${page.source}: missing shared JS`);
      assert.equal(form.attr('action'), '/mail.php');
      assert.equal(form.attr('method')?.toLowerCase(), 'post');
      const type = form.find('input[name="form-type"]');
      assert.equal(type.length, 1); assert.equal(type.attr('type'), 'hidden'); assert.equal(type.attr('value'), profile);
      if (profile === 'review') assert(form.find('textarea[name="message"]').is('[required]'));
    }
  });
}
const js = fs.readFileSync('public/assets/site.js', 'utf8');
assert(js.includes("const endpoint = '/mail.php'"));
assert(js.includes("data.set('form-type', formType)"));
assert(!js.includes('window.location.href = `mailto:'));
assert.equal(fs.readFileSync('public/mail.php', 'utf8'), fs.readFileSync('dist/mail.php', 'utf8'));
const light = pages.find(page => page.url === '/svetovye-vyveski/');
assert.equal(light.indexable, false);
assert(!fs.readFileSync('dist/sitemap.xml', 'utf8').includes('/svetovye-vyveski/'));
assert(load(fs.readFileSync(light.source, 'utf8'))('meta[name="robots"]').attr('content').includes('noindex'));
if (process.argv.includes('--report')) {
  fs.mkdirSync('docs', { recursive: true });
  fs.writeFileSync('docs/form-inventory.json', JSON.stringify(forms, null, 2) + '\n');
  const lines = ['# Все формы проекта', '', 'Полные поля, action/method и обработчики: `form-inventory.json`. Все 405 форм заявок имеют HTML action="/mail.php", method="post" и ровно одно hidden-поле form-type. Нативная отправка без JS возвращает JSON обработчика; модальные окна открываются через JS.', '', '| Страница | Формы заявок (номер: профиль) | Поиск |', '|---|---|---|'];
  for (const page of pages) {
    const items = forms.filter(form => form.url === page.url);
    lines.push(`| ${page.url} | ${items.filter(form => form.profile).map(form => `${form.number}: ${form.profile}${form.modal ? ` (${form.modal})` : ''}`).join('; ') || '—'} | ${items.filter(form => !form.profile).map(form => `${form.number}: GET /search/`).join('; ') || '—'} |`);
  }
  fs.writeFileSync('docs/form-inventory.md', lines.join('\n') + '\n');
}
console.log(`Forms audit: ${pages.length} pages, ${forms.filter(form => form.profile).length} mail forms, ${forms.filter(form => !form.profile).length} search forms; PHP copied unchanged; light page remains noindex.`);
