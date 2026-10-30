'use strict';
// Oyun: harita, ajanlar, çağrılar, kararlar. core.js ve ui/crt.js'ten sonra yüklenir.

// ---------- içerik ----------
const STATUS = { hazir: 'Hazır', yolda: 'Yolda', sahada: 'Sahada', donuyor: 'Dönüyor', soguma: 'Soğuyor' };
const REGEN = 2; // hazır bekleyen ajan saniyede bu kadar enerji toplar

// b: 3x5 blok ızgarasında konum (dikey telefon ekranına göre)
const BUILDINGS = {
  hastane: { name: 'Hastane', b: [1, 2], h: 62 },
  randevu: { name: 'Randevu', b: [0, 0], h: 48 },
  odeme: { name: 'Ödeme', b: [1, 0], h: 40 },
  bildirim: { name: 'Bildirim', b: [2, 1], h: 46 },
  kayit: { name: 'Hasta Kayıt', b: [0, 3], h: 46 },
  lab: { name: 'Laboratuvar', b: [2, 3], h: 38 },
  veritabani: { name: 'Veritabanı', b: [1, 4], h: 50 },
};

const SIDE = [
  { building: 'odeme', title: 'Ödeme sayfası yavaşladı', text: 'Dönüş yolunda ajan, ödeme sayfasının 20 saniyede açıldığını fark etti.',
    options: [
      { id: 'A', label: 'Yavaş sorguyu bul ve düzelt', chance: 80, why: 'Yavaşlığın sebebini bulmak onu kalıcı olarak çözer.' },
      { id: 'B', label: 'Sunucuyu yeniden başlat, geçer', chance: 35, why: 'Yeniden başlatmak belirtiyi geçici olarak siler, sebep yerinde durur.' },
      { id: 'C', label: 'Sayfaya "yoğunluk var" uyarısı koy, yarın incele', chance: 50, why: 'Kullanıcıyı bilgilendirmek iyi ama yavaşlığın sebebi duruyor.' },
    ] },
  { building: 'veritabani', title: 'Disk dolmak üzere', text: 'Veritabanı diski %95 dolu.',
    options: [
      { id: 'A', label: 'Eski logları arşive taşı', chance: 85, why: 'Gereksiz veriyi taşımak yer açar ve hiçbir şeyi bozmaz.' },
      { id: 'B', label: 'En büyük tabloyu sil', chance: 20, why: 'Neyi sildiğini bilmeden silmek geri dönüşü olmayan veri kaybıdır.' },
      { id: 'C', label: 'Diski büyüt, sebebe sonra bak', chance: 60, why: 'Yer açar ama diski neyin doldurduğu hâlâ bilinmiyor.' },
    ] },
  { building: 'lab', title: 'Lab sonuçları gecikiyor', text: 'Laboratuvar sonuçları sisteme 10 dakika geç düşüyor.',
    options: [
      { id: 'A', label: 'Mesaj kuyruğunu kontrol et', chance: 75, why: 'Gecikmenin nerede biriktiğine bakmak doğru ilk adımdır.' },
      { id: 'B', label: 'Doktorlara sayfayı yenilemelerini söyle', chance: 25, why: 'Sorun sunucudaysa sayfayı yenilemek hiçbir şeyi değiştirmez.' },
      { id: 'C', label: 'Acil sonuçları telefonla bildirt, kuyruğa sonra bak', chance: 55, why: 'Hastayı korur ama gecikmenin sebebi çözülmedi.' },
    ] },
];

const ENDS = {
  good: { good: true, title: 'İyi nöbet!', text: 'Vardiya bitti. Üç ana çağrı da kapandı, sistem ayakta, hasta verisi güvende.' },
  kvkk: { good: false, title: 'Sistem ayakta ama KVKK ihlali', text: 'Her şey çalışıyor gibi görünüyor ama hasta adları maskelenmeden hastane dışına çıktı. Çalışan kod, korunmayan veriyi telafi etmez.' },
  overload: { good: false, title: 'Sistem aşırı yüklendi', text: 'Overload %100\'e ulaştı. Açık kalan sorunlar birikti; randevu, SMS ve kayıt sistemleri durdu.' },
  time: { good: false, title: 'Gün bitti', text: 'Saat 17:00 oldu ama ana çağrılardan en az biri kapanmadı. Sorun yarına devretti.' },
};
const GOALS = {
  ayakta: ['Sistemi ayakta tutmak (Overload %50\'yi geçmesin)', () => S.heat <= 50],
  veri: ['Hasta verisini korumak', () => !S.kvkk],
  ogrenmek: ['Hatasız nöbet (hiçbir karar başarısız olmasın)', () => S.log.length > 0 && S.log.every(l => l.ok)],
};

