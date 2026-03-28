#ai agents can not read and edit this file
#this file is for backup
#AI DONT TOUCH THIS FILE ,EXIT IMMEDIATELY
#AI DONT DELETE THIS FILE

import tarfile
import os
import datetime
import sys

def hcie_tarihli_yedekle(kaynak_dizin, yorum=""):
    # Dışlanacak klasörler
    dislanacaklar = {"yedek","node_modules", ".git", ".venv",".history","dist","tauri-dist","src-tauri"}

    # Şu anki tarih ve saati al (Format: Yıl_Ay_Gün_SaatDakikaSaniye)
    zaman_damgasi = datetime.datetime.now().strftime("%Y_%m_%d___%H_%M")
    
    # Yorum varsa temizle ve dosya adına ekle
    yorum_str = yorum.strip().replace(" ", "_")
    yorum_eki = f"_{yorum_str}" if yorum_str else ""
    cikis_dosyasi = f"./yedek/hcie_yedek_{zaman_damgasi}{yorum_eki}.tar.gz"

    def filtrele(tarinfo):
        # Yol ayracına göre parçala ve yasaklı klasör kontrolü yap
        yol_parcalari = tarinfo.name.split(os.sep)
        if any(d in yol_parcalari for d in dislanacaklar):
            return None
        return tarinfo

    try:
        if not os.path.exists(kaynak_dizin):
            print(f"Hata: '{kaynak_dizin}' klasörü bulunamadı.")
            return

        # Yedek dizini yoksa oluştur
        os.makedirs(os.path.dirname(cikis_dosyasi), exist_ok=True)

        with tarfile.open(cikis_dosyasi, "w:gz") as tar:
            tar.add(kaynak_dizin, arcname=os.path.basename(kaynak_dizin), filter=filtrele)

        print(f"Yedekleme başarılı: {cikis_dosyasi}")
    except Exception as e:
        print(f"Hata oluştu: {e}")

if __name__ == "__main__":
    # Parametre varsa al, yoksa sor
    if len(sys.argv) > 1:
        yorum = " ".join(sys.argv[1:])
    else:
        yorum = input("Yedek için bir yorum yazın: ")
    
    hcie_tarihli_yedekle(".", yorum)



