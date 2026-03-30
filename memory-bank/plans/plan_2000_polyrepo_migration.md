# Monorepo'dan Ayrı Repolara (Polyrepo) Geçiş Planı (Revize)

Bu belge, tek bir monorepo (`hcie`) içinde bulunan projeyi tamamen bağımsız Git repolarına bölme sürecini detaylandırmaktadır. Kullanıcı onayına istinaden; kütüphaneler yerel (lokal) olarak `file:../` yoluyla veya tarball (`npm pack`) ile bağlanacak, ancak deploy aşamasında Git reposu üzerinden bağımlılıkla kurulabilir bir esneklikte yapılandırılacaktır. Kullanıcı `@hcie` namespace'ine onay vermiştir.

> [!WARNING]
> **AI Ajanı Erişim & Güvenlik Uyarısı (Kural İhlali Koruması)**
> AI sisteminin kısıtlı yetkileri ve **AGENTS.md** dosyasındaki `packages/core/src/` dizini için "Read-Only" (Sadece Okunabilir) kuralı nedeniyle, taşıma işlemleri sırasında veya `core` silinirken doğrudan `rm` komutu işletildiğinde **kural ihlali** hatalarına yol açabilir. 
> Bu sebeple taşıma işlemleri, eskiyi silmek yerine **yeni klasöre kopyalamayı (`cp -r`)** temel almaktadır. Orijinal klasörün silinmesi işlemi en son aşamada bizzat kullanıcının müdahalesi veya özel onayıyla gerçekleştirilecektir.

## Hedeflenen Yeni Klasör Yapısı
```text
/home/hc/Belgeler/00_PROJECTS/Tauri/
├── hcie-core/
├── hcie-shared/
├── hcie-tools/
├── hcie-io/
├── hcie-ui-components/
├── hcie-canvas-ui/
└── hcie/ (Ana Uygulama Reposu)
```

## Alt Planlar (Detaylı Uygulama Adımları)

Uygulama aşamasına geçildiğinde `task-logs` altında her bir numaralı plan adım adım işlenecektir:

### Plan #2000: Hedef Repoların Oluşturulması ve Başlangıç Ayarları
- `/home/hc/Belgeler/00_PROJECTS/Tauri/` dizininde yeni klasörleri oluştur (`mkdir hcie-core hcie-shared ...`).
- Her bir klasörde `git init` komutunu çalıştır.
- Ortak `.gitignore`, `.prettierrc`, `tsconfig.base.json` (varsa) dosyalarını her bir repoya kopyala.
- Her repo için standart bir `README.md` oluştur.

### Plan #2001: hcie-core Kütüphanesinin Ayrıştırılması
- `hcie/packages/core/` klasörünün tüm içeriği `Tauri/hcie-core/` dizinine **kopyalanacaktır** (`cp -r`). Agent kuralını kırmamak için taşıma taşıyıp eskiyi silme işlemi YAPILMAYACAKTIR.
- `hcie-core/package.json` dosyasını düzenle: isim `@hcie/core`, versiyon `1.0.0`, build scriptleri.
- Klasöre girip `npm install` ve `npm run build` ile bağımsız derlendiğini test et.
- Initial commit oluştur (`git add . && git commit -m "feat: initial extraction of core library"`).

### Plan #2002: hcie-shared Kütüphanesinin Ayrıştırılması
- `hcie/packages/shared/` içeriğini `Tauri/hcie-shared/` dizinine kopyala.
- `package.json` adını `@hcie/shared` yap.
- Bağımlılık olarak `@hcie/core` package.json'a `file:../hcie-core` lokal klasör yoluyla (lokal deploy için en uygunu) eklenmelidir.
- Kurulum, derleme testini yap ve git commit at.

### Plan #2003: hcie-tools Kütüphanesinin Ayrıştırılması
- `hcie/packages/tools/` içeriğini `Tauri/hcie-tools/` dizinine kopyala.
- `package.json` adını `@hcie/tools` olarak güncelle.
- `@hcie/core` ve `@hcie/shared` bağımlılıklarını lokal yol (`file:../hcie-core` vb.) ile ekle.
- TypeScript derleme (`tsc`) ve tipleri doğrula. Git commit at.

### Plan #2004: hcie-io Kütüphanesinin Ayrıştırılması
- `hcie/packages/io/` dizinini `Tauri/hcie-io/` dizinine kopyala.
- `package.json` adını `@hcie/io` olarak düzelt.
- Modül bağımlılıklarını (`file:`) şeklinde bağla, test et. Git commit at.

### Plan #2005: hcie-ui-components ve hcie-canvas-ui Ayrıştırılması
- UI komponentleri ve Canvas UI kütüphanelerini (`packages/ui-components`, `packages/canvas-ui`) alanlarına kopyala.
- Vite/TypeScript build süreclerini kontrol et. Bağımlılıkları lokal link vererek kur, test et ve commit at.

### Plan #2006: Lokal Geliştirme ("npm link" veya "file:") & Deploy Hazırlığı
- Paketlerin package.json dosyalarında birbiri arasındaki yerel çapraz bağımlılıkların (`file:../hcie-core` vb.) eksiksiz kurulu ve TypeScript tarafından okunabilir olduğunu doğrula.
- Not: Daha sonra deployment aşamasında CI/CD veya build scriptleri çalışırken bu `"file:../"` yolları GitHub repoları (örnek: `"git+ssh://.../hcie-core.git"`) olarak değiştirilebilir, bu sayede npm public registry kullanmadan güvenli bağımlılık zinciri oluşturulur.

### Plan #2007: Ana Uygulama Reposunu (hcie) Temizleme & Lokal Bağlantı
- Ana `hcie` reposunda package.json içerisine `dependencies` altına `@hcie/*` paketlerini `file:../hcie-core` formatıyla manuel ekle veya `npm install file:../hcie-core`... kullan.
- `package.json` dosyasındaki npm workspaces veya pnpm-workspace (varsa) tanımlularını kaldır.
- Orijinal monorepo klasörlerini (`packages/*`) silme işlemi AI tarafındaki *core/src* koruma kurallarına takılabileceği için, bu klasörler kullanıcı onayıyla veya kullanıcı tarafından `rm -rf packages/` çalıştırılarak silinecek şeklinde bırakılır. Kesinlikle AI tarafından izinsiz silinmez.

### Plan #2008: Ana Uygulamamın Doğrulanması (Editor & Web)
- İçeri aktarmaların (import) monorepo alias (`@/*` veya özel pathler) değil, npm paket adı (`@hcie/core`) formatında olduğunu doğrula.
- Web uygulamasını derle (`npm run build`). Gerekirse Vite config içindeki eski alias ayarlarını iptal et veya node_modules/ dizinini okuyacak statüye getir.
- Uygulamayı geliştirme ortamında başlat (`npm run dev`) ve çalıştığını test et.

## Doğrulama Listesi
1. Tüm `hcie-*` repoları derlenebiliyor.
2. Ana klasörde npm `file:` referanslarıyla tüm paketler `node_modules` dizininde simlink olarak çalışıyor.
3. Monorepo (workspaces) yapısı tamamen terk edilmiş durumda.
4. AI erişim sınırlamaları ihlal edilmedi (eski `packages/core` modifiye edilmedi/silinmedi).
