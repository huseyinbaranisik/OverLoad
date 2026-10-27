# Google AI Studio sürümü

Bu klasördeki iki dosya, oyunun AI Studio'da çalışan sürümüdür:

| Dosya | Ne |
|---|---|
| `index.html` | Oyunun tamamı tek dosyada (CSS ve JS gömülü) + `@google/genai` importmap + `index.tsx` bağlantısı. **Elle düzenleme**: `node tools/build.mjs` ile üretilir. |
| `index.tsx` | Gemini köprüsü: `window.askTutor({ system, prompt })` fonksiyonunu tanımlar. Anahtarı AI Studio sağlar; kodda anahtar yoktur. |

Oyun, tutor'a sorarken bu fonksiyon varsa onu kullanır (`js/tutor.js` > `tutorReply`). Yoksa ya da model hata verirse olayın hazır Sokratik sorularına düşer ve tutor kutusunun altında bunu yazar.

## Yükleme

1. Oyunda değişiklik yaptıysan önce paketle: `node tools/build.mjs`
2. [aistudio.google.com](https://aistudio.google.com) > **Build** > yeni bir uygulama aç.
3. Kod düzenleyicide `index.html` dosyasının içeriğini bu klasördeki `index.html` ile değiştir.
4. `index.tsx` dosyasının içeriğini bu klasördeki `index.tsx` ile değiştir. AI Studio'nun oluşturduğu başka dosyalar (ör. `App.tsx`) varsa ve `index.tsx` artık onları içe aktarmıyorsa silebilirsin.
5. Önizlemede oyunu aç; bir karar penceresinde **🎓 Tutor'a sor** kutusunun altında "Cevaplar Gemini'den geliyor." yazmalı.
6. Paylaş / dağıt ile linki al ve README'deki "Oyna" satırına ekle. Linki telefonda baştan sona oynayarak dene.

## Tutor eval

AI Studio sürümünde ana menünün altındaki **Tutor eval modu** 20 vakayı Gemini'ye gönderir. Ayrıntılar: `eval/README.md`.

> Not: AI Studio'nun Build ortamı zamanla değişebilir. Düz HTML'i çalıştırmazsa, oyunu React proje yapısına uyarlamak gerekebilir.