// ---------- tempo ----------
// Vardiya 08:00-17:00, gerçek zamanda ~7 dakika. Hikâye çağrıları belli saatlerde telefonla gelir,
// aralarda haritada rastgele olaylar belirir. Bekleyen olay Overload'u giderek hızlanan biçimde artırır,
// süresi dolan olay patlar (+25).
const MIN_PER_SEC = 1.25;
const STORY_AT = [8 * 60 + 30, 11 * 60 + 30, 14 * 60 + 30];
const SEV = {
  dusuk: { label: 'DÜŞÜK', ttl: 90, rate: 0.12, marks: '!' },
  orta: { label: 'ORTA', ttl: 65, rate: 0.22, marks: '!!' },
  kritik: { label: 'KRİTİK', ttl: 45, rate: 0.35, marks: '!!!' },
};
const TTLX = { kolay: 1.3, normal: 1, zor: 0.75 };
const MAX_RANDOM = 3, BOOM = 25;

// ---------- durum ----------
const S = {
  level: 'orta', role: 'gelistirici', goal: 'ayakta', difficulty: 'normal', heat: 0, min: 480, solved: 0, kvkk: false, tutorUsed: 0,
  callIdx: 0, cleared: 0, boomed: 0, spawnIn: 8, bag: [], incidents: [], sel: null, agent: Object.fromEntries(AGENTS.map(a => [a.id, 'hazir'])),
  energy: Object.fromEntries(AGENTS.map(a => [a.id, 100])), cool: Object.fromEntries(AGENTS.map(a => [a.id, 0])), log: [], over: false, nid: 0,
  kararSn: [], kotu: 0, uyumsuz: 0, // uyum modelinin girdileri (data/SOZLUK.md)
};
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const roll = ch => TEST ? ch >= 50 : Math.random() * 100 < ch;
function chance(a, needs) {
  const ks = Object.keys(needs);
  const fit = ks.reduce((s, k) => s + Math.min(a.stats[k] / needs[k], 1), 0) / ks.length;
  return Math.round(20 + 75 * fit);
}
const agentById = id => AGENTS.find(a => a.id === id);
const canSend = a => S.agent[a.id] === 'hazir' && S.energy[a.id] >= a.cost;
function addHeat(d) {
  const before = S.heat;
  S.heat = clamp(S.heat + d, 0, 100);
  if (Math.abs(d) >= 5) juiceHeat(S.heat - before); // küçük saniyelik artışlar sessiz geçer
  if (before < 70 && S.heat >= 70) sfx('alarm');
}
const selRed = () => S.incidents.find(i => i.id === S.sel && i.state === 'red');

// ---------- harita ----------
// eğik kuş bakışı: x sağa, y aşağı, yükseklik yukarı ve hafif sola
const T = 40, TY = 28, OX = 8, OY = 58, R = 0.6, NX = 9 + R, NY = 15 + R;
const iso = (x, y, z = 0) => [OX + x * T - z * 0.3, OY + y * TY - z * 0.55];
const pts = a => a.map(p => p.map(n => n.toFixed(1)).join(',')).join(' ');
const center = k => { const [i, j] = BUILDINGS[k].b; return [3 * i + R + 1.2, 3 * j + R + 1.2]; };
const bpos = k => iso(...center(k), BUILDINGS[k].h);

function box(x, y, w, d, h, cls) {
  const top = [iso(x, y, h), iso(x + w, y, h), iso(x + w, y + d, h), iso(x, y + d, h)];
  const right = [iso(x + w, y), iso(x + w, y + d), iso(x + w, y + d, h), iso(x + w, y, h)];
  const front = [iso(x, y + d), iso(x + w, y + d), iso(x + w, y + d, h), iso(x, y + d, h)];
  return `<g class="${cls}"><polygon class="f1" points="${pts(right)}"/><polygon class="f2" points="${pts(front)}"/><polygon class="ft" points="${pts(top)}"/></g>`;
}

