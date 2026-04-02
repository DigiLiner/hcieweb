# Selection History Stabilization Plan (V3)

## Goal
Tüm seçim değişikliklerinin (Rect, Ellipse, Lasso, Polygon, Wand, Select All, Deselect, Invert) History paneline kaydedilmesini ve undo/redo sırasında görsel olarak (karınca yürüyüşü ile) doğru şekilde geri/ileri alınmasını sağlamak.

## Research Findings
- **Küresel Fonksiyonlar:** `hcie-tools/src/selection.js` dosyası `buildRectSelection`, `buildLassoSelection`, `selectAll` gibi kritik fonksiyonları `window` objesine atıyor.
- **Problem:** Önceki denemelerdeki `finishDrawing` yaklaşımı, bu fonksiyonun modül içine hapsolmuş olması (ve global'e her zaman eklenmemesi) nedeniyle güvenilmezdi.
- **Çözüm:** En temel "selection builder" fonksiyonlarını (global'dekileri) patchleyerek kaynaktan veri yakalamak.

## User Review Required
> [!IMPORTANT]
> Bu yama, seçim araçlarının temel çalışma şeklini değil, sadece durum değişikliklerini izler. Performans üzerindeki etkisi minimumdur ancak her seçim işleminde History paneline bir girdi eklenmesine neden olur (beklenen davranış).

## Proposed Changes

### [MODIFY] [core-patch.ts](file:///home/hc/Belgeler/00_PROJECTS/Tauri/hcie/apps/web/src/core-patch.ts)
- `SelectionAction` sınıfını (undo/redo verisini saklayan yapı) iyileştir.
- `captureSelectionState()` metodunu daha güvenli (null-check içeren) hale getir.
- Aşağıdaki **KÜRESEL** fonksiyonları patchle:
    - **Seçim Araçları:** `buildRectSelection`, `buildEllipseSelection`, `buildLassoSelection`, `buildPolygonalSelection`, `magicWandSelection`.
    - **Menü Komutları:** `selectAll`, `deselect`, `invertSelection`.
- Her patch işleminde "Önce/Sonra" farkı varsa otomatik olarak `HistoryManager.push` yap.
- `SelectionAction.applyState` metodunun sonunda mutlaka `renderLayers()` çağırarak UI güncellemesini zorla.

## Verification Plan
1. **Araç Testleri:** Rect, Lasso ve Polygon ile seçim yap -> History panelinde girişleri kontrol et.
2. **Menü Testleri:** "Select All" ve "Deselect" (Ctrl+D) yap -> History panelinde girişleri kontrol et.
3. **Görsel Doğrulama:** Ctrl+Z ile geri al -> Karınca yürüyüşünün kaybolduğunu doğrula.
4. **İleri Al (Redo):** Ctrl+Shift+Z yap -> Karınca yürüyüşünün aynen geri geldiğini doğrula.
