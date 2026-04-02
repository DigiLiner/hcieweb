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
| #10012 | Selection in History               | 🟡     | `memory-bank/task-logs/bug_10012_sel.md` |
| #10010 | Last Tab / Splash Screen           | 🟢     | `memory-bank/task-logs/bug_10010_tabs.md`|
| #10005 | SVG icon reorganization            | ⚪     | `plans/plan_1005_icon_reorganization.md` |
| #1030  | GIMP (.xcf) Support                | ⚪     | `plans/layered_formats.md`               |

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
- **Durum**: Seçim geçmişi hatası (#10012) giderildi, onay bekliyor.
- **Devir**: `HANDOVER.md` üzerinden yeni asistan yönlendirilebilir.