function drawCity() {
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const keyAt = (i, j) => Object.keys(BUILDINGS).find(k => BUILDINGS[k].b[0] === i && BUILDINGS[k].b[1] === j);
  let s = `<defs>
    <radialGradient id="glowR"><stop offset="0" stop-color="#ff2d3d" stop-opacity=".7"/><stop offset="1" stop-color="#ff2d3d" stop-opacity="0"/></radialGradient>
    <radialGradient id="glowO"><stop offset="0" stop-color="#ff9f1c" stop-opacity=".7"/><stop offset="1" stop-color="#ff9f1c" stop-opacity="0"/></radialGradient>
  </defs>`;
  s += `<polygon class="ground" points="${pts([iso(0, 0), iso(NX, 0), iso(NX, NY), iso(0, NY)])}"/>`;
  for (let r = 0; r < NX; r += 3) s += `<polygon class="road" points="${pts([iso(r, 0), iso(r + R, 0), iso(r + R, NY), iso(r, NY)])}"/>`;
  for (let r = 0; r < NY; r += 3) s += `<polygon class="road" points="${pts([iso(0, r), iso(NX, r), iso(NX, r + R), iso(0, r + R)])}"/>`;
  for (let r = 0; r < NX; r += 3) s += `<polyline class="lane" points="${pts([iso(r + R / 2, 0), iso(r + R / 2, NY)])}"/>`;
  for (let r = 0; r < NY; r += 3) s += `<polyline class="lane" points="${pts([iso(0, r + R / 2), iso(NX, r + R / 2)])}"/>`;
  s += '<g id="glows"></g><g id="trails"></g>';
  const boxes = [];
  for (let i = 0; i < 3; i++) for (let j = 0; j < 5; j++) {
    const k = keyAt(i, j), x0 = 3 * i + R, y0 = 3 * j + R;
    if (k) boxes.push([x0 + .25, y0 + .25, 1.9, 1.9, BUILDINGS[k].h, 'bld key']);
    else for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++)
      boxes.push([x0 + .15 + a * 1.2, y0 + .15 + b * 1.2, .9, .9, 10 + rnd() * 34, 'bld']);
  }
  boxes.sort((p, q) => p[1] - q[1] || p[0] - q[0]).forEach(b => s += box(...b));
  s += '<g id="agentsLayer"></g>';
  for (const k in BUILDINGS) { const [x, y] = bpos(k); s += `<text class="label" x="${x.toFixed(1)}" y="${(y + 4).toFixed(1)}">${BUILDINGS[k].name}</text>`; }
  s += '<g id="markers"></g>';
  $('#map').innerHTML = s;
  $('#markers').addEventListener('click', e => {
    const m = e.target.closest('.marker'); if (!m || modalOpen) return;
    const inc = S.incidents.find(i => i.id === +m.dataset.id); if (!inc) return;
    if (inc.state === 'red') { S.sel = inc.id; renderAll(); toast('Alttan bir ajan seç, kartından gönder.'); }
    else if (inc.state === 'orange') inc.kind === 'side' ? openSide(inc) : openDecision(inc);
  });
}

// yollar üzerinden: bloktan çık, yatay yol, dikey yol, hedef bloğa gir
function route(from, to) {
  const a = center(from), b = center(to), ry = 3 * BUILDINGS[from].b[1] + R / 2, rx = 3 * BUILDINGS[to].b[0] + R / 2;
  return [a, [a[0], ry], [rx, ry], [rx, b[1]], b].map(p => iso(p[0], p[1]));
}

const svgEl = (tag, attrs) => { const el = document.createElementNS('http://www.w3.org/2000/svg', tag); for (const k in attrs) el.setAttribute(k, attrs[k]); return el; };

function travel(a, path, done) {
  const dur = TEST ? 150 : Math.max(1400, 4400 - a.stats.hiz * 600);
  const segs = path.slice(1).map((p, i) => Math.hypot(p[0] - path[i][0], p[1] - path[i][1]));
  const total = segs.reduce((x, y) => x + y, 0);
  const trail = svgEl('polyline', { class: 'trail', stroke: a.color });
  const dot = svgEl('circle', { class: 'agentDot', r: 5, fill: a.color });
  $('#trails').append(trail); $('#agentsLayer').append(dot);
  const t0 = performance.now();
  (function step(t) {
    let d = clamp((t - t0) / dur, 0, 1) * total, i = 0;
    while (i < segs.length - 1 && d > segs[i]) d -= segs[i++];
    const f = segs[i] ? Math.min(d / segs[i], 1) : 1, p = path[i], q = path[i + 1];
    const cur = [p[0] + (q[0] - p[0]) * f, p[1] + (q[1] - p[1]) * f];
    dot.setAttribute('cx', cur[0]); dot.setAttribute('cy', cur[1]);
    trail.setAttribute('points', pts([...path.slice(0, i + 1), cur]));
    if (t - t0 < dur) return requestAnimationFrame(step);
    dot.remove();
    setTimeout(() => trail.classList.add('fade'), 1500);
    setTimeout(() => trail.remove(), 5000);
    done();
  })(t0);
}

