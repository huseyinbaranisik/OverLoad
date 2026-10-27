// Overload: Gemini tutor köprüsü (Google AI Studio).
// Oyun, tutor'a sorarken window.askTutor({ system, prompt }) varsa onu çağırır (js/tutor.js > tutorReply).
// Bu dosya onu AI Studio'nun sağladığı anahtarla tanımlar; anahtar kodda durmaz.
// Model hata verirse oyun hazır Sokratik sorulara düşer ve bunu tutor kutusunda yazar.
import { GoogleGenAI } from "@google/genai";

declare global {
  interface Window {
    askTutor?: (input: { system: string; prompt: string }) => Promise<string>;
  }
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.API_KEY });

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
