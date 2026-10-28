# Google AI Studio sürümü

**Uygulama (sunucu tutor'lu çalışan sürüm):** https://ai.studio/apps/5bc7e967-3e3e-4ac6-8201-5ffd4aa2acdb
**İlk AI Studio uygulaması (Gemini'nin maketi):** https://ai.studio/apps/2c155956-66b2-4d5a-8ea2-17459bda9519

Bu klasör, oyunun AI Studio'daki **Vite + Express şablonuna** uyarlanmış hâlidir:

| Dosya | Ne |
|---|---|
| `index.html` | Oyunun tamamı tek dosyada (CSS ve JS gömülü) + `src/main.tsx` bağlantısı. **Elle düzenleme**: `node tools/build.mjs` ile üretilir. |
| `server.ts` | Express sunucusu. `POST /api/tutor` soruyu Gemini'ye gönderir; anahtar (`GEMINI_API_KEY`) sunucuda kalır. Yoğunlukta (503) iki model arasında sırayla dener, 404'te modeli atlar. Geliştirmede Vite'ı ara katman olarak çalıştırır. |
| `src/main.tsx` | Tarayıcı köprüsü: `window.askTutor({ system, prompt })` → `fetch("/api/tutor")`. |
| `vite.config.ts` | AI Studio şablonunun HMR ayarı. Anahtarı pakete yerleştirmez. |
| `package.json`, `tsconfig.json`, `.env.example` | Şablonun ayarları (sadeleştirilmiş). |
| `gemini-ilk-surum/` | **Süreç kanıtı:** Stitch ekranları ve spec verildiğinde Gemini'nin AI Studio'da ilk ürettiği React sürümü. Görsel bir maket; tutor, üç karar akışı ve sonlar yok. |

Oyun, tutor'a sorarken köprü varsa onu kullanır (`js/tutor.js` > `tutorReply`). Sunucu hata verirse (anahtar yok, kota bitti, model yanıt vermedi) olayın hazır Sokratik sorularına düşer ve tutor kutusunun altında bunu yazar.

## Neden sunucu?

İlk sürümde tutor tarayıcıdan Gemini'ye bağlanıyordu ve `vite.config.ts` anahtarı derlenen JavaScript'e yerleştiriyordu. AI Studio bunu "eski yöntem" olarak işaretledi; **Update app** ile çağrılar sunucuya taşındı. Artık anahtar sayfanın kaynağında yok.

AI Studio'nun ürettiği sunucuda oyunun kullanmadığı üç uç nokta daha vardı (`/api/gemini/generate`, `/api/gemini/stream`, `/live`). Bunlar, linki açan herkesin anahtarla istediği isteği atabileceği açık kapılardı; bu klasördeki `server.ts`'de yalnızca `/api/tutor` var.

## AI Studio'daki uygulamayı bu sürümle değiştirmek

1. Oyunda değişiklik yaptıysan önce paketle: `node tools/build.mjs`
2. AI Studio'da uygulamayı aç, kod görünümüne (`<>`) geç.
3. Şu dosyaların içeriğini bu klasördekilerle değiştir: `index.html`, `server.ts`, `src/main.tsx`, `vite.config.ts`, `package.json`
4. Gemini'nin ürettiği diğer dosyalar (`src/App.tsx`, `src/components/`, `src/data/`, `src/services/`, `src/types.ts`, `src/index.css`) kullanılmaz; silebilirsin.
5. Önizlemede oyunu aç. Ana menüdeki **Tutor eval modu** "Model bağlı: AI Studio Gemini köprüsü." demeli; bir karar penceresinde **🎓 Tutor'a sor** cevabının altında kaynak "gemini" olmalı.
6. Linki telefonda baştan sona oynayarak dene.

## Kota

Ücretsiz Gemini anahtarının günlük istek sınırı düşük. Eval modu 20 istek atar; sınır dolunca sunucu 429 döner ve kalan vakalar hazır sorulara düşer (ekranda "hazır (model hatası)" yazar). Kota her gün yenilenir.

## Tutor eval

Ana menünün altındaki **Tutor eval modu** 20 vakayı Gemini'ye gönderir. Ayrıntılar: `eval/README.md`. AI Studio'da alınan ekran görüntüleri: `eval/screenshots/`.
