import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwind from "@tailwindcss/vite";
import path from "node:path";
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwind()],
  server: {
    port: 3339,
    strictPort: true, // Cambia este puerto al que desees
  },
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
});
