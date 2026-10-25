const prefixes = {
 'okna-v-kvartiru': 'apartment', 'okna-v-chastnyj-dom': 'house', 'okna-na-dachu': 'dacha',
 'osteklenie-verand-terras': 'terrace', 'panoramnye-okna': 'panoramic', 'laminirovannye-okna': 'laminated',
 'balkonnye-bloki': 'balcony-block', 'dveri-pvh': 'door', 'moskitnye-setki': 'mosquito',
 'holodnoe-osteklenie-balkonov': 'cold-balcony', 'teploe-osteklenie-balkonov': 'warm-balcony',
 'otdelka-balkonov': 'balcony-finishing', 'montazh-okon': 'installation', 'ceny': 'prices',
 'rassrochka': 'installment', 'garantiya': 'warranty', 'o-kompanii': 'company', 'kontakty': 'contacts',
 'portfolio': 'portfolio', 'balkony': 'balcony',
 'cookie': 'cookie', 'politika-konfidentsialnosti': 'privacy', '404.html': 'not-found'
};
export function scopeSections(html, slug, blocks, prefix = prefixes[slug]) {
 if (!prefix) throw new Error('Missing section prefix: ' + slug);
 blocks ||= ({cookie:['definition','types','purpose','analytics','consent','settings','contacts'], 'politika-konfidentsialnosti':['general','data','purpose','legal-basis','processing','third-parties','cookies','rights','updates']})[slug];
 const seen = new Set();
 let index = 0;
 return html.replace(/<section\b([^>]*)>/g, (tag, attributes) => {
  const classes = attributes.match(/class="([^"]*)"/)?.[1].split(/\s+/) || [];
  let block = blocks?.[index++] || attributes.match(/id="([^"]+)"/)?.[1] || classes[0]?.replace(/^(home-|seo-)/,'').replace(/-section$/,'').replace(/-banner$/,'') || 'content';
  let name = prefix + '-' + block;
  if (seen.has(name)) name = prefix + '-legacy-' + block;
  if (seen.has(name)) throw new Error('Duplicate section: ' + name);
  seen.add(name);
  if (classes.includes(name)) return tag;
  return classes.length ? tag.replace(/class="([^"]*)"/, `class="$1 ${name}"`) : tag.replace('<section', `<section class="${name}"`);
 });
}
