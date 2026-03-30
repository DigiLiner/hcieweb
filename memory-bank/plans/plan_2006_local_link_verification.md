# Plan #2006: Lokal Bağlantı Doğrulaması

- Paketlerin package.json dosyalarında birbiri arasındaki yerel çapraz bağımlılıkların (`file:../hcie-core` vb.) eksiksiz kurulu ve TypeScript tarafından okunabilir olduğunu doğrula.
- Not: Daha sonra deployment aşamasında CI/CD veya build scriptleri çalışırken bu `"file:../"` yolları Git URL (`git+https://...`) olarak değiştirilebilir, bu sayede npm public registry kullanmadan güvenli bağımlılık zinciri oluşturulur.