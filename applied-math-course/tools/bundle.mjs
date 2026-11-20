// Builds Gradient.html: the whole course in ONE self-contained file (scripts, styles,
// math fonts and text fonts inlined) that you can save to any device and open offline.
// Run: node tools/bundle.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const dataUri = (p) => `data:font/woff2;base64,${fs.readFileSync(path.join(root, p)).toString('base64')}`;
// inline url(...) font references in a stylesheet, resolved relative to that stylesheet
const inlineCss = (p) => read(p).replace(/url\((['"]?)([^)'"]+\.woff2)\1\)/g, (_, q, u) => `url(${dataUri(path.join(path.dirname(p), u))})`).replace(/,?\s*url\([^)]+\.(woff|ttf)\)\s*format\(["'](woff|truetype)["']\)/g, '');
const safeJs = (s) => s.replace(/<\/script/gi, '<\\/script');

let html = read('index.html')
  .replace(/<meta http-equiv="Content-Security-Policy"[^>]*>\s*/i, '')
  .replace(/<link rel="(manifest|apple-touch-icon)"[^>]*>\s*/g, '')
  .replace(/<link rel="icon"[^>]*>/, `<link rel="icon" href="data:image/svg+xml;base64,${Buffer.from(read('icons/icon.svg')).toString('base64')}">`)
  .replace(/<link rel="stylesheet" href="([^"]+)">/g, (_, href) => `<style>\n${inlineCss(href)}\n</style>`)
  .replace(/<script src="js\/install\.js"><\/script>\s*/, '')
  .replace(/<script src="([^"]+)"><\/script>/g, (_, src) => `<script>\n${safeJs(read(src))}\n</script>`);

if (/<(script|link)[^>]+(src|href)="(?!data:|https?:)/.test(html)) throw new Error('bundle still references an external file');
fs.writeFileSync(path.join(root, 'Gradient.html'), html);
console.log(`Gradient.html written (${(html.length / 1024 / 1024).toFixed(2)} MB, self-contained)`);
