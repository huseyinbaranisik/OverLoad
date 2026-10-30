---
library_name: onnx
tags:
- tabular-classification
- onnx
- sklearn
- education
- game
pipeline_tag: tabular-classification
license: mit
---

# Overload uyum modeli · v2.0

Overload, hastane bilişim krizinde yazılım mühendisliği kararları verdiğin bir öğrenme oyunu. Bu model, bir karar penceresi açılırken oyuncunun **cazip ama kötü seçeneği seçme olasılığını** tahmin eder; oyun bu olasılığa göre desteği ayarlar.

## Amaç

| p | Oyunun davranışı |
|---|---|
| **≥ 0,5 · destek** | Tutor kutusu açık gelir ve ilk Sokratik soruyu kendiliğinden sorar; deneyimli moddaki süre sayacı kalkar. |
| **< 0,5 · akış** | Tutor kapalı gelir; süre sayacı seviyeye göre kalır. |

Model **cevabı söylemez** ve hangi seçeneğin doğru olduğunu bilmez; yalnızca "bu oyuncu şu an desteğe ihtiyaç duyuyor mu?" sorusunu cevaplar.

## Model

- `StandardScaler → LogisticRegression` (scikit-learn 1.9.1, Python 3.12, `random_state=13`)
- ONNX opset 17, 573 bayt. Girdi `input`: float32 `[n, 7]`; çıktı `probabilities`: `[n, 2]`, sınıf 1 = kötü seçim.
- Özellik sırası (sözleşme, `config.json` → `features`):
  `seviye, karar_no, ort_karar_sn, onceki_kotu, uyumsuz_ajan, overload, tutor_soru`

| Özellik | Katsayı (ölçeklenmiş) | Okuma |
|---|---|---|
| `uyumsuz_ajan` | +0,89 | İşe uygun olmayan ajan göndermek en güçlü uyarı |
| `onceki_kotu` | +0,83 | Daha önce yanılan yine yanılabilir |
| `ort_karar_sn` | +0,57 | Tereddüt |
| `overload` | +0,46 | Baskı altında hata artar |
| `tutor_soru` | −0,24 | Tutor'a soran daha az yanılır |
| `seviye` | −0,29 | Deneyim |
| `karar_no` | −0,43 | Diğerleri sabitken vardiya ilerledikçe oyuncu ısınır |

## Veri

`data/oturumlar.csv`: 400 oturum, 2183 karar, kötü seçim oranı %33. **Tamamı sentetiktir** (`kaynak = sentetik`); üretici kural ve tohum `data/SOZLUK.md` ve `data/uret.py`'de. Gerçek oyuncu verisi yok.

## Metrikler (%25 ayrılmış test, tabakalı)

| Metrik | Değer | Kabul eşiği (spec.md §12.3, eğitimden önce) |
|---|---|---|
| ROC-AUC | **0,892** | ≥ 0,75 ✔ |
| Doğruluk (eşik 0,5) | 0,832 | ≥ 0,70 ✔ |
| ONNX ↔ sklearn en büyük fark | 1,2e-7 | ≤ 1e-4 ✔ |

## Sınırlar

- **Yüksek AUC iyimserdir.** Veri, lojistik bir kuralla üretildi; lojistik regresyon bu kuralı kolayca geri bulur. Gerçek oyuncularda AUC'nin belirgin biçimde düşmesi beklenir.
- Gizli "beceri" puanı, üretici varsayımıdır. Gerçek oyuncular bu varsayıma uymayabilir (ör. hızlı ama dikkatsiz oyuncu).
- Model yalnızca bir vardiya içindeki davranışı görür; oyuncunun önceki oyunlarını bilmez.
- Rastgele olaylar ile ana çağrılar ayrılmadı; ikisi de aynı "karar" sayılır.

## Kullanılmaması gereken durumlar

- Öğrenciyi **notlandırmak, sıralamak ya da değerlendirmek** için. Model bir öğrenme desteği ayarıdır, başarı ölçüsü değildir.
- Gerçek bir hastane ya da gerçek bilişim olayı hakkında karar vermek için.
- Gerçek oyuncu verisiyle doğrulanmadan "öğrenciler şöyle davranır" diye bir sonuç çıkarmak için.

## Kullanım

```js
// tarayıcı (onnxruntime-web)
const s = await ort.InferenceSession.create(MODEL_URL);
const x = new ort.Tensor('float32', Float32Array.from([1, 3, 24, 2, 2, 60, 0]), [1, 7]);
const p = (await s.run({ input: x })).probabilities.data[1];
```

```python
import onnxruntime as ort, numpy as np
s = ort.InferenceSession("model.onnx")
p = s.run(["probabilities"], {"input": np.array([[1, 3, 24, 2, 2, 60, 0]], np.float32)})[0][0, 1]
```

Kaynak kod, eğitim ve testler: https://github.com/huseyinbaranisik/OverLoad
