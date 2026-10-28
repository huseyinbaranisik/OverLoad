// Overload · AI Studio sunucusu (Express + Vite).
// Tarayıcı Gemini'ye doğrudan bağlanmaz: src/main.tsx soruyu POST /api/tutor'a gönderir, anahtar sunucuda kalır.
// AI Studio, GEMINI_API_KEY'i Secrets panelinden ortam değişkeni olarak verir.
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT || 3000);
const isProd = process.env.NODE_ENV === "production";
const MODELS = ["gemini-3.8-flash", "gemini-flash-latest"];

app.use(express.json({ limit: "64kb" }));

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") return null;
  return new GoogleGenAI({ apiKey, httpOptions: { headers: { "User-Agent": "aistudio-build" } } });
}

// Sokratik tutor: oyundaki karar pencereleri ve eval modu buraya sorar (js/tutor.js > tutorReply).
app.post("/api/tutor", async (req, res) => {
  const ai = getGeminiClient();
  if (!ai) return res.status(503).json({ error: "GEMINI_API_KEY is not configured on the server." });

  const { system, prompt } = req.body ?? {};
  if (!prompt) return res.status(400).json({ error: "Missing prompt in request body." });

  // Yoğunlukta (503) modeller arasında sırayla dene; bir tur da olmazsa kısa bekle (2, 4, 6... sn).
  // Model kaldırılmışsa (404) listeden çıkar. Diğer hatalar (429 kota dahil) istemciye döner.
  const live = [...MODELS];
  let lastErr: unknown;
  for (let round = 0; round < 6 && live.length; round++) {
    for (const m of [...live]) {
      try {
        const response = await ai.models.generateContent({
          model: m,
          contents: prompt,
          config: { systemInstruction: system || undefined, temperature: 0.4, maxOutputTokens: 2048 },
        });
        console.log(`Tutor cevabı: ${m} (tur ${round + 1})`);
        return res.json({ text: (response.text ?? "").trim(), model: m });
      } catch (err: any) {
        lastErr = err;
        const msg = String(err?.message ?? err);
        if (/404|NOT_FOUND|not found/i.test(msg)) { live.splice(live.indexOf(m), 1); continue; }
        if (/503|UNAVAILABLE|high demand|overloaded/i.test(msg)) { console.warn(`Gemini meşgul (${m})`); continue; }
        console.error("Gemini API error:", err);
        return res.status(500).json({ error: msg || "Failed to generate content" });
      }
    }
    await new Promise((r) => setTimeout(r, 2000 * (round + 1)));
  }

  console.error("All models failed:", lastErr);
  return res.status(500).json({ error: String((lastErr as Error)?.message ?? lastErr) });
});

app.get("/api/tutor/status", (_req, res) => res.json({ configured: !!getGeminiClient() }));

async function start() {
  if (!isProd) {
    const { createServer } = await import("vite");
    const vite = await createServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => res.sendFile(path.resolve(distPath, "index.html")));
  }
  app.listen(PORT, "0.0.0.0", () => console.log(`Server listening on port ${PORT} (${isProd ? "production" : "development"})`));
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
