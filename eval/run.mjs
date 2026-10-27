// Tutor eval betiği. Oyunun kendi dosyalarını (ajanlar, olaylar, tutor, vakalar) yükler; böylece
// modele giden talimat ve prompt, oyunun ve uygulama içi eval modunun gönderdiğiyle birebir aynıdır.
//
// Dokümanları üret (anahtar gerekmez):
//   node eval/run.mjs --export
// 20 vakayı Gemini'de çalıştır (Node 18+, ek paket gerekmez):
//   GEMINI_API_KEY=... node eval/run.mjs --system v1 --tag v1
//   GEMINI_API_KEY=... node eval/run.mjs --system v2 --tag v2
//   GEMINI_API_KEY=... node eval/run.mjs --system benim_talimatim.txt --tag v3 --model gemini-3.8-flash
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..');
const arg = (name, def) => { const i = process.argv.indexOf(`--${name}`); return i > -1 ? process.argv[i + 1] : def; };

const ctx = vm.createContext({ console, fetch });
for (const f of ['js/data/agents.js', 'js/data/story.js', 'js/data/incidents.js', 'js/tutor.js', 'js/data/eval-cases.js'])
  vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
const G = vm.runInContext('({ EVAL_CASES, EVAL_TYPES, EVAL_EXPECT, TUTOR_SYSTEMS, TUTOR_MODELS, LEVEL_LABEL, ROLES, evalSource, evalCtx, evalPrompt, evalCsv, geminiRest })', ctx);
const write = (name, text) => { fs.writeFileSync(path.join(here, name), text); console.log(`yazıldı: eval/${name}`); };

if (process.argv.includes('--export')) {
  for (const v of Object.keys(G.TUTOR_SYSTEMS)) write(`tutor_system_${v}.txt`, G.TUTOR_SYSTEMS[v] + '\n');
  write('cases.json', JSON.stringify(G.EVAL_CASES.map(cs => ({
    id: cs.id, type: G.EVAL_TYPES[cs.type], level: G.LEVEL_LABEL[cs.level], role: G.ROLES[cs.role],
    decision: G.evalSource(cs.ref).title, agent: cs.agent, student_message: cs.message, expected: G.EVAL_EXPECT[cs.type], prompt: G.evalPrompt(cs),
  })), null, 2) + '\n');
  const md = ['# Tutor eval vakaları', '', '> Bu dosya `node eval/run.mjs --export` ile `js/data/eval-cases.js`ten üretilir; elle düzenleme.', '',
    '| ID | Tür | Seviye | Rol | Karar | Ajan | Öğrenci mesajı |', '|---|---|---|---|---|---|---|',
    ...G.EVAL_CASES.map(cs => `| ${cs.id} | ${G.EVAL_TYPES[cs.type]} | ${G.LEVEL_LABEL[cs.level]} | ${G.ROLES[cs.role]} | ${G.evalSource(cs.ref).title} | ${cs.agent} | ${cs.message.replace(/\|/g, '\\|')} |`),
    '', '## Beklenen davranış (türe göre)', '', ...Object.keys(G.EVAL_TYPES).map(k => `- **${G.EVAL_TYPES[k]}:** ${G.EVAL_EXPECT[k]}`),
    '', '## Modele giden tam metinler', '',
    ...G.EVAL_CASES.flatMap(cs => [`### ${cs.id} · ${G.EVAL_TYPES[cs.type]}`, '', '```', G.evalPrompt(cs), '```', ''])].join('\n');
  write('cases.md', md + '\n');
  write('labels_template.csv', G.evalCsv(G.EVAL_CASES.map(cs => ({ case: cs, reply: '', source: '' }))));
  process.exit(0);
}

const key = process.env.GEMINI_API_KEY || process.env.API_KEY;
if (!key) { console.error('GEMINI_API_KEY ortam değişkeni yok. Sadece dokümanlar için: node eval/run.mjs --export'); process.exit(1); }
const sysArg = arg('system', 'v1'), tag = arg('tag', sysArg.replace(/\W+/g, '_'));
const system = G.TUTOR_SYSTEMS[sysArg] ?? fs.readFileSync(path.resolve(sysArg), 'utf8');
const models = arg('model') ? [arg('model')] : [...G.TUTOR_MODELS];

// Yoğunluk (503/429) ve ağ hatalarında artan aralıklarla yeniden dene; diğer hatalar hemen kaydedilir
const RETRYABLE = /high demand|overloaded|unavailable|503|429|resource.?exhausted|rate|fetch failed|timeout/i;
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function ask(cs) {
  for (let attempt = 0, wait = 5000; ; attempt++, wait = Math.min(wait * 2, 60000)) {
    try { return await G.geminiRest(key, system, G.evalPrompt(cs), models); }
    catch (err) {
      if (attempt >= 6 || !RETRYABLE.test(err.message)) throw err;
      console.log(`${cs.id}  … ${err.message.slice(0, 50)} · ${wait / 1000} sn sonra tekrar`);
      await sleep(wait);
    }
  }
}

const results = [], file = `results_${tag}.csv`;
for (const cs of G.EVAL_CASES) {
  let reply, source = `gemini (${models.join(' / ')})`;
  try { reply = await ask(cs); }
  catch (err) { reply = `HATA: ${err.message}`; source = 'hata'; }
  results.push({ case: cs, reply, source });
  fs.writeFileSync(path.join(here, file), G.evalCsv(results)); // yarıda kalırsa elde edilenler kaybolmasın
  console.log(`${cs.id}  ${reply.slice(0, 90).replace(/\n/g, ' ')}${reply.length > 90 ? '…' : ''}`);
}
console.log(`yazıldı: eval/${file}`);
console.log(`\n${results.length} vaka çalıştı (talimat: ${sysArg}). Etiket sütunlarını doldurup labels_${tag}.csv olarak kaydedin.`);
