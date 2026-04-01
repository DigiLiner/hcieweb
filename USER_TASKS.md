# USER TASKS & COMMANDS

This file is a dedicated space for the USER to document commands, tasks, and requirements.
The AI AGENT is strictly forbidden from modifying this file.

## Backlog

(Write your requests here)

#1003 – Çizim araçlarının ayarlarının kalıcı olarak saklanması

Türkçe:
Yeni özellik: Çizim araçlarının (fırça, kalem, silgi vb.) ayarları bir yapılandırma dosyasında tutulmalıdır. Bu ayarlar; boyut (size), opaklık (opacity), yarıçap (radius) gibi değerlerdir. Kullanıcı bu ayarları değiştirdiğinde, değişiklik anında kaydedilmeli ve uygulama bir daha açıldığında otomatik olarak geri yüklenmelidir. Bu ayarlar global bir nesne (globals) içinde saklanmalı ve ilgili kontroller (slider, checkbox, buton) her zaman bu global değerlerle senkronize edilmelidir.

English:
New feature: Drawing tool settings (brush, pen, eraser, etc.) should be stored in a configuration file. These settings include values such as size, opacity, and radius. When the user changes any setting, the change must be saved immediately and restored automatically the next time the application starts. These settings must be kept in a global object and the corresponding UI controls (sliders, checkboxes, buttons) must always stay synchronized with these global values.
#1004 – Koyu tema için dama tahtası (checkerboard) deseni

#1005 – Kaynak dosyalarının (SVG simgeleri) tema uyumu ve klasör yapısı

Türkçe:
Yeniden düzenleme: Tüm kaynak dosyaları (özellikle SVG simgeler) temaya uygun şekilde düzenlenmelidir. Gerekirse simgeler tematik gruplara ayrılmalı ve mantıklı bir klasör yapısına yerleştirilmelidir. Kullanılmayan veya gelecekte ihtiyaç duyulabilecek kaynaklar ise “depo” (archive/storage) adlı bir klasöre taşınmalıdır. Amaç, proje dosyalarını temiz ve sürdürülebilir kılmaktır.

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


