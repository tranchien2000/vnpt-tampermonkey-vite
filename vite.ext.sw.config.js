import { defineConfig } from 'vite';

// Build only the MV3 service worker as an ES module.
export default defineConfig({
  publicDir: 'extension/public',
  build: {
    outDir: 'dist/extension',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        sw: 'src/extension/sw.js',
      },
      output: {
        format: 'es',
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
    target: 'es2022',
    minify: false,
  },
});