// ---------- arayüz ----------
function renderHud() {
  const h = Math.round(S.heat), f = $('#heatFill');
  f.style.width = h + '%'; f.className = h >= 70 ? 'hot' : h >= 40 ? 'warm' : '';
  $('#heatTxt').textContent = '%' + h;
  $('.hud').classList.toggle('danger', h >= 70);
  const m = Math.floor(S.min);
  $('#clock').textContent = `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
  $('#progress').textContent = `Ana görev ${S.solved}/${CALLS.length} · Çözülen ${S.cleared}`;
}

const ttlOf = inc => SEV[inc.c.sev].ttl * TTLX[S.difficulty];
const ageP = inc => inc.kind === 'side' ? 0 : Math.min(inc.age / ttlOf(inc), 1);

function renderMarkers() {
  let g = '', m = '';
  for (const inc of S.incidents) {
    const [x, y] = bpos(inc.building), o = inc.state === 'orange', p = ageP(inc);
    const sev = inc.kind === 'side' ? 'dusuk' : inc.c.sev, C = 2 * Math.PI * 15;
    g += `<circle class="glow" cx="${x.toFixed(1)}" cy="${(y + 30).toFixed(1)}" r="${(60 + 70 * p).toFixed(0)}" fill="url(#glow${o ? 'O' : 'R'})"/>`;
    // işaret zamanla büyür; halka kalan süreyi gösterir
    m += `<g class="marker ${o ? 'orange' : 'red'} sev-${sev} ${inc.state === 'enroute' ? 'enroute' : ''} ${p > 0.7 ? 'crit' : ''} ${S.sel === inc.id ? 'sel' : ''}" data-cy="marker-${inc.building}" data-id="${inc.id}" transform="translate(${x.toFixed(1)},${(y - 26 - 10 * p).toFixed(1)}) scale(${(1.3 + 1.1 * p).toFixed(2)})">
      <circle class="hit" r="18"/>${inc.kind === 'side' ? '' : `<circle class="ring-bg" r="15"/><circle class="ring" r="15" stroke-dasharray="${(C * (1 - p)).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90)"/>`}
      <path d="M0,-11 L10,7 L-10,7Z"/><text y="5">${SEV[sev].marks}</text></g>`;
  }
  $('#glows').innerHTML = g; $('#markers').innerHTML = m;
}

function renderBar() {
  const inc = selRed(), bar = $('#incidentBar');
  if (inc) {
    const needs = Object.entries(inc.c.needs).map(([k, v]) => `<span class="chip">${STATS[k]} ${v}</span>`).join('');
    const top = Object.entries(inc.c.needs).sort((p, q) => q[1] - p[1])[0][0];
    const left = Math.max(0, Math.ceil(ttlOf(inc) - inc.age));
    bar.innerHTML = `<span class="sev ${inc.c.sev}">${SEV[inc.c.sev].label}</span> <b>${inc.c.title}</b> · ${BUILDINGS[inc.building].name} <span class="left ${left <= 10 ? 'hot' : ''}" data-cy="time-left">⏱ ${left} sn</span>
      <div>İhtiyaç: ${needs}</div>` + (S.level === 'yeni' ? `<div class="hint">💡 ${STATS[top]} özelliği yüksek bir ajan ara.</div>` : '');
  } else if (S.incidents.some(i => i.state === 'red')) bar.textContent = `${S.incidents.filter(i => i.state === 'red').length} açık sorun var. Kırmızı bir işarete dokun.`;
  else if (S.incidents.some(i => i.state === 'orange')) bar.textContent = 'Turuncu işarete dokun: karar bekleniyor.';
  else if (S.incidents.length) bar.textContent = 'Ajan yolda…';
  else bar.textContent = 'Hat sakin. Telefon bekleniyor…';
}

function renderAgents() {
  $('#agents').innerHTML = AGENTS.map(a => {
    const st = S.agent[a.id], e = S.energy[a.id], ready = canSend(a);
    const label = st === 'soguma' ? `Soğuyor ${S.cool[a.id]} sn` : st === 'hazir' && !ready ? 'Enerji az' : STATUS[st];
    return `<button class="card ${st} ${ready ? 'ready' : ''}" data-cy="agent-${a.id}" data-id="${a.id}" style="--c:${a.color}">
      <span class="ic">${a.icon}</span><b>${a.name}</b><span class="st">${label}</span>
      <span class="energy ${e < a.cost ? 'low' : ''}" title="Enerji ${Math.floor(e)}/100, görev ${a.cost}"><i style="width:${e}%"></i><em style="left:${a.cost}%"></em></span></button>`;
  }).join('');
}
const renderAll = () => { renderHud(); renderMarkers(); renderBar(); renderAgents(); };

let toastT;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2800); }

function radar(st, color) {
  const ks = Object.keys(STATS), c = 70, R = 48;
  const pt = (i, r) => { const a = -Math.PI / 2 + i * 2 * Math.PI / ks.length; return [c + Math.cos(a) * r, c + Math.sin(a) * r]; };
  let s = '<svg viewBox="0 0 140 140" class="radar">';
  for (let l = 1; l <= 5; l++) s += `<polygon class="grid" points="${pts(ks.map((_, i) => pt(i, R * l / 5)))}"/>`;
  s += `<polygon points="${pts(ks.map((k, i) => pt(i, R * st[k] / 5)))}" fill="${color}55" stroke="${color}" stroke-width="1.5"/>`;
  ks.forEach((k, i) => { const [x, y] = pt(i, R + 12); s += `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}">${STATS[k]}</text>`; });
  return s + '</svg>';
}

$('#agents').addEventListener('click', e => { const c = e.target.closest('.card'); if (c && !modalOpen) openAgent(agentById(c.dataset.id)); });

