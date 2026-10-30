"""Sentetik oturum üreteci → data/oturumlar.csv  (kaynak = "sentetik")

    .venv/Scripts/python data/uret.py      (Windows)   ·   .venv/bin/python data/uret.py

Kural (README ve SOZLUK.md'de de yazılı):
- Her oturum bir oyuncu, gizli bir "beceri" puanı taşır: beceri ~ N(μ, 1), μ = −0,6 / 0 / +0,6 (seviye 0/1/2).
- Oturum 3–8 karar sürer. Her kararda önce uyumsuz ajan gönderme şansı vardır: σ(−beceri − 0,8).
- Kötü seçim olasılığı: σ(−1,3 − 0,9·beceri + 0,55·onceki_kotu + 0,35·uyumsuz_ajan
                         + 0,02·(overload − 30) + 0,04·(ort_karar_sn − 20) − 0,3·min(tutor_soru, 3)).
- Kararın süresi tereddüdü yansıtır: 18 − 4·beceri + 8·kötü (+ gürültü), 3–90 sn.
- Overload: kötü seçimde +20, iyi seçimde −12, arada rastgele 0–10 artış; 0–100 arasında.
Gizli beceri modele verilmez; model onu yalnızca davranıştan (girdilerden) sezebilir.
"""
import sys
from pathlib import Path

import numpy as np
import pandas as pd

TOHUM = 13
OTURUM = 400
CIKTI = Path(__file__).resolve().parent / "oturumlar.csv"

sig = lambda x: 1 / (1 + np.exp(-x))


def uret(rng):
    satirlar = []
    for _ in range(OTURUM):
        oturum_id = rng.bytes(4).hex()  # rastgele; kişiyle bağı yok
        seviye = int(rng.choice(3, p=[0.4, 0.35, 0.25]))
        beceri = rng.normal([-0.6, 0.0, 0.6][seviye], 1.0)
        sureler, kotu_say, uyumsuz, overload, tutor = [], 0, 0, float(rng.uniform(0, 15)), 0
        for karar_no in range(1, int(rng.integers(3, 9)) + 1):
            uyumsuz += int(rng.random() < sig(-beceri - 0.8))
            ort = float(np.mean(sureler)) if sureler else 0.0
            logit = (-1.3 - 0.9 * beceri + 0.55 * kotu_say + 0.35 * uyumsuz
                     + 0.02 * (overload - 30) + 0.04 * (ort - 20) - 0.3 * min(tutor, 3))
            kotu = int(rng.random() < sig(logit))
            sure = float(np.clip(18 - 4 * beceri + 8 * kotu + rng.normal(0, 6), 3, 90))
            satirlar.append(dict(oturum_id=oturum_id, kaynak="sentetik", seviye=seviye, karar_no=karar_no,
                                 ort_karar_sn=round(ort, 1), onceki_kotu=kotu_say, uyumsuz_ajan=uyumsuz,
                                 overload=round(overload), tutor_soru=tutor, karar_sn=round(sure, 1),
                                 kotu_secim=kotu))
            # karar sonrası durum güncellemesi
            sureler.append(sure); kotu_say += kotu
            tutor += int(rng.poisson(0.5 if beceri < 0 else 0.2))
            overload = float(np.clip(overload + (20 if kotu else -12) + rng.uniform(0, 10), 0, 100))
    return pd.DataFrame(satirlar)


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")  # Windows konsolu cp1254
    df = uret(np.random.default_rng(TOHUM))
    df.to_csv(CIKTI, index=False)
    print(f"✓ {len(df)} satır, {df.oturum_id.nunique()} oturum → {CIKTI.name} · kötü seçim oranı %{100 * df.kotu_secim.mean():.1f}")
