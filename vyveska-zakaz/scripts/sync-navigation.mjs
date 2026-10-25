import fs from 'node:fs';
import { load } from 'cheerio';
import { markNavigation } from './navigation-state.mjs';
import { applyLegacySkin } from './legacy-skin-sync.mjs';
if (process.argv.includes('--legacy-skin')) { applyLegacySkin(JSON.parse(fs.readFileSync('config/site-pages.json','utf8'))); process.exit(0); }


const pages = JSON.parse(fs.readFileSync('config/site-pages.json', 'utf8'));
const groups = JSON.parse(fs.readFileSync('config/site-navigation.json', 'utf8'));
const origin = 'https://xn----7sbbagavscye2ftg.xn--p1ai';
const escape = text => String(text).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
const link = url => `<a href="${escape(url)}">${escape(pages.find(page => page.url === url.split('#')[0])?.label || url)}</a>`;
const navigation = `<nav class="site-nav" id="site-nav" aria-label="Основная навигация"><ul class="site-nav__list">${groups.map(group => `<li class="site-nav__item">${group.children?.length ? `<details class="site-nav__group"><summary>${escape(group.label)}<svg class="site-nav__arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path class="site-nav__arrow-path" d="m6 9 6 6 6-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></summary><ul class="site-nav__submenu">${group.url && !group.url.includes('#') ? `<li><a href="${group.url}">${escape(group.label)}: все направления</a></li>` : ''}${group.children.map(url => `<li>${link(url)}</li>`).join('')}</ul></details>` : `<a href="${group.url}">${escape(group.label)}</a>`}</li>`).join('')}</ul></nav>`;

for (const page of pages) {
  const $ = load(fs.readFileSync(page.source, 'utf8'));
  $('.root__head #top_menu, .root__head .site-nav').replaceWith(navigation);
  markNavigation($, page.url, pages);
  $('.hamburger').attr({'aria-controls':'site-nav', 'aria-expanded':'false', 'aria-label':'Открыть меню'});
  $('.breadcrumbs').remove();
  if (page.url !== '/') {
    const chain = [page];
    const seen = new Set([page.url]);
    let parent = pages.find(candidate => candidate.url === page.parent);
    while (parent && !seen.has(parent.url)) {
      chain.unshift(parent); seen.add(parent.url);
      parent = pages.find(candidate => candidate.url === parent.parent);
    }
    const crumbs = chain.map((item, index) => `<span itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">${item === page ? `<span itemprop="name" aria-current="page">${escape(item.label)}</span><meta itemprop="item" content="${origin}${item.url}">` : `<a itemprop="item" href="${item.url}"><span itemprop="name">${escape(item.label)}</span></a>`}<meta itemprop="position" content="${index + 1}"></span>`).join(' ');
    $('h1').first().before(`<div class="breadcrumbs"><nav aria-label="Хлебные крошки" itemscope itemtype="https://schema.org/BreadcrumbList">${crumbs}</nav></div>`);
  }
  $('[data-site-links]').remove();
  const children = pages.filter(candidate => candidate.parent === page.url && candidate.url !== '/search/');
  const related = [...new Set([...(page.related || []), ...children.map(child => child.url), ...(page.parent && page.parent !== '/' ? [page.parent] : [])])].filter(url => url !== page.url);
  const targets = page.url === '/karta-sajta/' ? pages.filter(candidate => candidate.url !== page.url && candidate.status !== 'utility').map(candidate => candidate.url) : related;
  if (targets.length) $('main').append(`<section class="site-links root__width" data-site-links=""><h2>${page.url === '/karta-sajta/' ? 'Все страницы сайта' : 'Связанные направления'}</h2><ul class="site-links__list">${targets.map(url => `<li>${link(url)}</li>`).join('')}</ul></section>`);
  fs.writeFileSync(page.source, $.html());
}
console.log(`Navigation, breadcrumbs and contextual links updated in ${pages.length} HTML sources. Build does not run this command.`);
