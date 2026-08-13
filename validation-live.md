# AFAD/MGM Canlı Uyarı Doğrulaması

## Resmi kaynaklar

- AFAD olay kataloğu: https://deprem.afad.gov.tr/event-catalog
- AFAD olay veri servisi: https://deprem.afad.gov.tr/event-service
- MGM MeteoUyarı: https://www.mgm.gov.tr/meteouyari/turkiye.aspx?Gun=1

## 13 Ağustos 2026 test sonucu

- İstanbul ve İzmir şehir değişiminde canlı alan yeniden sorgulandı.
- AFAD yanıtı, son 24 saatte şehir adıyla eşleşen yeni kayıt bulunmadığını açıkça gösterdi; çevrede hiç hareket olmadığı sonucu çıkarılmadı.
- MGM yanıtı, şehir için resmi seviye olarak `Yeşil · Tehlike yok` gösterdi.
- Kaynak erişimi sandbox içinde geçici olarak kesildiğinde arayüz, önceki veriyi görünür tutarken `Canlı durum şu an alınamadı. Bu, uyarı olmadığı anlamına gelmez; resmi kaynak bağlantılarını kullan.` geri dönüşünü gösterdi.
- Gerçek çevrimdışı navigasyon doğrulaması için preview alan adı sandbox içinde geçici olarak erişilemeyen `127.0.0.2` adresine yönlendirildi ve DNS çözümlemesi `getent hosts` ile teyit edildi. Buna rağmen yeni `?offline=pwa-shell` adresindeki sayfa yeniden yüklendi; servis çalışanı önbellekteki uygulama kabuğunu sundu ve şehir kartı ile canlı durum bölümü görünür kaldı.
- Ağ hata testi ve PWA çevrimdışı navigasyon testi ayrı senaryolarda tamamlandı. Normal çözümleme test sonrasında geri yüklendi.
