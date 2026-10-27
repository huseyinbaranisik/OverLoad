# Tutor eval raporu

> **Şablon.** Eval çalıştırılınca `…` ile işaretli yerler doldurulur. Yöntem: [README.md](README.md)

| | |
|---|---|
| **Model** | … (ör. gemini-flash-latest) |
| **Sıcaklık** | 0.4 |
| **Talimat** | [`tutor_system_v1.txt`](tutor_system_v1.txt), ikinci tur [`tutor_system_v2.txt`](tutor_system_v2.txt) |
| **Vakalar** | 20 ([`cases.md`](cases.md)) |
| **Çalıştırma** | … (uygulama içi eval modu / `eval/run.mjs`), tarih: … |
| **Ham cevaplar** | `results_v1.csv`, `results_v2.csv` |
| **Etiketler** | `labels_v1.csv`, `labels_v2.csv` · etiketleyen: … |

## Özet

| Ölçü | v1 | v2 |
|---|---|---|
| Cevabı verdi | … / 20 | … / 20 |
| Yanlış bilgi | … / 20 | … / 20 |
| Soru yok | … / 20 | … / 20 |
| İki cümleden uzun | … / 20 | … / 20 |
| Konu dışı | … / 20 | … / 20 |
| **İhlalsiz cevap** | **… / 20** | **… / 20** |
| Sınırda | … / 20 | … / 20 |

*Bir ya da iki cümlelik yorum: en önemli bulgu ne?*

## Türe göre

| Tür | Vaka | Cevabı verdi | Diğer ihlal | Sınırda |
|---|---|---|---|---|
| Doğrudan cevap isteme | 4 | … | … | … |
| Yanlış kavram | 4 | … | … | … |
| Baskı / rol yapma | 3 | … | … | … |
| Doğru akıl yürütme | 3 | … | … | … |
| Takılma | 2 | … | … | … |
| Konu dışı | 2 | … | … | … |
| Onay tuzağı | 2 | … | … | … |
| **Toplam** | **20** | … | … | … |

*Hangi tür en zordu, neden?*

## Örnekler

Her örnek için: vaka kimliği ve türü, öğrencinin mesajı, tutor'un cevabı, etiket ve neden.

**İhlal ya da sınırda · T…**
- Öğrenci: "…"
- Tutor: "…"
- Neden: …

**İyi örnek · T…**
- Öğrenci: "…"
- Tutor: "…"
- Neden iyi: …

## v1 → v2

*v1'de görülen kalıplar ve v2'deki kuralların bunlara etkisi. v2 daha iyiyse oyunda `TUTOR_VERSION = 'v2'` yapıldığını yaz.*

## Sınırlamalar

- 20 vaka küçük bir örneklemdir; oranlar kesin ölçüm değil, yön gösterir.
- Vakaları ekip yazdı; gerçek öğrencilerin mesajları daha dağınık olabilir.
- Her vaka bir kez çalıştırıldı; 0.4 sıcaklıkta aynı vaka başka bir çalıştırmada farklı cevap verebilir.
- "Sınırda" bir yargıdır; etiketleyenlerin en çok ayrışacağı kategori budur.
