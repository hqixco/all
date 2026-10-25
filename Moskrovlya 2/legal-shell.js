const headerRoot = document.querySelector("[data-legal-header]");
const footerRoot = document.querySelector("[data-legal-footer]");

function initYandexMetrika() {
  ((m, e, t, r, i, k, a) => {
    m[i] =
      m[i] ||
      function () {
        (m[i].a = m[i].a || []).push(arguments);
      };
    m[i].l = 1 * new Date();
    for (let j = 0; j < document.scripts.length; j += 1) {
      if (document.scripts[j].src === r) return;
    }
    k = e.createElement(t);
    a = e.getElementsByTagName(t)[0];
    k.async = true;
    k.src = r;
    a.parentNode.insertBefore(k, a);
  })(
    window,
    document,
    "script",
    "https://mc.yandex.ru/metrika/tag.js?id=111036091",
    "ym",
  );

  window.ym(111036091, "init", {
    ssr: true,
    webvisor: true,
    clickmap: true,
    ecommerce: "dataLayer",
    referrer: document.referrer,
    url: location.href,
    accurateTrackBounce: true,
    trackLinks: true,
  });
}

initYandexMetrika();

if (headerRoot) {
  headerRoot.innerHTML = `
    <nav class="logo_block site-header" id="heightOne">
      <div class="logo_wrap site-header__logo-wrap">
        <div class="left site-header__container">
          <a class="brand site-header__brand" href="/">
            <img class="brand__mark site-header__brand-mark" src="/images/logo-mos-krovlya-24-dark.png" alt="Логотип Мос Кровля 24" />
            <span class="brand__text site-header__brand-text"><strong class="site-header__emphasis">МОС<br class="site-header__line-break" />КРОВЛЯ <span class="brand__accent site-header__brand-accent">24</span></strong></span>
            <span class="brand__descriptor site-header__brand-descriptor">Частная строительная бригада в Москве и МО</span>
          </a>
        </div>
        <div class="right site-header__container">
          <div class="btn_top site-header__btn-top">
            <a class="green_btn calc site-header__btn-popup" href="/#calculator"><span class="mdelete site-header__text">Калькулятор крыши<br class="site-header__line-break" />за 1 минуту</span></a>
          </div>
          <div class="phone_top site-header__phone-top">
            <div class="phone site-header__phone"><a href="tel:+79190022389" class="site-header__link">+7 919 002-23-89</a></div>
            <div class="max-messenger site-header__max-messenger" aria-label="Мессенджеры">
              <a class="messenger-link messenger-link--max site-header__messenger-link" href="#" aria-label="Написать в MAX"><img src="/images/max-icon.svg" alt="" class="site-header__image" /><span class="site-header__text">MAX</span></a>
              <a class="messenger-link messenger-link--telegram site-header__messenger-link" href="https://t.me/stroydacha1ru" aria-label="Написать в Telegram"><img src="/images/telegram-icon.svg" alt="" class="site-header__image" /><span class="site-header__text">Telegram</span></a>
            </div>
          </div>
          <button class="burger site-header__burger" type="button" aria-label="Открыть меню" aria-controls="mobile-menu" aria-expanded="false"><span class="site-header__text"></span><span class="site-header__text"></span><span class="site-header__text"></span></button>
        </div>
      </div>
    </nav>
    <div class="free page__free" id="heightTwo"></div>
    <nav class="menu_top primary-nav" aria-label="Основная навигация">
      <div class="menu primary-nav__menu">
        <div class="block primary-nav__container"><a href="/" class="primary-nav__link">Главная</a></div>
        <div class="block primary-nav__container"><a href="/#services" class="primary-nav__link">Услуги</a></div>
        <div class="block primary-nav__container"><a href="/#calculator" class="primary-nav__link">Цены</a></div>
        <div class="block primary-nav__container"><a href="/#works" class="primary-nav__link">Наши работы</a></div>
        <div class="block primary-nav__container"><a href="/#contacts" class="primary-nav__link">Контакты</a></div>
      </div>
    </nav>
    <div class="burger_menu mobile-menu" id="mobile-menu">
      <div class="burger_menu_wrap mobile-menu__burger-menu-wrap">
        <div class="burger_menu_block mobile-menu__burger-menu-block">
          <div class="menu mobile-menu__menu">
            <ul class="mobile-menu__list">
              <li class="mobile-menu__item"><a href="/" class="mobile-menu__link">Главная</a></li>
              <li class="mobile-menu__item"><a href="/#services" class="mobile-menu__link">Услуги</a></li>
              <li class="mobile-menu__item"><a href="/#calculator" class="mobile-menu__link">Цены</a></li>
              <li class="mobile-menu__item"><a href="/#works" class="mobile-menu__link">Наши работы</a></li>
              <li class="mobile-menu__item"><a href="/#contacts" class="mobile-menu__link">Контакты</a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>`;
}

