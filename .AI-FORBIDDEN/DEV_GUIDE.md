# Development Guide (HCIE v4.0.0 Beta)

This guide provides information for developers working on the HC Image Editor (HCIE). The project has migrated from a legacy Webpack/Electron architecture to a modern **Vite + Tauri v2** polyrepo structure.

## Core Commands

### 🔴 Development (Dev Mode)
To start the application with hot-reload for UI and logic changes:

```bash
# General development (launches Vite dev server)
npm run dev

# Targeted Web development mode
npm run web:dev
```

### 🟢 Build for Production

#### 1. Web Version (GitHub Pages / FTP / Static Server)
This build generates standard assets and a special IIFE bundle (`main.bundle.js` and `hcie.css`) that allows the application to run over the `file://` protocol, bypassing browser CORS restrictions.

```bash
# Complete static web build (Recommended for Deployment)
npm run web:build
```
*   **Output:** Located in `dist-web/` (or `dist-static/` for bundles).
*   **Deployment:** Simply upload the contents of the final build folder to GitHub Pages or your FTP server.

#### 2. Desktop Version (Tauri / Windows / Linux / MacOS)
Builds the native desktop application binaries.

```bash
# Build native application installers/binaries
npm run tauri:build
```
*   **Output:** Located in `src-tauri/target/release/bundle/`.

---

### ⚪ Advanced Building & Script Details

| Script | Purpose |
|--------|---------|
| `npm run static:bundle` | Only generates the `main.bundle.js` and `hcie.css` IIFE bundles. |
| `npm run serve` | Locally serves the web build at `http://localhost:8000` for final testing. |
| `npm run ts:build` | Compiles all TypeScript packages in the polyrepo using project references. |

---

## Architecture & Polyrepo Structure

The project is divided into specialized packages located in the parent directory. This allows for modular testing and reuse.

*   `@hcie/core`: Global state, event systems, and layer classes.
*   `@hcie/canvas-ui`: Main drawing canvas logic, layer rendering, and viewport management.
*   `@hcie/tools`: Implementation of drawing tools (Pen, Brush, Eraser, Spray, etc.).
*   `@hcie/io`: Format adapters (PSD, Krita, GIMP, PNG, JPG).
*   `@hcie/ui-components`: Shared UI elements (Options Bar, Properties Panel, Dialogs).
*   `@hcie/shared`: Utility functions, math, and shared interfaces.

---

## Recent Technical Implementations

### 1. Static Loading & CORS Bypass
The application includes a specialized loader in `index.html`. If it detects the `file://` protocol or a static environment, it automatically switches from ES module loading to the bundled `main.bundle.js`. This allows users to open `index.html` directly from their hard drive.

### 2. Selection Masking Support
Tools like `Eraser` and `Floodfill` now strictly respect the global selection mask. 
*   **Eraser:** Uses `destination-out` composition on a masked `tempCanvas`.
*   **Floodfill:** Uses a `maskData` bitwise check inside the scanline fill algorithm.

### 3. Tool Settings Persistence
Settings (Brush size, Opacity, Hardness) are persisted using the `SyncableState` interface. 
*   **Storage:** Browser `localStorage` (Key: `hcie-tool-settings-v2`).
*   **Sync Logic:** UI components trigger `saveToolSettings(undefined, g)` on change.

---

## Troubleshooting

### CORS Errors in Browser
If you see "CORS" or "MIME Type" errors when opening `index.html` locally:
*   Ensure you ran `npm run web:build`.
*   Check if `main.bundle.js` exists in the same directory as `index.html`.

### Tauri Build Failures
*   Update your Rust toolchain: `rustup update`.
*   Linux users: Ensure all webkit2gtk-4.1 development headers are installed.
```bash
sudo apt install libwebkit2gtk-4.1-dev build-essential curl wget ...
```

### Script Execution on Linux
If `tauri` commands fail with permission errors:
```bash
chmod +x node_modules/.bin/tauri
```
