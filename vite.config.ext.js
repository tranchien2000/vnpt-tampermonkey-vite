import { defineConfig } from 'vite';
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.json';

export default defineConfig({
  plugins: [
    crx({ manifest }),
  ],
  server: {
    port: 5174,
    strictPort: false,
  },
  build: {
    outDir: 'dist/extension',
    emptyOutDir: true,
  }
});
