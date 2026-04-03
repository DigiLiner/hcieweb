# Task Status Report
*Last updated: 2026-04-03 20:12*

## 🟢 Completed (USER confirmed)
- **Selection Modifier Slider UI (#10016-1):** Taşınabilir pencere içi Feather/Grow/Shrink ve canlı önizleme onaylandı. 🟢
- **Selection Modifier Preview Fix (#10016-FIX):** 1000ms gecikme ve bellek koruma mantığı onaylandı. 🟢
- **Selection History Support (#10012):** Seçim işlemleri Undo/Redo yığınına tam entegre.
- **GPU Destekli Seçim Kenarlığı (SVG + CSS):** %100 GPU tabanlı akıcı "yürüyen karıncalar" efekti.
- **Döküman İzolasyonu (#10011, #10013):** Tablar arası Undo/Redo sızıntısı tamamen engellendi.
- **UI Refinements (#10010, #10014, #10015):** Splash screen, fırça ucu gizleme ve New Image diyaloğu düzeltildi.

## 🟡 Waiting to Confirm (finished, needs user verification)
- **Advanced Crop Tool (#10017):** Solid UI, handle noktaları, Enter/Double-click onayı ve döküman izolasyonu.
- **Crop Tool Enhancements:** Tutacaklar üzerinde dinamik imleç (hover aşamasında aktif), `move` imleci ve status bar üzerinde canlı boyut (`W x H`) gösterimi eklendi.
- **Marching Ants Optimization:** SVG katmanının zoom ve resize sırasında %100 senkron çalışması (GPU rendering doğrulaması).

## 🔴 In Progress
- **Aşama 9 Planlama:** #1005 (İkonlar) ve #1006 (Dosya formatları) hazırlığı.

## ⚪ Backlog
| Task | Description | Plan File |
|------|-------------|-----------|
| #1005 SVG Icon | 200+ ikonun temaya göre klasörlenmesi | - |
| #1006 Core I/O | Krita (.kra) ve GIMP (.xcf) için kayıt desteği | task-1006-breakdown.md |
| #1050 Paint.NET | .pdn dosyaları için import desteği | - |
| #1070 Icon Export | .ico formatında çoklu çözünürlük export | - |
| #1080 SVG Workspace | SVG vektör düzenleme çalışma alanı | - |
| #1100 Viewer Mode | FastStone benzeri resim görüntüleme modu | - |
| #1210 Adjustments | Contrast, Brightness, Saturation ayarları | - |
