import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const assetsDir = path.join(root, 'public', 'assets');
const textTargets = [
  path.join(root, 'index.html'),
  path.join(root, 'src', 'styles.css'),
  path.join(root, 'src', 'main.js')
];

const rasterExtensions = new Set(['.png', '.jpg', '.jpeg', '.webp']);

function imagePlan(fileName) {
  if (fileName === 'logo-mos-krovlya-24.png') {
    return { width: 260, fit: 'inside', format: 'png' };
  }

  if (fileName === 'mos-krovlya-24-cover.png' || fileName === 'mos-krovlya-24-cover.webp') {
    return { width: 2400, height: 1440, fit: 'cover', format: 'webp', quality: 90 };
  }

  if (fileName.startsWith('task-')) {
    return { width: 720, height: 520, fit: 'cover', format: 'webp', quality: 80 };
  }

  if (fileName.startsWith('photo-estimate-collage-')) {
    return { width: 520, height: 520, fit: 'cover', format: 'webp', quality: 80 };
  }

  if (fileName.startsWith('guarantee-step-')) {
    return { width: 520, height: 520, fit: 'cover', format: 'webp', quality: 80 };
  }

  if (fileName.startsWith('brigade-')) {
    return { width: 900, height: 760, fit: 'cover', format: 'webp', quality: 80 };
  }

  if (fileName === 'guarantees-estimate-sheet.png') {
    return { width: 860, fit: 'inside', format: 'webp', quality: 82 };
  }

  if (fileName.startsWith('public-project-')) {
    return { width: 1200, height: 820, fit: 'cover', format: 'webp', quality: 78 };
  }

  if (fileName.startsWith('public-review-')) {
    return { width: 720, height: 520, fit: 'cover', format: 'webp', quality: 78 };
  }

  return { width: 1200, fit: 'inside', format: 'webp', quality: 80 };
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
