# Plan #2008: Ana Uygulamanın Doğrulanması (Editor & Web)

- İçeri aktarmaların (import) monorepo alias (`@/*` veya özel pathler) değil, npm paket adı (`@hcie/core`) formatında olduğunu doğrula.
- Web uygulamasını derle (`npm run build`). Gerekirse Vite config içindeki eski alias ayarlarını iptal et veya node_modules/ dizinini okuyacak statüye getir.
- Uygulamayı geliştirme ortamında başlat (`npm run dev`) ve çalıştığını test et.