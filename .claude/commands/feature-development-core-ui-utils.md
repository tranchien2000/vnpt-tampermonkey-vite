---
name: feature-development-core-ui-utils
description: Workflow command scaffold for feature-development-core-ui-utils in vnpt-tampermonkey-vite.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /feature-development-core-ui-utils

Use this workflow when working on **feature-development-core-ui-utils** in `vnpt-tampermonkey-vite`.

## Goal

Implements or optimizes a feature, often touching core logic, UI, and utility files together.

## Common Files

- `src/features/*.js`
- `src/core/constants.js`
- `src/core/defaults.js`
- `src/ui/**/*.js`
- `src/utils/**/*.js`
- `dist/myscript.user.js`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Edit or add files in src/features/
- Update src/core/constants.js or src/core/defaults.js as needed
- Update or add UI components/styles in src/ui/
- Update or add utility functions in src/utils/
- Build userscript (dist/myscript.user.js)

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.