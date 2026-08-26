import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const assetsDir = path.join(root, 'public', 'assets');
const textTargets = [
  path.join(root, 'index.html'),
  path.join(root, 'src', 'styles.css'),
  path.join(root, 'src', 'main.js'),
  path.join(root, 'public', 'site.webmanifest'),
  path.join(root, 'remont-krovli', 'index.html'),
  path.join(root, 'remont-primykaniy', 'index.html'),
  path.join(root, 'ustranenie-protechek', 'index.html')
];

const rasterExtensions = new Set(['.png', '.jpg', '.jpeg', '.webp']);
const pngIconFiles = new Map([
  ['favicon-16.png', 16],
  ['favicon-32.png', 32],
  ['apple-touch-icon.png', 180],
  ['android-chrome-192.png', 192],
  ['android-chrome-512.png', 512]
]);

function imagePlan(fileName) {
  if (pngIconFiles.has(fileName)) {
    return { width: pngIconFiles.get(fileName), fit: 'inside', format: 'png' };
  }

  if (fileName === 'logo-krov-plus.png') {
    return { width: 260, fit: 'inside', format: 'png' };
  }

  if (fileName === 'android-chre-512.png') {
    return { width: 128, fit: 'inside', format: 'png' };
  }

  if (fileName === 'hero-background.png' || fileName === 'hero-background.webp') {
    return { width: 1800, height: 1100, fit: 'cover', format: 'webp', quality: 78 };
  }

  if (fileName === 'krov-plus-cover.png' || fileName === 'krov-plus-cover.webp') {
    return { width: 1600, height: 960, fit: 'cover', format: 'webp', quality: 78 };
  }

  if (fileName === 'hero-roof-master.png' || fileName === 'hero-roof-master.webp') {
    return { width: 760, height: 760, fit: 'cover', format: 'webp', quality: 78 };
  }

  if (fileName === 'hero-badge-bg.png' || fileName === 'hero-badge-bg.webp') {
    return { width: 420, height: 420, fit: 'inside', format: 'webp', quality: 76 };
  }

  if (fileName === 'estimator-manager-photo.png' || fileName === 'estimator-manager-photo.webp') {
    return { width: 720, height: 500, fit: 'cover', format: 'webp', quality: 78 };
  }

  if (fileName.startsWith('task-')) {
    return { width: 720, height: 520, fit: 'cover', format: 'webp', quality: 78 };
  }

  if (fileName.startsWith('quiz-area-') || fileName.startsWith('quiz-material-') || fileName.startsWith('quiz-full-') || fileName.startsWith('quiz-cover-') || fileName.startsWith('quiz-gutters-') || fileName.startsWith('quiz-insulation-') || fileName.startsWith('quiz-not-') || fileName.startsWith('quiz-metal-') || fileName.startsWith('quiz-profiled-') || fileName.startsWith('quiz-flexible-') || fileName.startsWith('quiz-standing-')) {
    return { width: 420, height: 315, fit: 'cover', format: 'webp', quality: 76 };
  }

  if (fileName.startsWith('price-material-')) {
    return { width: 220, height: 180, fit: 'cover', format: 'webp', quality: 76 };
  }

  if (fileName.startsWith('price-') && fileName.endsWith('-icon.png')) {
    return { width: 180, height: 180, fit: 'cover', format: 'webp', quality: 76 };
  }

  if (fileName.startsWith('scenario-')) {
    return { width: 720, height: 520, fit: 'cover', format: 'webp', quality: 78 };
  }

  if (fileName.startsWith('case-')) {
    return { width: 1200, height: 820, fit: 'cover', format: 'webp', quality: 78 };
  }

  if (fileName.startsWith('photo-estimate-collage-')) {
    return { width: 360, height: 360, fit: 'cover', format: 'webp', quality: 76 };
  }

  if (fileName.startsWith('guarantee-step-')) {
    return { width: 420, height: 420, fit: 'cover', format: 'webp', quality: 76 };
  }

  if (fileName === 'guarantee-document-sheet.png' || fileName === 'guarantee-document-sheet.webp' || fileName === 'guarantee-docs.png' || fileName === 'guarantee-docs.webp' || fileName === 'guarantees-estimate-sheet.png' || fileName === 'guarantees-estimate-sheet.webp' || fileName === 'Без имени-1.png') {
    return { width: 640, fit: 'inside', format: 'webp', quality: 78 };
  }

  if (fileName.startsWith('brigade-')) {
    return { width: 900, height: 760, fit: 'cover', format: 'webp', quality: 78 };
  }

  if (fileName.startsWith('team-roof-') || fileName === 'team-roof-work.png' || fileName === 'team-roof-work.webp') {
    return { width: 900, height: 675, fit: 'cover', format: 'webp', quality: 78 };
  }

  if (fileName.startsWith('public-project-')) {
    return { width: 1200, height: 820, fit: 'cover', format: 'webp', quality: 78 };
  }

  if (fileName.startsWith('public-review-') || fileName.startsWith('review-roof-')) {
    return { width: 520, height: 380, fit: 'cover', format: 'webp', quality: 76 };
  }

  if (fileName === 'reviews-source-yandex.png' || fileName === 'reviews-source-yandex.webp') {
    return { width: 200, fit: 'inside', format: 'webp', quality: 76 };
  }

  if (fileName === 'reviews-source-avito.png' || fileName === 'reviews-source-avito.webp') {
    return { width: 120, fit: 'inside', format: 'webp', quality: 76 };
  }

  return { width: 900, fit: 'inside', format: 'webp', quality: 78 };
}

