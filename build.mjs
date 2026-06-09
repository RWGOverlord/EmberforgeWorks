// build.mjs — production build for the static Emberforge Works site.
// Copies the site into dist/, minifying each HTML file (and its inline CSS/JS).
// Non-HTML assets (images, favicons, sitemap) are copied verbatim. The api/
// directory is intentionally left at the repo root — Vercel picks it up there.

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { minify } from 'html-minifier-terser';

const root = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(root, 'dist');

// Top-level entries that are never part of the published site.
const EXCLUDE = new Set([
  'node_modules', 'dist', '.git', 'api',
  'build.mjs', 'package.json', 'package-lock.json', 'vercel.json',
  '.gitignore', '.DS_Store',
]);

// Source/internal files that live in the repo but should not be served.
const isInternal = (name) => /\.(md|txt)$/i.test(name);

const minifyOptions = {
  collapseWhitespace: true,
  removeComments: true,
  removeRedundantAttributes: true,
  removeScriptTypeAttributes: true,
  removeStyleLinkTypeAttributes: true,
  useShortDoctype: true,
  minifyCSS: true,   // clean-css; no source maps emitted
  minifyJS: true,    // terser; no source maps emitted
};

let htmlCount = 0;
let assetCount = 0;

async function processDir(srcDir, destDir, isTopLevel = false) {
  await fs.mkdir(destDir, { recursive: true });
  const entries = await fs.readdir(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    const { name } = entry;
    if (isTopLevel && EXCLUDE.has(name)) continue;
    if (name === '.DS_Store') continue;

    const srcPath = path.join(srcDir, name);
    const destPath = path.join(destDir, name);

    if (entry.isDirectory()) {
      await processDir(srcPath, destPath);
    } else if (name.endsWith('.html')) {
      const html = await fs.readFile(srcPath, 'utf8');
      await fs.writeFile(destPath, await minify(html, minifyOptions));
      htmlCount++;
    } else if (isInternal(name)) {
      continue;
    } else {
      await fs.copyFile(srcPath, destPath);
      assetCount++;
    }
  }
}

await fs.rm(outDir, { recursive: true, force: true });
await processDir(root, outDir, true);
console.log(`Built dist/ — ${htmlCount} HTML pages minified, ${assetCount} assets copied.`);
