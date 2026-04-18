```markdown
# vnpt-tampermonkey-vite Development Patterns

> Auto-generated skill from repository analysis

## Overview

This skill teaches you the core development patterns, coding conventions, and automated workflows used in the `vnpt-tampermonkey-vite` JavaScript codebase. The repository is built with Vite and is structured for efficient development and release of Tampermonkey userscripts. You'll learn how to follow the project's conventions, contribute features, manage releases, update documentation, and maintain project knowledge.

---

## Coding Conventions

**File Naming**
- Use `camelCase` for file names.
  - Example: `myFeature.js`, `userSettings.js`

**Imports**
- Use relative import paths.
  - Example:
    ```js
    import { doSomething } from '../utils/helper.js';
    ```

**Exports**
- Use named exports.
  - Example:
    ```js
    // utils/helper.js
    export function doSomething() { ... }
    ```

**Commit Messages**
- Prefix with `chore`, `feat`, or `release`.
- Keep messages concise (~65 characters).
  - Example: `feat: add user settings panel to UI`

---

## Workflows

### Release Version Bump and Build
**Trigger:** When releasing a new version or hotfix  
**Command:** `/release`

1. Update `version.json` and/or `package.json` with the new version.
2. Build the userscript:
    ```bash
    npm run build
    # Output: dist/myscript.user.js
    ```
3. Update release documentation or scripts if needed.
4. Commit changes with a `release` or `chore` message.
5. (Optional) Run or update `.agents/workflows/release.md`.

**Files involved:**  
`version.json`, `package.json`, `package-lock.json`, `dist/myscript.user.js`, `scripts/release.cjs`, `.agents/workflows/release.md`

---

### Feature Development: Core, UI, Utils
**Trigger:** When adding a new feature or optimizing an existing one  
**Command:** `/feature`

1. Edit or add feature files in `src/features/`.
2. Update core logic/constants in `src/core/constants.js` or `src/core/defaults.js` as needed.
3. Update or add UI components/styles in `src/ui/`.
4. Update or add utility functions in `src/utils/`.
5. Build the userscript:
    ```bash
    npm run build
    ```
6. Update documentation if needed.
7. Commit with a `feat` message.

**Example:**
```js
// src/features/newFeature.js
export function newFeature() {
  // feature implementation
}
```

---

### Update Project Memory and Brain Context
**Trigger:** When project knowledge, architecture, or memory needs to be updated  
**Command:** `/update-memory`

1. Edit `PROJECT_MEMORY.md` to reflect new knowledge or changes.
2. Edit `.notebooklm/brain_context.md` for brain context updates.
3. Optionally update files in `docs/` or `graphify-out/`.

---

### Update Workflow Markdown
**Trigger:** When a new workflow is created or an existing one is updated  
**Command:** `/workflow-doc`

1. Edit or add markdown files in `.agents/workflows/`.
2. Optionally update `.agents/workflows/_index.md` for workflow listing.

---

### Sync Graphify Knowledge Graph
**Trigger:** When codebase or documentation changes require knowledge graph to be refreshed  
**Command:** `/graphify-sync`

1. Run Graphify to update the knowledge graph:
    ```bash
    npm run graphify
    ```
2. Update `graphify-out/graph.json`.
3. Update `graphify-out/GRAPH_REPORT.md`.
4. Update cache files in `graphify-out/cache/`.

---

## Testing Patterns

- Test files follow the `*.test.*` pattern (e.g., `myFeature.test.js`).
- The specific testing framework is not specified; check existing test files for style.
- Place tests alongside the code or in a dedicated test directory as appropriate.

**Example:**
```js
// src/features/myFeature.test.js
import { myFeature } from './myFeature';

test('myFeature works as expected', () => {
  expect(myFeature()).toBe(true);
});
```

---

## Commands

| Command         | Purpose                                                        |
|-----------------|----------------------------------------------------------------|
| /release        | Automate version bump, build, and release process              |
| /feature        | Start or update a feature, core, UI, or utility implementation |
| /update-memory  | Update project memory and brain context documentation          |
| /workflow-doc   | Add or update markdown workflow documentation                  |
| /graphify-sync  | Refresh the knowledge graph and its cache                      |
```
