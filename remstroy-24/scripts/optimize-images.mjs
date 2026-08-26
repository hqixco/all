import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const assetsDir = path.resolve('public/assets');
const filesToRewrite = [
  path.resolve('pristroyki/index.html'),
  path.resolve('src/main.js'),
  path.resolve('src/styles.css'),
];

const targetWidthByPrefix = [
  [/^hero-/, 1600],
  [/^form-bg$/, 1400],
  [/^case-/, 1000],
  [/^scope-/, 800],
  [/^risk-/, 800],
  [/^type-/, 760],
  [/^review-/, 760],
  [/^team-/, 900],
];

function targetWidthFor(baseName, width) {
  const match = targetWidthByPrefix.find(([pattern]) => pattern.test(baseName));
  return Math.min(width, match ? match[1] : width);
}

async function convertImage(file) {
  const sourcePath = path.join(assetsDir, file);
  const extension = path.extname(file).toLowerCase();
  const baseName = path.basename(file, extension);

  if (!['.png', '.jpg', '.jpeg'].includes(extension)) {
    return null;
  }

  if (baseName === 'favicon') {
    return null;
  }

  const meta = await sharp(sourcePath).metadata();
  if (!meta.width) {
    return null;
  }

  const width = targetWidthFor(baseName, meta.width);
  const outputName = `${baseName}.webp`;
  const outputPath = path.join(assetsDir, outputName);

  await sharp(sourcePath)
    .rotate()
    .resize({
      width,
      withoutEnlargement: true,
    })
    .webp({
      quality: 78,
      effort: 6,
      smartSubsample: true,
    })
    .toFile(outputPath);

  const sourceStat = await fs.stat(sourcePath);
  const outputStat = await fs.stat(outputPath);

  if (outputStat.size < sourceStat.size) {
    await fs.unlink(sourcePath);
    return {
      from: file,
      to: outputName,
      before: sourceStat.size,
      after: outputStat.size,
      width,
    };
  }

  await fs.unlink(outputPath);
  return null;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function rewriteReferences(conversions) {
  for (const filePath of filesToRewrite) {
    let content = await fs.readFile(filePath, 'utf8');
    for (const conversion of conversions) {
      content = content.replace(
        new RegExp(escapeRegExp(conversion.from), 'g'),
        conversion.to,
      );
    }
    await fs.writeFile(filePath, content);
  }
}

const files = await fs.readdir(assetsDir);
const conversions = [];

for (const file of files) {
  const conversion = await convertImage(file);
  if (conversion) {
    conversions.push(conversion);
  }
}

await rewriteReferences(conversions);

const before = conversions.reduce((sum, item) => sum + item.before, 0);
const after = conversions.reduce((sum, item) => sum + item.after, 0);

for (const item of conversions) {
  const beforeKb = Math.round(item.before / 1024);
  const afterKb = Math.round(item.after / 1024);
  console.log(`${item.from} -> ${item.to}: ${beforeKb} KB -> ${afterKb} KB, width ${item.width}`);
}

console.log(`Converted ${conversions.length} files`);
console.log(`Total: ${Math.round(before / 1024)} KB -> ${Math.round(after / 1024)} KB`);
