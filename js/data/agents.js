'use strict';
// Ajanlar, özellikleri ve logoları. Oyun, eval modu ve eval/run.mjs ortak kullanır (DOM'a dokunmaz).
const STATS = { teshis: 'Teşhis', hiz: 'Hız', guvenlik: 'Güvenlik', test: 'Test', altyapi: 'Altyapı' };
// Logolar: her modelin tanınır, sadeleştirilmiş SVG hâli (dış dosya yok, internetsiz de çalışır)
const svgLogo = body => `<svg class="lg" viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true">${body}</svg>`;
const fx2 = n => n.toFixed(2);
const LOGOS = {
  claude: svgLogo(`<path d="${Array.from({ length: 12 }, (_, i) => {
    const a = i * Math.PI / 6, r = i % 2 ? 7.6 : 10;
    return `M${fx2(12 + Math.cos(a) * 2.2)} ${fx2(12 + Math.sin(a) * 2.2)}L${fx2(12 + Math.cos(a) * r)} ${fx2(12 + Math.sin(a) * r)}`;
  }).join('')}" stroke="#d97757" stroke-width="2.7" stroke-linecap="round"/>`),
  gemini: svgLogo(`<defs><linearGradient id="gemG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4796e3"/><stop offset=".55" stop-color="#9168c0"/><stop offset="1" stop-color="#d6645d"/></linearGradient></defs>
    <path d="M12 1.5C12 7.3 16.7 12 22.5 12 16.7 12 12 16.7 12 22.5 12 16.7 7.3 12 1.5 12 7.3 12 12 7.3 12 1.5Z" fill="url(#gemG)"/>`),
  gpt: svgLogo([0, 60, 120].map(d => `<ellipse cx="12" cy="12" rx="9.2" ry="4.3" transform="rotate(${d} 12 12)" fill="none" stroke="#111" stroke-width="2"/>`).join('')),
  llama: svgLogo(`<path d="M2.8 12c0-3 1.9-5.2 4.4-5.2 3.7 0 5.8 10.4 9.6 10.4 2.5 0 4.4-2.2 4.4-5.2s-1.9-5.2-4.4-5.2c-3.8 0-5.9 10.4-9.6 10.4-2.5 0-4.4-2.2-4.4-5.2Z" fill="none" stroke="#0866ff" stroke-width="2.6"/>`),
  mistral: svgLogo(['10001', '11011', '11111', '10101', '10001'].map((row, y) =>
    [...row].map((c, x) => c === '1' ? `<rect x="${2 + x * 4}" y="${2 + y * 4}" width="4" height="4" fill="${['#ffd800', '#ffaf00', '#ff8205', '#fa500f', '#e10500'][y]}"/>` : '').join('')).join('')),
};
const AGENTS = [
  { id: 'claude', cost: 40, cd: 12, name: 'Claude', tag: 'Anthropic', color: '#d97757', icon: LOGOS.claude, bio: 'Kodu dikkatle okur, hatanın kökünü bulur, testsiz adım atmaz.', stats: { teshis: 5, hiz: 2, guvenlik: 4, test: 5, altyapi: 3 } },
  { id: 'gemini', cost: 30, cd: 8, name: 'Gemini', tag: 'Google', color: '#8f7cf6', icon: LOGOS.gemini, bio: 'Büyük altyapıyı ve sürümleri hızla tarar, gerekirse geri alır.', stats: { teshis: 3, hiz: 5, guvenlik: 2, test: 2, altyapi: 5 } },
  { id: 'gpt', cost: 30, cd: 8, name: 'GPT', tag: 'OpenAI', color: '#10a37f', icon: LOGOS.gpt, bio: 'Her işe yatkın; test senaryosu yazmakta usta.', stats: { teshis: 4, hiz: 3, guvenlik: 3, test: 4, altyapi: 3 } },
  { id: 'llama', cost: 15, cd: 4, name: 'Llama', tag: 'Meta · açık kaynak', color: '#3b82f6', icon: LOGOS.llama, bio: 'Hastanenin kendi sunucusunda çalışır; hasta verisi dışarı çıkmaz.', stats: { teshis: 2, hiz: 3, guvenlik: 5, test: 2, altyapi: 3 } },
  { id: 'mistral', cost: 20, cd: 5, name: 'Mistral', tag: 'Mistral AI', color: '#ffaf00', icon: LOGOS.mistral, bio: 'Hafif ve çok hızlı; küçük işleri anında bitirir.', stats: { teshis: 3, hiz: 5, guvenlik: 3, test: 3, altyapi: 2 } },
];
const ROLES = { gelistirici: 'Geliştirici', testci: 'Testçi', yonetici: 'Proje yöneticisi' };
