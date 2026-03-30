# Task Log: Fix Layer Module Import Conflict

## Date: 2026-03-30
## Task ID: #FIX-LAYERS-IMPORT-CONFLICT

### Goal:
Resolve the TypeScript error in `hcie-canvas-ui/src/layers.ts` where `drawShapesToCtx` is both imported and declared locally.

### Plan:
1.  Verify the implementation of `drawShapesToCtx` in `@hcie/shared`. (Done)
2.  Remove the local redeclaration of `drawShapesToCtx` in `hcie-canvas-ui/src/layers.ts`.
3.  Ensure all references in `layers.ts` correctly point to the imported function.
4.  Update status reports.

### Execution Log:
- [2026-03-30 16:28] Removing the local declaration. (Done)
- [2026-03-30 16:30] Task completed. Verified that `layers.ts` now uses the imported `drawShapesToCtx` from `@hcie/shared`. (Follow-up required for build exports)
- [2026-03-30 16:55] Resolved build failures (#MISSING_EXPORT) by updating call sites in `drawing_canvas.ts` and `selection.js` to import directly from `@hcie/shared`.
- [2026-03-30 16:58] Fixed Tauri API resolution error in Vite build by externalizing `@tauri-apps/api` in `vite.config.ts` and adding it to `hcie-ui-components/package.json`. Verified successful build with `npm run build`.

