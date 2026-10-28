// Overload · Gemini tutor köprüsü (Google AI Studio, sunucu sürümü).
// Oyun (index.html içine gömülü) tutor'a sorarken window.askTutor({ system, prompt }) varsa onu çağırır
// (js/tutor.js > tutorReply). Bu dosya soruyu server.ts'deki POST /api/tutor'a iletir; anahtar tarayıcıya hiç gelmez.
// Sunucu hata verirse oyun olayın hazır Sokratik sorularına düşer ve bunu tutor kutusunda yazar.

declare global {
  interface Window {
    askTutor?: (input: { system: string; prompt: string }) => Promise<string>;
  }
}

window.askTutor = async ({ system, prompt }) => {
  const res = await fetch("/api/tutor", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ system, prompt }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Sunucu hatası: HTTP ${res.status}`);
  }
  const data = await res.json();
  return (data.text ?? "").trim();
};

export {};
