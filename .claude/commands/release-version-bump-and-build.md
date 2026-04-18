---
name: release-version-bump-and-build
description: Workflow command scaffold for release-version-bump-and-build in vnpt-tampermonkey-vite.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /release-version-bump-and-build

Use this workflow when working on **release-version-bump-and-build** in `vnpt-tampermonkey-vite`.

## Goal

Automates the process of releasing a new version: updates version, builds userscript, updates package files, and sometimes updates release scripts or documentation.

## Common Files

- `version.json`
- `package.json`
- `package-lock.json`
- `dist/myscript.user.js`
- `scripts/release.cjs`
- `.agents/workflows/release.md`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Update version.json and/or package.json
- Build userscript (dist/myscript.user.js)
- Update release documentation or scripts if needed
- Commit with release or chore message

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.