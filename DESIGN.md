# DESIGN.md · Overload

Uygulamanın **gerçekte kullandığı** tasarım sistemi. Değerler `css/base.css` içindeki değişkenlerden gelir. Stitch'te üretilen tasarım ve aradaki farklar: [`design/README.md`](design/README.md).

## 1. Konsept

**Çizgi roman, ama ciddi.** Bir hastanenin gece komuta merkezi; eski bir CRT monitörde çalışan bir harita oyunu. Kalın koyu konturlar ve kaymış sert gölgeler oyuna çizgi roman havası verir. Palet koyu ve kontrollüdür, kırmızı yalnızca alarm içindir; böylece konu (hasta verisi, kesinti) hafife alınmış görünmez. Harita açık yeşildir: "yazılım / terminal" hissi ve binaların koyu zeminde kolay okunması için.

## 2. Renkler

| Değişken | Değer | Kullanım |
|---|---|---|
| `--ink` | `#0b1220` | Bütün konturlar, sert gölgeler, açık zemindeki yazılar |
| `--bg` / `--bg2` | `#0f1c28` / `#132636` | Uygulama zemini (üstte yarım ton nokta dokusu) |
| `--panel` / `--panel2` / `--panel3` | `#1a3247` / `#22405a` / `#2b5070` | Paneller, kartlar, seçenekler |
| `--paper` | `#f5ecd7` | Ana metin (krem kâğıt), konuşma balonları, toast |
| `--muted` | `#9db4c6` | İkincil metin |
| `--sun` | `#ffd23f` | Birincil buton, saat rozeti, seçili öğe, ipucu, enerji |
| `--teal` | `#3fe0c5` | Sistem durumu, etiketler, "telefon çalıyor" |
| `--red` | `#ff5263` | Alarm, kırmızı işaret, kötü son, "LOAD" |
| `--red-text` | `#ff8a95` | Koyu panel üstündeki küçük kırmızı yazı |
| `--orange` | `#ff8a3d` | Turuncu işaret (karar bekliyor), Overload orta seviye, ORTA ciddiyet |
| `--green` | `#5fe39a` | Başarı, iyi son, Overload düşük |
| `--sky` / `--violet` | `#63c7ff` / `#b996ff` | DÜŞÜK ciddiyet / mini görev |

**Harita:** zemin `#163626`, yollar `#0b1d14`, şerit `#c9f7a8` (kesikli). Binalar üç tonla çizilir: çatı `#9fe6a8`, yan yüzler `#5aae70` ve `#3d8a57`. Önemli binalar daha açıktır (çatı `#d4fbb8`) ve çatılarında koyu bir etiket taşır.

**Ajan renkleri:** Claude `#d97757`, Gemini `#8f7cf6`, GPT `#10a37f`, Llama `#3b82f6`, Mistral `#ffaf00`. Bu renkler kartın üst bandında, haritadaki izde ve radar grafiğinde kullanılır.

**Kural:** kırmızı yalnızca alarm, hata ve kötü son içindir; dekorasyon için kullanılmaz.

## 3. Yazı tipleri

| Rol | Yazı tipi | Örnek |
|---|---|---|
| Başlık, logo, sayılar, birincil buton | **Bungee** | OVERLOAD, OYNA, saat, %42 |
| Metin, seçenekler, diyalog | **Rubik** 400 / 500 / 700 / 800 | Karar metinleri, kartlar |
| Terminal mini görevi | sistem tek aralıklı (`ui-monospace`, Consolas) | `ufw deny from …` |

Google Fonts'tan yüklenir; internet yoksa sistem yazı tiplerine düşer.

## 4. Yerleşim

- Tek sütun, en fazla 480 px; telefon dikey (360–430 px) hedeflenir.
- **Vardiya ekranı (yukarıdan aşağıya):** HUD (Overload barı, saat, ilerleme) → harita (kalan alanın tamamı) → olay şeridi → 5 ajan kartı.
- Pencereler alttan açılan bir sayfa (bottom sheet) olarak gelir; aynı anda tek pencere açılır, gelen çağrı sıraya girer.
- Kenar boşluğu 12–16 px; köşe yarıçapı 12–14 px.

## 5. Bileşenler

