# Task Status Report
*Last updated: 2026-04-03 00:15*

## 🟢 Completed (USER confirmed)
- **#10010 (Splash Screen & Last Tab)**: Tüm tablar kapatılabiliyor. Döküman bittiğinde şık ve işlevsel bir "Boş Durum" (Splash) ekranı eklenerek dökümansız çalışma süreci iyileştirildi.
- **#10011 (History & Document Isolation)**: Dokumenteler arası Undo/Redo izolasyonu tamamlandı. Her tab kendi geçmişine (History stack) sahip.
- **#10013 (Drawing Status Fix)**: Seçim işlemi bittiğinde "Drawing" yazısının takılı kalması sorunu giderildi.
- **#10014 (Brush Tip Overlay Fix)**: Fırça ucu imlecinin canvas dışına çıktığında yok olması sağlandı.
- **#10015 (New Image & Dialog Persistence)**: Yeni döküman açılışındaki diyalog takılmaları ve modal görünürlük sorunları giderildi.
- **#10016 (Escape & Deselect)**: "Escape" tuşu ile seçim iptali global olarak eklendi.
- **#TS-FIX (tsconfig.json Error)**: `Invalid value for --ignoreDeprecations` hatası (6.0 -> 5.0) tüm `tsconfig.json` dosyalarında giderildi ve kök sebep (base config) temizlendi.

## 🟡 Waiting to Confirm (finished, needs user verification)
- **#10012 (Selection History V5 - Event-Level Capture)**: Kare, Daire, Elips ve Kement (Lasso) araçlarının kaydedilmeme sorunu için en sağlam çözüm olan "Event-Level Hijacking" yapıldı. Artık kodun iç yapısından bağımsız olarak, tarayıcı düzeyindeki tıklama (`mousedown`) ve bırakma (`mouseup`/`dblclick`/`Enter`) olayları dinlenerek seçim değişiklikleri History'ye kesin olarak kaydediliyor. Lütfen tüm araçları Ctrl+Z ile test edin. 🟡 (Test Bekleniyor)

## 🔴 In Progress
- ...

## ⚪ Backlog
| Task | Description | Plan File |
|------|-------------|-----------|
| #1030 | GIMP (.xcf) Save/Export implementation | `plans/layered_formats.md` |
| #1040 | Krita (.kra) Save/Export implementation | `plans/layered_formats.md` |
| #1050 | Paint.NET (.pdn) Import implementation | `plans/layered_formats.md` |
| #1006 | Open/Save for other 20+ basic formats | `plans/core_io_refactor.md` |
