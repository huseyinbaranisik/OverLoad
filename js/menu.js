'use strict';
// Ana menü: Oyna'nın üstündeki üç hızlı seçim (Rol, Zorluk, Ön ayar) + Ayarlar. Seçimler tarayıcıda hatırlanır.
const PICKS = {
  role: { title: 'Rolün', groups: [{ key: 'role', items: [
    ['gelistirici', 'Geliştirici', 'Arayanlar seninle kod üzerinden konuşur.'],
    ['testci', 'Testçi', 'Arayanlar senden önce kanıt bekler.'],
    ['yonetici', 'Proje yöneticisi', 'Arayanlar senden karar ve öncelik bekler.'],
  ] }] },
  difficulty: { title: 'Zorluk', groups: [{ key: 'difficulty', items: [
    ['kolay', 'Kolay', 'Overload yavaş yükselir.'],
    ['normal', 'Normal', 'Dengeli tempo.'],
    ['zor', 'Zor', 'Overload hızlı yükselir, çağrılar sık gelir.'],
  ] }] },
  preset: { title: 'Ön ayar', groups: [
    { key: 'level', label: 'Seviyen', items: [
      ['yeni', 'Yeni başladım', 'Her kararda ipucu görürsün.'],
      ['orta', 'Biraz biliyorum', 'İpucu yok, süre baskısı yok.'],
      ['deneyimli', 'Deneyimliyim', 'Kararlar 60 saniyelik süre baskısında.'],
    ] },
    { key: 'goal', label: 'Bugünkü hedefin', items: [
      ['ayakta', 'Sistemi ayakta tutmak', 'Günü Overload %50\'nin altındayken bitir.'],
      ['veri', 'Hasta verisini korumak', 'Hiç KVKK ihlali olmasın.'],
      ['ogrenmek', 'Hatasız nöbet', 'Hiçbir kararın başarısız olmasın.'],
    ] },
  ] },
};
const cfg = Object.assign({ role: 'gelistirici', difficulty: 'normal', level: 'yeni', goal: 'ayakta' }, load('seprimer-cfg'));
const fx = Object.assign({ sound: true, tutor: true, scanlines: true, reduceMotion: false }, load('seprimer-fx'));

const labelOf = (key, v) => {
  for (const p of Object.values(PICKS)) for (const g of p.groups) if (g.key === key) return (g.items.find(i => i[0] === v) || [])[1];
};
function renderChips() {
  document.querySelectorAll('[data-pick]').forEach(b => {
    const key = b.dataset.pick === 'preset' ? 'level' : b.dataset.pick;
    b.querySelector('b').textContent = labelOf(key, cfg[key]);
  });
}
function applyFx() {
  document.documentElement.classList.toggle('no-scan', !fx.scanlines);
  document.documentElement.classList.toggle('reduce-motion', fx.reduceMotion);
}

const pickList = g => `${g.label ? `<h3>${g.label}</h3>` : ''}<div class="pick-list">${g.items.map(([v, l, d]) =>
  `<button class="pick ${cfg[g.key] === v ? 'on' : ''}" data-key="${g.key}" data-v="${v}" data-cy="${g.key}-${v}"><b>${l}</b><small>${d}</small></button>`).join('')}</div>`;

function mountPicks(el) {
  el.querySelectorAll('.pick').forEach(b => b.onclick = () => {
    cfg[b.dataset.key] = b.dataset.v; save('seprimer-cfg', cfg);
    el.querySelectorAll(`.pick[data-key="${b.dataset.key}"]`).forEach(x => x.classList.toggle('on', x === b));
    renderChips();
  });
  el.querySelector('[data-cy=sheet-done]').onclick = closeModal;
}

function openPick(name) {
  const p = PICKS[name];
  openModal(`<div class="kicker">HIZLI SEÇİM</div><h2>${p.title}</h2>${p.groups.map(pickList).join('')}
    <button class="btn-play small" data-cy="sheet-done">TAMAM</button>`, mountPicks, true);
}

function openSettings() {
  const toggle = (k, l, d) => `<label class="toggle"><span><b>${l}</b><small>${d}</small></span>
    <input type="checkbox" data-fx="${k}" data-cy="fx-${k}" ${fx[k] ? 'checked' : ''}><i></i></label>`;
  openModal(`<div class="kicker">AYARLAR</div><h2>Komuta paneli</h2>
    ${toggle('sound', 'Ses efektleri', 'Telefon, ajan, darbe ve alarm sesleri.')}
    ${toggle('tutor', 'Tutor', 'Karar pencerelerinde "Tutor\'a sor" kutusu. Cevabı söylemez, soru sorar.')}
    ${toggle('scanlines', 'CRT tarama çizgileri', 'Ekrandaki eski televizyon dokusu.')}
    ${toggle('reduceMotion', 'Hareketi azalt', 'Geçişler sade bir solmaya döner; sarsıntı ve titreme kapanır.')}
    ${pickList({ ...PICKS.difficulty.groups[0], label: 'Genel zorluk' })}
    <button class="btn-play small" data-cy="sheet-done">TAMAM</button>`, el => {
    el.querySelectorAll('[data-fx]').forEach(i => i.onchange = () => { fx[i.dataset.fx] = i.checked; save('seprimer-fx', fx); applyFx(); });
    mountPicks(el);
  }, true);
}

function openHowTo() {
  openModal(`<div class="kicker">NASIL OYNANIR</div><h2>Nöbet 08:00'de başlar</h2>
    <ol class="howto">
      <li><b>Vardiya 17:00'ye kadar sürer.</b> Telefonla 3 ana çağrı gelir; aralarda haritada rastgele olaylar <span class="t-red">kırmızı</span> yanar.</li>
      <li><b>Ajanını seç.</b> Görevin ihtiyaçlarını ajanın özellikleriyle karşılaştır; kararı sen ver. Her görev ⚡ enerji harcar, dönen ajan bir süre soğur.</li>
      <li><b>Ajan varınca</b> işaret <span class="t-orange">turuncuya</span> döner. Dokun ve kararını ver.</li>
      <li><b>Takılırsan</b> karar penceresindeki 🎓 Tutor'a sor; cevabı söylemez, düşündürür. Sonra sonucu oku: ne oldu, neden oldu?</li>
    </ol>
    <p class="muted">Bekleyen her işaret zamanla büyür ve sistemi giderek daha hızlı ısıtır; halkası dolunca patlar. Kritik olaylarda ajan varınca bir mini görev açılır. Açık sorunlar, başarısızlıklar ve uyumsuz ajanlar <b>Overload</b>'u yükseltir; çözülen sorunlar sistemi soğutur. Overload %100 olursa ya da saat 17:00 olursa nöbet kötü biter.</p>
    <button class="btn-play small" data-cy="sheet-done">ANLADIM</button>`, el => el.querySelector('[data-cy=sheet-done]').onclick = closeModal, true);
}

document.querySelectorAll('[data-pick]').forEach(b => b.onclick = () => openPick(b.dataset.pick));
$('[data-cy=settings]').onclick = openSettings;
$('[data-cy=how]').onclick = openHowTo;
$('[data-cy=eval-open]').onclick = openEval;
$('[data-cy=play]').onclick = e => {
  e.currentTarget.disabled = true;
  crtSwap('game', () => startGame({ ...cfg }));
};
renderChips(); applyFx();
