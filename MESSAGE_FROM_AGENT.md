# Task Status Report
*Last updated: 2026-04-06 02:10*

## 🚀 Shared Registry: [TASK_ID_REGISTRY.md](file:///home/hc/Belgeler/00_PROJECTS/Tauri/hcie/TASK_ID_REGISTRY.md)
*Yeni görev eklerken bu dosyadaki son ID üzerinden devam edebilirsiniz.*

## 🟢 Completed (USER confirmed)
- **Settings Page Implementation (#1020):** Ayarlar sayfası, çoklu dil (i18n - TR/EN/DE/FR/ES/RU) ve tam dinamik tema desteği tamamlandı. **Ctrl+K** kısayolu aktif. 🟢
- **Advanced Crop Tool (#10017):** Solid UI, handle noktaları, Enter/Double-click onayı ve döküman izolasyonu. 🟢
- **Crop Tool Enhancements:** Tutacaklar üzerinde dinamik imleç, `move` imleci ve status bar üzerinde canlı boyut gösterimi. 🟢
- **Marching Ants Optimization:** SVG katmanının zoom ve resize sırasında %100 senkron çalışması (GPU rendering). 🟢
- **SVG Icon Reorganization (#1005):** İkonların tema yapısına göre kategorize edilmesi ve klasörleme işlemi tamamlandı. 🟢
- **Selection Modifier Slider UI (#10016-1):** Taşınabilir pencere içi Feather/Grow/Shrink ve canlı önizleme onaylandı. 🟢
- **Selection Modifier Preview Fix (#10016-FIX):** 1000ms gecikme ve bellek koruma mantığı onaylandı. 🟢
- **Selection History Support (#10012):** Seçim işlemleri Undo/Redo yığınına tam entegre. 🟢
- **PWA Conversion (#PWA):** Uygulamanın PWA haline getirilmesi için gerekli yapılandırma (manifest, sw, icons) tamamlandı ve build ile doğrulandı. 🟢

## 🟡 Waiting to Confirm (finished, needs user verification)
- **AGENTS.md Format Cleanup:** `AGENTS.md` dosyasındaki gereksiz boş satırlar temizlendi ve Markdown formatı standart hale getirildi. 🟡
- **Raster Drawing Lag Fix:** Raster katmanlarda fırça ve vektör araçları ile çizim yaparken yaşanan gecikme (lag) sorunu render döngüsü ve olay dağıtımı optimizasyonları ile giderildi. 🟡
- **Drawing Functionality Bug Fix:** Fixed the `Tool` export from `@hcie/core` which was causing `Tool.Pen` to evaluate to undefined and breaking drawing tool selections. 🟡
- **Cookie & Beta Feedback Banners:** Renamed the tracking keys in `localStorage` inside `index.html` to ensure the beta warning and cookie consent banners reappear for the user on next load. 🟡
- **Task #1324 Selection & Vector Interaction Fixes:** Vector araçları veya seçici araçlar ile raster katmanlarda işlem yaptıktan sonra farenin tuval dışına bırakılmasından doğan "yapışma" (sticking) sorunu global `mouseup` listener ile tamamen giderildi. Ayrıca ok tuşları (`Arrow keys`) kullanılarak Ghost edit modundaki vektörel şekil ve aktif seçim alanının hareket ettirilmesi sağlandı. Seçim/Edit onaylama süreci için `Enter` tuşu aktif edildi. 🟡
- **Task #1324 Implementation:** Vektör araçlarına ve raster çizime Açı (`angle`) ve boyut girdisi eklendi. Shift tuşu ile 0, 30, 45 katlarına açı kilitleme; VectorToolManager üzerinde rotasyonlu alan seçimi ve durum çubuğu üstünden form içi manuel (`px`/`derece`) veri güncelleyebilme entegrasyonu tamamlandı. 🟡
- **Task #1324 Polishing:** Fırça (brush) aralığı 10px'den 1px'e düşürülerek raster kesintileri giderildi; Çizgi (Line) aracında açının iki defa toplanması hatası düzeltildi; Text aracı katmanlarına VectorSelect aracıyla ulaşıp düzenleme yeteneği getirildi; Şekil döndürülürken Editör UI düğmelerinin (OK/Cancel) düzgün durması (counter-rotate) sağlandı. 🟡
- **Task #1324 Advanced Vector Interactivity:** Şekil boyutu ve pozisyonu (Handles) değiştirilirken Properties (boyut, konum) panelindeki kutuların gerçek zamanlı (eşzamanlı) senkronize olması sağlandı. Şekil döndürmek için UI üzerine dört dış köşeye görünmez Rotasyon (Döndürme / Rotate) kolları eklendi, döndürme esnasında ekrandaki kalabalığı önlemek amacıyla UI butonları otomatik gizlenip şekil bırakıldığında yeniden belirmesi eklendi. 🟡
- **[Mimari Plan] Atomik Yapı ve Dekuplaj Raporu:** Kullanıcı talebi doğrultusunda kapsamlı bir mimari plan.
- **Project Folder Cleanup:** Kök dizindeki gereksiz hata dosyaları temizlendi.
- **Aşama 1 & 2:** `EventBus` kurulumu, `history.ts` ve `document.ts` dekuplajı tamamlandı.
- **Aşama 3:** `hcie-canvas-ui` modülü `rendering-loop.ts` ve `event-dispatcher.ts` olarak ikiye ayrıldı; event-driven yapıya geçildi.
- **Task #1324 Fill & Radius Fixes:** Edit modunda fill checkbox anlık güncelleme eklendi (`fillChanged` event listener). Circle şekiller için Radius alanı panelde gösterildi (Angle yerine). Ghost modda property değişikliği desteği (fill/color) düzeltildi. 🟡

## 🔴 In Progress
- **Aşama 4:** `hcie-tools/selection.ts` dosyasının atomik parçalara (`mask-logic.ts`, `renderer.ts`, `transformer.ts`) ayrılması.

## ⚪ Backlog
| Task | Description | Plan File |
|------|-------------|-----------|
| Aşama 4.2 | `vector_tools.ts` decoupling | implementation_plan.md |
| Aşama 5 | `hcie-io` dekuplajı | implementation_plan.md |
| Aşama 6 | Web App (`core-patch.ts`) temizliği | implementation_plan.md |
| #1006 Core I/O | Krita (.kra) ve GIMP (.xcf) için kayıt desteği | task-1006-breakdown.md |
| #1050 Paint.NET | .pdn dosyaları için import desteği | plan_1050_pdn_support.md |
| #1070 Icon Export | .ico formatında çoklu çözünürlük export | plan_1070_1071_ico_support.md |
| #1080 SVG Workspace | SVG vektör düzenleme çalışma alanı | plan_1080_1082_svg_support.md |
| #1100 Viewer Mode | FastStone benzeri resim görüntüleme modu | plan_1100_viewer_mode.md |
| #1210 Adjustments | Contrast, Brightness, Saturation ayarları | plan_1200_color_adjustments.md |
| #1300 AI Tools | AI destekli resim düzenleme araçları | plan_1300_ai_tools.md |
