# [AI-FORBIDDEN] - FINISHED TASKS
<!-- 
  AI AGENT WARNING: 
  This directory and its files are intended for human use only. 
  AI agents are strictly forbidden from reading or interpreting the contents of this file unless explicitly instructed for metadata generation.
-->

29/03/2026 12:54  
#1000  
bug: pen seçiminde ortaya çıkan pen şekilleri beyaz temaya uygun değil. Görünmüyorlar.

#1001  
bug : toolbox butonları koyu temada da beyaz olarak kalıyor. bunların css stilini native buton şeklinde ve açık-koyu temaya uygun olacak şekilde düzenle. svg resimlerin renklerini de temaya uygun şekilde güncelle.

#1002  
web sürümünde bug : status bar görünmez olmuş

#1003  
yeni özellik : çizim araçlarının ayarlarını bir ayar dosyasında tut.Bunlar Size,opacity ,radius gibi ayarlardır. Bu ayarlar değişiklikten sonra hemen kaydedilsin ve uygulamanın sonraki açılışında geri yüklensin. Bu değişiklikler globals içinde tutulsun ve her zaman arayüzdeki ilgili kontrol güncellensin. Bu slider, checkbox veya buton olabilir.

#1004  
koyu tema aktif iken checkerboard şekilli arka plan göze fazla parlak görünüyor. Koyu gri ve normal gri olacak şekilde bu deseni de koyu tema ile birlikte aktif et. Bunun için bir resource dosyası hazırla.

#1005  
tüm resource dosyalarını (svg icons) temaya uygun şekilde düzenle. gerekli ise gruplandır ve mantıklı bir klasör yapısına göre yeniden yerleştir. İhtiyaç olmayanları ise depo şeklinde bir klasöre taşı, ileride gerek olabiceğini düşün.

#1006  
farklı resim dosya formatlarının okunup yazılabilmesi için format türü ile hcie arasında dönüşüm yapacak bir interface sistemi tasarla. Tüm format sınıfları bu interface sistemine göre bağlansın. Daha standart bir yapı olur. istediğim formatlar şunlar (filtre olarak):  
Image Files|\*.bmp;\*.cut;\*.dds;\*.gif;\*.ico;\*.iff;\*.jpg;\*.koala;\*.lbm;\*.mng;\*.pbm;\*.pcd;\*.pcx;\*.pgm;\*.png;\*.ppm;\*.psd;\*.ras;\*.rle;\*.tga;\*.tif;\*.wbmp;\*.xbm;\*.xpm|Bitmaps (\*.bmp,\*.dib)|\*.bmp;\*.dib|GIF images(\*.gif)|\*.gif|JPEG images(\*.jpg)|\*.jpg|Windows Metafiles (\*.wmf,\*.emp)|\*.wmf;\*.emp|Icons (\*.ico,\*.cur)|\*.ico;\*.cur|All Files (\*.\*) |\*.\*||  
Ad olarak: Krita files, GIMP files,Photoshop,Paint .net files

bu dosyaların okunup yazılabilmesi ve düzenlenebilmesi için altyapı oluştur.

#1007  
bug: Floodfill tool not limited with selection area

&nbsp;

&nbsp;   #1008 - solved  
    fill a file with tasks status every time File must be human readable and colored if posible .Add this rule to AI rules and perform always

&nbsp;   #1009 - solved  
    update AI rules . After fixing or doing a task , mark that task as waiting to confirm and yellow . until I confirmed don't take any further acitons with that task. Add this also rules

#1011(skip this issue- postpone for now)rectangle, circle, lasso select and move functions worked properly, don't change please . there is only problem on polygon selection. it's not working, not moving, not clearing. plan finely to work only on polygon select tool and fix.(still not solved)

#1012 butonlarda ve menülerde simgeler görünmüyor.

#1014 silgi seçili alan dışını siliyor. Halbuki oraya dokunmamalı

#1060 Photoshop (.psd) dosyası export özelliği ekle (FIXED). Archive kaldır.

#10017 crop tool eklenecek. Crop tool ile ilgili ayarlar history'ye kaydedilsin.Menüler de aktif olsun.

#10017 crop tool eklenecek. Crop tool ile ilgili ayarlar history'ye kaydedilsin.Menüler de aktif olsun.

       crop enter tuşu da çift tık da çalışmıyor. crop seçici iki resim arasında birbirine karışıyor. sadece çizildiği yerde kalmalı. crop ile select aynı şekilde yürüyen karınca gösteriyor. halbuki crop için sınırları bir dolu çizgisi olan dikdörtgen ve seçimi değiştirecek tutma noktaları olmalı

#11016 seçim menüsüne feather, grow, daralma gibi ek özellikler eklenecek. Invert, feather, grow, shrink, border, fill, deselect, select all fonksiyonları aktif olarak çalışsın.  
#10016-1-FIX-REQUEST : bu araçlar iyi çalışıyor. istediğim bir UI kolaylığı, menüden çıkan modal diyaloğa değer girerken önizleme yapılamıyor. Çünkü modal ekranı kapatıyor. taşınabilir bir pencere içinde bu ayarlar yapılsın ve hemen önizleme görünsün. ok ve cancel butonları da olsun.

#1020 settings menüsü. Kullanıcının ayarlar yapabilmesi için bir settings sayfası tasarla. programın her türlü ayarı burada olacak. Fikirlerini bekliyorum. Planla ve plan klasörüne ekle 
