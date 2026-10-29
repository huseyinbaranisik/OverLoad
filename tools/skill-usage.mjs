#!/usr/bin/env node
// Claude Code oturum kayıtlarından hangi skill/plugin'in ne kadar kullanıldığını çıkarır
// ve hiç kullanılmayanları kapatmak için komut önerir. Hiçbir şeyi kendisi değiştirmez.
//
//   node skill-usage.mjs            # son 30 gün
//   node skill-usage.mjs --days 14
//   node skill-usage.mjs --json     # başka bir araç ya da Claude okusun diye
//
// Sayılanlar: Claude'un Skill aracıyla açtığı skill'ler ve senin yazdığın /komutlar.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import readline from 'node:readline';

const args = process.argv.slice(2);
const days = Number(args[args.indexOf('--days') + 1]) || 30;
const asJson = args.includes('--json');
const since = Date.now() - days * 864e5;

const home = (process.env.CLAUDE_CONFIG_DIR || '').trim() || path.join(os.homedir(), '.claude');
const readJson = (f) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return null; } };
const dirs = (d) => { try { return fs.readdirSync(d, { withFileTypes: true }).filter((e) => e.isDirectory() || e.isSymbolicLink()).map((e) => e.name); } catch { return []; } };
const files = (d) => { try { return fs.readdirSync(d); } catch { return []; } };

// Kurulu paketler: plugin'ler ve ~/.claude/skills altındaki tek tek skill'ler.
// Her paket için Claude'un onu çağırırken kullanabileceği adları topla.
const packages = [];
const installed = readJson(path.join(home, 'plugins', 'installed_plugins.json'))?.plugins || {};
const enabled = readJson(path.join(home, 'settings.json'))?.enabledPlugins || {};
for (const [id, entries] of Object.entries(installed)) {
  const plugin = id.split('@')[0];
  const root = entries[0]?.installPath || '';
  const names = new Set([plugin]);
  for (const s of dirs(path.join(root, 'skills'))) names.add(s);
  for (const c of files(path.join(root, 'commands'))) names.add(c.replace(/\.md$/, ''));
  // Hook'u olan plugin skill çağrılmadan da arka planda çalışır; sayım onu göstermez.
  const hooks = fs.existsSync(path.join(root, 'hooks', 'hooks.json')) || !!readJson(path.join(root, '.claude-plugin', 'plugin.json'))?.hooks;
  packages.push({ id, kind: 'plugin', plugin, names, hooks, enabled: enabled[id] !== false, uses: 0, last: 0, hits: {} });
}

// gstack kendi klasöründeki her skill'i ~/.claude/skills altına ayrıca bağlar; onları tek paket say.
const skillsDir = path.join(home, 'skills');
const gstackNames = new Set(dirs(path.join(skillsDir, 'gstack')).filter((n) => fs.existsSync(path.join(skillsDir, 'gstack', n, 'SKILL.md'))));
if (gstackNames.size) packages.push({ id: 'gstack', kind: 'skills', names: new Set(['gstack', ...gstackNames]), path: path.join(skillsDir, 'gstack'), uses: 0, last: 0, hits: {} });
for (const s of dirs(skillsDir)) {
  if (s === 'gstack' || gstackNames.has(s)) continue;
  packages.push({ id: s, kind: 'skill', names: new Set([s]), path: path.join(skillsDir, s), uses: 0, last: 0, hits: {} });
}

function credit(name, ts) {
  // "plugin:skill" ise önce plugin adına, değilse skill adına göre eşleştir.
  const [prefix, rest] = name.includes(':') ? name.split(':', 2) : [null, name];
  const pkg = packages.find((p) => p.kind === 'plugin' && p.plugin === prefix)
    || packages.find((p) => p.names.has(rest))
    || packages.find((p) => p.names.has(name));
  if (!pkg) return;
  pkg.uses++;
  pkg.hits[name] = (pkg.hits[name] || 0) + 1;
  pkg.last = Math.max(pkg.last, ts);
}

// Oturum kayıtlarını tara.
const projects = path.join(home, 'projects');
const logs = [];
for (const p of dirs(projects)) for (const f of files(path.join(projects, p))) if (f.endsWith('.jsonl')) logs.push(path.join(projects, p, f));

let sessions = 0;
for (const log of logs) {
  if (fs.statSync(log).mtimeMs < since) continue;
  sessions++;
  const rl = readline.createInterface({ input: fs.createReadStream(log), crlfDelay: Infinity });
  for await (const line of rl) {
    if (!line.includes('"Skill"') && !line.includes('command-name')) continue;
    let e; try { e = JSON.parse(line); } catch { continue; }
    const ts = Date.parse(e.timestamp) || 0;
    if (ts && ts < since) continue;
    const content = e.message?.content;
    if (e.type === 'assistant' && Array.isArray(content)) {
      for (const c of content) if (c.type === 'tool_use' && c.name === 'Skill' && c.input?.skill) credit(c.input.skill, ts);
    } else if (e.type === 'user') {
      const text = typeof content === 'string' ? content : Array.isArray(content) ? content.map((c) => c.text || '').join(' ') : '';
      for (const m of text.matchAll(/<command-name>\/?([^<\s]+)<\/command-name>/g)) credit(m[1], ts);
    }
  }
}

const unused = packages.filter((p) => p.uses === 0 && p.enabled !== false && !p.hooks);
const background = packages.filter((p) => p.uses === 0 && p.enabled !== false && p.hooks);
const disableCmd = (p) => p.kind === 'plugin'
  ? `claude plugin disable ${p.id}`
  : `# ${p.id}: ${p.path} klasörünü başka bir yere taşı (skill olduğu için kapatma komutu yok)`;

if (asJson) {
  console.log(JSON.stringify({ days, sessions, packages: packages.map(({ names, ...p }) => p), unused: unused.map((p) => p.id), background: background.map((p) => p.id) }, null, 2));
} else {
  console.log(`Son ${days} gün, ${sessions} oturum tarandı.\n`);
  const rows = [...packages].sort((a, b) => b.uses - a.uses);
  for (const p of rows) {
    const last = p.last ? new Date(p.last).toISOString().slice(0, 10) : '-';
    const top = Object.entries(p.hits).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([n, c]) => `${n}×${c}`).join(', ');
    const off = (p.enabled === false ? '  (kapalı)' : '') + (p.hooks ? '  [hook]' : '');
    console.log(`${String(p.uses).padStart(4)}  ${p.id.padEnd(42)} son: ${last}  ${top}${off}`);
  }
  if (sessions < 10) console.log(`\nNot: sadece ${sessions} oturum var; karar vermek için birkaç hafta kullanım beklemek daha sağlıklı.`);
  if (background.length) {
    console.log(`\n[hook] işaretli ${background.length} paket hiç çağrılmamış ama hook ile arka planda çalışıyor olabilir;`);
    console.log('bunlara sayıya bakarak değil, işe yarayıp yaramadığına göre karar ver: ' + background.map((p) => p.id).join(', '));
  }
  if (unused.length) {
    console.log(`\nHiç kullanılmayan ${unused.length} paket. Kapatmak için (geri açmak: claude plugin enable …):\n`);
    for (const p of unused) console.log('  ' + disableCmd(p));
  } else {
    console.log('\nKullanılmayan paket yok.');
  }
}
