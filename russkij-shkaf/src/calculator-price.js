const baseArea = 1000 * 2400;
const largeArea = 2400 * 2600;

export function calculateWardrobePrice(width, height, type, packageName, extrasPrice = 0) {
  const sizeProgress = Math.max(0, (width * height - baseArea) / (largeArea - baseArea));
  const startingPrice = {
    hinged: 27900,
    sliding: 27900 * 1.1,
    'built-in': 59900,
  }[type];

  let price = startingPrice + (89900 - 27900) * sizeProgress;
  if (packageName === 'optimal') price *= 119000 / 89900;
  if (packageName === 'designer') {
    price = 89900 + (148000 - 89900) * sizeProgress + (startingPrice - 27900);
  }

  return Math.round(price / 100) * 100 + extrasPrice;
}
