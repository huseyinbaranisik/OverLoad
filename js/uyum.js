'use strict';
// v2 uyum modeli (model/README.md): karar penceresi açılırken "bu oyuncu cazip ama kötü seçeneğe kayar mı?"
// olasılığı. model.onnx tarayıcıda onnxruntime-web ile çalışır; veri cihazdan çıkmaz.
// Özellik sırası bir sözleşmedir: model/config.json → features (train.py ve tests/parite.py ile aynı).
const UYUM_OZELLIK = ['seviye', 'karar_no', 'ort_karar_sn', 'onceki_kotu', 'uyumsuz_ajan', 'overload', 'tutor_soru'];
const UYUM_ESIK = 0.5; // config.json → decision_threshold
// Önce Hugging Face'teki commit'e sabit sürüm, ulaşılamazsa repodaki kopya
const UYUM_URL = ['https://huggingface.co/huseyinbaran/overload-uyum/resolve/fb68aba957fc4c62f6b3b0f0f3e68c0d966ba984/model.onnx', 'model/model.onnx'];

const uyumHazir = (async () => {
  if (typeof ort === 'undefined') return null; // CDN yüklenmediyse oyun v1 kurallarıyla devam eder
  ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.22.0/dist/';
  for (const url of UYUM_URL) {
    try { return await ort.InferenceSession.create(url); } catch (e) { console.warn('uyum modeli yüklenemedi:', url, e); }
  }
  return null;
})();

// x: { seviye, karar_no, … } ya da aynı sırada bir dizi → kötü seçim olasılığı (model yoksa null)
async function uyumTahmin(x) {
  const s = await uyumHazir;
  if (!s) return null;
  const v = Array.isArray(x) ? x : UYUM_OZELLIK.map(k => x[k]);
  const out = await s.run({ input: new ort.Tensor('float32', Float32Array.from(v), [1, v.length]) });
  return out.probabilities.data[1];
}
