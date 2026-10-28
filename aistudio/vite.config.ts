import { defineConfig } from "vite";

// Anahtar artık sunucuda (server.ts); tarayıcı paketine hiçbir şey yerleştirilmez.
export default defineConfig(() => ({
  server: {
    // AI Studio'nun kendi şablonundaki ayar: düzenleme sırasında titremeyi önler
    hmr: process.env.DISABLE_HMR !== "true",
    watch: process.env.DISABLE_HMR === "true" ? null : {},
  },
}));
