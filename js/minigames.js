'use strict';
// Mini-game'ler: kritik olaylarda ajan sahaya varınca açılır. Hepsi onDone(skor 0..1) ile biter;
// skor başarı ihtimalini -20..+20 değiştirir (game.js > openDecision).
const shuffle = a => a.map(v => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(x => x[1]);
const MG_SECS = { cables: 12, terminal: 15 };

function runMinigame(spec, onDone) {
  const secs = TEST ? 0 : MG_SECS[spec.kind];
  (spec.kind === 'cables' ? mgCables : mgTerminal)(spec, secs, score => { closeModal(); sfx(score >= 0.75 ? 'success' : 'fail'); onDone(score); });
}

const mgHead = (title, sub, secs) => `<span class="tag mg">MİNİ GÖREV</span><h2>${title}</h2><p class="muted">${sub}</p>
  ${secs ? `<div class="timer" data-cy="mg-timer"><i></i><span>${secs}</span> sn</div>` : ''}`;

// Kablo bağlama: soldaki kabloya, sonra aynı renkteki sokete dokun
function mgCables(spec, secs, finish) {
  const COLORS = [['#ff5263', 'Kırmızı'], ['#ffd23f', 'Sarı'], ['#63c7ff', 'Mavi'], ['#5fe39a', 'Yeşil']];
  const order = shuffle([0, 1, 2, 3]);
  const links = {}; // sol kablo -> sağdaki soketin rengi
  let pick = null, done = false;
  openModal(`${mgHead('Kabloları bağla', spec.text, secs)}
    <div class="cables" data-cy="mg-cables">
      <svg class="wires"></svg>
      <div class="col">${COLORS.map((c, i) => `<button class="plug" data-l="${i}" data-cy="plug-${i}" style="--w:${c[0]}" aria-label="${c[1]} kablo"></button>`).join('')}</div>
      <div class="col">${order.map(ci => `<button class="sock" data-c="${ci}" data-cy="sock-${ci}" style="--w:${COLORS[ci][0]}" aria-label="${COLORS[ci][1]} soket"></button>`).join('')}</div>
    </div>
    <button class="primary" data-cy="mg-done">Bitir</button>`, el => {
    const box = el.querySelector('.cables'), svg = el.querySelector('.wires');
    const end = () => {
      if (done) return; done = true;
      finish(Object.entries(links).filter(([l, c]) => +l === c).length / 4);
    };
    const draw = () => {
      const b = box.getBoundingClientRect();
      svg.setAttribute('viewBox', `0 0 ${b.width} ${b.height}`);
      svg.innerHTML = Object.entries(links).map(([l, c]) => {
        const p = el.querySelector(`.plug[data-l="${l}"]`).getBoundingClientRect(), s = el.querySelector(`.sock[data-c="${c}"]`).getBoundingClientRect();
        const x1 = p.right - b.left, y1 = p.top + p.height / 2 - b.top, x2 = s.left - b.left, y2 = s.top + s.height / 2 - b.top, mx = (x1 + x2) / 2;
        return `<path d="M${x1} ${y1} C${mx} ${y1} ${mx} ${y2} ${x2} ${y2}" stroke="${COLORS[l][0]}"/>`;
      }).join('');
      el.querySelectorAll('.plug').forEach(p => p.classList.toggle('on', p.dataset.l === String(pick)));
    };
    el.querySelectorAll('.plug').forEach(p => p.onclick = () => { pick = +p.dataset.l; draw(); });
    el.querySelectorAll('.sock').forEach(s => s.onclick = () => {
      if (pick === null) return;
      const c = +s.dataset.c;
      for (const l in links) if (links[l] === c) delete links[l]; // dolu sokete takılırsa eskisi çıkar
      links[pick] = c; pick = null; sfx('tick'); draw();
      if (Object.keys(links).length === 4) setTimeout(end, 350);
    });
    el.querySelector('[data-cy=mg-done]').onclick = end;
    if (secs) startTimer(el, secs, end);
  });
}

// Terminal: komut parçalarına doğru sırayla dokunarak komutu kur
function mgTerminal(spec, secs, finish) {
  const tokens = shuffle([...spec.cmd, ...spec.decoys]);
  const typed = [];
  let done = false;
  openModal(`${mgHead('Komutu yaz', spec.goal, secs)}
    <div class="term" data-cy="mg-term"><div class="term-line">$ <span class="typed"></span><i class="caret"></i></div><p class="term-help">${spec.help}</p></div>
    <div class="tokens">${tokens.map((t, i) => `<button class="tok" data-i="${i}" data-t="${t}">${t}</button>`).join('')}</div>
    <div class="mg-row"><button class="ghost" data-cy="mg-undo">Geri al</button><button class="primary" data-cy="mg-run">Çalıştır ⏎</button></div>`, el => {
    const out = el.querySelector('.typed');
    const draw = () => {
      out.textContent = typed.map(i => tokens[i]).join(' ');
      el.querySelectorAll('.tok').forEach(b => b.disabled = typed.includes(+b.dataset.i));
    };
    const end = () => {
      if (done) return; done = true;
      const words = typed.map(i => tokens[i]);
      let right = 0; while (right < spec.cmd.length && words[right] === spec.cmd[right]) right++;
      // tam doğru komut 1; yarım kalan komut doğru başlangıcı kadar kısmi puan alır
      finish(right === spec.cmd.length && words.length === spec.cmd.length ? 1 : 0.6 * right / spec.cmd.length);
    };
    el.querySelectorAll('.tok').forEach(b => b.onclick = () => { typed.push(+b.dataset.i); draw(); });
    el.querySelector('[data-cy=mg-undo]').onclick = () => { typed.pop(); draw(); };
    el.querySelector('[data-cy=mg-run]').onclick = end;
    if (secs) startTimer(el, secs, end);
  });
}
