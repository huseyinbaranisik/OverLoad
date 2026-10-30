# Veri sözlüğü · `data/oturumlar.csv`

Her satır **bir karar**dır: oyuncunun bir karar penceresini açtığı an ve o pencerede ne seçtiği. Bir oturum (vardiya) birden çok satırdan oluşur.

| Sütun | Tür | Birim / değerler | Anlamı | Modelde |
|---|---|---|---|---|
| `oturum_id` | metin | 8 haneli onaltılık | Rastgele üretilen oturum kimliği. Kişiyle, cihazla ya da zamanla bağı yok. | – |
| `kaynak` | metin | `gercek` · `sentetik` | Satırın gerçek bir oyuncudan mı, üreteçten mi geldiği. **Bu sürümde hepsi `sentetik`.** | – |
| `seviye` | tamsayı | 0 · 1 · 2 | Menüdeki ön ayar: 0 yeni başladım, 1 biraz biliyorum, 2 deneyimliyim | ✔ |
| `karar_no` | tamsayı | 1, 2, … | Bu vardiyadaki kaçıncı karar penceresi | ✔ |
| `ort_karar_sn` | ondalık | saniye | Önceki kararlarda pencerenin açık kaldığı ortalama süre (tereddüt). İlk kararda 0. | ✔ |
| `onceki_kotu` | tamsayı | adet | Önceki kararlarda kötü seçenek (B) seçilen ya da süresi dolan karar sayısı | ✔ |
| `uyumsuz_ajan` | tamsayı | adet | Bu vardiyada başarı ihtimali %75'in altında kalan (işe uygun olmayan) ajan gönderme sayısı | ✔ |
| `overload` | tamsayı | % (0–100) | Pencere açıldığı andaki Overload barı | ✔ |
| `tutor_soru` | tamsayı | adet | Bu vardiyada tutor'a sorulan soru sayısı (pencere açılmadan önce) | ✔ |
| `karar_sn` | ondalık | saniye | Bu kararın pencerede geçen süresi | ✘ (karar anında bilinmez; sonraki satırın `ort_karar_sn`'sine girer) |
| `kotu_secim` | tamsayı | 0 · 1 | **Hedef.** 1 = B seçildi ya da süre doldu; 0 = A, C ya da D seçildi | hedef |

## Gizlilik (KVKK)

Ad, e-posta, cihaz kimliği, IP, konum ve saat toplanmaz. `oturum_id` rastgeledir; bir satırdan kişiye ulaşılamaz. Oyunun kendisi de bu sütunlar dışında bir şey kaydetmez.

## Sentetik üretici

`data/uret.py`, tohum **13**, 400 oturum (2183 satır). Aynı tohumla her çalıştırmada aynı dosya çıkar.

- Her oturumun gizli bir **beceri** puanı vardır: `beceri ~ N(μ, 1)`, μ = −0,6 / 0 / +0,6 (seviye 0/1/2). Bu puan CSV'ye yazılmaz; model onu yalnızca davranıştan sezebilir.
- Her oturum 3–8 karar sürer. Her kararda önce `σ(−beceri − 0,8)` olasılıkla uyumsuz ajan gönderilir.
- Kötü seçim olasılığı:
  `σ(−1,3 − 0,9·beceri + 0,55·onceki_kotu + 0,35·uyumsuz_ajan + 0,02·(overload − 30) + 0,04·(ort_karar_sn − 20) − 0,3·min(tutor_soru, 3))`
- Kararın süresi: `18 − 4·beceri + 8·kötü + N(0, 6)`, 3–90 sn arası.
- Karar sonrası: Overload kötü seçimde +20, iyi seçimde −12, ayrıca 0–10 rastgele artış (0–100 arası); tutor'a soru, becerisi düşük oyuncuda daha sık sorulur (Poisson 0,5 / 0,2).

Katsayılar, oyunun kendi kurallarından (kötü seçim +20 Overload, iyi seçim −12) ve "tereddüt eden, uyumsuz ajan gönderen, daha önce yanılan oyuncu yine yanılır" varsayımından seçildi. **Bu bir varsayımdır, ölçüm değildir**; gerçek oyuncu verisi geldiğinde katsayılar yeniden öğrenilmelidir.
