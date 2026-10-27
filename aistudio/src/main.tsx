// Overload · Gemini tutor köprüsü (Google AI Studio, Vite şablonu).
// Oyun (index.html içine gömülü) tutor'a sorarken window.askTutor({ system, prompt }) varsa onu çağırır
// (js/tutor.js > tutorReply). Bu dosya onu, AI Studio'nun Secrets panelinden gelen GEMINI_API_KEY ile tanımlar.
// Anahtar yoksa fonksiyon tanımlanmaz; oyun hazır Sokratik sorulara düşer ve bunu tutor kutusunda yazar.
import { GoogleGenAI } from "@google/genai";

declare global {
  interface Window {
    askTutor?: (input: { system: string; prompt: string }) => Promise<string>;
  }
}
declare const process: { env: Record<string, string | undefined> }; // vite.config.ts > define

const apiKey = process.env.GEMINI_API_KEY;

if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
  const ai = new GoogleGenAI({ apiKey });
  // Sırayla denenir; bir model adı kaldırılmışsa (404) sıradakine geçilir ve o hatırlanır.
  const MODELS = ["gemini-3.8-flash", "gemini-flash-latest"];
  let current = 0;

  window.askTutor = async ({ system, prompt }) => {
    let lastErr: unknown;
    for (let i = current; i < MODELS.length; i++) {
      try {
        const res = await ai.models.generateContent({
          model: MODELS[i],
          contents: prompt,
          config: { systemInstruction: system, temperature: 0.4, maxOutputTokens: 2048 },
        });
        current = i;
        return (res.text ?? "").trim();
      } catch (err) {
        lastErr = err;
        if (!/404|NOT_FOUND|not found/i.test(String((err as Error)?.message ?? err))) throw err;
      }
    }
    throw lastErr;
  };
}
