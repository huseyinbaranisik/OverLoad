"""Test kahini (oracle): aynı model.onnx'i Python'da (onnxruntime) çalıştırır.

    .venv/Scripts/python tests/parite.py           → tests/parite.json'u (5 referans girdi + olasılık) yazar
    .venv/Scripts/python tests/parite.py --kontrol → kayıtlı değerlerle karşılaştırır, fark ≥ 1e-4 ise hata verir
    .venv/Scripts/python tests/parite.py --sunucu https://…onrender.com → sunucunun /predict cevabını karşılaştırır

Tarayıcı tarafı: cypress/e2e/model.cy.js aynı girdileri onnxruntime-web'e verir ve farkın < 1e-4 olduğunu doğrular.
"""
import json
import sys
from pathlib import Path

import numpy as np
import onnxruntime as ort

KOK = Path(__file__).resolve().parent.parent
TOLERANS = 1e-4
CONFIG = json.loads((KOK / "model" / "config.json").read_text(encoding="utf-8"))
OZELLIKLER = [f["name"] for f in CONFIG["features"]]
# Uçları ve eşiğin iki yanını kapsayan 5 oyuncu durumu
GIRDILER = [
    {"ad": "deneyimli, vardiya başı", "x": [2, 1, 0, 0, 0, 0, 0]},
    {"ad": "yeni, iki kötü seçim ve iki uyumsuz ajan", "x": [0, 3, 0.5, 2, 2, 50, 0]},
    {"ad": "orta, tereddütlü ama isabetli", "x": [1, 4, 32.5, 0, 1, 20, 2]},
    {"ad": "orta, bir kötü seçim ve iki uyumsuz ajan", "x": [1, 3, 24, 1, 2, 45, 0]},
    {"ad": "yeni, Overload tavanda", "x": [0, 6, 40, 4, 5, 100, 1]},
]


def hesapla():
    oturum = ort.InferenceSession(str(KOK / "model" / "model.onnx"))
    X = np.array([g["x"] for g in GIRDILER], np.float32)
    return oturum.run(["probabilities"], {"input": X})[0][:, CONFIG["onnx"]["positive_class_index"]]


def sunucu_kontrol(url):
    """Üçüncü tüketici (server/app.py): aynı 5 girdiyi HTTP ile sorar."""
    import urllib.request
    kayit = json.loads((KOK / "tests" / "parite.json").read_text(encoding="utf-8"))["cases"]
    fark = 0.0
    for k in kayit:
        istek = urllib.request.Request(url.rstrip("/") + "/predict", json.dumps({"features": k["features"]}).encode(),
                                       {"Content-Type": "application/json"})
        p = json.loads(urllib.request.urlopen(istek, timeout=90).read())["p"]  # ücretsiz katman uyanırken yavaş
        print(f"  sunucu {p:.8f} · Python {k['p']:.8f}  {k['name']}")
        fark = max(fark, abs(p - k["p"]))
    if fark >= TOLERANS:
        sys.exit(f"✗ sunucu paritesi bozuk: en büyük fark {fark:.2e} ≥ {TOLERANS}")
    print(f"✓ sunucu paritesi: 5 girdi, en büyük fark {fark:.1e} < {TOLERANS}")


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    if "--sunucu" in sys.argv:
        return sunucu_kontrol(sys.argv[sys.argv.index("--sunucu") + 1])
    p = hesapla()
    yol = KOK / "tests" / "parite.json"
    if "--kontrol" in sys.argv:
        kayit = json.loads(yol.read_text(encoding="utf-8"))["cases"]
        fark = max(abs(float(a) - k["p"]) for a, k in zip(p, kayit))
        if fark >= TOLERANS:
            sys.exit(f"✗ parite bozuk: en büyük fark {fark:.2e} ≥ {TOLERANS}")
        print(f"✓ parite: 5 girdi, en büyük fark {fark:.1e} < {TOLERANS}")
        return
    vaka = [{"name": g["ad"], "features": dict(zip(OZELLIKLER, g["x"])), "x": g["x"], "p": round(float(v), 8)}
            for g, v in zip(GIRDILER, p)]
    yol.write_text(json.dumps({"model_version": CONFIG["version"], "tolerance": TOLERANS,
                               "feature_order": OZELLIKLER, "cases": vaka}, indent=2, ensure_ascii=False) + "\n",
                   encoding="utf-8")
    for v in vaka:
        print(f"  p={v['p']:.4f}  {v['name']}")
    print(f"✓ {yol.relative_to(KOK)} yazıldı")


if __name__ == "__main__":
    main()
