import { defineConfig } from "tailwindcss";
import typography from "@tailwindcss/typography";

export default defineConfig({
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["IBM Plex Sans", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "monospace"],
      },
      colors: {
        "surface-light": "#ffffff",
        "surface-dark": "#000000",
        "text-light": "#000000",
        "text-dark": "#ffffff",
        "text-muted": "#666666",
        "border-light": "#e5e5e5",
        "border-dark": "#1a1a1a",
      },
      boxShadow: {
        subtle: "0 2px 6px rgba(0,0,0,0.08)",
        strong: "0 8px 24px rgba(0,0,0,0.25)",
      },
    },
  },
  plugins: [typography],
});
