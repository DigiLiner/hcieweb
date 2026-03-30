# USER TASKS & COMMANDS

This file is a dedicated space for the USER to document commands, tasks, and requirements.
The AI AGENT is strictly forbidden from modifying this file.

## Backlog

(Write your requests here)

- [x] list every line of code related by polygol select, analyze to remove safely and give me a list of codes to delete.

  19.02.2026 (solved)

#1001 – Araç kutusu (Toolbox) butonlarının tema uyumu

Türkçe:
Hata: Araç kutusundaki butonlar, koyu tema etkin olsa bile beyaz renkte kalıyor. Bu butonların CSS stilleri, yerel (native) buton görünümünde olacak ve açık/koyu temaya otomatik uyum sağlayacak şekilde düzenlenmelidir. Ayrıca butonların içindeki SVG simgelerinin renkleri de temaya uygun olarak güncellenmelidir.

English:
Bug: Toolbox buttons remain white even when the dark theme is active. Their CSS styles should be redesigned to look like native buttons and adapt automatically to light/dark themes. Also, the colors of the SVG icons inside the buttons must be updated to match the active theme.
#1002 – Web sürümünde durum çubuğu (status bar) görünmüyor

Türkçe:
Hata: Uygulamanın web sürümünde durum çubuğu (status bar) hiç görünmüyor. Bu durum, CSS veya render hatasından kaynaklanıyor olabilir. Durum çubuğunun tüm sürümlerde (web ve masaüstü) doğru şekilde görüntülenmesi sağlanmalıdır.

English:
Bug: In the web version of the application, the status bar is not visible at all. This may be caused by a CSS or rendering error. The status bar must be made visible correctly in all versions (web and desktop).
#1003 – Çizim araçlarının ayarlarının kalıcı olarak saklanması

Türkçe:
Yeni özellik: Çizim araçlarının (fırça, kalem, silgi vb.) ayarları bir yapılandırma dosyasında tutulmalıdır. Bu ayarlar; boyut (size), opaklık (opacity), yarıçap (radius) gibi değerlerdir. Kullanıcı bu ayarları değiştirdiğinde, değişiklik anında kaydedilmeli ve uygulama bir daha açıldığında otomatik olarak geri yüklenmelidir. Bu ayarlar global bir nesne (globals) içinde saklanmalı ve ilgili kontroller (slider, checkbox, buton) her zaman bu global değerlerle senkronize edilmelidir.

English:
New feature: Drawing tool settings (brush, pen, eraser, etc.) should be stored in a configuration file. These settings include values such as size, opacity, and radius. When the user changes any setting, the change must be saved immediately and restored automatically the next time the application starts. These settings must be kept in a global object and the corresponding UI controls (sliders, checkboxes, buttons) must always stay synchronized with these global values.
#1004 – Koyu tema için dama tahtası (checkerboard) deseni

Türkçe:
Hata/İyileştirme: Koyu tema aktifken, saydamlık arka planı olarak kullanılan dama tahtası deseni göze fazla parlak geliyor. Bu desen, koyu tema için özel olarak koyu gri ve normal gri karelerden oluşacak şekilde yeniden tanımlanmalıdır. Desen kaynağı (resource) ayrı bir dosyadan yüklenmeli ve tema değiştiğinde otomatik olarak değiştirilmelidir.

English:
Bug/Enhancement: When the dark theme is active, the checkerboard pattern used as the transparency background appears too bright. This pattern should be redefined specifically for the dark theme using dark gray and normal gray squares. The pattern resource should be loaded from a separate file and automatically swapped when the theme changes.
#1005 – Kaynak dosyalarının (SVG simgeleri) tema uyumu ve klasör yapısı

Türkçe:
Yeniden düzenleme: Tüm kaynak dosyaları (özellikle SVG simgeler) temaya uygun şekilde düzenlenmelidir. Gerekirse simgeler tematik gruplara ayrılmalı ve mantıklı bir klasör yapısına yerleştirilmelidir. Kullanılmayan veya gelecekte ihtiyaç duyulabilecek kaynaklar ise “depo” (archive/storage) adlı bir klasöre taşınmalıdır. Amaç, proje dosyalarını temiz ve sürdürülebilir kılmaktır.

English:
Reorganization: All resource files (especially SVG icons) must be made theme-aware. If necessary, icons should be grouped thematically and placed in a sensible folder structure. Unused resources or those that might be needed in the future should be moved to an “archive” folder. The goal is to keep the project files clean and maintainable.


#1006 – Farklı dosya formatlarını okuma/yazma altyapısı

Türkçe:
Yeni özellik: Farklı resim dosya formatlarının okunup yazılabilmesi için, her format ile uygulamanın iç resim veri yapısı (internal image representation) arasında dönüşüm yapacak bir arayüz (interface) sistemi tasarlanmalıdır. Tüm format sınıfları bu arayüz üzerinden bağlanmalıdır. Aşağıdaki formatlar desteklenecektir (dosya açma/kaydetme filtresi olarak):

    Image Files|.bmp;.cut;.dds;.gif;.ico;.iff;.jpg;.koala;.lbm;.mng;.pbm;.pcd;.pcx;.pgm;.png;.ppm;.psd;.ras;.rle;.tga;.tif;.wbmp;.xbm;.xpm

    Bitmaps (.bmp,.dib) → .bmp;.dib

    GIF images (*.gif) → *.gif

    JPEG images (*.jpg) → *.jpg

    Windows Metafiles (.wmf,.emf) → .wmf;.emf

    Icons (.ico,.cur) → .ico;.cur

    All Files (.) → .

Ayrıca aşağıdaki uygulama formatlarına ait dosyalar da desteklenmelidir (Krita, GIMP, Photoshop, Paint.NET dosyaları). Bu formatların okunması, yazılması ve düzenlenebilmesi için gerekli altyapı oluşturulmalıdır.

English:
New feature: To support reading and writing different image file formats, design an interface system that performs conversion between each file format and the application’s internal image data structure. All format classes must conform to this interface. The following formats will be supported (as file open/save filters):

    Image Files|.bmp;.cut;.dds;.gif;.ico;.iff;.jpg;.koala;.lbm;.mng;.pbm;.pcd;.pcx;.pgm;.png;.ppm;.psd;.ras;.rle;.tga;.tif;.wbmp;.xbm;.xpm

    Bitmaps (.bmp,.dib) → .bmp;.dib

    GIF images (*.gif) → *.gif

    JPEG images (*.jpg) → *.jpg

    Windows Metafiles (.wmf,.emf) → .wmf;.emf

    Icons (.ico,.cur) → .ico;.cur

    All Files (.) → .

Additionally, files from the following applications must be supported: Krita, GIMP, Photoshop, Paint.NET. Build the necessary infrastructure to read, write, and edit these file formats.


rgba(19, 250, 123, 0.96) butonlarda ve menülerde simgeler görünmüyor.

rgba(10, 240, 60, 0.97) silgi seçili alan dışını siliyor. Halbuki oraya dokunmamalı
#1015
#1016
#1017
#1018
#1019
