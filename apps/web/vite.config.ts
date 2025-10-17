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
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
  resolve: {
    alias: {
      "@api": new URL("../api/src", import.meta.url).pathname,
    },
  },
  build: { outDir: "dist/client" },
  define: {
    __BUILD_SHA__: JSON.stringify(process.env.GIT_SHA || process.env.GITHUB_SHA || "dev"),
  },
});
