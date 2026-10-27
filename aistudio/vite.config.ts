import { defineConfig, loadEnv } from "vite";

// AI Studio, GEMINI_API_KEY'i Secrets panelinden ortam değişkeni olarak verir;
// define, onu src/main.tsx içindeki process.env.GEMINI_API_KEY'e yerleştirir.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  return {
    define: {
      "process.env.GEMINI_API_KEY": JSON.stringify(env.GEMINI_API_KEY || process.env.GEMINI_API_KEY || ""),
    },
    server: {
      // AI Studio'nun kendi şablonundaki ayar: düzenleme sırasında titremeyi önler
      hmr: process.env.DISABLE_HMR !== "true",
      watch: process.env.DISABLE_HMR === "true" ? null : {},
    },
  };
});
