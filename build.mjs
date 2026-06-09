// build.mjs — production build for the static Emberforge Works site.
//
// For every HTML page it:
//   1. extracts the inline <style> block, minifies it, and writes it to a
//      content-hashed file under /_assets, replacing it with a <link>.
//   2. extracts each inline <script> (classic JS, not external, not JSON),
//      minifies it, writes it to a content-hashed file, and swaps in a
//      <script src>. Execution stays in document order with blocking
//      semantics, so global functions referenced by inline handlers and by
//      sibling scripts keep working exactly as before.
//   3. minifies the remaining HTML shell.
//
// Identical assets across pages share one hashed file (so the design-system
// CSS and shared scripts are downloaded once and cached). No source maps are
// emitted. The api/ directory is left at the repo root for Vercel.

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { minify as minifyHtml } from 'html-minifier-terser';
import { minify as minifyJs } from 'terser';
import CleanCSS from 'clean-css';

const root = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(root, 'dist');
const ASSETS_DIR = '_assets';

// Top-level entries that are never part of the published site.
const EXCLUDE = new Set([
  'node_modules', 'dist', '.git', 'api',
  'build.mjs', 'package.json', 'package-lock.json', 'vercel.json',
  '.gitignore', '.DS_Store',
]);
const isInternal = (name) => /\.(md|txt)$/i.test(name);

const cleanCss = new CleanCSS({ returnPromise: false });
const assets = new Map(); // filename -> contents (deduped by content hash)

function emitAsset(content, ext) {
  const hash = createHash('sha256').update(content).digest('hex').slice(0, 10);
  const file = `${hash}.${ext}`;
  assets.set(file, content);
  return `/${ASSETS_DIR}/${file}`;
}

async function replaceAsync(str, regex, fn) {
  const tasks = [];
  str.replace(regex, (...args) => (tasks.push(fn(...args)), ''));
  const results = await Promise.all(tasks);
  let i = 0;
  return str.replace(regex, () => results[i++]);
}

async function transformHtml(html) {
  // 1. inline <style> -> external hashed stylesheet
  html = await replaceAsync(html, /<style\b[^>]*>([\s\S]*?)<\/style>/gi, async (_m, css) => {
    const out = cleanCss.minify(css);
    if (out.errors.length) throw new Error(`CSS minify failed: ${out.errors.join('; ')}`);
    return `<link rel="stylesheet" href="${emitAsset(out.styles, 'css')}">`;
  });

  // 2. inline classic <script> -> external hashed script (skip src= and non-JS types)
  html = await replaceAsync(html, /<script\b([^>]*)>([\s\S]*?)<\/script>/gi, async (m, attrs, code) => {
    if (/\bsrc\s*=/i.test(attrs)) return m;
    if (/\btype\s*=\s*["'](?!\s*(text\/javascript|application\/javascript|module)\s*["'])/i.test(attrs)) return m;
    if (!code.trim()) return m;
    const res = await minifyJs(code, { compress: true, mangle: true, format: { comments: false } });
    if (res.error) throw res.error;
    return `<script${attrs} src="${emitAsset(res.code, 'js')}"></script>`;
  });

  // 3. minify the remaining HTML shell
  return minifyHtml(html, {
    collapseWhitespace: true,
    removeComments: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    useShortDoctype: true,
    minifyCSS: true, // any leftover style="" attributes
    minifyJS: false, // inline JS already extracted above
  });
}

let htmlCount = 0;
let assetCopyCount = 0;

async function processDir(srcDir, destDir, isTopLevel = false) {
  await fs.mkdir(destDir, { recursive: true });
  for (const entry of await fs.readdir(srcDir, { withFileTypes: true })) {
    const { name } = entry;
    if (isTopLevel && EXCLUDE.has(name)) continue;
    if (name === '.DS_Store') continue;

    const srcPath = path.join(srcDir, name);
    const destPath = path.join(destDir, name);

    if (entry.isDirectory()) {
      await processDir(srcPath, destPath);
    } else if (name.endsWith('.html')) {
      await fs.writeFile(destPath, await transformHtml(await fs.readFile(srcPath, 'utf8')));
      htmlCount++;
    } else if (isInternal(name)) {
      continue;
    } else {
      await fs.copyFile(srcPath, destPath);
      assetCopyCount++;
    }
  }
}

await fs.rm(outDir, { recursive: true, force: true });
await processDir(root, outDir, true);

const assetsOut = path.join(outDir, ASSETS_DIR);
await fs.mkdir(assetsOut, { recursive: true });
for (const [file, content] of assets) {
  await fs.writeFile(path.join(assetsOut, file), content);
}

console.log(
  `Built dist/ — ${htmlCount} HTML pages minified, ` +
  `${assets.size} hashed CSS/JS assets emitted, ${assetCopyCount} static files copied.`
);
