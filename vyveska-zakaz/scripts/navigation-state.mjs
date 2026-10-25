const origin = 'https://xn----7sbbagavscye2ftg.xn--p1ai';
const normalize = path => path.replace(/\/+$/,'') + '/';
export function markNavigation($, currentUrl, pages) {
  const nav = $('.root__head .site-nav');
  nav.find('a[aria-current]').removeAttr('aria-current');
  nav.find('.site-nav__group--active').removeClass('site-nav__group--active');
  const links = nav.find('a[href]').toArray();
  const matching = url => links.find(node => {
    const target = new URL($(node).attr('href'), origin);
    return target.origin === origin && !target.hash && normalize(target.pathname) === normalize(url);
  });
  let target = matching(currentUrl);
  let state = 'page';
  if (!target) {
    let page = pages.find(page => page.url === currentUrl);
    const seen = new Set();
    while (page?.parent && !seen.has(page.parent)) {
      seen.add(page.parent);
      target = matching(page.parent);
      if (target) { state = 'location'; break; }
      page = pages.find(candidate => candidate.url === page.parent);
    }
  }
  if (target) {
    $(target).attr('aria-current', state);
    $(target).closest('.site-nav__group').addClass('site-nav__group--active');
  }
  return target ? {href:$(target).attr('href'),state} : null;
}