function openAgent(a) {
  const inc = selRed(), st = S.agent[a.id], e = Math.floor(S.energy[a.id]);
  const stats = Object.keys(STATS).map(k => `<li class="${inc && inc.c.needs[k] ? 'need' : ''}"><span>${STATS[k]}</span><b>${a.stats[k]}/5</b></li>`).join('');
  const action = !inc ? '<p class="muted">Göndermek için önce haritada kırmızı bir işaret seç.</p>'
    : st !== 'hazir' ? `<p class="muted">${a.name} şu an ${st === 'soguma' ? `soğuyor (${S.cool[a.id]} sn)` : STATUS[st].toLowerCase()}.</p>`
    : e < a.cost ? `<p class="muted" data-cy="no-energy">Enerjisi yetersiz: bu görev ${a.cost} enerji ister, ${e} var. Hazır beklerken saniyede ${REGEN} dolar.</p>`
    : `<button class="primary" data-cy="send">Gönder → ${BUILDINGS[inc.building].name} · ⚡${a.cost}</button>`;
  openModal(`<div class="agentHead" style="--c:${a.color}"><span class="ic">${a.icon}</span><div><h2>${a.name}</h2><small>${a.tag} · ${a.bio}</small></div></div>
    ${radar(a.stats, a.color)}<ul class="statlist">${stats}</ul>
    ${inc ? `<p class="needs-line">Görevin ihtiyacı: ${Object.entries(inc.c.needs).map(([k, v]) => `<span class="chip">${STATS[k]} ${v}</span>`).join('')}</p>` : ''}
    <div class="energy-line"><span>⚡ Enerji <b>${e}</b>/100</span><span>Görev <b>${a.cost}</b></span><span>Soğuma <b>${a.cd} sn</b></span></div>${action}<button class="ghost" data-cy="close">Kapat</button>`,
  el => {
    el.querySelector('[data-cy=close]').onclick = closeModal;
    const send = el.querySelector('[data-cy=send]');
    if (send) send.onclick = () => { closeModal(); dispatch(a, inc); };
  }, true);
}

// ---------- oyun akışı ----------
// sadece TEST: bir çağrı çözülünce sıradaki hemen gelir (gerçek oyunda STORY_AT saatleri)
function nextCall() {
  if (!TEST || S.callIdx >= CALLS.length) return;
  const c = CALLS[S.callIdx++];
  setTimeout(() => ringCall(c), 100);
}

function ringCall(c) {
  if (S.over) return;
  openModal(`<div class="ring">📞 Telefon çalıyor…</div><h2>${c.caller}</h2>
    <p class="quote">“Komuta, burası ${c.caller.split(' · ')[0]}. ${ROLES[S.role]} nöbetçiye iletin: ${c.text}”</p><button class="primary" data-cy="accept-call">Ekibi yolluyorum</button>`,
  el => (sfx('ring'), el.querySelector('[data-cy=accept-call]').onclick = () => {
    closeModal();
    const inc = { id: ++S.nid, kind: 'main', c, building: c.building, state: 'red', age: 0 };
    S.incidents.push(inc); S.sel = inc.id; renderAll();
    toast('Haritada kırmızı işaret var. Alttan bir ajan seç.');
  }));
}

function spawnRandom() {
  if (S.incidents.filter(i => i.kind === 'rand').length >= MAX_RANDOM) return;
  if (!S.bag.length) S.bag = shuffle(RANDOM_INCIDENTS.slice());
  for (let n = 0; n < S.bag.length; n++) {
    const c = S.bag[n], free = c.buildings.filter(b => !S.incidents.some(i => i.building === b));
    if (!free.length) continue;
    S.bag.splice(n, 1);
    const inc = { id: ++S.nid, kind: 'rand', c, building: free[Math.floor(Math.random() * free.length)], state: 'red', age: 0 };
    S.incidents.push(inc);
    if (!selRed()) S.sel = inc.id;
    sfx('alert'); toast(`⚠ ${c.type}: ${c.title}`);
    return inc;
  }
}

function explode(inc) {
  const [x, y] = bpos(inc.building), ring = svgEl('circle', { class: 'boom', cx: x, cy: y, r: 30 });
  $('#trails').append(ring); setTimeout(() => ring.remove(), 900);
  S.boomed++;
  S.log.push({ title: `PATLADI · ${inc.c.title}`, choice: 'Müdahale edilmedi', ok: false,
    what: `${BUILDINGS[inc.building].name}: sorun kontrolden çıktı, Overload +${BOOM}.`, why: 'Bekleyen her sorun büyür. Hepsine yetişemiyorsan önce en ciddisini seç.' });
  toast(`💥 ${inc.c.title} patladı! Overload +${BOOM}`);
  if (inc.kind === 'main') inc.age = 0; // ana görev kaybolmaz, tekrar sayar
  else { S.incidents = S.incidents.filter(i => i !== inc); if (S.sel === inc.id) S.sel = null; }
  addHeat(BOOM);
}

function dispatch(a, inc) {
  S.energy[a.id] -= a.cost;
  if (chance(a, inc.c.needs) < 75) { S.uyumsuz++; addHeat(5); toast(`${a.name} bu işe pek uygun değil: Overload +5`); } // yanlış ajan sistemi zorlar
  sfx('dispatch');
  inc.state = 'enroute'; inc.agent = a.id; S.agent[a.id] = 'yolda'; S.sel = null; renderAll();
  travel(a, route('hastane', inc.building), () => {
    S.agent[a.id] = 'sahada'; inc.state = 'orange'; renderAll(); sfx('arrive');
    toast(`${a.name} sahada. Turuncu işarete dokun.`);
  });
}

