# Progress

## 🔴 In Progress

**Phase 9: UI/UX Polishing & Feature Implementation**

- [ ] #1005: SVG Icon Reorganization. 🔴
  - Categorizing 200+ icons into theme-based folders (tools, ui, selection, file, edit, depo).
- [ ] #1006: Core I/O & Universal Format Support. 🔴
  - [x] PNG, JPG, BMP, TGA, ICO (Import), WebP, GIF (Import worked for some).
  - [ ] Support for 30+ formats as per USER_TASKS.md.
- [🟡] #10010-10017: Resolving HCIE Application Bugs. 🟡 (Waiting to Confirm)
- [x] #10010: Fix Splash Screen behavior (buttons and auto-hide). 🟢
- [x] #10011: Undo/Redo isolation across document tabs. (Fixed via HistoryManager Proxy). 🟢
- [x] #10012: Implement selection history (undo/redo for selections). 🟢
- [x] #10013: Fully isolate undo/redo history stacks per document. 🟢
- [x] #10014: Hide brush tip overlay when mouse leaves canvas. 🟢
- [x] #10015: Center and fix closing behavior for New Image dialog. 🟢
- [🟡] #10016: Selection Modifiers (Feather, Expand, etc.) with history and new Slider UI. 🟡
- [🟡] #10017: Crop tool stabilization (double-click, Enter, Handles, Solid UI, Overlay). 🟡
- [ ] #1030: GIMP (.xcf) Save/Export support. ⚪ (Wait, plan file says #1040)
- [ ] #1040: Krita (.kra) Save/Export support. ⚪ (Wait, plan file says #1030)
- [ ] #1050 / #1053: Paint.NET (.pdn) Import support. ⚪

### Phase 11: Specialized Targets & Workspace

- [ ] #1070: Icon (.ico) Export support. ⚪
- [ ] #1071: Icon (.ico) Import support (Multi-resolution). ⚪
- [ ] #1072: Icon Editing Workspace (Custom canvas/toolset). ⚪
- [ ] #1080/1081/1082: SVG Workspace & Import/Export support. ⚪

### Phase 12: Integrated Viewer & Advanced UI

- [ ] #1100-1104: Viewer mode with FastStone-like interface. ⚪
- [ ] #1200: Image Color Palette & Adjustments. ⚪
- [ ] #1210: Contrast, Brightness, Hue, Saturation. ⚪
- [ ] #1300: AI-powered Image Editing Tools. ⚪

## 🟢 Completed (USER confirmed)

- [x] #1003: Implement Drawing tool settings persistence. 🟢
- [x] #1004: Update dark theme checkerboard pattern. 🟢
- [x] #1007: Constrain Floodfill to selection area. 🟢
- [x] #1020: Resolve GitHub & FTP deployment errors. 🟢
- [x] #1051: Krita (.kra) Layered Import support. 🟢
- [x] #1052: GIMP (.xcf) Layered Import support. 🟢
- [x] Static Support (Bypass CORS for `file://` protocol). 🟢
- [x] Bug Resolution (#10010-#10015): Implemented application-level patching for undo/redo isolation, tab management, and UI refinements.
- [ ] Final Verification: Awaiting user confirmation of patched behaviors.
- [x] UI UX Polish: Versioning, Beta warning, Risk acceptance modal. 🟢
- [x] #2000-2008: Monorepo to Polyrepo migration and integration. 🟢
- [x] Rounded Rectangle Fix: Normalization of dimensions. 🟢
- [x] #1060: Photoshop (.psd) Export/Import support. 🟢
- [x] DEV_GUIDE.md & README.md updates for developers and users. 🟢

## Pending/Needs Assessment

- Performance: monitor compositing with many layers.
- Abstraction of the IO interface to further separate Web and Tauri logic.
- Standardize #1030/#1040 numbering across USER_TASKS.md and plan files.
