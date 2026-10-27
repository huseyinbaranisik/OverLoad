'use strict';
// Overload değişince "darbe" hissi: sarsıntı, kenar flaşı, RGB kayması, uçan sayı, titreşim, ses.
const reduced = () => document.documentElement.classList.contains('reduce-motion') || matchMedia('(prefers-reduced-motion: reduce)').matches;

// sınıf animasyon bitince kalkar; yoksa #app'teki sarsıntı CRT geçişini ezerdi
function replay(el, cls) {
  el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls);
  el.addEventListener('animationend', function off(e) { if (e.target === el) { el.classList.remove(cls); el.removeEventListener('animationend', off); } });
}

function floatNum(d) {
  const bar = $('.hud .bar'); if (!bar || !$('#game').classList.contains('active')) return;
  const r = bar.getBoundingClientRect(), n = document.createElement('div');
  n.className = `float-num ${d > 0 ? 'up' : 'down'}`;
  n.textContent = `${d > 0 ? '+' : ''}${Math.round(d)}`;
  n.style.left = `${r.left + r.width * Math.min(S.heat, 92) / 100}px`;
  n.style.top = `${r.bottom + 2}px`;
  document.body.append(n);
  setTimeout(() => n.remove(), 1100);
}

function juiceHeat(d) {
  if (TEST) return;
  floatNum(d);
  replay($('#heatFill'), d > 0 ? 'bump' : 'cool');
  if (d < 0) { replay($('#hitFlash'), 'heal'); sfx('cool'); return; }
  const big = d >= 15;
  sfx(big ? 'impactBig' : 'impact');
  replay($('#hitFlash'), big ? 'hit-big' : 'hit');
  navigator.vibrate?.(big ? [70, 40, 120] : 50);
  if (reduced()) return;
  replay($('#app'), big ? 'shake-l' : 'shake');
  replay($('#game'), 'aberr');
}
