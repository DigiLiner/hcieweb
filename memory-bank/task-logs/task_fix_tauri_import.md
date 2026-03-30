---
status: "🔴 In Progress"
last_update: "2026-03-30 14:08"
---

# Task: Fix `@tauri-apps/api` resolution in `hcie-ui-components`

## Problem
Vite fails to resolve `@tauri-apps/api/window` when imported from `../hcie-ui-components/src/window-controls.js`. This is because `hcie-ui-components` is outside the `hcie`'s `node_modules` hierarchy, and the parent directory `Tauri/` doesn't have a shared `node_modules`.

## Analysis
- `hcie/node_modules/@tauri-apps/api` exists.
- `hcie/vite.config.ts` aliases `@hcie/ui-components` to the sibling directory.
- When Vite processes files in the sibling directory, it tries to resolve their imports.
- It fails to find `@tauri-apps/api` because it's looking relative to the sibling directory.

## Solution
Add an explicit alias for `@tauri-apps/api` in `hcie/vite.config.ts` pointing to the `node_modules` inside `hcie`. This ensures that any file being processed by the `hcie` Vite server can find the Tauri API.

## Steps
1. Edit `hcie/vite.config.ts` to add the alias.
2. Verify the fix by noting if the Vite server restarts successfully without the error.
