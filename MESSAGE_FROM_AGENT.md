# Task Status Report
_Last updated: 2026-03-30 17:18 (UTC+3)_

---

## 🟢 Completed (USER confirmed)
- **#1004**: **Dark Theme Checkerboard (Option A)**. Implemented as pure CSS `linear-gradient` using custom theme variables. 🟢
- **#1007**: **Floodfill constrained to selection area**. (Fixed `maskData` fetching and call site). 🟢
- **#1002**: **Status bar visibility in web version**. Restored DOM hierarchy and correctly placed status bar in flex layout. 🟢
- **Monorepo Migration (Phase 10)**: All packages migrated, imports resolved. ✅ _(archived)_

---

## 🟡 Waiting to Confirm (finished by agent, needs user check)

- **#1050**: **Standard & Common Rasters**. Full I/O infrastructure and common formats (PNG, JPEG, WebP, PSD, BMP, Targa, ICO, GIF) implemented. 🟡
- **#1003**: **Drawing Tool Settings Persistence**. `localStorage` based auto-save/restore for brush settings. 🟡
- **Polyrepo Migration Completion**: All sub-repositories linked via `file:`. Root reconnection and Vite/Tauri build pipes verified. 🟡
- **#1051**: **Krita (.kra) Layered Support**. Fixed "tiled" image corruption in `krita-tiles.ts`. Implemented planar delta-decoding and header skip. 🟡
- **GitHub Deployment Fix (#3000)**: Forced Node.js 24 for actions execution, updated `node-version` to 22, and resolved deprecation warnings. 🟡

---

## 🔴 In Progress

- **#1052**: **GIMP (.xcf) Layered Support**. RLE compression binary parser implementation. 🔴



---

## ⚪ Backlog (planned, not yet started)

| Task      | Description                            | Plan File                                |
| --------- | -------------------------------------- | ---------------------------------------- |
| **#1053** | Paint.NET (.pdn) Support               | `plans/plan_1052_1053_app_formats.md`    |
| **#1054** | Animated GIF/APNG Frames               | `plans/plan_1054_animated_formats.md`    |
| **#1055** | Extended/Specialized Rasters           | `plans/plan_1055_1056_misc_formats.md`   |
| **#1056** | Vector/Metafile Support                | `plans/plan_1055_1056_misc_formats.md`   |
| **#1005** | SVG icon reorganization                | `plans/plan_1005_icon_reorganization.md` |
| **#1003** | Drawing Tool Settings Persistence      | `plans/plan_1003_tool_settings.md`       |
| **#1005** | SVG icon reorganization                | `plans/plan_1005_icon_reorganization.md` |
| **#1003** | Drawing Tool Settings Persistence      | `plans/plan_1003_tool_settings.md`       |

---

> 📌 **Agent Rule**: After completing any task, it will be moved to 🟡 Waiting to Confirm.
> Only the USER can move it to 🟢 Completed by explicitly confirming it.
