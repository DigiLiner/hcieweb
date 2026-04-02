# Task Status Report

_Last updated: 2026-04-02 07:48_

## 🟢 Completed (USER confirmed)

- ...

## 🟡 Waiting to Confirm (finished, needs user verification)
- **#10010 (Splash Fix)**: Bütün tablar kapandığında çıkan Splash ekrandaki "Open Image" butonunun çalışmaması ve yeni döküman açınca Splash'ın gitmemesi sorunları düzeltildi. (Proxy ve MutationObserver kullanıldı).
- **#10011 (History Fix)**: Tablar arası Undo/Redo karışması ve seçim alanı verilerinin sızması HistoryManager Proxy katmanı ile düzeltildi.
- ...
- **#10012 (FIXED)**: Seçim undo redoya kaydedilmiyor. (Fixed with `SelectionAction` in `HistoryManager`).
- **#10013 (FIXED)**: undo-redo dökümanları karıştırıyor. (Fixed by isolating `HistoryManager` per document ID).
- **#10014 (FIXED)**: Brush tip (kalem ucu) canvas dışındayken gizlenmesi sağlandı. (Fixed by patching `renderLayers` with `isMouseInCanvas` flag).
- **#10015 (FIXED)**: New Image dialog sayfa merkezinden kayıyordu. (Fixed with CSS flex centering).

## 🔴 In Progress

- Final validation of document switching and history sync.

## ⚪ Backlog

| Task  | Description                             | Plan File                   |
| ----- | --------------------------------------- | --------------------------- |
| #1030 | GIMP (.xcf) Save/Export implementation  | `plans/layered_formats.md`  |
| #1040 | Krita (.kra) Save/Export implementation | `plans/layered_formats.md`  |
| #1050 | Paint.NET (.pdn) Import implementation  | `plans/layered_formats.md`  |
| #1006 | Open/Save for other 20+ basic formats   | `plans/core_io_refactor.md` |
