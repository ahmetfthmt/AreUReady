# Hazır mısın? — Kişisel hazırlık masası

Hazır mısın?, günlük belirsizliklerde kullanıcıya 60 saniyelik, sakin ve kişisel bir hazırlık akışı sunan çevrimdışı öncelikli bir PWA'dır. Kullanıcı; acil kişi, buluşma noktası, temel çanta, belgeler ve evcil hayvan planını cihazında saklar, hazırlık skorunu görür ve hassas bilgileri paylaşmadan skor kartı üretebilir.

## Öne çıkan özellikler

* Cihaz üzerinde çalışan hazırlık planı ve `localStorage` kalıcılığı.
* İnternet kesilince temel uygulama kabuğunu açan servis çalışanı.
* Hazırlık skorunun paylaşımı; kişisel telefon, konum ve notlar paylaşım metnine dahil edilmez.
* Son iki gündeki güncel arama niyetlerinden seçilmiş, resmi kaynağa yönlendiren “Bugünün odağı” kartları.
* 81 il için şehir bazlı odak kartları; şehir seçimi, yaklaşık konum eşleştirme, genel risk bağlamı, üç kısa hazırlık tavsiyesi ve AFAD/MGM resmi kaynak bağlantıları.
* PWA manifesti, yükleme önerisi, erişilebilir form etiketleri, klavye ile erişilebilir butonlar ve azaltılmış hareket desteği.

## Yerelde çalıştırma

```bash
pnpm install
pnpm dev
```

Üretim derlemesini kontrol etmek için:

```bash
pnpm check
pnpm build
```

## GitHub'a yükleme

Bu klasörde yeni bir Git deposu oluşturup kendi GitHub deponuza gönderin:

```bash
git init
git add .
git commit -m "Build Hazir misin PWA"
git branch -M main
git remote add origin https://github.com/KULLANICI/DEPO.git
git push -u origin main
```

## Render.com üzerinde yayınlama

Render üzerinde **Static Site** seçin. Build Command olarak `pnpm install --frozen-lockfile && pnpm build`, Publish Directory olarak `dist/public` kullanın. SPA fallback için Render ayarlarında `/*` → `/index.html` Rewrite kuralı ekleyin. Bu proje herhangi bir backend veya gizli anahtar gerektirmez.

> Uygulama deprem tahmini veya resmi acil uyarı üretmez. “Bugünün odağı” kartları kaynak bağlantılı bağlam notlarıdır; acil durumda AFAD, Kandilli ve yerel resmi duyurular izlenmelidir.

Şehir kartında konum butonu yalnızca tarayıcının yaklaşık koordinat bilgisini ister ve bunu temsilî şehir merkezleriyle eşleştirir; tersine adres çıkarımı yapılmaz. Konum izni reddedilirse kullanıcı 81 il arasından manuel seçim yapar. Seçilen şehir `localStorage` içinde saklanır ve uygulama çevrimdışı açıldığında son kart yeniden gösterilir.

## Ürün araştırması

Arama niyeti, kaynaklar ve ürün kararı [research.md](./research.md) dosyasındadır. Görsel ve etkileşim sistemi [ideas.md](./ideas.md) içinde belgelenmiştir.
