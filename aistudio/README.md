# Google AI Studio sürümü

**Uygulama:** https://ai.studio/apps/2c155956-66b2-4d5a-8ea2-17459bda9519

Bu klasör, oyunun AI Studio'daki **Vite şablonuna** uyarlanmış hâlidir:

| Dosya | Ne |
|---|---|
| `index.html` | Oyunun tamamı tek dosyada (CSS ve JS gömülü) + `src/main.tsx` bağlantısı. **Elle düzenleme**: `node tools/build.mjs` ile üretilir. |
| `src/main.tsx` | Gemini köprüsü: `window.askTutor({ system, prompt })` fonksiyonunu `@google/genai` ile tanımlar. |
| `vite.config.ts` | AI Studio'nun Secrets panelindeki `GEMINI_API_KEY`'i `src/main.tsx`'e yerleştirir. |
| `package.json`, `tsconfig.json`, `.env.example` | Şablonun ayarları (sadeleştirilmiş). |
| `gemini-ilk-surum/` | **Süreç kanıtı:** Stitch ekranları ve spec verildiğinde Gemini'nin AI Studio'da ilk ürettiği React sürümü. Görsel bir maket; tutor, üç karar akışı ve sonlar yok. |

Oyun, tutor'a sorarken köprü varsa onu kullanır (`js/tutor.js` > `tutorReply`). Anahtar yoksa ya da model hata verirse olayın hazır Sokratik sorularına düşer ve tutor kutusunun altında bunu yazar.

## AI Studio'daki uygulamayı bu sürümle değiştirmek

1. Oyunda değişiklik yaptıysan önce paketle: `node tools/build.mjs`
2. AI Studio'da uygulamayı aç, kod görünümüne (`<>`) geç.
3. Şu üç dosyanın içeriğini bu klasördekilerle değiştir:
   - `index.html`
   - `src/main.tsx`
   - `vite.config.ts`
4. Gemini'nin ürettiği diğer dosyalar (`src/App.tsx`, `src/components/`, `src/data/`, `src/services/`, `src/types.ts`, `src/index.css`) artık kullanılmaz; silebilirsin.
5. Önizlemede oyunu aç. Bir karar penceresinde **🎓 Tutor'a sor** kutusunun altında "Cevaplar Gemini'den geliyor." yazmalı. Ana menüdeki **Tutor eval modu** ise "Model bağlı" demeli.
6. Linki telefonda baştan sona oynayarak dene.

## ⚠ Anahtar güvenliği

Bu sürümde tutor tarayıcıdan Gemini'ye bağlanır. `vite.config.ts`, anahtarı derlenen JavaScript dosyasına yerleştirir. Yerel testte bunu sahte bir anahtarla doğruladık: anahtar paketin içinde düz metin olarak duruyor.

- AI Studio'da **Share** ile paylaşılan link, AI Studio'nun kendi ortamında açılır; anahtar Secrets panelinde kalır.
- Uygulamayı **Publish** ile herkese açık bir siteye çıkarırsan anahtar sayfanın kaynağından okunabilir. Yayınlayacaksan ayrı bir anahtar kullan, Google Cloud'da bu anahtara kota sınırı koy ve ödev notlandıktan sonra anahtarı sil.

## Tutor eval

Ana menünün altındaki **Tutor eval modu** 20 vakayı Gemini'ye gönderir. Ayrıntılar: `eval/README.md`.