async function replaceAssetReferences(replacements) {
  if (replacements.size === 0) return;

  await Promise.all(textTargets.map(async (target) => {
    let content;
    try {
      content = await fs.readFile(target, 'utf8');
    } catch {
      return;
    }

    for (const [from, to] of replacements) {
      content = content.split(from).join(to);
    }

    await fs.writeFile(target, content);
  }));
}

async function optimizeRaster(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  if (!rasterExtensions.has(ext)) return null;

  const inputPath = path.join(assetsDir, fileName);
  const plan = imagePlan(fileName);
  const outputExt = plan.format === 'png' ? '.png' : '.webp';
  const outputName = path.basename(fileName, ext) + outputExt;
  const outputPath = path.join(assetsDir, outputName);

  const before = (await fs.stat(inputPath)).size;
  const inputBuffer = await fs.readFile(inputPath);
  const metadata = await sharp(inputBuffer).metadata();

  let pipeline = sharp(inputBuffer, { animated: false }).rotate();

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
    pipeline = pipeline.png({
      compressionLevel: 9,
      effort: 10,
      palette: true,
      quality: 86
    });
  } else {
    pipeline = pipeline.webp({
      quality: plan.quality ?? 80,
      effort: 6,
      smartSubsample: true
    });
  }

  const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });
  const after = data.byteLength;

  if (after >= before && outputName === fileName) {
    return {
      fileName,
      outputName,
      before,
      after: before,
      skipped: true,
      width: metadata.width,
      height: metadata.height
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
    width: metadata.width,
    height: metadata.height,
    nextWidth: info.width,
    nextHeight: info.height
  };
}

const entries = await fs.readdir(assetsDir);
const replacements = new Map();
const results = [];

for (const fileName of entries) {
  const result = await optimizeRaster(fileName);
  if (!result) continue;

  results.push(result);

  if (result.outputName !== result.fileName) {
    replacements.set(`/assets/${result.fileName}`, `/assets/${result.outputName}`);
  }
}

await replaceAssetReferences(replacements);

const totals = results.reduce((acc, item) => {
  acc.before += item.before;
  acc.after += item.after;
  return acc;
}, { before: 0, after: 0 });

console.table(results.map((item) => ({
  file: item.fileName,
  output: item.outputName,
  from: `${item.width}x${item.height}`,
  to: item.nextWidth ? `${item.nextWidth}x${item.nextHeight}` : `${item.width}x${item.height}`,
  beforeKb: Math.round(item.before / 1024),
  afterKb: Math.round(item.after / 1024),
  savedKb: Math.round((item.before - item.after) / 1024),
  skipped: item.skipped
})));

console.log(`Saved ${Math.round((totals.before - totals.after) / 1024)} KB (${Math.round((1 - totals.after / totals.before) * 100)}%).`);
