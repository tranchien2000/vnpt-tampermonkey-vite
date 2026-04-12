import { defineConfig } from 'vite';
import pkg from './package.json';

const tampermonkeyHeader = `// ==UserScript==
// @name         VNPT Word Automation
// @namespace    http://tampermonkey.net/
// @version      ${pkg.version}
// @description  Tool tự động lấy dữ liệu trên portal VNPT
// @author       You
// @match        *://hopdong.vnpt.vn/*
// @match        *://mail.google.com/*
// @match        *://outlook.live.com/*
// @match        *://outlook.office.com/*
// @match        *://outlook.office365.com/*
// @require      https://cdn.jsdelivr.net/npm/docxtemplater@3.37.11/build/docxtemplater.js
// @require      https://cdn.jsdelivr.net/npm/pizzip@3.1.4/dist/pizzip.js
// @updateURL    https://raw.githubusercontent.com/tranchien2000/vnpt-tampermonkey-vite/main/dist/myscript.user.js
// @downloadURL  https://raw.githubusercontent.com/tranchien2000/vnpt-tampermonkey-vite/main/dist/myscript.user.js
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addValueChangeListener
// @connect      localhost
// @connect      drive.google.com
// @connect      raw.githubusercontent.com
// @connect      firebaseio.com
// @connect      googleapis.com
// @connect      firebasestorage.googleapis.com
// @connect      *
// ==/UserScript==\n`;

export default defineConfig({
  build: {
    // Output directory
    outDir: 'dist',
    emptyOutDir: false, // Dùng chung dist, tránh xóa nhầm các file khác
    lib: {
      entry: 'src/main.js',
      name: 'MyUserscript',
      formats: ['iife'],
      fileName: () => 'myscript.user.js'
    },
    minify: process.env.VITE_DEV === 'true' ? false : 'esbuild',
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
