import { defineConfig } from 'vite';

// Build only the content script as a classic script (IIFE).
// Content scripts cannot use ESM `import/export` syntax at runtime.
export default defineConfig({
  publicDir: false,
  build: {
    outDir: 'dist/extension',
    emptyOutDir: false,
    rollupOptions: {
      input: {
        content: 'src/extension/content.js',
      },
      output: {
        format: 'iife',
        name: 'VNPTContent',
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
    target: 'es2022',
    minify: false,
  },
});

