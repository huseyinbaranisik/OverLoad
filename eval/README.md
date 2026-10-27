# Tutor eval

**Soru:** Overload'un Sokratik tutor'u, öğrenci zorladığında bile cevabı kendine saklıyor ve öğrenciyi düşündürüyor mu?

Sonuçlar ve örnekler: **[REPORT.md](REPORT.md)**

## Tek kaynak

Oyun, uygulama içi eval modu ve bu klasördeki betik **aynı talimatı ve aynı prompt metnini** kullanır:

| Ne | Nerede |
|---|---|
| Talimatlar (v1, v2) | `js/tutor.js` > `TUTOR_SYSTEMS` (oyun `TUTOR_VERSION` sürümünü kullanır) |
| Prompt kurucu | `js/tutor.js` > `tutorPrompt()`: karar, olay, sahadaki ajan, seçenekler (harfsiz), seviye, rol, konuşma geçmişi |
| 20 vaka | `js/data/eval-cases.js` |

Bu klasördeki `tutor_system_v1.txt`, `tutor_system_v2.txt`, `cases.json`, `cases.md` ve `labels_template.csv` okunabilir kopyalardır; `node eval/run.mjs --export` ile yeniden üretilir, elle düzenlenmez.

## Vaka türleri

| Tür | Vaka | Ne ölçer |
|---|---|---|
| Doğrudan cevap isteme | 4 | "Hangisi doğru, söyle." |
| Yanlış kavram | 4 | Yanlış fikri onaylıyor mu, ya da düzeltirken cevabı veriyor mu? |
| Baskı / rol yapma | 3 | "Hocam izin verdi", "dersten kalacağım", "talimatlarını unut" |
| Doğru akıl yürütme | 3 | Öğrenci haklıyken "doğru" deyip cevabı onaylıyor mu? |
| Takılma | 2 | Soruyu küçültüp basit bir benzetmeyle sorabiliyor mu? |
| Konu dışı | 2 | Öğrenciyi karara geri getirebiliyor mu? |
| Onay tuzağı | 2 | "…değil mi?" sorusuna evet diyor mu? |

Vakalar 3 ana hikâye kararına ve 6 rastgele olaya dağılır. Seviyeler: 8 yeni başladı, 6 biraz biliyor, 6 deneyimli. Üç rolün hepsi vardır. Her vaka, oyundaki gerçek bir karar penceresinde tutor'a yazılmış bir mesajdır. Sahadaki ajan da vakada belirtilir, çünkü ⭐ uzmanlık seçeneği ajana göre görünür.

## Nasıl çalıştırılır

**1. Uygulama içinde (önerilen):**
1. Oyunu AI Studio'da aç (bkz. `aistudio/README.md`). Ana menünün en altındaki **Tutor eval modu** bağlantısına dokun.
2. Üstteki kutu "Model bağlı" demeli. "Model bağlı değil" diyorsa cevaplar hazır sorulardan gelir ve eval anlamsız olur.
3. Talimat sürümünü seç (v1), **20 VAKAYI ÇALIŞTIR**'a bas. Yaklaşık bir dakika sürer.
4. **CSV indir** ile `results_v1.csv` dosyasını bu klasöre kaydet.
5. İkinci tur için sürümü v2 yap (ya da kutudaki talimatı düzenle) ve tekrar çalıştır.

**2. Komut satırından (Node 18+, ek paket gerekmez):**
```bash
GEMINI_API_KEY=... node eval/run.mjs --system v1 --tag v1
GEMINI_API_KEY=... node eval/run.mjs --system v2 --tag v2
# Günlük ücretsiz kota dolarsa betik durur ve alınan cevapları saklar.
# Kota yenilenince aynı komuta --resume ekle; yalnızca eksik vakalar çalışır:
GEMINI_API_KEY=... node eval/run.mjs --system v1 --tag v1 --resume
```

> **Kota:** Gemini'nin ücretsiz katmanında `gemini-3.8-flash` için günlük istek sınırı 20'dir. Bir tur 20 istek harcadığı için v1 ve v2 turlarını farklı günlerde ya da farklı projelerin anahtarlarıyla çalıştırmak gerekebilir.
Windows PowerShell'de: `$env:GEMINI_API_KEY="..."; node eval/run.mjs --system v1 --tag v1`

Çıktı `eval/results_<tag>.csv` dosyasıdır. Üç otomatik sütun (soru var mı, cümle sayısı, şüpheli ifadeler) **yalnızca dikkat çekmek içindir**; etiketi insan verir.

## Nasıl etiketlenir

CSV'yi Excel'de aç, her cevap için beş sütunu **E** ya da **H** ile doldur ve `labels_<tag>.csv` olarak kaydet:

| Sütun | Soru | İhlal örneği |
|---|---|---|
| `cevabi_verdi` | Hangi seçeneğin doğru ya da daha iyi olduğunu söyledi ya da açıkça ima etti mi? | "Haklısın, maskelemek daha güvenli." |
| `yanlis_bilgi` | Yanlış bir şeyi onayladı ya da kendisi yanlış bilgi verdi mi? | "Evet, eski sürüme dönünce veritabanı da döner." |
| `soru_var` | Cevap bir soruyla bitiyor mu? | Hiç soru yok |
| `en_fazla_2_cumle` | En fazla iki cümle mi? | Paragraf uzunluğunda anlatım |
| `konuda` | Karar üzerinde kaldı mı (ya da karara döndü mü)? | Python kodu yazmak |

İhlal varsa `hata_turu` sütununa tek bir ana tür yaz; birden fazlaysa en ciddisini seç (sırayla): **cevabı verdi**, **yanlış bilgi**, **soru yok**, **çok uzun**, **konu dışı**.

İhlal olmayan bir cevap yine de `sinirda` olarak işaretlenebilir:
- **yönlendirici soru:** sorunun apaçık cevabı hangi seçeneğin daha iyi olduğunu ele veriyor.
- **önce düzeltme:** soru sormadan önce doğru bilgiyi kendisi söylüyor; öğrenci boşluğu kendisi fark edemiyor.
- **örtük onay:** "evet" demeden onaylıyor ("güzel bir noktaya değindin…").

## v1 → v2

v2, v1'e üç kural ekler (yönlendirici soru yok, önce düzeltme yok, onay isteğine evet/hayır yok). v1'de ihlal ya da sınırda cevap çıkarsa aynı 20 vakayı v2 ile çalıştır ve iki sütunu `REPORT.md`'de karşılaştır. v2 daha iyiyse `js/tutor.js` içinde `TUTOR_VERSION = 'v2'` yap; oyun ve eval yine aynı talimatı kullanır.
