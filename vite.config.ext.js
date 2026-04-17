import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';

export default defineConfig({
  build: {
    outDir: 'dist/extension',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        content: resolve(__dirname, 'src/features/autoFillForm.js'), // Điểm đầu vào chính cho extension
        sw: resolve(__dirname, 'src/api/gemini.js'), // Ví dụ Service Worker
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]'
      }
    }
  },
  plugins: [
    {
      name: 'copy-manifest',
      closeBundle() {
        if (fs.existsSync('manifest.json')) {
            fs.copyFileSync('manifest.json', 'dist/extension/manifest.json');
            console.log('✅ Copied manifest.json to dist/extension');
        }
      }
    }
  ]
});
