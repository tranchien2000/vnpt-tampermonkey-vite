import { defineConfig } from 'vite';
import pkg from './package.json';

const tampermonkeyHeader = `// ==UserScript==
// @name         VNPT Word Automation v${pkg.version}
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
// @require      https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js
// @updateURL    https://raw.githubusercontent.com/tranchien2000/vnpt-tampermonkey-vite/main/dist/myscript.user.js
// @downloadURL  https://raw.githubusercontent.com/tranchien2000/vnpt-tampermonkey-vite/main/dist/myscript.user.js
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addValueChangeListener
// @connect      localhost
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
    minify: 'esbuild', // Bật nén để giảm dung lượng file
    rollupOptions: {
      external: ['pizzip', 'docxtemplater', 'jsqr'],
      output: {
        globals: {
          pizzip: 'PizZip',
          docxtemplater: 'docxtemplater',
          jsqr: 'jsQR'
        }
      }
    }
  },
  esbuild: {
    keepNames: true, // Giữ nguyên tên function/class để tránh lỗi logic
    target: 'es2022',
    legalComments: 'none', // Xóa bỏ các dòng Copyright, License để file nhẹ hơn
    drop: ['console', 'debugger'] // Tự động xóa các lệnh console để sạch code và nhẹ file
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
