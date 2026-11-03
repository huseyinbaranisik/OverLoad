"""Üçüncü tüketici: kendi sunucumuzda aynı model.onnx (FastAPI + onnxruntime). RELEASE.md → mimari karar.

    .venv/Scripts/uvicorn server.app:app --port 8200           (yerel)
    POST /predict  {"features": {"seviye": 2, "karar_no": 1, ...}}  →  {"p": 0.0478, "mod": "akis", ...}

Model, oyunla aynı commit'e sabit Hugging Face URL'sinden iner (MODEL_URL ile değiştirilebilir);
ulaşılamazsa repodaki model/model.onnx kullanılır ve /health bunu söyler.
"""
import json
import os
import urllib.request
from pathlib import Path

import numpy as np
import onnxruntime as ort
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

KOK = Path(__file__).resolve().parent.parent
CONFIG = json.loads((KOK / "model" / "config.json").read_text(encoding="utf-8"))
OZELLIKLER = [f["name"] for f in CONFIG["features"]]  # sıra sözleşmedir
MODEL_URL = os.environ.get(
    "MODEL_URL",
    "https://huggingface.co/huseyinbaran/overload-uyum/resolve/fb68aba957fc4c62f6b3b0f0f3e68c0d966ba984/model.onnx")


def yukle():
    try:
        return ort.InferenceSession(urllib.request.urlopen(MODEL_URL, timeout=20).read()), MODEL_URL
    except Exception as e:
        print(f"model URL'den inmedi ({e}); repodaki kopya kullanılıyor")
        return ort.InferenceSession(str(KOK / "model" / "model.onnx")), "model/model.onnx"


OTURUM, KAYNAK = yukle()
app = FastAPI(title="overload-uyum", version=CONFIG["version"])


class Girdi(BaseModel):
    features: dict[str, float]


@app.get("/health")
def health():
    return {"ok": True, "model_version": CONFIG["version"], "model_source": KAYNAK, "features": OZELLIKLER}


@app.post("/predict")
def predict(g: Girdi):
    if set(g.features) != set(OZELLIKLER):  # eksik ya da fazla özellik sessizce 0 sayılmasın
        raise HTTPException(422, f"features tam olarak şunlar olmalı: {OZELLIKLER}")
    x = np.array([[g.features[k] for k in OZELLIKLER]], np.float32)
    p = float(OTURUM.run(["probabilities"], {"input": x})[0][0, CONFIG["onnx"]["positive_class_index"]])
    return {"p": p, "mod": "destek" if p >= CONFIG["decision_threshold"] else "akis", "model_version": CONFIG["version"]}
