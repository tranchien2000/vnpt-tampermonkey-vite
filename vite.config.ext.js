import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.json';

export default defineConfig({
  plugins: [
    crx({ manifest }),
  ],
  build: {
    outDir: 'dist/extension',
    rollupOptions: {
      output: {
        // Đảm bảo các thư viện được gộp chung vào, không bị tách file assets quá nhiều
        manualChunks: undefined, 
      }
    }
  },
  resolve: {
    alias: {
      // Nếu có dùng alias thì định nghĩa ở đây
    }
  }
});
