/* eslint-disable import/no-default-export */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  envPrefix: "VITE_",
  server: {
    port: 5173,
    proxy: {
      "/trpc": {
        target: "http://localhost:3000", // 👈 was 8080 earlier
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
  build: { outDir: "dist/client" },
  define: {
    __BUILD_SHA__: JSON.stringify(process.env.GIT_SHA || process.env.GITHUB_SHA || "dev"),
  },
});