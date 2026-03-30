# Active Context

- **UI Unification Complete**: Tasks #0000–#0001, #1000–#1001, and #1008-#1013 are archived 🟢.
- **Monochromatic Aesthetic**: Monochromatic "soft light gray" filter applied globally in Dark Mode.
- **Focus**: Executing remaining Phase 9 tasks (#1003–#1007). 🔴
- **Cleanup**: `progress.md` has been cleaned of finished tasks; legacy phases archived in `memory-arsiv/`. 🟢

## Active Plans

| Task  | Topic                              | Status | Plan File                                |
| ----- | ---------------------------------- | ------ | ---------------------------------------- |
| #1003 | Drawing tool settings persistence  | 🟡     | `plans/plan_1003_tool_settings.md`       |
| #1005 | SVG icon reorganization            | ⚪     | `plans/plan_1005_icon_reorganization.md` |
| #1050 | Core I/O & Standard Rasters        | 🟡     | `plans/plan_1050_core_io_standard.md`    |
| #1051 | Krita (.kra) Support               | 🟡     | `plans/plan_1051_krita_support.md`       |
| #1052 | GIMP (.xcf) Support                | 🔴     | `plans/plan_1052_1053_app_formats.md`    |
| #1053 | Paint.NET (.pdn) Support           | ⚪     | `plans/plan_1052_1053_app_formats.md`    |
| #1007 | Floodfill constrained to selection | 🟢     | `plans/plan_1007_floodfill.md`           |

## Task Sessions

- Active Task Log: None (Phase 9 tasks continuing) 🔴
- Completed & Archived: 🟢 #0000, 🟢 #0001, 🟢 #1000, 🟢 #1001, 🟢 #1002, 🟢 #1004, 🟢 #1008, 🟢 #1012, 🟢 #1013 (in `memory-arsiv/`)

---

_Follow task-specific logs in `memory-bank/task-logs/` for detailed granular progress._

## Key Technical Findings (from planning)

- **#1007**: `floodFill()` algorithm is already correct. Bug is in the call site — `maskData` is passed as `null` instead of the active selection canvas data.
- **#1008/#1009**: AGENTS.md update required, plus MESSAGE_FROM_AGENT.md template.
- **#1005**: Requires user approval before moving 200+ SVG files.
- **#1006**: Phase 1 can reuse `ag-psd` (already bundled) + Canvas API for PNG/JPEG.

## Next Steps

1. User reviews and approves each plan.
2. User selects execution order.
3. Agent implements one task at a time, marks 🟡 on completion, awaits 🟢 confirmation.


## Güncel Aşama: Monorepo -> Polyrepo Dönüşümü (#2000+)
- **Plan**: `plan_2000_polyrepo_migration.md` ve detayları `plan_2001_core_extraction.md` üzerinden devam ediyor.
- **Durum**: Kütüphaneler target dizinlere oluşturuluyor ve `file:../` sembolleriyle bağlandı.
- **Sıradaki Adım**: Plan klasöründeki yönergeler takip edilerek `#2007` ve `#2008` işlemleri gerçekleştirilmeli.
