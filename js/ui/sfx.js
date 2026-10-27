'use strict';
// Retro ses efektleri: hepsi Web Audio ile anında üretilir (ses dosyası yok, telif yok, internetsiz çalışır).
let actx, master;

function tone({ f = 440, f2, type = 'square', t = 0.12, vol = 0.12, delay = 0 }) {
  const s = actx.currentTime + delay, o = actx.createOscillator(), g = actx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f, s);
  if (f2) o.frequency.exponentialRampToValueAtTime(f2, s + t);
  g.gain.setValueAtTime(vol, s);
  g.gain.exponentialRampToValueAtTime(0.0001, s + t);
  o.connect(g).connect(master);
  o.start(s); o.stop(s + t + 0.03);
}

function noise({ t = 0.2, vol = 0.2, lp = 1200, delay = 0 }) {
  const s = actx.currentTime + delay, len = Math.ceil(actx.sampleRate * t);
  const buf = actx.createBuffer(1, len, actx.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const src = actx.createBufferSource(), f = actx.createBiquadFilter(), g = actx.createGain();
  src.buffer = buf; f.type = 'lowpass'; f.frequency.value = lp;
  g.gain.setValueAtTime(vol, s); g.gain.exponentialRampToValueAtTime(0.0001, s + t);
  src.connect(f).connect(g).connect(master);
  src.start(s);
}

const SFX = {
  click: () => tone({ f: 540, type: 'square', t: 0.035, vol: 0.05 }),
  // eski telefon: iki kez çift çalma
  ring: () => { for (let r = 0; r < 2; r++) for (let k = 0; k < 8; k++) tone({ f: k % 2 ? 640 : 820, type: 'square', t: 0.05, vol: 0.06, delay: r * 0.5 + k * 0.05 }); },
  dispatch: () => { tone({ f: 200, f2: 900, type: 'sawtooth', t: 0.22, vol: 0.06 }); noise({ t: 0.15, vol: 0.05, lp: 3000 }); },
  arrive: () => { tone({ f: 988, type: 'triangle', t: 0.08, vol: 0.12 }); tone({ f: 1319, type: 'triangle', t: 0.14, vol: 0.12, delay: 0.08 }); },
  success: () => [523, 659, 784, 1047].forEach((f, i) => tone({ f, type: 'triangle', t: 0.14, vol: 0.12, delay: i * 0.07 })),
  fail: () => { tone({ f: 330, f2: 90, type: 'square', t: 0.4, vol: 0.08 }); tone({ f: 311, f2: 85, type: 'square', t: 0.4, vol: 0.06 }); },
  // darbe: derin "küt" + kısa patlama gürültüsü
  impact: () => { tone({ f: 150, f2: 38, type: 'sine', t: 0.4, vol: 0.55 }); noise({ t: 0.22, vol: 0.4, lp: 800 }); },
  impactBig: () => { tone({ f: 120, f2: 30, type: 'sine', t: 0.6, vol: 0.7 }); noise({ t: 0.35, vol: 0.5, lp: 600 }); tone({ f: 80, f2: 40, type: 'square', t: 0.3, vol: 0.1, delay: 0.05 }); },
  cool: () => { tone({ f: 1200, f2: 600, type: 'sine', t: 0.25, vol: 0.06 }); },
  alarm: () => { for (let i = 0; i < 6; i++) tone({ f: i % 2 ? 620 : 920, type: 'sawtooth', t: 0.16, vol: 0.05, delay: i * 0.17 }); },
  alert: () => { tone({ f: 1046, type: 'square', t: 0.07, vol: 0.06 }); tone({ f: 1397, type: 'square', t: 0.1, vol: 0.06, delay: 0.09 }); },
  tick: () => tone({ f: 1600, type: 'square', t: 0.03, vol: 0.05 }),
  crtOff: () => { tone({ f: 9000, f2: 300, type: 'sine', t: 0.45, vol: 0.03 }); noise({ t: 0.25, vol: 0.1, lp: 4000 }); },
  crtOn: () => { tone({ f: 300, f2: 11000, type: 'sine', t: 0.4, vol: 0.025 }); noise({ t: 0.15, vol: 0.08, lp: 5000, delay: 0.05 }); },
  win: () => [523, 659, 784, 1047, 1319].forEach((f, i) => tone({ f, type: 'square', t: i === 4 ? 0.5 : 0.12, vol: 0.07, delay: i * 0.1 })),
  lose: () => [392, 330, 262, 196].forEach((f, i) => tone({ f, type: 'triangle', t: 0.32, vol: 0.13, delay: i * 0.22 })),
};

function sfx(name) {
  if (TEST || (typeof fx !== 'undefined' && !fx.sound)) return;
  try {
    if (!actx) {
      actx = new (window.AudioContext || window.webkitAudioContext)();
      master = actx.createGain(); master.gain.value = 0.8; master.connect(actx.destination);
    }
    if (actx.state === 'suspended') actx.resume();
    SFX[name]();
  } catch {} // ses açılamazsa oyun sessiz devam eder
}

// her buton ve işaret dokunuşunda kısa tık
document.addEventListener('pointerdown', e => { if (e.target.closest('button, .marker, .toggle')) sfx('click'); });