| Bileşen | Tarif |
|---|---|
| **Birincil buton** | Sarı, 3 px mürekkep kontur, 6 px dolu alt gölge; basınca 4 px aşağı iner. Bungee. |
| **Hızlı seçim** | Menüde 3 eşit kutu: küçük turkuaz başlık, değer ve ▾. |
| **Alt sayfa** | Panel rengi, üstte yuvarlak köşe, 3 px kontur, yukarı kayarak açılır. |
| **Seçim listesi** | Konturlu kartlar; seçili olan sarı zemin + mürekkep yazı. |
| **Açma/kapama** | 50×28 px; açıkken yeşil. |
| **HUD** | "OVERLOAD" (turkuaz), konturlu, çizgili dolgu barı (yeşil → turuncu → kırmızı), yüzde, sarı saat rozeti. %70 üstünde bar kırmızı parlar, yazı yanıp söner. |
| **Harita işareti** | Mürekkep konturlu üçgen; kırmızı = açık, turuncu = karar bekliyor, soluk = ajan yolda. "!", "!!", "!!!" ciddiyeti gösterir. Etrafında kalan süre halkası; işaret zamanla büyür, son %30'da yanıp söner. Altında kırmızı/turuncu yer parıltısı. |
| **Ajan izi** | Ajan renginde, mürekkep gölgeli 4 px çizgi; yollar üzerinden gider, 1,5 sn sonra solar. |
| **Olay şeridi** | Ciddiyet etiketi (DÜŞÜK mavi, ORTA turuncu, KRİTİK kırmızı), başlık, bina, ⏱ kalan süre, ihtiyaç çipleri. |
| **Ajan kartı** | Üstte ajan renginde bant, ortada krem yuvarlak logo, isim, durum, sarı enerji çubuğu (görev maliyeti ince bir çizgiyle işaretli). Hazır değilse gri. |
| **Ajan penceresi** | Ajan renginde halkalı logo, 5 eksenli radar grafiği, özellik listesi (ihtiyaçlar sarı), enerji/görev/soğuma satırı. |
| **Konuşma balonu** | Krem zemin, mürekkep yazı, sert gölge, altta kuyruk. |
| **Seçenek** | Konturlu kart; harf soluk. ⭐ uzmanlık seçeneği sarı iç çerçeveli, mavi tonlu zemin ve "⭐ … uzmanlığı" etiketi taşır. |
| **Tutor kutusu** | Kesikli çerçeveli, açılıp kapanan kutu; oyuncu balonu sağda (panel), tutor balonu solda (krem); altında kaynak satırı. |
| **Sonuç** | ✔ Çözüldü (yeşil) / ✘ Çözülemedi (kırmızı) etiketi, "Ne oldu?" ve "Neden oldu?" başlıkları, ihtimal ve Overload satırı. |
| **Mini görevler** | Kablo: koyu panelde renkli fişler ve soketler, bağlanınca eğri kablo. Terminal: siyah ekran, yeşil tek aralıklı yazı, yanıp sönen imleç, komut parçası butonları. |
| **Son ekranı** | Bungee başlık (yeşil ya da kırmızı), istatistik, hedef kutusu, sol kenarı renkli karar kartları. |

## 6. Hareket

| Hareket | Süre | Ne zaman |
|---|---|---|
| CRT kapanma / açılma | 0,5 / 0,55 sn | Menü → oyun, oyun → son |
| Tarama çizgileri + hafif titreme | sürekli | Bütün ekran (Ayarlar'dan kapanır) |
| Alt sayfa açılışı | 0,22 sn | Her pencere |
| İşaret ve parıltı nabzı | 1,4 sn | Açık olaylar |
| Patlama halkası | 0,8 sn | Süresi dolan olay |
| Ekran sarsıntısı + kırmızı kenar flaşı + RGB kayması + uçan sayı | 0,35–0,7 sn | Overload ≥ 5 yükselince |
| Yeşil kenar flaşı + uçan sayı | 0,5 sn | Overload düşünce |
| Radar taraması | 3,2 sn | Ana menü |

## 7. Erişilebilirlik

- **Kontrast** (WCAG 2.1, hesaplandı): krem metin / zemin 14,7:1; soluk metin / panel 6,1:1; mürekkep / sarı buton 13,0:1; mürekkep / kırmızı etiket 5,9:1; küçük kırmızı yazı (`--red-text`) / panel 5,9:1. Kırmızı zemin üstündeki etiket yazıları bu yüzden beyaz değil mürekkeptir.
- **Klavye:** butonlar ve açma/kapamalar odaklanabilir; odakta 3 px sarı çerçeve görünür.
- **Hareket:** cihazda "hareketi azalt" açıksa ya da Ayarlar'da seçilirse CRT geçişi sade bir solmaya döner; sarsıntı, RGB kayması ve titreme kapanır.
- **Ses:** hiçbir bilgi yalnızca sesle verilmez; ses Ayarlar'dan kapanır.
- **Renk tek başına anlam taşımaz:** ciddiyet hem renkle hem "!" sayısıyla ve etiket yazısıyla; işaret durumu hem renkle hem olay şeridindeki metinle gösterilir.
- **Ekran okuyucu:** harita `aria-label` taşır; dekoratif öğeler (radar, CRT katmanı, darbe flaşı) `aria-hidden`; tutor sohbeti `aria-live="polite"`; pencereler `role="dialog"`.
- **Dokunma hedefleri:** butonlar, kartlar ve harita işaretleri en az 44 px.

## 8. Yapılmayanlar

- Açık tema yok: komuta merkezi konsepti bilerek koyu.
- Gerçek fotoğraf ya da gerçek logo dosyası yok; ajan logoları sadeleştirilmiş çizimlerdir.
- Yumuşak (bulanık) gölge yok; bütün gölgeler sert ve kaymış.
- Kırmızı dekorasyon yok.
