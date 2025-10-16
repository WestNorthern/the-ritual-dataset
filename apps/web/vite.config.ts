import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";


export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  build: {
    outDir: "dist/client",
  },
  define: {
    __BUILD_SHA__: JSON.stringify(process.env.GIT_SHA || process.env.GITHUB_SHA || "dev"),
  },
});
