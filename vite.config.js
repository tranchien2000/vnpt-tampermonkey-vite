import { defineConfig } from 'vite';

const tampermonkeyHeader = `// ==UserScript==
// @name         VNPT Word Automation (Vite)
// @namespace    http://tampermonkey.net/
// @version      1.5
// @description  Tool tự động lấy dữ liệu trên portal VNPT, bọc qua Vite
// @author       You
// @match        *://hopdong.vnpt.vn/*
// @require      https://cdn.jsdelivr.net/npm/docxtemplater@3.37.11/build/docxtemplater.js
// @require      https://cdn.jsdelivr.net/npm/pizzip@3.1.4/dist/pizzip.js
// @updateURL    https://raw.githubusercontent.com/tranchien2000/vnpt-tampermonkey-vite/main/dist/myscript.user.js
// @downloadURL  https://raw.githubusercontent.com/tranchien2000/vnpt-tampermonkey-vite/main/dist/myscript.user.js
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @connect      localhost
// @connect      drive.google.com
// @connect      raw.githubusercontent.com
// @connect      *
// ==/UserScript==\n`;

export default defineConfig({
  build: {
    // Output directory (can be outside or inside, let's keep default 'dist')
    outDir: 'dist',
    // We only want a single file, so we disable splitting and hashes
    emptyOutDir: true,
    lib: {
      entry: 'src/main.js',
      name: 'MyUserscript',
      formats: ['iife'],
      fileName: () => 'myscript.user.js'
    }
  },
  plugins: [
    {
      name: 'tampermonkey-banner',
      generateBundle(options, bundle) {
        for (const chunk of Object.values(bundle)) {
          if (chunk.type === 'chunk') {
            chunk.code = tampermonkeyHeader + chunk.code;
          }
        }
      }
    }
  ]
});
