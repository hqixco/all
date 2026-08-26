import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const assetsDir = path.join(root, 'public', 'assets');
const textTargets = [
  path.join(root, 'pristroyki', 'index.html'),
  path.join(root, 'otmostki', 'index.html'),
  path.join(root, 'src', 'styles.css'),
  path.join(root, 'src', 'main.js')
];

const rasterExtensions = new Set(['.png', '.jpg', '.jpeg', '.webp']);
const assetPattern = /\/assets\/([^"')\s]+\.(?:png|jpe?g|webp))/gi;

function planFor(fileName) {
  if (fileName.startsWith('hero-')) {
    return { width: 2200, height: 1320, fit: 'cover', format: 'webp', quality: 82 };
  }

  if (fileName.startsWith('case-')) {
    return { width: 900, height: 620, fit: 'cover', format: 'webp', quality: 78 };
  }

  if (fileName.startsWith('review-') || fileName.startsWith('public-review-')) {
    return { width: 560, height: 420, fit: 'cover', format: 'webp', quality: 76 };
  }

  if (fileName.startsWith('task-')) {
    return { width: 720, height: 520, fit: 'cover', format: 'webp', quality: 78 };
  }

  if (fileName.startsWith('quiz-')) {
    return { width: 520, height: 380, fit: 'cover', format: 'webp', quality: 76 };
  }

  if (fileName.includes('photo-estimate') || fileName.includes('collage')) {
    return { width: 520, height: 520, fit: 'cover', format: 'webp', quality: 78 };
  }

  if (fileName.includes('approval-step') || fileName.startsWith('guarantee-step-')) {
    return { width: 520, height: 520, fit: 'cover', format: 'webp', quality: 78 };
  }

  if (fileName.includes('estimate-sheet')) {
    return { width: 860, fit: 'inside', format: 'webp', quality: 80 };
  }

  if (fileName === 'estimator-manager-photo-new.png' || fileName === 'estimator-manager-photo-new.webp') {
    return { width: 760, height: 900, fit: 'cover', format: 'webp', quality: 78 };
  }

  if (fileName === 'logo-mos-krovlya-24.png') {
    return { width: 260, fit: 'inside', format: 'png' };
  }

  if (fileName.includes('favicon') || fileName.includes('apple-touch-icon')) {
    return { format: 'png' };
  }

  return { width: 1200, fit: 'inside', format: 'webp', quality: 78 };
}

async function collectReferencedAssets() {
  const names = new Set();

  for (const target of textTargets) {
    const content = await fs.readFile(target, 'utf8');
    for (const match of content.matchAll(assetPattern)) {
      names.add(match[1]);
    }
  }

  return [...names].filter((fileName) => rasterExtensions.has(path.extname(fileName).toLowerCase()));
}

async function optimizeOne(fileName) {
  const inputPath = path.join(assetsDir, fileName);
  const ext = path.extname(fileName).toLowerCase();
  const plan = planFor(fileName);
  const outputExt = plan.format === 'png' ? '.png' : '.webp';
  const outputName = path.basename(fileName, ext) + outputExt;
  const outputPath = path.join(assetsDir, outputName);

  let before;
  try {
    before = (await fs.stat(inputPath)).size;
  } catch {
    return { fileName, missing: true };
  }

  const input = await fs.readFile(inputPath);
  const metadata = await sharp(input).metadata();
  let pipeline = sharp(input, { animated: false }).rotate();

  if (plan.width || plan.height) {
    pipeline = pipeline.resize({
      width: plan.width,
      height: plan.height,
      fit: plan.fit,
      position: 'center',
      withoutEnlargement: true
    });
  }

  if (plan.format === 'png') {
    pipeline = pipeline.png({ compressionLevel: 9, effort: 10, palette: true, quality: 86 });
  } else {
    pipeline = pipeline.webp({ quality: plan.quality ?? 78, effort: 6, smartSubsample: true });
  }

  const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });
  const after = data.byteLength;

  if (outputName === fileName && after >= before) {
    return {
      fileName,
      outputName,
      before,
      after: before,
      skipped: true,
      from: `${metadata.width}x${metadata.height}`,
      to: `${metadata.width}x${metadata.height}`
    };
  }

  await fs.writeFile(outputPath, data);
  if (outputName !== fileName) {
    await fs.rm(inputPath, { force: true });
  }

  return {
    fileName,
    outputName,
    before,
    after,
    skipped: false,
    from: `${metadata.width}x${metadata.height}`,
    to: `${info.width}x${info.height}`
  };
}

async function replaceReferences(replacements) {
  if (replacements.size === 0) return;

  for (const target of textTargets) {
    let content = await fs.readFile(target, 'utf8');
    for (const [from, to] of replacements) {
      content = content.split(`/assets/${from}`).join(`/assets/${to}`);
    }
    await fs.writeFile(target, content);
  }
}

const assets = await collectReferencedAssets();
const replacements = new Map();
const results = [];

for (const fileName of assets) {
  const result = await optimizeOne(fileName);
  results.push(result);

  if (result.outputName && result.outputName !== result.fileName) {
    replacements.set(result.fileName, result.outputName);
  }
}

await replaceReferences(replacements);

const completed = results.filter((item) => !item.missing);
const totals = completed.reduce((acc, item) => {
  acc.before += item.before ?? 0;
  acc.after += item.after ?? 0;
  return acc;
}, { before: 0, after: 0 });

console.table(results.map((item) => ({
  file: item.fileName,
  output: item.outputName ?? '',
  from: item.from ?? '',
  to: item.to ?? '',
  beforeKb: item.before ? Math.round(item.before / 1024) : '',
  afterKb: item.after ? Math.round(item.after / 1024) : '',
  savedKb: item.before && item.after ? Math.round((item.before - item.after) / 1024) : '',
  skipped: Boolean(item.skipped),
  missing: Boolean(item.missing)
})));

console.log(`Optimized ${completed.length} files. Saved ${Math.round((totals.before - totals.after) / 1024)} KB (${Math.round((1 - totals.after / totals.before) * 100)}%).`);
