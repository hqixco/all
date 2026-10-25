export const pageRedirects = {
  '/osteklenie-kottedzhey/': '/okna-v-chastnyj-dom/',
};

export function redirectTarget(pathname) {
  const normalized = pathname.replace(/\/index\.html$/, '/').replace(/\/?$/, '/');
  return pageRedirects[normalized];
}
