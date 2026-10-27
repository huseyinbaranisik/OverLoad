// Oyunu tek dosyaya paketler: index.html'deki yerel CSS ve JS dosyaları sayfanın içine gömülür.
//   node tools/build.mjs
// Çıktılar:
//   dist/overload.html   tek başına açılan sürüm (paylaşım, GitHub Pages); tutor hazır sorularla çalışır
//   aistudio/index.html  AI Studio sürümü: aynı sayfa + @google/genai importmap + index.tsx (Gemini köprüsü)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = f => fs.readFileSync(path.join(root, f.split('?')[0]), 'utf8');

let html = read('index.html')
  .replace(/<link rel="stylesheet" href="(css\/[^"]+)">/g, (_, f) => `<style>/* ${f.split('?')[0]} */\n${read(f)}</style>`)
  // gömülen JS içinde "</script" geçerse sayfayı erken kapatmasın
  .replace(/<script src="(js\/[^"]+)"><\/script>/g, (_, f) => `<script>/* ${f.split('?')[0]} */\n${read(f).replace(/<\/script/gi, '<\\/script')}</script>`);

const left = html.match(/(?:href|src)="(?:css|js)\/[^"]+"/g);
if (left) throw new Error(`Gömülmeyen dosya kaldı: ${left.join(', ')}`);

const out = (f, text) => { fs.mkdirSync(path.dirname(path.join(root, f)), { recursive: true }); fs.writeFileSync(path.join(root, f), text); console.log(`yazıldı: ${f} (${Math.round(text.length / 1024)} KB)`); };
out('dist/overload.html', html);
out('aistudio/index.html', html
  .replace('</head>', '<script type="importmap">{"imports":{"@google/genai":"https://esm.sh/@google/genai@1.21.0"}}</script>\n</head>')
  .replace('</body>', '<script type="module" src="/index.tsx"></script>\n</body>'));
