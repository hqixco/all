export const classMap = new Map(Object.entries({
  'about-text_brief': 'about-text__brief', 'about-text_title': 'about-text__title',
  'banner_sale': 'banner__sale', 'portfolio__slider_item': 'portfolio__slider-item',
  'html_contact': 'html__contact', 'html_content': 'html__content',
  'hamburger__1': 'hamburger__line--top', 'hamburger__2': 'hamburger__line--middle',
  'tSpoilerShort': 'spoiler', 'tSpoilerShort-text': 'spoiler__text', 'tSpoilerShort-btn': 'spoiler__button',
  'defBtn': 'button--default', 'defaultSkin': 'gallery--default-skin', 'mceListBox': 'form__select', 'mceText': 'form__text',
  'menu-item': 'menu__item', 'sub-menu': 'menu__submenu', 'menu-item-has-children': 'menu__item--has-children',
  'partners-slide': 'partners__slide', 'navigation-pipe': 'breadcrumbs__separator',
  'fancymodalcontent': 'modal__content', 'modaltitle': 'modal__title',
  'form-honeypot': 'form__honeypot', 'form-status': 'form__status',
  'current_page_ancestor': 'breadcrumbs__item--ancestor', 'current_page_parent': 'breadcrumbs__item--parent',
  'current_page_item': 'breadcrumbs__item--current', 'home_span': 'breadcrumbs__home',
  'breadcrumbs_home_span': 'breadcrumbs__home',
  'wpcf7-form': 'form', 'wpcf7-form-control': 'form__control', 'wpcf7-text': 'form__input',
  'wpcf7-tel': 'form__input', 'wpcf7-email': 'form__input', 'wpcf7-textarea': 'form__textarea',
  'wpcf7-validates-as-required': 'form__control--required', 'wpcf7-validates-as-tel': 'form__control--telephone',
  'wpcf7-acceptance': 'form__consent', 'wpcf7-list-item': 'form__consent-item',
  'wpcf7-list-item-label': 'form__consent-label', 'wpcf7-submit': 'form__submit',
  'wpcf7-form-control-wrap': 'form__field', 'wpcf7-response-output': 'form__response', 'wpcf7-spinner': 'form__spinner',
  'screen-reader-response': 'form__screen-reader', 'has-spinner': 'form__submit--loading',
  'slick-slide': 'carousel__slide', 'slick-slider': 'carousel', 'slick-initialized': 'carousel--initialized',
  'slick-track': 'carousel__track', 'slick-dots': 'carousel__pagination', 'slick-active': 'carousel__slide--active',
  'form-honeypot': 'form__honeypot', 'form-status': 'form__status', 'form__col': 'form__column',
}));

export function mapClass(name) {
  if (classMap.has(name)) return classMap.get(name);
  if (/^(?:page|post|category|tag|postid|page-id|image-id)-\d+$/.test(name)) return name.replace(/^(?:page-id|page|postid|post|category|tag|image-id)-/, 'page--id-');
  if (/^wp-image-/.test(name)) return name.replace('wp-image-', 'image--legacy-');
  if (/^menu-item-(type|object)-/.test(name)) return name.replace(/^menu-item-(type|object)-/, 'menu__item--$1-');
  if (/^page-template-/.test(name)) return name.replace('page-template-', 'page--template-');
  if (/^wpcf7-/.test(name)) return name.replace('wpcf7-', 'form__');
  if (/^aos-/.test(name)) return name.replace('aos-', 'animation--');
  if (/^cbox/.test(name)) return name.replace('cbox', 'gallery__');
  if (/^fancy/.test(name)) return name.replace('fancy', 'gallery__');
  if (/^comment-/.test(name)) return name.replace('comment-', 'comment__');
  if (/^cms-panel/.test(name)) return name.replace('cms-panel', 'panel__legacy');
  return name.replace(/(^|[^_])_([a-z0-9])/g, (_, prefix, char) => `${prefix}__${char}`).replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`);
}

export function isLegacyClass(name) {
  if (classMap.has(name)) return false;
  return /^(?:page|post|category|tag|postid|page-id|image-id|wp-image-|page-template-|menu-item-(?:\d+|type|object)-|aos-|cbox|fancy|comment-|cms-panel)/.test(name);
}
