import { readdir, readFile, stat, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const assetsDir = path.join(root, 'public', 'assets');
const referenceFiles = [
  'scripts/generate-service-pages.mjs',
  'pristroyki/index.html',
  'remont-krovli/index.html',
  'zamena-krovli/index.html',
  'otmostki/index.html',
  'zamena-vencov/index.html',
  'dostroit-vtoroy-etazh/index.html',
  'index.html'
].map((file) => path.join(root, file));

function targetWidth(name, width) {
  if (name.startsWith('hero-')) return Math.min(width, 1920);
  if (name.includes('-case-') || name.startsWith('case-')) return Math.min(width, 1100);
  if (name.includes('-review-') || name.startsWith('review-')) return Math.min(width, 640);
  if (name.includes('-quiz-') || name.startsWith('quiz-')) return Math.min(width, 520);
  if (name.includes('-scope-') || name.startsWith('scope-')) return Math.min(width, 800);
  if (name.includes('-risk-') || name.startsWith('risk-')) return Math.min(width, 800);
  if (name.includes('-type-') || name.includes('-card')) return Math.min(width, 800);
  return Math.min(width, 1000);
}

function webpQuality(name) {
  if (name.startsWith('hero-')) return 78;
  if (name.includes('-case-')) return 76;
  if (name.includes('-review-')) return 74;
  if (name.includes('-quiz-')) return 72;
  return 75;
}

async function replaceReferences(mapping) {
  for (const file of referenceFiles) {
    let content;
    try {
      content = await readFile(file, 'utf8');
    } catch {
      continue;
    }

    let next = content;
    for (const [from, to] of mapping) {
      next = next.replaceAll(from, to);
    }

    if (next !== content) {
      await writeFile(file, next);
    }
  }
}

const entries = await readdir(assetsDir, { withFileTypes: true });
const pngFiles = entries
  .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.png'))
  .map((entry) => entry.name);

const mapping = new Map();
const results = [];

for (const name of pngFiles) {
  const source = path.join(assetsDir, name);
  const original = await stat(source);
  if (original.size < 100 * 1024) continue;

  const metadata = await sharp(source).metadata();
  if (metadata.hasAlpha) continue;

  const nextName = name.replace(/\.png$/i, '.webp');
  const target = path.join(assetsDir, nextName);
  const width = targetWidth(name, metadata.width ?? 0);
  const image = sharp(source).rotate();
  const resized = width && metadata.width && metadata.width > width
    ? image.resize({ width, withoutEnlargement: true })
    : image;

  await resized.webp({ quality: webpQuality(name), effort: 5 }).toFile(target);
  const optimized = await stat(target);
  mapping.set(name, nextName);
  results.push({
    name,
    nextName,
    before: original.size,
    after: optimized.size,
    width: metadata.width,
    height: metadata.height,
    targetWidth: width
  });
}

await replaceReferences(mapping);

for (const { name } of results) {
  await unlink(path.join(assetsDir, name));
}

const before = results.reduce((sum, item) => sum + item.before, 0);
const after = results.reduce((sum, item) => sum + item.after, 0);
const saved = before - after;

console.table(results.map((item) => ({
  file: item.nextName,
  fromKB: Math.round(item.before / 1024),
  toKB: Math.round(item.after / 1024),
  width: `${item.width}->${item.targetWidth}`,
  savedPct: `${Math.round((1 - item.after / item.before) * 100)}%`
})));
console.log(`Optimized ${results.length} images`);
console.log(`Before: ${(before / 1048576).toFixed(2)} MB`);
console.log(`After: ${(after / 1048576).toFixed(2)} MB`);
console.log(`Saved: ${(saved / 1048576).toFixed(2)} MB`);
