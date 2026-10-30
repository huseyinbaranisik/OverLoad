# Sürüm notları · Overload uyum modeli

## v2.0.0 · uyum modeli

**Model reposu:** https://huggingface.co/huseyinbaran/overload-uyum
**Sabitlenen commit:** `HF_COMMIT`
**Oyunun indirdiği adres** (`js/uyum.js` → `UYUM_URL`, `main` değil):
```
https://huggingface.co/huseyinbaran/overload-uyum/resolve/HF_COMMIT/model.onnx
```

### Ne değişti?

| | v1 (geçen hafta) | v2.0 |
|---|---|---|
| Uyumu ne belirler? | Menüde seçilen seviye (sabit kural) | Seviye + oyuncunun o vardiyadaki davranışı (7 özellik) |
| Yeni başlayan | Her kararda 💡 ipucu | Değişmedi; ek olarak risk yüksekse tutor açık gelir |
| Deneyimli | Her kararda 60 sn sayaç | Risk yüksekse sayaç kalkar ve tutor açık gelir |
| Ölçüm | Yok | AUC 0,892 · doğruluk 0,832 (eşik AUC ≥ 0,75, eğitimden önce) |

Model: `StandardScaler → LogisticRegression`, ONNX (573 bayt), tarayıcıda `onnxruntime-web 1.22.0`. Ayrıntı: [`model/README.md`](model/README.md).

### Geri alma (rollback)

Model yalnızca davranışı ayarlar; oyunun kuralları ona bağlı değildir. Üç geri dönüş yolu, hızlıdan yavaşa:

1. **Modeli kapat (anında):** `js/uyum.js` → `UYUM_URL = []`. `uyumTahmin` `null` döner, oyun v1 kurallarına düşer (rozet "Uyum modeli yok · v1 kuralları" der). Bu yol `cypress/e2e` regresyon testleriyle güvence altında: 14 eski test modelden bağımsız geçiyor.
2. **Önceki modele dön:** `UYUM_URL`'deki commit hash'ini bir önceki sürümün hash'iyle değiştir. Hub'da eski commit silinmediği sürece dosya aynen indirilir; `main`'e yeni bir şey yüklemek oyunu etkilemez.
3. **Kodu geri al:** `git revert` ile v2 commit'leri; oyun v1'e döner.

Geri alma ölçütü: kanaryada (aşağıda) destek modundaki oyuncuların kötü seçim oranı akış modundakilerden düşmüyorsa ya da tarayıcıda model yüklenme hatası %1'i geçerse.

### Güvenli devreye alma

Oyunun sunucusu yok; model tarayıcıda çalışır. Bu yüzden trafik bölme, sayfanın kendi içinde rastgele bir oturum numarasıyla yapılır (oturum kimliği rastgele; kişiye bağlı değil).

| Aşama | Senaryomuzda nasıl | Neye bakılır | Geçiş koşulu |
|---|---|---|---|
| **Gölge (shadow)** | Model her karar penceresinde çalışır ve olasılığı kaydeder, ama oyunun davranışını **değiştirmez** (herkes v1 kurallarında). | Modelin "destek" dediği oyuncular gerçekten daha sık B seçiyor mu? Gerçek veride AUC. | Gerçek veride AUC ≥ 0,75 (spec eşiği) |
| **Kanarya %5** | Oturumların %5'inde destek/akış modu gerçekten uygulanır. | Destek modundaki kötü seçim oranı, aynı risk grubundaki v1 oyuncularına göre; model yükleme hataları; vardiya süresi. | Kötü seçim oranı düşüyor, hata < %1 |
| **Aşamalı %25 → %50 → %100** | Her adımda en az birkaç gün ya da 100 oturum beklenir. | Aynı ölçüler; iyi sonların oranı. | Bir önceki adımdaki ölçüler bozulmadıysa |

Bu sürümde veri sentetik olduğu için gölge aşaması **gerçek oyuncu verisi toplamanın** da yoludur: v2.1, gölgede toplanan `kaynak = gercek` satırlarla yeniden eğitilir.

### Mimari karar: model nerede çalışsın?

| Soru | Tarayıcı (`onnxruntime-web`) ✅ seçildi | Cihaz içi mobil (Expo + `onnxruntime-react-native`) | Kendi sunucumuz (Render, FastAPI / Rails) |
|---|---|---|---|
| **1. İnternet zorunlu mu, gecikme?** | İlk açılışta model (573 bayt) ve ONNX çalışma zamanı (WASM, birkaç MB) indirilir; sonra her tahmin yerel, milisaniyeler. | İnternetsiz çalışır; tahmin yerel ve hızlı. Uygulama mağazası/APK dağıtımı gerekir. | Her tahminde ağ gidiş-dönüşü; ücretsiz katmanda sunucu uyuyorsa ilk istek saniyeler sürer. Karar penceresi açılırken bu gecikme hissedilir. |
| **2. Veri cihazdan çıkar mı?** | Hayır. Davranış verisi tarayıcıda kalır (KVKK açısından en temiz yol). | Hayır. | Evet: her karar penceresinde 7 özellik sunucuya gider. Kişisel veri olmasa da kayıt, saklama ve aydınlatma yükü doğar. |
| **3. Model gizli kalır mı?** | Hayır: `model.onnx` herkese açık indirilir, katsayılar okunabilir. Bizde sorun değil: model zaten public repoda ve katsayılar model kartında. | Hayır: uygulama paketinden çıkarılabilir. | Evet, dosya gizli kalır; ama istek-yanıtla sorgulanarak davranışı tersine mühendislikle taklit edilebilir. |
| **Maliyet / bakım** | Sıfır; GitHub Pages ya da AI Studio yeter. | Expo derlemesi ve cihaz testi. | Ücretsiz katman sınırları, sunucu bakımı. |

**Karar:** tarayıcı. Oyun zaten tarayıcıda çalışıyor, model küçük ve gizli olması gereken bir şey içermiyor, en önemlisi oyuncunun davranış verisi cihazdan çıkmıyor. Sunucu seçeneği yalnızca modeli gizlemek gerekseydi ya da model büyük olsaydı anlamlı olurdu.

### Kaynaklar

- Amershi vd. (2019), *Software Engineering for Machine Learning: A Case Study*: ML yaşam döngüsünün veri toplamadan izlemeye dönen bir döngü olması; gölge aşamasının gerçek veri toplamaya bağlanması.
- Shankar vd. (2022), *Operationalizing Machine Learning: An Interview Study*: 3V. **Velocity:** tek komutla eğitim ve yayın. **Validation:** eğitimden önce yazılmış eval kapısı ve parite testi. **Versioning:** commit'e sabit model URL'si.
- Mitchell vd. (2019), *Model Cards for Model Reporting*: `model/README.md`'nin bölümleri (amaç, veri, metrikler, sınırlar, kullanılmaması gereken durumlar).
- Breck vd. (2017), *The ML Test Score*: ONNX ↔ sklearn eşdeğerlik kontrolü, eğitim/sunum tutarlılığı (parite), geri alma planı.
- Sommerville, *Software Engineering* (10. baskı), Bl. 8 (doğrulama ve geçerleme) ve Bl. 25 (konfigürasyon yönetimi).
