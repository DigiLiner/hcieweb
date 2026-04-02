# Task Log: Bug #10012 - Selection History Stabilization (V5 Event-Level)

## 🛠️ Problem
- Kare, Daire ve Kement araçlarının hala kaydedilmemesi.
- Sebebi: `drawing_canvas.ts` içindeki `on_canvas_mouse_up` ve `finishDrawing` fonksiyonlarının birbirini modül içi (local) olarak çağırması, bu yüzden global yamaların bypass edilmesi.
- Ayrıca `mousedown` capture zamanlaması ile ilgili yarış durumları.

## 💡 Solution (V5)
1.  **Event-Level Hijacking (Capture Phase)**: `drawingCanvas` üzerine doğrudan `mousedown` (capture: true) listener'ı eklendi. Uygulama mantığı çalışmadan EN ÖNCE durum yedekleniyor.
2.  **Universal MouseUp/DblClick/Keydown**: `mouseup`, `dblclick` ve `Enter` (keydown) olayları capture fazında yakalanıyor. İşlem bittikten 50-100ms sonra (uygulama state'i güncelledikten sonra) karşılaştırma yapılıp history kaydı oluşturuluyor.
3.  **Module Bypass**: Fonksiyon yamalamaya (monkey-patching) gerek kalmadan, browser olayları üzerinden tüm araçlar (Square, Circle, Lasso, Wand, Polygon) merkezi olarak izleniyor.
4.  **Bilinçli Geciktirme**: `setTimeout` kullanımıyla asenkron state güncellemelerinin (maske oluşturma vb.) bitmesi bekleniyor.

## 📂 Files Modified
- `apps/web/src/core-patch.ts`

## ✅ Current Status
- **Implemented:** 🟢 (V5 Event-Level Patch Applied)
- **Tested:** 🟡 (Final verification needed)
- **Waiting for Confirmation:** 🟡