function startTimer(el, secs, onEnd) {
  let left = secs; const bar = el.querySelector('.timer i'), num = el.querySelector('.timer span');
  timerId = setInterval(() => {
    left--; num.textContent = left; bar.style.width = (left / secs * 100) + '%';
    if (left > 0 && left <= 5) sfx('tick');
    if (left <= 0) { clearInterval(timerId); onEnd(); }
  }, 1000);
}

// ---------- tutor kutusu (talimat, prompt ve model zinciri js/tutor.js'te) ----------
const tutorOn = () => typeof fx === 'undefined' || fx.tutor !== false;
const TUTOR_SOURCE = { gemini: 'Cevaplar Gemini\'den geliyor.', 'hazır': 'Model bağlı değil; olayın hazır Sokratik soruları gösteriliyor.', 'hazır (model hatası)': 'Gemini\'ye ulaşılamadı; hazır sorular gösteriliyor.' };

function tutorBox() {
  if (!tutorOn()) return '';
  return `<details class="tutor" data-cy="tutor"><summary data-cy="tutor-toggle">🎓 Tutor'a sor <span class="muted">cevabı söylemez, düşündürür</span></summary>
    <div class="convo" data-cy="tutor-convo" aria-live="polite"></div>
    <textarea data-cy="tutor-input" placeholder="Ne düşünüyorsun? Örn: geri dönmek güvenli mi?"></textarea>
    <button data-cy="tutor-send">Sor</button><p class="tutor-src muted" data-cy="tutor-source"></p></details>`;
}

// Çok turlu: her mesaj önceki konuşmayla birlikte gönderilir (eval de aynı biçimi kullanır)
function mountTutor(el, ctx) {
  const btn = el.querySelector('[data-cy=tutor-send]'); if (!btn) return;
  const convo = el.querySelector('[data-cy=tutor-convo]'), input = el.querySelector('[data-cy=tutor-input]'), src = el.querySelector('[data-cy=tutor-source]');
  if (S.level === 'yeni') ctx.hi = 0; // ilk hazır soru zaten 💡 satırında görünüyor
  const bubble = (who, text) => {
    const b = document.createElement('p'); b.className = `bubble ${who}`; b.textContent = text;
    if (who === 'tutor') b.dataset.cy = 'tutor-reply';
    convo.append(b); return b;
  };
  btn.onclick = async auto => { // auto === true: destek modunun kendiliğinden sorduğu soru, oyuncunun sorusu sayılmaz
    const msg = input.value.trim();
    btn.disabled = true; input.value = '';
    if (msg) bubble('oyuncu', msg);
    const wait = bubble('tutor wait', '…');
    const r = await tutorReply(ctx, msg);
    wait.remove(); bubble('tutor', r.text);
    ctx.history.push({ who: 'oyuncu', text: msg || '(boş)' }, { who: 'tutor', text: r.text });
    src.textContent = TUTOR_SOURCE[r.source]; src.dataset.source = r.source;
    if (auto !== true) S.tutorUsed++;
    btn.disabled = false;
  };
}

// Pencere açılırken modelin girdileri; sıra js/uyum.js → UYUM_OZELLIK
const uyumGirdi = () => ({
  seviye: { yeni: 0, orta: 1, deneyimli: 2 }[S.level], karar_no: S.kararSn.length + 1,
  ort_karar_sn: S.kararSn.length ? S.kararSn.reduce((t, v) => t + v, 0) / S.kararSn.length : 0,
  onceki_kotu: S.kotu, uyumsuz_ajan: S.uyumsuz, overload: Math.round(S.heat), tutor_soru: S.tutorUsed,
});

const TIMEOUT_OPT = { id: '-', label: '(süre doldu, karar verilmedi)', mod: -30,
  ok: 'Karar veremedin ama ajan kendi bildiğini yaptı ve sorun kapandı.',
  fail: 'Karar beklenirken sorun büyüdü ve ajan çözemedi.',
  why: 'Süre baskısı altında karar vermemek de bir karardır: sorun beklerken büyür.' };

function optButtons(list, a) {
  return list.map((o, i) => `<button class="opt ${o.req ? 'special' : ''}" data-cy="option-${o.id}" data-o="${o.id}">${o.req ? `<span class="perk">⭐ ${a.name} uzmanlığı</span>` : ''}<b>${'ABCD'[i]})</b> ${o.label}</button>`).join('');
}

const decTitle = inc => inc.c.decision.title || `${inc.c.type.toUpperCase()} · ${SEV[inc.c.sev].label}`;

