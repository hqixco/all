import '../scss/main.scss';

import { initMenu, initCatalogCategorySort } from './modules/menu.js';
import { initModal } from './modules/modal.js';
import { initTabs } from './modules/tabs.js';
import { initAccordion } from './modules/accordion.js';
import { initSliders } from './modules/sliders.js';
import { initForms } from './modules/forms.js';
import { initQuantitySteppers } from './modules/quantity-stepper.js';
import { initProductGallery } from './modules/product-gallery.js';
import { initProductPrices } from './modules/product-prices.js';
import { initProductCardTitles, initProductCardNavigation } from './modules/product-card.js';
import {
  initNewsCardTitles,
  initNewsCardNavigation,
  initPromotionsCardTitles,
} from './modules/news-card.js';
import { initDeliveryCalculation } from './modules/delivery-calculation.js';
import { initCustomersPage } from './modules/customers-page.js';
import { initFavorites } from './modules/favorite.js';
import { initCatalogFilter } from './modules/catalog-filter.js';
import { initSearchPage } from './modules/search-page.js';
import { initDragScroll } from './modules/drag-scroll.js';

async function fetchInclude(path) {
  const candidates = [path, path.replace('/partials/', '/src/partials/')];

  for (const candidate of candidates) {
    const response = await fetch(candidate);
    if (response.ok) {
      return response.text();
    }
  }

  throw new Error(`Unable to load partial: ${path}`);
}

async function loadPartials() {
  const nodes = Array.from(document.querySelectorAll('[data-include]'));

  await Promise.all(
    nodes.map(async (node) => {
      const path = node.getAttribute('data-include');
      if (!path) return;
      node.innerHTML = await fetchInclude(path);
    }),
  );
}

async function bootstrap() {
  await loadPartials();

  initMenu();
  initCatalogCategorySort();
  initModal();
  initTabs();
  initAccordion();
  initSliders();
  initForms();
  initQuantitySteppers();
  initProductGallery();
  initProductPrices();
  initProductCardTitles();
  initProductCardNavigation();
  initNewsCardTitles();
  initNewsCardNavigation();
  initPromotionsCardTitles();
  initDeliveryCalculation();
  initCustomersPage();
  initFavorites();
  initCatalogFilter();
  initSearchPage();
  initDragScroll();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap, { once: true });
} else {
  bootstrap();
}
