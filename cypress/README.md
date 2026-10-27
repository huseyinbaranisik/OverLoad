# Uçtan uca testler (Cypress)

| Dosya | İçerik |
|---|---|
| `e2e/paths.cy.js` | spec.md › 7.1'deki 6 yol (P1–P6): iyi son, KVKK sonu, uzmanlık ve orta yol seçenekleri, başarısızlıktan toparlanma, Overload sonu |
| `e2e/acceptance.cy.js` | spec.md › 7'deki kabul örnekleri AE-1 … AE-8 |
| `e2e/demo.cy.js` | 60 saniyelik demo videosu için tam bir vardiya |
| `support/e2e.js` | Ortak komutlar: `startGame`, `acceptCall`, `dispatchTo`, `decide`, `continue`, `playCall` |

Testler oyunu `index.html?test` adresinde açar: zar yok (ihtimal ≥ %50 her zaman başarı), animasyonlar kısa, Overload artışı ve rastgele olay yok, ana çağrılar art arda gelir. Oyunun kuralları ve sayıları değişmez.

Seçenekler ekranda karışık sırayla görünür; testler ekrandaki harfe değil seçeneğin kimliğine bağlıdır (`data-cy=option-A` doğru çözüm, `B` kötü seçenek, `C` orta yol, `D` uzmanlık).

## Çalıştırma

```bash
npm install          # Cypress'i kurar (ilk seferde birkaç dakika)
npm run test:e2e     # yollar + kabul örnekleri, ekransız
npm run cy:open      # testleri Cypress penceresinde tek tek izle
npm run demo         # 60 sn demo videosu
```

Video `cypress/videos/demo.cy.js.mp4` olarak kaydedilir (repoya girmez). Örneğin liste dışı bir YouTube videosu olarak yükleyip linkini README'ye ekle.

## Kabul örnekleri nasıl test ediliyor

| AE | Test | Nasıl |
|---|---|---|
| AE-1 | Yeni başlayan ipucu görür | "Yeni başladım" seçilir; olay şeridinde ve karar penceresinde ipucu var, ipucu ilk seçenekten önce, sayaç yok |
| AE-2 | Deneyimli oyuncunun süresi dolar | `?timer=3` ile sayaç kısaltılır, seçim yapılmaz; sonuç "(süre doldu…)" ve "%95 → %65" |
| AE-3 | Doğru yol | Gemini · Claude · Llama, hep A: İyi nöbet, 3 başarılı karar |
| AE-4 | KVKK sonu | 3. kararda B: karar "Çözüldü" görünür ama son "KVKK ihlali" |
| AE-5 | Ne oldu / neden oldu | Sonuç penceresinde iki başlık, dolu metinler, "%95 → %95" ve "Overload -12" |
| AE-6 | Enerji | Claude art arda iki görevden sonra "Enerji az"; pencerede "Enerjisi yetersiz", Gönder yok; kartlarda yüzde yok |
| AE-7 | Tutor | Cevap soru içerir ve hüküm vermez; Ayarlar'da Tutor kapalıyken kutu yok |
| AE-8 | Overload sonu | Beş ajanla üst üste B: "Sistem aşırı yüklendi" |

Test modunda tutor modele bağlanmaz, hazır sorularla cevap verir; AE-7 bu yüzden her çalıştırmada aynı sonucu verir. Gerçek modelin (Gemini) davranışı `eval/` klasöründe ölçülür.
