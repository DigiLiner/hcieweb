# Task Status Report
*Last updated: 2026-04-01 18:25*

## 📝 Notes
- IO system now uses a standardized `DecodedImage` interface across all format adapters.
- Polyrepo structure is fully functional with local `npm link` equivalents.
- **Unified Plan**: All high-level format support plans merged into [plan_1006_format_infrastructure.md](file:///home/hc/Belgeler/00_PROJECTS/Tauri/hcie/memory-bank/plans/plan_1006_format_infrastructure.md).
- **Corrected Task Numbering**: Plan files and status report now align with `USER_TASKS.md` (GIMP #1030, Krita #1040).

## ⚪ Backlog
| Task | Description | Plan File |
|------|-------------|-----------|
| #1030 | GIMP (.xcf) Save/Export Support | [plan_1030_gimp_save.md](file:///home/hc/Belgeler/00_PROJECTS/Tauri/hcie/memory-bank/plans/plan_1030_gimp_save.md) |
| #1040 | Krita (.kra) Save/Export Support | [plan_1040_krita_save.md](file:///home/hc/Belgeler/00_PROJECTS/Tauri/hcie/memory-bank/plans/plan_1040_krita_save.md) |
| #1050 / #1053 | Paint.NET (.pdn) Import Support | [plan_1050_pdn_support.md](file:///home/hc/Belgeler/00_PROJECTS/Tauri/hcie/memory-bank/plans/plan_1050_pdn_support.md) |
| #1060 | Photoshop (.psd) Export Support | [fix_1060_psd_layers.md](file:///home/hc/Belgeler/00_PROJECTS/Tauri/hcie/memory-bank/plans/fix_1060_psd_layers.md) |
| #1070 | Icon (.ico) Export Support | [plan_1070_1071_ico_support.md](file:///home/hc/Belgeler/00_PROJECTS/Tauri/hcie/memory-bank/plans/plan_1070_1071_ico_support.md) |
| #1071 | Icon (.ico) Import Support | [plan_1070_1071_ico_support.md](file:///home/hc/Belgeler/00_PROJECTS/Tauri/hcie/memory-bank/plans/plan_1070_1071_ico_support.md) |
| #1072 | Icon Editing Workspace | [plan_1072_icon_workspace.md](file:///home/hc/Belgeler/00_PROJECTS/Tauri/hcie/memory-bank/plans/plan_1072_icon_workspace.md) |
| #1080/81/82 | SVG Workspace & Support | [plan_1080_1082_svg_support.md](file:///home/hc/Belgeler/00_PROJECTS/Tauri/hcie/memory-bank/plans/plan_1080_1082_svg_support.md) |
| #1100-04 | Viewer Mode | [plan_1100_viewer_mode.md](file:///home/hc/Belgeler/00_PROJECTS/Tauri/hcie/memory-bank/plans/plan_1100_viewer_mode.md) |
| #1200-10 | Color Palette & Adjustments | [plan_1200_color_adjustments.md](file:///home/hc/Belgeler/00_PROJECTS/Tauri/hcie/memory-bank/plans/plan_1200_color_adjustments.md) |
| #1300 | AI Tools Integration | [plan_1300_ai_tools.md](file:///home/hc/Belgeler/00_PROJECTS/Tauri/hcie/memory-bank/plans/plan_1300_ai_tools.md) |

## 🟡 Waiting to Confirm (finished, needs user verification)
- **Strict Protection Rules**: Updated `AGENTS.md` to forbid AI modification of `tsconfig.json` and build configuration files.

## 🔴 In Progress
- **#1005 SVG Icon Reorganization**: Categorizing 200+ icons into theme-based folders. Plan: [plan_1005_icon_reorganization.md](file:///home/hc/Belgeler/00_PROJECTS/Tauri/hcie/memory-bank/plans/plan_1005_icon_reorganization.md)
- **#1006 Universal Format Support**: Unified Infrastructure. Plan: [plan_1006_format_infrastructure.md](file:///home/hc/Belgeler/00_PROJECTS/Tauri/hcie/memory-bank/plans/plan_1006_format_infrastructure.md)

## 🟢 Completed (USER confirmed)
- **#1060 PSD Layered Export & Import Fix**: Implemented robust layer mapping and OffscreenCanvas support. Restored PSD reading capability. Verified with a roundtrip test using `layered.psd`.
- **#1020 GitHub & FTP Errors**: Deployed the robust Vite module resolution, CSS injection, and `lzfjs` GHA payload fix.
- **Static Support (Bypass CORS)**: Created a separate `vite-static.config.ts` to generate an IIFE bundle.
- **UI UX Polish**: Added versioning, beta warning, and risk acceptance modal.
- **#1051 Krita (.kra) Import**: Tiled format support implemented and verified.
- **#1052 GIMP (.xcf) Import**: Format parser logic for XCF (v11+) implemented and verified.
- **#2000-2008**: Monorepo to Polyrepo migration and integration.
- **Rounded Rectangle Fix**: Resolved the bottom-right to top-left normalization bug.
- **#1007 Floodfill/Eraser Selection**: Tools now strictly respect selection masks.
- **#1003**: Drawing tool settings persistence.
- **#1004**: Checkerboard pattern for dark theme.
