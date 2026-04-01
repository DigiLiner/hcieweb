# Progress

### In Progress

- [ ] **Phase 9: UI/UX Polishing & Feature Implementation**
  - [x] #1003: Implement Drawing tool settings persistence. 🟢 (Confirmed)
  - [x] #1004: Update dark theme checkerboard pattern. 🟢 (Completed)
  - [ ] #1005: Reorganize SVG icons and resource structure. 🔴
  - [x] #1050: Core I/O & Standard Rasters (PNG, JPG, BMP, TGA, ICO, WebP, GIF). 🟢
  - [x] #1051: Krita (.kra) Layered Support. 🟢 (Fixed `lzfjs` and verified)
  - [x] #1052: GIMP (.xcf) Layered Support. 🟢 (Fixed and verified)
  - [x] #1007: Constrain Floodfill to selection area. 🟢 (Confirmed solve)
  - [ ] #1053: Paint.NET (.pdn) Layered Support. ⚪


### Archived Completed Phases

_See `/memory-bank/memory-arsiv/progress_cleanup_2026-03-30.md` for older completed phases (4-8, 10)._

### Current Status

- Modern, type-safe ESM architecture is fully established.
- All core and UI modules are migrated to TypeScript.
- Custom title bar and unified menu system implemented for Tauri v2.
- The build pipeline (Vite/Tauri) is ready for production testing.
- Deployment to GitHub Pages and FTP is functional and verified.
- Phase 9 is now active, focusing on visual polish and user-requested features.

### Pending

- Performance: monitor compositing with many layers.
- Abstraction of the IO interface to further separate Web and Tauri logic.
