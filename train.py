"""Overload uyum modeli: data/oturumlar.csv → model/ (model.onnx + config.json + README.md)

    .venv/Scripts/python train.py        (Windows)   ·   .venv/bin/python train.py

Eval kapısı: spec.md §12.3'teki eşikler tutmazsa betik hata koduyla durur ve model/ klasörüne
hiçbir şey yazılmaz. Sabit tohum (13): aynı veriyle her ortamda aynı metrikler çıkar.
"""
import json
import sys
from pathlib import Path

import numpy as np
import onnxruntime as ort
import pandas as pd
import sklearn
from skl2onnx import to_onnx
from skl2onnx.common.data_types import FloatTensorType
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, roc_auc_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

KOK = Path(__file__).resolve().parent
VERI = KOK / "data" / "oturumlar.csv"
MODEL_DIR = KOK / "model"
SEED = 13
HEDEF = "kotu_secim"
# Sıra bir sözleşmedir: tarayıcı (js/uyum.js) ve tests/parite.py aynı sırayla gönderir.
OZELLIKLER = ["seviye", "karar_no", "ort_karar_sn", "onceki_kotu", "uyumsuz_ajan", "overload", "tutor_soru"]
ESIK = {"auc": 0.75, "accuracy": 0.70}  # spec.md §12.3, eğitimden önce yazıldı
KARAR_ESIGI = 0.5  # oyunda destek modunun açıldığı olasılık


def egit():
    veri = pd.read_csv(VERI)
    X, y = veri[OZELLIKLER].astype("float32"), veri[HEDEF]
    X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, stratify=y, random_state=SEED)
    model = Pipeline([("scaler", StandardScaler()), ("lr", LogisticRegression(random_state=SEED))])
    model.fit(X_tr, y_tr)
    p = model.predict_proba(X_te)[:, 1]
    metrik = {"auc": round(roc_auc_score(y_te, p), 4),
              "accuracy": round(accuracy_score(y_te, (p >= KARAR_ESIGI).astype(int)), 4)}
    return veri, model, X_te, metrik


def onnx_uret(model, X_te):
    """Başlangıç reposundaki onnx_aktar ile aynı kontrol: ONNX ↔ sklearn farkı ≤ 1e-4."""
    onx = to_onnx(model, initial_types=[("input", FloatTensorType([None, len(OZELLIKLER)]))],
                  options={id(model): {"zipmap": False}}, target_opset=17)
    bayt = onx.SerializeToString()
    oturum = ort.InferenceSession(bayt)
    p_onnx = oturum.run(["probabilities"], {"input": X_te.to_numpy(np.float32)})[0]
    fark = float(np.abs(p_onnx - model.predict_proba(X_te)).max())
    return bayt, fark


def main():
    for akis in (sys.stdout, sys.stderr):
        akis.reconfigure(encoding="utf-8")  # Windows konsolu cp1254
    veri, model, X_te, metrik = egit()
    bayt, fark = onnx_uret(model, X_te)
    metrik["onnx_max_diff"] = float(f"{fark:.2e}")
    print(f"test metrikleri: {metrik}  (eşik: {ESIK}, onnx ≤ 1e-4)")

    kalan = [f"{k} {metrik[k]} < {e}" for k, e in ESIK.items() if metrik[k] < e]
    if fark > 1e-4:
        kalan.append(f"onnx farkı {fark:.2e} > 1e-4")
    if kalan:
        sys.exit("✗ Eval kapısı geçilmedi, model yayınlanmaz: " + "; ".join(kalan))

    MODEL_DIR.mkdir(exist_ok=True)  # model kartı (README.md) elle yazılır, dokunulmaz
    (MODEL_DIR / "model.onnx").write_bytes(bayt)
    lr = model.named_steps["lr"]
    config = {
        "name": "overload-uyum",
        "version": "2.0.0",
        "task": "Karar penceresi açılırken oyuncunun cazip ama kötü seçeneği seçme olasılığı",
        "target": HEDEF,
        "class_labels": {"0": "iyi seçim (A/C/D)", "1": "kötü seçim (B ya da süre doldu)"},
        "classes": [str(c) for c in model.classes_],
        "features": [{"name": f, "index": i, "dtype": "float32",
                      "example": float(veri[f].iloc[1])} for i, f in enumerate(OZELLIKLER)],
        "onnx": {"input": "input", "input_shape": [None, len(OZELLIKLER)],
                 "output": "probabilities", "positive_class_index": 1, "opset": 17},
        "decision_threshold": KARAR_ESIGI,
        "acceptance": ESIK,
        "metrics": metrik,
        "coefficients": dict(zip(OZELLIKLER, map(lambda v: round(float(v), 4), lr.coef_[0]))),
        "data": {"rows": len(veri), "sessions": int(veri.oturum_id.nunique()),
                 "sources": veri.kaynak.value_counts().to_dict(),
                 "positive_rate": round(float(veri[HEDEF].mean()), 4),
                 "split": "test %25, tabakalı"},
        "seed": SEED,
        "sklearn_version": sklearn.__version__,
        "python_version": f"{sys.version_info.major}.{sys.version_info.minor}",
    }
    (MODEL_DIR / "config.json").write_text(json.dumps(config, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"✓ model/ yazıldı: model.onnx ({len(bayt)} bayt), config.json · onnx farkı {fark:.1e}")


if __name__ == "__main__":
    main()
