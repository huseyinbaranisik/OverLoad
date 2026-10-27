'use strict';
// CRT TV geçişi: ekran yatay bir çizgiye ezilip kapanır, sonra çizgi yatayda açılıp ekran dikeyde büyür.
// Animasyonlar css/crt.css'te; "hareketi azalt" açıkken aynı sınıflar basit bir solmaya döner.
function crtAnim(el, cls) {
  return new Promise(res => {
    const done = () => { el.removeEventListener('animationend', onEnd); clearTimeout(t); res(); };
    const onEnd = e => { if (e.target === el) done(); };
    const t = setTimeout(done, 1500); // animasyon hiç başlamazsa takılmasın
    el.addEventListener('animationend', onEnd);
    el.classList.add(cls);
  });
}

async function crtSwap(toId, beforeOn) {
  const app = $('#app');
  sfx('crtOff');
  await crtAnim(app, 'crt-off');
  show(toId);
  beforeOn && beforeOn();
  await new Promise(r => setTimeout(r, TEST ? 0 : 220));
  app.classList.remove('crt-off');
  sfx('crtOn');
  await crtAnim(app, 'crt-on');
  app.classList.remove('crt-on');
}
