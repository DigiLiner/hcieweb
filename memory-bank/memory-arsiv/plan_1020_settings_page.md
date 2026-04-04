# Plan: Settings Page (#1020)

Bu plan, HCIE uygulamasının tüm ayarlarını tek bir yerden yönetebilecek profesyonel ve modüler bir "Settings" (Ayarlar) sayfası/modali oluşturulmasını kapsar.

## Hedefler
- Kullanıcı dostu, kategorize edilmiş bir ayar arayüzü sağlamak.
- Ayarların `localStorage` üzerinden kalıcı (persistent) olmasını sağlamak.
- Değişikliklerin mümkün olan durumlarda anında (real-time) uygulanması.
- Uygulama menüsündeki "Preferences" (Ctrl+K) bağlantısını aktif hale getirmek.

## Kullanıcı İncelemesi Gerekenler
> [!IMPORTANT]
> Ayarlar sayfası için önerilen kategoriler ve içerikler aşağıdadır. Eklemek veya çıkarmak istediğiniz bir bölüm var mı?

### Önerilen Ayar Kategorileri
1. **Genel (General):** Dil seçimi (TR/EN), Başlangıçta son dosyayı aç, Çıkışta onayla.
2. **Arayüz (Interface):** Tema seçimi (Dark/Light/System), Vurgu rengi (Accent Color), UI ölçekleme.
3. **Çizim Alanı (Canvas):** Şeffaflık deseni (Checkerboard) boyutu ve rengi, Cetvel (Rulers) birimi (px/cm/inch), Otomatik hizalama (Snapping) hassasiyeti.
4. **Araçlar (Tools):** Fırça ayarlarını hatırla, Seçim modunda varsayılan davranış (Ekle/Çıkar), Renk seçimi (HEX/RGB).
5. **Gelişmiş (Advanced):** GPU Hızlandırma durumu, Undo/Redo adım sınırı, Önbellek temizleme (Clear Cache), Debug konsolu.

## Önerilen Değişiklikler

### [Component] Settings Core Logic
Yeni bir `SettingsManager` yapısı kurularak tüm ayarların merkezi bir yerden yönetilmesi sağlanacaktır.

#### [NEW] [settings_manager.js](file:///home/hc/Belgeler/00_PROJECTS/Tauri/hcie/apps/editor/settings_manager.js)
- Ayarların varsayılan değerlerini tutar.
- `localStorage` okuma/yazma işlemlerini yönetir.
- Ayar değiştiğinde ilgili bileşenlere (Canvas, Theme vb.) haber veren bir event yapısı sunar.

### [Component] Settings UI
Mevcut `modifier_modal.js` yapısına benzer ancak daha gelişmiş, sekmeli (tabbed) bir modal sistemi kurulacaktır.

#### [NEW] [settings_ui.js](file:///home/hc/Belgeler/00_PROJECTS/Tauri/hcie/apps/editor/settings_ui.js)
- `showSettingsModal()` fonksiyonunu dışa aktarır.
- Sol tarafta kategoriler (sekmeler), sağ tarafta ayar kontrollerini içeren bir arayüz çizer.
- Input tiplerine göre (Switch, Slider, Select, ColorPicker) dinamik render yapar.

#### [MODIFY] [menu_connections.js](file:///home/hc/Belgeler/00_PROJECTS/Tauri/hcie/apps/editor/menu_connections.js)
- "Preferences" menü seçeneğinin `onclick` olayına `showSettingsModal()` bağlanacaktır.
- `Ctrl+K` kısayol tuşu desteği eklenecektir.

#### [MODIFY] [index.html](file:///home/hc/Belgeler/00_PROJECTS/Tauri/hcie/index.html)
- Menüdeki `not-implemented` class'ı Preferences kısmından kaldırılacak.

## Açık Sorular
- **Tema Motoru:** Şu anki CSS yapısı dinamik tema değişimini tam destekliyor mu yoksa sadece `Dark Mode` üzerine mi kurulu?
- **Dil Desteği:** Çoklu dil (i18n) altyapısı için sabit bir kütüphane mi kullanılmalı yoksa basit bir JSON sözlük yapısı yeterli mi?

## Doğrulama Planı

### Manuel Doğrulama
- Ayarlar modalini Ctrl+K ile açma.
- Tema değiştirme (Anında yansıma kontrolü).
- Sayfayı yeniledikten sonra ayarların korunduğunu doğrulama (localStorage testi).
- "Clear Cache" butonunun çalıştığını doğrulama.
