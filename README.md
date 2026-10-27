# <p align="center">🚨 OVERLOAD</p>
## <p align="center">A Mobile Decision Game About Sending the Right AI Agent</p>

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" />
  <img src="https://img.shields.io/badge/Course-YZM301%20SE%20Primer-17202C?style=for-the-badge" />
</p>

<p align="center">
  <a href="#-english"><b>🇬🇧 English</b></a> · <a href="#-türkçe"><b>🇹🇷 Türkçe</b></a>
</p>

---

## 🇬🇧 English

> **Course:** YZM301 · SE Primer assignment

### 📝 About the Project
**Overload** is a mobile decision game inspired by the map missions of *Dispatch*. The player is a hospital's Command Layer, and the agents are Claude, Gemini, GPT, Llama and Mistral. The phone rings, the problem lights up red on the map, the player sends the right agent and sees the technical consequence of the decision.

### 🌟 Features
* 🗺️ **2.5D bird's-eye SVG map** that runs smoothly on phones.
* ⚡ **Energy and cooldown per agent** to teach resource management.
* 🎓 **AI tutor:** the "Ask the tutor" box in the decision window asks Gemini if `localStorage.GEMINI_API_KEY` is set; otherwise it gives the event's built-in Socratic questions. Can be turned off in Settings.
* 🔊 **Sound:** all effects are generated with the Web Audio API (no audio files); can be turned off in Settings.

### 🚀 Running
Open `index.html` in a browser (no server needed). Add `?test` to the end of the address to run the tests. Rules and acceptance examples are in `spec.md`.

### ✂️ 3 Features I Deliberately Left Out
1. **Token economy as score:** per-agent energy and cooldown already teach resource management; a separate token score overshadowed what is actually taught (the consequence of a decision).
2. **3D city:** heavy on phones and hard to test; the 2.5D SVG map gives the same *Dispatch* feel.
3. **Accounts and leaderboard:** the game is a single-session learning experience; logging in only delays the first call.

---

## 🇹🇷 Türkçe

> **Ders:** YZM301 · SE Primer ödevi

### 📝 Proje Hakkında
**Overload**, *Dispatch*'in harita görevlerinden esinlenen mobil bir karar oyunudur. Oyuncu bir hastanenin Komuta Katmanı'dır; ajanları Claude, Gemini, GPT, Llama ve Mistral'dir. Telefon çalar, sorun haritada kırmızı yanar, oyuncu doğru ajanı gönderir ve kararının teknik sonucunu görür.

### 🌟 Özellikler
* 🗺️ Telefonda akıcı çalışan **kuş bakışı 2.5D SVG harita**.
* ⚡ Kaynak yönetimini öğreten **ajan başına enerji ve soğuma süresi**.
* 🎓 **AI tutor:** karar penceresindeki "🎓 Tutor'a sor" kutusu, `localStorage.GEMINI_API_KEY` ayarlıysa Gemini'ye sorar; değilse olayın hazır Sokratik sorularını verir. Ayarlar'dan kapatılabilir.
* 🔊 **Ses:** bütün efektler Web Audio ile üretilir (ses dosyası yok); Ayarlar'dan kapatılabilir.

### 🚀 Çalıştırma
`index.html` dosyasını tarayıcıda açın (sunucu gerekmez). Testler için adresin sonuna `?test` ekleyin. Kurallar ve kabul örnekleri `spec.md` dosyasındadır.

### ✂️ Bilinçli Olarak Yapmadığım 3 Özellik
1. **Puan olarak token ekonomisi:** Ajan başına enerji ve soğuma, kaynak yönetimini zaten öğretiyor; ayrıca bir token puanı, öğretilen şeyi (kararın sonucunu) gölgeliyordu.
2. **3D şehir:** Telefonda ağır çalışır ve test etmesi zor; kuş bakışı 2.5D SVG harita aynı *Dispatch* hissini veriyor.
3. **Hesap ve skor tablosu:** Oyun tek oturumluk bir öğrenme deneyimi; giriş yapmak, ilk çağrıya ulaşmayı geciktirmekten başka bir şey katmıyor.
