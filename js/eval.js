'use strict';
// Uygulama içi tutor eval modu: 20 vakayı oyunun tutor'una (aynı prompt, seçilen talimat) gönderir,
// cevapları listeler ve etiketlemeye hazır CSV üretir. AI Studio'da Gemini köprüsüyle çalıştırılır.
const EV = { results: [], running: false };

const escHtml = t => String(t).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));

function evalStatus() {
  const b = tutorBackend();
  return b === 'köprü' ? ['ok', 'Model bağlı: AI Studio Gemini köprüsü.']
    : b === 'anahtar' ? ['ok', 'Model bağlı: tarayıcıdaki Gemini anahtarı.']
    : ['warn', 'Model bağlı değil. Cevaplar hazır sorulardan gelir; gerçek eval için uygulamayı AI Studio\'da aç.'];
}

function openEval() {
  const [cls, text] = evalStatus();
  $('#eval').innerHTML = `<div class="kicker">TUTOR EVAL</div><h1 class="eval-title">Tutor cevabı ele veriyor mu?</h1>
    <p class="lead">20 öğrenci mesajı, oyundaki karar pencerelerinden tutor'a gönderilir. Prompt, oyunun gönderdiğinin aynısıdır; sadece talimatı buradan değiştirebilirsin.</p>
    <p class="eval-status ${cls}" data-cy="eval-status">${text}</p>
    <label class="eval-label">Talimat sürümü
      <select data-cy="eval-version"><option value="v1">v1 (oyunda kullanılan)</option><option value="v2">v2 (3 ek kural)</option><option value="custom">Özel</option></select></label>
    <textarea class="eval-system" data-cy="eval-system" spellcheck="false"></textarea>
    <div class="eval-actions">
      <button class="btn-play small" data-cy="eval-run">20 VAKAYI ÇALIŞTIR</button>
      <span class="eval-progress" data-cy="eval-progress"></span>
    </div>
    <div class="eval-actions">
      <button class="ghost" data-cy="eval-download" disabled>CSV indir</button>
      <button class="ghost" data-cy="eval-copy" disabled>CSV kopyala</button>
    </div>
    <ol class="eval-list" data-cy="eval-list"></ol>
    <button class="btn-link" data-cy="eval-back">← Ana menüye dön</button>`;
  const ver = $('[data-cy=eval-version]'), sys = $('[data-cy=eval-system]');
  const fill = () => { if (ver.value !== 'custom') sys.value = TUTOR_SYSTEMS[ver.value]; };
  ver.onchange = fill; sys.oninput = () => { if (sys.value !== TUTOR_SYSTEMS[ver.value]) ver.value = 'custom'; };
  fill();
  $('[data-cy=eval-run]').onclick = runEval;
  $('[data-cy=eval-download]').onclick = downloadEval;
  $('[data-cy=eval-copy]').onclick = copyEval;
  $('[data-cy=eval-back]').onclick = () => location.reload();
  show('eval');
}

function renderEvalItem(cs, r) {
  const a = r ? evalAuto(r.reply) : null;
  return `<li data-cy="eval-${cs.id}"><b>${cs.id}</b> · ${EVAL_TYPES[cs.type]} · ${LEVEL_LABEL[cs.level]}
    <small>${escHtml(evalSource(cs.ref).title)}</small>
    <p class="ev-q">“${escHtml(cs.message)}”</p>
    ${r ? `<p class="ev-a">${escHtml(r.reply)}</p>
      <small>kaynak: ${r.source} · soru: ${a.soru} · cümle: ${a.cumle}${a.supheli ? ` · <span class="ev-flag">şüpheli: ${escHtml(a.supheli)}</span>` : ''}</small>` : '<p class="ev-a pending">bekliyor…</p>'}</li>`;
}

async function runEval() {
  if (EV.running) return;
  EV.running = true; EV.results = []; EV.version = $('[data-cy=eval-version]').value;
  const system = $('[data-cy=eval-system]').value, list = $('[data-cy=eval-list]'), prog = $('[data-cy=eval-progress]');
  const run = $('[data-cy=eval-run]'); run.disabled = true;
  list.innerHTML = EVAL_CASES.map(cs => renderEvalItem(cs)).join('');
  for (const [i, cs] of EVAL_CASES.entries()) {
    prog.textContent = `${i + 1}/${EVAL_CASES.length}`;
    const ctx = evalCtx(cs);
    const r = await tutorReply(ctx, cs.message, system);
    const res = { case: cs, reply: r.text, source: r.source };
    EV.results.push(res);
    list.querySelector(`[data-cy=eval-${cs.id}]`).outerHTML = renderEvalItem(cs, res);
  }
  const fallback = EV.results.filter(r => r.source !== 'gemini').length;
  prog.textContent = fallback ? `Bitti · ${fallback} cevap hazır sorulardan geldi` : 'Bitti';
  document.querySelectorAll('[data-cy=eval-download], [data-cy=eval-copy]').forEach(b => b.disabled = false);
  run.disabled = false; EV.running = false;
}

const evalFile = () => `results_${EV.version || 'v1'}.csv`;
function downloadEval() {
  const url = URL.createObjectURL(new Blob([evalCsv(EV.results)], { type: 'text/csv;charset=utf-8' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: evalFile() });
  document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
async function copyEval() {
  const csv = evalCsv(EV.results), btn = $('[data-cy=eval-copy]');
  try { await navigator.clipboard.writeText(csv); btn.textContent = 'Kopyalandı ✔'; }
  catch { // AI Studio önizlemesi panoya izin vermezse elle kopyalanacak bir kutu göster
    const t = Object.assign(document.createElement('textarea'), { value: csv, className: 'eval-system', readOnly: true });
    t.dataset.cy = 'eval-csv'; btn.after(t); t.select(); btn.textContent = 'Kutudan kopyala';
  }
}
