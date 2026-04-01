# Task Status Report
*Last updated: 2026-04-01 14:10*

## 🟢 Completed (USER confirmed)
- **#1020 GitHub & FTP Errors**: Deployed the robust Vite module resolution, CSS injection, and `lzfjs` GHA payload fix. Site is confirmed working. Protected config files via `AGENTS.md`.
- Monorepo to Polyrepo migration and integration (Tasks #2000-#2008).

## 🟡 Waiting to Confirm (finished, needs user verification)
- **Development Script (main.ts) Protection**: Fixed the logic and 404 errors by adding a build marker check (`isBuild`). The application now correctly prevents loading `main.ts` in production builds and GitHub Pages, while still supporting the static `main.bundle.js` fallback for offline/CORS-restricted environments.
- **GitHub Actions Build Fix & Asset Automation**: Resolved the `lzfjs` resolution error in GHA by normalizing alias paths in `vite.config.ts` and adding diagnostic verification to `deploy.yml`. Automated the placement of `main.bundle.js` and `hcie.css` into the `public/` directory during `web:build` to ensure they are always included in the final deployment.
- **GitHub Pages Deployment Fix**: Resolved 404 errors on `https://digiliner.github.io/hcieweb/` by normalizing resource paths in `index.html`. Removed `public/` prefix from asset references to align with Vite's build output. Improved `fixPath` script to correctly handle both development (root) and production (`dist/`) environments. 
- **Static Body-End Loading**: Moved the static script injection from `<head>` to the end of `<body>`. This guarantees that all UI elements (like `appContainer`) are in the DOM before `main.bundle.js` executes, which fixed the persistent "null addEventListener" error in static mode.
- **Static Support (Bypass CORS)**: Created a separate `vite-static.config.ts` to generate an IIFE bundle (`main.bundle.js` and `hcie.css`) which runs correctly over `file://` protocol. Added a conditional loader in `index.html` to automatically switch between standard development (Vite/TS) and static (bundled IIFE) modes.
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

