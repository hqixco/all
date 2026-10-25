// Kitchen starting prices; dimensions and package options increase the estimate.
export function calculateWardrobePrice(length, height, type, packageName, extrasPrice = 0) {
  const base = { hinged: 90000, sliding: 130000, 'built-in': 180000 }[type];
  const material = { practical: 1, optimal: 1.32, designer: 1.65 }[packageName];
  return Math.round(base * Math.max(1, (length / 2000) * (height / 2400)) * material / 100) * 100 + extrasPrice;
}
