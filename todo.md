# Şehir Bazlı Odak Kartları

- [x] Türkiye şehirleri için güvenli, kaynak bağlantılı risk bağlamı veri modelini netleştir.
- [x] Şehir seçimi ve şehir değişimi akışını mevcut “Bugünün odağı” bölümüne ekle.
- [x] Tarayıcı konumu izniyle yaklaşık şehir eşleştirmesini ve izin reddi durumunu uygula.
- [x] Seçilen şehri `localStorage` içinde sakla ve çevrimdışı yeniden yükle.
- [x] Şehir için risk özeti, öncelikli hazırlık tavsiyesi ve resmi kaynak bağlantılarını göster.
- [x] Masaüstü ve mobil arayüzü doğrula.
- [x] TypeScript, üretim derlemesi, PWA ve runtime kontrollerini çalıştır.
- [x] Tamamlanan özellik için checkpoint oluşturup kullanıcıya teslim et.

## Dinamik AFAD/MGM Uyarıları

- [x] AFAD ve MGM’nin resmi, erişilebilir veri akışlarını doğrula.
- [x] Canlı uyarı için tip güvenli veri modeli ve güvenli yenileme davranışı ekle.
- [x] Uyarıları şehir ile eşleştir; veri yok, gecikmiş veri ve hata durumlarını açıkça göster.
- [x] Şehir kartına dinamik bildirim alanını ve resmi kaynak geçişlerini ekle.
- [x] CORS, ağ hatası, PWA çevrimdışı durumu ve mobil görünümü test et.
- [x] Üretim derlemesini çalıştır, checkpoint oluştur ve teslim et.

## Son Doğrulama ve Teslim

- [x] Dinamik uyarı alanı için ağ hatası ve gerçek çevrimdışı PWA navigasyon senaryolarını tarayıcıda doğrula; sonuçları not et.
- [x] Gerçek çevrimdışı PWA navigasyon testinin sonucunu `validation-live.md` içine başarıyla kaydet.
- [x] AFAD/MGM canlı uyarı entegrasyonundan sonra yeni checkpoint oluştur ve güncel sürümü kullanıcıya teslim et.

## Uyarı Türüne Göre Hızlı Aksiyonlar

- [x] Mevcut AFAD/MGM uyarı biçimini inceleyip deprem, sel, fırtına ve belirsiz durumlar için dar bir tür–aksiyon eşlemesi tanımla.
- [x] Canlı uyarı sonucuna göre kısa ve uygulanabilir hızlı aksiyon önerilerini şehir kartına ekle.
- [x] Tür eşlemesi ile belirsiz/veri yok durumları için birim testleri yaz ve çalıştır.
- [x] Masaüstü görünümü, canlı veri akışı, üretim derlemesi ve PWA önbellek politikasını doğrula.
- [x] Hızlı aksiyon kartının mobil görünümünü doğrula.
- [x] Güncel sürüm için checkpoint oluşturup kullanıcıya teslim et.

## Hızlı Aksiyon Kanıt Tamamlama

- [x] Belirsiz uyarı türü için `kindLabel` ve hızlı aksiyon geri dönüşünü birim testiyle doğrula.
- [x] Masaüstünde hızlı aksiyon alanını gerçekten render eden kontrollü uyarı senaryosunda içerik ve yerleşimi doğrula.
- [x] Hızlı aksiyonlar için veri yok veya boş uyarı listesi durumunu açıkça test eden birim testi ekle ve çalıştır.
- [x] Hızlı aksiyon güncellemesini yalnızca yeni checkpoint ekiyle kullanıcıya teslim et.

## Çevrimdışı Toplanma Alanları

- [x] Mevcut şehir seçimi ve cihaz içi saklama akışını inceleyip en dar toplanma alanı veri modelini belirle.
- [x] Alan adı, şehir, konum bağlantısı ve kişisel not içeren ekleme formunu uygula.
- [x] Kayıtlı alanları cihazda sakla; çevrimdışı görüntüleme, silme ve haritada açma davranışını ekle.
- [x] Yerel saklama, form doğrulama ve silme akışları için birim testleri yaz ve çalıştır.
- [x] Yerel saklama birim testinin mevcut Vitest koşusunda gerçekten keşfedilip çalıştığını doğrula.
- [x] Masaüstü/mobil görünümü ve gerçek çevrimdışı erişimi doğrula.
- [ ] Üretim kontrolünden sonra checkpoint oluşturup kullanıcıya teslim et.
