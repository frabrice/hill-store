/**
 * Image optimiser.
 *
 * Source photography arrives as huge PNGs/JPEGs. Most of our buyers are on a
 * phone paying for mobile data in Kigali, so nothing ships without going
 * through here first: transparent margin trimmed, resized, converted to WebP.
 *
 *   node scripts/optimise-image.mjs public/brand/hero-baby.png hero-baby 700 1100
 */
import sharp from 'sharp';
import path from 'node:path';

const [src, name, ...widths] = process.argv.slice(2);

if (!src || !name) {
  console.error('usage: node scripts/optimise-image.mjs <src> <out-name> [widths...]');
  process.exit(1);
}

const sizes = widths.length ? widths.map(Number) : [700, 1100];
const outDir = path.dirname(src);

const meta = await sharp(src).metadata();
console.log(`source ${meta.width}x${meta.height}  alpha:${meta.hasAlpha}`);

// Trim the empty transparent border so the subject fills its box.
const base = sharp(src).trim({ threshold: 10 });

for (const width of sizes) {
  const file = path.join(outDir, `${name}-${width}.webp`);
  const info = await base
    .clone()
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 82, effort: 6 })
    .toFile(file);

  console.log(
    `  ${path.basename(file)}  ${info.width}x${info.height}  ${Math.round(info.size / 1024)}KB`,
  );
}
