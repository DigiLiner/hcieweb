# Active Context

- **UI Unification Complete**: Tasks #0000–#0001, #1000–#1001, and #1008-#1013 are archived 🟢.
- **Monochromatic Aesthetic**: Monochromatic "soft light gray" filter applied globally in Dark Mode.
- **Focus**: Resolving HCIE Core Bugs (#10010-#10015) via Runtime Patching. 🟡
- **Cleanup**: `progress.md` updated with "Waiting to Confirm" status for all critical patches. 🟢

## Active Plans

| Task  | Topic                              | Status | Plan File                                |
| ----- | ---------------------------------- | ------ | ---------------------------------------- |
| #10010 | Last Tab / Splash Screen           | 🟡     | `memory-bank/task-logs/bug_10010_tabs.md`|
| #10012 | Selection in History               | 🟡     | `memory-bank/task-logs/bug_10012_sel.md` |
| #10014 | Brush Tip Visibility               | 🟡     | `memory-bank/task-logs/bug_10014_tip.md` |
| #10013 | Redo / History Isolation            | 🟡     | `memory-bank/task-logs/bug_10013_redo.md`|
| #1005  | SVG icon reorganization            | ⚪     | `plans/plan_1005_icon_reorganization.md` |
| #1052  | GIMP (.xcf) Support                | 🔴     | `plans/plan_1052_1053_app_formats.md`    |

## Task Sessions

- Active Task Log: Bug Resolution Phase (#10010-10015) 🟡
- Architecture: Introduced `apps/web/src/core-patch.ts` to coordinate Opaque Core fixes.

---

_Follow task-specific logs in `memory-bank/task-logs/` for detailed granular progress._

## Key Technical Findings (from bug resolution)

- **#10014**: Minified library skips brush tip drawing if `g.zooming` is true. We use this as a toggle based on `isMouseInCanvas`.
- **#10012**: Selection actions are now injectable as custom `Action` classes into the core `HistoryManager`.
- **#10010**: Tab close buttons must be force-rebound via `MutationObserver` to ensure our patched code runs instead of the core library.

## Next Steps

1. User verifies 🟡 bug fixes (tabs, history, brush tip, centering).
2. Mark 🟢 after USER confirmation as per AGENTS.md.
3. Transition back to Phase 9 features (SVG icons, format support).

## Güncel Aşama: Kritik Hata Giderme (#10010+)
- **Durum**: Çekirdek kütüphane kısıtlamalarını aşan "Runtime Patching" katmanı eklendi. 🟡
- **Sıradaki Adım**: Kullanıcı doğrulaması ve Phase 9 özelliklerine dönüş.
- **Odak**: #10010-10014 arası tüm hata patch'lerinin doğru çalıştığını teyit etmek.