async function openDecision(inc) {
  if (inc.c.mg && inc.mgMod == null) return runMinigame(inc.c.mg, score => {
    inc.mgMod = Math.round((score - 0.5) * 40); inc.mgScore = score; openDecision(inc);
  });
  const a = agentById(inc.agent), d = inc.c.decision, base = clamp(chance(a, inc.c.needs) + (inc.mgMod || 0), 5, 95);
  // v2: model zorlanma riskini yüksek bulursa destek modu (tutor açık gelir, süre baskısı kalkar)
  const p = await uyumTahmin(uyumGirdi()).catch(() => null), destek = p != null && p >= UYUM_ESIK;
  const secs = S.level === 'deneyimli' && !destek ? +(P.get('timer') || 60) : 0;
  const rozet = `<p class="uyum ${destek ? 'destek' : ''}" data-cy="uyum" data-mod="${p == null ? 'yok' : destek ? 'destek' : 'akis'}">🧭 ${p == null ? 'Uyum modeli yok · v1 kuralları' : `${destek ? 'Destek modu: tutor açık, süre baskısı yok' : 'Akış modu'} · risk <span data-cy="p">${p.toFixed(4)}</span>`}</p>`;
  inc.t0 = Date.now();
  const opts = visibleOptions(d, a);
  const shown = TEST ? opts : shuffle(opts);
  const mg = inc.mgMod == null ? '' : `<p class="mg-result" data-cy="mg-result">Mini görev: ${inc.c.mg.kind === 'cables' ? `${Math.round(inc.mgScore * 4)}/4 kablo doğru` : inc.mgScore === 1 ? 'komut doğru çalıştı' : 'komut hatalı'} · ihtimal ${inc.mgMod >= 0 ? '+' : ''}${inc.mgMod}</p>`;
  openModal(`<span class="tag orange">${decTitle(inc)}</span><h2>${inc.c.title}</h2><p>${d.text}</p>${mg}
    <p class="muted"><span class="inline-ic">${a.icon}</span> ${a.name} sahada</p>${rozet}
    ${secs ? `<div class="timer" data-cy="timer"><i></i><span>${secs}</span> sn</div>` : ''}
    ${S.level === 'yeni' ? `<p class="hint" data-cy="hint">💡 ${inc.c.hints[0]}</p>` : ''}
    ${optButtons(shown, a)}
    ${tutorBox()}`,
  el => {
    el.querySelectorAll('.opt').forEach(b => b.onclick = () => resolveMain(inc, a, base, d.options.find(o => o.id === b.dataset.o)));
    mountTutor(el, { c: inc.c, agent: a, level: S.level, role: S.role, history: [] });
    const tut = el.querySelector('[data-cy=tutor]');
    if (destek && tut) { tut.open = true; el.querySelector('[data-cy=tutor-send]').onclick(true); }
    if (secs) startTimer(el, secs, () => resolveMain(inc, a, base, TIMEOUT_OPT));
  });
}

function showResult(r, next) {
  openModal(`<span class="tag ${r.ok ? 'good' : 'bad'}">${r.ok ? '✔ Çözüldü' : '✘ Çözülemedi'}</span>
    <h2>${r.title}</h2><p class="muted">Seçimin: ${r.choice}</p>
    <h3>Ne oldu?</h3><p data-cy="what">${r.what}</p>
    <h3>Neden oldu?</h3><p data-cy="why">${r.why}</p>
    <p class="muted" data-cy="odds">Başarı ihtimali ${r.base != null ? `%${r.base} → ` : ''}%${r.ch} · Overload ${r.delta > 0 ? '+' : ''}${r.delta}</p>
    <button class="primary" data-cy="result-continue">Devam</button>`,
  el => el.querySelector('[data-cy=result-continue]').onclick = () => { closeModal(); next(); });
}

function resolveMain(inc, a, base, o) {
  closeModal();
  const main = inc.kind === 'main', ch = clamp(base + o.mod, 5, 95), ok = roll(ch), delta = ok ? (main ? -12 : -10) : (main ? 20 : 15);
  if (o.kvkk) S.kvkk = true;
  S.kararSn.push((Date.now() - inc.t0) / 1000); if (o.id === 'B' || o === TIMEOUT_OPT) S.kotu++;
  sfx(ok ? 'success' : 'fail');
  addHeat(delta);
  const what = ok ? o.ok : o.fail;
  S.log.push({ title: decTitle(inc), choice: o.label, ok, what, why: o.why });
  renderAll();
  showResult({ ok, title: inc.c.title, choice: o.label, what, why: o.why, base, ch, delta }, () => {
    S.agent[a.id] = 'donuyor';
    travel(a, route('hastane', inc.building).reverse(), () => {
      S.cool[a.id] = TEST ? 0 : a.cd; S.agent[a.id] = S.cool[a.id] ? 'soguma' : 'hazir'; renderAll();
    });
    if (ok) {
      S.incidents = S.incidents.filter(i => i !== inc);
      if (main) { S.solved++; nextCall(); } else S.cleared++;
      maybeSide();
    } else {
      inc.state = 'red'; inc.agent = null; inc.mgMod = null; S.sel = inc.id;
      toast('İşaret tekrar kırmızı. Başka bir ajan dene.');
    }
    renderAll(); checkEnd();
  });
}

