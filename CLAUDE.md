# VNPT Tampermonkey Vite - Project Guide

**Version:** 1.8.1  
**Last Updated:** 2026-04-22  
**Tech Stack:** Vite 5 + Vanilla JS + Tampermonkey

---

## 🎯 Project Overview

Userscript tự động hóa quy trình nghiệp vụ trên hệ thống VNPT (hopdong.vnpt.vn):
- AI Scanner (PDF, Image, Email) qua Gemini
- Real-time 2-way sync giữa Widget và Form
- Export DOCX với template
- Cloud sync qua Firebase
- Tính thuế & phí tự động

---

## 🚀 Quick Commands

```bash
# Development
npm run dev          # Build + watch mode
npm run serve        # Serve dist/ on port 8788
npm run dev:all      # Dev + serve concurrently

# Build
npm run build        # Build userscript + extension
npm run build:userscript  # Build userscript only
npm run build:ext    # Build extension only

# Release
npm run release      # Bump version + update files
```

---

## 📁 Project Structure

```
src/
├── core/           # Core logic & constants
│   ├── constants.js      # DEFAULT_LABELS, localStorage keys
│   ├── defaults.js       # Default data & hotkeys
│   ├── state.js          # AppState singleton
│   └── scannerFallbacks.js
├── features/       # Feature modules
│   ├── fields/           # Field management (row, store, validation)
│   ├── webScanner.js     # Web form scanner
│   ├── docExport.js      # DOCX export
│   └── geminiScanner.js  # AI OCR scanner
├── api/            # External services
│   ├── mstService.js     # MST lookup
│   ├── remoteConfig.js   # Firebase config
│   └── cloudSync.js      # Firebase sync
├── ui/             # UI components & styles
│   ├── widget.js         # Main widget
│   ├── toast.js          # Toast notifications
│   └── styles/           # CSS modules
└── utils/          # Utilities
    ├── domHelper.js      # DOM cache & helpers
    ├── storage.js        # LocalStorage wrapper
    ├── backupHelper.js   # History management
    └── stringHelper.js   # String normalization
```

---

## 🎨 Coding Conventions

### General Rules
- **Language:** Tiếng Việt cho comments, commit messages, UI text
- **No Emojis:** Trừ khi user yêu cầu rõ ràng
- **ES6+:** Use modern JavaScript (arrow functions, destructuring, etc.)
- **No TypeScript:** Pure JavaScript only

### Naming Conventions
```javascript
// Constants: UPPER_SNAKE_CASE
export const LOCAL_KEY_FIELDS = 'vnpt_docx_fields';

// Functions: camelCase
export function addOrUpdateFieldRow() {}

// Classes: PascalCase
export class AppState {}

// Private vars: _prefix
let _linkerCleanup = null;
```

### File Organization
- **1 feature = 1 folder** trong `src/features/`
- **Shared logic** → `src/utils/`
- **External APIs** → `src/api/`
- **UI components** → `src/ui/`

### Key Normalization
**IMPORTANT:** Always trim keys to avoid trailing spaces:
```javascript
const normalizedKey = keyText.split(',').map(s => s.trim()).join(', ');
```

---

## 🔧 Common Issues & Fixes

### Issue 1: Duplicate Field Rows
**Cause:** Trailing spaces in DEFAULT_LABELS keys  
**Fix:** Remove spaces, normalize keys in `addOrUpdateFieldRow`

### Issue 2: MST Lookup Button Not Responding
**Cause:** Multiple event listeners attached  
**Fix:** Check `dataset.listenerBound` before adding listener

### Issue 3: F5 Duplicates Sync Values
**Cause:** `loadSavedData` passes both `keyString` and `saved.sync`  
**Fix:** Only pass `keyString`, don't pass `saved.sync`

---

## 🧪 Testing Checklist

Before commit:
- [ ] `npm run build` succeeds
- [ ] No console errors in browser
- [ ] Test "Quét dữ liệu" button
- [ ] Test MST lookup
- [ ] Test F5 reload (no duplicates)
- [ ] Test export DOCX

---

## 📝 Git Workflow

### Commit Message Format
```
<type>: <description in Vietnamese>

<optional body>

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
```

**Types:**
- `feat`: Tính năng mới
- `fix`: Sửa lỗi
- `refactor`: Refactor code
- `chore`: Cập nhật build, dependencies
- `docs`: Cập nhật documentation

### Example
```bash
git add -A
git commit -m "fix: Sửa lỗi duplicate field rows do trailing spaces

- Xóa trailing spaces trong DEFAULT_LABELS
- Thêm key normalization trong addOrUpdateFieldRow

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## 🔑 Important Files

### Core Configuration
- `src/core/constants.js` - All labels & localStorage keys
- `src/core/defaults.js` - Default data & hotkeys
- `src/core/state.js` - Global app state

### Key Features
- `src/features/fields/row.js` - Field row creation & update logic
- `src/features/fields/store.js` - Save/load data from localStorage
- `src/features/webScanner.js` - Scan web form data
- `src/features/docExport.js` - Export DOCX

### Critical Logic
- `addOrUpdateFieldRow()` - **MUST normalize keys** to avoid duplicates
- `loadSavedData()` - **DON'T pass saved.sync** to avoid duplication
- `saveFieldsToLocal()` - Debounced save to localStorage

---

## 🐛 Debugging Tips

### Enable Console Logs
```javascript
console.log('[MST] Starting lookup for:', mst);
console.debug(`[Sync] Updated ${matchedKey} with value: "${val}"`);
```

### Check localStorage
```javascript
// In browser console
localStorage.getItem('vnpt_docx_fields')
```

### Inspect Field Rows
```javascript
// Check for duplicates
document.querySelectorAll('.vnpt-field-row .f-key')
  .forEach(el => console.log(el.value))
```

---

## 🚨 Critical Rules for AI Agents

1. **Always normalize keys** when working with `addOrUpdateFieldRow`
2. **Never add trailing spaces** to DEFAULT_LABELS keys
3. **Read file once**, don't re-read unnecessarily
4. **Use Grep before Agent** for simple searches
5. **Build after every code change** before commit
6. **Test thoroughly** - especially duplicate detection logic

---

## 📚 Resources

- **Main README:** [README.md](README.md)
- **Architecture:** See README.md for detailed module map
- **Memory:** `.claude/projects/.../memory/` for AI context

---

## 🎯 Current Focus (v1.8.1)

- ✅ Fixed duplicate field rows (trailing spaces)
- ✅ Fixed duplicate sync values on F5
- ✅ Improved MST lookup button reliability
- ✅ Merged 2 checkboxes into "Chế độ nâng cao" button
- 🔄 Ongoing: Performance optimization

---

**For AI Assistants:** Read `memory/feedback_efficiency.md` for workflow optimization guidelines.
