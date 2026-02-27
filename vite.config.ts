// vite.config.js
import { defineConfig } from "vite";

// vite.config.js
export default defineConfig({
  esbuild: {
    jsx: "transform",
    jsxFactory: "createElement",
    jsxFragment: "Fragment",
  },
});
