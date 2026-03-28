# Progress

### Completed
- [x] Phase 4: Comprehensive TypeScript Migration & UI Modularization
    - [x] Migrated all UI components (`menu`, `panels`, `tabs`, etc.) to `src/ui/`.
    - [x] Consolidated global types into `src/env.d.ts`.
    - [x] Resolved strict TypeScript errors in `document.ts` and `layers.ts`.
    - [x] Isolated document states to prevent cross-tab selection data leakage.
    - [x] Verified and fixed all syntax errors and broken imports across UI components.
    - [x] Updated `src/main.ts` as the central orchestrator.
- [x] Phase 5: Drawing Canvas Migration & Stabilization 
    - [x] Refactored `drawing_canvas.js` to `drawing_canvas.ts` with 100% type safety.
    - [x] Resolved illegal `offsetX/Y` property assignments using local coordinates.
    - [x] Implemented robust null-checking for all canvas contexts and DOM elements.
    - [x] Standardized tool interaction logic (Magic Wand, Flood Fill, Pen, Brush).
    - [x] Integrated marching ants animation with modular layer rendering.
    - [x] Wired history system (Undo/Redo) to the new architecture.
    - [x] Resolved all IDE-reported problems (redeclarations, implicit any, argument mismatches).
- [x] Phase 6: Project IO & Filter Migration
    - [x] Migrated `project_io.js` to `project-io.ts` with full type safety.
    - [x] Implemented unified cross-platform File API (`api.ts`) for Tauri/Web.
    - [x] Added `handleOpenFile` and `handleSaveFile` with support for `.hcie`, `.psd`, and standard image formats.
    - [x] Wired file operations to both the top menu and the toolbar buttons.
    - [x] Integrated `psd.js` and `ag-psd` for full PSD reading and writing support.
- [x] Phase 7: UI Modernization & Custom Window Decorations
    - [x] Transitioned to a frameless window (`decorations: false`) in Tauri config.
    - [x] Integrated custom window controls (Minimize, Maximize, Close) into the menu bar.
    - [x] Implemented a unified dragging region for the application header.
    - [x] **FIXED:** Corrected `appMenuBar` layout (changed `table-row` to `flex`) to restore visibility and interaction.
    - [x] **FIXED:** Added CSS `-webkit-app-region` properties for reliable native window dragging.
    - [x] **FIXED:** Added explicit Tauri v2 `core:window:default` permissions to enable window state control.
    - [x] **Artistic Brushes Panel:** Implemented a dynamic brush panel that appears only when the Brush tool is active, featuring Oil, Charcoal, Watercolor, Calligraphy, and Marker presets.
    - [x] **Cyclic Color (Rainbow) Mode:** Added a "Cyclic Color" toggle to Pen, Brush, and Spray tools.
        - [x] Colors now cycle through labels/hue automatically while drawing.
        - [x] Added a premium rainbow icon and checkbox to the Properties panel.
        - [x] Integrated `hslToHex` for smooth, high-quality transitions.
- [x] **Phase 8: Web Deployment Configuration**
    - [x] Updated `vite.config.ts` to support dual-target builds (`dist-web` vs `tauri-dist`) with `base: './'` for portability.
    - [x] Configured `package.json` with dedicated web scripts (`web:build`, `web:preview`, `web:serve`).
    - [x] Implemented platform-aware UI logic to hide Tauri-specific window controls in browser environments.
    - [x] Created and debugged GitHub Actions workflow (`deploy.yml`) for automated deployment.
    - [x] **FIXED:** Resolved 404 icon paths in `index.html` by migrating to theme-based resource paths.
    - [x] **FIXED:** Resolved GitHub Actions failure by removing `package-lock.json` dependency in the build step.
    - [x] **FIXED:** Resolved deployment conflict by removing `static.yml` which was serving raw source code.

### Current Status
- Modern, type-safe ESM architecture is fully established.
- All core and UI modules are migrated to TypeScript.
- Custom title bar and unified menu system implemented for Tauri v2.
- The build pipeline (Vite/Tauri) is ready for production testing.
- **FIXED:** Resolved broken CSS source map references in `styles.css` causing ENOENT errors in Vite client.
- No critical TypeScript compilation errors remaining.

### Completed Milestones

#### 🚀 Platform & Infrastructure
- **Tauri v2 Migration:** Initialized Tauri v2, removed Electron dependencies, and created a lean `build:tauri` pipeline.
- **Packaging:** Configured and validated production builds for **AppImage**, **.deb**, and **.rpm** (Linux).
- **Backend Bridging:** Replaced Electron IPC with native Tauri plugins (`fs`, `dialog`) using a global detection wrapper in `renderer.js`.

#### 🛠️ Core Engine & Tooling
- **TypeScript Core:** Migrated all painting, vector, and selection logic to strict TypeScript.
- **Improved Vector Selection:** Precise hit-testing for all shapes (Circle, Ellipse, Line, Rect) and hover cursor feedback.
- **Selection System:** Implemented marching ants, move-selection, move-content, and polygon selection with sub-pixel `globalCompositeOperation` merging.
- **Vector Engine:** Completed vector circle/rect/line tools with proportional resizing, corner radius support, and live property synchronization.
- **Drawing Tools:** Fixed first-point rendering, eraser transparency, and flood-fill "wipe" bugs.
- **Clipboard:** Implemented global shortcuts (`Ctrl+C/V/X/A/D/Z/Y`) with support for cross-layer data.

#### 🎨 UI & UX
- **Custom Title Bar:** Implemented a unified header with native drag regions and theme-aware window controls.
- **Theme System:** Added automatic system-preference theme detection and centralized CSS variable synchronization.
- **Dialog System:** Created `DialogHandler` for modern, non-blocking themed modals (New Image, Format Selector, etc.).
- **Properties Panel:** Unified tool settings into a context-aware sidebar that filters redundant controls and syncs with the top options bar. Added support for Cyclic Color with custom iconography.
- **Menu System:** Consolidated nested filter and image menus with high-quality icons.

## In Progress
- [x] Phase 6: Project IO & Filter Migration
    - [x] Migrate `project_io.js` to TypeScript.
    - [x] Migrate `filters.js` to TypeScript.
    - [x] Ensure PSD/HCIE saving/loading is fully typed and robust.
    - [ ] Clean up remaining `any` types in tool configurations.

## Pending
- Performance: monitor compositing with many layers.
- [x] New Image: Improved preset selection UX and fixed orientation/color bugs.
