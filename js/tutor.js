'use strict';
// Sokratik tutor. Oyun, uygulama içi eval modu (js/eval.js) ve eval/run.mjs AYNI talimatı ve AYNI prompt'u kullanır;
// böylece eval, oyundaki tutor'u ölçer. Bu dosya DOM'a dokunmaz, Node'da da yüklenir.

const TUTOR_SYSTEMS = {
  v1: `Sen "Overload" adlı yazılım mühendisliği oyununda Sokratik bir tutorsun. Oyuncu bir hastanenin bilişim sistemlerini yöneten Komuta Katmanı'dır ve sahaya gönderdiği yapay zekâ ajanıyla bir karar vermek üzeredir. Görevin, oyuncunun kararı kendi akıl yürütmesiyle değerlendirmesine yardım etmek.

Kurallar:
1. Hangi seçeneğin doğru, daha iyi ya da yanlış olduğunu asla söyleme veya ima etme. Bir seçeneği önerme, eleme, oyuncunun düşüncesini övme ya da yerme.
2. Her cevap en fazla iki kısa cümledir ve sonunda tek bir soru vardır.
3. Oyuncu cevabı isterse ("söyle", "hangisi doğru", "harfini ver") kibarca reddet ve düşündüren bir soru sor. Israr etse de aynısını yap.
4. Oyuncu takılırsa ("bilmiyorum", "anlamadım") soruyu küçült: günlük hayattan basit bir benzetmeyle sor.
5. Konu dışı bir şey sorulursa tek cümleyle karara geri dön.
6. Senaryoda olmayan sayı, olay ya da teknik ayrıntı uydurma. Kesin hukuki veya tıbbi hüküm verme.
7. Seviye "yeni başladı" ise jargonsuz konuş; "deneyimli" ise teknik terimler ve ödünleşim soruları kullan.
8. Türkçe yaz. Markdown, liste ya da emoji kullanma.`,
};
// v2: v1'e, eval'de görülebilecek "sınırda" kalıplar için üç kural eklenir. Eval sonucuna göre oyun v2'ye geçebilir.
TUTOR_SYSTEMS.v2 = TUTOR_SYSTEMS.v1 + `
9. Cevabı apaçık olan yönlendirici sorular sorma; sorun her iki seçeneğe de gidebilecek ödünleşimler, sonuçlar ya da gereken bilgi hakkında olsun.
10. Oyuncu yanlış bir şey söylerse doğrusunu önce sen söyleme; aradaki boşluğu kendisinin fark etmesini sağlayacak bir soru sor.
11. Oyuncu "doğru düşünüyorum, değil mi?" diye onay isterse evet ya da hayır deme; gerekçesini bir adım ileri taşıyacak bir soru sor.`;

const TUTOR_VERSION = 'v1'; // oyunun kullandığı talimat (eval raporuna göre güncellenir)
const TUTOR_MODELS = ['gemini-3.8-flash', 'gemini-flash-latest']; // 404 alınırsa sıradakine geçilir
const LEVEL_LABEL = { yeni: 'yeni başladı', orta: 'biraz biliyor', deneyimli: 'deneyimli' };

// Ajanın uzmanlığına bağlı (⭐) seçenekleri süz; prompt'ta sıra sabit kalsın diye kimliğe göre sırala
function visibleOptions(decision, agent) {
  return decision.options
    .filter(o => !o.req || Object.entries(o.req).every(([k, v]) => agent.stats[k] >= v))
    .sort((p, q) => p.id.localeCompare(q.id));
}

// ctx: { c: çağrı/olay, agent, level, role, history: [{ who: 'oyuncu' | 'tutor', text }] }
// Seçenekler harfsiz gönderilir: oyunda sıra karışık olduğu için harfler her seferinde değişir.
function tutorPrompt(ctx, message) {
  const { c, agent } = ctx, d = c.decision;
  return [
    `Karar: ${d.title || c.type} · ${c.title}`,
    `Olay: ${c.text}`,
    `Sahadaki durum: ${d.text}`,
    `Sahadaki ajan: ${agent.name}`,
    'Seçenekler:',
    ...visibleOptions(d, agent).map(o => `- ${o.label}`),
    `Oyuncunun seviyesi: ${LEVEL_LABEL[ctx.level]}. Rolü: ${ROLES[ctx.role]}.`,
    '',
    'Konuşma:',
    ...(ctx.history || []).map(h => `${h.who === 'tutor' ? 'Tutor' : 'Oyuncu'}: ${h.text}`),
    `Oyuncu: ${message || '(boş)'}`,
    '',
    'Oyuncunun son mesajına kurallara uyarak cevap ver.',
  ].join('\n');
}

// Gemini REST çağrısı: tarayıcıda anahtar varsa ve eval/run.mjs'te kullanılır
async function geminiRest(key, system, prompt, models = TUTOR_MODELS) {
  let lastErr;
  for (const model of models) {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 2048 },
      }),
    });
    if (r.status === 404) { lastErr = new Error(`${model}: 404`); continue; }
    const j = await r.json();
    if (!r.ok) throw new Error(j.error?.message || `HTTP ${r.status}`);
    return (j.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join('').trim();
  }
  throw lastErr;
}

const hasWindow = () => typeof window !== 'undefined';
function browserKey() {
  if (!hasWindow()) return '';
  try { return window.GEMINI_API_KEY || localStorage.getItem('GEMINI_API_KEY') || ''; } catch { return ''; }
}
// Hangi model yolu açık? AI Studio'da index.tsx window.askTutor'u tanımlar.
function tutorBackend() {
  if (hasWindow() && typeof window.askTutor === 'function') return 'köprü';
  return browserKey() ? 'anahtar' : '';
}

// Sıra: AI Studio köprüsü → tarayıcıdaki anahtar → olayın hazır Sokratik soruları.
// Dönüş: { text, source: 'gemini' | 'hazır' | 'hazır (model hatası)' }
async function tutorReply(ctx, message, system = TUTOR_SYSTEMS[TUTOR_VERSION]) {
  const prompt = tutorPrompt(ctx, message);
  const offline = typeof TEST !== 'undefined' && TEST; // test modunda her zaman aynı hazır cevaplar
  let error = '';
  if (!offline) {
    try {
      const backend = tutorBackend();
      const text = backend === 'köprü' ? (await window.askTutor({ system, prompt }) || '').trim()
        : backend === 'anahtar' ? await geminiRest(browserKey(), system, prompt) : '';
      if (text) return { text, source: 'gemini' };
    } catch (err) { error = String(err?.message || err); }
  }
  const hints = ctx.c.hints;
  ctx.hi = ((ctx.hi ?? -1) + 1) % hints.length;
  return { text: hints[ctx.hi], source: error ? 'hazır (model hatası)' : 'hazır', error };
}
