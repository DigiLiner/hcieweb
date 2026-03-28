# Active Context

## Current Focus
Phase 8: Web Deployment Configuration. Ensuring the application is fully functional and deployable in a standard browser environment.

## Recent Achievements
- **Web Deployment Configuration:**
    - Updated `vite.config.ts` with dual-target build support (`dist-web` vs `tauri-dist`).
    - Added comprehensive web scripts to `package.json`.
    - Implemented a GitHub Actions workflow for automated deployment to GitHub Pages.
    - Updated `src/window_controls.ts` to gracefully handle non-Tauri environments (hiding desktop-only controls).
- **Tauri v2 Migration:** Successfully transitioned from Electron to Tauri v2.
    - Added support for **AppImage** bundle target for portable Linux distribution.
- **Theme Manager:** Implemented manual dark/light mode toggle with persistence.
- **Improved Vector Selection:** Hit-testing is now precise for all shapes (Circle, Ellipse, Line, Rect) and added hover feedback (pointer cursor).
- **TypeScript Migration (Phase 5 complete):** All core and UI modules are now 100% type-safe.
- **Custom Window Decorations:** Implemented a modern, frameless window with fully functional custom controls and dragging.
- **Vector & Selection Tool Stability:** Resolved ghosting, rasterization overlaps, and handle alignment issues. Marching ants and transformation handles are now robust.
- **Theme & UI Synchronization:** Centralized CSS variable system with full dark/light mode support and cross-panel event bus.
- **Unified File I/O:** Added cross-platform "Open" and "Save" functions in `menu-handlers.ts`. Uses Tauri system dialogs on desktop and standard browser protocols on web. Supports `.hcie` projects, `.psd` files (via `psd.js`), and standard images.
- **Creative Tools Enhancements:** Added a "Cyclic Color" (rainbow) mode.
    - [x] Works with **Pen, Brush, and Spray** tools.
    - [x] Dynamically cycles hue values while drawing for stunning rainbow effects.
    - [x] Added a premium rainbow-gradient indicator and speed slider in the Properties panel.
    - [x] Synchronized UI color previews with the cycling hue in real-time.
- **Improved Artistic Brushes:** Procedural and nature brushes now support cyclic coloring for more organic textures.
- **New Image Dialog Fixes:**
    - [x] Implemented missing `applyPreset` and `setOrientation` functions.
    - [x] Fixed `createNewImage` to honor background color and transparency settings.
    - [x] Verified that dropdown selection correctly updates width and height inputs.

## Current Workspace
- **Core Library:** `@hcie/core` (packages/core/dist/index.d.ts)
- **App Entry:** `src/main.ts`
- **Frontend Assets:** `index.html`, `src/styles/`

## Active Issues (Resolved)
1. **Vector Properties Panel Invisibility:** Fixed by mapping tools to global configs in `global.js`.
2. **Opacity Non-functional:** Fixed by adding `pen_opacity` to tool configs and handling the `syncOpacity` event.
3. **Redundant Filter Menus:** Consolidated into a single, comprehensive menu matching the Electron version.
4. **Flood Fill Bugs:** Fixed layer erasure bug and implemented proper vector/composite sampling.
5. **TypeScript Type Mismatch (src/io/api.ts):** Resolved `Uint8Array<ArrayBufferLike>` to `BlobPart` error in `Blob` constructor via explicit casting.
6. **Missing Background Checker:** Corrected `build:tauri` script in `package.json` to copy `*.png` and other images to `tauri-dist`.
7. **Selection Live Drawing Visibility:** Fixed HTML5 Canvas premultiplied alpha decay in `drawing_canvas.js` where `globalAlpha` applied with `destination-in` made live strokes inside selections invisible.

## Next Steps
- Replace remaining `alert()`/`confirm()` with `DialogHandler`.
- Implement placeholder filters in `filters.js` (Sharpen, Emboss, etc.).
- Robust testing of Move Selection pixel data (currently only moves the mask, not the pixels unless Cut/Paste is used).

