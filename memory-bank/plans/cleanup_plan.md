# Cleanup Plan - Proje Klasör Temizliği

## Objective
Proje kök dizinindeki gereksiz hata ayıklama (debug) betiklerini, geçici dosyaları ve çıktıları temizlemek.

## Proposed Actions
1. **Gereksiz JavaScript dosyalarını sil:** Kök dizindeki tek seferlik test/debug betikleri.
   - `brute_force.js`
   - `brute_force_pixel.js`
   - `check_tile_white.js`
   - `debug_krita.js`
   - `dump_tile.js`
   - `final_check.js`
   - `multi_head.js`
   - `solve_krita.js`
   - `try_best.js`
   - `try_success.js`
   - `verify_final.js`

2. **Geçici veri dosyalarını sil:**
   - `broken_paths.txt`
   - `layer_binary`
   - `tile00_raw.bin`
   - `tile512_raw.bin`
   - `menu_test_results.md` (Eğer artık gerekmiyorsa)

3. **Derleme çıktılarını temizle:**
   - `dist-static/`
   - `dist-web/`
   - `build/`
   - `tauri-dist/`
   - `.history/` (VS Code extension history, genelde temizlenir)
   - `.npm_cache/`
   - `.vs/`
   - `.idea/`

## Rationale
Bu dosyalar projenin ana işleyişi (apps/, packages/) için gerekli değildir ve kök dizini kalabalıklaştırmaktadır.

## Verification
`npm run dev` komutunun hala çalıştığını ve ana dizinin daha temiz göründüğünü doğrula.
