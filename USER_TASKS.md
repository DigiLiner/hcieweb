# USER TASKS & COMMANDS

This file is a dedicated space for the USER to document commands, tasks, and requirements.
The AI AGENT is strictly forbidden from modifying this file.

## Backlog

(Write your requests here)

#1003 – Çizim araçlarının ayarlarının kalıcı olarak saklanması

English:
New feature: Drawing tool settings (brush, pen, eraser, etc.) should be stored in a configuration file. These settings include values such as size, opacity, and radius. When the user changes any setting, the change must be saved immediately and restored automatically the next time the application starts. These settings must be kept in a global object and the corresponding UI controls (sliders, checkboxes, buttons) must always stay synchronized with these global values.


#1005 – Kaynak dosyalarının (SVG simgeleri) tema uyumu ve klasör yapısı

#1006 – Farklı dosya formatlarını okuma/yazma altyapısı

#1030 Gimp dosyası kaydetme özelliği ekle

#1040 Krita dosyası kaydetme özelliği ekle

#1050 Paint.NET (.pdn) format desteği . dosya import özelliği ekle

#1060 Photoshop (.psd) dosyası export özelliği ekle (FIXED). Archive kaldır.
#1070 Icon (.ico) dosyası export özelliği ekle
#1071 Icon (.ico) dosyası import özelliği ekle
#1072 Icon düzenleme için canvas ve toolset farklı olacak şekilde workspace yapılanması planlanmalı
#1080 SVG düzenleme için workspace yapılanması planlanmalı
#1081 SVG Import özelliği ekle
#1082 SVG Export özelliği ekle

#1100 viewer modu eklenecek. 
#1101 viewer modunda faststone benzeri bir arayüz kullanılacak. 
#1102 viewer modunda resimler arasında geçiş yapılacak. 
#1104 viewer basit çizim araçları da olacak

#1200 Resim renk paleti ile ilgili işler
#1210 Contrast, Brightness, Hue, Saturation ayarları eklenecek

#1300 AI resim düzenleme araçları eklenecek

#10010 (BUG-REMAINS)Son açık tab kapanmıyor. bir tane açık kalıyor.NEWCOMMENT: yeni bir image açılıyor ama diyalog açık kalıyor. Ayrıca diyalogda open image çalışmıyor.

#10011 (BUG)Seçim alanı aktif iken başka bir dökümana geçildiğinde seçim içindeki pixeller diğer dökümanda görünüyor NEW COMMENT: Undo sayıları dökümanlarda birbirine karışıyor. İlk hale gelse bile undo düğmesi aktif kalıyor, diğer dökümandan kopyalanmaya başlıypr. Undo-redo hafızası her tab için tamamen ayrı tutulmalı. Tab değişince butonlar ve menüler gündellenmeli, ilgili undo hafızası aktif edilmeli.

#10012 (BUG-REMAINS)Seçim undo redoya kaydedilmiyor.NEW COMMENT: Seçim değiştiğinde bu da undo olabilecek şekilde yapılandırılmalı ve history olarak görülmeli. Seçimi geri almaya çalışınca,resim undo oluyor.

#10013 (BUG)undo-redo dökümanları karıştırıyor. ayrı tutulmalı. NEW COMMENT: Redo yapınca karışıklık var.

#10014 (BUG-FIXED)çizim şeklini(kalem ucunu) gösteren overlay nesnesi daha başlanğıçta bile sol üstte görünüyor. Fare canvas dışında iken görünmemeli

#10015 (BUG-FIXED)New Image dialog sayfayı ortalamıyor.

