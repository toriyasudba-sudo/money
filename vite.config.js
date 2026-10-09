import { defineConfig } from "vite";

export default defineConfig({
  // Relative asset paths work on GitHub Pages project sites such as /money/.
  base: "./",
  build: { outDir: "dist", assetsDir: "assets" }
});
