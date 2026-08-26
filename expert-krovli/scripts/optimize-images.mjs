import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const textTargets = [
  'index.html',
  'src/styles.css',
  'src/main.js',
  'politika-konfidentsialnosti/index.html',
  'cookie/index.html',
  'zamena-shifera/index.html',
  'zamena-krovli-na-profnastil/index.html',
  'zamena-krovli-na-metallocherepitsu/index.html',
  'rekonstruktsiya-staroj-kryshi/index.html',
].map((file) => path.join(root, file));

const rasterExtensions = new Set(['.png', '.jpg', '.jpeg', '.webp']);
const directories = [
  path.join(root, 'src', 'assets'),
  path.join(root, 'public', 'quiz-assets'),
];

const renameMap = new Map();

function planFor(fileName, directory) {
  const targetName = renameMap.get(fileName) ?? fileName;

  if (directory.endsWith(`${path.sep}quiz-assets`)) {
    return { targetName: targetName.replace(/\.(png|jpe?g)$/i, '.webp'), width: 420, height: 315, fit: 'cover', quality: 76 };
  }

  if (targetName.startsWith('case-roof-')) {
    return { targetName, width: 760, height: 520, fit: 'cover', quality: 78 };
  }

  if (targetName.startsWith('review-')) {
    return { targetName, width: 520, height: 380, fit: 'cover', quality: 76 };
  }

  if (targetName === 'hero-roof-replacement.webp') {
    return { targetName, width: 1800, height: 1100, fit: 'cover', quality: 78 };
  }

  if (targetName === 'crew-foreman-sergey.webp') {
    return { targetName, width: 180, height: 180, fit: 'cover', quality: 80 };
  }

  if (targetName.startsWith('crew-')) {
    return { targetName, width: 820, height: 620, fit: 'cover', quality: 78 };
  }

  if (targetName === 'materials-consultation.webp') {
    return { targetName, width: 520, height: 520, fit: 'inside', quality: 78 };
  }

  if (targetName.startsWith('service-')) {
    return { targetName: targetName.replace(/\.(png|jpe?g)$/i, '.webp'), width: 720, height: 520, fit: 'cover', quality: 78 };
  }

  if (targetName.startsWith('quiz-') || targetName.startsWith('material-')) {
    return { targetName: targetName.replace(/\.(png|jpe?g)$/i, '.webp'), width: 520, height: 380, fit: 'cover', quality: 76 };
  }

  if (targetName.startsWith('pricing-')) {
    return { targetName: targetName.replace(/\.(png|jpe?g)$/i, '.webp'), width: 420, height: 315, fit: 'cover', quality: 76 };
  }

  if (targetName.startsWith('e-krovlya-logo')) {
    return { targetName, width: 320, fit: 'inside', format: 'png' };
  }

  return { targetName: targetName.replace(/\.(png|jpe?g)$/i, '.webp'), width: 900, fit: 'inside', quality: 78 };
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function replaceReferences(replacements) {
  for (const target of textTargets) {
    if (!(await fileExists(target))) continue;
    let content = await fs.readFile(target, 'utf8');
    for (const [from, to] of replacements) {
      content = content.split(from).join(to);
    }
    await fs.writeFile(target, content);
  }
}

async function optimizeFile(directory, fileName) {
  const ext = path.extname(fileName).toLowerCase();
  if (!rasterExtensions.has(ext)) return null;

  const inputPath = path.join(directory, fileName);
  const plan = planFor(fileName, directory);
  const outputExt = plan.format === 'png' ? '.png' : '.webp';
  const targetName = path.extname(plan.targetName) ? plan.targetName : `${path.basename(plan.targetName, ext)}${outputExt}`;
  const normalizedTargetName = plan.format === 'png' ? targetName.replace(/\.(webp|jpe?g)$/i, '.png') : targetName.replace(/\.(png|jpe?g)$/i, '.webp');
  const outputPath = path.join(directory, normalizedTargetName);
  const before = (await fs.stat(inputPath)).size;

  const input = await fs.readFile(inputPath);
  const original = await sharp(input).metadata();
  let pipeline = sharp(input, { animated: false }).rotate();

  if (plan.width || plan.height) {
    pipeline = pipeline.resize({
      width: plan.width,
      height: plan.height,
      fit: plan.fit,
      position: 'center',
      withoutEnlargement: true,
    });
  }

  if (plan.format === 'png') {
    pipeline = pipeline.png({ compressionLevel: 9, effort: 10, palette: false });
  } else {
    pipeline = pipeline.webp({ quality: plan.quality ?? 78, effort: 6, smartSubsample: true });
  }

  const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });
  const after = data.byteLength;

  if (normalizedTargetName === fileName && after >= before) {
    return { fileName, outputName: fileName, before, after: before, original, output: original, skipped: true };
  }

  await fs.writeFile(outputPath, data);
  if (normalizedTargetName !== fileName) {
    await fs.rm(inputPath, { force: true });
  }

  return { fileName, outputName: normalizedTargetName, before, after, original, output: info, skipped: false };
}

const replacements = new Map();
const results = [];

for (const directory of directories) {
  if (!(await fileExists(directory))) continue;
  const files = await fs.readdir(directory);

  for (const fileName of files) {
    const result = await optimizeFile(directory, fileName);
    if (!result) continue;

    results.push({ directory, ...result });

    if (result.fileName !== result.outputName) {
      const fromSrc = `/src/assets/${result.fileName}`;
      const toSrc = `/src/assets/${result.outputName}`;
      const fromCss = `./assets/${result.fileName}`;
      const toCss = `./assets/${result.outputName}`;
      const fromPublic = `/quiz-assets/${result.fileName}`;
      const toPublic = `/quiz-assets/${result.outputName}`;

      replacements.set(fromSrc, toSrc);
      replacements.set(fromCss, toCss);
      replacements.set(fromPublic, toPublic);
    }
  }
}

await replaceReferences(replacements);

const totals = results.reduce(
  (acc, item) => {
    acc.before += item.before;
    acc.after += item.after;
    return acc;
  },
  { before: 0, after: 0 },
);

console.table(
  results
    .filter((item) => !item.skipped || item.before > 100_000)
    .map((item) => ({
      file: item.fileName,
      output: item.outputName,
      from: `${item.original.width}x${item.original.height}`,
      to: `${item.output.width}x${item.output.height}`,
      beforeKb: Math.round(item.before / 1024),
      afterKb: Math.round(item.after / 1024),
      savedKb: Math.round((item.before - item.after) / 1024),
    })),
);

console.log(`Saved ${Math.round((totals.before - totals.after) / 1024)} KB (${Math.round((1 - totals.after / totals.before) * 100)}%).`);