if (footerRoot) {
  footerRoot.innerHTML = `
    <footer class="footer site-footer">
      <div class="footer_brick site-footer__footer-brick"></div>
      <div class="footer_wrap site-footer__footer-wrap">
        <div class="left site-footer__container">
          <div class="logo site-footer__logo">
            <div class="site-footer__container"><img src="/images/logo-mos-krovlya-24.png" alt="Логотип Мос Кровля 24" class="site-footer__image" /></div>
            <div class="brand-title site-footer__brand-title"><a href="/" class="site-footer__link"><strong class="site-footer__emphasis">МОС<br class="site-footer__line-break" />КРОВЛЯ <span class="site-footer__text">24</span></strong></a></div>
          </div>
          <div class="info site-footer__info">Качественные кровельные работы под ключ в Москве и Московской области в любую погоду и время года, официальная гарантия на работы 5 лет.</div>
          <div class="btn_bottom site-footer__btn-bottom"><a class="green_btn calc ldbtn site-footer__btn-popup" href="/#calculator">Калькулятор кровельных работ<br class="mdelete site-footer__line-break" />за 1 минуту +</a></div>
        </div>
        <div class="center site-footer__center">
          <div class="title site-footer__title">С гарантией 5 лет</div>
          <div class="menu site-footer__menu">
            <ul class="site-footer__list">
              <li class="site-footer__item"><a href="/#services" class="site-footer__link">Все услуги</a></li>
              <li class="site-footer__item"><a href="/#works" class="site-footer__link">Наши работы</a></li>
              <li class="site-footer__item"><a href="/#calculator" class="site-footer__link">Цена работ</a></li>
              <li class="site-footer__item"><a href="/#contacts" class="site-footer__link">Контакты</a></li>
            </ul>
          </div>
        </div>
        <div class="right site-footer__container">
          <div class="phone site-footer__phone"><a href="tel:+79190022389" class="site-footer__link">+7 919 002-23-89</a></div>
          <div class="contacts site-footer__contacts">
            <div class="adres site-footer__adres">Москва и Московская область</div>
            <div class="worktime site-footer__worktime">Ежедневно с 8:00 до 21:00</div>
          </div>
          <div class="messenger max-messenger site-footer__messenger" aria-label="Мессенджеры">
            <a class="messenger-link messenger-link--max site-footer__messenger-link" href="#" aria-label="Написать в MAX"><img src="/images/max-icon.svg" alt="" class="site-footer__image" /><span class="site-footer__text">MAX</span></a>
            <a class="messenger-link messenger-link--telegram site-footer__messenger-link" href="https://t.me/stroydacha1ru" aria-label="Написать в Telegram"><img src="/images/telegram-icon.svg" alt="" class="site-footer__image" /><span class="site-footer__text">Telegram</span></a>
          </div>
        </div>
      </div>
      <div class="footer_privacy site-footer__footer-privacy">
        <div class="line site-footer__line"></div>
        <div class="site-footer__legal-links"><a href="/politika-konfidentsialnosti/" class="site-footer__link">Политика конфиденциальности</a><a href="/cookie/" class="site-footer__link">Политика cookie</a></div>
        <span class="site-footer__text">Информация на сайте не является публичной офертой. Стоимость и сроки уточняются после осмотра объекта.</span>
      </div>
    </footer>`;
}
