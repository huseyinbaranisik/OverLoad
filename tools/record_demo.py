"""README demosu ve hero için gerçek kayıt: oyunu ?test modunda (deterministik) telefon boyutunda oynar.

    python -m http.server 8100      (repo kökünde)
    uv run --with playwright python tools/record_demo.py http://localhost:8100

Çıktı: tools/_frames/*.png (GIF kareleri, git'e girmez) ve assets/src/destek.png (hero ekranı).
Akış AE-9 ile aynı: iki kötü seçimden sonra model destek moduna geçer, tutor kendiliğinden açılır.
"""
import glob, os, shutil, sys, time
from playwright.sync_api import sync_playwright

URL = sys.argv[1].rstrip("/")
KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(KOK, "tools", "_frames")
shutil.rmtree(OUT, ignore_errors=True); os.makedirs(OUT)
n = 0


def grab(pg, sec, fps=8):
    global n
    end = time.time() + sec
    while time.time() < end:
        t = time.time(); pg.screenshot(path=os.path.join(OUT, f"{n:04d}.png")); n += 1
        time.sleep(max(0, 1 / fps - (time.time() - t)))


local = sorted(glob.glob(os.path.expanduser("~/AppData/Local/ms-playwright/chromium-*/chrome-win64/chrome.exe")))
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=local[-1]) if local else p.chromium.launch()
    pg = b.new_page(viewport={"width": 390, "height": 844}, device_scale_factor=1)
    hero = b.new_page(viewport={"width": 390, "height": 844}, device_scale_factor=2)

    def oyna(page, kayit):
        w = (lambda s: grab(page, s)) if kayit else (lambda s: time.sleep(min(s, 0.4)))
        c = lambda sel: (page.click(f"[data-cy={sel}]"), w(0.5))
        page.goto(URL + "/index.html?test", wait_until="networkidle"); w(1.5)
        c("pick-preset"); c("level-yeni"); c("sheet-done"); c("play"); w(1.0)
        page.wait_for_selector("[data-cy=accept-call]"); w(0.8); c("accept-call")
        for agent, secim in (("llama", "B"), ("mistral", "B"), ("claude", None)):
            page.wait_for_selector(f"[data-cy='agent-{agent}'].ready"); c(f"agent-{agent}"); c("send")
            page.click("[data-cy=marker-randevu].orange", force=True)
            page.wait_for_selector("[data-cy=option-A]"); w(1.2)
            if secim:
                c(f"option-{secim}"); page.wait_for_selector("[data-cy=why]"); w(1.5); c("result-continue")
        page.wait_for_selector("[data-cy=tutor-reply]"); w(2.5)

    oyna(pg, True)
    oyna(hero, False)
    hero.screenshot(path=os.path.join(KOK, "assets", "src", "destek.png"))
    b.close()
print(n, "kare ->", OUT)
