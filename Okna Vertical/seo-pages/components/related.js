// Shared cards: edit a destination here to update every related block.
export const relatedCards = {
  "balkonnye-bloki": {
    "imageSrc": "/assets/related-balcony-block.webp",
    "imageWidth": "570",
    "imageHeight": "428",
    "imageAlt": "Балконные блоки",
    "href": "/balkonnye-bloki/",
    "titleHtml": "Балконные блоки",
    "descriptionHtml": "Окно и балконная дверь в одном комплекте. Подберём размеры, открывание и отделку проёма."
  },
  "moskitnye-setki": {
    "imageSrc": "/assets/related-mosquito-net.webp",
    "imageWidth": "570",
    "imageHeight": "428",
    "imageAlt": "Москитные сетки",
    "href": "/moskitnye-setki/",
    "titleHtml": "Москитные сетки",
    "descriptionHtml": "Сетки для новых и существующих окон: подходящее полотно, крепления и удобное снятие."
  },
  "montazh-okon": {
    "imageSrc": "/assets/related-window-installation.webp",
    "imageWidth": "570",
    "imageHeight": "428",
    "imageAlt": "Монтаж окон",
    "href": "/montazh-okon/",
    "titleHtml": "Монтаж окон",
    "descriptionHtml": "Подготовка проёма, крепление рамы и защита монтажного шва с учётом материала стен."
  },
  "ceny": {
    "imageSrc": "/assets/related-window-prices.webp",
    "imageWidth": "570",
    "imageHeight": "428",
    "imageAlt": "Цены на окна",
    "href": "/ceny/",
    "titleHtml": "Цены на окна",
    "descriptionHtml": "Стоимость изделий, монтажа и дополнительных работ — чтобы заранее оценить состав заказа."
  }
};

// Photos shared by every card linking to the same destination.
const relatedImages = {
  "garantiya": {"imageSrc":"/assets/related-warranty.webp","imageWidth":570,"imageHeight":380},
  "dveri-pvh": {"imageSrc":"/assets/related-house-pvc-door.webp","imageWidth":570,"imageHeight":428},
  "balkony": {
    "imageSrc": "/assets/related-balconies.webp",
    "imageWidth": 570,
    "imageHeight": 428
  },
  "holodnoe-osteklenie-balkonov": {
    "imageSrc": "/assets/related-cold-glazing.webp",
    "imageWidth": 570,
    "imageHeight": 428
  },
  "teploe-osteklenie-balkonov": {
    "imageSrc": "/assets/related-warm-glazing.webp",
    "imageWidth": 570,
    "imageHeight": 428
  },
  "otdelka-balkonov": {
    "imageSrc": "/assets/related-balcony-finishing.webp",
    "imageWidth": 570,
    "imageHeight": 428
  },
  "okna-v-kvartiru": {
    "imageSrc": "/assets/related-apartment-windows.webp",
    "imageWidth": 570,
    "imageHeight": 428
  },
  "okna-v-chastnyj-dom": {
    "imageSrc": "/assets/related-house-windows.webp",
    "imageWidth": 570,
    "imageHeight": 428
  },
  "okna-na-dachu": {
    "imageSrc": "/assets/related-dacha-windows.webp",
    "imageWidth": 570,
    "imageHeight": 428
  },
  "osteklenie-verand-terras": {
    "imageSrc": "/assets/related-terrace-glazing.webp",
    "imageWidth": 570,
    "imageHeight": 428
  },
  "panoramnye-okna": {
    "imageSrc": "/assets/related-panoramic-windows.webp",
    "imageWidth": 570,
    "imageHeight": 428
  },
  "laminirovannye-okna": {
    "imageSrc": "/assets/related-laminated-windows.webp",
    "imageWidth": 570,
    "imageHeight": 428
  }
};

export function relatedItem(slug, metadata) {
  if(relatedCards[slug])return {...relatedCards[slug]};
  const meta=metadata.find(page=>page.slug===slug);
  if(!meta)throw Error('Missing related page: '+slug);
  return {imageSrc:'/assets/'+meta.image,imageWidth:570,imageHeight:428,...relatedImages[slug],imageAlt:meta.name,href:'/'+slug+'/',titleHtml:meta.name,descriptionHtml:meta.lead};
}