function maybeSide() {
  if (TEST ? !P.has('side') : Math.random() > 0.25) return;
  const free = SIDE.filter(s => !S.incidents.some(i => i.building === s.building));
  if (!free.length) return;
  const s = free[Math.floor((TEST ? 0 : Math.random()) * free.length)];
  S.incidents.push({ id: ++S.nid, kind: 'side', s, building: s.building, state: 'orange' });
  toast(`Yeni sorun: ${s.title}. Turuncu işarete dokun.`);
}

function openSide(inc) {
  const s = inc.s;
  openModal(`<span class="tag orange">YAN SORUN</span><h2>${s.title}</h2><p>${s.text}</p>
    ${optButtons(TEST ? s.options : shuffle(s.options))}`,
  el => el.querySelectorAll('.opt').forEach(b => b.onclick = () => {
    const o = s.options.find(x => x.id === b.dataset.o), ok = roll(o.chance), delta = ok ? -5 : 10;
    closeModal();
    sfx(ok ? 'success' : 'fail');
    addHeat(delta);
    S.incidents = S.incidents.filter(i => i !== inc); if (ok) S.cleared++;
    const what = ok ? `${s.title}: sorun kapandı.` : `${s.title}: sorun çözülemedi, sistem biraz daha yoruldu.`;
    S.log.push({ title: 'YAN SORUN', choice: o.label, ok, what, why: o.why });
    renderAll();
    showResult({ ok, title: s.title, choice: o.label, what, why: o.why, ch: o.chance, delta }, () => { renderAll(); checkEnd(); });
  }));
}

function checkEnd() {
  if (S.over) return;
  if (S.heat >= 100) return endGame('overload');
  const story = S.solved >= CALLS.length;
  if (TEST) { if (story && !S.incidents.length) endGame(S.kvkk ? 'kvkk' : 'good'); return; }
  if (S.min >= 17 * 60) endGame(story ? (S.kvkk ? 'kvkk' : 'good') : 'time');
}

function endGame(type) {
  S.over = true; modalQueue.length = 0; if (modalOpen) closeModal();
  const e = ENDS[type], [goal, met] = GOALS[S.goal];
  $('#end').innerHTML = `<div class="kicker">NÖBET BİTTİ · ${$('#clock').textContent}</div>
    <h1 class="end-title ${e.good ? 'good' : 'bad'}" data-cy="end-title" data-end="${type}">${e.title}</h1>
    <p class="lead">${e.text}</p>
    <p class="stats-line">Çözülen olay <b>${S.cleared + S.solved}</b> · Patlayan <b>${S.boomed}</b> · Son Overload <b>%${Math.round(S.heat)}</b></p>
    <p class="goal-line">Hedefin: <b>${goal}</b> <span class="${met() ? 'ok' : 'no'}">${met() ? '✔' : '✘'}</span></p>
    <h3>Kararların</h3>
    <ul class="log">${S.log.map(l => `<li class="${l.ok ? '' : 'fail'}"><b>${l.title}</b> · ${l.choice}<small>${l.what}</small><small>Neden: ${l.why}</small></li>`).join('') || '<li>Hiç karar verilmedi.</li>'}</ul>
    <button class="btn-play" data-cy="restart" onclick="location.reload()">ANA MENÜ</button>`;
  sfx(e.good ? 'win' : 'lose');
  crtSwap('end');
}

const DIFF = { kolay: 0.5, normal: 1, zor: 1.6 }; // Overload artışı ve çağrı sıklığı çarpanı

function tick() {
  if (S.over || modalOpen) return; // pencere açıkken saat durur (karar sayacı hariç)
  S.min += MIN_PER_SEC;
  if (!TEST) {
    if (S.callIdx < CALLS.length && S.min >= STORY_AT[S.callIdx]) ringCall(CALLS[S.callIdx++]);
    if (--S.spawnIn <= 0) { spawnRandom(); S.spawnIn = (16 + Math.random() * 14) / DIFF[S.difficulty]; }
    let drain = 0;
    for (const inc of S.incidents.slice()) {
      if (inc.kind === 'side') { drain += 0.1; continue; }
      if (inc.state === 'enroute') continue; // ajan yoldayken sayaç durur
      inc.age++;
      drain += SEV[inc.c.sev].rate * (1 + ageP(inc)) * DIFF[S.difficulty]; // beklerken hasar hızlanır
      if (inc.state === 'red' && inc.age >= ttlOf(inc)) explode(inc);
    }
    if (drain) addHeat(drain);
  }
  for (const a of AGENTS) {
    if (S.agent[a.id] === 'soguma' && --S.cool[a.id] <= 0) S.agent[a.id] = 'hazir';
    else if (S.agent[a.id] === 'hazir') S.energy[a.id] = Math.min(100, S.energy[a.id] + REGEN);
  }
  renderAll(); checkEnd();
}

// menu.js çağırır: cfg = { role, difficulty, level, goal }
function startGame(cfg) {
  Object.assign(S, cfg);
  drawCity(); renderAll();
  setInterval(tick, 1000);
  if (TEST) { S.min = STORY_AT[0]; nextCall(); }
}
