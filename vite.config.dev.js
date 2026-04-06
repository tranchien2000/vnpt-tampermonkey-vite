import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: false, // Không xóa myscript.user.js production
    lib: {
      entry: 'src/main.dev.js',
      name: 'VnptDev',
      formats: ['iife'],
      fileName: () => 'myscript.dev.js'
    },
    rollupOptions: {
      output: {
        // Không minify để dễ debug
        compact: false,
      }
    }
  },
  // Không minify cho dev
  esbuild: {
    minify: false,
  }
});
