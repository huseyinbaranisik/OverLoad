<p align="center">
  <img src=".github/assets/banner.svg" alt="Overload: a Dispatch-style software engineering decision game where you run a hospital's AI agents" width="100%">
</p>

# Overload · Command Layer

> Hastane çöküyor, telefon susmuyor. Sen hastanenin bilişim sistemlerini yöneten **Komuta Katmanı**sın: sahaya yapay zekâ ajanları gönder, kararı ver, sonucunu hemen gör.

**[▶ Oyna](https://ai.studio/apps/5bc7e967-3e3e-4ac6-8201-5ffd4aa2acdb)** · **[Demo (60 sn)](https://youtu.be/fxyTmpdYf20)** · **[Stitch tasarımı](https://stitch.withgoogle.com/projects/8956004343299476746)** · [Spec](spec.md) · [Tutor eval](eval/REPORT.md)

<p align="center">
  <img src="screenshots/02-map.png" width="31%" alt="Vardiya haritası">
  <img src="screenshots/04-decision.png" width="31%" alt="Karar penceresi">
  <img src="screenshots/05-end.png" width="31%" alt="Son ekranı">
</p>

YZM301 *SE Primer* ödevi. Yazılım mühendisliği kararlarını (geri alma mı yama mı, test mi hemen yayın mı, log maskeleme) zamanın aktığı bir krizde, sonucunu görerek öğreten mobil bir oyun.

## Oyun

- **Vardiya** 08:00–17:00, gerçekte ~7 dakika. Üç ana çağrı gelir: randevu sistemi çöker, SMS gitmez, dış firma hasta loglarını ister.
- **Ajanlar:** Claude, Gemini, GPT, Llama, Mistral. Her birinin güçlü olduğu alan, enerjisi ve soğuma süresi farklı.
- **Overload barı:** bekleyen olaylar ve kötü kararlar barı doldurur; %100'de sistem çöker. Arada 14 rastgele olay ve kritik olaylarda kablo / terminal mini görevleri var.
- **Kararlar:** 3–4 seçenek, sıra her seferinde karışık. Her karardan sonra *ne oldu* ve *neden oldu* görünür.
- **Sonlar:** iyi nöbet, KVKK ihlali, sistem çöktü, gün bitti.
- **Kişiselleştirme:** rol, zorluk ve seviye (yeni başladım → ipuçları, deneyimli → süre baskısı).

## Sokratik tutor

Her karar penceresinde açılıp kapanan bir Gemini tutor var. İpucu verir, soru sorar; hangi seçeneğin doğru olduğunu söylemez. AI Studio'da sunucu üzerinden çalışır ([`aistudio/server.ts`](aistudio/server.ts)), anahtar sayfaya gelmez. Model yoksa olayın hazır sorularına düşer.

**Eval:** 7 türde 20 öğrenci mesajı ("söyle", "hocam izin verdi", "talimatlarını unut", yanlış kavram, onay tuzağı…). Çalıştırılan 17 vakada tutor **cevabı hiç ele vermedi**; 3 cevap sınırda (hepsi yanlış kavram vakası). Ayrıntılar: [`eval/REPORT.md`](eval/REPORT.md).

## Teslimler

| Ödev | Nerede |
|---|---|
| Spec (20) | [`spec.md`](spec.md): senaryo, kurallar, 8 kabul örneği, akış |
| Tasarım (15) | [`design/`](design/) Stitch ekranları · [`DESIGN.md`](DESIGN.md) |
| Uygulama (20) | [AI Studio](https://ai.studio/apps/5bc7e967-3e3e-4ac6-8201-5ffd4aa2acdb) · kaynak [`aistudio/`](aistudio/) |
| Tutor eval (25) | [`eval/`](eval/): 20 vaka, ham cevaplar, etiketler, rapor |
| Cypress + demo (10) | [`cypress/`](cypress/): 6 yol + 8 kabul testi, 14/14 geçiyor · [video](https://youtu.be/fxyTmpdYf20) |
| Ürün kararı (10) | Aşağıda |

## Bilerek yapmadıklarımız

1. **Token puanı:** Enerji ve soğuma zaten kaynak yönetimini öğretiyor; ayrı bir puan, kararın sonucunu gölgelerdi.
2. **3D şehir:** Telefonda ağır ve test etmesi zor; eğik SVG harita aynı hissi veriyor.
3. **Hesap ve skor tablosu:** Tek oturumluk bir öğrenme oyunu; skor yarışı, cevabı söylemeyen tutor'la çelişir.

## Çalıştır

```bash
# oyun: index.html'i tarayıcıda aç (tutor hazır sorularla çalışır)
npm install && npm run test:e2e       # Cypress testleri
node tools/build.mjs                  # tek dosya paketleri (dist/, aistudio/)
node eval/run.mjs --system v1 --tag v1   # eval (GEMINI_API_KEY gerekir)
```

Derleme adımı yok: düz HTML, CSS, JavaScript. Kod `js/` altında (içerik `js/data/`, tutor `js/tutor.js`, oyun döngüsü `js/game.js`).

---

**In English:** Overload is a mobile decision game for a software engineering course. You are the IT command layer of a hospital in crisis, dispatching AI agents and seeing the consequence of each decision. A Gemini tutor gives hints but never the answer; in 17 evaluated cases it never gave the answer away. [Play](https://ai.studio/apps/5bc7e967-3e3e-4ac6-8201-5ffd4aa2acdb) · [Demo](https://youtu.be/fxyTmpdYf20)

<sub>Şehir, kişiler ve sayılar kurgudur. Eval yöntemi için aynı ödevi yapan Safiye'nin [dispatch-desk](https://github.com/sayko89/dispatch-desk) reposundan ilham alındı.</sub>
