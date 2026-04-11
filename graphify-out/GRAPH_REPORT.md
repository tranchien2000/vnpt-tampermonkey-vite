# Graph Report - .  (2026-04-11)

## Corpus Check
- 50 files · ~32,396 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 170 nodes · 166 edges · 46 communities detected
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## God Nodes (most connected - your core abstractions)
1. `loadTemplates()` - 5 edges
2. `selectTemplate()` - 5 edges
3. `getDB()` - 4 edges
4. `saveTemplates()` - 4 edges
5. `saveLocalTemplate()` - 4 edges
6. `renderTemplateManager()` - 4 edges
7. `getVNPTDateStrings()` - 4 edges
8. `toggleInspector()` - 3 edges
9. `extractElementInfo()` - 3 edges
10. `ld()` - 3 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Communities

### Community 0 - "Community 0"
Cohesion: 0.28
Nodes (4): addOrUpdateFieldRow(), loadSavedData(), saveFieldsToLocal(), updateUIForDefaultMode()

### Community 1 - "Community 1"
Cohesion: 0.39
Nodes (8): buildFullDOMMap(), clearDOMCache(), findPageInput(), getInputByLabel(), refreshLabelsCache(), setPageField(), syncSetValue(), triggerCustom()

### Community 2 - "Community 2"
Cohesion: 0.29
Nodes (2): getHotkeyString(), handleRecording()

### Community 3 - "Community 3"
Cohesion: 0.39
Nodes (6): extractElementInfo(), findLabelText(), handleClick(), startInspecting(), stopInspecting(), toggleInspector()

### Community 4 - "Community 4"
Cohesion: 0.57
Nodes (6): fetchTemplateFromUrl(), loadTemplates(), renderTemplateManager(), saveLocalTemplate(), saveTemplates(), selectTemplate()

### Community 5 - "Community 5"
Cohesion: 0.32
Nodes (4): exportFullBackup(), flattenData(), getInternalBackups(), restoreInternalBackup()

### Community 6 - "Community 6"
Cohesion: 0.38
Nodes (3): findBestMatch(), getLevenshteinDistance(), getSimilarity()

### Community 7 - "Community 7"
Cohesion: 0.33
Nodes (0): 

### Community 8 - "Community 8"
Cohesion: 0.4
Nodes (2): initCalcWidget(), renderHist()

### Community 9 - "Community 9"
Cohesion: 0.53
Nodes (4): formatDay(), formatMonth(), formatYear(), getVNPTDateStrings()

### Community 10 - "Community 10"
Cohesion: 0.4
Nodes (2): numToVN(), read3()

### Community 11 - "Community 11"
Cohesion: 0.7
Nodes (4): getDB(), idbDelete(), idbLoad(), idbSave()

### Community 12 - "Community 12"
Cohesion: 0.7
Nodes (4): ld(), renderHist(), saveHist(), sv()

### Community 13 - "Community 13"
Cohesion: 0.4
Nodes (0): 

### Community 14 - "Community 14"
Cohesion: 0.5
Nodes (0): 

### Community 15 - "Community 15"
Cohesion: 0.67
Nodes (2): initDocExport(), renderDocx()

### Community 16 - "Community 16"
Cohesion: 0.5
Nodes (0): 

### Community 17 - "Community 17"
Cohesion: 0.67
Nodes (2): ld(), renderDataFillTabs()

### Community 18 - "Community 18"
Cohesion: 0.67
Nodes (2): extractWithGemini(), getSystemPrompt()

### Community 19 - "Community 19"
Cohesion: 0.5
Nodes (0): 

### Community 20 - "Community 20"
Cohesion: 0.67
Nodes (2): extractFieldsFromText(), getRawTextSystemPrompt()

### Community 21 - "Community 21"
Cohesion: 0.67
Nodes (0): 

### Community 22 - "Community 22"
Cohesion: 0.67
Nodes (0): 

### Community 23 - "Community 23"
Cohesion: 0.67
Nodes (0): 

### Community 24 - "Community 24"
Cohesion: 0.67
Nodes (0): 

### Community 25 - "Community 25"
Cohesion: 1.0
Nodes (2): initDragDrop(), makeDraggable()

### Community 26 - "Community 26"
Cohesion: 1.0
Nodes (0): 

### Community 27 - "Community 27"
Cohesion: 1.0
Nodes (0): 

### Community 28 - "Community 28"
Cohesion: 1.0
Nodes (0): 

### Community 29 - "Community 29"
Cohesion: 1.0
Nodes (0): 

### Community 30 - "Community 30"
Cohesion: 1.0
Nodes (0): 

### Community 31 - "Community 31"
Cohesion: 1.0
Nodes (0): 

### Community 32 - "Community 32"
Cohesion: 1.0
Nodes (0): 

### Community 33 - "Community 33"
Cohesion: 1.0
Nodes (0): 

### Community 34 - "Community 34"
Cohesion: 1.0
Nodes (0): 

### Community 35 - "Community 35"
Cohesion: 1.0
Nodes (0): 

### Community 36 - "Community 36"
Cohesion: 1.0
Nodes (0): 

### Community 37 - "Community 37"
Cohesion: 1.0
Nodes (0): 

### Community 38 - "Community 38"
Cohesion: 1.0
Nodes (0): 

### Community 39 - "Community 39"
Cohesion: 1.0
Nodes (0): 

### Community 40 - "Community 40"
Cohesion: 1.0
Nodes (0): 

### Community 41 - "Community 41"
Cohesion: 1.0
Nodes (0): 

### Community 42 - "Community 42"
Cohesion: 1.0
Nodes (0): 

### Community 43 - "Community 43"
Cohesion: 1.0
Nodes (0): 

### Community 44 - "Community 44"
Cohesion: 1.0
Nodes (0): 

### Community 45 - "Community 45"
Cohesion: 1.0
Nodes (0): 

## Knowledge Gaps
- **Thin community `Community 26`** (2 nodes): `dev.user.js`, `loadScript()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (2 nodes): `vite.config.js`, `generateBundle()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 28`** (2 nodes): `scannerFallbacks.js`, `getScannerFallback()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 29`** (2 nodes): `autoFillForm.js`, `setupAutoFillForm()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 30`** (2 nodes): `calcUI.js`, `createCalcUI()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 31`** (2 nodes): `styles.js`, `injectStyles()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 32`** (2 nodes): `toast.js`, `showToast()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 33`** (2 nodes): `widget.js`, `initWidget()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 34`** (2 nodes): `common.js`, `debounce()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 35`** (2 nodes): `localClassifier.js`, `classifyTextLocally()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 36`** (2 nodes): `migrationHelper.js`, `initStorageMerge()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 37`** (1 nodes): `fix_auth.ps1`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 38`** (1 nodes): `test_classifier.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 39`** (1 nodes): `mstService.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 40`** (1 nodes): `localAdapter.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 41`** (1 nodes): `constants.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 42`** (1 nodes): `defaults.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 43`** (1 nodes): `state.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 44`** (1 nodes): `logger.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 45`** (1 nodes): `storage.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Not enough signal to generate questions. This usually means the corpus has no AMBIGUOUS edges, no bridge nodes, no INFERRED relationships, and all communities are tightly cohesive. Add more files or run with --mode deep to extract richer edges._