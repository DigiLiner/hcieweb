# Task Status Report
*Last updated: 2026-03-31 23:59*

## 🟢 Completed (USER confirmed)
- Monorepo to Polyrepo migration and integration (Tasks #2000-#2008).

## 🟡 Waiting to Confirm (finished, needs user verification)
- **Static Body-End Loading**: Moved the static script injection from `<head>` to the end of `<body>`. This guarantees that all UI elements (like `appContainer`) are in the DOM before `main.bundle.js` executes, which fixed the persistent "null addEventListener" error in static mode.
- **Static Support (Bypass CORS)**: Created a separate `vite-static.config.ts` to generate an IIFE bundle (`public/main.bundle.js` and `public/hcie.css`) which runs correctly over `file://` protocol. Added a conditional loader in `index.html` to automatically switch between standard development (Vite/TS) and static (bundled IIFE) modes.
- **main.ts reference restored**: Merged `<script type="module" src="apps/web/src/main.ts"></script>` back into `index.html`. Browsers can't open `.ts` files directly, but Vite handles this automatically when you run the development server (`npm run dev`).
- **UI Warning & Versioning**: Added version `v4.0.0 Beta` and "Beta program, do not use on important files" (English) to the header. Added a blocking risk acceptance modal in English on page load.
- #1051: Krita (.kra) tiled format support. (Fixed: build error resolving `lzfjs` and silences TS6.0 deprecation in `tsconfig.base.json`)
- **Tauri/Vite Build Fix**: Resolved `UNLOADABLE_DEPENDENCY` for `lzfjs` and `Tsconfig not found` errors. Build now succeeds.

## 🔴 In Progress
- Refactoring `floodFill` to respect selection mask (#1007).
- GIMP (.xcf) format parser logic debugging (#1052).



## ⚪ Backlog
| Task | Description | Plan File |
|------|-------------|--------|
| ... | ... | ... |

