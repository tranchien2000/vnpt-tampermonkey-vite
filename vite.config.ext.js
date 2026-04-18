import { defineConfig } from 'vite';
<<<<<<< HEAD
=======
import { resolve } from 'path';
import fs from 'fs';
>>>>>>> origin/main
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.json';

export default defineConfig({
  plugins: [
    crx({ manifest }),
  ],
  build: {
    outDir: 'dist/extension',
    rollupOptions: {
<<<<<<< HEAD
      input: {
        // Nếu bạn có file popup html
        // popup: 'index.html',
      },
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    hmr: {
      port: 5173,
    },
  },
=======
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
>>>>>>> origin/main
});
