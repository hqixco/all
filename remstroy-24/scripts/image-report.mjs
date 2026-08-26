import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const assetsDir = path.resolve('public/assets');
const files = await fs.readdir(assetsDir);
const imageFiles = files.filter((file) => /\.(png|jpe?g|webp)$/i.test(file));

const rows = [];

for (const file of imageFiles) {
  const filePath = path.join(assetsDir, file);
  const stat = await fs.stat(filePath);
  const meta = await sharp(filePath).metadata();
  rows.push({
    file,
    width: meta.width,
    height: meta.height,
    format: meta.format,
    kb: Math.round(stat.size / 1024),
  });
}

rows.sort((a, b) => b.kb - a.kb);

for (const row of rows) {
  console.log(`${row.file}\t${row.width}x${row.height}\t${row.format}\t${row.kb} KB`);
}
