# Stitch prompt'u

Stitch'te **mobil** bir proje açılıp aşağıdaki prompt tek parça hâlinde yapıştırıldı. Stitch, İngilizce talimatlarla daha tutarlı sonuç verdiği için talimatlar İngilizce, ekrandaki yazılar Türkçedir. Oyunun ekran görüntüleri referans görsel olarak eklenebilir.

Ekranlar bittiğinde:
1. Her ekranı PNG olarak `design/` klasörüne aktar: `01-giris.png`, `02-sahne.png`, `03-son.png`.
2. Stitch bir DESIGN.md dışa aktarımı sunarsa `design/DESIGN.stitch.md` olarak kaydet.
3. Stitch projesinin paylaşım linkini `README.md` ve `design/README.md` dosyalarına ekle.

```text
Design 3 mobile screens (375×812, portrait) for a game called "OVERLOAD", a Dispatch-style crisis-management game. The player is the "Komuta Katmanı" (command layer) of a city hospital's IT systems and dispatches AI agents (Claude, Gemini, GPT, Llama, Mistral) to incidents on a city map. All UI text is in Turkish.

VISUAL STYLE (apply to all screens)
- Comic-book / cartoon look that still feels serious: thick dark outlines (3px, #0b1220) on every panel, button and card; hard offset shadows (4px 4px 0 #0b1220, no blur); flat colors, no gradients except subtle ones.
- Retro CRT command-center mood: faint horizontal scanlines over the whole screen, dark vignette in the corners, subtle halftone dot texture on the background.
- Palette: background #0f1c28 → #132636, panels #1a3247 / #22405a, text cream #f5ecd7, muted text #9db4c6. Accents: sun yellow #ffd23f (primary buttons), alert red #ff5263, orange #ff8a3d, green #5fe39a, teal #3fe0c5.
- Fonts: "Bungee" for titles, big numbers and the primary button; "Rubik" (400/700/800) for everything else.
- Rounded corners 12–14px. Primary buttons are chunky and yellow with a dark outline and a 6px solid bottom shadow (pressable look).

SCREEN 1 — MAIN MENU (Giriş)
- Top bar: left a small blinking red dot + "CANLI · ŞEHİR HASTANESİ" in small caps; right a square gear icon button (Ayarlar) with outline and hard shadow.
- Center: a small tilted red tag "YZM301 · SE PRIMER", then a huge stacked logo "OVER" (cream) / "LOAD" (red) in Bungee with a thick dark outline, and below it "KOMUTA KATMANI" in teal with wide letter spacing.
- Middle: a circular radar (dark teal disc, thick dark rim, thin teal rings and crosshair, a translucent rotating sweep wedge, 3 blips: 2 red, 1 orange, a teal center dot).
- Bottom: a row of 3 equal small selector buttons, each with a tiny teal caption and a value with a ▾ arrow: "ROL – Geliştirici", "ZORLUK – Normal", "ÖN AYAR – Yeni başladım". Below them a full-width big yellow "OYNA" button, and under it an underlined text link "Nasıl oynanır?".

SCREEN 2 — GAME MAP (Sahne)
- Top HUD panel with dark outline at the bottom: label "OVERLOAD" in teal Bungee, a thick outlined progress bar about 40% filled in orange with diagonal stripes, and "%42" on the right. Second row: a yellow clock badge "11:32" (dark text, outlined) on the left; on the right "Ana görev 1/3 · Çözülen 4".
- Main area: an oblique top-down city map in LIGHT GREEN tones (software / terminal feel): dark green ground, very dark roads with dashed light-green lane lines, a 3×5 grid of blocks with small light-green box buildings (dark outlines, three shades for top/front/side). Larger key buildings with dark labels on their roofs: Randevu, Ödeme, Bildirim, Hastane (center), Hasta Kayıt, Laboratuvar, Veritabanı.
- Incidents on the map: red warning triangles with a dark outline and "!!" inside, each surrounded by a circular countdown ring (yellow ring, turning red when almost empty) and a soft red glow on the ground. One marker is bigger and blinking (almost expired). One marker is orange (agent arrived, decision waiting). A colored agent trail line (glowing purple path) runs along the roads from Hastane to an incident, with a small colored dot at its head.
- A cream toast bubble near the bottom of the map with a dark outline: "⚠ Siber saldırı: Şifre deneme saldırısı".
- Incident strip below the map: a red "KRİTİK" pill, bold red title "Şifre deneme saldırısı", "· Randevu", and on the right "⏱ 23 sn". Next line: "İhtiyaç:" followed by two outlined chips "Güvenlik 5", "Hız 3".
- Bottom: a row of 5 agent cards (comic trading-card style): a colored top band in the agent's color (Claude #d97757, Gemini #8f7cf6, GPT #10a37f, Llama #3b82f6, Mistral #ffaf00), a round cream portrait circle overlapping the band with a simple logo-like icon, the agent name in bold, a status line ("Hazır", "Yolda", "Soğuyor 6 sn"), and a thin yellow energy bar with a small tick mark. Busy agents are greyed out.

SCREEN 3 — END SCREEN (Son)
- Small yellow caption "NÖBET BİTTİ · 17:00".
- Big green Bungee title "İYİ NÖBET!" with a dark offset text shadow (also design a variant title in red: "SİSTEM AŞIRI YÜKLENDİ").
- Muted paragraph: "Vardiya bitti. Üç ana çağrı da kapandı, sistem ayakta, hasta verisi güvende."
- Stats line: "Çözülen olay 9 · Patlayan 1 · Son Overload %38".
- An outlined panel: "Hedefin: Sistemi ayakta tutmak ✔" (check in green).
- Section caption "KARARLARIN", then a vertical list of decision cards (outlined, hard shadow, thick colored left border: green = success, red = fail). Each card: bold title like "KARAR 1 · MİMARİ · Eski sürüme geri dön", then a small line "Sistem 08:25'te eski sürümle ayağa kalktı." and a muted line "Neden: Geri almak seni bilinen, çalışan bir duruma götürür." Include one red-bordered card "PATLADI · Ödeme kuyruğu birikti".
- Full-width yellow "ANA MENÜ" button at the bottom.

Keep all three screens visually consistent, high contrast, readable on a phone, and touch targets at least 44px.
```
