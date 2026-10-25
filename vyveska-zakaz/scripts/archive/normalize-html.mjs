import fs from 'node:fs';
import path from 'node:path';
import { load } from 'cheerio';
import sharp from 'sharp';

const origin = 'https://xn----7sbbagavscye2ftg.xn--p1ai';
const compact = text => text.replace(/\s+/g, ' ').trim();
const imageSizes = new Map();
const rename = (element, name) => { element.name = name; };

export async function normalizeHtml(file, route) {
  const $ = load(fs.readFileSync(file, 'utf8'));
  const canonical = `${origin}/${route ? `${route}/` : ''}`;
  const pageNumber = route.match(/(?:^|\/)page\/(\d+)$/)?.[1];
  if (pageNumber) {
    const title = `${compact($('title').text())} — Страница ${pageNumber}`;
    $('title').text(title);
    $('meta[property="og:title"]').attr('content', title);
    const description = $('meta[name="description"]');
    description.attr('content', `${compact(description.attr('content') || '')} Страница ${pageNumber}.`);
    $('meta[property="og:description"]').attr('content', description.attr('content'));
  }
  $('html').attr('lang', 'ru');
  $('meta[charset]').attr('charset', 'UTF-8');
  $('link[rel="canonical"]').remove();
  $('head').append(`<link rel="canonical" href="${canonical}">`);
  $('meta[property="og:url"]').attr('content', canonical);
  if (!$('meta[name="description"]').length && route === 'privacy-policy') {
    $('head').append('<meta name="description" content="Политика конфиденциальности РПК «Ресурс»: обработка и защита персональных данных посетителей сайта.">');
  }
  $('meta[name="description"]').each((_, el) => $(el).attr('content', compact($(el).attr('content') || '')));

  const sections = '.b__block, .line--3, .possibilities, .portfolio, .primaries, .about, .reviews, .partners, .portfolio-text, .additional-text, .feedback__block, .portfolio-photo__block, .portfolio__slider, .news-detail, .html__contact';
  $(sections).filter('div').each((_, el) => rename(el, 'section'));
  $('.root__main > .root__width > .inner > .html:not(.html__content)').filter('div').each((_, el) => rename(el, 'section'));
  $('.section__title').filter('div').each((_, el) => rename(el, 'h2'));
  $('.qna-title').filter('div').each((_, el) => rename(el, 'h2'));
  $('.reviews.no-main').each((_, el) => {
    const author = compact($(el).find('.reviews__item-title').text());
    $(el).attr('aria-label', author ? `Отзыв: ${author}` : 'Отзыв клиента');
  });
  const labels = { 'b__block': 'Предложения компании', 'line--3': 'Услуги', 'primaries': 'Наши преимущества', 'portfolio-text': 'Описание услуги', 'portfolio-photo__block': 'Примеры работ', 'portfolio__slider': 'Примеры работ', 'news-detail': compact($('h1').text()), 'html__contact': 'Контактная информация', 'html': compact($('h1').text()) };
  $('section').each((_, el) => {
    if ($(el).find('h1,h2,h3,h4,h5,h6').not('[data-carousel-copy] *').length) return;
    const label = Object.entries(labels).find(([name]) => $(el).hasClass(name))?.[1];
    if (label) $(el).attr('aria-label', label);
  });
  // A card link is the sole interactive element; its visual call to action is text.
  $('a button').each((_, el) => { rename(el, 'span'); $(el).removeAttr('type'); });
  $('[id^="slick-slide"]').removeAttr('id role aria-describedby aria-labelledby tabindex');
  $('[data-slick-index]').removeAttr('data-slick-index');
  $('[align]').each((_, el) => {
    const align = $(el).attr('align');
    if (['left','right','center','justify'].includes(align)) $(el).attr('style', `${$(el).attr('style') || ''};text-align:${align}`);
    $(el).removeAttr('align');
  });
  $('body style').each((_, el) => $('head').append($(el)));
  $('a[href]').each((_, el) => {
    try {
      let raw = $(el).attr('href');
      if (/^(?:www\.)?xn----7sbbagavscye2ftg\.xn--p1ai\//i.test(raw)) raw = 'https://' + raw.replace(/^www\./i, '');
      const url = new URL(raw, origin);
      if (url.origin === origin && /^(?:https?:)?\/\//i.test(raw)) $(el).attr('href', `${url.pathname}${url.search}${url.hash}`);
    } catch { /* Leave non-URL browser actions intact. */ }
    if ($(el).attr('target') === '_blank') {
      const rel = new Set(($(el).attr('rel') || '').split(/\s+/).filter(Boolean));
      rel.add('noopener');
      $(el).attr('rel', [...rel].join(' '));
    }
  });
  $('a[href="#commentform"]').attr('href', 'mailto:resurs_mi@mail.ru?subject=' + encodeURIComponent('Отзыв о РПК Ресурс'));
  $('input[placeholder], textarea[placeholder]').each((_, el) => {
    if ($(el).attr('aria-label') || $(el).attr('aria-labelledby') || $(el).closest('label').length) return;
    const id = $(el).attr('id');
    if (id && $('label[for]').toArray().some(label => $(label).attr('for') === id)) return;
    $(el).attr('aria-label', compact($(el).attr('placeholder')).replace(/\s*\*$/, ''));
  });

  $('[itemtype$="/BreadcrumbList"]').each((_, el) => {
    if (el.name === 'div') rename(el, 'nav');
    $(el).attr('aria-label', 'Хлебные крошки').attr('itemtype', 'https://schema.org/BreadcrumbList');
    const current = $(el).find('.current').last();
    if (current.length && !current.attr('itemprop')) {
      const text = compact(current.text());
      current.attr({itemprop:'itemListElement',itemscope:'',itemtype:'https://schema.org/ListItem','aria-current':'page'});
      current.empty().append($('<span>').attr('itemprop','name').text(text)).append($('<meta>').attr({itemprop:'item',content:canonical}));
    }
    $(el).find('[itemprop="itemListElement"]').each((i, item) => {
      $(item).attr('itemtype', 'https://schema.org/ListItem');
      $(item).children('[itemprop="position"]').remove();
      $(item).append(`<meta itemprop="position" content="${i + 1}">`);
    });
  });
  $('.breadcrumbs__separator').attr('aria-hidden','true').empty().append('<svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="M2 8h11m-4-4 4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>');

  for (const img of $('img').toArray()) {
    const node = $(img);
    if (!node.attr('src')) node.attr('src', '/assets/theme/img/image-placeholder.svg');
    const src = node.attr('src');
    if (!node.attr('alt')) {
      const card = node.closest('.objects__item, .portfolio__slider-item');
      const title = compact(card.find('h2,h3,h4').first().text() || node.attr('title') || '');
      const logo = node.closest('.root__head, .root__footer').length && /logo/i.test(src);
      node.attr('alt', title || (logo ? 'РПК Ресурс' : ''));
    }
    if (node.attr('srcset')) {
      const urls = new Set(node.attr('srcset').split(',').map(candidate => candidate.trim().split(/\s+/)[0]));
      if (urls.size === 1) node.removeAttr('srcset sizes');
    }
    if (src.startsWith('/') && !src.startsWith('//')) {
      const local = path.resolve('public', src.slice(1));
      if (fs.existsSync(local)) {
        if (!imageSizes.has(local)) imageSizes.set(local, await sharp(local).metadata());
        const size = imageSizes.get(local);
        if (size.width && size.height && (!node.attr('width') || !node.attr('height'))) node.attr({width:size.width,height:size.height});
      }
    }
    node.attr('decoding','async');
  }
  $('meta[property="og:image"],meta[name="twitter:image"]').each((_, el) => {
    const value = $(el).attr('content');
    if (value?.startsWith('/')) $(el).attr('content', origin + value);
  });
  fs.writeFileSync(file, $.html());
}
