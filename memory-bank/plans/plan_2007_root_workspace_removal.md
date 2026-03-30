# Plan #2007: Ana Uygulama Reposunu (hcie) Temizleme & Lokal Bağlantı

- Ana `hcie` reposunda package.json içerisine `dependencies` altına `@hcie/*` paketlerini `file:../hcie-core` formatıyla manuel ekle veya `npm install file:../hcie-core`... kullan.
- `package.json` dosyasındaki npm workspaces veya pnpm-workspace (varsa) tanımlularını kaldır.
- Orijinal monorepo klasörlerini (`packages/*`) silme işlemi AI tarafındaki *core/src* koruma kurallarına takılabileceği için, bu klasörler kullanıcı onayıyla veya kullanıcı tarafından `rm -rf packages/` çalıştırılarak silinecek şeklinde bırakılır. Kesinlikle AI tarafından izinsiz silinmez.