# Task Status Report
*Last updated: 2026-04-01 15:45*

## 🟢 Completed (USER confirmed)
- **#1020 GitHub & FTP Errors**: Deployed the robust Vite module resolution, CSS injection, and `lzfjs` GHA payload fix. Site is confirmed working.
- **Static Support (Bypass CORS)**: Created a separate `vite-static.config.ts` to generate an IIFE bundle (`main.bundle.js` and `hcie.css`) which runs correctly over `file://` protocol. Added a conditional loader in `index.html` to automatically switch between standard development (Vite/TS) and static (bundled IIFE) modes.
- **UI UX Polish**: Added version `v4.0.0 Beta` and "Beta program, do not use on important files" (English) to the header. Added a blocking risk acceptance modal in English on page load.
- **#1051 Krita (.kra) Support**: Tiled format support implemented and verified.
- **#1052 GIMP (.xcf) Support**: Format parser logic for XCF (v11+) implemented and verified.
- **#2000-2008**: Monorepo to Polyrepo migration and integration.
- **Rounded Rectangle Fix**: Resolved the bottom-right to top-left normalization bug.
- **#1007 Floodfill/Eraser Selection**: Confirmed by user as solved. Tools now strictly respect the active selection mask.
- **DEV_GUIDE.md Update**: Updated development documentation with Vite/Tauri commands, Polyrepo package details, and static deployment instructions.
- **GitHub README.md**: Created a professional, English README with logo, beta warning, feature list, and roadmap.

## 🔴 In Progress
- **#1005 SVG Icon Reorganization**: Categorizing 200+ icons into theme-based folders (tools, ui, selection, file, edit, depo).

## ⚪ Backlog
| Task | Description | Plan File |
|------|-------------|-------------|
| #1005 | SVG icon reorganization | plans/plan_1005_icon_reorganization.md |
| #1053 | Paint.NET (.pdn) Support | plans/plan_1052_1053_app_formats.md |

---

## 📝 Notes
- IO system now uses a standardized `DecodedImage` interface across all format adapters.
- Polyrepo structure is fully functional with local `npm link` equivalents.
