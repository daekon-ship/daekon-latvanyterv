import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages projektoldal: https://daekon-ship.github.io/daekon-latvanyterv/
export default defineConfig({
  base: "/daekon-latvanyterv/",
  plugins: [react()],
  build: {
    target: "es2020",
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ["three"],
          gsap: ["gsap", "gsap/ScrollTrigger"],
        },
      },
    },
  },
});
