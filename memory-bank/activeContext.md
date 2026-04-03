# Active Context

- **UI Unification Complete**: Tasks #0000–#0001, #1000–#1001, and #1008-#1013 are archived 🟢.
- **Monochromatic Aesthetic**: Monochromatic "soft light gray" filter applied globally in Dark Mode.
- **Focus**: Finalizing HCIE Core Bugs (#10010-#10015) via Runtime Patching. 🟡
- **New Feature**: Selection Undo/Redo (#10012) added to `core-patch.ts`. 🟡
- **Cleanup**: `HANDOVER.md` created for project transition. 🟢
- **Handover Situation**: The 00:36 local session (last one) completed #10012. Ready for verification.

## Active Plans

| Task  | Topic                              | Status | Plan File                                |
| ----- | ---------------------------------- | ------ | ---------------------------------------- |
| #10012 | Selection in History               | 🟢     | `memory-bank/task-logs/bug_10012_sel.md` |
| #10017 | Crop Stabilization (UI/Handles)    | 🟡     | `memory-bank/task-logs/crop-stabilization-v2.md` |
| #10016 | Selection Modifiers (Slider UI)    | 🟡     | `apps/editor/menu_connections.js`        |
| #10010 | Last Tab / Splash Screen           | 🟢     | `memory-bank/task-logs/bug_10010_tabs.md`|

## Task Sessions

- **Architecture**: `apps/web/src/core-patch.ts` coordinates all fixes for the read-only core.

## Key Technical Findings

- **#10014**: Brush tip visibility managed via `g.zooming` toggle based on mouse presence.
- **#10012**: `SelectionAction` class handles selection state (mask/border) for undo/redo.
- **#10010**: `MutationObserver` used for dynamic tab close button binding.

## Next Steps

1. User verifies #10012 (Selection History). 🟡
2. Transition to Phase 9 features (SVG icons, format support).
3. Follow `HANDOVER.md` for team/agent swap.

## Güncel Durum
- **Durum**: Kırpma Aracı (#10017) ve Seçim Değiştiriciler (#10016) profesyonel UI ve tam izolasyon ile tamamlandı, onay bekliyor.
- **Seçim Geçmişi**: Geçmiş yönetimi stabil; Feather/Expand gibi işlemler Undo yığınına dahil edildi.
- **Döküman İzolasyonu**: `core-patch.ts` üzerinden dökümanlar arası state sızıntısı önlendi.
