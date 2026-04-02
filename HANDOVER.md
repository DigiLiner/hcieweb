# HCIE Project Handover Guide (Devir Rehberi)

## 📌 Proje Durumu
Şu an **Phase 8 (Kritik Hata Giderme ve Stabilizasyon)** aşamasındayız. Core kütüphane (`packages/core`) kapalı (read-only) olduğu için tüm düzeltmeler `apps/web/src/core-patch.ts` dosyası üzerinden "Runtime Patching" yöntemiyle yapılıyor.

## 🛠️ En Son Yapılan Çalışma (#10012)
- **Konu:** Seçim araçlarının (Lasso, Rect, Wand vb.) Undo/Redo (Geri Al/İleri Al) geçmişine kaydedilmemesi ve geri yükleme sonrası görünmez olması sorunu.
- **Çözüm:** `SelectionAction` sınıfı oluşturuldu, `finishDrawing` ve diğer seçim fonksiyonları yamandı (patched).
- **Dosya:** `apps/web/src/core-patch.ts` (Satır 152-336)
- **Konuşma Özeti:** 2026-04-03 00:36 (local) konuşmasında bu özellik test edildi ve onay bekliyor.

## 🚦 Kritik Dosyalar ve Klasörler
- `USER_TASKS.md`: Yapılacaklar listesi (User tarafından yönetilir). AI AGENT bu dosyayı değiştiremez.
- `MESSAGE_FROM_AGENT.md`: AI'nın durum raporu (🟡 onay bekleyen işleri buradan takip edin).
- `apps/web/src/core-patch.ts`: Uygulamanın tüm "akıllı" yama mantığının bulunduğu yer.
- `memory-bank/`: Projenin mimari hafızası (Başlamadan önce mutlaka okunmalı).

## ⚠️ Yeni Gelen İçin Önemli Notlar (AGENTS.md Kuralları)
1. **Core Read-Only:** `packages/core/src/` dizinine ASLA dokunma. Bir hata varsa raporla veya `core-patch.ts` içine patch yaz.
2. **Dil:** Kullanıcı ile iletişim **Türkçe**, tüm kod yorumları ve dokümantasyon **İngilizce** olmalıdır.
3. **Wait for Confirm:** 🟡 işaretli bir görevi kullanıcı onaylamadan (🟢 yapmadan) başka işe başlama.
4. **Logging:** Her önemli işlemden sonra `memory-bank/` dosyalarını güncelle.
5. **Memory Arşiv:** `memory-bank/memory-arsiv/` dizinine asla dokunma, o kullanıcı referansı içindir.

## 🚀 Sonraki Adımlar (Phase 9)
1. Kullanıcıdan #10012 için son onayı al.
2. SVG simgelerinin organizasyonu (#1005).
3. GIMP (#1030) ve Krita (#1040) format desteklerinin eklenmesi.
