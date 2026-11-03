"""README figürleri: assets/hero.png, assets/demo.gif, assets/terminal.png

    uv run --with pillow python tools/render_figures.py

Girdiler gerçek: assets/src/destek.png ve tools/_frames/ (tools/record_demo.py), assets/src/terminal.txt
(train.py ve tests/parite.py'nin gerçek çıktısı). Renkler css/base.css'ten, fontlar tools/fonts/ (OFL).
"""
import os
from PIL import Image, ImageDraw, ImageFont

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A, F = os.path.join(KOK, "assets"), os.path.join(KOK, "tools", "fonts")
INK, BG, BG2, PANEL, PAPER, MUTED = "#0b1220", "#0f1c28", "#132636", "#1a3247", "#f5ecd7", "#9db4c6"
SUN, ORANGE, TEAL, GREEN, RED = "#ffd23f", "#ff8a3d", "#3fe0c5", "#5fe39a", "#ff5263"


def font(name, size, weight=None):
    f = ImageFont.truetype(os.path.join(F, name), size)
    if weight:
        f.set_variation_by_axes([weight])
    return f


def dots(img, step=22, color=(255, 255, 255, 16)):
    """Oyundaki yarım ton nokta dokusu."""
    lay = Image.new("RGBA", img.size, (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
    for y in range(0, img.height, step):
        for x in range(0, img.width, step):
            d.ellipse((x, y, x + 3, y + 3), fill=color)
    img.alpha_composite(lay)


def pop(d, box, fill, r=22, off=8, stroke=5):
    """Çizgi roman kutusu: kalın kontur + sert gölge (css --pop)."""
    x0, y0, x1, y1 = box
    d.rounded_rectangle((x0 + off, y0 + off, x1 + off, y1 + off), r, fill=INK)
    d.rounded_rectangle(box, r, fill=fill, outline=INK, width=stroke)


def phone(screen, scale):
    """Gerçek ekran görüntüsünü telefon çerçevesine koyar; RGBA döner."""
    s = screen.resize((round(screen.width * scale), round(screen.height * scale)), Image.LANCZOS)
    pad, top = 18, 18
    w, h = s.width + 2 * pad, s.height + top + pad
    img = Image.new("RGBA", (w + 12, h + 12), (0, 0, 0, 0)); d = ImageDraw.Draw(img)
    pop(d, (0, 0, w, h), PANEL, r=46, off=12, stroke=6)
    mask = Image.new("L", s.size, 0); ImageDraw.Draw(mask).rounded_rectangle((0, 0, *s.size), 28, fill=255)
    img.paste(s, (pad, top), mask)
    return img


def hero():
    W, H = 1800, 920
    img = Image.new("RGBA", (W, H), BG); dots(img)
    d = ImageDraw.Draw(img)
    d.text((110, 90), "OVERLOAD", font=font("Bungee-Regular.ttf", 132), fill=SUN, stroke_width=6, stroke_fill=INK)
    d.text((116, 258), "Command Layer", font=font("Rubik.ttf", 50, 700), fill=PAPER)
    body = font("Rubik.ttf", 31, 400)
    for i, line in enumerate(["A hospital is crashing and the phone won't stop.",
                              "Dispatch AI agents, make the call, see the consequence.",
                              "A small in-browser model adapts the game to how you play."]):
        d.text((116, 345 + i * 48), line, font=body, fill=MUTED)
    chip, x, y = font("Rubik.ttf", 25, 700), 116, 520
    for t, c in [("HTML · CSS · JS", PAPER), ("scikit-learn + ONNX", TEAL), ("onnxruntime-web", SUN),
                 ("Cypress", PAPER), ("FastAPI", ORANGE)]:
        w = d.textlength(t, font=chip) + 40
        if x + w > 1000:
            x, y = 116, y + 74
        pop(d, (x, y, x + w, y + 52), BG2, r=14, off=5, stroke=3)
        d.text((x + 20, y + 11), t, font=chip, fill=c)
        x += w + 22
    p = phone(Image.open(os.path.join(A, "src", "destek.png")).convert("RGB"), 0.5)
    img.alpha_composite(p, (1130, (H - p.height) // 2))
    # sonuç kartı: train.py ve tests/parite.py çıktısı (assets/src/terminal.txt)
    cx, cy = 116, 700
    pop(d, (cx, cy, cx + 620, cy + 140), BG2, r=18, off=7, stroke=4)
    d.text((cx + 26, cy + 20), "ADAPTATION MODEL · SYNTHETIC DATA", font=font("Rubik.ttf", 19, 800), fill=TEAL)
    d.text((cx + 26, cy + 52), "AUC 0.892", font=font("Bungee-Regular.ttf", 44), fill=SUN)
    d.text((cx + 300, cy + 58), "gate ≥ 0.75", font=font("Rubik.ttf", 22, 600), fill=PAPER)
    d.text((cx + 300, cy + 88), "browser vs Python 4e-9", font=font("Rubik.ttf", 22, 500), fill=MUTED)
    img.convert("RGB").save(os.path.join(A, "hero.png"), optimize=True)


def demo():
    src = os.path.join(KOK, "tools", "_frames")
    files = sorted(f for f in os.listdir(src) if f.endswith(".png"))
    frames = []
    for f in files:
        p = phone(Image.open(os.path.join(src, f)).convert("RGB"), 0.75)
        c = Image.new("RGBA", (p.width + 60, p.height + 50), BG)  # düz zemin: GIF paleti gradyanı bantlar
        c.alpha_composite(p, (30, 20))
        frames.append(c.convert("RGB").quantize(colors=64, method=Image.Quantize.MEDIANCUT))
    dur = [125] * len(frames); dur[-1] = 1500
    frames[0].save(os.path.join(A, "demo.gif"), save_all=True, append_images=frames[1:], duration=dur, loop=0, optimize=True)


def check(d, x, y, s, color):
    """JetBrains Mono'da ✓ yok: iki çizgiyle çiz."""
    d.line((x, y + s * 0.55, x + s * 0.38, y + s * 0.9, x + s, y + s * 0.15), fill=color, width=4, joint="curve")


def terminal():
    lines = open(os.path.join(A, "src", "terminal.txt"), encoding="utf-8").read().rstrip().split("\n")
    mono, lh = font("JetBrainsMono.ttf", 22, 400), 36
    W = int(max(mono.getlength(l) for l in lines)) + 140
    H = 80 + lh * len(lines) + 50
    img = Image.new("RGBA", (W + 12, H + 12), BG); d = ImageDraw.Draw(img)
    pop(d, (0, 0, W, H), INK, r=18, off=10, stroke=4)
    d.rounded_rectangle((0, 0, W, 54), 18, fill=PANEL); d.rectangle((0, 36, W, 54), fill=PANEL)
    for i, c in enumerate((RED, SUN, GREEN)):
        d.ellipse((24 + i * 30, 18, 42 + i * 30, 36), fill=c)
    d.text((W // 2, 27), "SE primer · train + parity", font=font("Rubik.ttf", 19, 600), fill=MUTED, anchor="mm")
    y = 80
    for l in lines:
        if l.startswith("$"):
            d.text((40, y), l, font=mono, fill=SUN)
        elif l.startswith("✓"):
            check(d, 40, y + 6, 18, GREEN); d.text((72, y), l[1:].lstrip(), font=mono, fill=GREEN)
        else:
            d.text((40, y), l, font=mono, fill=PAPER)
        y += lh
    img.convert("RGB").save(os.path.join(A, "terminal.png"), optimize=True)


if __name__ == "__main__":
    hero(); terminal(); demo()
    print("assets/hero.png, assets/terminal.png, assets/demo.gif")
