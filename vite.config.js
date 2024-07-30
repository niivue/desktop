import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import wasm from 'vite-plugin-wasm';
import { copyFileSync } from 'fs';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), wasm(),],
  server: {
    port: 5184,
  },
  // make all paths relative
  base: "./",
  // update the root directory to point to index.html in the ui folder
  root: "./src/ui/",
  build: {
    outDir: "../electron/ui",
  },
});

/*
optimizeDeps: {
    include: ['@niivue/niimath-js/src/process-image.wasm'],
  },

rollupOptions: {
      output: {
        assetFileNames: 'assets/[name][extname]',
      },
    },
    assetsInlineLimit: 0, // Ensure assets like WASM are not inlined but copied
    */