import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist/client",
  },
  define: {
    __BUILD_SHA__: JSON.stringify(process.env.GIT_SHA || process.env.GITHUB_SHA || "dev"),
  },
});
